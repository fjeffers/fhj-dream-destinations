// netlify/functions/admin-dashboard-client-growth.js
const { selectRecords, respond } = require("./utils");
const { withFHJAdmin } = require("./middleware");

exports.handler = withFHJAdmin(async () => {
  const TABLE_CLIENTS = "Client Name";

  const clients = await selectRecords(TABLE_CLIENTS);

  const monthly = {};

  clients.forEach((c) => {
    const created = c.Created ? new Date(c.Created) : null;
    if (!created || isNaN(created)) return;

    const key = `${created.getFullYear()}-${String(
      created.getMonth() + 1
    ).padStart(2, "0")}`;

    monthly[key] = (monthly[key] || 0) + 1;
  });

  const data = Object.keys(monthly)
    .sort()
    .map((key) => ({
      month: key,
      clients: monthly[key],
    }));

  return respond(200, { success: true, data });
});
