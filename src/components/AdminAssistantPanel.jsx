// src/components/AdminAssistantPanel.jsx
import React, { useState } from "react";
import {
  FHJCard,
  FHJButton,
  FHJInput,
  fhjTheme,
} from "./FHJ/FHJUIKit.jsx";

export default function AdminAssistantPanel({ admin }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!query.trim()) return;

    setLoading(true);

    const res = await fetch("/.netlify/functions/admin-nlp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    setResponse(data);
    setLoading(false);
  };

  return (
    <FHJCard style={{ padding: "1.5rem", height: "100%" }}>
      <h3>FHJ Assistant</h3>

      <FHJInput
        label="Ask a question"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <FHJButton
        onClick={ask}
        style={{ marginTop: "1rem", background: fhjTheme.primary }}
      >
        Ask
      </FHJButton>

      {loading && <p style={{ marginTop: "1rem" }}>Thinking...</p>}

      {response && (
        <div style={{ marginTop: "1.5rem" }}>
          <h4>{response.label}</h4>

          {response.type === "text" && (
            <p style={{ opacity: 0.7 }}>{response.answer || response.label}</p>
          )}

          {response.type === "list" && (
            <ul style={{ paddingLeft: "1rem" }}>
              {response.result.map((item, i) => (
                <li key={i} style={{ marginBottom: "0.5rem" }}>
                  {Object.entries(item).map(([k, v]) => (
                    <p key={k}>
                      <strong>{k}:</strong> {v}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          )}

          {response.type === "timeline" && (
            <ul style={{ paddingLeft: "1rem" }}>
              {response.result.map((item, i) => (
                <li key={i} style={{ marginBottom: "1rem" }}>
                  <strong>{item.Admin}</strong> — {item.Action}
                  <p style={{ opacity: 0.7 }}>{item.Timestamp}</p>
                  <p>{item.Module}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </FHJCard>
  );
}