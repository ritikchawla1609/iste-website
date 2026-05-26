"use client";

import { useEffect, useState } from "react";

export default function GoogleFormModal({ open, onClose, formUrl, eventName }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setLoading(true);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open || !formUrl) return null;

  // Convert regular docs.google.com link to embed link
  let embedUrl = formUrl;
  if (embedUrl.includes("docs.google.com/forms") && embedUrl.includes("/viewform")) {
    if (embedUrl.includes("?")) {
      if (!embedUrl.includes("embedded=true")) {
        embedUrl = `${embedUrl}&embedded=true`;
      }
    } else {
      embedUrl = `${embedUrl}?embedded=true`;
    }
  }

  return (
    <div className="modal" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
      <div 
        className="modal-backdrop" 
        onClick={onClose} 
        style={{ 
          position: "fixed", 
          inset: 0, 
          background: "rgba(11, 17, 32, 0.8)", 
          backdropFilter: "blur(12px)", 
          transition: "opacity 0.3s ease" 
        }} 
      />
      <div 
        className="modal-dialog" 
        style={{ 
          position: "relative", 
          width: "min(850px, 95%)", 
          height: "85vh", 
          display: "flex", 
          flexDirection: "column", 
          padding: 0, 
          overflow: "hidden", 
          background: "var(--navy-900)", 
          border: "1px solid rgba(255, 255, 255, 0.1)", 
          borderRadius: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "20px 32px", 
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)", 
            background: "rgba(15, 23, 42, 0.6)" 
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--brand-red)", fontWeight: 700 }}>Event Registration</span>
            <h3 style={{ margin: 0, fontSize: "1.3rem", color: "#ffffff", fontWeight: 800 }}>{eventName}</h3>
          </div>
          <button 
            className="modal-close" 
            onClick={onClose} 
            style={{ 
              position: "static", 
              width: "36px", 
              height: "36px", 
              borderRadius: "50%", 
              background: "rgba(255, 255, 255, 0.03)", 
              border: "1px solid rgba(255, 255, 255, 0.08)", 
              color: "#ffffff", 
              fontSize: "1.25rem", 
              cursor: "pointer", 
              display: "grid", 
              placeItems: "center",
              transition: "all 0.2s ease"
            }}
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, position: "relative", width: "100%", background: "#ffffff" }}>
          {loading && (
            <div 
              style={{ 
                position: "absolute", 
                inset: 0, 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center", 
                background: "var(--navy-900)", 
                gap: "16px" 
              }}
            >
              <div 
                style={{ 
                  width: "40px", 
                  height: "40px", 
                  border: "3px solid rgba(255, 255, 255, 0.1)", 
                  borderTopColor: "var(--brand-red)", 
                  borderRadius: "50%", 
                  animation: "spin 1s linear infinite" 
                }} 
              />
              <span style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 500 }}>Loading Registration Form…</span>
            </div>
          )}
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            onLoad={() => setLoading(false)}
            style={{ display: "block" }}
          >
            Loading form…
          </iframe>
        </div>
      </div>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
