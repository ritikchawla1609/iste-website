export default function Badge({ status }) {
  const norm = String(status || "").toLowerCase();

  let className = "badge-draft";
  let label = "Draft";

  if (norm === "published") {
    className = "badge-published";
    label = "Published";
  } else if (norm === "active") {
    className = "badge-active";
    label = "Active";
  } else if (norm === "inactive") {
    className = "badge-inactive";
    label = "Inactive";
  }

  return <span className={`badge ${className}`}>{label}</span>;
}
