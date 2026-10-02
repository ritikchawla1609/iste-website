"use client";

import { apiRequest } from "./api";

export const eventService = {
  async getEvents() {
    const data = await apiRequest("/api/admin/events");
    return Array.isArray(data.events) ? data.events : [];
  },

  async createEvent(payload) {
    return apiRequest("/api/admin/events", {
      method: "POST",
      body: payload
    });
  },

  async updateEvent(id, payload) {
    return apiRequest(`/api/admin/events/${id}`, {
      method: "PUT",
      body: payload
    });
  },

  async toggleEventStatus(id, nextStatus) {
    return apiRequest(`/api/admin/events/${id}/status`, {
      method: "POST",
      body: { status: nextStatus }
    });
  },

  async deleteEvent(id) {
    return apiRequest(`/api/admin/events/${id}`, {
      method: "DELETE"
    });
  }
};
