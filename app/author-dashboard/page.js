import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import AdminShell from "@/components/AdminShell";
import { getCurrentAdmin } from "@/lib/auth";
import { getAdminSummaryData } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AuthorDashboardPage() {
  const cookieStore = await cookies();
  if (!(await getCurrentAdmin(cookieStore))) {
    redirect("/");
  }

  const dashboard = await getAdminSummaryData();

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
        />
      </main>
    </AdminShell>
  );
}
