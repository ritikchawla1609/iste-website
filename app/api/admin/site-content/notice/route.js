import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { updateNoticeContent } from "@/lib/site";
import { getDb, getSiteContentRecord } from "@/lib/db";
import { DEFAULT_NOTICE } from "@/lib/default-content";
import { normalizeNotice } from "@/lib/presentation";
import { jsonError, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireAdmin(request);
    const database = await getDb();
    const notice = await getSiteContentRecord(database, "notice", DEFAULT_NOTICE);
    return NextResponse.json({ notice: normalizeNotice(notice) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdmin(request);
    const payload = await readJson(request);
    const notice = await updateNoticeContent(payload, admin.id);

    revalidatePath("/");

    return NextResponse.json({ notice });
  } catch (error) {
    return jsonError(error);
  }
}

