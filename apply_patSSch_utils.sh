#!/usr/bin/env bash
set -euo pipefail

# apply_patch_utils.sh
# Creates netlify/functions/utils/supabaseServer.js and respond.js,
# installs runtime deps (@supabase/supabase-js and node-fetch@2),
# creates a branch, commits, and pushes to origin.
#
# Usage: ./apply_patch_utils.sh
# Run from your repository root. Review the files after the script runs,
# then open a PR from the created branch (feature/add-utils) or merge to main.

BRANCH="feature/add-utils"
UTIL_DIR="netlify/functions/utils"

# Safety: ensure we're in a git repo
if [ ! -d .git ]; then
  echo "Error: not in a git repository (no .git dir). Run this from the repo root."
  exit 1
fi

# Ensure working tree is clean (unless --force passed)
if [ "$(git status --porcelain)" != "" ] && [ "${1-}" != "--force" ]; then
  echo "Error: working tree not clean. Commit or stash changes first, or run with --force to proceed."
  git status --porcelain
  exit 1
fi

echo "Creating utils directory: $UTIL_DIR"
mkdir -p "$UTIL_DIR"

echo "Writing netlify/functions/utils/supabaseServer.js"
cat > "$UTIL_DIR/supabaseServer.js" <<'EOF'
// netlify/functions/utils/supabaseServer.js
// Server-side Supabase client (CommonJS) + verifySupabaseJWT helper.
// Runs inside Netlify Functions (server-only). Do NOT expose SUPABASE_SERVICE_ROLE_KEY to the browser.

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

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
    // Modern API: supabase.auth.getUser(token)
    if (supabase.auth && typeof supabase.auth.getUser === 'function') {
      try {
        const resp = await supabase.auth.getUser(accessToken);
        const user = resp?.data?.user ?? resp?.user ?? null;
        if (user) return user;
      } catch (e) {
        // fall through to legacy method
      }
    }

    // Legacy API: supabase.auth.api.getUser(token)
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
EOF

echo "Writing netlify/functions/utils/respond.js"
cat > "$UTIL_DIR/respond.js" <<'EOF'
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
      'Access-Control-Allow-Origin': '*', // restrict in production
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    },
    body: JSON.stringify(payload)
  };
}

module.exports = { respond };
EOF

echo "Installing runtime dependencies: @supabase/supabase-js and node-fetch@2.6.7"
# Install deps and update package.json & package-lock.json
npm install --save @supabase/supabase-js node-fetch@2.6.7

echo "Creating git branch: $BRANCH"
git checkout -B "$BRANCH"

echo "Staging changes..."
git add "$UTIL_DIR/supabaseServer.js" "$UTIL_DIR/respond.js" package.json package-lock.json

COMMIT_MSG="chore(functions): add netlify function utils (supabaseServer + respond) and runtime deps"
echo "Committing with message: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

echo "Pushing branch to origin: $BRANCH"
git push -u origin "$BRANCH"

echo
echo "Done."
echo "Next steps:"
echo "  1) Open a PR from branch $BRANCH -> main (or merge directly if you prefer)."
echo "  2) Ensure the following environment variables are set in Netlify site settings:"
echo "       SUPABASE_URL"
echo "       SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)"
echo "       OPENAI_API_KEY (if using AI)"
echo "       RESEND_API_KEY (or SENDGRID_API_KEY if you use SendGrid)"
echo "       OWNER_NOTIFY_EMAIL, SENDER_EMAIL"
echo "  3) Monitor the Netlify build after merging to main; if other errors appear, paste logs here and I'll help."
