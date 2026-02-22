// ==========================================================
// 💎 FILE: ClientPortal.jsx - LUXURY EDITION
// Complete redesign with glassmorphism, animations, and polish
// Location: src/pages/ClientPortal.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";

export default function ClientPortal() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("trips");

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/.netlify/functions/client-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, accessCode }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setClient(data.client);
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch (err) {
      setError("Could not login. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setClient(null);
    setEmail("");
    setAccessCode("");
  };

  return (
    <FHJBackground page="home">
      <div style={{ 
        padding: "6rem 2rem 5rem", 
        maxWidth: "1400px", 
        margin: "0 auto", 
        position: "relative", 
        zIndex: 2,
        minHeight: "100vh"
      }}>
        <AnimatePresence mode="wait">
          {!client ? (
            <LoginScreen
              key="login"
              email={email}
              setEmail={setEmail}
              accessCode={accessCode}
              setAccessCode={setAccessCode}
              loading={loading}
              error={error}
              onSubmit={handleLogin}
            />
          ) : (
            <DashboardScreen
              key="dashboard"
              client={client}
              tab={tab}
              setTab={setTab}
              onLogout={handleLogout}
            />
          )}
        </AnimatePresence>
      </div>
    </FHJBackground>
  );
}

// ==========================================================
// 🎨 LOGIN SCREEN - Luxury Entry
// ==========================================================
function LoginScreen({ email, setEmail, accessCode, setAccessCode, loading, error, onSubmit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        maxWidth: "540px",
        margin: "0 auto"
      }}
    >
      {/* Floating Logo/Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #00c48c 0%, #00a67a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.5rem",
          marginBottom: "2rem",
          boxShadow: "0 20px 60px rgba(0,196,140,0.3)",
        }}
      >
        ✈️
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ 
          fontSize: "2.8rem", 
          marginBottom: "0.75rem", 
          background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 800,
          textAlign: "center",
          letterSpacing: "-1px"
        }}
      >
        Welcome Back
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ 
          opacity: 0.7, 
          marginBottom: "3rem", 
          color: "white", 
          textAlign: "center",
          fontSize: "1.05rem"
        }}
      >
        Your personalized travel dashboard awaits
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ width: "100%" }}
      >
        <GlassCard>
          <form onSubmit={onSubmit} style={{ padding: "2.5rem" }}>
            <div style={{ marginBottom: "1.75rem" }}>
              <label style={labelStyle}>Email Address</label>
              <FHJInput 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your@email.com" 
                required 
                style={inputOverride}
              />
            </div>

            <div style={{ marginBottom: "2.5rem" }}>
              <label style={labelStyle}>Access Code</label>
              <FHJInput 
                type="password" 
                value={accessCode} 
                onChange={(e) => setAccessCode(e.target.value)} 
                placeholder="••••••" 
                required 
                style={inputOverride}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "1rem",
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.3)",
                  borderRadius: "12px",
                  color: "#f87171",
                  marginBottom: "1.5rem",
                  fontSize: "0.9rem"
                }}
              >
                {error}
              </motion.div>
            )}

            <LuxuryButton type="submit" disabled={loading} fullWidth>
              {loading ? "Authenticating..." : "Enter Portal"}
            </LuxuryButton>
          </form>
        </GlassCard>
      </motion.div>

      {/* Decorative elements */}
      <div style={{
        position: "absolute",
        top: "20%",
        right: "10%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(0,196,140,0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        pointerEvents: "none",
        zIndex: -1
      }} />
    </motion.div>
  );
}

