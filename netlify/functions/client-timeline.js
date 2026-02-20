// netlify/functions/client-timeline.js
const { respond } = require("./utils");
const { withFHJ } = require("./middleware");
const Airtable = require("airtable");

exports.handler = withFHJ(async (event) => {
  const { clientId } = JSON.parse(event.body || "{}");

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

  // Fetch all related records
  const trips = await base("Trips")
    .select({ filterByFormula: `{ClientID} = '${clientId}'` })
    .all();

  const bookings = await base("Bookings")
    .select({ filterByFormula: `{ClientID} = '${clientId}'` })
    .all();

  const payments = await base("Payments")
    .select({ filterByFormula: `{ClientID} = '${clientId}'` })
    .all();

  const documents = await base("Documents")
    .select({ filterByFormula: `{ClientID} = '${clientId}'` })
    .all();

  const concierge = await base("Concierge")
    .select({ filterByFormula: `{ClientID} = '${clientId}'` })
    .all();

  // Normalize into timeline events
  const events = [];

  trips.forEach((t) =>
    events.push({
      type: "Trip",
      date: t.get("StartDate"),
      title: `Trip to ${t.get("Destination")}`,
      details: `${t.get("StartDate")} → ${t.get("EndDate")}`,
    })
  );

  bookings.forEach((b) =>
    events.push({
      type: "Booking",
      date: b.get("CreatedAt"),
      title: `Booking created`,
      details: `Total: $${b.get("TotalPrice")}`,
    })
  );

  payments.forEach((p) =>
    events.push({
      type: "Payment",
      date: p.get("Date"),
      title: `Payment received`,
      details: `$${p.get("Amount")}`,
    })
  );

  documents.forEach((d) =>
    events.push({
      type: "Document",
      date: d.get("UploadedAt"),
      title: `Document uploaded`,
      details: d.get("Name"),
    })
  );

  concierge.forEach((c) =>
    events.push({
      type: "Concierge",
      date: c.get("CreatedAt"),
      title: `Concierge message`,
      details: c.get("Message"),
    })
  );

  // Sort chronologically
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  return respond(200, { events });
});
