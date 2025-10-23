#!/bin/bash

required_vars=(
  "CLOUDFLARE_ACCOUNT_ID"
  "CLOUDFLARE_API_TOKEN"
  "GITHUB_CLIENT_ID"
  "GITHUB_CLIENT_SECRET"
  "JWT_SECRET"
  "DATABASE_URL"
)

missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "❌ Missing required environment variables:"
  printf '%s\n' "${missing_vars[@]}"
  exit 1
fi

echo "✅ All required environment variables are set"
exit 0
