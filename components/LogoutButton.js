"use client";

import { useState } from "react";

import { apiRequest } from "@/lib/client-api";

export default function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        allowUnauthorized: true
      });
      window.location.href = "/";
    } finally {
      setPending(false);
    }
  }

  return (
    <button className="admin-logout" type="button" onClick={handleLogout} disabled={pending}>
      <span className="btn-icon">🚪</span> {pending ? "Logging Out..." : "Logout"}
    </button>
  );
}
