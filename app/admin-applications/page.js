import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminApplicationsClient from "@/components/admin/AdminApplicationsClient";
import AdminShell from "@/components/AdminShell";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Applications | ISTE Author Panel"
};

export default async function AdminApplicationsPage() {
  try {
    await verifySession();
  } catch (error) {
    redirect("/");
  }

  return (
    <AdminShell
      activePath="/admin-applications"
      brandSubtitle="Application Management"
      utilityHref="/author-dashboard"
      utilityLabel="Back to Dashboard"
      footerHref="/"
      footerLabel="Public Website"
    >
      <main className="portal-main">
        <section className="admin-panel">
          <header className="admin-heading">
            <h2>User Applications</h2>
          </header>

          <AdminApplicationsClient />
        </section>
      </main>
    </AdminShell>
  );
}
