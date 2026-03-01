// ==========================================================
// 📄 FILE: admin-concierge.js  (BUILD OUT)
// Full CRUD for concierge messages — used by AdminConcierge.jsx
// Location: netlify/functions/admin-concierge.js
// ==========================================================

const {
  selectRecords,
  submitToAirtable,
  updateAirtableRecord,
  deleteAirtableRecord,
  respond,
} = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async (event) => {
  const method = event.httpMethod;

  // 🟢 GET: Fetch all concierge messages
  if (method === "GET") {
    const records = await selectRecords("Concierge", "", { normalizer: true });

    const data = records
      .map((r) => ({
        id: r.id,
        message: r.Message || "",
        email: r.Email || "",
        name: r.Name || "",
        phone: r.Phone || r.phone || "",
        status: r.Status || "New",
        created: r.Created || r.createdTime || "",
        updated: r.Updated || r.Update || "",
        source: r.Source || "",
        context: r.Context || "",
      }))
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    return respond(200, { success: true, data });
  }

  const payload = JSON.parse(event.body || "{}");

  // 🟡 POST: Create a reply message
  if (method === "POST") {
    const { parentId, email, name, message, source } = payload;

    if (!message) {
      return respond(400, { error: "Message is required" });
    }

    const record = await submitToAirtable("Concierge", {
      Email: email || "",
      Name: name || "Admin",
      Message: message,
      Source: source || "Admin Reply",
      Status: "New",
      Context: parentId ? `Reply to ${parentId}` : "",
    });

    return respond(200, { success: true, id: record.id });
  }

  // 🟠 PUT: Update status (resolve/reopen/archive)
  if (method === "PUT") {
    const { id, status } = payload;

    if (!id) return respond(400, { error: "Missing message ID" });

    await updateAirtableRecord("Concierge", id, {
      Status: status || "Resolved",
    });

    return respond(200, { success: true });
  }

  // 🔴 DELETE: Remove a message permanently
  if (method === "DELETE") {
    const { id } = payload;

    if (!id) return respond(400, { error: "Missing message ID" });

    await deleteAirtableRecord("Concierge", id);

    return respond(200, { success: true });
  }

  return respond(405, { error: "Method not allowed" });
});
