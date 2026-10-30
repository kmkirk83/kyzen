# Demo visuals & walkthrough

## Live base (primary)

**https://kyzen-demo.vercel.app**

Alternate project URL may appear in older docs; prefer the primary above.

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

Screenshots and a 75s caption-free MP4 sequence (start → dashboard → onboarding) are available in agent artifacts for this verification run. HUMAN: attach these or higher-res captures / voiceover to listing / Loom.

## 60-second script (HUMAN: record 60s)

1. (0:00–0:08) Open `/start` — “Buyer super demo: live Evidence, no login.”
2. (0:08–0:25) Open `/dashboard` — headline score, pillars, surfaces; scroll to **Evidence**.
3. (0:25–0:35) Toggle **Seeded** — scores update without a database.
4. (0:35–0:45) Tick a recommendation — checklist persists in the browser.
5. (0:45–0:55) Optional cut: `/onboarding` Measure step or show `GET /api/visibility/measure`.
6. (0:55–1:00) Point to repo + SALES.md — price band, Escrow, transfer.

Record at 1080p; link the video URL in README when uploaded.

**Note:** Caption-free MP4 walkthrough (screenshots sequenced, ~75s) generated this run despite missing ffmpeg drawtext filter. HUMAN: record voiceover or upload the asset; video still required for marketplace.

## Latest verification (2026-10-30 04:15 UTC)

- GET `/api/visibility/measure` (default org) returns 40 runs, aggregate count 40, `persisted: true`, providers: ["mock"].
- Dashboard Evidence panel displays live aggregate and multiple persisted runs. Mock provider is labeled in the Evidence banner and heading.
- Batch measure `POST /api/visibility/measure/batch` with brandName + prompts array succeeds and persists; subsequent GET returns the new runs at the top of the list (E2E onboarding path verified with ExecutorTest2026).
- Health endpoint returns `{"status":"ok","service":"kyzen","version":"0.3.0"}`.
- Production deployment on Vercel is READY (latest main commits).
- PWA assets present: `/manifest.webmanifest`, `/sw.js`, icons; service worker registration in layout.
- Dependabot major-version freeze configured in `.github/dependabot.yml`.
- **CI blocker:** GitHub Actions runs fail with "account is locked due to a billing issue" (ubuntu-latest). Workflows themselves are valid; billing must be resolved on the owner account for green CI. Vercel production deploys continue independently.
- Walkthrough assets produced: start.png, dashboard.png, onboarding.png, kyzen-buyer-walkthrough.mp4 (caption-free).

## Seeded live demo note

Public demo org `org_acme_demo` has persisted evaluation runs (including Kyzen-brand prompts). Dashboard Evidence should show them without authentication when the deployment has `DATABASE_URL`. Current dashboard reports 30+ live mock-provider runs persisted in Postgres.
