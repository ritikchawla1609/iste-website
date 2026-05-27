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
          <p className="section-kicker">What's New</p>
          <h1>Update the homepage What's New message.</h1>
          <p>
            Changes made here are reflected in the homepage What's New panel only.
          </p>
        </section>

        <AdminNoticeClient initialNotice={notice} />
      </main>
    </AdminShell>
  );
}
