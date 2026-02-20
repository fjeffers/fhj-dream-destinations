import React, { useState, useEffect } from "react";

export default function IntakeForm({ initialData }) {
  // Today in EST
  const todayEST = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });

  const blankForm = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    destination: initialData ? initialData.fields["Trip Name"] : "",
    startDate: todayEST,
    endDate: todayEST,
    tripType: "Individual",
    flexible: false,
    groupSize: "1",
    occasion: "Vacation",
    budget: "",
    notes: "",
  };

  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);

  // 🟢 Sync destination when initialData loads
  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        destination: initialData.fields["Trip Name"] || "",
      }));
    }
  }, [initialData]);

  // 🟢 Synchronized date logic
  const handleStartChange = (e) => {
    const newStart = e.target.value;
    setForm((prev) => ({
      ...prev,
      startDate: newStart,
      endDate: newStart,
    }));
  };

  // 🟢 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/.netlify/functions/intake-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Your trip request has been submitted!");
        setForm(blankForm);
      } else {
        const errorText = await res.text();
        console.error("Server Error:", errorText);
        alert(`Submission failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Form error:", error);
      alert("System error. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "120px 20px",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        animation: "fadeIn 1.2s ease",
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0 }
            to { opacity: 1 }
          }
          @keyframes slideUp {
            from { transform: translateY(40px); opacity: 0 }
            to { transform: translateY(0); opacity: 1 }
          }
          input:focus, textarea:focus, select:focus {
            border-color: #4ade80 !important;
          }
        `}
      </style>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "900px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "25px",
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(14px)",
          padding: "50px",
          borderRadius: "30px",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
          animation: "slideUp 1s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            gridColumn: "1 / -1",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "2.6rem",
              fontWeight: "900",
              color: "white",
              marginBottom: "10px",
            }}
          >
            DESIGN YOUR <span style={{ color: "#4ade80" }}>JOURNEY</span>
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: "1rem" }}>
            Tell us your vision — we’ll curate the experience.
          </p>
        </div>

        {/* Contact Info */}
        <input
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          style={inputStyle}
          required
        />
        <input
          placeholder="Email Address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={inputStyle}
          required
        />
        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Home City / Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          style={inputStyle}
        />

        {/* Trip Details */}
        <div style={labelGroup}>
          <label style={labelStyle}>Trip Type</label>
          <select
            value={form.tripType}
            onChange={(e) => setForm({ ...form, tripType: e.target.value })}
            style={inputStyle}
          >
            <option value="Individual">Individual / Couple</option>
            <option value="Group">Group Trip</option>
            <option value="Wedding">Destination Wedding</option>
            <option value="Cruise">Luxury Cruise</option>
            <option value="Corporate">Corporate / Event</option>
          </select>
        </div>

        <div style={labelGroup}>
          <label style={labelStyle}>Occasion</label>
          <select
            value={form.occasion}
            onChange={(e) => setForm({ ...form, occasion: e.target.value })}
            style={inputStyle}
          >
            <option value="Vacation">Vacation</option>
            <option value="Honeymoon">Honeymoon</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Birthday">Birthday</option>
            <option value="Reunion">Reunion</option>
            <option value="Just Because">Just Because</option>
          </select>
        </div>

        <input
          placeholder="Preferred Destination"
          value={form.destination}
          onChange={(e) => setForm({ ...form, destination: e.target.value })}
          style={{
            ...inputStyle,
            gridColumn: "1 / -1",
            fontSize: "1.1rem",
            borderColor: "#4ade80",
          }}
          required
        />

        {/* Dates */}
        <div style={labelGroup}>
          <label style={labelStyle}>Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={handleStartChange}
            style={inputStyle}
          />
        </div>

        <div style={labelGroup}>
          <label style={labelStyle}>End Date</label>
          <input
            type="date"
            min={form.startDate}
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            style={inputStyle}
          />
        </div>

        <input
          placeholder="Travelers (Group Size)"
          type="number"
          min="1"
          value={form.groupSize}
          onChange={(e) => setForm({ ...form, groupSize: e.target.value })}
          style={inputStyle}
        />

        <input
          placeholder="Estimated Budget per Person"
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
          style={inputStyle}
        />

        <textarea
          placeholder="Any special requests? (Ocean view, dietary needs, flight class...)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{
            ...inputStyle,
            gridColumn: "1 / -1",
            minHeight: "120px",
            resize: "vertical",
          }}
        />

        <label
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            color: "#cbd5e1",
          }}
        >
          <input
            type="checkbox"
            checked={form.flexible}
            onChange={(e) => setForm({ ...form, flexible: e.target.checked })}
            style={{ width: "20px", height: "20px", accentColor: "#4ade80" }}
          />
          My dates are flexible (+/- 3 days)
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...btnStyle,
            opacity: loading ? 0.6 : 1,
            pointerEvents: loading ? "none" : "auto",
          }}
        >
          {loading ? "SENDING REQUEST..." : "SUBMIT TRAVEL INQUIRY"}
        </button>
      </form>
    </div>
  );
}

// ✨ Styles
const inputStyle = {
  padding: "16px",
  borderRadius: "12px",
  background: "rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
  width: "100%",
  fontSize: "1rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, background 0.2s",
  colorScheme: "dark",
};

const labelStyle = {
  fontSize: "0.8rem",
  color: "#94a3b8",
  marginBottom: "8px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const labelGroup = { display: "flex", flexDirection: "column" };

const btnStyle = {
  gridColumn: "1 / -1",
  padding: "20px",
  background: "#4ade80",
  color: "#064e3b",
  fontWeight: "900",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  fontSize: "1.1rem",
  letterSpacing: "1px",
  marginTop: "20px",
  transition: "transform 0.1s, opacity 0.2s",
};