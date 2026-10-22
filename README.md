# Kyzen

**AI Visibility Intelligence platform foundation** — multi-tenant SaaS for measuring and improving brand visibility across AI answers and search.

Built for commercialization: hosted SaaS first, developer platform second, enterprise self-hosting third.

## Live demo (sample data)

Once deployed, evaluate without cloning:

- Buyer quick start: `/start`
- Visibility dashboard: `/dashboard` (sample data, no API keys required)

Public demo project: `kyzen-demo` on Vercel (see latest deployment in the Vercel dashboard).

## What is included

- Next.js 16 + TypeScript application
- Prisma multi-tenant model (organizations, memberships, reports, billing, API keys, audits)
- Working visibility dashboard with honest sample-data mode and onboarding guidance
- Environment readiness checks and operational API endpoints
- Docker-ready standalone configuration
- CI, CodeQL, Dependabot, and release automation scaffolding
- Commercialization documentation (security, support, releases, contribution)

## For buyers / evaluators

1. Open `/start` for the guided evaluation path.
2. Open `/dashboard` to see the product surface on sample data.
3. Review `prisma/schema.prisma` for the multi-tenant commercial model.
4. Hit `GET /api/visibility/summary` and `GET /api/health`.

**Scope boundary:** Live tenant queries are the main remaining integration step. The dashboard and API contract are intentionally runnable without a database or provider keys so you can evaluate quickly.

## Local development

```bash
cp .env.example .env
npm ci
npm run dev
```

Open `http://localhost:3000/start` then `/dashboard`.

**Requirements:** Node.js 22+, npm 11+, PostgreSQL 15+ (only needed for live tenant wiring).

## Environment variables

See `.env.example`. Most variables are optional for the sample-data evaluation path. Set `DEMO_MODE=true` to force demo messaging.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run check` | Lint + typecheck + test + build |
| `npm run prisma:validate` | Validate Prisma schema |

## HTTP endpoints

- `GET /api/health` — liveness
- `GET /api/readiness` — environment readiness
- `GET /api/visibility/summary` — sample visibility contract used by `/dashboard`
- `POST /api/integrations/telegram` — Telegram webhook relay

## Transfer / commercial terms (summary)

See `SALES.md` for the full sale package: asking range, Escrow transfer, what is included, and support window.

## License

See [LICENSE](LICENSE).
