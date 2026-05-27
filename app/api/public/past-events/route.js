import { NextResponse } from "next/server";
import { getPublicPastEvents } from "@/lib/site";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getPublicPastEvents();
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}
