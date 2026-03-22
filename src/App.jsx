import React, { lazy, Suspense, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./AppShell.jsx";
import { ToastProvider } from "./components/FHJ/FHJToast.jsx";
import { AuthProvider } from "./lib/providers/AuthProvider.jsx";
import { ThemeProvider } from "./lib/providers/ThemeProvider.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

// Lazy load ALL pages — only download the code when the route is visited
const Home = lazy(() => import("./pages/Home.jsx"));
const Appointments = lazy(() => import("./pages/Appointments.jsx"));
const AppointmentPage = lazy(() => import("./pages/AppointmentPage.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const DealDetails = lazy(() => import("./pages/DealDetails.jsx"));
const ClientPortal = lazy(() => import("./pages/ClientPortal.jsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const AdminClients = lazy(() => import("./pages/AdminClients.jsx"));
const AdminDeals = lazy(() => import("./pages/AdminDeals.jsx"));
const AdminMagic = lazy(() => import("./pages/AdminMagic.jsx"));
const AdminTrips = lazy(() => import("./pages/AdminTrips.jsx"));
const AdminGroupTrips = lazy(() => import("./pages/AdminGroupTrips.jsx"));
const AdminEvents = lazy(() => import("./pages/AdminEvents.jsx"));
const AdminBookings = lazy(() => import("./pages/AdminBookings.jsx"));
const AdminConcierge = lazy(() => import("./pages/AdminConcierge.jsx"));
const AdminSettings = lazy(() => import("./pages/AdminSettings.jsx"));
const AdminDocuments = lazy(() => import("./pages/AdminDocuments.jsx"));
const AdminActivity = lazy(() => import("./pages/AdminActivity.jsx"));
const AdminAuditLog = lazy(() => import("./pages/AdminAuditLog.jsx"));
const AdminSearch = lazy(() => import("./pages/AdminSearch.jsx"));
const AdminAvailability = lazy(() => import("./pages/AdminAvailability.jsx"));
const AdminCalendar = lazy(() => import("./pages/AdminCalendar.jsx"));
const AdminRSVPs = lazy(() => import("./pages/AdminRSVPs.jsx"));
const AdminAbout = lazy(() => import("./pages/AdminAbout.jsx"));
const BookingIntake = lazy(() => import("./pages/BookingIntake.jsx"));
const ClientTimeline = lazy(() => import("./pages/ClientTimeline.jsx"));
const Booking = lazy(() => import("./pages/Booking.jsx"));
const EventPage = lazy(() => import("./components/EventPage.jsx"));
const RSVPPage = lazy(() => import("./components/RSVPPage.jsx"));

const PageLoader = () => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", background: "linear-gradient(135deg, #0a0e1a 0%, #0f172a 50%, #0a0e1a 100%)",
    gap: "1.5rem",
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: "50%",
      border: "3px solid rgba(255,255,255,0.08)",
      borderTopColor: "#00c48c",
      animation: "fhj-spin 0.7s linear infinite",
    }} />
    <p style={{
      color: "rgba(255,255,255,0.4)",
      fontSize: "0.9rem",
      fontWeight: 500,
      letterSpacing: "0.05em",
      margin: 0,
    }}>
      Preparing your FHJ experience…
    </p>
    <style>{`@keyframes fhj-spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

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
  };

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem("fhj_admin");
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
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
                <Route path="group-trips" element={<AdminGroupTrips admin={admin} />} />
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
            </Suspense>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
