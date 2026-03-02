const { selectRecords, respond } = require("./utils");
const { withFHJAdmin } = require("./middleware");

exports.handler = withFHJAdmin(async (event) => {
  const query = (event.queryStringParameters?.q || "").toLowerCase();

  if (!query) return respond(200, { results: [] });

  const [clients, trips, bookings, documents, messages, events, deals] =
    await Promise.all([
      selectRecords("Clients", "", { normalizer: true }),
      selectRecords("Trips", "", { normalizer: true }),
      selectRecords("Bookings", "", { normalizer: true }),
      selectRecords("Documents", "", { normalizer: true }),
      selectRecords("ConciergeMessages", "", { normalizer: true }),
      selectRecords("Events", "", { normalizer: true }),
      selectRecords("Deals", "", { normalizer: true }),
    ]);

  const match = (obj) =>
    Object.values(obj)
      .filter((v) => typeof v === "string")
      .some((v) => v.toLowerCase().includes(query));

  const results = [];

  clients.filter(match).forEach((c) =>
    results.push({
      type: "Client",
      title: c.Name,
      subtitle: c.Email,
    })
  );

  trips.filter(match).forEach((t) =>
    results.push({
      type: "Trip",
      title: t.Destination,
      subtitle: t["Client Email"],
    })
  );

  bookings.filter(match).forEach((b) =>
    results.push({
      type: "Booking",
      title: b.Destination,
      subtitle: b.Email,
    })
  );

  documents.filter(match).forEach((d) =>
    results.push({
      type: "Document",
      title: d.Name,
      subtitle: d.Type,
    })
  );

  messages.filter(match).forEach((m) =>
    results.push({
      type: "Concierge",
      title: m.Name,
      subtitle: m.Message,
    })
  );

  events.filter(match).forEach((e) =>
    results.push({
      type: "Event",
      title: e.EventName,
      subtitle: e.Date,
    })
  );

  deals.filter(match).forEach((d) =>
    results.push({
      type: "Deal",
      title: d.Title,
      subtitle: d.Description,
    })
  );

  return respond(200, { results });
});
