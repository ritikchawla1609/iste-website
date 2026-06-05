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

  const [loginOpen, setLoginOpen] = useState(false);
  const [memberLoginOpen, setMemberLoginOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [latestEventNotice, setLatestEventNotice] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    async function fetchNotice() {
      try {
        const res = await fetch("/api/public/site-data");
        const data = await res.json();
        if (data && data.events && data.events.length > 0) {
          const now = new Date();
          const upcoming = data.events.find(e => {
            const evDate = new Date(`${e.eventDate}T${e.startTime || '00:00'}:00`);
            return evDate >= now;
          }) || data.events[0];
          
          if (upcoming) {
            const eventDateFormatted = new Date(upcoming.eventDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            setLatestEventNotice(`${upcoming.name} on ${eventDateFormatted} at ${upcoming.venue}!`);
          }
        }
      } catch (err) {
        console.error("Failed to load site data in shell:", err);
      }
    }
    fetchNotice();
  }, []);

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

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollPercentage((window.scrollY / totalHeight) * 100);
      }
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollPercentage}%` }} />
      </div>

      <div className="page-shell">
        <header className="site-header" id="home">
          <div className="notice-strip" aria-label="Chapter notice and contact links">
            <div className="notice-strip-track">
              {latestEventNotice ? (
                <div className="notice-flow-container">
                  <Link href="/events" className="notice-flow-link">
                    <strong>{latestEventNotice}</strong>
                  </Link>
                </div>
              ) : (
                <strong>{FIXED_NOTICE_BANNER}</strong>
              )}
            </div>
            <div className="notice-strip-links">
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=iste.cusc@gmail.com" target="_blank" rel="noopener noreferrer">Email Support</a>
              <a href="https://www.instagram.com/iste_cusc?igsh=MWc2cHE2cGc1N3AwOA==" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.linkedin.com/company/iste-student-chapter-chandigarh-university/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>

          <div className="brand-row">
            <Link className="brand" href="/" aria-label="ISTE Society home" onClick={handleLogoClick}>
              <span className="brand-mark">
                <span className="brand-logo-frame">
                  <img src="/brand/iste-logo.jpg" alt="ISTE logo" />
                  <span className="brand-red-boundary" aria-hidden="true" />
                </span>
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
              <Link
                href="/menu"
                className="nav-toggle"
              >
                Menu
              </Link>
            </div>
          </div>
        </header>

        {children}

        <footer className="site-footer">
          <div className="footer-row-container">
            <div className="footer-copyright-slot">
              <p className="footer-copyright">
                © 2026 <span>ISTE Student Chapter</span>. All rights reserved.
              </p>
            </div>
            <div className="footer-author-slot">
              {logoClicks >= 3 && (
                <button className="footer-login-btn" type="button" onClick={handleAuthorLoginClick}>
                  Author Access
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Back to Top Button */}
      <button
        className={`back-to-top-btn ${showScrollTop ? "is-visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
      </button>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <MemberLoginModal open={memberLoginOpen} onClose={() => setMemberLoginOpen(false)} />
    </>
  );
}
