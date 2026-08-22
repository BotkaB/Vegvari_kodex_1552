import rateLimit from "express-rate-limit";

// Segédfüggvény: kulcs generálása (UserID ha be van jelentkezve, különben IP)
const keyGenerator = (req) => {
  return req.user?.id ? `user:${req.user.id}` : `ip:${req.ip}`;
};

// Segédfüggvény: OPTIONS kérések kihagyása
const skipOptions = (req) => req.method === "OPTIONS";

// Egyéni JSON hiba válasz formátum
const createHandler = (message) => (req, res, next, options) => {
  res.status(options.statusCode).json({
    error: message,
    retryAfter: Math.ceil(options.windowMs / 1000),
  });
};

// Globális limiter (minden kérésre)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 perc
  max: 100, // 100 kérés / 15 perc
  keyGenerator,
  skip: skipOptions,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler("Túl sok kérés, kérjük lassítson!"),
});

// Auth limiter (login/register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 perc
  max: 5, // 5 próbálkozás / 15 perc
  keyGenerator: (req) => `ip:${req.ip}`, // Login mindig IP-alapú
  skip: skipOptions,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler("Túl sok bejelentkezési próbálkozás, kérjük várjon 15 percet!"),
});

// Chat/AI limiter
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 perc
  max: 10, // 10 kérés / perc
  keyGenerator,
  skip: skipOptions,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler("Túl sok üzenet, kérjük várjon 1 percet!"),
});

// Resource limiter (fájl feltöltés, kvíz, összefoglaló)
export const resourceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 perc
  max: 5, // 5 kérés / perc
  keyGenerator,
  skip: skipOptions,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createHandler("Túl sok kérés az erőforráshoz, kérjük várjon 1 percet!"),
});
