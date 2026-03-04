// netlify/functions/admin-insights.js

const { selectRecords, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async () => {
  const now = new Date();
  const todayISO = now.toISOString().split("T")[0];

  // Fetch all relevant tables
  const [bookings, trips, payments, concierge, logs] = await Promise.all([
    selectRecords("Bookings", ""),
    selectRecords("Trips", ""),
    selectRecords("Payments", ""),
    selectRecords("Concierge", ""),
    selectRecords("AuditLog", ""),
  ]);

  // 1. Unpaid balances
  const unpaid = bookings
    .filter((b) => (b.BalanceDue || b.balance_due || 0) > 0)
    .map((b) => ({
      Client: b.ClientName || b.client_name || b["Client Name"],
      Email: b.Email || b.email,
      Balance: b.BalanceDue || b.balance_due,
    }));

  // 2. Trips starting soon (next 7 days)
  const soonTrips = trips
    .filter((t) => {
      const start = new Date(t["Start Date"] || t.start_date);
      const diff = (start - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    })
    .map((t) => ({
      Client: t.ClientName || t.client_name || t["Client Name"],
      Destination: t.Destination || t.destination,
      Start: t["Start Date"] || t.start_date,
    }));

  // 3. Concierge messages needing attention
  const urgentConcierge = concierge
    .filter((c) => !(c.Resolved || c.resolved))
    .map((c) => ({
      Name: c.Name || c.name,
      Email: c.Email || c.email,
      Message: c.Message || c.message,
    }));

  // 4. Activity today
  const todayActivity = logs
    .filter((l) => ((l.Timestamp || l.timestamp || l.created_at) || "").startsWith(todayISO))
    .map((l) => ({
      Admin: l.Admin || l.admin,
      Action: l.Action || l.action,
      Module: l.Module || l.module,
      Timestamp: l.Timestamp || l.timestamp || l.created_at,
    }));

  // 5. Payments received today
  const todayPayments = payments
    .filter((p) => ((p.Date || p.date) || "").startsWith(todayISO))
    .map((p) => ({
      Client: p.ClientName || p.client_name || p["Client Name"],
      Amount: p.Amount || p.amount,
      Date: p.Date || p.date,
    }));

  return respond(200, {
    unpaid,
    soonTrips,
    urgentConcierge,
    todayActivity,
    todayPayments,
  });
});
