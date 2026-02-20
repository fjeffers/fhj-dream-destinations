// ==========================================================
// FILE: AdminEvents.jsx — Events Manager with RSVP Viewer
// Location: src/pages/AdminEvents.jsx
//
// Updated: Added host photo (ClientPic) and background image
// upload sections for luxurious RSVP personalization
// ==========================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const THEME = { primary: "#00c48c", bg: "#0b1120" };

function resizeImage(file, maxWidth = 800) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const EMPTY_FORM = {
  title: "", slug: "", date: "", time: "", location: "",
  hostName: "", description: "", eventPic: "", background: "",
  clientPic: "", shareLink: "", active: true,
};

// ── Reusable Image Drop Zone ────────────────────────────
function ImageDropZone({ label, sublabel, image, onImageChange, onFileDrop, shape = "rectangle", icon = "\u{1F4F8}", accentColor = THEME.primary }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (onFileDrop) {
      onFileDrop(file);
    } else {
      try {
        const base64 = await resizeImage(file);
        onImageChange(base64);
      } catch { /* ignore */ }
    }
  }, [onImageChange, onFileDrop]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const isCircle = shape === "circle";

  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      {sublabel && <p style={{ color: "#475569", fontSize: "0.7rem", margin: "0 0 0.5rem" }}>{sublabel}</p>}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? accentColor : "rgba(255,255,255,0.15)"}`,
          borderRadius: isCircle ? "50%" : "10px",
          width: isCircle ? "140px" : "100%",
          height: isCircle ? "140px" : image ? "auto" : "140px",
          minHeight: isCircle ? undefined : image ? "auto" : "140px",
          padding: image ? "0.5rem" : "1.5rem",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          background: dragOver ? `${accentColor}08` : "rgba(255,255,255,0.02)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
          overflow: "hidden",
        }}
      >
        {image ? (
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={image}
              alt={label || "Preview"}
              style={{
                maxWidth: isCircle ? "120px" : "100%",
                maxHeight: isCircle ? "120px" : "180px",
                width: isCircle ? "120px" : undefined,
                height: isCircle ? "120px" : undefined,
                borderRadius: isCircle ? "50%" : "8px",
                objectFit: "cover",
              }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); onImageChange(""); }}
              style={{
                position: "absolute", top: isCircle ? "0" : "-6px", right: isCircle ? "0" : "-6px",
                width: "22px", height: "22px", borderRadius: "50%",
                background: "#f87171", border: "none", color: "white",
                cursor: "pointer", fontSize: "0.65rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >{"\u2715"}</button>
          </div>
        ) : (
          <>
            <span style={{ fontSize: "1.6rem", opacity: 0.5 }}>{icon}</span>
            <p style={{ color: "#94a3b8", fontSize: "0.78rem", margin: 0 }}>
              Drop image or <span style={{ color: accentColor, fontWeight: 600 }}>browse</span>
            </p>
            <p style={{ color: "#475569", fontSize: "0.68rem", margin: 0 }}>JPG, PNG, WebP</p>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────
export default function AdminEvents({ admin }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // RSVP viewer state
  const [viewingRsvps, setViewingRsvps] = useState(null);
  const [rsvpData, setRsvpData] = useState({ rsvps: [], rsvpCount: 0, totalGuests: 0 });
  const [loadingRsvps, setLoadingRsvps] = useState(false);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imagePreview, setImagePreview] = useState("");
  const [hostImagePreview, setHostImagePreview] = useState("");
  const [bgImagePreview, setBgImagePreview] = useState("");

  const isAssistant = (admin?.role || admin?.Role) === "Assistant";

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/admin-events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setImagePreview("");
    setHostImagePreview("");
    setBgImagePreview("");
    setEditing(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (evt) => {
    const pic = evt.event_pic || evt.eventPic || "";
    const hostPic = evt.client_pic || evt.clientPic || "";
    const bgPic = evt.background || evt.Background || "";
    setForm({
      title: evt.title || evt.Title || "",
      slug: evt.slug || evt.Slug || "",
      date: evt.date || evt.Date || "",
      time: evt.time || evt.Time || "",
      location: evt.location || evt.Location || "",
      hostName: evt.host_name || evt.hostName || evt.HostName || "",
      description: evt.description || evt.Description || "",
      eventPic: pic,
      background: bgPic,
      clientPic: hostPic,
      shareLink: evt.share_link || evt.shareLink || "",
      active: evt.active !== false,
    });
    setImagePreview(pic);
    setHostImagePreview(hostPic);
    setBgImagePreview(bgPic);
    setEditing(evt);
    setShowForm(true);
    setViewingRsvps(null);
  };

  const handleImageFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const base64 = await resizeImage(file);
      setImagePreview(base64);
      setForm(f => ({ ...f, eventPic: base64 }));
    } catch (err) {
      setError("Failed to process image.");
    }
  }, []);

  const handleHostImageFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const base64 = await resizeImage(file, 400);
      setHostImagePreview(base64);
      setForm(f => ({ ...f, clientPic: base64 }));
    } catch { /* ignore */ }
  }, []);

  const handleBgImageFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const base64 = await resizeImage(file, 1200);
      setBgImagePreview(base64);
      setForm(f => ({ ...f, background: base64 }));
    } catch { /* ignore */ }
  }, []);

  const handleSave = async () => {
    if (!form.title) { setError("Event title is required."); return; }
    setSaving(true);
    setError("");
    try {
      const slug = form.slug || generateSlug(form.title);
      const method = editing ? "PUT" : "POST";
      const payload = {
        id: editing?.id,
        Slug: slug, Title: form.title, Date: form.date, Time: form.time,
        Location: form.location, HostName: form.hostName, Description: form.description,
        EventPic: form.eventPic, Background: form.background, ClientPic: form.clientPic,
        "Share Link": form.shareLink, Active: form.active,
      };
      const res = await fetch("/.netlify/functions/admin-events", {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(editing ? "Event updated!" : "Event created!");
        setTimeout(() => setSuccess(""), 3000);
        resetForm();
        loadEvents();
      } else {
        setError(data.error || data.details || "Save failed.");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (evt) => {
    const name = evt.title || "this event";
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await fetch("/.netlify/functions/admin-events", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: evt.id }),
      });
      setSuccess("Event deleted.");
      setTimeout(() => setSuccess(""), 3000);
      loadEvents();
    } catch (err) { setError("Failed to delete."); }
  };

  const copyShareLink = (evt) => {
    const slug = evt.slug || "";
    const link = `${window.location.origin}/rsvp/${slug}`;
    navigator.clipboard.writeText(link);
    setSuccess("RSVP link copied!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const loadRsvps = async (evt) => {
    const slug = evt.slug || "";
    if (viewingRsvps === evt.id) {
      setViewingRsvps(null);
      return;
    }
    setViewingRsvps(evt.id);
    setLoadingRsvps(true);
    try {
      const res = await fetch(`/.netlify/functions/get-event?slug=${slug}`);
      const data = await res.json();
      setRsvpData({
        rsvps: data.rsvps || [],
        rsvpCount: data.rsvpCount || 0,
        totalGuests: data.totalGuests || 0,
      });
    } catch (err) {
      setRsvpData({ rsvps: [], rsvpCount: 0, totalGuests: 0 });
    } finally {
      setLoadingRsvps(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ color: THEME.primary, margin: 0, fontSize: "1.6rem", fontWeight: 400 }}>Events Manager</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.3rem" }}>{events.length} event{events.length !== 1 ? "s" : ""}</p>
        </div>
        {!isAssistant && (
          <button onClick={() => { resetForm(); setShowForm(true); setViewingRsvps(null); }} style={addBtnStyle}>+ Add Event</button>
        )}
      </div>

      {/* Messages */}
      {success && <div style={{ ...msgStyle, background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)", color: "#4ade80" }}>{success}</div>}
      {error && !showForm && <div style={{ ...msgStyle, background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>{error}</div>}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={cardStyle}>
              <h3 style={{ color: "white", margin: "0 0 1.25rem", fontSize: "1.1rem", fontWeight: 500 }}>
                {editing ? "Edit Event" : "New Event"}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Title */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>EVENT TITLE *</label>
                  <input style={inputStyle} value={form.title} onChange={e => {
                    const title = e.target.value;
                    setForm(f => ({ ...f, title, slug: editing ? f.slug : generateSlug(title) }));
                  }} placeholder="e.g., Summer Beach Gala" />
                </div>

                <div>
                  <label style={labelStyle}>URL SLUG</label>
                  <input style={inputStyle} value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" />
                </div>
                <div>
                  <label style={labelStyle}>DATE</label>
                  <input style={inputStyle} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>TIME</label>
                  <input style={inputStyle} value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder="e.g., 7:00 PM" />
                </div>
                <div>
                  <label style={labelStyle}>LOCATION</label>
                  <input style={inputStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g., Miami Beach Resort" />
                </div>
                <div>
                  <label style={labelStyle}>HOST NAME</label>
                  <input style={inputStyle} value={form.hostName} onChange={e => setForm(f => ({ ...f, hostName: e.target.value }))} placeholder="e.g., Frederick Jeffers" />
                </div>
                <div>
                  <label style={labelStyle}>SHARE LINK</label>
                  <input style={inputStyle} value={form.shareLink} onChange={e => setForm(f => ({ ...f, shareLink: e.target.value }))} placeholder="Optional external link" />
                </div>

                {/* Event Image */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>EVENT IMAGE</label>
                  <ImageDropZone
                    image={imagePreview}
                    onImageChange={(val) => { setImagePreview(val); setForm(f => ({ ...f, eventPic: val })); }}
                    onFileDrop={handleImageFile}
                    icon={"\u{1F4F8}"}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem" }}>
                    <span style={{ color: "#475569", fontSize: "0.75rem" }}>OR</span>
                    <input style={{ ...inputStyle, flex: 1, margin: 0 }}
                      value={form.eventPic.startsWith("data:") ? "" : form.eventPic}
                      onChange={e => { setForm(f => ({ ...f, eventPic: e.target.value })); setImagePreview(e.target.value); }}
                      placeholder="Paste image URL..." />
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* RSVP Page Personalization Section                      */}
                {/* ═══════════════════════════════════════════════════════ */}
                <div style={{ gridColumn: "1 / -1", marginTop: "0.5rem" }}>
                  <div style={personalizationSection}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                      <span style={{ fontSize: "1rem" }}>{"\u2728"}</span>
                      <h4 style={{ color: "#D4AF37", margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>RSVP Page Personalization</h4>
                    </div>
                    <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "0 0 1.25rem", lineHeight: 1.4 }}>
                      Add a host photo and background image to create a luxurious, personalized invitation for your guests.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1.5rem", alignItems: "start" }}>
                      {/* Host Photo (ClientPic) */}
                      <div>
                        <ImageDropZone
                          label="HOST PHOTO"
                          sublabel="Circular headshot on RSVP page"
                          image={hostImagePreview}
                          onImageChange={(val) => { setHostImagePreview(val); setForm(f => ({ ...f, clientPic: val })); }}
                          onFileDrop={handleHostImageFile}
                          shape="circle"
                          icon={"\u{1F464}"}
                          accentColor="#D4AF37"
                        />
                        <div style={{ marginTop: "0.5rem" }}>
                          <input style={{ ...inputStyle, fontSize: "0.8rem" }}
                            value={(form.clientPic || "").startsWith("data:") ? "" : form.clientPic}
                            onChange={e => { setForm(f => ({ ...f, clientPic: e.target.value })); setHostImagePreview(e.target.value); }}
                            placeholder="Or paste host photo URL..." />
                        </div>
                      </div>

                      {/* Background Image */}
                      <div>
                        <ImageDropZone
                          label="BACKGROUND IMAGE"
                          sublabel="Full-bleed background on RSVP page"
                          image={bgImagePreview}
                          onImageChange={(val) => { setBgImagePreview(val); setForm(f => ({ ...f, background: val })); }}
                          onFileDrop={handleBgImageFile}
                          icon={"\u{1F5BC}\uFE0F"}
                          accentColor="#D4AF37"
                        />
                        <div style={{ marginTop: "0.5rem" }}>
                          <input style={{ ...inputStyle, fontSize: "0.8rem" }}
                            value={(form.background || "").startsWith("data:") ? "" : form.background}
                            onChange={e => { setForm(f => ({ ...f, background: e.target.value })); setBgImagePreview(e.target.value); }}
                            placeholder="Or paste background image URL..." />
                        </div>
                      </div>
                    </div>

                    {/* Preview hint */}
                    {(hostImagePreview || bgImagePreview) && (
                      <div style={{
                        marginTop: "1rem", padding: "0.6rem 0.85rem",
                        background: "rgba(212,175,55,0.06)", borderRadius: "8px",
                        border: "1px solid rgba(212,175,55,0.12)",
                        color: "#94a3b8", fontSize: "0.75rem",
                      }}>
                        <span style={{ color: "#D4AF37" }}>{"\u2605"}</span> Your RSVP page will display these images with an elegant gold-accented overlay.
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>DESCRIPTION</label>
                  <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the event..." />
                </div>

                {/* Active Toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                    style={{ width: "44px", height: "24px", borderRadius: "12px", cursor: "pointer", background: form.active ? THEME.primary : "rgba(255,255,255,0.15)", transition: "background 0.2s", position: "relative" }}>
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "white", position: "absolute", top: "3px", left: form.active ? "22px" : "4px", transition: "left 0.2s" }} />
                  </div>
                  <span style={{ color: form.active ? "#4ade80" : "#94a3b8", fontSize: "0.85rem", fontWeight: 500 }}>{form.active ? "Active" : "Inactive"}</span>
                </div>
              </div>

              {error && showForm && (
                <div style={{ ...msgStyle, background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171", marginTop: "1rem", marginBottom: 0 }}>{error}</div>
              )}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
                <button onClick={handleSave} disabled={saving} style={addBtnStyle}>{saving ? "Saving..." : editing ? "Update Event" : "Create Event"}</button>
                <button onClick={resetForm} style={cancelBtnStyle}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ ...cardStyle, height: "280px" }}>
              <div style={{ width: "100%", height: "160px", borderRadius: "8px", background: "rgba(255,255,255,0.06)" }} />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div style={{ ...cardStyle, padding: "3rem", textAlign: "center" }}>
          <span style={{ fontSize: "3rem" }}>{"\u{1F389}"}</span>
          <p style={{ color: "#94a3b8", marginTop: "1rem" }}>No events yet. Click "+ Add Event" to create your first one.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
          {events.map(evt => {
            const title = evt.title || "Untitled";
            const date = evt.date || "";
            const time = evt.time || "";
            const location = evt.location || "";
            const host = evt.host_name || evt.hostName || "";
            const pic = evt.event_pic || evt.eventPic || "";
            const hostPic = evt.client_pic || evt.clientPic || "";
            const desc = evt.description || "";
            const slug = evt.slug || "";
            const active = evt.active !== false;
            const isExpanded = viewingRsvps === evt.id;

            return (
              <motion.div key={evt.id} layout transition={{ duration: 0.2 }}>
                <div style={{ ...cardStyle, overflow: "hidden", position: "relative", padding: 0 }}>
                  {/* Image */}
                  <div style={{ height: "160px", background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
                    {pic ? (
                      <img src={pic} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(0,196,140,0.1), rgba(96,165,250,0.1))" }}>
                        <span style={{ fontSize: "2.5rem", opacity: 0.5 }}>{"\u{1F389}"}</span>
                      </div>
                    )}
                    {/* Status badge */}
                    <div style={{
                      position: "absolute", top: "8px", right: "8px",
                      padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600,
                      background: active ? "rgba(74,222,128,0.9)" : "rgba(148,163,184,0.9)",
                      color: active ? "#000" : "#fff",
                    }}>{active ? "Active" : "Inactive"}</div>
                    {/* Host photo thumbnail on card */}
                    {hostPic && (
                      <div style={{
                        position: "absolute", bottom: "-18px", left: "16px",
                        width: "40px", height: "40px", borderRadius: "50%",
                        border: "2px solid #D4AF37",
                        overflow: "hidden", background: "#0b1120",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        zIndex: 2,
                      }}>
                        <img src={hostPic} alt={host} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                  </div>

                  <div style={{ padding: hostPic ? "1.25rem 1rem 1rem" : "1rem" }}>
                    <h4 style={{ color: "white", margin: 0, fontSize: "1rem", fontWeight: 600 }}>{title}</h4>
                    {date && <p style={{ color: THEME.primary, fontSize: "0.8rem", margin: "0.3rem 0 0", fontWeight: 500 }}>{date}{time ? ` at ${time}` : ""}</p>}
                    {location && <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "0.2rem 0 0" }}>{"\u{1F4CD}"} {location}</p>}
                    {host && <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "0.2rem 0 0" }}>{"\u{1F464}"} {host}</p>}
                    {desc && <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0.5rem 0 0", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{desc}</p>}

                    {!isAssistant && (
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                        <button onClick={() => handleEdit(evt)} style={actionBtnStyle}>Edit</button>
                        <button onClick={() => loadRsvps(evt)} style={{ ...actionBtnStyle, color: "#60a5fa", borderColor: "rgba(96,165,250,0.3)" }}>
                          {isExpanded ? "Hide RSVPs" : "View RSVPs"}
                        </button>
                        {slug && <button onClick={() => copyShareLink(evt)} style={{ ...actionBtnStyle, color: THEME.primary, borderColor: "rgba(0,196,140,0.3)" }}>Copy RSVP Link</button>}
                        <button onClick={() => handleDelete(evt)} style={{ ...actionBtnStyle, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}>Delete</button>
                      </div>
                    )}
                  </div>

                  {/* RSVP Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "0 1rem 1rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0 0.5rem" }}>
                            <h5 style={{ color: "#60a5fa", margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>RSVPs</h5>
                            <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                              {rsvpData.rsvpCount} response{rsvpData.rsvpCount !== 1 ? "s" : ""} {"\u2022"} {rsvpData.totalGuests} guest{rsvpData.totalGuests !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {loadingRsvps ? (
                            <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "0.5rem 0" }}>Loading...</p>
                          ) : rsvpData.rsvps.length === 0 ? (
                            <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "0.5rem 0" }}>No RSVPs yet. Share the link to start collecting responses.</p>
                          ) : (
                            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                              {rsvpData.rsvps.map((r, i) => (
                                <div key={r.id || i} style={{
                                  padding: "0.6rem 0.75rem", marginBottom: "0.4rem",
                                  background: "rgba(255,255,255,0.03)", borderRadius: "8px",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "white", fontSize: "0.85rem", fontWeight: 600 }}>{r.name}</span>
                                    <span style={{ color: "#4ade80", fontSize: "0.7rem", fontWeight: 600, background: "rgba(74,222,128,0.1)", padding: "0.15rem 0.5rem", borderRadius: "10px" }}>
                                      {r.guests || 1} guest{(r.guests || 1) !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                                    {r.email && <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{"\u{1F4E7}"} {r.email}</span>}
                                    {r.phone && <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{"\u{1F4DE}"} {r.phone}</span>}
                                  </div>
                                  {r.message && <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "0.3rem 0 0", fontStyle: "italic" }}>"{r.message}"</p>}
                                  <p style={{ color: "#475569", fontSize: "0.65rem", margin: "0.25rem 0 0" }}>
                                    {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────
const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "1.5rem",
};
const labelStyle = { display: "block", color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "0.4rem" };
const inputStyle = {
  width: "100%", padding: "0.65rem 0.75rem", borderRadius: "8px",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
  color: "white", fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
};
const msgStyle = { padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid", fontSize: "0.85rem", marginBottom: "1rem" };
const addBtnStyle = {
  padding: "0.6rem 1.5rem", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 600,
  background: "#00c48c", border: "none", color: "white", cursor: "pointer",
};
const cancelBtnStyle = {
  padding: "0.6rem 1.5rem", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 500,
  background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", cursor: "pointer",
};
const actionBtnStyle = {
  padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 500,
  background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
  color: "#94a3b8", cursor: "pointer", transition: "all 0.2s",
};
const personalizationSection = {
  background: "rgba(212,175,55,0.04)",
  border: "1px solid rgba(212,175,55,0.15)",
  borderRadius: "12px",
  padding: "1.25rem",
};