// ==========================================================
// 📄 FILE: AdminLogin.jsx  (REINFORCED)
// ⭐ Email + PIN with lockout display, attempt warnings
// Location: src/pages/AdminLogin.jsx
// ==========================================================

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";

export default function AdminLogin({ onLogin }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.warning("Enter your email address."); return; }
    if (!pin.trim()) { toast.warning("Enter your access PIN."); return; }
    if (locked) { toast.error("Account is temporarily locked. Try again later."); return; }

    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), accessCode: pin.trim() }),
      });
      const data = await res.json();

      if (data.locked) {
        setLocked(true);
        toast.error(data.error);
        return;
      }

      if (res.ok && data.success) {
        onLogin(data.admin);
        toast.success(`Welcome, ${data.admin?.Name || "Admin"}!`);
        navigate("/admin");
      } else {
        toast.error(data.error || "Invalid credentials.");
      }
    } catch (err) {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FHJBackground page="home">
      <div style={container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: "100%", maxWidth: "420px" }}
        >
          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔒</div>
            <h1 style={{ color: fhjTheme.primary, fontSize: "1.8rem", fontWeight: 700, margin: "0 0 0.4rem", letterSpacing: "1px" }}>
              Admin Portal
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
              Authorized personnel only
            </p>
          </div>

          <FHJCard style={{ padding: "2rem" }}>
            {locked && (
              <div style={lockBanner}>
                Account temporarily locked due to failed attempts. Try again in 15 minutes.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Email Address</label>
                <FHJInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fhjdream.com"
                  disabled={locked}
                  required
                  autoComplete="email"
                />
              </div>

              <div style={{ marginBottom: "1.75rem" }}>
                <label style={labelStyle}>Access PIN</label>
                <FHJInput
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    // Allow only digits + limit to 10 chars
                    const val = e.target.value.replace(/[^0-9a-zA-Z]/g, "").slice(0, 10);
                    setPin(val);
                  }}
                  placeholder="Enter your PIN"
                  disabled={locked}
                  required
                  autoComplete="current-password"
                  style={{ letterSpacing: pin ? "4px" : "0", fontWeight: pin ? 700 : 400 }}
                />
              </div>

              <FHJButton
                type="submit"
                disabled={loading || locked}
                fullWidth
                style={{
                  opacity: locked ? 0.4 : 1,
                  padding: "0.85rem",
                  fontSize: "1rem",
                  letterSpacing: "0.5px",
                }}
              >
                {loading ? "Verifying..." : locked ? "Locked" : "Sign In"}
              </FHJButton>
            </form>
          </FHJCard>

          <p style={{ textAlign: "center", color: "#475569", fontSize: "0.75rem", marginTop: "2rem" }}>
            © {new Date().getFullYear()} FHJ Dream Destinations · Secured Access
          </p>
        </motion.div>
      </div>
    </FHJBackground>
  );
}

const container = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  position: "relative",
  zIndex: 2,
};

const labelStyle = {
  display: "block",
  color: "rgba(255,255,255,0.8)",
  fontSize: "0.8rem",
  marginBottom: "0.4rem",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const lockBanner = {
  background: "rgba(248,113,113,0.12)",
  border: "1px solid rgba(248,113,113,0.3)",
  color: "#fca5a5",
  padding: "0.85rem",
  borderRadius: "10px",
  fontSize: "0.85rem",
  marginBottom: "1.5rem",
  textAlign: "center",
  lineHeight: 1.5,
};
