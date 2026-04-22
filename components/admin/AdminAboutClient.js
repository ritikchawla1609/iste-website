"use client";

import { useEffect, useRef, useState } from "react";

import { apiRequest } from "@/lib/client-api";
import { normalizeAbout } from "@/lib/presentation";

function populateAboutForm(form, about) {
  form.elements.heroTitle.value = about.heroTitle;
  form.elements.heroText.value = about.heroText;
  form.elements.overviewTitle.value = about.overviewTitle;
  form.elements.overviewParagraphOne.value = about.overviewParagraphOne;
  form.elements.overviewParagraphTwo.value = about.overviewParagraphTwo;
  form.elements.visionTitle.value = about.visionTitle;
  form.elements.visionItems.value = about.visionItems.join("\n");
  form.elements.focusTitle.value = about.focusTitle;
  form.elements.focusOneTitle.value = about.focusCards[0].title;
  form.elements.focusOneText.value = about.focusCards[0].text;
  form.elements.focusTwoTitle.value = about.focusCards[1].title;
  form.elements.focusTwoText.value = about.focusCards[1].text;
  form.elements.focusThreeTitle.value = about.focusCards[2].title;
  form.elements.focusThreeText.value = about.focusCards[2].text;
  form.elements.facultyTitle.value = about.facultyTitle;
  form.elements.facultyText.value = about.facultyText;
  form.elements.teamTitle.value = about.teamTitle;
  form.elements.teamText.value = about.teamText;
  form.elements.galleryTitle.value = about.galleryTitle;
  form.elements.galleryText.value = about.galleryText;
  form.elements.pastEventsTitle.value = about.pastEventsTitle;
  form.elements.pastEventsText.value = about.pastEventsText;
  form.elements.downloadsTitle.value = about.downloadsTitle;
  form.elements.downloadsText.value = about.downloadsText;
  form.elements.policyTitle.value = about.policyTitle;
  form.elements.policyText.value = about.policyText;
  form.elements.contactTitle.value = about.contactTitle;
  form.elements.contactText.value = about.contactText;
  form.elements.adminNoteTitle.value = about.adminNoteTitle;
  form.elements.adminNoteText.value = about.adminNoteText;
}

