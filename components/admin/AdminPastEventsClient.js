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
    category: "Event",
    eventDate: "",
    description: "",
    winners: ""
  });
  const [imagesList, setImagesList] = useState([]); // Array of { type: 'existing'|'new', path?: string, dataUrl?: string, name?: string }

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesList(prev => [...prev, {
          type: "new",
          dataUrl: reader.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
    // Clear input so same file can be selected again
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImagesList(prev => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const imagePaths = imagesList
      .filter(img => img.type === "existing")
      .map(img => img.path);

    const imagesDataUrls = imagesList
      .filter(img => img.type === "new")
      .map(img => img.dataUrl);

    const payload = {
      name: form.name,
      category: form.category,
      eventDate: form.eventDate,
      description: form.description,
      winners: form.winners,
      imagePaths,
      imagesDataUrls
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
      setForm({ name: "", category: "Event", eventDate: "", description: "", winners: "" });
      setImagesList([]);
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
      category: event.category || "Event",
      eventDate: event.eventDate,
      description: event.description,
      winners: event.winners || ""
    });
    const currentImages = (event.imagePaths || []).map(path => ({
      type: "existing",
      path
    }));
    setImagesList(currentImages);
    setShowForm(true);
  }

  function handleToggleForm() {
    if (showForm) {
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", category: "Event", eventDate: "", description: "", winners: "" });
      setImagesList([]);
    } else {
      setShowForm(true);
    }
  }

  if (loading) return <p>Loading history...</p>;

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="admin-submit" onClick={handleToggleForm}>
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
            
            <label style={{ marginTop: '10px', display: 'block' }}>Category
              <select 
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value})}
                style={{ 
                  display: "block", 
                  width: "100%", 
                  padding: "12px", 
                  background: "rgba(255,255,255,0.03)", 
                  border: "1px solid rgba(255,255,255,0.08)", 
                  borderRadius: "8px", 
                  color: "#ffffff",
                  fontSize: "0.95rem"
                }}
              >
                <option value="Event" style={{ background: "#0f172a" }}>Event</option>
                <option value="Hackathon" style={{ background: "#0f172a" }}>Hackathon</option>
                <option value="Workshop" style={{ background: "#0f172a" }}>Workshop</option>
                <option value="Seminar" style={{ background: "#0f172a" }}>Seminar</option>
                <option value="Induction" style={{ background: "#0f172a" }}>Induction</option>
              </select>
            </label>

            <label style={{ marginTop: '20px', display: 'block' }}>Description
              <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} />
            </label>
            <label>Winners & Highlights
              <textarea value={form.winners} onChange={e => setForm({...form, winners: e.target.value})} placeholder="First Place: ..., Second Place: ..." rows={3} />
            </label>

            <div className="admin-image-manager">
              <span className="admin-image-manager-title">Event Images</span>
              <label className="admin-file-picker-trigger" htmlFor="past-event-images-input">
                <span>📷 Upload Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="past-event-images-input"
                />
              </label>

              {imagesList.length > 0 && (
                <div className="admin-image-preview-grid">
                  {imagesList.map((img, idx) => (
                    <div key={idx} className="admin-image-preview-card">
                      <img
                        src={img.type === "existing" ? (img.path.startsWith("http") ? img.path : `/${img.path}`) : img.dataUrl}
                        alt="Preview"
                      />
                      <button
                        type="button"
                        className="admin-image-remove-btn"
                        onClick={() => removeImage(idx)}
                      >
                        ✕
                      </button>
                      <span className="admin-image-badge">
                        {img.type === "existing" ? "Saved" : "New"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="admin-submit full-width" type="submit" style={{ marginTop: '20px' }}>
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
              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239,43,47,0.1)', border: '1px solid rgba(239,43,47,0.2)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#fca5a5', marginRight: '8px' }}>
                {event.category}
              </span>
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
