const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  const method = event.httpMethod;
  try {
    if (method === "GET") {
      const { data, error } = await supabase
        .from("blocked_slots")
        .select("*")
        .order("date", { ascending: true });
      if (error) return respond(500, { error: error.message });
      return respond(200, { slots: data || [] });
    }

    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { date, time, allDay, reason, block_type } = body;
      if (!date) return respond(400, { error: "Date is required." });

      const times = Array.isArray(time) ? time : (time ? [time] : []);
      const isAllDay = allDay === true || times.length === 0;

      if (isAllDay) {
        const { data, error } = await supabase
          .from("blocked_slots")
          .insert([{
            date,
            time: null,
            all_day: true,
            block_type: block_type || "all_day",
            reason: reason || "Blocked",
            active: true,
          }])
          .select();
        if (error) return respond(500, { error: error.message });
        return respond(200, { success: true, slots: data });
      }

      // Multiple time slots
      const rows = times.map((t) => ({
        date,
        time: t,
        all_day: false,
        block_type: block_type || "time",
        reason: reason || "Blocked",
        active: true,
      }));
      const { data, error } = await supabase
        .from("blocked_slots")
        .insert(rows)
        .select();
      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, slots: data });
    }

    if (method === "DELETE") {
      const body = JSON.parse(event.body || "{}");
      const id = body.id || event.queryStringParameters?.id;
      if (!id) return respond(400, { error: "Record ID is required." });
      const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, deleted: id });
    }

    return respond(405, { error: "Method not allowed" });
  } catch (err) {
    console.error("admin-blocked-slots error:", err.message);
    return respond(500, { error: "Failed.", detail: err.message });
  }
};
