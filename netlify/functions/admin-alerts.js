// netlify/functions/admin-alerts.js
const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async () => {
  const now = new Date();
  const nowISO = now.toISOString();
  const oneHourAgoISO = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: bookings = [] },
    { data: trips = [] },
    { data: concierge = [] },
    { data: logs = [] },
  ] = await Promise.all([
    supabase.from("bookings").select("*").gt("balance_due", 0),
    supabase.from("trips").select("*").gte("start_date", nowISO).lte("start_date", sevenDaysFromNow),
    supabase.from("concierge").select("*").neq("status", "Resolved"),
    supabase.from("audit_log").select("*").gte("created_at", oneHourAgoISO),
  ]);

  const alerts = [];

  // 1. Unpaid balances
  (bookings || []).forEach((b) => {
    alerts.push({
      id: `unpaid-${b.id}`,
      type: "payment",
      severity: "warning",
      message: `${b.client_name} has an outstanding balance of $${b.balance_due}.`,
      createdAt: nowISO,
    });
  });

  // 2. Trips starting in next 7 days
  (trips || []).forEach((t) => {
    alerts.push({
      id: `trip-${t.id}`,
      type: "trip",
      severity: "info",
      message: `${t.client_name} is departing for ${t.destination} on ${t.start_date}.`,
      createdAt: nowISO,
    });
  });

  // 3. Unresolved concierge messages
  (concierge || []).forEach((c) => {
    alerts.push({
      id: `concierge-${c.id}`,
      type: "concierge",
      severity: "urgent",
      message: `New concierge message from ${c.name}: "${c.message}"`,
      createdAt: nowISO,
    });
  });

  // 4. Recent admin activity (last hour)
  (logs || []).forEach((l) => {
    const ts = l.created_at || l.timestamp;
    alerts.push({
      id: `activity-${l.id}`,
      type: "activity",
      severity: "info",
      message: `${l.admin} performed "${l.action}" in ${l.module}.`,
      createdAt: ts,
    });
  });

  // Sort newest first
  alerts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return respond(200, { alerts });
});
