// ==========================================================
// FILE: EventPage.jsx — Public Event Details Page
// Location: src/components/EventPage.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function EventPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/.netlify/functions/get-event?slug=${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.event) {
          setEvent(data.event);
          setRsvpCount(data.rsvpCount || 0);
          setTotalGuests(data.totalGuests || 0);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <p style={{ color: "#94a3b8" }}>Loading event...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={pageWrap}>
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <span style={{ fontSize: "4rem" }}>🔍</span>
          <h2 style={{ color: "white", marginTop: "1rem" }}>Event Not Found</h2>
          <p style={{ color: "#94a3b8" }}>This event may have ended or the link is incorrect.</p>
          <Link to="/" style={{ color: "#00c48c", textDecoration: "none", fontWeight: 600 }}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  const pic = event.event_pic || event.eventPic || "";
  const bg = event.background || "";
  const title = event.title || "Event";
  const date = event.date || "";
  const time = event.time || "";
  const location = event.location || "";
  const host = event.host_name || event.hostName || "";
  const description = event.description || "";

  return (
    <div style={{
      ...pageWrap,
      backgroundImage: bg ? `linear-gradient(rgba(11,17,32,0.85), rgba(11,17,32,0.95)), url(${bg})` : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 1rem" }}>
        {/* Event Image */}
        {pic && (
          <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "1.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
            <img src={pic} alt={title} style={{ width: "100%", maxHeight: "400px", objectFit: "cover", display: "block" }} />
          </div>
        )}

        {/* Event Details */}
        <div style={cardStyle}>
          <p style={{ color: "#00c48c", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 0.5rem" }}>UPCOMING EVENT</p>
          <h1 style={{ color: "white", fontSize: "1.8rem", fontWeight: 700, margin: "0 0 1rem", lineHeight: 1.2 }}>{title}</h1>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
            {date && <p style={{ color: "#e2e8f0", fontSize: "0.95rem", margin: 0 }}>📅 {date}{time ? ` at ${time}` : ""}</p>}
            {location && <p style={{ color: "#cbd5e1", fontSize: "0.9rem", margin: 0 }}>📍 {location}</p>}
            {host && <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>👤 Hosted by {host}</p>}
          </div>

          {description && (
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.7, margin: "0 0 1.5rem", whiteSpace: "pre-wrap" }}>
              {description}
            </p>
          )}

          {/* Guest count */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ padding: "0.5rem 1rem", background: "rgba(0,196,140,0.1)", borderRadius: "20px" }}>
              <span style={{ color: "#00c48c", fontSize: "0.85rem", fontWeight: 600 }}>
                {totalGuests} guest{totalGuests !== 1 ? "s" : ""} attending
              </span>
            </div>
          </div>

          {/* RSVP Button */}
          <button
            onClick={() => navigate(`/rsvp/${slug}`)}
            style={{
              width: "100%", padding: "0.85rem", borderRadius: "10px", fontSize: "1rem", fontWeight: 700,
              background: "#00c48c", border: "none", color: "white", cursor: "pointer",
              letterSpacing: "0.5px", transition: "all 0.2s",
            }}
          >
            RSVP Now
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link to="/" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>
            Powered by <span style={{ color: "#00c48c", fontWeight: 600 }}>FHJ Dream Destinations</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const pageWrap = {
  minHeight: "100vh",
  background: "#0b1120",
};

const cardStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
  padding: "2rem",
  backdropFilter: "blur(10px)",
};