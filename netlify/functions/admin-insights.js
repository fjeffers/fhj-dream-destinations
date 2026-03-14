// netlify/functions/admin-insights.js
const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async () => {
  const now = new Date();
  const todayISO = now.toISOString().split("T")[0];
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all relevant tables
  const [
    { data: bookings = [] },
    { data: trips = [] },
    { data: payments = [] },
    { data: concierge = [] },
    { data: logs = [] },
  ] = await Promise.all([
    supabase.from("bookings").select("*").gt("balance_due", 0),
    supabase.from("trips").select("*").gte("start_date", now.toISOString()).lte("start_date", sevenDaysFromNow),
    supabase.from("payments").select("*").gte("date", todayISO).lte("date", todayISO),
    supabase.from("concierge").select("*").neq("status", "Resolved"),
    supabase.from("audit_log").select("*").gte("created_at", todayISO),
  ]);

  // 1. Unpaid balances
  const unpaid = (bookings || []).map((b) => ({
    Client: b.client_name || b.client,
    Email: b.email || b.client_email,
    Balance: b.balance_due,
  }));

  // 2. Trips starting soon (next 7 days)
  const soonTrips = (trips || []).map((t) => ({
    Client: t.client,
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
  const todayActivity = (logs || []).map((l) => ({
    Admin: l.admin,
    Action: l.action,
    Module: l.module,
    Timestamp: l.created_at,
  }));

  // 5. Payments received today
  const todayPayments = (payments || []).map((p) => ({
    Client: p.client_name || p.client,
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
