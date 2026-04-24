import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { signupMember, setSessionCookie } from "@/lib/auth";
import { HttpError } from "@/lib/http";

export async function POST(request) {
  try {
    const { uid, password } = await request.json();
    const result = await signupMember(uid, password);

    const response = NextResponse.json({
      success: true,
      uid: result.uid
    });

    await setSessionCookie(response, result.token);
    return response;
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Member signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
