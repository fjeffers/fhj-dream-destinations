// ==========================================================
// FILE: AdminCalendar.jsx
// Full calendar view of all appointments + blocked slots
// Location: src/pages/AdminCalendar.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { FHJCard, FHJButton, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { adminFetch } from "../utils/adminFetch.js";

export default function AdminCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [trips, setTrips] = useState([]);
  const [blockedData, setBlockedData] = useState({ blockedDates: [], blockedTimes: {}, holidays: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { loadData(); }, [month, year]);

  const loadData = async () => {
    setLoading(true);
    try {
      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const endDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

      const res = await fetch(
        `/.netlify/functions/admin-appointments?start=${startDate}&end=${endDate}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const bookings = data.bookings || [];
      const blocked = data.blocked_slots || [];

      const normalizedTrips = bookings.map(b => ({
        ...b,
        consultationDate: b.date || b.consultationDate || "",
        consultationTime: b.time || b.consultationTime || "",
        client: b.client || b.client_name || "Unknown",
      }));

      setTrips(normalizedTrips);
      setBlockedData({
        blockedDates: blocked.map(bs => ({
          date: bs.date || (bs.start ? bs.start.split("T")[0] : ""),
          reason: bs.reason || bs.notes || "",
        })),
        blockedTimes: {},
        holidays: [],
      });
    } catch (err) {
      console.error("Failed to load calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAptsForDate = (dateStr) => {
    return trips.filter(t => {
      const d = t.consultationDate || t.startDate || t["Start Date"] || t["Consultation Date"] || "";
      return d === dateStr;
    });
  };

  const getTripTime = (trip) => {
    return trip.consultationTime || trip["Consultation Time"] || trip["Time"] || "";
  };

  const getClientName = (trip) => {
    return trip.client || trip["Client"] || trip["Client Name"] || trip["client_name"] || "Unknown";
  };

  const isBlocked = (dateStr) => {
    return (blockedData.blockedDates || []).some(b => b.date === dateStr);
  };

  const getBlockReason = (dateStr) => {
    const b = (blockedData.blockedDates || []).find(bd => bd.date === dateStr);
    return b?.reason || "";
  };

  const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const thisMonthTrips = trips.filter(t => {
    const d = t.consultationDate || t.startDate || t["Start Date"] || t["Consultation Date"] || "";
    return d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`);
  });

  const selectedDateStr = selectedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null;
  const selectedApts = selectedDateStr ? getAptsForDate(selectedDateStr) : [];
  const selectedBlocked = selectedDateStr ? isBlocked(selectedDateStr) : false;
  const selectedBlockedTimes = selectedDateStr ? (blockedData.blockedTimes?.[selectedDateStr] || []) : [];

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 400, margin: 0 }}>Appointment Calendar</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            {thisMonthTrips.length} appointment{thisMonthTrips.length !== 1 ? "s" : ""} this month
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <FHJButton variant="ghost" onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Today</FHJButton>
          <FHJButton variant="ghost" onClick={() => window.location.href = "/admin/availability"} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>Manage Blocks</FHJButton>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedDay ? "1fr 340px" : "1fr", gap: "1.5rem" }}>
        {/* Calendar Grid */}
        <FHJCard style={{ padding: "1.5rem" }}>
          {/* Month Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <button onClick={prevMonth} style={navBtn}>‹</button>
            <span style={{ color: "white", fontSize: "1.2rem", fontWeight: 600 }}>{monthName}</span>
            <button onClick={nextMonth} style={navBtn}>›</button>
          </div>

          {/* Day Headers */}
          <div style={calGrid}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
              <div key={d} style={{ textAlign: "center", color: "#64748b", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1px", padding: "8px 0" }}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div style={calGrid}>
            {days.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const apts = getAptsForDate(dateStr);
              const blocked = isBlocked(dateStr);
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
                    minHeight: "55px", position: "relative",
                    transition: "all 0.15s",
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
                        <div key={idx} style={{
                          width: "5px", height: "5px", borderRadius: "50%",
                          background: "#3b82f6",
                        }} />
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

        {/* Side Panel - Day Detail */}
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
                    <span style={{ color: "#f87171", fontSize: "0.8rem", fontWeight: 600 }}>🔴 Blocked: {getBlockReason(selectedDateStr) || "All Day"}</span>
                  </div>
                )}

                {/* Blocked times */}
                {selectedBlockedTimes.length > 0 && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <p style={{ color: "#f59e0b", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Blocked Times
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {selectedBlockedTimes.map((bt, i) => {
                        const t = typeof bt === "string" ? bt : bt.time;
                        const reason = typeof bt === "string" ? "" : bt.reason;
                        return (
                          <span key={i} style={{
                            padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem",
                            background: reason === "Booked" ? "rgba(59,130,246,0.15)" : "rgba(248,113,113,0.1)",
                            color: reason === "Booked" ? "#3b82f6" : "#f87171",
                            border: `1px solid ${reason === "Booked" ? "rgba(59,130,246,0.2)" : "rgba(248,113,113,0.2)"}`,
                          }}>{t} {reason && reason !== "Booked" ? `(${reason})` : ""}</span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Appointments */}
                {selectedApts.length === 0 && !selectedBlocked ? (
                  <div style={{ textAlign: "center", padding: "1.5rem 0", color: "#64748b" }}>
                    <p style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>📅</p>
                    <p style={{ fontSize: "0.85rem" }}>No appointments</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {selectedApts
                      .sort((a, b) => {
                        const tA = getTripTime(a) || "";
                        const tB = getTripTime(b) || "";
                        return tA.localeCompare(tB);
                      })
                      .map((trip, idx) => {
                        const clientName = getClientName(trip);
                        const time = getTripTime(trip);
                        const dest = trip.Destination || trip.destination || "";
                        const status = trip.Status || trip.status || "";
                        const tripType = trip["Trip Type"] || trip.tripType || "";
                        const email = trip["client_email"] || trip["Client_email"] || trip.clientEmail || "";
                        const phone = trip.Phone || trip.phone || "";

                        return (
                          <div key={trip.id || idx} style={{
                            padding: "0.75rem", borderRadius: "10px",
                            background: "rgba(59,130,246,0.06)",
                            border: "1px solid rgba(59,130,246,0.15)",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                              <div>
                                <p style={{ color: "white", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>{clientName}</p>
                                {time && <p style={{ color: "#3b82f6", fontSize: "0.8rem", margin: "0.2rem 0 0", fontWeight: 600 }}>🕐 {time}</p>}
                              </div>
                              {status && (
                                <span style={{
                                  padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.6rem",
                                  background: status.includes("New") ? "rgba(0,196,140,0.15)" : "rgba(255,255,255,0.06)",
                                  color: status.includes("New") ? fhjTheme.primary : "#94a3b8",
                                  fontWeight: 600,
                                }}>{status.replace("🆕 ", "")}</span>
                              )}
                            </div>

                            {dest && dest !== "TBD — Consultation Requested" && (
                              <p style={{ color: "#94a3b8", fontSize: "0.78rem", margin: "0.3rem 0 0" }}>📍 {dest}</p>
                            )}
                            {tripType && <p style={{ color: "#64748b", fontSize: "0.72rem", margin: "0.2rem 0 0" }}>{tripType}</p>}
                            {email && <p style={{ color: "#475569", fontSize: "0.7rem", margin: "0.15rem 0 0" }}>{email}</p>}
                            {phone && <p style={{ color: "#475569", fontSize: "0.7rem", margin: "0.1rem 0 0" }}>{phone}</p>}
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

      {/* Upcoming appointments list */}
      <FHJCard style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 500, marginTop: 0, marginBottom: "1rem" }}>
          Upcoming Appointments
        </h3>
        {(() => {
          const todayStrLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          const upcoming = trips
            .filter(t => {
              const d = t.consultationDate || t.startDate || t["Start Date"] || t["Consultation Date"] || "";
              return d >= todayStrLocal;
            })
            .sort((a, b) => {
              const dA = a.consultationDate || a.startDate || a["Start Date"] || a["Consultation Date"] || "";
              const dB = b.consultationDate || b.startDate || b["Start Date"] || b["Consultation Date"] || "";
              return dA.localeCompare(dB);
            })
            .slice(0, 10);

          if (upcoming.length === 0) {
            return <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>No upcoming appointments.</p>;
          }

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {upcoming.map((trip, idx) => {
                const d = trip.consultationDate || trip.startDate || trip["Start Date"] || trip["Consultation Date"] || "";
                const time = getTripTime(trip);
                const name = getClientName(trip);
                const dest = trip.destination || trip.Destination || "";

                return (
                  <div key={trip.id || idx} style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    padding: "0.6rem 0.8rem", borderRadius: "8px",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div style={{ minWidth: "80px" }}>
                      <p style={{ color: fhjTheme.primary, fontSize: "0.78rem", fontWeight: 600, margin: 0 }}>{d}</p>
                      {time && <p style={{ color: "#3b82f6", fontSize: "0.7rem", margin: "0.1rem 0 0" }}>{time}</p>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "white", fontSize: "0.85rem", fontWeight: 500, margin: 0 }}>{name}</p>
                      {dest && dest !== "TBD — Consultation Requested" && (
                        <p style={{ color: "#64748b", fontSize: "0.73rem", margin: "0.1rem 0 0" }}>{dest}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </FHJCard>
    </div>
  );
}

const navBtn = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  width: "32px", height: "32px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "1.1rem",
  display: "flex", alignItems: "center", justifyContent: "center",
};

const calGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "4px",
};