// ==========================================================
// 📄 FILE: FHJUIKit.jsx  (PHASE 1 FIX)
// FHJ Luxury UI Kit — Glassmorphism + Motion Ready
// Cards • Buttons • Inputs • Theme
// ==========================================================

import React from "react";
import { motion } from "framer-motion";

/* -------------------------------------------------------
   🟢 Theme (Colors, Radii, Shadows)
   ⭐ PHASE 1 FIX: Added top-level aliases (primary, secondary, etc.)
   so that all components referencing fhjTheme.primary, 
   fhjTheme.secondary, etc. work without breaking.
------------------------------------------------------- */
export const fhjTheme = {
  // ⭐ TOP-LEVEL ALIASES — These fix 10+ files that reference fhjTheme.primary
  primary: "#00c48c",        // Main brand green (used across client-facing UI)
  secondary: "#60a5fa",      // Blue accent (used for magic links, secondary actions)
  accent: "#00c48c",         // Alias for primary
  danger: "#f87171",         // Red for destructive actions
  success: "#4ade80",        // Green for confirmations
  gold: "#D4AF37",           // Gold for admin charts/headings

  // ⭐ NESTED COLORS OBJECT — Kept for components that use fhjTheme.colors.accent
  colors: {
    primary: "#00c48c",
    secondary: "#60a5fa",
    accent: "#00c48c",
    gold: "#D4AF37",
    textPrimary: "#e5e7eb",
    textSecondary: "#9ca3af",
    glassLight: "rgba(255,255,255,0.12)",
    glassMedium: "rgba(255,255,255,0.18)",
    glassBorder: "rgba(255,255,255,0.25)",
    success: "#4ade80",
    danger: "#f87171",
  },

  radii: {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
  },

  shadows: {
    glow: "0 0 22px rgba(0,196,140,0.35)",
    card: "0 8px 28px rgba(0,0,0,0.35)",
  },
};

/* -------------------------------------------------------
   🟢 FHJCard — Glass Panel
------------------------------------------------------- */
export const FHJCard = ({
  children,
  style = {},
  padding = 24,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{
        background: fhjTheme.colors.glassMedium,
        backdropFilter: "blur(18px)",
        borderRadius: fhjTheme.radii.lg,
        border: `1px solid ${fhjTheme.colors.glassBorder}`,
        padding,
        color: fhjTheme.colors.textPrimary,
        boxShadow: fhjTheme.shadows.card,
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/* -------------------------------------------------------
   🟢 FHJButton — Premium Button
   ⭐ PHASE 1 FIX: Updated default gradient to use brand green
------------------------------------------------------- */
export const FHJButton = ({
  children,
  as = "button",
  variant = "solid",
  size = "md",
  fullWidth = false,
  style = {},
  ...props
}) => {
  const Component = as;

  const sizes = {
    sm: { padding: "10px 16px", fontSize: "0.85rem" },
    md: { padding: "12px 20px", fontSize: "0.95rem" },
    lg: { padding: "14px 26px", fontSize: "1rem" },
  };

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: fhjTheme.radii.md,
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
    letterSpacing: "0.04em",
    transition: "all 0.2s ease",
    width: fullWidth ? "100%" : "auto",
    border: "none",
  };

  const variants = {
    solid: {
      background: "linear-gradient(135deg, #00c48c, #00a676)",
      color: "#0f172a",
      boxShadow: fhjTheme.shadows.glow,
    },
    outline: {
      background: "transparent",
      border: `1px solid ${fhjTheme.colors.glassBorder}`,
      color: fhjTheme.colors.textPrimary,
    },
    ghost: {
      background: "rgba(255,255,255,0.12)",
      border: `1px solid ${fhjTheme.colors.glassBorder}`,
      color: fhjTheme.colors.textPrimary,
    },
    danger: {
      background: "linear-gradient(135deg, #f87171, #ef4444)",
      color: "#0f172a",
    },
    success: {
      background: "linear-gradient(135deg, #4ade80, #22c55e)",
      color: "#064e3b",
    },
  };

  return (
    <Component
      style={{
        ...baseStyle,
        ...sizes[size],
        ...(variants[variant] || variants.solid),
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

/* -------------------------------------------------------
   🟢 FHJInput — Glass Input
------------------------------------------------------- */
export const FHJInput = ({ style = {}, ...props }) => {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "14px 16px",
        borderRadius: fhjTheme.radii.md,
        background: fhjTheme.colors.glassLight,
        border: `1px solid ${fhjTheme.colors.glassBorder}`,
        color: fhjTheme.colors.textPrimary,
        fontSize: "1rem",
        outline: "none",
        boxSizing: "border-box",
        transition: "border 0.2s ease, background 0.2s ease",
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.border = `1px solid ${fhjTheme.primary}`;
        e.target.style.background = "rgba(255,255,255,0.18)";
      }}
      onBlur={(e) => {
        e.target.style.border = `1px solid ${fhjTheme.colors.glassBorder}`;
        e.target.style.background = fhjTheme.colors.glassLight;
      }}
    />
  );
};
