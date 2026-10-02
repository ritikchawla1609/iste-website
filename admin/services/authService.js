"use client";

import {
  apiRequest,
  clearStoredToken,
  getStoredToken,
  setStoredToken
} from "./api";

export const authService = {
  async login({ uid, password }) {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { uid, password },
      allowUnauthorized: true
    });

    if (response.token) {
      setStoredToken(response.token);
    }

    return response;
  },

  async logout() {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        allowUnauthorized: true
      });
    } finally {
      clearStoredToken();
    }
  },

  async getSession() {
    try {
      const response = await apiRequest("/api/auth/session", {
        allowUnauthorized: true
      });
      return response;
    } catch {
      return { authenticated: false, uid: null, role: null };
    }
  },

  getToken() {
    return getStoredToken();
  },

  isAuthenticatedLocally() {
    return Boolean(getStoredToken());
  }
};
