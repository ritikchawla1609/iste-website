import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminNoticeClient from "@/components/admin/AdminNoticeClient";
import AdminShell from "@/components/AdminShell";
import { getCurrentAdmin } from "@/lib/auth";
import { getPublicSiteData } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminNoticePage() {
  const cookieStore = await cookies();
  if (!(await getCurrentAdmin(cookieStore))) {
    redirect("/");
  }

  const { notice } = await getPublicSiteData();

  return (
    <AdminShell
      activePath="/admin-notice"
      brandSubtitle="Homepage Update Management"
      utilityHref="/author-dashboard"
      utilityLabel="Dashboard"
      footerHref="/author-dashboard"
      footerLabel="Dashboard"
    >
      <main className="portal-main subpage-main">
        <section className="subpage-hero">
          <p className="section-kicker">Whats New</p>
          <h1>Update the homepage whats new message.</h1>
          <p>
            Changes made here are reflected in the homepage whats new panel only. The top strip
            remains fixed for a more formal official website presentation.
          </p>
        </section>

        <AdminNoticeClient initialNotice={notice} />
      </main>
    </AdminShell>
  );
}
