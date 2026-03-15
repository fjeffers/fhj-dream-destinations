// ==========================================================
// FILE: ClientPortal.jsx — Full Rewrite
// Login: Email + Password | Dashboard: 6 tabs
// Location: src/pages/ClientPortal.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FHJCard, FHJButton, FHJInput, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";

// --------------- Shared styles ---------------
const glassCard = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "20px",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
};

const labelStyle = {
  display: "block",
  color: "rgba(255,255,255,0.7)",
  fontSize: "0.85rem",
  fontWeight: 600,
  marginBottom: "0.5rem",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const inputOverride = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  borderRadius: "12px",
};

const tabBtnBase = {
  padding: "0.6rem 1.25rem",
  borderRadius: "50px",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.9rem",
  transition: "all 0.2s",
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
};

// --------------- Helpers ---------------
function Badge({ label, color = "#00c48c" }) {
  return (
    <span style={{
      background: color + "22",
      color,
      border: `1px solid ${color}44`,
      borderRadius: "50px",
      padding: "0.2rem 0.75rem",
      fontSize: "0.78rem",
      fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem", opacity: 0.6 }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{icon}</div>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem" }}>{message}</p>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <h3 style={{
      color: "rgba(255,255,255,0.5)",
      fontSize: "0.75rem",
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      margin: "2rem 0 1rem",
    }}>
      {title}
    </h3>
  );
}

function DataCard({ children }) {
  return (
    <div style={{ ...glassCard, padding: "1.5rem", marginBottom: "1rem" }}>
      {children}
    </div>
  );
}

