// netlify/functions/utils/respond.js
// Small helper to return JSON with CORS headers for Netlify Functions.

function respond(status, body) {
  // Ensure body is serializable
  let payload;
  try {
    payload = typeof body === 'string' ? { message: body } : body;
  } catch (e) {
    payload = { error: 'Response serialization error' };
  }

  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    },
    body: JSON.stringify(payload),
  };
}

module.exports = { respond };
