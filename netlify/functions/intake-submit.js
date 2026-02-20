const { submitToAirtable, respond } = require('./utils')
const { withFHJ } = require('./middleware')

exports.handler = withFHJ(async (event) => {
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' })
  }

  const payload = JSON.parse(event.body || '{}')

  const record = await submitToAirtable('Trips', {
    Destination: payload.destination || '',
    Phone: payload.phone || '',
    Address: payload.address || '',
    Client: payload.client || '',
    client_email: payload.client_email || '',
    'Start Date': payload.startDate || '',
    'End Date': payload.endDate || '',
    'Trip Type': payload.tripType || '',
    'Flexible Dates': !!payload.flexibleDates,
    'Group Size': payload.groupSize ?? null,
    Occasion: payload.occasion || '',
    Status: 'New',
    'Budget Range': payload.budgetRange || '',
    Notes: payload.notes || '',
  })

  return respond(200, {
    success: true,
    tripId: record.id,
  })
})
