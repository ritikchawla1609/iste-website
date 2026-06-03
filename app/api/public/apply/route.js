import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";
import { jsonError, readJson } from "@/lib/http";
import { isoNow } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const payload = await readJson(request);
    const { type, entity_id, name, email, phone, team_name, team_members, details } = payload;

    if (!type || !entity_id || !name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["event", "recruitment"].includes(type)) {
      return NextResponse.json({ error: "Invalid application type" }, { status: 400 });
    }

    const database = await getDb();
    
    // Verify entity exists and is published
    const table = type === "event" ? "events" : "recruitments";
    const entity = await database.one(`SELECT id FROM ${table} WHERE id = ? AND status = 'published'`, [entity_id]);
    
    if (!entity) {
      return NextResponse.json({ error: `${type} not found or not active` }, { status: 404 });
    }

    await database.execute(
      `
        INSERT INTO applications (type, entity_id, name, email, phone, team_name, team_members, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [type, entity_id, name, email, phone, team_name || null, team_members || null, details || null, isoNow()]
    );

    return NextResponse.json({ success: true, message: "Application submitted successfully!" });
  } catch (error) {
    return jsonError(error);
  }
}
