// netlify/functions/get-bookings.js
const { supabase, respond } = require('./utils');
const { withFHJ } = require('./middleware');

exports.handler = withFHJ(async (event) => {
  if (event.httpMethod !== 'GET') {
    return respond(405, { error: 'Method not allowed' });
  }

  try {
    const email = event.queryStringParameters?.email;

    if (!email) {
      return respond(400, { success: false, error: 'Email parameter is required.' });
    }

    // Use direct Supabase query with .ilike() to avoid formula injection
    const { data: records, error } = await supabase
      .from("bookings")
      .select("*")
      .ilike("client_email", email.trim());

    if (error) throw new Error(error.message);

    if (!records) {
      return respond(200, { success: true, bookings: [] });
    }

    const bookings = records.map(record => ({
      id: record.id,
      "Trip Name": record.trip_name || "Unnamed Trip",
      "Travel Dates": record.travel_dates || "TBD",
      "Trip Status": record.trip_status || record.status || "Pending",
      "Total Balance": record.total_balance || record.balance_due || "$0.00",
      "Payment Link": record.payment_link || "",
      "Documents": record.documents || []
    }));

    return respond(200, { success: true, bookings });

  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    return respond(500, { success: false, error: 'Failed to load bookings. ' + error.message });
  }
});