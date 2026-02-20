// ==========================================================
// FILE: appointment-book.js — Book Appointment (Supabase)
// Location: netlify/functions/appointment-book.js
//
// Handles both full intake (new client/new trip) and
// light forms (update-trip, payment, consultation)
// Saves to Supabase trips + clients tables
// Sends email notifications via email-utils
// ==========================================================

const { supabase, respond } = require("./utils");
const {
  sendEmail,
  ADMIN_EMAIL,
  appointmentClientEmail,
  appointmentAdminEmail,
} = require("./email-utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return respond(400, { error: "Invalid request body" });
  }

  const {
    name, email, phone,
    date, time, reason,
    destination, tripType, occasion,
    groupSize, flexibleDates, budget,
    vacationStart, vacationEnd, notes,
  } = body;

  if (!name || !email || !date || !time) {
    return respond(400, { error: "Name, email, date, and time are required." });
  }

  // Reason label for display
  const reasonLabels = {
    "new-trip": "New Trip",
    "update-trip": "Trip Update",
    "payment": "Payment",
    "consultation": "Consultation",
  };
  const reasonLabel = reasonLabels[reason] || "New Request";

  try {
    // ── 1. Build trip record ─────────────────────────
    const noteParts = [
      reason ? `Purpose: ${reasonLabel}` : "",
      `Appointment: ${date} at ${time}`,
      budget ? `Budget: ${budget}` : "",
      vacationStart ? `Vacation: ${vacationStart}${vacationEnd ? ` to ${vacationEnd}` : ""}` : "",
      notes || "",
    ].filter(Boolean).join("\n");

    const tripRecord = {
      client: name.trim(),
      client_email: email.trim(),
      phone: phone || "",
      start_date: vacationStart || date,
      end_date: vacationEnd || null,
      consultation_time: time,
      consultation_date: date,
      destination: destination || "TBD — Consultation Requested",
      trip_type: tripType || (reason === "payment" ? "Payment" : reason === "update-trip" ? "Trip Update" : "Individual"),
      status: reason === "payment" ? "Payment Scheduled" : reason === "update-trip" ? "Update Requested" : "🆕 New Request",
      occasion: occasion || "General",
      flexible_dates: flexibleDates === true || flexibleDates === "true",
      group_size: groupSize ? parseInt(groupSize) : 1,
      notes: noteParts,
    };

    // Remove null fields
    Object.keys(tripRecord).forEach(k => {
      if (tripRecord[k] === null || tripRecord[k] === undefined) delete tripRecord[k];
    });

    console.log("Saving trip to Supabase:", JSON.stringify({ client: tripRecord.client, date, time, reason }));

    const { data: trip, error: tripErr } = await supabase
      .from("trips")
      .insert([tripRecord])
      .select()
      .single();

    if (tripErr) {
      console.error("Trip insert error:", tripErr.message);
      return respond(500, { error: "Failed to book: " + tripErr.message });
    }

    console.log("Trip saved:", trip?.id);

    // ── 2. Upsert client record ──────────────────────
    try {
      const { data: existing } = await supabase
        .from("clients")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (!existing) {
        await supabase.from("clients").insert([{
          full_name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone || "",
          status: "Active",
        }]);
        console.log("New client created:", name);
      }
    } catch (clientErr) {
      console.warn("Client upsert failed:", clientErr.message);
    }

    // ── 3. Send email notifications ──────────────────
    // Confirmation to client
    console.log("Sending client confirmation to:", email.trim());
    try {
      const clientResult = await sendEmail({
        to: email.trim(),
        subject: `Appointment Confirmed — FHJ Dream Destinations`,
        html: appointmentClientEmail({
          clientName: name.trim(),
          date,
          time,
          reason: reason || "new-trip",
          destination: destination || "",
        }),
      });
      console.log("Client email result:", JSON.stringify(clientResult));
    } catch (emailErr) {
      console.warn("Client email failed:", emailErr.message);
    }

    // Notification to admin
    console.log("Sending admin notification");
    try {
      const adminResult = await sendEmail({
        to: [ADMIN_EMAIL, "chjeffers20@gmail.com"],
        subject: `New ${reasonLabel}: ${name.trim()} — ${date} at ${time}`,
        html: appointmentAdminEmail({
          clientName: name.trim(),
          clientEmail: email.trim(),
          clientPhone: phone || "",
          date,
          time,
          reason: reason || "new-trip",
          destination: destination || "",
          notes: notes || "",
        }),
      });
      console.log("Admin email result:", JSON.stringify(adminResult));
    } catch (emailErr) {
      console.warn("Admin email failed:", emailErr.message);
    }

    // ── 4. Return success ────────────────────────────
    return respond(200, { success: true, tripId: trip?.id });

  } catch (err) {
    console.error("appointment-book error:", err.message);
    return respond(500, { error: "Failed to book.", detail: err.message });
  }
};