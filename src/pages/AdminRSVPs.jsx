// ==========================================================
// FILE: AdminRSVPs.jsx — View & Manage RSVP Responses
// Location: src/pages/AdminRSVPs.jsx
//
// Features:
//   - View all RSVPs across events
//   - Filter by event
//   - See guest details + message
//   - Delete RSVPs
//   - Export to CSV
//   - Stats summary
// ==========================================================

import React, { useState, useEffect } from "react";
import { FHJCard, FHJButton, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminRSVPs({ admin }) {
  const toast = useToast();
  const [rsvps, setRsvps] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEvent, setFilterEvent] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rsvpRes, eventsRes] = await Promise.all([
        fetch("/.netlify/functions/get-rsvps"),
        fetch("/.netlify/functions/get-events"),
      ]);
      const rsvpData = await rsvpRes.json();
      const eventsData = await eventsRes.json();

      setRsvps(rsvpData.rsvps || []);
      const eventList = Array.isArray(eventsData) ? eventsData : eventsData.events || [];
      setEvents(eventList);
    } catch (err) {
      toast.error("Failed to load RSVPs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/.netlify/functions/get-rsvps?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("RSVP removed");
        setDeleteConfirm(null);
        setRsvps((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  // Filtering
  const filtered = rsvps.filter((r) => {
    const matchEvent = filterEvent === "all" || (r.event_slug || r.eventSlug || "") === filterEvent;
    const matchSearch = !searchTerm ||
      (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchEvent && matchSearch;
  });

  // Stats
  const totalGuests = filtered.reduce((sum, r) => {
    const g = parseInt(r.guests || r.guest_count || r.numberOfGuests || 1);
    return sum + (isNaN(g) ? 1 : g);
  }, 0);

  // Get unique event slugs from RSVPs
  const eventSlugs = [...new Set(rsvps.map((r) => r.event_slug || r.eventSlug || "").filter(Boolean))];

  // Get event title by slug
  const getEventTitle = (slug) => {
    const ev = events.find((e) => (e.slug || e.Slug) === slug);
    return ev?.title || ev?.Title || ev?.name || ev?.Name || slug;
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Guests", "Event", "Message", "Date"];
    const rows = filtered.map((r) => [
      r.name || "",
      r.email || "",
      r.phone || "",
      r.guests || r.guest_count || r.numberOfGuests || "1",
      getEventTitle(r.event_slug || r.eventSlug || ""),
      (r.message || r.notes || "").replace(/"/g, '""'),
      r.created_at ? new Date(r.created_at).toLocaleDateString() : "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvps-${filterEvent === "all" ? "all-events" : filterEvent}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 400, margin: 0 }}>RSVP Responses</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            {filtered.length} response{filtered.length !== 1 ? "s" : ""} · {totalGuests} total guest{totalGuests !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <FHJButton variant="ghost" onClick={loadData} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
            Refresh
          </FHJButton>
          <FHJButton variant="ghost" onClick={exportCSV} disabled={filtered.length === 0} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
            Export CSV
          </FHJButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <StatCard label="Total RSVPs" value={rsvps.length} color={fhjTheme.primary} />
        <StatCard label="Total Guests" value={totalGuests} color="#60a5fa" />
        <StatCard label="Events" value={eventSlugs.length} color="#D4AF37" />
        <StatCard label="This Month" value={
          rsvps.filter((r) => {
            const d = r.created_at ? new Date(r.created_at) : null;
            if (!d) return false;
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length
        } color="#a78bfa" />
      </div>

      {/* Filters */}
      <FHJCard style={{ padding: "1rem 1.25rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Event Filter */}
          <div style={{ flex: "0 0 auto" }}>
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Events</option>
              {eventSlugs.map((slug) => (
                <option key={slug} value={slug}>{getEventTitle(slug)}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              style={searchInput}
            />
          </div>

          {(filterEvent !== "all" || searchTerm) && (
            <button
              onClick={() => { setFilterEvent("all"); setSearchTerm(""); }}
              style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.8rem" }}
            >
              Clear filters
            </button>
          )}
        </div>
      </FHJCard>

      {/* RSVP List */}
      <FHJCard style={{ padding: "1rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
            <p>Loading RSVPs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem", color: "#64748b" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎫</p>
            <p style={{ fontSize: "0.9rem" }}>No RSVPs {filterEvent !== "all" ? "for this event" : "yet"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {/* Table Header */}
            <div style={{ ...rowStyle, background: "transparent", borderColor: "transparent", padding: "0.4rem 0.75rem" }}>
              <span style={{ ...colStyle, flex: 2, color: "#64748b", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Guest</span>
              <span style={{ ...colStyle, flex: 1.5, color: "#64748b", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Event</span>
              <span style={{ ...colStyle, flex: 0.5, color: "#64748b", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>Guests</span>
              <span style={{ ...colStyle, flex: 0.8, color: "#64748b", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Date</span>
              <span style={{ flex: "0 0 60px" }} />
            </div>

            {filtered.map((rsvp) => {
              const name = rsvp.name || "Unknown";
              const email = rsvp.email || "";
              const phone = rsvp.phone || "";
              const guests = rsvp.guests || rsvp.guest_count || rsvp.numberOfGuests || "1";
              const slug = rsvp.event_slug || rsvp.eventSlug || "";
              const message = rsvp.message || rsvp.notes || "";
              const date = rsvp.created_at ? new Date(rsvp.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
              const isExpanded = expandedId === rsvp.id;

              return (
                <motion.div key={rsvp.id} layout>
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : rsvp.id)}
                    style={{
                      ...rowStyle,
                      cursor: "pointer",
                      background: isExpanded ? "rgba(0,196,140,0.04)" : "rgba(255,255,255,0.02)",
                      borderColor: isExpanded ? "rgba(0,196,140,0.15)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* Guest info */}
                    <div style={{ ...colStyle, flex: 2 }}>
                      <p style={{ color: "white", fontWeight: 500, fontSize: "0.88rem", margin: 0 }}>{name}</p>
                      <p style={{ color: "#64748b", fontSize: "0.73rem", margin: "0.1rem 0 0" }}>{email}</p>
                    </div>

                    {/* Event */}
                    <div style={{ ...colStyle, flex: 1.5 }}>
                      <span style={{
                        padding: "0.15rem 0.6rem", borderRadius: "999px", fontSize: "0.68rem",
                        background: "rgba(212,175,55,0.1)", color: "#D4AF37", fontWeight: 500,
                        border: "1px solid rgba(212,175,55,0.2)",
                      }}>
                        {getEventTitle(slug)}
                      </span>
                    </div>

                    {/* Guest count */}
                    <div style={{ ...colStyle, flex: 0.5, textAlign: "center" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: "rgba(59,130,246,0.1)", color: "#60a5fa",
                        fontSize: "0.8rem", fontWeight: 600,
                      }}>{guests}</span>
                    </div>

                    {/* Date */}
                    <div style={{ ...colStyle, flex: 0.8, textAlign: "right" }}>
                      <span style={{ color: "#64748b", fontSize: "0.78rem" }}>{date}</span>
                    </div>

                    {/* Expand arrow */}
                    <div style={{ flex: "0 0 60px", textAlign: "right" }}>
                      <span style={{ color: "#64748b", fontSize: "0.9rem", transition: "transform 0.2s", display: "inline-block", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{
                          padding: "0.75rem 1rem", marginBottom: "0.25rem",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: "0 0 10px 10px",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderTop: "none",
                        }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 2rem", marginBottom: message ? "0.75rem" : 0 }}>
                            {phone && <DetailRow label="Phone" value={phone} />}
                            <DetailRow label="Guests" value={guests} />
                            <DetailRow label="Event" value={getEventTitle(slug)} />
                            <DetailRow label="Submitted" value={
                              rsvp.created_at
                                ? new Date(rsvp.created_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
                                : "N/A"
                            } />
                          </div>

                          {message && (
                            <div style={{
                              padding: "0.6rem 0.75rem", borderRadius: "8px",
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.06)",
                              marginBottom: "0.75rem",
                            }}>
                              <p style={{ color: "#64748b", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600, margin: "0 0 0.3rem" }}>Message</p>
                              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>{message}</p>
                            </div>
                          )}

                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            {email && (
                              <a href={`mailto:${email}`} style={{
                                ...actionBtnStyle,
                                textDecoration: "none", display: "inline-flex", alignItems: "center",
                              }}>📧 Email</a>
                            )}
                            {deleteConfirm === rsvp.id ? (
                              <>
                                <button onClick={() => handleDelete(rsvp.id)} style={{ ...actionBtnStyle, background: "rgba(248,113,113,0.15)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>
                                  Confirm Delete
                                </button>
                                <button onClick={() => setDeleteConfirm(null)} style={actionBtnStyle}>Cancel</button>
                              </>
                            ) : (
                              <button onClick={() => setDeleteConfirm(rsvp.id)} style={actionBtnStyle}>🗑️ Remove</button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </FHJCard>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <FHJCard style={{ padding: "1rem", textAlign: "center" }}>
      <p style={{ color, fontSize: "1.6rem", fontWeight: 700, margin: "0 0 0.2rem" }}>{value}</p>
      <p style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>{label}</p>
    </FHJCard>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <span style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}: </span>
      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem" }}>{value}</span>
    </div>
  );
}

// Styles
const rowStyle = {
  display: "flex", alignItems: "center", gap: "0.5rem",
  padding: "0.65rem 0.75rem", borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.06)",
  transition: "all 0.15s",
};
const colStyle = { overflow: "hidden", textOverflow: "ellipsis" };

const selectStyle = {
  padding: "0.55rem 0.75rem", borderRadius: "8px",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  color: "white", fontSize: "0.85rem", outline: "none", cursor: "pointer",
};
const searchInput = {
  width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  color: "white", fontSize: "0.85rem", outline: "none", fontFamily: "inherit",
};
const actionBtnStyle = {
  padding: "0.35rem 0.75rem", borderRadius: "6px",
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer",
  transition: "all 0.2s",
};

if (typeof document !== "undefined") {
  const id = "fhj-rsvp-admin-styles";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      select option { background: #1a1a2e; color: white; }
      @media (max-width: 700px) {
        div[style*="grid-template-columns: repeat(auto-fit"] { grid-template-columns: 1fr 1fr !important; }
      }
    `;
    document.head.appendChild(style);
  }
}