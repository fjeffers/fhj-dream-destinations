// netlify/functions/admin-appointments.js
// Admin-facing bookings API (GET / POST / PUT / DELETE).
// Uses utils/supabaseServer.js (server-side Supabase client).
// Note: keep this function protected by your admin auth in production.

import supabase from "../../utils/supabaseServer.js";

export const handler = async (event) => {
  try {
    const method = event.httpMethod;

    // GET ?start=ISO&end=ISO => returns bookings + blocked_slots
    if (method === "GET") {
      const { start, end } = event.queryStringParameters || {};
      if (!start || !end) {
        return { statusCode: 400, body: JSON.stringify({ error: "start and end are required" }) };
      }

      // Fetch bookings overlapping the requested window:
      // overlap condition: booking.start < end && booking.end > start
      const { data: bookings, error: bErr } = await supabase
        .from("bookings")
        .select("*")
        .lt("start", end)
        .gt("end", start);

      if (bErr) throw bErr;

      // Fetch blocked slots within the date window.
      // Adapt this filter to your blocked_slots schema (date or start/end fields)
      const { data: blocks, error: blErr } = await supabase
        .from("blocked_slots")
        .select("*")
        .gte("date", start.slice(0, 10))
        .lte("date", end.slice(0, 10));

      if (blErr) throw blErr;

      return { statusCode: 200, body: JSON.stringify({ bookings: bookings || [], blocked_slots: blocks || [] }) };
    }

    // Create booking or blocked slot (admin)
    if (method === "POST") {
      const payload = JSON.parse(event.body || "{}");
      const { type = "appointment", start, end, client_id, client_name, client_email, client_phone, deal_id, notes } = payload;

      if (!start || !end) {
        return { statusCode: 400, body: JSON.stringify({ error: "start and end required" }) };
      }

      // Conflict check: any booking overlapping requested start/end?
      const { data: conflicts, error: cErr } = await supabase
        .from("bookings")
        .select("*")
        .lt("start", end)
        .gt("end", start);

      if (cErr) throw cErr;
      if (conflicts && conflicts.length > 0) {
        return { statusCode: 409, body: JSON.stringify({ error: "Conflict with existing booking.", conflicts }) };
      }

      const insert = {
        client_id: client_id || null,
        client_name: client_name || null,
        client_email: client_email || null,
        client_phone: client_phone || null,
        start,
        end,
        type,
        deal_id: deal_id || null,
        notes: notes || null,
        status: "confirmed",
        created_at: new Date().toISOString(),
      };

      const { data: created, error: iErr } = await supabase.from("bookings").insert([insert]).select().single();
      if (iErr) throw iErr;

      return { statusCode: 201, body: JSON.stringify({ booking: created }) };
    }

    // Update booking
    if (method === "PUT") {
      const payload = JSON.parse(event.body || "{}");
      const { id, ...updates } = payload;
      if (!id) return { statusCode: 400, body: JSON.stringify({ error: "id required" }) };

      // Optionally perform conflict checks when changing start/end — left as a TODO
      const { data, error } = await supabase.from("bookings").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify({ booking: data }) };
    }

    // Delete booking
    if (method === "DELETE") {
      const { id } = event.queryStringParameters || {};
      if (!id) return { statusCode: 400, body: JSON.stringify({ error: "id required" }) };
      const { data, error } = await supabase.from("bookings").delete().eq("id", id).select().single();
      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify({ deleted: data }) };
    }

    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    console.error("admin-appointments error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
