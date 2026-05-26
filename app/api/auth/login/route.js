import { NextResponse } from "next/server";

import { loginAdmin, setSessionCookie } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const payload = await readJson(request);
    const result = await loginAdmin(payload.uid, payload.password);
    const response = NextResponse.json({
      authenticated: true,
      uid: result.uid
    });
    setSessionCookie(response, result.token);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
