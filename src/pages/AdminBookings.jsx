// ==========================================================
// 📄 FILE: AdminBookings.jsx  (PHASE 4 — BUILD OUT)
// Bookings management using shared FHJ components
// Location: src/pages/AdminBookings.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { FHJCard, FHJButton, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJDataTable from "../components/FHJ/FHJDataTable.jsx";
import FHJFormModal, { BOOKING_FIELDS } from "../components/FHJ/FHJFormModal.jsx";
import FHJSkeleton from "../components/FHJ/FHJSkeleton.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";

export default function AdminBookings({ admin }) {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  const isAssistant = (admin?.role || admin?.Role) === "Assistant";

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/.netlify/functions/admin-bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      toast.error("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const method = editingBooking ? "PUT" : "POST";
      await fetch("/.netlify/functions/admin-bookings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingBooking?.id,
          email: formData.email,
          clientName: formData.clientName,
          tripName: formData.tripName,
          travelDates: formData.travelDates,
          status: formData.status,
        }),
      });
      toast.success(editingBooking ? "Booking updated!" : "Booking created!");
      setModalOpen(false);
      setEditingBooking(null);
      loadBookings();
    } catch (err) {
      toast.error("Failed to save booking.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (booking) => {
    if (!window.confirm(`Delete booking for ${booking.clientName}?`)) return;
    setSaving(true);
    try {
      await fetch("/.netlify/functions/admin-bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: booking.id }),
      });
      toast.success("Booking deleted.");
      loadBookings();
    } catch (err) {
      toast.error("Failed to delete booking.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking({
      id: booking.id,
      clientName: booking.clientName || "",
      email: booking.email || "",
      tripName: booking.tripName || "",
      travelDates: booking.travelDates || "",
      status: booking.status || "",
    });
    setModalOpen(true);
  };

  const columns = [
    { key: "clientName", label: "Client", cellStyle: { fontWeight: 600 } },
    { key: "email", label: "Email" },
    { key: "tripName", label: "Destination" },
    { key: "travelDates", label: "Dates" },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span style={{
          padding: "0.25rem 0.65rem",
          borderRadius: "20px",
          fontSize: "0.8rem",
          fontWeight: 600,
          background: val === "Confirmed" ? "rgba(74,222,128,0.15)" :
                      val === "Upcoming" ? "rgba(96,165,250,0.15)" :
                      val === "Pending" ? "rgba(251,191,36,0.15)" :
                      val === "Completed" ? "rgba(148,163,184,0.15)" :
                      val === "Cancelled" ? "rgba(248,113,113,0.15)" :
                      "rgba(255,255,255,0.08)",
          color: val === "Confirmed" ? "#4ade80" :
                 val === "Upcoming" ? "#60a5fa" :
                 val === "Pending" ? "#fbbf24" :
                 val === "Completed" ? "#94a3b8" :
                 val === "Cancelled" ? "#f87171" :
                 "#94a3b8",
        }}>
          {val || "—"}
        </span>
      ),
    },
  ];

  const tableData = bookings.map((b) => ({
    id: b.id,
    clientName: b.clientName || "—",
    email: b.email || "—",
    tripName: b.tripName || "—",
    travelDates: b.travelDates || "—",
    status: b.status || "—",
  }));

  // Summary stats
  const confirmedCount = tableData.filter((b) => b.status === "Confirmed" || b.status === "Upcoming").length;
  const pendingCount = tableData.filter((b) => b.status === "Pending").length;

  return (
    <FHJCard style={{ padding: "2rem", minHeight: "80vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ color: fhjTheme.colors.accent, margin: 0 }}>Bookings Manager</h2>
        {!isAssistant && (
          <FHJButton onClick={() => { setEditingBooking(null); setModalOpen(true); }}>
            + Add Booking
          </FHJButton>
        )}
      </div>

      {isAssistant && (
        <div style={assistantBanner}>
          You have <strong>view‑only</strong> access. Editing is disabled.
        </div>
      )}

      {/* Summary Stats */}
      {!loading && (
        <div style={summaryGridStyle}>
          <div style={summaryCard}>
            <span style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase" }}>Total Bookings</span>
            <span style={{ color: "white", fontSize: "1.6rem", fontWeight: 800 }}>{tableData.length}</span>
          </div>
          <div style={summaryCard}>
            <span style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase" }}>Confirmed</span>
            <span style={{ color: "#4ade80", fontSize: "1.6rem", fontWeight: 800 }}>{confirmedCount}</span>
          </div>
          <div style={summaryCard}>
            <span style={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "uppercase" }}>Pending</span>
            <span style={{ color: "#fbbf24", fontSize: "1.6rem", fontWeight: 800 }}>{pendingCount}</span>
          </div>
        </div>
      )}

      {loading ? (
        <FHJSkeleton variant="table" rows={5} cols={7} />
      ) : (
        <FHJDataTable
          columns={columns}
          data={tableData}
          onEdit={isAssistant ? null : handleEdit}
          onDelete={isAssistant ? null : handleDelete}
          loading={false}
          saving={saving}
          emptyMessage="No bookings found."
        />
      )}

      {modalOpen && (
        <FHJFormModal
          title={editingBooking ? "Edit Booking" : "Add Booking"}
          fields={BOOKING_FIELDS}
          initialValues={editingBooking}
          onClose={() => { setModalOpen(false); setEditingBooking(null); }}
          onSubmit={handleSave}
          saving={saving}
        />
      )}
    </FHJCard>
  );
}

const assistantBanner = {
  background: "rgba(255, 200, 0, 0.15)",
  color: "#fbbf24",
  padding: "0.75rem",
  borderRadius: "8px",
  marginBottom: "1.5rem",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "0.75rem",
  marginBottom: "1.5rem",
};

const summaryCard = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  padding: "1rem",
  background: "rgba(255,255,255,0.03)",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.06)",
};
