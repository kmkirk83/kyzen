# kyzen — Remaining improvements & customer-ready path

Goal: a buyer can receive the product, complete a guided wizard, connect their own data/providers, and see **real** visibility results—not fixtures.

Last updated: 2026-10-26

---

## 0. Target customer experience (definition of done)

1. Buyer deploys (Vercel or Docker) with their `DATABASE_URL`, auth secret, and optional provider keys.
2. Signs in (email magic link or credentials) and creates an organization.
3. **Walkthrough wizard** guides:
   - Create brand (+ optional competitors)
   - Add evaluation prompts
   - Choose surfaces (answer engines / assistants / search overviews)
   - Connect provider (mock for trial, OpenAI/Anthropic for live)
   - Run first measurement batch
4. Dashboard shows **live** scores from persisted `EvaluationRun` rows, with evidence drill-down (prompt, raw answer, citations, scoring version, timestamps).
5. Recommendations are derived from **that** data; checklist state can be org-scoped in DB later.

Until steps 1–4 work without sample catalogs, the product is still a foundation + demo.

---

## 1. Prisma persistence (measurements & tenancy data)

### 1.1 Current state
- Schema has `Organization`, `Brand`, `VisibilityAudit`, new `EvaluationRun`.
- Runtime measurement path uses **in-memory** `lib/measurement.ts` store.
- Cold starts wipe runs; multi-instance deploys do not share data.

### 1.2 Steps to add Prisma persistence

**Step A — Environment & client**
1. Ensure `.env.example` documents:
   - `DATABASE_URL` (Postgres)
   - `AUTH_SECRET`
   - Optional `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`
2. Add `lib/prisma.ts` singleton:
   ```ts
   import { PrismaClient } from "@prisma/client";
   const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
   export const prisma = globalForPrisma.prisma ?? new PrismaClient();
   if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
   ```
3. Wire `package.json`:
   - `"prisma": { "seed": "tsx prisma/seed.ts" }` (or `ts-node`)
   - scripts: `db:migrate`, `db:push`, `db:seed`

**Step B — Migrations**
1. `npx prisma migrate dev --name evaluation_runs_and_api_key_lifecycle`
2. Confirm `EvaluationRun` indexes: `(organizationId, measuredAt)`, `(organizationId, brandName)`.
3. CI: keep `prisma generate` + `prisma validate` mandatory; add `prisma migrate diff` check on PRs if possible.

**Step C — Repository layer**
1. Create `lib/repositories/measurements.ts`:
   - `createEvaluationRun(input)` → `prisma.evaluationRun.create`
   - `listEvaluationRuns(organizationId, { take })`
   - `getEvaluationRun(id, organizationId)` (always filter by org)
   - `aggregateScores(organizationId)` via `groupBy` / raw SQL averages
2. Change `runMeasurement()` to:
   - Always compute scores in-process (pure function).
   - If `process.env.DATABASE_URL` present → persist via repository.
   - Else → fall back to memory store (local demo without DB).
3. Never return another org’s rows; org id comes from **server-derived tenant context**, not only the request body.

**Step D — Seed for buyer demo**
1. Expand `prisma/seed.ts`:
   - Org `acme-analytics` + user `owner@example.com`
   - Brand + 3 sample prompts
   - Optional: 2–3 `EvaluationRun` rows so a fresh DB is not empty after seed
2. Document: `npx prisma db push && npx prisma db seed`

**Step E — Acceptance tests**
1. Integration test with testcontainers or a CI Postgres service:
   - Org A creates run; Org B list is empty.
   - Get-by-id with wrong org returns 404/403.
2. Unit tests keep pure scoring functions offline.

**Step F — Ops**
1. Dockerfile: hard-fail `prisma generate` (remove `|| true`).
2. Vercel: set `DATABASE_URL` (Neon/Supabase/Vercel Postgres).
3. Runbook: migrate on deploy (`prisma migrate deploy`).

---

## 2. Real authentication & authorization

### 2.1 Current state
- `x-organization-id` / `x-role` headers for demo tenancy.
- Schema has `User`, `Membership`, `Role`, `ApiKey` (with new expiry/revocation fields).
- No session login, no password/magic link, no verified API key middleware.

### 2.2 Recommended approach (pragmatic for a transferred SaaS)

**Auth.js (NextAuth) v5** with:
- Credentials or Email magic link (buyer chooses).
- JWT or database sessions stored via Prisma adapter.
- Organization membership loaded into session.

### 2.3 Steps to add real auth

