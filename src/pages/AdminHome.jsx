import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import Navigation
import { FHJCard, FHJButton, fhjTheme } from "../components/fhj/FHJUIKit.jsx";

export default function AdminHome({ admin }) {
  const navigate = useNavigate(); // Initialize hook
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/.netlify/functions/admin-dashboard-stats");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError(true);
        // Fallback data so the UI doesn't break during development
        setStats({
            clients: 0,
            bookings: 0,
            trips: 0,
            upcomingTrips: 0,
            unreadMessages: 0,
            pendingRSVPs: 0
        });
      }
    };
    load();
  }, []);

  if (!stats && !error) {
    return (
      <div style={{ padding: "2rem", color: "white" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ 
          color: fhjTheme.colors.accent, // FIXED: Correct theme path
          marginBottom: "1.5rem" 
      }}>
        Welcome back, {admin?.Name || admin?.email || "Admin"}
      </h2>

      {/* KPI GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <DashboardCard label="Clients" value={stats?.clients || 0} />
        <DashboardCard label="Bookings" value={stats?.bookings || 0} />
        <DashboardCard label="Total Trips" value={stats?.trips || 0} />
        <DashboardCard label="Upcoming Trips" value={stats?.upcomingTrips || 0} />
        <DashboardCard label="Unread Concierge" value={stats?.unreadMessages || 0} highlight />
        <DashboardCard label="Pending RSVPs" value={stats?.pendingRSVPs || 0} />
      </div>

      {/* QUICK ACTIONS */}
      <h3 style={{ marginBottom: "1rem", color: "white" }}>Quick Actions</h3>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <FHJButton onClick={() => navigate("/admin/trips")}>
            Add New Trip
        </FHJButton>
        
        <FHJButton onClick={() => navigate("/admin/clients")}>
            Add New Client
        </FHJButton>
        
        <FHJButton onClick={() => navigate("/admin/events")}>
            Create Event
        </FHJButton>
        
        <FHJButton variant="ghost">
            Upload Document
        </FHJButton>
      </div>
    </div>
  );
}

// Small internal helper to keep the grid clean
function DashboardCard({ label, value, highlight }) {
    return (
        <FHJCard style={highlight ? { border: `1px solid ${fhjTheme.colors.accent}` } : {}}>
            <h3 style={{ 
                fontSize: "2rem", 
                margin: "0 0 0.5rem 0", 
                color: highlight ? fhjTheme.colors.accent : "white" 
            }}>
                {value}
            </h3>
            <p style={{ margin: 0, opacity: 0.7 }}>{label}</p>
        </FHJCard>
    );
}