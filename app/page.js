import Link from "next/link";

import PublicShell from "@/components/PublicShell";
import FeaturedEventSection from "@/components/FeaturedEventSection";
import { sortByDate, toComparableDate } from "@/lib/presentation";
import { getPublicSiteData } from "@/lib/site";

export const revalidate = 60;

function getFeaturedEvent(events) {
  const now = new Date();
  const sortedEvents = sortByDate(events, "eventDate", "startTime");
  return (
    sortedEvents.find((event) => toComparableDate(event.eventDate, event.startTime) >= now) ||
    sortedEvents[0] ||
    null
  );
}

export default async function HomePage() {
  const { about, events } = await getPublicSiteData();
  const featuredEvent = getFeaturedEvent(events);

  return (
    <PublicShell activePath="/">
      <main className="portal-main">
        {/* SECTION 1: HERO GRID */}
        <section className="portal-notice-banner home-hero-grid">
          {/* Left Column: Modern Sleek Hero Introduction */}
          <div className="intro-copy">
            <h3 className="section-kicker-heading">Innovation Starts Here</h3>
            <h1 className="hero-title">
              Build, lead, and innovate with the <span className="hero-accent">ISTE Student Chapter</span>.
            </h1>
            <p className="hero-desc">
              A professional student society dedicated to technical excellence, industry exposure,
              leadership development, and meaningful innovation beyond the classroom.
            </p>

            {/* Premium CTA Buttons */}
            <div className="hero-cta-group">
              <Link href="/events" className="hero-cta-primary">
                <svg className="cta-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline-block' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Explore Events
              </Link>
              <Link href="/recruitment" className="hero-cta-secondary">
                <svg className="cta-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline-block' }}>
                  <path d="M18 17a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2" />
                  <path d="M22 10a2 2 0 0 0-2-2h-3L13 4 8 9v4l3 3h5a2 2 0 0 0 2-2v-4Z" />
                  <path d="m3 14 3-3-3-3" />
                  <path d="M14 13h2" />
                </svg>
                Join Chapter
              </Link>
            </div>

            {/* Premium Minimal Stats Badge */}
            <div className="hero-stats-badge">
              <div className="stats-logo-circle">
                <img src="/brand/iste-logo.jpg" alt="ISTE logo" />
              </div>
              <div className="stats-content">
                <span className="stats-label">Student Community</span>
                <h3 className="stats-number">700+</h3>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity What's New / Event Spotlight Card */}
          <FeaturedEventSection featuredEvent={featuredEvent} />
        </section>

        {/* SECTION 2: CORE FOCUS AREAS */}
        {about?.focusCards && about.focusCards.length > 0 && (
          <section className="home-focus-section">
            <div className="section-header-centered">
              <h3 className="section-kicker-heading">Core Pillars</h3>
              <h2 className="section-title-premium">What We Stand For</h2>
              <p className="section-subtitle-premium">
                Bridging academic knowledge with real-world exposure through three focus pillars.
              </p>
            </div>

            <div className="home-focus-grid">
              {about.focusCards.map((card, idx) => {
                const icons = ["01", "02", "03"];
                const labels = ["Applied Learning", "Chapter Experiences", "Career Readiness"];
                return (
                  <div key={card.title} className="focus-feature-card">
                    <div className="focus-card-topline">
                      <span className="focus-card-index">{icons[idx] || "04"}</span>
                      <span className="focus-card-label">{labels[idx] || "Society Pillar"}</span>
                    </div>
                    <h3 className="focus-card-title">{card.title}</h3>
                    <p className="focus-card-text">{card.text}</p>
                    <span className="focus-card-line" aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 3: WHY JOIN ISTE */}
        {about?.visionItems && about.visionItems.length > 0 && (
          <section className="home-vision-section">
            <div className="vision-container">
              {/* Left Column: Impressive Visual Shield */}
              <div className="vision-visual-column">
                <h3 className="section-kicker-heading" style={{ alignSelf: 'center' }}>Achievement</h3>
                <div className="award-photo-card">
                  <img
                    src="/achievements/best-professional-society-award.jpg"
                    alt="ISTE Student Chapter receiving the Best Professional Society Award"
                    className="award-photo"
                  />
                  <div className="award-photo-caption">
                    <h3>Best Professional Society Award</h3>
                    <p>Recognized for engineering and technology education leadership.</p>
                  </div>
                </div>
                <p className="award-photo-subtext">
                  Presented by the Indian Society for Technical Education (ISTE) in recognition of academic excellence, tech innovation, and leadership.
                </p>
              </div>

              {/* Right Column: Why Join List */}
              <div className="vision-content-column">
                <h3 className="section-kicker-heading" style={{ alignSelf: 'center' }}>Opportunities</h3>
                <h2 className="vision-section-title">{about.visionTitle || "Why Join ISTE?"}</h2>
                <ul className="vision-premium-list">
                  {about.visionItems.map((item, idx) => {
                    const details = [
                      "Providing resources, mentorship, and research opportunities to help students think outside the box and push technological boundaries.",
                      "Hosting regular hands-on sessions in AI/ML, Web Dev, App Dev, and major national hackathons with rewards and recognition.",
                      "Work in interdisciplinary student teams to build industrial-grade applications, open-source software, and research prototypes.",
                      "Get direct mentorship from tech leaders, access internship opportunities, and learn from guest lectures by industry professionals.",
                      "Develop soft skills, manage large-scale events, lead domain-specific subteams, and cultivate executive presence and professionalism."
                    ];
                    return (
                      <li key={item} className="vision-list-item">
                        <div className="vision-list-item-main">
                          <span className="check-mark">✓</span>
                          <p className="list-item-text">{item}</p>
                        </div>
                        <p className="vision-list-item-details">
                          {details[idx] || "Empowering students to achieve their full potential in technical careers."}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>
    </PublicShell>
  );
}
