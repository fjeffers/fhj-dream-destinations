// ==========================================================
// FILE: RSVPPage.jsx — Luxurious Public RSVP Page
// Location: src/pages/RSVPPage.jsx
//
// Features:
//   - Full-bleed background image with cinematic overlay
//   - Host portrait in gold accent ring with pulse glow
//   - Playfair Display + Montserrat typography
//   - Glassmorphism form card
//   - Elegant confirmation screen
//   - Graceful dark fallback when no images set
//
// Route: /rsvp/:slug
// ==========================================================

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap";

function injectAssets() {
  if (typeof document === "undefined") return;
  if (!document.getElementById("rsvp-fonts")) {
    const link = document.createElement("link");
    link.id = "rsvp-fonts";
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }
  if (!document.getElementById("rsvp-keyframes")) {
    const style = document.createElement("style");
    style.id = "rsvp-keyframes";
    style.textContent = `
      @keyframes rsvp-fadeUp {
        from { opacity: 0; transform: translateY(30px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes rsvp-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.3); }
        50%      { box-shadow: 0 0 0 12px rgba(212,175,55,0); }
      }
      @keyframes rsvp-spin {
        to { transform: rotate(360deg); }
      }
      .rsvp-input:focus {
        border-color: rgba(212,175,55,0.4) !important;
        box-shadow: 0 0 0 3px rgba(212,175,55,0.08) !important;
      }
    `;
    document.head.appendChild(style);
  }
}

