import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { updateAboutContent } from "@/lib/site";
import { jsonError, readJson } from "@/lib/http";

export const runtime = "nodejs";

export async function PUT(request) {
  try {
    const admin = await requireAdmin(request.cookies);
    const payload = await readJson(request);
    const about = await updateAboutContent(payload, admin.id);

    revalidatePath("/about");
    revalidatePath("/");

    return NextResponse.json({ about });
  } catch (error) {
    return jsonError(error);
  }
}
