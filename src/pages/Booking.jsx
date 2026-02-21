// src/pages/Booking.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FHJCard, FHJButton, fhjTheme } from "../components/FHJ/FHJUIKit.jsx";
import { motion } from "framer-motion";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [loadingDeal, setLoadingDeal] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    tripType: "Individual",
    occasion: "Vacation",
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
    budgetPerPerson: "",
    notes: "",
    flexibleDates: false,
  });

  useEffect(() => {
    async function loadDeal() {
      try {
        const res = await fetch("/.netlify/functions/get-deals");
        const data = await res.json();
        const deals = data.deals || [];
        const found = deals.find((d) => d.id === id);
        if (found) {
          setDeal(found);
          setForm((prev) => ({
            ...prev,
            destination: found.tripName || "",
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDeal(false);
      }
    }
    loadDeal();
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/.netlify/functions/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: id,
          dealName: deal?.tripName || "",
          ...form,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit booking");
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong submitting your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDeal) {
    return (
      <p style={{ padding: "2rem", color: "white", textAlign: "center" }}>
        Loading trip details...
      </p>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #04101f 0, #02040a 45%, #000 100%)",
        padding: "3rem 1.5rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <FHJCard
        style={{
          maxWidth: "900px",
          width: "100%",
          padding: "2rem",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(14px)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "1.8rem" }}>Design Your Journey</h1>
            <p style={{ opacity: 0.8, marginTop: "0.25rem" }}>
              Tell us about your dream trip and we'll handle the rest.
            </p>
            {deal && (
              <p style={{ marginTop: "0.5rem", opacity: 0.9 }}>
                You're inquiring about:{" "}
                <span style={{ color: fhjTheme.primary, fontWeight: 600 }}>
                  {deal.tripName}
                </span>
              </p>
            )}
          </div>

          <img
            src="/fhj-logo.png"
            alt="FHJ Dream Destinations"
            style={{ height: "56px", borderRadius: "8px" }}
          />
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>Thank you, {form.fullName || "traveler"}!</h2>
            <p style={{ opacity: 0.85, marginTop: "0.5rem" }}>
              Your trip inquiry has been received. Our concierge will reach out to{" "}
              <strong>{form.email}</strong> with next steps.
            </p>
            <FHJButton
              style={{ marginTop: "1.5rem" }}
              onClick={() => navigate("/")}
            >
              Back to Home
            </FHJButton>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: "#ffb3b3", marginBottom: "1rem" }}>{error}</p>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {/* Left column */}
              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  style={inputStyle}
                />

                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  style={inputStyle}
                />

                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  style={inputStyle}
                />

                <label style={labelStyle}>Home City / Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  style={inputStyle}
                />

                <label style={labelStyle}>Destination</label>
                <input
                  type="text"
                  required
                  value={form.destination}
                  onChange={(e) => handleChange("destination", e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Right column */}
              <div>
                <label>Trip Type</label>
                <select
                  value={form.tripType}
                  onChange={(e) => handleChange("tripType", e.target.value)}
                  style={inputStyle}
                >
                  <option>Individual</option>
                  <option>Couple</option>
                  <option>Group</option>
                </select>

                <label style={labelStyle}>Occasion</label>
                <select
                  value={form.occasion}
                  onChange={(e) => handleChange("occasion", e.target.value)}
                  style={inputStyle}
                >
                  <option>Vacation</option>
                  <option>Honeymoon</option>
                  <option>Anniversary</option>
                  <option>Birthday</option>
                  <option>Family Trip</option>
                  <option>Other</option>
                </select>

                <label style={labelStyle}>Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  style={inputStyle}
                />

                <label style={labelStyle}>End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  style={inputStyle}
                />

                <label style={labelStyle}>Number of Travelers</label>
                <input
                  type="number"
                  min={1}
                  value={form.travelers}
                  onChange={(e) =>
                    handleChange("travelers", Number(e.target.value) || 1)
                  }
                  style={inputStyle}
                />

                <label style={labelStyle}>Estimated Budget per Person</label>
                <input
                  type="text"
                  value={form.budgetPerPerson}
                  onChange={(e) =>
                    handleChange("budgetPerPerson", e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            <label style={{ ...labelStyle, marginTop: "1.25rem" }}>
              Special Requests
            </label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Ocean view, dietary needs, flight class..."
            />

            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.flexibleDates}
                  onChange={(e) =>
                    handleChange("flexibleDates", e.target.checked)
                  }
                />
                <span>My dates are flexible (+/- 3 days)</span>
              </label>
            </div>

            <FHJButton
              type="submit"
              disabled={submitting}
              style={{
                marginTop: "1.75rem",
                padding: "0.9rem 2rem",
                fontSize: "1rem",
                borderRadius: "999px",
              }}
            >
              {submitting ? "Submitting..." : "Submit Trip Request"}
            </FHJButton>
          </form>
        )}
      </FHJCard>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.35)",
  color: "white",
  marginTop: "0.25rem",
};

const labelStyle = {
  display: "block",
  marginTop: "0.75rem",
};
