import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";

import {
  ALLOWED_IMAGE_TYPES,
  BACKUPS_DIR,
  DB_PATH,
  MAX_IMAGE_SIZE,
  ROOT_DIR,
  USE_REMOTE_DATABASE
} from "@/lib/constants";
import { DEFAULT_ABOUT, DEFAULT_NOTICE } from "@/lib/default-content";
import {
  createAuditLog,
  exportDatabaseSnapshot,
  getDb,
  getSiteContentRecord,
  initializeDatabase,
  resetDatabaseConnection,
  restoreDatabaseSnapshot,
  setSiteContentRecord,
  withTransaction
} from "@/lib/db";
import { HttpError } from "@/lib/http";
import { normalizeAbout, normalizeNotice } from "@/lib/presentation";
import { formatBackupTimestamp, hashToken, isoNow, sessionExpiryIso } from "@/lib/security";
import {
  listBackups,
  loadBackupSnapshot,
  readProjectBinary,
  removeStoredFile,
  saveBackupSnapshot,
  saveEventPoster
} from "@/lib/storage";
import {
  formatDisplayTime,
  sanitizeText,
  validateDate,
  validateEmail,
  validateTime,
  validateUrl
} from "@/lib/validation";

function parseJsonDetails(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
}

function resolveInsideRoot(basePath, ...segments) {
  const root = path.resolve(basePath);
  const target = path.resolve(basePath, ...segments);

  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new HttpError(400, "The selected file path is invalid.");
  }

  return target;
}

