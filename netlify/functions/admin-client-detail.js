// ==========================================================
// FILE: admin-client-detail.js
// Returns full client detail: profile + linked data + stats
// Location: netlify/functions/admin-client-detail.js
// ==========================================================
const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  const { id } = JSON.parse(event.body || "{}");
  if (!id) return respond(400, { error: "Client id required" });

  // 1. Get the client record
  const { data: client, error: cErr } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();
  if (cErr) return respond(500, { error: cErr.message });

  const email = (client.email || "").toLowerCase().trim();

  // 2. Parallel queries for linked data — match column names used in client-portal-data.js
  // Bookings may use either client_email or email column; query both and merge
  const [bookingsByClientEmail, bookingsByEmail, trips, payments, documents, concierge] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .ilike("client_email", email)
      .order("created_at", { ascending: false })
      .then(({ data }) => data || [])
      .catch(() => []),

    supabase
      .from("bookings")
      .select("*")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .then(({ data }) => data || [])
      .catch(() => []),

    supabase
      .from("trips")
      .select("*")
      .ilike("client_email", email)
      .order("created_at", { ascending: false })
      .then(({ data }) => data || [])
      .catch(() => []),

    supabase
      .from("payments")
      .select("*")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .then(({ data }) => data || [])
      .catch(() => []),

    supabase
      .from("documents")
      .select("*")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .then(({ data }) => data || [])
      .catch(() => []),

    supabase
      .from("concierge")
      .select("*, concierge_messages(*)")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .then(({ data }) => data || [])
      .catch(() => []),
  ]);

  // Merge bookings from both columns, deduplicate by id
  const seenIds = new Set();
  const bookings = [...bookingsByClientEmail, ...bookingsByEmail].filter((b) => {
    if (!b.id || seenIds.has(b.id)) return false;
    seenIds.add(b.id);
    return true;
  });

  // 3. Compute quick stats
  const totalBookings = bookings.length;
  const totalSpent = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const nextTrip =
    trips.find((t) => new Date(t.start_date || t.departure_date) > new Date()) || null;
  const lastInteraction =
    [...concierge, ...bookings]
      .filter((r) => r.created_at)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at || null;

  return respond(200, {
    success: true,
    client,
    bookings,
    trips,
    payments,
    documents,
    concierge,
    stats: { totalBookings, totalSpent, nextTrip, lastInteraction },
  });
};
