// ==========================================================
// FILE: FHJCloseNav.jsx  (UPDATED)
// Added /appointments to visible paths
// Location: src/components/FHJ/FHJCloseNav.jsx
// ==========================================================

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function FHJCloseNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const showOn = ["/book", "/client/login", "/deal", "/appointments"];
  const isVisible = showOn.some((path) => location.pathname.startsWith(path));

  const handleClose = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          style={btnStyle}
          aria-label="Go back"
        >
          ✕
        </motion.button>
      )}
    </AnimatePresence>
  );
}

const btnStyle = {
  position: "fixed",
  top: "1.25rem",
  right: "1.25rem",
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  background: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "white",
  fontSize: "1.1rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1001,
  transition: "background 0.2s ease",
  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
};