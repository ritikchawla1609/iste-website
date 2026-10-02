"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <Link href="/dashboard" className="admin-brand">
          <div className="admin-brand-logo-frame">
            <img src="/brand/iste-logo.jpg" alt="ISTE Logo" />
          </div>
          <div className="admin-brand-badge">
            <span className="admin-brand-title">
              ISTE ADMIN
              <span className="admin-brand-tag">PORTAL</span>
            </span>
            <span className="admin-brand-subtitle">Official Management Console</span>
          </div>
        </Link>

        <div className="admin-header-actions">
          {user?.uid && (
            <div className="admin-user-pill" title="Authenticated UID">
              <span className="admin-user-dot" />
              <span>{user.uid}</span>
            </div>
          )}

          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-public-link"
            title="Open public website in a new tab"
          >
            <span>🌐</span> Public Website ↗
          </a>

          <button
            type="button"
            onClick={logout}
            className="btn-logout"
            title="Sign out of the Admin Portal"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
