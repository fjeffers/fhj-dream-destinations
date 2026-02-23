// ==========================================================
// FILE: AdminAppointmentsPage.jsx — Admin Appointments Calendar
// Location: src/pages/AdminAppointmentsPage.jsx
// Route: /admin/appointments
// ==========================================================

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import AdminCalendar from "../components/AdminCalendar.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";

const BOOKING_LINK = typeof window !== "undefined"
  ? `${window.location.origin}/book-appointment`
  : "https://fhjdreamdestinations.com/book-appointment";

const LABEL_STYLE = {
  color: fhjTheme.colors.textSecondary,
  fontSize: "0.82rem",
  fontWeight: 600,
  marginBottom: 5,
  display: "block",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const TEXTAREA_STYLE = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: fhjTheme.radii.md,
  background: fhjTheme.colors.glassLight,
  border: `1px solid ${fhjTheme.colors.glassBorder}`,
  color: fhjTheme.colors.textPrimary,
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  resize: "vertical",
  minHeight: "80px",
  fontFamily: "inherit",
};

const SELECT_STYLE = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: fhjTheme.radii.md,
  background: fhjTheme.colors.glassLight,
  border: `1px solid ${fhjTheme.colors.glassBorder}`,
  color: fhjTheme.colors.textPrimary,
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
};

