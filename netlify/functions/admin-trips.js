// ==========================================================
// 📄 FILE: admin-trips.js  (BUILD OUT)
// Full CRUD for trips — used by AdminTrips.jsx
// Location: netlify/functions/admin-trips.js
// ==========================================================

const {
  selectRecords,
  submitToAirtable,
  updateAirtableRecord,
  deleteAirtableRecord,
  normalizeTrip,
  respond,
} = require("./utils");
const { withFHJAdmin } = require("./middleware");

exports.handler = withFHJAdmin(async (event) => {
  const method = event.httpMethod;
  const payload = method !== "GET" ? JSON.parse(event.body || "{}") : {};

  const TABLE = "Trips";

  // 🟢 GET: Fetch all trips
  if (method === "GET") {
    const trips = await selectRecords(TABLE, "", {
      normalizer: normalizeTrip,
    });
    return respond(200, { trips });
  }

  // 🟡 POST: Create new trip
  if (method === "POST") {
    const record = await submitToAirtable(TABLE, {
      Destination: payload.destination || "",
      Client: payload.client || "",
      client_email: payload.email || "",
      Phone: payload.phone || "",
      "Start Date": payload.startDate || null,
      "End Date": payload.endDate || null,
      "Trip Type": payload.tripType || "Individual",
      Status: payload.status || "Upcoming",
      Notes: payload.notes || "",
      Image: payload.image || "",
    });

    return respond(200, { success: true, id: record.id });
  }

  // 🟠 PUT: Update trip
  if (method === "PUT") {
    if (!payload.id) return respond(400, { error: "Missing trip ID" });

    const updates = {};
    if (payload.destination) updates.Destination = payload.destination;
    if (payload.client) updates.Client = payload.client;
    if (payload.email) updates.client_email = payload.email;
    if (payload.startDate) updates["Start Date"] = payload.startDate;
    if (payload.endDate) updates["End Date"] = payload.endDate;
    if (payload.tripType) updates["Trip Type"] = payload.tripType;
    if (payload.status) updates.Status = payload.status;
    if (payload.notes !== undefined) updates.Notes = payload.notes;
    if (payload.image) updates.Image = payload.image;

    await updateAirtableRecord(TABLE, payload.id, updates);
    return respond(200, { success: true });
  }

  // 🔴 DELETE: Remove trip
  if (method === "DELETE") {
    if (!payload.id) return respond(400, { error: "Missing trip ID" });

    await deleteAirtableRecord(TABLE, payload.id);
    return respond(200, { success: true });
  }

  return respond(405, { error: "Method not allowed" });
});
