// ==========================================================
// FILE: Appointments.jsx — Booking Flow
// Location: src/pages/Appointments.jsx
//
// Two modes:
//   No reason (New Client) → Full intake form
//   ?reason=appointment    → Simple form (name, email, phone, description)
//
// Both flows: Date → Time → Details → Review → Confirm
// Uses FHJBackground with "appointment" page key
// ==========================================================

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";

const TRIP_TYPES = [
  { value: "Individual", icon: "🧳" },
  { value: "Group", icon: "👥" },
  { value: "Wedding", icon: "💍" },
  { value: "Cruise", icon: "🚢" },
  { value: "Hotel", icon: "🏨" },
  { value: "Flight", icon: "✈️" },
  { value: "Event", icon: "🎉" },
];

const OCCASIONS = [
  "Vacation", "Honeymoon", "Wedding", "Birthday", "Anniversary",
  "Business", "Reunion", "General",
];

// Generate time slots based on day of week
// Mon-Fri: 4:30 PM - 10:00 PM
// Sat-Sun: 6:00 AM - 10:00 PM
function generateTimeSlots(dateStr) {
  const slots = [];
  if (!dateStr) return slots;

  const d = new Date(dateStr + "T12:00:00");
  const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const startHour = isWeekend ? 6 : 16;
  const startMin = isWeekend ? 0 : 30;

  for (let h = startHour; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === startHour && m < startMin) continue;
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? "AM" : "PM";
      const min = m === 0 ? "00" : "30";
      slots.push(`${hour12}:${min} ${ampm}`);
    }
  }
  return slots;
}

