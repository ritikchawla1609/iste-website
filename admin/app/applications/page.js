"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import Alert from "@/components/ui/Alert";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { applicationService } from "@/services/applicationService";

const RECRUITMENT_DOMAINS = [
  { id: "01", name: "Technical" },
  { id: "02", name: "Creative & Design" },
  { id: "03", name: "Management" },
  { id: "04", name: "Operations" },
  { id: "05", name: "Public Relations" }
];

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("recruitment"); // 'recruitment' | 'events'
  const [selectedDomain, setSelectedDomain] = useState("01");

  const [recruitmentApps, setRecruitmentApps] = useState([]);
  const [eventApps, setEventApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  async function loadData() {
    try {
      const [eventsData, recruitData] = await Promise.all([
        applicationService.getEventApplications(),
        applicationService.getRecruitmentApplications()
      ]);
      setEventApps(eventsData);
      setRecruitmentApps(recruitData);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to load applications."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDeleteRecruitmentApp(app) {
    if (!confirm(`Delete recruitment response from "${app.name}" (${app.uid})?`)) return;

    try {
      await applicationService.deleteRecruitmentApplication(app.id);
      setRecruitmentApps((prev) => prev.filter((item) => item.id !== app.id));
      setStatusMessage({
        type: "success",
        text: `Application from "${app.name}" removed.`
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to delete application."
      });
    }
  }

  async function handleDeleteEventApp(app) {
    if (!confirm(`Delete event registration for "${app.name}"?`)) return;

    try {
      await applicationService.deleteEventApplication(app.id);
      setEventApps((prev) => prev.filter((item) => item.id !== app.id));
      setStatusMessage({
        type: "success",
        text: `Event registration for "${app.name}" removed.`
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to delete event registration."
      });
    }
  }

  const domainFilteredApps = recruitmentApps.filter(
    (app) => app.domain_id === selectedDomain || app.domainId === selectedDomain
  );

  return (
    <AdminShell
      kicker="Registrations & Responses"
      title="Candidate Applications"
      description="Inspect student membership recruitment responses by domain and view event team registrations."
    >
      <Alert
        type={statusMessage.type}
        message={statusMessage.text}
        onClose={() => setStatusMessage({ type: "", text: "" })}
      />

      {/* Main Section Toggle */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
        <button
          type="button"
          className={activeTab === "recruitment" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("recruitment")}
        >
          <span>👥</span> Recruitment Responses ({recruitmentApps.length})
        </button>
        <button
          type="button"
          className={activeTab === "events" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("events")}
        >
          <span>📅</span> Event Registrations ({eventApps.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading applications..." />
      ) : activeTab === "recruitment" ? (
        <div>
          {/* Domain Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "24px",
              overflowX: "auto",
              paddingBottom: "8px"
            }}
          >
            {RECRUITMENT_DOMAINS.map((domain) => {
              const count = recruitmentApps.filter(
                (a) => a.domain_id === domain.id || a.domainId === domain.id
              ).length;
              const isSelected = selectedDomain === domain.id;

              return (
                <button
                  key={domain.id}
                  type="button"
                  className={isSelected ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
                  onClick={() => setSelectedDomain(domain.id)}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {domain.name} ({count})
                </button>
              );
            })}
          </div>

          {domainFilteredApps.length === 0 ? (
            <EmptyState
              icon="📥"
              title="No responses in this domain"
              description={`No recruitment applications have been received yet for ${
                RECRUITMENT_DOMAINS.find((d) => d.id === selectedDomain)?.name
              }.`}
            />
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {domainFilteredApps.map((app) => (
                <div
                  key={app.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--line)",
                    padding: "24px",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                      gap: "12px",
                      flexWrap: "wrap"
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--navy-900)" }}>
                        {app.name}
                      </h3>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                        <span className="badge badge-published">{app.uid}</span>
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
                          {app.domain_name || app.domainName}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {app.resume_link && (
                        <a
                          href={app.resume_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary btn-sm"
                          style={{ color: "var(--brand-blue)", borderColor: "var(--brand-blue)" }}
                        >
                          <span>📄</span> View Resume ↗
                        </a>
                      )}
                      <button
                        type="button"
                        className="btn-secondary btn-sm btn-danger"
                        onClick={() => handleDeleteRecruitmentApp(app)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "10px",
                      padding: "16px",
                      background: "#f8fafc",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--line)",
                      fontSize: "0.85rem",
                      color: "var(--navy-800)"
                    }}
                  >
                    <span>
                      <strong>Phone:</strong> {app.contact}
                    </span>
                    <span>
                      <strong>Outlook:</strong> {app.outlook_email}
                    </span>
                    <span>
                      <strong>Personal Email:</strong> {app.personal_email}
                    </span>
                    <span>
                      <strong>Gender:</strong> {app.gender}
                    </span>
                    <span>
                      <strong>Year:</strong> {app.year_of_study}
                    </span>
                    <span>
                      <strong>Course:</strong> {app.course}
                    </span>
                    <span>
                      <strong>Department:</strong> {app.department}
                    </span>
                    <span>
                      <strong>Applied:</strong>{" "}
                      {app.created_at
                        ? new Date(app.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })
                        : "Recent"}
                    </span>
                  </div>

                  {app.motivation && (
                    <div style={{ marginTop: "14px", fontSize: "0.9rem", color: "var(--text-soft)" }}>
                      <strong style={{ color: "var(--navy-900)" }}>Why join ISTE:</strong>
                      <p style={{ marginTop: "4px", lineHeight: "1.5" }}>{app.motivation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Event Registrations Tab */
        <div>
          {eventApps.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No event registrations"
              description="Registrations submitted through the public website will appear here."
            />
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Team Name</th>
                    <th>Members</th>
                    <th>Details</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eventApps.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.name}</strong>
                      </td>
                      <td>
                        <a href={`mailto:${app.email}`} style={{ color: "var(--brand-blue)" }}>
                          {app.email}
                        </a>
                      </td>
                      <td>{app.phone}</td>
                      <td>
                        {app.team_name ? (
                          <span className="badge badge-active">{app.team_name}</span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>Individual</span>
                        )}
                      </td>
                      <td style={{ fontSize: "0.85rem", maxWidth: "200px" }}>
                        {app.team_members || "-"}
                      </td>
                      <td style={{ fontSize: "0.85rem", maxWidth: "240px" }}>
                        {app.details || "-"}
                      </td>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem", color: "var(--text-soft)" }}>
                        {app.created_at
                          ? new Date(app.created_at).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-secondary btn-sm btn-danger"
                          onClick={() => handleDeleteEventApp(app)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