export default function RSVPPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", guests: "1", message: "",
  });

  useEffect(() => { injectAssets(); fetchEvent(); }, [slug]);

  async function fetchEvent() {
    try {
      const res = await fetch(`/.netlify/functions/get-event?slug=${slug}`);
      if (!res.ok) throw new Error("Event not found");
      const data = await res.json();
      // get-event returns { event, rsvps, rsvpCount, totalGuests }
      setEvent(data.event || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!form.name || !form.email) return;
    setSubmitting(true);
    try {
      const res = await fetch("/.netlify/functions/submit-rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id, slug,
          ...form, guests: parseInt(form.guests, 10),
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  // ── Loading ─────────────────────────────────────
  if (loading) return (
    <div style={S.loadingWrap}>
      <div style={S.spinner} />
      <p style={S.loadingText}>Preparing your invitation...</p>
    </div>
  );

  // ── Error ───────────────────────────────────────
  if (error || !event) return (
    <div style={S.loadingWrap}>
      <p style={{ ...S.loadingText, color: "#ff6b6b" }}>{error || "Event not found"}</p>
    </div>
  );

  // Resolve fields (handle both naming conventions)
  const bgImage = event.background || event.Background || "";
  const hostImage = event.client_pic || event.clientPic || event.ClientPic || "";
  const hostName = event.host_name || event.hostName || event.HostName || "Your Host";
  const eventTitle = event.title || event.Title || event.name || "";

  // ── Thank You Screen ───────────────────────────
  if (submitted) return (
    <div style={{ ...S.page, backgroundImage: bgImage ? `url(${bgImage})` : "none" }}>
      <div style={S.overlay} />
      <div style={S.goldLineTop} />
      <div style={{ ...S.thankCard, animation: "rsvp-fadeUp 0.8s ease forwards" }}>
        <div style={S.checkCircle}>✓</div>
        <h2 style={S.thankTitle}>You're on the List</h2>
        <p style={S.thankText}>
          Thank you, <strong>{form.name}</strong>. Your RSVP for <em>{eventTitle}</em> has been confirmed.
        </p>
        {hostImage && (
          <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center" }}>
            <img src={hostImage} alt={hostName} style={S.thankHostImg} />
            <span style={S.thankHostName}>Hosted by {hostName}</span>
          </div>
        )}
        <p style={S.thankFooter}>A confirmation will be sent to {form.email}</p>
      </div>
    </div>
  );

  // ── Main RSVP Page ─────────────────────────────
  return (
    <div style={{
      ...S.page,
      backgroundImage: bgImage ? `url(${bgImage})` : "none",
      backgroundColor: bgImage ? undefined : "#0a0a0f",
    }}>
      <div style={S.overlay} />
      <div style={S.vignette} />
      <div style={S.goldLineTop} />
      <div style={S.goldLineBottom} />

      <div style={S.content}>
        {/* Header */}
        <div style={{ ...S.header, animation: "rsvp-fadeUp 0.7s ease forwards" }}>
          {/* Host Photo */}
          {hostImage && (
            <div style={S.hostWrap}>
              <div style={S.hostRing}>
                <img src={hostImage} alt={hostName} style={S.hostImg} />
              </div>
              <p style={S.hostedBy}>Hosted by <span style={S.hostNameGold}>{hostName}</span></p>
            </div>
          )}

          {/* Ornament */}
          <div style={S.ornament}>
            <span style={S.ornLine} />
            <span style={{ color: gold, fontSize: "0.6rem" }}>◆</span>
            <span style={S.ornLine} />
          </div>

          <h1 style={S.title}>{eventTitle}</h1>

          {/* Description - right under the title */}
          {(event.description || event.Description) ? (
            <p style={S.desc}>{event.description || event.Description}</p>
          ) : null}

          {/* Event Image */}
          {(event.event_pic || event.eventPic || event.EventPic) && (
            <div style={S.eventPicWrap}>
              <img
                src={event.event_pic || event.eventPic || event.EventPic}
                alt={eventTitle}
                style={S.eventPicImg}
              />
            </div>
          )}

          {/* Detail chips */}
          <div style={S.details}>
            {(event.date || event.Date) && <div style={S.chip}><span>📅</span> {formatDate(event.date || event.Date)}</div>}
            {(event.time || event.Time) && <div style={S.chip}><span>🕐</span> {event.time || event.Time}</div>}
            {(event.location || event.Location) && <div style={S.chip}><span>📍</span> {event.location || event.Location}</div>}
          </div>
        </div>

        {/* Form Card */}
        <div style={{ ...S.card, animation: "rsvp-fadeUp 0.9s ease forwards" }}>
          <div style={S.cardHead}>
            <h2 style={S.cardTitle}>Reserve Your Spot</h2>
            <div style={S.cardDivider} />
          </div>

          <div style={S.cardBody}>
            <div style={S.field}>
              <label style={S.label}>Full Name *</label>
              <input className="rsvp-input" type="text" value={form.name} onChange={set("name")} placeholder="Your full name" style={S.input} />
            </div>

            <div style={S.field}>
              <label style={S.label}>Email Address *</label>
              <input className="rsvp-input" type="email" value={form.email} onChange={set("email")} placeholder="your@email.com" style={S.input} />
            </div>

            <div style={S.row}>
              <div style={{ ...S.field, flex: 1 }}>
                <label style={S.label}>Phone</label>
                <input className="rsvp-input" type="tel" value={form.phone} onChange={set("phone")} placeholder="(555) 000-0000" style={S.input} />
              </div>
              <div style={{ ...S.field, width: "130px" }}>
                <label style={S.label}>Guests</label>
                <input className="rsvp-input" type="number" min="1" value={form.guests} onChange={set("guests")} placeholder="1" style={S.input} />
              </div>
            </div>

            <div style={S.field}>
              <label style={S.label}>Message (optional)</label>
              <textarea className="rsvp-input" value={form.message} onChange={set("message")}
                placeholder="Any dietary restrictions, special requests, or just say hello..."
                rows={3} style={{ ...S.input, resize: "vertical", minHeight: "80px" }} />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!form.name || !form.email || submitting}
              style={{
                ...S.btn,
                opacity: (!form.name || !form.email || submitting) ? 0.5 : 1,
                cursor: (!form.name || !form.email || submitting) ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Confirming..." : "Confirm My RSVP"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ ...S.footer, animation: "rsvp-fadeUp 1.1s ease forwards" }}>
          <div style={S.footerLogo}>FHJ Dream Destinations</div>
          <p style={S.footerText}>Creating unforgettable travel experiences</p>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  } catch { return dateStr; }
}

// ── Styles ──────────────────────────────────────
const gold = "#D4AF37";
const goldGlow = "rgba(212,175,55,0.3)";

const S = {
  page: {
    minHeight: "100vh", width: "100%",
    backgroundSize: "cover", backgroundPosition: "center",
    backgroundAttachment: "fixed", backgroundRepeat: "no-repeat",
    position: "relative",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Montserrat', sans-serif",
  },
  overlay: {
    position: "fixed", inset: 0, zIndex: 1,
    background: "linear-gradient(180deg, rgba(5,5,15,0.65) 0%, rgba(5,5,15,0.50) 30%, rgba(5,5,15,0.60) 70%, rgba(5,5,15,0.85) 100%)",
  },
  vignette: {
    position: "fixed", inset: 0, zIndex: 1,
    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
  },
  goldLineTop: {
    position: "fixed", top: 0, left: 0, right: 0, height: "3px", zIndex: 10,
    background: `linear-gradient(90deg, transparent, ${gold}, transparent)`,
  },
  goldLineBottom: {
    position: "fixed", bottom: 0, left: 0, right: 0, height: "3px", zIndex: 10,
    background: `linear-gradient(90deg, transparent, ${gold}, transparent)`,
  },
  content: {
    position: "relative", zIndex: 5,
    width: "100%", maxWidth: "580px", padding: "3rem 1.5rem",
    display: "flex", flexDirection: "column", alignItems: "center",
  },
  header: { textAlign: "center", marginBottom: "2rem", opacity: 0 },

  // Host
  hostWrap: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" },
  hostRing: {
    width: "120px", height: "120px", borderRadius: "50%", padding: "4px",
    background: `linear-gradient(135deg, ${gold}, rgba(212,175,55,0.4), ${gold})`,
    boxShadow: `0 0 30px ${goldGlow}, 0 4px 20px rgba(0,0,0,0.4)`,
    animation: "rsvp-pulse 3s ease-in-out infinite",
    marginBottom: "0.75rem",
  },
  hostImg: {
    width: "100%", height: "100%", borderRadius: "50%",
    objectFit: "cover", border: "3px solid rgba(10,10,15,0.8)",
  },
  hostedBy: {
    color: "rgba(255,255,255,0.5)", fontSize: "0.8rem",
    fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase",
  },
  hostNameGold: { color: gold, fontWeight: 600 },

  // Ornament
  ornament: { display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "1.25rem" },
  ornLine: { display: "block", width: "60px", height: "1px", background: `linear-gradient(90deg, transparent, ${gold}, transparent)` },

  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "2.4rem", fontWeight: 700, color: "#fff",
    lineHeight: 1.2, marginBottom: "1.25rem",
    textShadow: "0 2px 20px rgba(0,0,0,0.5)",
  },
  details: { display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginBottom: "1.25rem" },
  chip: {
    display: "flex", alignItems: "center", gap: "0.4rem",
    padding: "0.45rem 1rem",
    background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)",
    borderRadius: "100px", border: "1px solid rgba(212,175,55,0.15)",
    color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", fontWeight: 500,
  },
  desc: { color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 1.5rem" },

  // Event pic
  eventPicWrap: {
    width: "100%", maxWidth: "480px", margin: "0 auto 1.5rem",
    borderRadius: "16px", overflow: "hidden",
    border: "1px solid rgba(212,175,55,0.15)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  },
  eventPicImg: {
    width: "100%", height: "auto", maxHeight: "280px",
    objectFit: "cover", display: "block",
  },

  // Form card
  card: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(212,175,55,0.12)",
    borderRadius: "20px", overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
    opacity: 0,
  },
  cardHead: { padding: "1.5rem 2rem 0", textAlign: "center" },
  cardTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "1.4rem", fontWeight: 600, color: "#fff", marginBottom: "0.75rem",
  },
  cardDivider: { width: "50px", height: "2px", background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, margin: "0 auto" },
  cardBody: { padding: "1.5rem 2rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem" },

  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  row: { display: "flex", gap: "1rem" },
  label: {
    color: "rgba(255,255,255,0.5)", fontSize: "0.72rem",
    fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
  },
  input: {
    width: "100%", padding: "0.85rem 1rem",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px", color: "#fff", fontSize: "0.9rem",
    fontFamily: "'Montserrat', sans-serif", outline: "none",
    transition: "border-color 0.25s, box-shadow 0.25s", boxSizing: "border-box",
  },
  select: {
    width: "100%", padding: "0.85rem 1rem",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px", color: "#fff", fontSize: "0.9rem",
    fontFamily: "'Montserrat', sans-serif", outline: "none",
    appearance: "none", cursor: "pointer",
  },
  btn: {
    width: "100%", padding: "1rem", marginTop: "0.5rem",
    background: `linear-gradient(135deg, ${gold}, #C49B2C)`,
    color: "#0a0a0f", fontSize: "0.9rem", fontWeight: 700,
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: "0.06em", textTransform: "uppercase",
    border: "none", borderRadius: "14px",
    transition: "all 0.3s ease",
    boxShadow: `0 4px 20px ${goldGlow}`,
  },

  // Footer
  footer: { marginTop: "2.5rem", textAlign: "center", opacity: 0 },
  footerLogo: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "1rem", fontWeight: 600, color: gold,
    letterSpacing: "0.04em", marginBottom: "0.25rem",
  },
  footerText: {
    color: "rgba(255,255,255,0.3)", fontSize: "0.7rem",
    fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase",
  },

  // Thank you
  thankCard: {
    position: "relative", zIndex: 5, textAlign: "center",
    maxWidth: "500px", padding: "3rem 2.5rem",
    background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
    border: "1px solid rgba(212,175,55,0.15)", borderRadius: "24px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.3)", opacity: 0,
  },
  checkCircle: {
    width: "64px", height: "64px", borderRadius: "50%",
    background: `linear-gradient(135deg, ${gold}, #C49B2C)`,
    color: "#0a0a0f", fontSize: "1.8rem", fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 1.25rem",
    boxShadow: `0 0 30px ${goldGlow}`,
  },
  thankTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "2rem", fontWeight: 700, color: "#fff", marginBottom: "0.75rem",
  },
  thankText: { color: "rgba(255,255,255,0.65)", fontSize: "0.95rem", lineHeight: 1.6 },
  thankHostImg: { width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${gold}` },
  thankHostName: { color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" },
  thankFooter: { marginTop: "1.5rem", color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", fontStyle: "italic" },

  // Loading
  loadingWrap: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "#0a0a0f", gap: "1.5rem",
  },
  spinner: {
    width: "40px", height: "40px",
    border: "3px solid rgba(255,255,255,0.08)", borderTopColor: gold,
    borderRadius: "50%", animation: "rsvp-spin 0.8s linear infinite",
  },
  loadingText: {
    color: "rgba(255,255,255,0.4)", fontFamily: "'Montserrat', sans-serif",
    fontSize: "0.85rem", letterSpacing: "0.05em",
  },
};