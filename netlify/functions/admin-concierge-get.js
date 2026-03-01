// ==========================================================
// 📄 FILE: admin-concierge-get.js
// GET all concierge messages — Supabase direct edition
// Location: netlify/functions/admin-concierge-get.js
// ==========================================================

const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

const TABLE = "concierge";

exports.handler = withFHJ(async () => {
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
});
