// server/config/session.js

export const getSessionConfig = () => {
  const isProd = process.env.NODE_ENV === "production";
  // Secure cookie csak akkor, ha explicit HTTPS van beállítva (pl. proxy mögött, nem localhost HTTP-n)
  const useSecureCookies = isProd && process.env.USE_HTTPS === "true";

  return {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  };
};
