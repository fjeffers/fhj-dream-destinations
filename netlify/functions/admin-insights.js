// netlify/functions/admin-insights.js
const { respond } = require("./utils");
const { withFHJ } = require("./middleware");
const Airtable = require("airtable");

exports.handler = withFHJ(async () => {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

  const now = new Date();
  const todayISO = now.toISOString().split("T")[0];

  // Fetch all relevant tables
  const [bookings, trips, payments, concierge, logs] = await Promise.all([
    base("Bookings").select().all(),
    base("Trips").select().all(),
    base("Payments").select().all(),
    base("Concierge").select().all(),
    base("AuditLog").select().all(),
  ]);

  // 1. Unpaid balances
  const unpaid = bookings
    .filter((b) => (b.get("BalanceDue") || 0) > 0)
    .map((b) => ({
      Client: b.get("ClientName"),
      Email: b.get("Email"),
      Balance: b.get("BalanceDue"),
    }));

  // 2. Trips starting soon (next 7 days)
  const soonTrips = trips
    .filter((t) => {
      const start = new Date(t.get("StartDate"));
      const diff = (start - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    })
    .map((t) => ({
      Client: t.get("ClientName"),
      Destination: t.get("Destination"),
      Start: t.get("StartDate"),
    }));

  // 3. Concierge messages needing attention
  const urgentConcierge = concierge
    .filter((c) => !c.get("Resolved"))
    .map((c) => ({
      Name: c.get("Name"),
      Email: c.get("Email"),
      Message: c.get("Message"),
    }));

  // 4. Activity today
  const todayActivity = logs
    .filter((l) => (l.get("Timestamp") || "").startsWith(todayISO))
    .map((l) => ({
      Admin: l.get("Admin"),
      Action: l.get("Action"),
      Module: l.get("Module"),
      Timestamp: l.get("Timestamp"),
    }));

  // 5. Payments received today
  const todayPayments = payments
    .filter((p) => (p.get("Date") || "").startsWith(todayISO))
    .map((p) => ({
      Client: p.get("ClientName"),
      Amount: p.get("Amount"),
      Date: p.get("Date"),
    }));

  return respond(200, {
    unpaid,
    soonTrips,
    urgentConcierge,
    todayActivity,
    todayPayments,
  });
});
