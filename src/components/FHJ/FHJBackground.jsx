// src/components/FHJ/FHJBackground.jsx
import React from "react";

export default function FHJBackground({ children, page = "default" }) {
  
  const backgrounds = {
    home: "url('/fhj-home.png')",       
    book: "url('/fhj-book.png')",
    deals: "url('/fhj-deals.png')",
    appointment: "url('/fhj-appointment.png')",
    default: "url('/fhj-hero.png')"
  };

  // Fallback gradient per page in case image is missing
  const fallbacks = {
    home: "linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #0a0e1a 100%)",
    book: "linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #0a0e1a 100%)",
    deals: "linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #0a0e1a 100%)",
    appointment: "linear-gradient(135deg, #0a1a14 0%, #0a1520 40%, #0d1117 100%)",
    default: "linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #0a0e1a 100%)",
  };

  const bgImage = backgrounds[page] || backgrounds.default;
  const fallback = fallbacks[page] || fallbacks.default;

  return (
    <div style={{ width: "100%", minHeight: "100vh", position: "relative" }}>
      
      {/* LAYER 0: FALLBACK COLOR (always visible behind image) */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100%", height: "100%",
          background: fallback,
          zIndex: 0,
        }}
      />

      {/* LAYER 1: BACKGROUND IMAGE (Fixed to screen) */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: bgImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />

      {/* LAYER 2: DARK OVERLAY (Readability) */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100%", height: "100%",
          background: page === "appointment"
            ? "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.55))"
            : "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8))",
          zIndex: 1,
        }}
      />

      {/* LAYER 3: PAGE CONTENT */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}