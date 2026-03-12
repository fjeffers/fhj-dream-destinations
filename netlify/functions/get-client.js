// ==========================================================
// FILE: get-clients.js — Clients CRUD (Supabase)
// Location: netlify/functions/get-clients.js
// ==========================================================
const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  // GET — list all clients
  if (event.httpMethod === "GET") {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return respond(500, { error: error.message });
      return respond(200, { clients: data || [] });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // POST — create client
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const fullName = (body.full_name || body.name || body["Full Name"] || "").trim();
      const email = (body.email || body.Email || "").trim().toLowerCase();
      const phone = body.phone || body.Phone || "";

      const { data, error } = await supabase
        .from("clients")
        .insert([{
          full_name: fullName,
          email,
          phone,
          status: body.status || body.Status || "Active",
          notes: body.notes || body.Notes || "",
          tags: body.tags || body.Tags || "",
          address: body.address || body.Address || "",
        }])
        .select()
        .single();
      if (error) return respond(500, { error: error.message });

      // Auto-create client_login record
      if (email) {
        const firstName = fullName.split(" ")[0] || "Client";
        const lastFour = phone.replace(/\D/g, "").slice(-4);
        const defaultPassword = lastFour ? `${firstName}${lastFour}` : "Welcome123!";

        const { error: loginError } = await supabase
          .from("client_login")
          .upsert([{ email, password: defaultPassword, full_name: fullName, phone }], {
            onConflict: "email",
          });

        if (loginError) {
          console.warn("Could not auto-create client_login for", email, loginError.message);
        } else {
          console.log(`Auto-created client_login for ${email}`);
        }
      }

      return respond(200, { success: true, client: data });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // PUT — update client
  if (event.httpMethod === "PUT") {
    try {
      const body = JSON.parse(event.body || "{}");
      const { id, ...fields } = body;
      if (!id) return respond(400, { error: "Client ID required" });
      const { data, error } = await supabase
        .from("clients")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, client: data });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // DELETE
  if (event.httpMethod === "DELETE") {
    try {
      const id = event.queryStringParameters?.id;
      if (!id) return respond(400, { error: "Client ID required" });
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) return respond(500, { error: error.message });
      return respond(200, { success: true, deleted: id });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  return respond(405, { error: "Method not allowed" });
};