// ==========================================================
// 💎 FILE: AdminAbout.jsx - LUXURY EDITION
// Beautiful glassmorphism admin for About page management
// Location: src/pages/AdminAbout.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminAbout({ admin }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    philosophyTitle: "",
    philosophyText1: "",
    philosophyText2: "",
    pillar1Title: "",
    pillar1Text: "",
    pillar2Title: "",
    pillar2Text: "",
    pillar3Title: "",
    pillar3Text: "",
    founderName: "",
    founderPhone: "",
    founderEmail: "",
    founderBio: "",
    founderQuote: "",
    ctaTitle: "",
    ctaSubtitle: "",
  });

  const isAssistant = (admin?.role || admin?.Role) === "Assistant";

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/get-about");
      const data = await res.json();
      
      if (data.content) {
        setContent(data.content);
        setForm({
          heroTitle: data.content.hero_title || "Travel, Reimagined.",
          heroSubtitle: data.content.hero_subtitle || "",
          philosophyTitle: data.content.philosophy_title || "The FHJ Philosophy",
          philosophyText1: data.content.philosophy_text_1 || "",
          philosophyText2: data.content.philosophy_text_2 || "",
          pillar1Title: data.content.pillar_1_title || "Personal, Not Automated",
          pillar1Text: data.content.pillar_1_text || "",
          pillar2Title: data.content.pillar_2_title || "Curated Access",
          pillar2Text: data.content.pillar_2_text || "",
          pillar3Title: data.content.pillar_3_title || "24/7 Concierge",
          pillar3Text: data.content.pillar_3_text || "",
          founderName: data.content.founder_name || "Farhan Jiwani",
          founderPhone: data.content.founder_phone || "",
          founderEmail: data.content.founder_email || "",
          founderBio: data.content.founder_bio || "",
          founderQuote: data.content.founder_quote || "",
          ctaTitle: data.content.cta_title || "Ready to Start?",
          ctaSubtitle: data.content.cta_subtitle || "",
        });
      }
    } catch (err) {
      console.error("Failed to load about content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/.netlify/functions/update-about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero_title: form.heroTitle,
          hero_subtitle: form.heroSubtitle,
          philosophy_title: form.philosophyTitle,
          philosophy_text_1: form.philosophyText1,
          philosophy_text_2: form.philosophyText2,
          pillar_1_title: form.pillar1Title,
          pillar_1_text: form.pillar1Text,
          pillar_2_title: form.pillar2Title,
          pillar_2_text: form.pillar2Text,
          pillar_3_title: form.pillar3Title,
          pillar_3_text: form.pillar3Text,
          founder_name: form.founderName,
          founder_phone: form.founderPhone,
          founder_email: form.founderEmail,
          founder_bio: form.founderBio,
          founder_quote: form.founderQuote,
          cta_title: form.ctaTitle,
          cta_subtitle: form.ctaSubtitle,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("About page updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
        setEditing(false);
        loadContent();
      } else {
        setError(data.error || "Save failed.");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <GlassCard>
          <div style={{ padding: "4rem", textAlign: "center" }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              border: "3px solid rgba(0,196,140,0.3)",
              borderTopColor: fhjTheme.primary,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem"
            }} />
            <p style={{ color: "#94a3b8" }}>Loading content...</p>
          </div>
        </GlassCard>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Luxury Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "2.5rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <h1 style={{ 
              background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
              fontSize: "2.5rem",
              fontWeight: 900,
              letterSpacing: "-1px",
              marginBottom: "0.5rem"
            }}>
              About Page Manager
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.05rem", margin: 0 }}>
              Craft your brand story
            </p>
          </div>
          
          {!isAssistant && !editing && (
            <LuxuryButton onClick={() => setEditing(true)}>
              ✏️ Edit Content
            </LuxuryButton>
          )}
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: "1rem 1.5rem",
              background: "rgba(74,222,128,0.1)",
              border: "1px solid rgba(74,222,128,0.3)",
              borderRadius: "16px",
              color: "#4ade80",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>✓</span>
            {success}
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: "1rem 1.5rem",
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: "16px",
              color: "#f87171",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>⚠</span>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {editing ? (
          // EDIT MODE
          <motion.div
            key="edit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <GlassCard style={{ padding: "2.5rem" }}>
              <h3 style={{ 
                color: "white", 
                margin: "0 0 2.5rem", 
                fontSize: "1.5rem",
                fontWeight: 700
              }}>
                Edit About Page Content
              </h3>

              {/* Hero Section */}
              <LuxurySection title="Hero Section" icon="✨">
                <LuxuryFormField 
                  label="Main Title" 
                  value={form.heroTitle} 
                  onChange={(v) => setForm({ ...form, heroTitle: v })} 
                  placeholder="Travel, Reimagined." 
                />
                <LuxuryFormField 
                  label="Subtitle" 
                  value={form.heroSubtitle} 
                  onChange={(v) => setForm({ ...form, heroSubtitle: v })} 
                  textarea 
                  placeholder="Your tagline..." 
                />
              </LuxurySection>

              {/* Philosophy */}
              <LuxurySection title="Philosophy Section" icon="💭">
                <LuxuryFormField 
                  label="Section Title" 
                  value={form.philosophyTitle} 
                  onChange={(v) => setForm({ ...form, philosophyTitle: v })} 
                  placeholder="The FHJ Philosophy" 
                />
                <LuxuryFormField 
                  label="First Paragraph" 
                  value={form.philosophyText1} 
                  onChange={(v) => setForm({ ...form, philosophyText1: v })} 
                  textarea 
                  placeholder="We don't sell vacations..." 
                />
                <LuxuryFormField 
                  label="Second Paragraph" 
                  value={form.philosophyText2} 
                  onChange={(v) => setForm({ ...form, philosophyText2: v })} 
                  textarea 
                  placeholder="From the moment you reach out..." 
                />
              </LuxurySection>

              {/* Pillars */}
              <LuxurySection title="Three Pillars" icon="◈">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                  <PillarCard number="1">
                    <LuxuryFormField 
                      label="Title" 
                      value={form.pillar1Title} 
                      onChange={(v) => setForm({ ...form, pillar1Title: v })} 
                      placeholder="Personal, Not Automated" 
                    />
                    <LuxuryFormField 
                      label="Description" 
                      value={form.pillar1Text} 
                      onChange={(v) => setForm({ ...form, pillar1Text: v })} 
                      textarea 
                      placeholder="Every trip is designed..." 
                    />
                  </PillarCard>

                  <PillarCard number="2">
                    <LuxuryFormField 
                      label="Title" 
                      value={form.pillar2Title} 
                      onChange={(v) => setForm({ ...form, pillar2Title: v })} 
                      placeholder="Curated Access" 
                    />
                    <LuxuryFormField 
                      label="Description" 
                      value={form.pillar2Text} 
                      onChange={(v) => setForm({ ...form, pillar2Text: v })} 
                      textarea 
                      placeholder="Private villas..." 
                    />
                  </PillarCard>

                  <PillarCard number="3">
                    <LuxuryFormField 
                      label="Title" 
                      value={form.pillar3Title} 
                      onChange={(v) => setForm({ ...form, pillar3Title: v })} 
                      placeholder="24/7 Concierge" 
                    />
                    <LuxuryFormField 
                      label="Description" 
                      value={form.pillar3Text} 
                      onChange={(v) => setForm({ ...form, pillar3Text: v })} 
                      textarea 
                      placeholder="We're one message away..." 
                    />
                  </PillarCard>
                </div>
              </LuxurySection>

              {/* Founder */}
              <LuxurySection title="Founder Section" icon="👤">
                <LuxuryFormField 
                  label="Founder Name" 
                  value={form.founderName} 
                  onChange={(v) => setForm({ ...form, founderName: v })} 
                  placeholder="Farhan Jiwani" 
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <LuxuryFormField 
                    label="Phone Number" 
                    value={form.founderPhone} 
                    onChange={(v) => setForm({ ...form, founderPhone: v })} 
                    placeholder="(555) 123-4567" 
                  />
                  <LuxuryFormField 
                    label="Email Address" 
                    value={form.founderEmail} 
                    onChange={(v) => setForm({ ...form, founderEmail: v })} 
                    placeholder="farhan@fhjdestinations.com" 
                  />
                </div>
                <LuxuryFormField 
                  label="Biography" 
                  value={form.founderBio} 
                  onChange={(v) => setForm({ ...form, founderBio: v })} 
                  textarea 
                  placeholder="With a passion for world travel..." 
                />
                <LuxuryFormField 
                  label="Quote" 
                  value={form.founderQuote} 
                  onChange={(v) => setForm({ ...form, founderQuote: v })} 
                  textarea 
                  placeholder="I believe travel should feel effortless..." 
                />
              </LuxurySection>

              {/* CTA */}
              <LuxurySection title="Call to Action" icon="🎯">
                <LuxuryFormField 
                  label="CTA Title" 
                  value={form.ctaTitle} 
                  onChange={(v) => setForm({ ...form, ctaTitle: v })} 
                  placeholder="Ready to Start?" 
                />
                <LuxuryFormField 
                  label="CTA Subtitle" 
                  value={form.ctaSubtitle} 
                  onChange={(v) => setForm({ ...form, ctaSubtitle: v })} 
                  placeholder="Tell us where you want to go..." 
                />
              </LuxurySection>

              {/* Action Buttons */}
              <div style={{ 
                display: "flex", 
                gap: "1rem", 
                marginTop: "3rem", 
                paddingTop: "2rem", 
                borderTop: "1px solid rgba(255,255,255,0.1)" 
              }}>
                <LuxuryButton onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "💾 Save Changes"}
                </LuxuryButton>
                <LuxuryButton 
                  variant="outline" 
                  onClick={() => { setEditing(false); loadContent(); }}
                >
                  Cancel
                </LuxuryButton>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          // PREVIEW MODE
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <PreviewCard title="Hero Section" icon="✨">
                <PreviewItem label="Title" value={form.heroTitle} />
                <PreviewItem label="Subtitle" value={form.heroSubtitle} large />
              </PreviewCard>

              <PreviewCard title="Philosophy" icon="💭">
                <PreviewItem label="Title" value={form.philosophyTitle} />
                <PreviewItem label="Paragraph 1" value={form.philosophyText1} large />
                <PreviewItem label="Paragraph 2" value={form.philosophyText2} large />
              </PreviewCard>

              <PreviewCard title="Three Pillars" icon="◈">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                  {[1, 2, 3].map(num => (
                    <div key={num} style={{
                      padding: "1.5rem",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}>
                      <div style={{ 
                        fontSize: "0.7rem", 
                        color: fhjTheme.primary, 
                        fontWeight: 700,
                        marginBottom: "0.75rem",
                        letterSpacing: "1px"
                      }}>
                        PILLAR {num}
                      </div>
                      <h4 style={{ color: "white", margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
                        {form[`pillar${num}Title`]}
                      </h4>
                      <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0, lineHeight: 1.6 }}>
                        {form[`pillar${num}Text`]}
                      </p>
                    </div>
                  ))}
                </div>
              </PreviewCard>

              <PreviewCard title="Founder" icon="👤">
                <PreviewItem label="Name" value={form.founderName} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", margin: "1rem 0" }}>
                  <PreviewItem label="Phone" value={form.founderPhone} />
                  <PreviewItem label="Email" value={form.founderEmail} />
                </div>
                <PreviewItem label="Bio" value={form.founderBio} large />
                <PreviewItem label="Quote" value={form.founderQuote} large quote />
              </PreviewCard>

              <PreviewCard title="Call to Action" icon="🎯">
                <PreviewItem label="Title" value={form.ctaTitle} />
                <PreviewItem label="Subtitle" value={form.ctaSubtitle} large />
              </PreviewCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================================
// LUXURY COMPONENTS
// ==========================================================

function GlassCard({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "24px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      ...style
    }}>
      {children}
    </div>
  );
}

