import { NextResponse } from "next/server";
import { getPublicSiteData } from "@/lib/site";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getPublicSiteData();
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}
