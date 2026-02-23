// ==========================================================
// FILE: AppointmentPage.jsx — Single-Page Booking Form
// Location: src/pages/AppointmentPage.jsx
// Route: /appointment
// ==========================================================

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";
import {
  fhjTheme,
  FHJCard,
  FHJButton,
  FHJInput,
} from "../components/FHJ/FHJUIKit.jsx";

const PRIMARY = fhjTheme.primary;

// Generate time slots: 4:30 PM – 10:30 PM every 30 minutes
function generateTimeSlots() {
  const slots = [];
  // Start at 16:30, end at 22:30, step 30 min
  for (let totalMin = 16 * 60 + 30; totalMin <= 22 * 60 + 30; totalMin += 30) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const hour12 = h > 12 ? h - 12 : h;
    const ampm = h >= 12 ? "PM" : "AM";
    const minStr = m === 0 ? "00" : String(m);
    slots.push(`${hour12}:${minStr} ${ampm}`);
  }
  return slots;
}

function formatDateReadable(date) {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const TIME_SLOTS = generateTimeSlots();

function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function MiniCalendar({ selectedDate, onSelectDate }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ userSelect: "none" }}>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={prevMonth} style={S.calNav}>‹</button>
        <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={S.calNav}>›</button>
      </div>
      {/* Day headers */}
      <div style={S.calGrid}>
        {DAYS.map(d => (
          <div key={d} style={S.calDayHeader}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const date = new Date(viewYear, viewMonth, day);
          date.setHours(0, 0, 0, 0);
          const isPast = date < today;
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => onSelectDate(date)}
              style={{
                ...S.calDay,
                ...(isPast ? S.calDayPast : {}),
                ...(isToday && !isSelected ? S.calDayToday : {}),
                ...(isSelected ? S.calDaySelected : {}),
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AppointmentPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/appointment-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          date: toYMD(selectedDate),
          time: selectedTime,
          notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Booking failed. Please try again.");
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FHJBackground page="appointment">
      <div style={S.accentTop} />
      <div style={S.page}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={S.logoWrap}
        >
          <img
            src="/fhj_logo.png"
            alt="FHJ Dream Destinations"
            style={S.logo}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={S.heading}
        >
          Book an Appointment
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={S.subheading}
        >
          Choose a date, time, and share your details.
        </motion.p>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <FHJCard style={S.card}>
              <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
                <h2 style={{ color: PRIMARY, marginBottom: "0.5rem", fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Appointment Booked!
                </h2>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem" }}>
                  Thank you, <strong style={{ color: "#fff" }}>{name}</strong>. We'll reach out to confirm your appointment on{" "}
                  <strong style={{ color: PRIMARY }}>{formatDateReadable(selectedDate)}</strong> at{" "}
                  <strong style={{ color: PRIMARY }}>{selectedTime}</strong>.
                </p>
              </div>
            </FHJCard>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ width: "100%" }}
          >
            <FHJCard style={S.card}>
              <form onSubmit={handleSubmit}>
                {/* Step 1: Date */}
                <h3 style={S.sectionLabel}>Select a Date</h3>
                <MiniCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

                {/* Step 2: Time */}
                <h3 style={{ ...S.sectionLabel, marginTop: "1.5rem" }}>Select a Time</h3>
                <div style={S.timeGrid}>
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      style={{
                        ...S.timePill,
                        ...(selectedTime === slot ? S.timePillSelected : {}),
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                {/* Step 3: Details */}
                <h3 style={{ ...S.sectionLabel, marginTop: "1.5rem" }}>Your Details</h3>
                <div style={S.fieldStack}>
                  <FHJInput
                    type="text"
                    placeholder="Full Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <FHJInput
                    type="email"
                    placeholder="Email Address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <FHJInput
                    type="tel"
                    placeholder="Phone (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <textarea
                    placeholder="Tell us what you have in mind..."
                    aria-label="Description / Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    style={S.textarea}
                  />
                </div>

                {error && (
                  <div style={S.errorMsg}>{error}</div>
                )}

                <FHJButton
                  type="submit"
                  fullWidth
                  size="lg"
                  style={{ marginTop: "1.5rem" }}
                  disabled={loading}
                >
                  {loading ? "Booking…" : "Book Appointment"}
                </FHJButton>
              </form>
            </FHJCard>
          </motion.div>
        )}

        <div style={S.footer}>
          <p style={S.footerText}>FHJ Dream Destinations</p>
          <p style={S.footerSub}>Creating unforgettable travel experiences</p>
        </div>
      </div>
    </FHJBackground>
  );
}

const S = {
  accentTop: {
    position: "fixed", top: 0, left: 0, right: 0, height: "3px", zIndex: 10,
    background: `linear-gradient(90deg, transparent, ${PRIMARY}, transparent)`,
  },
  page: {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "2rem 1.25rem 3rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    fontFamily: "'Montserrat', sans-serif",
  },
  logoWrap: { marginBottom: "1.25rem", marginTop: "1.5rem" },
  logo: {
    height: "80px",
    filter: "drop-shadow(0 0 15px rgba(0,0,0,0.5))",
    mixBlendMode: "screen",
  },
  heading: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "2.1rem", fontWeight: 700, color: "#fff",
    textAlign: "center", margin: "0 0 0.4rem",
    textShadow: "0 2px 15px rgba(0,0,0,0.4)",
  },
  subheading: {
    color: "rgba(255,255,255,0.5)", fontSize: "0.95rem",
    textAlign: "center", marginBottom: "1.5rem",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    padding: "1.75rem",
  },
  sectionLabel: {
    color: PRIMARY,
    fontSize: "0.8rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "0.75rem",
    marginTop: 0,
  },
  // Calendar styles
  calGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
  },
  calNav: {
    background: "transparent",
    border: `1px solid rgba(255,255,255,0.2)`,
    color: "#fff",
    borderRadius: "8px",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    fontSize: "1.1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  calDayHeader: {
    textAlign: "center",
    fontSize: "0.7rem",
    color: "rgba(255,255,255,0.4)",
    padding: "4px 0",
    fontWeight: 600,
  },
  calDay: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid transparent",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.85)",
    fontSize: "0.8rem",
    padding: "6px 0",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s",
  },
  calDayPast: {
    color: "rgba(255,255,255,0.2)",
    cursor: "not-allowed",
    background: "transparent",
  },
  calDayToday: {
    border: `1px solid ${PRIMARY}`,
    color: PRIMARY,
  },
  calDaySelected: {
    background: PRIMARY,
    color: "#0f172a",
    fontWeight: 700,
    border: `1px solid ${PRIMARY}`,
  },
  // Time slots
  timeGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  timePill: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "999px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.8rem",
    padding: "6px 14px",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  timePillSelected: {
    background: PRIMARY,
    border: `1px solid ${PRIMARY}`,
    color: "#0f172a",
    fontWeight: 700,
  },
  // Form fields
  fieldStack: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  textarea: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#e5e7eb",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "'Montserrat', sans-serif",
    transition: "border 0.2s ease",
  },
  errorMsg: {
    marginTop: "1rem",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "rgba(248,113,113,0.15)",
    border: "1px solid rgba(248,113,113,0.4)",
    color: "#f87171",
    fontSize: "0.88rem",
  },
  footer: {
    marginTop: "auto",
    paddingTop: "2.5rem",
    textAlign: "center",
  },
  footerText: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "0.9rem", fontWeight: 600, color: PRIMARY,
    letterSpacing: "0.04em", marginBottom: "0.2rem",
  },
  footerSub: {
    color: "rgba(255,255,255,0.25)", fontSize: "0.65rem",
    letterSpacing: "0.1em", textTransform: "uppercase",
  },
};