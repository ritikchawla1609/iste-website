import { mkdirSync } from "node:fs";

import { Pool } from "pg";

import {
  AUTHOR_PASSWORD,
  AUTHOR_UID,
  BACKUPS_DIR,
  DATA_DIR,
  DATABASE_URL,
  DB_PATH,
  EVENT_UPLOADS_DIR,
  IS_VERCEL_ENV,
  UPLOADS_DIR,
  USE_REMOTE_DATABASE
} from "@/lib/constants";
import { DEFAULT_ABOUT, DEFAULT_NOTICE } from "@/lib/default-content";
import { HttpError } from "@/lib/http";
import { createPasswordRecord, isoNow, verifyPassword } from "@/lib/security";

let sqliteDb = null;
let DatabaseSyncClass = null;
let postgresPool = null;
let initialized = false;
let initializationPromise = null;

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureLocalDirectories() {
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(UPLOADS_DIR, { recursive: true });
  mkdirSync(EVENT_UPLOADS_DIR, { recursive: true });
  mkdirSync(BACKUPS_DIR, { recursive: true });
}

function normalizePostgresQuery(query) {
  let parameterIndex = 0;
  return query.replace(/\?/g, () => {
    parameterIndex += 1;
    return `$${parameterIndex}`;
  });
}

function createSqliteExecutor(database) {
  return {
    async one(query, params = []) {
      return database.prepare(query).get(...params) || null;
    },
    async many(query, params = []) {
      return database.prepare(query).all(...params);
    },
    async execute(query, params = []) {
      const result = database.prepare(query).run(...params);
      return {
        rowCount: Number(result.changes || 0),
        lastInsertRowid:
          result.lastInsertRowid === undefined ? null : Number(result.lastInsertRowid)
      };
    }
  };
}

function getPostgresPool() {
  if (!postgresPool) {
    postgresPool = new Pool({
      connectionString: DATABASE_URL,
      ssl:
        DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1")
          ? false
          : { rejectUnauthorized: false }
    });
  }

  return postgresPool;
}

async function queryPostgres(clientLike, query, params = []) {
  const normalizedQuery = normalizePostgresQuery(query);
  return clientLike.query(normalizedQuery, params);
}

function createPostgresExecutor(clientLike) {
  return {
    async one(query, params = []) {
      const result = await queryPostgres(clientLike, query, params);
      return result.rows[0] || null;
    },
    async many(query, params = []) {
      const result = await queryPostgres(clientLike, query, params);
      return result.rows;
    },
    async execute(query, params = []) {
      let normalizedQuery = normalizePostgresQuery(query);
      const trimmedQuery = normalizedQuery.trim();
      const isInsert = /^\s*INSERT\b/i.test(trimmedQuery);
      const hasReturning = /\bRETURNING\b/i.test(trimmedQuery);
      const hasConflict = /\bON CONFLICT\b/i.test(trimmedQuery);
      if (isInsert && !hasReturning && !hasConflict) {
        normalizedQuery += " RETURNING id";
      }

      const result = await clientLike.query(normalizedQuery, params);
      return {
        rowCount: Number(result.rowCount || 0),
        lastInsertRowid: result.rows?.[0]?.id ?? null
      };
    }
  };
}

function getLocalDatabase() {
  if (!sqliteDb) {
    ensureLocalDirectories();
    if (!DatabaseSyncClass) {
      throw new Error("DatabaseSync is not loaded. Call initializeDatabase first.");
    }
    sqliteDb = new DatabaseSyncClass(DB_PATH);
    sqliteDb.exec("PRAGMA foreign_keys = ON");
  }

  return sqliteDb;
}

