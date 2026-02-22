// ==========================================================
// FILE: admin-clients.js - SUPABASE VERSION
// Full CRUD for clients using Supabase
// Location: netlify/functions/admin-clients.js
// ==========================================================
const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  const method = event.httpMethod;
  let payload = {};
  
  if (method !== "GET") {
    try {
      payload = JSON.parse(event.body || "{}");
    } catch (e) {
      return respond(400, { error: "Invalid JSON" });
    }
  }

  // GET: Fetch all clients
  if (method === "GET") {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return respond(500, { error: error.message });

      // Map to frontend-friendly format
      const clients = (data || []).map(c => ({
        id: c.id,
        name: c.full_name || c.name,
        email: c.email,
        phone: c.phone || "",
        address: c.address || "",
        notes: c.notes || "",
        createdAt: c.created_at,
      }));

      return respond(200, { clients });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // POST: Create new client
  if (method === "POST") {
    if (!payload.name || !payload.email) {
      return respond(400, { error: "Name and email are required" });
    }

    try {
      const { data, error } = await supabase
        .from("clients")
        .insert([{
          full_name: payload.name,
          email: payload.email,
          phone: payload.phone || "",
          address: payload.address || "",
          notes: payload.notes || "",
        }])
        .select()
        .single();

      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, id: data.id });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // PUT: Update client
  if (method === "PUT") {
    if (!payload.id) return respond(400, { error: "Missing client ID" });

    try {
      const updates = {};
      if (payload.name !== undefined) updates.full_name = payload.name;
      if (payload.email !== undefined) updates.email = payload.email;
      if (payload.phone !== undefined) updates.phone = payload.phone;
      if (payload.address !== undefined) updates.address = payload.address;
      if (payload.notes !== undefined) updates.notes = payload.notes;

      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", payload.id)
        .select()
        .single();

      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, client: data });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // DELETE: Remove client
  if (method === "DELETE") {
    if (!payload.id) return respond(400, { error: "Missing client ID" });

    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", payload.id);

      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  return respond(405, { error: "Method not allowed" });
};
