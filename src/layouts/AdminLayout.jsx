import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

  const isOwner = (admin?.Role || admin?.role) === "Owner";

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: "📊", end: true },
    { to: "/admin/clients", label: "Clients", icon: "👥" },
    { to: "/admin/trips", label: "Trips", icon: "✈️" },
    { to: "/admin/bookings", label: "Bookings", icon: "📋" },
    { to: "/admin/deals", label: "Deals", icon: "🏷️" },
    { to: "/admin/events", label: "Events", icon: "🎉" },
    { to: "/admin/rsvps", label: "RSVPs", icon: "🎫" },
    // NEW: About page link added to the admin nav
    { to: "/admin/about", label: "About", icon: "ℹ️" },
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
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            style={sidebarStyle}
            role="navigation"
            aria-label="Admin sidebar"
          >
            {/* Brand */}
            <div style={brandStyle}>
              <span style={{ color: fhjTheme.primary, fontSize: "1.25rem", fontWeight: 800 }}>
                FHJ
              </span>
              <span
                style={{
                  color: "white",
                  fontSize: "1.1rem",
                  fontWeight: 300,
                  marginLeft: "8px",
                }}
              >
                Admin
              </span>
            </div>

            {/* Admin Info */}
            <div style={adminInfoStyle}>
              <div style={avatarStyle}>
                {(admin?.Name || admin?.name || admin?.Email || admin?.email || "A")
                  .charAt(0)
                  .toUpperCase()}
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
            <nav
              style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}
              aria-label="Admin navigation"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  style={({ isActive }) => ({
                    ...linkBaseStyle,
                    ...(isActive ? linkActiveStyle : {}),
                  })}
                  // keyboard accessibility: allow Enter/Space to activate link area
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.currentTarget.click();
                    }
                  }}
                >
                  <span style={{ fontSize: "1rem", width: "28px", textAlign: "center" }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {/* Visually-hidden aria-current text for screen readers */}
                  <span style={srOnlyStyle} aria-hidden="false" />
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div style={{ marginTop: 12 }}>
              <button
                onClick={onLogout}
                style={logoutBtnStyle}
                aria-label="Log out of admin"
                title="Log out"
                type="button"
              >
                Log Out
              </button>
            </div>
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
          left: sidebarOpen ? "280px" : "12px",
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

/* ---------- Styles ---------- */

const layoutStyle = {
  display: "flex",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0a0a0a, #111, #0d0d0d)",
  color: "white",
};

const sidebarStyle = {
  width: "280px",
  minWidth: "280px",
  height: "100vh",
  position: "sticky",
  top: 0,
  background: "rgba(10,10,15,0.96)",
  backdropFilter: "blur(14px)",
  borderRight: "1px solid rgba(255,255,255,0.06)",
  padding: "1.25rem 0.85rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  overflowY: "auto",
  zIndex: 50,
};

const brandStyle = {
  padding: "0 0.6rem",
  marginBottom: "1rem",
  display: "flex",
  alignItems: "center",
};

const adminInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.6rem",
  margin: "0 0 1rem 0",
  background: "rgba(255,255,255,0.03)",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.04)",
};

const avatarStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "rgba(0,196,140,0.12)",
  color: "#00c48c",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: "0.95rem",
  flexShrink: 0,
};

const linkBaseStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "0.7rem 0.85rem",
  borderRadius: "8px",
  textDecoration: "none",
  color: "#cbd5e1",
  fontSize: "0.95rem",
  fontWeight: 500,
  transition: "all 180ms ease",
  border: "1px solid transparent",
  cursor: "pointer",
  outline: "none",
};

const linkActiveStyle = {
  background: "linear-gradient(90deg, rgba(0,196,140,0.06), rgba(0,196,140,0.03))",
  color: "#00c48c",
  borderColor: "rgba(0,196,140,0.15)",
  fontWeight: 600,
  boxShadow: `0 4px 18px rgba(0,196,140,0.06)`,
};

const logoutBtnStyle = {
  width: "100%",
  padding: "0.7rem",
  borderRadius: "8px",
  background: "rgba(248,113,113,0.08)",
  border: "1px solid rgba(248,113,113,0.18)",
  color: "#ffb4b4",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: 600,
  transition: "all 160ms ease",
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

/* Small helper: visually hidden for screen readers if needed */
const srOnlyStyle = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};
