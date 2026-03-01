// netlify/functions/admin-concierge-get.js
const { selectRecords, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async () => {
  const TABLE = "Concierge";

  const records = await selectRecords(TABLE);

  const data = records
    .map((r) => ({
      id: r.id,
      message: r.message || r.Message || "",
      email: r.email || r.Email || "",
      name: r.name || r.Name || "",
      phone: r.phone || r.Phone || "",
      status: r.status || r.Status || "New",
      created: r.created_at || r.created || r.Created || "",
      updated: r.updated_at || r.updated || r.Updated || "",
      source: r.source || r.Source || "",
      context: r.context || r.Context || "",
    }))
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  return respond(200, { success: true, data });
});
