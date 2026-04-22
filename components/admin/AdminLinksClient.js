"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/client-api";
import { formatDate } from "@/lib/presentation";

export default function AdminLinksClient({ initialEvents, initialRecruitments }) {
  const [events, setEvents] = useState(initialEvents);
  const [recruitments, setRecruitments] = useState(initialRecruitments);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [pending, setPending] = useState(null); // stores ID of item being updated

  async function handleUpdateEventLink(eventId, link) {
    setPending(`event-${eventId}`);
    try {
      const response = await apiRequest(`/api/admin/events/${eventId}/link`, {
        method: "POST",
        body: { link }
      });
      setEvents(events.map(e => e.id === eventId ? response.event : e));
      setStatus({ type: "status-success", message: "Event registration link updated." });
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
          <h3>Event Registration Links</h3>
          <div className="admin-managed-list">
            {events.length ? (
              events.map((event) => (
                <div className="admin-record-card" key={event.id} style={{ display: 'block' }}>
                  <div className="admin-record-copy">
                    <strong>{event.name}</strong>
                    <span style={{ fontSize: '0.85em', opacity: 0.8 }}>
                      {formatDate(event.eventDate)} | {event.venue}
                    </span>
                  </div>
                  <form 
                    className="admin-form" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateEventLink(event.id, e.target.elements.link.value);
                    }}
                    style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}
                  >
                    <label style={{ flex: 1, marginBottom: 0 }}>
                      Google Form / Registration Link
                      <input 
                        type="url" 
                        name="link" 
                        defaultValue={event.registrationLink} 
                        placeholder="https://forms.gle/..." 
                        required 
                      />
                    </label>
                    <button 
                      className="admin-submit" 
                      type="submit" 
                      disabled={pending === `event-${event.id}`}
                      style={{ padding: '8px 16px', fontSize: '0.9em' }}
                    >
                      {pending === `event-${event.id}` ? "Saving..." : "Update Link"}
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
          <h3>Recruitment Application Links</h3>
          <div className="admin-managed-list">
            {recruitments.length ? (
              recruitments.map((rec) => (
                <div className="admin-record-card" key={rec.id} style={{ display: 'block' }}>
                  <div className="admin-record-copy">
                    <strong>{rec.title}</strong>
                    <span style={{ fontSize: '0.85em', opacity: 0.8 }}>
                      {rec.organization} | Deadline: {formatDate(rec.deadline)}
                    </span>
                  </div>
                  <form 
                    className="admin-form" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateRecruitmentLink(rec.id, e.target.elements.link.value);
                    }}
                    style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}
                  >
                    <label style={{ flex: 1, marginBottom: 0 }}>
                      Google Form / Application Link
                      <input 
                        type="url" 
                        name="link" 
                        defaultValue={rec.applicationLink} 
                        placeholder="https://forms.gle/..." 
                        required 
                      />
                    </label>
                    <button 
                      className="admin-submit" 
                      type="submit" 
                      disabled={pending === `recruitment-${rec.id}`}
                      style={{ padding: '8px 16px', fontSize: '0.9em' }}
                    >
                      {pending === `recruitment-${rec.id}` ? "Saving..." : "Update Link"}
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
