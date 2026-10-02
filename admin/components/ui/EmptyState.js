export default function EmptyState({
  icon = "📂",
  title = "No records found",
  description = "Get started by creating your first entry.",
  actionLabel,
  onAction
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn-primary btn-accent" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
