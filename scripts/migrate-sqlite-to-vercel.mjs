import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { put } from "@vercel/blob";
import pg from "pg";

const { Pool } = pg;

const projectRoot = process.cwd();
const sqlitePath = path.join(projectRoot, "data", "iste.db");
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
const blobToken = process.env.BLOB_READ_WRITE_TOKEN || "";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function guessContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp"
  }[extension] || "application/octet-stream";
}

async function ensureRemoteSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      uid TEXT NOT NULL UNIQUE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      event_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      venue TEXT NOT NULL,
      deadline TEXT NOT NULL,
      registration_link TEXT NOT NULL,
      prizes TEXT NOT NULL,
      description TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
      poster_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS recruitments (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      organization TEXT NOT NULL,
      domain TEXT NOT NULL,
      mode TEXT NOT NULL,
      location TEXT NOT NULL,
      deadline TEXT NOT NULL,
      application_link TEXT NOT NULL,
      description TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
}

async function syncSequence(client, table) {
  await client.query(
    `
      SELECT setval(
        pg_get_serial_sequence($1, 'id'),
        COALESCE((SELECT MAX(id) FROM ${table}), 1),
        (SELECT MAX(id) IS NOT NULL FROM ${table})
      )
    `,
    [table]
  );
}

async function uploadPosterIfNeeded(reference) {
  if (!reference) {
    return null;
  }

  if (/^https?:\/\//i.test(reference)) {
    return reference;
  }

  const sourcePath = path.join(projectRoot, reference);
  if (!existsSync(sourcePath)) {
    console.warn(`Poster not found locally, keeping original path: ${reference}`);
    return reference;
  }

  if (!blobToken) {
    console.warn(`BLOB_READ_WRITE_TOKEN missing, keeping original path: ${reference}`);
    return reference;
  }

  const blob = await put(`event-posters/${path.basename(reference)}`, readFileSync(sourcePath), {
    access: "public",
    addRandomSuffix: true,
    contentType: guessContentType(reference),
    token: blobToken
  });

  return blob.url;
}

async function main() {
  assert(existsSync(sqlitePath), `SQLite database not found at ${sqlitePath}`);
  assert(
    databaseUrl,
    "Set DATABASE_URL (or POSTGRES_URL) before running the Vercel migration script."
  );

  const sqlite = new DatabaseSync(sqlitePath);
  sqlite.exec("PRAGMA foreign_keys = ON");

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl:
      databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    console.log("Preparing remote schema...");
    await ensureRemoteSchema(client);

    console.log("Reading local SQLite data...");
    const admins = sqlite.prepare("SELECT * FROM admins ORDER BY id ASC").all();
    const sessions = sqlite.prepare("SELECT * FROM sessions ORDER BY id ASC").all();
    const events = sqlite.prepare("SELECT * FROM events ORDER BY id ASC").all();
    const recruitments = sqlite.prepare("SELECT * FROM recruitments ORDER BY id ASC").all();
    const siteContent = sqlite.prepare("SELECT * FROM site_content ORDER BY key ASC").all();
    const auditLogs = sqlite.prepare("SELECT * FROM audit_logs ORDER BY id ASC").all();

    console.log("Uploading poster files to Blob when available...");
    const migratedEvents = [];
    for (const event of events) {
      migratedEvents.push({
        ...event,
        poster_path: await uploadPosterIfNeeded(event.poster_path)
      });
    }

    console.log("Replacing remote data...");
    await client.query("BEGIN");
    await client.query(
      "TRUNCATE TABLE sessions, audit_logs, events, recruitments, site_content, admins RESTART IDENTITY CASCADE"
    );

    for (const row of admins) {
      await client.query(
        `
          INSERT INTO admins (id, uid, password_salt, password_hash, created_at)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [row.id, row.uid, row.password_salt, row.password_hash, row.created_at]
      );
    }

    for (const row of sessions) {
      await client.query(
        `
          INSERT INTO sessions (id, admin_id, token_hash, created_at, expires_at)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [row.id, row.admin_id, row.token_hash, row.created_at, row.expires_at]
      );
    }

    for (const row of migratedEvents) {
      await client.query(
        `
          INSERT INTO events (
            id, name, category, event_date, start_time, end_time, venue, deadline,
            registration_link, prizes, description, contact_name, contact_email,
            status, poster_path, created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13,
            $14, $15, $16, $17
          )
        `,
        [
          row.id,
          row.name,
          row.category,
          row.event_date,
          row.start_time,
          row.end_time,
          row.venue,
          row.deadline,
          row.registration_link,
          row.prizes,
          row.description,
          row.contact_name,
          row.contact_email,
          row.status,
          row.poster_path,
          row.created_at,
          row.updated_at
        ]
      );
    }

    for (const row of recruitments) {
      await client.query(
        `
          INSERT INTO recruitments (
            id, title, organization, domain, mode, location, deadline,
            application_link, description, contact_name, contact_email,
            status, created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11,
            $12, $13, $14
          )
        `,
        [
          row.id,
          row.title,
          row.organization,
          row.domain,
          row.mode,
          row.location,
          row.deadline,
          row.application_link,
          row.description,
          row.contact_name,
          row.contact_email,
          row.status,
          row.created_at,
          row.updated_at
        ]
      );
    }

    for (const row of siteContent) {
      await client.query(
        `
          INSERT INTO site_content (key, value, updated_at)
          VALUES ($1, $2, $3)
        `,
        [row.key, row.value, row.updated_at]
      );
    }

    for (const row of auditLogs) {
      await client.query(
        `
          INSERT INTO audit_logs (id, admin_id, action, entity_type, entity_id, details, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          row.id,
          row.admin_id,
          row.action,
          row.entity_type,
          row.entity_id,
          row.details,
          row.created_at
        ]
      );
    }

    await syncSequence(client, "admins");
    await syncSequence(client, "sessions");
    await syncSequence(client, "events");
    await syncSequence(client, "recruitments");
    await syncSequence(client, "audit_logs");
    await client.query("COMMIT");

    console.log("SQLite data migrated successfully.");
    console.log(`Admins: ${admins.length}`);
    console.log(`Events: ${events.length}`);
    console.log(`Recruitments: ${recruitments.length}`);
    console.log(`Audit logs: ${auditLogs.length}`);
    if (!blobToken) {
      console.warn(
        "Poster paths were not uploaded to Blob because BLOB_READ_WRITE_TOKEN is not set."
      );
    }
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      // Ignore rollback failures so the original error can surface.
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
    sqlite.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
