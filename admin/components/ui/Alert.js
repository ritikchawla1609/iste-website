"use client";

export default function Alert({ type = "info", message, onClose }) {
  if (!message) return null;

  const typeClass =
    type === "error" || type === "status-error"
      ? "alert-error"
      : type === "success" || type === "status-success"
      ? "alert-success"
      : "alert-info";

  const icon =
    type === "error" || type === "status-error"
      ? "⚠️"
      : type === "success" || type === "status-success"
      ? "✅"
      : "ℹ️";

  return (
    <div className={`alert ${typeClass}`} role="alert">
      <span>{icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.1rem",
            color: "inherit",
            opacity: 0.7
          }}
          aria-label="Dismiss alert"
        >
          &times;
        </button>
      )}
    </div>
  );
}
