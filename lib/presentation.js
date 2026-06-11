import { DEFAULT_ABOUT, DEFAULT_NOTICE } from "@/lib/default-content";
import { sanitizeText } from "@/lib/validation";

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function normalizeStringList(value, fallback) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const items = value.map((item) => sanitizeText(item)).filter(Boolean).slice(0, 12);
  return items.length ? items : [...fallback];
}

export function normalizeFocusCards(value, fallback) {
  if (!Array.isArray(value) || value.length !== 3) {
    return fallback.map((card) => ({ ...card }));
  }

  return value.map((card, index) => ({
    title: sanitizeText(card?.title, fallback[index].title),
    text: sanitizeText(card?.text, fallback[index].text)
  }));
}

export function normalizeNotice(value) {
  return {
    detailText: sanitizeText(value?.detailText, DEFAULT_NOTICE.detailText)
  };
}

export function normalizeAbout(value) {
  return {
    heroTitle: sanitizeText(value?.heroTitle, DEFAULT_ABOUT.heroTitle),
    heroText: sanitizeText(value?.heroText, DEFAULT_ABOUT.heroText),
    overviewTitle: sanitizeText(value?.overviewTitle, DEFAULT_ABOUT.overviewTitle),
    overviewParagraphOne: sanitizeText(
      value?.overviewParagraphOne,
      DEFAULT_ABOUT.overviewParagraphOne
    ),
    overviewParagraphTwo: sanitizeText(
      value?.overviewParagraphTwo,
      DEFAULT_ABOUT.overviewParagraphTwo
    ),
    visionTitle: sanitizeText(value?.visionTitle, DEFAULT_ABOUT.visionTitle),
    visionItems: normalizeStringList(value?.visionItems, DEFAULT_ABOUT.visionItems),
    focusTitle: sanitizeText(value?.focusTitle, DEFAULT_ABOUT.focusTitle),
    focusCards: normalizeFocusCards(value?.focusCards, DEFAULT_ABOUT.focusCards),
    facultyTitle: sanitizeText(value?.facultyTitle, DEFAULT_ABOUT.facultyTitle),
    facultyText: sanitizeText(value?.facultyText, DEFAULT_ABOUT.facultyText),
    teamTitle: sanitizeText(value?.teamTitle, DEFAULT_ABOUT.teamTitle),
    teamText: sanitizeText(value?.teamText, DEFAULT_ABOUT.teamText),
    galleryTitle: sanitizeText(value?.galleryTitle, DEFAULT_ABOUT.galleryTitle),
    galleryText: sanitizeText(value?.galleryText, DEFAULT_ABOUT.galleryText),
    pastEventsTitle: sanitizeText(value?.pastEventsTitle, DEFAULT_ABOUT.pastEventsTitle),
    pastEventsText: sanitizeText(value?.pastEventsText, DEFAULT_ABOUT.pastEventsText),
    downloadsTitle: sanitizeText(value?.downloadsTitle, DEFAULT_ABOUT.downloadsTitle),
    downloadsText: sanitizeText(value?.downloadsText, DEFAULT_ABOUT.downloadsText),
    policyTitle: sanitizeText(value?.policyTitle, DEFAULT_ABOUT.policyTitle),
    policyText: sanitizeText(value?.policyText, DEFAULT_ABOUT.policyText),
    contactTitle: sanitizeText(value?.contactTitle, DEFAULT_ABOUT.contactTitle),
    contactText: sanitizeText(value?.contactText, DEFAULT_ABOUT.contactText),
    adminNoteTitle: sanitizeText(value?.adminNoteTitle, DEFAULT_ABOUT.adminNoteTitle),
    adminNoteText: sanitizeText(value?.adminNoteText, DEFAULT_ABOUT.adminNoteText)
  };
}

