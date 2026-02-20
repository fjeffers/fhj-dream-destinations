// src/components/admin/InsightsPanel.jsx
import React from "react";
import FHJChartCard from "../fhj/FHJChartCard.jsx";

export default function InsightsPanel({ insights, loading }) {
  return (
    <FHJChartCard title="Insights">
      {loading ? (
        <p style={{ color: "white", opacity: 0.6 }}>Loading insights…</p>
      ) : (
        <div style={{ color: "white" }}>
          <p style={{ opacity: 0.8, marginBottom: "1rem" }}>
            {insights.summary}
          </p>

          <h3 style={{ color: "#D4AF37", marginTop: "1rem" }}>
            Upcoming Trips (7 days)
          </h3>
          {insights.upcomingTrips.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No upcoming trips.</p>
          ) : (
            insights.upcomingTrips.map((t, i) => (
              <p key={i}>
                {t.destination} — {t.client} ({t.startDate})
              </p>
            ))
          )}

          <h3 style={{ color: "#D4AF37", marginTop: "1.5rem" }}>
            Upcoming Events (14 days)
          </h3>
          {insights.upcomingEvents.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No upcoming events.</p>
          ) : (
            insights.upcomingEvents.map((e, i) => (
              <p key={i}>
                {e.title} — {e.date}
              </p>
            ))
          )}

          <h3 style={{ color: "#D4AF37", marginTop: "1.5rem" }}>
            Concierge Alerts
          </h3>
          <p>Unread: {insights.unreadConcierge}</p>
          <p>In Progress: {insights.inProgressConcierge}</p>

          <h3 style={{ color: "#D4AF37", marginTop: "1.5rem" }}>
            Pending RSVPs
          </h3>
          <p>{insights.pendingRSVPs}</p>

          <h3 style={{ color: "#D4AF37", marginTop: "1.5rem" }}>
            New Clients (7 days)
          </h3>
          <p>{insights.newClients}</p>
        </div>
      )}
    </FHJChartCard>
  );
}
