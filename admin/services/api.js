"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function getStoredToken() {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("iste_admin_token") || "";
  } catch {
    return "";
  }
}

export function setStoredToken(token) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem("iste_admin_token", token);
    } else {
      localStorage.removeItem("iste_admin_token");
    }
  } catch (e) {
    // Ignore storage errors
  }
}

export function clearStoredToken() {
  setStoredToken("");
}

export async function apiRequest(endpoint, options = {}) {
  const { allowUnauthorized = false, body, headers, ...rest } = options;

  // If endpoint is relative (starts with /api), use rewrites or API_BASE_URL
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const token = getStoredToken();

  const config = {
    method: rest.method || "GET",
    credentials: "include", // Transmit session cookies
    headers: {
      Accept: "application/json",
      ...(headers || {})
    },
    ...rest
  };

  // Add Bearer token header if present
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // Handle JSON body
  if (body !== undefined && !(body instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    // Let browser set the multipart Content-Type header with boundary
    config.body = body;
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    const error = new Error(
      `Network connection failed. Please ensure the backend server is running at ${API_BASE_URL || "the configured URL"}.`
    );
    error.status = 0;
    throw error;
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch (e) {
    payload = {};
  }

  if (!response.ok) {
    const message = payload.error || payload.message || "Request failed.";
    const requestError = new Error(message);
    requestError.status = response.status;
    requestError.details = payload;

    if (!allowUnauthorized && response.status === 401) {
      clearStoredToken();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = `/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`;
      }
    }

    throw requestError;
  }

  return payload;
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(new Error("The selected image file could not be processed."));
    reader.readAsDataURL(file);
  });
}
