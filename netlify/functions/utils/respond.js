// netlify/functions/utils/respond.js
// Small helper to return JSON with CORS headers

function respond(status, body) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    },
    body: (() => { try { return JSON.stringify(body); } catch (e) { return JSON.stringify({ error: 'Response serialization error' }); } })(),
  };
}

module.exports = { respond };
