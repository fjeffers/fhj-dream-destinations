// ==========================================================
// FILE: AdminAbout.jsx
// About Page Content Manager for Admin Portal
// Location: src/pages/AdminAbout.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { motion } from "framer-motion";

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
          heroSubtitle: data.content.hero_subtitle || "FHJ Dream Destinations was founded on a simple belief: every journey should feel like it was designed just for you — because it was.",
          philosophyTitle: data.content.philosophy_title || "The FHJ Philosophy",
          philosophyText1: data.content.philosophy_text_1 || "We don't sell vacations. We design experiences.",
          philosophyText2: data.content.philosophy_text_2 || "From the moment you reach out, you're working with a dedicated travel designer.",
          pillar1Title: data.content.pillar_1_title || "Personal, Not Automated",
          pillar1Text: data.content.pillar_1_text || "Every trip is designed by a real person.",
          pillar2Title: data.content.pillar_2_title || "Curated Access",
          pillar2Text: data.content.pillar_2_text || "Private villas, exclusive experiences.",
          pillar3Title: data.content.pillar_3_title || "24/7 Concierge",
          pillar3Text: data.content.pillar_3_text || "We're one message away.",
          founderName: data.content.founder_name || "Farhan Jiwani",
          founderPhone: data.content.founder_phone || "",
          founderEmail: data.content.founder_email || "",
          founderBio: data.content.founder_bio || "With a passion for world travel...",
          founderQuote: data.content.founder_quote || "I believe travel should feel effortless.",
          ctaTitle: data.content.cta_title || "Ready to Start?",
          ctaSubtitle: data.content.cta_subtitle || "Tell us where you want to go.",
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
        setSuccess("About page updated!");
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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <FHJCard style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ color: "#94a3b8" }}>Loading...</p>
        </FHJCard>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ color: fhjTheme.primary, margin: 0, fontSize: "1.6rem" }}>About Page Manager</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.3rem" }}>
            Manage the content displayed on your About page
          </p>
        </div>
        {!isAssistant && !editing && (
          <FHJButton onClick={() => setEditing(true)}>Edit Content</FHJButton>
        )}
      </div>

      {/* Messages */}
      {success && (
        <div style={{ ...msgStyle, background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)", color: "#4ade80" }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ ...msgStyle, background: "rgba(248,113,113,0.1)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {editing ? (
        // EDIT MODE
        <FHJCard style={{ padding: "2rem" }}>
          <h3 style={{ color: "white", margin: "0 0 2rem", fontSize: "1.2rem" }}>Edit About Page Content</h3>

          {/* Hero Section */}
          <Section title="Hero Section">
            <FormField label="Main Title" value={form.heroTitle} onChange={(v) => setForm({ ...form, heroTitle: v })} placeholder="Travel, Reimagined." />
            <FormField label="Subtitle" value={form.heroSubtitle} onChange={(v) => setForm({ ...form, heroSubtitle: v })} textarea placeholder="Your tagline..." />
          </Section>

          {/* Philosophy */}
          <Section title="Philosophy Section">
            <FormField label="Section Title" value={form.philosophyTitle} onChange={(v) => setForm({ ...form, philosophyTitle: v })} placeholder="The FHJ Philosophy" />
            <FormField label="First Paragraph" value={form.philosophyText1} onChange={(v) => setForm({ ...form, philosophyText1: v })} textarea placeholder="We don't sell vacations..." />
            <FormField label="Second Paragraph" value={form.philosophyText2} onChange={(v) => setForm({ ...form, philosophyText2: v })} textarea placeholder="From the moment you reach out..." />
          </Section>

          {/* Pillars */}
          <Section title="Three Pillars">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
              <div>
                <h4 style={{ color: fhjTheme.primary, fontSize: "0.85rem", marginBottom: "1rem" }}>Pillar 1</h4>
                <FormField label="Title" value={form.pillar1Title} onChange={(v) => setForm({ ...form, pillar1Title: v })} placeholder="Personal, Not Automated" />
                <FormField label="Description" value={form.pillar1Text} onChange={(v) => setForm({ ...form, pillar1Text: v })} textarea placeholder="Every trip is designed..." />
              </div>
              <div>
                <h4 style={{ color: fhjTheme.primary, fontSize: "0.85rem", marginBottom: "1rem" }}>Pillar 2</h4>
                <FormField label="Title" value={form.pillar2Title} onChange={(v) => setForm({ ...form, pillar2Title: v })} placeholder="Curated Access" />
                <FormField label="Description" value={form.pillar2Text} onChange={(v) => setForm({ ...form, pillar2Text: v })} textarea placeholder="Private villas..." />
              </div>
              <div>
                <h4 style={{ color: fhjTheme.primary, fontSize: "0.85rem", marginBottom: "1rem" }}>Pillar 3</h4>
                <FormField label="Title" value={form.pillar3Title} onChange={(v) => setForm({ ...form, pillar3Title: v })} placeholder="24/7 Concierge" />
                <FormField label="Description" value={form.pillar3Text} onChange={(v) => setForm({ ...form, pillar3Text: v })} textarea placeholder="We're one message away..." />
              </div>
            </div>
          </Section>

          {/* Founder */}
          <Section title="Founder Section">
            <FormField label="Founder Name" value={form.founderName} onChange={(v) => setForm({ ...form, founderName: v })} placeholder="Farhan Jiwani" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <FormField label="Phone Number" value={form.founderPhone} onChange={(v) => setForm({ ...form, founderPhone: v })} placeholder="(555) 123-4567" />
              <FormField label="Email Address" value={form.founderEmail} onChange={(v) => setForm({ ...form, founderEmail: v })} placeholder="farhan@fhjdestinations.com" />
            </div>
            <FormField label="Biography" value={form.founderBio} onChange={(v) => setForm({ ...form, founderBio: v })} textarea placeholder="With a passion for world travel..." />
            <FormField label="Quote" value={form.founderQuote} onChange={(v) => setForm({ ...form, founderQuote: v })} textarea placeholder="I believe travel should feel effortless..." />
          </Section>

          {/* CTA */}
          <Section title="Call to Action">
            <FormField label="CTA Title" value={form.ctaTitle} onChange={(v) => setForm({ ...form, ctaTitle: v })} placeholder="Ready to Start?" />
            <FormField label="CTA Subtitle" value={form.ctaSubtitle} onChange={(v) => setForm({ ...form, ctaSubtitle: v })} placeholder="Tell us where you want to go..." />
          </Section>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <FHJButton onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </FHJButton>
            <FHJButton variant="ghost" onClick={() => { setEditing(false); loadContent(); }}>
              Cancel
            </FHJButton>
          </div>
        </FHJCard>
      ) : (
        // PREVIEW MODE
        <FHJCard style={{ padding: "2.5rem" }}>
          <h3 style={{ color: "white", margin: "0 0 2rem", fontSize: "1.2rem" }}>Current Content</h3>

          <PreviewSection title="Hero Section">
            <PreviewItem label="Title" value={form.heroTitle} />
            <PreviewItem label="Subtitle" value={form.heroSubtitle} />
          </PreviewSection>

          <PreviewSection title="Philosophy">
            <PreviewItem label="Title" value={form.philosophyTitle} />
            <PreviewItem label="Paragraph 1" value={form.philosophyText1} />
            <PreviewItem label="Paragraph 2" value={form.philosophyText2} />
          </PreviewSection>

          <PreviewSection title="Three Pillars">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
              <div>
                <PreviewItem label="Pillar 1" value={form.pillar1Title} />
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>{form.pillar1Text}</p>
              </div>
              <div>
                <PreviewItem label="Pillar 2" value={form.pillar2Title} />
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>{form.pillar2Text}</p>
              </div>
              <div>
                <PreviewItem label="Pillar 3" value={form.pillar3Title} />
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>{form.pillar3Text}</p>
              </div>
            </div>
          </PreviewSection>

          <PreviewSection title="Founder">
            <PreviewItem label="Name" value={form.founderName} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
              <PreviewItem label="Phone" value={form.founderPhone} />
              <PreviewItem label="Email" value={form.founderEmail} />
            </div>
            <PreviewItem label="Bio" value={form.founderBio} />
            <PreviewItem label="Quote" value={form.founderQuote} />
          </PreviewSection>

          <PreviewSection title="Call to Action">
            <PreviewItem label="Title" value={form.ctaTitle} />
            <PreviewItem label="Subtitle" value={form.ctaSubtitle} />
          </PreviewSection>
        </FHJCard>
      )}
    </div>
  );
}

// Helper Components
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "2.5rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <h4 style={{ color: fhjTheme.primary, fontSize: "1rem", marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "1px" }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function FormField({ label, value, onChange, textarea, placeholder }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea
          style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <FHJInput value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function PreviewSection({ title, children }) {
  return (
    <div style={{ marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <h4 style={{ color: fhjTheme.primary, fontSize: "0.9rem", marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function PreviewItem({ label, value }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <p style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </p>
      <p style={{ color: "white", fontSize: "1rem", margin: 0, lineHeight: 1.6 }}>{value}</p>
    </div>
  );
}

// Styles
const labelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.5px",
  marginBottom: "0.5rem",
  textTransform: "uppercase",
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "white",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const msgStyle = {
  padding: "0.75rem 1rem",
  borderRadius: "8px",
  border: "1px solid",
  fontSize: "0.9rem",
  marginBottom: "1.5rem",
};
