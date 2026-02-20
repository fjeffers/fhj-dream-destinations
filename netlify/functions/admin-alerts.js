// netlify/functions/admin-alerts.js
const { respond } = require("./utils");
const { withFHJ } = require("./middleware");
const Airtable = require("airtable");

exports.handler = withFHJ(async () => {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

  const now = new Date();
  const nowISO = now.toISOString();
  const oneHourAgoISO = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [bookings, trips, concierge, logs] = await Promise.all([
    base("Bookings").select().all(),
    base("Trips").select().all(),
    base("Concierge").select().all(),
    base("AuditLog").select().all(),
  ]);

  const alerts = [];

  // 1. Unpaid balances
  bookings.forEach((b) => {
    const balance = b.get("BalanceDue") || 0;
    if (balance > 0) {
      alerts.push({
        id: `unpaid-${b.id}`,
        type: "payment",
        severity: "warning",
        message: `${b.get("ClientName")} has an outstanding balance of $${balance}.`,
        createdAt: nowISO,
      });
    }
  });

  // 2. Trips starting in next 7 days
  trips.forEach((t) => {
    const startRaw = t.get("StartDate");
    if (!startRaw) return;
    const start = new Date(startRaw);
    if (start >= now && start <= sevenDaysFromNow) {
      alerts.push({
        id: `trip-${t.id}`,
        type: "trip",
        severity: "info",
        message: `${t.get("ClientName")} is departing for ${t.get(
          "Destination"
        )} on ${t.get("StartDate")}.`,
        createdAt: nowISO,
      });
    }
  });

  // 3. Unresolved concierge messages
  concierge.forEach((c) => {
    if (!c.get("Resolved")) {
      alerts.push({
        id: `concierge-${c.id}`,
        type: "concierge",
        severity: "urgent",
        message: `New concierge message from ${c.get("Name")}: "${c.get(
          "Message"
        )}"`,
        createdAt: nowISO,
      });
    }
  });

  // 4. Recent admin activity (last hour)
  logs.forEach((l) => {
    const ts = l.get("Timestamp");
    if (!ts) return;
    if (ts >= oneHourAgoISO) {
      alerts.push({
        id: `activity-${l.id}`,
        type: "activity",
        severity: "info",
        message: `${l.get("Admin")} performed "${l.get(
          "Action"
        )}" in ${l.get("Module")}.`,
        createdAt: ts,
      });
    }
  });

  // Sort newest first
  alerts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return respond(200, { alerts });
});
