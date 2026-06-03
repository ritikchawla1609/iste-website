import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { deleteEvent, updateEvent } from "@/lib/site";
import { jsonError, parseRouteId, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function PUT(request, context) {
  try {
    const admin = await requireAdmin(request.cookies);
    const payload = await readJson(request);
    const { id } = await context.params;
    const eventId = parseRouteId(id, "Event id");
    const event = await updateEvent(eventId, payload, admin.id);

    revalidatePath("/events");
    revalidatePath("/");

    return NextResponse.json({ event });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request, context) {
  try {
    const admin = await requireAdmin(request.cookies);
    const { id } = await context.params;
    const eventId = parseRouteId(id, "Event id");
    await deleteEvent(eventId, admin.id);

    revalidatePath("/events");
    revalidatePath("/");

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
