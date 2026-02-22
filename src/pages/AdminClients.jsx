// ==========================================================
// FILE: AdminClients.jsx
// Clients Manager for Admin Portal
// Location: src/pages/AdminClients.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminClients({ admin }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const isAssistant = (admin?.role || admin?.Role) === "Assistant";

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

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", address: "", notes: "" });
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
    });
    setEditing(client);
    setShowForm(true);
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
      setError("Network error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client) => {
    const name = client.name || "this client";
    if (!window.confirm(`Delete "${name}"?`)) return;

    try {
      await fetch("/.netlify/functions/admin-clients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: client.id }),
      });
      setSuccess("Client deleted.");
      setTimeout(() => setSuccess(""), 3000);
      loadClients();
    } catch (err) {
      setError("Failed to delete.");
    }
  };

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

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <FHJCard style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "white", margin: "0 0 1.25rem", fontSize: "1.1rem" }}>
                {editing ? "Edit Client" : "New Client"}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
          {[1, 2, 3].map(i => (
            <FHJCard key={i} style={{ height: "200px", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ padding: "1.5rem" }}>Loading...</div>
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
          {clients.map(client => (
            <motion.div key={client.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <FHJCard style={{ padding: "1.5rem" }}>
                <h4 style={{ color: "white", margin: 0, fontSize: "1.1rem" }}>{client.name}</h4>
                <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0.5rem 0" }}>{client.email}</p>
                {client.phone && <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.25rem 0" }}>{client.phone}</p>}
                {client.address && <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0.5rem 0 0", opacity: 0.7 }}>{client.address}</p>}

                {!isAssistant && (
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    <button onClick={() => handleEdit(client)} style={actionBtnStyle}>Edit</button>
                    <button onClick={() => handleDelete(client)} style={{ ...actionBtnStyle, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>Delete</button>
                  </div>
                )}
              </FHJCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Styles
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
