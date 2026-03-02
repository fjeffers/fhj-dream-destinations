import React, { useEffect, useState } from "react";
import { FHJCard, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { adminFetch } from "../utils/adminFetch.js";
export default function AdminActivity() {
  const [feed, setFeed] = useState([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetch("/.netlify/functions/admin-activity");
        if (!res.ok) throw new Error("Failed to fetch activity");
        const data = await res.json();
        // Ensure we always have an array
        setFeed(Array.isArray(data.feed) ? data.feed : []);
        setError(false);
      } catch (err) {
        console.error("Activity Feed Error:", err);
        setError(true);
      }
    };
    load();
    // Refresh every 20 seconds
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);
  if (error) {
     return (
        <FHJCard style={{ padding: "2rem", opacity: 0.7 }}>
            <p>Activity feed unavailable.</p>
        </FHJCard>
     );
  }
  return (
    <FHJCard style={{ padding: "2rem" }}>
      <h2 style={{ 
          color: fhjTheme.colors.accent, // FIXED: Correct theme path
          marginTop: 0,
          marginBottom: "1.5rem"
      }}>
        Activity Feed
      </h2>
      {feed.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No recent activity.</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
          {feed.map((item, i) => (
            // Ideally use item.id instead of 'i' if your DB provides one
            <li key={item.id || i} style={{ marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                  <strong style={{ color: fhjTheme.colors.textPrimary }}>
                    {item.type}
                  </strong>
                  <span style={{ fontSize: "0.85rem", opacity: 0.5 }}>
                    {item.timestamp}
                  </span>
              </div>
              <p style={{ margin: 0, opacity: 0.8, fontSize: "0.95rem" }}>
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </FHJCard>
  );
}
