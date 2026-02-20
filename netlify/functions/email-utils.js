// ==========================================================
// FILE: email-utils.js — Resend Email Utility
// Location: netlify/functions/email-utils.js
//
// Shared email helper for RSVP + Appointment notifications
// Uses Resend API with beautiful HTML templates
//
// Env var required: RESEND_API_KEY
// ==========================================================

const FROM_EMAIL = "FHJ Dream Destinations <info@fhjdreamdestinations.com>";
const ADMIN_EMAIL = "info@fhjdreamdestinations.com";
const ADMIN_CC = "chjeffers20@gmail.com";

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY env variable");
    return { success: false, error: "Email not configured" };
  }

  const payload = JSON.stringify({
    from: FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  return new Promise((resolve) => {
    const https = require("https");
    const req = https.request(
      {
        hostname: "api.resend.com",
        path: "/emails",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log("Email sent successfully:", data.id);
              resolve({ success: true, id: data.id });
            } else {
              console.error("Resend API error:", res.statusCode, body);
              resolve({ success: false, error: data });
            }
          } catch (err) {
            console.error("Resend parse error:", body);
            resolve({ success: false, error: body });
          }
        });
      }
    );
    req.on("error", (err) => {
      console.error("Email request error:", err.message);
      resolve({ success: false, error: err.message });
    });
    req.write(payload);
    req.end();
  });
}

