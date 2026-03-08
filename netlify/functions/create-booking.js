// netlify/functions/create-booking.js
const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async (event) => {
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method Not Allowed" });
  }

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
  const { data: existingClients, error: clientSelectErr } = await supabase
    .from("clients")
    .select("*")
    .ilike("email", email.trim());

  if (clientSelectErr) throw new Error(clientSelectErr.message);

  let clientId;
  if (existingClients && existingClients.length > 0) {
    clientId = existingClients[0].id;
  } else {
    const { data: newClient, error: clientInsertErr } = await supabase
      .from("clients")
      .insert([{
        full_name: fullName,
        email: email.trim(),
        phone: phone || "",
        address: address || "",
      }])
      .select()
      .single();

    if (clientInsertErr) throw new Error(clientInsertErr.message);
    clientId = newClient.id;
  }

  // 2) Create Trip record
  const { data: newTrip, error: tripErr } = await supabase
    .from("trips")
    .insert([{
      destination,
      client: fullName,
      client_email: email,
      phone: phone || "",
      address: address || "",
      trip_type: tripType || "Individual",
      occasion: occasion || "",
      start_date: startDate || null,
      end_date: endDate || null,
      group_size: travelers || 1,
      flexible_dates: !!flexibleDates,
      notes: notes || "",
      budget_range: budgetPerPerson || "",
      source: "Website Booking",
      deal_id: dealId || "",
      deal_name: dealName || "",
      client_id: clientId,
    }])
    .select()
    .single();

  if (tripErr) throw new Error(tripErr.message);

  return respond(200, { success: true, tripId: newTrip.id });
});
