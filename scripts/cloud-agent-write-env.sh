#!/usr/bin/env bash
#
# Writes .env.local for local development against the local Supabase stack.
#
# Only creates the file when it does not already exist, so a developer's own
# values (or a regenerated session secret) are never clobbered. The Supabase URL
# and service_role key are the standard, well-known local development values
# produced by `supabase start`; they are not secrets.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${REPO_DIR}/.env.local"

# Well-known local Supabase service_role JWT (signed with the default local
# jwt secret "super-secret-jwt-token-with-at-least-32-characters-long").
LOCAL_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"

if [ -f "${ENV_FILE}" ]; then
  echo "==> [env] ${ENV_FILE} already exists; leaving it untouched."
  exit 0
fi

session_secret="$(openssl rand -base64 48 | tr -d '\n')"

cat > "${ENV_FILE}" <<EOF
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=${LOCAL_SERVICE_ROLE_KEY}
SESSION_SECRET=${session_secret}
EOF

echo "==> [env] Wrote ${ENV_FILE}."
