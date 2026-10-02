"use client";

import { apiRequest } from "./api";

export const recruitmentService = {
  async getRecruitments() {
    const data = await apiRequest("/api/admin/recruitments");
    return Array.isArray(data.recruitments) ? data.recruitments : [];
  },

  async createRecruitment(payload) {
    return apiRequest("/api/admin/recruitments", {
      method: "POST",
      body: payload
    });
  },

  async updateRecruitment(id, payload) {
    return apiRequest(`/api/admin/recruitments/${id}`, {
      method: "PUT",
      body: payload
    });
  },

  async toggleRecruitmentStatus(id, nextStatus) {
    return apiRequest(`/api/admin/recruitments/${id}/status`, {
      method: "POST",
      body: { status: nextStatus }
    });
  },

  async deleteRecruitment(id) {
    return apiRequest(`/api/admin/recruitments/${id}`, {
      method: "DELETE"
    });
  },

  async getDomainStatus() {
    const data = await apiRequest("/api/admin/site-content/recruitment-status");
    return (
      data.domainStatus || {
        "01": "active",
        "02": "active",
        "03": "active",
        "04": "active",
        "05": "active"
      }
    );
  },

  async updateDomainStatus(domainStatus) {
    return apiRequest("/api/admin/site-content/recruitment-status", {
      method: "PUT",
      body: { domainStatus }
    });
  }
};
