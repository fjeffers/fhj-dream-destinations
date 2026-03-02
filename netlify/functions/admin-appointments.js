// ==========================================================
// FILE: admin-appointments.js  (FIXED — CommonJS, correct Supabase columns)
// Location: netlify/functions/admin-appointments.js
// ==========================================================

const { supabase, respond } = require("./utils");
const { requireAdminAuth } = require("./middleware");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  const authError = await requireAdminAuth(event);
  if (authError) return authError;

  const method = event.httpMethod;
  const params = event.queryStringParameters || {};

  // GET — fetch bookings for a date range
  if (method === "GET") {
    const { start, end } = params;
    const startDate = start ? start.split("T")[0] : null;
    const endDate = end ? end.split("T")[0] : null;

    let query = supabase.from("bookings").select("*").order("date", { ascending: true });
    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    const { data: bookings, error: bErr } = await query;
    if (bErr) return respond(500, { error: bErr.message });

    // Gracefully handle missing blocked_slots table
    let blocked_slots = [];
    try {
      const { data: bs } = await supabase.from("blocked_slots").select("*");
      blocked_slots = bs || [];
    } catch (_) {}

    return respond(200, { bookings: bookings || [], blocked_slots });
  }

  // POST — create appointment or block
  if (method === "POST") {
    let body;
    try { body = JSON.parse(event.body || "{}"); } catch { return respond(400, { error: "Invalid body" }); }

    const { client_name, client, client_email, email, client_phone, phone, date, time, start, type, notes, status, destination } = body;

    const clientName = client_name || client || "";
    const clientEmail = client_email || email || "";
    const clientPhone = client_phone || phone || "";

    // Derive date/time from either flat fields or ISO start
    const dateVal = date || (start ? start.split("T")[0] : null);
    const timeVal = time || (start ? (() => {
      const d = new Date(start);
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    })() : null);

    if (!dateVal) return respond(400, { error: "date required" });

    const { data, error } = await supabase.from("bookings").insert([{
      client: clientName,
      email: clientEmail,
      phone: clientPhone,
      date: dateVal,
      time: timeVal || "",
      destination: destination || "",
      type: type || "appointment",
      status: status || "confirmed",
      notes: notes || "",
    }]).select().single();

    if (error) return respond(500, { error: error.message });
    return respond(200, { success: true, booking: data });
  }

  // PUT — update appointment
  if (method === "PUT") {
    let body;
    try { body = JSON.parse(event.body || "{}"); } catch { return respond(400, { error: "Invalid body" }); }
    const { id, ...updates } = body;
    if (!id) return respond(400, { error: "id required" });

    // Normalize field names
    if (updates.client_name && !updates.client) { updates.client = updates.client_name; delete updates.client_name; }
    if (updates.client_email && !updates.email) { updates.email = updates.client_email; delete updates.client_email; }
    if (updates.client_phone && !updates.phone) { updates.phone = updates.client_phone; delete updates.client_phone; }

    const { error } = await supabase.from("bookings").update(updates).eq("id", id);
    if (error) return respond(500, { error: error.message });
    return respond(200, { success: true });
  }

  // DELETE — remove appointment
  if (method === "DELETE") {
    const { id } = params;
    if (!id) return respond(400, { error: "id required" });
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) return respond(500, { error: error.message });
    return respond(200, { success: true });
  }

  return respond(405, { error: "Method not allowed" });
};
