// netlify/functions/utils/supabaseServer.js
// Server-side Supabase client (service role) + JWT verifier attached to the client.
// Exports the Supabase client instance. The verifySupabaseJWT function is attached as a property
// so require('./utils/supabaseServer') returns a client with client.verifySupabaseJWT available.

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('supabaseServer: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured');
  module.exports = null;
} else {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // verifySupabaseJWT: attempts to validate an access token and return user object or null
  async function verifySupabaseJWT(accessToken) {
    if (!accessToken) return null;
    // accept "Bearer token" or raw token
    if (accessToken.toLowerCase().startsWith('bearer ')) {
      accessToken = accessToken.substring(7).trim();
    }

    try {
      // Modern API: auth.getUser(token)
      if (supabase.auth && typeof supabase.auth.getUser === 'function') {
        try {
          const resp = await supabase.auth.getUser(accessToken);
          const user = resp?.data?.user ?? resp?.user ?? null;
          if (user) return user;
        } catch (e) {
          // fall through to legacy method
        }
      }

      // Legacy API: auth.api.getUser(token)
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

  // attach verifier to client for ergonomic use
  supabase.verifySupabaseJWT = verifySupabaseJWT;

  module.exports = supabase;
}
