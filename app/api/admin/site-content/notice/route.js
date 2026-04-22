import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { updateNoticeContent } from "@/lib/site";
import { jsonError, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function PUT(request) {
  try {
    const admin = await requireAdmin(request.cookies);
    const payload = await readJson(request);
    const notice = await updateNoticeContent(payload, admin.id);
    return NextResponse.json({ notice });
  } catch (error) {
    return jsonError(error);
  }
}
