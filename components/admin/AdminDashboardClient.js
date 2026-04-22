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
    <section className="admin-overview-grid">
      <article className="admin-link-card admin-stat-card">
        <p className="panel-kicker">Overview</p>
        <h2>Dashboard Summary</h2>
        <div className="admin-summary-grid">
          <div className="summary-mini-card">
            <strong>{summary?.eventsPublished || 0}</strong>
            <span>Published Events</span>
          </div>
          <div className="summary-mini-card">
            <strong>{summary?.eventsDraft || 0}</strong>
            <span>Draft Events</span>
          </div>
          <div className="summary-mini-card">
            <strong>{summary?.recruitmentsPublished || 0}</strong>
            <span>Published Recruitment</span>
          </div>
          <div className="summary-mini-card">
            <strong>{summary?.recruitmentsDraft || 0}</strong>
            <span>Draft Recruitment</span>
          </div>
        </div>
      </article>

      <article className="admin-link-card admin-stat-card">
        <p className="panel-kicker">Recovery</p>
        <h2>Backup and Audit</h2>
        <div className="dashboard-action-row">
          <button className="admin-submit" type="button" onClick={handleCreateBackup} disabled={busyAction === "create"}>
            {busyAction === "create" ? "Creating..." : "Create Backup"}
          </button>
          <p className={`admin-form-status ${status.type}`.trim()} aria-live="polite">
            {status.message}
          </p>
        </div>
        <div className="admin-list-shell">
          <h3>Recent Backups</h3>
          <div className="dashboard-list">
            {backups.length ? (
              backups.map((backup) => (
                <div className="dashboard-list-item dashboard-list-item-actionable" key={backup.name}>
                  <div className="dashboard-list-copy">
                    <strong>{backup.name}</strong>
                    <span>
                      {formatBytes(backup.size)} | {formatTimestamp(backup.modifiedAt || backup.createdAt)}
                    </span>
                  </div>
                  <div className="dashboard-list-actions">
                    <button
                      className="admin-inline-action"
                      type="button"
                      onClick={() => handleRestore(backup.name)}
                      disabled={busyAction === `restore:${backup.name}`}
                    >
                      {busyAction === `restore:${backup.name}` ? "Restoring..." : "Restore"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-managed-empty">No backup file has been created yet.</div>
            )}
          </div>
        </div>
        <div className="admin-list-shell">
          <h3>Recent Activity</h3>
          <div className="dashboard-list">
            {recentActivity.length ? (
              recentActivity.map((entry) => (
                <div className="dashboard-list-item" key={entry.id}>
                  <strong>{formatAuditTitle(entry)}</strong>
                  <span>{formatTimestamp(entry.createdAt)}</span>
                </div>
              ))
            ) : (
              <div className="admin-managed-empty">No audit activity is available yet.</div>
            )}
          </div>
        </div>
      </article>

      <Link className="admin-link-card" href="/admin-events">
        <p className="panel-kicker">Events</p>
        <h2>Add Event</h2>
        <p>Create new event entries and manage published event notices from a dedicated page.</p>
      </Link>

      <Link className="admin-link-card" href="/admin-recruitment">
        <p className="panel-kicker">Recruitment</p>
        <h2>Manage Recruitment</h2>
        <p>Publish recruitment opportunities and manage active recruitment announcements.</p>
      </Link>

      <Link className="admin-link-card" href="/admin-links">
        <p className="panel-kicker">Links</p>
        <h2>Link Adder</h2>
        <p>Quickly add or update Google Form registration links for events and recruitment.</p>
      </Link>

      <Link className="admin-link-card" href="/admin-past-events">
        <p className="panel-kicker">History</p>
        <h2>Previous Events</h2>
        <p>Record past event successes, winners, and gallery images.</p>
      </Link>

      <Link className="admin-link-card" href="/admin-notice">
        <p className="panel-kicker">Homepage</p>
        <h2>Update Whats New</h2>
        <p>Change the homepage whats new message while keeping the top strip fixed and formal.</p>
      </Link>

      <Link className="admin-link-card" href="/admin-about">
        <p className="panel-kicker">About Us</p>
        <h2>Edit About Page</h2>
        <p>Maintain the dedicated About Us page content without affecting the homepage layout.</p>
      </Link>
    </section>
  );
}
