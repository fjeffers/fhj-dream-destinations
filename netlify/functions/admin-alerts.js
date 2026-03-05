// netlify/functions/admin-alerts.js
const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async () => {
  const now = new Date();
  const nowISO = now.toISOString();
  const oneHourAgoISO = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    { data: bookings },
    { data: trips },
    { data: concierge },
    { data: logs },
  ] = await Promise.all([
    supabase.from("bookings").select("*"),
    supabase.from("trips").select("*"),
    supabase.from("concierge").select("*"),
    supabase.from("audit_log").select("*"),
  ]);

  const alerts = [];

  // 1. Unpaid balances
  (bookings || []).forEach((b) => {
    const balance = b.balance_due || 0;
    if (balance > 0) {
      alerts.push({
        id: `unpaid-${b.id}`,
        type: "payment",
        severity: "warning",
        message: `${b.client_name} has an outstanding balance of $${balance}.`,
        createdAt: nowISO,
      });
    }
  });

  // 2. Trips starting in next 7 days
  (trips || []).forEach((t) => {
    const startRaw = t.start_date;
    if (!startRaw) return;
    const start = new Date(startRaw);
    if (start >= now && start <= sevenDaysFromNow) {
      alerts.push({
        id: `trip-${t.id}`,
        type: "trip",
        severity: "info",
        message: `${t.client} is departing for ${t.destination} on ${t.start_date}.`,
        createdAt: nowISO,
      });
    }
  });

  // 3. Unresolved concierge messages
  (concierge || []).forEach((c) => {
    if (!c.resolved) {
      alerts.push({
        id: `concierge-${c.id}`,
        type: "concierge",
        severity: "urgent",
        message: `New concierge message from ${c.name}: "${c.message}"`,
        createdAt: nowISO,
      });
    }
  });

  // 4. Recent admin activity (last hour)
  (logs || []).forEach((l) => {
    const ts = l.timestamp;
    if (!ts) return;
    if (ts >= oneHourAgoISO) {
      alerts.push({
        id: `activity-${l.id}`,
        type: "activity",
        severity: "info",
        message: `${l.admin} performed "${l.action}" in ${l.module}.`,
        createdAt: ts,
      });
    }
  });

  // Sort newest first
  alerts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return respond(200, { alerts });
});
