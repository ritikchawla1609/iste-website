import { NextResponse } from "next/server";

import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  const admin = await getCurrentAdmin(request.cookies);
  return NextResponse.json({
    authenticated: Boolean(admin),
    uid: admin?.uid || null
  });
}
