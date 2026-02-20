// ==========================================================
// 📄 FILE: EventImageUpload.jsx
// Location: src/components/admin/EventImageUpload.jsx
//
// Drop-in section for AdminEvents form — adds host photo
// and background image uploads with preview.
//
// Props:
//   hostImage        – current host image URL or base64
//   backgroundImage  – current background image URL or base64
//   hostName         – current host name string
//   onHostImageChange(url)       – callback
//   onBackgroundImageChange(url) – callback
//   onHostNameChange(name)       – callback
// ==========================================================

import React, { useRef, useState, useCallback } from "react";

// ── Supabase upload helper ──────────────────────────────
async function uploadToSupabase(file, bucket = "event-images") {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", fileName);
  formData.append("bucket", bucket);

  const res = await fetch("/.netlify/functions/upload-image", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url;
}

// ── Drag-and-drop image area ────────────────────────────
function ImageDropZone({ label, sublabel, image, onImageChange, shape = "rectangle" }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      setUploading(true);
      try {
        const url = await uploadToSupabase(file);
        onImageChange(url);
      } catch (err) {
        // Fallback: use base64 preview
        const reader = new FileReader();
        reader.onload = (e) => onImageChange(e.target.result);
        reader.readAsDataURL(file);
      } finally {
        setUploading(false);
      }
    },
    [onImageChange]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const isCircle = shape === "circle";

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <label style={styles.label}>{label}</label>
      {sublabel && <p style={styles.sublabel}>{sublabel}</p>}

      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          ...styles.dropZone,
          ...(isCircle ? styles.circleZone : styles.rectZone),
          borderColor: dragging ? "#D4AF37" : "rgba(255,255,255,0.15)",
          background: dragging
            ? "rgba(212,175,55,0.08)"
            : "rgba(255,255,255,0.03)",
        }}
      >
        {image ? (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <img
              src={image}
              alt={label}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: isCircle ? "50%" : "12px",
              }}
            />
            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageChange(null);
              }}
              style={styles.removeBtn}
              title="Remove image"
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={styles.placeholder}>
            {uploading ? (
              <div style={styles.spinner} />
            ) : (
              <>
                <span style={styles.uploadIcon}>
                  {isCircle ? "👤" : "🖼️"}
                </span>
                <span style={styles.uploadText}>
                  {uploading ? "Uploading..." : "Drop image here or click to browse"}
                </span>
                <span style={styles.uploadHint}>JPG, PNG — max 5MB</span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────
export default function EventImageUpload({
  hostImage,
  backgroundImage,
  hostName,
  onHostImageChange,
  onBackgroundImageChange,
  onHostNameChange,
}) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>
        <span style={styles.sectionIcon}>✨</span>
        RSVP Page Personalization
      </h3>
      <p style={styles.sectionDesc}>
        Add a host photo and background image to create a luxurious, personalized
        invitation experience for your guests.
      </p>

      <div style={styles.grid}>
        {/* Host Photo */}
        <div>
          <ImageDropZone
            label="Host Photo"
            sublabel="A portrait photo of the event host — displayed as a circular headshot"
            image={hostImage}
            onImageChange={onHostImageChange}
            shape="circle"
          />

          {/* Host Name */}
          <div style={{ marginTop: "0.5rem" }}>
            <label style={styles.label}>Host Name</label>
            <input
              type="text"
              value={hostName || ""}
              onChange={(e) => onHostNameChange(e.target.value)}
              placeholder="e.g. Fred Johnson"
              style={styles.input}
            />
          </div>
        </div>

        {/* Background Image */}
        <div>
          <ImageDropZone
            label="Background Image"
            sublabel="A wide, high-quality photo — shown as the RSVP page background"
            image={backgroundImage}
            onImageChange={onBackgroundImageChange}
            shape="rectangle"
          />
        </div>
      </div>

      {/* Live Preview Hint */}
      {(hostImage || backgroundImage) && (
        <div style={styles.previewHint}>
          <span style={{ color: "#D4AF37" }}>★</span>{" "}
          Your RSVP page will display these images with an elegant overlay for a
          premium invitation feel.
        </div>
      )}
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────
const styles = {
  section: {
    background: "rgba(212,175,55,0.04)",
    border: "1px solid rgba(212,175,55,0.15)",
    borderRadius: "16px",
    padding: "2rem",
    marginBottom: "2rem",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  sectionIcon: {
    fontSize: "1.2rem",
  },
  sectionDesc: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.85rem",
    marginBottom: "1.5rem",
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
  },
  label: {
    display: "block",
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "0.5rem",
  },
  sublabel: {
    color: "rgba(255,255,255,0.35)",
    fontSize: "0.75rem",
    marginBottom: "0.75rem",
    lineHeight: 1.4,
  },
  dropZone: {
    border: "2px dashed",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.25s ease",
    overflow: "hidden",
  },
  circleZone: {
    width: "180px",
    height: "180px",
    borderRadius: "50%",
  },
  rectZone: {
    width: "100%",
    height: "200px",
    borderRadius: "12px",
  },
  placeholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem",
  },
  uploadIcon: {
    fontSize: "2rem",
    opacity: 0.6,
  },
  uploadText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.8rem",
    textAlign: "center",
  },
  uploadHint: {
    color: "rgba(255,255,255,0.25)",
    fontSize: "0.7rem",
  },
  removeBtn: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    backdropFilter: "blur(4px)",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s",
  },
  previewHint: {
    marginTop: "1.25rem",
    padding: "0.75rem 1rem",
    background: "rgba(212,175,55,0.06)",
    borderRadius: "10px",
    border: "1px solid rgba(212,175,55,0.12)",
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.8rem",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#D4AF37",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};