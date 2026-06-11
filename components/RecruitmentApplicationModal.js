"use client";

import { useEffect, useState } from "react";

import { apiRequest } from "@/lib/client-api";

const EMPTY_FORM = {
  name: "",
  contact: "",
  outlookEmail: "",
  personalEmail: "",
  resumeLink: "",
  motivation: "",
  gender: "",
  uid: "",
  yearOfStudy: "",
  course: "",
  department: ""
};

export default function RecruitmentApplicationModal({ open, onClose, domain }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setMessage("");
    }
  }, [open, domain?.id]);

  if (!open || !domain) {
    return null;
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    try {
      const response = await apiRequest("/api/public/recruitment-applications", {
        method: "POST",
        body: { ...form, domainId: domain.id }
      });
      setMessage(response.message || "Application submitted successfully.");
      setForm(EMPTY_FORM);
    } catch (error) {
      setMessage(error.message || "Unable to submit the application.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="modal recruitment-application-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recruitment-form-title"
      style={{ "--team-accent": domain.accent || "var(--brand-red)" }}
    >
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-dialog recruitment-form-dialog">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close application form">
          &times;
        </button>
        <div className="recruitment-form-heading">
          <span className="team-card-number">{domain.id}</span>
          <div>
            <span className="recruitment-active-badge">Recruitment Active</span>
            <p className="panel-kicker">Team Recruitment</p>
            <h2 id="recruitment-form-title">Apply for {domain.name}</h2>
            <p>Complete every field carefully. Your response will be reviewed by the {domain.name} leads.</p>
          </div>
        </div>
        <form className="login-form recruitment-application-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          </label>
          <label>
            Contact Number
            <input type="tel" required value={form.contact} onChange={(event) => updateField("contact", event.target.value)} />
          </label>
          <label>
            Outlook Email
            <input type="email" required placeholder="name@cumail.in" value={form.outlookEmail} onChange={(event) => updateField("outlookEmail", event.target.value)} />
          </label>
          <label>
            Personal Email
            <input type="email" required value={form.personalEmail} onChange={(event) => updateField("personalEmail", event.target.value)} />
          </label>
          <label>
            UID / University Roll Number
            <input required placeholder="24BCS11235" value={form.uid} onChange={(event) => updateField("uid", event.target.value.toUpperCase())} />
          </label>
          <label>
            Gender
            <select required value={form.gender} onChange={(event) => updateField("gender", event.target.value)}>
              <option value="" disabled>Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label>
            Present Year of Study
            <select required value={form.yearOfStudy} onChange={(event) => updateField("yearOfStudy", event.target.value)}>
              <option value="" disabled>Select year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="5th Year">5th Year</option>
            </select>
          </label>
          <label>
            Course
            <input required placeholder="e.g. B.Tech" value={form.course} onChange={(event) => updateField("course", event.target.value)} />
          </label>
          <label>
            Department
            <input required placeholder="e.g. CSE" value={form.department} onChange={(event) => updateField("department", event.target.value)} />
          </label>
          <label>
            Resume Link
            <input type="url" required placeholder="https://drive.google.com/..." value={form.resumeLink} onChange={(event) => updateField("resumeLink", event.target.value)} />
          </label>
          <label className="full-span">
            Why do you want to join {domain.name}?
            <textarea required rows="5" value={form.motivation} onChange={(event) => updateField("motivation", event.target.value)} />
          </label>
          {message ? <p className="panel-note full-span" aria-live="polite">{message}</p> : null}
          <button className="btn-premium-dark full-width full-span" type="submit" disabled={pending}>
            {pending ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
