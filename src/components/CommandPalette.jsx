import React, { useEffect, useState } from "react";
import { FHJCard, FHJInput, fhjTheme } from "./fhj/FHJUIKit.jsx";

export default function CommandPalette({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const load = async () => {
      const res = await fetch(
        "/.netlify/functions/admin-search?q=" + encodeURIComponent(query)
      );
      const data = await res.json();
      setResults(data.results || []);
    };

    load();
  }, [query]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        paddingTop: "10vh",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <FHJCard
        style={{
          width: "600px",
          padding: "1.5rem",
          background: "rgba(20,20,20,0.9)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <FHJInput
          label="Search or jump to…"
          value={query}
          autoFocus
          onChange={(e) => setQuery(e.target.value)}
        />

        <div style={{ marginTop: "1rem", maxHeight: "300px", overflowY: "auto" }}>
          {!query && (
            <>
              <p style={{ opacity: 0.6, marginBottom: "0.5rem" }}>Navigation</p>
              {[
                "home",
                "activity",
                "analytics",
                "deals",
                "events",
                "clients",
                "bookings",
                "documents",
                "trips",
                "concierge",
                "settings",
                "audit",
              ].map((section) => (
                <div
                  key={section}
                  onClick={() => onNavigate(section)}
                  style={{
                    padding: "0.5rem",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </div>
              ))}
            </>
          )}

          {query &&
            results.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: "0.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <strong style={{ color: fhjTheme.primary }}>{r.type}</strong>
                <p>{r.title}</p>
                <p style={{ opacity: 0.7 }}>{r.subtitle}</p>
              </div>
            ))}

          {query && results.length === 0 && (
            <p style={{ opacity: 0.6 }}>No results found.</p>
          )}
        </div>
      </FHJCard>
    </div>
  );
}
