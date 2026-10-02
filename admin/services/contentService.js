"use client";

import { apiRequest } from "./api";

export const contentService = {
  async getNotice() {
    const data = await apiRequest("/api/admin/site-content/notice");
    return data.notice || { detailText: "" };
  },

  async updateNotice(detailText) {
    return apiRequest("/api/admin/site-content/notice", {
      method: "PUT",
      body: { detailText }
    });
  },

  async getAbout() {
    const data = await apiRequest("/api/admin/site-content/about");
    return data.about || {};
  },

  async updateAbout(payload) {
    return apiRequest("/api/admin/site-content/about", {
      method: "PUT",
      body: payload
    });
  }
};
