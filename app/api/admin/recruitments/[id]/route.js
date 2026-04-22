import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { deleteRecruitment, updateRecruitment } from "@/lib/site";
import { jsonError, parseRouteId, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function PUT(request, context) {
  try {
    const admin = await requireAdmin(request.cookies);
    const payload = await readJson(request);
    const { id } = await context.params;
    const recruitmentId = parseRouteId(id, "Recruitment id");
    const recruitment = await updateRecruitment(recruitmentId, payload, admin.id);
    return NextResponse.json({ recruitment });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request, context) {
  try {
    const admin = await requireAdmin(request.cookies);
    const { id } = await context.params;
    const recruitmentId = parseRouteId(id, "Recruitment id");
    await deleteRecruitment(recruitmentId, admin.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
