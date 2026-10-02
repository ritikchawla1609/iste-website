"use client";

import { apiRequest } from "./api";

export const applicationService = {
  async getEventApplications() {
    const data = await apiRequest("/api/admin/applications");
    return Array.isArray(data) ? data : [];
  },

  async deleteEventApplication(id) {
    return apiRequest(`/api/admin/applications?id=${id}`, {
      method: "DELETE"
    });
  },

  async getRecruitmentApplications(domainId) {
    const query = domainId ? `?domainId=${encodeURIComponent(domainId)}` : "";
    const data = await apiRequest(`/api/admin/recruitment-applications${query}`);
    return Array.isArray(data.applications) ? data.applications : [];
  },

  async deleteRecruitmentApplication(id) {
    return apiRequest(`/api/admin/recruitment-applications?id=${id}`, {
      method: "DELETE"
    });
  }
};