function LuxuryButton({ children, onClick, disabled, variant = "primary", style = {} }) {
  const baseStyle = {
    padding: "1rem 2rem",
    borderRadius: "14px",
    border: "none",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    opacity: disabled ? 0.5 : 1,
    letterSpacing: "0.3px",
    ...style
  };

  const variantStyles = {
    primary: {
      background: "linear-gradient(135deg, #00c48c 0%, #00a67a 100%)",
      color: "#000",
      boxShadow: "0 8px 24px rgba(0,196,140,0.3)",
    },
    outline: {
      background: "transparent",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.2)",
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyle, ...variantStyles[variant] }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === "primary") {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 12px 32px rgba(0,196,140,0.4)";
          } else {
            e.target.style.background = "rgba(255,255,255,0.05)";
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (variant === "primary") {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 8px 24px rgba(0,196,140,0.3)";
          } else {
            e.target.style.background = "transparent";
          }
        }
      }}
    >
      {children}
    </button>
  );
}

function LuxurySection({ title, icon, children }) {
  return (
    <div style={{ 
      marginBottom: "2.5rem", 
      paddingBottom: "2.5rem", 
      borderBottom: "1px solid rgba(255,255,255,0.05)" 
    }}>
      <h4 style={{ 
        color: fhjTheme.primary, 
        fontSize: "1.1rem", 
        marginBottom: "2rem", 
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        letterSpacing: "0.5px"
      }}>
        <span style={{ fontSize: "1.5rem" }}>{icon}</span>
        {title}
      </h4>
      {children}
    </div>
  );
}

