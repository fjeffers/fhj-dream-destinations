// netlify/functions/middleware.js

const { respond } = require('./utils');

// 1. CORS Wrapper: Handles Pre-flight & Adds Headers
const withCors = (handler) => async (event, context) => {
  // Handle Pre-flight (OPTIONS) requests immediately
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  // Execute the handler
  const response = await handler(event, context) || {};

  // Return response with CORS headers merged in
  return {
    ...response,
    headers: {
      ...(response.headers || {}),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  };
};

// 2. Logging Wrapper: Tracks Request Duration & Errors
const withLogging = (handler) => async (event, context) => {
  const start = Date.now();
  console.log(`➡️ [FHJ] ${event.httpMethod} ${event.path}`);

  try {
    const res = await handler(event, context);
    const duration = Date.now() - start;
    console.log(`✅ [FHJ] ${event.httpMethod} ${event.path} (${duration}ms)`);
    return res;
  } catch (err) {
    const duration = Date.now() - start;
    console.error(
      `❌ [FHJ] ${event.httpMethod} ${event.path} (${duration}ms) - Error:`,
      err
    );
    throw err; // Re-throw so error handler can catch it
  }
};

// 3. Error Handling Wrapper: Catches crashes & sends 500
const withErrorHandling = (handler) => async (event, context) => {
  try {
    return await handler(event, context);
  } catch (err) {
    console.error('❌ Unhandled Function Error:', err);
    return respond(500, {
      error: 'Internal Server Error',
      details: err.message || 'Unknown error occurred',
    });
  }
};

// 4. The Master Wrapper: Combines all three
const withFHJ = (handler) =>
  withCors(withLogging(withErrorHandling(handler)));

module.exports = {
  withCors,
  withLogging,
  withErrorHandling,
  withFHJ,
};