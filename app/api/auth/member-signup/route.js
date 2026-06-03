import { NextResponse } from "next/server";

import { signupMember, setSessionCookie } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { uid, password } = await readJson(request);
    const result = await signupMember(uid, password);

    const response = NextResponse.json({
      success: true,
      uid: result.uid
    });

    setSessionCookie(response, result.token);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
