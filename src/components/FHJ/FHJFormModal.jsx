// ==========================================================
// 📄 FILE: FHJFormModal.jsx  (PHASE 2 — CONSOLIDATION)
// Replaces: TripFormModal.jsx, EventFormModal.jsx
// Location: src/components/FHJ/FHJFormModal.jsx
//
// Usage:
//   <FHJFormModal
//     title="Add Trip"
//     fields={[
//       { key: "destination", label: "Destination", required: true },
//       { key: "client", label: "Client", required: true },
//       { key: "startDate", label: "Start Date", type: "date" },
//       { key: "endDate", label: "End Date", type: "date" },
//       { key: "tripType", label: "Trip Type" },
//       { key: "status", label: "Status", type: "select", options: ["Upcoming", "Active", "Completed"] },
//       { key: "notes", label: "Notes", type: "textarea" },
//     ]}
//     initialValues={{ destination: "Bali", client: "John" }}
//     onClose={() => setModalOpen(false)}
//     onSubmit={(formData) => saveTrip(formData)}
//     saving={saving}
//   />
// ==========================================================

import React, { useState, useEffect, useRef } from "react";
import { fhjTheme } from "./FHJUIKit.jsx";

export default function FHJFormModal({
  title = "Form",
  fields = [],
  initialValues = null,
  onClose,
  onSubmit,
  saving = false,
}) {
  // Build initial state from fields config + initialValues
  const buildState = () => {
    const state = {};
    fields.forEach((f) => {
      state[f.key] = initialValues?.[f.key] || f.defaultValue || "";
    });
    return state;
  };

  const [form, setForm] = useState(buildState);
  const backdropRef = useRef(null);

  // Reset form when initialValues change
  useEffect(() => {
    setForm(buildState());
  }, [initialValues]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saving, onClose]);

  // Focus trap: focus first input on mount
  useEffect(() => {
    const firstInput = backdropRef.current?.querySelector("input, select, textarea");
    if (firstInput) firstInput.focus();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
  };

  // Determine if editing or creating
  const isEditing = !!initialValues;
  const modalTitle = isEditing ? title.replace(/^Add/, "Edit") : title;

  return (
    <div
      ref={backdropRef}
      style={backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: fhjTheme.primary, fontSize: "1.2rem" }}>
            {modalTitle}
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
            style={closeBtn}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.key} style={fieldWrapper}>
              <label style={labelStyle}>{field.label}</label>

              {/* Select */}
              {field.type === "select" ? (
                <select
                  value={form[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  style={inputStyle}
                >
                  <option value="">— Select —</option>
                  {(field.options || []).map((opt) => {
                    const value = typeof opt === "string" ? opt : opt.value;
                    const label = typeof opt === "string" ? opt : opt.label;
                    return <option key={value} value={value}>{label}</option>;
                  })}
                </select>
              ) : field.type === "textarea" ? (
                /* Textarea */
                <textarea
                  value={form[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  rows={field.rows || 3}
                  placeholder={field.placeholder || ""}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              ) : (
                /* Input (text, date, number, email, etc.) */
                <input
                  type={field.type || "text"}
                  name={field.key}
                  value={form[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder || ""}
                  min={field.min}
                  max={field.max}
                  style={inputStyle}
                />
              )}
            </div>
          ))}

          {/* Actions */}
          <div style={actionsStyle}>
            <button
              type="button"
              onClick={onClose}
              style={cancelBtn}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={submitBtn}
              disabled={saving}
            >
              {saving ? "Saving…" : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Pre-built Field Configs for Common Use Cases
// -------------------------------------------------------
export const TRIP_FIELDS = [
  { key: "destination", label: "Destination", required: true },
  { key: "client", label: "Client", required: true },
  { key: "startDate", label: "Start Date", type: "date", required: true },
  { key: "endDate", label: "End Date", type: "date" },
  { key: "tripType", label: "Trip Type", type: "select", options: ["Individual", "Group", "Wedding", "Cruise", "Corporate"] },
  { key: "status", label: "Status", type: "select", options: ["Upcoming", "Active", "Completed", "Cancelled"] },
  { key: "notes", label: "Notes", type: "textarea" },
];

export const EVENT_FIELDS = [
  { key: "eventName", label: "Event Name", required: true },
  { key: "client", label: "Client", required: true },
  { key: "eventDate", label: "Event Date", type: "date", required: true },
  { key: "endDate", label: "End Date", type: "date" },
  { key: "location", label: "Location" },
  { key: "eventType", label: "Event Type", type: "select", options: ["Wedding", "Birthday", "Corporate", "Reunion", "Other"] },
  { key: "status", label: "Status", type: "select", options: ["Planning", "Confirmed", "Completed", "Cancelled"] },
  { key: "guestCount", label: "Guest Count", type: "number", min: 0 },
  { key: "budget", label: "Budget" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export const BOOKING_FIELDS = [
  { key: "clientName", label: "Client Name", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "tripName", label: "Trip / Destination", required: true },
  { key: "travelDates", label: "Appointment Date", type: "date" },
  { key: "status", label: "Status", type: "select", options: ["Pending", "Upcoming", "Confirmed", "In Progress", "Completed", "Cancelled"] },
];

// -------------------------------------------------------
// Styles
// -------------------------------------------------------
const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9000,
  padding: "1rem",
};

const modal = {
  width: "100%",
  maxWidth: "540px",
  maxHeight: "85vh",
  overflowY: "auto",
  background: "rgba(10,10,20,0.96)",
  borderRadius: "16px",
  padding: "1.75rem",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
  color: "white",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.25rem",
};

const closeBtn = {
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.6)",
  fontSize: "1.1rem",
  cursor: "pointer",
  padding: "0.25rem",
};

const fieldWrapper = {
  marginBottom: "1rem",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.35rem",
  fontSize: "0.8rem",
  opacity: 0.8,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#94a3b8",
};

const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(0,0,0,0.4)",
  color: "white",
  fontSize: "0.9rem",
  boxSizing: "border-box",
  colorScheme: "dark",
  transition: "border-color 0.2s ease",
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.75rem",
  marginTop: "1.5rem",
};

const cancelBtn = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.3)",
  color: "white",
  borderRadius: "999px",
  padding: "0.5rem 1.25rem",
  fontSize: "0.85rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const submitBtn = {
  background: "transparent",
  border: "1px solid #00c48c",
  color: "#00c48c",
  borderRadius: "999px",
  padding: "0.5rem 1.25rem",
  fontSize: "0.85rem",
  cursor: "pointer",
  fontWeight: 600,
  transition: "all 0.2s ease",
};
