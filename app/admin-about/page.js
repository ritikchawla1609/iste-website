import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminAboutClient from "@/components/admin/AdminAboutClient";
import AdminShell from "@/components/AdminShell";
import { getCurrentAdmin } from "@/lib/auth";
import { getPublicSiteData } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const cookieStore = await cookies();
  if (!(await getCurrentAdmin(cookieStore))) {
    redirect("/");
  }

  const { about } = await getPublicSiteData();

  return (
    <AdminShell
      activePath="/admin-about"
      brandSubtitle="About Us Management"
      utilityHref="/author-dashboard"
      utilityLabel="Dashboard"
      footerHref="/author-dashboard"
      footerLabel="Dashboard"
    >
      <main className="portal-main subpage-main">
        <section className="subpage-hero">
          <p className="section-kicker">About Us</p>
          <h1>Edit the dedicated About Us page content.</h1>
          <p>
            This page controls the separate About Us section of the website without changing the
            public homepage structure.
          </p>
        </section>

        <AdminAboutClient initialAbout={about} />
      </main>
    </AdminShell>
  );
}
