// ==========================================================
// 📄 FILE: BookingIntake.jsx  (PHASE 2 — REFACTORED)
// Now uses FHJBookingForm instead of duplicating form logic.
// Location: src/pages/BookingIntake.jsx
// ==========================================================

import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import FHJBackground from "../components/FHJ/FHJBackground.jsx";
import FHJBookingForm from "../components/FHJ/FHJBookingForm.jsx";

export default function BookingIntake() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dealName = searchParams.get("deal") || "";

  return (
    <FHJBackground page="book">
      <div style={containerStyle}>
        <FHJBookingForm
          variant="full"
          initialData={dealName ? { dealName } : null}
          endpoint="/.netlify/functions/public-book-trip"
          onSuccess={() => {
            // Navigate home after 4 seconds
            setTimeout(() => navigate("/"), 4000);
          }}
        />
      </div>
    </FHJBackground>
  );
}

const containerStyle = {
  paddingTop: "140px",
  paddingBottom: "60px",
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
};
