
// netlify/functions/create-booking.js
const { supabase } = require("./utils");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
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
      return {
        statusCode: 400,
        body: "Missing required fields",
      };
    }

    // 1) Find or create client
    let clientId = null;

    const { data: existingClients } = await supabase
      .from("clients")
      .select("id")
      .ilike("email", email)
      .limit(1);

    if (existingClients && existingClients.length > 0) {
      clientId = existingClients[0].id;
    } else {
      const { data: createdClient, error: clientError } = await supabase
        .from("clients")
        .insert([
          {
            full_name: fullName,
            email: email,
            phone: phone || "",
            address: address || "",
          },
        ])
        .select("id")
        .single();

      if (clientError) throw clientError;
      clientId = createdClient.id;
    }

    // 2) Create Trip record
    const { data: createdTrip, error: tripError } = await supabase
      .from("trips")
      .insert([
        {
          destination: destination,
          client_name: fullName,
          client_email: email,
          phone: phone || "",
          address: address || "",
          trip_type: tripType || "Individual",
          occasion: occasion || "",
          start_date: startDate || null,
          end_date: endDate || null,
          group_size: travelers || 1,
          flexible_dates: flexibleDates ? true : false,
          notes: notes || "",
          estimated_budget_per_person: budgetPerPerson || null,
          source: "Website Booking",
          deal_id: dealId || null,
          deal_name: dealName || "",
          client_id: clientId || null,
        },
      ])
      .select("id")
      .single();

    if (tripError) throw tripError;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        tripId: createdTrip.id,
      }),
    };
  } catch (err) {
    console.error("Error creating booking:", err);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};
