const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function sanitizeText(value, fallback = "") {
  const cleaned = String(value ?? "").trim();
  return cleaned || fallback;
}

export function validateEmail(value) {
  const email = sanitizeText(value);
  if (!email || !EMAIL_RE.test(email)) {
    throw new Error("A valid email address is required.");
  }
  return email;
}

export function validateUrl(value, fieldName) {
  const url = sanitizeText(value);

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch (error) {
    throw new Error(`${fieldName} must be a valid http or https URL.`);
  }

  throw new Error(`${fieldName} must be a valid http or https URL.`);
}

export function validateDate(value, fieldName) {
  const cleaned = sanitizeText(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    throw new Error(`${fieldName} must use YYYY-MM-DD format.`);
  }

  const parsed = new Date(`${cleaned}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} must use YYYY-MM-DD format.`);
  }

  return cleaned;
}

export function validateTime(value, fieldName) {
  const cleaned = sanitizeText(value);
  if (!/^\d{2}:\d{2}$/.test(cleaned)) {
    throw new Error(`${fieldName} must use HH:MM format.`);
  }

  const [hours, minutes] = cleaned.split(":").map(Number);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`${fieldName} must use HH:MM format.`);
  }

  return cleaned;
}

export function formatDisplayTime(startTime, endTime) {
  const formatOne = (value) =>
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(new Date(`1970-01-01T${value}:00`));

  return `${formatOne(startTime)} - ${formatOne(endTime)}`;
}
