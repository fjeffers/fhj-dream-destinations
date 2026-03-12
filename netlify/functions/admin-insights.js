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
    supabase.from("bookings").select("*").gt("balance_due", 0),
    supabase.from("trips").select("*"),
    supabase.from("payments").select("*"),
    supabase.from("concierge").select("*").neq("status", "Resolved"),
    supabase.from("audit_log").select("*"),
  ]);

  // 1. Unpaid balances
  const unpaid = (bookings || []).map((b) => ({
    Client: b.client_name,
    Email: b.email,
    Balance: b.balance_due,
  }));

  // 2. Trips starting soon (next 7 days)
  const soonTrips = (trips || [])
    .filter((t) => {
      if (!t.start_date) return false;
      const start = new Date(t.start_date);
      const diff = (start - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    })
    .map((t) => ({
      Client: t.client_name,
      Destination: t.destination,
      Start: t.start_date,
    }));

  // 3. Concierge messages needing attention
  const urgentConcierge = (concierge || []).map((c) => ({
    Name: c.name,
    Email: c.email,
    Message: c.message,
  }));

  // 4. Activity today
  const todayActivity = (logs || [])
    .filter((l) => ((l.created_at || l.timestamp) || "").startsWith(todayISO))
    .map((l) => ({
      Admin: l.admin,
      Action: l.action,
      Module: l.module,
      Timestamp: l.created_at || l.timestamp,
    }));

  // 5. Payments received today
  const todayPayments = (payments || [])
    .filter((p) => (p.date || p.created_at || "").startsWith(todayISO))
    .map((p) => ({
      Client: p.client_name,
      Amount: p.amount,
      Date: p.date || p.created_at,
    }));

  return respond(200, {
    unpaid,
    soonTrips,
    urgentConcierge,
    todayActivity,
    todayPayments,
  });
});
