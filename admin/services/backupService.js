"use client";

import { apiRequest } from "./api";

export const backupService = {
  async getSummary() {
    return apiRequest("/api/admin/summary");
  },

  async createBackup() {
    return apiRequest("/api/admin/backups", {
      method: "POST"
    });
  },

  async restoreBackup(backupName) {
    return apiRequest("/api/admin/restore-backup", {
      method: "POST",
      body: { backupName }
    });
  }
};
