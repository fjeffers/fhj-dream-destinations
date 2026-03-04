// netlify/functions/client-timeline.js

const { selectRecords, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async (event) => {
  const { clientId } = JSON.parse(event.body || "{}");

  // Fetch all related records and filter by clientId in JavaScript
  // (complex Airtable formulas like FIND are handled client-side)
  const [allTrips, allBookings, allPayments, allDocuments, allConcierge] = await Promise.all([
    selectRecords("Trips", ""),
    selectRecords("Bookings", ""),
    selectRecords("Payments", ""),
    selectRecords("Documents", ""),
    selectRecords("Concierge", ""),
  ]);

  const trips = allTrips.filter((t) => (t.ClientID || t.client_id) === clientId);
  const bookings = allBookings.filter((b) => (b.ClientID || b.client_id) === clientId);
  const payments = allPayments.filter((p) => (p.ClientID || p.client_id) === clientId);
  const documents = allDocuments.filter((d) => (d.ClientID || d.client_id) === clientId);
  const concierge = allConcierge.filter((c) => (c.ClientID || c.client_id) === clientId);

  // Normalize into timeline events
  const events = [];

  trips.forEach((t) =>
    events.push({
      type: "Trip",
      date: t["Start Date"] || t.start_date,
      title: `Trip to ${t.Destination || t.destination}`,
      details: `${t["Start Date"] || t.start_date} → ${t["End Date"] || t.end_date}`,
    })
  );

  bookings.forEach((b) =>
    events.push({
      type: "Booking",
      date: b.CreatedAt || b.created_at,
      title: `Booking created`,
      details: `Total: $${b.TotalPrice || b.total_price}`,
    })
  );

  payments.forEach((p) =>
    events.push({
      type: "Payment",
      date: p.Date || p.date,
      title: `Payment received`,
      details: `$${p.Amount || p.amount}`,
    })
  );

  documents.forEach((d) =>
    events.push({
      type: "Document",
      date: d.UploadedAt || d.uploaded_at || d.created_at,
      title: `Document uploaded`,
      details: d.Name || d.name,
    })
  );

  concierge.forEach((c) =>
    events.push({
      type: "Concierge",
      date: c.CreatedAt || c.created_at,
      title: `Concierge message`,
      details: c.Message || c.message,
    })
  );

  // Sort chronologically
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  return respond(200, { events });
});