// ── Add Appointment Modal ─────────────────────────────────
function AddAppointmentModal({ open, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    client_name: "", client_email: "", client_phone: "",
    start: "", end: "", notes: "", type: "appointment",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Auto-set end to 1 hour after start
  const handleStartChange = (val) => {
    set("start", val);
    if (val) {
      const d = new Date(val);
      d.setHours(d.getHours() + 1);
      const pad = n => String(n).padStart(2, "0");
      const endVal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      set("end", endVal);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.start || !form.end) return;
    onSave({
      ...form,
      start: new Date(form.start).toISOString(),
      end: new Date(form.end).toISOString(),
    });
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{ width: "100%", maxWidth: 540 }}
          >
            <FHJCard style={{ padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ color: fhjTheme.gold, fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                  📅 Add Appointment
                </h3>
                <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.3rem" }}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={LABEL_STYLE}>Client Name</label>
                      <FHJInput type="text" placeholder="Full name" value={form.client_name} onChange={e => set("client_name", e.target.value)} />
                    </div>
                    <div>
                      <label style={LABEL_STYLE}>Email</label>
                      <FHJInput type="email" placeholder="client@email.com" value={form.client_email} onChange={e => set("client_email", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label style={LABEL_STYLE}>Phone</label>
                    <FHJInput type="tel" placeholder="(555) 000-0000" value={form.client_phone} onChange={e => set("client_phone", e.target.value)} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={LABEL_STYLE}>Start Date & Time *</label>
                      <FHJInput type="datetime-local" value={form.start} onChange={e => handleStartChange(e.target.value)} required />
                    </div>
                    <div>
                      <label style={LABEL_STYLE}>End Date & Time *</label>
                      <FHJInput type="datetime-local" value={form.end} onChange={e => set("end", e.target.value)} required />
                    </div>
                  </div>

                  <div>
                    <label style={LABEL_STYLE}>Type</label>
                    <select style={SELECT_STYLE} value={form.type} onChange={e => set("type", e.target.value)}>
                      <option value="appointment">Appointment</option>
                      <option value="block">Block</option>
                    </select>
                  </div>

                  <div>
                    <label style={LABEL_STYLE}>Notes</label>
                    <textarea style={TEXTAREA_STYLE} placeholder="Any notes or details…" value={form.notes} onChange={e => set("notes", e.target.value)} />
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                    <FHJButton type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</FHJButton>
                    <FHJButton type="submit" variant="solid" disabled={saving} style={{ flex: 1 }}>
                      {saving ? "Saving…" : "Add Appointment"}
                    </FHJButton>
                  </div>
                </div>
              </form>
            </FHJCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Event Detail Modal ────────────────────────────────────
function EventDetailModal({ event, open, onClose, onDelete }) {
  if (!open || !event) return null;
  const raw = event.raw || {};
  const isBlock = event.type === "block";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{ width: "100%", maxWidth: 460 }}
          >
            <FHJCard style={{ padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ color: isBlock ? fhjTheme.danger : fhjTheme.gold, fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                  {isBlock ? "🔴 Blocked Slot" : "📋 Appointment Details"}
                </h3>
                <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.3rem" }}>✕</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  ["Title", event.title],
                  !isBlock && raw.client_name && ["Client", raw.client_name],
                  !isBlock && raw.client_email && ["Email", raw.client_email],
                  !isBlock && raw.client_phone && ["Phone", raw.client_phone],
                  ["Start", event.start ? new Date(event.start).toLocaleString() : "—"],
                  ["End", event.end ? new Date(event.end).toLocaleString() : "—"],
                  raw.notes && ["Notes", raw.notes],
                  raw.status && ["Status", raw.status],
                  raw.type && ["Type", raw.type],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: "0.75rem", padding: "0.35rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.8rem", fontWeight: 600, minWidth: 70 }}>{k}</span>
                    <span style={{ color: fhjTheme.colors.textPrimary, fontSize: "0.9rem" }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <FHJButton variant="ghost" onClick={onClose} style={{ flex: 1 }}>Close</FHJButton>
                {event.id && (
                  <FHJButton variant="danger" onClick={() => onDelete(event.id)} style={{ flex: 1 }}>
                    Delete
                  </FHJButton>
                )}
              </div>
            </FHJCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Stats Card ────────────────────────────────────────────
function StatCard({ label, value, icon }) {
  return (
    <FHJCard style={{ padding: "1.25rem", textAlign: "center" }}>
      <div style={{ fontSize: "1.8rem", marginBottom: "0.35rem" }}>{icon}</div>
      <div style={{ color: fhjTheme.gold, fontSize: "1.7rem", fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.78rem", marginTop: "0.3rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
    </FHJCard>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function AdminAppointmentsPage({ admin }) {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Pre-fill start/end for slot-click
  const [slotStart, setSlotStart] = useState(null);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch(`/.netlify/functions/admin-appointments?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      const json = await res.json();
      setAppointments(json.bookings || []);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  // Stats
  const todayAppts = appointments.filter(a => {
    const d = (a.start || "").split("T")[0];
    return d === todayStr;
  });
  const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const weekAppts = appointments.filter(a => {
    const d = new Date(a.start || today);
    return d >= today && d <= weekEnd;
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(BOOKING_LINK).then(() => {
      setLinkCopied(true);
      toast.success("Booking link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 3000);
    }).catch(() => {
      toast.error("Failed to copy link.");
    });
  };

  const handleAddAppointment = async (formData) => {
    setSaving(true);
    try {
      const res = await fetch("/.netlify/functions/admin-appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to add appointment.");
        return;
      }
      toast.success("Appointment added!");
      setModalOpen(false);
      setSlotStart(null);
      loadAppointments();
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      const res = await fetch(`/.netlify/functions/admin-appointments?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Appointment deleted.");
        setDetailOpen(false);
        loadAppointments();
      } else {
        toast.error("Failed to delete.");
      }
    } catch {
      toast.error("Delete failed.");
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  const handleSlotSelect = (slotInfo) => {
    setSlotStart(slotInfo.start);
    setModalOpen(true);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>

      {/* Header Section */}
      <FHJCard style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ color: fhjTheme.gold, fontSize: "1.7rem", fontWeight: 700, margin: 0, marginBottom: "0.4rem" }}>
              📅 Appointment Calendar
            </h1>
            <p style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.9rem", margin: 0 }}>
              Manage all client appointments and blocked slots
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <FHJButton
              variant="ghost"
              onClick={handleCopyLink}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              {linkCopied ? "✅ Copied!" : "🔗 Copy Booking Link"}
            </FHJButton>
            <FHJButton
              variant="solid"
              onClick={() => { setSlotStart(null); setModalOpen(true); }}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              ＋ Add Appointment
            </FHJButton>
          </div>
        </div>

        {/* Booking Link Preview */}
        <div style={{
          padding: "0.6rem 1rem",
          borderRadius: fhjTheme.radii.md,
          background: "rgba(212,175,55,0.08)",
          border: `1px solid rgba(212,175,55,0.2)`,
          display: "flex", alignItems: "center", gap: "0.75rem",
          marginBottom: "1.5rem",
        }}>
          <span style={{ color: fhjTheme.colors.textSecondary, fontSize: "0.8rem", fontWeight: 600 }}>Client Booking Link:</span>
          <span style={{ color: fhjTheme.gold, fontSize: "0.85rem", fontFamily: "monospace" }}>{BOOKING_LINK}</span>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <StatCard label="Today's Appointments" value={todayAppts.length} icon="🌅" />
          <StatCard label="This Week" value={weekAppts.length} icon="📆" />
          <StatCard label="Next 30 Days" value={appointments.length} icon="🗓️" />
        </div>
      </FHJCard>

      {/* Calendar */}
      <FHJCard style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <AdminCalendar onEventClick={handleEventClick} onSlotSelect={handleSlotSelect} />
      </FHJCard>

      {/* Upcoming Appointments Table */}
      <FHJCard style={{ padding: "1.5rem" }}>
        <h3 style={{ color: fhjTheme.gold, fontSize: "1.1rem", fontWeight: 700, marginTop: 0, marginBottom: "1.25rem" }}>
          Upcoming Appointments (Next 30 Days)
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: fhjTheme.colors.textSecondary }}>Loading…</div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: fhjTheme.colors.textSecondary }}>No upcoming appointments.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr>
                  {["Client", "Email", "Date & Time", "Status", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.6rem 0.75rem", color: fhjTheme.colors.textSecondary, fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt, idx) => (
                  <tr key={appt.id || idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem", color: fhjTheme.colors.textPrimary, fontWeight: 500 }}>
                      {appt.client_name || "—"}
                    </td>
                    <td style={{ padding: "0.75rem", color: fhjTheme.colors.textSecondary }}>
                      {appt.client_email || "—"}
                    </td>
                    <td style={{ padding: "0.75rem", color: fhjTheme.primary }}>
                      {appt.start ? new Date(appt.start).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{
                        padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.72rem",
                        background: appt.status === "confirmed" ? "rgba(0,196,140,0.15)" : "rgba(255,255,255,0.08)",
                        color: appt.status === "confirmed" ? fhjTheme.primary : fhjTheme.colors.textSecondary,
                        fontWeight: 600, textTransform: "capitalize",
                      }}>
                        {appt.status || "pending"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <FHJButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEventClick({ id: appt.id, title: appt.client_name || "Appointment", start: appt.start, end: appt.end, type: appt.type || "appointment", raw: appt })}
                        >
                          View
                        </FHJButton>
                        <FHJButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appt.id)}
                        >
                          Delete
                        </FHJButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FHJCard>

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSlotStart(null); }}
        onSave={handleAddAppointment}
        saving={saving}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onDelete={handleDeleteAppointment}
      />
    </div>
  );
}
