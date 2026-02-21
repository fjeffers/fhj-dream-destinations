// ==========================================================
// 📄 FILE: AppShell.jsx  (PHASE 3 — LUXURY POLISH)
// ⭐ Added FHJPageTransition for smooth route animations
// ⭐ Added hidden admin link in footer
// Location: src/AppShell.jsx
// ==========================================================
import React, { Suspense } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import FHJPageTransition from "./components/FHJ/FHJPageTransition.jsx";

export default function AppShell() {
  const location = useLocation();
  
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      {/* 1. Navigation Bar */}
      <Navbar brandName="FHJ DREAM DESTINATIONS" />
      
      {/* 2. Animated Content */}
      <main style={{ flex: 1, position: "relative" }}>
        <Suspense fallback={
          <div style={{ color: "white", padding: "2rem", textAlign: "center" }}>
            Loading...
          </div>
        }>
          <AnimatePresence mode="wait">
            <FHJPageTransition key={location.pathname} variant="luxury">
              <Outlet />
            </FHJPageTransition>
          </AnimatePresence>
        </Suspense>
      </main>
      
      {/* 3. Footer with hidden admin link */}
      <footer style={footerStyle}>
        <p style={{ margin: 0, opacity: 0.7 }}>
          © {new Date().getFullYear()} FHJ Dream Destinations · Crafted with intention
        </p>
        {/* Hidden admin link - only visible on hover */}
        <Link 
          to="/admin/login" 
          style={adminLinkStyle}
          onMouseEnter={(e) => e.target.style.opacity = '0.5'}
          onMouseLeave={(e) => e.target.style.opacity = '0.1'}
        >
          •
        </Link>
      </footer>
    </div>
  );
}

const footerStyle = {
  background: "#000",
  color: "#999",
  padding: "2rem",
  textAlign: "center",
  fontSize: "0.9rem",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  marginTop: "auto",
  position: "relative",
  zIndex: 10,
};

const adminLinkStyle = {
  position: "absolute",
  bottom: "0.5rem",
  right: "1rem",
  color: "#666",
  textDecoration: "none",
  fontSize: "0.7rem",
  opacity: 0.1,
  transition: "opacity 0.3s ease",
  cursor: "pointer",
};
