import { NextResponse } from "next/server";

import { getDb, getSiteContentRecord } from "@/lib/db";
import { jsonError, readJson } from "@/lib/http";
import { DEFAULT_RECRUITMENT_STATUS, RECRUITMENT_TEAMS } from "@/lib/presentation";
import { isoNow } from "@/lib/security";
import { sanitizeText, validateEmail, validateUrl } from "@/lib/validation";

export const runtime = "nodejs";

const UID_RE = /^\d{2}[A-Z]{2,6}\d{4,8}$/;

export async function POST(request) {
  try {
    const payload = await readJson(request);
    const domainId = sanitizeText(payload.domainId);
    const domain = RECRUITMENT_TEAMS.find((team) => team.id === domainId);

    if (!domain) {
      return NextResponse.json({ error: "Please select a valid recruitment domain." }, { status: 400 });
    }

    const database = await getDb();
    const domainStatus = {
      ...DEFAULT_RECRUITMENT_STATUS,
      ...(await getSiteContentRecord(database, "recruitment_status", DEFAULT_RECRUITMENT_STATUS))
    };
    if (domainStatus[domainId] !== "active") {
      return NextResponse.json({ error: `${domain.name} recruitment is currently closed.` }, { status: 409 });
    }

    const name = sanitizeText(payload.name);
    const contact = sanitizeText(payload.contact);
    const outlookEmail = validateEmail(payload.outlookEmail);
    const personalEmail = validateEmail(payload.personalEmail);
    const resumeLink = validateUrl(payload.resumeLink, "Resume link");
    const motivation = sanitizeText(payload.motivation);
    const gender = sanitizeText(payload.gender);
    const uid = sanitizeText(payload.uid).toUpperCase();
    const yearOfStudy = sanitizeText(payload.yearOfStudy);
    const course = sanitizeText(payload.course);
    const department = sanitizeText(payload.department);

    if (!name || !contact || !motivation || !gender || !yearOfStudy || !course || !department) {
      return NextResponse.json({ error: "All recruitment form fields are required." }, { status: 400 });
    }
    if (!/^\+?[0-9\s-]{8,15}$/.test(contact)) {
      return NextResponse.json({ error: "Please enter a valid contact number." }, { status: 400 });
    }
    if (!UID_RE.test(uid)) {
      return NextResponse.json({ error: "UID must look like a university roll number, for example 24BCS11235." }, { status: 400 });
    }

    await database.execute(
      `
        INSERT INTO recruitment_applications (
          domain_id, domain_name, name, contact, outlook_email, personal_email,
          resume_link, motivation, gender, uid, year_of_study, course, department, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [domain.id, domain.name, name, contact, outlookEmail, personalEmail, resumeLink, motivation, gender, uid, yearOfStudy, course, department, isoNow()]
    );

    return NextResponse.json({ success: true, message: `Your ${domain.name} application has been submitted.` });
  } catch (error) {
    return jsonError(error);
  }
}
