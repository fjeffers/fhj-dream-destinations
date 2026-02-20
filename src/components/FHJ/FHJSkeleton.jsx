// ==========================================================
// 📄 FILE: FHJSkeleton.jsx  (PHASE 3 — LUXURY POLISH)
// Shimmer loading placeholders that match final layouts
// Location: src/components/FHJ/FHJSkeleton.jsx
//
// Usage:
//   <FHJSkeleton variant="card" count={3} />
//   <FHJSkeleton variant="table" rows={5} cols={4} />
//   <FHJSkeleton variant="text" lines={4} />
//   <FHJSkeleton variant="profile" />
//   <FHJSkeleton variant="stat" count={4} />
//   <FHJSkeleton variant="deal-card" count={3} />
// ==========================================================

import React from "react";

// Inject shimmer keyframes once
if (typeof document !== "undefined") {
  const id = "fhj-skeleton-styles";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes fhj-shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// -------------------------------------------------------
// Base shimmer block
// -------------------------------------------------------
function Shimmer({ width = "100%", height = "16px", borderRadius = "8px", style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.10) 40%, rgba(255,255,255,0.04) 80%)",
        backgroundSize: "800px 100%",
        animation: "fhj-shimmer 1.8s infinite ease-in-out",
        ...style,
      }}
    />
  );
}

// -------------------------------------------------------
// Variants
// -------------------------------------------------------

function SkeletonCard() {
  return (
    <div style={cardStyle}>
      <Shimmer height="180px" borderRadius="12px 12px 0 0" />
      <div style={{ padding: "1.25rem" }}>
        <Shimmer width="70%" height="20px" style={{ marginBottom: "12px" }} />
        <Shimmer width="45%" height="14px" style={{ marginBottom: "8px" }} />
        <Shimmer width="30%" height="14px" />
      </div>
    </div>
  );
}

function SkeletonDealCard() {
  return (
    <div style={dealCardStyle}>
      <Shimmer height="220px" borderRadius="16px 16px 0 0" />
      <div style={{ padding: "1.5rem" }}>
        <Shimmer width="75%" height="22px" style={{ marginBottom: "14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Shimmer width="30%" height="14px" />
          <Shimmer width="25%" height="14px" />
        </div>
      </div>
    </div>
  );
}

function SkeletonText({ lines = 3 }) {
  const widths = ["100%", "92%", "85%", "78%", "60%"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer key={i} width={widths[i % widths.length]} height="14px" />
      ))}
    </div>
  );
}

function SkeletonTable({ rows = 4, cols = 5 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {/* Header */}
      <div style={tableRowStyle}>
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={`h-${i}`} height="14px" style={{ flex: 1 }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} style={tableRowStyle}>
          {Array.from({ length: cols }).map((_, ci) => (
            <Shimmer key={`${ri}-${ci}`} height="16px" style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonProfile() {
  return (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      <Shimmer width="72px" height="72px" borderRadius="50%" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <Shimmer width="50%" height="20px" />
        <Shimmer width="70%" height="14px" />
        <Shimmer width="40%" height="14px" />
      </div>
    </div>
  );
}

function SkeletonStat() {
  return (
    <div style={statStyle}>
      <Shimmer width="60%" height="14px" style={{ marginBottom: "10px" }} />
      <Shimmer width="40%" height="28px" style={{ marginBottom: "6px" }} />
      <Shimmer width="50%" height="12px" />
    </div>
  );
}

function SkeletonTimeline({ items = 4 }) {
  return (
    <div style={{ borderLeft: "2px solid rgba(255,255,255,0.08)", paddingLeft: "1.5rem" }}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} style={{ position: "relative", marginBottom: "1.75rem" }}>
          <div style={timelineDot} />
          <Shimmer width="30%" height="12px" style={{ marginBottom: "8px" }} />
          <Shimmer width="80%" height="16px" style={{ marginBottom: "6px" }} />
          <Shimmer width="55%" height="12px" />
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------
// Main Export
// -------------------------------------------------------
export default function FHJSkeleton({
  variant = "card",
  count = 1,
  rows,
  cols,
  lines,
  items,
}) {
  const renderVariant = () => {
    switch (variant) {
      case "card":
        return Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />);
      case "deal-card":
        return Array.from({ length: count }).map((_, i) => <SkeletonDealCard key={i} />);
      case "text":
        return <SkeletonText lines={lines || 3} />;
      case "table":
        return <SkeletonTable rows={rows || 4} cols={cols || 5} />;
      case "profile":
        return <SkeletonProfile />;
      case "stat":
        return (
          <div style={statGrid}>
            {Array.from({ length: count }).map((_, i) => <SkeletonStat key={i} />)}
          </div>
        );
      case "timeline":
        return <SkeletonTimeline items={items || 4} />;
      default:
        return <SkeletonCard />;
    }
  };

  if (variant === "card" || variant === "deal-card") {
    return (
      <div style={gridStyle}>
        {renderVariant()}
      </div>
    );
  }

  return <>{renderVariant()}</>;
}

// Also export individual variants for direct use
export { Shimmer, SkeletonCard, SkeletonDealCard, SkeletonText, SkeletonTable, SkeletonProfile, SkeletonStat, SkeletonTimeline };

// -------------------------------------------------------
// Styles
// -------------------------------------------------------
const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.06)",
  overflow: "hidden",
};

const dealCardStyle = {
  background: "rgba(0,0,0,0.4)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
  overflow: "hidden",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "1.5rem",
};

const tableRowStyle = {
  display: "flex",
  gap: "1rem",
  padding: "0.75rem 0.5rem",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

const statStyle = {
  background: "rgba(255,255,255,0.04)",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.06)",
  padding: "1.25rem",
};

const statGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "1rem",
};

const timelineDot = {
  position: "absolute",
  left: "-2.05rem",
  top: "0.15rem",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.12)",
};
