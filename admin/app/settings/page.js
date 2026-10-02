"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import Alert from "@/components/ui/Alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { backupService } from "@/services/backupService";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState("");
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  async function loadData() {
    try {
      const summary = await backupService.getSummary();
      setData(summary);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to load backup and system status."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateBackup() {
    setActionBusy("create");
    setStatusMessage({ type: "", text: "" });

    try {
      const res = await backupService.createBackup();
      setStatusMessage({
        type: "success",
        text: `New snapshot "${res.backup?.name || "backup"}" created successfully.`
      });
      await loadData();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to create backup snapshot."
      });
    } finally {
      setActionBusy("");
    }
  }

  async function handleRestore(backupName) {
    if (
      !confirm(
        `Are you sure you want to restore "${backupName}"?\n\nThe current live database records will be replaced. A safety backup will be created automatically before restoring.`
      )
    ) {
      return;
    }

    setActionBusy(`restore:${backupName}`);
    setStatusMessage({ type: "", text: "" });

    try {
      const res = await backupService.restoreBackup(backupName);
      setStatusMessage({
        type: "success",
        text: `Database restored successfully from "${backupName}". Safety backup created: "${res.safetyBackup?.name || "automatic snapshot"}".`
      });
      await loadData();
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to restore backup snapshot."
      });
    } finally {
      setActionBusy("");
    }
  }

  const backups = Array.isArray(data?.backups) ? data.backups : [];

  return (
    <AdminShell
      kicker="System & Maintenance"
      title="Backups & Settings"
      description="Manage automated and manual database snapshots, inspect recovery points, and verify system integration status."
      actions={
        <button
          type="button"
          className="btn-primary btn-accent"
          onClick={handleCreateBackup}
          disabled={Boolean(actionBusy)}
        >
          <span>💾</span> {actionBusy === "create" ? "Creating Snapshot..." : "Create New Backup"}
        </button>
      }
    >
      <Alert
        type={statusMessage.type}
        message={statusMessage.text}
        onClose={() => setStatusMessage({ type: "", text: "" })}
      />

      {loading ? (
        <LoadingSpinner message="Checking system status and backup catalog..." />
      ) : (
        <div style={{ display: "grid", gap: "28px" }}>
          {/* System Health & Architecture */}
          <div className="admin-card">
            <div className="admin-card-accent" />
            <div className="card-title-row">
              <div>
                <h2 className="card-title">System Environment &amp; Connectivity</h2>
                <p className="card-subtitle">Integration configuration and active environment specifications.</p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px"
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--line)"
                }}
              >
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-soft)", textTransform: "uppercase" }}>
                  Active Author UID
                </span>
                <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--navy-900)", marginTop: "4px" }}>
                  {user?.uid || "24BCS10191"}
                </p>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--line)"
                }}
              >
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-soft)", textTransform: "uppercase" }}>
                  Session Security
                </span>
                <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--brand-green)", marginTop: "4px" }}>
                  12h HTTP-Only / Bearer
                </p>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--line)"
                }}
              >
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-soft)", textTransform: "uppercase" }}>
                  Backend API Layer
                </span>
                <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--brand-blue)", marginTop: "4px" }}>
                  Connected (Next.js REST)
                </p>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--line)"
                }}
              >
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-soft)", textTransform: "uppercase" }}>
                  Architecture Model
                </span>
                <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--navy-900)", marginTop: "4px" }}>
                  Decoupled Standalone
                </p>
              </div>
            </div>
          </div>

          {/* Database Backup Snapshots Catalog */}
          <div className="admin-card">
            <div className="admin-card-accent" />
            <div className="card-title-row">
              <div>
                <h2 className="card-title">Available Database Snapshots ({backups.length})</h2>
                <p className="card-subtitle">
                  Point-in-time backups containing events, recruitments, applications, and site content.
                </p>
              </div>
            </div>

            {backups.length === 0 ? (
              <p style={{ color: "var(--text-soft)", padding: "20px 0" }}>
                No database backups found. Click &quot;Create New Backup&quot; to generate an initial database snapshot.
              </p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Snapshot File</th>
                      <th>Storage Target</th>
                      <th>Size</th>
                      <th>Timestamp</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((b, idx) => {
                      const isRestoring = actionBusy === `restore:${b.name}`;

                      return (
                        <tr key={b.name || idx}>
                          <td>
                            <code style={{ fontWeight: 700, color: "var(--navy-900)" }}>
                              {b.name}
                            </code>
                          </td>
                          <td>
                            <span className="badge badge-published">
                              {b.storage || "Local Storage"}
                            </span>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {b.size ? `${(b.size / 1024).toFixed(1)} KB` : "Snapshot"}
                          </td>
                          <td style={{ whiteSpace: "nowrap", color: "var(--text-soft)" }}>
                            {b.createdAt || b.created_at || "Recent"}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => handleRestore(b.name)}
                              disabled={Boolean(actionBusy)}
                            >
                              {isRestoring ? "Restoring..." : "Restore Snapshot"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
