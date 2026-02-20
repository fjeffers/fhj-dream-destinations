// ==========================================================
// FILE: get-deals.js — Deals CRUD (Supabase)
// Location: netlify/functions/get-deals.js
//
// Supabase columns: id, trip_name, category, price,
//   place_image_url, notes, active, created_at
// ==========================================================
const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  // GET — list all deals
  if (event.httpMethod === "GET") {
    try {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return respond(500, { error: error.message });

      // Map to frontend-friendly field names
      const deals = (data || []).map((d) => ({
        ...d,
        // Provide aliases so frontend can use clean names
        "Trip Name": d.trip_name,
        "Category": d.category,
        "Price": d.price,
        "Place Image URL": d.place_image_url,
        "Notes": d.notes,
        "Active": d.active,
      }));

      return respond(200, { deals });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // POST — create deal
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const fields = body.fields || body;

      const { data, error } = await supabase
        .from("deals")
        .insert([{
          trip_name: fields["Trip Name"] || fields.trip_name || fields.tripName || "",
          category: fields["Category"] || fields.category || fields.category || "Exclusive",
          price: String(fields["Price"] || fields.price || "0"),
          place_image_url: fields["Place Image URL"] || fields.place_image_url || fields.image || fields.image_url || "",
          notes: fields["Notes"] || fields.notes || fields.description || "",
          active: fields["Active"] !== undefined ? fields["Active"] : (fields.active !== undefined ? fields.active : true),
        }])
        .select()
        .single();

      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, id: data.id, deal: data });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // PUT — update deal
  if (event.httpMethod === "PUT") {
    try {
      const body = JSON.parse(event.body || "{}");
      const id = body.id;
      if (!id) return respond(400, { error: "Deal ID required" });

      const fields = body.fields || body;
      const updates = {};

      if (fields["Trip Name"] || fields.trip_name || fields.tripName)
        updates.trip_name = fields["Trip Name"] || fields.trip_name || fields.tripName;
      if (fields["Category"] || fields.category || fields.category)
        updates.category = fields["Category"] || fields.category || fields.category;
      if (fields["Price"] !== undefined || fields.price !== undefined)
        updates.price = String(fields["Price"] ?? fields.price ?? "0");
      if (fields["Place Image URL"] || fields.place_image_url || fields.image || fields.image_url)
        updates.place_image_url = fields["Place Image URL"] || fields.place_image_url || fields.image || fields.image_url;
      if (fields["notes"] !== undefined || fields.notes !== undefined)
        updates.notes = fields["notes"] ?? fields.notes ?? "";
      if (fields["Active"] !== undefined || fields.active !== undefined)
        updates.active = fields["Active"] ?? fields.active;

      if (Object.keys(updates).length === 0) {
        return respond(400, { error: "No fields to update" });
      }

      const { data, error } = await supabase
        .from("deals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, deal: data });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // DELETE
  if (event.httpMethod === "DELETE") {
    try {
      const body = JSON.parse(event.body || "{}");
      const id = body.id || event.queryStringParameters?.id;
      if (!id) return respond(400, { error: "Deal ID required" });

      const { error } = await supabase.from("deals").delete().eq("id", id);
      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, deleted: id });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  return respond(405, { error: "Method not allowed" });
};