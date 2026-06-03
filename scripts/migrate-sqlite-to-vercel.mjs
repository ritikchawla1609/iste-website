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
    CREATE TABLE IF NOT EXISTS members (
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
      admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
      member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
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
      google_form_link TEXT,
      prizes TEXT NOT NULL,
      description TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
      poster_path TEXT,
      min_team_size INTEGER DEFAULT 1,
      max_team_size INTEGER DEFAULT 1,
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
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('event', 'recruitment')),
      entity_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      team_name TEXT,
      team_members TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS past_events (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Event',
      event_date TEXT NOT NULL,
      description TEXT NOT NULL,
      winners TEXT,
      image_paths TEXT,
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
      member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  await client.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS google_form_link TEXT");
  await client.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS min_team_size INTEGER DEFAULT 1");
  await client.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS max_team_size INTEGER DEFAULT 1");
  await client.query("ALTER TABLE past_events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Event'");
  await client.query("ALTER TABLE sessions ADD COLUMN IF NOT EXISTS member_id INTEGER REFERENCES members(id) ON DELETE CASCADE");
  await client.query("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS member_id INTEGER REFERENCES members(id) ON DELETE SET NULL");
  await client.query("ALTER TABLE applications ADD COLUMN IF NOT EXISTS team_name TEXT");
  await client.query("ALTER TABLE applications ADD COLUMN IF NOT EXISTS team_members TEXT");
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
    const members = sqlite.prepare("SELECT * FROM members ORDER BY id ASC").all();
    const sessions = sqlite.prepare("SELECT * FROM sessions ORDER BY id ASC").all();
    const events = sqlite.prepare("SELECT * FROM events ORDER BY id ASC").all();
    const recruitments = sqlite.prepare("SELECT * FROM recruitments ORDER BY id ASC").all();
    const applications = sqlite.prepare("SELECT * FROM applications ORDER BY id ASC").all();
    const pastEvents = sqlite.prepare("SELECT * FROM past_events ORDER BY id ASC").all();
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
      "TRUNCATE TABLE sessions, audit_logs, applications, past_events, events, recruitments, site_content, members, admins RESTART IDENTITY CASCADE"
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

    for (const row of members) {
      await client.query(
        `
          INSERT INTO members (id, uid, password_salt, password_hash, created_at)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [row.id, row.uid, row.password_salt, row.password_hash, row.created_at]
      );
    }

    for (const row of sessions) {
      await client.query(
        `
          INSERT INTO sessions (id, admin_id, member_id, token_hash, created_at, expires_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [row.id, row.admin_id ?? null, row.member_id ?? null, row.token_hash, row.created_at, row.expires_at]
      );
    }

    for (const row of migratedEvents) {
      await client.query(
        `
          INSERT INTO events (
            id, name, category, event_date, start_time, end_time, venue, deadline,
            registration_link, google_form_link, prizes, description, contact_name, contact_email,
            status, poster_path, min_team_size, max_team_size, created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18, $19, $20
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
          row.google_form_link ?? null,
          row.prizes,
          row.description,
          row.contact_name,
          row.contact_email,
          row.status,
          row.poster_path,
          row.min_team_size ?? 1,
          row.max_team_size ?? 1,
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

    for (const row of applications) {
      await client.query(
        `
          INSERT INTO applications (
            id, type, entity_id, name, email, phone, team_name, team_members, details, created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        [
          row.id,
          row.type,
          row.entity_id,
          row.name,
          row.email,
          row.phone,
          row.team_name ?? null,
          row.team_members ?? null,
          row.details ?? null,
          row.created_at
        ]
      );
    }

    for (const row of pastEvents) {
      await client.query(
        `
          INSERT INTO past_events (
            id, name, category, event_date, description, winners, image_paths, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          row.id,
          row.name,
          row.category ?? "Event",
          row.event_date,
          row.description,
          row.winners ?? null,
          row.image_paths ?? null,
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
          INSERT INTO audit_logs (id, admin_id, member_id, action, entity_type, entity_id, details, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          row.id,
          row.admin_id ?? null,
          row.member_id ?? null,
          row.action,
          row.entity_type,
          row.entity_id,
          row.details,
          row.created_at
        ]
      );
    }

    await syncSequence(client, "admins");
    await syncSequence(client, "members");
    await syncSequence(client, "sessions");
    await syncSequence(client, "events");
    await syncSequence(client, "recruitments");
    await syncSequence(client, "applications");
    await syncSequence(client, "past_events");
    await syncSequence(client, "audit_logs");
    await client.query("COMMIT");

    console.log("SQLite data migrated successfully.");
    console.log(`Admins: ${admins.length}`);
    console.log(`Members: ${members.length}`);
    console.log(`Events: ${events.length}`);
    console.log(`Recruitments: ${recruitments.length}`);
    console.log(`Applications: ${applications.length}`);
    console.log(`Past events: ${pastEvents.length}`);
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
