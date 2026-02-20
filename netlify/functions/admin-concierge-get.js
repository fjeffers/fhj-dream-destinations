// netlify/functions/admin-concierge-get.js
const { selectRecords, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async () => {
  const TABLE = "Concierge";

  const records = await selectRecords(TABLE);

  const data = records
    .map((r) => ({
      id: r.id,
      message: r.Message,
      email: r.Email,
      name: r.Name,
      status: r.Status,
      created: r.Created,
      updated: r.Updated,
      source: r.Source,
      context: r.Context,
    }))
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  return respond(200, { success: true, data });
});
