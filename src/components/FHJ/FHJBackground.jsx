// src/components/FHJ/FHJBackground.jsx
import React, { useState, useEffect } from "react";

export default function FHJBackground({ children, page = "default" }) {

  // WebP images (optimized — dramatically smaller than original PNGs)
  const backgrounds = {
    home: "/fhj-home.webp",
    book: "/fhj-book.webp",
    deals: "/fhj-book.webp",
    appointment: "/fhj-appointment.webp",
    default: "/fhj-hero1.png",
  };

  // Fallback gradient per page shown instantly while the image loads
  const fallbacks = {
    home: "linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #0a0e1a 100%)",
    book: "linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #0a0e1a 100%)",
    deals: "linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #0a0e1a 100%)",
    appointment: "linear-gradient(135deg, #0a1a14 0%, #0a1520 40%, #0d1117 100%)",
    default: "linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #0a0e1a 100%)",
  };

  const bgSrc = backgrounds[page] || backgrounds.default;
  const fallback = fallbacks[page] || fallbacks.default;

  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    const img = new Image();
    img.onload = () => setImgLoaded(true);
    img.onerror = () => setImgLoaded(false);
    img.src = bgSrc;
  }, [bgSrc]);

  return (
    <div style={{ width: "100%", minHeight: "100vh", position: "relative" }}>

      {/* LAYER 0: FALLBACK GRADIENT (always visible, shows instantly) */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100%", height: "100%",
          background: fallback,
          zIndex: 0,
        }}
      />

      {/* LAYER 1: BACKGROUND IMAGE — fades in once loaded to prevent black flash */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100%", height: "100%",
          backgroundImage: imgLoaded ? `url('${bgSrc}')` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: imgLoaded ? 1 : 0,
          transition: "opacity 0.6s ease",
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