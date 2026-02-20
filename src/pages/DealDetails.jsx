import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FHJButton, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";
import FHJSkeleton from "../components/FHJ/FHJSkeleton.jsx";

// Helper to get field from flat Supabase or nested .fields
const getField = (deal, ...keys) => {
  const f = deal.fields || deal;
  for (const k of keys) {
    if (f[k] !== undefined && f[k] !== null && f[k] !== '') return f[k];
  }
  return null;
};

export default function DealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/.netlify/functions/get-deals?id=${id}&t=${Date.now()}`);
        const data = await res.json();
        console.log('Loaded Deal:', data.deal || data);
        setDeal(data.deal || data);
      } catch (err) {
        console.error("Failed to load deal:", err);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <FHJBackground page="deals">
        <div style={{ padding: "10rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
          <FHJSkeleton variant="profile" />
          <div style={{ marginTop: "2rem" }}>
            <FHJSkeleton variant="text" lines={5} />
          </div>
        </div>
      </FHJBackground>
    );
  }

  if (!deal) {
    return (
      <FHJBackground page="deals">
        <div style={{ padding: "10rem 2rem", textAlign: "center", color: "white" }}>
          <h2>Deal Not Found</h2>
          <p style={{ opacity: 0.7, marginBottom: "2rem" }}>
            This experience may no longer be available.
          </p>
          <FHJButton onClick={() => navigate("/")}>Back to Home</FHJButton>
        </div>
      </FHJBackground>
    );
  }

  // Extract all fields
  const title = getField(deal, "Trip Name", "trip_name", "title", "name") || "Exclusive Experience";
  const category = getField(deal, "Category", "category") || "Curated";
  const price = getField(deal, "Price", "price");
  const mainImage = getField(deal, "Place Image URL", "place_image_url", "image") || "https://images.unsplash.com/photo-1548574505-5e239809ee19";
  const notes = getField(deal, "Notes", "notes", "description") || "";
  
  // New detailed fields
  const duration = getField(deal, "Duration", "duration");
  const location = getField(deal, "Location", "location");
  const departureDates = getField(deal, "Departure Dates", "departure_dates");
  const highlights = getField(deal, "Highlights", "highlights") || [];
  const itinerary = getField(deal, "Itinerary", "itinerary");
  const inclusions = getField(deal, "Inclusions", "inclusions") || [];
  const exclusions = getField(deal, "Exclusions", "exclusions") || [];
  const additionalImages = getField(deal, "Additional Images", "additional_images") || [];
  const accommodation = getField(deal, "Accommodation", "accommodation");
  const maxGuests = getField(deal, "Max Guests", "max_guests");
  const difficultyLevel = getField(deal, "Difficulty Level", "difficulty_level");
  const bestTimeToVisit = getField(deal, "Best Time to Visit", "best_time_to_visit");
  const depositRequired = getField(deal, "Deposit Required", "deposit_required");
  const featured = getField(deal, "Featured", "featured");

  // All images (main + additional)
  const allImages = [mainImage, ...(Array.isArray(additionalImages) ? additionalImages : [])].filter(Boolean);

  return (
    <div style={{ position: "relative", minHeight: "100vh", color: "white", background: "#000" }}>

      {/* CINEMATIC HERO with Image Gallery */}
      <div style={heroStyle}>
        <div style={{ ...heroBgStyle, backgroundImage: `url("${allImages[activeImageIndex]}")` }} />
        <div style={heroOverlay} />

        {/* Image Gallery Navigation */}
        {allImages.length > 1 && (
          <div style={imageGalleryNav}>
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                style={{
                  ...imageGalleryDot,
                  background: idx === activeImageIndex ? fhjTheme.primary : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={heroContentStyle}
        >
          {featured && (
            <span style={featuredBadge}>✨ Featured Experience</span>
          )}
          <span style={categoryBadge}>{category}</span>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 900, margin: "0.75rem 0", lineHeight: 1.1, textShadow: "0 4px 20px rgba(0,0,0,0.7)" }}>
            {title}
          </h1>
          
          {location && (
            <p style={{ fontSize: "1.3rem", color: "#cbd5e1", margin: "0.5rem 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <span>📍</span> {location}
            </p>
          )}

          {duration && (
            <p style={{ fontSize: "1.1rem", color: "#94a3b8", margin: "0.5rem 0" }}>
              {duration}
            </p>
          )}

          {price && (
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: fhjTheme.primary, margin: "1rem 0", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              Starting at ${Number(price).toLocaleString()}
              {depositRequired && <span style={{ fontSize: "0.9rem", opacity: 0.7 }}> · ${depositRequired} deposit</span>}
            </p>
          )}
        </motion.div>
      </div>

      {/* CONTENT SECTION */}
      <div style={contentSection}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: "1200px", margin: "0 auto" }}
        >

          {/* Quick Info Bar */}
          <div style={quickInfoBar}>
            {duration && <InfoPill icon="⏱️" label={duration} />}
            {maxGuests && <InfoPill icon="👥" label={`Up to ${maxGuests} guests`} />}
            {difficultyLevel && <InfoPill icon="📊" label={difficultyLevel} />}
            {bestTimeToVisit && <InfoPill icon="🌤️" label={bestTimeToVisit} />}
          </div>

          {/* Description */}
          {notes && (
            <div style={descriptionBlock}>
              <h2 style={{ color: fhjTheme.primary, fontSize: "1.8rem", margin: "0 0 1rem" }}>About This Experience</h2>
              <p style={{ color: "#cbd5e1", fontSize: "1.1rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {notes}
              </p>
            </div>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <div style={highlightsBlock}>
              <h2 style={{ color: "white", fontSize: "1.8rem", margin: "0 0 1.5rem" }}>Experience Highlights</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                {highlights.map((highlight, idx) => (
                  <div key={idx} style={highlightCard}>
                    <span style={{ fontSize: "1.5rem", marginRight: "0.75rem" }}>✨</span>
                    <span style={{ color: "#e2e8f0", fontSize: "1rem" }}>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary */}
          {itinerary && (
            <div style={itineraryBlock}>
              <h2 style={{ color: "white", fontSize: "1.8rem", margin: "0 0 1.5rem" }}>Your Itinerary</h2>
              <div style={{ color: "#cbd5e1", fontSize: "1.05rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {itinerary}
              </div>
            </div>
          )}

          {/* Accommodation */}
          {accommodation && (
            <div style={accommodationBlock}>
              <h2 style={{ color: "white", fontSize: "1.8rem", margin: "0 0 1rem" }}>
                <span style={{ marginRight: "0.5rem" }}>🏨</span>
                Where You'll Stay
              </h2>
              <p style={{ color: "#cbd5e1", fontSize: "1.05rem", lineHeight: 1.6 }}>
                {accommodation}
              </p>
            </div>
          )}

          {/* Inclusions & Exclusions Side by Side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
            
            {/* What's Included */}
            {inclusions.length > 0 && (
              <div style={inclusionsBlock}>
                <h3 style={{ color: fhjTheme.primary, margin: "0 0 1.5rem", fontSize: "1.5rem" }}>
                  ✅ What's Included
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {inclusions.map((item, idx) => (
                    <div key={idx} style={listItem}>
                      <span style={{ color: fhjTheme.primary, marginRight: "0.75rem" }}>✓</span>
                      <span style={{ color: "#cbd5e1" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Not Included */}
            {exclusions.length > 0 && (
              <div style={exclusionsBlock}>
                <h3 style={{ color: "#f87171", margin: "0 0 1.5rem", fontSize: "1.5rem" }}>
                  ❌ Not Included
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {exclusions.map((item, idx) => (
                    <div key={idx} style={listItem}>
                      <span style={{ color: "#f87171", marginRight: "0.75rem" }}>•</span>
                      <span style={{ color: "#94a3b8" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Departure Dates */}
          {departureDates && (
            <div style={departureDatesBlock}>
              <h3 style={{ color: "white", margin: "0 0 1rem", fontSize: "1.5rem" }}>
                <span style={{ marginRight: "0.5rem" }}>📅</span>
                Available Departure Dates
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: "1.05rem" }}>
                {departureDates}
              </p>
            </div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={ctaBlock}
          >
            <h3 style={{ color: "white", margin: "0 0 0.5rem", fontSize: "1.8rem" }}>Ready to Experience This?</h3>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem", fontSize: "1.05rem" }}>
              Tell us your vision and we'll curate the perfect trip.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <FHJButton
                onClick={() => navigate(`/appointments?deal=${encodeURIComponent(title)}`)}
                style={{ padding: "1.2rem 3rem", fontSize: "1.1rem", borderRadius: "50px" }}
              >
                Book This Experience
              </FHJButton>
              <FHJButton
                variant="ghost"
                onClick={() => navigate("/")}
                style={{ padding: "1.2rem 2.5rem", borderRadius: "50px" }}
              >
                View All Deals
              </FHJButton>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoPill({ icon, label }) {
  return (
    <div style={infoPillStyle}>
      <span style={{ fontSize: "1.2rem", marginRight: "0.5rem" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// Styles
const heroStyle = { position: "relative", height: "85vh", minHeight: "500px", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" };
const heroBgStyle = { position: "absolute", inset: 0, backgroundSize: "cover", backgroundPosition: "center", transition: "background-image 0.5s ease" };
const heroOverlay = { position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)" };
const heroContentStyle = { position: "relative", zIndex: 2, textAlign: "center", padding: "3rem 2rem 5rem", maxWidth: "900px" };
const categoryBadge = { display: "inline-block", padding: "0.4rem 1.25rem", background: "rgba(0,196,140,0.15)", border: "1px solid rgba(0,196,140,0.4)", borderRadius: "999px", color: "#00c48c", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginRight: "0.75rem" };
const featuredBadge = { display: "inline-block", padding: "0.4rem 1.25rem", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.4)", borderRadius: "999px", color: "#fbbf24", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "1px", marginBottom: "0.75rem" };
const imageGalleryNav = { position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "flex", gap: "0.5rem" };
const imageGalleryDot = { width: "12px", height: "12px", borderRadius: "50%", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 };

const contentSection = { background: "linear-gradient(to bottom, #000 0%, #0a0a0a 100%)", padding: "4rem 2rem 6rem" };
const quickInfoBar = { display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "3rem" };
const infoPillStyle = { display: "flex", alignItems: "center", padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: "0.95rem" };

const descriptionBlock = { marginBottom: "3rem", padding: "2.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)" };
const highlightsBlock = { marginBottom: "3rem", padding: "2.5rem", background: "rgba(0,196,140,0.04)", borderRadius: "20px", border: "1px solid rgba(0,196,140,0.12)" };
const highlightCard = { display: "flex", alignItems: "center", padding: "1rem", background: "rgba(0,196,140,0.08)", borderRadius: "12px", border: "1px solid rgba(0,196,140,0.15)" };
const itineraryBlock = { marginBottom: "3rem", padding: "2.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)" };
const accommodationBlock = { marginBottom: "3rem", padding: "2.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)" };
const inclusionsBlock = { padding: "2rem", background: "rgba(0,196,140,0.04)", borderRadius: "16px", border: "1px solid rgba(0,196,140,0.12)" };
const exclusionsBlock = { padding: "2rem", background: "rgba(248,113,113,0.04)", borderRadius: "16px", border: "1px solid rgba(248,113,113,0.12)" };
const listItem = { display: "flex", alignItems: "flex-start", lineHeight: 1.6 };
const departureDatesBlock = { marginBottom: "3rem", padding: "2rem", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" };
const ctaBlock = { textAlign: "center", padding: "3rem 2rem", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)" };