// ==========================================================
// FILE: get-deals.js — Deals CRUD (Supabase) - FIXED
// Location: netlify/functions/get-deals.js
// ==========================================================
const { supabase, respond } = require("./utils");

// Helper to safely parse JSON fields - ALWAYS returns empty array if invalid
const parseJSON = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object' && value !== null) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  // GET — list all deals or single deal
  if (event.httpMethod === "GET") {
    try {
      const dealId = event.queryStringParameters?.id;
      
      let query = supabase.from("deals").select("*");
      
      if (dealId) {
        query = query.eq("id", dealId).single();
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        console.error("Supabase error:", error);
        return respond(500, { error: error.message });
      }

      // Map deal with proper field names and array parsing
      const mapDeal = (d) => ({
        ...d,
        "Trip Name": d.trip_name,
        "Category": d.category,
        "Price": d.price,
        "Place Image URL": d.place_image_url,
        "Notes": d.notes,
        "Active": d.active,
        "Duration": d.duration,
        "Location": d.location,
        "Departure Dates": d.departure_dates,
        "Highlights": parseJSON(d.highlights),
        "Itinerary": d.itinerary,
        "Inclusions": parseJSON(d.inclusions),
        "Exclusions": parseJSON(d.exclusions),
        "Additional Images": parseJSON(d.additional_images),
        "Accommodation": d.accommodation,
        "Max Guests": d.max_guests,
        "Difficulty Level": d.difficulty_level,
        "Best Time to Visit": d.best_time_to_visit,
        "Deposit Required": d.deposit_required,
        "Featured": d.featured,
      });

      if (dealId) {
        const deal = mapDeal(data);
        console.log("Returning single deal:", deal.id);
        return respond(200, { deal });
      } else {
        const deals = (data || []).map(mapDeal);
        console.log(`Returning ${deals.length} deals`);
        return respond(200, { deals });
      }
    } catch (err) {
      console.error("Handler error:", err);
      return respond(500, { error: err.message });
    }
  }

  // POST — create deal
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const fields = body.fields || body;

      const stringify = (val) => {
        if (val === null || val === undefined) return null;
        if (Array.isArray(val) || typeof val === 'object') {
          return JSON.stringify(val);
        }
        return val;
      };

      const insertData = {
        trip_name: fields["Trip Name"] || fields.trip_name || fields.tripName || "",
        category: fields["Category"] || fields.category || "Exclusive",
        price: String(fields["Price"] || fields.price || "0"),
        place_image_url: fields["Place Image URL"] || fields.place_image_url || fields.image || fields.image_url || "",
        notes: fields["Notes"] || fields.notes || fields.description || "",
        active: fields["Active"] !== undefined ? fields["Active"] : (fields.active !== undefined ? fields.active : true),
        duration: fields["Duration"] || fields.duration || null,
        location: fields["Location"] || fields.location || null,
        departure_dates: fields["Departure Dates"] || fields.departure_dates || null,
        highlights: stringify(fields["Highlights"] || fields.highlights || []),
        itinerary: fields["Itinerary"] || fields.itinerary || null,
        inclusions: stringify(fields["Inclusions"] || fields.inclusions || []),
        exclusions: stringify(fields["Exclusions"] || fields.exclusions || []),
        additional_images: stringify(fields["Additional Images"] || fields.additional_images || []),
        accommodation: fields["Accommodation"] || fields.accommodation || null,
        max_guests: fields["Max Guests"] || fields.max_guests || 2,
        difficulty_level: fields["Difficulty Level"] || fields.difficulty_level || null,
        best_time_to_visit: fields["Best Time to Visit"] || fields.best_time_to_visit || null,
        deposit_required: fields["Deposit Required"] || fields.deposit_required || null,
        featured: fields["Featured"] !== undefined ? fields["Featured"] : (fields.featured !== undefined ? fields.featured : false),
      };

      const { data, error } = await supabase
        .from("deals")
        .insert([insertData])
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

      const stringify = (val) => {
        if (val === null || val === undefined) return null;
        if (Array.isArray(val) || typeof val === 'object') {
          return JSON.stringify(val);
        }
        return val;
      };

      if (fields["Trip Name"] || fields.trip_name || fields.tripName)
        updates.trip_name = fields["Trip Name"] || fields.trip_name || fields.tripName;
      if (fields["Category"] || fields.category)
        updates.category = fields["Category"] || fields.category;
      if (fields["Price"] !== undefined || fields.price !== undefined)
        updates.price = String(fields["Price"] ?? fields.price ?? "0");
      if (fields["Place Image URL"] || fields.place_image_url || fields.image || fields.image_url)
        updates.place_image_url = fields["Place Image URL"] || fields.place_image_url || fields.image || fields.image_url;
      if (fields["Notes"] !== undefined || fields.notes !== undefined)
        updates.notes = fields["Notes"] ?? fields.notes ?? "";
      if (fields["Active"] !== undefined || fields.active !== undefined)
        updates.active = fields["Active"] ?? fields.active;
      if (fields["Duration"] !== undefined || fields.duration !== undefined)
        updates.duration = fields["Duration"] ?? fields.duration;
      if (fields["Location"] !== undefined || fields.location !== undefined)
        updates.location = fields["Location"] ?? fields.location;
      if (fields["Departure Dates"] !== undefined || fields.departure_dates !== undefined)
        updates.departure_dates = fields["Departure Dates"] ?? fields.departure_dates;
      if (fields["Highlights"] !== undefined || fields.highlights !== undefined)
        updates.highlights = stringify(fields["Highlights"] ?? fields.highlights ?? []);
      if (fields["Itinerary"] !== undefined || fields.itinerary !== undefined)
        updates.itinerary = fields["Itinerary"] ?? fields.itinerary;
      if (fields["Inclusions"] !== undefined || fields.inclusions !== undefined)
        updates.inclusions = stringify(fields["Inclusions"] ?? fields.inclusions ?? []);
      if (fields["Exclusions"] !== undefined || fields.exclusions !== undefined)
        updates.exclusions = stringify(fields["Exclusions"] ?? fields.exclusions ?? []);
      if (fields["Additional Images"] !== undefined || fields.additional_images !== undefined)
        updates.additional_images = stringify(fields["Additional Images"] ?? fields.additional_images ?? []);
      if (fields["Accommodation"] !== undefined || fields.accommodation !== undefined)
        updates.accommodation = fields["Accommodation"] ?? fields.accommodation;
      if (fields["Max Guests"] !== undefined || fields.max_guests !== undefined)
        updates.max_guests = fields["Max Guests"] ?? fields.max_guests;
      if (fields["Difficulty Level"] !== undefined || fields.difficulty_level !== undefined)
        updates.difficulty_level = fields["Difficulty Level"] ?? fields.difficulty_level;
      if (fields["Best Time to Visit"] !== undefined || fields.best_time_to_visit !== undefined)
        updates.best_time_to_visit = fields["Best Time to Visit"] ?? fields.best_time_to_visit;
      if (fields["Deposit Required"] !== undefined || fields.deposit_required !== undefined)
        updates.deposit_required = fields["Deposit Required"] ?? fields.deposit_required;
      if (fields["Featured"] !== undefined || fields.featured !== undefined)
        updates.featured = fields["Featured"] ?? fields.featured;

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
