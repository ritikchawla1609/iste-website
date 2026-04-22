import { redirect } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import AdminPastEventsClient from "@/components/admin/AdminPastEventsClient";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Past Events | ISTE Author Panel"
};

export default async function AdminPastEventsPage() {
  try {
    await verifySession();
  } catch (error) {
    redirect("/");
  }

  return (
    <AdminShell
      activePath="/admin-past-events"
      brandSubtitle="History Management"
      utilityHref="/author-dashboard"
      utilityLabel="Back to Dashboard"
      footerHref="/"
      footerLabel="Public Website"
    >
      <main className="portal-main">
        <section className="admin-panel">
          <header className="admin-heading">
            <h2>Manage Previous Events</h2>
          </header>

          <AdminPastEventsClient />
        </section>
      </main>
    </AdminShell>
  );
}
