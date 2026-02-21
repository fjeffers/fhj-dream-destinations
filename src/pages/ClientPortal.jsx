// ==========================================================
// 📄 FILE: ClientPortal.jsx  (PHASE 3 — LUXURY POLISH)
// Refactored: Broken into tab components, real timeline,
// skeleton loading, toast notifications, trip progress tracker
// Location: src/pages/ClientPortal.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";
import FHJSkeleton from "../components/FHJ/FHJSkeleton.jsx";
import { useToast } from "../components/FHJ/FHJToast.jsx";

export default function ClientPortal() {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("trips");

  // -------------------------------------------------------
  // Auth
  // -------------------------------------------------------
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/.netlify/functions/client-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, accessCode }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setClient(data.client);
        toast.success(`Welcome back, ${data.client.fullName || "traveler"}!`);
      } else {
        toast.error(data.error || "Invalid credentials.");
      }
    } catch (err) {
      toast.error("Could not login. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setClient(null);
    setEmail("");
    setAccessCode("");
    toast.info("You've been logged out.");
  };

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <FHJBackground page="home">
      <div style={{ padding: "8rem 2rem 5rem", maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 2 }}>
        
        <AnimatePresence mode="wait">
          {!client ? (
            <LoginScreen
              key="login"
              email={email}
              setEmail={setEmail}
              accessCode={accessCode}
              setAccessCode={setAccessCode}
              loading={loading}
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
// LOGIN SCREEN
// ==========================================================
function LoginScreen({ email, setEmail, accessCode, setAccessCode, loading, onSubmit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: fhjTheme.primary, textAlign: "center" }}>
        Client Portal
      </h1>
      <p style={{ opacity: 0.7, marginBottom: "2rem", color: "white", textAlign: "center" }}>
        Enter your credentials to view your dashboard.
      </p>

      <FHJCard style={{ padding: "2rem", maxWidth: "500px", width: "100%" }}>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Email Address</label>
            <FHJInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" required />
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <label style={labelStyle}>Access Code</label>
            <FHJInput type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="••••••" required />
          </div>
          <FHJButton type="submit" disabled={loading} fullWidth>
            {loading ? "Authenticating..." : "Enter Portal"}
          </FHJButton>
        </form>
      </FHJCard>
    </motion.div>
  );
}

// ==========================================================
// DASHBOARD SCREEN
// ==========================================================
function DashboardScreen({ client, tab, setTab, onLogout }) {
  const tabVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  };

  const tabs = [
    { key: "trips", label: "My Trips" },
    { key: "documents", label: "Documents" },
    { key: "bookings", label: "Bookings" },
    { key: "concierge", label: "Concierge" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", color: fhjTheme.primary, margin: 0 }}>
            Welcome Back, {client.fullName || "Traveler"}
          </h1>
          <p style={{ opacity: 0.7, color: "white", marginTop: "0.5rem" }}>
            Your journeys, documents, and details — all in one place.
          </p>
        </div>
        <FHJButton variant="outline" size="sm" onClick={onLogout}>Log Out</FHJButton>
      </div>

      {/* Tab Nav */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {tabs.map(({ key, label }) => (
          <FHJButton
            key={key}
            onClick={() => setTab(key)}
            style={{
              background: tab === key ? fhjTheme.primary : "rgba(255,255,255,0.08)",
              color: tab === key ? "#0f172a" : "white",
              border: tab === key ? "1px solid transparent" : "1px solid rgba(255,255,255,0.15)",
              fontWeight: tab === key ? 700 : 500,
            }}
          >
            {label}
          </FHJButton>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
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
// TRIPS TAB — with progress tracker
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
    return <FHJSkeleton variant="card" count={3} />;
  }

  return (
    <FHJCard style={{ padding: "2rem" }}>
      <h2 style={{ color: "white", marginTop: 0, marginBottom: "1.5rem" }}>My Trips</h2>
      {trips.length === 0 && <p style={{ opacity: 0.6, color: "#aaa" }}>No trips found.</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {trips.map((trip) => (
          <FHJCard key={trip.id} style={{ padding: "1.25rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {trip.image && (
              <img src={trip.image} alt={trip.destination} style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "10px", marginBottom: "1rem" }} />
            )}
            <h3 style={{ margin: "0 0 0.5rem 0", color: "white" }}>{trip.destination}</h3>
            <p style={{ margin: "0 0 0.75rem 0", color: "#aaa", fontSize: "0.9rem" }}>
              {trip.startDate} → {trip.endDate}
            </p>

            {/* Trip Progress Tracker */}
            <TripProgress status={trip.status} />
          </FHJCard>
        ))}
      </div>
    </FHJCard>
  );
}

// -------------------------------------------------------
// Trip Progress Tracker
// -------------------------------------------------------
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
    <div style={{ display: "flex", alignItems: "center", gap: "0px", marginTop: "0.5rem" }}>
      {stages.map((stage, i) => {
        const isComplete = i <= currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <React.Fragment key={stage.key}>
            {/* Dot */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: "0 0 auto",
            }}>
              <div style={{
                width: isCurrent ? "14px" : "10px",
                height: isCurrent ? "14px" : "10px",
                borderRadius: "50%",
                background: isComplete ? fhjTheme.primary : "rgba(255,255,255,0.15)",
                boxShadow: isCurrent ? `0 0 10px ${fhjTheme.primary}` : "none",
                transition: "all 0.3s ease",
              }} />
              <span style={{
                fontSize: "0.65rem",
                color: isComplete ? fhjTheme.primary : "rgba(255,255,255,0.4)",
                fontWeight: isCurrent ? 700 : 400,
                whiteSpace: "nowrap",
              }}>
                {stage.label}
              </span>
            </div>

            {/* Connector line */}
            {i < stages.length - 1 && (
              <div style={{
                flex: 1,
                height: "2px",
                background: i < currentIndex ? fhjTheme.primary : "rgba(255,255,255,0.1)",
                marginBottom: "18px",
                transition: "background 0.3s ease",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ==========================================================
// DOCUMENTS TAB
// ==========================================================
function DocumentsTab({ client }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/.netlify/functions/get-documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: client.id }),
        });
        const data = await res.json();
        setDocuments(data.documents || []);
      } catch (err) {
        console.error("Document load error:", err);
      }
      setLoading(false);
    };
    load();
  }, [client.id]);

  if (loading) {
    return <FHJSkeleton variant="text" lines={5} />;
  }

  return (
    <FHJCard style={{ padding: "2rem" }}>
      <h2 style={{ color: "white", marginTop: 0, marginBottom: "1rem" }}>Documents</h2>
      {documents.length === 0 && <p style={{ opacity: 0.6, color: "#aaa" }}>No documents found.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {documents.map((doc) => (
          <a
            key={doc.id}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            style={docItemStyle}
          >
            <div style={docIcon}>📄</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "white", fontWeight: 600, fontSize: "1rem" }}>{doc.name}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "2px" }}>
                {doc.type} · {doc.uploaded}
              </div>
            </div>
            <span style={{ color: fhjTheme.primary, fontSize: "0.85rem" }}>View →</span>
          </a>
        ))}
      </div>
    </FHJCard>
  );
}

