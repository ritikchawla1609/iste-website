import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { updatePastEventsHero, getPastEventsHero } from "@/lib/site";
import { jsonError, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireAdmin(request.cookies);
    const data = await getPastEventsHero();
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdmin(request.cookies);
    const payload = await readJson(request);
    const data = await updatePastEventsHero(payload, admin.id);

    revalidatePath("/past-events");

    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}
