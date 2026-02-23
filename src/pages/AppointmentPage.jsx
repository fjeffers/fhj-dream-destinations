// ==========================================================
// FILE: AppointmentPage.jsx — Appointment Gateway
// Location: src/pages/AppointmentPage.jsx
// Route: /appointment
//
// Dropdown:
//   "New Client"          → /appointments (full intake)
//   "Make an Appointment" → /appointments?reason=appointment (simple form)
// ==========================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap";

function injectAssets() {
  if (typeof document === "undefined") return;
  if (!document.getElementById("apt-fonts")) {
    const link = document.createElement("link");
    link.id = "apt-fonts";
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }
}

const ACCESS_CODE = "FHJ2025";

export default function AppointmentPage() {
  const navigate = useNavigate();
  const [selection, setSelection] = useState("");
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("fhj_apt_auth") === "1"
  );
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => { injectAssets(); }, []);

  const handlePinSubmit = () => {
    if (pin === ACCESS_CODE) {
      sessionStorage.setItem("fhj_apt_auth", "1");
      setUnlocked(true);
    } else {
      setPinError(true);
    }
  };

  const handleDropdownChange = (e) => {
    const val = e.target.value;
    setSelection(val);
    if (val === "new-client") {
      navigate("/appointments");
    } else if (val === "make-appointment") {
      navigate("/appointments?reason=appointment");
    }
  };

  if (!unlocked) {
    return (
      <FHJBackground page="appointment">
        <div style={S.accentTop} />

        <div style={S.content}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={S.logoWrap}
          >
            <img
              src="/fhj_logo.png"
              alt="FHJ Dream Destinations"
              style={S.logo}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </motion.div>

          {/* Ornament */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={S.ornament}
          >
            <span style={S.ornLine} />
            <span style={{ color: "#00c48c", fontSize: "0.5rem" }}>◆</span>
            <span style={S.ornLine} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={S.heading}
          >
            Restricted Access
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={S.subheading}
          >
            Enter your access code to continue.
          </motion.p>

          {/* PIN input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ width: "100%", maxWidth: "380px" }}
          >
            <input
              type="password"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") handlePinSubmit(); }}
              placeholder="Access code"
              style={S.pinInput}
            />
            <button onClick={handlePinSubmit} style={S.pinButton}>
              Continue
            </button>
            {pinError && (
              <p style={S.pinError}>Incorrect access code.</p>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={S.footer}
          >
            <p style={S.footerText}>FHJ Dream Destinations</p>
            <p style={S.footerSub}>Creating unforgettable travel experiences</p>
          </motion.div>
        </div>
      </FHJBackground>
    );
  }

  return (
    <FHJBackground page="appointment">
      <div style={S.accentTop} />

      <div style={S.content}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={S.logoWrap}
        >
          <img
            src="/fhj_logo.png"
            alt="FHJ Dream Destinations"
            style={S.logo}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </motion.div>

        {/* Ornament */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={S.ornament}
        >
          <span style={S.ornLine} />
          <span style={{ color: "#00c48c", fontSize: "0.5rem" }}>◆</span>
          <span style={S.ornLine} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={S.heading}
        >
          How Can We Help?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={S.subheading}
        >
          Select an option below to get started.
        </motion.p>

        {/* Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={S.dropdownWrap}
        >
          <select
            value={selection}
            onChange={handleDropdownChange}
            style={S.dropdown}
          >
            <option value="" disabled>Choose an option...</option>
            <option value="new-client">New Client</option>
            <option value="make-appointment">Make an Appointment</option>
          </select>
          <div style={S.dropdownArrow}>▾</div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={S.footer}
        >
          <p style={S.footerText}>FHJ Dream Destinations</p>
          <p style={S.footerSub}>Creating unforgettable travel experiences</p>
        </motion.div>
      </div>
    </FHJBackground>
  );
}

const green = "#00c48c";

const S = {
  accentTop: {
    position: "fixed", top: 0, left: 0, right: 0, height: "3px", zIndex: 10,
    background: `linear-gradient(90deg, transparent, ${green}, transparent)`,
  },
  content: {
    position: "relative", zIndex: 5,
    maxWidth: "560px", margin: "0 auto",
    padding: "3rem 1.5rem 3rem",
    display: "flex", flexDirection: "column", alignItems: "center",
    minHeight: "100vh",
    fontFamily: "'Montserrat', sans-serif",
  },
  logoWrap: { marginBottom: "1.5rem", marginTop: "2rem" },
  logo: {
    height: "90px",
    filter: "drop-shadow(0 0 15px rgba(0,0,0,0.5))",
    mixBlendMode: "screen",
  },
  ornament: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "1rem", marginBottom: "1rem",
  },
  ornLine: {
    display: "block", width: "50px", height: "1px",
    background: `linear-gradient(90deg, transparent, ${green}, transparent)`,
  },
  heading: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "2.4rem", fontWeight: 700, color: "#fff",
    textAlign: "center", margin: "0 0 0.5rem",
    textShadow: "0 2px 15px rgba(0,0,0,0.4)",
  },
  subheading: {
    color: "rgba(255,255,255,0.5)", fontSize: "1rem",
    textAlign: "center", marginBottom: "2.5rem",
  },
  dropdownWrap: {
    position: "relative",
    width: "100%", maxWidth: "380px",
  },
  dropdown: {
    width: "100%",
    padding: "1rem 3rem 1rem 1.25rem",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "white",
    fontSize: "1rem",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 500,
    appearance: "none",
    WebkitAppearance: "none",
    cursor: "pointer",
    outline: "none",
    transition: "border-color 0.2s",
  },
  dropdownArrow: {
    position: "absolute", right: "1.25rem", top: "50%",
    transform: "translateY(-50%)",
    color: green, fontSize: "1.1rem",
    pointerEvents: "none",
  },
  footer: {
    marginTop: "auto", paddingTop: "3rem",
    textAlign: "center",
  },
  footerText: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "0.9rem", fontWeight: 600, color: green,
    letterSpacing: "0.04em", marginBottom: "0.2rem",
  },
  footerSub: {
    color: "rgba(255,255,255,0.25)", fontSize: "0.65rem",
    letterSpacing: "0.1em", textTransform: "uppercase",
  },
  pinInput: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#e5e7eb",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "1rem",
    letterSpacing: "0.15em",
    textAlign: "center",
  },
  pinButton: {
    background: "linear-gradient(135deg, #00c48c, #00a676)",
    color: "#0f172a",
    border: "none",
    borderRadius: 16,
    padding: "12px 32px",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    letterSpacing: "0.04em",
    width: "100%",
  },
  pinError: {
    color: "#f87171",
    fontSize: "0.875rem",
    marginTop: "0.5rem",
  },
};

if (typeof document !== "undefined") {
  const id = "apt-page-styles";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      select option { background: #1a1a2e; color: white; padding: 8px; }
      select:focus { border-color: #00c48c !important; }
    `;
    document.head.appendChild(style);
  }
}