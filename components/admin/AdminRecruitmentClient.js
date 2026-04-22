"use client";

import { useEffect, useRef, useState } from "react";

import { apiRequest } from "@/lib/client-api";
import { formatDate, getStatusActionLabel, getStatusBadgeLabel } from "@/lib/presentation";

function setRecruitmentValues(form, values) {
  form.elements.status.value = values.status || "draft";
  form.elements.title.value = values.title || "";
  form.elements.organization.value = values.organization || "";
  form.elements.domain.value = values.domain || "";
  form.elements.mode.value = values.mode || "";
  form.elements.location.value = values.location || "";
  form.elements.deadline.value = values.deadline || "";
  form.elements.applicationLink.value = values.applicationLink || "";
  form.elements.contactName.value = values.contactName || "";
  form.elements.contactEmail.value = values.contactEmail || "";
  form.elements.description.value = values.description || "";
}

export default function AdminRecruitmentClient({ initialRecruitments }) {
  const formRef = useRef(null);
  const [recruitments, setRecruitments] = useState(initialRecruitments);
  const [editingId, setEditingId] = useState(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  async function reloadRecruitments() {
    const response = await apiRequest("/api/admin/recruitments");
    setRecruitments(Array.isArray(response.recruitments) ? response.recruitments : []);
  }

  function resetForm() {
    const form = formRef.current;
    if (!form) {
      return;
    }

    form.reset();
    form.elements.status.value = "draft";
    setEditingId(null);
    setStatus({ type: "", message: "" });
  }

  useEffect(() => {
    resetForm();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = formRef.current;
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const payload = {
      status: String(formData.get("status") || "draft"),
      title: String(formData.get("title") || ""),
      organization: String(formData.get("organization") || ""),
      domain: String(formData.get("domain") || ""),
      mode: String(formData.get("mode") || ""),
      location: String(formData.get("location") || ""),
      deadline: String(formData.get("deadline") || ""),
      applicationLink: String(formData.get("applicationLink") || ""),
      contactName: String(formData.get("contactName") || ""),
      contactEmail: String(formData.get("contactEmail") || ""),
      description: String(formData.get("description") || "")
    };

    setPending(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const path = editingId ? `/api/admin/recruitments/${editingId}` : "/api/admin/recruitments";
      await apiRequest(path, { method, body: payload });
      await reloadRecruitments();
      const wasEditing = Boolean(editingId);
      resetForm();
      setStatus({
        type: "status-success",
        message: wasEditing
          ? "Recruitment updated successfully."
          : "Recruitment saved successfully."
      });
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "Unable to save the recruitment record."
      });
    } finally {
      setPending(false);
    }
  }

  function handleEdit(record) {
    const form = formRef.current;
    if (!form) {
      return;
    }

    setRecruitmentValues(form, record);
    setEditingId(record.id);
    setStatus({
      type: "status-success",
      message: "Editing selected recruitment record."
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleToggle(record) {
    const nextStatus = record.status === "published" ? "draft" : "published";

    try {
      await apiRequest(`/api/admin/recruitments/${record.id}/status`, {
        method: "POST",
        body: { status: nextStatus }
      });
      await reloadRecruitments();
      setStatus({
        type: "status-success",
        message: `Recruitment moved to ${nextStatus}.`
      });
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "Unable to complete the recruitment action."
      });
    }
  }

  async function handleDelete(record) {
    if (
      !window.confirm("Delete this recruitment record permanently? This action cannot be undone.")
    ) {
      return;
    }

    try {
      await apiRequest(`/api/admin/recruitments/${record.id}`, { method: "DELETE" });
      await reloadRecruitments();
      if (editingId === record.id) {
        resetForm();
      }
      setStatus({
        type: "status-success",
        message: "Recruitment record deleted successfully."
      });
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "Unable to complete the recruitment action."
      });
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-heading">
        <div>
          <p className="panel-kicker">Recruitment Management</p>
          <h2>Official recruitment posts</h2>
        </div>
      </div>

      <div className="admin-grid admin-grid-single">
        <article className="admin-card">
          <h3>Add Recruitment</h3>
          <form ref={formRef} className="admin-form" onSubmit={handleSubmit}>
            <label>
              Status
              <select name="status" required defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label>
              Recruitment Title
              <input type="text" name="title" placeholder="Enter recruitment title" required />
            </label>
            <label>
              Organization / Team
              <input type="text" name="organization" placeholder="Enter organization or team name" required />
            </label>
            <label>
              Domain
              <input type="text" name="domain" placeholder="Enter domain" required />
            </label>
            <label>
              Mode
              <input type="text" name="mode" placeholder="Enter mode" required />
            </label>
            <label>
              Location
              <input type="text" name="location" placeholder="Enter location" required />
            </label>
            <label>
              Application Deadline
              <input type="date" name="deadline" required />
            </label>
            <label>
              Application Link
              <input type="url" name="applicationLink" placeholder="Enter application URL" required />
            </label>
            <label>
              Contact Person
              <input type="text" name="contactName" placeholder="Enter contact person name" required />
            </label>
            <label>
              Contact Email
              <input type="email" name="contactEmail" placeholder="Enter contact email" required />
            </label>
            <label className="full-span">
              Description
              <textarea name="description" rows="4" placeholder="Enter recruitment description" required />
            </label>
            <div className="admin-form-actions full-span">
              <button className="admin-submit" type="submit" disabled={pending}>
                {pending
                  ? editingId
                    ? "Updating..."
                    : "Saving..."
                  : editingId
                    ? "Update Recruitment"
                    : "Save Recruitment"}
              </button>
              {editingId ? (
                <button className="admin-logout" type="button" onClick={resetForm}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
            <p className={`admin-form-status full-span ${status.type}`.trim()} aria-live="polite">
              {status.message}
            </p>
          </form>

          <div className="admin-managed-block">
            <h4>Manage Recruitment Posts</h4>
            <div className="admin-managed-list" aria-live="polite">
              {recruitments.length ? (
                recruitments.map((record) => (
                  <article className="admin-record-card" key={record.id}>
                    <div className="admin-record-copy">
                      <div className="admin-record-heading">
                        <strong>{record.title}</strong>
                        <span className={`record-status record-status-${record.status}`}>
                          {getStatusBadgeLabel(record.status)}
                        </span>
                      </div>
                      <span>
                        {record.organization} | {record.domain}
                      </span>
                      <span>
                        {record.mode} | {record.location} | Deadline: {formatDate(record.deadline)}
                      </span>
                      <span>
                        Contact: {record.contactName} | {record.contactEmail}
                      </span>
                    </div>
                    <div className="admin-record-actions">
                      <button className="admin-inline-action" type="button" onClick={() => handleEdit(record)}>
                        Edit
                      </button>
                      <button className="admin-inline-action" type="button" onClick={() => handleToggle(record)}>
                        {getStatusActionLabel(record.status)}
                      </button>
                      <button className="admin-inline-action danger-action" type="button" onClick={() => handleDelete(record)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="admin-managed-empty">No recruitment records have been created yet.</div>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
