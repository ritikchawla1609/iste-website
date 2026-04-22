import path from "node:path";

export const ROOT_DIR = process.cwd();
export const DATA_DIR = path.join(ROOT_DIR, "data");
export const DB_PATH = path.join(DATA_DIR, "iste.db");
export const UPLOADS_DIR = path.join(ROOT_DIR, "uploads");
export const EVENT_UPLOADS_DIR = path.join(UPLOADS_DIR, "events");
export const BACKUPS_DIR = path.join(ROOT_DIR, "backups");
export const ASSETS_DIR = path.join(ROOT_DIR, "assets");
export const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
export const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "";
export const USE_REMOTE_DATABASE = Boolean(DATABASE_URL);
export const USE_BLOB_STORAGE = Boolean(BLOB_READ_WRITE_TOKEN);
export const IS_VERCEL_ENV = process.env.VERCEL === "1" || process.env.VERCEL === "true";
export const BLOB_UPLOAD_PREFIX = "event-posters";
export const BLOB_BACKUP_PREFIX = "backups";

export const AUTHOR_UID = process.env.ISTE_AUTHOR_UID || "24BCS10191";
export const AUTHOR_PASSWORD = process.env.ISTE_AUTHOR_PASSWORD || "ISTE@1609";
export const COOKIE_SECURE = process.env.COOKIE_SECURE === "1";

export const SESSION_COOKIE_NAME = "iste_session";
export const SESSION_DURATION_SECONDS = 12 * 60 * 60;
export const PASSWORD_ITERATIONS = 310000;
export const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};
