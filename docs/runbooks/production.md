# Production Runbook

## Deployment model

- Build a standalone Next.js image from `Dockerfile`
- Provide PostgreSQL, secrets management, and HTTPS termination through the hosting platform
- Configure `DATABASE_URL`, `AUTH_SECRET`, AI provider keys, Stripe secrets, and `SENTRY_DSN`

## Pre-deploy checklist

1. `npm ci`
2. `npm run prisma:validate`
3. `npm run check`
4. Verify `/api/health` and `/api/readiness` in staging

## Post-deploy checklist

1. Confirm health endpoint response
2. Confirm readiness endpoint indicates expected configured systems
3. Validate Stripe webhook delivery if billing is enabled
4. Validate error reporting in the monitoring sink
