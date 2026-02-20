// ==========================================================
// 📄 FILE: admin-dashboard-insights.js  (FIX)
// ⭐ FIX: Standardized table names + Promise.allSettled
// ==========================================================

const { selectRecords, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async () => {
  const TABLE_TRIPS = "Trips";
  const TABLE_EVENTS = "Events";
  const TABLE_RSVPS = "RSVPs";
  const TABLE_CONCIERGE = "Concierge";
  const TABLE_CLIENTS = "Client Name";  // ⭐ correct name

  // Use allSettled so one table failure doesn't crash everything
  const results = await Promise.allSettled([
    selectRecords(TABLE_TRIPS),
    selectRecords(TABLE_EVENTS),
    selectRecords(TABLE_RSVPS),
    selectRecords(TABLE_CONCIERGE),
    selectRecords(TABLE_CLIENTS),
  ]);

  const extract = (idx) => (results[idx].status === "fulfilled" ? results[idx].value : []);

  const trips = extract(0);
  const events = extract(1);
  const rsvps = extract(2);
  const concierge = extract(3);
  const clients = extract(4);

  const now = new Date();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  // Upcoming trips (next 7 days)
  const upcomingTrips = trips
    .filter((t) => {
      const start = new Date(t["Start Date"] || t.StartDate);
      return start > now && start - now <= sevenDays;
    })
    .map((t) => ({
      destination: t.Destination || t.destination,
      client: t.Client || t.client,
      startDate: t["Start Date"] || t.StartDate,
    }));

  // Events happening soon (next 14 days)
  const upcomingEvents = events
    .filter((e) => {
      const date = new Date(e.Date || e.date);
      return date > now && date - now <= 14 * 24 * 60 * 60 * 1000;
    })
    .map((e) => ({
      title: e.Title || e.title,
      date: e.Date || e.date,
    }));

  // Concierge alerts
  const unreadConcierge = concierge.filter((c) => c.Status === "New");
  const inProgressConcierge = concierge.filter((c) => c.Status === "In Progress");

  // Pending RSVPs
  const pendingRSVPs = rsvps.filter(
    (r) => !r.Attending || r.Attending === ""
  );

  // New clients this week
  const newClients = clients.filter((c) => {
    const created = new Date(c.Created || c.createdTime);
    return now - created <= sevenDays;
  });

  // Summary
  const summary = `You have ${unreadConcierge.length} unread concierge messages and ${pendingRSVPs.length} pending RSVPs. ${upcomingTrips.length} trips begin within the next week. ${upcomingEvents.length} events are approaching soon. ${newClients.length} new clients joined this week.`;

  return respond(200, {
    success: true,
    insights: {
      upcomingTrips,
      upcomingEvents,
      unreadConcierge: unreadConcierge.length,
      inProgressConcierge: inProgressConcierge.length,
      pendingRSVPs: pendingRSVPs.length,
      newClients: newClients.length,
      summary,
    },
  });
});
