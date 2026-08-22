import helmet from 'helmet';

export function createHelmetMiddleware() {
  const isProd = process.env.NODE_ENV === 'production';

  // Közös alap direktívák
  const baseDirectives = {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'blob:'],
    fontSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
  };

  // Fejlesztés: Vite HMR + Tailwind JIT miatt kell az unsafe-inline/eval
  const devDirectives = {
    ...baseDirectives,
    scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    // WebSocket a Vite HMR-hez (ws: protokoll)
    connectSrc: ["'self'", 'ws:', 'wss:'],
  };

  // Produkció: Szigorú, csak a buildelt fájlok (self) engedélyezettek
  const prodDirectives = {
    ...baseDirectives,
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
  };

  return helmet({
    contentSecurityPolicy: isProd ? { directives: prodDirectives } : { directives: devDirectives },
    crossOriginEmbedderPolicy: false,
    hsts: isProd,
  });
}