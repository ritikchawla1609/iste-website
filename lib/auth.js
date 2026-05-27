import { HttpError } from "@/lib/http";
import {
  COOKIE_SECURE,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS
} from "@/lib/constants";
import { createAuditLog, getDb, withTransaction } from "@/lib/db";
import {
  createSessionToken,
  hashToken,
  isoNow,
  sessionExpiryIso,
  verifyPassword
} from "@/lib/security";
import { sanitizeText } from "@/lib/validation";

function commitSessionCookie(response, value, maxAge) {
  response.cookies.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: COOKIE_SECURE,
    maxAge
  });
}

export function setSessionCookie(response, token) {
  commitSessionCookie(response, token, SESSION_DURATION_SECONDS);
}

export function clearSessionCookie(response) {
  commitSessionCookie(response, "", 0);
}

export function getSessionToken(cookieStore) {
  const value = cookieStore?.get?.(SESSION_COOKIE_NAME)?.value;
  return sanitizeText(value);
}

export async function getCurrentAdmin(cookieStore) {
  const token = getSessionToken(cookieStore);
  if (!token) {
    return null;
  }

  const database = await getDb();
  const row = await database.one(
    `
      SELECT admins.id, admins.uid, sessions.id AS session_id, sessions.expires_at
      FROM sessions
      JOIN admins ON admins.id = sessions.admin_id
      WHERE sessions.token_hash = ?
    `,
    [hashToken(token)]
  );

  if (!row) {
    return null;
  }

  const expiresAt = new Date(row.expires_at);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
    await database.execute("DELETE FROM sessions WHERE id = ?", [row.session_id]);
    return null;
  }

  return {
    id: row.id,
    uid: row.uid,
    sessionId: row.session_id,
    expiresAt: row.expires_at,
    token
  };
}

export async function getCurrentMember(cookieStore) {
  const token = getSessionToken(cookieStore);
  if (!token) {
    return null;
  }

  const database = await getDb();
  const row = await database.one(
    `
      SELECT members.id, members.uid, sessions.id AS session_id, sessions.expires_at
      FROM sessions
      JOIN members ON members.id = sessions.member_id
      WHERE sessions.token_hash = ?
    `,
    [hashToken(token)]
  );

  if (!row) {
    return null;
  }

  const expiresAt = new Date(row.expires_at);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
    await database.execute("DELETE FROM sessions WHERE id = ?", [row.session_id]);
    return null;
  }

  return {
    id: row.id,
    uid: row.uid,
    sessionId: row.session_id,
    expiresAt: row.expires_at,
    token
  };
}

export async function requireAdmin(cookieStore) {
  const admin = await getCurrentAdmin(cookieStore);
  if (!admin) {
    throw new HttpError(401, "Authentication required.");
  }
  return admin;
}

export async function requireMember(cookieStore) {
  const member = await getCurrentMember(cookieStore);
  if (!member) {
    throw new HttpError(401, "Authentication required.");
  }
  return member;
}

async function incrementLoginCounter(executor) {
  const counter = await executor.one("SELECT value FROM site_content WHERE key = ?", ["login_counter"]);
  let count = 500;
  if (counter) {
    try {
      const parsed = JSON.parse(counter.value);
      count = (parsed.count || 500) + 1;
    } catch (e) {
      count = 501;
    }
  } else {
    count = 501;
  }

  await executor.execute(
    `
      INSERT INTO site_content (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `,
    ["login_counter", JSON.stringify({ count }), isoNow()]
  );
}

