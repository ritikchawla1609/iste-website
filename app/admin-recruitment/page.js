import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminRecruitmentClient from "@/components/admin/AdminRecruitmentClient";
import AdminShell from "@/components/AdminShell";
import { getCurrentAdmin } from "@/lib/auth";
import { getAdminRecruitmentsData } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminRecruitmentPage() {
  const cookieStore = await cookies();
  if (!(await getCurrentAdmin(cookieStore))) {
    redirect("/");
  }

  const recruitments = await getAdminRecruitmentsData();

  return (
    <AdminShell
      activePath="/admin-recruitment"
      brandSubtitle="Recruitment Management"
      utilityHref="/author-dashboard"
      utilityLabel="Dashboard"
      footerHref="/author-dashboard"
      footerLabel="Dashboard"
    >
      <main className="portal-main subpage-main">
        <section className="subpage-hero">
          <p className="section-kicker">Recruitment</p>
          <h1>Publish and manage recruitment opportunities.</h1>
          <p>
            Use this separate page to add recruitment notices, keep drafts, control publish
            status, and manage official postings.
          </p>
        </section>

        <AdminRecruitmentClient initialRecruitments={recruitments} />
      </main>
    </AdminShell>
  );
}
