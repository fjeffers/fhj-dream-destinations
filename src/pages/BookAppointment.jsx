// ==========================================================
// FILE: BookAppointment.jsx — Public Shareable Booking Page
// Location: src/pages/BookAppointment.jsx
// Route: /book-appointment
// ==========================================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";

// ── Shared styles ────────────────────────────────────────
const PAGE_BG = { background: "linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 50%, #0a0f1e 100%)", minHeight: "100vh" };

const LABEL_STYLE = {
  color: fhjTheme.colors.textSecondary,
  fontSize: "0.85rem",
  fontWeight: 600,
  marginBottom: "6px",
  display: "block",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const SELECT_STYLE = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: fhjTheme.radii.md,
  background: fhjTheme.colors.glassLight,
  border: `1px solid ${fhjTheme.colors.glassBorder}`,
  color: fhjTheme.colors.textPrimary,
  fontSize: "1rem",
  outline: "none",
  boxSizing: "border-box",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
};

const TEXTAREA_STYLE = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: fhjTheme.radii.md,
  background: fhjTheme.colors.glassLight,
  border: `1px solid ${fhjTheme.colors.glassBorder}`,
  color: fhjTheme.colors.textPrimary,
  fontSize: "1rem",
  outline: "none",
  boxSizing: "border-box",
  resize: "vertical",
  minHeight: "100px",
  fontFamily: "inherit",
};

const FORM_ROW = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" };
const FIELD = { display: "flex", flexDirection: "column", gap: "6px" };

