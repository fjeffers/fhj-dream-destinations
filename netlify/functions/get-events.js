// ==========================================================
// 📄 FILE: get-events.js — Public event list
// Returns all active events from Supabase.
// Called by: AdminRSVPs.jsx (for filter dropdown)
// Location: netlify/functions/get-events.js
// ==========================================================

const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  try {
    const { data, error } = await supabase
      .from("events")
      .select("id, slug, title, date, time, location, host_name")
      .order("date", { ascending: false });

    if (error) {
      console.error("get-events error:", error.message);
      return respond(500, { error: error.message });
    }

    // Normalise to a consistent camelCase shape
    const events = (data || []).map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      date: row.date,
      time: row.time,
      location: row.location,
      hostName: row.host_name,
    }));

    return respond(200, { events });
  } catch (err) {
    console.error("get-events unhandled error:", err.message);
    return respond(500, { error: err.message });
  }
};
