# Kyzen

**AI Visibility Intelligence platform foundation** — multi-tenant SaaS for measuring and improving brand visibility across AI answers and search.

Built for commercialization: hosted SaaS first, developer platform second, enterprise self-hosting third.

## Live demo

Primary: **https://kyzen-demo.vercel.app**

- Buyer quick start: `/start`
- Visibility dashboard: `/dashboard` (sample/seeded fixtures + live Neon-persisted Evidence when DATABASE_URL is set)
- Onboarding wizard: `/onboarding`

Public demo includes persisted measurement runs (mock provider). No API keys required for evaluation.

## What is included

- Next.js 16 + TypeScript application
- Prisma multi-tenant model (organizations, memberships, reports, billing, API keys, audits)
- Working visibility dashboard with honest sample-data mode, seeded mode, and live Evidence panel
- Environment readiness checks and operational API endpoints
- Docker-ready standalone configuration
- CI, CodeQL, Dependabot, and release automation scaffolding
- Commercialization documentation (security, support, releases, contribution)

## For buyers / evaluators

1. Open `/start` for the guided evaluation path.
2. Open `/dashboard` to see the product surface (fixtures + live Evidence).
3. Review `prisma/schema.prisma` for the multi-tenant commercial model.
4. Hit `GET /api/visibility/summary`, `GET /api/visibility/measure`, and `GET /api/health`.

**Scope boundary:** Live tenant measurement persistence is wired (Neon on the public demo). Optional LLM providers fall back to deterministic mock. Sample/seeded catalogs remain available without a database for quick evaluation.

## Local development

```bash
cp .env.example .env
npm ci
npm run dev
```

Open `http://localhost:3000/start` then `/dashboard`.

**Requirements:** Node.js 22+, npm 11+, PostgreSQL 15+ (only needed for live tenant wiring).

## Environment variables

See `.env.example`. Most variables are optional for the sample-data evaluation path. Set `DEMO_MODE=true` to force demo messaging. Optional `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` enable live providers (mock always available).

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
- `GET /api/visibility/measure` — list/aggregate persisted runs (or memory)
- `POST /api/visibility/measure` — run a measurement
- `POST /api/integrations/telegram` — Telegram webhook relay

## Transfer / commercial terms (summary)

See `SALES.md` for the full sale package: asking range ($4k–$9k), revenue $0, Escrow transfer, what is included, and support window.

## License

See [LICENSE](LICENSE).

## For buyers / marketplace

- **Demo:** https://kyzen-demo.vercel.app/dashboard
- **Setup wizard:** https://kyzen-demo.vercel.app/onboarding
- **Listing copy:** [docs/LISTING.md](docs/LISTING.md)
- **Outreach templates:** [docs/OUTREACH_BATCH.md](docs/OUTREACH_BATCH.md)
- **Day-1 runbook:** [docs/BUYER_RUNBOOK.md](docs/BUYER_RUNBOOK.md)
- **Price band:** $4k–$9k (see SALES.md); revenue $0

*Loom walkthrough:* add URL here after recording (script in docs/DEMO.md).
