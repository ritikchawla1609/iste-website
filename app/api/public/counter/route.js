import { NextResponse } from "next/server";

import { getDb, getSiteContentRecord } from "@/lib/db";

export async function GET() {
  try {
    const database = await getDb();
    const counter = await getSiteContentRecord(database, "login_counter", { count: 500 });
    return NextResponse.json(counter);
  } catch (error) {
    console.error("Counter fetch error:", error);
    return NextResponse.json({ count: 500 }, { status: 500 });
  }
}
