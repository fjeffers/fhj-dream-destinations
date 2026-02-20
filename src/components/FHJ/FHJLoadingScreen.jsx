// ==========================================================
// 📄 FILE: FHJLoadingScreen.jsx  (PHASE 3 — LUXURY POLISH)
// ⭐ Added inline styles + CSS for the orb animation
//    so it works without external CSS classes
// Location: src/components/FHJ/FHJLoadingScreen.jsx
// ==========================================================

import React from "react";

export default function FHJLoadingScreen() {
  return (
    <>
      <style>{`
        @keyframes fhj-orb-pulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 30px rgba(0,196,140,0.3); 
          }
          50% { 
            transform: scale(1.15); 
            box-shadow: 0 0 50px rgba(0,196,140,0.5), 0 0 80px rgba(0,196,140,0.2); 
          }
        }

        @keyframes fhj-orb-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fhj-text-fade {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>

      <div style={screenStyle}>
        {/* Rotating ring */}
        <div style={ringStyle} />

        {/* Pulsing orb */}
        <div style={orbStyle} />

        {/* Text */}
        <p style={textStyle}>
          Preparing your FHJ experience…
        </p>
      </div>
    </>
  );
}

const screenStyle = {
  position: "fixed",
  inset: 0,
  background: "linear-gradient(135deg, #0a0a0a, #111118, #0a0a0a)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2rem",
  zIndex: 99999,
};

const orbStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: "radial-gradient(circle, #00c48c 0%, rgba(0,196,140,0.3) 60%, transparent 100%)",
  animation: "fhj-orb-pulse 2s ease-in-out infinite",
};

const ringStyle = {
  position: "absolute",
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  border: "2px solid transparent",
  borderTopColor: "rgba(0,196,140,0.4)",
  borderRightColor: "rgba(0,196,140,0.15)",
  animation: "fhj-orb-rotate 1.5s linear infinite",
};

const textStyle = {
  color: "rgba(255,255,255,0.6)",
  fontSize: "0.95rem",
  fontWeight: 400,
  letterSpacing: "0.5px",
  animation: "fhj-text-fade 2.5s ease-in-out infinite",
  margin: 0,
};
