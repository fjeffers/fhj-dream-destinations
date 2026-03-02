const { selectRecords, respond } = require("./utils");
const { withFHJAdmin } = require("./middleware");

function safeTime(v) {
  const d = new Date(v);
  return isNaN(d) ? new Date(0).toISOString() : d.toISOString();
}

exports.handler = withFHJAdmin(async () => {
  const [messages, bookings, events] = await Promise.all([
    selectRecords("ConciergeMessages", "", { normalizer: true }),
    selectRecords("Bookings", "", { normalizer: true }),
    selectRecords("Events", "", { normalizer: true }),
  ]);

  const notifications = [];

  messages
    .filter((m) => !m.Resolved)
    .forEach((m) =>
      notifications.push({
        type: "Concierge",
        text: `New message from ${m.Name}`,
        timestamp: safeTime(m.Timestamp || m.Created),
      })
    );

  bookings.forEach((b) =>
    notifications.push({
      type: "Booking",
      text: `Booking: ${b.Destination} (${b.Email})`,
      timestamp: safeTime(b.Timestamp || b.Created),
    })
  );

  events.forEach((e) =>
    notifications.push({
      type: "RSVP",
      text: `RSVP for ${e.EventName}`,
      timestamp: safeTime(e.Timestamp || e.Created),
    })
  );

  notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return respond(200, { notifications });
});
