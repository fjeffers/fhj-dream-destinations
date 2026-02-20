// netlify/functions/admin-log.js
const { submitToAirtable, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async (event) => {
  const payload = JSON.parse(event.body || "{}");

  await submitToAirtable("AuditLog", {
    "Admin Email": payload.email,
    "Admin Role": payload.role,
    Action: payload.action,
    Target: payload.target,
    "Record ID": payload.recordId,
    Timestamp: new Date().toISOString(),
  });

  return respond(200, { success: true });
});
