// ==========================================================
// FILE: Navbar.jsx  (BOOK REMOVED FROM NAV)
// Nav: HOME | CLIENT PORTAL | ABOUT
// Location: src/components/Navbar.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/client/login", label: "Client Portal" },
    { to: "/about", label: "About" },
  ];

  return (
    <>
      <nav style={{
        ...navStyle,
        background: scrolled ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.3)",
        backdropFilter: scrolled ? "blur(16px)" : "blur(8px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
      }}>
        <div style={innerStyle}>
          <Link to="/" style={brandStyle}>
            <span style={{ color: "#00c48c", fontWeight: 800 }}>FHJ</span>
            <span style={{ color: "white", fontWeight: 300, marginLeft: "6px" }}>
              DREAM DESTINATIONS
            </span>
          </Link>

          <div style={desktopLinks}>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  ...linkStyle,
                  color: location.pathname === link.to ? "#00c48c" : "rgba(255,255,255,0.8)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={hamburgerStyle}
            aria-label="Menu"
          >
            <span style={{ ...bar, transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <span style={{ ...bar, opacity: menuOpen ? 0 : 1 }} />
            <span style={{ ...bar, transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={mobileMenuStyle}
          >
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  ...mobileLinkStyle,
                  color: location.pathname === link.to ? "#00c48c" : "white",
                }}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const navStyle = { position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, transition: "all 0.3s ease" };
const innerStyle = { maxWidth: "1200px", margin: "0 auto", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" };
const brandStyle = { textDecoration: "none", fontSize: "1.1rem", letterSpacing: "1px", display: "flex", alignItems: "center" };
const desktopLinks = { display: "flex", gap: "2rem", alignItems: "center" };
const linkStyle = { textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, transition: "color 0.2s ease", letterSpacing: "0.3px", cursor: "pointer" };
const hamburgerStyle = { display: "none", flexDirection: "column", gap: "4px", background: "none", border: "none", cursor: "pointer", padding: "4px" };
const bar = { width: "22px", height: "2px", background: "white", transition: "all 0.3s ease", display: "block" };
const mobileMenuStyle = { position: "fixed", top: "60px", left: 0, right: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(16px)", padding: "1rem 2rem", zIndex: 999, display: "flex", flexDirection: "column", gap: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.1)" };
const mobileLinkStyle = { textDecoration: "none", fontSize: "1rem", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "white", cursor: "pointer" };

if (typeof document !== "undefined") {
  const id = "fhj-navbar-responsive";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @media (max-width: 768px) {
        nav > div > div:nth-child(2) { display: none !important; }
        nav button[aria-label="Menu"] { display: flex !important; }
      }
    `;
    document.head.appendChild(style);
  }
}