// ==========================================================
// 📄 FILE: ConciergeToggleButton.jsx
// Location: src/components/concierge/ConciergeToggleButton.jsx
// ==========================================================

import React from "react";
import { motion } from "framer-motion";

export default function ConciergeToggleButton({ isOpen, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={btnStyle}
      aria-label={isOpen ? "Close concierge" : "Open concierge"}
    >
      <motion.span
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ display: "inline-block", fontSize: "1.4rem", lineHeight: 1 }}
      >
        {isOpen ? "✕" : "💬"}
      </motion.span>
    </motion.button>
  );
}

const btnStyle = {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #00c48c, #00a67c)",
  border: "none",
  boxShadow: "0 4px 20px rgba(0,196,140,0.4)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  color: "white",
};
