import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { updateEventStatus } from "@/lib/site";
import { jsonError, parseRouteId, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request, context) {
  try {
    const admin = await requireAdmin(request.cookies);
    const payload = await readJson(request);
    const { id } = await context.params;
    const eventId = parseRouteId(id, "Event id");
    const event = await updateEventStatus(eventId, payload.status, admin.id);
    return NextResponse.json({ event });
  } catch (error) {
    return jsonError(error);
  }
}
