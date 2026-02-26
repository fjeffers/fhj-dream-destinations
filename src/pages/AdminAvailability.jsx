// ==========================================================
// FILE: AdminAvailability.jsx
// Admin page to manage blocked dates/times
// Now reads/writes to Supabase via get-blocked-slots function
// Location: src/pages/AdminAvailability.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { FHJCard, FHJButton, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";

export default function AdminAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [blockDate, setBlockDate] = useState("");
  const [blockAllDay, setBlockAllDay] = useState(true);
  const [blockTimes, setBlockTimes] = useState([]);
  const [blockReason, setBlockReason] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  // Holidays (from get-blocked-slots)
  const [holidays, setHolidays] = useState([]);

  useEffect(() => { loadSlots(); }, []);

  // Reads blocked slots from Supabase via get-blocked-slots
  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/get-blocked-slots");
      const data = await res.json();

      // Flatten blockedDates + blockedTimes into a single slots array for the UI
      const allSlots = [];
      (data.blockedDates || []).forEach((b) => {
        allSlots.push({ id: b.id, date: b.date, block_type: "all_day", reason: b.reason, allDay: true });
      });
      Object.entries(data.blockedTimes || {}).forEach(([date, times]) => {
        times.forEach((t) => {
          allSlots.push({ id: t.id, date, block_type: "time", time: t.time, reason: t.reason, allDay: false });
        });
      });
      setSlots(allSlots);
      setHolidays(data.holidays || []);
    } catch (err) {
      console.error("Failed to load blocked slots:", err);
    } finally {
      setLoading(false);
    }
  };

  // Posts to Supabase; one row per time slot
  const handleAdd = async () => {
    if (!blockDate) return;
    setSaving(true);
    setError("");
    try {
      if (blockAllDay || blockTimes.length === 0) {
        const res = await fetch("/.netlify/functions/get-blocked-slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: blockDate, reason: blockReason || "Blocked by admin", block_type: "all_day" }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
      } else {
        for (const time of blockTimes) {
          const res = await fetch("/.netlify/functions/get-blocked-slots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: blockDate, time, reason: blockReason || "Blocked by admin", block_type: "time" }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
        }
      }
      setBlockDate("");
      setBlockTimes([]);
      setBlockReason("");
      setShowForm(false);
      setError("");
      await loadSlots();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Deletes from Supabase by id query param
  const handleDelete = async (id) => {
    if (!confirm("Remove this blocked slot?")) return;
    try {
      await fetch(`/.netlify/functions/get-blocked-slots?id=${id}`, { method: "DELETE" });
      await loadSlots();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const toggleTime = (slot) => {
    setBlockTimes((prev) =>
      prev.includes(slot) ? prev.filter((t) => t !== slot) : [...prev, slot]
    );
  };

  const TIME_OPTIONS = [];
  for (let h = 6; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? "AM" : "PM";
      TIME_OPTIONS.push(`${hr}:${m === 0 ? "00" : "30"} ${ampm}`);
    }
  }
  TIME_OPTIONS.push("11:00 PM");

  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
      });
    } catch { return d; }
  };

  const today = new Date().toISOString().split("T")[0];
  const upcomingHolidays = holidays.filter((h) => (h.date || h) >= today).slice(0, 8);

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 400, margin: 0 }}>Availability Manager</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            Block dates and times so clients cannot book them.
          </p>
        </div>
        <FHJButton onClick={() => setShowForm(!showForm)} style={{ padding: "0.6rem 1.5rem" }}>
          {showForm ? "Cancel" : "+ Block Date/Time"}
        </FHJButton>
      </div>

      {showForm && (
        <FHJCard style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 500, marginTop: 0, marginBottom: "1.25rem" }}>
            Block a Date or Time Slots
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelSt}>Date *</label>
              <input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                style={inputSt}
              />
            </div>
            <div>
              <label style={labelSt}>Reason</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g., Staff meeting, Vacation..."
                style={inputSt}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              onClick={() => setBlockAllDay(!blockAllDay)}
              style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
              <div style={{
                width: "40px", height: "22px", borderRadius: "11px",
                background: blockAllDay ? fhjTheme.primary : "rgba(255,255,255,0.15)",
                position: "relative", transition: "background 0.2s",
              }}>
                <div style={{
                  width: "18px", height: "18px", borderRadius: "50%", background: "white",
                  position: "absolute", top: "2px",
                  left: blockAllDay ? "20px" : "2px", transition: "left 0.2s",
                }} />
              </div>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>Block entire day</span>
            </label>
          </div>

          {!blockAllDay && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelSt}>Select times to block</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.3rem", maxHeight: "200px", overflowY: "auto" }}>
                {TIME_OPTIONS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => toggleTime(slot)}
                    style={{
                      padding: "0.4rem 0.2rem", borderRadius: "6px", fontSize: "0.72rem",
                      border: "1px solid",
                      cursor: "pointer", transition: "all 0.15s",
                      background: blockTimes.includes(slot) ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.04)",
                      borderColor: blockTimes.includes(slot) ? "#f87171" : "rgba(255,255,255,0.1)",
                      color: blockTimes.includes(slot) ? "#f87171" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {blockTimes.length > 0 && (
                <p style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                  {blockTimes.length} time slot{blockTimes.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}

          {error && (
            <p style={{ color: "#f87171", fontSize: "0.85rem", padding: "0.5rem 0.75rem", background: "rgba(248,113,113,0.1)", borderRadius: "6px", border: "1px solid rgba(248,113,113,0.3)" }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <FHJButton onClick={handleAdd} disabled={!blockDate || saving} style={{ padding: "0.6rem 2rem" }}>
              {saving ? "Saving..." : "Block This Date"}
            </FHJButton>
            <FHJButton variant="ghost" onClick={() => setShowForm(false)} style={{ padding: "0.6rem 1.5rem" }}>
              Cancel
            </FHJButton>
          </div>
        </FHJCard>
      )}

      <FHJCard style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 500, marginTop: 0, marginBottom: "1rem" }}>
          Custom Blocked Dates
        </h3>

        {loading ? (
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Loading...</p>
        ) : slots.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</p>
            <p style={{ fontSize: "0.9rem" }}>No custom blocked dates yet.</p>
            <p style={{ fontSize: "0.8rem" }}>Click "Block Date/Time" to add unavailable dates.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {slots.map((slot) => {
              const date = slot.date || "";
              const time = slot.time || "";
              const allDay = slot.allDay || slot.block_type === "all_day";
              const reason = slot.reason || "";

              return (
                <div
                  key={slot.id}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.75rem 1rem", borderRadius: "10px",
                    background: "rgba(248,113,113,0.06)",
                    border: "1px solid rgba(248,113,113,0.15)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ color: "white", fontWeight: 500, fontSize: "0.9rem" }}>
                        {formatDate(date)}
                      </span>
                      {allDay ? (
                        <span style={badgeSt("#f87171")}>All Day</span>
                      ) : time ? (
                        <span style={badgeSt("#f59e0b")}>{time}</span>
                      ) : null}
                    </div>
                    {reason && <p style={{ color: "#94a3b8", fontSize: "0.78rem", margin: "0.25rem 0 0" }}>{reason}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    style={{
                      background: "none", border: "none", color: "#64748b", cursor: "pointer",
                      padding: "0.4rem", fontSize: "1.1rem", transition: "color 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.color = "#f87171")}
                    onMouseOut={(e) => (e.target.style.color = "#64748b")}
                    title="Remove block"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </FHJCard>

      <FHJCard style={{ padding: "1.5rem" }}>
        <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 500, marginTop: 0, marginBottom: "0.5rem" }}>
          Upcoming Holidays (Auto-Blocked)
        </h3>
        <p style={{ color: "#64748b", fontSize: "0.78rem", marginBottom: "1rem" }}>
          These are automatically blocked. Contact support to customize the holiday list.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.4rem" }}>
          {upcomingHolidays.map((h, i) => (
            <div key={i} style={{
              padding: "0.5rem 0.75rem", borderRadius: "8px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: "0.5rem",
            }}>
              <span style={{ color: "#f87171", fontSize: "0.8rem" }}>🔴</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>
                {formatDate(h.date || h)}{h.name ? ` — ${h.name}` : ""}
              </span>
            </div>
          ))}
        </div>
      </FHJCard>
    </div>
  );
}

const labelSt = { color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", marginBottom: "0.35rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", display: "block" };
const inputSt = { width: "100%", padding: "0.6rem 0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: "0.9rem", outline: "none" };
const badgeSt = (color) => ({
  display: "inline-block", padding: "0.15rem 0.5rem", borderRadius: "999px",
  fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.3px",
  background: `${color}15`, color, border: `1px solid ${color}30`,
});