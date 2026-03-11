// ==========================================================
// FILE: admin-group-trips.js — Group/Family Trips CRUD (Supabase)
// Location: netlify/functions/admin-group-trips.js
//
// GET    → list all group trips with their members
// POST   → create a new group trip + members + auto-create logins
// PUT    → update a group trip + replace members
// DELETE → delete a group trip (cascade deletes members)
// ==========================================================

const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  // ── GET: List all group trips with their members ─────────
  if (event.httpMethod === "GET") {
    try {
      const { data: groupTrips, error } = await supabase
        .from("group_trips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return respond(500, { error: error.message });

      // Fetch members for each trip
      const tripsWithMembers = await Promise.all(
        (groupTrips || []).map(async (trip) => {
          const { data: members } = await supabase
            .from("group_trip_members")
            .select("*")
            .eq("group_trip_id", trip.id)
            .order("created_at", { ascending: true });
          return { ...trip, members: members || [] };
        })
      );

      return respond(200, { groupTrips: tripsWithMembers });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // ── POST: Create a new group trip + members ──────────────
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      const {
        name,
        destination,
        startDate,
        endDate,
        occasion,
        status,
        totalBudget,
        notes,
        members = [],
      } = body;

      if (!name) return respond(400, { error: "Trip name is required" });

      // Insert group trip
      const { data: trip, error: tripError } = await supabase
        .from("group_trips")
        .insert([
          {
            name,
            destination: destination || "",
            start_date: startDate || "",
            end_date: endDate || "",
            occasion: occasion || "",
            status: status || "Planning",
            total_budget: totalBudget || 0,
            notes: notes || "",
          },
        ])
        .select()
        .single();

      if (tripError) return respond(500, { error: tripError.message });

      // Insert members
      if (members.length > 0) {
        const memberRows = members.map((m) => ({
          group_trip_id: trip.id,
          client_name: m.clientName || m.client_name || "",
          client_email: m.clientEmail || m.client_email || "",
          client_phone: m.clientPhone || m.client_phone || "",
          date_of_birth: m.dateOfBirth || m.date_of_birth || "",
          role: m.role || "Member",
          payment_status: m.paymentStatus || m.payment_status || "Unpaid",
          amount_paid: m.amountPaid || m.amount_paid || 0,
          amount_due: m.amountDue || m.amount_due || 0,
          notes: m.notes || "",
        }));

        const { error: membersError } = await supabase
          .from("group_trip_members")
          .insert(memberRows);

        if (membersError) return respond(500, { error: membersError.message });

        // Auto-create client_login for members with an email
        await autoCreateLogins(members);
      }

      // Fetch the trip with members to return
      const { data: membersData } = await supabase
        .from("group_trip_members")
        .select("*")
        .eq("group_trip_id", trip.id)
        .order("created_at", { ascending: true });

      return respond(200, {
        success: true,
        groupTrip: { ...trip, members: membersData || [] },
      });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // ── PUT: Update a group trip + replace members ───────────
  if (event.httpMethod === "PUT") {
    try {
      const body = JSON.parse(event.body || "{}");
      const {
        id,
        name,
        destination,
        startDate,
        endDate,
        occasion,
        status,
        totalBudget,
        notes,
        members = [],
      } = body;

      if (!id) return respond(400, { error: "Trip ID required" });

      // Update group trip record
      const { error: updateError } = await supabase
        .from("group_trips")
        .update({
          name,
          destination: destination || "",
          start_date: startDate || "",
          end_date: endDate || "",
          occasion: occasion || "",
          status: status || "Planning",
          total_budget: totalBudget || 0,
          notes: notes || "",
        })
        .eq("id", id);

      if (updateError) return respond(500, { error: updateError.message });

      // Delete existing members then re-insert
      const { error: deleteError } = await supabase
        .from("group_trip_members")
        .delete()
        .eq("group_trip_id", id);

      if (deleteError) return respond(500, { error: deleteError.message });

      if (members.length > 0) {
        const memberRows = members.map((m) => ({
          group_trip_id: id,
          client_name: m.clientName || m.client_name || "",
          client_email: m.clientEmail || m.client_email || "",
          client_phone: m.clientPhone || m.client_phone || "",
          date_of_birth: m.dateOfBirth || m.date_of_birth || "",
          role: m.role || "Member",
          payment_status: m.paymentStatus || m.payment_status || "Unpaid",
          amount_paid: m.amountPaid || m.amount_paid || 0,
          amount_due: m.amountDue || m.amount_due || 0,
          notes: m.notes || "",
        }));

        const { error: membersError } = await supabase
          .from("group_trip_members")
          .insert(memberRows);

        if (membersError) return respond(500, { error: membersError.message });

        await autoCreateLogins(members);
      }

      return respond(200, { success: true });
    } catch (err) {
      return respond(500, { error: err.message });
    }
  }

  // ── DELETE: Remove a group trip (cascade deletes members) ─
  if (event.httpMethod === "DELETE") {
    try {
      const body = JSON.parse(event.body || "{}");
      const id = body.id || event.queryStringParameters?.id;

      if (!id) return respond(400, { error: "Trip ID required" });

      const { error } = await supabase
        .from("group_trips")
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

// ── Helper: auto-create client_login records ─────────────
async function autoCreateLogins(members) {
  for (const m of members) {
    const email = (m.clientEmail || m.client_email || "").trim().toLowerCase();
    if (!email) continue;

    // Check if login already exists
    const { data: existing } = await supabase
      .from("client_login")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) continue;

    // Derive default password: FirstName + "2026!"
    const fullName = (m.clientName || m.client_name || "").trim();
    const firstName = fullName.split(" ")[0] || "Client";
    const password = `${firstName}2026!`;

    await supabase.from("client_login").insert([
      {
        email,
        password,
        full_name: fullName,
        phone: m.clientPhone || m.client_phone || "",
      },
    ]);
  }
}
