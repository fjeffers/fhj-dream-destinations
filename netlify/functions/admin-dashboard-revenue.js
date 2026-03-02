// ==========================================================
// 📄 FILE: admin-dashboard-revenue.js
// Revenue stats: total earned, outstanding, monthly trend
// Location: netlify/functions/admin-dashboard-revenue.js
// ==========================================================

const { selectRecords, respond } = require("./utils");
const { withFHJAdmin } = require("./middleware");

exports.handler = withFHJAdmin(async () => {
  try {
    const bookings = await selectRecords("Client_Bookings");

    let totalRevenue = 0;
    let totalOutstanding = 0;
    let totalPaid = 0;
    const monthlyMap = {};

    bookings.forEach((b) => {
      const price = parseFloat(b.TotalPrice || b.Price || b.price || b.Amount || 0);
      const balance = parseFloat(b.BalanceDue || b.Balance || b.balance || 0);
      const paid = price - balance;

      totalRevenue += price;
      totalOutstanding += balance;
      totalPaid += paid > 0 ? paid : 0;

      // Monthly grouping
      const dateField = b.StartDate || b["Start Date"] || b.Date || b.Created || b.createdTime;
      if (dateField) {
        const d = new Date(dateField);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (!monthlyMap[key]) {
          monthlyMap[key] = { month: label, sortKey: key, revenue: 0, paid: 0, outstanding: 0 };
        }
        monthlyMap[key].revenue += price;
        monthlyMap[key].paid += paid > 0 ? paid : 0;
        monthlyMap[key].outstanding += balance;
      }
    });

    // Sort by month
    const monthlyTrend = Object.values(monthlyMap)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12) // Last 12 months
      .map(({ sortKey, ...rest }) => rest);

    return respond(200, {
      totalRevenue: Math.round(totalRevenue),
      totalOutstanding: Math.round(totalOutstanding),
      totalPaid: Math.round(totalPaid),
      bookingCount: bookings.length,
      monthlyTrend,
    });
  } catch (err) {
    console.error("Revenue stats error:", err);
    return respond(200, {
      totalRevenue: 0,
      totalOutstanding: 0,
      totalPaid: 0,
      bookingCount: 0,
      monthlyTrend: [],
    });
  }
});