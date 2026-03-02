// ==========================================================
// FILE: admin-users.js — Admin User CRUD
// Location: netlify/functions/admin-users.js
//
// GET    → list all admins
// POST   → create new admin
// PUT    → update admin (id in body)
// DELETE → delete admin (id in query or body)
// ==========================================================

const { supabase, respond } = require("./utils");
const { requireAdminAuth } = require("./middleware");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  const authError = await requireAdminAuth(event);
  if (authError) return authError;

  // ── GET: List all admins ─────────────────────────
  if (event.httpMethod === "GET") {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) return respond(500, { error: error.message });
      return respond(200, { admins: data || [] });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // ── POST: Create new admin ───────────────────────
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { name, email, role, password } = body;

      if (!name || !email || !password) {
        return respond(400, { error: "Name, email, and access code are required." });
      }

      // Check for duplicate email
      const { data: existing } = await supabase
        .from("admins")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (existing) {
        return respond(409, { error: "An admin with this email already exists." });
      }

      const { data, error } = await supabase
        .from("admins")
        .insert([{
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: role || "Agent",
          password: password,
        }])
        .select()
        .single();

      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, admin: data });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // ── PUT: Update admin ────────────────────────────
  if (event.httpMethod === "PUT") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { id, name, email, role, password } = body;

      if (!id) return respond(400, { error: "Admin ID is required." });

      const updates = {};
      if (name) updates.name = name.trim();
      if (email) updates.email = email.trim().toLowerCase();
      if (role) updates.role = role;
      if (password) updates.password = password;

      if (Object.keys(updates).length === 0) {
        return respond(400, { error: "No fields to update." });
      }

      const { data, error } = await supabase
        .from("admins")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, admin: data });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // ── DELETE: Remove admin ─────────────────────────
  if (event.httpMethod === "DELETE") {
    try {
      let id;
      // Support both query param and body
      if (event.queryStringParameters?.id) {
        id = event.queryStringParameters.id;
      } else {
        const body = JSON.parse(event.body || "{}");
        id = body.id;
      }

      if (!id) return respond(400, { error: "Admin ID is required." });

      const { error } = await supabase
        .from("admins")
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