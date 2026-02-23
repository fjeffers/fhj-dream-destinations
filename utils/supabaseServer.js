// utils/supabaseServer.js
// Server-side Supabase helper for Netlify functions
// Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from environment variables.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "Supabase server env vars are not set (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). Please set them in Netlify."
  );
}

const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  // Ensure fetch exists in some runtimes
  global: { fetch },
});

export default supabaseServer;
