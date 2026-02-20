// netlify/functions/admin-activity.js
const { selectRecords, respond } = require("./utils");
const { withFHJ } = require("./middleware");

// Normalize timestamps safely
function safeTime(value) {
  if (!value) return new Date(0).toISOString(); // fallback
  const d = new Date(value);
  return isNaN(d) ? new Date(0).toISOString() : d.toISOString();
}

exports.handler = withFHJ(async () => {
  const [
    messages,
    bookings,
    events,
    clients,
    trips,
    logs,
    documents
  ] = await Promise.all([
    selectRecords("ConciergeMessages", "", { normalizer: true }),
    selectRecords("Bookings", "", { normalizer: true }),
    selectRecords("Events", "", { normalizer: true }),
    selectRecords("Clients", "", { normalizer: true }),
    selectRecords("Trips", "", { normalizer: true }),
    selectRecords("AuditLog", "", { normalizer: true }),
    selectRecords("Documents", "", { normalizer: true }),
  ]);

  const feed = [];

  // Concierge messages
  messages.forEach((m) => {
    feed.push({
      type: m.Resolved ? "Concierge (Resolved)" : "Concierge",
      text: m.Resolved
        ? `Message from ${m.Name} marked resolved`
        : `New concierge message from ${m.Name}`,
      timestamp: safeTime(m.Timestamp || m.Created),
    });
  });

  // Bookings
  bookings.forEach((b) =>
    feed.push({
      type: "Booking",
      text: `New booking: ${b.Destination} (${b.Email})`,
      timestamp: safeTime(b.Timestamp || b.Created || b.Date),
    })
  );

  // Events / RSVPs
  events.forEach((e) =>
    feed.push({
      type: "RSVP",
      text: `New RSVP for ${e.EventName}`,
      timestamp: safeTime(e.Timestamp || e.Created || e.Date),
    })
  );

  // Clients
  clients.forEach((c) =>
    feed.push({
      type: "Client",
      text: `New client added: ${c.Name}`,
      timestamp: safeTime(c.Timestamp || c.Created),
    })
  );

  // Trips
  trips.forEach((t) =>
    feed.push({
      type: "Trip",
      text: `Trip created: ${t.Destination} (${t["Client Email"]})`,
      timestamp: safeTime(t.Timestamp || t.Created || t.StartDate),
    })
  );

  // Documents
  documents.forEach((d) =>
    feed.push({
      type: "Document",
      text: `Document uploaded: ${d.Name}`,
      timestamp: safeTime(d.Timestamp || d.Created),
    })
  );

  // Admin actions (Audit Log)
  logs.forEach((l) =>
    feed.push({
      type: "Admin",
      text: `${l["Admin Email"]}: ${l.Action}`,
      timestamp: safeTime(l.Timestamp || l.Created),
    })
  );

  // Sort newest → oldest
  feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return respond(200, { feed });
});
