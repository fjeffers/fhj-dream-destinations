// src/pages/ConciergeInboxPage.jsx
import React from "react";
import useConciergeMessages from "../hooks/useConciergeMessages.js";
import { FHJCard } from "../components/fhj/FHJUIKit.jsx";

export default function ConciergeInboxPage() {
  const { messages, loading } = useConciergeMessages();

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ color: "#D4AF37", marginBottom: "1rem" }}>
        Concierge Inbox
      </h1>

      <FHJCard style={{ padding: "1.5rem" }}>
        {loading ? (
          <p>Loading messages…</p>
        ) : messages.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: "1rem",
                  borderRadius: "12px",
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                <strong>{m.name || m.email}</strong>
                <p style={{ opacity: 0.8, margin: "0.25rem 0" }}>
                  {m.message?.slice(0, 80)}…
                </p>
                <span
                  style={{
                    fontSize: "0.8rem",
                    opacity: 0.6,
                  }}
                >
                  {m.status} — {m.created}
                </span>
              </div>
            ))}
          </div>
        )}
      </FHJCard>
    </div>
  );
}