// ==========================================================
// BOOKINGS TAB
// ==========================================================
function BookingsTab({ client }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/.netlify/functions/get-bookings?email=${encodeURIComponent(client.email)}`);
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error("Booking load error:", err);
      }
      setLoading(false);
    };
    load();
  }, [client.email]);

  if (loading) {
    return <FHJSkeleton variant="table" rows={4} cols={3} />;
  }

  return (
    <FHJCard style={{ padding: "2rem" }}>
      <h2 style={{ color: "white", marginTop: 0, marginBottom: "1rem" }}>My Bookings</h2>
      {bookings.length === 0 && <p style={{ opacity: 0.6, color: "#aaa" }}>No bookings found.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {bookings.map((b) => (
          <div key={b.id} style={bookingItemStyle}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "white", fontWeight: 600, fontSize: "1.05rem" }}>{b["Trip Name"]}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "4px" }}>
                {b["Travel Dates"]}
              </div>
            </div>
            <span style={{
              padding: "0.3rem 0.85rem",
              background: "rgba(0,196,140,0.15)",
              color: fhjTheme.primary,
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}>
              {b["Trip Status"]}
            </span>
          </div>
        ))}
      </div>
    </FHJCard>
  );
}

// ==========================================================
// CONCIERGE TAB
// ==========================================================
function ConciergeTab({ client }) {
  const toast = useToast();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/.netlify/functions/concierge-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: client.email,
          name: client.fullName || "Client",
          message,
          context: "Client Portal",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setMessage("");
        toast.success("Message sent to your travel designer!");
      } else {
        toast.error("Failed to send message.");
      }
    } catch (err) {
      toast.error("Connection error. Please try again.");
    }
    setSending(false);
  };

  return (
    <FHJCard style={{ padding: "2rem" }}>
      <h2 style={{ color: "white", marginTop: 0, marginBottom: "0.5rem" }}>Concierge</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        Send a direct message to your travel designer.
      </p>

      {!sent ? (
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we make your trip perfect?"
            style={textareaStyle}
          />
          <FHJButton onClick={sendMessage} disabled={sending || !message.trim()} style={{ marginTop: "1rem" }}>
            {sending ? "Sending..." : "Send Message"}
          </FHJButton>
        </div>
      ) : (
        <div style={sentConfirmStyle}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✓</div>
          <p style={{ color: fhjTheme.primary, margin: 0, fontWeight: 600, fontSize: "1.05rem" }}>
            Your message has been sent.
          </p>
          <p style={{ color: "#94a3b8", margin: "0.5rem 0 1rem", fontSize: "0.9rem" }}>
            Our team will respond shortly.
          </p>
          <FHJButton variant="ghost" size="sm" onClick={() => setSent(false)}>
            Send Another Message
          </FHJButton>
        </div>
      )}
    </FHJCard>
  );
}

// ==========================================================
// PROFILE TAB
// ==========================================================
function ProfileTab({ client }) {
  const fields = [
    { label: "Full Name", value: client.fullName },
    { label: "Email Address", value: client.email },
    { label: "Phone Number", value: client.phone },
  ];

  return (
    <FHJCard style={{ padding: "2rem" }}>
      <h2 style={{ color: "white", marginTop: 0, marginBottom: "1.5rem" }}>Profile</h2>
      <div style={{ display: "grid", gap: "1.25rem" }}>
        {fields.map((f) => (
          <div key={f.label}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "0.8rem", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {f.label}
            </label>
            <div style={{ color: "white", fontSize: "1.1rem", padding: "0.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
              {f.value || "Not provided"}
            </div>
          </div>
        ))}
      </div>
    </FHJCard>
  );
}

// ==========================================================
// Shared Styles
// ==========================================================
const labelStyle = {
  display: "block",
  color: "white",
  marginBottom: "0.5rem",
  fontSize: "0.9rem",
};

const docItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1rem",
  background: "rgba(255,255,255,0.04)",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
  textDecoration: "none",
  transition: "background 0.2s ease",
};

const docIcon = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  background: "rgba(0,196,140,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.2rem",
  flexShrink: 0,
};

const bookingItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1rem",
  background: "rgba(255,255,255,0.04)",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
};

const textareaStyle = {
  width: "100%",
  minHeight: "120px",
  padding: "14px",
  borderRadius: "12px",
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "white",
  fontSize: "1rem",
  resize: "vertical",
  boxSizing: "border-box",
  colorScheme: "dark",
};

const sentConfirmStyle = {
  textAlign: "center",
  padding: "2rem",
  background: "rgba(0,196,140,0.06)",
  border: "1px solid rgba(0,196,140,0.2)",
  borderRadius: "14px",
};
