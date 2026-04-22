"use client";

export async function apiRequest(path, options = {}) {
  const { allowUnauthorized = false, body, headers, ...rest } = options;
  const config = {
    method: rest.method || "GET",
    credentials: "same-origin",
    headers: {
      ...(headers || {})
    },
    ...rest
  };

  if (body !== undefined) {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(body);
  }

  const response = await fetch(path, config);
  let payload = {};

  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }

  if (!response.ok) {
    const message = payload.error || "Request failed.";
    const requestError = new Error(message);
    requestError.status = response.status;

    if (!allowUnauthorized && response.status === 401) {
      window.location.href = "/";
    }

    throw requestError;
  }

  return payload;
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("The selected image file could not be processed."));
    reader.readAsDataURL(file);
  });
}
