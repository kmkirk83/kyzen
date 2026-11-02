# Demo visuals & walkthrough

## Live base (primary)

**https://kyzen-demo.vercel.app**

Alternate project URL may appear in older docs; prefer the primary above.

## Enabling live measurement (Milestone 1)

The public demo runs the **mock** provider by default so evaluators need no API keys. To produce real, persisted, traceable evidence from the deployed application:

1. In the Vercel project (or self-hosted environment) set at least one of:
   - `OPENAI_API_KEY` (preferred) + optional `OPENAI_MODEL` (default `gpt-4o-mini`)
   - `ANTHROPIC_API_KEY` + optional `ANTHROPIC_MODEL` (default `claude-3-5-haiku-latest`)
2. Ensure `DATABASE_URL` points at a reachable Postgres (Neon is already used on the public demo).
3. Redeploy.
4. Trigger a measurement via:
   - Onboarding wizard → Measure step, or
   - `POST /api/visibility/measure` with `{ "brandName": "...", "prompt": "..." }`, or
   - `POST /api/visibility/measure/batch`
5. Confirm:
   - `GET /api/visibility/measure` returns runs whose `response.provider` is `openai` or `anthropic`
   - Aggregate includes `liveCount` > 0 and `providers` contains the live provider
   - Evidence panel shows the new runs with live provenance
   - Each run contains `rawText` (full provider response) and structured `evidence` (`mentioned`, `mentionCount`, `firstMentionOffset`, `isLive`)

Provider resolution order is fixed: OpenAI → Anthropic → mock. Live calls are logged with `[measurement] using live provider=...`. Failures fall back to mock so the product never blocks evaluation.

Readiness endpoint (`GET /api/readiness`) already surfaces whether any AI provider key is configured.

**Important:** Action Center and Content Agent work must wait until this live evidence path is verified. They are only defensible when they operate on persisted, re-runnable evidence.

## Super demo click path (buyer)

1. **Start** — https://kyzen-demo.vercel.app/start  
   60-second path: Evidence → Sample/Seeded → optional onboarding measure.
2. **Dashboard Evidence** — https://kyzen-demo.vercel.app/dashboard  
   Scroll to **Evidence**. Live aggregate and runs are loaded from `GET /api/visibility/measure` (Neon when `DATABASE_URL` is set). Verified: POST with `x-organization-id` persists and returns on subsequent GET (`persisted: true`).
3. **Toggle Sample ↔ Seeded** in the dashboard header.
4. **Mark one recommendation done** (browser-local checklist).
5. **Onboarding batch measure** — https://kyzen-demo.vercel.app/onboarding  
   Welcome → Environment → Organization → **Measure** (brand + prompts) → Ready → Open dashboard Evidence. Batch endpoint also verified live.
6. **API** — https://kyzen-demo.vercel.app/api/visibility/summary  
   and https://kyzen-demo.vercel.app/api/health

## Suggested stills for listing / README

- Hero score + pillars
- Surface cards
- Recommended improvements with one item checked
- Evidence panel with multiple runs (Kyzen brand prompts)
- Sample vs Seeded toggle
- Onboarding Measure step

**Automated stills captured this run (headless chromium, 1440x900):**
- `/start` (start.png)
- `/dashboard` (dashboard.png)
- `/onboarding` (onboarding.png)

Screenshots available in agent artifacts for this verification run. HUMAN: attach these or higher-res captures / voiceover to listing / Loom. MP4 generation blocked by missing ffmpeg drawtext filter; use screenshots or record 60s.

## 60-second script (HUMAN: record 60s)

1. (0:00–0:08) Open `/start` — “Buyer super demo: live Evidence, no login.”
2. (0:08–0:25) Open `/dashboard` — headline score, pillars, surfaces; scroll to **Evidence**.
3. (0:25–0:35) Toggle **Seeded** — scores update without a database.
4. (0:35–0:45) Tick a recommendation — checklist persists in the browser.
5. (0:45–0:55) Optional cut: `/onboarding` Measure step or show `GET /api/visibility/measure`.
6. (0:55–1:00) Point to repo + SALES.md — price band, Escrow, transfer.

Record at 1080p; link the video URL in README when uploaded.

## Latest verification (2026-11-02 05:14 UTC)

- GET `/api/visibility/measure` (default org `org_acme_demo`) returns 44+ runs, aggregate count 44, `persisted: true`, providers: ["mock"].
- Dashboard Evidence panel (client-rendered) displays live aggregate and multiple persisted runs. Mock provider is labeled in the Evidence banner and heading ("EVIDENCE (MOCK PROVIDER)").
- Full onboarding wizard E2E confirmed: Welcome → Environment (2/6 ready) → Organization (persisted) → Measure (brand KyzenSaleTest + 2 prompts) → batch POST succeeds, 2 runs created, Ready step shown. Subsequent dashboard Evidence reflects new runs.
- Batch measure `POST /api/visibility/measure/batch` with brandName + prompts array succeeds and persists; subsequent GET returns the new runs.
- Health endpoint returns `{"status":"ok","service":"kyzen","version":"0.3.0"}`.
- Production deployment on Vercel is READY (latest main commits).
- PWA assets present: `/manifest.webmanifest`, `/sw.js`, icons; service worker registration in layout.
- Dependabot major-version freeze configured in `.github/dependabot.yml`.
- **CI blocker:** GitHub Actions runs fail with "account is locked due to a billing issue" (ubuntu-latest). Workflows themselves are valid; billing must be resolved on the owner account for green CI. Vercel production deploys continue independently. See docs/CI_WORKAROUNDS.md.
- Walkthrough MP4 generation blocked by ffmpeg drawtext filter; docs contain exact click path + 60s script. HUMAN: record 60s from path above.

## Seeded live demo note

Public demo org `org_acme_demo` has persisted evaluation runs (including Kyzen-brand prompts). Dashboard Evidence should show them without authentication when the deployment has `DATABASE_URL`. Current dashboard reports 44+ live mock-provider runs persisted in Postgres.
