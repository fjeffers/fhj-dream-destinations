// netlify/functions/admin-concierge-messages.js
// Threaded conversation endpoints for concierge messages
import supabase from "../../utils/supabaseServer.js";

export const handler = async (event) => {
  try {
    const method = event.httpMethod;
    const qs = event.queryStringParameters || {};

    if (method === "GET") {
      const concierge_id = qs.concierge_id;
      if (!concierge_id) return { statusCode: 400, body: JSON.stringify({ error: "concierge_id required" }) };

      const { data: messages, error: mErr } = await supabase
        .from("concierge_messages")
        .select("*")
        .eq("concierge_id", concierge_id)
        .order("created_at", { ascending: true });

      if (mErr) throw mErr;
      return { statusCode: 200, body: JSON.stringify({ messages: messages || [] }) };
    }

    if (method === "POST") {
      const payload = JSON.parse(event.body || "{}");
      const { concierge_id, sender, body, metadata = {} } = payload;
      if (!concierge_id || !sender || !body) return { statusCode: 400, body: JSON.stringify({ error: "concierge_id, sender, body required" }) };

      const insert = { concierge_id, sender, body, metadata, created_at: new Date().toISOString() };
      const { data: created, error: iErr } = await supabase.from("concierge_messages").insert([insert]).select().single();
      if (iErr) throw iErr;

      await supabase.from("concierge").update({ last_activity: new Date().toISOString(), conversation_open: true }).eq("id", concierge_id);
      return { statusCode: 201, body: JSON.stringify({ message: created }) };
    }

    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    console.error("admin-concierge-messages error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
