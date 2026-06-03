"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/client-api";
import { formatDate } from "@/lib/presentation";

export default function AdminLinksClient({ initialEvents, initialRecruitments }) {
  const [events, setEvents] = useState(initialEvents);
  const [recruitments, setRecruitments] = useState(initialRecruitments);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [pending, setPending] = useState(null); // stores ID of item being updated

  async function handleUpdateEventLink(eventId, registrationLink, googleFormLink) {
    setPending(`event-${eventId}`);
    try {
      const response = await apiRequest(`/api/admin/events/${eventId}/link`, {
        method: "POST",
        body: { registrationLink, googleFormLink }
      });
      setEvents(events.map(e => e.id === eventId ? response.event : e));
      setStatus({ type: "status-success", message: "Event registration and form links updated." });
    } catch (error) {
      setStatus({ type: "status-error", message: error.message || "Failed to update link." });
    } finally {
      setPending(null);
    }
  }

  async function handleUpdateRecruitmentLink(recruitmentId, link) {
    setPending(`recruitment-${recruitmentId}`);
    try {
      const response = await apiRequest(`/api/admin/recruitments/${recruitmentId}/link`, {
        method: "POST",
        body: { link }
      });
      setRecruitments(recruitments.map(r => r.id === recruitmentId ? response.recruitment : r));
      setStatus({ type: "status-success", message: "Recruitment application link updated." });
    } catch (error) {
      setStatus({ type: "status-error", message: error.message || "Failed to update link." });
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-heading">
        <div>
          <p className="panel-kicker">Link Adder</p>
          <h2>Manage Google Form Links</h2>
          <p>Quickly add or update registration links for events and recruitment posts.</p>
        </div>
      </div>

      <p className={`admin-form-status ${status.type}`.trim()} aria-live="polite" style={{ marginBottom: '20px' }}>
        {status.message}
      </p>

      <div className="admin-grid admin-grid-single">
        <article className="admin-card">
          <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', paddingBottom: '12px' }}>Event Registration Links</h3>
          <div className="admin-managed-list">
            {events.length ? (
              events.map((event) => (
                <div 
                  className="admin-record-card" 
                  key={event.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'stretch', 
                    gap: '20px', 
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid var(--line)',
                    background: '#f8fafc',
                    marginBottom: '24px'
                  }}
                >
                  <div className="admin-record-copy" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', paddingBottom: '12px' }}>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--navy-900)', display: 'block', marginBottom: '4px' }}>{event.name}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
                      📅 {formatDate(event.eventDate)} | 📍 {event.venue}
                    </span>
                  </div>
                  <form 
                    className="admin-form" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateEventLink(
                        event.id, 
                        e.target.elements.registrationLink.value,
                        e.target.elements.googleFormLink.value
                      );
                    }}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                      gap: '16px', 
                      alignItems: 'end' 
                    }}
                  >
                    <label style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-soft)' }}>
                      Registration Link (Optional)
                      <input 
                        type="url" 
                        name="registrationLink" 
                        defaultValue={event.registrationLink || ""} 
                        placeholder="https://..." 
                        style={{ marginTop: '6px' }}
                      />
                    </label>
                    <label style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-soft)' }}>
                      Google Form Link (Optional)
                      <input 
                        type="url" 
                        name="googleFormLink" 
                        defaultValue={event.googleFormLink || ""} 
                        placeholder="https://forms.gle/..." 
                        style={{ marginTop: '6px' }}
                      />
                    </label>
                    <button 
                      className="admin-submit" 
                      type="submit" 
                      disabled={pending === `event-${event.id}`}
                      style={{ 
                        padding: '12px 24px', 
                        fontSize: '0.85rem', 
                        height: '46px', 
                        gridColumn: '1 / -1',
                        marginTop: '8px'
                      }}
                    >
                      {pending === `event-${event.id}` ? "Saving..." : "Update Event Links"}
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <div className="admin-managed-empty">No events found.</div>
            )}
          </div>
        </article>

        <article className="admin-card">
          <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', paddingBottom: '12px' }}>Recruitment Application Links</h3>
          <div className="admin-managed-list">
            {recruitments.length ? (
              recruitments.map((rec) => (
                <div 
                  className="admin-record-card" 
                  key={rec.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'stretch', 
                    gap: '20px', 
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid var(--line)',
                    background: '#f8fafc',
                    marginBottom: '24px'
                  }}
                >
                  <div className="admin-record-copy" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', paddingBottom: '12px' }}>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--navy-900)', display: 'block', marginBottom: '4px' }}>{rec.title}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
                      💼 {rec.organization} | ⌛ Deadline: {formatDate(rec.deadline)}
                    </span>
                  </div>
                  <form 
                    className="admin-form" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateRecruitmentLink(rec.id, e.target.elements.link.value);
                    }}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '16px' 
                    }}
                  >
                    <label style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-soft)' }}>
                      Google Form / Application Link
                      <input 
                        type="url" 
                        name="link" 
                        defaultValue={rec.applicationLink} 
                        placeholder="https://forms.gle/..." 
                        required 
                        style={{ marginTop: '6px' }}
                      />
                    </label>
                    <button 
                      className="admin-submit" 
                      type="submit" 
                      disabled={pending === `recruitment-${rec.id}`}
                      style={{ 
                        padding: '12px 24px', 
                        fontSize: '0.85rem', 
                        height: '46px',
                        marginTop: '8px'
                      }}
                    >
                      {pending === `recruitment-${rec.id}` ? "Saving..." : "Update Recruitment Link"}
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <div className="admin-managed-empty">No recruitment posts found.</div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
