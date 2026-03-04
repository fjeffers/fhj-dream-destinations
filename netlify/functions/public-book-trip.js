// netlify/functions/public-book-trip.js
const { supabase, submitToAirtable, respond } = require('./utils');
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

    // STEP 1: Find or Create Client — use direct Supabase query to avoid formula injection
    const { data: existingClients, error: clientSelectErr } = await supabase
      .from("clients")
      .select("*")
      .ilike("email", email.trim().toLowerCase());

    if (clientSelectErr) throw new Error(clientSelectErr.message);

    let clientId;
    if (existingClients && existingClients.length > 0) {
      clientId = existingClients[0].id;
      console.log("Found existing client:", clientId);
    } else {
      // Create new client in the "Client Name" table
      const newClient = await submitToAirtable("Client Name", {
        "Full Name": fullName,
        "Email": email,
        "Phone": phone || "",
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
    const tripData = {
      "Destination": destination || "Undecided",
      "Start Date": startDate || undefined,
      "End Date": endDate || undefined,
      "Budget Range": budget || "",
      "Notes": richNotes,
      "Status": "New Request",
      "Trip Type": tripType || "Individual",
      "Group Size": Number(groupSize) || 1,
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