// ==========================================================
// FILE: AdminSidebar.jsx (UPDATED — Added About Page)
// Location: src/components/admin/AdminSidebar.jsx
// ==========================================================

import React from "react";
import { NavLink } from "react-router-dom";
import { fhjTheme } from "../../FHJ/FHJUIKit";

export default function AdminSidebar({ admin, onLogout }) {
  const linkStyle = {
    padding: "0.9rem 1.2rem",
    borderRadius: "8px",
    marginBottom: "0.4rem",
    fontSize: "0.95rem",
    cursor: "pointer",
    textDecoration: "none",
    color: "#fff",
    display: "block",
    transition: "0.25s ease",
  };
  
  const activeStyle = {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(12px)",
    borderLeft: `3px solid ${fhjTheme.primary}`,
    boxShadow: "0 0 12px rgba(212,175,55,0.25)",
  };
  
  const hoverStyle = {
    background: "rgba(255,255,255,0.08)",
  };
  
  return (
    <div
      style={{
        width: "240px",
        height: "100vh",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(18px)",
        padding: "1.5rem",
        color: "white",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "2rem", fontWeight: 600 }}>
        FHJ Admin
      </h2>
      
      {/* NAVIGATION */}
      {[
        { to: "/admin/dashboard", label: "Dashboard" },
        { to: "/admin/deals", label: "Deals" },
        { to: "/admin/clients", label: "Clients" },
        { to: "/admin/trips", label: "Trips" },
        { to: "/admin/events", label: "Events" },
        { to: "/admin/concierge", label: "Concierge Inbox" },
        { to: "/admin/about", label: "About Page" },
      ].map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            ...linkStyle,
            ...(isActive ? activeStyle : {}),
          })}
          onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
          onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
        >
          {item.label}
        </NavLink>
      ))}
      
      {/* OWNER-ONLY SETTINGS */}
      {admin.Role === "Owner" && (
        <NavLink
          to="/admin/settings"
          style={({ isActive }) => ({
            ...linkStyle,
            ...(isActive ? activeStyle : {}),
          })}
          onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
          onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
        >
          Admin Settings
        </NavLink>
      )}
      
      <div style={{ flexGrow: 1 }} />
      
      {/* LOGOUT */}
      <button
        onClick={onLogout}
        style={{
          ...linkStyle,
          background: "rgba(255,80,80,0.2)",
          border: "1px solid rgba(255,80,80,0.4)",
        }}
      >
        Logout
      </button>
    </div>
  );
}
