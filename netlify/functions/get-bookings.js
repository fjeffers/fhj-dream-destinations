// netlify/functions/get-bookings.js
const { selectRecords, respond } = require('./utils')
const { withFHJ } = require('./middleware')

exports.handler = withFHJ(async (event) => {
  if (event.httpMethod !== 'GET') {
    return respond(405, { error: 'Method not allowed' })
  }

  try {
    const email = event.queryStringParameters?.email

    if (!email) {
      return respond(400, { success: false, error: 'Email parameter is required.' })
    }

    // Filter by client email
    const formula = `LOWER({Client Email})='${email.toLowerCase()}'`

    // Supabase table name for client bookings
    const records = await selectRecords('Client_Bookings', formula)

    if (!records) {
      return respond(200, { success: true, bookings: [] })
    }

    const bookings = records.map(record => ({
      id: record.id,
      "Trip Name": record['Trip Name'] || "Unnamed Trip",
      "Travel Dates": record['Travel Dates'] || "TBD",
      "Trip Status": record['Trip Status'] || "Pending",
      "Total Balance": record['Total Balance'] || "$0.00",
      "Payment Link": record['Payment Link'] || "",
      "Documents": record['Documents'] || []
    }))

    return respond(200, { success: true, bookings })

  } catch (error) {
    console.error("Fetch Bookings Error:", error)
    return respond(500, { success: false, error: 'Failed to load bookings. ' + error.message })
  }
})