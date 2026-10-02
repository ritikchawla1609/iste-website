"use client";

import { apiRequest } from "./api";

export const pastEventService = {
  async getPastEvents() {
    const data = await apiRequest("/api/admin/past-events");
    return Array.isArray(data) ? data : [];
  },

  async createPastEvent(payload) {
    return apiRequest("/api/admin/past-events", {
      method: "POST",
      body: payload
    });
  },

  async updatePastEvent(id, payload) {
    return apiRequest(`/api/admin/past-events?id=${id}`, {
      method: "PUT",
      body: payload
    });
  },

  async deletePastEvent(id) {
    return apiRequest(`/api/admin/past-events?id=${id}`, {
      method: "DELETE"
    });
  },

  async getHeroImages() {
    const data = await apiRequest("/api/admin/site-content/past-events-hero");
    return Array.isArray(data.imagePaths) ? data.imagePaths : [];
  },

  async updateHeroImages(payload) {
    return apiRequest("/api/admin/site-content/past-events-hero", {
      method: "PUT",
      body: payload
    });
  }
};
