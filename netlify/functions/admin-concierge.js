// netlify/functions/admin-concierge.js
// Admin-facing concierge API: GET (list), PATCH (update status/reply), DELETE (delete)
// Requires utils/supabaseServer.js exported supabase client using service role key.

import supabase from "../../utils/supabaseServer.js";

export const handler = async (event) => {
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

      return {
        statusCode: 200,
        body: JSON.stringify({ items: data || [] }),
      };
    }

    if (method === "PATCH") {
      // PATCH body: { id, status?, reply? }
      const payload = JSON.parse(event.body || "{}");
      const { id, status, reply } = payload;
      if (!id) return { statusCode: 400, body: JSON.stringify({ error: "id required" }) };

      const updates = {};
      if (typeof status !== "undefined") updates.status = status;
      if (typeof reply !== "undefined") updates.reply = reply;

      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase.from("concierge").update(updates).eq("id", id).select().single();
      if (error) throw error;

      return { statusCode: 200, body: JSON.stringify({ item: data }) };
    }

    if (method === "DELETE") {
      // DELETE expects query string ?id=...
      const params = event.queryStringParameters || {};
      const id = params.id || (event.body && JSON.parse(event.body).id);
      if (!id) return { statusCode: 400, body: JSON.stringify({ error: "id required" }) };

      const { data, error } = await supabase.from("concierge").delete().eq("id", id).select().single();
      if (error) throw error;

      return { statusCode: 200, body: JSON.stringify({ deleted: data }) };
    }

    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    console.error("admin-concierge error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};