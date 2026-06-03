import { NextResponse } from "next/server";

import { getCurrentAdmin, getCurrentMember } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request) {
  const admin = await getCurrentAdmin(request.cookies);
  if (admin) {
    return NextResponse.json({
      authenticated: true,
      uid: admin.uid,
      role: "admin"
    });
  }

  const member = await getCurrentMember(request.cookies);
  if (member) {
    return NextResponse.json({
      authenticated: true,
      uid: member.uid,
      role: "member"
    });
  }

  return NextResponse.json({
    authenticated: false,
    uid: null,
    role: null
  });
}
