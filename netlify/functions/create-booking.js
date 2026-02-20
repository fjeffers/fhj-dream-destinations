
// netlify/functions/create-booking.js
import Airtable from "airtable";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "YOUR_AIRTABLE_API_KEY";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "YOUR_BASE_ID";
const TRIPS_TABLE = "Trips";
const CLIENTS_TABLE = "Client Name";

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

export const handler = async (event) => {
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

    const clientMatches = await base(CLIENTS_TABLE)
      .select({
        filterByFormula: `LOWER({Email}) = '${String(email).toLowerCase()}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (clientMatches && clientMatches.length > 0) {
      clientId = clientMatches[0].id;
    } else {
      const createdClient = await base(CLIENTS_TABLE).create([
        {
          fields: {
            "Full Name": fullName,
            Email: email,
            Phone: phone || "",
            Address: address || "",
          },
        },
      ]);
      clientId = createdClient[0].id;
    }

    // 2) Create Trip record
    const createdTrip = await base(TRIPS_TABLE).create([
      {
        fields: {
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
          "Source": "Website Booking",
          "Deal Id": dealId || "",
          "Deal Name": dealName || "",
          // If you have a linked field to Client Name table:
          "Client Name": clientId ? [clientId] : undefined,
        },
      },
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        tripId: createdTrip[0].id,
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
