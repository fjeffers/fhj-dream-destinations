// ==========================================================
// FILE: Home.jsx  (FIXED - Deal cards link to detail page)
// Location: src/pages/Home.jsx
// ==========================================================

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FHJButton } from "../components/FHJ/FHJUIKit.jsx";
import { fetchDeals } from "../utils/fetchDeals.js";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";

export default function Home() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchDeals();
      setDeals(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <FHJBackground page="home">

      {/* --- HERO --- */}
      <div style={heroStyle}>

        <motion.img
          src="/fhj_logo.png"
          alt="FHJ Dream Destinations"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          style={{
            height: "160px", marginBottom: "2rem",
            filter: "drop-shadow(0 0 20px rgba(0,0,0,0.5))",
            mixBlendMode: "screen", borderRadius: "12px",
          }}
          onError={(e) => { e.target.style.display = "none"; }}
        />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 }}
          style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: "800", textShadow: "0 4px 15px rgba(0,0,0,0.8)", margin: 0 }}
        >
          Design Your Journey
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          style={{ fontSize: "1.2rem", opacity: 0.9, maxWidth: "600px", marginTop: "1rem", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
        >
          Tell us your vision — we'll curate the experience.
        </motion.p>

        {/* Single unified CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.4 }}
          style={{ marginTop: "2.5rem" }}
        >
          <FHJButton
            onClick={() => navigate("/appointments")}
            style={{
              borderRadius: "50px", padding: "1.1rem 3rem",
              fontSize: "1.1rem", background: "#00c48c", border: "none",
              boxShadow: "0 0 25px rgba(0,196,140,0.4)", letterSpacing: "1.5px",
              fontWeight: 700,
            }}
          >
            Book a Trip
          </FHJButton>
        </motion.div>
      </div>

      {/* --- FEATURED DEALS --- */}
      <div id="featured-deals" style={dealsSection}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", fontSize: "2.2rem", color: "white", marginBottom: "3rem", fontWeight: 400, letterSpacing: "1px" }}
        >
          Featured Deals
        </motion.h2>

        <div style={dealsGridStyle}>
          {loading && [0,1,2,3].map((i) => (
            <div key={i} style={dealCardStyle}>
              <div style={{ height: "200px", background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
              <div style={{ padding: "1.25rem" }}>
                <div style={{ width: "70%", height: "16px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", marginBottom: "10px" }} />
                <div style={{ width: "40%", height: "12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)" }} />
              </div>
            </div>
          ))}

          {!loading && deals.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "white", padding: "3rem", background: "rgba(255,255,255,0.05)", borderRadius: "16px" }}>
              <p style={{ fontSize: "1.1rem", opacity: 0.8 }}>New curated experiences arriving shortly.</p>
            </div>
          )}

          {!loading && deals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => navigate(`/deal/${deal.id}`)}
              style={dealCardStyle}
            >
              <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
                <img
                  src={deal.image}
                  alt={deal.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                  onMouseOver={(e) => e.target.style.transform = "scale(1.08)"}
                  onMouseOut={(e) => e.target.style.transform = "scale(1.0)"}
                  onError={(e) => {
                    const fallbacks = {
                      Cruise: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600",
                      Hotels: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
                      Beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
                      Mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600",
                      City: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600",
                    };
                    e.target.src = fallbacks[deal.category] || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600";
                  }}
                />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)", pointerEvents: "none" }} />
              </div>
              <div style={{ padding: "1.1rem 1.25rem" }}>
                <h3 style={{ margin: "0 0 0.4rem 0", color: "white", fontSize: "1.1rem" }}>{deal.title}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#00c48c", fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1.5px" }}>{deal.category}</span>
                  {deal.price && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>From ${Number(deal.price).toLocaleString()}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </FHJBackground>
  );
}

const heroStyle = {
  minHeight: "90vh", display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center", textAlign: "center",
  color: "white", padding: "2rem",
};

const dealsSection = {
  padding: "5rem 2rem 6rem",
  background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)",
};

const dealsGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
  gap: "1.25rem", maxWidth: "1300px", margin: "0 auto",
};

const dealCardStyle = {
  background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "14px",
  overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  cursor: "pointer", display: "flex", flexDirection: "column",
};

// Responsive grid
if (typeof document !== "undefined") {
  const id = "fhj-deals-grid-responsive";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @media (max-width: 1100px) {
        #featured-deals > div:last-of-type { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 600px) {
        #featured-deals > div:last-of-type { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);
  }
}
