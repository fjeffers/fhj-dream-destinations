// ==========================================================
// 📄 FILE: ConciergeActivityChart.jsx  (REBUILT)
// ⭐ Self-contained + uses ComposedChart (BarChart can't render Line)
// Location: src/components/admin/charts/ConciergeActivityChart.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { adminFetch } from "../../../utils/adminFetch.js";

export default function ConciergeActivityChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetch("/.netlify/functions/admin-dashboard-concierge-activity");
        const json = await res.json();
        setData(json.data || json || []);
      } catch (err) {
        console.error("Concierge chart error:", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <p style={{ color: "white", opacity: 0.5, fontSize: "0.9rem" }}>Loading chart…</p>;
  }

  if (!data || data.length === 0) {
    return <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>No concierge data yet.</p>;
  }

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="rgba(212,175,55,0.5)"
            tick={{ fill: "rgba(212,175,55,0.8)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Legend
            wrapperStyle={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}
          />
          <Bar
            yAxisId="left"
            dataKey="newCount"
            stackId="messages"
            fill="rgba(212,175,55,0.6)"
            name="New"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            yAxisId="left"
            dataKey="resolvedCount"
            stackId="messages"
            fill="rgba(255,255,255,0.25)"
            name="Resolved"
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgResponseHours"
            stroke="#D4AF37"
            strokeWidth={2}
            dot={false}
            name="Avg Response (hrs)"
          />
        </ComposedChart>
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
