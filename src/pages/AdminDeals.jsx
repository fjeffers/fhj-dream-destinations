// ==========================================================
// FILE: AdminDeals.jsx — Deals Manager with Image Upload
// Location: src/pages/AdminDeals.jsx
// ==========================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FHJCard, FHJButton, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Beach", "Mountain", "City", "Cruise", "Safari", "Cultural", "Adventure", "Wellness", "Exclusive"];

// Resize image to max 800px and return base64
function resizeImage(file, maxWidth = 800) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminDeals({ admin }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [form, setForm] = useState({ tripName: "", category: "Beach", price: "", imageUrl: "", notes: "", active: true });
  const [imagePreview, setImagePreview] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const isAssistant = (admin?.role || admin?.Role) === "Assistant";

  const loadDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/admin-deals");
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (err) {
      setError("Failed to load deals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDeals(); }, []);

  const resetForm = () => {
    setForm({ tripName: "", category: "Beach", price: "", imageUrl: "", notes: "", active: true });
    setImagePreview("");
    setEditing(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (d) => {
    const imgUrl = d.image || d.imageUrl || d["Place Image URL"] || "";
    setForm({
      tripName: d.title || d.tripName || d["Trip Name"] || "",
      category: d.category || d.Category || "Beach",
      price: d.price || d.Price || "",
      imageUrl: imgUrl,
      notes: d.notes || d.Notes || d.description || "",
      active: d.active !== false && d.Active !== false,
    });
    setImagePreview(imgUrl);
    setEditing(d);
    setShowForm(true);
  };

  const handleImageFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const base64 = await resizeImage(file);
      setImagePreview(base64);
      setForm(f => ({ ...f, imageUrl: base64 }));
    } catch (err) {
      setError("Failed to process image.");
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  const handleSave = async () => {
    if (!form.tripName) { setError("Trip name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const method = editing ? "PUT" : "POST";
      const res = await fetch("/.netlify/functions/admin-deals", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing?.id,
          "Trip Name": form.tripName,
          Category: form.category,
          Price: form.price ? Number(form.price) : 0,
          "Place Image URL": form.imageUrl,
          Notes: form.notes,
          Active: form.active,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(editing ? "Deal updated!" : "Deal created!");
        setTimeout(() => setSuccess(""), 3000);
        resetForm();
        loadDeals();
      } else {
        setError(data.error || "Save failed.");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (deal) => {
    const name = deal.title || deal.tripName || deal["Trip Name"] || "this deal";
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await fetch("/.netlify/functions/admin-deals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deal.id }),
      });
      setSuccess("Deal deleted.");
      setTimeout(() => setSuccess(""), 3000);
      loadDeals();
    } catch (err) {
      setError("Failed to delete.");
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ color: fhjTheme.primary, margin: 0, fontSize: "1.6rem", fontWeight: 400 }}>Deals Manager</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.3rem" }}>{deals.length} deal{deals.length !== 1 ? "s" : ""}</p>
        </div>
        {!isAssistant && (
          <FHJButton onClick={() => { resetForm(); setShowForm(true); }}>+ Add Deal</FHJButton>
        )}
      </div>

      {/* Messages */}
      {success && <div style={{ ...msgStyle, background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)", color: "#4ade80" }}>{success}</div>}
      {error && !showForm && <div style={{ ...msgStyle, background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>{error}</div>}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <FHJCard style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "white", margin: "0 0 1.25rem", fontSize: "1.1rem", fontWeight: 500 }}>
                {editing ? "Edit Deal" : "New Deal"}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Trip Name */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>TRIP NAME *</label>
                  <input style={inputStyle} value={form.tripName} onChange={e => setForm(f => ({ ...f, tripName: e.target.value }))} placeholder="e.g., Santorini Getaway" />
                </div>

                {/* Category */}
                <div>
                  <label style={labelStyle}>CATEGORY</label>
                  <select style={inputStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label style={labelStyle}>PRICE ($)</label>
                  <input style={inputStyle} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g., 2500" />
                </div>

                {/* Image Upload */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>IMAGE</label>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? fhjTheme.primary : "rgba(255,255,255,0.15)"}`,
                      borderRadius: "10px",
                      padding: imagePreview ? "0.5rem" : "2rem",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: dragOver ? "rgba(0,196,140,0.05)" : "rgba(255,255,255,0.02)",
                      minHeight: imagePreview ? "auto" : "120px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {imagePreview ? (
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px", objectFit: "cover" }} />
                        <button
                          onClick={(e) => { e.stopPropagation(); setImagePreview(""); setForm(f => ({ ...f, imageUrl: "" })); }}
                          style={{ position: "absolute", top: "-8px", right: "-8px", width: "24px", height: "24px", borderRadius: "50%", background: "#f87171", border: "none", color: "white", cursor: "pointer", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: "2rem" }}>📸</span>
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
                          Drag & drop an image, or <span style={{ color: fhjTheme.primary, fontWeight: 600 }}>click to browse</span>
                        </p>
                        <p style={{ color: "#475569", fontSize: "0.75rem", margin: 0 }}>JPG, PNG, WebP — max 5MB</p>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageFile(e.target.files[0])} />

                  {/* OR paste URL */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem" }}>
                    <span style={{ color: "#475569", fontSize: "0.75rem" }}>OR</span>
                    <input
                      style={{ ...inputStyle, flex: 1, margin: 0 }}
                      value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
                      onChange={e => { setForm(f => ({ ...f, imageUrl: e.target.value })); setImagePreview(e.target.value); }}
                      placeholder="Paste image URL..."
                    />
                  </div>
                </div>

                {/* Description */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>DESCRIPTION</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Describe the deal..."
                  />
                </div>

                {/* Active toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                    style={{
                      width: "44px", height: "24px", borderRadius: "12px", cursor: "pointer",
                      background: form.active ? fhjTheme.primary : "rgba(255,255,255,0.15)",
                      transition: "background 0.2s", position: "relative",
                    }}
                  >
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%", background: "white",
                      position: "absolute", top: "3px", left: form.active ? "22px" : "4px",
                      transition: "left 0.2s",
                    }} />
                  </div>
                  <span style={{ color: form.active ? "#4ade80" : "#94a3b8", fontSize: "0.85rem", fontWeight: 500 }}>
                    {form.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && showForm && (
                <div style={{ ...msgStyle, background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171", marginTop: "1rem", marginBottom: 0 }}>{error}</div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                <FHJButton onClick={handleSave} disabled={saving} style={{ padding: "0.6rem 2rem" }}>
                  {saving ? "Saving..." : editing ? "Update Deal" : "Create Deal"}
                </FHJButton>
                <FHJButton variant="ghost" onClick={resetForm} style={{ padding: "0.6rem 1.5rem" }}>Cancel</FHJButton>
              </div>
            </FHJCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deals Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {[1, 2, 3].map(i => (
            <FHJCard key={i} style={{ height: "280px", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ width: "100%", height: "160px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s infinite" }} />
            </FHJCard>
          ))}
        </div>
      ) : deals.length === 0 ? (
        <FHJCard style={{ padding: "3rem", textAlign: "center" }}>
          <span style={{ fontSize: "3rem" }}>🏖️</span>
          <p style={{ color: "#94a3b8", marginTop: "1rem" }}>No deals yet. Click "+ Add Deal" to create your first one.</p>
        </FHJCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {deals.map(deal => {
            const name = deal.title || deal.tripName || deal["Trip Name"] || "Untitled";
            const cat = deal.category || deal.Category || "";
            const price = deal.price || deal.Price || 0;
            const img = deal.image || deal.imageUrl || deal["Place Image URL"] || "";
            const desc = deal.notes || deal.Notes || deal.description || "";
            const active = deal.active !== false && deal.Active !== false;

            return (
              <motion.div key={deal.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <FHJCard style={{ overflow: "hidden", position: "relative" }}>
                  {/* Image */}
                  <div style={{ height: "160px", background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                    {img ? (
                      <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "2.5rem", opacity: 0.3 }}>🏝️</span>
                      </div>
                    )}
                    {/* Status badge */}
                    <div style={{
                      position: "absolute", top: "8px", right: "8px",
                      padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600,
                      background: active ? "rgba(74,222,128,0.9)" : "rgba(148,163,184,0.9)",
                      color: active ? "#000" : "#fff",
                    }}>
                      {active ? "Active" : "Inactive"}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h4 style={{ color: "white", margin: 0, fontSize: "1rem", fontWeight: 600 }}>{name}</h4>
                      {price > 0 && <span style={{ color: fhjTheme.primary, fontWeight: 700, fontSize: "0.95rem" }}>${Number(price).toLocaleString()}</span>}
                    </div>
                    {cat && <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "0.3rem 0 0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{cat}</p>}
                    {desc && <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0.5rem 0 0", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{desc}</p>}

                    {/* Actions */}
                    {!isAssistant && (
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                        <button onClick={() => handleEdit(deal)} style={actionBtnStyle}>Edit</button>
                        <button onClick={() => handleDelete(deal)} style={{ ...actionBtnStyle, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>Delete</button>
                      </div>
                    )}
                  </div>
                </FHJCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Styles
const labelStyle = { display: "block", color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "0.4rem" };

const inputStyle = {
  width: "100%", padding: "0.65rem 0.75rem", borderRadius: "8px",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
  color: "white", fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
};

const msgStyle = {
  padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid",
  fontSize: "0.85rem", marginBottom: "1rem",
};

const actionBtnStyle = {
  padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 500,
  background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
  color: "#94a3b8", cursor: "pointer", transition: "all 0.2s",
};