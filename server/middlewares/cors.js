// server/middlewares/cors.js

export function createCorsMiddleware(allowedOrigins) {
  return (req, res, next) => {
    const origin = req.headers.origin;

    // Nincs origin (pl. curl, Postman, same-origin) -> engedélyezzük
    if (!origin) return next();

    // Ellenőrizzük a whitelistet
    if (allowedOrigins.includes(origin)) {
      // Engedélyezett: beállítjuk a fejléceket
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS",
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );

      // Preflight (OPTIONS) kezelése
      if (req.method === "OPTIONS") return res.sendStatus(204);

      return next();
    }

    // TILTOTT ORIGIN: NEM állítunk be CORS headereket, 403-al visszatérünk, NEM hívjuk a next()-et
    console.log(">>> CORS BLOCKED Origin:", origin);
    return res.status(403).json({ error: "CORS: Origin not allowed" });
  };
}
