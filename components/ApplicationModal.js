"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/client-api";

export default function ApplicationModal({ open, onClose, entity }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", teamName: "", teamMembers: "", details: "" });
  const [isTeam, setIsTeam] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  if (!open || !entity) return null;

  const isEvent = entity.type === 'event';
  const minSize = Number(entity.minTeamSize || 1);
  const maxSize = Number(entity.maxTeamSize || 1);
  const canApplyAsTeam = isEvent && maxSize > 1;

  async function handleSubmit(e) {
    e.preventDefault();
    setPending(true);
    setMessage("");

    if (isTeam) {
      const membersCount = form.teamMembers.split(",").filter(m => m.trim()).length;
      if (membersCount + 1 < minSize || membersCount + 1 > maxSize) {
        setMessage(`Error: Your team must have between ${minSize} and ${maxSize} members total (including you).`);
        setPending(false);
        return;
      }
    }

    try {
      await apiRequest("/api/public/apply", {
        method: "POST",
        body: {
          ...form,
          type: entity.type,
          entity_id: entity.id,
          team_name: isTeam ? form.teamName : null,
          team_members: isTeam ? form.teamMembers : null
        }
      });
      setMessage("Success! Your application has been submitted.");
      setTimeout(() => {
        onClose();
        setForm({ name: "", email: "", phone: "", teamName: "", teamMembers: "", details: "" });
        setIsTeam(false);
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage("Error: " + (error.message || "Failed to submit application"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-dialog">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Apply for {entity.name || entity.title}</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your Name"
            />
          </label>
          <label>
            Email Address
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Phone Number
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Contact Number"
            />
          </label>

          {canApplyAsTeam && (
            <div style={{ margin: '12px 0', padding: '24px', background: 'var(--paper-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: isTeam ? '24px' : '0' }}>
                <input 
                  type="checkbox" 
                  checked={isTeam} 
                  onChange={(e) => setIsTeam(e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                Apply as a Team (Max {maxSize} members)
              </label>
              
              {isTeam && (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <label>
                    Team Name
                    <input
                      type="text"
                      required
                      value={form.teamName}
                      onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                      placeholder="e.g. Cyber Warriors"
                    />
                  </label>
                  <label>
                    Full Names of Teammates (Exclude Yourself)
                    <textarea
                      required
                      value={form.teamMembers}
                      onChange={(e) => setForm({ ...form, teamMembers: e.target.value })}
                      placeholder={`Enter names separated by commas (Min: ${minSize - 1}, Max: ${maxSize - 1})`}
                      rows={3}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          <label>
            Additional Information (Optional)
            <textarea
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="Tell us anything else you'd like us to know..."
              rows={4}
            />
          </label>
          {message && <p className="panel-note" style={{ color: message.startsWith("Error") ? "var(--maroon)" : "var(--green)" }}>{message}</p>}
          <button className="admin-submit full-width" type="submit" disabled={pending}>
            {pending ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
