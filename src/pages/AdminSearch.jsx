import React, { useState } from "react";
import { FHJCard, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { adminFetch } from "../utils/adminFetch.js";
export default function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const search = async (value) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    const res = await fetch(
      "/.netlify/functions/admin-search?q=" + encodeURIComponent(value)
    );
    const data = await res.json();
    setResults(data.results || []);
  };
  return (
    <div>
      <h2 style={{ color: fhjTheme.primary, marginBottom: "1rem" }}>
        Global Search
      </h2>
      <FHJInput
        label="Search across FHJ..."
        value={query}
        onChange={(e) => search(e.target.value)}
      />
      <div style={{ marginTop: "2rem" }}>
        {results.map((r, i) => (
          <FHJCard key={i} style={{ marginBottom: "1rem", padding: "1rem" }}>
            <strong style={{ color: fhjTheme.primary }}>{r.type}</strong>
            <p>{r.title}</p>
            <p style={{ opacity: 0.7 }}>{r.subtitle}</p>
          </FHJCard>
        ))}
        {query && results.length === 0 && (
          <p style={{ opacity: 0.6 }}>No results found.</p>
        )}
      </div>
    </div>
  );
}
