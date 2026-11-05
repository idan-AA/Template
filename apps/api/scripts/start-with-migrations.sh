#!/bin/sh
# Start command for API deploys on plans without a pre-deploy step (Render free).
# Applies migrations, refuses to start if the live schema drifted from the Prisma
# schema, then replaces this shell with the API process.
set -eu

bun run db:deploy
bun apps/api/scripts/check-schema-drift.mjs
exec bun apps/api/dist/main.js
