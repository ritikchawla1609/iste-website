"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import LogoutButton from "@/components/LogoutButton";
import { ADMIN_NAV, FIXED_NOTICE_BANNER } from "@/lib/ui-constants";

export default function AdminShell({
  activePath,
  brandSubtitle,
  utilityHref,
  utilityLabel,
  footerHref,
  footerLabel,
  children
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="page-shell">
        <header className="site-header">
          <div className="brand-row">
            <Link className="brand" href="/author-dashboard" aria-label="Author dashboard home">
              <span className="brand-mark">
                <img src="/brand/iste-logo.jpg" alt="ISTE Logo" />
              </span>
              <span className="brand-copy">
                <small>Indian Society for Technical Education</small>
                <strong>ISTE Author Panel</strong>
                <span>{brandSubtitle}</span>
              </span>
            </Link>

            <div className="header-actions header-actions-admin">
              <Link className="utility-link" href={utilityHref}>
                <span className="btn-icon">📊</span> {utilityLabel}
              </Link>
              <LogoutButton />
            </div>
          </div>
        </header>

        <nav className="site-nav" style={{ marginBottom: '0', borderRadius: '12px 12px 0 0', borderBottom: '0' }}>
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={activePath === item.href ? "is-active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {children}

        <footer className="site-footer">
          <div className="footer-container">
            <div className="footer-brand">
              <strong>ISTE Author Panel</strong>
              <p>
                Professional content management system for the official ISTE Student Chapter website
                at Chandigarh University.
              </p>
            </div>
            <div className="footer-links">
              <h4>Management</h4>
              {ADMIN_NAV.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
            </div>
            <div className="footer-links">
              <h4>Public View</h4>
              <Link href="/">Homepage</Link>
              <Link href="/about">About Us</Link>
              <Link href="/past-events">Previous Events</Link>
            </div>
            <div className="footer-links">
              <h4>Help & Support</h4>
              <a href="mailto:admin@iste.org">📧 Admin Support</a>
              <span>Documentation</span>
            </div>
            <div className="footer-bottom">
              <div className="footer-bottom-inner">
                <p className="footer-credit">© {new Date().getFullYear()} ISTE Author Dashboard. Authorized Access Only.</p>
                <div className="footer-actions">
                  <Link className="footer-login-btn" href={footerHref}>
                    🌐 {footerLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
