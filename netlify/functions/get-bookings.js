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

    // Using "Client Email" to match the login table logic
    const formula = `LOWER({Client Email})='${email.toLowerCase()}'`

    const records = await selectRecords('Client_Bookings', formula)

    if (!records) {
      return respond(200, { success: true, bookings: [] })
    }

    const bookings = records.map(record => ({
      id: record.id,
      "Trip Name": record["Trip Name"] || record.trip_name || "Unnamed Trip",
      "Travel Dates": record["Travel Dates"] || record.travel_dates || "TBD",
      "Trip Status": record["Trip Status"] || record.trip_status || "Pending",
      "Total Balance": record["Total Balance"] || record.total_balance || "$0.00",
      "Payment Link": record["Payment Link"] || record.payment_link || "",
      "Documents": record["Documents"] || record.documents || []
    }))

    return respond(200, { success: true, bookings })

  } catch (error) {
    console.error("Fetch Bookings Error:", error)
    return respond(500, { success: false, error: 'Failed to load bookings. ' + error.message })
  }
})