function LuxuryFormField({ label, value, onChange, textarea, placeholder }) {
  const inputStyle = {
    width: "100%",
    padding: "1rem 1.25rem",
    borderRadius: "12px",
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "white",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "all 0.2s ease"
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <label style={{
        display: "block",
        color: "rgba(255,255,255,0.8)",
        marginBottom: "0.75rem",
        fontSize: "0.9rem",
        fontWeight: 600,
        letterSpacing: "0.5px"
      }}>
        {label}
      </label>
      {textarea ? (
        <textarea
          style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={(e) => e.target.style.borderColor = "rgba(0,196,140,0.5)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
        />
      ) : (
        <FHJInput 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder}
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = "rgba(0,196,140,0.5)"}
          onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
        />
      )}
    </div>
  );
}

function PillarCard({ number, children }) {
  return (
    <div style={{
      padding: "1.5rem",
      background: "rgba(255,255,255,0.03)",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.08)"
    }}>
      <div style={{
        fontSize: "0.75rem",
        color: fhjTheme.primary,
        fontWeight: 700,
        marginBottom: "1.25rem",
        letterSpacing: "1px"
      }}>
        PILLAR {number}
      </div>
      {children}
    </div>
  );
}

function PreviewCard({ title, icon, children }) {
  return (
    <GlassCard style={{ padding: "2.5rem" }}>
      <h3 style={{
        color: "white",
        margin: "0 0 2rem",
        fontSize: "1.4rem",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem"
      }}>
        <span style={{ fontSize: "1.8rem" }}>{icon}</span>
        {title}
      </h3>
      {children}
    </GlassCard>
  );
}

function PreviewItem({ label, value, large, quote }) {
  return (
    <div style={{ marginBottom: large ? "1.5rem" : "1rem" }}>
      <p style={{ 
        color: "#64748b", 
        fontSize: "0.75rem", 
        marginBottom: "0.5rem", 
        textTransform: "uppercase", 
        letterSpacing: "1px",
        fontWeight: 600
      }}>
        {label}
      </p>
      <p style={{ 
        color: "white", 
        fontSize: large ? "1.05rem" : "1.1rem", 
        margin: 0, 
        lineHeight: 1.7,
        fontWeight: quote ? 500 : 400,
        fontStyle: quote ? "italic" : "normal",
        borderLeft: quote ? `3px solid ${fhjTheme.primary}` : "none",
        paddingLeft: quote ? "1.25rem" : 0
      }}>
        {value || <span style={{ opacity: 0.4 }}>Not set</span>}
      </p>
    </div>
  );
}
