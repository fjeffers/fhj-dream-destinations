// ==========================================================
// 📄 FILE: admin-concierge.js
// Admin-facing concierge API: GET (list+search), PATCH (status/reply), DELETE
// Location: netlify/functions/admin-concierge.js
// ==========================================================

const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

const TABLE = "concierge";

exports.handler = withFHJ(async (event) => {
  const method = event.httpMethod;

  // ── GET: list with optional search / status filter / pagination ──
  if (method === "GET") {
    const { status = "All", limit = 100, offset = 0, q = "" } =
      event.queryStringParameters || {};

    let query = supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (q && q.trim()) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,message.ilike.%${q}%`);
    }

    if (status && status !== "All") {
      if (status === "Unresolved") {
        query = query
          .not("status", "eq", "Resolved")
          .not("status", "eq", "Archived");
      } else {
        query = query.eq("status", status);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return respond(200, { items: data || [] });
  }

  // ── PATCH: update status and/or reply ────────────────────────────
  if (method === "PATCH") {
    const { id, status, reply } = JSON.parse(event.body || "{}");

    if (!id) return respond(400, { error: "id required" });

    const updates = { updated_at: new Date().toISOString() };
    if (typeof status !== "undefined") updates.status = status;
    if (typeof reply  !== "undefined") updates.reply  = reply;

    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return respond(200, { item: data });
  }

  // ── DELETE: remove a message permanently ─────────────────────────
  if (method === "DELETE") {
    const qs = event.queryStringParameters || {};
    const id =
      qs.id ||
      (event.body && JSON.parse(event.body).id);

    if (!id) return respond(400, { error: "id required" });

    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return respond(200, { deleted: data });
  }

  return respond(405, { error: "Method not allowed" });
});