**Step A — Dependencies & schema**
1. Add Auth.js + Prisma adapter packages.
2. Add Auth.js models if needed (`Account`, `Session`, `VerificationToken`) **or** use JWT-only to minimize schema churn.
3. Ensure `User.email` unique; link `Membership` on first login / invite.

**Step B — Auth config**
1. `lib/auth.ts`:
   - Providers: Email (Resend/SMTP) and/or Credentials for private transfer demos.
   - Callbacks: attach `userId`, default `organizationId`, `role` from membership.
2. Env: `AUTH_SECRET`, `AUTH_URL` / `APP_URL`, email provider keys.
3. Routes: `/api/auth/[...nextauth]`, pages `/login`, `/invite`.

**Step C — Tenant middleware**
1. `lib/auth/tenant.ts`:
   ```ts
   export async function requireTenant()
   // returns { userId, organizationId, role } or throws 401
   ```
2. Replace header-only `resolveTenantContext` in protected routes:
   - `/api/visibility/measure`
   - future `/api/brands`, `/api/evaluations`
3. Keep **public** demo routes explicit:
   - `GET /api/visibility/summary` without auth → fixtures only
   - Authenticated + `?live=1` → Prisma aggregates for session org

**Step D — API keys (for automation / buyer pipelines)**
1. Create hashed keys (`sha256` + salt) on issuance; store `hashedKey`, `scopes`, `expiresAt`, `revokedAt`.
2. Middleware: `Authorization: Bearer kyz_...` → resolve org + scopes.
3. Scopes example: `measurements:read`, `measurements:write`, `brands:write`.
4. Tests: revoked/expired keys rejected; key for org A cannot write org B.

**Step E — RBAC**
| Role | Read scores | Run measurement | Manage members | Manage billing |
|------|-------------|-----------------|----------------|----------------|
| VIEWER | yes | no | no | no |
| ANALYST | yes | yes | no | no |
| ADMIN | yes | yes | yes | no |
| OWNER | yes | yes | yes | yes |

Enforce in `canWrite` / `canManage` helpers using session role.

**Step F — Acceptance**
1. Two users, two orgs: no cross-read in UI or API.
2. Logged-out access to measure POST → 401.
3. VIEWER POST measure → 403.

---

## 3. Customer walkthrough wizard GUI

### 3.1 Purpose
Replace “read the README” with a **first-run wizard** so the customer pipes in their data and sees real results in one session.

### 3.2 Wizard route
- Path: `/onboarding` (block dashboard deep features until `Organization.onboardingCompletedAt` or equivalent flag).
- Persist progress: `Organization` fields or `OnboardingState` JSON.

### 3.3 Wizard steps (UI)

| Step | Screen | Inputs | Backend |
|------|--------|--------|--------|
| 1 Welcome | Value prop + “Use sample” vs “Connect my data” | choice | sets mode |
| 2 Workspace | Org name, slug | form | `Organization` create |
| 3 Brand | Brand name, website, competitors | form | `Brand`, `Competitor` |
| 4 Prompts | 3–10 evaluation queries | list editor | store prompts (new `EvaluationPrompt` model recommended) |
| 5 Surfaces | Checkboxes for surfaces | toggles | config |
| 6 Provider | Mock (default) / OpenAI / Anthropic | keys in env or org vault | validate with test call |
| 7 First run | “Run evaluation” button | confirm | `runMeasurement` × N prompts → Prisma |
| 8 Results | Score cards + evidence links | — | read `EvaluationRun` |
| 9 Next actions | Recommendations from live scores | checklist | existing engine fed by aggregates |

### 3.4 UX requirements
- Progress indicator (step i of n).
- Skip/back; never lose drafted brand/prompts (save draft each step).
- Explicit banners: **Sample fixtures** vs **Live measurements**.
- Empty states that deep-link back to the wizard.
- Mobile-usable; same depth/visual system as dashboard.

### 3.5 Data model additions (recommended)
```prisma
model EvaluationPrompt {
  id             String   @id @default(cuid())
  organizationId String
  brandId        String?
  text           String
  surface        String   @default("answer_engines")
  active         Boolean  @default(true)
  createdAt      DateTime @default(now())
}
```
Optional: `Organization.onboardingCompletedAt DateTime?`

### 3.6 Wizard acceptance
1. New user finishes wizard in < 10 minutes with Mock provider.
2. Dashboard overall score reflects **persisted** runs, not `SAMPLE_RAW`.
3. Evidence page shows prompt, raw text, citations, `scoringVersion`, `measuredAt`.

---

## 4. Full remaining improvements list

