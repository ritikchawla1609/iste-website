import { NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await verifySession(request);
    const database = await getDb();
    
    const applications = await database.many(`
      SELECT 
        a.*,
        CASE 
          WHEN a.type = 'event' THEN e.name 
          WHEN a.type = 'recruitment' THEN r.title 
        END as entity_title
      FROM applications a
      LEFT JOIN events e ON a.type = 'event' AND a.entity_id = e.id
      LEFT JOIN recruitments r ON a.type = 'recruitment' AND a.entity_id = r.id
      ORDER BY a.created_at DESC
    `);

    return NextResponse.json(applications);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request) {
  try {
    await verifySession(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing application ID" }, { status: 400 });
    }

    const database = await getDb();
    await database.execute("DELETE FROM applications WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
