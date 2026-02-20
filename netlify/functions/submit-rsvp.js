// ==========================================================
// FILE: submit-rsvp.js — RSVP Submission + Email Notifications
// Location: netlify/functions/submit-rsvp.js
//
// Called by the public RSVPPage.jsx
// 1. Saves RSVP to Supabase
// 2. Sends confirmation email to guest
// 3. Sends notification email to admin
// ==========================================================

const { supabase, respond } = require("./utils");
const {
  sendEmail,
  ADMIN_EMAIL,
  rsvpGuestEmail,
  rsvpAdminEmail,
} = require("./email-utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  try {
    const payload = JSON.parse(event.body || "{}");

    if (!payload.name) return respond(400, { error: "Name is required" });
    if (!payload.email) return respond(400, { error: "Email is required" });

    const slug = payload.slug || "";
    const guests = parseInt(payload.guests, 10) || 1;

    // ── 1. Look up the event by slug ──────────────────
    let eventData = null;
    if (slug) {
      const { data: evt } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();
      eventData = evt;
    }

    // ── 2. Save RSVP to Supabase ─────────────────────
    const rsvpRecord = {
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone || "",
      guests: guests,
      message: payload.message || "",
      event_slug: slug,
      event_id: payload.event_id || eventData?.id || null,
      status: "Confirmed",
    };

    const { data: rsvp, error: rsvpErr } = await supabase
      .from("rsvps")
      .insert([rsvpRecord])
      .select()
      .single();

    if (rsvpErr) {
      console.error("RSVP insert error:", rsvpErr.message);
      return respond(500, { error: "Failed to save RSVP: " + rsvpErr.message });
    }

    // ── 3. Send confirmation email to guest ───────────
    const eventTitle = eventData?.title || payload.eventTitle || "Event";
    const hostName = eventData?.host_name || "";

    console.log("Sending guest confirmation to:", payload.email.trim());
    try {
      const guestResult = await sendEmail({
        to: payload.email.trim(),
        subject: `You're confirmed! — ${eventTitle}`,
        html: rsvpGuestEmail({
          guestName: payload.name.trim(),
          eventTitle,
          eventDate: eventData?.date || "",
          eventTime: eventData?.time || "",
          eventLocation: eventData?.location || "",
          guests,
          hostName,
        }),
      });
      console.log("Guest email result:", JSON.stringify(guestResult));
    } catch (emailErr) {
      console.error("Guest email failed:", emailErr.message);
    }

    // ── 4. Send notification email to admin ───────────
    console.log("Sending admin notification to:", ADMIN_EMAIL);
    try {
      const adminResult = await sendEmail({
        to: [ADMIN_EMAIL, "chjeffers20@gmail.com"],
        subject: `New RSVP: ${payload.name.trim()} — ${eventTitle}`,
        html: rsvpAdminEmail({
          guestName: payload.name.trim(),
          guestEmail: payload.email.trim(),
          guestPhone: payload.phone || "",
          eventTitle,
          guests,
          message: payload.message || "",
        }),
      });
      console.log("Admin email result:", JSON.stringify(adminResult));
    } catch (emailErr) {
      console.error("Admin email failed:", emailErr.message);
    }

    // ── 5. Return success ─────────────────────────────
    return respond(200, {
      success: true,
      id: rsvp?.id,
      message: "RSVP submitted successfully",
    });

  } catch (err) {
    console.error("submit-rsvp error:", err.message);
    return respond(500, { error: "Failed to submit RSVP: " + err.message });
  }
};