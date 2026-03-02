// ==========================================================
// 📄 FILE: TripsPerMonthChart.jsx  (REBUILT)
// ⭐ Self-contained: fetches own data, handles loading
// Location: src/components/admin/charts/TripsPerMonthChart.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { adminFetch } from "../../../utils/adminFetch.js";

export default function TripsPerMonthChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetch("/.netlify/functions/admin-dashboard-trips-monthly");
        const json = await res.json();
        setData(json.data || json || []);
      } catch (err) {
        console.error("Trips chart error:", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <p style={{ color: "white", opacity: 0.5, fontSize: "0.9rem" }}>Loading chart…</p>;
  }

  if (!data || data.length === 0) {
    return <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>No trip data yet.</p>;
  }

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="fhjGoldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ stroke: "rgba(212,175,55,0.2)" }}
          />
          <Area
            type="monotone"
            dataKey="trips"
            stroke="#D4AF37"
            strokeWidth={2.5}
            fill="url(#fhjGoldGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
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
