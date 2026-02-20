const {
  selectRecords,
  submitToAirtable,
  updateAirtableRecord,
  deleteAirtableRecord,
  respond,
} = require('./utils');

const { withFHJ } = require('./middleware');

exports.handler = withFHJ(async (event) => {
  const method = event.httpMethod;
  
  // Safe Parse Body
  const payload = method !== 'GET' ? JSON.parse(event.body || '{}') : {};
  const TABLE_NAME = 'Client_Bookings'; // Ensure this matches your Airtable tab name exactly

  // 🟢 GET: Fetch & Format for Frontend
  if (method === 'GET') {
    const rawRecords = await selectRecords(TABLE_NAME, '', { normalizer: true });

    // Map Airtable columns to Frontend props (AdminBookings.jsx)
    const bookings = rawRecords.map(record => ({
      id: record.id,
      ClientName: record["Client Name"] || record["Client Email"] || "Unknown",
      Email: record["Client Email"] || "",
      Destination: record["Trip Name"] || "Unspecified",
      StartDate: record["Travel Dates"] || "TBD",
      EndDate: "", // Add if you have this column
      Status: record["Trip Status"] || "Upcoming",
      TotalPrice: record["Budget"] || record["Price"] || "0",
      BalanceDue: record["Balance"] || "0"
    }));

    return respond(200, { bookings });
  }

  // 🟡 POST: Create New Booking
  if (method === 'POST') {
    if (!payload.email || !payload.tripName) {
        return respond(400, { error: "Missing required fields (email, tripName)" });
    }

    const record = await submitToAirtable(TABLE_NAME, {
      "Client Email": payload.email,
      "Client Name": payload.clientName || payload.email,
      "Trip Name": payload.tripName,         // Maps to 'Destination'
      "Travel Dates": payload.travelDates,   // Maps to 'StartDate'
      "Trip Status": payload.status || "Upcoming",
      "Budget": payload.price || 0
    });
    
    return respond(200, { success: true, id: record.id });
  }

  // 🟠 PUT: Update Booking
  if (method === 'PUT') {
    if (!payload.id) return respond(400, { error: "Missing Booking ID" });

    // Only include fields that are actually defined in payload
    const updates = {};
    if (payload.email) updates["Client Email"] = payload.email;
    if (payload.clientName) updates["Client Name"] = payload.clientName;
    if (payload.tripName) updates["Trip Name"] = payload.tripName;
    if (payload.travelDates) updates["Travel Dates"] = payload.travelDates;
    if (payload.status) updates["Trip Status"] = payload.status;
    if (payload.price) updates["Budget"] = payload.price;

    await updateAirtableRecord(TABLE_NAME, payload.id, updates);
    return respond(200, { success: true });
  }

  // 🔴 DELETE: Remove Booking
  if (method === 'DELETE') {
    if (!payload.id) return respond(400, { error: "Missing Booking ID" });

    await deleteAirtableRecord(TABLE_NAME, payload.id);
    return respond(200, { success: true });
  }

  return respond(405, { error: 'Method not allowed' });
});