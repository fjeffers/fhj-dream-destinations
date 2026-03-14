// netlify/functions/create-booking.js
const { supabase, respond } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method Not Allowed" });
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const {
      dealId,
      dealName,
      fullName,
      email,
      phone,
      address,
      tripType,
      occasion,
      destination,
      startDate,
      endDate,
      travelers,
      budgetPerPerson,
      notes,
      flexibleDates,
    } = body;

    if (!fullName || !email || !destination) {
      return respond(400, { error: "Missing required fields" });
    }

    // 1) Find or create client
    let clientId = null;

    const { data: existingClient } = await supabase
      .from("clients")
      .select("*")
      .ilike("email", email)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert([{
          full_name: fullName,
          email: email,
          phone: phone || "",
          address: address || "",
        }])
        .select()
        .single();

      if (clientError) {
        console.error("Error creating client:", clientError);
        return respond(500, { error: "Failed to create client" });
      }
      clientId = newClient.id;
    }

    // 2) Create Trip record
    const { data: newTrip, error: tripError } = await supabase
      .from("trips")
      .insert([{
        destination,
        client: fullName,
        client_email: email,
        client_id: clientId,
        phone: phone || "",
        address: address || "",
        trip_type: tripType || "Individual",
        occasion: occasion || "",
        start_date: startDate || null,
        end_date: endDate || null,
        group_size: travelers || 1,
        flexible_dates: flexibleDates ? true : false,
        notes: notes || "",
        budget_range: budgetPerPerson || "",
        source: "Website Booking",
        deal_id: dealId || "",
        deal_name: dealName || "",
        status: "New Request",
      }])
      .select()
      .single();

    if (tripError) {
      console.error("Error creating trip:", tripError);
      return respond(500, { error: "Failed to create trip" });
    }

    return respond(200, {
      success: true,
      tripId: newTrip.id,
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    return respond(500, { error: "Internal Server Error" });
  }
};