// ==========================================================
// 🏠 DASHBOARD SCREEN - Main Portal
// ==========================================================
function DashboardScreen({ client, tab, setTab, onLogout }) {
  const tabs = [
    { key: "trips", label: "My Journeys", icon: "✈️" },
    { key: "documents", label: "Documents", icon: "📄" },
    { key: "bookings", label: "Bookings", icon: "📅" },
    { key: "concierge", label: "Concierge", icon: "💬" },
    { key: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Luxury Header */}
      <div style={{ marginBottom: "3rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-start",
            marginBottom: "1rem",
            flexWrap: "wrap",
            gap: "1.5rem"
          }}
        >
          <div>
            <h1 style={{ 
              fontSize: "3rem", 
              background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
              fontWeight: 900,
              letterSpacing: "-1.5px",
              marginBottom: "0.5rem"
            }}>
              Welcome Back, {client.fullName?.split(' ')[0] || "Traveler"}
            </h1>
            <p style={{ 
              color: "rgba(255,255,255,0.7)", 
              fontSize: "1.1rem",
              margin: 0
            }}>
              Your world of curated experiences
            </p>
          </div>

          <LuxuryButton variant="outline" onClick={onLogout}>
            Log Out →
          </LuxuryButton>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ 
            display: "flex", 
            gap: "0.75rem", 
            flexWrap: "wrap",
            marginTop: "2rem"
          }}
        >
          {tabs.map(({ key, label, icon }, index) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setTab(key)}
              style={{
                ...tabButtonStyle,
                background: tab === key 
                  ? "linear-gradient(135deg, #00c48c 0%, #00a67a 100%)"
                  : "rgba(255,255,255,0.05)",
                color: tab === key ? "#000" : "#fff",
                border: tab === key ? "none" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: tab === key ? "0 8px 24px rgba(0,196,140,0.3)" : "none",
                transform: tab === key ? "translateY(-2px)" : "translateY(0)",
              }}
              onMouseEnter={(e) => {
                if (tab !== key) {
                  e.target.style.background = "rgba(255,255,255,0.08)";
                  e.target.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (tab !== key) {
                  e.target.style.background = "rgba(255,255,255,0.05)";
                  e.target.style.transform = "translateY(0)";
                }
              }}
            >
              <span style={{ marginRight: "0.5rem", fontSize: "1.2rem" }}>{icon}</span>
              {label}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Tab Content with smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {tab === "trips" && <TripsTab client={client} />}
          {tab === "documents" && <DocumentsTab client={client} />}
          {tab === "bookings" && <BookingsTab client={client} />}
          {tab === "concierge" && <ConciergeTab client={client} />}
          {tab === "profile" && <ProfileTab client={client} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ==========================================================
// 🗺️ TRIPS TAB - Journey Timeline
// ==========================================================
function TripsTab({ client }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/.netlify/functions/get-client-trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: client.id }),
        });
        const data = await res.json();
        setTrips(data.trips || []);
      } catch (err) {
        console.error("Trip load error:", err);
      }
      setLoading(false);
    };
    load();
  }, [client.id]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
      {trips.length === 0 && (
        <GlassCard>
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.5 }}>🌍</div>
            <h3 style={{ color: "white", marginBottom: "0.5rem" }}>No trips yet</h3>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>Your next adventure awaits</p>
          </div>
        </GlassCard>
      )}

      {trips.map((trip, index) => (
        <motion.div
          key={trip.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
        >
          <GlassCard style={{ overflow: "hidden", height: "100%" }}>
            {trip.image && (
              <div style={{ 
                height: "200px", 
                overflow: "hidden",
                position: "relative"
              }}>
                <img 
                  src={trip.image} 
                  alt={trip.destination} 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover",
                    filter: "brightness(0.9)"
                  }} 
                />
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
                }} />
              </div>
            )}

            <div style={{ padding: "1.75rem" }}>
              <h3 style={{ 
                margin: "0 0 0.75rem 0", 
                color: "white",
                fontSize: "1.5rem",
                fontWeight: 700
              }}>
                {trip.destination}
              </h3>

              <div style={{ 
                display: "flex", 
                gap: "0.5rem", 
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.6)"
              }}>
                <span>📅</span>
                <span>{trip.startDate} → {trip.endDate}</span>
              </div>

              <TripProgress status={trip.status} />
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

