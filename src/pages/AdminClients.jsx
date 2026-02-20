// ==========================================================
// 📄 FILE: AdminClients.jsx  (PHASE 6 — BUILD OUT)
// Location: src/pages/AdminClients.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { FHJCard, FHJButton, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJDataTable from "../components/FHJ/FHJDataTable.jsx";
import FHJFormModal from "../components/FHJ/FHJFormModal.jsx";
import FHJSkeleton from "../components/FHJ/FHJSkeleton.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";

const CLIENT_FIELDS = [
  { key: "name", label: "Full Name", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "phone", label: "Phone" },
  { key: "address", label: "City / Address" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export default function AdminClients({ admin }) {
  const toast = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const isAssistant = (admin?.role || admin?.Role) === "Assistant";

  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/.netlify/functions/admin-clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      toast.error("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClients(); }, []);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      await fetch("/.netlify/functions/admin-clients", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: editing?.id }),
      });
      toast.success(editing ? "Client updated!" : "Client added!");
      setModalOpen(false);
      setEditing(null);
      loadClients();
    } catch (err) {
      toast.error("Failed to save client.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Remove ${client.name}?`)) return;
    setSaving(true);
    try {
      await fetch("/.netlify/functions/admin-clients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: client.id }),
      });
      toast.success("Client removed.");
      loadClients();
    } catch (err) {
      toast.error("Failed to delete client.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setEditing({
      id: c.id,
      name: c.name || c["Full Name"] || "",
      email: c.email || c.Email || "",
      phone: c.phone || c.Phone || "",
      address: c.address || c.Address || "",
      notes: c.notes || c.Notes || "",
    });
    setModalOpen(true);
  };

  const columns = [
    { key: "name", label: "Name", cellStyle: { fontWeight: 600 } },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "City" },
  ];

  const tableData = clients.map((c) => ({
    id: c.id,
    name: c.fullName || c.name || c["Full Name"] || "—",
    email: c.email || c.Email || "—",
    phone: c.phone || c.Phone || "—",
    address: c.address || c.Address || c.City || "—",
    notes: c.notes || c.Notes || "",
  }));

  // Search filter
  const filtered = search.trim()
    ? tableData.filter((c) =>
        [c.name, c.email, c.phone, c.address]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : tableData;

  return (
    <FHJCard style={{ padding: "2rem", minHeight: "80vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{ color: fhjTheme.colors.accent, margin: 0 }}>Clients Manager</h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchStyle}
          />
          {!isAssistant && (
            <FHJButton onClick={() => { setEditing(null); setModalOpen(true); }}>
              + Add Client
            </FHJButton>
          )}
        </div>
      </div>

      {isAssistant && (
        <div style={assistantBanner}>
          You have <strong>view‑only</strong> access. Editing is disabled.
        </div>
      )}

      {/* Stats row */}
      {!loading && (
        <div style={statsRow}>
          <span style={{ color: "#94a3b8" }}>
            Showing <strong style={{ color: "white" }}>{filtered.length}</strong> of{" "}
            <strong style={{ color: "white" }}>{tableData.length}</strong> clients
          </span>
        </div>
      )}

      {loading ? (
        <FHJSkeleton variant="table" rows={6} cols={4} />
      ) : (
        <FHJDataTable
          columns={columns}
          data={filtered}
          onEdit={isAssistant ? null : handleEdit}
          onDelete={isAssistant ? null : handleDelete}
          loading={false}
          saving={saving}
          emptyMessage={search ? "No clients match your search." : "No clients found. Click '+ Add Client' to get started."}
        />
      )}

      {modalOpen && (
        <FHJFormModal
          title={editing ? "Edit Client" : "Add Client"}
          fields={CLIENT_FIELDS}
          initialValues={editing}
          onClose={() => { setModalOpen(false); setEditing(null); }}
          onSubmit={handleSave}
          saving={saving}
        />
      )}
    </FHJCard>
  );
}

const searchStyle = {
  padding: "0.6rem 1rem",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
  fontSize: "0.85rem",
  width: "220px",
  outline: "none",
};

const assistantBanner = {
  background: "rgba(255, 200, 0, 0.15)",
  color: "#fbbf24",
  padding: "0.75rem",
  borderRadius: "8px",
  marginBottom: "1.5rem",
};

const statsRow = {
  marginBottom: "1rem",
  fontSize: "0.85rem",
};
