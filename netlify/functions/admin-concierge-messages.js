// ==========================================================
// 📄 FILE: admin-concierge-messages.js
// Threaded conversation endpoints for concierge messages
// Location: netlify/functions/admin-concierge-messages.js
// ==========================================================

const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

const MESSAGES_TABLE = "concierge_messages";
const CONCIERGE_TABLE = "concierge";

exports.handler = withFHJ(async (event) => {
  const method = event.httpMethod;
  const qs = event.queryStringParameters || {};

  // ── GET: fetch all messages for a concierge thread ────────
  if (method === "GET") {
    const { concierge_id } = qs;
    if (!concierge_id) {
      return respond(400, { error: "concierge_id required" });
    }

    const { data: messages, error } = await supabase
      .from(MESSAGES_TABLE)
      .select("*")
      .eq("concierge_id", concierge_id)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    return respond(200, { messages: messages || [] });
  }

  // ── POST: add a new message to a concierge thread ─────────
  if (method === "POST") {
    const { concierge_id, sender, body, metadata = {} } =
      JSON.parse(event.body || "{}");

    if (!concierge_id || !sender || !body) {
      return respond(400, { error: "concierge_id, sender, body required" });
    }

    const now = new Date().toISOString();

    const { data: created, error: insertError } = await supabase
      .from(MESSAGES_TABLE)
      .insert([{ concierge_id, sender, body, metadata, created_at: now }])
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    // Update parent concierge row to reflect latest activity
    await supabase
      .from(CONCIERGE_TABLE)
      .update({ last_activity: now, conversation_open: true })
      .eq("id", concierge_id);

    return respond(201, { message: created });
  }

  return respond(405, { error: "Method not allowed" });
});