async function ensureDefaultRecords(executor) {
  const passwordRecord = createPasswordRecord(AUTHOR_PASSWORD);
  await executor.execute(
    `
      INSERT INTO admins (uid, password_salt, password_hash, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(uid) DO UPDATE SET
        password_salt = excluded.password_salt,
        password_hash = excluded.password_hash
    `,
    [AUTHOR_UID, passwordRecord.saltHex, passwordRecord.passwordHash, isoNow()]
  );

  const memberPasswordRecord = createPasswordRecord("member@iste");
  await executor.execute(
    `
      INSERT INTO members (uid, password_salt, password_hash, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(uid) DO NOTHING
    `,
    ["MEMBER2026", memberPasswordRecord.saltHex, memberPasswordRecord.passwordHash, isoNow()]
  );

  // Check if we have events, if not, add an ISTE-CUSC chapter entry
  const existingEvent = await executor.one("SELECT id FROM events WHERE name = ?", ["Technicia'26"]);
  if (!existingEvent) {
    await executor.execute(`
      INSERT INTO events (name, category, event_date, start_time, end_time, venue, deadline, registration_link, prizes, description, contact_name, contact_email, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ["Technicia'26", "Tech Fest", "2026-09-20", "09:00", "18:00", "Chandigarh University", "2026-09-15", "#", "Innovation Showcase", "A flagship ISTE-CUSC tech fest featuring hackathons, CUMUN, Capture The Flag, ideathons, workshops, and interactive technical events.", "ISTE-CUSC", "iste@cumail.in", "published", isoNow(), isoNow()]);
  }

  // Check if we have recruitments
  const existingRec = await executor.one("SELECT id FROM recruitments WHERE title = ?", ["ISTE Student Membership"]);
  if (!existingRec) {
    await executor.execute(`
      INSERT INTO recruitments (title, organization, domain, mode, location, deadline, application_link, description, contact_name, contact_email, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ["ISTE Student Membership", "ISTE Student Chapter", "Chapter Membership", "In-person", "Chandigarh University", "2026-05-01", "#", "Register for ISTE membership to access hands-on technical learning, leadership opportunities, workshops, competitions, and professional networking.", "ISTE-CUSC", "iste@cumail.in", "published", isoNow(), isoNow()]);
  }

  // Check applications
  const appCount = await executor.one("SELECT COUNT(*) as count FROM applications");
  if (appCount.count === 0) {
    const event = await executor.one("SELECT id FROM events LIMIT 1");
    if (event) {
      const existingApp = await executor.one("SELECT id FROM applications WHERE email = ? AND entity_id = ?", ["ritik@example.com", event.id]);
      if (!existingApp) {
        await executor.execute(`
          INSERT INTO applications (type, entity_id, name, email, phone, details, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, ["event", event.id, "Ritik Sharma", "ritik@example.com", "9876543210", "Interested in ISTE-CUSC membership and technical events.", isoNow()]);
      }
    }
  }

  await setSiteContentRecord(
    executor,
    "notice",
    await getSiteContentRecord(executor, "notice", DEFAULT_NOTICE)
  );
  await setSiteContentRecord(
    executor,
    "about",
    await getSiteContentRecord(executor, "about", DEFAULT_ABOUT)
  );

  const existingCounter = await executor.one("SELECT * FROM site_content WHERE key = ?", ["login_counter"]);
  if (!existingCounter) {
    await setSiteContentRecord(executor, "login_counter", { count: 500 });
  }

  // Check if we have past events, if not, seed them so they show in admin panel
  const pastEventsCount = await executor.one("SELECT COUNT(*) as count FROM past_events");
  if (pastEventsCount.count === 0) {
    const defaultPastEvents = [
      {
        name: "Logo Launch",
        category: "Event",
        eventDate: "2024-09-30",
        description: "The official launch event introducing the brand logo and identity of the ISTE Student Chapter at Chandigarh University.",
        winners: "Official logo reveal and branding launch of ISTE-CUSC.",
        imagePaths: ""
      },
      {
        name: "Augury",
        category: "Induction",
        eventDate: "2024-10-23",
        description: "Official recognition ceremony and induction milestone for the ISTE Student Chapter as a registered professional society.",
        winners: "Inaugural recognition and society induction.",
        imagePaths: ""
      },
      {
        name: "Mind Sprint",
        category: "Event",
        eventDate: "2025-01-21",
        description: "A high-intensity technical quiz and problem-solving competition testing computational logic and speed.",
        winners: "Technical evaluation, cognitive speed run, and peer showcase.",
        imagePaths: ""
      },
      {
        name: "CUMUN",
        category: "Event",
        eventDate: "2025-02-27",
        description: "Chandigarh University Model United Nations organized by the ISTE Student Chapter to promote diplomacy, global debate, and communication skills.",
        winners: "Structured debates, global policy simulations, and highlight awards.",
        imagePaths: ""
      },
      {
        name: "Technicia",
        category: "Hackathon",
        eventDate: "2025-10-15",
        description: "A national level flagship technical fest featuring hackathons, Capture The Flag challenges, ideathons, and workshops.",
        winners: "Flagship innovation platform, tech showcase, and major project awards.",
        imagePaths: "uploads/events/technicia-25-1.jpg,uploads/events/technicia-25-2.jpg,uploads/events/technicia-25-3.jpg,uploads/events/technicia-25-4.jpg"
      }
    ];

    for (const pe of defaultPastEvents) {
      await executor.execute(
        `
          INSERT INTO past_events (name, category, event_date, description, winners, image_paths, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [pe.name, pe.category, pe.eventDate, pe.description, pe.winners, pe.imagePaths, isoNow(), isoNow()]
      );
    }
  }
}

async function initializeRemoteDatabase() {
  const pool = getPostgresPool();
  const database = createPostgresExecutor(pool);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      uid TEXT NOT NULL UNIQUE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      uid TEXT NOT NULL UNIQUE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
      member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    )
  `);

  await database.execute(`
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

  await database.execute(`
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

  await database.execute(`
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

  await database.execute(`
    CREATE TABLE IF NOT EXISTS recruitment_applications (
      id SERIAL PRIMARY KEY,
      domain_id TEXT NOT NULL,
      domain_name TEXT NOT NULL,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      outlook_email TEXT NOT NULL,
      personal_email TEXT NOT NULL,
      resume_link TEXT NOT NULL,
      motivation TEXT NOT NULL,
      gender TEXT NOT NULL,
      uid TEXT NOT NULL,
      year_of_study TEXT NOT NULL,
      course TEXT NOT NULL,
      department TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  await database.execute(`
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

  await database.execute(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await database.execute(`
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

  await runSchemaMigrations(database, { postgres: true });
  await ensureDefaultRecords(database);
}

async function runOptionalMigration(executor, query) {
  try {
    await executor.execute(query);
  } catch (error) {
    // Ignore duplicate-column and already-applied migration errors.
  }
}

async function runSchemaMigrations(executor, { postgres = false } = {}) {
  if (postgres) {
    await runOptionalMigration(
      executor,
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS google_form_link TEXT"
    );
    await runOptionalMigration(
      executor,
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS min_team_size INTEGER DEFAULT 1"
    );
    await runOptionalMigration(
      executor,
      "ALTER TABLE events ADD COLUMN IF NOT EXISTS max_team_size INTEGER DEFAULT 1"
    );
    await runOptionalMigration(
      executor,
      "ALTER TABLE past_events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Event'"
    );
    await runOptionalMigration(
      executor,
      "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS member_id INTEGER REFERENCES members(id) ON DELETE CASCADE"
    );
    await runOptionalMigration(
      executor,
      "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS member_id INTEGER REFERENCES members(id) ON DELETE SET NULL"
    );
    await runOptionalMigration(
      executor,
      "ALTER TABLE applications ADD COLUMN IF NOT EXISTS team_name TEXT"
    );
    await runOptionalMigration(
      executor,
      "ALTER TABLE applications ADD COLUMN IF NOT EXISTS team_members TEXT"
    );
    return;
  }

  await runOptionalMigration(executor, "ALTER TABLE events ADD COLUMN google_form_link TEXT");
  await runOptionalMigration(executor, "ALTER TABLE events ADD COLUMN min_team_size INTEGER DEFAULT 1");
  await runOptionalMigration(executor, "ALTER TABLE events ADD COLUMN max_team_size INTEGER DEFAULT 1");
  await runOptionalMigration(executor, "ALTER TABLE past_events ADD COLUMN category TEXT DEFAULT 'Event'");
  await runOptionalMigration(executor, "ALTER TABLE sessions ADD COLUMN member_id INTEGER");
  await runOptionalMigration(executor, "ALTER TABLE audit_logs ADD COLUMN member_id INTEGER");
  await runOptionalMigration(executor, "ALTER TABLE applications ADD COLUMN team_name TEXT");
  await runOptionalMigration(executor, "ALTER TABLE applications ADD COLUMN team_members TEXT");
}

function initializeLocalDatabase() {
  const database = getLocalDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT NOT NULL UNIQUE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT NOT NULL UNIQUE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      member_id INTEGER,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    );

    CREATE TABLE IF NOT EXISTS recruitments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('event', 'recruitment')),
      entity_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      team_name TEXT,
      team_members TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recruitment_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain_id TEXT NOT NULL,
      domain_name TEXT NOT NULL,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      outlook_email TEXT NOT NULL,
      personal_email TEXT NOT NULL,
      resume_link TEXT NOT NULL,
      motivation TEXT NOT NULL,
      gender TEXT NOT NULL,
      uid TEXT NOT NULL,
      year_of_study TEXT NOT NULL,
      course TEXT NOT NULL,
      department TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS past_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Event',
      event_date TEXT NOT NULL,
      description TEXT NOT NULL,
      winners TEXT,
      image_paths TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      member_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
    );
  `);
}

export async function initializeDatabase() {
  if (initialized) {
    return getDb();
  }

  if (!initializationPromise) {
    initializationPromise = (async () => {
      if (IS_VERCEL_ENV && !USE_REMOTE_DATABASE) {
        throw new Error(
          "DATABASE_URL is required on Vercel. Local SQLite storage cannot persist writes in production."
        );
      }

      if (USE_REMOTE_DATABASE) {
        await initializeRemoteDatabase();
      } else {
        const { DatabaseSync } = await import("node:sqlite");
        DatabaseSyncClass = DatabaseSync;
        initializeLocalDatabase();
        const executor = createSqliteExecutor(getLocalDatabase());
        await runSchemaMigrations(executor);
        await ensureDefaultRecords(executor);
      }

      initialized = true;
    })().finally(() => {
      initializationPromise = null;
    });
  }

  await initializationPromise;
  return getDb();
}

export async function getDb() {
  if (!initialized && !initializationPromise) {
    await initializeDatabase();
  } else if (initializationPromise) {
    await initializationPromise;
  }

  return USE_REMOTE_DATABASE
    ? createPostgresExecutor(getPostgresPool())
    : createSqliteExecutor(getLocalDatabase());
}

export async function resetDatabaseConnection() {
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
  }

  if (postgresPool) {
    await postgresPool.end();
    postgresPool = null;
  }

  initialized = false;
  initializationPromise = null;
}

export async function getSiteContentRecord(executor, key, fallback) {
  const row = await executor.one("SELECT value FROM site_content WHERE key = ?", [key]);
  if (!row) {
    return cloneValue(fallback);
  }

  try {
    const parsed = JSON.parse(row.value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return cloneValue(fallback);
    }
    return parsed;
  } catch (error) {
    return cloneValue(fallback);
  }
}

export async function setSiteContentRecord(executor, key, value) {
  await executor.execute(
    `
      INSERT INTO site_content (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `,
    [key, JSON.stringify(value), isoNow()]
  );
}

export async function createAuditLog(executor, adminId, action, entityType, entityId, details = {}) {
  await executor.execute(
    `
      INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [adminId ?? null, action, entityType, entityId ?? null, JSON.stringify(details), isoNow()]
  );
}

export async function withTransaction(callback) {
  await initializeDatabase();

  if (USE_REMOTE_DATABASE) {
    const client = await getPostgresPool().connect();
    const executor = createPostgresExecutor(client);

    try {
      await client.query("BEGIN");
      const result = await callback(executor);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        // Ignore rollback errors so the original failure can surface.
      }
      throw error;
    } finally {
      client.release();
    }
  }

  const database = getLocalDatabase();
  const executor = createSqliteExecutor(database);
  database.exec("BEGIN");

  try {
    const result = await callback(executor);
    database.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      database.exec("ROLLBACK");
    } catch (rollbackError) {
      // Ignore rollback errors so the original failure can surface.
    }
    throw error;
  }
}

async function syncRemoteSequences(executor) {
  if (!USE_REMOTE_DATABASE) {
    return;
  }

  const tables = ["admins", "members", "sessions", "events", "recruitments", "applications", "recruitment_applications", "past_events", "audit_logs"];
  for (const table of tables) {
    await executor.execute(
      `
        SELECT setval(
          pg_get_serial_sequence(?, 'id'),
          COALESCE((SELECT MAX(id) FROM ${table}), 1),
          (SELECT MAX(id) IS NOT NULL FROM ${table})
        )
      `,
      [table]
    );
  }
}

export async function exportDatabaseSnapshot() {
  const database = await getDb();

  return {
    version: 1,
    exportedAt: isoNow(),
    tables: {
      admins: await database.many("SELECT * FROM admins ORDER BY id ASC"),
      members: await database.many("SELECT * FROM members ORDER BY id ASC"),
      sessions: await database.many("SELECT * FROM sessions ORDER BY id ASC"),
      events: await database.many(
        "SELECT * FROM events ORDER BY event_date ASC, start_time ASC, id ASC"
      ),
      recruitments: await database.many(
        "SELECT * FROM recruitments ORDER BY deadline ASC, id ASC"
      ),
      past_events: await database.many("SELECT * FROM past_events ORDER BY event_date DESC, id ASC"),
      applications: await database.many("SELECT * FROM applications ORDER BY created_at DESC, id ASC"),
      recruitment_applications: await database.many("SELECT * FROM recruitment_applications ORDER BY created_at DESC, id ASC"),
      site_content: await database.many("SELECT * FROM site_content ORDER BY key ASC"),
      audit_logs: await database.many("SELECT * FROM audit_logs ORDER BY id ASC")
    }
  };
}

function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || !snapshot.tables || typeof snapshot.tables !== "object") {
    throw new HttpError(400, "Backup file is invalid.");
  }
}

function rowsFromSnapshot(snapshot, key) {
  const rows = snapshot.tables?.[key];
  return Array.isArray(rows) ? rows : [];
}

export async function restoreDatabaseSnapshot(snapshot) {
  validateSnapshot(snapshot);

  await initializeDatabase();
  await withTransaction(async (database) => {
    await database.execute("DELETE FROM sessions");
    await database.execute("DELETE FROM audit_logs");
    await database.execute("DELETE FROM events");
    await database.execute("DELETE FROM recruitments");
    await database.execute("DELETE FROM past_events");
    await database.execute("DELETE FROM applications");
    await database.execute("DELETE FROM recruitment_applications");
    await database.execute("DELETE FROM site_content");
    await database.execute("DELETE FROM members");
    await database.execute("DELETE FROM admins");

    for (const row of rowsFromSnapshot(snapshot, "admins")) {
      await database.execute(
        `
          INSERT INTO admins (id, uid, password_salt, password_hash, created_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        [row.id, row.uid, row.password_salt, row.password_hash, row.created_at]
      );
    }

    for (const row of rowsFromSnapshot(snapshot, "members")) {
      await database.execute(
        `
          INSERT INTO members (id, uid, password_salt, password_hash, created_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        [row.id, row.uid, row.password_salt, row.password_hash, row.created_at]
      );
    }

    for (const row of rowsFromSnapshot(snapshot, "sessions")) {
      await database.execute(
        `
          INSERT INTO sessions (id, admin_id, member_id, token_hash, created_at, expires_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          row.id,
          row.admin_id ?? null,
          row.member_id ?? null,
          row.token_hash,
          row.created_at,
          row.expires_at
        ]
      );
    }

    for (const row of rowsFromSnapshot(snapshot, "events")) {
      await database.execute(
        `
          INSERT INTO events (
            id, name, category, event_date, start_time, end_time, venue, deadline,
            registration_link, google_form_link, prizes, description, contact_name, contact_email,
            status, poster_path, min_team_size, max_team_size, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            row.poster_path ?? null,
            row.min_team_size ?? 1,
            row.max_team_size ?? 1,
            row.created_at,
            row.updated_at
            ]
            );
    }

    for (const row of rowsFromSnapshot(snapshot, "recruitments")) {
      await database.execute(
        `
          INSERT INTO recruitments (
            id, title, organization, domain, mode, location, deadline,
            application_link, description, contact_name, contact_email,
            status, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    for (const row of rowsFromSnapshot(snapshot, "applications")) {
      await database.execute(
        `
          INSERT INTO applications (
            id, type, entity_id, name, email, phone, team_name, team_members, details, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    for (const row of rowsFromSnapshot(snapshot, "recruitment_applications")) {
      await database.execute(
        `
          INSERT INTO recruitment_applications (
            id, domain_id, domain_name, name, contact, outlook_email, personal_email,
            resume_link, motivation, gender, uid, year_of_study, course, department, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          row.id,
          row.domain_id,
          row.domain_name,
          row.name,
          row.contact,
          row.outlook_email,
          row.personal_email,
          row.resume_link,
          row.motivation,
          row.gender,
          row.uid,
          row.year_of_study,
          row.course,
          row.department,
          row.created_at
        ]
      );
    }

    for (const row of rowsFromSnapshot(snapshot, "past_events")) {
      await database.execute(
        `
          INSERT INTO past_events (
            id, name, category, event_date, description, winners, image_paths, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    for (const row of rowsFromSnapshot(snapshot, "site_content")) {
      await database.execute(
        `
          INSERT INTO site_content (key, value, updated_at)
          VALUES (?, ?, ?)
        `,
        [row.key, row.value, row.updated_at]
      );
    }

    for (const row of rowsFromSnapshot(snapshot, "audit_logs")) {
      await database.execute(
        `
          INSERT INTO audit_logs (id, admin_id, member_id, action, entity_type, entity_id, details, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          row.id,
          row.admin_id ?? null,
          row.member_id ?? null,
          row.action,
          row.entity_type,
          row.entity_id ?? null,
          row.details,
          row.created_at
        ]
      );
    }

    await syncRemoteSequences(database);
  });

  const database = await getDb();
  await ensureDefaultRecords(database);
}
