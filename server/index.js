// server/index.js
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Konfigurációk és Szolgáltatások
import { getSessionConfig } from "./config/session.js";
import { initializeDocuments } from "./services/aiService.js";
import { createCorsMiddleware } from "./middlewares/cors.js";
import { createHelmetMiddleware } from "./middlewares/helmet.js";
import { globalLimiter } from "./middlewares/rateLimiters.js";

// Útvonalak (Routerek) regisztrálása
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";

dotenv.config();

// --- SESSION_SECRET validáció indításkor ---
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  console.error(
    "❌ SESSION_SECRET hiányzik vagy túl rövid (minimum 32 karakter). Állítsd be a .env fájlban",
  );
  process.exit(1);
}
// --------------------------------------------

// --- CORS Whitelist beállítás ---
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000", // Jelenlegi monolit
  // "http://localhost:5173",                           // Vite dev
  // process.env.FRONTEND_PROD_URL,                   // Pl. https://vegvari-kodex.vercel.app
].filter(Boolean);

console.log(">>> CORS DEBUG allowedOrigins:", allowedOrigins);

const corsMiddleware = createCorsMiddleware(allowedOrigins);
const helmetMiddleware = createHelmetMiddleware();
// -----------------------------------

const app = express();
const port = Number(process.env.PORT) || 3000;

// Útvonalak meghatározása a projekt gyökeréhez képest
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const dataDir = path.join(rootDir, "data");

// Globális Middleware-ek bekötése
app.use(corsMiddleware);
app.use(helmetMiddleware);
app.use(globalLimiter);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(session(getSessionConfig()));

// API Végpontok (Routerek) regisztrálása
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);
app.use("/api", resourceRoutes);

// Egészségügyi (Health Check) végpont
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "Végvári Kódex 1552 - Multi-Persona Mentor & Resource Engine",
    model: "gemini-2.5-flash",
  });
});

// Statikus fájlok kiszolgálása a frontend (dist) mappából
app.use(express.static(distDir));

app.get(/^(?!\/api).*$/, (req, res) => {
  const indexFile = path.join(distDir, "index.html");
  if (req.path.startsWith("/src/") || req.path.includes(".")) {
    return res.status(404).send("Not found");
  }
  return res.sendFile(indexFile);
});

// Szerver indítása és a dokumentumok automatikus AI inicializálása
app.listen(port, async () => {
  console.log(`🚀 Server running on port ${port}`);
  await initializeDocuments(dataDir);
});
