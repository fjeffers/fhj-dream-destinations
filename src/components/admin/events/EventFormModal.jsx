// src/components/admin/events/EventFormModal.jsx
import React, { useState } from "react";
import { fhjTheme } from "../../../components/FHJ/FHJUIKit.jsx";
export default function EventFormModal({ initialValues, onClose, onSubmit, saving }) {
  const [form, setForm] = useState({
    eventName: initialValues?.eventName || "",
    client: initialValues?.client || "",
    eventDate: initialValues?.eventDate || "",
    endDate: initialValues?.endDate || "",
    location: initialValues?.location || "",
    eventType: initialValues?.eventType || "",
    status: initialValues?.status || "",
    guestCount: initialValues?.guestCount || "",
    budget: initialValues?.budget || "",
    notes: initialValues?.notes || "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
  };
  const fields = [
    ["eventName", "Event Name"],
    ["client", "Client"],
    ["eventDate", "Event Date"],
    ["endDate", "End Date"],
    ["location", "Location"],
    ["eventType", "Event Type"],
    ["status", "Status"],
    ["guestCount", "Guest Count"],
    ["budget", "Budget"],
  ];
  return (
    <div style={backdrop}>
      <div style={modal}>
        <h3 style={{ marginTop: 0, marginBottom: "0.75rem", color: fhjTheme.primary }}>
          {initialValues ? "Edit Event" : "Add Event"}
        </h3>
        <form onSubmit={handleSubmit}>
          {fields.map(([key, label]) => (
            <div key={key} style={field}>
              <label style={labelStyle}>{label}</label>
              <input
                name={key}
                value={form[key]}
                onChange={handleChange}
                required={["eventName", "client", "eventDate"].includes(key)}
                style={input}
              />
            </div>
          ))}
          <div style={field}>
            <label style={labelStyle}>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              style={{ ...input, resize: "vertical" }}
            />
          </div>
          <div style={actions}>
            <button type="button" onClick={onClose} style={btn} disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...btn, borderColor: fhjTheme.primary, color: fhjTheme.primary }}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 40,
};
const modal = {
  width: "100%",
  maxWidth: "520px",
  background: "rgba(10,10,20,0.96)",
  borderRadius: "16px",
  padding: "1.5rem",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
};
const field = {
  marginBottom: "0.9rem",
};
const labelStyle = {
  display: "block",
  marginBottom: "0.25rem",
  fontSize: "0.8rem",
  opacity: 0.8,
};
const input = {
  width: "100%",
  padding: "0.45rem 0.6rem",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(0,0,0,0.4)",
  color: "white",
  fontSize: "0.85rem",
};
const actions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.75rem",
  marginTop: "1rem",
};
const btn = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.4)",
  color: "white",
  borderRadius: "999px",
  padding: "0.25rem 0.75rem",
  fontSize: "0.8rem",
  cursor: "pointer",
};
