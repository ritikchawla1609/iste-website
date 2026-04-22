"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/client-api";
import { formatTimestamp } from "@/lib/presentation";

export default function AdminPastEventsClient() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    eventDate: "",
    description: "",
    winners: "",
    imagePaths: ""
  });

  async function fetchEvents() {
    try {
      const data = await apiRequest("/api/admin/past-events");
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch past events:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      imagePaths: form.imagePaths.split(",").map(s => s.trim()).filter(Boolean)
    };

    try {
      if (editingId) {
        await apiRequest(`/api/admin/past-events?id=${editingId}`, {
          method: "PUT",
          body: payload
        });
      } else {
        await apiRequest("/api/admin/past-events", {
          method: "POST",
          body: payload
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", eventDate: "", description: "", winners: "", imagePaths: "" });
      fetchEvents();
    } catch (error) {
      alert("Error saving event");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this historical record?")) return;
    try {
      await apiRequest(`/api/admin/past-events?id=${id}`, { method: "DELETE" });
      fetchEvents();
    } catch (error) {
      alert("Error deleting event");
    }
  }

  function handleEdit(event) {
    setEditingId(event.id);
    setForm({
      name: event.name,
      eventDate: event.eventDate,
      description: event.description,
      winners: event.winners || "",
      imagePaths: event.imagePaths.join(", ")
    });
    setShowForm(true);
  }

  if (loading) return <p>Loading history...</p>;

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="admin-submit" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Historical Event"}
        </button>
      </div>

      {showForm && (
        <article className="admin-card">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="split-form" style={{ display: 'grid' }}>
              <label>Event Name
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </label>
              <label>Event Date
                <input type="date" required value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} />
              </label>
            </div>
            <label>Description
              <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} />
            </label>
            <label>Winners & Highlights
              <textarea value={form.winners} onChange={e => setForm({...form, winners: e.target.value})} placeholder="First Place: ..., Second Place: ..." rows={3} />
            </label>
            <label>Image URLs (Comma separated)
              <textarea value={form.imagePaths} onChange={e => setForm({...form, imagePaths: e.target.value})} placeholder="https://url1.jpg, https://url2.png" rows={2} />
            </label>
            <button className="admin-submit full-width" type="submit">
              {editingId ? "Update Record" : "Save to History"}
            </button>
          </form>
        </article>
      )}

      <div className="admin-managed-list">
        {events.map((event) => (
          <div key={event.id} className="admin-record-card">
            <div className="admin-record-copy">
              <strong>{event.name}</strong>
              <span>Date: {event.eventDate}</span>
              <p className="listing-copy">{event.description.slice(0, 100)}...</p>
            </div>
            <div className="admin-record-actions">
              <button className="admin-inline-action" onClick={() => handleEdit(event)}>Edit</button>
              <button className="admin-inline-action danger-action" onClick={() => handleDelete(event.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
