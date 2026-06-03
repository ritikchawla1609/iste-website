import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminLinksClient from "@/components/admin/AdminLinksClient";
import AdminShell from "@/components/AdminShell";
import { getCurrentAdmin } from "@/lib/auth";
import { getAdminEventsData, getAdminRecruitmentsData } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminLinksPage() {
  const cookieStore = await cookies();
  if (!(await getCurrentAdmin(cookieStore))) {
    redirect("/");
  }

  const events = await getAdminEventsData();
  const recruitments = await getAdminRecruitmentsData();

  return (
    <AdminShell
      activePath="/admin-links"
      brandSubtitle="Link Management"
      utilityHref="/author-dashboard"
      utilityLabel="Dashboard"
      footerHref="/author-dashboard"
      footerLabel="Dashboard"
    >
      <main className="portal-main subpage-main">
        <section className="subpage-hero">
          <p className="section-kicker">Link Adder</p>
          <h1>Manage registration and application links.</h1>
          <p>
            Easily update Google Form links for events and recruitment posts without editing the
            entire record.
          </p>
        </section>

        <AdminLinksClient initialEvents={events} initialRecruitments={recruitments} />
      </main>
    </AdminShell>
  );
}
