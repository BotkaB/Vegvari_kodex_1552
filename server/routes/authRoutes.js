// server/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import { authLimiter } from "../middlewares/rateLimiters.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", authLimiter, async (req, res) => {
  const { username, password } = req.body;
  const validUsername = process.env.AUTH_USERNAME;
  const validPassword = process.env.AUTH_PASSWORD;
  const passwordHash = process.env.AUTH_PASSWORD_HASH; // opcionális bcrypt hash

  if (!validUsername || !validPassword) {
    console.error("❌ Hiányzik AUTH_USERNAME vagy AUTH_PASSWORD az .env-ből!");
    const isProd = process.env.NODE_ENV === "production";
    return res.status(500).json({
      error: isProd ? "Internal server error" : "Szerver konfigurációs hiba.",
    });
  }

  let passwordOk = false;

  if (passwordHash) {
    // Bcrypt compare (ha hash be van állítva)
    passwordOk = await bcrypt.compare(password, passwordHash);
  } else {
    // Plain text fallback (dev / ha nincs hash)
    passwordOk = password === validPassword;
  }

  if (username === validUsername && passwordOk) {
    // Session regenerálás: Új session ID (Session Fixation védelem)
    return req.session.regenerate((err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Hiba a munkamenet inicializálásakor!" });
      }

      // Az új, tiszta session objektumban állítjuk be az adatokat
      req.session.authenticated = true;
      req.session.user = { username };

      // Az új session mentése
      return req.session.save((saveErr) => {
        if (saveErr) {
          return res
            .status(500)
            .json({ error: "Hiba a munkamenet mentésekor!" });
        }

        // Visszaküldjük a user objektumot is a frontendnek
        return res.json({
          success: true,
          message: "Sikeres bejelentkezés!",
          user: req.session.user,
        });
      });
    });
  }

  return res
    .status(401)
    .json({ error: "Érvénytelen felhasználónév vagy jelszó!" });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Hiba a kijelentkezés során!" });
    }
    res.clearCookie("connect.sid");
    return res.json({ success: true, message: "Sikeres kijelentkezés!" });
  });
});

// GET /api/auth/status
router.get("/status", (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  return res.json({ authenticated: false });
});

export default router;
