import helmet from 'helmet';

export function createHelmetMiddleware() {
  return helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: process.env.NODE_ENV === 'production',
  });
}