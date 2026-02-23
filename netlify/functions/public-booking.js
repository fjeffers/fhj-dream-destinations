// Public booking function — detects end column, creates client if needed, inserts booking
import supabase from "../../utils/supabaseServer.js";

async function getEndColumn() {
  try {
    const { data, error } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_schema", "public")
      .eq("table_name", "bookings");

    if (error) {
      console.warn("information_schema query error:", error);
      return "end";
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
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    const endCol = await getEndColumn();

    const payload = JSON.parse(event.body || "{}");
    const { client, start, end, returningClientId = null, deal_id = null, notes = "" } = payload;
    if (!client || !client.name || !client.email || !start || !end) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    // Conflict check
    const { data: conflicts, error: cErr } = await supabase
      .from("bookings")
      .select("*")
      .lt("start", end)
      .gt(endCol, start);

    if (cErr) throw cErr;
    if (conflicts && conflicts.length > 0) {
      return { statusCode: 409, body: JSON.stringify({ error: "Requested slot not available", conflicts }) };
    }

    // Create client if necessary
    let clientId = returningClientId;
    if (!clientId) {
      const { data: newClient, error: icErr } = await supabase
        .from("clients")
        .insert([
          {
            name: client.name,
            email: client.email,
            phone: client.phone || null,
            notes: client.notes || null,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (icErr) throw icErr;
      clientId = newClient.id;
    }

    // Insert booking with correct end column
    const insertObj = {
      client_id: clientId,
      client_name: client.name,
      client_email: client.email,
      client_phone: client.phone || null,
      start,
      type: "appointment",
      deal_id,
      notes,
      status: "confirmed",
      created_at: new Date().toISOString(),
    };
    insertObj[endCol] = end;

    const { data: booking, error: bErr } = await supabase.from("bookings").insert([insertObj]).select().single();
    if (bErr) throw bErr;

    const bookingMapped = { ...booking, end: booking[endCol] || booking.end_time || booking.end };
    return { statusCode: 201, body: JSON.stringify({ booking: bookingMapped }) };
  } catch (err) {
    console.error("public-booking error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
