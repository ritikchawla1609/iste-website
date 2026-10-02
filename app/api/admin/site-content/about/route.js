import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { updateAboutContent } from "@/lib/site";
import { getDb, getSiteContentRecord } from "@/lib/db";
import { DEFAULT_ABOUT } from "@/lib/default-content";
import { normalizeAbout } from "@/lib/presentation";
import { jsonError, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireAdmin(request);
    const database = await getDb();
    const about = await getSiteContentRecord(database, "about", DEFAULT_ABOUT);
    return NextResponse.json({ about: normalizeAbout(about) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdmin(request);
    const payload = await readJson(request);
    const about = await updateAboutContent(payload, admin.id);

    revalidatePath("/about");
    revalidatePath("/");

    return NextResponse.json({ about });
  } catch (error) {
    return jsonError(error);
  }
}

