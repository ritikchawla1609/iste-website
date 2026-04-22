"use client";

import { useState } from "react";

import { apiRequest } from "@/lib/client-api";
import { normalizeNotice } from "@/lib/presentation";

export default function AdminNoticeClient({ initialNotice }) {
  const [notice, setNotice] = useState(normalizeNotice(initialNotice));
  const [text, setText] = useState(normalizeNotice(initialNotice).detailText);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);

    try {
      const response = await apiRequest("/api/admin/site-content/notice", {
        method: "PUT",
        body: { detailText: text }
      });
      const nextNotice = normalizeNotice(response.notice);
      setNotice(nextNotice);
      setText(nextNotice.detailText);
      setStatus({
        type: "status-success",
        message: "Whats New content updated successfully."
      });
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "Unable to update the Whats New section."
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-heading">
        <div>
          <p className="panel-kicker">Homepage Management</p>
          <h2>Current whats new message</h2>
        </div>
      </div>

      <div className="admin-grid">
        <article className="admin-card">
          <h3>Update Whats New</h3>
          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Whats New Description
              <textarea
                name="detailText"
                rows="5"
                placeholder="Enter the homepage whats new message"
                required
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
            </label>
            <p className={`admin-form-status ${status.type}`.trim()} aria-live="polite">
              {status.message}
            </p>
            <button className="admin-submit" type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save Whats New"}
            </button>
          </form>
        </article>

        <article className="admin-card">
          <h3>Live Preview</h3>
          <p className="panel-note">This preview reflects the current homepage whats new content.</p>
          <div className="intro-panel admin-preview-panel">
            <p className="panel-kicker">Whats New</p>
            <p>{notice.detailText}</p>
          </div>
        </article>
      </div>
    </section>
  );
}
