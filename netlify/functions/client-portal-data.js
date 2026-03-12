// ==========================================================
// FILE: client-portal-data.js — Fetch all portal data for a client
// Location: netlify/functions/client-portal-data.js
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

    if (!email) {
      return respond(400, { success: false, error: "Email is required." });
    }

    // Fetch each data type, wrapping in try/catch so missing tables return []
    const [trips, bookings, payments, documents, conciergeData, profileData] =
      await Promise.all([
        // Trips
        supabase
          .from("trips")
          .select("*")
          .ilike("client_email", email)
          .then(({ data }) => data || [])
          .catch(() => []),

        // Bookings — try client_email first, fall back includes email column
        supabase
          .from("bookings")
          .select("*")
          .or(`client_email.ilike.${email},email.ilike.${email}`)
          .then(({ data }) => data || [])
          .catch(() => []),

        // Payments
        supabase
          .from("payments")
          .select("*")
          .ilike("email", email)
          .then(({ data }) => data || [])
          .catch(() => []),

        // Documents
        supabase
          .from("documents")
          .select("*")
          .ilike("email", email)
          .then(({ data }) => data || [])
          .catch(() => []),

        // Concierge + messages
        supabase
          .from("concierge")
          .select("*, concierge_messages(*)")
          .ilike("email", email)
          .order("created_at", { ascending: false })
          .then(({ data }) => data || [])
          .catch(() => []),

        // Profile from clients table
        supabase
          .from("clients")
          .select("*")
          .ilike("email", email)
          .single()
          .then(({ data }) => data || null)
          .catch(() => null),
      ]);

    return respond(200, {
      success: true,
      trips,
      bookings,
      payments,
      documents,
      concierge: conciergeData,
      profile: profileData,
    });
  } catch (err) {
    console.error("client-portal-data error:", err);
    return respond(500, { success: false, error: "Server error." });
  }
};
