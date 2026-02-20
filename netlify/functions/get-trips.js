// ==========================================================
// FILE: get-trips.js — Trips CRUD (Supabase)
// Location: netlify/functions/get-trips.js
// ==========================================================
const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  if (event.httpMethod === "GET") {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return respond(500, { error: error.message });
      return respond(200, { trips: data || [] });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { data, error } = await supabase
        .from("trips")
        .insert([body])
        .select()
        .single();
      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, trip: data });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  if (event.httpMethod === "PUT") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { id, ...fields } = body;
      if (!id) return respond(400, { error: "Trip ID required" });
      const { data, error } = await supabase
        .from("trips")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, trip: data });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  if (event.httpMethod === "DELETE") {
    try {
      const id = event.queryStringParameters?.id;
      if (!id) return respond(400, { error: "Trip ID required" });
      const { error } = await supabase.from("trips").delete().eq("id", id);
      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, deleted: id });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  return respond(405, { error: "Method not allowed" });
};