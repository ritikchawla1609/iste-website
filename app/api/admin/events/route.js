import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { createEvent, getAdminEventsData } from "@/lib/site";
import { jsonError, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireAdmin(request.cookies);
    return NextResponse.json({ events: await getAdminEventsData() });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin(request.cookies);
    const payload = await readJson(request);
    const event = await createEvent(payload, admin.id);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
