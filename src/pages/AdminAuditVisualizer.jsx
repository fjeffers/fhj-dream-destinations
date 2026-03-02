import React, { useState, useEffect } from "react";
import {
  FHJCard,
  FHJButton,
  fhjTheme,
} from "../components/FHJ/FHJUIKit.jsx";
import { adminFetch } from "../utils/adminFetch.js";

export default function AdminAuditVisualizer({ admin }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const isAssistant = admin?.role === "Assistant";

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/.netlify/functions/admin-audit");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Failed to visualizer data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Filter Logic (using 'entityType' to match previous files)
  const filteredLogs =
    filter === "All" ? logs : logs.filter((l) => l.entityType === filter.toLowerCase());

  // Count actions per admin (using 'actor' to match previous files)
  const adminCounts = logs.reduce((acc, log) => {
    const name = log.actor || "Unknown";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  // Calculate Max for Bar Chart scaling
  const maxCount = Math.max(...Object.values(adminCounts), 1);

  return (
    <FHJCard style={{ padding: "2rem", minHeight: "80vh" }}>
      <h2 style={{ color: fhjTheme.colors.accent, marginTop: 0 }}>
        Audit Visualizer
      </h2>

      {isAssistant && (
        <div style={{ 
            padding: "0.5rem 1rem", 
            background: "rgba(255, 200, 0, 0.15)", 
            color: "#fbbf24", 
            borderRadius: "8px",
            marginBottom: "1rem",
            display: "inline-block"
        }}>
          Note: You have <strong>view‑only</strong> access.
        </div>
      )}

      {/* FILTERS */}
      <div style={{ marginBottom: "2rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {["All", "Trip", "Client", "Concierge", "Event"].map(
          (m) => (
            <FHJButton
              key={m}
              onClick={() => setFilter(m)}
              size="sm"
              style={{
                background:
                  filter === m ? fhjTheme.colors.accent : "rgba(255,255,255,0.08)",
                color: filter === m ? "#000" : "white", // Better contrast
                border: filter === m ? "none" : `1px solid ${fhjTheme.colors.glassBorder}`
              }}
            >
              {m}
            </FHJButton>
          )
        )}
      </div>

      {loading ? (
        <p>Loading visualization...</p>
      ) : (
        <>
          {/* BAR CHART */}
          <h3 style={{ marginTop: "1rem", color: "white" }}>Actions per Admin</h3>
          
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              marginTop: "2rem",
              alignItems: "flex-end",
              height: "220px",
              paddingBottom: "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            {Object.entries(adminCounts).length === 0 && <p style={{opacity:0.5}}>No data to chart.</p>}
            
            {Object.entries(adminCounts).map(([name, count]) => (
              <div key={name} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <div
                  style={{
                    height: `${(count / maxCount) * 100}%`, // RELATIVE HEIGHT
                    minHeight: "4px",
                    width: "40px",
                    background: `linear-gradient(to top, ${fhjTheme.colors.accent}, ${fhjTheme.colors.accent}88)`,
                    borderRadius: "6px 6px 0 0",
                    transition: "height 0.5s ease",
                    position: "relative"
                  }}
                >
                    {/* Tooltip-ish number */}
                    <span style={{ 
                        position: "absolute", 
                        top: "-25px", 
                        left: "50%", 
                        transform: "translateX(-50%)",
                        fontSize: "0.8rem",
                        fontWeight: "bold"
                    }}>
                        {count}
                    </span>
                </div>
                <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", opacity: 0.9 }}>{name}</p>
              </div>
            ))}
          </div>

          {/* TIMELINE */}
          <h3 style={{ marginTop: "3rem", color: "white" }}>Detailed Timeline</h3>
          <ul style={{ marginTop: "1rem", paddingLeft: 0, listStyle: "none" }}>
            {filteredLogs.map((log, i) => (
              <li
                key={log.id || i}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${fhjTheme.colors.glassBorder}`,
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                    <div>
                        <strong style={{ color: fhjTheme.colors.accent }}>{log.actor}</strong> 
                        <span style={{ margin: "0 0.5rem", opacity: 0.6 }}>—</span>
                        <span>{log.action}</span>
                    </div>
                    {log.details && (
                        <p style={{ marginTop: "0.4rem", fontSize: "0.9rem", opacity: 0.7, margin: 0 }}>
                            {log.details}
                        </p>
                    )}
                </div>
                
                <div style={{ textAlign: "right", fontSize: "0.85rem", opacity: 0.5 }}>
                   <div>{log.entityType}</div>
                   <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </FHJCard>
  );
}
