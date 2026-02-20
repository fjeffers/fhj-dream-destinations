// ==========================================================
// 📄 FILE: rsvp.js (FIXED - matches Airtable RSVPs schema)
// Full CRUD for RSVPs
// Location: netlify/functions/rsvp.js
//
// Airtable RSVPs columns:
//   Name, Phone, Event Title, Attending, Guest Count,
//   Guests, Attachments, Dietary Restrictions, Notes,
//   Status, QR Payload
// ==========================================================

const {
  selectRecords,
  submitToAirtable,
  updateAirtableRecord,
  deleteAirtableRecord,
  respond,
} = require("./utils");

exports.handler = async (event) => {
  const method = event.httpMethod;
  const payload = method !== "GET" ? JSON.parse(event.body || "{}") : {};
  const params = event.queryStringParameters || {};

  // 🟢 GET: Fetch RSVPs (optionally filtered by event)
  if (method === "GET") {
    let filterFormula = "";

    if (params.eventId) {
      // Filter by linked Event record ID
      filterFormula = `FIND("${params.eventId}", ARRAYJOIN({Event})) > 0`;
    }

    if (params.eventTitle) {
      // Alternative: filter by Event Title text field
      filterFormula = `{Event Title} = "${params.eventTitle}"`;
    }

    const rsvps = await selectRecords("RSVPs", filterFormula, { normalizer: true });
    return respond(200, { rsvps });
  }

  // 🟡 POST: Create new RSVP
  if (method === "POST") {
    try {
      if (!payload.name) {
        return respond(400, { error: "Missing required field: name" });
      }

      const fields = {
        Name: payload.name.trim(),
        Phone: payload.phone || "",
        "Event Title": payload.eventTitle || "",
        Attending: payload.attending === "Attending" || payload.attending === true ? "Yes" : "No",
        "Guest Count": payload.guestCount ? Number(payload.guestCount) : payload.guests ? Number(payload.guests) : 1,
        Guests: payload.guests ? Number(payload.guests) : payload.guestCount ? Number(payload.guestCount) : 1,
        "Dietary Restrictions": payload.dietaryRestrictions || "",
        Notes: payload.notes || "",
        Status: payload.status || (payload.attending === "Attending" ? "Confirmed" : "Declined"),
        "QR Payload": payload.qrPayload || "",
      };

      // If there's an email field in your table (check Airtable — not visible in screenshot)
      if (payload.email) fields.Email = payload.email.trim();

      // If Event is a linked record field
      if (payload.eventId) fields.Event = [payload.eventId];

      const record = await submitToAirtable("RSVPs", fields);

      return respond(200, {
        success: true,
        rsvpId: record.id,
        id: record.id,
        message: "RSVP submitted successfully",
      });
    } catch (err) {
      console.error("RSVP submission error:", err);
      return respond(500, { error: "Failed to submit RSVP: " + err.message });
    }
  }

  // 🟠 PUT: Update RSVP
  if (method === "PUT") {
    if (!payload.id) return respond(400, { error: "Missing RSVP ID" });

    try {
      const updates = {};
      if (payload.name) updates.Name = payload.name;
      if (payload.phone !== undefined) updates.Phone = payload.phone;
      if (payload.eventTitle) updates["Event Title"] = payload.eventTitle;
      if (payload.attending !== undefined) {
        updates.Attending = payload.attending === "Attending" || payload.attending === true ? "Yes" : "No";
      }
      if (payload.guestCount !== undefined) {
        updates["Guest Count"] = Number(payload.guestCount);
        updates.Guests = Number(payload.guestCount);
      }
      if (payload.guests !== undefined) {
        updates.Guests = Number(payload.guests);
        updates["Guest Count"] = Number(payload.guests);
      }
      if (payload.dietaryRestrictions !== undefined) updates["Dietary Restrictions"] = payload.dietaryRestrictions;
      if (payload.notes !== undefined) updates.Notes = payload.notes;
      if (payload.status) updates.Status = payload.status;
      if (payload.qrPayload) updates["QR Payload"] = payload.qrPayload;
      if (payload.email) updates.Email = payload.email;

      await updateAirtableRecord("RSVPs", payload.id, updates);
      return respond(200, { success: true });
    } catch (err) {
      console.error("RSVP update error:", err);
      return respond(500, { error: "Failed to update RSVP" });
    }
  }

  // 🔴 DELETE: Remove RSVP
  if (method === "DELETE") {
    if (!payload.id) return respond(400, { error: "Missing RSVP ID" });

    try {
      await deleteAirtableRecord("RSVPs", payload.id);
      return respond(200, { success: true });
    } catch (err) {
      console.error("RSVP deletion error:", err);
      return respond(500, { error: "Failed to delete RSVP" });
    }
  }

  return respond(405, { error: "Method not allowed" });
};