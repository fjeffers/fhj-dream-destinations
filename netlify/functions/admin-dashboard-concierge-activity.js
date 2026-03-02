// netlify/functions/admin-dashboard-concierge-activity.js
const { selectRecords, respond } = require("./utils");
const { withFHJAdmin } = require("./middleware");

exports.handler = withFHJAdmin(async () => {
  const TABLE_CONCIERGE = "Concierge";

  const records = await selectRecords(TABLE_CONCIERGE);

  const byDay = {};

  records.forEach((rec) => {
    const created = rec.Created ? new Date(rec.Created) : null;
    const updated = rec.Updated ? new Date(rec.Updated) : null;
    const status = rec.Status;

    if (!created || isNaN(created)) return;

    const dayKey = created.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!byDay[dayKey]) {
      byDay[dayKey] = {
        date: dayKey,
        newCount: 0,
        resolvedCount: 0,
        totalResponseMs: 0,
        resolvedWithTime: 0,
      };
    }

    if (status === "New") {
      byDay[dayKey].newCount += 1;
    }

    if (status === "Resolved") {
      byDay[dayKey].resolvedCount += 1;
      if (updated && !isNaN(updated)) {
        const diff = updated - created;
        if (diff > 0) {
          byDay[dayKey].totalResponseMs += diff;
          byDay[dayKey].resolvedWithTime += 1;
        }
      }
    }
  });

  const data = Object.values(byDay)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: d.date,
      newCount: d.newCount,
      resolvedCount: d.resolvedCount,
      avgResponseHours:
        d.resolvedWithTime > 0
          ? +(d.totalResponseMs / d.resolvedWithTime / 1000 / 60 / 60).toFixed(2)
          : 0,
    }));

  return respond(200, { success: true, data });
});
