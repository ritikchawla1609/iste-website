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
        <section className="portal-notice-banner" style={{ marginTop: '40px' }}>
          <div className="intro-copy">
            <p className="section-kicker">ISTE Events</p>
            <h1>Upcoming Events & Workshops</h1>
            <p>
              Stay updated with the latest technical events, workshops, and competitions organized by the ISTE Student Chapter.
            </p>
          </div>
        </section>

        <section className="events-content" style={{ paddingBottom: '80px' }}>
          <div className="listing-stack">
            {events.length ? (
              events.map((event) => (
                <article className="listing-card" key={event.id} style={{ maxWidth: '800px', margin: '0 auto 24px' }}>
                  <div className="listing-tags">
                    <span className="pill">{event.category}</span>
                    <span className="meta-chip">Deadline: {formatDate(event.deadline)}</span>
                  </div>
                  <h3 style={{ fontSize: '1.5rem' }}>{event.name}</h3>
                  <div className="listing-meta">
                    <span className="meta-chip">{formatDate(event.eventDate)}</span>
                    <span className="meta-chip">{event.venue}</span>
                  </div>
                  <p className="listing-copy">{event.description}</p>
                  <div className="listing-footer">
                    <a 
                      className="text-link" 
                      href={safeUrl(event.registrationLink)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Register Now →
                    </a>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state" style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '20px', border: '1px solid var(--line)' }}>
                <h3>No upcoming events.</h3>
                <p>Check back later for new updates!</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
