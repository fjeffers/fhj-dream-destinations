// ==========================================================
// FILE: get-concierge.js — Concierge CRUD (Supabase)
// Location: netlify/functions/get-concierge.js
// ==========================================================
const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  if (event.httpMethod === "GET") {
    try {
      const { data, error } = await supabase
        .from("concierge")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return respond(500, { error: error.message });
      return respond(200, { concierge: data || [] });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { data, error } = await supabase
        .from("concierge")
        .insert([{
          name: body.name || body.Name || "",
          email: body.email || body.Email || "",
          message: body.message || body.Message || "",
          source: body.source || body.Source || "Website",
          status: body.status || body.Status || "New",
          context: body.context || body.Context || "",
        }])
        .select()
        .single();
      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, record: data });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  if (event.httpMethod === "PUT") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { id, ...fields } = body;
      if (!id) return respond(400, { error: "Record ID required" });
      const { data, error } = await supabase
        .from("concierge")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, record: data });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  if (event.httpMethod === "DELETE") {
    try {
      const id = event.queryStringParameters?.id;
      if (!id) return respond(400, { error: "Record ID required" });
      const { error } = await supabase.from("concierge").delete().eq("id", id);
      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, deleted: id });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  return respond(405, { error: "Method not allowed" });
};