#!/bin/bash

# Required secrets
SECRETS=(
  GITHUB_CLIENT_ID
  GITHUB_CLIENT_SECRET
  RESEND_API_KEY
  OPENAI_API_KEY
  JWT_SECRET
  SESSION_SECRET
)

echo "Setting up TriniCloud secrets..."

# Load from .env if exists
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Set each secret
for secret in "${SECRETS[@]}"; do
  if [ -n "${!secret}" ]; then
    echo "Setting $secret..."
    npx wrangler secret put "$secret" <<< "${!secret}"
  else
    echo "⚠️ Missing $secret in .env"
  fi
done

echo "✅ Secrets setup complete"
