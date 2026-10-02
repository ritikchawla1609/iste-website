export default function StatCard({ label, value, icon, color = "red" }) {
  const iconClass =
    color === "blue"
      ? "stat-icon-blue"
      : color === "green"
      ? "stat-icon-green"
      : color === "amber"
      ? "stat-icon-amber"
      : "stat-icon-red";

  return (
    <div className="stat-card">
      <div className={`stat-icon-wrapper ${iconClass}`}>{icon}</div>
      <div className="stat-meta">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}
