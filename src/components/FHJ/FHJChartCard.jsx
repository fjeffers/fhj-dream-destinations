// ==========================================================
// 📄 FILE: FHJChartCard.jsx  (FIXED)
// ⭐ Added explicit minHeight so Recharts gets proper dimensions
// Location: src/components/FHJ/FHJChartCard.jsx
// ==========================================================

import React from "react";

export default function FHJChartCard({ title, children }) {
  return (
    <div style={cardStyle}>
      {title && (
        <h2 style={titleStyle}>{title}</h2>
      )}
      {/* ⭐ Chart container with explicit minHeight — Recharts needs this */}
      <div style={{ width: "100%", minHeight: "300px" }}>
        {children}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "rgba(0, 0, 0, 0.55)",
  backdropFilter: "blur(14px)",
  borderRadius: "18px",
  padding: "1.75rem",
  border: "1px solid rgba(19, 18, 16, 0.25)",
  boxShadow: "0 0 25px rgba(55, 212, 63, 0.15)",
  transition: "0.3s ease",
};

const titleStyle = {
  color: "#D4AF37",
  marginBottom: "1rem",
  marginTop: 0,
  fontWeight: 600,
  letterSpacing: "0.5px",
};
