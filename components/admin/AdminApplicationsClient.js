"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/client-api";
import { formatTimestamp } from "@/lib/presentation";

export default function AdminApplicationsClient() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchApplications() {
    try {
      const data = await apiRequest("/api/admin/applications");
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      await apiRequest(`/api/admin/applications?id=${id}`, { method: "DELETE" });
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (error) {
      alert("Failed to delete application");
    }
  }

  if (loading) return <p>Loading applications...</p>;

  if (applications.length === 0) {
    return (
      <div className="empty-state">
        <p>No applications found.</p>
      </div>
    );
  }

  return (
    <div className="admin-managed-list">
      {applications.map((app) => (
        <div key={app.id} className="admin-record-card">
          <div className="admin-record-copy">
            <div className="admin-record-heading">
              <strong>{app.name}</strong>
              <span className={`record-status ${app.type === 'event' ? 'record-status-published' : 'record-status-draft'}`}>
                {app.type.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
              <span style={{ display: 'block' }}><strong>Target:</strong> {app.entity_title || "Unknown Entity"}</span>
              <span style={{ display: 'block' }}><strong>Email:</strong> {app.email}</span>
              <span style={{ display: 'block' }}><strong>Phone:</strong> {app.phone}</span>
            </div>
            {app.team_name && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'var(--paper-soft)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--gold)', display: 'block', marginBottom: '4px' }}>Team: {app.team_name}</strong>
                <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Members:</strong> {app.team_members}</p>
              </div>
            )}
            {app.details && (
              <div style={{ marginTop: '12px' }}>
                <strong>Additional Info:</strong>
                <p className="panel-note" style={{ marginTop: '4px' }}>{app.details}</p>
              </div>
            )}
            <small className="field-help">Submitted on {formatTimestamp(app.created_at)}</small>
          </div>
          <div className="admin-record-actions">
            <button
              className="admin-inline-action danger-action"
              onClick={() => handleDelete(app.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
