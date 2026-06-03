import crypto from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import path from "node:path";

import { del, get, list, put } from "@vercel/blob";

import {
  BACKUPS_DIR,
  BLOB_BACKUP_PREFIX,
  BLOB_READ_WRITE_TOKEN,
  BLOB_UPLOAD_PREFIX,
  EVENT_UPLOADS_DIR,
  IS_VERCEL_ENV,
  ROOT_DIR,
  USE_BLOB_STORAGE
} from "@/lib/constants";
import { HttpError } from "@/lib/http";

function blobOptions(extra = {}) {
  return BLOB_READ_WRITE_TOKEN ? { token: BLOB_READ_WRITE_TOKEN, ...extra } : extra;
}

function isBlobUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

function resolveInsideRoot(basePath, ...segments) {
  const root = path.resolve(basePath);
  const target = path.resolve(basePath, ...segments);

  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new HttpError(400, "The selected file path is invalid.");
  }

  return target;
}

function ensureWritableLocalFilesystem(featureLabel) {
  if (IS_VERCEL_ENV) {
    throw new HttpError(500, `${featureLabel} requires Vercel Blob storage in production.`);
  }
}

export function isBlobStorageEnabled() {
  return USE_BLOB_STORAGE;
}

export async function saveEventPoster(buffer, { contentType, extension, prefix }) {
  const filename = `${prefix}-${crypto.randomBytes(12).toString("hex")}${extension}`;

  if (USE_BLOB_STORAGE) {
    const blob = await put(`${BLOB_UPLOAD_PREFIX}/${filename}`, buffer, blobOptions({
      access: "public",
      addRandomSuffix: false,
      contentType
    }));
    return blob.url;
  }

  ensureWritableLocalFilesystem("Event poster uploads");
  mkdirSync(EVENT_UPLOADS_DIR, { recursive: true });
  writeFileSync(path.join(EVENT_UPLOADS_DIR, filename), buffer);
  return `uploads/events/${filename}`;
}

export async function removeStoredFile(reference) {
  if (!reference) {
    return;
  }

  if (isBlobUrl(reference)) {
    await del(reference, blobOptions());
    return;
  }

  const target = resolveInsideRoot(ROOT_DIR, reference);
  if (existsSync(target) && statSync(target).isFile()) {
    unlinkSync(target);
  }
}

export function readProjectBinary(relativePath) {
  const target = resolveInsideRoot(ROOT_DIR, relativePath);
  if (!existsSync(target) || !statSync(target).isFile()) {
    throw new HttpError(404, "File not found.");
  }

  return readFileSync(target);
}

export async function listBackups(limit = null) {
  if (USE_BLOB_STORAGE) {
    const { blobs } = await list(blobOptions({ prefix: `${BLOB_BACKUP_PREFIX}/` }));
    const entries = blobs
      .map((blob) => ({
        name: path.basename(blob.pathname),
        pathname: blob.pathname,
        size: Number(blob.size || 0),
        modifiedAt: new Date(blob.uploadedAt || Date.now()).toISOString()
      }))
      .sort((first, second) => new Date(second.modifiedAt) - new Date(first.modifiedAt));

    return limit ? entries.slice(0, limit) : entries;
  }

  if (!existsSync(BACKUPS_DIR)) {
    return [];
  }

  const entries = readdirSync(BACKUPS_DIR)
    .filter((name) => name.endsWith(".db"))
    .map((name) => {
      const filePath = path.join(BACKUPS_DIR, name);
      const info = statSync(filePath);
      return {
        name,
        size: info.size,
        modifiedAt: new Date(info.mtimeMs).toISOString()
      };
    })
    .sort((first, second) => new Date(second.modifiedAt) - new Date(first.modifiedAt));

  return limit ? entries.slice(0, limit) : entries;
}

export async function saveBackupSnapshot(name, snapshot) {
  const payload = JSON.stringify(snapshot, null, 2);
  const size = Buffer.byteLength(payload);

  if (USE_BLOB_STORAGE) {
    const blob = await put(`${BLOB_BACKUP_PREFIX}/${name}`, payload, blobOptions({
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: "application/json"
    }));

    return {
      name: path.basename(blob.pathname),
      pathname: blob.pathname,
      size,
      createdAt: new Date().toISOString()
    };
  }

  ensureWritableLocalFilesystem("Database backups");
  mkdirSync(BACKUPS_DIR, { recursive: true });
  const filePath = path.join(BACKUPS_DIR, name);
  writeFileSync(filePath, payload);
  const info = statSync(filePath);

  return {
    name,
    pathname: filePath,
    size: info.size,
    createdAt: new Date(info.mtimeMs).toISOString()
  };
}

export async function loadBackupSnapshot(backupName) {
  if (USE_BLOB_STORAGE) {
    const backups = await listBackups();
    const selected = backups.find((item) => item.name === backupName);
    if (!selected) {
      throw new HttpError(400, "Selected backup file was not found.");
    }

    const result = await get(selected.pathname, blobOptions({ access: "private" }));
    if (!result || result.statusCode !== 200) {
      throw new HttpError(400, "Selected backup file was not found.");
    }

    const payload = await new Response(result.stream).text();
    return JSON.parse(payload);
  }

  const cleanedName = String(backupName || "").trim();
  if (!cleanedName) {
    throw new HttpError(400, "Backup name is required.");
  }
  if (path.basename(cleanedName) !== cleanedName) {
    throw new HttpError(400, "Backup name is invalid.");
  }

  const backupPath = resolveInsideRoot(BACKUPS_DIR, cleanedName);
  if (!existsSync(backupPath) || !statSync(backupPath).isFile()) {
    throw new HttpError(400, "Selected backup file was not found.");
  }

  return JSON.parse(readFileSync(backupPath, "utf8"));
}
