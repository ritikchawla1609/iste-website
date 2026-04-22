"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import LoginModal from "@/components/LoginModal";
import { FIXED_NOTICE_BANNER, PUBLIC_NAV } from "@/lib/ui-constants";
import { apiRequest } from "@/lib/client-api";

export default function PublicShell({
  activePath,
  noticeHref,
  noticeLabel,
  children
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        // Show at the very top
        setHeaderVisible(true);
      } else {
        // Hide when scrolling anywhere else
        setHeaderVisible(false);
        if (currentScrollY > lastScrollY) {
          setMenuOpen(false);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  function handleLogoClick() {
    setLogoClicks(prev => prev + 1);
  }

  async function handleAuthorLoginClick() {
    try {
      const session = await apiRequest("/api/auth/session", { allowUnauthorized: true });
      if (session.authenticated) {
        window.location.href = "/author-dashboard";
        return;
      }
    } catch (error) {
      // Ignore and open the modal below.
    }

    setLoginOpen(true);
  }

  return (
    <>
      <div className="page-shell">
        <header className="site-header" id="home">
          <div className="brand-row">
            <Link className="brand" href="/" aria-label="ISTE Society home" onClick={handleLogoClick}>
              <span className="brand-mark">
                <img src="/brand/iste-logo.jpg" alt="ISTE Chandigarh University logo" />
              </span>
              <span className="brand-copy">
                <small>Indian Society for Technical Education</small>
                <strong>ISTE Student Chapter</strong>
                <span>Chandigarh University</span>
              </span>
            </Link>

            <div className="header-actions">
              <div className="university-mark" aria-label="Chandigarh University">
                <img src="/brand/cu-icon.jpg" alt="Chandigarh University icon" />
              </div>

              <button
                className="nav-toggle"
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
              >
                {menuOpen ? "Close Menu" : "Menu"}
              </button>
            </div>
          </div>
        </header>

        <nav className={`site-nav ${!headerVisible ? "is-hidden" : ""} ${menuOpen ? "is-open" : ""}`.trim()} id="siteNav">
          <div className="nav-container">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={activePath === item.href ? "is-active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {children}

        <footer className="site-footer">
          <div className="footer-container">
            <div className="footer-brand">
              <strong>ISTE Student Chapter</strong>
              <p>
                Advancing technical education and professional development for the students of
                Chandigarh University through innovation and excellence.
              </p>
            </div>
            <div className="footer-links">
              <h4>Quick Access</h4>
              <Link href="/">Home Page</Link>
              <Link href="/about">About Us</Link>
              <Link href="/events">Upcoming Events</Link>
              <Link href="/past-events">Previous Events</Link>
              <Link href="/recruitment">Recruitment</Link>
            </div>
            <div className="footer-links">
              <h4>Community</h4>
              <a href="https://www.cuchd.in" target="_blank" rel="noreferrer">Chandigarh University</a>
              <a href="https://www.isteonline.in" target="_blank" rel="noreferrer">ISTE India</a>
            </div>
            <div className="footer-links">
              <h4>Contact Us</h4>
              <span>📍 Chandigarh University, Mohali</span>
              <a href="mailto:iste@cuchd.in">📧 iste@cuchd.in</a>
              <span>📞 +91 12345 67890</span>
            </div>
            <div className="footer-bottom">
              <div className="footer-bottom-inner">
                <p className="footer-credit">© {new Date().getFullYear()} ISTE CU Student Chapter. All rights reserved.</p>
                {logoClicks >= 3 && (
                  <div className="footer-actions">
                    <button className="footer-login-btn" type="button" onClick={handleAuthorLoginClick}>
                      🔒 Author Access
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
