// netlify/functions/create-booking.js

const { selectRecords, submitToAirtable, respond } = require('./utils');

const TRIPS_TABLE = "Trips";
const CLIENTS_TABLE = "Client Name";

exports.handler = async (event) => {
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

    const clientMatches = await selectRecords(
      CLIENTS_TABLE,
      `LOWER({Email}) = '${String(email).toLowerCase()}'`
    );

    if (clientMatches && clientMatches.length > 0) {
      clientId = clientMatches[0].id;
    } else {
      const createdClient = await submitToAirtable(CLIENTS_TABLE, {
        "Full Name": fullName,
        Email: email,
        Phone: phone || "",
        Address: address || "",
      });
      clientId = createdClient.id;
    }

    // 2) Create Trip record
    const createdTrip = await submitToAirtable(TRIPS_TABLE, {
      Destination: destination,
      Client: fullName,
      client_email: email,
      Phone: phone || "",
      Address: address || "",
      "Trip Type": tripType || "Individual",
      Occasion: occasion || "",
      "Start Date": startDate || null,
      "End Date": endDate || null,
      "Group Size": travelers || 1,
      "Flexible Dates": flexibleDates ? "👍" : "",
      Notes: notes || "",
      "Estimated Budget Per Person": budgetPerPerson || "",
      Source: "Website Booking",
      "Deal Id": dealId || "",
      "Deal Name": dealName || "",
    });

    return respond(200, {
      success: true,
      tripId: createdTrip.id,
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    return respond(500, { error: "Internal Server Error" });
  }
};
