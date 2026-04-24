"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/PublicShell";
import { apiRequest } from "@/lib/client-api";
import { formatDate, safeUrl, sortByDate } from "@/lib/presentation";

export default function EventsPage() {
  const [siteData, setSiteData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiRequest("/api/public/site-data");
        setSiteData(data);
      } catch (error) {
        console.error("Failed to load site data:", error);
      }
    }
    loadData();
  }, []);

  if (!siteData) return null;

  const events = sortByDate(siteData.events, "eventDate", "startTime");

  return (
    <PublicShell activePath="/events">
      <main className="subpage-main">
        <section className="subpage-hero" style={{ padding: '80px 0 40px' }}>
          <div className="hero-context">
            <span className="section-kicker">Professional Excellence</span>
          </div>
          <h1 className="hero-title">Upcoming <span className="brand-text">Chapter Events</span></h1>
          <p className="hero-description" style={{ marginBottom: '24px' }}>
            Explore our curated selection of high-impact workshops, competitive hackathons, 
            and technical seminars designed to bridge the gap between academia and industry.
          </p>
          <div className="title-accent-line"></div>
        </section>

        <section className="timeline-section">
          <div className="timeline-container">
            <div className="timeline-line"></div>
            
            {events.length ? (
              events.map((event, index) => (
                <div key={event.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} style={{ marginBottom: '60px' }}>
                  <div className="timeline-dot"></div>
                  
                  <div className="timeline-info" style={{ padding: '32px' }}>
                    <div className="time-badge" style={{ marginBottom: '16px' }}>{event.timing}</div>
                    <h2 className="event-title" style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{event.name}</h2>
                    <p className="event-desc" style={{ fontSize: '0.95rem', marginBottom: '24px' }}>{event.description}</p>
                    
                    <div className="event-stats-grid" style={{ padding: '16px', marginBottom: '24px' }}>
                      <div className="stat-box">
                        <span className="stat-icon">👥</span>
                        <div className="stat-copy">
                          <small>Participants</small>
                          <strong>{event.minTeamSize === event.maxTeamSize ? (event.minTeamSize === 1 ? 'Individual' : `${event.minTeamSize} Members`) : `${event.minTeamSize}-${event.maxTeamSize} Members`}</strong>
                        </div>
                      </div>
                      <div className="stat-box">
                        <span className="stat-icon">🏆</span>
                        <div className="stat-copy">
                          <small>Prize Pool</small>
                          <strong>{event.prizes}</strong>
                        </div>
                      </div>
                      <div className="stat-box">
                        <span className="stat-icon">⭐</span>
                        <div className="stat-copy">
                          <small>Registration Fees</small>
                          <strong>Free</strong>
                        </div>
                      </div>
                      <div className="stat-box">
                        <span className="stat-icon">📍</span>
                        <div className="stat-copy">
                          <small>Location</small>
                          <strong>{event.venue}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="event-actions">
                      <a href={safeUrl(event.registrationLink)} target="_blank" rel="noreferrer" className="primary-btn">Secure Your Spot</a>
                    </div>
                  </div>

                  <div className="timeline-poster">
                    <div className="poster-wrapper">
                      <img src={event.posterPath ? `/${event.posterPath}` : '/brand/iste-logo.jpg'} alt={event.name} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '100px 0' }}>
                <p>No upcoming events scheduled yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <style jsx>{`
        .timeline-section {
          width: var(--container);
          margin: 0 auto;
          position: relative;
          padding-bottom: 100px;
        }

        .timeline-container {
          position: relative;
          padding: 40px 0;
        }

        .timeline-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--line);
          transform: translateX(-50%);
        }

        .timeline-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 120px;
          width: 100%;
          position: relative;
        }

        .timeline-item.right {
          flex-direction: row-reverse;
        }

        .timeline-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 16px;
          height: 16px;
          background: var(--brand-red);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          border: 4px solid #fff;
          box-shadow: 0 0 0 2px var(--line);
        }

        .timeline-info {
          width: 45%;
          text-align: left;
          background: #fff;
          padding: 48px;
          border-radius: 32px;
          border: 1px solid var(--line);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
          position: relative;
        }

        .time-badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: #fff1f2;
          color: var(--brand-red);
          border-radius: 100px;
          font-weight: 800;
          font-size: 0.8rem;
          margin-bottom: 20px;
          border: 1px solid #fecaca;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .event-title {
          font-size: 2.2rem;
          color: var(--navy-900);
          font-weight: 800;
          margin-bottom: 16px;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .event-desc {
          font-size: 1.05rem;
          color: var(--text-soft);
          line-height: 1.6;
          margin-bottom: 32px;
          font-weight: 500;
        }

        .event-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 40px;
          padding: 24px;
          background: var(--paper-soft);
          border-radius: 20px;
          border: 1px solid var(--line);
        }

        .stat-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          font-size: 1.25rem;
          background: #fff;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid var(--line);
        }

        .stat-copy small {
          display: block;
          color: var(--text-soft);
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1px;
          font-weight: 700;
        }

        .stat-copy strong {
          color: var(--navy-900);
          font-size: 0.95rem;
          font-weight: 700;
        }

        .event-actions {
          display: flex;
        }

        .primary-btn {
          width: 100%;
          text-align: center;
          padding: 14px 24px;
          background: var(--navy-900);
          color: #fff;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          transition: 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.85rem;
        }

        .primary-btn:hover {
          background: var(--brand-red);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(220, 38, 38, 0.2);
        }

        .timeline-poster {
          width: 45%;
        }

        .poster-wrapper {
          width: 100%;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid var(--line);
          box-shadow: var(--shadow-soft);
          background: #fff;
          padding: 12px;
        }

        .poster-wrapper img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 16px;
        }

        @media (max-width: 1024px) {
          .timeline-line { left: 20px; }
          .timeline-dot { left: 20px; }
          .timeline-item, .timeline-item.right { flex-direction: column; align-items: flex-start; padding-left: 60px; }
          .timeline-info, .timeline-poster { width: 100%; }
          .timeline-poster { margin-top: 40px; }
        }
      `}</style>
    </PublicShell>
  );
}
