// src/components/ConciergeThread.jsx
import React, { useEffect, useState } from "react";
import { FHJButton } from "./FHJ/FHJUIKit.jsx"; // adjust path if needed

export default function ConciergeThread({ conciergeId, refreshParent }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [composer, setComposer] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/admin-concierge-messages?concierge_id=${encodeURIComponent(conciergeId)}`);
      const json = await res.json();
      setMessages(json.messages || []);
    } catch (err) { console.error("load messages", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (conciergeId) loadMessages(); }, [conciergeId]);

  const postMessage = async (sender = "admin", body = composer, metadata = {}) => {
    if (!body || !conciergeId) return;
    try {
      const res = await fetch(`/.netlify/functions/admin-concierge-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concierge_id: conciergeId, sender, body, metadata })
      });
      const json = await res.json();
      if (json.message) {
        setMessages(prev => [...prev, json.message]);
        setComposer("");
        if (refreshParent) refreshParent();
      }
    } catch (err) { console.error("post message", err); }
  };

  const getSuggestions = async () => {
    const lastClient = [...messages].reverse().find(m => m.sender === "client");
    const text = lastClient ? lastClient.body : (messages.length ? messages[messages.length-1].body : "");
    if (!text) return;
    setSuggestLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/ai-suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const json = await res.json();
      setSuggestions(json.suggestions || []);
    } catch (err) { console.error("suggest error", err); setSuggestions([]); }
    finally { setSuggestLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ maxHeight: 340, overflow: "auto", padding: 12, borderRadius: 8, background: "rgba(0,0,0,0.06)" }}>
        {loading && <div>Loading…</div>}
        {!loading && messages.length === 0 && <div style={{ color: "#888" }}>No messages yet.</div>}
        {messages.map(m => (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: m.sender === "client" ? "#60a5fa" : "#7ee787", fontWeight: 700 }}>
              {m.sender} • {new Date(m.created_at).toLocaleString()}
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: 10, borderRadius: 8, marginTop: 4 }}>{m.body}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <textarea value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="Type a question or reply..." style={{ flex: 1, minHeight: 80, padding: 8 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FHJButton onClick={() => postMessage("admin", composer)}>Send</FHJButton>
          <FHJButton onClick={getSuggestions} disabled={suggestLoading}>{suggestLoading ? "…" : "Suggest"}</FHJButton>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div>
          <div style={{ marginBottom: 6, fontSize: 13, color: "#cfcfcf" }}>Suggestions</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {suggestions.map((s, idx) => (
              <button key={idx} onClick={() => setComposer(prev => (prev ? prev + "\n" : "") + s)} style={{ padding: "6px 10px", borderRadius: 8 }}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
