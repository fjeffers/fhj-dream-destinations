// ==========================================================
// 📄 FILE: admin-dashboard-stats.js  (REBUILT)
// ⭐ Now includes trend % for each stat (vs prior period)
// Location: netlify/functions/admin-dashboard-stats.js
// ==========================================================

const { selectRecords, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const results = await Promise.allSettled([
    selectRecords("Client Name"),
    selectRecords("Client_Bookings"),
    selectRecords("Concierge"),
    selectRecords("Events"),
    selectRecords("Trips"),
  ]);

  const extract = (i) => (results[i].status === "fulfilled" ? results[i].value : []);
  const clients = extract(0);
  const bookings = extract(1);
  const messages = extract(2);
  const events = extract(3);
  const trips = extract(4);

  // --- Client count + trend ---
  const clientCount = clients.length;
  const newClientsThisMonth = clients.filter((c) => {
    const d = new Date(c.Created || c.createdTime || 0);
    return d >= thirtyDaysAgo;
  }).length;
  const newClientsPrevMonth = clients.filter((c) => {
    const d = new Date(c.Created || c.createdTime || 0);
    return d >= sixtyDaysAgo && d < thirtyDaysAgo;
  }).length;
  const clientTrend = calcTrend(newClientsThisMonth, newClientsPrevMonth);

  // --- Active/upcoming trips + trend ---
  const upcomingTrips = trips.filter((t) => {
    const start = new Date(t["Start Date"] || t.StartDate || 0);
    return start >= now;
  }).length;
  const tripsThisMonth = trips.filter((t) => {
    const d = new Date(t.Created || t.createdTime || t["Start Date"] || 0);
    return d >= thirtyDaysAgo;
  }).length;
  const tripsPrevMonth = trips.filter((t) => {
    const d = new Date(t.Created || t.createdTime || t["Start Date"] || 0);
    return d >= sixtyDaysAgo && d < thirtyDaysAgo;
  }).length;
  const tripTrend = calcTrend(tripsThisMonth, tripsPrevMonth);

  // --- Unread messages + trend ---
  const unreadMessages = messages.filter((m) => {
    const status = (m.Status || m.status || "").toLowerCase();
    return status === "new" || status === "unread" || status === "";
  }).length;
  const msgsThisMonth = messages.filter((m) => {
    const d = new Date(m.Created || m.createdTime || 0);
    return d >= thirtyDaysAgo;
  }).length;
  const msgsPrevMonth = messages.filter((m) => {
    const d = new Date(m.Created || m.createdTime || 0);
    return d >= sixtyDaysAgo && d < thirtyDaysAgo;
  }).length;
  const msgTrend = calcTrend(msgsThisMonth, msgsPrevMonth);

  // --- Events this month + trend ---
  const eventsThisMonth = events.filter((e) => {
    const d = new Date(e.Date || e.date || 0);
    return d >= thirtyDaysAgo && d <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }).length;
  const eventsPrevMonth = events.filter((e) => {
    const d = new Date(e.Date || e.date || 0);
    return d >= sixtyDaysAgo && d < thirtyDaysAgo;
  }).length;
  const eventTrend = calcTrend(eventsThisMonth, eventsPrevMonth);

  // --- Revenue stats ---
  let totalRevenue = 0;
  let totalOutstanding = 0;
  bookings.forEach((b) => {
    totalRevenue += parseFloat(b.TotalPrice || b.Price || b.Amount || 0);
    totalOutstanding += parseFloat(b.BalanceDue || b.Balance || b.balance || 0);
  });

  return respond(200, {
    clients: clientCount,
    clientTrend,
    upcomingTrips,
    tripTrend,
    unreadMessages,
    msgTrend,
    eventsThisMonth,
    eventTrend,
    totalRevenue: Math.round(totalRevenue),
    totalOutstanding: Math.round(totalOutstanding),
    totalPaid: Math.round(totalRevenue - totalOutstanding),
    bookingCount: bookings.length,
  });
});

function calcTrend(current, previous) {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
}