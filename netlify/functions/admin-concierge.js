// netlify/functions/admin-concierge.js
// Admin-facing concierge API: GET (list), PATCH (update status/reply), DELETE (delete)
// Uses the Supabase service-role client from utils.js (SUPABASE_SERVICE_KEY env var).

const { supabase, respond } = require("./utils");
const { requireAdminAuth } = require("./middleware");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  const authError = await requireAdminAuth(event);
  if (authError) return authError;

  try {
    const method = event.httpMethod;

    if (method === "GET") {
      // optional query params: status (All, Unresolved, Resolved, Archived), limit, offset, q (search)
      const { status = "All", limit = 100, offset = 0, q = "" } = event.queryStringParameters || {};
      let query = supabase.from("concierge").select("*").order("created_at", { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);

      if (q && q.trim()) {
        // basic text search across name, email, message
        query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,message.ilike.%${q}%`);
      }

      if (status && status !== "All") {
        if (status === "Unresolved") {
          query = query.not("status", "eq", "Resolved").not("status", "eq", "Archived");
        } else {
          query = query.eq("status", status);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return respond(200, { items: data || [] });
    }

    if (method === "PATCH") {
      // PATCH body: { id, status?, reply? }
      const payload = JSON.parse(event.body || "{}");
      const { id, status, reply } = payload;
      if (!id) return respond(400, { error: "id required" });

      const updates = {};
      if (typeof status !== "undefined") updates.status = status;
      if (typeof reply !== "undefined") updates.reply = reply;

      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase.from("concierge").update(updates).eq("id", id).select().single();
      if (error) throw error;

      return respond(200, { item: data });
    }

    if (method === "DELETE") {
      // DELETE expects query string ?id=...
      const params = event.queryStringParameters || {};
      const id = params.id || (event.body && JSON.parse(event.body).id);
      if (!id) return respond(400, { error: "id required" });

      const { data, error } = await supabase.from("concierge").delete().eq("id", id).select().single();
      if (error) throw error;

      return respond(200, { deleted: data });
    }

    return respond(405, { error: "Method not allowed" });
  } catch (err) {
    console.error("admin-concierge error:", err);
    return respond(500, { error: err.message || String(err) });
  }
};