export default function AdminAboutClient({ initialAbout }) {
  const formRef = useRef(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    if (formRef.current) {
      populateAboutForm(formRef.current, normalizeAbout(initialAbout));
    }
  }, [initialAbout]);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = formRef.current;
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const payload = {
      heroTitle: String(formData.get("heroTitle") || ""),
      heroText: String(formData.get("heroText") || ""),
      overviewTitle: String(formData.get("overviewTitle") || ""),
      overviewParagraphOne: String(formData.get("overviewParagraphOne") || ""),
      overviewParagraphTwo: String(formData.get("overviewParagraphTwo") || ""),
      visionTitle: String(formData.get("visionTitle") || ""),
      visionItems: String(formData.get("visionItems") || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      focusTitle: String(formData.get("focusTitle") || ""),
      focusCards: [
        {
          title: String(formData.get("focusOneTitle") || ""),
          text: String(formData.get("focusOneText") || "")
        },
        {
          title: String(formData.get("focusTwoTitle") || ""),
          text: String(formData.get("focusTwoText") || "")
        },
        {
          title: String(formData.get("focusThreeTitle") || ""),
          text: String(formData.get("focusThreeText") || "")
        }
      ],
      facultyTitle: String(formData.get("facultyTitle") || ""),
      facultyText: String(formData.get("facultyText") || ""),
      teamTitle: String(formData.get("teamTitle") || ""),
      teamText: String(formData.get("teamText") || ""),
      galleryTitle: String(formData.get("galleryTitle") || ""),
      galleryText: String(formData.get("galleryText") || ""),
      pastEventsTitle: String(formData.get("pastEventsTitle") || ""),
      pastEventsText: String(formData.get("pastEventsText") || ""),
      downloadsTitle: String(formData.get("downloadsTitle") || ""),
      downloadsText: String(formData.get("downloadsText") || ""),
      policyTitle: String(formData.get("policyTitle") || ""),
      policyText: String(formData.get("policyText") || ""),
      contactTitle: String(formData.get("contactTitle") || ""),
      contactText: String(formData.get("contactText") || ""),
      adminNoteTitle: String(formData.get("adminNoteTitle") || ""),
      adminNoteText: String(formData.get("adminNoteText") || "")
    };

    setPending(true);

    try {
      const response = await apiRequest("/api/admin/site-content/about", {
        method: "PUT",
        body: payload
      });
      populateAboutForm(form, normalizeAbout(response.about));
      setStatus({
        type: "status-success",
        message: "About Us content updated successfully."
      });
    } catch (error) {
      setStatus({
        type: "status-error",
        message: error.message || "Unable to update the About Us content."
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-heading">
        <div>
          <p className="panel-kicker">About Us Management</p>
          <h2>Dedicated page content editor</h2>
        </div>
      </div>

      <article className="admin-card wide-admin-card">
        <h3>Edit About Us Page</h3>
        <form ref={formRef} className="admin-form split-form" onSubmit={handleSubmit}>
          <p className="admin-form-section-title">Page Introduction</p>
          <label>
            About Page Heading
            <input type="text" name="heroTitle" placeholder="Enter about page heading" required />
          </label>
          <label className="full-span">
            Introductory Paragraph
            <textarea name="heroText" rows="4" placeholder="Enter introductory about page text" required />
          </label>

          <p className="admin-form-section-title">Overview Section</p>
          <label>
            Overview Section Title
            <input type="text" name="overviewTitle" placeholder="Enter overview title" required />
          </label>
          <span className="admin-form-spacer" aria-hidden="true" />
          <label className="full-span">
            Overview Paragraph One
            <textarea
              name="overviewParagraphOne"
              rows="4"
              placeholder="Enter the first overview paragraph"
              required
            />
          </label>
          <label className="full-span">
            Overview Paragraph Two
            <textarea
              name="overviewParagraphTwo"
              rows="4"
              placeholder="Enter the second overview paragraph"
              required
            />
          </label>

          <p className="admin-form-section-title">Vision Section</p>
          <label>
            Vision Section Title
            <input type="text" name="visionTitle" placeholder="Enter vision section title" required />
          </label>
          <label className="full-span">
            Vision Points
            <textarea name="visionItems" rows="6" placeholder="Enter one point per line" required />
          </label>

          <p className="admin-form-section-title">Core Focus Areas</p>
          <label>
            Focus Section Title
            <input type="text" name="focusTitle" placeholder="Enter focus section title" required />
          </label>
          <span className="admin-form-spacer" aria-hidden="true" />
          <label>
            Focus Area One Title
            <input type="text" name="focusOneTitle" placeholder="Enter first focus title" required />
          </label>
          <label>
            Focus Area Two Title
            <input type="text" name="focusTwoTitle" placeholder="Enter second focus title" required />
          </label>
          <label className="full-span">
            Focus Area One Description
            <textarea name="focusOneText" rows="3" placeholder="Enter first focus description" required />
          </label>
          <label className="full-span">
            Focus Area Two Description
            <textarea name="focusTwoText" rows="3" placeholder="Enter second focus description" required />
          </label>
          <label>
            Focus Area Three Title
            <input type="text" name="focusThreeTitle" placeholder="Enter third focus title" required />
          </label>
          <span className="admin-form-spacer" aria-hidden="true" />
          <label className="full-span">
            Focus Area Three Description
            <textarea name="focusThreeText" rows="3" placeholder="Enter third focus description" required />
          </label>

          <p className="admin-form-section-title">Institutional Sections</p>
          <label>
            Faculty Coordinator Title
            <input type="text" name="facultyTitle" placeholder="Enter faculty section title" required />
          </label>
          <label className="full-span">
            Faculty Coordinator Details
            <textarea name="facultyText" rows="3" placeholder="Enter faculty coordinator details or official placeholder text" required />
          </label>
          <label>
            Chapter Team Title
            <input type="text" name="teamTitle" placeholder="Enter chapter team section title" required />
          </label>
          <label className="full-span">
            Chapter Team Details
            <textarea name="teamText" rows="3" placeholder="Enter chapter team details or official placeholder text" required />
          </label>
          <label>
            Gallery Title
            <input type="text" name="galleryTitle" placeholder="Enter gallery section title" required />
          </label>
          <label className="full-span">
            Gallery Details
            <textarea name="galleryText" rows="3" placeholder="Enter gallery details or official placeholder text" required />
          </label>
          <label>
            Past Events Title
            <input type="text" name="pastEventsTitle" placeholder="Enter past events section title" required />
          </label>
          <label className="full-span">
            Past Events Details
            <textarea name="pastEventsText" rows="3" placeholder="Enter past events and achievements details" required />
          </label>
          <label>
            Downloads Title
            <input type="text" name="downloadsTitle" placeholder="Enter downloads section title" required />
          </label>
          <label className="full-span">
            Downloads Details
            <textarea name="downloadsText" rows="3" placeholder="Enter downloads details or official placeholder text" required />
          </label>
          <label>
            Policies Title
            <input type="text" name="policyTitle" placeholder="Enter policies section title" required />
          </label>
          <label className="full-span">
            Policies and Disclaimer Details
            <textarea name="policyText" rows="3" placeholder="Enter policy or disclaimer details" required />
          </label>
          <label>
            Contact Title
            <input type="text" name="contactTitle" placeholder="Enter contact section title" required />
          </label>
          <label className="full-span">
            Contact Details
            <textarea name="contactText" rows="3" placeholder="Enter official contact details or placeholder text" required />
          </label>

          <p className="admin-form-section-title">Administrative Note</p>
          <label>
            Administrative Note Title
            <input type="text" name="adminNoteTitle" placeholder="Enter note title" required />
          </label>
          <label className="full-span">
            Administrative Note Text
            <textarea name="adminNoteText" rows="4" placeholder="Enter the administrative note" required />
          </label>

          <p className={`admin-form-status full-span ${status.type}`.trim()} aria-live="polite">
            {status.message}
          </p>
          <button className="admin-submit full-span" type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save About Us Content"}
          </button>
        </form>
      </article>
    </section>
  );
}
