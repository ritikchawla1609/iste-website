"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import LoginModal from "@/components/LoginModal";
import MemberLoginModal from "@/components/MemberLoginModal";
import { FIXED_NOTICE_BANNER, PUBLIC_NAV } from "@/lib/ui-constants";
import { apiRequest } from "@/lib/client-api";

export default function PublicShell({
  activePath,
  children
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [memberLoginOpen, setMemberLoginOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    const shouldSkipMotion =
      window.matchMedia("(max-width: 1100px), (hover: none), (prefers-reduced-motion: reduce)").matches;
    if (shouldSkipMotion) return;

    const cardSelector =
      ".focus-feature-card, .team-member-card, .content-sheet:not(.recruitment-benefits-sheet), .whats-new-hero-card, .award-photo-card, .timeline-info, .timeline-poster, .about-main-card, .focus-card, .past-event-card";
    let activeCard = null;
    let frameId = 0;
    let pointerEvent = null;

    const handleMouseMove = (e) => {
      const card = e.target.closest(cardSelector);
      if (!card) return;
      pointerEvent = e;

      if (activeCard && activeCard !== card) {
        resetCard(activeCard);
      }
      activeCard = card;
      activeCard.classList.add("is-tilting");

      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        if (!activeCard || !pointerEvent) return;

        const rect = activeCard.getBoundingClientRect();
        const x = pointerEvent.clientX - rect.left;
        const y = pointerEvent.clientY - rect.top;

        const px = x / rect.width - 0.5;
        const py = y / rect.height - 0.5;

        let maxTilt = 5;
        if (activeCard.classList.contains("about-main-card") || activeCard.classList.contains("recruitment-hero-card")) {
          maxTilt = 2;
        } else if (activeCard.classList.contains("timeline-info") || activeCard.classList.contains("content-sheet")) {
          maxTilt = 3;
        }

        const rx = -py * maxTilt;
        const ry = px * maxTilt;

        activeCard.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
        activeCard.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
        activeCard.style.setProperty("--gx", `${((x / rect.width) * 100).toFixed(1)}%`);
        activeCard.style.setProperty("--gy", `${((y / rect.height) * 100).toFixed(1)}%`);
      });
    };

    function resetCard(card) {
      card.classList.remove("is-tilting");
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
      card.style.removeProperty("--gx");
      card.style.removeProperty("--gy");
    }

    const handleMouseOut = (e) => {
      const card = e.target.closest(cardSelector);
      if (!card) return;

      if (!card.contains(e.relatedTarget)) {
        resetCard(card);
        if (activeCard === card) activeCard = null;
      }
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

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
    } catch (error) {}
    setLoginOpen(true);
  }

  return (
    <>
      <div className="page-shell">
        <header className="site-header" id="home">
          <div className="notice-strip" aria-label="Chapter notice and contact links">
            <div className="notice-strip-track">
              <span className="notice-label">Notice</span>
              <strong>{FIXED_NOTICE_BANNER}</strong>
            </div>
            <div className="notice-strip-links">
              <a href="mailto:iste@cumail.in">Email Support</a>
              <a href="https://www.instagram.com/iste_cusc?igsh=MWc2cHE2cGc1N3AwOA==" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.linkedin.com/company/iste-student-chapter-chandigarh-university/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>

          <div className="brand-row">
            <Link className="brand" href="/" aria-label="ISTE Society home" onClick={handleLogoClick}>
              <span className="brand-mark">
                <img src="/brand/iste-logo.jpg" alt="ISTE logo" />
              </span>
              <span className="brand-copy">
                <strong>ISTE Student Chapter</strong>
                <small><span>Chandigarh</span> University</small>
              </span>
            </Link>

            <div className="header-actions">
              <nav className="header-nav" aria-label="Main navigation">
                {PUBLIC_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${activePath === item.href ? "is-active" : ""}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
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

          <nav className={`site-nav-row mobile-only ${menuOpen ? "is-open" : ""}`.trim()} id="siteNav" aria-label="Mobile navigation">
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
        </header>

        {children}


        <footer className="site-footer">
          <div className="footer-container">
            <div className="footer-brand-column">
              <div className="footer-brand-header">
                <img src="/brand/iste-logo.jpg" alt="ISTE Logo" className="footer-logo" />
                <div className="footer-brand-text">
                  <strong>ISTE SOCIETY</strong>
                  <span>STUDENT CHAPTER</span>
                </div>
              </div>
              <p className="footer-brand-desc">
                Leading the way in technical education. Bridging the gap between 
                curriculum and industry requirements through innovation.
              </p>
              <div className="footer-social-icons">
                <a href="#" className="social-tile">𝕏</a>
                <a href="mailto:iste@cumail.in" className="social-tile">G</a>
                <a href="https://www.instagram.com/iste_cusc?igsh=MWc2cHE2cGc1N3AwOA==" target="_blank" rel="noopener noreferrer" className="social-tile">IG</a>
                <a href="https://www.linkedin.com/company/iste-student-chapter-chandigarh-university/" target="_blank" rel="noopener noreferrer" className="social-tile">in</a>
              </div>
            </div>
            
            <div className="footer-links-column">
              <h4 className="footer-heading">Quick Links</h4>
              <nav className="footer-nav-list">
                <Link href="/">Home</Link>
                <Link href="/about">About Us</Link>
                <Link href="/events">Upcoming Events</Link>
                <Link href="/recruitment">Join Us</Link>
              </nav>
            </div>

            <div className="footer-links-column">
              <h4 className="footer-heading">More</h4>
              <nav className="footer-nav-list">
                <Link href="/past-events">Previous Events</Link>
                <Link href="#">FAQs</Link>
                <Link href="/team">Team Members</Link>
              </nav>
            </div>

            <div className="footer-contact-column">
              <h4 className="footer-heading">Get in Touch</h4>
              <div className="contact-info-list">
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <span>Chandigarh University, Mohali</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span>iste@cumail.in</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span>ISTE Student Chapter</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-inner">
              <p className="footer-copyright">
                © {new Date().getFullYear()} <span>ISTE SOCIETY</span>. All rights reserved.
              </p>
              {logoClicks >= 3 && (
                <button className="footer-login-btn" type="button" onClick={handleAuthorLoginClick}>
                  Author Access
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <MemberLoginModal open={memberLoginOpen} onClose={() => setMemberLoginOpen(false)} />
    </>
  );
}
