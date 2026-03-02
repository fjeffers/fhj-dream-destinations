// ==========================================================
// FILE: AdminSettings.jsx — Admin Settings + User Management
// Location: src/pages/AdminSettings.jsx
//
// Features:
//   - View all admin users
//   - Add new admin (name, email, role, password)
//   - Edit existing admin
//   - Delete admin (with confirmation)
//   - Roles: Owner, Manager, Agent, Assistant
// ==========================================================

import React, { useState, useEffect } from "react";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { adminFetch } from "../utils/adminFetch.js";

const ROLES = ["Owner", "Manager", "Agent", "Assistant"];

const ROLE_COLORS = {
  Owner: { bg: "rgba(212,175,55,0.12)", text: "#D4AF37", border: "rgba(212,175,55,0.3)" },
  Manager: { bg: "rgba(96,165,250,0.12)", text: "#60a5fa", border: "rgba(96,165,250,0.3)" },
  Agent: { bg: "rgba(0,196,140,0.12)", text: "#00c48c", border: "rgba(0,196,140,0.3)" },
  Assistant: { bg: "rgba(167,139,250,0.12)", text: "#a78bfa", border: "rgba(167,139,250,0.3)" },
};

const emptyForm = { name: "", email: "", role: "Agent", password: "" };

export default function AdminSettings({ admin }) {
  const toast = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showCodes, setShowCodes] = useState({});

  useEffect(() => { loadAdmins(); }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/.netlify/functions/admin-users");
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (err) {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (adm) => {
    setEditingId(adm.id);
    setForm({
      name: adm.name || adm.Name || "",
      email: adm.email || adm.Email || "",
      role: adm.role || adm.Role || "Agent",
      password: "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!editingId && !form.password.trim()) {
      toast.error("Access code is required for new admins");
      return;
    }

    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { id: editingId, ...form }
        : form;

      // Don't send empty password on edit
      if (editingId && !form.password.trim()) {
        delete body.password;
      }

      const res = await adminFetch("/.netlify/functions/admin-users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(editingId ? "Admin updated!" : "Admin created!");
        closeForm();
        loadAdmins();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await adminFetch(`/.netlify/functions/admin-users?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Admin removed");
        setDeleteConfirm(null);
        loadAdmins();
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  const toggleCode = (id) => {
    setShowCodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentUserRole = admin?.role || admin?.Role || "";
  const isOwner = currentUserRole === "Owner";

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ color: "white", fontSize: "1.6rem", fontWeight: 400, margin: 0 }}>Settings</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            Manage admin users and platform settings
          </p>
        </div>
      </div>

      {/* ── Admin Users Section ──────────────────── */}
      <FHJCard style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ color: "white", fontSize: "1.15rem", fontWeight: 500, margin: 0 }}>Admin Users</h2>
            <p style={{ color: "#64748b", fontSize: "0.78rem", marginTop: "0.25rem" }}>
              {admins.length} user{admins.length !== 1 ? "s" : ""}
            </p>
          </div>
          <FHJButton onClick={openAdd} style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
            + Add Admin
          </FHJButton>
        </div>

        {/* Admin List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
            <p>Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
            <p style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>👥</p>
            <p>No admin users found. Add one to get started.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {admins.map((adm) => {
              const name = adm.name || adm.Name || "Unknown";
              const email = adm.email || adm.Email || "";
              const role = adm.role || adm.Role || "Agent";
              const code = adm.password || adm.Password || "";
              const rc = ROLE_COLORS[role] || ROLE_COLORS.Agent;
              const isCurrentUser = email.toLowerCase() === (admin?.email || admin?.Email || "").toLowerCase();

              return (
                <motion.div
                  key={adm.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    padding: "0.9rem 1rem", borderRadius: "12px",
                    background: isCurrentUser ? "rgba(0,196,140,0.04)" : "rgba(255,255,255,0.02)",
                    border: isCurrentUser
                      ? `1px solid rgba(0,196,140,0.15)`
                      : "1px solid rgba(255,255,255,0.06)",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: rc.bg, border: `1px solid ${rc.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem", fontWeight: 600, color: rc.text, flexShrink: 0,
                  }}>
                    {name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: "150px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>{name}</span>
                      {isCurrentUser && (
                        <span style={{
                          padding: "0.1rem 0.5rem", borderRadius: "999px", fontSize: "0.6rem",
                          background: "rgba(0,196,140,0.12)", color: fhjTheme.primary, fontWeight: 600,
                        }}>You</span>
                      )}
                      <span style={{
                        padding: "0.15rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem",
                        background: rc.bg, color: rc.text, border: `1px solid ${rc.border}`, fontWeight: 600,
                      }}>{role}</span>
                    </div>
                    <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0.15rem 0 0" }}>{email}</p>
                  </div>

                  {/* Password Toggle */}
                  <div style={{ minWidth: "100px", textAlign: "center" }}>
                    <button
                      onClick={() => toggleCode(adm.id)}
                      style={{
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "6px", padding: "0.3rem 0.6rem", cursor: "pointer",
                        color: "#94a3b8", fontSize: "0.72rem", transition: "all 0.2s",
                      }}
                    >
                      {showCodes[adm.id] ? code || "N/A" : "•••••"}
                    </button>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      onClick={() => openEdit(adm)}
                      style={actionBtn}
                      title="Edit"
                    >✏️</button>

                    {!isCurrentUser && (
                      <>
                        {deleteConfirm === adm.id ? (
                          <div style={{ display: "flex", gap: "0.3rem" }}>
                            <button
                              onClick={() => handleDelete(adm.id)}
                              style={{ ...actionBtn, background: "rgba(248,113,113,0.15)", borderColor: "rgba(248,113,113,0.3)" }}
                              title="Confirm delete"
                            >✓</button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              style={actionBtn}
                              title="Cancel"
                            >✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(adm.id)}
                            style={actionBtn}
                            title="Delete"
                          >🗑️</button>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </FHJCard>

      {/* ── Add/Edit Modal ───────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={modalOverlay}
            onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
            >
              <FHJCard style={{ padding: "1.75rem", width: "440px", maxWidth: "95vw" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h3 style={{ color: "white", fontSize: "1.15rem", fontWeight: 500, margin: 0 }}>
                    {editingId ? "Edit Admin" : "Add New Admin"}
                  </h3>
                  <button onClick={closeForm} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <FHJInput
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Email *</label>
                    <FHJInput
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@fhjdreamdestinations.com"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Role</label>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {ROLES.map((r) => {
                        const rc = ROLE_COLORS[r];
                        const selected = form.role === r;
                        return (
                          <button
                            key={r}
                            onClick={() => setForm({ ...form, role: r })}
                            style={{
                              padding: "0.45rem 1rem", borderRadius: "999px",
                              border: `1px solid ${selected ? rc.border : "rgba(255,255,255,0.1)"}`,
                              background: selected ? rc.bg : "rgba(255,255,255,0.03)",
                              color: selected ? rc.text : "rgba(255,255,255,0.5)",
                              cursor: "pointer", fontSize: "0.82rem", fontWeight: selected ? 600 : 400,
                              transition: "all 0.2s",
                            }}
                          >{r}</button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      Password {editingId ? "(leave blank to keep current)" : "*"}
                    </label>
                    <FHJInput
                      type="text"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder={editingId ? "••••• (unchanged)" : "Enter password"}
                    />
                    <p style={{ color: "#475569", fontSize: "0.7rem", marginTop: "0.3rem" }}>
                      This is the PIN/password used to log in to the admin dashboard.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <FHJButton variant="ghost" onClick={closeForm} style={{ padding: "0.6rem 1.5rem" }}>
                    Cancel
                  </FHJButton>
                  <FHJButton onClick={handleSave} disabled={saving} style={{ padding: "0.6rem 1.5rem" }}>
                    {saving ? "Saving..." : editingId ? "Update" : "Create Admin"}
                  </FHJButton>
                </div>
              </FHJCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Role Legend ───────────────────────────── */}
      <FHJCard style={{ padding: "1.25rem" }}>
        <h3 style={{ color: "white", fontSize: "0.95rem", fontWeight: 500, marginTop: 0, marginBottom: "1rem" }}>Role Permissions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
          {[
            { role: "Owner", desc: "Full access. Can manage all users and settings." },
            { role: "Manager", desc: "Can manage clients, trips, events, and agents." },
            { role: "Agent", desc: "Can manage assigned clients and bookings." },
            { role: "Assistant", desc: "View-only access with limited actions." },
          ].map(({ role, desc }) => {
            const rc = ROLE_COLORS[role];
            return (
              <div key={role} style={{
                padding: "0.75rem", borderRadius: "10px",
                background: rc.bg, border: `1px solid ${rc.border}`,
              }}>
                <p style={{ color: rc.text, fontWeight: 600, fontSize: "0.85rem", margin: "0 0 0.25rem" }}>{role}</p>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", margin: 0, lineHeight: 1.4 }}>{desc}</p>
              </div>
            );
          })}
        </div>
      </FHJCard>
    </div>
  );
}

// ── Styles ──────────────────────────────────────
const labelStyle = {
  color: "rgba(255,255,255,0.7)", fontSize: "0.78rem",
  marginBottom: "0.4rem", fontWeight: 500,
  textTransform: "uppercase", letterSpacing: "0.5px",
  display: "block",
};

const actionBtn = {
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px", padding: "0.35rem 0.5rem", cursor: "pointer",
  fontSize: "0.8rem", transition: "all 0.2s",
};

const modalOverlay = {
  position: "fixed", inset: 0, zIndex: 1000,
  background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "1rem",
};