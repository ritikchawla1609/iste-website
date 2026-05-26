import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { 
  getAdminPastEventsData, 
  createPastEvent, 
  updatePastEvent, 
  deletePastEvent 
} from "@/lib/site";
import { jsonError, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await requireAdmin(request.cookies);
    const data = await getAdminPastEventsData();
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin(request.cookies);
    const payload = await readJson(request);
    const data = await createPastEvent(payload, admin.id);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdmin(request.cookies);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const payload = await readJson(request);
    const data = await updatePastEvent(id, payload, admin.id);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request) {
  try {
    const admin = await requireAdmin(request.cookies);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await deletePastEvent(id, admin.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}