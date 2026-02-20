// ==========================================================
// FILE: get-rsvps.js — Fetch RSVP Responses
// Location: netlify/functions/get-rsvps.js
//
// GET → all RSVPs (optionally filter by ?event=slug)
// DELETE → remove RSVP by ?id=xxx
// ==========================================================

const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  if (event.httpMethod === "GET") {
    try {
      let query = supabase
        .from("rsvps")
        .select("*")
        .order("created_at", { ascending: false });

      // Optional filter by event slug
      const eventSlug = event.queryStringParameters?.event;
      if (eventSlug) {
        query = query.eq("event_slug", eventSlug);
      }

      const { data, error } = await query;
      if (error) return respond(500, { error: error.message });

      return respond(200, { rsvps: data || [] });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  if (event.httpMethod === "DELETE") {
    try {
      const id = event.queryStringParameters?.id;
      if (!id) return respond(400, { error: "RSVP ID required" });

      const { error } = await supabase
        .from("rsvps")
        .delete()
        .eq("id", id);

      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, deleted: id });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  return respond(405, { error: "Method not allowed" });
};