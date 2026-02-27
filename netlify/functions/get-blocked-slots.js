// ==========================================================
// FILE: get-blocked-slots.js — Blocked Dates/Times (Supabase)
// Location: netlify/functions/get-blocked-slots.js
//
// Returns: { blockedDates: [...], blockedTimes: {...}, holidays: [...] }
// Also supports POST to add blocks and DELETE to remove them
// ==========================================================
const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  if (event.httpMethod === "GET") {
    try {
      const { data, error } = await supabase
        .from("blocked_slots")
        .select("*")
        .order("date", { ascending: true });

      if (error) return respond(500, { error: error.message });

      const rows = data || [];

      // Build the response format the frontend expects
      const blockedDates = [];
      const blockedTimes = {};
      const holidays = [];

      rows.forEach((row) => {
        if (row.block_type === "holiday") {
          holidays.push({ id: row.id, date: row.date, name: row.reason || "Holiday" });
          blockedDates.push({ id: row.id, date: row.date, reason: row.reason || "Holiday" });
        } else if (row.time) {
          // Time-specific block
          if (!blockedTimes[row.date]) blockedTimes[row.date] = [];
          blockedTimes[row.date].push({ id: row.id, time: row.time, reason: row.reason || "" });
        } else {
          // Full day block
          blockedDates.push({ id: row.id, date: row.date, reason: row.reason || "Blocked" });
        }
      });

      return respond(200, { blockedDates, blockedTimes, holidays });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { date, time, reason, block_type } = body;
      if (!date) return respond(400, { error: "Date is required" });

      const { data, error } = await supabase
        .from("blocked_slots")
        .insert([{
          date,
          time: time || null,
          reason: reason || "Blocked",
          block_type: block_type || (time ? "time" : "date"),
        }])
        .select()
        .single();

      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, slot: data });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  if (event.httpMethod === "DELETE") {
    try {
      const id = event.queryStringParameters?.id;
      const date = event.queryStringParameters?.date;
      const time = event.queryStringParameters?.time;

      if (id) {
        const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
        if (error) return respond(500, { error: error.message });
        return respond(200, { success: true, deleted: id });
      }

      if (date) {
        let query = supabase.from("blocked_slots").delete().eq("date", date);
        if (time) query = query.eq("time", time);
        const { error } = await query;
        if (error) return respond(500, { error: error.message });
        return respond(200, { success: true, deleted: { date, time } });
      }

      return respond(400, { error: "ID or date required" });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  return respond(405, { error: "Method not allowed" });
};