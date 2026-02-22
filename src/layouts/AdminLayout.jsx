// ==========================================================
// FILE: AdminLayout.jsx  (REFAC: use shared AdminSidebar)
// Location: src/layouts/AdminLayout.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import { fhjTheme } from "../components/FHJ/FHJUIKit.jsx";

export default function AdminLayout({ admin, onLogout }) {
  // Initialize sidebar open state from localStorage or screen width
  const prefersOpen = typeof window !== "undefined" && window.innerWidth >= 900;
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("fhj_sidebar_open");
      if (saved !== null) return saved === "true";
    } catch {}
    return prefersOpen;
  });

  useEffect(() => {
    try {
      localStorage.setItem("fhj_sidebar_open", sidebarOpen ? "true" : "false");
    } catch {}
  }, [sidebarOpen]);

  return (
    <div style={layoutStyle}>
      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            style={sidebarWrapStyle}
            role="navigation"
            aria-label="Admin sidebar"
          >
            {/* Render shared AdminSidebar component (single source of truth) */}
            <AdminSidebar admin={admin} onLogout={onLogout} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setSidebarOpen((s) => !s)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSidebarOpen((s) => !s);
          }
        }}
        style={{
          ...toggleBtnStyle,
          left: sidebarOpen ? "260px" : "12px",
        }}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        type="button"
      >
        {sidebarOpen ? "‹" : "›"}
      </button>

      {/* MAIN CONTENT */}
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
}

/* ---------- Layout styles ---------- */

const layoutStyle = {
  display: "flex",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0a0a0a, #111, #0d0d0d)",
  color: "white",
};

const sidebarWrapStyle = {
  width: "260px",
  minWidth: "260px",
  height: "100vh",
  position: "sticky",
  top: 0,
  display: "flex",
  zIndex: 50,
};

const toggleBtnStyle = {
  position: "fixed",
  top: "1rem",
  transform: "translateX(-50%)",
  transition: "left 0.28s ease, background 0.12s ease",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(8px)",
  color: "white",
  padding: "0.36rem 0.6rem",
  borderRadius: "8px",
  cursor: "pointer",
  zIndex: 999,
  fontSize: "1.05rem",
  lineHeight: 1,
};

const mainStyle = {
  flex: 1,
  padding: "2rem",
  overflowY: "auto",
  minHeight: "100vh",
};