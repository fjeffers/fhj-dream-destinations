// src/pages/AdminAppointments.jsx
// Minimal admin page to host the calendar. Adjust layout to your app's routing/layout.

import React from "react";
import AdminCalendar from "../components/AdminCalendar.jsx";

export default function AdminAppointments() {
  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ padding: "1.25rem", marginBottom: "1rem", borderRadius: 12, background: "rgba(20,20,20,0.6)" }}>
        <h2 style={{ margin: 0, color: "#fff" }}>Appointments</h2>
        <p style={{ color: "#d1d5db" }}>Manage bookings and blocked slots. Admin times displayed in EST.</p>
      </div>
      <AdminCalendar />
    </div>
  );
}
