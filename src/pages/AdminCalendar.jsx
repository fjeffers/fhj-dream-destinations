// ==========================================================
// FILE: AdminCalendar.jsx
// Full interactive calendar — add / edit / delete / block
// Location: src/pages/AdminCalendar.jsx
// ==========================================================

import React, { useState, useEffect, useCallback } from "react";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { motion, AnimatePresence } from "framer-motion";

// 30-min time slots 4:30 PM – 10:30 PM (admin default)
const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 16; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 16 && m < 30) continue;
      const h12 = h > 12 ? h - 12 : h;
      const ampm = h < 12 ? "AM" : "PM";
      const min = m === 0 ? "00" : "30";
      slots.push(`${h12}:${min} ${ampm}`);
    }
  }
  return slots;
})();

function timeToISO(dateStr, timeLabel) {
  const [timePart, ampm] = timeLabel.split(" ");
  const [hourStr, minuteStr] = timePart.split(":");
  let hour = parseInt(hourStr);
  const minute = parseInt(minuteStr || "0");
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return `${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function isoToTimeLabel(isoStr) {
  if (!isoStr) return "";
  const t = isoStr.split("T")[1] || "";
  const [hh, mm] = t.split(":");
  const h = parseInt(hh);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mm} ${ampm}`;
}

function addOneHour(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  d.setHours(d.getHours() + 1);
  return d.toISOString().slice(0, 19);
}

const EMPTY_FORM = {
  client_name: "", client_email: "", client_phone: "",
  date: "", startTime: "", endTime: "", notes: "", type: "appointment",
};

const EMPTY_BLOCK = { date: "", fullDay: true, times: [], reason: "" };

// Small toast banner (fixed bottom-right)
function Toast({ message, variant = "success", onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        position: "fixed", bottom: "1.5rem", right: "1.5rem",
        padding: "0.75rem 1.25rem", borderRadius: "10px", zIndex: 9999,
        background: variant === "success" ? "rgba(0,196,140,0.15)" : "rgba(248,113,113,0.15)",
        border: `1px solid ${variant === "success" ? "rgba(0,196,140,0.3)" : "rgba(248,113,113,0.3)"}`,
        color: variant === "success" ? fhjTheme.primary : "#f87171",
        fontSize: "0.85rem", fontWeight: 500,
        backdropFilter: "blur(10px)",
      }}
    >
      {message}
    </motion.div>
  );
}

