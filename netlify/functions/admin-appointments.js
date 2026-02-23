// Admin Netlify function — detects whether bookings has end_time or end column
import supabase from "../../utils/supabaseServer.js";

/**
 * Returns 'end_time' if that column exists, otherwise 'end'.
 * Uses information_schema.columns (requires service-role DB access).
 */
async function getEndColumn() {
  try {
    const { data, error } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_schema", "public")
      .eq("table_name", "bookings");

    if (error) {
      console.warn("information_schema query error:", error);
      return "end"; // fallback
    }

    const cols = (data || []).map((c) => c.column_name);
    if (cols.includes("end_time")) return "end_time";
    if (cols.includes("end")) return "end";
    return "end";
  } catch (err) {
    console.warn("getEndColumn failed:", err);
    return "end";
  }
}

export const handler = async (event) => {
  try {
    const method = event.httpMethod;
    const endCol = await getEndColumn();

    // GET: ?start=ISO&end=ISO  => returns bookings (mapped to include `end`) and blocked_slots
    if (method === "GET") {
      const { start, end } = event.queryStringParameters || {};
      if (!start || !end) return { statusCode: 400, body: JSON.stringify({ error: "start and end required" }) };

      // Overlap query: booking.start < end AND booking.[endCol] > start
      const { data: bookings, error: bErr } = await supabase
        .from("bookings")
        .select("*")
        .lt("start", end)
        .gt(endCol, start);

      if (bErr) throw bErr;

      // blocked_slots: try to use end_time if available, otherwise fall back to end (or assuming start/end_time)
      const { data: blocks, error: blErr } = await supabase
        .from("blocked_slots")
        .select("*")
        .lt("start", end)
        .gt("end_time", start);

      if (blErr) {
        // If blocked_slots doesn't have end_time, ignore the blocks fetch error but continue
        console.warn("blocked_slots fetch error (ignored):", blErr);
      }

      // Map rows so frontend always gets `end` property (calendar expects event.end)
      const bookingsMapped = (bookings || []).map((b) => ({
        ...b,
        end: b[endCol] || b.end_time || b.end,
      }));

      return { statusCode: 200, body: JSON.stringify({ bookings: bookingsMapped, blocked_slots: blocks || [] }) };
    }

    // POST: create booking (admin)
    if (method === "POST") {
      const payload = JSON.parse(event.body || "{}");
      const { start, end, client_id, client_name, client_email, client_phone, deal_id, notes, type = "appointment" } = payload;
      if (!start || !end) return { statusCode: 400, body: JSON.stringify({ error: "start and end required" }) };

      // Conflict check
      const { data: conflicts, error: cErr } = await supabase
        .from("bookings")
        .select("*")
        .lt("start", end)
        .gt(endCol, start);

      if (cErr) throw cErr;
      if (conflicts && conflicts.length > 0) {
        return { statusCode: 409, body: JSON.stringify({ error: "Conflict with existing booking.", conflicts }) };
      }

      // Build insert object dynamically to set correct end column name
      const insertObj = {
        client_id: client_id || null,
        client_name: client_name || null,
        client_email: client_email || null,
        client_phone: client_phone || null,
        start,
        type,
        deal_id: deal_id || null,
        notes: notes || null,
        status: "confirmed",
        created_at: new Date().toISOString(),
      };
      insertObj[endCol] = end; // set either end_time or end

      const { data: created, error: iErr } = await supabase.from("bookings").insert([insertObj]).select().single();
      if (iErr) throw iErr;

      // Ensure returned object includes `end`
      const createdMapped = { ...created, end: created[endCol] || created.end_time || created.end };
      return { statusCode: 201, body: JSON.stringify({ booking: createdMapped }) };
    }

    // PUT: update booking (minimal)
    if (method === "PUT") {
      const payload = JSON.parse(event.body || "{}");
      const { id, ...updates } = payload;
      if (!id) return { statusCode: 400, body: JSON.stringify({ error: "id required" }) };

      // If client passed `end`, map it to the correct column
      if (updates.end) {
        updates[endCol] = updates.end;
        delete updates.end;
      }

      const { data, error } = await supabase.from("bookings").update(updates).eq("id", id).select().single();
      if (error) throw error;

      const mapped = { ...data, end: data[endCol] || data.end_time || data.end };
      return { statusCode: 200, body: JSON.stringify({ booking: mapped }) };
    }

    // DELETE
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
