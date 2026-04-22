import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { updateEventLink } from "@/lib/site";
import { jsonError, parseRouteId, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request, context) {
  try {
    const admin = await requireAdmin(request.cookies);
    const { link } = await readJson(request);
    const { id } = await context.params;
    const eventId = parseRouteId(id, "Event id");
    const event = await updateEventLink(eventId, link, admin.id);
    return NextResponse.json({ event });
  } catch (error) {
    return jsonError(error);
  }
}
