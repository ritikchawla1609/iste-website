import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { getDb, getSiteContentRecord, setSiteContentRecord, createAuditLog } from "@/lib/db";
import { jsonError, readJson } from "@/lib/http";
import { DEFAULT_RECRUITMENT_STATUS } from "@/lib/presentation";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireAdmin(request.cookies);
    const database = await getDb();
    const domainStatus = await getSiteContentRecord(database, "recruitment_status", DEFAULT_RECRUITMENT_STATUS);
    return NextResponse.json({ domainStatus });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdmin(request.cookies);
    const payload = await readJson(request);
    const { domainStatus } = payload;

    if (!domainStatus || typeof domainStatus !== "object") {
      return NextResponse.json({ error: "Invalid status payload" }, { status: 400 });
    }

    const database = await getDb();
    await setSiteContentRecord(database, "recruitment_status", domainStatus);
    await createAuditLog(database, admin.id, "update", "site_content", "recruitment_status", domainStatus);

    revalidatePath("/recruitment");
    revalidatePath("/");

    return NextResponse.json({ domainStatus });
  } catch (error) {
    return jsonError(error);
  }
}
