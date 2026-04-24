"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import LoginModal from "@/components/LoginModal";
import MemberLoginModal from "@/components/MemberLoginModal";
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
  const [memberLoginOpen, setMemberLoginOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setHeaderVisible(true);
      } else {
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
    } catch (error) {}
    setLoginOpen(true);
  }

  return (
    <>
      <div className="page-shell">
        <header className={`site-header ${!headerVisible ? "is-hidden" : ""}`.trim()} id="home">
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
              <div className="university-affiliation" style={{ display: 'flex', alignItems: 'center', marginRight: '24px' }}>
                <img 
                  src="/brand/cu-logo.png" 
                  alt="Chandigarh University Logo" 
                  style={{ height: '50px', width: 'auto', objectFit: 'contain' }} 
                />
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

          <nav className={`site-nav-row ${menuOpen ? "is-open" : ""}`.trim()} id="siteNav">
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
                <a href="mailto:official@istecu.org" className="social-tile">G</a>
                <a href="https://www.instagram.com/iste_cusc/?hl=en" target="_blank" rel="noopener noreferrer" className="social-tile">IG</a>
                <a href="https://www.linkedin.com/company/iste-student-chapter-chandigarh-university/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="social-tile">in</a>
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
                  <span>official@istecu.org</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span>+91 98765 43210</span>
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
