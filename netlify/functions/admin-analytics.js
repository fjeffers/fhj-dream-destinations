// ==========================================================
// FILE: admin-analytics.js — Analytics data for AdminAnalytics.jsx
// Location: netlify/functions/admin-analytics.js
// ==========================================================
const { supabase, respond } = require("./utils");

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Returns the last 6 months as "YYYY-MM" strings, oldest first.
 */
function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    months.push(`${yyyy}-${mm}`);
  }
  return months;
}

/**
 * Groups an array of records by the YYYY-MM portion of a date column,
 * restricted to the last 6 months, and returns { "Jan": count, ... }.
 */
function groupByMonth(records, dateColumn, last6) {
  const counts = {};
  // Initialise all 6 months to 0
  for (const ym of last6) {
    const [, mm] = ym.split("-");
    const label = MONTH_NAMES[parseInt(mm, 10) - 1];
    counts[label] = 0;
  }

  for (const record of records) {
    const raw = record[dateColumn];
    if (!raw) continue;
    const ym = String(raw).slice(0, 7); // "YYYY-MM"
    if (!last6.includes(ym)) continue;
    const [, mm] = ym.split("-");
    const label = MONTH_NAMES[parseInt(mm, 10) - 1];
    counts[label] = (counts[label] || 0) + 1;
  }

  return counts;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  try {
    const last6 = getLast6Months();
    const sixMonthsAgo = last6[0] + "-01"; // e.g. "2025-08-01"

    const [tripsResult, clientsResult, bookingsResult, messagesResult] =
      await Promise.allSettled([
        supabase
          .from("trips")
          .select("created_at")
          .gte("created_at", sixMonthsAgo),
        supabase
          .from("clients")
          .select("created_at")
          .gte("created_at", sixMonthsAgo),
        supabase
          .from("trips")
          .select("consultation_date")
          .not("consultation_date", "is", null)
          .gte("consultation_date", sixMonthsAgo),
        supabase
          .from("concierge")
          .select("created_at")
          .gte("created_at", sixMonthsAgo),
      ]);

    const safeData = (result) => {
      if (result.status === "fulfilled" && !result.value.error) {
        return result.value.data || [];
      }
      if (result.status === "fulfilled" && result.value.error) {
        console.error("Supabase query error:", result.value.error.message);
      }
      return [];
    };

    const trips = safeData(tripsResult);
    const clients = safeData(clientsResult);
    const bookings = safeData(bookingsResult);
    const messages = safeData(messagesResult);

    return respond(200, {
      tripsByMonth:    groupByMonth(trips,    "created_at",        last6),
      clientsByMonth:  groupByMonth(clients,  "created_at",        last6),
      bookingsByMonth: groupByMonth(bookings, "consultation_date", last6),
      messagesByMonth: groupByMonth(messages, "created_at",        last6),
    });
  } catch (err) {
    console.error("admin-analytics error:", err);
    return respond(500, { error: err.message });
  }
};