// ── Step Progress Indicator ───────────────────────────────
function StepIndicator({ step }) {
  const steps = ["Client Type", "Details", "Confirmed"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "2rem" }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === step;
        const done = num < step;
        return (
          <React.Fragment key={label}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: done ? fhjTheme.primary : active ? fhjTheme.gold : "rgba(255,255,255,0.1)",
                border: `2px solid ${done ? fhjTheme.primary : active ? fhjTheme.gold : "rgba(255,255,255,0.2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: done || active ? "#0f172a" : "#64748b",
                fontWeight: 700, fontSize: "0.9rem",
                transition: "all 0.3s ease",
              }}>
                {done ? "✓" : num}
              </div>
              <span style={{ color: active ? fhjTheme.gold : done ? fhjTheme.primary : "#64748b", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 60, height: 2, background: done ? fhjTheme.primary : "rgba(255,255,255,0.1)", margin: "0 8px 22px", transition: "all 0.3s ease" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Step 1: Client Type ───────────────────────────────────
function StepClientType({ onSelect }) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h2 style={{ color: fhjTheme.gold, fontSize: "1.8rem", fontWeight: 700, margin: 0, marginBottom: "0.5rem" }}>
          Welcome to FHJ Dream Destinations
        </h2>
        <p style={{ color: fhjTheme.colors.textSecondary, fontSize: "1rem" }}>
          Please let us know how we can best serve you today.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", maxWidth: 700, margin: "0 auto" }}>
        {/* New Client Card */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => onSelect("new")} style={{ cursor: "pointer" }}>
          <FHJCard style={{
            padding: "2rem",
            textAlign: "center",
            border: `1px solid ${fhjTheme.colors.glassBorder}`,
            cursor: "pointer",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
            <h3 style={{ color: fhjTheme.gold, fontSize: "1.3rem", fontWeight: 700, margin: 0, marginBottom: "0.5rem" }}>New Client</h3>
            <p style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.9rem", margin: 0 }}>
              First time booking with us? Let's get to know you and create something extraordinary.
            </p>
            <FHJButton variant="solid" style={{ marginTop: "1.5rem", width: "100%" }}>
              Book as New Client
            </FHJButton>
          </FHJCard>
        </motion.div>

        {/* Returning Client Card */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => onSelect("returning")} style={{ cursor: "pointer" }}>
          <FHJCard style={{
            padding: "2rem",
            textAlign: "center",
            border: `1px solid ${fhjTheme.colors.glassBorder}`,
            cursor: "pointer",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌟</div>
            <h3 style={{ color: fhjTheme.primary, fontSize: "1.3rem", fontWeight: 700, margin: 0, marginBottom: "0.5rem" }}>Returning Client</h3>
            <p style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.9rem", margin: 0 }}>
              Welcome back! Quick booking with your preferred time and reason.
            </p>
            <FHJButton variant="outline" style={{ marginTop: "1.5rem", width: "100%" }}>
              Book as Returning Client
            </FHJButton>
          </FHJCard>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Step 2 New Client Form ────────────────────────────────
function StepNewClient({ onSubmit, submitting }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    date: "", time: "", notes: "",
    destination: "", tripType: "Individual",
    budget: "", flexibleDates: false, groupSize: "",
    occasion: "General",
  });
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.date || !form.time || !form.notes) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    onSubmit({ ...form, reason: "new-trip", clientType: "new" });
  };

  return (
    <motion.div
      key="step2new"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ color: fhjTheme.gold, fontSize: "1.6rem", fontWeight: 700, margin: 0, marginBottom: "0.5rem" }}>
          ✨ New Client Booking
        </h2>
        <p style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.95rem" }}>Tell us about yourself and what you're dreaming of.</p>
      </div>

      <FHJCard style={{ maxWidth: 720, margin: "0 auto", padding: "2rem" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Row: Name + Email */}
            <div style={FORM_ROW}>
              <div style={FIELD}>
                <label style={LABEL_STYLE}>Full Name *</label>
                <FHJInput type="text" placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} required />
              </div>
              <div style={FIELD}>
                <label style={LABEL_STYLE}>Email *</label>
                <FHJInput type="email" placeholder="your@email.com" value={form.email} onChange={e => set("email", e.target.value)} required />
              </div>
            </div>

            {/* Row: Phone */}
            <div style={FIELD}>
              <label style={LABEL_STYLE}>Phone Number *</label>
              <FHJInput type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={e => set("phone", e.target.value)} required />
            </div>

            {/* Row: Date + Time */}
            <div style={FORM_ROW}>
              <div style={FIELD}>
                <label style={LABEL_STYLE}>Appointment Date *</label>
                <FHJInput type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
              </div>
              <div style={FIELD}>
                <label style={LABEL_STYLE}>Appointment Time *</label>
                <FHJInput type="time" value={form.time} onChange={e => set("time", e.target.value)} required />
              </div>
            </div>

            {/* Reason / Description */}
            <div style={FIELD}>
              <label style={LABEL_STYLE}>Reason / Description *</label>
              <textarea
                style={TEXTAREA_STYLE}
                placeholder="Tell us the reason for your appointment and what you're looking for..."
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
                required
              />
            </div>

            {/* Destination of interest */}
            <div style={FIELD}>
              <label style={LABEL_STYLE}>Destination of Interest (optional)</label>
              <FHJInput type="text" placeholder="e.g. Paris, Maldives, Caribbean…" value={form.destination} onChange={e => set("destination", e.target.value)} />
            </div>

            {/* Row: Trip Type + Occasion */}
            <div style={FORM_ROW}>
              <div style={FIELD}>
                <label style={LABEL_STYLE}>Trip Type</label>
                <select style={SELECT_STYLE} value={form.tripType} onChange={e => set("tripType", e.target.value)}>
                  <option value="Individual">Individual</option>
                  <option value="Couples">Couples</option>
                  <option value="Group">Group</option>
                  <option value="Family">Family</option>
                  <option value="Honeymoon">Honeymoon</option>
                </select>
              </div>
              <div style={FIELD}>
                <label style={LABEL_STYLE}>Occasion</label>
                <select style={SELECT_STYLE} value={form.occasion} onChange={e => set("occasion", e.target.value)}>
                  <option value="General">General</option>
                  <option value="Honeymoon">Honeymoon</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Graduation">Graduation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Row: Budget + Group Size */}
            <div style={FORM_ROW}>
              <div style={FIELD}>
                <label style={LABEL_STYLE}>Budget Range</label>
                <select style={SELECT_STYLE} value={form.budget} onChange={e => set("budget", e.target.value)}>
                  <option value="">Select a range…</option>
                  <option value="Under $2,000">Under $2,000</option>
                  <option value="$2,000 – $5,000">$2,000 – $5,000</option>
                  <option value="$5,000 – $10,000">$5,000 – $10,000</option>
                  <option value="$10,000 – $25,000">$10,000 – $25,000</option>
                  <option value="$25,000+">$25,000+</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
              <div style={FIELD}>
                <label style={LABEL_STYLE}>Group Size</label>
                <FHJInput type="number" min="1" placeholder="Number of travelers" value={form.groupSize} onChange={e => set("groupSize", e.target.value)} />
              </div>
            </div>

            {/* Flexible Dates Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                onClick={() => set("flexibleDates", !form.flexibleDates)}
                style={{
                  width: 48, height: 26, borderRadius: 13,
                  background: form.flexibleDates ? fhjTheme.primary : "rgba(255,255,255,0.12)",
                  border: `1px solid ${form.flexibleDates ? fhjTheme.primary : fhjTheme.colors.glassBorder}`,
                  cursor: "pointer", transition: "all 0.3s ease", position: "relative",
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", background: "white",
                  position: "absolute", top: 2,
                  left: form.flexibleDates ? 24 : 2,
                  transition: "left 0.3s ease",
                }} />
              </div>
              <label style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.9rem", cursor: "pointer" }} onClick={() => set("flexibleDates", !form.flexibleDates)}>
                My dates are flexible
              </label>
            </div>

            {error && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: fhjTheme.radii.md, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: "0.9rem" }}>
                {error}
              </div>
            )}

            <FHJButton type="submit" variant="solid" fullWidth size="lg" disabled={submitting} style={{ marginTop: "0.5rem" }}>
              {submitting ? "Booking…" : "Book My Appointment ✈️"}
            </FHJButton>
          </div>
        </form>
      </FHJCard>
    </motion.div>
  );
}

// ── Step 2 Returning Client Form ──────────────────────────
function StepReturningClient({ onSubmit, submitting }) {
  const [form, setForm] = useState({ name: "", email: "", date: "", time: "", notes: "" });
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.date || !form.time || !form.notes) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    onSubmit({ ...form, reason: "consultation", clientType: "returning" });
  };

  return (
    <motion.div
      key="step2ret"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ color: fhjTheme.primary, fontSize: "1.6rem", fontWeight: 700, margin: 0, marginBottom: "0.5rem" }}>
          🌟 Welcome Back!
        </h2>
        <p style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.95rem" }}>Quick booking — just pick your time and let us know how we can help.</p>
      </div>

      <FHJCard style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            <div style={FIELD}>
              <label style={LABEL_STYLE}>Full Name *</label>
              <FHJInput type="text" placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} required />
            </div>

            <div style={FIELD}>
              <label style={LABEL_STYLE}>Email *</label>
              <FHJInput type="email" placeholder="your@email.com" value={form.email} onChange={e => set("email", e.target.value)} required />
            </div>

            <div style={FORM_ROW}>
              <div style={FIELD}>
                <label style={LABEL_STYLE}>Appointment Date *</label>
                <FHJInput type="date" value={form.date} onChange={e => set("date", e.target.value)} required />
              </div>
              <div style={FIELD}>
                <label style={LABEL_STYLE}>Appointment Time *</label>
                <FHJInput type="time" value={form.time} onChange={e => set("time", e.target.value)} required />
              </div>
            </div>

            <div style={FIELD}>
              <label style={LABEL_STYLE}>Reason / Description *</label>
              <textarea
                style={TEXTAREA_STYLE}
                placeholder="Tell us the reason for your appointment…"
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: fhjTheme.radii.md, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", fontSize: "0.9rem" }}>
                {error}
              </div>
            )}

            <FHJButton type="submit" variant="solid" fullWidth size="lg" disabled={submitting} style={{ marginTop: "0.5rem" }}>
              {submitting ? "Booking…" : "Confirm Appointment ✈️"}
            </FHJButton>
          </div>
        </form>
      </FHJCard>
    </motion.div>
  );
}

// ── Step 3: Success Screen ────────────────────────────────
function StepSuccess({ booking, onReset }) {
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/.netlify/functions/get-deals");
        const json = await res.json();
        const all = json.deals || [];
        const featured = all.filter(d => d.featured || d["Featured"]);
        setDeals((featured.length > 0 ? featured : all).slice(0, 4));
      } catch (err) {
        console.error("Failed to load deals:", err);
      } finally {
        setDealsLoading(false);
      }
    })();
  }, []);

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      {/* Confirmation */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          style={{ fontSize: "4rem", marginBottom: "1rem" }}
        >
          🎉
        </motion.div>
        <h2 style={{ color: fhjTheme.primary, fontSize: "1.8rem", fontWeight: 700, margin: 0, marginBottom: "0.5rem" }}>
          Appointment Confirmed!
        </h2>
        <p style={{ color: fhjTheme.colors.textSecondary, fontSize: "1rem" }}>
          Thank you! We'll send a confirmation to your email. We look forward to creating your dream journey.
        </p>
      </div>

      {/* Appointment Summary Card */}
      <FHJCard style={{ maxWidth: 500, margin: "0 auto 3rem", padding: "1.5rem" }}>
        <h3 style={{ color: fhjTheme.gold, fontSize: "1rem", fontWeight: 700, marginTop: 0, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          📋 Appointment Summary
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {[
            ["Client", booking.name],
            ["Email", booking.email],
            ["Date", booking.date],
            ["Time", booking.time],
            ["Type", booking.clientType === "new" ? "New Client — New Trip" : "Returning Client — Consultation"],
            booking.destination && ["Destination", booking.destination],
          ].filter(Boolean).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.85rem", fontWeight: 600 }}>{k}</span>
              <span style={{ color: fhjTheme.colors.textPrimary, fontSize: "0.9rem", textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>
      </FHJCard>

      {/* Deals Upsell */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ color: fhjTheme.gold, fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          🌴 Browse Our Featured Deals
        </h3>
        <p style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.95rem" }}>
          Explore our handpicked luxury experiences while you wait for your appointment.
        </p>
      </div>

      {dealsLoading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: fhjTheme.colors.textSecondary }}>Loading deals…</div>
      ) : deals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: fhjTheme.colors.textSecondary }}>No featured deals available at the moment.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem", maxWidth: 900, margin: "0 auto 2rem" }}>
          {deals.map((deal) => {
            const id = deal.id;
            const name = deal.trip_name || deal["Trip Name"] || "Dream Destination";
            const price = deal.price || deal["Price"] || "";
            const img = deal.place_image_url || deal["Place Image URL"] || "";
            const location = deal.location || deal["Location"] || "";

            return (
              <FHJCard key={id} style={{ padding: 0, overflow: "hidden" }}>
                {img && (
                  <div style={{ height: 160, overflow: "hidden" }}>
                    <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ padding: "1rem" }}>
                  <h4 style={{ color: fhjTheme.gold, fontSize: "1rem", fontWeight: 700, margin: "0 0 0.3rem" }}>{name}</h4>
                  {location && <p style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.8rem", margin: "0 0 0.4rem" }}>📍 {location}</p>}
                  {price && <p style={{ color: fhjTheme.primary, fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem" }}>{price}</p>}
                  <Link to={`/deal/${id}`}>
                    <FHJButton variant="outline" size="sm" style={{ width: "100%" }}>View Deal →</FHJButton>
                  </Link>
                </div>
              </FHJCard>
            );
          })}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <FHJButton variant="ghost" onClick={onReset}>← Book Another Appointment</FHJButton>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function BookAppointment() {
  const [step, setStep] = useState(1);
  const [clientType, setClientType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);

  const handleClientSelect = (type) => {
    setClientType(type);
    setStep(2);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = {
        clientType: formData.clientType,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        notes: formData.notes || "",
        destination: formData.destination || "",
        tripType: formData.tripType || "Individual",
        occasion: formData.occasion || "General",
        groupSize: formData.groupSize || "",
        flexibleDates: formData.flexibleDates || false,
        budget: formData.budget || "",
      };

      const res = await fetch("/.netlify/functions/appointment-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Booking failed. Please try again.");
        return;
      }

      setBooking({ ...formData, tripId: json.tripId });
      setStep(3);
    } catch (err) {
      alert("Something went wrong. Please try again.");
      console.error("Booking error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setClientType(null);
    setBooking(null);
  };

  return (
    <div style={PAGE_BG}>
      {/* Brand Header */}
      <div style={{
        background: "rgba(10,15,30,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* Gold/Green gradient bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #D4AF37, #00c48c)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ color: fhjTheme.gold, fontWeight: 800, fontSize: "1.2rem", letterSpacing: "0.04em" }}>✈ FHJ Dream Destinations</span>
          </div>
          <span style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.8rem" }}>Luxury Travel Concierge</span>
        </div>
      </div>

      {/* Page Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem 4rem" }}>
        <StepIndicator step={step} />

        <AnimatePresence mode="wait">
          {step === 1 && <StepClientType key="s1" onSelect={handleClientSelect} />}
          {step === 2 && clientType === "new" && (
            <StepNewClient key="s2n" onSubmit={handleSubmit} submitting={submitting} />
          )}
          {step === 2 && clientType === "returning" && (
            <StepReturningClient key="s2r" onSubmit={handleSubmit} submitting={submitting} />
          )}
          {step === 3 && <StepSuccess key="s3" booking={booking} onReset={handleReset} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
