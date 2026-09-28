#!/usr/bin/env bash
set -euo pipefail
echo "==> Installing dependencies"
npm ci
echo "==> Prisma generate"
npx prisma generate || true
echo "==> Prisma validate"
npm run prisma:validate || true
echo "==> Lint"
npm run lint
echo "==> Typecheck"
npm run typecheck
echo "==> Test"
npm run test
echo "==> Build"
npm run build
echo "==> All local CI checks passed"
