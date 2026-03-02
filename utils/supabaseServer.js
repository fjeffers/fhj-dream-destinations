// netlify/functions/utils/supabaseServer.js
// Server-side Supabase client (CommonJS) + verifySupabaseJWT helper.
// Runs inside Netlify Functions (server-only). Do NOT expose SUPABASE_SERVICE_ROLE_KEY to the browser.

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('supabaseServer: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured');
  module.exports = null;
  return;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// verifySupabaseJWT: validate an access token and return user object or null
async function verifySupabaseJWT(accessToken) {
  if (!accessToken) return null;
  // accept "Bearer <token>" or bare token
  if (typeof accessToken === 'string' && accessToken.toLowerCase().startsWith('bearer ')) {
    accessToken = accessToken.split(' ')[1];
  }

  try {
    // Modern API
    if (supabase.auth && typeof supabase.auth.getUser === 'function') {
      try {
        const resp = await supabase.auth.getUser(accessToken);
        const user = resp?.data?.user ?? resp?.user ?? null;
        if (user) return user;
      } catch (e) {
        // continue to legacy method
      }
    }

    // Legacy API
    if (supabase.auth && supabase.auth.api && typeof supabase.auth.api.getUser === 'function') {
      try {
        const resp = await supabase.auth.api.getUser(accessToken);
        const user = resp?.user ?? null;
        if (user) return user;
      } catch (e) {
        // ignore
      }
    }
  } catch (err) {
    console.error('verifySupabaseJWT error', err);
  }

  return null;
}

supabase.verifySupabaseJWT = verifySupabaseJWT;

module.exports = supabase;