// --------------- Main Component ---------------
export default function ClientPortal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [client, setClient] = useState(null);
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("profile");

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/.netlify/functions/client-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setClient(data.client);
        fetchPortalData(data.client.email);
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("Could not connect. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPortalData = async (clientEmail) => {
    setDataLoading(true);
    setDataError("");
    try {
      const res = await fetch("/.netlify/functions/client-portal-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clientEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setPortalData(data);
      } else {
        setDataError("Could not load your portal data. Please try refreshing.");
      }
    } catch {
      setDataError("Could not load your portal data. Please check your connection.");
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = () => {
    setClient(null);
    setPortalData(null);
    setDataError("");
    setEmail("");
    setPassword("");
    setTab("profile");
  };

  return (
    <FHJBackground page="home">
      <div style={{
        padding: "6rem 2rem 5rem",
        maxWidth: "1400px",
        margin: "0 auto",
        position: "relative",
        zIndex: 2,
        minHeight: "100vh",
      }}>
        <AnimatePresence mode="wait">
          {!client ? (
            <LoginScreen
              key="login"
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              error={error}
              onSubmit={handleLogin}
            />
          ) : (
            <DashboardScreen
              key="dashboard"
              client={client}
              portalData={portalData}
              dataLoading={dataLoading}
              dataError={dataError}
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

// --------------- Login Screen ---------------
function LoginScreen({ email, setEmail, password, setPassword, loading, error, onSubmit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "520px", margin: "0 auto" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
        style={{
          width: "80px", height: "80px", borderRadius: "20px",
          background: "linear-gradient(135deg, #00c48c 0%, #00a67a 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.5rem", marginBottom: "2rem",
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
          fontSize: "2.8rem", marginBottom: "0.75rem",
          background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          fontWeight: 800, textAlign: "center", letterSpacing: "-1px",
        }}
      >
        Welcome Back
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{ opacity: 0.7, marginBottom: "3rem", color: "white", textAlign: "center", fontSize: "1.05rem" }}
      >
        Your personalized travel dashboard awaits
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ width: "100%" }}
      >
        <div style={{ ...glassCard, padding: "2.5rem" }}>
          <form onSubmit={onSubmit}>
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
              <label style={labelStyle}>Password</label>
              <FHJInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </motion.div>
            )}

            <FHJButton type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Authenticating…" : "Enter Portal"}
            </FHJButton>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --------------- Dashboard Screen ---------------
function DashboardScreen({ client, portalData, dataLoading, dataError, tab, setTab, onLogout }) {
  const tabs = [
    { key: "profile", label: "Profile", icon: "👤" },
    { key: "bookings", label: "Bookings", icon: "📅" },
    { key: "trips", label: "Trips", icon: "✈️" },
    { key: "payments", label: "Payments", icon: "💳" },
    { key: "documents", label: "Documents", icon: "📄" },
    { key: "concierge", label: "Concierge", icon: "💬" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      {/* Header */}
      <div style={{ marginBottom: "3rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "1.5rem" }}
        >
          <div>
            <h1 style={{
              fontSize: "3rem",
              background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              margin: 0, fontWeight: 900, letterSpacing: "-1.5px", marginBottom: "0.5rem",
            }}>
              Welcome Back, {client.fullName?.split(" ")[0] || "Traveler"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.1rem", margin: 0 }}>
              Your world of curated experiences
            </p>
          </div>
          <FHJButton variant="outline" onClick={onLogout}>Log Out →</FHJButton>
        </motion.div>

        {/* Tab Nav */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "2rem" }}
        >
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                ...tabBtnBase,
                background: tab === key ? "linear-gradient(135deg, #00c48c 0%, #00a67a 100%)" : "rgba(255,255,255,0.05)",
                color: tab === key ? "#000" : "#fff",
                border: tab === key ? "none" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: tab === key ? "0 8px 24px rgba(0,196,140,0.3)" : "none",
              }}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {dataLoading ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.5)" }}>
              Loading your data…
            </div>
          ) : dataError ? (
            <div style={{
              textAlign: "center", padding: "3rem",
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: "16px", color: "#f87171",
            }}>
              {dataError}
            </div>
          ) : (
            <>
              {tab === "profile" && <ProfileTab client={client} profile={portalData?.profile} />}
              {tab === "bookings" && <BookingsTab bookings={portalData?.bookings || []} />}
              {tab === "trips" && <TripsTab trips={portalData?.trips || []} />}
              {tab === "payments" && <PaymentsTab payments={portalData?.payments || []} />}
              {tab === "documents" && <DocumentsTab documents={portalData?.documents || []} />}
              {tab === "concierge" && <ConciergeTab concierge={portalData?.concierge || []} />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// --------------- Profile Tab ---------------
function ProfileTab({ client, profile }) {
  const fields = [
    { label: "Full Name", value: profile?.full_name || client?.fullName || "—" },
    { label: "Email", value: profile?.email || client?.email || "—" },
    { label: "Phone", value: profile?.phone || client?.phone || "—" },
    { label: "Address", value: profile?.address || "—" },
  ];

  return (
    <div>
      <div style={{ ...glassCard, padding: "2rem", maxWidth: "600px" }}>
        <h2 style={{ color: "#fff", fontWeight: 700, marginBottom: "2rem", fontSize: "1.4rem" }}>
          👤 Your Profile
        </h2>
        {fields.map(({ label, value }) => (
          <div key={label} style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>{label}</label>
            <div style={{
              color: "#fff", fontSize: "1rem",
              padding: "0.75rem 1rem",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --------------- Bookings Tab ---------------
function BookingsTab({ bookings }) {
  if (!bookings.length) {
    return <EmptyState icon="📅" message="No bookings on record yet." />;
  }

  const now = new Date();
  const upcoming = bookings.filter((b) => b.date && new Date(b.date) >= now);
  const past = bookings.filter((b) => b.date && new Date(b.date) < now);
  const undated = bookings.filter((b) => !b.date);

  const BookingCard = ({ b }) => (
    <DataCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.4rem" }}>
            {b.destination || b.name || "Booking"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
            {b.date && <span>📆 {new Date(b.date).toLocaleDateString()}</span>}
            {b.time && <span style={{ marginLeft: "1rem" }}>🕐 {b.time}</span>}
            {b.type && <span style={{ marginLeft: "1rem" }}>📌 {b.type}</span>}
          </div>
        </div>
        <Badge label={b.status || "Scheduled"} color="#00c48c" />
      </div>
    </DataCard>
  );

  return (
    <div>
      {upcoming.length > 0 && (
        <>
          <SectionHeader title="Upcoming" />
          {upcoming.map((b, i) => <BookingCard key={b.id || i} b={b} />)}
        </>
      )}
      {past.length > 0 && (
        <>
          <SectionHeader title="Past" />
          {past.map((b, i) => <BookingCard key={b.id || i} b={b} />)}
        </>
      )}
      {undated.length > 0 && (
        <>
          <SectionHeader title="Scheduled" />
          {undated.map((b, i) => <BookingCard key={b.id || i} b={b} />)}
        </>
      )}
    </div>
  );
}

// --------------- Trips Tab ---------------
function TripsTab({ trips }) {
  if (!trips.length) {
    return <EmptyState icon="✈️" message="No trips found yet. Your adventures await!" />;
  }

  const now = new Date();
  const upcoming = trips.filter((t) => t.start_date && new Date(t.start_date) >= now);
  const past = trips.filter((t) => t.start_date && new Date(t.start_date) < now);
  const undated = trips.filter((t) => !t.start_date);

  const TripCard = ({ t }) => (
    <DataCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.4rem" }}>
            {t.destination || t.name || "Trip"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
            {t.start_date && <span>📆 {new Date(t.start_date).toLocaleDateString()}</span>}
            {t.end_date && <span style={{ marginLeft: "1rem" }}>→ {new Date(t.end_date).toLocaleDateString()}</span>}
            {t.trip_type && <span style={{ marginLeft: "1rem" }}>🌍 {t.trip_type}</span>}
          </div>
        </div>
        <Badge label={t.status || "Planned"} color="#00c48c" />
      </div>
    </DataCard>
  );

  return (
    <div>
      {upcoming.length > 0 && (
        <>
          <SectionHeader title="Upcoming Trips" />
          {upcoming.map((t, i) => <TripCard key={t.id || i} t={t} />)}
        </>
      )}
      {past.length > 0 && (
        <>
          <SectionHeader title="Past Trips" />
          {past.map((t, i) => <TripCard key={t.id || i} t={t} />)}
        </>
      )}
      {undated.length > 0 && (
        <>
          <SectionHeader title="Trips" />
          {undated.map((t, i) => <TripCard key={t.id || i} t={t} />)}
        </>
      )}
    </div>
  );
}

// --------------- Payments Tab ---------------
function PaymentsTab({ payments }) {
  if (!payments.length) {
    return <EmptyState icon="💳" message="No payment records yet." />;
  }

  return (
    <div>
      <SectionHeader title="Payment Summary" />
      {payments.map((p, i) => (
        <DataCard key={p.id || i}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: "1rem" }}>
            {p.trip_name || p.description || `Payment #${i + 1}`}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            {[
              { label: "Total Cost", value: p.total_cost, color: "#fff" },
              { label: "Down Payment", value: p.down_payment, color: "#00c48c" },
              { label: "Remaining Balance", value: p.remaining_balance ?? (p.total_cost != null && p.down_payment != null ? Math.max(0, p.total_cost - p.down_payment) : null), color: "#f87171" },
            ].map(({ label, value, color }) => value != null && (
              <div key={label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                  {label}
                </div>
                <div style={{ color, fontWeight: 700, fontSize: "1.4rem" }}>
                  ${Number(value).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </DataCard>
      ))}
    </div>
  );
}

// --------------- Documents Tab ---------------
function DocumentsTab({ documents }) {
  if (!documents.length) {
    return <EmptyState icon="📄" message="No documents yet." />;
  }

  return (
    <div>
      <SectionHeader title="Your Documents" />
      {documents.map((d, i) => (
        <DataCard key={d.id || i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 600, marginBottom: "0.3rem" }}>
                📎 {d.name || d.title || `Document ${i + 1}`}
              </div>
              {d.created_at && (
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
                  Added {new Date(d.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
            {d.url && (
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "rgba(0,196,140,0.15)", color: "#00c48c",
                  border: "1px solid rgba(0,196,140,0.3)", borderRadius: "8px",
                  padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View →
              </a>
            )}
          </div>
        </DataCard>
      ))}
    </div>
  );
}

// --------------- Concierge Tab ---------------
function ConciergeTab({ concierge }) {
  if (!concierge.length) {
    return <EmptyState icon="💬" message="No conversations yet. Use our chat widget to start one!" />;
  }

  return (
    <div>
      {concierge.map((thread, i) => (
        <div key={thread.id || i} style={{ marginBottom: "2rem" }}>
          <div style={{ ...glassCard, padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                💬 {thread.subject || thread.destination || `Conversation ${i + 1}`}
              </div>
              <Badge
                label={thread.status || "New"}
                color={thread.status === "Resolved" ? "#6366f1" : "#00c48c"}
              />
            </div>
            {thread.created_at && (
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", marginBottom: "1rem" }}>
                Started {new Date(thread.created_at).toLocaleDateString()}
              </div>
            )}

            {/* Messages */}
            {(thread.concierge_messages || []).length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                {thread.concierge_messages.map((msg, j) => {
                  const isClient = msg.sender === "client" || msg.sender === "user";
                  return (
                    <div
                      key={msg.id || j}
                      style={{
                        display: "flex",
                        justifyContent: isClient ? "flex-end" : "flex-start",
                      }}
                    >
                      <div style={{
                        maxWidth: "75%",
                        padding: "0.75rem 1rem",
                        borderRadius: "14px",
                        background: isClient ? "rgba(0,196,140,0.2)" : "rgba(255,255,255,0.08)",
                        border: `1px solid ${isClient ? "rgba(0,196,140,0.3)" : "rgba(255,255,255,0.1)"}`,
                        color: "#fff",
                        fontSize: "0.9rem",
                      }}>
                        <div style={{ fontWeight: 600, fontSize: "0.75rem", marginBottom: "0.3rem", opacity: 0.7 }}>
                          {isClient ? "You" : "Concierge"}
                        </div>
                        {msg.body || msg.message || msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>No messages yet.</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}