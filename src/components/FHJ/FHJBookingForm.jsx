// ==========================================================
// 📄 FILE: FHJBookingForm.jsx  (PHASE 2 — CONSOLIDATION)
// Replaces: IntakeForm.jsx, BookingIntake.jsx form section, GroupForm.jsx
// Location: src/components/FHJ/FHJBookingForm.jsx
//
// Usage:
//   <FHJBookingForm variant="full" />          — Full booking (replaces BookingIntake)
//   <FHJBookingForm variant="intake" />         — Intake form (replaces IntakeForm)
//   <FHJBookingForm variant="group" type="group" />  — Group trip
//   <FHJBookingForm variant="group" type="event" />  — Event planning
//
// Props:
//   variant    — "full" | "intake" | "group"
//   type       — "group" | "event" (only used with variant="group")
//   initialData — Pre-fill data (e.g. from a deal or URL param)
//   endpoint   — API endpoint to submit to
//   onSuccess  — Callback after successful submission
//   onError    — Callback on error
// ==========================================================

import React, { useState, useEffect } from "react";

// -------------------------------------------------------
// Default Values
// -------------------------------------------------------
const todayEST = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

const ENDPOINTS = {
  full: "/.netlify/functions/public-book-trip",
  intake: "/.netlify/functions/intake-submit",
  group: "/.netlify/functions/intake-submit",
};

// -------------------------------------------------------
// Field Configurations per Variant
// -------------------------------------------------------
const FIELD_CONFIGS = {
  full: [
    { name: "fullName", label: null, placeholder: "Full Name", type: "text", required: true },
    { name: "email", label: null, placeholder: "Email Address", type: "email", required: true },
    { name: "phone", label: null, placeholder: "Phone Number", type: "text" },
    { name: "address", label: null, placeholder: "Home City / Address", type: "text" },
    {
      name: "tripType", label: "Trip Type", type: "select",
      options: [
        { value: "Individual", label: "Individual / Couple" },
        { value: "Group", label: "Group Trip" },
        { value: "Wedding", label: "Destination Wedding" },
        { value: "Cruise", label: "Luxury Cruise" },
        { value: "Corporate", label: "Corporate" },
      ],
    },
    {
      name: "occasion", label: "Occasion", type: "select",
      options: [
        { value: "Vacation", label: "Vacation" },
        { value: "Honeymoon", label: "Honeymoon" },
        { value: "Anniversary", label: "Anniversary" },
        { value: "Birthday", label: "Birthday" },
        { value: "Just Because", label: "Just Because" },
      ],
    },
    { name: "destination", label: null, placeholder: "Preferred Destination", type: "text", required: true, fullWidth: true, highlight: true },
    { name: "startDate", label: "Start Date", type: "date", syncEnd: true },
    { name: "endDate", label: "End Date", type: "date", minFrom: "startDate" },
    { name: "groupSize", label: null, placeholder: "Travelers (Group Size)", type: "number", min: 1 },
    { name: "budget", label: null, placeholder: "Budget per Person", type: "text" },
    { name: "notes", label: null, placeholder: "Special requests...", type: "textarea", fullWidth: true },
    { name: "flexible", label: "My dates are flexible (+/- 3 days)", type: "checkbox", fullWidth: true },
  ],

  intake: [
    { name: "fullName", label: null, placeholder: "Full Name", type: "text", required: true },
    { name: "email", label: null, placeholder: "Email Address", type: "email", required: true },
    { name: "phone", label: null, placeholder: "Phone Number", type: "text" },
    { name: "address", label: null, placeholder: "Home City / Address", type: "text" },
    {
      name: "tripType", label: "Trip Type", type: "select",
      options: [
        { value: "Individual", label: "Individual / Couple" },
        { value: "Group", label: "Group Trip" },
        { value: "Wedding", label: "Destination Wedding" },
        { value: "Cruise", label: "Luxury Cruise" },
        { value: "Corporate", label: "Corporate / Event" },
      ],
    },
    {
      name: "occasion", label: "Occasion", type: "select",
      options: [
        { value: "Vacation", label: "Vacation" },
        { value: "Honeymoon", label: "Honeymoon" },
        { value: "Anniversary", label: "Anniversary" },
        { value: "Birthday", label: "Birthday" },
        { value: "Reunion", label: "Reunion" },
        { value: "Just Because", label: "Just Because" },
      ],
    },
    { name: "destination", label: null, placeholder: "Preferred Destination", type: "text", required: true, fullWidth: true, highlight: true },
    { name: "startDate", label: "Start Date", type: "date", syncEnd: true },
    { name: "endDate", label: "End Date", type: "date", minFrom: "startDate" },
    { name: "groupSize", label: null, placeholder: "Travelers (Group Size)", type: "number", min: 1 },
    { name: "budget", label: null, placeholder: "Estimated Budget per Person", type: "text" },
    { name: "notes", label: null, placeholder: "Any special requests? (Ocean view, dietary needs, flight class...)", type: "textarea", fullWidth: true },
    { name: "flexible", label: "My dates are flexible (+/- 3 days)", type: "checkbox", fullWidth: true },
  ],

  group: [
    { name: "fullName", label: null, placeholder: "Full Name", type: "text", required: true },
    { name: "email", label: null, placeholder: "Email", type: "email", required: true },
    {
      name: "occasion", label: null, type: "select",
      options: [
        { value: "Wedding", label: "Wedding" },
        { value: "Birthday", label: "Birthday" },
        { value: "Corporate", label: "Corporate" },
        { value: "Other", label: "Other" },
      ],
    },
    { name: "groupSize", label: null, placeholder: "Group Size", type: "number" },
    { name: "destination", label: null, placeholder: "Destination", type: "text", fullWidth: true },
    { name: "notes", label: null, placeholder: "Notes / Dates", type: "textarea", fullWidth: true },
  ],
};

