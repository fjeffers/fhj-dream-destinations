// ==========================================================
// 📄 FILE: admin-dashboard-activity.js
// Activity feed: recent bookings, messages, clients, trips
// Location: netlify/functions/admin-dashboard-activity.js
// ==========================================================

const { selectRecords, respond } = require("./utils");
const { withFHJAdmin } = require("./middleware");

exports.handler = withFHJAdmin(async () => {
  const results = await Promise.allSettled([
    selectRecords("Client_Bookings"),
    selectRecords("Concierge"),
    selectRecords("Client Name"),
    selectRecords("Trips"),
  ]);

  const extract = (i) => (results[i].status === "fulfilled" ? results[i].value : []);
  const bookings = extract(0);
  const messages = extract(1);
  const clients = extract(2);
  const trips = extract(3);

  const activities = [];

  // Recent bookings
  bookings.forEach((b) => {
    const date = b.Created || b.createdTime || b.StartDate || b["Start Date"];
    if (!date) return;
    activities.push({
      type: "booking",
      icon: "📋",
      text: `New booking: ${b.ClientName || b["Client Name"] || "Client"} — ${b.Destination || b["Trip Name"] || "Trip"}`,
      date,
      ts: new Date(date).getTime(),
    });
  });

  // Recent messages
  messages.forEach((m) => {
    const date = m.Created || m.createdTime;
    if (!date) return;
    activities.push({
      type: "message",
      icon: "💬",
      text: `${m.Name || "Someone"}: "${(m.Message || "").slice(0, 60)}${(m.Message || "").length > 60 ? "…" : ""}"`,
      date,
      ts: new Date(date).getTime(),
    });
  });

  // New clients
  clients.forEach((c) => {
    const date = c.Created || c.createdTime;
    if (!date) return;
    activities.push({
      type: "client",
      icon: "👤",
      text: `New client: ${c["Full Name"] || c.Name || c.name || "Unknown"}`,
      date,
      ts: new Date(date).getTime(),
    });
  });

  // Recent trips
  trips.forEach((t) => {
    const date = t.Created || t.createdTime;
    if (!date) return;
    activities.push({
      type: "trip",
      icon: "✈️",
      text: `Trip added: ${t.Destination || t.destination || "Destination"} for ${t.Client || t.client || "Client"}`,
      date,
      ts: new Date(date).getTime(),
    });
  });

  // Sort by timestamp descending, take top 20
  activities.sort((a, b) => b.ts - a.ts);
  const recent = activities.slice(0, 20).map(({ ts, ...rest }) => rest);

  return respond(200, { activities: recent });
});