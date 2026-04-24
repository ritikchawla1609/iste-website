"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/client-api";

export default function MemberLoginModal({ open, onClose }) {
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const [form, setForm] = useState({ uid: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({ uid: "", password: "" });
      setStatus({ type: "", message: "" });
      setMode("login");
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

    const endpoint = mode === "login" ? "/api/auth/member-login" : "/api/auth/member-signup";

    try {
      await apiRequest(endpoint, {
        method: "POST",
        body: form,
        allowUnauthorized: true
      });
      setStatus({
        type: "status-success",
        message: mode === "login" ? "Welcome back! Redirecting..." : "Account created! Welcome to ISTE."
      });
      window.setTimeout(() => {
        window.location.href = "/";
      }, 800);
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "An unexpected error occurred."
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
        maxWidth: '440px', 
        padding: '0', 
        overflow: 'hidden', 
        border: 'none',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <button className="modal-close" type="button" onClick={onClose} style={{ top: '24px', right: '24px', zIndex: '20' }}>
          &times;
        </button>

        <div style={{ padding: '48px 40px' }}>
          <header style={{ marginBottom: '32px' }}>
            <p className="section-kicker" style={{ marginBottom: '8px', fontSize: '0.75rem' }}>
              {mode === "login" ? "Welcome Back" : "Join the Community"}
            </p>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--navy-900)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              {mode === "login" ? "Member Login" : "Create Account"}
            </h2>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {mode === "login" 
                ? "Access your member dashboard and stay updated with ISTE CU." 
                : "Become a registered member of ISTE Chandigarh University today."}
            </p>
          </header>

          <form className="login-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--navy-800)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                University UID
              </label>
              <input
                type="text"
                placeholder="e.g. 21BCS1000"
                required
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: '10px', 
                  border: '2px solid var(--line)', 
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  background: '#fcfcfc'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--navy-900)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
                value={form.uid}
                onChange={(e) => setForm({ ...form, uid: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--navy-800)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                required
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: '10px', 
                  border: '2px solid var(--line)', 
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  background: '#fcfcfc'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--navy-900)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--line)'}
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
                backgroundColor: status.type === 'status-success' ? '#f0fdf4' : '#fef2f2',
                color: status.type === 'status-success' ? '#166534' : '#991b1b',
                border: `1px solid ${status.type === 'status-success' ? '#bbf7d0' : '#fecaca'}`,
                animation: 'shake 0.4s ease-in-out'
              }}>
                {status.message}
              </div>
            )}

            <button 
              className="admin-submit" 
              type="submit" 
              disabled={pending}
              style={{ 
                marginTop: '8px',
                height: '54px',
                fontSize: '1rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(11, 17, 32, 0.15)'
              }}
            >
              {pending ? (mode === "login" ? "Authenticating..." : "Creating Account...") : (mode === "login" ? "Sign In" : "Register Now")}
            </button>
          </form>

          <footer style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)' }}>
              {mode === "login" ? "New to the portal?" : "Already have an account?"}
              <button 
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setStatus({ type: "", message: "" });
                }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--navy-900)', 
                  fontWeight: '800', 
                  cursor: 'pointer',
                  marginLeft: '8px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px'
                }}
              >
                {mode === "login" ? "Create an account" : "Log in here"}
              </button>
            </p>
          </footer>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
