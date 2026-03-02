// ==========================================================
// FILE: admin-events.js — Supabase Edition
// CRUD for Events table
// Location: netlify/functions/admin-events.js
// ==========================================================

const { selectRecords, submitToAirtable, updateAirtableRecord, deleteAirtableRecord, respond } = require("./utils");
const { requireAdminAuth } = require("./middleware");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return respond(200, {});
  }

  const authError = await requireAdminAuth(event);
  if (authError) return authError;

  const method = event.httpMethod;

  try {
    // GET: Fetch all events
    if (method === "GET") {
      const events = await selectRecords("Events");
      return respond(200, { events });
    }

    const payload = JSON.parse(event.body || "{}");

    // POST: Create event
    if (method === "POST") {
      const record = await submitToAirtable("Events", {
        Slug: payload.Slug || payload.slug || "",
        Title: payload.Title || payload.title || "",
        Date: payload.Date || payload.date || "",
        Time: payload.Time || payload.time || "",
        Location: payload.Location || payload.location || "",
        HostName: payload.HostName || payload.hostName || "",
        Description: payload.Description || payload.description || "",
        EventPic: payload.EventPic || payload.eventPic || "",
        Background: payload.Background || payload.background || "",
        ClientPic: payload.ClientPic || payload.clientPic || "",
        "Share Link": payload["Share Link"] || payload.shareLink || "",
        Active: payload.Active !== undefined ? payload.Active : true,
      });
      return respond(200, { success: true, id: record.id });
    }

    // PUT: Update event
    if (method === "PUT") {
      if (!payload.id) return respond(400, { error: "Missing event ID" });
      const updates = {};
      if (payload.Slug || payload.slug) updates.Slug = payload.Slug || payload.slug;
      if (payload.Title || payload.title) updates.Title = payload.Title || payload.title;
      if (payload.Date !== undefined || payload.date !== undefined) updates.Date = payload.Date || payload.date || "";
      if (payload.Time !== undefined || payload.time !== undefined) updates.Time = payload.Time || payload.time || "";
      if (payload.Location !== undefined || payload.location !== undefined) updates.Location = payload.Location || payload.location || "";
      if (payload.HostName !== undefined || payload.hostName !== undefined) updates.HostName = payload.HostName || payload.hostName || "";
      if (payload.Description !== undefined || payload.description !== undefined) updates.Description = payload.Description || payload.description || "";
      if (payload.EventPic !== undefined || payload.eventPic !== undefined) updates.EventPic = payload.EventPic || payload.eventPic || "";
      if (payload.Background !== undefined || payload.background !== undefined) updates.Background = payload.Background || payload.background || "";
      if (payload.ClientPic !== undefined || payload.clientPic !== undefined) updates.ClientPic = payload.ClientPic || payload.clientPic || "";
      if (payload["Share Link"] !== undefined || payload.shareLink !== undefined) updates["Share Link"] = payload["Share Link"] || payload.shareLink || "";
      if (payload.Active !== undefined) updates.Active = payload.Active;
      await updateAirtableRecord("Events", payload.id, updates);
      return respond(200, { success: true });
    }

    // DELETE: Remove event
    if (method === "DELETE") {
      if (!payload.id) return respond(400, { error: "Missing event ID" });
      await deleteAirtableRecord("Events", payload.id);
      return respond(200, { success: true });
    }

    return respond(405, { error: "Method not allowed" });
  } catch (err) {
    console.error("admin-events error:", err.message);
    return respond(500, { error: "Internal Server Error", details: err.message });
  }
};