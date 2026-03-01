// ==========================================================
// 📄 FILE: AdminConcierge.jsx
// Concierge inbox — replies, filters, archive, delete
// Location: src/pages/AdminConcierge.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJSkeleton from "../components/FHJ/FHJSkeleton.jsx";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/.netlify/functions/admin-concierge-get");
      const data = await res.json();
      const msgs = data.data || [];
      setMessages(msgs);
      return msgs;
    } catch (err) {
      toast.error("Failed to load concierge messages.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, []);

  // Reset delete confirm whenever selected message changes
  useEffect(() => { setShowDeleteConfirm(false); }, [selected]);

  // Filter messages
  const filtered = messages
    .filter((m) => {
      if (filter === "archived") return m.status === "Archived";
      if (filter === "unresolved") return m.status !== "Resolved" && m.status !== "Archived";
      if (filter === "resolved") return m.status === "Resolved";
      return m.status !== "Archived"; // "all" excludes archived
    })
    .filter((m) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (m.name || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        (m.phone || "").toLowerCase().includes(q) ||
        (m.message || "").toLowerCase().includes(q)
      );
    });

  const unresolvedCount = messages.filter((m) => m.status !== "Resolved" && m.status !== "Archived").length;

  // Toggle resolve
  const toggleResolve = async (msg) => {
    try {
      const newStatus = msg.status === "Resolved" ? "New" : "Resolved";
      await fetch("/.netlify/functions/admin-concierge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, status: newStatus }),
      });
      toast.success(newStatus === "Resolved" ? "Marked as resolved." : "Reopened message.");
      loadMessages();
      if (selected?.id === msg.id) {
        setSelected({ ...selected, status: newStatus });
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  // Mark as In Progress
  const markInProgress = async (msg) => {
    if (msg.status === "In Progress") return;
    try {
      await fetch("/.netlify/functions/admin-concierge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, status: "In Progress" }),
      });
      toast.success("Marked as In Progress.");
      loadMessages();
      if (selected?.id === msg.id) {
        setSelected({ ...selected, status: "In Progress" });
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  // Archive conversation
  const handleArchive = async (msg) => {
    try {
      const res = await fetch("/.netlify/functions/admin-concierge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, status: "Archived" }),
      });
      if (!res.ok) throw new Error("Archive request failed");
      toast.success("Conversation archived.");
      setSelected(null);
      loadMessages();
    } catch (err) {
      toast.error("Failed to archive conversation.");
    }
  };

  // Delete conversation permanently
  const handleDelete = async (msg) => {
    try {
      const res = await fetch("/.netlify/functions/admin-concierge", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id }),
      });
      if (!res.ok) throw new Error("Delete request failed");
      toast.success("Conversation deleted.");
      setSelected(null);
      setShowDeleteConfirm(false);
      loadMessages();
    } catch (err) {
      toast.error("Failed to delete conversation.");
    }
  };

  // Send reply
  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      const res = await fetch("/.netlify/functions/admin-concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: selected.id,
          message: replyText,
        }),
      });
      if (!res.ok) throw new Error("Reply request failed");
      toast.success("Reply sent!");
      setReplyText("");
      const updated = await loadMessages();
      const refreshed = updated.find((m) => m.id === selected.id);
      if (refreshed) setSelected(refreshed);
    } catch (err) {
      toast.error("Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  // Generate AI reply suggestion
  const handleGenerateReply = async () => {
    if (!selected) return;
    setGenerating(true);
    try {
      const res = await fetch("/.netlify/functions/generate-concierge-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selected.name || "Guest",
          message: selected.message,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setReplyText(data.reply);
        toast.success("Reply suggestion generated.");
      } else {
        toast.error("Could not generate a reply.");
      }
    } catch (err) {
      toast.error("Failed to generate reply.");
    } finally {
      setGenerating(false);
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

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, or message…"
          style={searchInputStyle}
        />

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {["all", "unresolved", "resolved", "archived"].map((f) => (
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
                  background: msg.status === "Resolved" ? "#94a3b8"
                             : msg.status === "In Progress" ? "#fbbf24"
                             : msg.status === "Archived" ? "#475569"
                             : "#f87171",
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
                  <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0.2rem 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {msg.message}
                  </p>
                  {msg.phone && (
                    <p style={{ color: "#475569", fontSize: "0.75rem", margin: "0.1rem 0 0" }}>
                      📞 {msg.phone}
                    </p>
                  )}
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
              {/* Header: name + contact info (left) · status buttons (right) */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 style={{ color: "white", margin: "0 0 0.5rem", fontSize: "1.3rem" }}>
                    {selected.name || "Unknown"}
                  </h3>
                  {/* Contact info — phone prominently labeled */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.25rem" }}>
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                      📧 {selected.email || "—"}
                    </span>
                    <span style={{
                      fontSize: "0.85rem",
                      color: selected.phone ? "#94a3b8" : "#475569",
                      fontStyle: selected.phone ? "normal" : "italic",
                    }}>
                      📞 {selected.phone || "No phone on file"}
                    </span>
                    <span style={{ color: "#475569", fontSize: "0.85rem" }}>
                      {selected.source || "Portal"} · {formatDate(selected.created)}
                    </span>
                  </div>
                </div>

                {/* Status management buttons only — keeps the header uncluttered */}
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, marginLeft: "1rem" }}>
                  {selected.status === "New" && (
                    <FHJButton variant="ghost" size="sm" onClick={() => markInProgress(selected)}>
                      In Progress
                    </FHJButton>
                  )}
                  <FHJButton
                    variant={selected.status === "Resolved" ? "ghost" : "success"}
                    size="sm"
                    onClick={() => toggleResolve(selected)}
                  >
                    {selected.status === "Resolved" ? "Reopen" : "✓ Resolved"}
                  </FHJButton>
                </div>
              </div>

              {/* Status Badge + Archive / Delete action bar */}
              <div style={actionBarStyle}>
                {/* Status badge (left) */}
                <span style={{
                  padding: "0.3rem 0.85rem",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: selected.status === "Resolved" ? "rgba(148,163,184,0.15)" :
                              selected.status === "In Progress" ? "rgba(251,191,36,0.15)" :
                              selected.status === "Archived" ? "rgba(71,85,105,0.15)" :
                              "rgba(248,113,113,0.15)",
                  color: selected.status === "Resolved" ? "#94a3b8" :
                         selected.status === "In Progress" ? "#fbbf24" :
                         selected.status === "Archived" ? "#64748b" :
                         "#f87171",
                }}>
                  {selected.status || "New"}
                </span>

                {/* Archive + Delete always visible on the right */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {selected.status !== "Archived" && (
                    <button
                      onClick={() => handleArchive(selected)}
                      style={archiveBtnStyle}
                      aria-label="Archive this conversation"
                      title="Archive this conversation"
                    >
                      📦 Archive
                    </button>
                  )}

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      style={deleteBtnStyle}
                      aria-label="Delete this conversation"
                      title="Permanently delete this conversation"
                    >
                      🗑️ Delete
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <span style={{ color: "#f87171", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        Permanently delete?
                      </span>
                      <button onClick={() => handleDelete(selected)} style={confirmDeleteBtnStyle}>
                        Confirm
                      </button>
                      <button onClick={() => setShowDeleteConfirm(false)} style={cancelBtnStyle}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div style={messageContentStyle}>
                <p style={{ color: "#e5e7eb", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                  {selected.message}
                </p>
                {selected.context && (
                  <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "1rem" }}>
                    Context: {selected.context}
                  </p>
                )}
                {selected.reply && (
                  <div style={{ marginTop: "1rem", padding: "0.85rem 1rem", borderRadius: "8px", background: "rgba(0,196,140,0.06)", border: "1px solid rgba(0,196,140,0.15)" }}>
                    <p style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, margin: "0 0 0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Admin Reply
                    </p>
                    <p style={{ color: "#e5e7eb", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
                      {selected.reply}
                    </p>
                  </div>
                )}
              </div>

              {/* Reply Section */}
              <div style={{ marginTop: "auto", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>Reply to {selected.name}</p>
                  <FHJButton
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateReply}
                    disabled={generating}
                  >
                    {generating ? "Generating…" : "✨ Generate Reply"}
                  </FHJButton>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    style={replyTextareaStyle}
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
                    {sending ? "Sending..." : "Reply"}
                  </FHJButton>
                </div>
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

const searchInputStyle = {
  width: "100%",
  padding: "0.5rem 0.85rem",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  fontSize: "0.85rem",
  outline: "none",
  marginBottom: "0.75rem",
  boxSizing: "border-box",
  colorScheme: "dark",
};

const filterBtn = {
  padding: "0.3rem 0.65rem",
  borderRadius: "999px",
  border: "1px solid",
  fontSize: "0.78rem",
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
  overflowY: "auto",
};

// Action bar: status badge (left) + Archive & Delete (right)
const actionBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
  padding: "0.6rem 0.85rem",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const archiveBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.4rem 0.85rem",
  borderRadius: "8px",
  background: "rgba(148,163,184,0.1)",
  border: "1px solid rgba(148,163,184,0.25)",
  color: "#94a3b8",
  fontSize: "0.82rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  whiteSpace: "nowrap",
};

const deleteBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.4rem 0.85rem",
  borderRadius: "8px",
  background: "rgba(248,113,113,0.08)",
  border: "1px solid rgba(248,113,113,0.3)",
  color: "#f87171",
  fontSize: "0.82rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  whiteSpace: "nowrap",
};

const confirmDeleteBtnStyle = {
  padding: "0.35rem 0.75rem",
  borderRadius: "8px",
  background: "rgba(248,113,113,0.15)",
  border: "1px solid rgba(248,113,113,0.4)",
  color: "#f87171",
  fontSize: "0.8rem",
  fontWeight: 700,
  cursor: "pointer",
};

const cancelBtnStyle = {
  padding: "0.35rem 0.75rem",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#94a3b8",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer",
};

const replyTextareaStyle = {
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
