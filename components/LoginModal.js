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
    if (!open) return undefined;
    const handleEscape = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setStatus({ type: "", message: "" });

    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: form,
        allowUnauthorized: true
      });
      setStatus({
        type: "status-success",
        message: "Authorized. Redirecting to dashboard..."
      });
      window.setTimeout(() => {
        window.location.href = "/author-dashboard";
      }, 800);
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "Invalid credentials."
      });
    } finally {
      setPending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-backdrop" onClick={onClose} style={{ animation: 'fadeIn 0.3s ease' }} />
      <div className="modal-dialog" role="dialog" aria-modal="true" style={{ 
        maxWidth: '400px', 
        padding: '0', 
        overflow: 'hidden', 
        border: 'none',
        background: 'var(--navy-900)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <button className="modal-close" type="button" onClick={onClose} style={{ 
          top: '20px', 
          right: '20px', 
          background: 'rgba(255,255,255,0.1)', 
          color: 'white',
          border: 'none'
        }}>
          &times;
        </button>

        <div style={{ padding: '48px 40px' }}>
          <header style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: 'var(--brand-red)', 
              borderRadius: '16px', 
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 10px 20px rgba(220, 38, 38, 0.3)'
            }}>
              🔒
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Author Access
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Administrative login for portal management.
            </p>
          </header>

          <form className="login-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--brand-red)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Admin UID
              </label>
              <input
                type="text"
                placeholder="Enter UID"
                required
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: '10px', 
                  border: '2px solid rgba(255,255,255,0.1)', 
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--brand-red)';
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
                value={form.uid}
                onChange={(e) => setForm({ ...form, uid: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--brand-red)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Secure Password
              </label>
              <input
                type="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                required
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: '10px', 
                  border: '2px solid rgba(255,255,255,0.1)', 
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--brand-red)';
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {status.message && (
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                fontWeight: '600',
                backgroundColor: status.type === 'status-success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: status.type === 'status-success' ? '#4ade80' : '#f87171',
                border: `1px solid ${status.type === 'status-success' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                textAlign: 'center'
              }}>
                {status.message}
              </div>
            )}

            <button 
              className="admin-submit" 
              type="submit" 
              disabled={pending}
              style={{ 
                marginTop: '12px',
                height: '54px',
                fontSize: '0.9rem',
                borderRadius: '12px',
                background: 'var(--brand-red)',
                color: 'var(--navy-900)',
                boxShadow: '0 4px 20px rgba(220, 38, 38, 0.2)'
              }}
            >
              {pending ? "Verifying Authority..." : "Authenticate Access"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
