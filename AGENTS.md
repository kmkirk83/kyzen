# AGENTS.md

This file provides guidance for AI coding agents (GitHub Copilot, Codex, etc.) working in the Clarion repository.

---

## What is Clarion

Clarion is a hosted, multi-tenant SaaS platform for **AI Visibility Intelligence**. It helps brands measure, monitor, and improve how they appear across AI assistants and generative search systems. The primary stack is Next.js 16 + TypeScript, Prisma + PostgreSQL, and integrates with OpenAI, Anthropic, Stripe, and Sentry.

---

## Repository layout

```
app/                    Next.js App Router pages and API routes
  api/health/           Liveness endpoint
  api/readiness/        Environment and subsystem readiness endpoint
src/
  config/               Shared application configuration
  middleware/           Request middleware
  routes/               Route handlers (marketing, seo)
  services/             Business logic (aiService, marketingService, seoService)
prisma/
  schema.prisma         Prisma data model (PostgreSQL)
__tests__/              Jest test files mirroring the app/ and src/ structure
tests/                  Additional integration/e2e tests
docs/
  architecture.md       Architecture overview
  adr/                  Architecture Decision Records
  runbooks/             Operational runbooks (production.md)
  privacy-data-processing.md
.github/
  workflows/            CI (ci.yml), CodeQL (codeql.yml), release (release.yml)
```

---

## Key commands

Always run these from the repository root:

| Command | Purpose |
|---|---|
| `npm ci` | Install dependencies (use this, not `npm install`) |
| `npm run dev` | Start local dev server on `http://localhost:3000` |
| `npm run build` | Production build |
| `npm run lint` | ESLint (zero warnings allowed) |
| `npm run typecheck` | TypeScript type checking (no emit) |
| `npm run test` | Run Jest tests (`--runInBand`) |
| `npm run prisma:validate` | Validate Prisma schema |
| `npm run check` | Run lint + typecheck + test + build in sequence |

**Before opening a PR, run `npm run check` to ensure all checks pass.**

---

## Environment

Copy `.env.example` to `.env` for local development. Required variables:

- `DATABASE_URL` — PostgreSQL connection string (PostgreSQL 15+)
- `AUTH_SECRET` — Long random string for session security
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` — AI scoring workflows
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — Billing
- `SENTRY_DSN` — Monitoring

CI sets `DATABASE_URL` to `postgresql://localhost:5432/clarion?schema=public`. Never commit real secrets.

---

## Code conventions

- **TypeScript everywhere** for all application code under `app/` and `src/`.
- Use **Zod** for runtime validation and schema definitions.
- The app follows **Next.js App Router** conventions. Place new API routes under `app/api/`.
- Prisma models use `cuid()` for IDs and `camelCase` field names. Run `npm run prisma:validate` after any schema change.
- Keep `.env.example` up to date when adding new environment variables.
- Do not add `console.log` to production code paths.
- Preserve backward compatibility for all public HTTP contracts (`/api/health`, `/api/readiness`, and any future public API routes).

---

## Data model summary

Key Prisma models and their roles:

| Model | Purpose |
|---|---|
| `User` | Authenticated platform user |
| `Organization` | Tenant (multi-tenant boundary) |
| `Membership` | User ↔ Organization with `Role` (OWNER, ADMIN, ANALYST, VIEWER) |
| `Brand` | Brand being monitored, belongs to an Organization |
| `Competitor` | Competitor tracked against a Brand |
| `VisibilityAudit` | AI audit run for an Organization with status and score |
| `Report` | Generated visibility report |
| `ApiKey` | Hashed API credentials per Organization/User |
| `BillingCustomer` | Stripe customer mapping |
| `Subscription` | Stripe subscription with status lifecycle |
| `AuditLog` | Immutable action log per Organization |

---

## Testing

- Tests live in `__tests__/` and `tests/`.
- Use Jest and `@testing-library/react` for component tests.
- When changing any behavior-affecting code, add or update the corresponding test.
- Never remove or disable existing tests unless the tested behavior is explicitly being removed.
- Run `npm run test` to verify before committing.

---

## Pull request checklist

1. Branch from `main`.
2. Make focused, minimal changes.
3. Run `npm run check` and confirm it passes.
4. Update `CHANGELOG.md` if the change is user-, operator-, or integrator-visible.
5. Document any new environment variables in `.env.example`.
6. Add or update tests for all changed behavior.
7. PR description must cover: user-visible change, operational impact, testing performed, and any follow-up work.

---

## CI

The CI pipeline (`.github/workflows/ci.yml`) runs on every push to `main` and on all pull requests:

1. `npm ci`
2. `npm run prisma:validate`
3. `npm run lint`
4. `npm run typecheck`
5. `npm run test`
6. `npm run build`

CodeQL static analysis runs separately (`.github/workflows/codeql.yml`). Fix all CodeQL findings before merging.

---

## Architecture decisions

ADRs are stored in `docs/adr/`. Create a new numbered ADR under that directory for any significant architectural change. See `docs/adr/0001-hosted-saas-first.md` for the format.

---

## Security

- Report vulnerabilities per `SECURITY.md`.
- Never commit credentials, secrets, or API keys.
- Keep `hashedKey` hashed on `ApiKey`; never store or log raw API key values.
- Validate all external input with Zod before it reaches business logic or the database.
- `AUTH_SECRET` must be a long, random, non-guessable string in production.
