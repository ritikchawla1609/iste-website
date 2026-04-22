import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { restoreBackup } from "@/lib/site";
import { jsonError, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const admin = await requireAdmin(request.cookies);
    const payload = await readJson(request);
    const result = await restoreBackup(payload.backupName, admin.uid, admin.token);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
