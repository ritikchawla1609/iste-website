"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/client-api";
import { formatTimestamp, RECRUITMENT_TEAMS } from "@/lib/presentation";

export default function AdminApplicationsClient() {
  const [applications, setApplications] = useState([]);
  const [recruitmentApplications, setRecruitmentApplications] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("01");
  const [loading, setLoading] = useState(true);

  async function fetchApplications() {
    try {
      const [data, recruitmentData] = await Promise.all([
        apiRequest("/api/admin/applications"),
        apiRequest("/api/admin/recruitment-applications")
      ]);
      setApplications(data);
      setRecruitmentApplications(recruitmentData.applications || []);
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

  async function handleRecruitmentDelete(id) {
    if (!confirm("Are you sure you want to delete this recruitment application?")) return;
    try {
      await apiRequest(`/api/admin/recruitment-applications?id=${id}`, { method: "DELETE" });
      setRecruitmentApplications((current) => current.filter((application) => application.id !== id));
    } catch (error) {
      alert("Failed to delete recruitment application");
    }
  }

  if (loading) return <p>Loading applications...</p>;

  const selectedTeam = RECRUITMENT_TEAMS.find((team) => team.id === selectedDomain);
  const domainApplications = recruitmentApplications.filter((application) => application.domain_id === selectedDomain);

  return (
    <div className="admin-applications-sections">
      <section className="admin-card recruitment-response-section">
        <div className="admin-heading">
          <div>
            <p className="panel-kicker">Recruitment Responses</p>
            <h3>Applications by domain</h3>
          </div>
          <span className="team-count-pill">{recruitmentApplications.length} Responses</span>
        </div>
        <div className="recruitment-domain-tabs" role="tablist" aria-label="Recruitment domains">
          {RECRUITMENT_TEAMS.map((team) => {
            const count = recruitmentApplications.filter((application) => application.domain_id === team.id).length;
            return (
              <button
                key={team.id}
                type="button"
                className={`admin-inline-action ${selectedDomain === team.id ? "is-active" : ""}`.trim()}
                onClick={() => setSelectedDomain(team.id)}
              >
                {team.name} ({count})
              </button>
            );
          })}
        </div>
        <div className="admin-managed-list">
          {domainApplications.length ? domainApplications.map((app) => (
            <article key={app.id} className="admin-record-card recruitment-response-card">
              <div className="admin-record-copy">
                <div className="admin-record-heading">
                  <strong>{app.name}</strong>
                  <span className="record-status record-status-published">{app.uid}</span>
                </div>
                <div className="recruitment-response-grid">
                  <span><strong>Domain:</strong> {app.domain_name}</span>
                  <span><strong>Contact:</strong> {app.contact}</span>
                  <span><strong>Outlook:</strong> {app.outlook_email}</span>
                  <span><strong>Personal email:</strong> {app.personal_email}</span>
                  <span><strong>Gender:</strong> {app.gender}</span>
                  <span><strong>Year:</strong> {app.year_of_study}</span>
                  <span><strong>Course:</strong> {app.course}</span>
                  <span><strong>Department:</strong> {app.department}</span>
                </div>
                <p className="panel-note"><strong>Why join:</strong> {app.motivation}</p>
                <a className="admin-inline-action recruitment-resume-link" href={app.resume_link} target="_blank" rel="noopener noreferrer">
                  Open Resume
                </a>
                <small className="field-help">Submitted on {formatTimestamp(app.created_at)}</small>
              </div>
              <div className="admin-record-actions">
                <button className="admin-inline-action danger-action" type="button" onClick={() => handleRecruitmentDelete(app.id)}>
                  Delete
                </button>
              </div>
            </article>
          )) : (
            <div className="admin-managed-empty">No responses for {selectedTeam?.name || "this domain"}.</div>
          )}
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-heading">
          <div>
            <p className="panel-kicker">Other Applications</p>
            <h3>Events and existing forms</h3>
          </div>
        </div>
        <div className="admin-managed-list">
      {applications.length ? applications.map((app) => (
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
                <strong style={{ fontSize: '0.95rem', color: 'var(--brand-red)', display: 'block', marginBottom: '4px' }}>Team: {app.team_name}</strong>
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
      )) : <div className="admin-managed-empty">No other applications found.</div>}
        </div>
      </section>
    </div>
  );
}
