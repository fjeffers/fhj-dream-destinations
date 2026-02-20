// src/components/RealtimeToasts.jsx
import React, { useEffect, useState, useRef } from "react";
import { LiveUpdates } from "../utils/LiveUpdates.js";
import { FHJCard } from "./fhj/FHJUIKit.jsx";

let audioInstance = null;

const playPing = () => {
  try {
    if (!audioInstance) {
      // Put a small sound file at: public/sounds/notify.mp3
      audioInstance = new Audio("/sounds/notify.mp3");
    }
    audioInstance.currentTime = 0;
    audioInstance.play();
  } catch (e) {
    console.warn("Audio play failed", e);
  }
};

export default function RealtimeToasts() {
  const [toasts, setToasts] = useState([]);
  const lastCounts = useRef({
    concierge: 0,
    alerts: 0,
  });

  useEffect(() => {
    const unsub = LiveUpdates.subscribe((event) => {
      // From SSE snapshot: concierge unread
      if (event.type === "snapshot" && event.concierge) {
        const unread = event.concierge.filter((c) => !c.Resolved).length;

        if (unread > lastCounts.current.concierge) {
          const diff = unread - lastCounts.current.concierge;
          addToast(
            `${diff} new concierge message${diff > 1 ? "s" : ""}`
          );
          playPing();
        }

        lastCounts.current.concierge = unread;
      }

      // From polling fallback: alerts
      if (event.type === "alerts") {
        const count = event.alerts?.length || 0;

        if (count > lastCounts.current.alerts) {
          const diff = count - lastCounts.current.alerts;
          addToast(`${diff} new alert${diff > 1 ? "s" : ""}`);
          playPing();
        }

        lastCounts.current.alerts = count;
      }
    });

    return () => unsub();
  }, []);

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "320px",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        zIndex: 9999,
      }}
    >
      {toasts.map((t) => (
        <FHJCard
          key={t.id}
          style={{
            padding: "0.75rem 1rem",
            background: "rgba(10,10,20,0.95)",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
            fontSize: "0.85rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {t.message}
        </FHJCard>
      ))}
    </div>
  );
}