// -------------------------------------------------------
// Build Initial Form State
// -------------------------------------------------------
function buildInitialState(variant, type, initialData) {
  const base = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    destination: "",
    startDate: todayEST(),
    endDate: todayEST(),
    tripType: variant === "group" ? (type === "group" ? "Group Trip" : "Event") : "Individual",
    flexible: false,
    groupSize: "1",
    occasion: "Vacation",
    budget: "",
    notes: "",
  };

  // Pre-fill from initialData
  if (initialData) {
    if (initialData.dealName) {
      base.destination = initialData.dealName;
      base.notes = `Interested in deal: ${initialData.dealName}`;
    }
    if (initialData.fields?.["Trip Name"]) {
      base.destination = initialData.fields["Trip Name"];
    }
    // Merge any direct overrides
    Object.keys(initialData).forEach((key) => {
      if (key in base && key !== "fields") {
        base[key] = initialData[key];
      }
    });
  }

  return base;
}

// -------------------------------------------------------
// Main Component
// -------------------------------------------------------
export default function FHJBookingForm({
  variant = "full",
  type = "group",
  initialData = null,
  endpoint = null,
  onSuccess = null,
  onError = null,
}) {
  const [form, setForm] = useState(() => buildInitialState(variant, type, initialData));
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | success | error

  // Sync destination when initialData changes
  useEffect(() => {
    if (initialData?.fields?.["Trip Name"]) {
      setForm((prev) => ({
        ...prev,
        destination: initialData.fields["Trip Name"],
      }));
    }
  }, [initialData]);

  const apiEndpoint = endpoint || ENDPOINTS[variant] || ENDPOINTS.full;
  const fields = FIELD_CONFIGS[variant] || FIELD_CONFIGS.full;

  // -------------------------------------------------------
  // Handlers
  // -------------------------------------------------------
  const handleChange = (name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };

      // Sync end date when start date changes
      const fieldConfig = fields.find((f) => f.name === name);
      if (fieldConfig?.syncEnd && name === "startDate") {
        next.endDate = value;
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        if (onSuccess) onSuccess(form);
      } else {
        const errorText = await res.text();
        console.error("Submission failed:", errorText);
        setStatus("error");
        if (onError) onError(errorText);
      }
    } catch (error) {
      console.error("Form error:", error);
      setStatus("error");
      if (onError) onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(buildInitialState(variant, type, initialData));
    setStatus("idle");
  };

  // -------------------------------------------------------
  // Success State
  // -------------------------------------------------------
  if (status === "success") {
    return (
      <div style={successCardStyle}>
        <h2 style={{ color: "#4ade80", fontSize: "2rem", marginBottom: "1rem", marginTop: 0 }}>
          {variant === "group" ? "Request Received!" : "Request Received!"}
        </h2>
        <p style={{ color: "white", marginBottom: "2rem" }}>
          Thank you, {form.fullName || "traveler"}. We'll be in touch shortly.
        </p>
        <button onClick={resetForm} style={btnStyle}>
          Submit Another Request
        </button>
      </div>
    );
  }

  // -------------------------------------------------------
  // Heading Text
  // -------------------------------------------------------
  const headingMap = {
    full: { main: "DESIGN YOUR", accent: "JOURNEY", sub: "Tell us your vision — we'll curate the experience." },
    intake: { main: "DESIGN YOUR", accent: "JOURNEY", sub: "Tell us your vision — we'll curate the experience." },
    group: {
      main: "PLAN A",
      accent: type === "group" ? "GROUP TRIP" : "EVENT",
      sub: null,
    },
  };
  const heading = headingMap[variant] || headingMap.full;

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <>
      <style>{`
        input:focus, textarea:focus, select:focus { border-color: #4ade80 !important; outline: none; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <form onSubmit={handleSubmit} style={formCardStyle}>
        {/* Header */}
        <div style={{ gridColumn: "1 / -1", textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "2.6rem", fontWeight: "900", color: "white", marginBottom: "10px", marginTop: 0 }}>
            {heading.main} <span style={{ color: "#4ade80" }}>{heading.accent}</span>
          </h2>
          {heading.sub && <p style={{ color: "#cbd5e1" }}>{heading.sub}</p>}
        </div>

        {/* Dynamic Fields */}
        {fields.map((field) => {
          const wrapperStyle = field.fullWidth ? { gridColumn: "1 / -1" } : {};

          // Checkbox
          if (field.type === "checkbox") {
            return (
              <label key={field.name} style={{ ...wrapperStyle, color: "#cbd5e1", display: "flex", gap: "10px", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={!!form[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  style={{ width: "20px", height: "20px", accentColor: "#4ade80" }}
                />
                {field.label}
              </label>
            );
          }

          // Select
          if (field.type === "select") {
            return (
              <div key={field.name} style={{ ...wrapperStyle, ...labelGroup }}>
                {field.label && <label style={labelStyle}>{field.label}</label>}
                <select
                  value={form[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  style={inputStyle}
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            );
          }

          // Textarea
          if (field.type === "textarea") {
            return (
              <div key={field.name} style={wrapperStyle}>
                {field.label && <label style={labelStyle}>{field.label}</label>}
                <textarea
                  placeholder={field.placeholder}
                  value={form[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  style={{ ...inputStyle, ...wrapperStyle, minHeight: "120px", resize: "vertical" }}
                />
              </div>
            );
          }

          // Date fields
          if (field.type === "date") {
            const minValue = field.minFrom ? form[field.minFrom] : undefined;
            return (
              <div key={field.name} style={{ ...wrapperStyle, ...labelGroup }}>
                {field.label && <label style={labelStyle}>{field.label}</label>}
                <input
                  type="date"
                  value={form[field.name] || ""}
                  min={minValue}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  style={inputStyle}
                />
              </div>
            );
          }

          // Text, email, number, etc.
          return (
            <div key={field.name} style={wrapperStyle}>
              {field.label && <label style={labelStyle}>{field.label}</label>}
              <input
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={form[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                min={field.min}
                style={{
                  ...inputStyle,
                  ...(field.highlight ? { fontSize: "1.1rem", borderColor: "#4ade80" } : {}),
                }}
              />
            </div>
          );
        })}

        {/* Error Message */}
        {status === "error" && (
          <div style={{ gridColumn: "1 / -1", padding: "1rem", background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "10px", color: "#fca5a5", textAlign: "center" }}>
            Submission failed. Please try again or contact support.
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{ ...btnStyle, opacity: loading ? 0.6 : 1, pointerEvents: loading ? "none" : "auto" }}
        >
          {loading ? "SENDING REQUEST..." : variant === "group" ? "SUBMIT REQUEST" : "SUBMIT INQUIRY"}
        </button>
      </form>
    </>
  );
}

// -------------------------------------------------------
// Styles
// -------------------------------------------------------
const formCardStyle = {
  maxWidth: "900px",
  width: "100%",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
  background: "rgba(20, 20, 30, 0.85)",
  backdropFilter: "blur(12px)",
  padding: "40px",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  animation: "slideUp 0.6s ease",
  zIndex: 10,
};

const successCardStyle = {
  maxWidth: "500px",
  width: "100%",
  textAlign: "center",
  background: "rgba(20, 20, 30, 0.95)",
  backdropFilter: "blur(12px)",
  padding: "3rem",
  borderRadius: "20px",
  border: "1px solid #4ade80",
  animation: "slideUp 0.5s ease",
};

const inputStyle = {
  padding: "14px",
  borderRadius: "10px",
  background: "rgba(0,0,0,0.4)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "white",
  width: "100%",
  fontSize: "1rem",
  boxSizing: "border-box",
  colorScheme: "dark",
  transition: "border-color 0.2s, background 0.2s",
};

const labelStyle = {
  fontSize: "0.85rem",
  color: "#94a3b8",
  marginBottom: "6px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const labelGroup = { display: "flex", flexDirection: "column" };

const btnStyle = {
  gridColumn: "1 / -1",
  padding: "18px",
  background: "#4ade80",
  color: "#064e3b",
  fontWeight: "800",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "1.1rem",
  marginTop: "10px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  transition: "transform 0.1s, opacity 0.2s",
};
