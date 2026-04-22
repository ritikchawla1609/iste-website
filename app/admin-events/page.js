import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminEventsClient from "@/components/admin/AdminEventsClient";
import AdminShell from "@/components/AdminShell";
import { getCurrentAdmin } from "@/lib/auth";
import { getAdminEventsData } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const cookieStore = await cookies();
  if (!(await getCurrentAdmin(cookieStore))) {
    redirect("/");
  }

  const events = await getAdminEventsData();

  return (
    <AdminShell
      activePath="/admin-events"
      brandSubtitle="Event Management"
      utilityHref="/author-dashboard"
      utilityLabel="Dashboard"
      footerHref="/author-dashboard"
      footerLabel="Dashboard"
    >
      <main className="portal-main subpage-main">
        <section className="subpage-hero">
          <p className="section-kicker">Add Event</p>
          <h1>Create and manage official event notices.</h1>
          <p>
            Publish new event information, save drafts, control published status, and manage all
            event records from this page.
          </p>
        </section>

        <AdminEventsClient initialEvents={events} />
      </main>
    </AdminShell>
  );
}