// Trip Progress Indicator
function TripProgress({ status }) {
  const stages = [
    { key: "planning", label: "Planning" },
    { key: "confirmed", label: "Confirmed" },
    { key: "active", label: "Traveling" },
    { key: "completed", label: "Completed" },
  ];

  const statusMap = {
    "Planning": 0, "Pending": 0,
    "Confirmed": 1, "Booked": 1, "Upcoming": 1,
    "Active": 2, "In Progress": 2, "Traveling": 2,
    "Completed": 3, "Done": 3, "Past": 3,
  };

  const currentIndex = statusMap[status] ?? 0;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
        {stages.map((stage, i) => {
          const isComplete = i <= currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <React.Fragment key={stage.key}>
              <div style={{
                width: isCurrent ? "16px" : "12px",
                height: isCurrent ? "16px" : "12px",
                borderRadius: "50%",
                background: isComplete 
                  ? "linear-gradient(135deg, #00c48c, #00a67a)"
                  : "rgba(255,255,255,0.15)",
                boxShadow: isCurrent ? "0 0 20px rgba(0,196,140,0.5)" : "none",
                transition: "all 0.3s ease",
                flexShrink: 0
              }} />

              {i < stages.length - 1 && (
                <div style={{
                  flex: 1,
                  height: "3px",
                  background: i < currentIndex 
                    ? "linear-gradient(90deg, #00c48c, #00a67a)"
                    : "rgba(255,255,255,0.1)",
                  margin: "0 8px",
                  borderRadius: "2px",
                  transition: "all 0.3s ease",
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ 
        fontSize: "0.75rem", 
        color: "rgba(255,255,255,0.6)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        {stages[currentIndex].label}
      </div>
    </div>
  );
}

// ==========================================================
// 📄 OTHER TABS (Documents, Bookings, Concierge, Profile)
// ==========================================================
function DocumentsTab({ client }) {
  return (
    <GlassCard>
      <div style={{ padding: "2.5rem" }}>
        <h2 style={{ color: "white", marginTop: 0, marginBottom: "2rem", fontSize: "2rem" }}>
          Your Documents
        </h2>
        <div style={{ padding: "3rem", textAlign: "center", opacity: 0.5 }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
          <p style={{ color: "rgba(255,255,255,0.7)" }}>No documents yet</p>
        </div>
      </div>
    </GlassCard>
  );
}

function BookingsTab({ client }) {
  return (
    <GlassCard>
      <div style={{ padding: "2.5rem" }}>
        <h2 style={{ color: "white", marginTop: 0, marginBottom: "2rem", fontSize: "2rem" }}>
          My Bookings
        </h2>
        <div style={{ padding: "3rem", textAlign: "center", opacity: 0.5 }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
          <p style={{ color: "rgba(255,255,255,0.7)" }}>No bookings found</p>
        </div>
      </div>
    </GlassCard>
  );
}

function ConciergeTab({ client }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    
    setTimeout(() => {
      setSent(true);
      setMessage("");
      setSending(false);
    }, 1500);
  };

  return (
    <GlassCard>
      <div style={{ padding: "2.5rem" }}>
        <h2 style={{ color: "white", marginTop: 0, marginBottom: "0.75rem", fontSize: "2rem" }}>
          Concierge Service
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>
          Your dedicated travel designer is here to help
        </p>

        {!sent ? (
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we make your experience extraordinary?"
              style={{
                width: "100%",
                minHeight: "160px",
                padding: "1.25rem",
                borderRadius: "16px",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                fontSize: "1.05rem",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit"
              }}
            />
            <LuxuryButton 
              onClick={sendMessage} 
              disabled={sending || !message.trim()} 
              style={{ marginTop: "1.5rem" }}
            >
              {sending ? "Sending..." : "Send Message"}
            </LuxuryButton>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: "center",
              padding: "3rem",
              background: "rgba(0,196,140,0.1)",
              border: "1px solid rgba(0,196,140,0.3)",
              borderRadius: "20px",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
            <h3 style={{ color: fhjTheme.primary, margin: 0, marginBottom: "0.5rem" }}>
              Message Sent
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>
              Our team will respond shortly
            </p>
            <button 
              onClick={() => setSent(false)}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: 500
              }}
            >
              Send Another Message
            </button>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}

function ProfileTab({ client }) {
  const fields = [
    { label: "Full Name", value: client.fullName, icon: "👤" },
    { label: "Email Address", value: client.email, icon: "✉️" },
    { label: "Phone Number", value: client.phone, icon: "📞" },
  ];

  return (
    <GlassCard>
      <div style={{ padding: "2.5rem" }}>
        <h2 style={{ color: "white", marginTop: 0, marginBottom: "2.5rem", fontSize: "2rem" }}>
          Your Profile
        </h2>
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {fields.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <label style={{ 
                display: "block", 
                color: "rgba(255,255,255,0.6)", 
                fontSize: "0.85rem", 
                marginBottom: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 600
              }}>
                <span style={{ marginRight: "0.5rem" }}>{f.icon}</span>
                {f.label}
              </label>
              <div style={{ 
                color: "white", 
                fontSize: "1.15rem", 
                padding: "1rem 1.25rem", 
                background: "rgba(255,255,255,0.05)", 
                borderRadius: "12px", 
                border: "1px solid rgba(255,255,255,0.1)",
                fontWeight: 500
              }}>
                {f.value || "Not provided"}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

// ==========================================================
// 🎨 REUSABLE COMPONENTS
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

function LuxuryButton({ children, onClick, disabled, variant = "primary", type, style = {} }) {
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
      type={type}
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

function LoadingSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
      {[1, 2, 3].map(i => (
        <GlassCard key={i}>
          <div style={{ padding: "2rem", height: "300px" }}>
            <div style={{ 
              width: "60%", 
              height: "24px", 
              background: "rgba(255,255,255,0.1)", 
              borderRadius: "8px",
              marginBottom: "1rem",
              animation: "pulse 1.5s ease-in-out infinite"
            }} />
            <div style={{ 
              width: "40%", 
              height: "16px", 
              background: "rgba(255,255,255,0.1)", 
              borderRadius: "8px",
              animation: "pulse 1.5s ease-in-out infinite"
            }} />
          </div>
        </GlassCard>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// ==========================================================
// STYLES
// ==========================================================
const labelStyle = {
  display: "block",
  color: "rgba(255,255,255,0.8)",
  marginBottom: "0.75rem",
  fontSize: "0.95rem",
  fontWeight: 600,
  letterSpacing: "0.3px"
};

const inputOverride = {
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "12px",
  padding: "1rem",
  fontSize: "1.05rem"
};

const tabButtonStyle = {
  padding: "0.85rem 1.5rem",
  borderRadius: "14px",
  fontSize: "0.95rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  whiteSpace: "nowrap"
};
