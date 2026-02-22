// ==========================================================
// FILE: AdminDeals.jsx - Complete with Image Upload & Carousel
// Location: src/pages/AdminDeals.jsx
// ==========================================================

import React, { useState, useEffect, useRef } from "react";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Beach", "Mountain", "City", "Cruise", "Safari", "Cultural", "Adventure", "Wellness", "Exclusive"];
const DIFFICULTY_LEVELS = ["Easy", "Moderate", "Challenging"];

// Image resize utility
function resizeImage(file, maxWidth = 1200) {
  return new Promise((resolve, reject) => {
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
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
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

  const [form, setForm] = useState(getEmptyForm());

  const isAssistant = (admin?.role || admin?.Role) === "Assistant";

  function getEmptyForm() {
    return {
      tripName: "",
      category: "Beach",
      price: "",
      imageUrl: "",
      notes: "",
      active: true,
      duration: "",
      location: "",
      departureDates: "",
      highlights: [],
      itinerary: "",
      inclusions: [],
      exclusions: [],
      additionalImages: [],
      accommodation: "",
      maxGuests: 2,
      difficultyLevel: "Easy",
      bestTimeToVisit: "",
      depositRequired: "",
      featured: false,
    };
  }

  const loadDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/get-deals");
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (err) {
      setError("Failed to load deals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const resetForm = () => {
    setForm(getEmptyForm());
    setEditing(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (deal) => {
    setForm({
      tripName: deal["Trip Name"] || deal.trip_name || "",
      category: deal.Category || deal.category || "Beach",
      price: deal.Price || deal.price || "",
      imageUrl: deal["Place Image URL"] || deal.place_image_url || "",
      notes: deal.Notes || deal.notes || "",
      active: deal.Active ?? deal.active ?? true,
      duration: deal.Duration || deal.duration || "",
      location: deal.Location || deal.location || "",
      departureDates: deal["Departure Dates"] || deal.departure_dates || "",
      highlights: deal.Highlights || deal.highlights || [],
      itinerary: deal.Itinerary || deal.itinerary || "",
      inclusions: deal.Inclusions || deal.inclusions || [],
      exclusions: deal.Exclusions || deal.exclusions || [],
      additionalImages: deal["Additional Images"] || deal.additional_images || [],
      accommodation: deal.Accommodation || deal.accommodation || "",
      maxGuests: deal["Max Guests"] || deal.max_guests || 2,
      difficultyLevel: deal["Difficulty Level"] || deal.difficulty_level || "Easy",
      bestTimeToVisit: deal["Best Time to Visit"] || deal.best_time_to_visit || "",
      depositRequired: deal["Deposit Required"] || deal.deposit_required || "",
      featured: deal.Featured ?? deal.featured ?? false,
    });
    setEditing(deal);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.tripName) {
      setError("Trip name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const method = editing ? "PUT" : "POST";
      const payload = {
        id: editing?.id,
        "Trip Name": form.tripName,
        "Category": form.category,
        "Price": form.price,
        "Place Image URL": form.imageUrl,
        "Notes": form.notes,
        "Active": form.active,
        "Duration": form.duration,
        "Location": form.location,
        "Departure Dates": form.departureDates,
        "Highlights": form.highlights,
        "Itinerary": form.itinerary,
        "Inclusions": form.inclusions,
        "Exclusions": form.exclusions,
        "Additional Images": form.additionalImages,
        "Accommodation": form.accommodation,
        "Max Guests": parseInt(form.maxGuests) || 2,
        "Difficulty Level": form.difficultyLevel,
        "Best Time to Visit": form.bestTimeToVisit,
        "Deposit Required": form.depositRequired ? parseFloat(form.depositRequired) : null,
        "Featured": form.featured,
      };

      const res = await fetch("/.netlify/functions/get-deals", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    const name = deal["Trip Name"] || deal.trip_name || "this deal";
    if (!window.confirm(`Delete "${name}"?`)) return;

    try {
      await fetch("/.netlify/functions/get-deals", {
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

  const addToArray = (field, value) => {
    if (value.trim()) {
      setForm({ ...form, [field]: [...form[field], value.trim()] });
    }
  };

  const removeFromArray = (field, index) => {
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== index) });
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ color: fhjTheme.primary, margin: 0, fontSize: "1.6rem" }}>Deals Manager</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.3rem" }}>{deals.length} deal{deals.length !== 1 ? "s" : ""}</p>
        </div>
        {!isAssistant && (
          <FHJButton onClick={() => { resetForm(); setShowForm(true); }}>+ Add Deal</FHJButton>
        )}
      </div>

      {success && <div style={{ ...msgStyle, background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)", color: "#4ade80" }}>{success}</div>}
      {error && !showForm && <div style={{ ...msgStyle, background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>{error}</div>}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <FHJCard style={{ padding: "2rem", marginBottom: "1.5rem", maxHeight: "85vh", overflowY: "auto" }}>
              <h3 style={{ color: "white", margin: "0 0 1.5rem", fontSize: "1.2rem" }}>
                {editing ? "Edit Deal" : "New Deal"}
              </h3>

              {/* BASIC INFO */}
              <div style={sectionStyle}>
                <h4 style={sectionTitle}>Basic Information</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>TRIP NAME *</label>
                    <FHJInput value={form.tripName} onChange={(e) => setForm({ ...form, tripName: e.target.value })} placeholder="e.g., Santorini Getaway" />
                  </div>

                  <div>
                    <label style={labelStyle}>CATEGORY</label>
                    <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>PRICE ($)</label>
                    <FHJInput type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="2500" />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>DESCRIPTION</label>
                    <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Describe the trip..." />
                  </div>
                </div>
              </div>

              {/* IMAGES */}
              <ImageManager
                mainImage={form.imageUrl}
                additionalImages={form.additionalImages}
                onMainImageChange={(url) => setForm({ ...form, imageUrl: url })}
                onAdditionalImagesChange={(images) => setForm({ ...form, additionalImages: images })}
              />

              {/* TRIP DETAILS */}
              <div style={sectionStyle}>
                <h4 style={sectionTitle}>Trip Details</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>DURATION</label>
                    <FHJInput value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="7 Days / 6 Nights" />
                  </div>

                  <div>
                    <label style={labelStyle}>LOCATION</label>
                    <FHJInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Montego Bay, Jamaica" />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>DEPARTURE DATES</label>
                    <FHJInput value={form.departureDates} onChange={(e) => setForm({ ...form, departureDates: e.target.value })} placeholder="March 15, April 12, May 20" />
                  </div>

                  <div>
                    <label style={labelStyle}>MAX GUESTS</label>
                    <FHJInput type="number" min="1" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: e.target.value })} />
                  </div>

                  <div>
                    <label style={labelStyle}>DIFFICULTY</label>
                    <select style={inputStyle} value={form.difficultyLevel} onChange={(e) => setForm({ ...form, difficultyLevel: e.target.value })}>
                      {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>DEPOSIT ($)</label>
                    <FHJInput type="number" value={form.depositRequired} onChange={(e) => setForm({ ...form, depositRequired: e.target.value })} placeholder="500" />
                  </div>

                  <div>
                    <label style={labelStyle}>BEST TIME TO VISIT</label>
                    <FHJInput value={form.bestTimeToVisit} onChange={(e) => setForm({ ...form, bestTimeToVisit: e.target.value })} placeholder="December - April" />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>ACCOMMODATION</label>
                    <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={form.accommodation} onChange={(e) => setForm({ ...form, accommodation: e.target.value })} placeholder="Describe the hotel/resort..." />
                  </div>
                </div>
              </div>

              <ArrayField label="Highlights" items={form.highlights} onAdd={(val) => addToArray('highlights', val)} onRemove={(idx) => removeFromArray('highlights', idx)} placeholder="e.g., All-inclusive resort" />
              <ArrayField label="What's Included" items={form.inclusions} onAdd={(val) => addToArray('inclusions', val)} onRemove={(idx) => removeFromArray('inclusions', idx)} placeholder="e.g., Round-trip flights" />
              <ArrayField label="What's NOT Included" items={form.exclusions} onAdd={(val) => addToArray('exclusions', val)} onRemove={(idx) => removeFromArray('exclusions', idx)} placeholder="e.g., Travel insurance" />

              <div style={sectionStyle}>
                <h4 style={sectionTitle}>Itinerary</h4>
                <label style={labelStyle}>DAY-BY-DAY SCHEDULE</label>
                <textarea style={{ ...inputStyle, minHeight: "120px", resize: "vertical", fontFamily: "monospace" }} value={form.itinerary} onChange={(e) => setForm({ ...form, itinerary: e.target.value })} placeholder="Day 1: Arrival...&#10;Day 2-3: Activities...&#10;Day 7: Departure" />
              </div>

              <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem" }}>
                <Toggle label="Active" checked={form.active} onChange={(val) => setForm({ ...form, active: val })} />
                <Toggle label="Featured Deal" checked={form.featured} onChange={(val) => setForm({ ...form, featured: val })} />
              </div>

              {error && showForm && <div style={{ ...msgStyle, background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171", marginTop: "1rem", marginBottom: 0 }}>{error}</div>}

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <FHJButton onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update Deal" : "Create Deal"}
                </FHJButton>
                <FHJButton variant="ghost" onClick={resetForm}>Cancel</FHJButton>
              </div>
            </FHJCard>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {[1, 2, 3].map(i => <FHJCard key={i} style={{ height: "280px", background: "rgba(255,255,255,0.03)" }}><div style={{ padding: "1.5rem" }}>Loading...</div></FHJCard>)}
        </div>
      ) : deals.length === 0 ? (
        <FHJCard style={{ padding: "3rem", textAlign: "center" }}>
          <span style={{ fontSize: "3rem" }}>🏖️</span>
          <p style={{ color: "#94a3b8", marginTop: "1rem" }}>No deals yet. Click "+ Add Deal" to create your first one.</p>
        </FHJCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {deals.map(deal => {
            const name = deal["Trip Name"] || deal.trip_name || "Untitled";
            const category = deal.Category || deal.category || "";
            const price = deal.Price || deal.price || 0;
            const img = deal["Place Image URL"] || deal.place_image_url || "";
            const desc = deal.Notes || deal.notes || "";
            const active = deal.Active ?? deal.active ?? true;
            const featured = deal.Featured ?? deal.featured ?? false;

            return (
              <motion.div key={deal.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <FHJCard style={{ overflow: "hidden", position: "relative" }}>
                  <div style={{ height: "180px", background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                    {img ? (
                      <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "3rem", opacity: 0.3 }}>🏝️</span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      {active && <span style={badgeStyle}>Active</span>}
                      {featured && <span style={{ ...badgeStyle, background: "rgba(251,191,36,0.2)", color: "#fbbf24" }}>Featured</span>}
                    </div>

                    <h4 style={{ color: "white", margin: "0 0 0.25rem", fontSize: "1.1rem", fontWeight: 600 }}>{name}</h4>
                    {category && <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "0 0 0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>{category}</p>}
                    {price > 0 && <p style={{ color: fhjTheme.primary, fontWeight: 700, fontSize: "1rem", margin: "0.5rem 0" }}>${Number(price).toLocaleString()}</p>}
                    {desc && <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.5rem 0 0", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{desc}</p>}

                    {!isAssistant && (
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
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

// ImageManager Component
function ImageManager({ mainImage, additionalImages, onMainImageChange, onAdditionalImagesChange }) {
  const [previewIndex, setPreviewIndex] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const mainFileRef = useRef(null);
  const additionalFileRef = useRef(null);

  const allImages = [mainImage, ...additionalImages].filter(Boolean);

  const handleImageUpload = async (file, isMain) => {
    if (!file || !file.type.startsWith("image/")) return;
    
    try {
      const base64 = await resizeImage(file);
      if (isMain) {
        onMainImageChange(base64);
      } else {
        onAdditionalImagesChange([...additionalImages, base64]);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  const handleDrop = (e, isMain) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleImageUpload(file, isMain);
  };

  const addImageUrl = () => {
    if (urlInput.trim() && urlInput.startsWith("http")) {
      onAdditionalImagesChange([...additionalImages, urlInput.trim()]);
      setUrlInput("");
    }
  };

  const removeImage = (index) => {
    if (index === 0) {
      onMainImageChange(additionalImages[0] || "");
      onAdditionalImagesChange(additionalImages.slice(1));
      setPreviewIndex(0);
    } else {
      onAdditionalImagesChange(additionalImages.filter((_, i) => i !== index - 1));
      if (previewIndex >= allImages.length - 1) setPreviewIndex(Math.max(0, allImages.length - 2));
    }
  };

  return (
    <div style={sectionStyle}>
      <h4 style={sectionTitle}>Images</h4>

      {allImages.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: "12px", overflow: "hidden", background: "#000" }}>
            <img src={allImages[previewIndex]} alt={`Preview ${previewIndex + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            
            {allImages.length > 1 && (
              <>
                <button onClick={() => setPreviewIndex((previewIndex - 1 + allImages.length) % allImages.length)} style={{ ...navArrowStyle, left: "10px" }}>←</button>
                <button onClick={() => setPreviewIndex((previewIndex + 1) % allImages.length)} style={{ ...navArrowStyle, right: "10px" }}>→</button>
              </>
            )}

            <button onClick={() => removeImage(previewIndex)} style={{ position: "absolute", top: "10px", right: "10px", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(248,113,113,0.9)", border: "none", color: "white", cursor: "pointer", fontSize: "1.2rem" }}>×</button>

            <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", padding: "0.3rem 0.8rem", borderRadius: "20px", color: "white", fontSize: "0.85rem" }}>
              {previewIndex + 1} / {allImages.length}
              {previewIndex === 0 && <span style={{ marginLeft: "0.5rem", color: fhjTheme.primary }}>• Main</span>}
            </div>
          </div>

          {allImages.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", overflow: "auto", padding: "0.5rem 0" }}>
              {allImages.map((img, idx) => (
                <div key={idx} onClick={() => setPreviewIndex(idx)} style={{ width: "80px", height: "60px", borderRadius: "6px", overflow: "hidden", cursor: "pointer", border: idx === previewIndex ? `2px solid ${fhjTheme.primary}` : "2px solid transparent", opacity: idx === previewIndex ? 1 : 0.6, transition: "all 0.2s", flexShrink: 0, position: "relative" }}>
                  <img src={img} alt={`Thumb ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {idx === 0 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,196,140,0.9)", color: "white", fontSize: "0.6rem", textAlign: "center", padding: "2px" }}>MAIN</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ ...labelStyle, marginBottom: "0.5rem" }}>MAIN IMAGE</label>
        <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => handleDrop(e, true)} onClick={() => mainFileRef.current?.click()} style={{ border: `2px dashed ${dragOver ? fhjTheme.primary : "rgba(255,255,255,0.2)"}`, borderRadius: "10px", padding: mainImage ? "0.5rem" : "2rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: dragOver ? "rgba(0,196,140,0.05)" : "rgba(255,255,255,0.02)" }}>
          {mainImage ? <img src={mainImage} alt="Main" style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "8px" }} /> : <><span style={{ fontSize: "2rem" }}>📸</span><p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>Drop image or click to browse</p></>}
        </div>
        <input ref={mainFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageUpload(e.target.files[0], true)} />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ ...labelStyle, marginBottom: "0.5rem" }}>ADDITIONAL IMAGES</label>
        <div onClick={() => additionalFileRef.current?.click()} style={{ border: "2px dashed rgba(255,255,255,0.15)", borderRadius: "10px", padding: "1.5rem", textAlign: "center", cursor: "pointer", background: "rgba(255,255,255,0.02)" }}>
          <span style={{ fontSize: "1.5rem" }}>🖼️</span>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>Click to add more images</p>
        </div>
        <input ref={additionalFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageUpload(e.target.files[0], false)} />
      </div>

      <div>
        <label style={labelStyle}>OR PASTE IMAGE URL</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input style={{ ...inputStyle, flex: 1, margin: 0 }} value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())} placeholder="https://images.unsplash.com/..." />
          <button onClick={addImageUrl} type="button" style={addBtn}>Add URL</button>
        </div>
      </div>
    </div>
  );
}

function ArrayField({ label, items, onAdd, onRemove, placeholder }) {
  const [input, setInput] = useState("");
  const handleAdd = () => { if (input.trim()) { onAdd(input); setInput(""); } };
  return (
    <div style={sectionStyle}>
      <h4 style={sectionTitle}>{label}</h4>
      {items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
          {items.map((item, idx) => (
            <div key={idx} style={tagStyle}><span>{item}</span><button onClick={() => onRemove(idx)} style={removeTagBtn}>×</button></div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input style={{ ...inputStyle, flex: 1, margin: 0 }} value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())} placeholder={placeholder} />
        <button onClick={handleAdd} type="button" style={addBtn}>Add</button>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
      <div onClick={() => onChange(!checked)} style={{ width: "44px", height: "24px", borderRadius: "12px", background: checked ? fhjTheme.primary : "rgba(255,255,255,0.15)", transition: "background 0.2s", position: "relative", cursor: "pointer" }}>
        <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "white", position: "absolute", top: "3px", left: checked ? "22px" : "4px", transition: "left 0.2s" }} />
      </div>
      <span style={{ color: checked ? "#4ade80" : "#94a3b8", fontSize: "0.9rem", fontWeight: 500 }}>{label}</span>
    </label>
  );
}

const labelStyle = { display: "block", color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.5px", marginBottom: "0.4rem" };
const inputStyle = { width: "100%", padding: "0.65rem 0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" };
const msgStyle = { padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid", fontSize: "0.85rem", marginBottom: "1rem" };
const actionBtnStyle = { padding: "0.4rem 0.9rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 500, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s" };
const sectionStyle = { marginBottom: "1.5rem", padding: "1.25rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" };
const sectionTitle = { color: fhjTheme.primary, fontSize: "0.95rem", margin: "0 0 1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" };
const tagStyle = { display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(0,196,140,0.1)", border: "1px solid rgba(0,196,140,0.3)", borderRadius: "8px", padding: "0.4rem 0.6rem", fontSize: "0.85rem", color: "#e2e8f0" };
const removeTagBtn = { background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "0", fontSize: "1.2rem", lineHeight: 1 };
const addBtn = { padding: "0.65rem 1.5rem", background: "rgba(0,196,140,0.2)", border: "1px solid rgba(0,196,140,0.4)", borderRadius: "8px", color: "#00c48c", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" };
const badgeStyle = { display: "inline-block", padding: "0.25rem 0.6rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 600, background: "rgba(74,222,128,0.2)", color: "#4ade80" };
const navArrowStyle = { position: "absolute", top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" };
