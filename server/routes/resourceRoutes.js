import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { authGuard } from "../middlewares/auth.js";
import { chatLimiter } from "../middlewares/rateLimiters.js";
import { callResourceEngine, getUploadedFiles } from "../services/aiService.js";
import { safeJsonParse } from "../utils/jsonParser.js";

const router = express.Router();

// A modul útvonalának meghatározása (ESM kompatibilis)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// GYIK Adatok Memóriába Cache-elése (Performance Optimization)
// ---------------------------------------------------------------------------
let faqCache = null;

const loadFaqData = () => {
  if (faqCache) return faqCache;

  // Pontos útvonalak felderítése a server mappán belül és kívül
  const possiblePaths = [
    path.resolve(__dirname, "../data/faq.json"),
    path.resolve(process.cwd(), "server", "data", "faq.json"),
    path.resolve(process.cwd(), "data", "faq.json"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, "utf-8");
        faqCache = JSON.parse(content);
        console.log(`✅ FAQ sikeresen betöltve a memóriába innen: ${p}`);
        return faqCache;
      } catch (err) {
        console.error(`❌ Hiba a FAQ fájl parszolásakor (${p}):`, err);
      }
    }
  }

  return null;
};

// ---------------------------------------------------------------------------
// VÉGPONTOK
// ---------------------------------------------------------------------------

// POST /api/resources - Dinamikus AI tartalomgenerálás
router.post("/resources", authGuard, chatLimiter, async (req, res) => {
  try {
    const { mode, selectedChapter, selectedFileUri } = req.body;

    if (!mode) {
      return res.status(400).json({ error: "A 'mode' megadása kötelező!" });
    }

    // 👇 JAVÍTVA: A selectedFileUri-t adjuk át harmadik (vagy megfelelő) paraméterként, 
    // hogy a callResourceEngine pontosan tudja, melyik fájllal kell dolgoznia.
    const serviceResult = await callResourceEngine(mode, selectedChapter, selectedFileUri);
    const parsedData = safeJsonParse(serviceResult.text);

    if (serviceResult.fallbackUsed && serviceResult.warningMessage) {
      parsedData._warning = serviceResult.warningMessage;
    }

    return res.json(parsedData);
  } catch (err) {
    console.error("❌ Hiba a Resource Engine végponton:", err);

    if (err.message === "elfogyott a keret") {
      return res.status(429).json({
        error: "elfogyott a keret",
        details: "Minden elérhető AI modell napi kvótája kimerült. Kérjük, próbálja meg később."
      });
    }

    return res.status(500).json({
      error: "Hiba történt az erőforrás generálása során.",
      details: err.message,
    });
  }
});

// GET /api/files - A Gemini által eltárolt fájlok listája az azonosítóikkal együtt
router.get("/files", authGuard, (req, res) => {
  try {
    const files = getUploadedFiles();
    return res.json({ files });
  } catch (err) {
    console.error("❌ Hiba a fájlok listázásakor:", err);
    return res.status(500).json({ error: "Nem sikerült beolvasni a fájlokat." });
  }
});

// GET /api/faq - GYIK adatok lekérése a memóriából (Fast Path)
router.get("/faq", authGuard, (req, res) => {
  try {
    const faqData = loadFaqData();

    if (!faqData) {
      return res.status(404).json({ error: "A faq.json fájl nem található vagy hibás." });
    }

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

    return res.json({ ok: true, data: faqData });
  } catch (err) {
    console.error("❌ Hiba a GYIK kiszolgálásakor:", err);
    return res.status(500).json({ error: "Nem sikerült beolvasni a GYIK adatokat." });
  }
});

export default router;