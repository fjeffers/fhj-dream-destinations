// netlify/functions/client-timeline.js
const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async (event) => {
  const { clientId, clientEmail } = JSON.parse(event.body || "{}");

  if (!clientId && !clientEmail) {
    return respond(400, { error: "clientId or clientEmail is required" });
  }

  // Support lookup by client UUID or email
  const emailFilter = clientEmail || null;
  const idFilter = clientId || null;

  const buildFilter = (query, emailCol = "client_email", idCol = "client_id") => {
    if (emailFilter) return query.ilike(emailCol, emailFilter);
    if (idFilter) return query.eq(idCol, idFilter);
    return query;
  };

  // Fetch all related records
  const [
    { data: trips = [] },
    { data: bookings = [] },
    { data: payments = [] },
    { data: documents = [] },
    { data: concierge = [] },
  ] = await Promise.all([
    buildFilter(supabase.from("trips").select("*")),
    buildFilter(supabase.from("bookings").select("*")),
    buildFilter(supabase.from("payments").select("*")),
    buildFilter(supabase.from("documents").select("*")),
    buildFilter(supabase.from("concierge").select("*"), "email", "client_id"),
  ]);

  // Normalize into timeline events
  const events = [];

  (trips || []).forEach((t) =>
    events.push({
      type: "Trip",
      date: t.start_date,
      title: `Trip to ${t.destination}`,
      details: `${t.start_date} → ${t.end_date}`,
    })
  );

  (bookings || []).forEach((b) =>
    events.push({
      type: "Booking",
      date: b.created_at,
      title: `Booking created`,
      details: `Total: $${b.total_price}`,
    })
  );

  (payments || []).forEach((p) =>
    events.push({
      type: "Payment",
      date: p.date || p.created_at,
      title: `Payment received`,
      details: `$${p.amount}`,
    })
  );

  (documents || []).forEach((d) =>
    events.push({
      type: "Document",
      date: d.uploaded_at || d.created_at,
      title: `Document uploaded`,
      details: d.name,
    })
  );

  (concierge || []).forEach((c) =>
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
