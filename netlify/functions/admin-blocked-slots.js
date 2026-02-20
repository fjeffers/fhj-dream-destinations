const { selectRecords, submitToAirtable, deleteAirtableRecord, respond } = require("./utils");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }
  const method = event.httpMethod;
  try {
    if (method === "GET") {
      const records = await selectRecords("BlockedSlots");
      return { statusCode: 200, headers: { ...CORS, "Content-Type": "application/json" }, body: JSON.stringify({ slots: records }) };
    }
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { date, time, allDay, reason } = body;
      if (!date) return { statusCode: 400, headers: { ...CORS, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Date is required." }) };
      const fields = { Date: date, Active: true };
      if (allDay || !time || (Array.isArray(time) && time.length === 0)) { fields["All Day"] = true; } else { fields.Time = Array.isArray(time) ? time.join(", ") : time; fields["All Day"] = false; }
      if (reason) fields.Reason = reason;
      const record = await submitToAirtable("BlockedSlots", fields);
      return { statusCode: 200, headers: { ...CORS, "Content-Type": "application/json" }, body: JSON.stringify({ success: true, record }) };
    }
    if (method === "DELETE") {
      const body = JSON.parse(event.body || "{}");
      const { id } = body;
      if (!id) return { statusCode: 400, headers: { ...CORS, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Record ID is required." }) };
      await deleteAirtableRecord("BlockedSlots", id);
      return { statusCode: 200, headers: { ...CORS, "Content-Type": "application/json" }, body: JSON.stringify({ success: true, deleted: id }) };
    }
    return { statusCode: 405, headers: { ...CORS, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    console.error("admin-blocked-slots error:", err.message);
    return { statusCode: 500, headers: { ...CORS, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Failed.", detail: err.message }) };
  }
};
