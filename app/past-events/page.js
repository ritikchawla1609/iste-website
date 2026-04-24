"use client";

import { useEffect, useState } from "react";
import PublicShell from "@/components/PublicShell";
import { apiRequest } from "@/lib/client-api";
import { formatDate } from "@/lib/presentation";

export default function PastEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await apiRequest("/api/public/past-events");
        setEvents(data);
      } catch (error) {
        console.error("Failed to load past events:", error);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <PublicShell activePath="/past-events">
      <main className="subpage-main">
        <section className="subpage-hero" style={{ padding: '80px 0 40px' }}>
          <div className="hero-context">
            <span className="section-kicker">Our Legacy</span>
          </div>
          <h1 className="hero-title">Previous Events & <span className="brand-text">Achievements</span></h1>
          <p className="hero-description" style={{ marginBottom: '24px' }}>
            Celebrating the milestones, success stories, and technical breakthroughs 
            of the ISTE Student Chapter at Chandigarh University.
          </p>
          <div className="title-accent-line"></div>
        </section>

        <section className="portal-grid" style={{ marginTop: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', display: 'grid', gap: '24px' }}>
          {loading ? (
            <p>Loading achievements...</p>
          ) : events.length > 0 ? (
            events.map((event) => (
              <article key={event.id} className="content-sheet" style={{ background: '#fff', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-soft)' }}>
                <p className="section-kicker">{formatDate(event.eventDate)}</p>
                <h2 style={{ marginBottom: '16px', color: 'var(--navy-900)', fontSize: '1.8rem', fontWeight: '800' }}>{event.name}</h2>
                <p className="listing-copy" style={{ color: 'var(--text-soft)', lineHeight: '1.7' }}>{event.description}</p>
                
                {event.winners && (
                  <div style={{ marginTop: '24px', padding: '24px', background: 'var(--paper-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', borderLeft: '4px solid var(--brand-red)' }}>
                    <strong style={{ color: 'var(--brand-red)', display: 'block', marginBottom: '8px', fontSize: '1rem' }}>🏆 Winners & Highlights</strong>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6' }}>{event.winners}</p>
                  </div>
                )}

                {event.imagePaths && event.imagePaths.length > 0 && (
                  <div style={{ marginTop: '24px', display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
                    {event.imagePaths.map((path, idx) => (
                      <div key={idx} style={{ width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                        <img src={path.startsWith('http') ? path : `/${path}`} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 40px', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--line)' }}>
              <p style={{ color: 'var(--text-soft)' }}>No past events recorded yet. Check back soon!</p>
            </div>
          )}
        </section>
      </main>
    </PublicShell>
  );
}
