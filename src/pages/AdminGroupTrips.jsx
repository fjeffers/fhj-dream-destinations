// ==========================================================
// FILE: AdminGroupTrips.jsx — Group/Family Trips Admin Page
// Location: src/pages/AdminGroupTrips.jsx
// ==========================================================

import React, { useState, useEffect, useCallback } from "react";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJSkeleton from "../components/FHJ/FHJSkeleton.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";

const STATUS_OPTIONS = ["Planning", "Confirmed", "Active", "Completed", "Cancelled"];
const ROLE_OPTIONS = ["Organizer", "Member", "Child"];
const PAYMENT_STATUS_OPTIONS = ["Unpaid", "Partial", "Paid"];

const EMPTY_MEMBER = {
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  dateOfBirth: "",
  role: "Member",
  paymentStatus: "Unpaid",
  amountPaid: "",
  amountDue: "",
  notes: "",
};

const EMPTY_TRIP = {
  name: "",
  destination: "",
  startDate: "",
  endDate: "",
  occasion: "",
  status: "Planning",
  totalBudget: "",
  notes: "",
  members: [],
};

export default function AdminGroupTrips({ admin }) {
  const toast = useToast();
  const [groupTrips, setGroupTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Trip modal state
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [tripForm, setTripForm] = useState(EMPTY_TRIP);

  // Member modal state
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMemberIdx, setEditingMemberIdx] = useState(null);
  const [memberForm, setMemberForm] = useState(EMPTY_MEMBER);

  const isAssistant = (admin?.role || admin?.Role) === "Assistant";

  // -------------------------------------------------------
  // Load group trips
  // -------------------------------------------------------
  const loadGroupTrips = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/.netlify/functions/admin-group-trips");
      const data = await res.json();
      const trips = data.groupTrips || [];
      setGroupTrips(trips);
      // Refresh selected trip if it's open
      setSelectedTrip((prev) => {
        if (!prev) return null;
        return trips.find((t) => t.id === prev.id) || prev;
      });
    } catch {
      toast.error("Failed to load group trips.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadGroupTrips();
  }, [loadGroupTrips]);

  // 30-second auto-refresh
  useEffect(() => {
    const interval = setInterval(() => loadGroupTrips(), 30000);
    return () => clearInterval(interval);
  }, [loadGroupTrips]);

  // -------------------------------------------------------
  // Trip Modal helpers
  // -------------------------------------------------------
  const openCreateTrip = () => {
    setEditingTrip(null);
    setTripForm({ ...EMPTY_TRIP, members: [] });
    setTripModalOpen(true);
  };

  const openEditTrip = (trip) => {
    setEditingTrip(trip);
    setTripForm({
      name: trip.name || "",
      destination: trip.destination || "",
      startDate: trip.start_date || "",
      endDate: trip.end_date || "",
      occasion: trip.occasion || "",
      status: trip.status || "Planning",
      totalBudget: trip.total_budget || "",
      notes: trip.notes || "",
      members: (trip.members || []).map((m) => ({
        clientName: m.client_name || "",
        clientEmail: m.client_email || "",
        clientPhone: m.client_phone || "",
        dateOfBirth: m.date_of_birth || "",
        role: m.role || "Member",
        paymentStatus: m.payment_status || "Unpaid",
        amountPaid: m.amount_paid || "",
        amountDue: m.amount_due || "",
        notes: m.notes || "",
      })),
    });
    setTripModalOpen(true);
  };

  const closeTripModal = () => {
    setTripModalOpen(false);
    setEditingTrip(null);
    setTripForm(EMPTY_TRIP);
  };

  // -------------------------------------------------------
  // Member Modal helpers (within trip form)
  // -------------------------------------------------------
  const openAddMember = () => {
    setEditingMemberIdx(null);
    setMemberForm({ ...EMPTY_MEMBER });
    setMemberModalOpen(true);
  };

  const openEditMember = (idx) => {
    setEditingMemberIdx(idx);
    setMemberForm({ ...tripForm.members[idx] });
    setMemberModalOpen(true);
  };

  const closeMemberModal = () => {
    setMemberModalOpen(false);
    setEditingMemberIdx(null);
    setMemberForm(EMPTY_MEMBER);
  };

  const saveMember = () => {
    if (!memberForm.clientName.trim()) {
      toast.error("Member name is required.");
      return;
    }
    const updated = [...tripForm.members];
    if (editingMemberIdx !== null) {
      updated[editingMemberIdx] = { ...memberForm };
    } else {
      updated.push({ ...memberForm });
    }
    setTripForm((f) => ({ ...f, members: updated }));
    closeMemberModal();
  };

  const removeMember = (idx) => {
    const updated = tripForm.members.filter((_, i) => i !== idx);
    setTripForm((f) => ({ ...f, members: updated }));
  };

  // -------------------------------------------------------
  // Save (Create or Update) trip
  // -------------------------------------------------------
  const handleSaveTrip = async () => {
    if (!tripForm.name.trim()) {
      toast.error("Trip name is required.");
      return;
    }
    setSaving(true);
    try {
      const method = editingTrip ? "PUT" : "POST";
      const payload = {
        ...tripForm,
        id: editingTrip?.id,
        totalBudget: parseFloat(tripForm.totalBudget) || 0,
        members: tripForm.members.map((m) => ({
          ...m,
          amountPaid: parseFloat(m.amountPaid) || 0,
          amountDue: parseFloat(m.amountDue) || 0,
        })),
      };
      const res = await fetch("/.netlify/functions/admin-group-trips", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save group trip.");
        return;
      }
      toast.success(editingTrip ? "Group trip updated!" : "Group trip created!");
      closeTripModal();
      await loadGroupTrips();
    } catch {
      toast.error("Failed to save group trip.");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------
  // Delete trip
  // -------------------------------------------------------
  const handleDeleteTrip = async (trip) => {
    if (!window.confirm(`Delete group trip "${trip.name}"? This will also delete all members.`)) return;
    setSaving(true);
    try {
      const res = await fetch("/.netlify/functions/admin-group-trips", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trip.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete group trip.");
        return;
      }
      toast.success("Group trip deleted.");
      if (selectedTrip?.id === trip.id) setSelectedTrip(null);
      await loadGroupTrips();
    } catch {
      toast.error("Failed to delete group trip.");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------
  // Payment summary helpers
  // -------------------------------------------------------
  const calcPaymentSummary = (members) => {
    const total = members.reduce((s, m) => s + (parseFloat(m.amount_due) || 0), 0);
    const collected = members.reduce((s, m) => s + (parseFloat(m.amount_paid) || 0), 0);
    return { total, collected, remaining: total - collected };
  };

  // -------------------------------------------------------
  // Status badge color
  // -------------------------------------------------------
  const statusColor = (status) => {
    if (status === "Confirmed") return { bg: "rgba(96,165,250,0.15)", color: "#60a5fa" };
    if (status === "Active") return { bg: "rgba(52,211,153,0.15)", color: "#34d399" };
    if (status === "Completed") return { bg: "rgba(74,222,128,0.15)", color: "#4ade80" };
    if (status === "Cancelled") return { bg: "rgba(248,113,113,0.15)", color: "#f87171" };
    return { bg: "rgba(255,255,255,0.08)", color: "#94a3b8" };
  };

  const paymentStatusColor = (status) => {
    if (status === "Paid") return { bg: "rgba(74,222,128,0.15)", color: "#4ade80" };
    if (status === "Partial") return { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" };
    return { bg: "rgba(248,113,113,0.15)", color: "#f87171" };
  };

  // -------------------------------------------------------
  // Render — Detail view
  // -------------------------------------------------------
  if (selectedTrip) {
    const members = selectedTrip.members || [];
    const summary = calcPaymentSummary(members);
    const sc = statusColor(selectedTrip.status);

    return (
      <div style={{ padding: "2rem" }}>
        {/* Back button + header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <FHJButton
            variant="ghost"
            onClick={() => setSelectedTrip(null)}
            style={{ fontSize: "0.9rem" }}
          >
            ← Back
          </FHJButton>
          <h2 style={{ color: fhjTheme.colors.accent, margin: 0, flexGrow: 1 }}>
            {selectedTrip.name}
          </h2>
          {!isAssistant && (
            <FHJButton
              onClick={() => openEditTrip(selectedTrip)}
              style={{ marginRight: "0.5rem" }}
            >
              ✏️ Edit Trip
            </FHJButton>
          )}
          {!isAssistant && (
            <FHJButton
              variant="danger"
              onClick={() => handleDeleteTrip(selectedTrip)}
            >
              🗑 Delete
            </FHJButton>
          )}
        </div>

        {/* Trip details card */}
        <FHJCard style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={detailGrid}>
            <DetailItem label="Destination" value={selectedTrip.destination} />
            <DetailItem label="Dates" value={
              selectedTrip.start_date && selectedTrip.end_date
                ? `${selectedTrip.start_date} — ${selectedTrip.end_date}`
                : selectedTrip.start_date || selectedTrip.end_date || "—"
            } />
            <DetailItem label="Occasion" value={selectedTrip.occasion} />
            <DetailItem label="Total Budget" value={
              selectedTrip.total_budget
                ? `$${Number(selectedTrip.total_budget).toLocaleString()}`
                : "—"
            } />
            <div>
              <div style={labelStyle}>Status</div>
              <span style={{
                padding: "0.25rem 0.65rem",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: 600,
                background: sc.bg,
                color: sc.color,
              }}>
                {selectedTrip.status || "Planning"}
              </span>
            </div>
            {selectedTrip.notes && (
              <DetailItem label="Notes" value={selectedTrip.notes} />
            )}
          </div>
        </FHJCard>

        {/* Member Roster */}
        <FHJCard style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <h3 style={{ margin: 0, color: "#fff" }}>
              Member Roster{" "}
              <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "0.9rem" }}>
                ({members.length} {members.length === 1 ? "member" : "members"})
              </span>
            </h3>
          </div>

          {members.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem 0" }}>
              No members yet. Edit the trip to add members.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    {["Name", "Date of Birth", "Email", "Phone", "Role", "Payment Status", "Paid", "Due"].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => {
                    const pc = paymentStatusColor(m.payment_status);
                    return (
                      <tr key={i} style={trStyle}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{m.client_name || "—"}</td>
                        <td style={tdStyle}>{m.date_of_birth || "—"}</td>
                        <td style={tdStyle}>{m.client_email || "—"}</td>
                        <td style={tdStyle}>{m.client_phone || "—"}</td>
                        <td style={tdStyle}>
                          <span style={roleBadge}>{m.role || "Member"}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: "0.2rem 0.55rem",
                            borderRadius: "20px",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            background: pc.bg,
                            color: pc.color,
                          }}>
                            {m.payment_status || "Unpaid"}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: "#4ade80" }}>
                          ${Number(m.amount_paid || 0).toLocaleString()}
                        </td>
                        <td style={{ ...tdStyle, color: "#fbbf24" }}>
                          ${Number(m.amount_due || 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </FHJCard>

        {/* Payment Summary */}
        <FHJCard style={{ padding: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#fff" }}>Payment Summary</h3>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <SummaryBox label="Total Trip Cost" value={`$${summary.total.toLocaleString()}`} color="#60a5fa" />
            <SummaryBox label="Total Collected" value={`$${summary.collected.toLocaleString()}`} color="#4ade80" />
            <SummaryBox label="Total Remaining" value={`$${summary.remaining.toLocaleString()}`} color="#fbbf24" />
          </div>
        </FHJCard>
      </div>
    );
  }

  // -------------------------------------------------------
  // Render — List view
  // -------------------------------------------------------
  return (
    <FHJCard style={{ padding: "2rem", minHeight: "80vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ color: fhjTheme.colors.accent, margin: 0 }}>Group &amp; Family Trips</h2>
        {!isAssistant && (
          <FHJButton onClick={openCreateTrip}>+ Create Group Trip</FHJButton>
        )}
      </div>

      {isAssistant && (
        <div style={assistantBanner}>
          You have <strong>view-only</strong> access. Editing is disabled.
        </div>
      )}

      {/* Trip cards */}
      {loading ? (
        <FHJSkeleton variant="table" rows={4} cols={5} />
      ) : groupTrips.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "#94a3b8" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧳</div>
          <p>No group trips yet. Click <strong>+ Create Group Trip</strong> to get started.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {groupTrips.map((trip) => {
            const sc = statusColor(trip.status);
            const memberCount = (trip.members || []).length;
            const summary = calcPaymentSummary(trip.members || []);
            return (
              <div
                key={trip.id}
                style={tripCardStyle}
                onClick={() => setSelectedTrip(trip)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#fff", marginBottom: "0.25rem" }}>
                      {trip.name}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                      {[trip.destination, trip.start_date && trip.end_date && `${trip.start_date} – ${trip.end_date}`, trip.occasion]
                        .filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{
                      padding: "0.25rem 0.65rem",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      background: sc.bg,
                      color: sc.color,
                    }}>
                      {trip.status || "Planning"}
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                      👥 {memberCount} {memberCount === 1 ? "member" : "members"}
                    </span>
                  </div>
                </div>

                {/* Member preview */}
                {memberCount > 0 && (
                  <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {(trip.members || []).slice(0, 6).map((m, i) => (
                      <span key={i} style={memberPillStyle}>
                        {m.client_name}
                        {m.date_of_birth && (
                          <span style={{ color: "#94a3b8", marginLeft: "0.35rem", fontSize: "0.75rem" }}>
                            {m.date_of_birth}
                          </span>
                        )}
                      </span>
                    ))}
                    {memberCount > 6 && (
                      <span style={{ ...memberPillStyle, color: "#94a3b8" }}>+{memberCount - 6} more</span>
                    )}
                  </div>
                )}

                {/* Payment quick summary */}
                <div style={{ marginTop: "0.75rem", display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: "#94a3b8" }}>
                  <span>💰 Budget: <strong style={{ color: "#fff" }}>${Number(trip.total_budget || 0).toLocaleString()}</strong></span>
                  <span>✅ Collected: <strong style={{ color: "#4ade80" }}>${summary.collected.toLocaleString()}</strong></span>
                  <span>⏳ Remaining: <strong style={{ color: "#fbbf24" }}>${summary.remaining.toLocaleString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Trip Create/Edit Modal ── */}
      {tripModalOpen && (
        <div style={modalOverlay} onClick={(e) => e.target === e.currentTarget && closeTripModal()}>
          <div style={modalBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, color: fhjTheme.colors.accent }}>
                {editingTrip ? "Edit Group Trip" : "Create Group Trip"}
              </h3>
              <button onClick={closeTripModal} style={closeBtn}>✕</button>
            </div>

            {/* Trip fields */}
            <div style={formGrid}>
              <div style={{ gridColumn: "1 / -1" }}>
                <FHJInput
                  label="Trip Name *"
                  value={tripForm.name}
                  onChange={(e) => setTripForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Jeffers Family Vacation - Jamaica 2026"
                />
              </div>
              <FHJInput
                label="Destination"
                value={tripForm.destination}
                onChange={(e) => setTripForm((f) => ({ ...f, destination: e.target.value }))}
                placeholder="e.g. Jamaica"
              />
              <FHJInput
                label="Occasion"
                value={tripForm.occasion}
                onChange={(e) => setTripForm((f) => ({ ...f, occasion: e.target.value }))}
                placeholder="e.g. Family Reunion"
              />
              <FHJInput
                label="Start Date"
                value={tripForm.startDate}
                onChange={(e) => setTripForm((f) => ({ ...f, startDate: e.target.value }))}
                placeholder="e.g. June 21, 2026"
              />
              <FHJInput
                label="End Date"
                value={tripForm.endDate}
                onChange={(e) => setTripForm((f) => ({ ...f, endDate: e.target.value }))}
                placeholder="e.g. June 28, 2026"
              />
              <div>
                <label style={fieldLabel}>Status</label>
                <select
                  value={tripForm.status}
                  onChange={(e) => setTripForm((f) => ({ ...f, status: e.target.value }))}
                  style={selectStyle}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <FHJInput
                label="Total Budget ($)"
                value={tripForm.totalBudget}
                onChange={(e) => setTripForm((f) => ({ ...f, totalBudget: e.target.value }))}
                placeholder="e.g. 10000"
                type="number"
              />
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabel}>Notes</label>
                <textarea
                  value={tripForm.notes}
                  onChange={(e) => setTripForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  style={textareaStyle}
                  rows={3}
                />
              </div>
            </div>

            {/* Members section */}
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h4 style={{ margin: 0, color: "#fff" }}>
                  Members ({tripForm.members.length})
                </h4>
                <FHJButton onClick={openAddMember} style={{ fontSize: "0.85rem", padding: "0.4rem 0.9rem" }}>
                  + Add Member
                </FHJButton>
              </div>

              {tripForm.members.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>No members added yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "220px", overflowY: "auto" }}>
                  {tripForm.members.map((m, i) => (
                    <div key={i} style={memberRowStyle}>
                      <div style={{ flexGrow: 1 }}>
                        <span style={{ fontWeight: 600 }}>{m.clientName || "—"}</span>
                        {m.dateOfBirth && <span style={{ color: "#94a3b8", marginLeft: "0.5rem", fontSize: "0.85rem" }}>{m.dateOfBirth}</span>}
                        {m.clientEmail && <span style={{ color: "#94a3b8", marginLeft: "0.5rem", fontSize: "0.85rem" }}>{m.clientEmail}</span>}
                        <span style={{ ...roleBadge, marginLeft: "0.5rem" }}>{m.role}</span>
                        {m.amountDue && (
                          <span style={{ color: "#fbbf24", marginLeft: "0.5rem", fontSize: "0.85rem" }}>
                            Due: ${Number(m.amountDue).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button onClick={() => openEditMember(i)} style={iconBtn}>✏️</button>
                        <button onClick={() => removeMember(i)} style={{ ...iconBtn, color: "#f87171" }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <FHJButton variant="ghost" onClick={closeTripModal}>Cancel</FHJButton>
              <FHJButton onClick={handleSaveTrip} disabled={saving}>
                {saving ? "Saving…" : editingTrip ? "Update Trip" : "Create Trip"}
              </FHJButton>
            </div>
          </div>
        </div>
      )}

      {/* ── Member Add/Edit Modal ── */}
      {memberModalOpen && (
        <div style={modalOverlay} onClick={(e) => e.target === e.currentTarget && closeMemberModal()}>
          <div style={{ ...modalBox, maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, color: fhjTheme.colors.accent }}>
                {editingMemberIdx !== null ? "Edit Member" : "Add Member"}
              </h3>
              <button onClick={closeMemberModal} style={closeBtn}>✕</button>
            </div>

            <div style={formGrid}>
              <div style={{ gridColumn: "1 / -1" }}>
                <FHJInput
                  label="Full Name *"
                  value={memberForm.clientName}
                  onChange={(e) => setMemberForm((f) => ({ ...f, clientName: e.target.value }))}
                  placeholder="e.g. Ruby Jeffers"
                />
              </div>
              <FHJInput
                label="Date of Birth"
                value={memberForm.dateOfBirth}
                onChange={(e) => setMemberForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                placeholder="e.g. 03/21/47"
              />
              <FHJInput
                label="Email"
                value={memberForm.clientEmail}
                onChange={(e) => setMemberForm((f) => ({ ...f, clientEmail: e.target.value }))}
                placeholder="email@example.com"
                type="email"
              />
              <FHJInput
                label="Phone"
                value={memberForm.clientPhone}
                onChange={(e) => setMemberForm((f) => ({ ...f, clientPhone: e.target.value }))}
                placeholder="e.g. 555-555-5555"
              />
              <div>
                <label style={fieldLabel}>Role</label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm((f) => ({ ...f, role: e.target.value }))}
                  style={selectStyle}
                >
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={fieldLabel}>Payment Status</label>
                <select
                  value={memberForm.paymentStatus}
                  onChange={(e) => setMemberForm((f) => ({ ...f, paymentStatus: e.target.value }))}
                  style={selectStyle}
                >
                  {PAYMENT_STATUS_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <FHJInput
                label="Amount Paid ($)"
                value={memberForm.amountPaid}
                onChange={(e) => setMemberForm((f) => ({ ...f, amountPaid: e.target.value }))}
                placeholder="0"
                type="number"
              />
              <FHJInput
                label="Amount Due ($)"
                value={memberForm.amountDue}
                onChange={(e) => setMemberForm((f) => ({ ...f, amountDue: e.target.value }))}
                placeholder="0"
                type="number"
              />
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={fieldLabel}>Notes</label>
                <textarea
                  value={memberForm.notes}
                  onChange={(e) => setMemberForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional notes about this member..."
                  style={textareaStyle}
                  rows={2}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <FHJButton variant="ghost" onClick={closeMemberModal}>Cancel</FHJButton>
              <FHJButton onClick={saveMember}>
                {editingMemberIdx !== null ? "Update Member" : "Add Member"}
              </FHJButton>
            </div>
          </div>
        </div>
      )}
    </FHJCard>
  );
}

// ── Small helper components ────────────────────────────────
function DetailItem({ label, value }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={{ color: "#fff", fontSize: "0.95rem" }}>{value || "—"}</div>
    </div>
  );
}

function SummaryBox({ label, value, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      borderRadius: "10px",
      padding: "1rem 1.5rem",
      minWidth: "160px",
      flex: 1,
    }}>
      <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: "0.4rem" }}>{label}</div>
      <div style={{ color, fontSize: "1.4rem", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────
const assistantBanner = {
  background: "rgba(255, 200, 0, 0.15)",
  color: "#fbbf24",
  padding: "0.75rem",
  borderRadius: "8px",
  marginBottom: "1.5rem",
};

const detailGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "1.2rem",
};

const labelStyle = {
  color: "#94a3b8",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.3rem",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.9rem",
};

const thStyle = {
  textAlign: "left",
  padding: "0.6rem 0.8rem",
  color: "#94a3b8",
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "0.7rem 0.8rem",
  color: "#e2e8f0",
  borderBottom: "1px solid rgba(255,255,255,0.05)",
};

const trStyle = {
  transition: "background 0.15s",
};

const roleBadge = {
  display: "inline-block",
  padding: "0.15rem 0.5rem",
  borderRadius: "20px",
  fontSize: "0.75rem",
  fontWeight: 600,
  background: "rgba(212,175,55,0.15)",
  color: "#d4af37",
};

const tripCardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  padding: "1.2rem 1.5rem",
  cursor: "pointer",
  transition: "border-color 0.2s, background 0.2s",
};

const memberPillStyle = {
  display: "inline-block",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "20px",
  padding: "0.2rem 0.7rem",
  fontSize: "0.82rem",
  color: "#e2e8f0",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "1rem",
};

const modalBox = {
  background: "#1a1f2e",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "16px",
  padding: "2rem",
  width: "100%",
  maxWidth: "700px",
  maxHeight: "90vh",
  overflowY: "auto",
};

const closeBtn = {
  background: "none",
  border: "none",
  color: "#94a3b8",
  fontSize: "1.2rem",
  cursor: "pointer",
  padding: "0.2rem",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "1rem",
};

const fieldLabel = {
  display: "block",
  color: "#94a3b8",
  fontSize: "0.82rem",
  marginBottom: "0.35rem",
};

const selectStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "8px",
  color: "#fff",
  padding: "0.6rem 0.8rem",
  fontSize: "0.9rem",
  outline: "none",
};

const textareaStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "8px",
  color: "#fff",
  padding: "0.6rem 0.8rem",
  fontSize: "0.9rem",
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
};

const memberRowStyle = {
  display: "flex",
  alignItems: "center",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  padding: "0.6rem 0.8rem",
  fontSize: "0.9rem",
  color: "#e2e8f0",
};

const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "0.9rem",
  padding: "0.2rem 0.4rem",
  color: "#94a3b8",
};
