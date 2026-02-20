const { submitToAirtable, respond } = require('./utils')
const { withFHJ } = require('./middleware')

exports.handler = withFHJ(async (event) => {
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' })
  }

  const payload = JSON.parse(event.body || '{}')
  const { email, name, message, context } = payload

  if (!message) {
    return respond(400, { error: 'Message is required' })
  }

  const record = await submitToAirtable('Concierge', {
    Email: email || null,
    Name: name || null,
    Message: message,
    Context: context || null,
    Source: 'FHJ Portal',
    Status: 'New',
  })

  return respond(200, {
    success: true,
    conciergeId: record.id,
  })
})
