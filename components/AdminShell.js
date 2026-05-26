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
                <strong>ISTE AUTHOR PANEL</strong>
                <span>{brandSubtitle}</span>
              </span>
            </Link>

            <div className="header-actions header-actions-admin">
              <Link className="public-link" href={utilityHref} style={{ marginRight: '16px' }}>
                {utilityLabel}
              </Link>
              <LogoutButton />
            </div>
          </div>

          <nav className="site-nav-row">
            <div className="nav-container">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={activePath === item.href ? "is-active" : ""}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        {children}

        <footer className="site-footer">
          <div className="footer-container">
            <div className="footer-brand">
              <div className="footer-brand-header">
                <img src="/brand/iste-logo.jpg" alt="ISTE Logo" className="footer-logo" />
                <strong style={{ color: 'var(--brand-red)' }}>ISTE AUTHOR PANEL</strong>
              </div>
              <span className="brand-tagline">OFFICIAL MANAGEMENT</span>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '20px' }}>
                Professional content management system for the official ISTE Student Chapter website.
              </p>
            </div>
            
            <div className="footer-links">
              <h4 style={{ color: 'var(--brand-red)' }}>Shortcuts</h4>
              <div className="footer-links-grid">
                <Link href="/author-dashboard" style={{ color: '#94a3b8' }}>Dashboard</Link>
                <Link href="/" style={{ color: '#94a3b8' }}>Public Site</Link>
                <a href="mailto:iste@cuchd.in" style={{ color: '#94a3b8' }}>Support</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-inner">
              <p className="footer-credit" style={{ color: '#64748b' }}>
                © {new Date().getFullYear()} <span style={{ color: 'var(--brand-red)' }}>ISTE SOCIETY</span> Authorized Access Only.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
