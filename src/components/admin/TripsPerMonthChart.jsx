import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FHJCard, fhjTheme } from "../fhj/FHJUIKit.jsx";

export default function TripsPerMonthChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/.netlify/functions/admin-dashboard-trips-monthly");
      const json = await res.json();
      setData(json.data || []);
    };
    load();
  }, []);

  return (
    <FHJCard style={{ padding: "2rem", marginTop: "2rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>Trips Per Month</h2>

      {!data ? (
        <p>Loading chart…</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="trips"
              stroke={fhjTheme.primary}
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </FHJCard>
  );
}
