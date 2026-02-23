// netlify/functions/public-booking.js
// Public booking endpoint used by the /appointments page.
// Validates intake form, checks conflicts, creates client if new, creates booking.
// Uses utils/supabaseServer.js (server-side Supabase client).

import supabase from "../../utils/supabaseServer.js";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    const payload = JSON.parse(event.body || "{}");
    // expected: { client: { name, email, phone, notes? }, start, end, returningClientId?, deal_id?, notes? }
    const { client, start, end, returningClientId = null, deal_id = null, notes = "" } = payload;
    if (!start || !end || !client || !client.email || !client.name) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    // Conflict check: any booking overlapping requested start/end?
    const { data: conflicts, error: cErr } = await supabase
      .from("bookings")
      .select("*")
      .lt("start", end)
      .gt("end", start);

    if (cErr) throw cErr;
    if (conflicts && conflicts.length > 0) {
      return { statusCode: 409, body: JSON.stringify({ error: "Requested slot not available", conflicts }) };
    }

    // If returning client provided, use it; else create new client
    let clientId = returningClientId;
    if (!clientId) {
      const { data: newClient, error: icErr } = await supabase
        .from("clients")
        .insert([{
          name: client.name,
          email: client.email,
          phone: client.phone || null,
          notes: client.notes || null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (icErr) throw icErr;
      clientId = newClient.id;
    }

    // Insert booking
    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .insert([{
        client_id: clientId,
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone || null,
        start,
        end,
        type: "appointment",
        deal_id,
        notes,
        status: "confirmed",
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (bErr) throw bErr;

    return { statusCode: 201, body: JSON.stringify({ booking }) };
  } catch (err) {
    console.error("public-booking error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
