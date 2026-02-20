// ==========================================================
// 📄 FILE: appointment-book.js  (WITH EMAIL)
// ⭐ Creates Trip + Concierge + sends Resend emails
//    → Admin notification to info@fhjdreamdestinations.com
//    → Client confirmation email
// Location: netlify/functions/appointment-book.js
// ==========================================================

const { createRecord, respond } = require("./utils");
const { withFHJ } = require("./middleware");

const ADMIN_EMAIL = "info@fhjdreamdestinations.com";
const FROM_EMAIL = "FHJ Dream Destinations <notifications@fhjdreamdestinations.com>";

exports.handler = withFHJ(async (event) => {
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  const body = JSON.parse(event.body || "{}");
  const {
    name, email, phone, date, time, tripType,
    destination, occasion, groupSize, flexibleDates,
    budget, notes,
  } = body;

  if (!name || !email || !date || !time) {
    return respond(400, { error: "Name, email, date, and time are required." });
  }

  try {
    // 1. Create Trip record
    const tripFields = {
      Client: name,
      Client_email: email,
      Phone: phone || "",
      "Start Date": date,
      Status: "🆕 New Request",
      "Trip Type": tripType || "Individual",
      Destination: destination || "TBD — Consultation Requested",
      Occasion: occasion || "General",
      "Group Size": groupSize ? parseInt(groupSize) : 1,
      "Flexible Dates": flexibleDates === true || flexibleDates === "true" ? "Yes" : "No",
      "Budget Range": budget || "",
      Notes: `📅 Appointment: ${date} at ${time}\n${notes || ""}`.trim(),
    };

    const trip = await createRecord("Trips", tripFields);

    // 2. Create Concierge message
    await createRecord("Concierge", {
      Name: name,
      Email: email,
      Message: `New appointment request from ${name} for ${date} at ${time}. ${
        destination ? `Interested in: ${destination}.` : ""
      } ${tripType ? `Trip type: ${tripType}.` : ""} ${
        notes ? `Notes: ${notes}` : ""
      }`.trim(),
      Source: "Appointment Calendar",
      Status: "New",
      Context: `Phone: ${phone || "N/A"} | Group: ${groupSize || 1} | Budget: ${budget || "Not specified"} | Occasion: ${occasion || "General"}`,
    });

    // 3. Send emails via Resend (non-blocking — don't fail appointment if email fails)
    const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });

    await Promise.allSettled([
      sendAdminNotification({ name, email, phone, formattedDate, time, tripType, destination, occasion, groupSize, budget, flexibleDates, notes }),
      sendClientConfirmation({ name, email, formattedDate, time, destination }),
    ]);

    return respond(200, {
      success: true,
      message: "Appointment request submitted! We'll confirm within 24 hours.",
      tripId: trip?.id || null,
    });

  } catch (err) {
    console.error("Appointment booking error:", err);
    return respond(500, { error: "Failed to book appointment. Please try again." });
  }
});

