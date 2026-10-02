"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "./AdminHeader";
import AdminNav from "./AdminNav";
import AdminFooter from "./AdminFooter";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdminShell({ children, kicker, title, description, actions }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="admin-shell" style={{ justifyContent: "center" }}>
        <LoadingSpinner message="Verifying administrative session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="admin-shell">
      <AdminHeader />
      <AdminNav />
      <main className="admin-main">
        {(kicker || title || description || actions) && (
          <div className="page-heading">
            <div>
              {kicker && <p className="page-kicker">{kicker}</p>}
              {title && <h1 className="page-title">{title}</h1>}
              {description && <p className="page-description">{description}</p>}
            </div>
            {actions && <div className="page-actions">{actions}</div>}
          </div>
        )}
        {children}
      </main>
      <AdminFooter />
    </div>
  );
}
