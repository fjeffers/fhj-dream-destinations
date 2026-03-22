import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";

const GREEN = "#00c48c";

const defaults = {
  hero_title: "Travel, Reimagined.",
  hero_subtitle:
    "FHJ Dream Destinations was founded on a simple belief: every journey should feel like it was designed just for you — because it was.",
  philosophy_title: "The FHJ Philosophy",
  philosophy_text_1: "We don't sell vacations. We design experiences.",
  philosophy_text_2:
    "From the moment you reach out, you're working with a dedicated travel designer who listens, plans, and delivers.",
  pillar_1_title: "Personal, Not Automated",
  pillar_1_text: "Every trip is designed by a real person who cares about the details.",
  pillar_2_title: "Curated Access",
  pillar_2_text: "Private villas, exclusive experiences, and insider knowledge you won't find online.",
  pillar_3_title: "24/7 Concierge",
  pillar_3_text: "We're one message away — before, during, and after your journey.",
  founder_name: "Farhan Jiwani",
  founder_phone: "",
  founder_email: "",
  founder_bio:
    "With a passion for world travel and an eye for the extraordinary, Farhan built FHJ Dream Destinations to bring the art of bespoke travel to discerning clients.",
  founder_quote: "I believe travel should feel effortless — and deeply personal.",
  cta_title: "Ready to Start?",
  cta_subtitle: "Tell us where you want to go. We'll take care of the rest.",
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

export default function About() {
  const [content, setContent] = useState(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/.netlify/functions/get-about");
        const data = await res.json();
        if (data.content) {
          setContent({ ...defaults, ...data.content });
        }
      } catch (err) {
        console.error("Failed to load about content:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const c = content;

  if (loading) {
    return (
      <FHJBackground page="about">
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.08)",
            borderTopColor: "#00c48c",
            animation: "fhj-spin 0.7s linear infinite",
          }} />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", letterSpacing: "0.05em" }}>Loading…</p>
          <style>{`@keyframes fhj-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </FHJBackground>
    );
  }

  return (
    <FHJBackground page="about">
      <div style={{ minHeight: "100vh", color: "white" }}>

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{ padding: "8rem 2rem 6rem", textAlign: "center", maxWidth: "860px", margin: "0 auto" }}>
        <motion.div {...fadeUp(0)}>
          <div style={{ display: "inline-block", background: `linear-gradient(135deg, ${GREEN} 0%, #00a67a 100%)`, borderRadius: "50px", padding: "0.4rem 1.2rem", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#000", marginBottom: "2rem" }}>
            About Us
          </div>
        </motion.div>
        <motion.h1 {...fadeUp(0.1)} style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: "1.5rem", background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {c.hero_title}
        </motion.h1>
        <motion.p {...fadeUp(0.2)} style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: "700px", margin: "0 auto" }}>
          {c.hero_subtitle}
        </motion.p>
      </section>

      {/* ── PHILOSOPHY ──────────────────────────────────── */}
      <section style={{ padding: "5rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
        <motion.h2 {...fadeUp(0)} style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, marginBottom: "2rem", color: GREEN }}>
          {c.philosophy_title}
        </motion.h2>
        <motion.p {...fadeUp(0.1)} style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          {c.philosophy_text_1}
        </motion.p>
        <motion.p {...fadeUp(0.2)} style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
          {c.philosophy_text_2}
        </motion.p>
      </section>

      {/* ── THREE PILLARS ───────────────────────────────── */}
      <section style={{ padding: "5rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <motion.h2 {...fadeUp(0)} style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, textAlign: "center", marginBottom: "3rem", color: "white" }}>
          What Sets Us Apart
        </motion.h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
          {[
            { title: c.pillar_1_title, text: c.pillar_1_text, icon: "🎯" },
            { title: c.pillar_2_title, text: c.pillar_2_text, icon: "🗝️" },
            { title: c.pillar_3_title, text: c.pillar_3_text, icon: "💬" },
          ].map(({ title, text, icon }, i) => (
            <motion.div key={i} {...fadeUp(i * 0.15)} whileHover={{ scale: 1.02, borderColor: "rgba(0,196,140,0.3)" }} style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2rem", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", cursor: "default" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1.25rem" }}>{icon}</div>
              <h3 style={{ color: GREEN, fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.75rem" }}>{title}</h3>
              <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, margin: 0, fontSize: "0.95rem" }}>{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOUNDER ─────────────────────────────────────── */}
      <section style={{ padding: "5rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
        <motion.div {...fadeUp(0)} style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "clamp(2rem, 5vw, 3.5rem)", boxShadow: "0 8px 48px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: `linear-gradient(135deg, ${GREEN} 0%, #00a67a 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>
              ✈️
            </div>
            <div>
              <h2 style={{ color: "white", fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>{c.founder_name}</h2>
              <p style={{ color: GREEN, fontSize: "0.9rem", margin: "0.25rem 0 0", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Founder &amp; Travel Designer</p>
            </div>
          </div>

          <p style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontSize: "1.05rem", marginBottom: "1.75rem" }}>
            {c.founder_bio}
          </p>

          {c.founder_quote && (
            <blockquote style={{ borderLeft: `4px solid ${GREEN}`, paddingLeft: "1.25rem", margin: "0 0 1.75rem", color: "rgba(255,255,255,0.7)", fontStyle: "italic", fontSize: "1.1rem", lineHeight: 1.7 }}>
              "{c.founder_quote}"
            </blockquote>
          )}

          {(c.founder_email || c.founder_phone) && (
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
              {c.founder_email && (
                <a href={`mailto:${c.founder_email}`} style={{ color: GREEN, textDecoration: "none", fontSize: "0.95rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  ✉️ {c.founder_email}
                </a>
              )}
              {c.founder_phone && (
                <a href={`tel:${c.founder_phone}`} style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  📞 {c.founder_phone}
                </a>
              )}
            </div>
          )}
        </motion.div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section style={{ padding: "6rem 2rem 8rem", textAlign: "center" }}>
        <motion.h2 {...fadeUp(0)} style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: "1rem", background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {c.cta_title}
        </motion.h2>
        <motion.p {...fadeUp(0.1)} style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", marginBottom: "2.5rem", maxWidth: "500px", margin: "0 auto 2.5rem" }}>
          {c.cta_subtitle}
        </motion.p>
        <motion.div {...fadeUp(0.2)}>
          <a href="/concierge" style={{ display: "inline-block", background: `linear-gradient(135deg, ${GREEN} 0%, #00a67a 100%)`, color: "#000", fontWeight: 700, fontSize: "1rem", padding: "1rem 2.5rem", borderRadius: "14px", textDecoration: "none", boxShadow: "0 8px 24px rgba(0,196,140,0.3)", letterSpacing: "0.3px" }}>
            Start Planning →
          </a>
        </motion.div>
      </section>

      </div>
    </FHJBackground>
  );
}

