// src/components/NotificationsSidebar.jsx
import React, { useState, useEffect } from "react";
import {
  FHJCard,
  FHJButton,
  fhjTheme,
} from "./fhj/FHJUIKit.jsx";
import { LiveUpdates } from "../utils/LiveUpdates.js";
import { adminFetch } from "../utils/adminFetch.js";

export default function NotificationsSidebar() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/.netlify/functions/admin-alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Manual refresh failed", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = LiveUpdates.subscribe((event) => {
      if (event.type === "alerts") {
        setAlerts(event.alerts || []);
        setLastUpdated(new Date(event.ts));
      }
      if (event.type === "snapshot") {
        setLastUpdated(new Date(event.ts));
      }
    });

    return () => unsub();
  }, []);

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const severityColor = (severity) => {
    switch (severity) {
      case "urgent":
        return "rgba(255,0,0,0.9)";
      case "warning":
        return "rgba(255,165,0,0.9)";
      case "info":
      default:
        return "rgba(0,150,255,0.9)";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "240px",
        height: "100vh",
        padding: "1rem",
        background: "rgba(5,5,10,0.95)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
        overflowY: "auto",
        zIndex: 9000,
      }}
    >
      <FHJCard
        style={{
          padding: "1rem",
          background: "rgba(15,15,25,0.95)",
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1rem",
              color: fhjTheme.primary,
            }}
          >
            Notifications
          </h3>

          <span
            style={{
              minWidth: "24px",
              height: "24px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              color: "white",
            }}
          >
            {alerts.length}
          </span>
        </div>

        <FHJButton
          onClick={fetchAlerts}
          style={{
            width: "100%",
            marginBottom: "0.75rem",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            fontSize: "0.8rem",
            height: "32px",
          }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </FHJButton>

        {lastUpdated && (
          <p
            style={{
              margin: 0,
              marginBottom: "0.75rem",
              fontSize: "0.7rem",
              opacity: 0.6,
            }}
          >
            Updated at {formatTime(lastUpdated)}
          </p>
        )}

        {alerts.length === 0 && !loading && (
          <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>
            All clear. No alerts right now.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: "0.5rem 0.6rem",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.25rem",
                  gap: "0.4rem",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "999px",
                    background: severityColor(alert.severity),
                  }}
                />
                <span
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    opacity: 0.8,
                  }}
                >
                  {alert.type}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.7rem",
                    opacity: 0.6,
                  }}
                >
                  {formatTime(alert.createdAt)}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  lineHeight: 1.3,
                  opacity: 0.9,
                }}
              >
                {alert.message}
              </p>
            </div>
          ))}
        </div>
      </FHJCard>
    </div>
  );
}
