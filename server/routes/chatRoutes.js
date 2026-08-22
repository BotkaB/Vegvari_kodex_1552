// server/routes/chatRoutes.js
import express from "express";
import { authGuard } from "../middlewares/auth.js";
import { chatLimiter } from "../middlewares/rateLimiters.js";
import { callMentorChat } from "../services/aiService.js";
import { safeJsonParse } from "../utils/jsonParser.js";

const router = express.Router();

// POST /api/mentor-chat
router.post("/mentor-chat", authGuard, chatLimiter, async (req, res) => {
  try {
    const { message, activeMentors } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Az üzenet mező kötelező!" });
    }

    const serviceResult = await callMentorChat(message, activeMentors);
    const parsedData = safeJsonParse(serviceResult.text);

    if (serviceResult.fallbackUsed && serviceResult.warningMessage) {
      parsedData._warning = serviceResult.warningMessage;
    }

    return res.json(parsedData);
  } catch (err) {
    console.error("❌ Hiba a Mentor Chat végponton:", err);

    if (err.message === "elfogyott a keret") {
      return res.status(429).json({
        error: "elfogyott a keret",
        details: "Minden elérhető AI modell napi kvótája kimerült. Kérjük, próbálja meg később."
      });
    }

    const isProd = process.env.NODE_ENV === "production";
    return res.status(500).json({
      error: "Hiba történt a válasz generálása során.",
      ...(isProd ? {} : { details: err.message }),
    });
  }
});

export default router;