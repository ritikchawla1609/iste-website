import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { createBackup } from "@/lib/site";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const admin = await requireAdmin(request.cookies);
    const backup = await createBackup(admin.id);
    return NextResponse.json({ backup }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