export default function Appointments() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || "";
  const isSimple = reason === "appointment";

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Calendar
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  // Blocking data
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState({});
  const [blockingLoaded, setBlockingLoaded] = useState(false);

  // Booking state
  const dealFromUrl = searchParams.get("deal") || "";
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Full intake form
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    destination: dealFromUrl,
    tripType: "Individual", occasion: "Vacation",
    groupSize: "1", flexibleDates: false, budget: "",
    vacationStart: "", vacationEnd: "", notes: "",
  });

  // Simple form
  const [simpleForm, setSimpleForm] = useState({
    name: "", email: "", phone: "", description: "",
  });

  // Fetch blocked slots
  useEffect(() => {
    async function loadBlocked() {
      try {
        const res = await fetch("/.netlify/functions/get-blocked-slots");
        const data = await res.json();
        setBlockedDates(data.blockedDates || []);
        setBlockedTimes(data.blockedTimes || {});
      } catch (err) {
        console.warn("Could not load blocked slots:", err);
      } finally {
        setBlockingLoaded(true);
      }
    }
    loadBlocked();
  }, []);

  useEffect(() => {
    if (dealFromUrl && dealFromUrl !== form.destination) {
      setForm((f) => ({ ...f, destination: dealFromUrl }));
    }
  }, [dealFromUrl]);

  const updateForm = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const updateSimple = (key, val) => setSimpleForm((f) => ({ ...f, [key]: val }));

  const isDateBlocked = (dateStr) => blockedDates.some((bd) => bd.date === dateStr);

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    const allSlots = generateTimeSlots(selectedDate);
    const blocked = blockedTimes[selectedDate];
    if (!blocked || blocked.length === 0) return allSlots;
    const blockedSet = new Set(blocked.map((b) => (typeof b === "string" ? b : b.time)));
    return allSlots.filter((slot) => !blockedSet.has(slot));
  };

  useEffect(() => {
    if (selectedTime) {
      const available = getAvailableTimeSlots();
      if (!available.includes(selectedTime)) setSelectedTime(null);
    }
  }, [selectedDate]);

  const canProceed = () => {
    if (step === 0) return !!selectedDate;
    if (step === 1) return !!selectedTime;
    if (step === 2) {
      if (isSimple) return simpleForm.name.trim() && simpleForm.email.trim();
      return form.name.trim() && form.email.trim();
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = isSimple
        ? {
            name: simpleForm.name.trim(),
            email: simpleForm.email.trim(),
            phone: simpleForm.phone.trim(),
            notes: simpleForm.description.trim(),
            date: selectedDate,
            time: selectedTime,
            reason: "appointment",
          }
        : {
            ...form,
            date: selectedDate,
            time: selectedTime,
            reason: "new-trip",
          };

      const res = await fetch("/.netlify/functions/appointment-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfirmed(true);
        toast.success("Booking submitted!");
      } else {
        toast.error(data.error || "Something went wrong.");
      }
    } catch (err) {
      toast.error("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const dateDisplay = selectedDate
    ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      })
    : "";

  const availableSlots = getAvailableTimeSlots();
  const allSlotsForDate = selectedDate ? generateTimeSlots(selectedDate) : [];
  const blockedTimeCount = allSlotsForDate.length - availableSlots.length;

  // Page text
  const pageTitle = isSimple ? "Make an Appointment" : (dealFromUrl ? `Book: ${dealFromUrl}` : "Plan Your Trip");
  const pageSubtitle = isSimple
    ? "Pick a date and time, and tell us how we can help."
    : "Pick a consultation date, tell us your vision, and we'll handle the rest.";

  return (
    <FHJBackground page="appointment">
      <div style={overlay}>
        <div style={container}>

          {/* HEADER */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <p style={eyebrow}>{isSimple ? "SCHEDULE YOUR VISIT" : "START YOUR JOURNEY"}</p>
            <h1 style={heading}>{pageTitle}</h1>
            <p style={subtitle}>{pageSubtitle}</p>
          </motion.div>

          {/* PROGRESS STEPS */}
          {!confirmed && (
            <div style={progressBar}>
              {["Date", "Time", "Details", "Review"].map((label, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700,
                    background: i <= step ? fhjTheme.primary : "rgba(255,255,255,0.08)",
                    color: i <= step ? "#000" : "#64748b", transition: "all 0.3s",
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span style={{ color: i <= step ? "white" : "#64748b", fontSize: "0.8rem", fontWeight: 500 }}>{label}</span>
                  {i < 3 && <div style={{ width: "30px", height: "1px", background: i < step ? fhjTheme.primary : "rgba(255,255,255,0.1)", margin: "0 0.25rem" }} />}
                </div>
              ))}
            </div>
          )}

          {/* STEP CONTENT */}
          <AnimatePresence mode="wait">
            {confirmed ? (
              <ConfirmationScreen
                date={dateDisplay}
                time={selectedTime}
                name={isSimple ? simpleForm.name : form.name}
                isSimple={isSimple}
              />
            ) : (
              <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>

                {/* STEP 0: DATE */}
                {step === 0 && (
                  <FHJCard style={cardStyle}>
                    <h2 style={stepTitle}>When would you like to meet?</h2>
                    <CalendarPicker
                      month={calMonth} year={calYear}
                      selectedDate={selectedDate}
                      blockedDates={blockedDates}
                      onSelect={(d) => { if (!isDateBlocked(d)) setSelectedDate(d); }}
                      onPrev={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
                      onNext={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
                    />
                    {selectedDate && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: fhjTheme.primary, textAlign: "center", marginTop: "1.25rem", fontSize: "0.95rem", fontWeight: 500 }}>
                        Selected: {dateDisplay}
                      </motion.p>
                    )}
                  </FHJCard>
                )}

                {/* STEP 1: TIME */}
                {step === 1 && (
                  <FHJCard style={{ ...cardStyle, maxWidth: "600px" }}>
                    <h2 style={stepTitle}>Pick a Time</h2>
                    <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: "0.5rem", fontSize: "0.9rem" }}>{dateDisplay}</p>
                    {(() => {
                      const d = new Date(selectedDate + "T12:00:00");
                      const isWknd = d.getDay() === 0 || d.getDay() === 6;
                      return (
                        <p style={{ color: fhjTheme.primary, textAlign: "center", marginBottom: "0.75rem", fontSize: "0.75rem", fontWeight: 500 }}>
                          {isWknd ? "Weekend Hours: 6:00 AM – 10:00 PM" : "Weekday Hours: 4:30 PM – 10:00 PM"}
                        </p>
                      );
                    })()}
                    {blockedTimeCount > 0 && (
                      <p style={{ color: "#f59e0b", textAlign: "center", marginBottom: "1rem", fontSize: "0.75rem" }}>
                        {blockedTimeCount} time slot{blockedTimeCount > 1 ? "s" : ""} unavailable for this date
                      </p>
                    )}
                    {availableSlots.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "2rem", color: "#f87171" }}>
                        <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No available times on this date.</p>
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Please go back and choose another date.</p>
                      </div>
                    ) : (
                      <div style={timeGrid}>
                        {availableSlots.map((slot) => (
                          <motion.button
                            key={slot}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedTime(slot)}
                            style={{
                              ...timeSlotBtn,
                              background: selectedTime === slot ? fhjTheme.primary : "rgba(255,255,255,0.05)",
                              color: selectedTime === slot ? "#000" : "rgba(255,255,255,0.8)",
                              borderColor: selectedTime === slot ? fhjTheme.primary : "rgba(255,255,255,0.1)",
                              fontWeight: selectedTime === slot ? 700 : 400,
                            }}
                          >
                            {slot}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </FHJCard>
                )}

                {/* STEP 2: DETAILS */}
                {step === 2 && isSimple && (
                  <FHJCard style={{ ...cardStyle, maxWidth: "550px" }}>
                    <h2 style={stepTitle}>Your Information</h2>
                    <div style={{ marginBottom: "1.25rem" }}>
                      <label style={labelStyle}>Full Name *</label>
                      <FHJInput value={simpleForm.name} onChange={(e) => updateSimple("name", e.target.value)} placeholder="Your name" required />
                    </div>
                    <div style={{ marginBottom: "1.25rem" }}>
                      <label style={labelStyle}>Email *</label>
                      <FHJInput type="email" value={simpleForm.email} onChange={(e) => updateSimple("email", e.target.value)} placeholder="you@email.com" required />
                    </div>
                    <div style={{ marginBottom: "1.25rem" }}>
                      <label style={labelStyle}>Phone</label>
                      <FHJInput value={simpleForm.phone} onChange={(e) => updateSimple("phone", e.target.value)} placeholder="(555) 123-4567" />
                    </div>
                    <div>
                      <label style={labelStyle}>Description</label>
                      <textarea
                        value={simpleForm.description}
                        onChange={(e) => updateSimple("description", e.target.value)}
                        placeholder="What would you like to discuss? Any details that help us prepare..."
                        rows={4}
                        style={textareaStyle}
                      />
                    </div>
                  </FHJCard>
                )}

                {step === 2 && !isSimple && (
                  <FHJCard style={{ ...cardStyle, maxWidth: "700px" }}>
                    <h2 style={stepTitle}>Tell Us About Your Trip</h2>
                    <div style={formRow}>
                      <div style={formCol}>
                        <label style={labelStyle}>Full Name *</label>
                        <FHJInput value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Your name" required />
                      </div>
                      <div style={formCol}>
                        <label style={labelStyle}>Email *</label>
                        <FHJInput type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="you@email.com" required />
                      </div>
                    </div>
                    <div style={formRow}>
                      <div style={formCol}>
                        <label style={labelStyle}>Phone</label>
                        <FHJInput value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="(555) 123-4567" />
                      </div>
                      <div style={formCol}>
                        <label style={labelStyle}>Dream Destination</label>
                        <FHJInput value={form.destination} onChange={(e) => updateForm("destination", e.target.value)} placeholder="Paris, Maldives, Caribbean..."
                          style={dealFromUrl ? { borderColor: "rgba(0,196,140,0.4)" } : {}} />
                        {dealFromUrl && <span style={{ color: "#00c48c", fontSize: "0.72rem", marginTop: "4px", display: "block" }}>Pre-filled from deal selection</span>}
                      </div>
                    </div>
                    <div style={{ marginBottom: "1.25rem" }}>
                      <label style={labelStyle}>Trip Type</label>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {TRIP_TYPES.map((t) => (
                          <button key={t.value} onClick={() => updateForm("tripType", t.value)} style={{
                            ...chipBtn,
                            background: form.tripType === t.value ? "rgba(0,196,140,0.15)" : "rgba(255,255,255,0.04)",
                            borderColor: form.tripType === t.value ? fhjTheme.primary : "rgba(255,255,255,0.1)",
                            color: form.tripType === t.value ? fhjTheme.primary : "rgba(255,255,255,0.7)",
                          }}>{t.icon} {t.value}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: "1.25rem" }}>
                      <label style={labelStyle}>Occasion</label>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {OCCASIONS.map((o) => (
                          <button key={o} onClick={() => updateForm("occasion", o)} style={{
                            ...chipBtn, padding: "0.35rem 0.85rem", fontSize: "0.8rem",
                            background: form.occasion === o ? "rgba(0,196,140,0.15)" : "rgba(255,255,255,0.04)",
                            borderColor: form.occasion === o ? fhjTheme.primary : "rgba(255,255,255,0.1)",
                            color: form.occasion === o ? fhjTheme.primary : "rgba(255,255,255,0.6)",
                          }}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div style={formRow}>
                      <div style={formCol}>
                        <label style={labelStyle}>Group Size</label>
                        <FHJInput type="number" min="1" value={form.groupSize} onChange={(e) => updateForm("groupSize", e.target.value)} />
                      </div>
                      <div style={formCol}>
                        <label style={labelStyle}>Budget Range</label>
                        <select value={form.budget} onChange={(e) => updateForm("budget", e.target.value)} style={selectStyle}>
                          <option value="">Select budget...</option>
                          <option value="Under $1,000">Under $1,000</option>
                          <option value="$1,000 - $3,000">$1,000 - $3,000</option>
                          <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                          <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                          <option value="$10,000+">$10,000+</option>
                          <option value="Flexible">Flexible</option>
                        </select>
                      </div>
                    </div>
                    <div style={formRow}>
                      <div style={formCol}>
                        <label style={labelStyle}>Vacation Start Date</label>
                        <FHJInput type="date" value={form.vacationStart} onChange={(e) => updateForm("vacationStart", e.target.value)} />
                        <span style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "4px", display: "block" }}>When do you want to leave?</span>
                      </div>
                      <div style={formCol}>
                        <label style={labelStyle}>Vacation End Date</label>
                        <FHJInput type="date" value={form.vacationEnd} min={form.vacationStart || undefined} onChange={(e) => updateForm("vacationEnd", e.target.value)} />
                        <span style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "4px", display: "block" }}>When do you want to return?</span>
                      </div>
                    </div>
                    <div style={{ marginBottom: "1.25rem" }}>
                      <label onClick={() => updateForm("flexibleDates", !form.flexibleDates)} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                        <div style={{ width: "40px", height: "22px", borderRadius: "11px", background: form.flexibleDates ? fhjTheme.primary : "rgba(255,255,255,0.15)", position: "relative", transition: "background 0.2s" }}>
                          <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "white", position: "absolute", top: "2px", left: form.flexibleDates ? "20px" : "2px", transition: "left 0.2s" }} />
                        </div>
                        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>My dates are flexible</span>
                      </label>
                    </div>
                    <div>
                      <label style={labelStyle}>Additional Notes</label>
                      <textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)}
                        placeholder="Tell us about your dream trip, special requests, or questions..." rows={3} style={textareaStyle} />
                    </div>
                  </FHJCard>
                )}

                {/* STEP 3: REVIEW */}
                {step === 3 && (
                  <FHJCard style={{ ...cardStyle, maxWidth: "600px" }}>
                    <h2 style={stepTitle}>Review & Confirm</h2>
                    <div style={reviewSection}>
                      <ReviewRow label="Appointment Date" value={dateDisplay} />
                      <ReviewRow label="Time" value={selectedTime} />

                      {isSimple ? (
                        <>
                          <ReviewRow label="Name" value={simpleForm.name} />
                          <ReviewRow label="Email" value={simpleForm.email} />
                          {simpleForm.phone && <ReviewRow label="Phone" value={simpleForm.phone} />}
                          {simpleForm.description && <ReviewRow label="Description" value={simpleForm.description} />}
                        </>
                      ) : (
                        <>
                          <ReviewRow label="Name" value={form.name} />
                          <ReviewRow label="Email" value={form.email} />
                          {form.phone && <ReviewRow label="Phone" value={form.phone} />}
                          {form.destination && <ReviewRow label="Destination" value={form.destination} />}
                          <ReviewRow label="Trip Type" value={form.tripType} />
                          <ReviewRow label="Occasion" value={form.occasion} />
                          <ReviewRow label="Group Size" value={form.groupSize} />
                          {form.budget && <ReviewRow label="Budget" value={form.budget} />}
                          {(form.vacationStart || form.vacationEnd) && <ReviewRow label="Vacation Dates" value={
                            [
                              form.vacationStart ? new Date(form.vacationStart + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
                              form.vacationEnd ? new Date(form.vacationEnd + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
                            ].filter(Boolean).join(" — ")
                          } />}
                          {form.flexibleDates && <ReviewRow label="Flexible Dates" value="Yes" />}
                          {form.notes && <ReviewRow label="Notes" value={form.notes} />}
                        </>
                      )}
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: "0.8rem", textAlign: "center", marginTop: "1.5rem" }}>
                      We'll confirm your appointment via email within 24 hours.
                    </p>
                  </FHJCard>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* NAV BUTTONS */}
          {!confirmed && (
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
              {step > 0 && <FHJButton variant="ghost" onClick={() => setStep(step - 1)} style={{ padding: "0.75rem 2rem" }}>Back</FHJButton>}
              {step < 3 ? (
                <FHJButton onClick={() => setStep(step + 1)} disabled={!canProceed()} style={{ padding: "0.75rem 2.5rem", opacity: canProceed() ? 1 : 0.4 }}>Continue</FHJButton>
              ) : (
                <FHJButton onClick={handleSubmit} disabled={submitting} style={{ padding: "0.75rem 3rem", fontSize: "1rem" }}>
                  {submitting ? "Submitting..." : "Confirm Booking"}
                </FHJButton>
              )}
            </div>
          )}
        </div>
      </div>
    </FHJBackground>
  );
}