### P0 — Must have for “customer sees real results”
1. Prisma client + migrate/deploy path.
2. Persist `EvaluationRun` on measure; list/get org-scoped.
3. Session auth (Auth.js) + membership-scoped tenant context.
4. Onboarding wizard GUI (section 3).
5. Dashboard **Evidence** panel bound to Prisma runs.
6. Public demo remains fixtures-only; authenticated app defaults to live data when runs exist.

### P1 — Production credibility
7. API keys with hash, expiry, revoke, scopes.
8. Live provider adapter (OpenAI/Anthropic) behind spend caps + timeouts (reuse copilot patterns).
9. Historical trend from `measuredAt` buckets (7d / 30d).
10. Job/queue for batch evaluations (avoid serverless timeouts).
11. CSP headers; dependency + secret scanning in CI.
12. Coverage thresholds on critical libs (`measurement`, `tenancy`, `telegram`).

### P2 — Buyer transfer polish
13. Screenshots + Loom on README and marketplace listing.
14. Publish listing; send outreach from `docs/OUTREACH.md`.
15. Day-1 buyer runbook: env matrix, migrate, seed, wizard, revoke demo keys.
16. Support window checklist (Escrow + 7-day support).
17. Homepage narrative: wizard-centric, not repo-checklist-centric.

### P3 — Scale / later
18. Billing webhooks fully enforced (Stripe customer portal).
19. Audit log UI for sensitive actions.
20. Multi-region / read replicas.
21. SSO (SAML/OIDC) for enterprise transfers.
22. Durable Telegram dedupe/quotas in Redis.

---

## 5. Suggested implementation order (engineering sequence)

```
Week 1
  [ ] lib/prisma.ts + migrate EvaluationRun
  [ ] Repository + measure API writes/reads DB
  [ ] Integration tests (two-org isolation)
  [ ] Dashboard evidence list from API

Week 2
  [ ] Auth.js login + session tenant
  [ ] Protect measure/brand routes
  [ ] API key issue/verify
  [ ] Login + logout UI

Week 3
  [ ] /onboarding wizard steps 1–9
  [ ] EvaluationPrompt model
  [ ] First-run batch executor
  [ ] Fixture vs live banners everywhere

Week 4
  [ ] Optional live providers + caps
  [ ] Trends from history
  [ ] Transfer runbook + listing assets
  [ ] CI coverage + CSP
```

---

## 6. Minimal API surface the wizard needs

| Method | Path | Auth | Purpose |
|--------|------|------|--------|
| POST | `/api/orgs` | session | Create workspace |
| POST | `/api/brands` | session | Create brand |
| POST | `/api/prompts` | session | Save evaluation prompts |
| POST | `/api/visibility/measure` | session or API key | Run one measurement |
| POST | `/api/visibility/measure/batch` | session | Run all active prompts |
| GET | `/api/visibility/measure` | session | List evidence |
| GET | `/api/visibility/summary?live=1` | session | Aggregates from DB |
| POST | `/api/onboarding/complete` | session | Flag wizard done |

---

## 7. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Serverless timeout on batch measure | Cap batch size (e.g. 5); queue remainder |
| Cost blowup on live providers | Per-org monthly token budget; mock default |
| Auth misconfig locks buyers out | Seed OWNER user documented; break-glass env |
| Schema drift on transfer | `migrate deploy` in release script; versioned migrations in repo |
| Demo data mistaken for live | Hard UI labels; separate public demo host optional |

---

## 8. Success metrics

- Time-to-first-live-score for a new buyer: **< 15 minutes** after deploy.
- Zero cross-tenant reads in automated tests.
- 100% of dashboard scores on an onboarded org traceable to an `EvaluationRun` id.
- Wizard completion rate (self-serve): track `onboardingCompletedAt`.

---

## 9. What not to rebuild

Keep: scoring weights, recommendation engine, dashboard visual system, Telegram fail-closed controls, explicit fixture catalogs for public demo, SALES/Escrow packaging.


---

## Implementation status (2026-10-26)

| Item | Status |
|------|--------|
| Prisma client + conditional persist | Done |
| Session auth + login/onboarding | Done |
| Wizard GUI | Done |
| Batch measure | Done |
| Evidence panel on dashboard | Done |
| API keys issue/verify + Bearer auth | Done |
| Trends helper | Done |
| CSP header | Done |
| Buyer runbook | Done |
| Live LLM measurement provider | Partial (mock default; copilot has live providers) |
| Auth.js OAuth/magic-link | Not required (HMAC sessions); upgrade optional |
| Job queue | Not done (batch capped at 10 inline) |
| Marketplace listing assets | Human step |
