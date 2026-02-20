// netlify/functions/public-book-trip.js
const { selectRecords, submitToAirtable, respond } = require('./utils');
const { withFHJ } = require('./middleware');

exports.handler = withFHJ(async (event) => {
  if (event.httpMethod !== "POST") return respond(405, { error: "Method Not Allowed" });

  try {
    const data = JSON.parse(event.body || "{}");
    const { 
      fullName, email, phone, 
      destination, startDate, endDate, 
      budget, notes, tripType, 
      groupSize, occasion, flexible 
    } = data;

    if (!fullName || !email) {
      return respond(400, { error: "Name and Email are required" });
    }

    // STEP 1: Find or Create Client
    let clientId;
    
    // ⭐ Fix 1 & 2: Use EXACT table name "Client Name" and safer formula
    const formula = `LOWER({Email})='${email.toLowerCase()}'`;
    const existingClients = await selectRecords("Client Name", formula);

    if (existingClients && existingClients.length > 0) {
      clientId = existingClients[0].id;
      console.log("Found existing client:", clientId);
    } else {
      // Create new client in the "Client Name" table
      const newClient = await submitToAirtable("Client Name", {
        "Full Name": fullName,
        "Email": email,
        "Phone": phone || "",
        // Removed "Status": "Lead" unless you are 100% sure that column exists in the Client Name table
      });
      clientId = newClient.id;
      console.log("Created new client:", clientId);
    }

    // STEP 2: Format Data for Trip Record
    const richNotes = `
${notes || ""}

---
DETAILS:
Occasion: ${occasion || "N/A"}
Dates Flexible: ${flexible ? "Yes" : "No"}
    `.trim();

    // STEP 3: Create the Trip Record
    // ⭐ Fix 3 & 4: Match column names exactly to your Airtable video
    const tripData = {
      "Destination": destination || "Undecided",
      "Client Name": [clientId], // Changed from "Client" to "Client Name"
      "Start Date": startDate || undefined,
      "End Date": endDate || undefined,
      "Budget Range": budget || "",
      "Notes": richNotes,
      "Status": "New Request", // Changed from "Inquiry" to match your Airtable options
      "Trip Type": tripType || "Individual",
      "Group Size": Number(groupSize) || 1, // Ensure this is sent as a number if Airtable expects a number
    };

    const newTrip = await submitToAirtable("Trips", tripData);

    return respond(200, { 
      success: true, 
      message: "Inquiry received",
      tripId: newTrip.id 
    });

  } catch (error) {
    console.error("Booking Error:", error);
    return respond(500, { error: "Internal Server Error: " + error.message });
  }
});