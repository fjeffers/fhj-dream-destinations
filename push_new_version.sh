#!/usr/bin/env bash
set -euo pipefail

# push_new_version.sh
# Installs the `resend` package (if missing), commits package.json & package-lock.json,
# creates a new branch and pushes it to origin.
#
# Usage:
#   ./push_new_version.sh [branch]
# Default branch: feature/add-resend

BRANCH="${1:-feature/add-resend}"

# Safety checks
if [ ! -d .git ]; then
  echo "Error: not a git repository (no .git). Run this from the repo root."
  exit 1
fi

# Ensure working tree is clean unless --force provided as second arg
if [ "$(git status --porcelain)" != "" ] && [ "${2-}" != "--force" ]; then
  echo "Error: working tree not clean. Commit or stash your changes first, or re-run with --force."
  git status --porcelain
  exit 1
fi

echo "Installing 'resend' package (adds to package.json & package-lock.json) if not present..."
# install resend if not already in package.json
if ! grep -q "\"resend\"" package.json 2>/dev/null; then
  npm install --save resend
else
  echo "'resend' already present in package.json, skipping npm install."
fi

echo "Creating and switching to branch: $BRANCH"
git checkout -B "$BRANCH"

echo "Staging package.json and package-lock.json..."
git add package.json package-lock.json || true

COMMIT_MSG="chore(functions): add resend dependency and push new version"
echo "Committing with message: $COMMIT_MSG"
# Only commit if there are staged changes
if [ -n "$(git diff --cached --name-only)" ]; then
  git commit -m "$COMMIT_MSG"
else
  echo "No changes to commit."
fi

echo "Pushing branch to origin: $BRANCH"
git push -u origin "$BRANCH"

echo
echo "Done. Branch pushed: $BRANCH"
echo "Next steps:"
echo "  - Open a PR from $BRANCH -> main (or merge directly if you prefer)."
echo "  - Ensure the Netlify environment variables are set (RESEND_API_KEY, OWNER_NOTIFY_EMAIL, SENDER_EMAIL, OPENAI_API_KEY, SUPABASE_... etc.)."
echo "  - Monitor Netlify build logs; paste any build errors here and I'll help debug."
