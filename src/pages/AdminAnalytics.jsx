import React, { useEffect, useState } from "react";
import { FHJCard, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { adminFetch } from "../utils/adminFetch.js";
export default function AdminAnalytics({ admin }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetch("/.netlify/functions/admin-analytics");
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };
    load();
  }, []);
  if (error) return <div style={{ color: "white", padding: "2rem" }}>Analytics currently unavailable.</div>;
  if (!data) return <div style={{ color: "white", padding: "2rem" }}>Loading analytics...</div>;
  // Helper to render a simple bar chart
  const renderChart = (title, dataset) => {
    if (!dataset) return null;
    
    const entries = Object.entries(dataset);
    // Find the max value to scale the bars relative to 100% width
    const maxValue = Math.max(...Object.values(dataset), 1); 
    return (
      <FHJCard style={{ padding: "1.5rem" }}>
        <h3 style={{ 
            color: fhjTheme.colors.accent, // FIXED: Correct theme path
            marginTop: 0, 
            marginBottom: "1rem" 
        }}>
            {title}
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {entries.map(([label, count]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", fontSize: "0.9rem" }}>
              <span style={{ width: "60px", opacity: 0.7 }}>{label}</span>
              
              {/* The Bar Container */}
              <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: "4px", height: "8px", margin: "0 10px" }}>
                {/* The Filled Bar */}
                <div style={{ 
                    width: `${(count / maxValue) * 100}%`, 
                    background: fhjTheme.colors.accent, 
                    height: "100%", 
                    borderRadius: "4px",
                    transition: "width 0.5s ease"
                }} />
              </div>
              
              <span style={{ width: "30px", textAlign: "right", fontWeight: "bold" }}>{count}</span>
            </div>
          ))}
        </div>
      </FHJCard>
    );
  };
  return (
    <div>
      <h2 style={{ color: fhjTheme.colors.accent, marginBottom: "1.5rem" }}>
        FHJ Analytics Dashboard
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {renderChart("Bookings Trend", data.bookingsByMonth)}
        {renderChart("Trips Completed", data.tripsByMonth)}
        {renderChart("New Clients", data.clientsByMonth)}
        {renderChart("Concierge Requests", data.messagesByMonth)}
      </div>
    </div>
  );
}
