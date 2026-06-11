import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { RECRUITMENT_TEAMS } from "@/lib/presentation";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireAdmin(request.cookies);
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get("domainId");
    const database = await getDb();

    if (domainId && !RECRUITMENT_TEAMS.some((team) => team.id === domainId)) {
      return NextResponse.json({ error: "Invalid recruitment domain." }, { status: 400 });
    }

    const applications = domainId
      ? await database.many(
          "SELECT * FROM recruitment_applications WHERE domain_id = ? ORDER BY created_at DESC",
          [domainId]
        )
      : await database.many("SELECT * FROM recruitment_applications ORDER BY domain_id ASC, created_at DESC");

    return NextResponse.json({ applications });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request) {
  try {
    await requireAdmin(request.cookies);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: "A valid application ID is required." }, { status: 400 });
    }

    const database = await getDb();
    await database.execute("DELETE FROM recruitment_applications WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
