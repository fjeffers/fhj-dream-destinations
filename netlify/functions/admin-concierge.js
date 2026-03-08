// netlify/functions/admin-concierge.js
// Admin-facing concierge API: GET (list), PATCH (update status/reply), DELETE
const { supabase, respond } = require('./utils');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(204, {});

  try {
    const method = event.httpMethod;

    if (method === "GET") {
      const { status = "All", limit = 100, offset = 0, q = "" } = event.queryStringParameters || {};
      let query = supabase.from("concierge").select("*").order("created_at", { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);

      if (q && q.trim()) {
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

    if (method === "PUT" || method === "PATCH") {
      const payload = JSON.parse(event.body || "{}");
      const { id, status, reply } = payload;
      if (!id) return respond(400, { error: "id required" });

      const updates = {};
      if (typeof status !== "undefined") updates.status = status;
      if (typeof reply !== "undefined") updates.reply = reply;

      if (Object.keys(updates).length === 0) return respond(400, { error: "Nothing to update" });

      // Try with updated_at first, fall back without (column may not exist yet)
      let data, error;
      ({ data, error } = await supabase.from("concierge").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single());
      if (error) {
        console.warn("Update with updated_at failed, retrying without it:", error.message);
        ({ data, error } = await supabase.from("concierge").update(updates).eq("id", id).select().single());
      }
      if (error) throw error;
      return respond(200, { item: data });
    }

    if (method === "DELETE") {
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