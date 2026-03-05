// netlify/functions/client-timeline.js
const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async (event) => {
  const { clientId } = JSON.parse(event.body || "{}");

  // Fetch all related records from Supabase
  const [
    { data: trips = [] },
    { data: bookings = [] },
    { data: payments = [] },
    { data: documents = [] },
    { data: concierge = [] },
  ] = await Promise.all([
    supabase.from("trips").select("*").eq("client_id", clientId),
    supabase.from("bookings").select("*").eq("client_id", clientId),
    supabase.from("payments").select("*").eq("client_id", clientId),
    supabase.from("documents").select("*").eq("client_id", clientId),
    supabase.from("concierge").select("*").eq("client_id", clientId),
  ]);

  // Normalize into timeline events
  const events = [];

  trips.forEach((t) =>
    events.push({
      type: "Trip",
      date: t.start_date,
      title: `Trip to ${t.destination}`,
      details: `${t.start_date} → ${t.end_date}`,
    })
  );

  bookings.forEach((b) =>
    events.push({
      type: "Booking",
      date: b.created_at,
      title: `Booking created`,
      details: `Total: $${b.total_price}`,
    })
  );

  payments.forEach((p) =>
    events.push({
      type: "Payment",
      date: p.date,
      title: `Payment received`,
      details: `$${p.amount}`,
    })
  );

  documents.forEach((d) =>
    events.push({
      type: "Document",
      date: d.uploaded_at || d.created_at,
      title: `Document uploaded`,
      details: d.name,
    })
  );

  concierge.forEach((c) =>
    events.push({
      type: "Concierge",
      date: c.created_at,
      title: `Concierge message`,
      details: c.message,
    })
  );

  // Sort chronologically
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  return respond(200, { events });
});
