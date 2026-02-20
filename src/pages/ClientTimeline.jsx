// src/pages/ClientTimeline.jsx
import React, { useState, useEffect } from "react";
import {
  FHJCard,
  FHJButton,
  fhjTheme,
} from "../components/fhj/FHJUIKit.jsx";

export default function ClientTimeline({ admin, client }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const isAssistant = admin.Role === "Assistant";

  const loadTimeline = async () => {
    setLoading(true);

    const res = await fetch("/.netlify/functions/client-timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: client.id }),
    });

    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  const iconFor = (type) => {
    switch (type) {
      case "Trip":
        return "🌍";
      case "Booking":
        return "📘";
      case "Payment":
        return "💳";
      case "Document":
        return "📄";
      case "Concierge":
        return "💬";
      default:
        return "•";
    }
  };

  return (
    <FHJCard style={{ padding: "2rem" }}>
      <h2>Client Timeline</h2>
      <p style={{ opacity: 0.7 }}>{client.Name}</p>

      {loading ? (
        <p>Loading timeline...</p>
      ) : (
        <div style={{ marginTop: "2rem" }}>
          {events.length === 0 && (
            <p style={{ opacity: 0.7 }}>No timeline events found.</p>
          )}

          <ul style={{ paddingLeft: "1rem" }}>
            {events.map((e, i) => (
              <li
                key={i}
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "6px",
                  borderLeft: `4px solid ${fhjTheme.primary}`,
                }}
              >
                <div style={{ fontSize: "1.5rem" }}>{iconFor(e.type)}</div>
                <strong>{e.title}</strong>
                <p style={{ opacity: 0.7 }}>{e.date}</p>
                <p style={{ marginTop: "0.5rem" }}>{e.details}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </FHJCard>
  );
}