// ==========================================================
// Email wrapper / base template
// ==========================================================
function emailWrapper(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #0a0e1a; font-family: 'Helvetica Neue', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #111827; }
    .header { background: linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%); padding: 40px 30px; text-align: center; border-bottom: 3px solid #00c48c; }
    .logo-text { color: #00c48c; font-size: 24px; font-weight: 700; letter-spacing: 1px; margin: 0; }
    .logo-sub { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 6px; }
    .body { padding: 35px 30px; }
    .gold-line { width: 50px; height: 2px; background: linear-gradient(90deg, #D4AF37, rgba(212,175,55,0.3)); margin: 0 auto 25px; }
    h2 { color: #ffffff; font-size: 22px; font-weight: 600; margin: 0 0 10px; }
    p { color: rgba(255,255,255,0.65); font-size: 15px; line-height: 1.7; margin: 0 0 15px; }
    .highlight { color: #00c48c; font-weight: 600; }
    .gold { color: #D4AF37; font-weight: 600; }
    .detail-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; width: 120px; min-width: 120px; padding-top: 2px; }
    .detail-value { color: #ffffff; font-size: 14px; font-weight: 500; }
    .cta-btn { display: inline-block; background: #00c48c; color: #0a0e1a; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin: 10px 0; }
    .footer { background: #0a0e1a; padding: 25px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); }
    .footer p { color: rgba(255,255,255,0.25); font-size: 12px; margin: 0; }
    .footer a { color: #00c48c; text-decoration: none; }
    .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 25px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="logo-text">FHJ Dream Destinations</p>
      <p class="logo-sub">Creating Unforgettable Experiences</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>FHJ Dream Destinations</p>
      <p style="margin-top: 6px;"><a href="https://fhjdreamdestinations.com">fhjdreamdestinations.com</a></p>
      <p style="margin-top: 10px; font-size: 11px;">info@fhjdreamdestinations.com</p>
    </div>
  </div>
</body>
</html>`;
}

// ==========================================================
// RSVP: Guest confirmation email
// ==========================================================
function rsvpGuestEmail({ guestName, eventTitle, eventDate, eventTime, eventLocation, guests, hostName }) {
  const dateStr = eventDate ? formatDate(eventDate) : "";
  return emailWrapper(`
    <div class="gold-line"></div>
    <h2>You're Confirmed! ✨</h2>
    <p>Hi <span class="highlight">${guestName}</span>,</p>
    <p>Your RSVP for <span class="gold">${eventTitle}</span> has been received. We're excited to have you join us!</p>

    <div class="detail-card">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Event</td><td style="color: #ffffff; font-size: 14px; font-weight: 500; padding: 8px 0;">${eventTitle}</td></tr>
        ${dateStr ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Date</td><td style="color: #ffffff; font-size: 14px; font-weight: 500; padding: 8px 0;">${dateStr}</td></tr>` : ""}
        ${eventTime ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Time</td><td style="color: #ffffff; font-size: 14px; font-weight: 500; padding: 8px 0;">${eventTime}</td></tr>` : ""}
        ${eventLocation ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Location</td><td style="color: #ffffff; font-size: 14px; font-weight: 500; padding: 8px 0;">${eventLocation}</td></tr>` : ""}
        <tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Guests</td><td style="color: #ffffff; font-size: 14px; font-weight: 500; padding: 8px 0;">${guests || 1}</td></tr>
        ${hostName ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Hosted by</td><td style="color: #D4AF37; font-size: 14px; font-weight: 500; padding: 8px 0;">${hostName}</td></tr>` : ""}
      </table>
    </div>

    <p>If you need to make changes, please reach out to us at <a href="mailto:info@fhjdreamdestinations.com" style="color: #00c48c;">info@fhjdreamdestinations.com</a></p>
    <p style="color: rgba(255,255,255,0.35); font-size: 13px; margin-top: 25px;">We look forward to seeing you there!</p>
  `);
}

// ==========================================================
// RSVP: Admin notification email
// ==========================================================
function rsvpAdminEmail({ guestName, guestEmail, guestPhone, eventTitle, guests, message }) {
  return emailWrapper(`
    <h2>New RSVP Received 🎉</h2>
    <p>A new RSVP has been submitted for <span class="gold">${eventTitle}</span>.</p>

    <div class="detail-card">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Name</td><td style="color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 0;">${guestName}</td></tr>
        <tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Email</td><td style="color: #ffffff; font-size: 14px; padding: 8px 0;"><a href="mailto:${guestEmail}" style="color: #00c48c;">${guestEmail}</a></td></tr>
        ${guestPhone ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Phone</td><td style="color: #ffffff; font-size: 14px; padding: 8px 0;">${guestPhone}</td></tr>` : ""}
        <tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Guests</td><td style="color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 0;">${guests || 1}</td></tr>
        ${message ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Message</td><td style="color: rgba(255,255,255,0.7); font-size: 14px; font-style: italic; padding: 8px 0;">"${message}"</td></tr>` : ""}
      </table>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="https://fhjdreamdestinations.com/admin/events" class="cta-btn">View in Dashboard</a>
    </div>
  `);
}

// ==========================================================
// Appointment: Client confirmation email
// ==========================================================
function appointmentClientEmail({ clientName, date, time, reason, destination }) {
  const dateStr = date ? formatDate(date) : "";
  const reasonLabel = {
    "new-trip": "Book a New Trip",
    "update-trip": "Update Existing Trip",
    "payment": "Make a Payment",
    "consultation": "General Consultation",
  }[reason] || reason || "Consultation";

  return emailWrapper(`
    <div class="gold-line"></div>
    <h2>Appointment Confirmed ✈️</h2>
    <p>Hi <span class="highlight">${clientName}</span>,</p>
    <p>Your appointment with FHJ Dream Destinations has been booked. We look forward to speaking with you!</p>

    <div class="detail-card">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Purpose</td><td style="color: #D4AF37; font-size: 14px; font-weight: 600; padding: 8px 0;">${reasonLabel}</td></tr>
        ${dateStr ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Date</td><td style="color: #ffffff; font-size: 14px; font-weight: 500; padding: 8px 0;">${dateStr}</td></tr>` : ""}
        ${time ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Time</td><td style="color: #ffffff; font-size: 14px; font-weight: 500; padding: 8px 0;">${time}</td></tr>` : ""}
        ${destination ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Destination</td><td style="color: #ffffff; font-size: 14px; font-weight: 500; padding: 8px 0;">${destination}</td></tr>` : ""}
      </table>
    </div>

    <p>If you need to reschedule, please contact us at <a href="mailto:info@fhjdreamdestinations.com" style="color: #00c48c;">info@fhjdreamdestinations.com</a></p>
    <p style="color: rgba(255,255,255,0.35); font-size: 13px; margin-top: 25px;">See you soon!</p>
  `);
}

// ==========================================================
// Appointment: Admin notification email
// ==========================================================
function appointmentAdminEmail({ clientName, clientEmail, clientPhone, date, time, reason, destination, notes }) {
  const reasonLabel = {
    "new-trip": "Book a New Trip",
    "update-trip": "Update Existing Trip",
    "payment": "Make a Payment",
    "consultation": "General Consultation",
  }[reason] || reason || "Consultation";

  const dateStr = date ? formatDate(date) : "";

  return emailWrapper(`
    <h2>New Appointment Booked 📅</h2>
    <p>A new appointment has been scheduled.</p>

    <div class="detail-card">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Client</td><td style="color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 0;">${clientName}</td></tr>
        <tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Email</td><td style="color: #ffffff; font-size: 14px; padding: 8px 0;"><a href="mailto:${clientEmail}" style="color: #00c48c;">${clientEmail}</a></td></tr>
        ${clientPhone ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Phone</td><td style="color: #ffffff; font-size: 14px; padding: 8px 0;">${clientPhone}</td></tr>` : ""}
        <tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Purpose</td><td style="color: #D4AF37; font-size: 14px; font-weight: 600; padding: 8px 0;">${reasonLabel}</td></tr>
        ${dateStr ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Date</td><td style="color: #ffffff; font-size: 14px; font-weight: 500; padding: 8px 0;">${dateStr}</td></tr>` : ""}
        ${time ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Time</td><td style="color: #ffffff; font-size: 14px; font-weight: 500; padding: 8px 0;">${time}</td></tr>` : ""}
        ${destination ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Destination</td><td style="color: #ffffff; font-size: 14px; font-weight: 500; padding: 8px 0;">${destination}</td></tr>` : ""}
        ${notes ? `<tr><td style="color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 0; width: 120px;">Notes</td><td style="color: rgba(255,255,255,0.7); font-size: 14px; font-style: italic; padding: 8px 0;">"${notes}"</td></tr>` : ""}
      </table>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="https://fhjdreamdestinations.com/admin/calendar" class="cta-btn">View Calendar</a>
    </div>
  `);
}

// ==========================================================
// Helpers
// ==========================================================
function formatDate(dateStr) {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  } catch { return dateStr; }
}

module.exports = {
  sendEmail,
  ADMIN_EMAIL,
  rsvpGuestEmail,
  rsvpAdminEmail,
  appointmentClientEmail,
  appointmentAdminEmail,
};