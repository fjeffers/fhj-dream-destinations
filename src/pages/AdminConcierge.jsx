// ==========================================================
// 📄 FILE: AdminConcierge.jsx  (PHASE 4 — BUILD OUT)
// Concierge inbox with message threads, replies, filters
// Location: src/pages/AdminConcierge.jsx
// ==========================================================

import ConciergeThread from "../components/ConciergeThread.jsx";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJSkeleton from "../components/FHJ/FHJSkeleton.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";

export default function AdminConcierge({ admin }) {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unresolved | resolved
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/.netlify/functions/admin-concierge-get");
      const data = await res.json();
      setMessages(data.data || []);
    } catch (err) {
      toast.error("Failed to load concierge messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, []);

  // Filter messages
  const filtered = messages.filter((m) => {
    if (filter === "unresolved") return m.status !== "Resolved";
    if (filter === "resolved") return m.status === "Resolved";
    return true;
  });

  const unresolvedCount = messages.filter((m) => m.status !== "Resolved").length;

  // Update status (Resolved, Archived, New)
  const updateStatus = async (msg, newStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch("/.netlify/functions/admin-concierge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`Status updated to ${newStatus}.`);
      loadMessages();
      if (selected?.id === msg.id) {
        setSelected({ ...selected, status: newStatus });
      }
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete message
  const handleDelete = async (msg) => {
    if (!window.confirm(`Delete this message from ${msg.name || "Unknown"}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/admin-concierge?id=${encodeURIComponent(msg.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Message deleted.");
      setSelected(null);
      loadMessages();
    } catch (err) {
      toast.error("Failed to delete message.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "1.5rem", minHeight: "80vh" }}>

      {/* LEFT: Message List */}
      <FHJCard style={{ flex: "0 0 380px", padding: "1.5rem", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ color: fhjTheme.colors.accent, margin: 0, fontSize: "1.2rem" }}>
            Concierge Inbox
          </h2>
          {unresolvedCount > 0 && (
            <span style={badgeStyle}>{unresolvedCount}</span>
          )}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          {["all", "unresolved", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...filterBtn,
                background: filter === f ? "rgba(0,196,140,0.15)" : "transparent",
                color: filter === f ? fhjTheme.primary : "#94a3b8",
                borderColor: filter === f ? "rgba(0,196,140,0.3)" : "rgba(255,255,255,0.1)",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Message List */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {loading ? (
            <FHJSkeleton variant="text" lines={8} />
          ) : filtered.length === 0 ? (
            <p style={{ color: "#94a3b8", opacity: 0.6, textAlign: "center", marginTop: "2rem" }}>
              No messages found.
            </p>
          ) : (
            filtered.map((msg) => (
              <motion.div
                key={msg.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelected(msg)}
                style={{
                  ...messageItemStyle,
                  borderColor: selected?.id === msg.id ? fhjTheme.primary : "rgba(255,255,255,0.06)",
                  background: selected?.id === msg.id ? "rgba(0,196,140,0.06)" : "rgba(255,255,255,0.03)",
                }}
              >
                {/* Status indicator */}
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: msg.status === "Resolved" ? "#94a3b8" : msg.status === "In Progress" ? "#fbbf24" : "#f87171",
                  flexShrink: 0,
                  marginTop: "6px",
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                    <span style={{ color: "white", fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {msg.name || "Unknown"}
                    </span>
                    <span style={{ color: "#64748b", fontSize: "0.75rem", flexShrink: 0 }}>
                      {formatDate(msg.created)}
                    </span>
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0.25rem 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {msg.message}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </FHJCard>

      {/* RIGHT: Message Detail */}
      <FHJCard style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column" }}>
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
                Select a message to view details.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                  <h3 style={{ color: "white", margin: "0 0 0.25rem", fontSize: "1.3rem" }}>
                    {selected.name || "Unknown"}
                  </h3>
                  <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.9rem" }}>
                    {selected.email} · {selected.source || "Portal"} · {formatDate(selected.created)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {selected.status !== "Resolved" && (
                    <FHJButton
                      variant="success"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => updateStatus(selected, "Resolved")}
                    >
                      Resolve
                    </FHJButton>
                  )}
                  {selected.status === "Resolved" && (
                    <FHJButton
                      variant="ghost"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => updateStatus(selected, "New")}
                    >
                      Reopen
                    </FHJButton>
                  )}
                  {selected.status !== "Archived" && (
                    <FHJButton
                      variant="ghost"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => updateStatus(selected, "Archived")}
                    >
                      Archive
                    </FHJButton>
                  )}
                  <FHJButton
                    variant="danger"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleDelete(selected)}
                  >
                    Delete
                  </FHJButton>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ marginBottom: "1rem" }}>
                <span style={{
                  padding: "0.3rem 0.85rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: selected.status === "Resolved" ? "rgba(148,163,184,0.15)" :
                              selected.status === "Archived" ? "rgba(99,102,241,0.15)" :
                              selected.status === "In Progress" ? "rgba(251,191,36,0.15)" :
                              "rgba(248,113,113,0.15)",
                  color: selected.status === "Resolved" ? "#94a3b8" :
                         selected.status === "Archived" ? "#818cf8" :
                         selected.status === "In Progress" ? "#fbbf24" :
                         "#f87171",
                }}>
                  {selected.status || "New"}
                </span>
              </div>

              {/* Message Content */}
              <div style={messageContentStyle}>
                <p style={{ color: "#e5e7eb", lineHeight: 1.7, margin: 0 }}>
                  {selected.message}
                </p>
                {selected.context && (
                  <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "1rem" }}>
                    Context: {selected.context}
                  </p>
                )}
              </div>

              {/* Conversation Thread */}
              <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <ConciergeThread conciergeId={selected.id} refreshParent={loadMessages} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </FHJCard>
    </div>
  );
}

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 48) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

// -------------------------------------------------------
// Styles
// -------------------------------------------------------
const badgeStyle = {
  background: "#f87171",
  color: "white",
  fontSize: "0.75rem",
  fontWeight: 700,
  padding: "0.2rem 0.6rem",
  borderRadius: "20px",
  minWidth: "24px",
  textAlign: "center",
};

const filterBtn = {
  padding: "0.35rem 0.75rem",
  borderRadius: "999px",
  border: "1px solid",
  fontSize: "0.8rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontWeight: 500,
};

const messageItemStyle = {
  display: "flex",
  gap: "0.75rem",
  padding: "0.85rem",
  borderRadius: "10px",
  border: "1px solid",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const messageContentStyle = {
  flex: 1,
  padding: "1.25rem",
  background: "rgba(255,255,255,0.03)",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.06)",
};
