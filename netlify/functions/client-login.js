// ==========================================================
// FILE: client-login.js — Email + Password Auth
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
    const email = (body.email || "").toLowerCase().trim();
    const password = (body.password || "").trim();

    if (!email || !password) {
      return respond(400, {
        success: false,
        error: "Email and password are required.",
      });
    }

    console.log("Client login attempt:", email);

    const { data, error } = await supabase
      .from("client_login")
      .select("*")
      .ilike("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      console.warn("Login failed for:", email, error?.code);
      return respond(401, {
        success: false,
        error: "Invalid email or password.",
      });
    }

    const client = {
      id: data.id,
      email: data.email,
      fullName: data.full_name || "Traveler",
      phone: data.phone || "",
    };

    console.log("Client login successful:", client.email);
    return respond(200, { success: true, client });
  } catch (err) {
    console.error("Client login error:", err);
    return respond(500, {
      success: false,
      error: "Server error. Please try again later.",
    });
  }
};
