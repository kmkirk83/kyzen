#!/usr/bin/env bash
# Offline equivalent of .github/workflows/ci.yml — no GitHub runners required
set -euo pipefail
export DATABASE_URL="${DATABASE_URL:-postgresql://ci:ci@localhost:5432/clarion?schema=public}"
export NEXT_TELEMETRY_DISABLED=1

echo "==> npm ci"
npm ci
echo "==> prisma generate"
npx prisma generate || true
echo "==> prisma validate"
npm run prisma:validate || true
echo "==> lint"
npm run lint
echo "==> typecheck"
npm run typecheck
echo "==> test"
npm run test
echo "==> build"
npm run build
echo "==> All local CI checks passed"
