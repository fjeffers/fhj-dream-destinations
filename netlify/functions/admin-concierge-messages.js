// netlify/functions/admin-concierge-messages.js
// Threaded conversation endpoints for concierge messages
const { supabase, respond } = require('./utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(204, {});

  try {
    const method = event.httpMethod;
    const qs = event.queryStringParameters || {};

    if (method === "GET") {
      const concierge_id = qs.concierge_id;
      if (!concierge_id) return respond(400, { error: "concierge_id required" });

      const { data: messages, error: mErr } = await supabase
        .from("concierge_messages")
        .select("*")
        .eq("concierge_id", concierge_id)
        .order("created_at", { ascending: true });

      if (mErr) {
        // If created_at column doesn't exist, retry without ordering
        const { data: msgs2, error: mErr2 } = await supabase
          .from("concierge_messages")
          .select("*")
          .eq("concierge_id", concierge_id);
        if (mErr2) throw mErr2;
        return respond(200, { messages: msgs2 || [] });
      }
      return respond(200, { messages: messages || [] });
    }

    if (method === "POST") {
      const payload = JSON.parse(event.body || "{}");
      const { concierge_id, sender, body, metadata = {} } = payload;
      if (!concierge_id || !sender || !body) return respond(400, { error: "concierge_id, sender, body required" });

      // Insert without created_at — let DB default handle it
      const insert = { concierge_id, sender, body, metadata };
      const { data: created, error: iErr } = await supabase.from("concierge_messages").insert([insert]).select().single();
      if (iErr) throw iErr;

      // Try updating parent concierge row (columns may not exist)
      try {
        await supabase.from("concierge").update({ last_activity: new Date().toISOString(), conversation_open: true }).eq("id", concierge_id);
      } catch (e) {
        console.warn("Optional columns update failed (last_activity/conversation_open may not exist):", e.message);
      }
      return respond(201, { message: created });
    }

    return respond(405, { error: "Method not allowed" });
  } catch (err) {
    console.error("admin-concierge-messages error:", err);
    return respond(500, { error: err.message || String(err) });
  }
};
