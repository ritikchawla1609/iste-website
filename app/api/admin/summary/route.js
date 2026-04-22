import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { getAdminSummaryData } from "@/lib/site";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireAdmin(request.cookies);
    return NextResponse.json(await getAdminSummaryData());
  } catch (error) {
    return jsonError(error);
  }
}
