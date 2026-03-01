// ==========================================================
// 📄 FILE: admin-analytics.js — Admin analytics data
// Returns monthly counts for bookings, trips, clients,
// and concierge messages — used by AdminAnalytics.jsx.
// Location: netlify/functions/admin-analytics.js
// ==========================================================

const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

// Build a label→count map for the last 6 months from a list
// of rows that each have a created_at ISO timestamp.
// Labels include the year when the window spans two calendar years
// (e.g. "Dec 24" vs plain "Dec") to avoid month-name collisions.
function bucketByMonth(rows) {
  const now = new Date();
  const result = {};

  // Determine whether the 6-month window crosses a year boundary
  const windowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const crossesYear = windowStart.getFullYear() !== now.getFullYear();

  // Initialise the last 6 calendar months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = crossesYear
      ? d.toLocaleString("en-US", { month: "short" }) + " " + String(d.getFullYear()).slice(2)
      : d.toLocaleString("en-US", { month: "short" });
    result[label] = 0;
  }

  for (const row of rows || []) {
    const d = new Date(row.created_at);
    if (isNaN(d)) continue;
    const diffMonths =
      (now.getFullYear() - d.getFullYear()) * 12 +
      (now.getMonth() - d.getMonth());
    if (diffMonths >= 0 && diffMonths < 6) {
      const label = crossesYear
        ? d.toLocaleString("en-US", { month: "short" }) + " " + String(d.getFullYear()).slice(2)
        : d.toLocaleString("en-US", { month: "short" });
      result[label] = (result[label] || 0) + 1;
    }
  }

  return result;
}

exports.handler = withFHJ(async () => {
  // Fetch the four datasets in parallel
  const [bookingsRes, tripsRes, clientsRes, conciergeRes] = await Promise.all([
    supabase.from("bookings").select("created_at"),
    supabase.from("trips").select("created_at"),
    supabase.from("clients").select("created_at"),
    supabase.from("concierge").select("created_at"),
  ]);

  return respond(200, {
    bookingsByMonth: bucketByMonth(bookingsRes.data),
    tripsByMonth: bucketByMonth(tripsRes.data),
    clientsByMonth: bucketByMonth(clientsRes.data),
    messagesByMonth: bucketByMonth(conciergeRes.data),
  });
});
