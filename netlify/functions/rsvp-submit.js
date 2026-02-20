const { supabase, respond } = require("./utils");
const { Resend } = require("resend");

async function sendRSVPNotification(rsvpData, eventData) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) { console.log("No RESEND_API_KEY"); return; }
  const resend = new Resend(resendKey);
  const eventTitle = eventData?.title || "an event";
  const eventDate = eventData?.date || "TBD";
  const eventLocation = eventData?.location || "TBD";
  const htmlBody = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0b1120;color:#e2e8f0;padding:32px;border-radius:12px;"><h1 style="color:#00c48c;text-align:center;">New RSVP Received!</h1><p style="color:#94a3b8;text-align:center;">FHJ Dream Destinations</p><div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:20px;margin:20px 0;"><h2 style="color:#00c48c;font-size:16px;">Event</h2><p style="font-size:18px;font-weight:bold;color:white;">${eventTitle}</p><p style="color:#94a3b8;">${eventDate} | ${eventLocation}</p></div><div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:20px;"><h2 style="color:#00c48c;font-size:16px;">Guest Details</h2><p style="color:white;"><strong>Name:</strong> ${rsvpData.name}</p><p style="color:white;"><strong>Email:</strong> ${rsvpData.email || "N/A"}</p><p style="color:white;"><strong>Phone:</strong> ${rsvpData.phone || "N/A"}</p><p style="color:white;"><strong>Guests:</strong> ${rsvpData.guests || 1}</p>${rsvpData.message ? `<p style="color:white;"><strong>Message:</strong> ${rsvpData.message}</p>` : ""}</div></div>`;
  try {
    const { data, error } = await resend.emails.send({
      from: "FHJ Dream Destinations <info@fhjdreamdestinations.com>",
      to: ["info@fhjdreamdestinations.com"],
      subject: `New RSVP: ${rsvpData.name} for ${eventTitle}`,
      html: htmlBody,
    });
    if (error) { console.error("Resend error:", JSON.stringify(error)); }
    else { console.log("Email sent:", data.id); }
  } catch (err) { console.error("Email error:", err.message); }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });
  try {
    const body = JSON.parse(event.body || "{}");
    const { name, email, phone, guests, message, eventSlug, eventId } = body;
    if (!name) return respond(400, { error: "Name is required" });
    if (!eventSlug && !eventId) return respond(400, { error: "Event identifier is required" });
    let eventData = null;
    let resolvedEventId = eventId || null;
    if (eventSlug) {
      const { data: evt } = await supabase.from("events").select("*").ilike("slug", eventSlug).single();
      if (evt) { eventData = evt; resolvedEventId = evt.id; }
    } else if (eventId) {
      const { data: evt } = await supabase.from("events").select("*").eq("id", eventId).single();
      if (evt) eventData = evt;
    }
    const rsvpRecord = { event_id: resolvedEventId, event_slug: eventSlug || "", name, email: email || "", phone: phone || "", guests: Number(guests) || 1, message: message || "", status: "Confirmed" };
    const { data, error } = await supabase.from("rsvps").insert([rsvpRecord]).select().single();
    if (error) { console.error("rsvp error:", error.message); return respond(500, { error: error.message }); }
    await sendRSVPNotification(rsvpRecord, eventData);
    return respond(200, { success: true, rsvp: data });
  } catch (err) { console.error("rsvp error:", err.message); return respond(500, { error: err.message }); }
};
