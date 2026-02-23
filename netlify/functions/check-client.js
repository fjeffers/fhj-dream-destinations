// ==========================================================
// FILE: check-client.js — Check if client exists (Supabase)
// Location: netlify/functions/check-client.js
// POST { email } => { exists: true/false, client: {...} }
// ==========================================================

const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  const { email } = JSON.parse(event.body || "{}");
  if (!email) return respond(400, { error: "Email required" });

  const { data, error } = await supabase
    .from("clients")
    .select("id, full_name, email, phone")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) return respond(500, { error: error.message });
  return respond(200, { exists: !!data, client: data || null });
};
