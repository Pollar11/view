#!/usr/bin/env node
// Generates the value to set as ADMIN_PASSWORD_HASH in Vercel — the admin
// password itself is never stored anywhere, only this salted scrypt hash
// of it. Run locally so the plaintext password never has to leave your
// own machine:
//
//   node scripts/hash-admin-password.mjs "your new admin password"
//
import crypto from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-admin-password.mjs \"your new admin password\"");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");

console.log("\nSet this as ADMIN_PASSWORD_HASH in Vercel (Settings -> Environment Variables):\n");
console.log(`${salt}:${hash}`);
console.log("\nThe password you typed above is never stored anywhere — only this hash. Redeploy after setting it.\n");
