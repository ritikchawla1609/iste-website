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
      <main className="portal-main">
        <header className="subpage-hero">
          <p className="section-kicker">Our Legacy</p>
          <h1>Previous Events & Achievements</h1>
          <p>Celebrating the milestones and success stories of the ISTE Student Chapter.</p>
        </header>

        <section className="portal-grid" style={{ marginTop: '40px', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {loading ? (
            <p>Loading achievements...</p>
          ) : events.length > 0 ? (
            events.map((event) => (
              <article key={event.id} className="content-sheet">
                <p className="section-kicker">{formatDate(event.eventDate)}</p>
                <h2 style={{ marginBottom: '16px' }}>{event.name}</h2>
                <p className="listing-copy">{event.description}</p>
                
                {event.winners && (
                  <div style={{ marginTop: '24px', padding: '20px', background: 'var(--paper-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                    <strong style={{ color: 'var(--gold)', display: 'block', marginBottom: '8px' }}>🏆 Winners & Highlights</strong>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{event.winners}</p>
                  </div>
                )}

                {event.imagePaths && event.imagePaths.length > 0 && (
                  <div style={{ marginTop: '24px', display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                    {event.imagePaths.map((path, idx) => (
                      <div key={idx} className="brand-mark" style={{ width: '100%', height: '100px' }}>
                        <img src={path.startsWith('http') ? path : `/${path}`} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <p>No past events recorded yet. Check back soon!</p>
            </div>
          )}
        </section>
      </main>
    </PublicShell>
  );
}
