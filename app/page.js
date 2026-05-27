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
            <span className="hero-kicker">Innovation Starts Here</span>
            <h1 className="hero-title">
              Build, lead, and innovate with the <span className="hero-accent">ISTE Student Chapter</span>.
            </h1>
            <p className="hero-desc">
              A professional student society dedicated to technical excellence, industry exposure,
              leadership development, and meaningful innovation beyond the classroom.
            </p>

            <div className="hero-trust-row" aria-label="Chapter strengths">
              <span>Technical Fests</span>
              <span>Workshops</span>
              <span>Leadership</span>
            </div>

            {/* Premium CTA Buttons */}
            <div className="hero-cta-group">
              <Link href="/events" className="hero-cta-primary">
                Explore Events
              </Link>
              <Link href="/recruitment" className="hero-cta-secondary">
                Join Chapter
              </Link>
            </div>

            {/* Premium Minimal Stats Badge */}
            <div className="hero-stats-badge">
              <span className="stats-icon">ISTE</span>
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
              <span className="hero-kicker">Core Pillars</span>
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
                <div className="award-photo-card">
                  <img
                    src="/achievements/best-professional-society-award.jpg"
                    alt="ISTE Student Chapter receiving the Best Professional Society Award"
                    className="award-photo"
                  />
                  <div className="award-photo-caption">
                    <span className="award-photo-kicker">Achievement</span>
                    <h3>Best Professional Society Award</h3>
                    <p>Recognized for engineering and technology education leadership.</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Why Join List */}
              <div className="vision-content-column">
                <span className="hero-kicker" style={{ alignSelf: 'flex-start' }}>Opportunities</span>
                <h2 className="vision-section-title">{about.visionTitle || "Why Join ISTE?"}</h2>
                <ul className="vision-premium-list">
                  {about.visionItems.map((item) => (
                    <li key={item} className="vision-list-item">
                      <span className="check-mark">✓</span>
                      <p className="list-item-text">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>
    </PublicShell>
  );
}
