// netlify/functions/get-client-trips.js
const { selectRecords, respond } = require('./utils')
const { withFHJ } = require('./middleware')

exports.handler = withFHJ(async (event) => {
  // 1. Only allow POST requests (matching your Frontend fetch)
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' })
  }

  try {
    const { clientId } = JSON.parse(event.body || '{}')

    if (!clientId) {
      return respond(400, { success: false, error: 'Client ID is required.' })
    }

    // 2. Query the "Trips" table
    // ⭐ We filter by the linked record field "Client Name"
    const formula = `FIND('${clientId}', {Client Name})`
    
    const records = await selectRecords('Trips', formula)

    // 3. Map Airtable records to the format your Dashboard expects
    const trips = records.map(record => ({
      id: record.id,
      destination: record.fields['Destination'] || "Undecided",
      startDate: record.fields['Start Date'] || "TBD",
      endDate: record.fields['End Date'] || "TBD",
      status: record.fields['Status'] || "New Request",
      // If you have an attachment field for images:
      image: record.fields['Image']?.[0]?.url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
    }))

    return respond(200, { success: true, trips })

  } catch (error) {
    console.error("Fetch Trips Error:", error)
    return respond(500, { success: false, error: 'Internal server error: ' + error.message })
  }
})