export async function loginAdmin(uidValue, passwordValue) {
  const uid = sanitizeText(uidValue);
  const password = sanitizeText(passwordValue);
  if (!uid || !password) {
    throw new HttpError(400, "UID and password are required.");
  }

  const database = await getDb();
  const admin = await database.one("SELECT * FROM admins WHERE uid = ?", [uid]);
  if (!admin || !verifyPassword(password, admin.password_salt, admin.password_hash)) {
    throw new HttpError(401, "Invalid UID or password.");
  }

  const token = createSessionToken();
  const createdAt = isoNow();
  const expiresAt = sessionExpiryIso();

  await withTransaction(async (transactionDb) => {
    await transactionDb.execute(
      `
        INSERT INTO sessions (admin_id, token_hash, created_at, expires_at)
        VALUES (?, ?, ?, ?)
      `,
      [admin.id, hashToken(token), createdAt, expiresAt]
    );
    await createAuditLog(transactionDb, admin.id, "login", "auth", uid, {});
    await incrementLoginCounter(transactionDb);
  });

  return {
    authenticated: true,
    token,
    uid: admin.uid
  };
}

export async function loginMember(uidValue, passwordValue) {
  const uid = sanitizeText(uidValue);
  const password = sanitizeText(passwordValue);
  if (!uid || !password) {
    throw new HttpError(400, "UID and password are required.");
  }

  const database = await getDb();
  const member = await database.one("SELECT * FROM members WHERE uid = ?", [uid]);
  if (!member || !verifyPassword(password, member.password_salt, member.password_hash)) {
    throw new HttpError(401, "Invalid UID or password.");
  }

  const token = createSessionToken();
  const createdAt = isoNow();
  const expiresAt = sessionExpiryIso();

  await withTransaction(async (transactionDb) => {
    await transactionDb.execute(
      `
        INSERT INTO sessions (member_id, token_hash, created_at, expires_at)
        VALUES (?, ?, ?, ?)
      `,
      [member.id, hashToken(token), createdAt, expiresAt]
    );
    // Audit log for member
    await transactionDb.execute(
      `
        INSERT INTO audit_logs (member_id, action, entity_type, entity_id, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [member.id, "login", "auth", uid, "{}", isoNow()]
    );
    await incrementLoginCounter(transactionDb);
  });

  return {
    authenticated: true,
    token,
    uid: member.uid
  };
}

export async function signupMember(uidValue, passwordValue) {
  const uid = sanitizeText(uidValue);
  const password = sanitizeText(passwordValue);
  if (!uid || !password) {
    throw new HttpError(400, "UID and password are required.");
  }

  const database = await getDb();
  const existing = await database.one("SELECT id FROM members WHERE uid = ?", [uid]);
  if (existing) {
    throw new HttpError(400, "A member with this UID already exists.");
  }

  const passwordRecord = createPasswordRecord(password);
  const token = createSessionToken();
  const createdAt = isoNow();
  const expiresAt = sessionExpiryIso();

  let memberId = null;

  await withTransaction(async (transactionDb) => {
    const result = await transactionDb.execute(
      `
        INSERT INTO members (uid, password_salt, password_hash, created_at)
        VALUES (?, ?, ?, ?)
      `,
      [uid, passwordRecord.saltHex, passwordRecord.passwordHash, createdAt]
    );
    
    memberId = result.lastInsertRowid;

    await transactionDb.execute(
      `
        INSERT INTO sessions (member_id, token_hash, created_at, expires_at)
        VALUES (?, ?, ?, ?)
      `,
      [memberId, hashToken(token), createdAt, expiresAt]
    );

    await transactionDb.execute(
      `
        INSERT INTO audit_logs (member_id, action, entity_type, entity_id, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [memberId, "signup", "auth", uid, "{}", createdAt]
    );
    
    await incrementLoginCounter(transactionDb);
  });

  return {
    authenticated: true,
    token,
    uid
  };
}

export async function logoutAdmin(cookieStore) {
  const token = getSessionToken(cookieStore);
  if (!token) {
    return false;
  }

  const database = await getDb();
  const session = await database.one("SELECT admin_id FROM sessions WHERE token_hash = ?", [
    hashToken(token)
  ]);

  if (!session) {
    return false;
  }

  await withTransaction(async (transactionDb) => {
    await createAuditLog(transactionDb, session.admin_id, "logout", "auth", null, {});
    await transactionDb.execute("DELETE FROM sessions WHERE token_hash = ?", [hashToken(token)]);
  });

  return true;
}
