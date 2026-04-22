import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export async function readJson(request) {
  try {
    const data = await request.json();
    if (!data || Array.isArray(data) || typeof data !== "object") {
      throw new HttpError(400, "JSON body must be an object.");
    }
    return data;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(400, "Invalid JSON body.");
  }
}

export function jsonError(error) {
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Server error.";
  return NextResponse.json({ error: message }, { status });
}

export function parseRouteId(value, label) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `${label} is invalid.`);
  }
  return id;
}
