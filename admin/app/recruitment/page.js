"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { recruitmentService } from "@/services/recruitmentService";

const RECRUITMENT_DOMAINS = [
  { id: "01", name: "Technical", icon: "💻" },
  { id: "02", name: "Creative & Design", icon: "🎨" },
  { id: "03", name: "Management", icon: "📊" },
  { id: "04", name: "Operations", icon: "⚙️" },
  { id: "05", name: "Public Relations", icon: "📢" }
];

const INITIAL_RECRUITMENT = {
  title: "",
  organization: "ISTE Student Chapter",
  domain: "",
  mode: "In-person",
  location: "Chandigarh University",
  deadline: "",
  applicationLink: "#",
  contactName: "ISTE-CUSC",
  contactEmail: "iste@cumail.in",
  description: "",
  status: "draft"
};

export default function RecruitmentPage() {
  const [recruitments, setRecruitments] = useState([]);
  const [domainStatus, setDomainStatus] = useState({
    "01": "active",
    "02": "active",
    "03": "active",
    "04": "active",
    "05": "active"
  });
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(INITIAL_RECRUITMENT);
  const [submitting, setSubmitting] = useState(false);
  const [togglingDomain, setTogglingDomain] = useState(null);

  async function loadData() {
    try {
      const [recList, domStatus] = await Promise.all([
        recruitmentService.getRecruitments(),
        recruitmentService.getDomainStatus()
      ]);
      setRecruitments(recList);
      if (domStatus) setDomainStatus(domStatus);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to load recruitment data."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleToggleDomain(domainId) {
    const nextStatus = domainStatus[domainId] === "active" ? "inactive" : "active";
    const updatedStatus = { ...domainStatus, [domainId]: nextStatus };
    setTogglingDomain(domainId);

    try {
      await recruitmentService.updateDomainStatus(updatedStatus);
      setDomainStatus(updatedStatus);
      setStatusMessage({
        type: "success",
        text: `Domain "${RECRUITMENT_DOMAINS.find((d) => d.id === domainId)?.name}" recruitment status updated to ${nextStatus}.`
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update domain status."
      });
    } finally {
      setTogglingDomain(null);
    }
  }

  function handleOpenCreate() {
    setEditingItem(null);
    setForm(INITIAL_RECRUITMENT);
    setModalOpen(true);
  }

  function handleOpenEdit(item) {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      organization: item.organization || "ISTE Student Chapter",
      domain: item.domain || "",
      mode: item.mode || "In-person",
      location: item.location || "Chandigarh University",
      deadline: item.deadline || "",
      applicationLink: item.applicationLink || item.application_link || "#",
      contactName: item.contactName || item.contact_name || "",
      contactEmail: item.contactEmail || item.contact_email || "",
      description: item.description || "",
      status: item.status || "draft"
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage({ type: "", text: "" });

    try {
      if (editingItem) {
        await recruitmentService.updateRecruitment(editingItem.id, form);
        setStatusMessage({
          type: "success",
          text: `Recruitment posting "${form.title}" updated successfully.`
        });
      } else {
        await recruitmentService.createRecruitment(form);
        setStatusMessage({
          type: "success",
          text: `Recruitment posting "${form.title}" created successfully.`
        });
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to save recruitment posting."
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(item) {
    const nextStatus = item.status === "published" ? "draft" : "published";
    try {
      await recruitmentService.toggleRecruitmentStatus(item.id, nextStatus);
      setStatusMessage({
        type: "success",
        text: `Posting "${item.title}" status changed to ${nextStatus}.`
      });
      await loadData();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update posting status."
      });
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      await recruitmentService.deleteRecruitment(item.id);
      setStatusMessage({
        type: "success",
        text: `Recruitment posting "${item.title}" deleted successfully.`
      });
      await loadData();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to delete posting."
      });
    }
  }

  return (
    <AdminShell
      kicker="Hiring & Membership"
      title="Recruitment Management"
      description="Manage official core team hiring postings, membership application campaigns, and domain acceptance toggles."
      actions={
        <button type="button" className="btn-primary btn-accent" onClick={handleOpenCreate}>
          <span>➕</span> Add Recruitment Posting
        </button>
      }
    >
      <Alert
        type={statusMessage.type}
        message={statusMessage.text}
        onClose={() => setStatusMessage({ type: "", text: "" })}
      />

      {/* Domain Status Section */}
      <div className="admin-card">
        <div className="admin-card-accent" />
        <div className="card-title-row">
          <div>
            <h2 className="card-title">Domain Application Acceptance Controls</h2>
            <p className="card-subtitle">
              Controls whether applicants can select and apply for this domain on the public recruitment form.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px"
          }}
        >
          {RECRUITMENT_DOMAINS.map((domain) => {
            const isActive = domainStatus[domain.id] === "active";
            const isToggling = togglingDomain === domain.id;

            return (
              <div
                key={domain.id}
                style={{
                  background: isActive ? "#f0fdf4" : "#f8fafc",
                  border: `1.5px solid ${isActive ? "#bbf7d0" : "var(--line)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.4rem" }}>{domain.icon}</span>
                  <div>
                    <strong style={{ display: "block", color: "var(--navy-900)" }}>{domain.name}</strong>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: isActive ? "#166534" : "#64748b"
                      }}
                    >
                      {isActive ? "● Open" : "○ Closed"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={isActive ? "btn-secondary btn-sm" : "btn-primary btn-sm"}
                  onClick={() => handleToggleDomain(domain.id)}
                  disabled={isToggling}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {isToggling
                    ? "Updating..."
                    : isActive
                    ? "Deactivate Domain"
                    : "Activate Domain"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recruitment Postings List */}
      <div className="card-title-row" style={{ marginTop: "40px" }}>
        <div>
          <h2 className="card-title">Recruitment Postings ({recruitments.length})</h2>
          <p className="card-subtitle">Active and archived membership and core team recruitment drives.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading recruitment postings..." />
      ) : recruitments.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No recruitment drives found"
          description="Create your first hiring posting to begin receiving student applications."
          actionLabel="Create Posting"
          onAction={handleOpenCreate}
        />
      ) : (
        <div>
          {recruitments.map((item) => (
            <article key={item.id} className="item-card">
              <div className="item-main">
                <div className="item-header">
                  <h3 className="item-title">{item.title}</h3>
                  <Badge status={item.status} />
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
                    {item.domain}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>
                    📍 {item.location} ({item.mode})
                  </span>
                </div>

                <div className="item-meta-grid">
                  <span>
                    <strong>Organization:</strong> {item.organization}
                  </span>
                  <span>
                    <strong>Deadline:</strong> {item.deadline || "Open until filled"}
                  </span>
                  <span>
                    <strong>Contact:</strong> {item.contactName || item.contact_name} (
                    {item.contactEmail || item.contact_email})
                  </span>
                </div>

                <p className="item-description">{item.description}</p>
              </div>

              <div className="item-actions">
                <button
                  type="button"
                  className={item.status === "published" ? "btn-secondary btn-sm" : "btn-primary btn-sm"}
                  onClick={() => handleToggleStatus(item)}
                >
                  {item.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => handleOpenEdit(item)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm btn-danger"
                  onClick={() => handleDelete(item)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit Posting: ${form.title}` : "Add Recruitment Posting"}
        maxWidth="680px"
      >
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label className="form-label" htmlFor="rec-title">
              Posting Title <span className="required">*</span>
            </label>
            <input
              id="rec-title"
              type="text"
              className="form-input"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. ISTE Student Chapter Membership Drive"
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="rec-domain">
                Domain / Field <span className="required">*</span>
              </label>
              <input
                id="rec-domain"
                type="text"
                className="form-input"
                required
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                placeholder="e.g. Technical, Design, Operations"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rec-org">
                Organization <span className="required">*</span>
              </label>
              <input
                id="rec-org"
                type="text"
                className="form-input"
                required
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="rec-mode">
                Mode
              </label>
              <select
                id="rec-mode"
                className="form-select"
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                <option value="In-person">In-person</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rec-loc">
                Location
              </label>
              <input
                id="rec-loc"
                type="text"
                className="form-input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rec-deadline">
                Deadline <span className="required">*</span>
              </label>
              <input
                id="rec-deadline"
                type="date"
                className="form-input"
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="rec-cname">
                Contact Person <span className="required">*</span>
              </label>
              <input
                id="rec-cname"
                type="text"
                className="form-input"
                required
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rec-cemail">
                Contact Email <span className="required">*</span>
              </label>
              <input
                id="rec-cemail"
                type="email"
                className="form-input"
                required
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="rec-desc">
              Description &amp; Candidate Expectations <span className="required">*</span>
            </label>
            <textarea
              id="rec-desc"
              rows="4"
              className="form-textarea"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Responsibilities, benefits, and domain scope."
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="rec-status">
              Publication Status <span className="required">*</span>
            </label>
            <select
              id="rec-status"
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published (Visible on Website)</option>
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
              {submitting ? "Saving..." : editingItem ? "Update Posting" : "Publish Posting"}
            </button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}
