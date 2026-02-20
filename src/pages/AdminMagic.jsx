// ==========================================================
// 📄 FILE: AdminMagic.jsx  (PHASE 6 — BUILD OUT)
// Magic link login flow
// Location: src/pages/AdminMagic.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";

export default function AdminMagic({ onLogin }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Check for token in URL (clicked magic link)
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    setVerifying(true);
    try {
      const res = await fetch("/.netlify/functions/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ magicToken: token }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onLogin(data.admin || data);
        toast.success("Magic link verified! Welcome.");
        navigate("/admin");
      } else {
        toast.error("Invalid or expired magic link.");
      }
    } catch (err) {
      toast.error("Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const requestLink = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warning("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, requestMagicLink: true }),
      });
      const data = await res.json();

      if (res.ok) {
        setSent(true);
        toast.success("Magic link sent! Check your email.");
      } else {
        toast.error(data.error || "Could not send magic link.");
      }
    } catch (err) {
      toast.error("Request failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Verifying state
  if (verifying) {
    return (
      <FHJBackground page="home">
        <div style={container}>
          <FHJCard style={{ padding: "3rem", textAlign: "center", maxWidth: "440px" }}>
            <p style={{ color: "white", fontSize: "1.1rem" }}>Verifying magic link...</p>
          </FHJCard>
        </div>
      </FHJBackground>
    );
  }

  return (
    <FHJBackground page="home">
      <div style={container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: "100%", maxWidth: "440px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ color: fhjTheme.primary, fontSize: "2.2rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
              Magic Link
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
              We'll send a secure sign-in link to your email.
            </p>
          </div>

          <FHJCard style={{ padding: "2rem" }}>
            {!sent ? (
              <form onSubmit={requestLink}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={labelStyle}>Email</label>
                  <FHJInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@fhjdream.com"
                    required
                  />
                </div>
                <FHJButton type="submit" disabled={loading} fullWidth>
                  {loading ? "Sending..." : "Send Magic Link"}
                </FHJButton>
              </form>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✉️</div>
                <h3 style={{ color: "white", margin: "0 0 0.5rem" }}>Check Your Email</h3>
                <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
                  We sent a login link to <strong style={{ color: "white" }}>{email}</strong>
                </p>
                <FHJButton variant="ghost" size="sm" onClick={() => setSent(false)}>
                  Try a different email
                </FHJButton>
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
              <Link to="/admin/login" style={linkStyle}>
                Use access code instead
              </Link>
            </div>
          </FHJCard>
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
  color: "white",
  fontSize: "0.85rem",
  marginBottom: "0.4rem",
  fontWeight: 500,
};

const linkStyle = {
  color: fhjTheme.primary,
  textDecoration: "none",
  fontSize: "0.85rem",
};
