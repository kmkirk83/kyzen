# Live measurement vs sample mode

## What buyers get on the public demo

- Dashboard and `/api/visibility/summary` run on **sample/seeded data** without provider keys.
- `/onboarding` and org creation work in **draft mode** without `DATABASE_URL`.

## What becomes live after transfer

| Capability | Requires | Behavior |
|------------|----------|----------|
| OpenAI scoring | `OPENAI_API_KEY` | `runMeasurement` calls Chat Completions, then scores + optional Prisma persist |
| Anthropic scoring | `ANTHROPIC_API_KEY` | Used when OpenAI key is absent |
| Mock scoring | (none) | Always available; used for demos and CI |
| Multi-tenant persist | `DATABASE_URL` | Writes `EvaluationRun` (and ensures `Organization`) |
| In-memory fallback | (none) | Used when DB is unset or Prisma write fails |

## API

- `POST /api/visibility/measure` — single run  
- `POST /api/visibility/measure/batch` — batch runs  
- `GET /api/visibility/summary` — aggregate (sample or org-scoped)

Scoring version: see `SCORING_VERSION` in `lib/measurement.ts`.

## Honest scope boundary

Live answer-engine scraping of third-party UIs is **not** claimed. Measurement uses provider APIs (or mock) plus versioned scoring. That is intentional for a transferable SaaS foundation.
