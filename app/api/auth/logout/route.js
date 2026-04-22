import { NextResponse } from "next/server";

import { clearSessionCookie, logoutAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    await logoutAdmin(request.cookies);
    const response = NextResponse.json({ authenticated: false });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
