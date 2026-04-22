"use client";

import { useEffect, useRef, useState } from "react";

import { apiRequest, readFileAsDataUrl } from "@/lib/client-api";
import { formatDate, getStatusActionLabel, getStatusBadgeLabel } from "@/lib/presentation";

function setFormValues(form, values) {
  form.elements.status.value = values.status || "draft";
  form.elements.name.value = values.name || "";
  form.elements.category.value = values.category || "";
  form.elements.eventDate.value = values.eventDate || "";
  form.elements.startTime.value = values.startTime || "";
  form.elements.endTime.value = values.endTime || "";
  form.elements.venue.value = values.venue || "";
  form.elements.deadline.value = values.deadline || "";
  form.elements.minTeamSize.value = values.minTeamSize || 1;
  form.elements.maxTeamSize.value = values.maxTeamSize || 1;
  form.elements.registrationLink.value = values.registrationLink || "";
  form.elements.contactName.value = values.contactName || "";
  form.elements.contactEmail.value = values.contactEmail || "";
  form.elements.prizes.value = values.prizes || "";
  form.elements.description.value = values.description || "";
}

export default function AdminEventsClient({ initialEvents }) {
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const [events, setEvents] = useState(initialEvents);
  const [editingId, setEditingId] = useState(null);
  const [existingPosterPath, setExistingPosterPath] = useState(null);
  const [posterRemoved, setPosterRemoved] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [pending, setPending] = useState(false);

  async function reloadEvents() {
    const response = await apiRequest("/api/admin/events");
    setEvents(Array.isArray(response.events) ? response.events : []);
  }

  function resetForm() {
    const form = formRef.current;
    if (!form) {
      return;
    }

    form.reset();
    form.elements.status.value = "draft";
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setEditingId(null);
    setExistingPosterPath(null);
    setPosterRemoved(false);
    setStatus({ type: "", message: "" });
  }

  useEffect(() => {
    resetForm();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = formRef.current;
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const posterFile = fileInputRef.current?.files?.[0];
    const payload = {
      status: String(formData.get("status") || "draft"),
      name: String(formData.get("name") || ""),
      category: String(formData.get("category") || ""),
      eventDate: String(formData.get("eventDate") || ""),
      startTime: String(formData.get("startTime") || ""),
      endTime: String(formData.get("endTime") || ""),
      venue: String(formData.get("venue") || ""),
      deadline: String(formData.get("deadline") || ""),
      registrationLink: String(formData.get("registrationLink") || ""),
      prizes: String(formData.get("prizes") || ""),
      description: String(formData.get("description") || ""),
      contactName: String(formData.get("contactName") || ""),
      contactEmail: String(formData.get("contactEmail") || ""),
      minTeamSize: Number(formData.get("minTeamSize") || 1),
      maxTeamSize: Number(formData.get("maxTeamSize") || 1),
      posterRemoved
    };

    setPending(true);

    try {
      if (posterFile) {
        payload.posterDataUrl = await readFileAsDataUrl(posterFile);
      }

      const method = editingId ? "PUT" : "POST";
      const path = editingId ? `/api/admin/events/${editingId}` : "/api/admin/events";
      await apiRequest(path, { method, body: payload });
      await reloadEvents();
      const wasEditing = Boolean(editingId);
      resetForm();
      setStatus({
        type: "status-success",
        message: wasEditing ? "Event updated successfully." : "Event saved successfully."
      });
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "Unable to save the event record."
      });
    } finally {
      setPending(false);
    }
  }

  function handleEdit(eventRecord) {
    const form = formRef.current;
    if (!form) {
      return;
    }

    setFormValues(form, eventRecord);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setEditingId(eventRecord.id);
    setExistingPosterPath(eventRecord.posterPath || null);
    setPosterRemoved(false);
    setStatus({
      type: "status-success",
      message: "Editing selected event record."
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleToggle(eventRecord) {
    const nextStatus = eventRecord.status === "published" ? "draft" : "published";

    try {
      await apiRequest(`/api/admin/events/${eventRecord.id}/status`, {
        method: "POST",
        body: { status: nextStatus }
      });
      await reloadEvents();
      setStatus({
        type: "status-success",
        message: `Event moved to ${nextStatus}.`
      });
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "Unable to complete the event action."
      });
    }
  }

  async function handleDelete(eventRecord) {
    if (!window.confirm("Delete this event record permanently? This action cannot be undone.")) {
      return;
    }

    try {
      await apiRequest(`/api/admin/events/${eventRecord.id}`, { method: "DELETE" });
      await reloadEvents();
      if (editingId === eventRecord.id) {
        resetForm();
      }
      setStatus({
        type: "status-success",
        message: "Event record deleted successfully."
      });
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "Unable to complete the event action."
      });
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-heading">
        <div>
          <p className="panel-kicker">Event Management</p>
          <h2>Official event updates</h2>
        </div>
      </div>

      <div className="admin-grid admin-grid-single">
        <article className="admin-card">
          <h3>Add Event</h3>
          <form ref={formRef} className="admin-form" onSubmit={handleSubmit}>
            <label>
              Status
              <select name="status" required defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label>
              Event Name
              <input type="text" name="name" placeholder="Enter event name" required />
            </label>
            <label>
              Event Category
              <input type="text" name="category" placeholder="Enter event category" required />
            </label>
            <label>
              Date
              <input type="date" name="eventDate" required />
            </label>
            <label>
              Start Time
              <input type="time" name="startTime" required />
            </label>
            <label>
              End Time
              <input type="time" name="endTime" required />
            </label>
            <label>
              Venue
              <input type="text" name="venue" placeholder="Enter venue" required />
            </label>
            <label>
              Registration Deadline
              <input type="date" name="deadline" required />
            </label>
            <div className="split-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                Min Team Size
                <input type="number" name="minTeamSize" min="1" required defaultValue="1" />
              </label>
              <label>
                Max Team Size
                <input type="number" name="maxTeamSize" min="1" required defaultValue="1" />
              </label>
            </div>
            <label>
              Registration Link
              <input type="url" name="registrationLink" placeholder="Enter registration URL" required />
            </label>
            <label>
              Contact Person
              <input type="text" name="contactName" placeholder="Enter contact person name" required />
            </label>
            <label>
              Contact Email
              <input type="email" name="contactEmail" placeholder="Enter contact email" required />
            </label>
            <label className="full-span">
              Event Poster / Image
              <input
                ref={fileInputRef}
                type="file"
                name="posterFile"
                accept="image/jpeg,image/png,image/webp"
              />
            </label>
            <div className="file-assist full-span">
              <p className="field-help">
                {existingPosterPath && !posterRemoved
                  ? "A poster image is attached to this event record."
                  : "No poster image is attached to this event record."}
              </p>
              {existingPosterPath && !posterRemoved ? (
                <button
                  className="utility-link utility-link-inline"
                  type="button"
                  onClick={() => {
                    setPosterRemoved(true);
                    setExistingPosterPath(null);
                  }}
                >
                  Remove Current Poster
                </button>
              ) : null}
            </div>
            <label>
              Prizes
              <input type="text" name="prizes" placeholder="Enter prize details" required />
            </label>
            <label className="full-span">
              Description
              <textarea
                name="description"
                rows="4"
                placeholder="Enter a short event description"
                required
              />
            </label>
            <div className="admin-form-actions full-span">
              <button className="admin-submit" type="submit" disabled={pending}>
                {pending
                  ? editingId
                    ? "Updating..."
                    : "Saving..."
                  : editingId
                    ? "Update Event"
                    : "Save Event"}
              </button>
              {editingId ? (
                <button className="admin-logout" type="button" onClick={resetForm}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
            <p className={`admin-form-status full-span ${status.type}`.trim()} aria-live="polite">
              {status.message}
            </p>
          </form>

          <div className="admin-managed-block">
            <h4>Manage Event Records</h4>
            <div className="admin-managed-list" aria-live="polite">
              {events.length ? (
                events.map((eventRecord) => (
                  <article className="admin-record-card" key={eventRecord.id}>
                    <div className="admin-record-copy">
                      <div className="admin-record-heading">
                        <strong>{eventRecord.name}</strong>
                        <span className={`record-status record-status-${eventRecord.status}`}>
                          {getStatusBadgeLabel(eventRecord.status)}
                        </span>
                      </div>
                      <span>
                        {formatDate(eventRecord.eventDate)} | {eventRecord.timing} | {eventRecord.venue}
                      </span>
                      <span>
                        {eventRecord.category} | Deadline: {formatDate(eventRecord.deadline)}
                      </span>
                      <span>
                        Contact: {eventRecord.contactName} | {eventRecord.contactEmail}
                      </span>
                    </div>
                    <div className="admin-record-actions">
                      <button className="admin-inline-action" type="button" onClick={() => handleEdit(eventRecord)}>
                        Edit
                      </button>
                      <button className="admin-inline-action" type="button" onClick={() => handleToggle(eventRecord)}>
                        {getStatusActionLabel(eventRecord.status)}
                      </button>
                      <button className="admin-inline-action danger-action" type="button" onClick={() => handleDelete(eventRecord)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="admin-managed-empty">No event records have been created yet.</div>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
