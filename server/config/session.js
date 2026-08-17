// server/config/session.js

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || "vegvari-kodex-1552-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  },
};