"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import Alert from "@/components/ui/Alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { contentService } from "@/services/contentService";

export default function AboutContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    heroTitle: "",
    heroText: "",
    overviewTitle: "",
    overviewParagraphOne: "",
    overviewParagraphTwo: "",
    visionTitle: "",
    visionItems: "",
    focusTitle: "",
    focusOneTitle: "",
    focusOneText: "",
    focusTwoTitle: "",
    focusTwoText: "",
    focusThreeTitle: "",
    focusThreeText: "",
    facultyTitle: "",
    facultyText: "",
    teamTitle: "",
    teamText: "",
    galleryTitle: "",
    galleryText: "",
    pastEventsTitle: "",
    pastEventsText: "",
    downloadsTitle: "",
    downloadsText: "",
    policyTitle: "",
    policyText: "",
    contactTitle: "",
    contactText: "",
    adminNoteTitle: "",
    adminNoteText: ""
  });

  useEffect(() => {
    async function loadAbout() {
      try {
        const about = await contentService.getAbout();
        const focusCards = Array.isArray(about.focusCards) ? about.focusCards : [];

        setForm({
          heroTitle: about.heroTitle || "",
          heroText: about.heroText || "",
          overviewTitle: about.overviewTitle || "",
          overviewParagraphOne: about.overviewParagraphOne || "",
          overviewParagraphTwo: about.overviewParagraphTwo || "",
          visionTitle: about.visionTitle || "",
          visionItems: Array.isArray(about.visionItems)
            ? about.visionItems.join("\n")
            : String(about.visionItems || ""),
          focusTitle: about.focusTitle || "",
          focusOneTitle: focusCards[0]?.title || "",
          focusOneText: focusCards[0]?.text || "",
          focusTwoTitle: focusCards[1]?.title || "",
          focusTwoText: focusCards[1]?.text || "",
          focusThreeTitle: focusCards[2]?.title || "",
          focusThreeText: focusCards[2]?.text || "",
          facultyTitle: about.facultyTitle || "",
          facultyText: about.facultyText || "",
          teamTitle: about.teamTitle || "",
          teamText: about.teamText || "",
          galleryTitle: about.galleryTitle || "",
          galleryText: about.galleryText || "",
          pastEventsTitle: about.pastEventsTitle || "",
          pastEventsText: about.pastEventsText || "",
          downloadsTitle: about.downloadsTitle || "",
          downloadsText: about.downloadsText || "",
          policyTitle: about.policyTitle || "",
          policyText: about.policyText || "",
          contactTitle: about.contactTitle || "",
          contactText: about.contactText || "",
          adminNoteTitle: about.adminNoteTitle || "",
          adminNoteText: about.adminNoteText || ""
        });
      } catch (err) {
        setStatusMessage({
          type: "error",
          text: err.message || "Failed to load About Us content."
        });
      } finally {
        setLoading(false);
      }
    }
    loadAbout();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: "", text: "" });

    const payload = {
      heroTitle: form.heroTitle,
      heroText: form.heroText,
      overviewTitle: form.overviewTitle,
      overviewParagraphOne: form.overviewParagraphOne,
      overviewParagraphTwo: form.overviewParagraphTwo,
      visionTitle: form.visionTitle,
      visionItems: form.visionItems
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      focusTitle: form.focusTitle,
      focusCards: [
        { title: form.focusOneTitle, text: form.focusOneText },
        { title: form.focusTwoTitle, text: form.focusTwoText },
        { title: form.focusThreeTitle, text: form.focusThreeText }
      ],
      facultyTitle: form.facultyTitle,
      facultyText: form.facultyText,
      teamTitle: form.teamTitle,
      teamText: form.teamText,
      galleryTitle: form.galleryTitle,
      galleryText: form.galleryText,
      pastEventsTitle: form.pastEventsTitle,
      pastEventsText: form.pastEventsText,
      downloadsTitle: form.downloadsTitle,
      downloadsText: form.downloadsText,
      policyTitle: form.policyTitle,
      policyText: form.policyText,
      contactTitle: form.contactTitle,
      contactText: form.contactText,
      adminNoteTitle: form.adminNoteTitle,
      adminNoteText: form.adminNoteText
    };

    try {
      await contentService.updateAbout(payload);
      setStatusMessage({
        type: "success",
        text: "About Us content saved successfully and updated on the public website."
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update About Us content."
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      kicker="Content Management"
      title="About Us Content Editor"
      description="Update chapter mission, faculty messages, vision items, core values, and official policy texts."
    >
      <Alert
        type={statusMessage.type}
        message={statusMessage.text}
        onClose={() => setStatusMessage({ type: "", text: "" })}
      />

      {loading ? (
        <LoadingSpinner message="Loading About Us content..." />
      ) : (
        <form onSubmit={handleSubmit} className="admin-form">
          {/* Hero Section */}
          <div className="admin-card">
            <div className="admin-card-accent" />
            <div className="card-title-row">
              <h2 className="card-title">About Hero Banner</h2>
            </div>
            <div className="form-group">
              <label className="form-label">Hero Title</label>
              <input
                type="text"
                className="form-input"
                value={form.heroTitle}
                onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">Hero Subtitle</label>
              <textarea
                rows="3"
                className="form-textarea"
                value={form.heroText}
                onChange={(e) => setForm({ ...form, heroText: e.target.value })}
              />
            </div>
          </div>

          {/* Overview Section */}
          <div className="admin-card">
            <div className="admin-card-accent" />
            <div className="card-title-row">
              <h2 className="card-title">Society Overview</h2>
            </div>
            <div className="form-group">
              <label className="form-label">Overview Heading</label>
              <input
                type="text"
                className="form-input"
                value={form.overviewTitle}
                onChange={(e) => setForm({ ...form, overviewTitle: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">First Paragraph</label>
              <textarea
                rows="3"
                className="form-textarea"
                value={form.overviewParagraphOne}
                onChange={(e) => setForm({ ...form, overviewParagraphOne: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">Second Paragraph</label>
              <textarea
                rows="3"
                className="form-textarea"
                value={form.overviewParagraphTwo}
                onChange={(e) => setForm({ ...form, overviewParagraphTwo: e.target.value })}
              />
            </div>
          </div>

          {/* Vision & Objectives */}
          <div className="admin-card">
            <div className="admin-card-accent" />
            <div className="card-title-row">
              <h2 className="card-title">Vision &amp; Objectives</h2>
            </div>
            <div className="form-group">
              <label className="form-label">Vision Heading</label>
              <input
                type="text"
                className="form-input"
                value={form.visionTitle}
                onChange={(e) => setForm({ ...form, visionTitle: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label className="form-label">Vision Bullet Items (One item per line)</label>
              <textarea
                rows="5"
                className="form-textarea"
                value={form.visionItems}
                onChange={(e) => setForm({ ...form, visionItems: e.target.value })}
              />
            </div>
          </div>

          {/* Three Focus Cards */}
          <div className="admin-card">
            <div className="admin-card-accent" />
            <div className="card-title-row">
              <h2 className="card-title">Key Focus Pillars</h2>
            </div>
            <div className="form-group">
              <label className="form-label">Focus Section Heading</label>
              <input
                type="text"
                className="form-input"
                value={form.focusTitle}
                onChange={(e) => setForm({ ...form, focusTitle: e.target.value })}
              />
            </div>

            <div className="form-grid-3" style={{ marginTop: "20px" }}>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--line)"
                }}
              >
                <label className="form-label">Pillar 1 Title</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ marginBottom: "10px" }}
                  value={form.focusOneTitle}
                  onChange={(e) => setForm({ ...form, focusOneTitle: e.target.value })}
                />
                <label className="form-label">Pillar 1 Description</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  value={form.focusOneText}
                  onChange={(e) => setForm({ ...form, focusOneText: e.target.value })}
                />
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--line)"
                }}
              >
                <label className="form-label">Pillar 2 Title</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ marginBottom: "10px" }}
                  value={form.focusTwoTitle}
                  onChange={(e) => setForm({ ...form, focusTwoTitle: e.target.value })}
                />
                <label className="form-label">Pillar 2 Description</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  value={form.focusTwoText}
                  onChange={(e) => setForm({ ...form, focusTwoText: e.target.value })}
                />
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--line)"
                }}
              >
                <label className="form-label">Pillar 3 Title</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ marginBottom: "10px" }}
                  value={form.focusThreeTitle}
                  onChange={(e) => setForm({ ...form, focusThreeTitle: e.target.value })}
                />
                <label className="form-label">Pillar 3 Description</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  value={form.focusThreeText}
                  onChange={(e) => setForm({ ...form, focusThreeText: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Faculty, Team, and Gallery */}
          <div className="admin-card">
            <div className="admin-card-accent" />
            <div className="card-title-row">
              <h2 className="card-title">Advisory, Team &amp; Gallery</h2>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Faculty Advisor Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.facultyTitle}
                  onChange={(e) => setForm({ ...form, facultyTitle: e.target.value })}
                />
                <label className="form-label" style={{ marginTop: "10px" }}>
                  Faculty Advisor Text
                </label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  value={form.facultyText}
                  onChange={(e) => setForm({ ...form, facultyText: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Leadership Team Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.teamTitle}
                  onChange={(e) => setForm({ ...form, teamTitle: e.target.value })}
                />
                <label className="form-label" style={{ marginTop: "10px" }}>
                  Leadership Team Text
                </label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  value={form.teamText}
                  onChange={(e) => setForm({ ...form, teamText: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ marginTop: "20px" }}>
              <div className="form-group">
                <label className="form-label">Gallery Heading</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.galleryTitle}
                  onChange={(e) => setForm({ ...form, galleryTitle: e.target.value })}
                />
                <label className="form-label" style={{ marginTop: "10px" }}>
                  Gallery Text
                </label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  value={form.galleryText}
                  onChange={(e) => setForm({ ...form, galleryText: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Past Events Section Heading</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.pastEventsTitle}
                  onChange={(e) => setForm({ ...form, pastEventsTitle: e.target.value })}
                />
                <label className="form-label" style={{ marginTop: "10px" }}>
                  Past Events Section Text
                </label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  value={form.pastEventsText}
                  onChange={(e) => setForm({ ...form, pastEventsText: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Policies, Contact, and Administrative Note */}
          <div className="admin-card">
            <div className="admin-card-accent" />
            <div className="card-title-row">
              <h2 className="card-title">Governance &amp; Contact</h2>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Downloads &amp; Resources Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.downloadsTitle}
                  onChange={(e) => setForm({ ...form, downloadsTitle: e.target.value })}
                />
                <label className="form-label" style={{ marginTop: "10px" }}>
                  Downloads &amp; Resources Text
                </label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  value={form.downloadsText}
                  onChange={(e) => setForm({ ...form, downloadsText: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Society Policies Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.policyTitle}
                  onChange={(e) => setForm({ ...form, policyTitle: e.target.value })}
                />
                <label className="form-label" style={{ marginTop: "10px" }}>
                  Society Policies Text
                </label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  value={form.policyText}
                  onChange={(e) => setForm({ ...form, policyText: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2" style={{ marginTop: "20px" }}>
              <div className="form-group">
                <label className="form-label">Contact Us Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.contactTitle}
                  onChange={(e) => setForm({ ...form, contactTitle: e.target.value })}
                />
                <label className="form-label" style={{ marginTop: "10px" }}>
                  Contact Us Text
                </label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  value={form.contactText}
                  onChange={(e) => setForm({ ...form, contactText: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Administrative Note Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.adminNoteTitle}
                  onChange={(e) => setForm({ ...form, adminNoteTitle: e.target.value })}
                />
                <label className="form-label" style={{ marginTop: "10px" }}>
                  Administrative Note Text
                </label>
                <textarea
                  rows="2"
                  className="form-textarea"
                  value={form.adminNoteText}
                  onChange={(e) => setForm({ ...form, adminNoteText: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
            <button
              type="submit"
              className="btn-primary btn-accent"
              disabled={saving}
              style={{ padding: "14px 32px", fontSize: "1rem" }}
            >
              {saving ? "Saving All Changes..." : "Save About Us Content"}
            </button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
