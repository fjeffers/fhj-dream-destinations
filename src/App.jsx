// ==========================================================
// FILE: App.jsx  (UPDATED — Added appointments admin route)
// Location: src/App.jsx
// ==========================================================

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./AppShell.jsx";
import { ToastProvider } from "./components/FHJ/FHJToast.jsx";
import { AuthProvider } from "./lib/providers/AuthProvider.jsx";
import { ThemeProvider } from "./lib/providers/ThemeProvider.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Appointments from "./pages/Appointments.jsx";
import AppointmentPage from "./pages/AppointmentPage.jsx";
import About from "./pages/About.jsx";
import DealDetails from "./pages/DealDetails.jsx";
import ClientPortal from "./pages/ClientPortal.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminClients from "./pages/AdminClients.jsx";
import AdminDeals from "./pages/AdminDeals.jsx";
import AdminMagic from "./pages/AdminMagic.jsx";
import AdminTrips from "./pages/AdminTrips.jsx";
import AdminEvents from "./pages/AdminEvents.jsx";
import AdminBookings from "./pages/AdminBookings.jsx";
import AdminConcierge from "./pages/AdminConcierge.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";
import AdminDocuments from "./pages/AdminDocuments.jsx";
import AdminActivity from "./pages/AdminActivity.jsx";
import AdminAuditLog from "./pages/AdminAuditLog.jsx";
import AdminSearch from "./pages/AdminSearch.jsx";
import AdminAvailability from "./pages/AdminAvailability.jsx";
import AdminCalendar from "./pages/AdminCalendar.jsx";
import AdminRSVPs from "./pages/AdminRSVPs.jsx";
import AdminAbout from "./pages/AdminAbout.jsx";
import BookingIntake from "./pages/BookingIntake.jsx";
import ClientTimeline from "./pages/ClientTimeline.jsx";
import Booking from "./pages/Booking.jsx";

// Components used as pages
import EventPage from "./components/EventPage.jsx";
import RSVPPage from "./components/RSVPPage.jsx";

export default function App() {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem("fhj_admin");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleLogin = (data) => {
    setAdmin(data);
    localStorage.setItem("fhj_admin", JSON.stringify(data));
    if (data && data.token) {
      localStorage.setItem("fhj_admin_token", data.token);
    }
  };

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem("fhj_admin");
    localStorage.removeItem("fhj_admin_token");
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public routes with nav shell */}
              <Route element={<AppShell />}>
                <Route path="/" element={<Home />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/appointment" element={<AppointmentPage />} />
                <Route path="/book" element={<Navigate to="/appointment" replace />} />
                <Route path="/about" element={<About />} />
                <Route path="/deal/:id" element={<DealDetails />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/intake" element={<BookingIntake />} />
                <Route path="/client/login" element={<ClientPortal />} />
                <Route path="/client/portal" element={<ClientPortal />} />
                <Route path="/client/timeline" element={<ClientTimeline />} />
                <Route path="/event/:slug" element={<EventPage />} />
                <Route path="/rsvp/:slug" element={<RSVPPage />} />
              </Route>

              {/* Admin auth pages (no sidebar) */}
              <Route
                path="/admin/login"
                element={
                  admin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLogin={handleLogin} />
                }
              />
              <Route path="/admin/magic" element={<AdminMagic onLogin={handleLogin} />} />

              {/* Protected admin routes with sidebar layout */}
              <Route
                path="/admin"
                element={
                  admin ? <AdminLayout admin={admin} onLogout={handleLogout} /> : <Navigate to="/admin/login" replace />
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard admin={admin} />} />
                <Route path="clients" element={<AdminClients admin={admin} />} />
                <Route path="deals" element={<AdminDeals admin={admin} />} />
                <Route path="trips" element={<AdminTrips admin={admin} />} />
                <Route path="events" element={<AdminEvents admin={admin} />} />
                <Route path="rsvps" element={<AdminRSVPs admin={admin} />} />

                {/* Keep existing bookings route */}
                <Route path="bookings" element={<AdminBookings admin={admin} />} />

                {/* appointments route renders the calendar view */}
                <Route path="appointments" element={<AdminCalendar admin={admin} />} />

                <Route path="concierge" element={<AdminConcierge admin={admin} />} />
                <Route path="documents" element={<AdminDocuments admin={admin} />} />
                <Route path="about" element={<AdminAbout admin={admin} />} />
                <Route path="settings" element={<AdminSettings admin={admin} />} />
                <Route path="activity" element={<AdminActivity admin={admin} />} />
                <Route path="audit" element={<AdminAuditLog admin={admin} />} />
                <Route path="search" element={<AdminSearch admin={admin} />} />
                <Route path="availability" element={<AdminAvailability admin={admin} />} />
                <Route path="calendar" element={<AdminCalendar admin={admin} />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
