export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        gap: "16px",
        color: "var(--text-soft)"
      }}
    >
      <div
        className="spinner"
        style={{
          width: "40px",
          height: "40px",
          border: "3.5px solid var(--line)",
          borderTopColor: "var(--brand-red)",
          borderRadius: "50%"
        }}
      />
      <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>{message}</span>
    </div>
  );
}
