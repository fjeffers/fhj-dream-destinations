// netlify/functions/middleware.js

const { respond, supabase } = require('./utils');

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

// 5. Admin Auth: Verify Supabase JWT from Authorization: Bearer header
async function requireAdminAuth(event) {
  const authHeader =
    (event.headers && (event.headers['authorization'] || event.headers['Authorization'])) || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return respond(401, { error: 'Authentication required' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data || !data.user) {
    return respond(401, { error: 'Invalid or expired token' });
  }

  return null; // Auth passed
}

const withAdminAuth = (handler) => async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return handler(event, context);
  }
  const authError = await requireAdminAuth(event);
  if (authError) return authError;
  return handler(event, context);
};

// 6. Admin Master Wrapper: CORS + Logging + Error Handling + Auth
const withFHJAdmin = (handler) =>
  withCors(withLogging(withErrorHandling(withAdminAuth(handler))));

module.exports = {
  withCors,
  withLogging,
  withErrorHandling,
  withFHJ,
  withAdminAuth,
  withFHJAdmin,
  requireAdminAuth,
};