// netlify/functions/admin-insights.js
const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async () => {
  const now = new Date();
  const todayISO = now.toISOString().split("T")[0];

  // Fetch all relevant tables
  const [
    { data: bookings = [] },
    { data: trips = [] },
    { data: payments = [] },
    { data: concierge = [] },
    { data: logs = [] },
  ] = await Promise.all([
    supabase.from("bookings").select("*"),
    supabase.from("trips").select("*"),
    supabase.from("payments").select("*"),
    supabase.from("concierge").select("*"),
    supabase.from("audit_log").select("*"),
  ]);

  // 1. Unpaid balances
  const unpaid = bookings
    .filter((b) => (b.balance_due || 0) > 0)
    .map((b) => ({
      Client: b.client_name,
      Email: b.client_email,
      Balance: b.balance_due,
    }));

  // 2. Trips starting soon (next 7 days)
  const soonTrips = trips
    .filter((t) => {
      const start = new Date(t.start_date);
      const diff = (start - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    })
    .map((t) => ({
      Client: t.client,
      Destination: t.destination,
      Start: t.start_date,
    }));

  // 3. Concierge messages needing attention
  const urgentConcierge = concierge
    .filter((c) => !c.resolved)
    .map((c) => ({
      Name: c.name,
      Email: c.email,
      Message: c.message,
    }));

  // 4. Activity today
  const todayActivity = logs
    .filter((l) => (l.timestamp || l.created_at || "").startsWith(todayISO))
    .map((l) => ({
      Admin: l.admin || l.admin_email,
      Action: l.action,
      Module: l.module,
      Timestamp: l.timestamp || l.created_at,
    }));

  // 5. Payments received today
  const todayPayments = payments
    .filter((p) => (p.date || "").startsWith(todayISO))
    .map((p) => ({
      Client: p.client_name,
      Amount: p.amount,
      Date: p.date,
    }));

  return respond(200, {
    unpaid,
    soonTrips,
    urgentConcierge,
    todayActivity,
    todayPayments,
  });
});
