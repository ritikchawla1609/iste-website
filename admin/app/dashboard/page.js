"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/layout/AdminShell";
import StatCard from "@/components/ui/StatCard";
import Alert from "@/components/ui/Alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { backupService } from "@/services/backupService";
import { recruitmentService } from "@/services/recruitmentService";

const RECRUITMENT_DOMAINS = [
  { id: "01", name: "Technical", icon: "💻" },
  { id: "02", name: "Creative & Design", icon: "🎨" },
  { id: "03", name: "Management", icon: "📊" },
  { id: "04", name: "Operations", icon: "⚙️" },
  { id: "05", name: "Public Relations", icon: "📢" }
];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [domainStatus, setDomainStatus] = useState({
    "01": "active",
    "02": "active",
    "03": "active",
    "04": "active",
    "05": "active"
  });
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [togglingDomain, setTogglingDomain] = useState(null);
  const [creatingBackup, setCreatingBackup] = useState(false);

  async function loadDashboardData() {
    try {
      const [summaryRes, domainRes] = await Promise.all([
        backupService.getSummary(),
        recruitmentService.getDomainStatus()
      ]);
      setData(summaryRes);
      if (domainRes) {
        setDomainStatus(domainRes);
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to load dashboard data."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function handleToggleDomain(domainId) {
    const nextStatus = domainStatus[domainId] === "active" ? "inactive" : "active";
    const updatedStatus = { ...domainStatus, [domainId]: nextStatus };
    setTogglingDomain(domainId);

    try {
      await recruitmentService.updateDomainStatus(updatedStatus);
      setDomainStatus(updatedStatus);
      setStatusMessage({
        type: "success",
        text: `Domain "${RECRUITMENT_DOMAINS.find((d) => d.id === domainId)?.name}" status updated to ${nextStatus}.`
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to update domain recruitment status."
      });
    } finally {
      setTogglingDomain(null);
    }
  }

  async function handleCreateBackup() {
    setCreatingBackup(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const res = await backupService.createBackup();
      setStatusMessage({
        type: "success",
        text: `Database snapshot "${res.backup?.name || "new backup"}" created successfully.`
      });
      const summaryRes = await backupService.getSummary();
      setData(summaryRes);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to create database snapshot."
      });
    } finally {
      setCreatingBackup(false);
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <LoadingSpinner message="Loading dashboard metrics and status..." />
      </AdminShell>
    );
  }

  const summary = data?.summary || {};
  const recentActivity = Array.isArray(data?.recentActivity) ? data.recentActivity : [];

  return (
    <AdminShell
      kicker="Overview Console"
      title="Admin Dashboard"
      description="Manage events, recruitment campaigns, registrations, content updates, and backups for the official ISTE website."
      actions={
        <button
          type="button"
          className="btn-primary btn-accent"
          onClick={handleCreateBackup}
          disabled={creatingBackup}
        >
          <span>💾</span> {creatingBackup ? "Creating..." : "Create Backup"}
        </button>
      }
    >
      <Alert
        type={statusMessage.type}
        message={statusMessage.text}
        onClose={() => setStatusMessage({ type: "", text: "" })}
      />

      {/* Metrics Row */}
      <div className="metrics-grid">
        <StatCard
          label="Upcoming Events"
          value={summary.eventsCount ?? summary.events ?? 0}
          icon="📅"
          color="blue"
        />
        <StatCard
          label="Recruitment Openings"
          value={summary.recruitmentsCount ?? summary.recruitments ?? 0}
          icon="👥"
          color="green"
        />
        <StatCard
          label="Event Registrations"
          value={summary.applicationsCount ?? summary.applications ?? 0}
          icon="📝"
          color="amber"
        />
        <StatCard
          label="System Backups"
          value={data?.backups?.length ?? 0}
          icon="💾"
          color="red"
        />
      </div>

      {/* Domain Recruitment Toggles */}
      <div className="admin-card">
        <div className="admin-card-accent" />
        <div className="card-title-row">
          <div>
            <h2 className="card-title">Recruitment Domain Availability</h2>
            <p className="card-subtitle">
              Instantly toggle applicant submissions for individual domains on the public website.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px"
          }}
        >
          {RECRUITMENT_DOMAINS.map((domain) => {
            const isActive = domainStatus[domain.id] === "active";
            const isToggling = togglingDomain === domain.id;

            return (
              <div
                key={domain.id}
                style={{
                  background: isActive ? "#f0fdf4" : "#f8fafc",
                  border: `1.5px solid ${isActive ? "#bbf7d0" : "var(--line)"}`,
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.4rem" }}>{domain.icon}</span>
                  <div>
                    <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--navy-900)" }}>
                      {domain.name}
                    </strong>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: isActive ? "#166534" : "#64748b"
                      }}
                    >
                      {isActive ? "● Open for Applications" : "○ Closed"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={isActive ? "btn-secondary btn-sm" : "btn-primary btn-sm"}
                  onClick={() => handleToggleDomain(domain.id)}
                  disabled={isToggling}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {isToggling
                    ? "Updating..."
                    : isActive
                    ? "Close Domain"
                    : "Open Domain"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="admin-card">
        <div className="admin-card-accent" />
        <div className="card-title-row">
          <div>
            <h2 className="card-title">Administrative Sections</h2>
            <p className="card-subtitle">Quick access to manage all aspects of the ISTE ecosystem.</p>
          </div>
        </div>

        <div className="action-tiles-grid">
          <Link href="/events" className="action-tile">
            <div className="action-tile-top">
              <span className="action-tile-icon">📅</span>
              <span className="badge badge-published">Events</span>
            </div>
            <strong>Upcoming Events</strong>
            <span>Create, edit, publish, and upload posters for new campus events and workshops.</span>
          </Link>

          <Link href="/past-events" className="action-tile">
            <div className="action-tile-top">
              <span className="action-tile-icon">🏆</span>
              <span className="badge badge-published">Archive</span>
            </div>
            <strong>Past Events & Gallery</strong>
            <span>Update past milestone events, winners list, and homepage hero carousel photos.</span>
          </Link>

          <Link href="/recruitment" className="action-tile">
            <div className="action-tile-top">
              <span className="action-tile-icon">👥</span>
              <span className="badge badge-active">Hiring</span>
            </div>
            <strong>Recruitment Openings</strong>
            <span>Post and manage membership hiring drives, domain descriptions, and deadlines.</span>
          </Link>

          <Link href="/applications" className="action-tile">
            <div className="action-tile-top">
              <span className="action-tile-icon">📝</span>
              <span className="badge badge-active">Responses</span>
            </div>
            <strong>Applications & Responses</strong>
            <span>View candidate applications categorized by domain and event registrations.</span>
          </Link>

          <Link href="/content/notice" className="action-tile">
            <div className="action-tile-top">
              <span className="action-tile-icon">📢</span>
              <span className="badge badge-published">Homepage</span>
            </div>
            <strong>What's New Banner</strong>
            <span>Update the public announcement banner shown on the main homepage with live preview.</span>
          </Link>

          <Link href="/content/about" className="action-tile">
            <div className="action-tile-top">
              <span className="action-tile-icon">ℹ️</span>
              <span className="badge badge-published">Content</span>
            </div>
            <strong>About Us Content</strong>
            <span>Edit society mission, faculty advisors, vision statements, and focus cards.</span>
          </Link>

          <Link href="/settings" className="action-tile">
            <div className="action-tile-top">
              <span className="action-tile-icon">⚙️</span>
              <span className="badge badge-draft">System</span>
            </div>
            <strong>Backups & Settings</strong>
            <span>Download database backups, inspect audit logs, and safely restore snapshots.</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity Audit Logs */}
      {recentActivity.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-accent" />
          <div className="card-title-row">
            <div>
              <h2 className="card-title">Recent Audit Log</h2>
              <p className="card-subtitle">Recent administrative actions and modifications recorded in the system.</p>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Author</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.slice(0, 10).map((log, index) => {
                  const dateStr = log.created_at
                    ? new Date(log.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })
                    : "Recently";

                  let detailsStr = "";
                  try {
                    const parsed = typeof log.details === "string" ? JSON.parse(log.details) : log.details;
                    detailsStr = Object.entries(parsed || {})
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ");
                  } catch {
                    detailsStr = String(log.details || "");
                  }

                  return (
                    <tr key={log.id || index}>
                      <td style={{ whiteSpace: "nowrap", color: "var(--text-soft)" }}>{dateStr}</td>
                      <td>
                        <strong style={{ textTransform: "capitalize", color: "var(--navy-900)" }}>
                          {log.action}
                        </strong>
                      </td>
                      <td>
                        <span className="badge badge-draft">{log.entity_type}</span>{" "}
                        {log.entity_id && <span style={{ fontSize: "0.85rem" }}>#{log.entity_id}</span>}
                      </td>
                      <td>
                        <code>{log.admin_uid || log.author_uid || "Admin"}</code>
                      </td>
                      <td style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>
                        {detailsStr || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
