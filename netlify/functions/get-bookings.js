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

    // ⭐ Using "Client Email" to match your Login table logic
    const formula = `LOWER({Client Email})='${email.toLowerCase()}'`

    // ⭐ IMPORTANT: Ensure this matches your Airtable tab name exactly
    // If it has a space in Airtable, use 'Client Bookings'
    const records = await selectRecords('Client_Bookings', formula)

    if (!records) {
      return respond(200, { success: true, bookings: [] })
    }

    const bookings = records.map(record => ({
      id: record.id,
      "Trip Name": record.fields['Trip Name'] || "Unnamed Trip",
      "Travel Dates": record.fields['Travel Dates'] || "TBD",
      "Trip Status": record.fields['Trip Status'] || "Pending",
      "Total Balance": record.fields['Total Balance'] || "$0.00",
      "Payment Link": record.fields['Payment Link'] || "",
      "Documents": record.fields['Documents'] || []
    }))

    return respond(200, { success: true, bookings })

  } catch (error) {
    console.error("Fetch Bookings Error:", error)
    // Providing a cleaner error message back to the portal
    return respond(500, { success: false, error: 'Failed to load bookings. ' + error.message })
  }
})