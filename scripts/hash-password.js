// scripts/hash-password.js
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const plainPassword = process.env.AUTH_PASSWORD;

if (!plainPassword) {
  console.error("❌ Nincs AUTH_PASSWORD az .env-ben!");
  process.exit(1);
}

const hash = await bcrypt.hash(plainPassword, 12);
console.log("AUTH_PASSWORD_HASH=" + hash);