function serializeEvent(row) {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category,
    eventDate: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    timing: formatDisplayTime(row.start_time, row.end_time),
    venue: row.venue,
    deadline: row.deadline,
    registrationLink: row.registration_link,
    prizes: row.prizes,
    description: row.description,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    status: row.status,
    posterPath: row.poster_path,
    minTeamSize: Number(row.min_team_size || 1),
    maxTeamSize: Number(row.max_team_size || 1),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function serializeRecruitment(row) {
  return {
    id: Number(row.id),
    title: row.title,
    organization: row.organization,
    domain: row.domain,
    mode: row.mode,
    location: row.location,
    deadline: row.deadline,
    applicationLink: row.application_link,
    description: row.description,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function validateStatus(value, label) {
  const status = sanitizeText(value, "draft").toLowerCase();
  if (status !== "draft" && status !== "published") {
    throw new HttpError(400, `${label} must be draft or published.`);
  }
  return status;
}

async function saveDataUrlImage(dataUrl, prefix) {
  if (!dataUrl) {
    return null;
  }

  if (!String(dataUrl).includes(",")) {
    throw new HttpError(400, "Image upload data is invalid.");
  }

  const [header, encoded] = String(dataUrl).split(",", 2);
  if (!header.startsWith("data:") || !header.includes(";base64")) {
    throw new HttpError(400, "Image upload format is invalid.");
  }

  const mimeType = header.slice(5).split(";")[0];
  const extension = ALLOWED_IMAGE_TYPES[mimeType];
  if (!extension) {
    throw new HttpError(400, "Only JPG, PNG, and WEBP images are supported.");
  }

  const decoded = Buffer.from(encoded, "base64");
  if (!decoded.length) {
    throw new HttpError(400, "Image upload data could not be decoded.");
  }
  if (decoded.length > MAX_IMAGE_SIZE) {
    throw new HttpError(400, "Image upload is too large. Maximum size is 4 MB.");
  }

  return saveEventPoster(decoded, { contentType: mimeType, extension, prefix });
}

async function validateEventPayload(payload, existing = null) {
  const name = sanitizeText(payload?.name);
  const category = sanitizeText(payload?.category);
  const venue = sanitizeText(payload?.venue);
  const prizes = sanitizeText(payload?.prizes);
  const description = sanitizeText(payload?.description);
  const contactName = sanitizeText(payload?.contactName);

  if (!name || !category || !venue || !prizes || !description || !contactName) {
    throw new HttpError(400, "All event fields are required.");
  }

  const eventDate = validateDate(payload?.eventDate, "Event date");
  const deadline = validateDate(payload?.deadline, "Registration deadline");
  if (deadline > eventDate) {
    throw new HttpError(400, "Registration deadline cannot be after the event date.");
  }

  const startTime = validateTime(payload?.startTime, "Start time");
  const endTime = validateTime(payload?.endTime, "End time");
  if (startTime >= endTime) {
    throw new HttpError(400, "End time must be later than the start time.");
  }

  const event = {
    name,
    category,
    event_date: eventDate,
    start_time: startTime,
    end_time: endTime,
    venue,
    deadline,
    registration_link: validateUrl(payload?.registrationLink, "Registration link"),
    prizes,
    description,
    contact_name: contactName,
    contact_email: validateEmail(payload?.contactEmail),
    status: validateStatus(payload?.status, "Event status"),
    min_team_size: Number(payload?.minTeamSize || 1),
    max_team_size: Number(payload?.maxTeamSize || 1)
  };

  let posterPath = existing?.poster_path || null;
  const posterRemoved = Boolean(payload?.posterRemoved);
  const posterDataUrl = payload?.posterDataUrl;

  if (posterRemoved && posterPath) {
    await removeStoredFile(posterPath);
    posterPath = null;
  }

  if (posterDataUrl) {
    if (posterPath) {
      await removeStoredFile(posterPath);
    }
    posterPath = await saveDataUrlImage(posterDataUrl, "event");
  }

  return { event, posterPath };
}

function validateRecruitmentPayload(payload) {
  const title = sanitizeText(payload?.title);
  const organization = sanitizeText(payload?.organization);
  const domain = sanitizeText(payload?.domain);
  const mode = sanitizeText(payload?.mode);
  const location = sanitizeText(payload?.location);
  const description = sanitizeText(payload?.description);
  const contactName = sanitizeText(payload?.contactName);

  if (!title || !organization || !domain || !mode || !location || !description || !contactName) {
    throw new HttpError(400, "All recruitment fields are required.");
  }

  return {
    title,
    organization,
    domain,
    mode,
    location,
    deadline: validateDate(payload?.deadline, "Application deadline"),
    application_link: validateUrl(payload?.applicationLink, "Application link"),
    description,
    contact_name: contactName,
    contact_email: validateEmail(payload?.contactEmail),
    status: validateStatus(payload?.status, "Recruitment status")
  };
}

function resolveLocalBackupPath(backupName) {
  const cleanedName = sanitizeText(backupName);
  if (!cleanedName) {
    throw new HttpError(400, "Backup name is required.");
  }
  if (path.basename(cleanedName) !== cleanedName || !cleanedName.endsWith(".db")) {
    throw new HttpError(400, "Backup name is invalid.");
  }

  const backupPath = resolveInsideRoot(BACKUPS_DIR, cleanedName);
  if (!existsSync(backupPath) || !statSync(backupPath).isFile()) {
    throw new HttpError(400, "Selected backup file was not found.");
  }

  return backupPath;
}

async function createLocalDatabaseBackup(prefix) {
  mkdirSync(BACKUPS_DIR, { recursive: true });

  const timestamp = formatBackupTimestamp();
  let candidate = path.join(BACKUPS_DIR, `${prefix}-${timestamp}.db`);
  let suffix = 1;

  while (existsSync(candidate)) {
    candidate = path.join(BACKUPS_DIR, `${prefix}-${timestamp}-${suffix}.db`);
    suffix += 1;
  }

  await resetDatabaseConnection();
  copyFileSync(DB_PATH, candidate);
  await initializeDatabase();
  return candidate;
}

export function readBinaryFromProject(relativePath) {
  return readProjectBinary(relativePath);
}

export async function getPublicSiteData() {
  const database = await getDb();
  const notice = normalizeNotice(await getSiteContentRecord(database, "notice", DEFAULT_NOTICE));
  const about = normalizeAbout(await getSiteContentRecord(database, "about", DEFAULT_ABOUT));
  const eventRows = await database.many(
    `
      SELECT * FROM events
      WHERE status = 'published'
      ORDER BY event_date ASC, start_time ASC
    `
  );
  const recruitmentRows = await database.many(
    `
      SELECT * FROM recruitments
      WHERE status = 'published'
      ORDER BY deadline ASC, created_at DESC
    `
  );

  return {
    notice,
    about,
    events: eventRows.map(serializeEvent),
    recruitments: recruitmentRows.map(serializeRecruitment)
  };
}

export async function getAdminSummaryData() {
  const database = await getDb();
  const eventsTotal = await database.one("SELECT COUNT(*) AS count FROM events");
  const eventsPublished = await database.one(
    "SELECT COUNT(*) AS count FROM events WHERE status = 'published'"
  );
  const eventsDraft = await database.one("SELECT COUNT(*) AS count FROM events WHERE status = 'draft'");
  const recruitmentsTotal = await database.one("SELECT COUNT(*) AS count FROM recruitments");
  const recruitmentsPublished = await database.one(
    "SELECT COUNT(*) AS count FROM recruitments WHERE status = 'published'"
  );
  const recruitmentsDraft = await database.one(
    "SELECT COUNT(*) AS count FROM recruitments WHERE status = 'draft'"
  );

  const recentActivity = (
    await database.many(
      `
        SELECT audit_logs.*, admins.uid
        FROM audit_logs
        LEFT JOIN admins ON admins.id = audit_logs.admin_id
        ORDER BY audit_logs.created_at DESC
        LIMIT 8
      `
    )
  ).map((row) => ({
    id: Number(row.id),
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    details: parseJsonDetails(row.details),
    uid: row.uid,
    createdAt: row.created_at
  }));

  return {
    summary: {
      eventsTotal: Number(eventsTotal?.count || 0),
      eventsPublished: Number(eventsPublished?.count || 0),
      eventsDraft: Number(eventsDraft?.count || 0),
      recruitmentsTotal: Number(recruitmentsTotal?.count || 0),
      recruitmentsPublished: Number(recruitmentsPublished?.count || 0),
      recruitmentsDraft: Number(recruitmentsDraft?.count || 0)
    },
    backups: await listBackups(5),
    recentActivity
  };
}

export async function getAdminEventsData() {
  const database = await getDb();
  const rows = await database.many(
    "SELECT * FROM events ORDER BY event_date ASC, start_time ASC, created_at DESC"
  );
  return rows.map(serializeEvent);
}

export async function getAdminRecruitmentsData() {
  const database = await getDb();
  const rows = await database.many(
    "SELECT * FROM recruitments ORDER BY deadline ASC, created_at DESC"
  );
  return rows.map(serializeRecruitment);
}

function serializePastEvent(row) {
  return {
    id: Number(row.id),
    name: row.name,
    eventDate: row.event_date,
    description: row.description,
    winners: row.winners,
    imagePaths: row.image_paths ? row.image_paths.split(",") : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getPublicPastEvents() {
  const database = await getDb();
  const rows = await database.many(
    "SELECT * FROM past_events ORDER BY event_date DESC, created_at DESC"
  );
  return rows.map(serializePastEvent);
}

export async function getAdminPastEventsData() {
  const database = await getDb();
  const rows = await database.many(
    "SELECT * FROM past_events ORDER BY event_date DESC, created_at DESC"
  );
  return rows.map(serializePastEvent);
}

export async function createPastEvent(payload, adminId) {
  const name = sanitizeText(payload?.name);
  const eventDate = validateDate(payload?.eventDate, "Event date");
  const description = sanitizeText(payload?.description);
  const winners = sanitizeText(payload?.winners);
  const imagePaths = Array.isArray(payload?.imagePaths) ? payload.imagePaths.join(",") : "";
  const now = isoNow();

  const row = await withTransaction(async (database) => {
    await database.execute(
      `
        INSERT INTO past_events (
          name, event_date, description, winners, image_paths, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [name, eventDate, description, winners, imagePaths, now, now]
    );

    const inserted = await database.one(
      "SELECT * FROM past_events WHERE created_at = ? AND name = ? ORDER BY id DESC LIMIT 1",
      [now, name]
    );

    await createAuditLog(database, adminId, "create", "past_event", String(inserted.id), {
      name: name
    });

    return inserted;
  });

  return serializePastEvent(row);
}

export async function updatePastEvent(id, payload, adminId) {
  const name = sanitizeText(payload?.name);
  const eventDate = validateDate(payload?.eventDate, "Event date");
  const description = sanitizeText(payload?.description);
  const winners = sanitizeText(payload?.winners);
  const imagePaths = Array.isArray(payload?.imagePaths) ? payload.imagePaths.join(",") : "";

  const row = await withTransaction(async (transactionDb) => {
    await transactionDb.execute(
      `
        UPDATE past_events
        SET
          name = ?,
          event_date = ?,
          description = ?,
          winners = ?,
          image_paths = ?,
          updated_at = ?
        WHERE id = ?
      `,
      [name, eventDate, description, winners, imagePaths, isoNow(), id]
    );

    await createAuditLog(transactionDb, adminId, "update", "past_event", String(id), {
      name: name
    });

    return transactionDb.one("SELECT * FROM past_events WHERE id = ?", [id]);
  });

  return serializePastEvent(row);
}

export async function deletePastEvent(id, adminId) {
  const database = await getDb();
  const existing = await database.one("SELECT * FROM past_events WHERE id = ?", [id]);
  if (!existing) {
    throw new HttpError(404, "Past event not found.");
  }

  await withTransaction(async (transactionDb) => {
    await transactionDb.execute("DELETE FROM past_events WHERE id = ?", [id]);
    await createAuditLog(transactionDb, adminId, "delete", "past_event", String(id), {
      name: existing.name
    });
  });
}

export async function createEvent(payload, adminId) {
  const { event, posterPath } = await validateEventPayload(payload);
  const now = isoNow();

  const row = await withTransaction(async (database) => {
    await database.execute(
      `
        INSERT INTO events (
          name, category, event_date, start_time, end_time, venue, deadline,
          registration_link, prizes, description, contact_name, contact_email,
          status, poster_path, min_team_size, max_team_size, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        event.name,
        event.category,
        event.event_date,
        event.start_time,
        event.end_time,
        event.venue,
        event.deadline,
        event.registration_link,
        event.prizes,
        event.description,
        event.contact_name,
        event.contact_email,
        event.status,
        posterPath,
        event.min_team_size,
        event.max_team_size,
        now,
        now
      ]
    );

    const inserted = await database.one(
      "SELECT * FROM events WHERE created_at = ? AND name = ? ORDER BY id DESC LIMIT 1",
      [now, event.name]
    );

    await createAuditLog(database, adminId, "create", "event", String(inserted.id), {
      name: event.name,
      status: event.status
    });

    return inserted;
  });

  return serializeEvent(row);
}

export async function updateEvent(id, payload, adminId) {
  const database = await getDb();
  const existing = await database.one("SELECT * FROM events WHERE id = ?", [id]);
  if (!existing) {
    throw new HttpError(404, "Event not found.");
  }

  const { event, posterPath } = await validateEventPayload(payload, existing);

  const row = await withTransaction(async (transactionDb) => {
    await transactionDb.execute(
      `
        UPDATE events
        SET
          name = ?,
          category = ?,
          event_date = ?,
          start_time = ?,
          end_time = ?,
          venue = ?,
          deadline = ?,
          registration_link = ?,
          prizes = ?,
          description = ?,
          contact_name = ?,
          contact_email = ?,
          status = ?,
          poster_path = ?,
          min_team_size = ?,
          max_team_size = ?,
          updated_at = ?
        WHERE id = ?
      `,
      [
        event.name,
        event.category,
        event.event_date,
        event.start_time,
        event.end_time,
        event.venue,
        event.deadline,
        event.registration_link,
        event.prizes,
        event.description,
        event.contact_name,
        event.contact_email,
        event.status,
        posterPath,
        event.min_team_size,
        event.max_team_size,
        isoNow(),
        id
      ]
    );

    await createAuditLog(transactionDb, adminId, "update", "event", String(id), {
      name: event.name,
      status: event.status
    });

    return transactionDb.one("SELECT * FROM events WHERE id = ?", [id]);
  });

  return serializeEvent(row);
}

export async function deleteEvent(id, adminId) {
  const database = await getDb();
  const existing = await database.one("SELECT * FROM events WHERE id = ?", [id]);
  if (!existing) {
    throw new HttpError(404, "Event not found.");
  }

  await removeStoredFile(existing.poster_path);

  await withTransaction(async (transactionDb) => {
    await transactionDb.execute("DELETE FROM events WHERE id = ?", [id]);
    await createAuditLog(transactionDb, adminId, "delete", "event", String(id), {
      name: existing.name
    });
  });
}

export async function updateEventStatus(id, statusValue, adminId) {
  const status = validateStatus(statusValue, "Status");
  const database = await getDb();
  const existing = await database.one("SELECT * FROM events WHERE id = ?", [id]);
  if (!existing) {
    throw new HttpError(404, "Event not found.");
  }

  const row = await withTransaction(async (transactionDb) => {
    await transactionDb.execute("UPDATE events SET status = ?, updated_at = ? WHERE id = ?", [
      status,
      isoNow(),
      id
    ]);
    await createAuditLog(transactionDb, adminId, "status_change", "event", String(id), {
      status,
      name: existing.name
    });
    return transactionDb.one("SELECT * FROM events WHERE id = ?", [id]);
  });

  return serializeEvent(row);
}

export async function createRecruitment(payload, adminId) {
  const recruitment = validateRecruitmentPayload(payload);
  const now = isoNow();

  const row = await withTransaction(async (database) => {
    await database.execute(
      `
        INSERT INTO recruitments (
          title, organization, domain, mode, location, deadline,
          application_link, description, contact_name, contact_email,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        recruitment.title,
        recruitment.organization,
        recruitment.domain,
        recruitment.mode,
        recruitment.location,
        recruitment.deadline,
        recruitment.application_link,
        recruitment.description,
        recruitment.contact_name,
        recruitment.contact_email,
        recruitment.status,
        now,
        now
      ]
    );

    const inserted = await database.one(
      "SELECT * FROM recruitments WHERE created_at = ? AND title = ? ORDER BY id DESC LIMIT 1",
      [now, recruitment.title]
    );

    await createAuditLog(database, adminId, "create", "recruitment", String(inserted.id), {
      title: recruitment.title,
      status: recruitment.status
    });

    return inserted;
  });

  return serializeRecruitment(row);
}

export async function updateRecruitment(id, payload, adminId) {
  const database = await getDb();
  const existing = await database.one("SELECT * FROM recruitments WHERE id = ?", [id]);
  if (!existing) {
    throw new HttpError(404, "Recruitment not found.");
  }

  const recruitment = validateRecruitmentPayload(payload);
  const row = await withTransaction(async (transactionDb) => {
    await transactionDb.execute(
      `
        UPDATE recruitments
        SET
          title = ?,
          organization = ?,
          domain = ?,
          mode = ?,
          location = ?,
          deadline = ?,
          application_link = ?,
          description = ?,
          contact_name = ?,
          contact_email = ?,
          status = ?,
          updated_at = ?
        WHERE id = ?
      `,
      [
        recruitment.title,
        recruitment.organization,
        recruitment.domain,
        recruitment.mode,
        recruitment.location,
        recruitment.deadline,
        recruitment.application_link,
        recruitment.description,
        recruitment.contact_name,
        recruitment.contact_email,
        recruitment.status,
        isoNow(),
        id
      ]
    );

    await createAuditLog(transactionDb, adminId, "update", "recruitment", String(id), {
      title: recruitment.title,
      status: recruitment.status
    });

    return transactionDb.one("SELECT * FROM recruitments WHERE id = ?", [id]);
  });

  return serializeRecruitment(row);
}

export async function deleteRecruitment(id, adminId) {
  const database = await getDb();
  const existing = await database.one("SELECT * FROM recruitments WHERE id = ?", [id]);
  if (!existing) {
    throw new HttpError(404, "Recruitment not found.");
  }

  await withTransaction(async (transactionDb) => {
    await transactionDb.execute("DELETE FROM recruitments WHERE id = ?", [id]);
    await createAuditLog(transactionDb, adminId, "delete", "recruitment", String(id), {
      title: existing.title
    });
  });
}

export async function updateRecruitmentStatus(id, statusValue, adminId) {
  const status = validateStatus(statusValue, "Status");
  const database = await getDb();
  const existing = await database.one("SELECT * FROM recruitments WHERE id = ?", [id]);
  if (!existing) {
    throw new HttpError(404, "Recruitment not found.");
  }

  const row = await withTransaction(async (transactionDb) => {
    await transactionDb.execute(
      "UPDATE recruitments SET status = ?, updated_at = ? WHERE id = ?",
      [status, isoNow(), id]
    );
    await createAuditLog(transactionDb, adminId, "status_change", "recruitment", String(id), {
      status,
      title: existing.title
    });
    return transactionDb.one("SELECT * FROM recruitments WHERE id = ?", [id]);
  });

  return serializeRecruitment(row);
}

export async function updateNoticeContent(payload, adminId) {
  const notice = {
    detailText: sanitizeText(payload?.detailText, DEFAULT_NOTICE.detailText)
  };

  await withTransaction(async (database) => {
    await setSiteContentRecord(database, "notice", notice);
    await createAuditLog(database, adminId, "update", "site_content", "notice", {
      detailText: notice.detailText
    });
  });

  return notice;
}

export async function updateAboutContent(payload, adminId) {
  const rawVisionItems = Array.isArray(payload?.visionItems) ? payload.visionItems : null;
  if (!rawVisionItems) {
    throw new HttpError(400, "Vision items must be a list.");
  }

  const visionItems = rawVisionItems.map((item) => sanitizeText(item)).filter(Boolean);
  if (!visionItems.length) {
    throw new HttpError(400, "At least one vision item is required.");
  }

  const rawFocusCards = Array.isArray(payload?.focusCards) ? payload.focusCards : null;
  if (!rawFocusCards || rawFocusCards.length !== 3) {
    throw new HttpError(400, "Exactly three focus cards are required.");
  }

  const focusCards = rawFocusCards.map((card) => {
    const title = sanitizeText(card?.title);
    const text = sanitizeText(card?.text);
    if (!title || !text) {
      throw new HttpError(400, "Each focus card requires a title and description.");
    }
    return { title, text };
  });

  const about = {
    heroTitle: sanitizeText(payload?.heroTitle, DEFAULT_ABOUT.heroTitle),
    heroText: sanitizeText(payload?.heroText, DEFAULT_ABOUT.heroText),
    overviewTitle: sanitizeText(payload?.overviewTitle, DEFAULT_ABOUT.overviewTitle),
    overviewParagraphOne: sanitizeText(
      payload?.overviewParagraphOne,
      DEFAULT_ABOUT.overviewParagraphOne
    ),
    overviewParagraphTwo: sanitizeText(
      payload?.overviewParagraphTwo,
      DEFAULT_ABOUT.overviewParagraphTwo
    ),
    visionTitle: sanitizeText(payload?.visionTitle, DEFAULT_ABOUT.visionTitle),
    visionItems,
    focusTitle: sanitizeText(payload?.focusTitle, DEFAULT_ABOUT.focusTitle),
    focusCards,
    facultyTitle: sanitizeText(payload?.facultyTitle, DEFAULT_ABOUT.facultyTitle),
    facultyText: sanitizeText(payload?.facultyText, DEFAULT_ABOUT.facultyText),
    teamTitle: sanitizeText(payload?.teamTitle, DEFAULT_ABOUT.teamTitle),
    teamText: sanitizeText(payload?.teamText, DEFAULT_ABOUT.teamText),
    galleryTitle: sanitizeText(payload?.galleryTitle, DEFAULT_ABOUT.galleryTitle),
    galleryText: sanitizeText(payload?.galleryText, DEFAULT_ABOUT.galleryText),
    pastEventsTitle: sanitizeText(payload?.pastEventsTitle, DEFAULT_ABOUT.pastEventsTitle),
    pastEventsText: sanitizeText(payload?.pastEventsText, DEFAULT_ABOUT.pastEventsText),
    downloadsTitle: sanitizeText(payload?.downloadsTitle, DEFAULT_ABOUT.downloadsTitle),
    downloadsText: sanitizeText(payload?.downloadsText, DEFAULT_ABOUT.downloadsText),
    policyTitle: sanitizeText(payload?.policyTitle, DEFAULT_ABOUT.policyTitle),
    policyText: sanitizeText(payload?.policyText, DEFAULT_ABOUT.policyText),
    contactTitle: sanitizeText(payload?.contactTitle, DEFAULT_ABOUT.contactTitle),
    contactText: sanitizeText(payload?.contactText, DEFAULT_ABOUT.contactText),
    adminNoteTitle: sanitizeText(payload?.adminNoteTitle, DEFAULT_ABOUT.adminNoteTitle),
    adminNoteText: sanitizeText(payload?.adminNoteText, DEFAULT_ABOUT.adminNoteText)
  };

  await withTransaction(async (database) => {
    await setSiteContentRecord(database, "about", about);
    await createAuditLog(database, adminId, "update", "site_content", "about", {
      heroTitle: about.heroTitle
    });
  });

  return about;
}

export async function updateEventLink(id, link, adminId) {
  const registrationLink = validateUrl(link, "Registration link");
  const database = await getDb();
  const existing = await database.one("SELECT * FROM events WHERE id = ?", [id]);
  if (!existing) {
    throw new HttpError(404, "Event not found.");
  }

  const row = await withTransaction(async (transactionDb) => {
    await transactionDb.execute("UPDATE events SET registration_link = ?, updated_at = ? WHERE id = ?", [
      registrationLink,
      isoNow(),
      id
    ]);
    await createAuditLog(transactionDb, adminId, "update_link", "event", String(id), {
      registrationLink,
      name: existing.name
    });
    return transactionDb.one("SELECT * FROM events WHERE id = ?", [id]);
  });

  return serializeEvent(row);
}

export async function updateRecruitmentLink(id, link, adminId) {
  const applicationLink = validateUrl(link, "Application link");
  const database = await getDb();
  const existing = await database.one("SELECT * FROM recruitments WHERE id = ?", [id]);
  if (!existing) {
    throw new HttpError(404, "Recruitment not found.");
  }

  const row = await withTransaction(async (transactionDb) => {
    await transactionDb.execute("UPDATE recruitments SET application_link = ?, updated_at = ? WHERE id = ?", [
      applicationLink,
      isoNow(),
      id
    ]);
    await createAuditLog(transactionDb, adminId, "update_link", "recruitment", String(id), {
      applicationLink,
      title: existing.title
    });
    return transactionDb.one("SELECT * FROM recruitments WHERE id = ?", [id]);
  });

  return serializeRecruitment(row);
}

async function createRemoteBackup(prefix) {
  const snapshot = await exportDatabaseSnapshot();
  const backup = await saveBackupSnapshot(`${prefix}-${formatBackupTimestamp()}.json`, snapshot);
  return backup;
}

export async function createBackup(adminId) {
  if (USE_REMOTE_DATABASE) {
    const backup = await createRemoteBackup("iste-backup");
    const database = await getDb();

    await createAuditLog(database, adminId, "create_backup", "backup", backup.name, {
      size: backup.size
    });

    return {
      name: backup.name,
      size: backup.size,
      createdAt: backup.createdAt
    };
  }

  const backupPath = await createLocalDatabaseBackup("iste-backup");
  const backupStats = statSync(backupPath);
  const database = await getDb();

  await createAuditLog(database, adminId, "create_backup", "backup", path.basename(backupPath), {
    size: backupStats.size
  });

  return {
    name: path.basename(backupPath),
    size: backupStats.size,
    createdAt: isoNow()
  };
}

export async function restoreBackup(backupName, adminUid, rawSessionToken) {
  if (USE_REMOTE_DATABASE) {
    const safetyBackup = await createRemoteBackup("iste-pre-restore");
    const snapshot = await loadBackupSnapshot(backupName);
    const createdAt = isoNow();
    const expiresAt = sessionExpiryIso();
    const tokenHash = sanitizeText(rawSessionToken) ? hashToken(rawSessionToken) : null;

    await restoreDatabaseSnapshot(snapshot);

    await withTransaction(async (database) => {
      await database.execute("DELETE FROM sessions");
      const restoredAdmin = await database.one("SELECT id FROM admins WHERE uid = ?", [adminUid]);

      if (restoredAdmin && tokenHash) {
        await database.execute(
          `
            INSERT INTO sessions (admin_id, token_hash, created_at, expires_at)
            VALUES (?, ?, ?, ?)
          `,
          [restoredAdmin.id, tokenHash, createdAt, expiresAt]
        );
      }

      await createAuditLog(
        database,
        restoredAdmin?.id ?? null,
        "restore_backup",
        "backup",
        backupName,
        {
          restoredBackup: backupName,
          safetyBackup: safetyBackup.name
        }
      );
    });

    return {
      restored: true,
      backup: { name: backupName },
      safetyBackup: {
        name: safetyBackup.name,
        size: safetyBackup.size
      }
    };
  }

  const backupPath = resolveLocalBackupPath(backupName);
  const safetyBackupPath = await createLocalDatabaseBackup("iste-pre-restore");
  const createdAt = isoNow();
  const expiresAt = sessionExpiryIso();
  const tokenHash = sanitizeText(rawSessionToken) ? hashToken(rawSessionToken) : null;

  await resetDatabaseConnection();
  copyFileSync(backupPath, DB_PATH);
  await initializeDatabase();

  await withTransaction(async (database) => {
    await database.execute("DELETE FROM sessions");
    const restoredAdmin = await database.one("SELECT id FROM admins WHERE uid = ?", [adminUid]);

    if (restoredAdmin && tokenHash) {
      await database.execute(
        `
          INSERT INTO sessions (admin_id, token_hash, created_at, expires_at)
          VALUES (?, ?, ?, ?)
        `,
        [restoredAdmin.id, tokenHash, createdAt, expiresAt]
      );
    }

    await createAuditLog(database, restoredAdmin?.id ?? null, "restore_backup", "backup", backupName, {
      restoredBackup: path.basename(backupPath),
      safetyBackup: path.basename(safetyBackupPath)
    });
  });

  const safetyStats = statSync(safetyBackupPath);

  return {
    restored: true,
    backup: { name: path.basename(backupPath) },
    safetyBackup: {
      name: path.basename(safetyBackupPath),
      size: safetyStats.size
    }
  };
}
