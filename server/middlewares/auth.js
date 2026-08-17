// server/middlewares/auth.js

export function authGuard(req, res, next) {
  if (req.session && req.session.authenticated) {
    next(); // Ha be van jelentkezve, mehet tovább a kérés
  } else {
    res.status(401).json({ error: "Nem vagy bejelentkezve!" }); // Ha nincs, megállítjuk
  }
}