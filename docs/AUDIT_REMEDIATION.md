# Audit remediation status

Source: Perplexity project audit (2026-10).

| Package | Status |
|---|---|
| 1 Telegram fail-closed, shape validation, timeouts, dedupe, quotas | Done |
| 2 CI ubuntu-latest + mandatory Prisma | Done |
| 3 Tenant context + isolation tests | Done (demo header-based; swap for session/API key) |
| 4 Measurement workflow brand→prompt→response→citations→score | Done (mock provider + in-memory store + API) |
| 5 Versioned scoring + measuredAt | Done (`SCORING_VERSION`, `measuredAt`) |
| 6 Branding kyzen + demo/live clarity | Partial |
| 7 Docker non-root + schema EvaluationRun | Done |

## APIs

- `POST /api/visibility/measure` — body `{ brandName, prompt, surface? }` header `x-organization-id`
- `GET /api/visibility/measure?organizationId=`
- `GET /api/visibility/summary?mode=sample|seeded&live=1`

## Note

In-memory stores reset on cold start. Persist via Prisma `EvaluationRun` when `DATABASE_URL` is set.
