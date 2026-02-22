// src/components/AdminInsightsPanel.jsx
import React, { useState, useEffect } from "react";
import { FHJCard, fhjTheme } from "./FHJ/FHJUIKit.jsx";
import { LiveUpdates } from "../utils/LiveUpdates.js";

export default function AdminInsightsPanel({ admin }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    const res = await fetch("/.netlify/functions/admin-insights");
    const data = await res.json();
    setInsights(data);
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    loadInsights();
  }, []);

  // 🔥 REAL‑TIME UPDATES — LiveUpdates subscription
  useEffect(() => {
    const unsub = LiveUpdates.subscribe((event) => {
      // SSE snapshot → full data refresh
      if (event.type === "snapshot") {
        loadInsights();
      }

      // Polling fallback → alerts only
      if (event.type === "alerts") {
        // Optional: derive insights from alerts later
      }
    });

    return () => unsub();
  }, []);

  if (loading || !insights) {
    return (
      <FHJCard style={{ padding: "1.5rem", marginTop: "2rem" }}>
        <p>Loading insights...</p>
      </FHJCard>
    );
  }

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: "1.5rem" }}>
      <h4 style={{ color: fhjTheme.primary, marginBottom: "0.5rem" }}>
        {title}
      </h4>
      {children}
    </div>
  );

  return (
    <FHJCard style={{ padding: "1.5rem", marginTop: "2rem" }}>
      <h3>Daily Insights</h3>

      {/* UNPAID BALANCES */}
      <Section title="Clients With Outstanding Balances">
        {insights.unpaid.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No unpaid balances.</p>
        ) : (
          insights.unpaid.map((u, i) => (
            <p key={i}>
              <strong>{u.Client}</strong> — ${u.Balance}
            </p>
          ))
        )}
      </Section>

      {/* UPCOMING TRIPS */}
      <Section title="Trips Starting Soon">
        {insights.soonTrips.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No trips starting in the next 7 days.</p>
        ) : (
          insights.soonTrips.map((t, i) => (
            <p key={i}>
              <strong>{t.Client}</strong> — {t.Destination} ({t.Start})
            </p>
          ))
        )}
      </Section>

      {/* URGENT CONCIERGE */}
      <Section title="Concierge Messages Needing Attention">
        {insights.urgentConcierge.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No unresolved messages.</p>
        ) : (
          insights.urgentConcierge.map((c, i) => (
            <p key={i}>
              <strong>{c.Name}</strong>: {c.Message}
            </p>
          ))
        )}
      </Section>

      {/* TODAY'S ACTIVITY */}
      <Section title="Today's Admin Activity">
        {insights.todayActivity.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No activity logged today.</p>
        ) : (
          insights.todayActivity.map((a, i) => (
            <p key={i}>
              <strong>{a.Admin}</strong> — {a.Action} ({a.Module})
            </p>
          ))
        )}
      </Section>

      {/* TODAY'S PAYMENTS */}
      <Section title="Payments Received Today">
        {insights.todayPayments.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No payments received today.</p>
        ) : (
          insights.todayPayments.map((p, i) => (
            <p key={i}>
              <strong>{p.Client}</strong> — ${p.Amount}
            </p>
          ))
        )}
      </Section>
    </FHJCard>
  );
}