"use client";

import { useEffect, useRef, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { eventService } from "@/services/eventService";
import { readFileAsDataUrl } from "@/services/api";

const INITIAL_FORM = {
  name: "",
  category: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  venue: "",
  deadline: "",
  registrationLink: "#",
  googleFormLink: "",
  registrationFee: "Free",
  prizes: "",
  description: "",
  contactName: "",
  contactEmail: "",
  minTeamSize: 1,
  maxTeamSize: 1,
  status: "draft"
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterRemoved, setPosterRemoved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  async function loadEvents() {
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to load events."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function handleOpenCreate() {
    setEditingEvent(null);
    setFormValues(INITIAL_FORM);
    setPosterFile(null);
    setPosterPreview(null);
    setPosterRemoved(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalOpen(true);
  }

  function handleOpenEdit(event) {
    setEditingEvent(event);
    setFormValues({
      name: event.name || "",
      category: event.category || "",
      eventDate: event.eventDate || "",
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      venue: event.venue || "",
      deadline: event.deadline || "",
      registrationLink: event.registrationLink || "#",
      googleFormLink: event.googleFormLink || "",
      registrationFee: event.registrationFee || "Free",
      prizes: event.prizes || "",
      description: event.description || "",
      contactName: event.contactName || "",
      contactEmail: event.contactEmail || "",
      minTeamSize: event.minTeamSize || 1,
      maxTeamSize: event.maxTeamSize || 1,
      status: event.status || "draft"
    });
    setPosterFile(null);
    setPosterPreview(event.posterPath ? `/${event.posterPath}` : null);
    setPosterRemoved(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalOpen(true);
  }

  function handlePosterChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("The selected poster image exceeds 4 MB. Please choose a smaller image.");
      e.target.value = "";
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Only JPG, PNG, and WEBP image files are supported.");
      e.target.value = "";
      return;
    }

    setPosterFile(file);
    setPosterRemoved(false);
    const reader = new FileReader();
    reader.onload = () => setPosterPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleRemovePoster() {
    setPosterFile(null);
    setPosterPreview(null);
    setPosterRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage({ type: "", text: "" });

    try {
      let posterDataUrl = null;
      if (posterFile) {
        posterDataUrl = await readFileAsDataUrl(posterFile);
      }

      const payload = {
        ...formValues,
        posterFile: posterDataUrl,
        posterRemoved
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, payload);
        setStatusMessage({
          type: "success",
          text: `Event "${payload.name}" updated successfully.`
        });
      } else {
        await eventService.createEvent(payload);
        setStatusMessage({
          type: "success",
          text: `Event "${payload.name}" created successfully.`
        });
      }

      setModalOpen(false);
      await loadEvents();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to save event."
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(event) {
    const nextStatus = event.status === "published" ? "draft" : "published";
    try {
      await eventService.toggleEventStatus(event.id, nextStatus);
      setStatusMessage({
        type: "success",
        text: `Event "${event.name}" status changed to ${nextStatus}.`
      });
      await loadEvents();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update event status."
      });
    }
  }

  async function handleDelete(event) {
    if (!confirm(`Are you sure you want to delete "${event.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await eventService.deleteEvent(event.id);
      setStatusMessage({
        type: "success",
        text: `Event "${event.name}" deleted successfully.`
      });
      await loadEvents();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to delete event."
      });
    }
  }

  const filteredEvents = events.filter((ev) => {
    if (filter === "published") return ev.status === "published";
    if (filter === "draft") return ev.status === "draft";
    return true;
  });

  return (
    <AdminShell
      kicker="Event Management"
      title="Upcoming Events"
      description="Create, publish, edit, and organize official student chapter events, hackathons, and workshops."
      actions={
        <button type="button" className="btn-primary btn-accent" onClick={handleOpenCreate}>
          <span>➕</span> Add New Event
        </button>
      }
    >
      <Alert
        type={statusMessage.type}
        message={statusMessage.text}
        onClose={() => setStatusMessage({ type: "", text: "" })}
      />

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px"
        }}
      >
        <button
          type="button"
          className={filter === "all" ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
          onClick={() => setFilter("all")}
        >
          All ({events.length})
        </button>
        <button
          type="button"
          className={filter === "published" ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
          onClick={() => setFilter("published")}
        >
          Published ({events.filter((e) => e.status === "published").length})
        </button>
        <button
          type="button"
          className={filter === "draft" ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
          onClick={() => setFilter("draft")}
        >
          Drafts ({events.filter((e) => e.status === "draft").length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading events..." />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No events found"
          description={
            filter === "all"
              ? "No events exist yet. Create your first event to get started."
              : `No events in ${filter} status.`
          }
          actionLabel={filter === "all" ? "Create Event" : undefined}
          onAction={filter === "all" ? handleOpenCreate : undefined}
        />
      ) : (
        <div>
          {filteredEvents.map((event) => (
            <article key={event.id} className="item-card">
              <div className="item-main">
                <div className="item-header">
                  <h3 className="item-title">{event.name}</h3>
                  <Badge status={event.status} />
                  <span
                    style={{
                      background: "#f1f5f9",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--navy-700)"
                    }}
                  >
                    {event.category}
                  </span>
                  {event.registrationFee && (
                    <span
                      style={{
                        background: event.registrationFee.toLowerCase() === "free" ? "#dcfce7" : "#fef3c7",
                        color: event.registrationFee.toLowerCase() === "free" ? "#166534" : "#92400e",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        fontWeight: 700
                      }}
                    >
                      Fee: {event.registrationFee}
                    </span>
                  )}
                </div>

                <div className="item-meta-grid">
                  <span>
                    <strong>Date:</strong> {event.eventDate || "TBA"}
                  </span>
                  <span>
                    <strong>Time:</strong> {event.startTime} - {event.endTime}
                  </span>
                  <span>
                    <strong>Venue:</strong> {event.venue}
                  </span>
                  <span>
                    <strong>Deadline:</strong> {event.deadline || "None"}
                  </span>
                  <span>
                    <strong>Team Size:</strong> {event.minTeamSize} - {event.maxTeamSize} member(s)
                  </span>
                  <span>
                    <strong>Prizes:</strong> {event.prizes || "None"}
                  </span>
                  <span>
                    <strong>Contact:</strong> {event.contactName} ({event.contactEmail})
                  </span>
                </div>

                <p className="item-description">{event.description}</p>
              </div>

              {event.posterPath && (
                <div
                  style={{
                    width: "90px",
                    height: "120px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid var(--line)",
                    flexShrink: 0
                  }}
                >
                  <img
                    src={`/${event.posterPath}`}
                    alt={`${event.name} poster`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}

              <div className="item-actions">
                <button
                  type="button"
                  className={event.status === "published" ? "btn-secondary btn-sm" : "btn-primary btn-sm"}
                  onClick={() => handleToggleStatus(event)}
                  title={event.status === "published" ? "Unpublish to Draft" : "Publish to Public Website"}
                >
                  {event.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => handleOpenEdit(event)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm btn-danger"
                  onClick={() => handleDelete(event)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit Event Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? `Edit Event: ${editingEvent.name}` : "Create New Upcoming Event"}
        maxWidth="740px"
      >
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="ev-name">
                Event Name <span className="required">*</span>
              </label>
              <input
                id="ev-name"
                type="text"
                className="form-input"
                required
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                placeholder="e.g. Technicia'26 Hackathon"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ev-cat">
                Category <span className="required">*</span>
              </label>
              <input
                id="ev-cat"
                type="text"
                className="form-input"
                required
                value={formValues.category}
                onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                placeholder="e.g. Tech Fest, Workshop, Hackathon"
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="ev-date">
                Event Date <span className="required">*</span>
              </label>
              <input
                id="ev-date"
                type="date"
                className="form-input"
                required
                value={formValues.eventDate}
                onChange={(e) => setFormValues({ ...formValues, eventDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ev-start">
                Start Time <span className="required">*</span>
              </label>
              <input
                id="ev-start"
                type="time"
                className="form-input"
                required
                value={formValues.startTime}
                onChange={(e) => setFormValues({ ...formValues, startTime: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ev-end">
                End Time <span className="required">*</span>
              </label>
              <input
                id="ev-end"
                type="time"
                className="form-input"
                required
                value={formValues.endTime}
                onChange={(e) => setFormValues({ ...formValues, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="ev-venue">
                Venue <span className="required">*</span>
              </label>
              <input
                id="ev-venue"
                type="text"
                className="form-input"
                required
                value={formValues.venue}
                onChange={(e) => setFormValues({ ...formValues, venue: e.target.value })}
                placeholder="e.g. Chandigarh University, Block D-3"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ev-deadline">
                Registration Deadline <span className="required">*</span>
              </label>
              <input
                id="ev-deadline"
                type="date"
                className="form-input"
                required
                value={formValues.deadline}
                onChange={(e) => setFormValues({ ...formValues, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="ev-fee">
                Registration Fee
              </label>
              <input
                id="ev-fee"
                type="text"
                className="form-input"
                value={formValues.registrationFee}
                onChange={(e) => setFormValues({ ...formValues, registrationFee: e.target.value })}
                placeholder="Free or ₹100 per team"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ev-min-team">
                Min Team Size
              </label>
              <input
                id="ev-min-team"
                type="number"
                min="1"
                max="20"
                className="form-input"
                value={formValues.minTeamSize}
                onChange={(e) => setFormValues({ ...formValues, minTeamSize: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ev-max-team">
                Max Team Size
              </label>
              <input
                id="ev-max-team"
                type="number"
                min="1"
                max="20"
                className="form-input"
                value={formValues.maxTeamSize}
                onChange={(e) => setFormValues({ ...formValues, maxTeamSize: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="ev-reg-link">
                Registration Link
              </label>
              <input
                id="ev-reg-link"
                type="text"
                className="form-input"
                value={formValues.registrationLink}
                onChange={(e) => setFormValues({ ...formValues, registrationLink: e.target.value })}
                placeholder="# or external registration URL"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ev-google-form">
                Feedback / External Google Form Link
              </label>
              <input
                id="ev-google-form"
                type="text"
                className="form-input"
                value={formValues.googleFormLink}
                onChange={(e) => setFormValues({ ...formValues, googleFormLink: e.target.value })}
                placeholder="https://forms.gle/..."
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="ev-contact-name">
                Contact Name <span className="required">*</span>
              </label>
              <input
                id="ev-contact-name"
                type="text"
                className="form-input"
                required
                value={formValues.contactName}
                onChange={(e) => setFormValues({ ...formValues, contactName: e.target.value })}
                placeholder="e.g. Student Coordinator"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ev-contact-email">
                Contact Email <span className="required">*</span>
              </label>
              <input
                id="ev-contact-email"
                type="email"
                className="form-input"
                required
                value={formValues.contactEmail}
                onChange={(e) => setFormValues({ ...formValues, contactEmail: e.target.value })}
                placeholder="iste@cumail.in"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ev-prizes">
              Prizes & Incentives <span className="required">*</span>
            </label>
            <input
              id="ev-prizes"
              type="text"
              className="form-input"
              required
              value={formValues.prizes}
              onChange={(e) => setFormValues({ ...formValues, prizes: e.target.value })}
              placeholder="e.g. ₹50,000 Cash Prize Pool + Certificates"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ev-desc">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="ev-desc"
              rows="4"
              className="form-textarea"
              required
              value={formValues.description}
              onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              placeholder="Detailed description of the event structure, rounds, and guidelines."
            />
          </div>

          {/* Poster Upload Section */}
          <div className="form-group">
            <label className="form-label" htmlFor="ev-poster">
              Event Poster Image (Max 4 MB &bull; JPG, PNG, WEBP)
            </label>
            <input
              id="ev-poster"
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePosterChange}
              className="form-input"
            />
            {posterPreview && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "8px",
                  padding: "10px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid var(--line)"
                }}
              >
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  style={{ width: "60px", height: "80px", objectFit: "cover", borderRadius: "6px" }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {posterFile ? posterFile.name : "Current poster attached"}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-secondary btn-sm btn-danger"
                  onClick={handleRemovePoster}
                >
                  Remove Poster
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ev-status">
              Publication Status <span className="required">*</span>
            </label>
            <select
              id="ev-status"
              className="form-select"
              value={formValues.status}
              onChange={(e) => setFormValues({ ...formValues, status: e.target.value })}
            >
              <option value="draft">Draft (Saved only in Author Console)</option>
              <option value="published">Published (Visible on Public Website)</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid var(--line)"
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary btn-accent" disabled={submitting}>
              {submitting ? "Saving Event..." : editingEvent ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}
