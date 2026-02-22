// ==========================================================
// FILE: DealDetails.jsx - Enhanced with Scrollbar & Close Button
// Location: src/pages/DealDetails.jsx
// ==========================================================

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FHJButton, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";

export default function DealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadDeal = async () => {
      try {
        const res = await fetch(`/.netlify/functions/get-deals?id=${id}`);
        const data = await res.json();
        setDeal(data.deal || data);
      } catch (err) {
        console.error("Failed to load deal:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDeal();
  }, [id]);

  if (loading) {
    return (
      <FHJBackground page="home">
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "white", fontSize: "1.2rem" }}>Loading...</p>
        </div>
      </FHJBackground>
    );
  }

  if (!deal) {
    return (
      <FHJBackground page="home">
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1.5rem" }}>
          <p style={{ color: "white", fontSize: "1.2rem" }}>Deal not found</p>
          <FHJButton onClick={() => navigate("/")}>Back to Home</FHJButton>
        </div>
      </FHJBackground>
    );
  }

  // Extract deal data
  const title = deal["Trip Name"] || deal.trip_name || "Untitled";
  const category = deal.Category || deal.category || "";
  const price = deal.Price || deal.price || 0;
  const mainImage = deal["Place Image URL"] || deal.place_image_url || "";
  const description = deal.Notes || deal.notes || "";
  const duration = deal.Duration || deal.duration || "";
  const location = deal.Location || deal.location || "";
  const departureDates = deal["Departure Dates"] || deal.departure_dates || "";
  const highlights = deal.Highlights || deal.highlights || [];
  const itinerary = deal.Itinerary || deal.itinerary || "";
  const inclusions = deal.Inclusions || deal.inclusions || [];
  const exclusions = deal.Exclusions || deal.exclusions || [];
  const additionalImages = deal["Additional Images"] || deal.additional_images || [];
  const accommodation = deal.Accommodation || deal.accommodation || "";
  const maxGuests = deal["Max Guests"] || deal.max_guests || 2;
  const difficultyLevel = deal["Difficulty Level"] || deal.difficulty_level || "";
  const bestTimeToVisit = deal["Best Time to Visit"] || deal.best_time_to_visit || "";
  const depositRequired = deal["Deposit Required"] || deal.deposit_required || "";
  const featured = deal.Featured ?? deal.featured ?? false;

  // All images for gallery
  const allImages = [mainImage, ...additionalImages].filter(Boolean);

  const nextImage = () => setCurrentImageIndex((currentImageIndex + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((currentImageIndex - 1 + allImages.length) % allImages.length);

  return (
    <FHJBackground page="home">
      {/* CLOSE BUTTON - Fixed at top right */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white",
          fontSize: "1.8rem",
          cursor: "pointer",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "rgba(248,113,113,0.9)";
          e.target.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "rgba(0,0,0,0.8)";
          e.target.style.transform = "scale(1)";
        }}
      >
        ×
      </button>

      {/* SCROLLABLE CONTENT */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "100px 2rem 4rem",
        overflowY: "auto",
        maxHeight: "100vh",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* FEATURED BADGE */}
          {featured && (
            <div style={{
              display: "inline-block",
              background: "rgba(251,191,36,0.2)",
              border: "1px solid rgba(251,191,36,0.4)",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              color: "#fbbf24",
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "1rem",
              letterSpacing: "1px",
            }}>
              ⭐ FEATURED DEAL
            </div>
          )}

          {/* TITLE & CATEGORY */}
          <h1 style={{
            color: "white",
            fontSize: "2.5rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}>
            {title}
          </h1>

          {category && (
            <p style={{
              color: fhjTheme.primary,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: 600,
              marginBottom: "1.5rem",
            }}>
              {category}
            </p>
          )}

          {/* IMAGE GALLERY */}
          {allImages.length > 0 && (
            <div style={{
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              marginBottom: "2rem",
              aspectRatio: "16/9",
              background: "#000",
            }}>
              <img
                src={allImages[currentImageIndex]}
                alt={`${title} - Image ${currentImageIndex + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {allImages.length > 1 && (
                <>
                  <button onClick={prevImage} style={{ ...navArrowStyle, left: "15px" }}>←</button>
                  <button onClick={nextImage} style={{ ...navArrowStyle, right: "15px" }}>→</button>
                  
                  {/* Image dots */}
                  <div style={{
                    position: "absolute",
                    bottom: "15px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "8px",
                  }}>
                    {allImages.map((_, idx) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        style={{
                          width: idx === currentImageIndex ? "30px" : "10px",
                          height: "10px",
                          borderRadius: "5px",
                          background: idx === currentImageIndex ? fhjTheme.primary : "rgba(255,255,255,0.5)",
                          cursor: "pointer",
                          transition: "all 0.3s",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* QUICK INFO PILLS */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
            {duration && <InfoPill icon="⏱️" label={duration} />}
            {location && <InfoPill icon="📍" label={location} />}
            {maxGuests && <InfoPill icon="👥" label={`Up to ${maxGuests} guests`} />}
            {difficultyLevel && <InfoPill icon="⚡" label={difficultyLevel} />}
            {bestTimeToVisit && <InfoPill icon="📅" label={bestTimeToVisit} />}
          </div>

          {/* PRICE */}
          {price > 0 && (
            <div style={{
              background: "rgba(0,196,140,0.1)",
              border: "1px solid rgba(0,196,140,0.3)",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Starting from</p>
              <p style={{ color: fhjTheme.primary, fontSize: "2.5rem", fontWeight: 800, margin: 0 }}>
                ${Number(price).toLocaleString()}
              </p>
              {depositRequired && (
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                  ${Number(depositRequired).toLocaleString()} deposit required
                </p>
              )}
            </div>
          )}

          {/* DESCRIPTION */}
          {description && (
            <Section title="About This Experience">
              <p style={textStyle}>{description}</p>
            </Section>
          )}

          {/* HIGHLIGHTS */}
          {highlights.length > 0 && (
            <Section title="Experience Highlights">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                {highlights.map((highlight, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    gap: "0.75rem",
                    padding: "1rem",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <span style={{ fontSize: "1.3rem" }}>✨</span>
                    <p style={{ ...textStyle, margin: 0 }}>{highlight}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ITINERARY */}
          {itinerary && (
            <Section title="Day-by-Day Itinerary">
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "12px",
                padding: "1.5rem",
              }}>
                <pre style={{
                  ...textStyle,
                  fontFamily: "inherit",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.8,
                }}>{itinerary}</pre>
              </div>
            </Section>
          )}

          {/* ACCOMMODATION */}
          {accommodation && (
            <Section title="Accommodation">
              <p style={textStyle}>{accommodation}</p>
            </Section>
          )}

          {/* INCLUSIONS & EXCLUSIONS */}
          {(inclusions.length > 0 || exclusions.length > 0) && (
            <Section title="What's Included">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                {inclusions.length > 0 && (
                  <div>
                    <h4 style={{ color: "#4ade80", fontSize: "1rem", marginBottom: "1rem", fontWeight: 600 }}>✅ Included</h4>
                    <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#e2e8f0" }}>
                      {inclusions.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: "0.5rem", lineHeight: 1.6 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {exclusions.length > 0 && (
                  <div>
                    <h4 style={{ color: "#f87171", fontSize: "1rem", marginBottom: "1rem", fontWeight: 600 }}>❌ Not Included</h4>
                    <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#e2e8f0" }}>
                      {exclusions.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: "0.5rem", lineHeight: 1.6 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* DEPARTURE DATES */}
          {departureDates && (
            <Section title="Departure Dates">
              <p style={textStyle}>{departureDates}</p>
            </Section>
          )}

          {/* BOOK NOW BUTTON */}
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <FHJButton
              onClick={() => navigate(`/appointments?deal=${encodeURIComponent(title)}`)}
              style={{
                padding: "1.2rem 3rem",
                fontSize: "1.1rem",
                borderRadius: "50px",
                boxShadow: "0 0 30px rgba(0,196,140,0.4)",
              }}
            >
              Book This Experience
            </FHJButton>
          </div>
        </motion.div>
      </div>
    </FHJBackground>
  );
}

// Helper Components
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <h3 style={{
        color: fhjTheme.primary,
        fontSize: "1.4rem",
        fontWeight: 700,
        marginBottom: "1.25rem",
        letterSpacing: "0.5px",
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoPill({ icon, label }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "999px",
      padding: "0.6rem 1.25rem",
    }}>
      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
      <span style={{ color: "#e2e8f0", fontSize: "0.9rem", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// Styles
const textStyle = {
  color: "#e2e8f0",
  fontSize: "1rem",
  lineHeight: 1.7,
};

const navArrowStyle = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "white",
  fontSize: "1.8rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};
