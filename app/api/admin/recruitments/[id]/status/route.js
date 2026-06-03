import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { updateRecruitmentStatus } from "@/lib/site";
import { jsonError, parseRouteId, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request, context) {
  try {
    const admin = await requireAdmin(request.cookies);
    const payload = await readJson(request);
    const { id } = await context.params;
    const recruitmentId = parseRouteId(id, "Recruitment id");
    const recruitment = await updateRecruitmentStatus(recruitmentId, payload.status, admin.id);

    revalidatePath("/recruitment");
    revalidatePath("/");

    return NextResponse.json({ recruitment });
  } catch (error) {
    return jsonError(error);
  }
}