// =============================================================
// EMAIL: Admin Notification
// =============================================================
async function sendAdminNotification(data) {
  const { name, email, phone, formattedDate, time, tripType, destination, occasion, groupSize, budget, flexibleDates, notes } = data;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e7eb; border-radius: 16px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #00c48c, #00a67c); padding: 28px 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px;">
          🆕 New Appointment Request
        </h1>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <p style="color: #94a3b8; margin: 0 0 24px; font-size: 15px;">
          A new consultation has been booked through the website.
        </p>

        <!-- Client Info Card -->
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #00c48c; margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;">Client Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 130px;">Name</td><td style="padding: 6px 0; color: white; font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0; color: white;"><a href="mailto:${email}" style="color: #60a5fa; text-decoration: none;">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding: 6px 0; color: #64748b;">Phone</td><td style="padding: 6px 0; color: white;"><a href="tel:${phone}" style="color: #60a5fa; text-decoration: none;">${phone}</a></td></tr>` : ""}
          </table>
        </div>

        <!-- Appointment Info Card -->
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #D4AF37; margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;">Appointment</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 130px;">Date</td><td style="padding: 6px 0; color: white; font-weight: 600;">${formattedDate}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Time</td><td style="padding: 6px 0; color: white; font-weight: 600;">${time}</td></tr>
            ${destination ? `<tr><td style="padding: 6px 0; color: #64748b;">Destination</td><td style="padding: 6px 0; color: white;">${destination}</td></tr>` : ""}
            <tr><td style="padding: 6px 0; color: #64748b;">Trip Type</td><td style="padding: 6px 0; color: white;">${tripType || "Individual"}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Occasion</td><td style="padding: 6px 0; color: white;">${occasion || "General"}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Group Size</td><td style="padding: 6px 0; color: white;">${groupSize || 1}</td></tr>
            ${budget ? `<tr><td style="padding: 6px 0; color: #64748b;">Budget</td><td style="padding: 6px 0; color: white;">${budget}</td></tr>` : ""}
            <tr><td style="padding: 6px 0; color: #64748b;">Flexible Dates</td><td style="padding: 6px 0; color: white;">${flexibleDates ? "Yes" : "No"}</td></tr>
          </table>
        </div>

        ${notes ? `
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #94a3b8; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;">Notes</h2>
          <p style="color: #e5e7eb; margin: 0; line-height: 1.6;">${notes}</p>
        </div>
        ` : ""}

        <!-- CTA -->
        <div style="text-align: center; margin-top: 28px;">
          <a href="https://fhjdreamdestinations.com/admin" style="display: inline-block; background: #00c48c; color: #000; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
            Open Admin Dashboard →
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
        <p style="color: #475569; margin: 0; font-size: 12px;">
          FHJ Dream Destinations · Automated notification
        </p>
      </div>
    </div>
  `;

  return sendResendEmail({
    to: ADMIN_EMAIL,
    subject: `🆕 New Appointment: ${name} — ${formattedDate} at ${time}`,
    html,
  });
}

// =============================================================
// EMAIL: Client Confirmation
// =============================================================
async function sendClientConfirmation(data) {
  const { name, email, formattedDate, time, destination } = data;
  const firstName = name.split(" ")[0];

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e7eb; border-radius: 16px; overflow: hidden;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #00c48c, #00a67c); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0 0 4px; font-size: 24px; font-weight: 300;">
          FHJ <span style="font-weight: 700;">Dream Destinations</span>
        </h1>
        <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">
          Travel, Reimagined
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 36px 32px;">
        <h2 style="color: white; font-weight: 400; margin: 0 0 16px; font-size: 22px;">
          Thank you, ${firstName}!
        </h2>
        <p style="color: #94a3b8; line-height: 1.7; margin: 0 0 28px;">
          Your consultation has been requested and our team has been notified. We'll reach out within 24 hours to confirm your appointment.
        </p>

        <!-- Appointment Summary -->
        <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 28px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">📅 Date</td>
              <td style="padding: 8px 0; color: white; font-weight: 600; text-align: right;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">🕐 Time</td>
              <td style="padding: 8px 0; color: white; font-weight: 600; text-align: right;">${time}</td>
            </tr>
            ${destination ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">✈️ Interest</td>
              <td style="padding: 8px 0; color: white; font-weight: 600; text-align: right;">${destination}</td>
            </tr>
            ` : ""}
          </table>
        </div>

        <p style="color: #94a3b8; line-height: 1.7; margin: 0 0 8px; font-size: 14px;">
          In the meantime, feel free to browse our 
          <a href="https://fhjdreamdestinations.com" style="color: #00c48c; text-decoration: none;">featured deals</a> 
          or message us anytime through our concierge chat.
        </p>
      </div>

      <!-- Footer -->
      <div style="padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
        <p style="color: #475569; margin: 0 0 4px; font-size: 12px;">
          FHJ Dream Destinations
        </p>
        <p style="color: #334155; margin: 0; font-size: 11px;">
          Questions? Reply to this email or use our concierge chat.
        </p>
      </div>
    </div>
  `;

  return sendResendEmail({
    to: email,
    subject: `Your appointment with FHJ Dream Destinations — ${formattedDate}`,
    html,
  });
}

// =============================================================
// RESEND API HELPER
// =============================================================
async function sendResendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return null;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
    } else {
      console.log(`Email sent to ${to}: ${data.id}`);
    }
    return data;
  } catch (err) {
    console.error("Resend send failed:", err);
    return null;
  }
}
























