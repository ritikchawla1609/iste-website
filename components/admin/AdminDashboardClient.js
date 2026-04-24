"use client";

import Link from "next/link";
import { useState } from "react";

import { apiRequest } from "@/lib/client-api";
import { formatAuditTitle, formatBytes, formatTimestamp } from "@/lib/presentation";

export default function AdminDashboardClient({
  initialSummary,
  initialBackups,
  initialRecentActivity
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [backups, setBackups] = useState(initialBackups);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busyAction, setBusyAction] = useState("");

  async function reloadDashboard() {
    const response = await apiRequest("/api/admin/summary");
    setSummary(response.summary || null);
    setBackups(Array.isArray(response.backups) ? response.backups : []);
    setRecentActivity(Array.isArray(response.recentActivity) ? response.recentActivity : []);
  }

  async function handleCreateBackup() {
    setBusyAction("create");

    try {
      const response = await apiRequest("/api/admin/backups", { method: "POST" });
      await reloadDashboard();
      setStatus({
        type: "status-success",
        message: `Backup created successfully: ${response.backup?.name || "latest database snapshot"}.`
      });
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "Unable to create the backup."
      });
    } finally {
      setBusyAction("");
    }
  }

  async function handleRestore(backupName) {
    if (
      !window.confirm(
        `Restore the website database from "${backupName}"?\n\nThe current live data will be replaced. A safety backup of the current database will be created automatically before restore.`
      )
    ) {
      return;
    }

    setBusyAction(`restore:${backupName}`);

    try {
      const response = await apiRequest("/api/admin/restore-backup", {
        method: "POST",
        body: { backupName }
      });
      await reloadDashboard();
      setStatus({
        type: "status-success",
        message: `Backup restored successfully from ${response.backup?.name || backupName}. Safety backup created: ${response.safetyBackup?.name || "generated automatically"}.`
      });
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "Unable to restore the selected backup."
      });
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="admin-dashboard-root">
      <div className="admin-dashboard-grid">
        {/* Statistics & Overview */}
        <section className="admin-dashboard-column">
          <article className="admin-overview-card">
            <header className="card-header-accent"></header>
            <div className="card-content">
              <p className="panel-kicker">Statistics</p>
              <h2>Platform Overview</h2>
              <div className="admin-summary-grid">
                <div className="summary-mini-card">
                  <strong>{summary?.eventsPublished || 0}</strong>
                  <span>Published Events</span>
                </div>
                <div className="summary-mini-card">
                  <strong>{summary?.recruitmentsPublished || 0}</strong>
                  <span>Published Recruitment</span>
                </div>
                <div className="summary-mini-card">
                  <strong>{summary?.eventsDraft || 0}</strong>
                  <span>Draft Events</span>
                </div>
                <div className="summary-mini-card">
                  <strong>{summary?.recruitmentsDraft || 0}</strong>
                  <span>Draft Recruitment</span>
                </div>
              </div>
            </div>
          </article>

          <article className="admin-overview-card" style={{ marginTop: '32px' }}>
            <div className="card-content">
              <p className="panel-kicker">Quick Actions</p>
              <h2>Content Management</h2>
              <div className="admin-links-grid-compact">
                <Link className="admin-nav-tile" href="/admin-events">
                  <strong>Add Event</strong>
                  <span>Manage official events</span>
                </Link>
                <Link className="admin-nav-tile" href="/admin-recruitment">
                  <strong>Recruitment</strong>
                  <span>Manage vacancies</span>
                </Link>
                <Link className="admin-nav-tile" href="/admin-links">
                  <strong>Link Adder</strong>
                  <span>Update form links</span>
                </Link>
                <Link className="admin-nav-tile" href="/admin-past-events">
                  <strong>History</strong>
                  <span>Gallery & Winners</span>
                </Link>
                <Link className="admin-nav-tile" href="/admin-notice">
                  <strong>Homepage</strong>
                  <span>What's New notice</span>
                </Link>
                <Link className="admin-nav-tile" href="/admin-about">
                  <strong>About Page</strong>
                  <span>Edit organization info</span>
                </Link>
              </div>
            </div>
          </article>
        </section>

        {/* Recovery & Activity */}
        <section className="admin-dashboard-column">
          <article className="admin-overview-card">
            <div className="card-content">
              <p className="panel-kicker">System</p>
              <h2>Database & Safety</h2>
              <div className="dashboard-action-row" style={{ marginBottom: '24px' }}>
                <button className="admin-submit" type="button" onClick={handleCreateBackup} disabled={busyAction === "create"} style={{ width: 'auto', minWidth: '200px' }}>
                  {busyAction === "create" ? "Creating..." : "Create Backup"}
                </button>
                {status.message && (
                  <p className={`admin-form-status ${status.type}`.trim()} style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                    {status.message}
                  </p>
                )}
              </div>
              
              <div className="admin-list-shell">
                <h3>Recent Backups</h3>
                <div className="dashboard-list">
                  {backups.length ? (
                    backups.map((backup) => (
                      <div className="dashboard-list-item" key={backup.name}>
                        <div className="dashboard-list-copy">
                          <strong>{backup.name}</strong>
                          <span>
                            {formatBytes(backup.size)} | {formatTimestamp(backup.modifiedAt || backup.createdAt)}
                          </span>
                        </div>
                        <button
                          className="admin-inline-action"
                          type="button"
                          onClick={() => handleRestore(backup.name)}
                          disabled={busyAction === `restore:${backup.name}`}
                        >
                          {busyAction === `restore:${backup.name}` ? "Restoring..." : "Restore"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="admin-managed-empty">No backup file available.</div>
                  )}
                </div>
              </div>

              <div className="admin-list-shell" style={{ marginTop: '32px' }}>
                <h3>Recent Activity Audit</h3>
                <div className="dashboard-list">
                  {recentActivity.length ? (
                    recentActivity.map((entry) => (
                      <div className="dashboard-list-item" key={entry.id}>
                        <div className="dashboard-list-copy">
                          <strong>{formatAuditTitle(entry)}</strong>
                          <span>{formatTimestamp(entry.createdAt)}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--brand-red)', fontWeight: '800', textTransform: 'uppercase' }}>Logged</span>
                      </div>
                    ))
                  ) : (
                    <div className="admin-managed-empty">No audit activity recorded.</div>
                  )}
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
