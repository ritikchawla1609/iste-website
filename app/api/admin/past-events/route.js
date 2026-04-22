import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
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
    await verifySession(request);
    const data = await getAdminPastEventsData();
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    const session = await verifySession(request);
    const payload = await readJson(request);
    const data = await createPastEvent(payload, session.admin_id);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request) {
  try {
    const session = await verifySession(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const payload = await readJson(request);
    const data = await updatePastEvent(id, payload, session.admin_id);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request) {
  try {
    const session = await verifySession(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    await deletePastEvent(id, session.admin_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
