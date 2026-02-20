// ==========================================================
// FILE: AdminLayout.jsx  (UPDATED — Added RSVPs nav)
// Location: src/layouts/AdminLayout.jsx
// ==========================================================

import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fhjTheme } from "../components/FHJ/FHJUIKit.jsx";

export default function AdminLayout({ admin, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isOwner = (admin?.Role || admin?.role) === "Owner";

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: "📊", end: true },
    { to: "/admin/clients", label: "Clients", icon: "👥" },
    { to: "/admin/trips", label: "Trips", icon: "✈️" },
    { to: "/admin/bookings", label: "Bookings", icon: "📋" },
    { to: "/admin/deals", label: "Deals", icon: "🏷️" },
    { to: "/admin/events", label: "Events", icon: "🎉" },
    { to: "/admin/rsvps", label: "RSVPs", icon: "🎫" },
    { to: "/admin/concierge", label: "Concierge", icon: "💬" },
    { to: "/admin/calendar", label: "Calendar", icon: "📅" },
    { to: "/admin/availability", label: "Availability", icon: "🚫" },
  ];

  // Owner-only items
  if (isOwner) {
    navItems.push({ to: "/admin/settings", label: "Settings", icon: "⚙️" });
  }

  return (
    <div style={layoutStyle}>
      
      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            style={sidebarStyle}
          >
            {/* Brand */}
            <div style={brandStyle}>
              <span style={{ color: fhjTheme.primary, fontSize: "1.3rem", fontWeight: 800 }}>
                FHJ
              </span>
              <span style={{ color: "white", fontSize: "1.3rem", fontWeight: 300, marginLeft: "6px" }}>
                Admin
              </span>
            </div>

            {/* Admin Info */}
            <div style={adminInfoStyle}>
              <div style={avatarStyle}>
                {(admin?.Name || admin?.name || admin?.Email || admin?.email || "A").charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>
                  {admin?.Name || admin?.name || admin?.Email || admin?.email || "Admin"}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                  {admin?.Role || admin?.role || "Admin"}
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  style={({ isActive }) => ({
                    ...linkBaseStyle,
                    ...(isActive ? linkActiveStyle : {}),
                  })}
                >
                  <span style={{ fontSize: "1rem", width: "24px", textAlign: "center" }}>
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <button onClick={onLogout} style={logoutBtnStyle}>
              Log Out
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          ...toggleBtnStyle,
          left: sidebarOpen ? "260px" : "12px",
        }}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
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

const layoutStyle = {
  display: "flex",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0a0a0a, #111, #0d0d0d)",
  color: "white",
};

const sidebarStyle = {
  width: "260px",
  minWidth: "260px",
  height: "100vh",
  position: "sticky",
  top: 0,
  background: "rgba(10,10,15,0.95)",
  backdropFilter: "blur(14px)",
  borderRight: "1px solid rgba(255,255,255,0.06)",
  padding: "1.5rem 1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  overflowY: "auto",
};

const brandStyle = {
  padding: "0 0.5rem",
  marginBottom: "1.5rem",
};

const adminInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem",
  marginBottom: "1rem",
  background: "rgba(255,255,255,0.04)",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.06)",
};

const avatarStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "rgba(0,196,140,0.2)",
  color: "#00c48c",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: "0.9rem",
  flexShrink: 0,
};

const linkBaseStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "0.7rem 0.75rem",
  borderRadius: "8px",
  textDecoration: "none",
  color: "#94a3b8",
  fontSize: "0.9rem",
  fontWeight: 500,
  transition: "all 0.2s ease",
  border: "1px solid transparent",
};

const linkActiveStyle = {
  background: "rgba(0,196,140,0.12)",
  color: "#00c48c",
  borderColor: "rgba(0,196,140,0.25)",
  fontWeight: 600,
};

const logoutBtnStyle = {
  marginTop: "auto",
  padding: "0.75rem",
  borderRadius: "8px",
  background: "rgba(248,113,113,0.1)",
  border: "1px solid rgba(248,113,113,0.25)",
  color: "#fca5a5",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: 500,
  transition: "all 0.2s ease",
};

const toggleBtnStyle = {
  position: "fixed",
  top: "1rem",
  transform: "translateX(-50%)",
  transition: "left 0.3s ease",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(8px)",
  color: "white",
  padding: "0.4rem 0.7rem",
  borderRadius: "6px",
  cursor: "pointer",
  zIndex: 999,
  fontSize: "1.1rem",
  lineHeight: 1,
};

const mainStyle = {
  flex: 1,
  padding: "2rem",
  overflowY: "auto",
  minHeight: "100vh",
};