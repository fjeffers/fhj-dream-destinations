// ==========================================================
// 📄 FILE: EventAttendanceChart.jsx  (REBUILT)
// ⭐ Self-contained + safe data handling (no .reduce crash)
// Location: src/components/admin/charts/EventAttendanceChart.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from "recharts";
import { adminFetch } from "../../../utils/adminFetch.js";

const COLORS = {
  yes: "#D4AF37",
  no: "rgba(255,255,255,0.3)",
  maybe: "rgba(255,255,255,0.6)",
};

export default function EventAttendanceChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetch("/.netlify/functions/admin-dashboard-event-attendance");
        const json = await res.json();
        setData(json.data || json || []);
      } catch (err) {
        console.error("Event attendance chart error:", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <p style={{ color: "white", opacity: 0.5, fontSize: "0.9rem" }}>Loading chart…</p>;
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>No event attendance data yet.</p>;
  }

  // ⭐ Safe reduce with fallback to 0
  const totals = [
    { name: "Yes", value: data.reduce((a, b) => a + (b.yes || 0), 0), color: COLORS.yes },
    { name: "No", value: data.reduce((a, b) => a + (b.no || 0), 0), color: COLORS.no },
    { name: "Maybe", value: data.reduce((a, b) => a + (b.maybe || 0), 0), color: COLORS.maybe },
  ];

  const hasDonutData = totals.some((t) => t.value > 0);

  return (
    <div style={{ display: "flex", gap: "1rem", height: 280 }}>
      {/* Donut Chart */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {hasDonutData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={totals}
                dataKey="value"
                nameKey="name"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={3}
              >
                {totals.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.3)" }}>
            No RSVP data
          </div>
        )}
      </div>

      {/* Bar Chart */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="title"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="total" fill="#D4AF37" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "rgba(0,0,0,0.85)",
  border: "1px solid rgba(212,175,55,0.3)",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "0.85rem",
};
