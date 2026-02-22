// ==========================================================
// FILE: client-login.js - Supabase Version
// Location: netlify/functions/client-login.js
// ==========================================================
const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const email = body.email?.toLowerCase().trim();
    const accessCode = body.accessCode?.trim();

    // Validate input
    if (!email || !accessCode) {
      return respond(400, {
        success: false,
        error: "Email and Access Code are required.",
      });
    }

    console.log("Login attempt:", email);

    // Query Supabase client_login table
    const { data, error } = await supabase
      .from("client_login")
      .select("*")
      .ilike("email", email)
      .eq("token", accessCode)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      
      if (error.code === 'PGRST116') {
        // No rows found
        return respond(401, {
          success: false,
          error: "Invalid email or access code.",
        });
      }
      
      return respond(500, {
        success: false,
        error: "Database error. Please try again.",
      });
    }

    if (data) {
      // Build client object
      const client = {
        id: data.id,
        email: data.email,
        fullName: data.full_name || "Traveler",
        phone: data.phone || "",
      };

      console.log("Login successful:", client.email);

      return respond(200, { success: true, client });
    } else {
      return respond(401, {
        success: false,
        error: "Invalid email or access code.",
      });
    }
  } catch (error) {
    console.error("Critical Login Error:", error);
    return respond(500, {
      success: false,
      error: "Server error. Please try again later.",
    });
  }
};