// Modal wrapper
function Modal({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        style={{ width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

const labelStyle = { color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "0.4rem" };
const selectStyle = { width: "100%", padding: "0.65rem 0.9rem", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.9rem", outline: "none", cursor: "pointer" };
const textareaStyle = { width: "100%", padding: "0.65rem 0.9rem", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.9rem", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" };

export default function AdminCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [appointments, setAppointments] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editingApt, setEditingApt] = useState(null); // appointment object or null
  const [deletingId, setDeletingId] = useState(null);

  // Form state
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [blockForm, setBlockForm] = useState(EMPTY_BLOCK);

  // Toast
  const [toast, setToast] = useState(null); // { message, variant }

  const showToast = (message, variant = "success") => setToast({ message, variant });

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load current month ± 1 week buffer
      const startDate = new Date(year, month - 1, 25);
      const endDate = new Date(year, month + 1, 7);
      const startISO = startDate.toISOString().slice(0, 10) + "T00:00:00";
      const endISO = endDate.toISOString().slice(0, 10) + "T23:59:59";

      const res = await fetch(
        `/.netlify/functions/admin-appointments?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const bookings = data.bookings || [];
      setAppointments(bookings.filter((b) => b.type !== "block"));
      setBlockedSlots(bookings.filter((b) => b.type === "block"));
    } catch (err) {
      console.error("Failed to load calendar data:", err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Helpers ────────────────────────────────────────────────────

  const getAptsForDate = (dateStr) =>
    appointments.filter((a) => (a.start || "").startsWith(dateStr));

  const isFullDayBlocked = (dateStr) =>
    blockedSlots.some((b) => {
      const s = (b.start || "").startsWith(dateStr);
      const e = (b.end || "").includes("23:5");
      return s && e;
    });

  const getBlockedTimesForDate = (dateStr) =>
    blockedSlots
      .filter((b) => (b.start || "").startsWith(dateStr) && !(b.end || "").includes("23:5"))
      .map((b) => isoToTimeLabel(b.start));

  // ── Month navigation ───────────────────────────────────────────

  const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  // ── CRUD handlers ──────────────────────────────────────────────

  const handleAddOpen = () => {
    setAddForm({ ...EMPTY_FORM, date: selectedDateStr || "" });
    setShowAddModal(true);
  };

  const handleAddFormChange = (key, val) => {
    setAddForm((f) => {
      const next = { ...f, [key]: val };
      // Auto-calculate end time = start + 1hr
      if (key === "startTime" && val) {
        try {
          const startISO = timeToISO(next.date || todayStr, val);
          next.endTime = isoToTimeLabel(addOneHour(startISO));
        } catch (_) {}
      }
      return next;
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const { client_name, client_email, client_phone, date, startTime, endTime, notes, type } = addForm;
    if (!date || !startTime || !endTime) { showToast("Date and times are required.", "error"); return; }
    const startISO = timeToISO(date, startTime);
    const endISO = timeToISO(date, endTime);
    try {
      const res = await fetch("/.netlify/functions/admin-appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name, client_email, client_phone, start: startISO, end: endISO, notes, type }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to create.", "error"); return; }
      showToast("Appointment created!");
      setShowAddModal(false);
      loadData();
    } catch (err) {
      showToast("Network error.", "error");
    }
  };

  const handleBlockOpen = () => {
    setBlockForm({ ...EMPTY_BLOCK, date: selectedDateStr || "" });
    setShowBlockModal(true);
  };

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    const { date, fullDay, times, reason } = blockForm;
    if (!date) { showToast("Date is required.", "error"); return; }

    const posts = fullDay
      ? [{ start: `${date}T00:00:00`, end: `${date}T23:59:00`, type: "block", notes: reason }]
      : times.map((t) => {
          const s = timeToISO(date, t);
          const en = addOneHour(s);
          return { start: s, end: en.slice(0, 19), type: "block", notes: reason };
        });

    if (posts.length === 0) { showToast("Select at least one time slot.", "error"); return; }

    try {
      for (const payload of posts) {
        const res = await fetch("/.netlify/functions/admin-appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const d = await res.json();
          if (res.status !== 409) { showToast(d.error || "Failed to block.", "error"); return; }
        }
      }
      showToast("Day/times blocked!");
      setShowBlockModal(false);
      loadData();
    } catch (err) {
      showToast("Network error.", "error");
    }
  };

  const handleEditOpen = (apt) => {
    const dateStr = (apt.start || "").split("T")[0];
    const startTime = isoToTimeLabel(apt.start);
    const endTime = isoToTimeLabel(apt.end || apt.end_time);
    setEditingApt({
      ...apt,
      _date: dateStr,
      _startTime: startTime,
      _endTime: endTime,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const { id, _date, _startTime, _endTime, client_name, client_email, client_phone, notes, type } = editingApt;
    if (!_date || !_startTime || !_endTime) { showToast("Date and times are required.", "error"); return; }
    const startISO = timeToISO(_date, _startTime);
    const endISO = timeToISO(_date, _endTime);
    try {
      const res = await fetch("/.netlify/functions/admin-appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, client_name, client_email, client_phone, start: startISO, end: endISO, notes, type }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to update.", "error"); return; }
      showToast("Appointment updated!");
      setEditingApt(null);
      loadData();
    } catch (err) {
      showToast("Network error.", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/.netlify/functions/admin-appointments?id=${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); showToast(d.error || "Failed to delete.", "error"); return; }
      showToast("Appointment deleted.");
      setDeletingId(null);
      loadData();
    } catch (err) {
      showToast("Network error.", "error");
    }
  };

  // ── Render ─────────────────────────────────────────────────────

  const thisMonthApts = appointments.filter((a) =>
    (a.start || "").startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)
  );

  const selectedApts = selectedDateStr ? getAptsForDate(selectedDateStr) : [];
  const selectedBlocked = selectedDateStr ? isFullDayBlocked(selectedDateStr) : false;
  const selectedBlockedTimes = selectedDateStr ? getBlockedTimesForDate(selectedDateStr) : [];

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 400, margin: 0 }}>Appointment Calendar</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            {thisMonthApts.length} appointment{thisMonthApts.length !== 1 ? "s" : ""} this month
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <FHJButton variant="ghost" onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Today</FHJButton>
          <FHJButton variant="ghost" onClick={handleAddOpen} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>+ Add Appointment</FHJButton>
          <FHJButton variant="ghost" onClick={handleBlockOpen} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", color: "#f87171" }}>🔴 Block Day</FHJButton>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedDay ? "1fr 340px" : "1fr", gap: "1.5rem" }}>
        {/* Calendar Grid */}
        <FHJCard style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <button onClick={prevMonth} style={navBtn}>‹</button>
            <span style={{ color: "white", fontSize: "1.2rem", fontWeight: 600 }}>{monthName}</span>
            <button onClick={nextMonth} style={navBtn}>›</button>
          </div>

          <div style={calGrid}>
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
              <div key={d} style={{ textAlign: "center", color: "#64748b", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1px", padding: "8px 0" }}>{d}</div>
            ))}
          </div>

          <div style={calGrid}>
            {days.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const apts = getAptsForDate(dateStr);
              const blocked = isFullDayBlocked(dateStr);
              const isToday = dateStr === todayStr;
              const isPast = new Date(dateStr) < new Date(todayStr);
              const isSelected = day === selectedDay;
              const hasApts = apts.length > 0;

              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  style={{
                    padding: "8px 4px", borderRadius: "10px", cursor: "pointer",
                    minHeight: "55px", position: "relative", transition: "all 0.15s",
                    background: isSelected ? "rgba(0,196,140,0.15)" : blocked ? "rgba(248,113,113,0.06)" : hasApts ? "rgba(59,130,246,0.06)" : "transparent",
                    border: isSelected ? `2px solid ${fhjTheme.primary}` : isToday ? `1px solid ${fhjTheme.primary}` : blocked ? "1px solid rgba(248,113,113,0.15)" : "1px solid rgba(255,255,255,0.04)",
                    opacity: isPast ? 0.4 : 1,
                  }}
                >
                  <div style={{
                    fontSize: "0.85rem", fontWeight: isToday ? 700 : 400,
                    color: blocked ? "#f87171" : isToday ? fhjTheme.primary : "rgba(255,255,255,0.8)",
                    textDecoration: blocked ? "line-through" : "none",
                    textAlign: "center", marginBottom: "2px",
                  }}>{day}</div>

                  {hasApts && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "2px", flexWrap: "wrap" }}>
                      {apts.slice(0, 4).map((_, idx) => (
                        <div key={idx} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#3b82f6" }} />
                      ))}
                      {apts.length > 4 && <span style={{ fontSize: "0.55rem", color: "#3b82f6" }}>+{apts.length - 4}</span>}
                    </div>
                  )}
                  {blocked && !hasApts && (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f87171", margin: "0 auto" }} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem", fontSize: "0.7rem", color: "#64748b" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: fhjTheme.primary }} /> Today
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }} /> Appointment
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f87171" }} /> Blocked
            </span>
          </div>
        </FHJCard>

        {/* Side Panel */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <FHJCard style={{ padding: "1.25rem", position: "sticky", top: "5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 500, margin: 0 }}>
                    {new Date(selectedDateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </h3>
                  <button onClick={() => setSelectedDay(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
                </div>

                {selectedBlocked && (
                  <div style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", marginBottom: "0.75rem" }}>
                    <span style={{ color: "#f87171", fontSize: "0.8rem", fontWeight: 600 }}>🔴 Full Day Blocked</span>
                  </div>
                )}

                {selectedBlockedTimes.length > 0 && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <p style={{ color: "#f59e0b", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Blocked Times</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {selectedBlockedTimes.map((t, i) => (
                        <span key={i} style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApts.length === 0 && !selectedBlocked ? (
                  <div style={{ textAlign: "center", padding: "1.5rem 0", color: "#64748b" }}>
                    <p style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>📅</p>
                    <p style={{ fontSize: "0.85rem" }}>No appointments</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {selectedApts
                      .sort((a, b) => (a.start || "").localeCompare(b.start || ""))
                      .map((apt) => {
                        const timeLabel = isoToTimeLabel(apt.start);
                        const isDeleting = deletingId === apt.id;

                        return (
                          <div key={apt.id} style={{ padding: "0.75rem", borderRadius: "10px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.3rem" }}>
                              <div>
                                <p style={{ color: "white", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{apt.client_name || "Unknown"}</p>
                                {timeLabel && <p style={{ color: "#3b82f6", fontSize: "0.8rem", margin: "0.2rem 0 0", fontWeight: 600 }}>🕐 {timeLabel}</p>}
                              </div>
                              <div style={{ display: "flex", gap: "0.3rem" }}>
                                <button
                                  onClick={() => handleEditOpen(apt)}
                                  title="Edit"
                                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", color: "#94a3b8", padding: "2px 4px" }}
                                >✏️</button>
                                <button
                                  onClick={() => setDeletingId(isDeleting ? null : apt.id)}
                                  title="Delete"
                                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", color: "#94a3b8", padding: "2px 4px" }}
                                >🗑️</button>
                              </div>
                            </div>
                            {apt.client_email && <p style={{ color: "#475569", fontSize: "0.7rem", margin: "0.1rem 0 0" }}>{apt.client_email}</p>}
                            {apt.client_phone && <p style={{ color: "#475569", fontSize: "0.7rem", margin: "0.1rem 0 0" }}>{apt.client_phone}</p>}
                            {apt.notes && <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "0.2rem 0 0", fontStyle: "italic" }}>{apt.notes}</p>}

                            {isDeleting && (
                              <div style={{ marginTop: "0.5rem", padding: "0.4rem 0.6rem", borderRadius: "6px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
                                <p style={{ color: "#f87171", fontSize: "0.75rem", margin: "0 0 0.4rem" }}>Delete this appointment?</p>
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                  <button onClick={() => handleDelete(apt.id)} style={{ padding: "0.25rem 0.6rem", borderRadius: "5px", background: "#f87171", border: "none", color: "white", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>Confirm</button>
                                  <button onClick={() => setDeletingId(null)} style={{ padding: "0.25rem 0.6rem", borderRadius: "5px", background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.75rem" }}>Cancel</button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {selectedApts.length > 0 && (
                  <p style={{ color: "#64748b", fontSize: "0.7rem", textAlign: "center", marginTop: "0.75rem" }}>
                    {selectedApts.length} appointment{selectedApts.length !== 1 ? "s" : ""}
                  </p>
                )}
              </FHJCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upcoming list */}
      <FHJCard style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 500, marginTop: 0, marginBottom: "1rem" }}>Upcoming Appointments</h3>
        {(() => {
          const upcoming = appointments
            .filter((a) => (a.start || "") >= todayStr)
            .sort((a, b) => (a.start || "").localeCompare(b.start || ""))
            .slice(0, 10);

          if (upcoming.length === 0) {
            return <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>No upcoming appointments.</p>;
          }
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {upcoming.map((apt, idx) => {
                const dateStr = (apt.start || "").split("T")[0];
                const timeLabel = isoToTimeLabel(apt.start);
                return (
                  <div key={apt.id || idx} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.6rem 0.8rem", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ minWidth: "80px" }}>
                      <p style={{ color: fhjTheme.primary, fontSize: "0.75rem", fontWeight: 600, margin: 0 }}>
                        {dateStr ? new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                      </p>
                      {timeLabel && <p style={{ color: "#64748b", fontSize: "0.7rem", margin: "0.1rem 0 0" }}>{timeLabel}</p>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "white", fontSize: "0.85rem", fontWeight: 500, margin: 0 }}>{apt.client_name || "Unknown"}</p>
                      {apt.client_email && <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: "0.1rem 0 0" }}>{apt.client_email}</p>}
                    </div>
                    <span style={{ padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.6rem", background: "rgba(59,130,246,0.1)", color: "#3b82f6", fontWeight: 600 }}>
                      {apt.type || "appointment"}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </FHJCard>

      {/* ── Add Appointment Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <Modal onClose={() => setShowAddModal(false)}>
            <FHJCard style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ color: "white", fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>+ Add Appointment</h2>
                <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div>
                    <label style={labelStyle}>Client Name *</label>
                    <FHJInput required value={addForm.client_name} onChange={(e) => handleAddFormChange("client_name", e.target.value)} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label style={labelStyle}>Client Email</label>
                    <FHJInput type="email" value={addForm.client_email} onChange={(e) => handleAddFormChange("client_email", e.target.value)} placeholder="jane@email.com" />
                  </div>
                  <div>
                    <label style={labelStyle}>Client Phone</label>
                    <FHJInput value={addForm.client_phone} onChange={(e) => handleAddFormChange("client_phone", e.target.value)} placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <label style={labelStyle}>Date *</label>
                    <FHJInput type="date" required value={addForm.date} onChange={(e) => handleAddFormChange("date", e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Start Time *</label>
                    <select required style={selectStyle} value={addForm.startTime} onChange={(e) => handleAddFormChange("startTime", e.target.value)}>
                      <option value="">Select time…</option>
                      {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>End Time *</label>
                    <select required style={selectStyle} value={addForm.endTime} onChange={(e) => handleAddFormChange("endTime", e.target.value)}>
                      <option value="">Select time…</option>
                      {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <label style={labelStyle}>Type</label>
                  <select style={selectStyle} value={addForm.type} onChange={(e) => handleAddFormChange("type", e.target.value)}>
                    <option value="appointment">Appointment</option>
                    <option value="block">Block</option>
                  </select>
                </div>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea style={textareaStyle} rows={3} value={addForm.notes} onChange={(e) => handleAddFormChange("notes", e.target.value)} placeholder="Optional notes…" />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <FHJButton type="button" variant="ghost" onClick={() => setShowAddModal(false)} style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>Cancel</FHJButton>
                  <FHJButton type="submit" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>Create</FHJButton>
                </div>
              </form>
            </FHJCard>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Block Day/Time Modal ──────────────────────────────── */}
      <AnimatePresence>
        {showBlockModal && (
          <Modal onClose={() => setShowBlockModal(false)}>
            <FHJCard style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ color: "white", fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>🔴 Block Day / Time</h2>
                <button onClick={() => setShowBlockModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
              </div>
              <form onSubmit={handleBlockSubmit}>
                <div style={{ marginBottom: "0.75rem" }}>
                  <label style={labelStyle}>Date *</label>
                  <FHJInput type="date" required value={blockForm.date} onChange={(e) => setBlockForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    id="fullDay"
                    checked={blockForm.fullDay}
                    onChange={(e) => setBlockForm((f) => ({ ...f, fullDay: e.target.checked, times: [] }))}
                    style={{ accentColor: fhjTheme.primary, width: "16px", height: "16px" }}
                  />
                  <label htmlFor="fullDay" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", cursor: "pointer" }}>Block full day</label>
                </div>

                {!blockForm.fullDay && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <label style={labelStyle}>Select Time Slots</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.4rem" }}>
                      {TIME_SLOTS.map((t) => {
                        const selected = blockForm.times.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setBlockForm((f) => ({
                              ...f,
                              times: selected ? f.times.filter((x) => x !== t) : [...f.times, t],
                            }))}
                            style={{
                              padding: "0.3rem 0.7rem", borderRadius: "999px", border: "1px solid",
                              background: selected ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.05)",
                              borderColor: selected ? "#f87171" : "rgba(255,255,255,0.1)",
                              color: selected ? "#f87171" : "rgba(255,255,255,0.6)",
                              fontSize: "0.78rem", cursor: "pointer",
                            }}
                          >{t}</button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={labelStyle}>Reason</label>
                  <FHJInput value={blockForm.reason} onChange={(e) => setBlockForm((f) => ({ ...f, reason: e.target.value }))} placeholder="e.g. Unavailable, Holiday…" />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <FHJButton type="button" variant="ghost" onClick={() => setShowBlockModal(false)} style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>Cancel</FHJButton>
                  <FHJButton type="submit" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem", background: "#f87171", color: "white" }}>Block</FHJButton>
                </div>
              </form>
            </FHJCard>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Edit Appointment Modal ────────────────────────────── */}
      <AnimatePresence>
        {editingApt && (
          <Modal onClose={() => setEditingApt(null)}>
            <FHJCard style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ color: "white", fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>✏️ Edit Appointment</h2>
                <button onClick={() => setEditingApt(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div>
                    <label style={labelStyle}>Client Name</label>
                    <FHJInput value={editingApt.client_name || ""} onChange={(e) => setEditingApt((a) => ({ ...a, client_name: e.target.value }))} placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label style={labelStyle}>Client Email</label>
                    <FHJInput type="email" value={editingApt.client_email || ""} onChange={(e) => setEditingApt((a) => ({ ...a, client_email: e.target.value }))} placeholder="jane@email.com" />
                  </div>
                  <div>
                    <label style={labelStyle}>Client Phone</label>
                    <FHJInput value={editingApt.client_phone || ""} onChange={(e) => setEditingApt((a) => ({ ...a, client_phone: e.target.value }))} placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <label style={labelStyle}>Date *</label>
                    <FHJInput type="date" required value={editingApt._date || ""} onChange={(e) => setEditingApt((a) => ({ ...a, _date: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Start Time *</label>
                    <select required style={selectStyle} value={editingApt._startTime || ""} onChange={(e) => {
                      const val = e.target.value;
                      setEditingApt((a) => {
                        const next = { ...a, _startTime: val };
                        try {
                          next._endTime = isoToTimeLabel(addOneHour(timeToISO(a._date || todayStr, val)));
                        } catch (_) {}
                        return next;
                      });
                    }}>
                      <option value="">Select time…</option>
                      {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>End Time *</label>
                    <select required style={selectStyle} value={editingApt._endTime || ""} onChange={(e) => setEditingApt((a) => ({ ...a, _endTime: e.target.value }))}>
                      <option value="">Select time…</option>
                      {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <label style={labelStyle}>Type</label>
                  <select style={selectStyle} value={editingApt.type || "appointment"} onChange={(e) => setEditingApt((a) => ({ ...a, type: e.target.value }))}>
                    <option value="appointment">Appointment</option>
                    <option value="block">Block</option>
                  </select>
                </div>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea style={textareaStyle} rows={3} value={editingApt.notes || ""} onChange={(e) => setEditingApt((a) => ({ ...a, notes: e.target.value }))} placeholder="Optional notes…" />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                  <FHJButton type="button" variant="ghost" onClick={() => setEditingApt(null)} style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>Cancel</FHJButton>
                  <FHJButton type="submit" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>Save Changes</FHJButton>
                </div>
              </form>
            </FHJCard>
          </Modal>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast key={toast.message + Date.now()} message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

const calGrid = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" };
const navBtn = { background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer", padding: "4px 12px" };
