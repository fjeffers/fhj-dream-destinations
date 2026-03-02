// ==========================================================
// 📄 FILE: AdminConcierge.jsx
// Concierge inbox — table layout, full contact info, archive/delete
// Location: src/pages/AdminConcierge.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FHJCard, FHJButton, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";

export default function AdminConcierge({ admin }) {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unresolved | resolved | archived
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // ── Load all messages ───────────────────────────────────
  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/.netlify/functions/admin-concierge-get");
      const data = await res.json();
      const msgs = data.data || [];
      setMessages(msgs);
      return msgs;
    } catch {
      toast.error("Failed to load concierge messages.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, []);

  // Reset delete confirm when selected message changes
  useEffect(() => { setDeleteConfirmId(null); }, [selected]);

  // ── Derived state ────────────────────────────────────────
  const filtered = messages
    .filter((m) => {
      if (filter === "archived")   return m.status === "Archived";
      if (filter === "unresolved") return m.status !== "Resolved" && m.status !== "Archived";
      if (filter === "resolved")   return m.status === "Resolved";
      return m.status !== "Archived"; // "all" excludes archived
    })
    .filter((m) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (m.name    || "").toLowerCase().includes(q) ||
        (m.email   || "").toLowerCase().includes(q) ||
        (m.phone   || "").toLowerCase().includes(q) ||
        (m.message || "").toLowerCase().includes(q)
      );
    });

  const unresolvedCount = messages.filter(
    (m) => m.status !== "Resolved" && m.status !== "Archived"
  ).length;

  // ── Actions ──────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    try {
      await fetch("/.netlify/functions/admin-concierge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const updated = await loadMessages();
      if (selected?.id === id) {
        const refreshed = updated.find((m) => m.id === id);
        setSelected(refreshed || null);
      }
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleArchive = async (msg) => {
    try {
      const res = await fetch("/.netlify/functions/admin-concierge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, status: "Archived" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Archived.");
      if (selected?.id === msg.id) setSelected(null);
      setDeleteConfirmId(null);
      loadMessages();
    } catch {
      toast.error("Failed to archive.");
    }
  };

  const handleDelete = async (msg) => {
    try {
      const res = await fetch("/.netlify/functions/admin-concierge", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Deleted.");
      if (selected?.id === msg.id) setSelected(null);
      setDeleteConfirmId(null);
      loadMessages();
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      const res = await fetch("/.netlify/functions/admin-concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: selected.id, message: replyText }),
      });
      if (!res.ok) throw new Error();
      toast.success("Reply sent!");
      setReplyText("");
      const updated = await loadMessages();
      const refreshed = updated.find((m) => m.id === selected.id);
      if (refreshed) setSelected(refreshed);
    } catch {
      toast.error("Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  const handleGenerateReply = async () => {
    if (!selected) return;
    setGenerating(true);
    try {
      const res = await fetch("/.netlify/functions/generate-concierge-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selected.name || "Guest", message: selected.message }),
      });
      const data = await res.json();
      if (data.reply) {
        setReplyText(data.reply);
        toast.success("Reply suggestion generated.");
      } else {
        toast.error("Could not generate a reply.");
      }
    } catch {
      toast.error("Failed to generate reply.");
    } finally {
      setGenerating(false);
    }
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div>
      {/* ── Header bar ── */}
      <div style={headerBarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <h2 style={{ margin: 0, color: fhjTheme.primary, fontSize: "1.4rem" }}>
            Concierge Inbox
          </h2>
          {unresolvedCount > 0 && (
            <span style={badgeStyle}>{unresolvedCount} open</span>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {["all", "unresolved", "resolved", "archived"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...filterBtnStyle,
                background: filter === f ? "rgba(0,196,140,0.15)" : "transparent",
                color:      filter === f ? fhjTheme.primary : "#94a3b8",
                borderColor: filter === f ? "rgba(0,196,140,0.3)" : "rgba(255,255,255,0.12)",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search bar ── */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search by name, email, phone, or message…"
          style={searchStyle}
        />
      </div>

      {/* ── Messages table ── */}
      {loading ? (
        <div style={{ color: "#94a3b8", padding: "3rem", textAlign: "center" }}>
          Loading messages…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ color: "#94a3b8", padding: "3rem", textAlign: "center" }}>
          No messages found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((msg) => (
            <FHJCard
              key={msg.id}
              padding={0}
              style={{
                border: selected?.id === msg.id
                  ? `1px solid ${fhjTheme.primary}`
                  : "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              {/* ── Row: summary + actions ── */}
              <div
                style={rowStyle}
                onClick={() => setSelected(selected?.id === msg.id ? null : msg)}
              >
                {/* Status dot */}
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                  background: msg.status === "Resolved"    ? "#94a3b8"
                            : msg.status === "In Progress" ? "#fbbf24"
                            : msg.status === "Archived"    ? "#475569"
                            : "#f87171",
                }} />

                {/* Contact info — always visible */}
                <div style={{ flex: "0 0 180px", minWidth: 0 }}>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {msg.name || "—"}
                  </div>
                  <div style={{ color: "#00c48c", fontSize: "0.78rem", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {msg.email || "—"}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.78rem", marginTop: "1px" }}>
                    {msg.phone || "—"}
                  </div>
                </div>

                {/* Message preview */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#cbd5e1", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {msg.message}
                  </div>
                  <div style={{ color: "#475569", fontSize: "0.75rem", marginTop: "3px" }}>
                    {msg.source || "Chat"} · {formatDate(msg.created)}
                  </div>
                </div>

                {/* Status badge */}
                <span style={{
                  ...statusBadgeStyle,
                  background: msg.status === "Resolved"    ? "rgba(148,163,184,0.12)"
                            : msg.status === "In Progress" ? "rgba(251,191,36,0.12)"
                            : msg.status === "Archived"    ? "rgba(71,85,105,0.12)"
                            : "rgba(248,113,113,0.12)",
                  color: msg.status === "Resolved"    ? "#94a3b8"
                       : msg.status === "In Progress" ? "#fbbf24"
                       : msg.status === "Archived"    ? "#64748b"
                       : "#f87171",
                }}>
                  {msg.status || "New"}
                </span>

                {/* Action buttons — stop propagation so clicks don't toggle detail */}
                <div
                  style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {msg.status !== "Archived" && (
                    <button style={archiveBtnStyle} onClick={() => handleArchive(msg)} title="Archive">
                      📦 Archive
                    </button>
                  )}
                  {deleteConfirmId === msg.id ? (
                    <>
                      <button style={confirmBtnStyle} onClick={() => handleDelete(msg)}>Confirm</button>
                      <button style={cancelBtnStyle}  onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button style={deleteBtnStyle} onClick={() => setDeleteConfirmId(msg.id)} title="Delete">
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>

              {/* ── Expanded detail / reply panel ── */}
              <AnimatePresence>
                {selected?.id === msg.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={detailPanelStyle}>
                      {/* Full contact info */}
                      <div style={contactRowStyle}>
                        <span style={contactLabelStyle}>Name</span>
                        <span style={contactValueStyle}>{msg.name || "—"}</span>
                        <span style={contactLabelStyle}>Email</span>
                        <span style={contactValueStyle}>{msg.email || "—"}</span>
                        <span style={contactLabelStyle}>Phone</span>
                        <span style={contactValueStyle}>{msg.phone || "—"}</span>
                      </div>

                      {/* Full message */}
                      <div style={messageBoxStyle}>
                        <p style={{ margin: 0, color: "#e5e7eb", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                          {msg.message}
                        </p>
                        {msg.context && (
                          <p style={{ color: "#64748b", fontSize: "0.82rem", margin: "0.75rem 0 0" }}>
                            Context: {msg.context}
                          </p>
                        )}
                        {msg.reply && (
                          <div style={replyBoxStyle}>
                            <p style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, margin: "0 0 0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              Admin Reply
                            </p>
                            <p style={{ color: "#e5e7eb", fontSize: "0.88rem", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                              {msg.reply}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Status quick-actions */}
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {msg.status === "New" && (
                          <FHJButton variant="ghost" size="sm"
                            onClick={() => updateStatus(msg.id, "In Progress")}>
                            Mark In Progress
                          </FHJButton>
                        )}
                        <FHJButton
                          variant={msg.status === "Resolved" ? "ghost" : "success"}
                          size="sm"
                          onClick={() => updateStatus(msg.id, msg.status === "Resolved" ? "New" : "Resolved")}
                        >
                          {msg.status === "Resolved" ? "↩ Reopen" : "✓ Mark Resolved"}
                        </FHJButton>
                      </div>

                      {/* Reply box */}
                      <div style={replyInputAreaStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Reply to {msg.name}</span>
                          <FHJButton variant="ghost" size="sm"
                            onClick={handleGenerateReply} disabled={generating}>
                            {generating ? "Generating…" : "✨ Generate Reply"}
                          </FHJButton>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply…"
                            style={textareaStyle}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleReply();
                              }
                            }}
                          />
                          <FHJButton
                            onClick={handleReply}
                            disabled={sending || !replyText.trim()}
                            style={{ alignSelf: "flex-end" }}
                          >
                            {sending ? "Sending…" : "Reply"}
                          </FHJButton>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </FHJCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const diffHours = (Date.now() - d) / 3600000;
    if (diffHours < 1)  return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffHours < 48) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

// ── Styles ────────────────────────────────────────────────────
const headerBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
  flexWrap: "wrap",
  gap: "0.75rem",
};

const badgeStyle = {
  background: "#f87171",
  color: "white",
  fontSize: "0.72rem",
  fontWeight: 700,
  padding: "0.2rem 0.6rem",
  borderRadius: "20px",
};

const filterBtnStyle = {
  padding: "0.3rem 0.7rem",
  borderRadius: "999px",
  border: "1px solid",
  fontSize: "0.78rem",
  cursor: "pointer",
  fontWeight: 500,
  transition: "all 0.15s",
};

const searchStyle = {
  width: "100%",
  padding: "0.6rem 1rem",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  colorScheme: "dark",
};

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1rem 1.25rem",
  flexWrap: "wrap",
};

const statusBadgeStyle = {
  padding: "0.25rem 0.7rem",
  borderRadius: "20px",
  fontSize: "0.75rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const archiveBtnStyle = {
  padding: "0.35rem 0.75rem",
  borderRadius: "8px",
  background: "rgba(148,163,184,0.1)",
  border: "1px solid rgba(148,163,184,0.25)",
  color: "#94a3b8",
  fontSize: "0.78rem",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const deleteBtnStyle = {
  padding: "0.35rem 0.75rem",
  borderRadius: "8px",
  background: "rgba(248,113,113,0.08)",
  border: "1px solid rgba(248,113,113,0.3)",
  color: "#f87171",
  fontSize: "0.78rem",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const confirmBtnStyle = {
  padding: "0.35rem 0.75rem",
  borderRadius: "8px",
  background: "rgba(248,113,113,0.18)",
  border: "1px solid rgba(248,113,113,0.5)",
  color: "#f87171",
  fontSize: "0.78rem",
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const cancelBtnStyle = {
  padding: "0.35rem 0.75rem",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#94a3b8",
  fontSize: "0.78rem",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const detailPanelStyle = {
  borderTop: "1px solid rgba(255,255,255,0.07)",
  padding: "1.25rem 1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const contactRowStyle = {
  display: "grid",
  gridTemplateColumns: "max-content 1fr max-content 1fr max-content 1fr",
  gap: "0.4rem 0.75rem",
  alignItems: "center",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "10px",
  padding: "0.75rem 1rem",
  flexWrap: "wrap",
};

const contactLabelStyle = {
  color: "#64748b",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const contactValueStyle = {
  color: "white",
  fontSize: "0.88rem",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const messageBoxStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "10px",
  padding: "1rem 1.25rem",
};

const replyBoxStyle = {
  marginTop: "0.85rem",
  padding: "0.75rem 1rem",
  borderRadius: "8px",
  background: "rgba(0,196,140,0.06)",
  border: "1px solid rgba(0,196,140,0.15)",
};

const replyInputAreaStyle = {
  borderTop: "1px solid rgba(255,255,255,0.07)",
  paddingTop: "1rem",
};

const textareaStyle = {
  flex: 1,
  padding: "0.75rem",
  borderRadius: "10px",
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "white",
  fontSize: "0.9rem",
  resize: "none",
  minHeight: "60px",
  boxSizing: "border-box",
  colorScheme: "dark",
};
