// netlify/functions/admin-documents.js
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
  const payload = JSON.parse(event.body || '{}');

  if (method === 'GET') {
    const docs = await selectRecords('Documents', '', { normalizer: true });
    return respond(200, { documents: docs });
  }

  if (method === 'POST') {
    const record = await submitToAirtable('Documents', {
      Name: payload.name,
      URL: payload.url,
      Type: payload.type,
      "Client Email": payload.email,
    });
    return respond(200, { success: true, id: record.id });
  }

  if (method === 'PUT') {
    await updateAirtableRecord('Documents', payload.id, {
      Name: payload.name,
      URL: payload.url,
      Type: payload.type,
      "Client Email": payload.email,
    });
    return respond(200, { success: true });
  }

  if (method === 'DELETE') {
    await deleteAirtableRecord('Documents', payload.id);
    return respond(200, { success: true });
  }

  return respond(405, { error: 'Method not allowed' });
});
