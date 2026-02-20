const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  const slug = event.queryStringParameters?.slug;
  if (!slug) return respond(400, { error: "Missing slug parameter" });

  try {
    const { data: evt, error: evtErr } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();

    if (evtErr || !evt) {
      return respond(404, { error: "Event not found" });
    }

    const { data: rsvps, error: rsvpErr } = await supabase
      .from("rsvps")
      .select("*")
      .eq("event_slug", slug)
      .order("created_at", { ascending: false });

    const totalGuests = (rsvps || []).reduce((sum, r) => sum + (r.guests || 1), 0);

    return respond(200, {
      event: evt,
      rsvps: rsvps || [],
      rsvpCount: (rsvps || []).length,
      totalGuests,
    });
  } catch (err) {
    console.error("get-event error:", err.message);
    return respond(500, { error: err.message });
  }
};
