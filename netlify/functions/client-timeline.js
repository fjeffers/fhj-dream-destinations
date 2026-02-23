// netlify/functions/client-timeline.js
const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return respond(400, { error: "Invalid body" }); }

  const { clientId } = body;
  if (!clientId) return respond(400, { error: "clientId required" });

  try {
    const [tripsRes, bookingsRes, conciergeRes] = await Promise.allSettled([
      supabase.from("trips").select("id, destination, start_date, end_date, status, created_at").eq("client_id", clientId).order("created_at", { ascending: false }),
      supabase.from("trips").select("id, consultation_date, consultation_time, status, created_at").eq("client_id", clientId).not("consultation_date", "is", null).order("consultation_date", { ascending: false }),
      supabase.from("concierge_messages").select("id, message, created_at").eq("client_id", clientId).order("created_at", { ascending: false }),
    ]);

    const events = [];

    if (tripsRes.status === "fulfilled" && !tripsRes.value.error) {
      (tripsRes.value.data || []).forEach((t) => {
        events.push({
          type: "Trip",
          date: t.start_date || t.created_at,
          title: `Trip to ${t.destination || "destination"}`,
          details: t.start_date && t.end_date ? `${t.start_date} → ${t.end_date}` : (t.status || ""),
        });
      });
    }

    if (bookingsRes.status === "fulfilled" && !bookingsRes.value.error) {
      (bookingsRes.value.data || []).forEach((b) => {
        events.push({
          type: "Booking",
          date: b.consultation_date || b.created_at,
          title: "Appointment scheduled",
          details: b.consultation_time ? `Time: ${b.consultation_time}` : "",
        });
      });
    }

    if (conciergeRes.status === "fulfilled" && !conciergeRes.value.error) {
      (conciergeRes.value.data || []).forEach((c) => {
        events.push({
          type: "Concierge",
          date: c.created_at,
          title: "Concierge message",
          details: (c.message || "").slice(0, 120),
        });
      });
    }

    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    return respond(200, { events });
  } catch (err) {
    console.error("client-timeline error:", err);
    return respond(500, { error: err.message });
  }
};
