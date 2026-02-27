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
    const normalizedEmail = email.trim().toLowerCase();

    // ── 1. Check if returning client ─────────────────
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    const isReturning = !!existing;
    const duration_minutes = isReturning ? 30 : 60;

    // ── 2. Insert booking record ──────────────────────
    const bookingRecord = {
      client_name:     name.trim(),
      client_email:    normalizedEmail,
      client_phone:    phone || "",
      date:            date,
      time:            time,
      duration_minutes,
      is_returning:    isReturning,
      status:          "Pending",
      reason:          reason || "new-trip",
      type:            reason || "new-trip",
      trip_type:       tripType || "Individual",
      occasion:        occasion || "General",
      group_size:      groupSize ? parseInt(groupSize) : 1,
      budget_range:    budget || null,
      flexible_dates:  flexibleDates === true || flexibleDates === "true",
      vacation_start:  vacationStart || null,
      vacation_end:    vacationEnd || null,
      notes:           notes || null,
      destination:     destination || null,
    };

    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert([bookingRecord])
      .select()
      .single();

    if (bookingErr) {
      console.error("Booking insert error:", bookingErr.message);
      return respond(500, { error: "Failed to book: " + bookingErr.message });
    }

    console.log("Booking saved:", booking?.id);

    // ── 3. Build trip record (new clients only) ───────
    if (!isReturning) {
      const noteParts = [
        reason ? `Purpose: ${reasonLabel}` : "",
        `Appointment: ${date} at ${time}`,
        budget ? `Budget: ${budget}` : "",
        vacationStart ? `Vacation: ${vacationStart}${vacationEnd ? ` to ${vacationEnd}` : ""}` : "",
        notes || "",
      ].filter(Boolean).join("\n");

      const tripRecord = {
        client: name.trim(),
        client_email: normalizedEmail,
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
        console.warn("Trip insert error (new client flow):", tripErr.message);
      } else {
        console.log("Trip saved:", trip?.id);
      }
    }

    // ── 4. Upsert client record ───────────────────────
    let clientId = existing?.id;
    try {
      if (!existing) {
        const { data: newClient, error: clientInsertErr } = await supabase.from("clients").insert([{
          full_name: name.trim(),
          email: normalizedEmail,
          phone: phone || "",
          status: "Active",
        }]).select().single();
        if (clientInsertErr) {
          console.warn("Client insert error:", clientInsertErr.message);
        } else {
          clientId = newClient?.id;
          console.log("New client created:", name);
        }
      } else {
        await supabase.from("clients").update({ is_returning: true }).eq("id", existing.id);
      }
    } catch (clientErr) {
      console.warn("Client upsert failed:", clientErr.message);
    }

    // ── 5. Link booking to client ─────────────────────
    if (clientId && booking?.id) {
      const { error: linkErr } = await supabase.from("bookings").update({ client_id: clientId }).eq("id", booking.id);
      if (linkErr) {
        console.warn("Failed to link booking to client:", linkErr.message);
      }
    }

    // ── 6. Send email notifications ───────────────────
    // Confirmation to client
    console.log("Sending client confirmation to:", normalizedEmail);
    try {
      const clientResult = await sendEmail({
        to: normalizedEmail,
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
          clientEmail: normalizedEmail,
          clientPhone: phone || "",
          date,
          time,
          reason: reason || "new-trip",
          destination: destination || "",
          notes: notes || "",
          isReturning,
          duration_minutes,
        }),
      });
      console.log("Admin email result:", JSON.stringify(adminResult));
    } catch (emailErr) {
      console.warn("Admin email failed:", emailErr.message);
    }

    // ── 7. Return success ────────────────────────────
    return respond(200, { success: true, bookingId: booking?.id, isReturning });

  } catch (err) {
    console.error("appointment-book error:", err.message);
    return respond(500, { error: "Failed to book.", detail: err.message });
  }
};