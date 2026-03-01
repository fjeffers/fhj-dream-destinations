// ==========================================================
// 📄 FILE: admin-concierge.js
// Full CRUD for concierge messages — Supabase direct edition
// Location: netlify/functions/admin-concierge.js
// ==========================================================

const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

const TABLE = "concierge";

exports.handler = withFHJ(async (event) => {
  const method = event.httpMethod;

  // 🟢 GET: Fetch all concierge messages
  if (method === "GET") {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const records = (data || []).map((r) => ({
      id: r.id,
      message: r.message || "",
      email: r.email || "",
      name: r.name || "",
      phone: r.phone || "",
      status: r.status || "New",
      created: r.created_at || "",
      updated: r.updated_at || "",
      source: r.source || "",
      context: r.context || "",
    }));

    return respond(200, { success: true, data: records });
  }

  const payload = JSON.parse(event.body || "{}");

  // 🟡 POST: Create a reply message
  if (method === "POST") {
    const { parentId, email, name, message, source } = payload;

    if (!message) {
      return respond(400, { error: "Message is required" });
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert([{
        email: email || "",
        name: name || "Admin",
        message,
        source: source || "Admin Reply",
        status: "New",
        context: parentId ? `Reply to ${parentId}` : "",
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return respond(200, { success: true, id: data.id });
  }

  // 🟠 PUT: Update status (resolve / reopen / archive)
  if (method === "PUT") {
    const { id, status } = payload;

    if (!id) return respond(400, { error: "Missing message ID" });

    const { error } = await supabase
      .from(TABLE)
      .update({ status: status || "Resolved" })
      .eq("id", id);

    if (error) throw new Error(error.message);

    return respond(200, { success: true });
  }

  // 🔴 DELETE: Remove a message permanently
  if (method === "DELETE") {
    const { id } = payload;

    if (!id) return respond(400, { error: "Missing message ID" });

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    return respond(200, { success: true });
  }

  return respond(405, { error: "Method not allowed" });
});
