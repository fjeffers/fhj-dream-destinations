// netlify/functions/admin-alerts.js

const { selectRecords, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async () => {
  const now = new Date();
  const nowISO = now.toISOString();
  const oneHourAgoISO = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [bookings, trips, concierge, logs] = await Promise.all([
    selectRecords("Bookings", ""),
    selectRecords("Trips", ""),
    selectRecords("Concierge", ""),
    selectRecords("AuditLog", ""),
  ]);

  const alerts = [];

  // 1. Unpaid balances
  bookings.forEach((b) => {
    const balance = b.BalanceDue || b.balance_due || 0;
    if (balance > 0) {
      alerts.push({
        id: `unpaid-${b.id}`,
        type: "payment",
        severity: "warning",
        message: `${b.ClientName || b.client_name || b["Client Name"]} has an outstanding balance of $${balance}.`,
        createdAt: nowISO,
      });
    }
  });

  // 2. Trips starting in next 7 days
  trips.forEach((t) => {
    const startRaw = t["Start Date"] || t.start_date;
    if (!startRaw) return;
    const start = new Date(startRaw);
    if (start >= now && start <= sevenDaysFromNow) {
      alerts.push({
        id: `trip-${t.id}`,
        type: "trip",
        severity: "info",
        message: `${t.ClientName || t.client_name || t["Client Name"]} is departing for ${t.Destination || t.destination} on ${startRaw}.`,
        createdAt: nowISO,
      });
    }
  });

  // 3. Unresolved concierge messages
  concierge.forEach((c) => {
    if (!(c.Resolved || c.resolved)) {
      alerts.push({
        id: `concierge-${c.id}`,
        type: "concierge",
        severity: "urgent",
        message: `New concierge message from ${c.Name || c.name}: "${c.Message || c.message}"`,
        createdAt: nowISO,
      });
    }
  });

  // 4. Recent admin activity (last hour)
  logs.forEach((l) => {
    const ts = l.Timestamp || l.timestamp || l.created_at;
    if (!ts) return;
    if (ts >= oneHourAgoISO) {
      alerts.push({
        id: `activity-${l.id}`,
        type: "activity",
        severity: "info",
        message: `${l.Admin || l.admin} performed "${l.Action || l.action}" in ${l.Module || l.module}.`,
        createdAt: ts,
      });
    }
  });

  // Sort newest first
  alerts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return respond(200, { alerts });
});
