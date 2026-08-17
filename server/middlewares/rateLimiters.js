// server/middlewares/rateLimiters.js
import rateLimit from "express-rate-limit";

// Védelem a bejelentkezési végpontokra (brute-force ellen)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 perc
  max: 10, // 15 perc alatt maximum 10 kérés IP címenként
  message: { error: "Túl sok próbálkozás, kérjük várjon!" },
});

// Védelem az AI végpontokra (költség- és kvótavédelem)
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 perc
  max: 20, // 1 perc alatt maximum 20 kérés IP címenként
  message: { error: "Túl sok kérés, kérjük lassítson!" },
});