// =============================================================
// CALENDAR PICKER (with blocked dates)
// =============================================================
function CalendarPicker({ month, year, selectedDate, blockedDates, onSelect, onPrev, onNext }) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const blockedSet = new Set((blockedDates || []).map((b) => b.date));
  const getBlockReason = (dateStr) => {
    const b = (blockedDates || []).find((bd) => bd.date === dateStr);
    return b?.reason || "";
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <button onClick={onPrev} style={calBtn}>‹</button>
        <span style={{ color: "white", fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.5px" }}>{monthName}</span>
        <button onClick={onNext} style={calBtn}>›</button>
      </div>
      <div style={calendarGrid}>
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
          <div key={d} style={{ textAlign: "center", color: "#64748b", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1px", padding: "8px 0" }}>{d}</div>
        ))}
      </div>
      <div style={calendarGrid}>
        {days.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const isPast = new Date(dateStr) < new Date(todayStr);
          const isBlocked = blockedSet.has(dateStr);
          const blockReason = isBlocked ? getBlockReason(dateStr) : "";
          const disabled = isPast || isBlocked;

          return (
            <motion.div
              key={i}
              whileHover={!disabled ? { scale: 1.15 } : {}}
              whileTap={!disabled ? { scale: 0.9 } : {}}
              onClick={() => !disabled && onSelect(dateStr)}
              title={isBlocked ? `Blocked: ${blockReason}` : ""}
              style={{
                textAlign: "center", padding: "10px 4px", borderRadius: "10px",
                fontSize: "0.9rem", cursor: disabled ? "default" : "pointer",
                position: "relative",
                color: disabled ? "#334155" : isSelected ? "#000" : isToday ? fhjTheme.primary : "rgba(255,255,255,0.8)",
                background: isSelected ? fhjTheme.primary : isBlocked ? "rgba(248,113,113,0.08)" : isToday ? "rgba(0,196,140,0.1)" : "transparent",
                fontWeight: isToday || isSelected ? 700 : 400,
                transition: "all 0.15s",
                border: isToday && !isSelected ? `1px solid ${fhjTheme.primary}` : isBlocked ? "1px solid rgba(248,113,113,0.2)" : "1px solid transparent",
                textDecoration: isBlocked ? "line-through" : "none",
              }}
            >
              {day}
              {isBlocked && (
                <div style={{
                  position: "absolute", bottom: "2px", left: "50%", transform: "translateX(-50%)",
                  width: "4px", height: "4px", borderRadius: "50%", background: "#f87171",
                }} />
              )}
            </motion.div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", marginTop: "1rem", fontSize: "0.7rem", color: "#64748b" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: fhjTheme.primary, display: "inline-block" }} /> Today
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f87171", display: "inline-block" }} /> Blocked
        </span>
      </div>
    </div>
  );
}

// =============================================================
// CONFIRMATION + REVIEW ROW
// =============================================================
function ConfirmationScreen({ date, time, name, isSimple }) {
  const firstName = (name || "").split(" ")[0];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <FHJCard style={{ ...cardStyle, textAlign: "center", maxWidth: "520px" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>✅</motion.div>
        <h2 style={{ color: "white", fontSize: "1.6rem", fontWeight: 400, marginBottom: "0.75rem" }}>You're All Set{firstName ? `, ${firstName}` : ""}!</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          Your {isSimple ? "appointment" : "consultation"} is requested for<br />
          <strong style={{ color: fhjTheme.primary }}>{date}</strong> at <strong style={{ color: fhjTheme.primary }}>{time}</strong>
        </p>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>We'll send a confirmation email within 24 hours.</p>
        </div>
        <FHJButton onClick={() => window.location.href = "/appointment"} style={{ padding: "0.75rem 2.5rem" }}>Back to Appointments</FHJButton>
      </FHJCard>
    </motion.div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{label}</span>
      <span style={{ color: "white", fontSize: "0.85rem", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

// =============================================================
// STYLES
// =============================================================
const overlay = { position: "relative", zIndex: 2, minHeight: "100vh" };
const container = { maxWidth: "800px", margin: "0 auto", padding: "8rem 2rem 4rem" };
const eyebrow = { color: fhjTheme.primary, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "0.75rem" };
const heading = { color: "white", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 300, margin: "0 0 0.75rem" };
const subtitle = { color: "rgba(255,255,255,0.5)", fontSize: "1rem", maxWidth: "500px", margin: "0 auto" };
const progressBar = { display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2.5rem" };
const cardStyle = { padding: "2rem", maxWidth: "500px", margin: "0 auto" };
const stepTitle = { color: "white", fontSize: "1.3rem", fontWeight: 400, textAlign: "center", marginBottom: "1.5rem", marginTop: 0 };
const calendarGrid = { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" };
const calBtn = { background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer", padding: "4px 12px" };
const timeGrid = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem" };
const timeSlotBtn = { padding: "0.55rem 0.3rem", borderRadius: "8px", border: "1px solid", cursor: "pointer", fontSize: "0.8rem", transition: "all 0.15s" };
const formRow = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" };
const formCol = { display: "flex", flexDirection: "column" };
const labelStyle = { color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", marginBottom: "0.4rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" };
const chipBtn = { padding: "0.45rem 0.9rem", borderRadius: "999px", border: "1px solid", cursor: "pointer", fontSize: "0.82rem", transition: "all 0.15s", background: "none" };
const selectStyle = { padding: "0.65rem 0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: "0.9rem", outline: "none", width: "100%" };
const textareaStyle = { width: "100%", padding: "0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: "0.9rem", resize: "vertical", outline: "none", fontFamily: "inherit" };
const reviewSection = { background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "1rem 1.25rem" };

if (typeof document !== "undefined") {
  const id = "fhj-appt-responsive";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @media (max-width: 600px) {
        div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(3, 1fr) !important; }
      }
      select option { background: #1a1a1a; color: white; }
    `;
    document.head.appendChild(style);
  }
}