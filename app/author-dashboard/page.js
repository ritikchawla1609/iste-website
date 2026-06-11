import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import AdminShell from "@/components/AdminShell";
import { getCurrentAdmin } from "@/lib/auth";
import { getDb, getSiteContentRecord } from "@/lib/db";
import { DEFAULT_RECRUITMENT_STATUS } from "@/lib/presentation";
import { getAdminSummaryData } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AuthorDashboardPage() {
  const cookieStore = await cookies();
  if (!(await getCurrentAdmin(cookieStore))) {
    redirect("/");
  }

  const dashboard = await getAdminSummaryData();
  const database = await getDb();
  const domainStatus = {
    ...DEFAULT_RECRUITMENT_STATUS,
    ...(await getSiteContentRecord(database, "recruitment_status", DEFAULT_RECRUITMENT_STATUS))
  };

  return (
    <AdminShell
      activePath="/author-dashboard"
      brandSubtitle="Official Content Management"
      utilityHref="/"
      utilityLabel="Public Website"
      footerHref="/"
      footerLabel="Public Website"
    >
      <main className="portal-main subpage-main">
        <section className="subpage-hero">
          <p className="section-kicker">Author Dashboard</p>
          <h1>Manage official ISTE website content through separate pages.</h1>
          <p>
            Open the required section below to add events, publish recruitment posts, change the
            public notice, or update the About Us content.
          </p>
        </section>

        <AdminDashboardClient
          initialSummary={dashboard.summary}
          initialBackups={dashboard.backups}
          initialRecentActivity={dashboard.recentActivity}
          initialDomainStatus={domainStatus}
        />
      </main>
    </AdminShell>
  );
}
