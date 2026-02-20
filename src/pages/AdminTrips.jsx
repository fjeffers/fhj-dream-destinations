// ==========================================================
// 📄 FILE: AdminTrips.jsx  (PHASE 3 — LUXURY POLISH)
// ⭐ Consistent styling, role-based access, skeletons,
//    toasts, uses FHJDataTable and FHJFormModal
// Location: src/pages/AdminTrips.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { FHJCard, FHJButton, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJDataTable from "../components/FHJ/FHJDataTable.jsx";
import FHJFormModal, { TRIP_FIELDS } from "../components/FHJ/FHJFormModal.jsx";
import FHJSkeleton from "../components/FHJ/FHJSkeleton.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";

export default function AdminTrips({ admin }) {
  const toast = useToast();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const isAssistant = (admin?.role || admin?.Role) === "Assistant";

  // -------------------------------------------------------
  // Load
  // -------------------------------------------------------
  const loadTrips = async () => {
    try {
      setLoading(true);
      const res = await fetch("/.netlify/functions/admin-trips");
      const data = await res.json();
      setTrips(data.trips || []);
    } catch (err) {
      toast.error("Failed to load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrips(); }, []);

  // -------------------------------------------------------
  // Save (Create or Update)
  // -------------------------------------------------------
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const method = editingTrip ? "PUT" : "POST";
      await fetch("/.netlify/functions/admin-trips", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: editingTrip?.id }),
      });

      toast.success(editingTrip ? "Trip updated!" : "Trip created!");
      setModalOpen(false);
      setEditingTrip(null);
      loadTrips();
    } catch (err) {
      toast.error("Failed to save trip.");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------
  // Delete
  // -------------------------------------------------------
  const handleDelete = async (trip) => {
    if (!window.confirm(`Delete trip to ${trip.destination || trip.Destination}?`)) return;

    setSaving(true);
    try {
      await fetch("/.netlify/functions/admin-trips", {
        method: "DELETE",
        body: JSON.stringify({ id: trip.id }),
      });
      toast.success("Trip deleted.");
      loadTrips();
    } catch (err) {
      toast.error("Failed to delete trip.");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------
  // Edit
  // -------------------------------------------------------
  const handleEdit = (trip) => {
    setEditingTrip({
      id: trip.id,
      destination: trip.destination || trip.Destination || "",
      client: trip.client || trip["Client Email"] || "",
      startDate: trip.startDate || trip.StartDate || "",
      endDate: trip.endDate || trip.EndDate || "",
      tripType: trip.tripType || trip["Trip Type"] || "",
      status: trip.status || trip.Status || "",
      notes: trip.notes || trip.Notes || "",
    });
    setModalOpen(true);
  };

  // -------------------------------------------------------
  // Table columns
  // -------------------------------------------------------
  const columns = [
    { key: "destination", label: "Destination", cellStyle: { fontWeight: 600 } },
    { key: "client", label: "Client" },
    { key: "startDate", label: "Start" },
    { key: "endDate", label: "End" },
    { key: "tripType", label: "Type" },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span style={{
          padding: "0.25rem 0.65rem",
          borderRadius: "20px",
          fontSize: "0.8rem",
          fontWeight: 600,
          background: val === "Completed" ? "rgba(74,222,128,0.15)" :
                      val === "Active" ? "rgba(96,165,250,0.15)" :
                      "rgba(255,255,255,0.08)",
          color: val === "Completed" ? "#4ade80" :
                 val === "Active" ? "#60a5fa" :
                 "#94a3b8",
        }}>
          {val || "—"}
        </span>
      ),
    },
  ];

  // Normalize trip data for table
  const tableData = trips.map((t) => ({
    id: t.id,
    destination: t.destination || t.Destination || "—",
    client: t.client || t["Client Email"] || "—",
    startDate: t.startDate || t.StartDate || "—",
    endDate: t.endDate || t.EndDate || "—",
    tripType: t.tripType || t["Trip Type"] || "—",
    status: t.status || t.Status || "—",
    notes: t.notes || t.Notes || "",
    _raw: t, // Keep raw data for editing
  }));

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <FHJCard style={{ padding: "2rem", minHeight: "80vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ color: fhjTheme.colors.accent, margin: 0 }}>Trips Manager</h2>
        {!isAssistant && (
          <FHJButton onClick={() => { setEditingTrip(null); setModalOpen(true); }}>
            + Add Trip
          </FHJButton>
        )}
      </div>

      {isAssistant && (
        <div style={assistantBanner}>
          You have <strong>view‑only</strong> access. Editing is disabled.
        </div>
      )}

      {/* Table */}
      {loading ? (
        <FHJSkeleton variant="table" rows={5} cols={6} />
      ) : (
        <FHJDataTable
          columns={columns}
          data={tableData}
          onEdit={isAssistant ? null : handleEdit}
          onDelete={isAssistant ? null : handleDelete}
          loading={false}
          saving={saving}
          emptyMessage="No trips found. Click '+ Add Trip' to create one."
        />
      )}

      {/* Modal */}
      {modalOpen && (
        <FHJFormModal
          title={editingTrip ? "Edit Trip" : "Add Trip"}
          fields={TRIP_FIELDS}
          initialValues={editingTrip}
          onClose={() => { setModalOpen(false); setEditingTrip(null); }}
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
