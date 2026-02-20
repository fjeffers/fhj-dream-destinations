// ==========================================================
// 📄 FILE: admin-clients.js  (BUILD OUT)
// Full CRUD for clients — used by AdminClients.jsx
// Location: netlify/functions/admin-clients.js
// ==========================================================

const {
  selectRecords,
  submitToAirtable,
  updateAirtableRecord,
  deleteAirtableRecord,
  normalizeClient,
  respond,
} = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async (event) => {
  const method = event.httpMethod;
  const payload = method !== "GET" ? JSON.parse(event.body || "{}") : {};

  // ⭐ Use "Client Name" — matches your Airtable table name
  const TABLE = "Client Name";

  // 🟢 GET: Fetch all clients
  if (method === "GET") {
    const clients = await selectRecords(TABLE, "", {
      normalizer: normalizeClient,
    });
    return respond(200, { clients });
  }

  // 🟡 POST: Create new client
  if (method === "POST") {
    if (!payload.name || !payload.email) {
      return respond(400, { error: "Name and email are required" });
    }

    const record = await submitToAirtable(TABLE, {
      "Full Name": payload.name,
      Email: payload.email,
      Phone: payload.phone || "",
      Address: payload.address || "",
    });

    return respond(200, { success: true, id: record.id });
  }

  // 🟠 PUT: Update client
  if (method === "PUT") {
    if (!payload.id) return respond(400, { error: "Missing client ID" });

    const updates = {};
    if (payload.name) updates["Full Name"] = payload.name;
    if (payload.email) updates.Email = payload.email;
    if (payload.phone !== undefined) updates.Phone = payload.phone;
    if (payload.address !== undefined) updates.Address = payload.address;
    if (payload.notes !== undefined) updates.Notes = payload.notes;

    await updateAirtableRecord(TABLE, payload.id, updates);
    return respond(200, { success: true });
  }

  // 🔴 DELETE: Remove client
  if (method === "DELETE") {
    if (!payload.id) return respond(400, { error: "Missing client ID" });

    await deleteAirtableRecord(TABLE, payload.id);
    return respond(200, { success: true });
  }

  return respond(405, { error: "Method not allowed" });
});
