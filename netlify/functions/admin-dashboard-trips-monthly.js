// netlify/functions/admin-dashboard-trips-monthly.js
const { selectRecords, respond } = require("./utils");
const { withFHJAdmin } = require("./middleware");

exports.handler = withFHJAdmin(async () => {
  try {
    const trips = await selectRecords("Trips");

    const monthly = {};

    trips.forEach((trip) => {
      const start = new Date(trip["Start Date"]);
      if (isNaN(start)) return;

      const key = `${start.getFullYear()}-${String(
        start.getMonth() + 1
      ).padStart(2, "0")}`;

      monthly[key] = (monthly[key] || 0) + 1;
    });

    const data = Object.keys(monthly)
      .sort()
      .map((key) => ({
        month: key,
        trips: monthly[key],
      }));

    return respond(200, { success: true, data });
  } catch (err) {
    console.error("Monthly trips error:", err);
    return respond(500, { error: err.message });
  }
});
