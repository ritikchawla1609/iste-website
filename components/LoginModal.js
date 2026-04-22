"use client";

import { useEffect, useState } from "react";

import { apiRequest } from "@/lib/client-api";

export default function LoginModal({ open, onClose }) {
  const [form, setForm] = useState({ uid: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({ uid: "", password: "" });
      setStatus({ type: "", message: "" });
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);

    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: form,
        allowUnauthorized: true
      });
      setStatus({
        type: "status-success",
        message: "Login successful. Redirecting to the author dashboard."
      });
      window.setTimeout(() => {
        window.location.href = "/author-dashboard";
      }, 250);
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "Invalid UID or password."
      });
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="modal" aria-hidden="false">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
        <button className="modal-close" type="button" aria-label="Close login" onClick={onClose}>
          x
        </button>
        <p className="panel-kicker">Protected Access</p>
        <h2 id="loginTitle">Author Login</h2>
        <p className="modal-copy">
          Enter the authorized credentials to open the author dashboard and manage website
          content.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            UID
            <input
              type="text"
              name="uid"
              placeholder="Enter UID"
              required
              value={form.uid}
              onChange={(event) => setForm((current) => ({ ...current, uid: event.target.value }))}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              required
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
          </label>
          <p className={`form-status ${status.type}`.trim()} aria-live="polite">
            {status.message}
          </p>
          <button className="admin-submit full-width" type="submit" disabled={pending}>
            {pending ? "Logging In..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
