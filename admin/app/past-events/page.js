"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import Alert from "@/components/ui/Alert";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { pastEventService } from "@/services/pastEventService";

const INITIAL_PAST_EVENT = {
  name: "",
  category: "Event",
  eventDate: "",
  description: "",
  winners: "",
  images: [] // Array of { type: 'existing' | 'new', path?: string, dataUrl?: string, name?: string }
};

export default function PastEventsPage() {
  const [events, setEvents] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // Event modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_PAST_EVENT);
  const [submitting, setSubmitting] = useState(false);

  // Hero carousel upload state
  const [savingHero, setSavingHero] = useState(false);

  async function loadData() {
    try {
      const [eventsData, heroData] = await Promise.all([
        pastEventService.getPastEvents(),
        pastEventService.getHeroImages()
      ]);
      setEvents(eventsData);
      setHeroImages(heroData.map((path) => ({ type: "existing", path })));
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to load past events and media."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleOpenCreate() {
    setEditingId(null);
    setForm(INITIAL_PAST_EVENT);
    setModalOpen(true);
  }

  function handleOpenEdit(event) {
    setEditingId(event.id);
    const existingImages = (event.imagePaths || event.image_paths || "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((path) => ({ type: "existing", path }));

    setForm({
      name: event.name || "",
      category: event.category || "Event",
      eventDate: event.eventDate || event.event_date || "",
      description: event.description || "",
      winners: event.winners || "",
      images: existingImages
    });
    setModalOpen(true);
  }

  function handleEventFilesChange(e) {
    const files = Array.from(e.target.files || []);
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    for (const file of files) {
      if (file.size > 4 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 4 MB.`);
        e.target.value = "";
        return;
      }
      if (!allowed.includes(file.type)) {
        alert(`File "${file.name}" has an unsupported format. Use JPG, PNG, or WEBP.`);
        e.target.value = "";
        return;
      }
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            { type: "new", dataUrl: reader.result, name: file.name }
          ]
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }

  function handleRemoveEventImage(index) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }

  async function handleSubmitEvent(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const existingPaths = form.images
        .filter((img) => img.type === "existing")
        .map((img) => img.path);

      const newImages = form.images
        .filter((img) => img.type === "new")
        .map((img) => img.dataUrl);

      const payload = {
        name: form.name,
        category: form.category,
        eventDate: form.eventDate,
        description: form.description,
        winners: form.winners,
        imagePaths: existingPaths,
        images: newImages
      };

      if (editingId) {
        await pastEventService.updatePastEvent(editingId, payload);
        setStatusMessage({
          type: "success",
          text: `Past event "${form.name}" updated successfully.`
        });
      } else {
        await pastEventService.createPastEvent(payload);
        setStatusMessage({
          type: "success",
          text: `Past event "${form.name}" created successfully.`
        });
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to save past event."
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEvent(event) {
    if (!confirm(`Are you sure you want to delete "${event.name}"?`)) return;

    try {
      await pastEventService.deletePastEvent(event.id);
      setStatusMessage({
        type: "success",
        text: `Past event "${event.name}" deleted successfully.`
      });
      await loadData();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to delete past event."
      });
    }
  }

  // Hero carousel management
  function handleHeroFilesChange(e) {
    const files = Array.from(e.target.files || []);
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    for (const file of files) {
      if (file.size > 4 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 4 MB.`);
        e.target.value = "";
        return;
      }
      if (!allowed.includes(file.type)) {
        alert(`File "${file.name}" has an unsupported format.`);
        e.target.value = "";
        return;
      }
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImages((prev) => [
          ...prev,
          { type: "new", dataUrl: reader.result, name: file.name }
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }

  function handleRemoveHeroImage(index) {
    setHeroImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveHeroCarousel() {
    setSavingHero(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const imagePaths = heroImages
        .filter((img) => img.type === "existing")
        .map((img) => img.path);

      const imagesDataUrls = heroImages
        .filter((img) => img.type === "new")
        .map((img) => img.dataUrl);

      await pastEventService.updateHeroImages({
        imagePaths,
        images: imagesDataUrls
      });

      setStatusMessage({
        type: "success",
        text: "Past Events hero carousel photos updated successfully."
      });
      await loadData();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update hero carousel photos."
      });
    } finally {
      setSavingHero(false);
    }
  }

  return (
    <AdminShell
      kicker="Media & History"
      title="Past Events & Gallery"
      description="Manage milestone records, achievements, past hackathons, and the hero carousel image gallery."
      actions={
        <button type="button" className="btn-primary btn-accent" onClick={handleOpenCreate}>
          <span>➕</span> Add Past Event
        </button>
      }
    >
      <Alert
        type={statusMessage.type}
        message={statusMessage.text}
        onClose={() => setStatusMessage({ type: "", text: "" })}
      />

      {/* Hero Carousel Media Section */}
      <div className="admin-card">
        <div className="admin-card-accent" />
        <div className="card-title-row">
          <div>
            <h2 className="card-title">Past Events Hero Carousel</h2>
            <p className="card-subtitle">
              Manage the rotating showcase banner photos on the public Previous Events page.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={handleSaveHeroCarousel}
            disabled={savingHero}
          >
            {savingHero ? "Saving Gallery..." : "Save Carousel Changes"}
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>
            Add Carousel Photos (Max 4 MB &bull; JPG, PNG, WEBP)
          </label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleHeroFilesChange}
            className="form-input"
          />
        </div>

        {heroImages.length === 0 ? (
          <p style={{ color: "var(--text-soft)", fontSize: "0.9rem" }}>
            No hero carousel photos configured. Upload photos above to populate the carousel.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "14px"
            }}
          >
            {heroImages.map((img, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid var(--line)",
                  height: "100px",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <img
                  src={img.type === "new" ? img.dataUrl : `/${img.path}`}
                  alt="Carousel item"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHeroImage(idx)}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "rgba(220, 38, 38, 0.85)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    width: "22px",
                    height: "22px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  title="Remove image"
                >
                  &times;
                </button>
                {img.type === "new" && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      left: "4px",
                      background: "rgba(37, 99, 235, 0.9)",
                      color: "white",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "4px"
                    }}
                  >
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Events Archive List */}
      <div className="card-title-row" style={{ marginTop: "40px" }}>
        <div>
          <h2 className="card-title">Past Events Records ({events.length})</h2>
          <p className="card-subtitle">List of past completed chapter events, induction ceremonies, and hackathons.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading past events..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon="🏆"
          title="No past events"
          description="Record your first completed event to build your society archive."
          actionLabel="Add Past Event"
          onAction={handleOpenCreate}
        />
      ) : (
        <div>
          {events.map((event) => {
            const rawImages = (event.imagePaths || event.image_paths || "")
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean);

            return (
              <article key={event.id} className="item-card">
                <div className="item-main">
                  <div className="item-header">
                    <h3 className="item-title">{event.name}</h3>
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
                      {event.category || "Event"}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>
                      📅 {event.eventDate || event.event_date || "Date TBA"}
                    </span>
                  </div>

                  <p className="item-description">{event.description}</p>

                  {event.winners && (
                    <p style={{ fontSize: "0.85rem", color: "var(--navy-800)", marginTop: "8px" }}>
                      <strong>🏆 Highlights / Winners:</strong> {event.winners}
                    </p>
                  )}

                  {rawImages.length > 0 && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                      {rawImages.map((imgPath, imgIdx) => (
                        <div
                          key={imgIdx}
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            border: "1px solid var(--line)"
                          }}
                        >
                          <img
                            src={`/${imgPath}`}
                            alt="Past event thumb"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="item-actions">
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
                    onClick={() => handleDeleteEvent(event)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? `Edit Past Event: ${form.name}` : "Add Past Event Record"}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmitEvent} className="admin-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="pe-name">
                Event Name <span className="required">*</span>
              </label>
              <input
                id="pe-name"
                type="text"
                className="form-input"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. CUMUN 2025"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pe-category">
                Category <span className="required">*</span>
              </label>
              <input
                id="pe-category"
                type="text"
                className="form-input"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Hackathon, Induction, Conference"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pe-date">
              Event Date <span className="required">*</span>
            </label>
            <input
              id="pe-date"
              type="date"
              className="form-input"
              required
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pe-desc">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="pe-desc"
              rows="3"
              className="form-textarea"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Summary of the event outcome and proceedings."
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pe-winners">
              Highlights &amp; Winners
            </label>
            <input
              id="pe-winners"
              type="text"
              className="form-input"
              value={form.winners}
              onChange={(e) => setForm({ ...form, winners: e.target.value })}
              placeholder="e.g. 1st Place: Team Alpha, 2nd Place: Team Beta"
            />
          </div>

          {/* Event Photo Uploads */}
          <div className="form-group">
            <label className="form-label" htmlFor="pe-images">
              Event Gallery Photos (Max 4 MB &bull; JPG, PNG, WEBP)
            </label>
            <input
              id="pe-images"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleEventFilesChange}
              className="form-input"
            />

            {form.images.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                  gap: "10px",
                  marginTop: "12px"
                }}
              >
                {form.images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      borderRadius: "6px",
                      overflow: "hidden",
                      border: "1px solid var(--line)",
                      height: "70px"
                    }}
                  >
                    <img
                      src={img.type === "new" ? img.dataUrl : `/${img.path}`}
                      alt="Thumbnail"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveEventImage(idx)}
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "2px",
                        background: "rgba(220, 38, 38, 0.9)",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        width: "18px",
                        height: "18px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      title="Remove"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              {submitting ? "Saving..." : editingId ? "Update Past Event" : "Add Past Event"}
            </button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}
