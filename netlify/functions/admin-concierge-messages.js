// netlify/functions/admin-concierge-messages.js
// Threaded conversation endpoints for concierge messages

const { supabase, respond } = require("./utils");
const { requireAdminAuth } = require("./middleware");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  const authError = await requireAdminAuth(event);
  if (authError) return authError;

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

      if (mErr) throw mErr;
      return respond(200, { messages: messages || [] });
    }

    if (method === "POST") {
      const payload = JSON.parse(event.body || "{}");
      const { concierge_id, sender, body, metadata = {} } = payload;
      if (!concierge_id || !sender || !body) return respond(400, { error: "concierge_id, sender, body required" });

      const insert = { concierge_id, sender, body, metadata, created_at: new Date().toISOString() };
      const { data: created, error: iErr } = await supabase.from("concierge_messages").insert([insert]).select().single();
      if (iErr) throw iErr;

      await supabase.from("concierge").update({ last_activity: new Date().toISOString(), conversation_open: true }).eq("id", concierge_id);
      return respond(201, { message: created });
    }

    return respond(405, { error: "Method not allowed" });
  } catch (err) {
    console.error("admin-concierge-messages error:", err);
    return respond(500, { error: err.message || String(err) });
  }
};
