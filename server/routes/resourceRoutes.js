// server/routes/resourceRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import { authGuard } from "../middlewares/auth.js";
import { chatLimiter } from "../middlewares/rateLimiters.js";
import { callResourceEngine } from "../services/aiService.js";
import { safeJsonParse } from "../utils/jsonParser.js";

const router = express.Router();

// POST /api/resources
router.post("/resources", authGuard, chatLimiter, async (req, res) => {
  try {
    const { mode, selectedChapter } = req.body;

    if (!mode) {
      return res.status(400).json({ error: "A 'mode' megadása kötelező!" });
    }

    const serviceResult = await callResourceEngine(mode, selectedChapter);
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

// GET /api/files - A data mappában lévő fájlok listája
router.get("/files", authGuard, (req, res) => {
  try {
    const dataDir = path.resolve(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      return res.json({ files: [] });
    }
    const files = fs.readdirSync(dataDir);
    return res.json({ files });
  } catch (err) {
    console.error("❌ Hiba a fájlok listázásakor:", err);
    return res.status(500).json({ error: "Nem sikerült beolvasni a fájlokat." });
  }
});

// GET /api/faq - Statikus vagy fallback GYIK adatok
router.get("/faq", authGuard, (req, res) => {
  const faqData = [
    {
      question: "Kik az Egri Vár főbb védői 1552-ben?",
      answer: "Dobó István várkapitány, Mekcsey István helyettes, Bornemissza Gergely deák és a többi vitéz.",
    },
    {
      question: "Mi a Végvári Kódex célja?",
      answer: "Az 1552-es egri ostrom történelmi és oktatási anyagainak interaktív feldolgozása AI segítségével.",
    },
  ];
  return res.json(faqData);
});

export default router;