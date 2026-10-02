"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import Alert from "@/components/ui/Alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { contentService } from "@/services/contentService";

export default function NoticePage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function loadNotice() {
      try {
        const data = await contentService.getNotice();
        setText(data.detailText || "");
      } catch (err) {
        setStatusMessage({
          type: "error",
          text: err.message || "Failed to load current notice."
        });
      } finally {
        setLoading(false);
      }
    }
    loadNotice();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: "", text: "" });

    try {
      await contentService.updateNotice(text);
      setStatusMessage({
        type: "success",
        text: "What's New banner message updated successfully on the public website."
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update notice."
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell
      kicker="Content Management"
      title="What's New Notice"
      description="Update the highlighted announcement message shown on the public homepage."
    >
      <Alert
        type={statusMessage.type}
        message={statusMessage.text}
        onClose={() => setStatusMessage({ type: "", text: "" })}
      />

      {loading ? (
        <LoadingSpinner message="Loading notice content..." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
          {/* Editor Form */}
          <div className="admin-card">
            <div className="admin-card-accent" />
            <div className="card-title-row">
              <div>
                <h2 className="card-title">Edit Announcement</h2>
                <p className="card-subtitle">Changes will immediately reflect on the public site.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label className="form-label" htmlFor="notice-text">
                  Announcement Text <span className="required">*</span>
                </label>
                <textarea
                  id="notice-text"
                  rows="6"
                  className="form-textarea"
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the official announcement text..."
                />
              </div>

              <button
                type="submit"
                className="btn-primary btn-accent"
                disabled={saving}
                style={{ justifySelf: "start" }}
              >
                {saving ? "Saving Notice..." : "Save Announcement"}
              </button>
            </form>
          </div>

          {/* Live Preview */}
          <div className="admin-card">
            <div className="admin-card-accent" />
            <div className="card-title-row">
              <div>
                <h2 className="card-title">Live Preview</h2>
                <p className="card-subtitle">Exact visual representation on the public homepage.</p>
              </div>
            </div>

            <div
              style={{
                background: "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)",
                borderRadius: "var(--radius-lg)",
                padding: "32px",
                color: "#ffffff",
                boxShadow: "var(--shadow-md)"
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: "var(--brand-red)",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  marginBottom: "16px"
                }}
              >
                WHAT&apos;S NEW
              </div>
              <p
                style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.7",
                  color: "#e2e8f0"
                }}
              >
                {text || "Enter a message to preview how it looks on the public website."}
              </p>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