export function safeUrl(value) {
  try {
    const url = new URL(String(value ?? "").trim());
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch (error) {
    return "";
  }

  return "";
}

export function toComparableDate(dateString, timeString = "00:00") {
  const date = sanitizeText(dateString);
  if (!date) {
    return new Date(0);
  }

  return new Date(`${date}T${sanitizeText(timeString, "00:00")}:00`);
}

export function sortByDate(items, fieldName, secondaryField = null, descending = false) {
  return [...items].sort((first, second) => {
    const firstDate = toComparableDate(
      first[fieldName],
      secondaryField ? first[secondaryField] : "00:00"
    );
    const secondDate = toComparableDate(
      second[fieldName],
      secondaryField ? second[secondaryField] : "00:00"
    );
    return descending ? secondDate - firstDate : firstDate - secondDate;
  });
}

export function formatDate(dateString) {
  const dateObj = toComparableDate(dateString);
  if (!dateObj || isNaN(dateObj.getTime())) {
    return "";
  }

  const day = dateObj.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day} ${month} ${year}`;
}

export function formatTimestamp(dateString) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata"
  }).format(new Date(dateString));
}

export function formatBytes(size) {
  if (typeof size !== "number" || Number.isNaN(size)) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  const units = ["KB", "MB", "GB"];
  let current = size / 1024;
  let index = 0;

  while (current >= 1024 && index < units.length - 1) {
    current /= 1024;
    index += 1;
  }

  return `${current.toFixed(current >= 10 ? 0 : 1)} ${units[index]}`;
}

export function getStatusBadgeLabel(status) {
  return status === "published" ? "Published" : "Draft";
}

export function getStatusActionLabel(status) {
  return status === "published" ? "Move to Draft" : "Publish";
}

export function formatAuditTitle(entry) {
  const actionMap = {
    login: "Author logged in",
    logout: "Author logged out",
    create: "Created",
    update: "Updated",
    delete: "Deleted",
    status_change: "Status changed",
    create_backup: "Database backup created",
    restore_backup: "Database backup restored"
  };

  const entityMap = {
    event: "event record",
    recruitment: "recruitment record",
    site_content: "site content",
    auth: "author session",
    backup: "backup"
  };

  return `${actionMap[entry.action] || "Updated"} ${entityMap[entry.entityType] || entry.entityType}`;
}

export const RECRUITMENT_TEAMS = [
  { id: "01", name: "Tech Team", keywords: ["tech"] },
  { id: "02", name: "Event Team", keywords: ["event"] },
  { id: "03", name: "Operational Team", keywords: ["operational", "operation"] },
  { id: "04", name: "Media Team", keywords: ["media"] },
  { id: "05", name: "Design Team", keywords: ["design"] },
  { id: "06", name: "Sponsorship", keywords: ["sponsorship", "sponsor"] }
];

export const DEFAULT_RECRUITMENT_STATUS = Object.fromEntries(
  RECRUITMENT_TEAMS.map((team) => [team.id, "active"])
);

export function findRecruitmentForTeam(recruitments, team) {
  if (!Array.isArray(recruitments) || !team) {
    return null;
  }

  const teamName = team.name.toLowerCase();
  const keywords = team.keywords?.length ? team.keywords : [teamName.split(" ")[0]];

  return (
    recruitments.find((record) => {
      const domain = String(record.domain ?? "").toLowerCase().trim();
      const title = String(record.title ?? "").toLowerCase().trim();
      if (!domain && !title) {
        return false;
      }
      if (domain === team.id || domain === teamName) {
        return true;
      }
      if (keywords.some((keyword) => domain.includes(keyword) || title.includes(keyword))) {
        return true;
      }
      return domain.includes(teamName) || teamName.includes(domain);
    }) || null
  );
}

export function resolveTeamApplyUrl(recruitments, team) {
  const matchedRecruitments = Array.isArray(recruitments)
    ? recruitments.filter((record) => findRecruitmentForTeam([record], team))
    : [];
  const matchedWithUrl = matchedRecruitments.find((record) => safeUrl(record?.applicationLink));

  return safeUrl(matchedWithUrl?.applicationLink);
}
