// ==========================================================
// FILE: AdminClients.jsx
// Enhanced Clients Manager for Admin Portal
// Location: src/pages/AdminClients.jsx
// ==========================================================

import React, { useState, useEffect, useCallback } from "react";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { motion, AnimatePresence } from "framer-motion";

// ── Constants ──────────────────────────────────────────────
const BUDGET_RANGES = ["Economy", "Mid-Range", "Luxury", "Ultra-Luxury"];
const CLIENT_TIERS = ["New", "Regular", "VIP", "Premium"];
const DETAIL_TABS = ["Profile", "Bookings", "Trips", "Payments", "Concierge", "Documents", "Timeline"];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  preferred_destinations: "",
  budget_range: "",
  passport_nationality: "",
  passport_expiry: "",
  loyalty_programs: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  client_tier: "",
};

// ── Helpers ────────────────────────────────────────────────
const fmt = (date) => {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return date;
  }
};

const fmtMoney = (n) =>
  n ? `$${parseFloat(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00";

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const color =
    s.includes("confirm") || s.includes("active") || s.includes("paid") || s.includes("completed")
      ? "#00c48c"
      : s.includes("pend") || s.includes("partial")
      ? "#f59e0b"
      : s.includes("cancel") || s.includes("overdue") || s.includes("failed")
      ? "#f87171"
      : "#60a5fa";
  return (
    <span
      style={{
        padding: "0.2rem 0.55rem",
        borderRadius: "20px",
        fontSize: "0.7rem",
        fontWeight: 600,
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        whiteSpace: "nowrap",
      }}
    >
      {status || "Unknown"}
    </span>
  );
};

// ── Main Component ─────────────────────────────────────────
export default function AdminClients({ admin }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Detail panel
  const [selectedClient, setSelectedClient] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailTab, setDetailTab] = useState("Profile");

  // Portal management
  const [portalMsg, setPortalMsg] = useState("");

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);

  const isAssistant = (admin?.role || admin?.Role) === "Assistant";

  // ── Data loading ──────────────────────────────────────
  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/admin-clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      setError("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const openDetail = useCallback(async (client) => {
    setSelectedClient(client);
    setDetailTab("Profile");
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    setPortalMsg("");
    try {
      const res = await fetch("/.netlify/functions/admin-client-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: client.id }),
      });
      const data = await res.json();
      if (data.success) {
        setDetail(data);
      } else {
        setDetailError(data.error || "Failed to load client details.");
      }
    } catch (err) {
      setDetailError(`Network error: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = () => {
    setSelectedClient(null);
    setDetail(null);
    setDetailError("");
  };

  // ── Form helpers ───────────────────────────────────────
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (client) => {
    setForm({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      notes: client.notes || "",
      preferred_destinations: client.preferred_destinations || "",
      budget_range: client.budget_range || "",
      passport_nationality: client.passport_nationality || "",
      passport_expiry: client.passport_expiry || "",
      loyalty_programs: client.loyalty_programs || "",
      emergency_contact_name: client.emergency_contact_name || "",
      emergency_contact_phone: client.emergency_contact_phone || "",
      client_tier: client.client_tier || "",
    });
    setEditing(client);
    setShowForm(true);
    closeDetail();
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const method = editing ? "PUT" : "POST";
      const res = await fetch("/.netlify/functions/admin-clients", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing?.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          notes: form.notes,
          preferred_destinations: form.preferred_destinations,
          budget_range: form.budget_range,
          passport_nationality: form.passport_nationality,
          passport_expiry: form.passport_expiry || null,
          loyalty_programs: form.loyalty_programs,
          emergency_contact_name: form.emergency_contact_name,
          emergency_contact_phone: form.emergency_contact_phone,
          client_tier: form.client_tier,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(editing ? "Client updated!" : "Client created!");
        setTimeout(() => setSuccess(""), 3000);
        resetForm();
        loadClients();
      } else {
        setError(data.error || "Save failed.");
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client) => {
    const name = client.name || "this client";
    if (!window.confirm('Delete "' + name + '"?')) return;
    try {
      await fetch("/.netlify/functions/admin-clients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: client.id }),
      });
      setSuccess("Client deleted.");
      setTimeout(() => setSuccess(""), 3000);
      closeDetail();
      loadClients();
    } catch (err) {
      setError("Failed to delete.");
    }
  };

  // ── Portal actions (placeholder) ───────────────────────
  const handleResetPassword = () => {
    const arr = new Uint8Array(6);
    window.crypto.getRandomValues(arr);
    const newPass = Array.from(arr, (b) => b.toString(36).padStart(2, "0")).join("").toUpperCase().slice(0, 8);
    console.log("[Portal] Reset password for", selectedClient?.email, "->", newPass);
    setPortalMsg(`Password reset link sent (new temp: ${newPass})`);
    setTimeout(() => setPortalMsg(""), 5000);
  };

  const handleSendInvite = () => {
    console.log("[Portal] Send invite to", selectedClient?.email);
    setPortalMsg(`Portal invite sent to ${selectedClient?.email}`);
    setTimeout(() => setPortalMsg(""), 5000);
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ color: fhjTheme.primary, margin: 0, fontSize: "1.6rem" }}>Clients Manager</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.3rem" }}>
            Manage FHJ clients, their trips, and key details.
          </p>
        </div>
        {!isAssistant && (
          <FHJButton onClick={() => { resetForm(); setShowForm(true); }}>+ Add Client</FHJButton>
        )}
      </div>

      {/* Messages */}
      {success && (
        <div style={{ ...msgStyle, background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)", color: "#4ade80" }}>
          {success}
        </div>
      )}
      {error && !showForm && (
        <div style={{ ...msgStyle, background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <FHJCard style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "white", margin: "0 0 1.25rem", fontSize: "1.1rem" }}>
                {editing ? "Edit Client" : "New Client"}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Core fields */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>NAME *</label>
                  <FHJInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" />
                </div>

                <div>
                  <label style={labelStyle}>EMAIL *</label>
                  <FHJInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                </div>

                <div>
                  <label style={labelStyle}>PHONE</label>
                  <FHJInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>ADDRESS</label>
                  <FHJInput value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, State ZIP" />
                </div>

                {/* Extended fields */}
                <div>
                  <label style={labelStyle}>CLIENT TIER</label>
                  <select
                    style={selectStyle}
                    value={form.client_tier}
                    onChange={(e) => setForm({ ...form, client_tier: e.target.value })}
                  >
                    <option value="">Select tier...</option>
                    {CLIENT_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>BUDGET RANGE</label>
                  <select
                    style={selectStyle}
                    value={form.budget_range}
                    onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
                  >
                    <option value="">Select range...</option>
                    {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>PREFERRED DESTINATIONS</label>
                  <FHJInput value={form.preferred_destinations} onChange={(e) => setForm({ ...form, preferred_destinations: e.target.value })} placeholder="e.g. Maldives, Paris, Japan" />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>LOYALTY PROGRAMS</label>
                  <FHJInput value={form.loyalty_programs} onChange={(e) => setForm({ ...form, loyalty_programs: e.target.value })} placeholder="e.g. United MileagePlus, Marriott Bonvoy" />
                </div>

                <div>
                  <label style={labelStyle}>PASSPORT NATIONALITY</label>
                  <FHJInput value={form.passport_nationality} onChange={(e) => setForm({ ...form, passport_nationality: e.target.value })} placeholder="e.g. US, UK, CA" />
                </div>

                <div>
                  <label style={labelStyle}>PASSPORT EXPIRY</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={form.passport_expiry}
                    onChange={(e) => setForm({ ...form, passport_expiry: e.target.value })}
                  />
                </div>

                <div>
                  <label style={labelStyle}>EMERGENCY CONTACT NAME</label>
                  <FHJInput value={form.emergency_contact_name} onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} placeholder="Contact name" />
                </div>

                <div>
                  <label style={labelStyle}>EMERGENCY CONTACT PHONE</label>
                  <FHJInput value={form.emergency_contact_phone} onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })} placeholder="(555) 000-0000" />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>NOTES</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              {error && showForm && (
                <div style={{ ...msgStyle, background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171", marginTop: "1rem", marginBottom: 0 }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                <FHJButton onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update Client" : "Create Client"}
                </FHJButton>
                <FHJButton variant="ghost" onClick={resetForm}>Cancel</FHJButton>
              </div>
            </FHJCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clients List */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {[1, 2, 3].map((i) => (
            <FHJCard key={i} style={{ height: "200px", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ padding: "1.5rem", color: "rgba(255,255,255,0.3)" }}>Loading...</div>
            </FHJCard>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <FHJCard style={{ padding: "3rem", textAlign: "center" }}>
          <span style={{ fontSize: "3rem" }}>👥</span>
          <p style={{ color: "#94a3b8", marginTop: "1rem" }}>No clients yet. Click "+ Add Client" to create your first one.</p>
        </FHJCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {clients.map((client) => (
            <motion.div key={client.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <FHJCard style={{ padding: "1.5rem" }}>
                {/* Name + tier badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <h4 style={{ color: "white", margin: 0, fontSize: "1.05rem", flex: 1 }}>{client.name}</h4>
                  {client.client_tier && (
                    <span style={tierBadgeStyle(client.client_tier)}>{client.client_tier}</span>
                  )}
                </div>

                <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0.4rem 0 0.2rem" }}>{client.email}</p>
                {client.phone && <p style={{ color: "#94a3b8", fontSize: "0.83rem", margin: "0.2rem 0" }}>{client.phone}</p>}
                {client.address && <p style={{ color: "#94a3b8", fontSize: "0.78rem", margin: "0.2rem 0 0", opacity: 0.7 }}>{client.address}</p>}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                  <button
                    onClick={() => openDetail(client)}
                    style={{ ...actionBtnStyle, color: "#00c48c", borderColor: "rgba(0,196,140,0.3)" }}
                  >
                    View Details
                  </button>
                  {!isAssistant && (
                    <>
                      <button onClick={() => handleEdit(client)} style={actionBtnStyle}>Edit</button>
                      <button onClick={() => handleDelete(client)} style={{ ...actionBtnStyle, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>Delete</button>
                    </>
                  )}
                </div>
              </FHJCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Panel (Slide-In Overlay) */}
      <AnimatePresence>
        {selectedClient && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetail}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                zIndex: 1000,
              }}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: "min(680px, 100vw)",
                background: "rgba(10,14,28,0.97)",
                backdropFilter: "blur(24px)",
                borderLeft: "1px solid rgba(255,255,255,0.1)",
                zIndex: 1001,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Panel Header */}
              <div style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <div>
                  <h2 style={{ color: "white", margin: 0, fontSize: "1.2rem" }}>{selectedClient.name}</h2>
                  <p style={{ color: "rgba(255,255,255,0.5)", margin: "0.2rem 0 0", fontSize: "0.83rem" }}>
                    {selectedClient.email}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {!isAssistant && (
                    <>
                      <button onClick={() => handleEdit(selectedClient)} style={{ ...actionBtnStyle, fontSize: "0.78rem" }}>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(selectedClient)}
                        style={{ ...actionBtnStyle, fontSize: "0.78rem", color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  <button
                    onClick={closeDetail}
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "rgba(255,255,255,0.7)",
                      width: "32px",
                      height: "32px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Quick stats bar */}
              {detail && detail.stats && (
                <div style={{
                  display: "flex",
                  gap: "0.75rem",
                  padding: "0.75rem 1.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  flexShrink: 0,
                  flexWrap: "wrap",
                }}>
                  <StatChip icon="📋" label="Bookings" value={detail.stats.totalBookings} />
                  <StatChip icon="💳" label="Total Spent" value={fmtMoney(detail.stats.totalSpent)} />
                  <StatChip
                    icon="✈️"
                    label="Next Trip"
                    value={detail.stats.nextTrip
                      ? fmt(detail.stats.nextTrip.start_date || detail.stats.nextTrip.departure_date)
                      : "None"}
                  />
                  <StatChip icon="💬" label="Last Activity" value={fmt(detail.stats.lastInteraction)} />
                </div>
              )}

              {/* Tabs */}
              <div style={{
                display: "flex",
                gap: "0.1rem",
                padding: "0.75rem 1.5rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                overflowX: "auto",
                flexShrink: 0,
              }}>
                {DETAIL_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: "8px 8px 0 0",
                      border: "none",
                      background: detailTab === tab ? "rgba(0,196,140,0.15)" : "transparent",
                      color: detailTab === tab ? "#00c48c" : "rgba(255,255,255,0.5)",
                      fontSize: "0.8rem",
                      fontWeight: detailTab === tab ? 600 : 400,
                      cursor: "pointer",
                      borderBottom: detailTab === tab ? "2px solid #00c48c" : "2px solid transparent",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
                {detailLoading && (
                  <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255,255,255,0.4)" }}>
                    Loading client details…
                  </div>
                )}
                {detailError && (
                  <div style={{ ...msgStyle, background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>
                    {detailError}
                  </div>
                )}

                {!detailLoading && !detailError && detail && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={detailTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      {detailTab === "Profile" && (
                        <ProfileTab
                          client={detail.client}
                          portalMsg={portalMsg}
                          onResetPassword={handleResetPassword}
                          onSendInvite={handleSendInvite}
                          isAssistant={isAssistant}
                        />
                      )}
                      {detailTab === "Bookings" && <BookingsTab bookings={detail.bookings} />}
                      {detailTab === "Trips" && <TripsTab trips={detail.trips} />}
                      {detailTab === "Payments" && <PaymentsTab payments={detail.payments} />}
                      {detailTab === "Concierge" && <ConciergeTab concierge={detail.concierge} />}
                      {detailTab === "Documents" && <DocumentsTab documents={detail.documents} />}
                      {detailTab === "Timeline" && (
                        <TimelineTab
                          bookings={detail.bookings}
                          trips={detail.trips}
                          payments={detail.payments}
                          documents={detail.documents}
                          concierge={detail.concierge}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

const StatChip = ({ icon, label, value }) => (
  <div style={{
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "0.4rem 0.75rem",
    display: "flex",
    flexDirection: "column",
    minWidth: "90px",
  }}>
    <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", marginBottom: "0.15rem" }}>
      {icon} {label}
    </span>
    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "white" }}>{value}</span>
  </div>
);

const SectionHeading = ({ children }) => (
  <h4 style={{ color: "#00c48c", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", margin: "0 0 0.75rem" }}>
    {children}
  </h4>
);

const InfoRow = ({ label, value }) =>
  value ? (
    <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.5rem" }}>
      <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", minWidth: "140px", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.83rem" }}>{value}</span>
    </div>
  ) : null;

const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "rgba(255,255,255,0.3)" }}>
    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
    <p style={{ margin: 0, fontSize: "0.85rem" }}>{text}</p>
  </div>
);

// ── Profile Tab ────────────────────────────────────────────
const ProfileTab = ({ client, portalMsg, onResetPassword, onSendInvite, isAssistant }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
    <section>
      <SectionHeading>Contact Information</SectionHeading>
      <InfoRow label="Email" value={client.email} />
      <InfoRow label="Phone" value={client.phone} />
      <InfoRow label="Address" value={client.address} />
    </section>

    <section>
      <SectionHeading>Travel Preferences</SectionHeading>
      <InfoRow label="Client Tier" value={client.client_tier} />
      <InfoRow label="Budget Range" value={client.budget_range} />
      <InfoRow label="Preferred Destinations" value={client.preferred_destinations} />
      <InfoRow label="Loyalty Programs" value={client.loyalty_programs} />
    </section>

    <section>
      <SectionHeading>Passport & Travel Docs</SectionHeading>
      <InfoRow label="Nationality" value={client.passport_nationality} />
      <InfoRow label="Passport Expiry" value={client.passport_expiry ? fmt(client.passport_expiry) : null} />
    </section>

    <section>
      <SectionHeading>Emergency Contact</SectionHeading>
      <InfoRow label="Name" value={client.emergency_contact_name} />
      <InfoRow label="Phone" value={client.emergency_contact_phone} />
    </section>

    {client.notes && (
      <section>
        <SectionHeading>Notes</SectionHeading>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", margin: 0, lineHeight: 1.6 }}>
          {client.notes}
        </p>
      </section>
    )}

    {/* Portal Access */}
    <section style={{
      background: "rgba(0,196,140,0.06)",
      border: "1px solid rgba(0,196,140,0.15)",
      borderRadius: "12px",
      padding: "1rem 1.25rem",
    }}>
      <SectionHeading>Portal Access</SectionHeading>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
        <span style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: client.portal_enabled || client.password_hash ? "#00c48c" : "#64748b",
          flexShrink: 0,
        }} />
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.83rem" }}>
          {client.portal_enabled || client.password_hash ? "Portal access enabled" : "No portal access yet"}
        </span>
      </div>
      {!isAssistant && (
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button onClick={onSendInvite} style={{ ...actionBtnStyle, color: "#00c48c", borderColor: "rgba(0,196,140,0.3)" }}>
            Send Portal Invite
          </button>
          <button onClick={onResetPassword} style={actionBtnStyle}>
            Reset Password
          </button>
        </div>
      )}
      {portalMsg && (
        <p style={{ color: "#00c48c", fontSize: "0.78rem", margin: "0.75rem 0 0" }}>{portalMsg}</p>
      )}
    </section>
  </div>
);

// ── Bookings Tab ───────────────────────────────────────────
const BookingsTab = ({ bookings }) => {
  if (!bookings || !bookings.length) return <EmptyState icon="📋" text="No bookings found for this client." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {bookings.map((b, i) => (
        <div key={b.id || i} style={cardRowStyle}>
          <div style={{ flex: 1 }}>
            <p style={{ color: "white", margin: 0, fontSize: "0.9rem", fontWeight: 500 }}>
              {b.trip_name || b.destination || "Booking #" + (i + 1)}
            </p>
            <p style={{ color: "rgba(255,255,255,0.45)", margin: "0.2rem 0 0", fontSize: "0.78rem" }}>
              {fmt(b.start_date || b.created_at)}
              {b.end_date ? " → " + fmt(b.end_date) : ""}
              {b.total_price ? " · " + fmtMoney(b.total_price) : ""}
            </p>
          </div>
          <StatusBadge status={b.status} />
        </div>
      ))}
    </div>
  );
};

// ── Trips Tab ──────────────────────────────────────────────
const TripsTab = ({ trips }) => {
  if (!trips || !trips.length) return <EmptyState icon="✈️" text="No trips found for this client." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {trips.map((t, i) => (
        <div key={t.id || i} style={cardRowStyle}>
          <div style={{ flex: 1 }}>
            <p style={{ color: "white", margin: 0, fontSize: "0.9rem", fontWeight: 500 }}>
              {t.destination || t.name || "Trip #" + (i + 1)}
            </p>
            <p style={{ color: "rgba(255,255,255,0.45)", margin: "0.2rem 0 0", fontSize: "0.78rem" }}>
              {fmt(t.start_date || t.departure_date)}
              {t.end_date ? " → " + fmt(t.end_date) : ""}
            </p>
          </div>
          {t.status && <StatusBadge status={t.status} />}
        </div>
      ))}
    </div>
  );
};

// ── Payments Tab ───────────────────────────────────────────
const PaymentsTab = ({ payments }) => {
  if (!payments || !payments.length) return <EmptyState icon="💳" text="No payments found for this client." />;
  const total = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
        <span style={{ color: "#00c48c", fontWeight: 700, fontSize: "0.9rem" }}>
          Total: {fmtMoney(total)}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {payments.map((p, i) => (
          <div key={p.id || i} style={cardRowStyle}>
            <div style={{ flex: 1 }}>
              <p style={{ color: "white", margin: 0, fontSize: "0.88rem", fontWeight: 500 }}>
                {fmtMoney(p.amount)}
                {p.payment_method ? " · " + p.payment_method : ""}
              </p>
              <p style={{ color: "rgba(255,255,255,0.45)", margin: "0.2rem 0 0", fontSize: "0.76rem" }}>
                {fmt(p.date || p.created_at)}
                {p.description ? " · " + p.description : ""}
              </p>
            </div>
            {p.status && <StatusBadge status={p.status} />}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Concierge Tab ──────────────────────────────────────────
const ConciergeTab = ({ concierge }) => {
  if (!concierge || !concierge.length) return <EmptyState icon="💬" text="No concierge conversations for this client." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {concierge.map((c, i) => (
        <div key={c.id || i} style={cardRowStyle}>
          <div style={{ flex: 1 }}>
            <p style={{ color: "white", margin: 0, fontSize: "0.88rem", fontWeight: 500 }}>
              {c.subject || (c.message || "").slice(0, 60) || "Conversation #" + (i + 1)}
              {c.message && c.message.length > 60 ? "…" : ""}
            </p>
            <p style={{ color: "rgba(255,255,255,0.45)", margin: "0.2rem 0 0", fontSize: "0.76rem" }}>
              {fmt(c.created_at)}
              {c.concierge_messages && c.concierge_messages.length
                ? " · " + c.concierge_messages.length + " message" + (c.concierge_messages.length !== 1 ? "s" : "")
                : ""}
            </p>
          </div>
          {c.status && <StatusBadge status={c.status} />}
        </div>
      ))}
    </div>
  );
};

// ── Documents Tab ──────────────────────────────────────────
const DocumentsTab = ({ documents }) => {
  if (!documents || !documents.length) return <EmptyState icon="📄" text="No documents found for this client." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {documents.map((d, i) => (
        <div key={d.id || i} style={cardRowStyle}>
          <div style={{ flex: 1 }}>
            <p style={{ color: "white", margin: 0, fontSize: "0.88rem", fontWeight: 500 }}>
              {d.name || d.file_name || "Document #" + (i + 1)}
            </p>
            <p style={{ color: "rgba(255,255,255,0.45)", margin: "0.2rem 0 0", fontSize: "0.76rem" }}>
              {d.type || d.document_type || ""}
              {(d.uploaded_at || d.created_at) ? " · Uploaded " + fmt(d.uploaded_at || d.created_at) : ""}
            </p>
          </div>
          {(d.url || d.file_url) && (
            <a
              href={d.url || d.file_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...actionBtnStyle, textDecoration: "none", color: "#60a5fa", borderColor: "rgba(96,165,250,0.3)", fontSize: "0.75rem" }}
            >
              Download
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Timeline Tab ───────────────────────────────────────────
const TimelineTab = ({ bookings, trips, payments, documents, concierge }) => {
  const events = [
    ...(bookings || []).map((b) => ({
      type: "Booking",
      icon: "📋",
      date: b.created_at,
      title: "Booking: " + (b.trip_name || b.destination || "Unknown"),
      detail: b.status ? "Status: " + b.status : "",
      color: "#60a5fa",
    })),
    ...(trips || []).map((t) => ({
      type: "Trip",
      icon: "✈️",
      date: t.start_date || t.created_at,
      title: "Trip to " + (t.destination || t.name || "Unknown"),
      detail: fmt(t.start_date || t.departure_date) + (t.end_date ? " → " + fmt(t.end_date) : ""),
      color: "#a78bfa",
    })),
    ...(payments || []).map((p) => ({
      type: "Payment",
      icon: "💳",
      date: p.date || p.created_at,
      title: "Payment: " + fmtMoney(p.amount),
      detail: p.payment_method || "",
      color: "#00c48c",
    })),
    ...(documents || []).map((d) => ({
      type: "Document",
      icon: "📄",
      date: d.uploaded_at || d.created_at,
      title: "Document: " + (d.name || d.file_name || "Uploaded"),
      detail: d.type || d.document_type || "",
      color: "#f59e0b",
    })),
    ...(concierge || []).map((c) => ({
      type: "Concierge",
      icon: "💬",
      date: c.created_at,
      title: "Concierge: " + (c.subject || (c.message || "").slice(0, 50) || "Message"),
      detail: c.status || "",
      color: "#fb923c",
    })),
  ]
    .filter((e) => e.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!events.length) return <EmptyState icon="📅" text="No activity timeline data available." />;

  return (
    <div style={{ position: "relative", paddingLeft: "1.5rem" }}>
      <div style={{ position: "absolute", left: "6px", top: 0, bottom: 0, width: "2px", background: "rgba(255,255,255,0.07)" }} />
      {events.map((ev, i) => (
        <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: "1.1rem", position: "relative" }}>
          <div style={{
            position: "absolute",
            left: "-1.5rem",
            top: "4px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: ev.color + "33",
            border: "2px solid " + ev.color,
          }} />
          <div>
            <p style={{ color: "white", margin: 0, fontSize: "0.85rem", fontWeight: 500 }}>
              {ev.icon} {ev.title}
            </p>
            {ev.detail && (
              <p style={{ color: "rgba(255,255,255,0.45)", margin: "0.1rem 0 0", fontSize: "0.76rem" }}>{ev.detail}</p>
            )}
            <p style={{ color: "rgba(255,255,255,0.3)", margin: "0.15rem 0 0", fontSize: "0.72rem" }}>{fmt(ev.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────
const tierBadgeStyle = (tier) => {
  const colors = {
    VIP: "#f59e0b",
    Premium: "#a78bfa",
    Regular: "#60a5fa",
    New: "#94a3b8",
  };
  const c = colors[tier] || "#94a3b8";
  return {
    padding: "0.15rem 0.5rem",
    borderRadius: "20px",
    fontSize: "0.65rem",
    fontWeight: 700,
    background: `${c}22`,
    color: c,
    border: `1px solid ${c}44`,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
};

const cardRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "10px",
  padding: "0.75rem 1rem",
};

const labelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.5px",
  marginBottom: "0.4rem",
};

const inputStyle = {
  width: "100%",
  padding: "0.65rem 0.75rem",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle = {
  width: "100%",
  padding: "0.65rem 0.75rem",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  appearance: "none",
  cursor: "pointer",
};

const msgStyle = {
  padding: "0.6rem 1rem",
  borderRadius: "8px",
  border: "1px solid",
  fontSize: "0.85rem",
  marginBottom: "1rem",
};

const actionBtnStyle = {
  padding: "0.35rem 0.75rem",
  borderRadius: "6px",
  fontSize: "0.75rem",
  fontWeight: 500,
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#94a3b8",
  cursor: "pointer",
  transition: "all 0.2s",
};
