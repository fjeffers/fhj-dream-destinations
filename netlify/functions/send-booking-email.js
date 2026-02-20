// ==========================================================
// FILE: send-booking-email.js — Appointment Email Notifications
// Location: netlify/functions/send-booking-email.js
//
// Called after an appointment/trip is booked
// Sends confirmation to client + notification to admin
//
// POST body:
//   { clientName, clientEmail, clientPhone, date, time,
//     reason, destination, notes }
// ==========================================================

const { respond } = require("./utils");
const {
  sendEmail,
  ADMIN_EMAIL,
  appointmentClientEmail,
  appointmentAdminEmail,
} = require("./email-utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  try {
    const payload = JSON.parse(event.body || "{}");

    if (!payload.clientName || !payload.clientEmail) {
      return respond(400, { error: "clientName and clientEmail are required" });
    }

    const {
      clientName,
      clientEmail,
      clientPhone,
      date,
      time,
      reason,
      destination,
      notes,
    } = payload;

    const reasonLabel = {
      "new-trip": "New Trip",
      "update-trip": "Trip Update",
      "payment": "Payment",
      "consultation": "Consultation",
    }[reason] || reason || "Appointment";

    const results = { clientEmail: null, adminEmail: null };

    // ── 1. Send confirmation to client ────────────────
    try {
      const clientResult = await sendEmail({
        to: clientEmail.trim(),
        subject: `Appointment Confirmed — FHJ Dream Destinations`,
        html: appointmentClientEmail({
          clientName: clientName.trim(),
          date,
          time,
          reason,
          destination,
        }),
      });
      results.clientEmail = clientResult;
    } catch (err) {
      console.error("Client email failed:", err.message);
      results.clientEmail = { success: false, error: err.message };
    }

    // ── 2. Send notification to admin ─────────────────
    try {
      const adminResult = await sendEmail({
        to: [ADMIN_EMAIL, "chjeffers20@gmail.com"],
        subject: `New ${reasonLabel}: ${clientName.trim()}`,
        html: appointmentAdminEmail({
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone || "",
          date,
          time,
          reason,
          destination,
          notes,
        }),
      });
      results.adminEmail = adminResult;
    } catch (err) {
      console.error("Admin email failed:", err.message);
      results.adminEmail = { success: false, error: err.message };
    }

    return respond(200, {
      success: true,
      message: "Notification emails sent",
      results,
    });

  } catch (err) {
    console.error("send-booking-email error:", err.message);
    return respond(500, { error: err.message });
  }
};