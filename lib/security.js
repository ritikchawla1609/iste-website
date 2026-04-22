import crypto from "node:crypto";

import { PASSWORD_ITERATIONS, SESSION_DURATION_SECONDS } from "@/lib/constants";

export function utcNow() {
  return new Date();
}

export function isoNow() {
  return utcNow().toISOString();
}

export function sessionExpiryIso() {
  return new Date(Date.now() + SESSION_DURATION_SECONDS * 1000).toISOString();
}

export function hashPassword(password, saltBuffer) {
  return crypto
    .pbkdf2Sync(password, saltBuffer, PASSWORD_ITERATIONS, 32, "sha256")
    .toString("hex");
}

export function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16);
  return {
    saltHex: salt.toString("hex"),
    passwordHash: hashPassword(password, salt)
  };
}

export function verifyPassword(password, saltHex, passwordHash) {
  const expected = hashPassword(password, Buffer.from(saltHex, "hex"));
  return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(passwordHash, "utf8"));
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function formatBackupTimestamp(date = utcNow()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}
