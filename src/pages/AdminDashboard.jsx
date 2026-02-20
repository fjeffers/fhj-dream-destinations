// ==========================================================
// 📄 FILE: AdminDashboard.jsx  (FIXED)
// ⭐ Charts no longer double-wrapped — ChartWrapper provides
//    the card, chart components are standalone
// Location: src/pages/AdminDashboard.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FHJCard, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJSkeleton from "../components/FHJ/FHJSkeleton.jsx";

// ⭐ Charts are now self-contained (fetch their own data)
import ClientGrowthChart from "../components/admin/charts/ClientGrowthChart.jsx";
import TripsPerMonthChart from "../components/admin/charts/TripsPerMonthChart.jsx";
import ConciergeActivityChart from "../components/admin/charts/ConciergeActivityChart.jsx";
import EventAttendanceChart from "../components/admin/charts/EventAttendanceChart.jsx";

export default function AdminDashboard({ admin }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, insightsRes] = await Promise.allSettled([
          fetch("/.netlify/functions/admin-dashboard-stats"),
          fetch("/.netlify/functions/admin-dashboard-insights"),
        ]);

        if (statsRes.status === "fulfilled" && statsRes.value.ok) {
          setStats(await statsRes.value.json());
        }
        if (insightsRes.status === "fulfilled" && insightsRes.value.ok) {
          const iData = await insightsRes.value.json();
          setInsights(iData?.insights || null);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const greeting = getGreeting(admin?.Name || admin?.Email);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ color: "white", fontSize: "2rem", margin: 0 }}>{greeting}</h1>
        <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>
          Here's what's happening with FHJ Dream Destinations.
        </p>
      </motion.div>

      {/* STAT CARDS */}
      {loading ? (
        <FHJSkeleton variant="stat" count={4} />
      ) : (
        <div style={statGridStyle}>
          <StatCard
            label="Total Clients"
            value={stats?.clients || 0}
            icon="👥"
            color="#60a5fa"
            onClick={() => navigate("/admin/clients")}
          />
          <StatCard
            label="Active Trips"
            value={stats?.upcomingTrips || 0}
            icon="✈️"
            color="#4ade80"
            onClick={() => navigate("/admin/trips")}
          />
          <StatCard
            label="Unread Messages"
            value={stats?.unreadMessages || 0}
            icon="💬"
            color={stats?.unreadMessages > 0 ? "#f87171" : "#94a3b8"}
            onClick={() => navigate("/admin/concierge")}
            urgent={stats?.unreadMessages > 0}
          />
          <StatCard
            label="Events This Month"
            value={stats?.eventsThisMonth || 0}
            icon="🎉"
            color="#fbbf24"
            onClick={() => navigate("/admin/events")}
          />
        </div>
      )}

      {/* INSIGHTS BANNER */}
      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FHJCard style={{ padding: "1.25rem 1.5rem", background: "rgba(0,196,140,0.06)", border: "1px solid rgba(0,196,140,0.2)" }}>
            <p style={{ color: "#e5e7eb", margin: 0, lineHeight: 1.6, fontSize: "0.95rem" }}>
              {insights.summary}
            </p>
          </FHJCard>
        </motion.div>
      )}

      {/* QUICK ACTIONS */}
      <div style={quickActionsStyle}>
        <QuickAction label="New Booking" icon="📋" onClick={() => navigate("/admin/bookings")} />
        <QuickAction label="Add Client" icon="👤" onClick={() => navigate("/admin/clients")} />
        <QuickAction label="Manage Deals" icon="🏷️" onClick={() => navigate("/admin/deals")} />
        <QuickAction label="Concierge Inbox" icon="💬" onClick={() => navigate("/admin/concierge")} />
      </div>

      {/* ⭐ CHARTS GRID — single card wrapper, charts are self-contained */}
      <div style={chartGridStyle}>
        <ChartWrapper title="Client Growth" delay={0.1}>
          <ClientGrowthChart />
        </ChartWrapper>
        <ChartWrapper title="Trips per Month" delay={0.2}>
          <TripsPerMonthChart />
        </ChartWrapper>
        <ChartWrapper title="Concierge Activity" delay={0.3}>
          <ConciergeActivityChart />
        </ChartWrapper>
        <ChartWrapper title="Event Attendance" delay={0.4}>
          <EventAttendanceChart />
        </ChartWrapper>
      </div>

      {/* UPCOMING TRIPS & EVENTS */}
      {insights && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <FHJCard style={{ padding: "1.5rem" }}>
            <h3 style={sectionTitle}>Upcoming Trips (7 days)</h3>
            {insights.upcomingTrips?.length === 0 ? (
              <p style={emptyText}>No trips this week.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(insights.upcomingTrips || []).map((t, i) => (
                  <div key={i} style={listItem}>
                    <span style={{ color: "white", fontWeight: 600 }}>{t.destination}</span>
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                      {t.client} · {t.startDate}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </FHJCard>

          <FHJCard style={{ padding: "1.5rem" }}>
            <h3 style={sectionTitle}>Upcoming Events (14 days)</h3>
            {insights.upcomingEvents?.length === 0 ? (
              <p style={emptyText}>No upcoming events.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(insights.upcomingEvents || []).map((e, i) => (
                  <div key={i} style={listItem}>
                    <span style={{ color: "white", fontWeight: 600 }}>{e.title}</span>
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{e.date}</span>
                  </div>
                ))}
              </div>
            )}
          </FHJCard>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------
// Sub-components
// -------------------------------------------------------
function StatCard({ label, value, icon, color, onClick, urgent = false }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        ...statCardStyle,
        cursor: onClick ? "pointer" : "default",
        borderColor: urgent ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0 0 0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {label}
          </p>
          <p style={{ color: "white", fontSize: "2.2rem", fontWeight: 800, margin: 0 }}>
            {value}
          </p>
        </div>
        <span style={{ fontSize: "1.8rem", opacity: 0.6 }}>{icon}</span>
      </div>
      {urgent && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#f87171", fontWeight: 600 }}>
          Needs attention
        </div>
      )}
    </motion.div>
  );
}

function QuickAction({ label, icon, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={quickActionBtn}
    >
      <span style={{ fontSize: "1.3rem" }}>{icon}</span>
      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</span>
    </motion.button>
  );
}

// ⭐ ChartWrapper — single card container (charts no longer have their own card)
function ChartWrapper({ title, delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <FHJCard style={{ padding: "1.25rem", minHeight: "340px" }}>
        <h3 style={{ color: "#D4AF37", fontSize: "1rem", margin: "0 0 1rem", fontWeight: 600 }}>
          {title}
        </h3>
        {children}
      </FHJCard>
    </motion.div>
  );
}

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function getGreeting(name) {
  const hour = new Date().getHours();
  const prefix = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${prefix}, ${name.split(" ")[0]}` : `${prefix}`;
}

// -------------------------------------------------------
// Styles
// -------------------------------------------------------
const statGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem",
};

const statCardStyle = {
  background: "rgba(255,255,255,0.04)",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.06)",
  padding: "1.25rem",
  transition: "all 0.2s ease",
};

const quickActionsStyle = {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap",
};

const quickActionBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.6rem 1.25rem",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "999px",
  color: "white",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const chartGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
  gap: "1.5rem",
};

const sectionTitle = {
  color: "#D4AF37",
  fontSize: "1rem",
  fontWeight: 600,
  margin: "0 0 1rem",
};

const listItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.6rem 0.75rem",
  background: "rgba(255,255,255,0.03)",
  borderRadius: "8px",
};

const emptyText = {
  color: "#94a3b8",
  opacity: 0.6,
  margin: 0,
  fontSize: "0.9rem",
};
