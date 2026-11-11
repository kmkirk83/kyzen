# Demo visuals & walkthrough

## Live base (primary)

**https://kyzen-demo.vercel.app**

Alternate project URL may appear in older docs; prefer the primary above.

## Enabling live measurement (Milestone 1)

The public demo runs the **mock** provider by default so evaluators need no API keys. To produce real, persisted, traceable evidence from the deployed application, follow these steps in order.

### 0. Create a free / trial provider key

You need at least one of the following. Both providers offer free credits or trial access sufficient for verification runs.

**OpenAI (preferred)**  
1. Go to [https://platform.openai.com/signup](https://platform.openai.com/signup) (or log in).  
2. Open **API keys** → **Create new secret key**.  
3. Copy the key (shown only once).  
4. Optional: set a monthly budget / usage limit in the billing settings to avoid unexpected charges.  
5. Free-tier / new-account credits are normally enough for dozens of measurement runs.

**Anthropic (alternative)**  
1. Go to [https://console.anthropic.com/](https://console.anthropic.com/).  
2. Create an account or log in.  
3. Navigate to **API Keys** → create a key.  
4. Copy the key.  
5. New accounts typically receive free credits suitable for testing.

Store the key securely. Do not commit it to the repository.

### 1. Configure the key on the deployment

In the Vercel project (or self-hosted environment) set at least one of:

- `OPENAI_API_KEY` (preferred) + optional `OPENAI_MODEL` (default `gpt-4o-mini`)
- `ANTHROPIC_API_KEY` + optional `ANTHROPIC_MODEL` (default `claude-3-5-haiku-latest`)

### 2. Confirm database connectivity

Ensure `DATABASE_URL` points at a reachable Postgres instance (Neon is already used on the public demo).

### 3. Redeploy

Trigger a new deployment so the environment variables take effect.

### 4. Trigger a measurement

- Onboarding wizard → Measure step, or  
- `POST /api/visibility/measure` with `{ "brandName": "...", "prompt": "..." }`, or  
- `POST /api/visibility/measure/batch`

### 5. Confirm live evidence

- `GET /api/visibility/measure` returns runs whose `response.provider` is `openai` or `anthropic`
- Aggregate includes `liveCount` > 0 and `providers` contains the live provider
- Evidence panel shows the new runs with live provenance (live badge, mention status)
- Each run contains `rawText` (full provider response) and structured `evidence` (`mentioned`, `mentionCount`, `firstMentionOffset`, `isLive`)

Provider resolution order is fixed: OpenAI → Anthropic → mock. Live calls are logged with `[measurement] using live provider=...`. Failures fall back to mock so the product never blocks evaluation.

Readiness endpoint (`GET /api/readiness`) already surfaces whether any AI provider key is configured and whether live measurement is ready.

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

Screenshots + ~26s slideshow MP4 (kyzen-buyer-walkthrough.mp4) produced in agent artifacts this run (no drawtext; pure image sequence). HUMAN: optionally add voiceover or upload to Loom; attach stills to listing.

## 60-second script (HUMAN: record 60s)

1. (0:00–0:08) Open `/start` — “Buyer super demo: live Evidence, no login.”
2. (0:08–0:25) Open `/dashboard` — headline score, pillars, surfaces; scroll to **Evidence**.
3. (0:25–0:35) Toggle **Seeded** — scores update without a database.
4. (0:35–0:45) Tick a recommendation — checklist persists in the browser.
5. (0:45–0:55) Optional cut: `/onboarding` Measure step or show `GET /api/visibility/measure`.
6. (0:55–1:00) Point to repo + SALES.md — price band, Escrow, transfer.

Record at 1080p; link the video URL in README when uploaded.

## Latest verification (2026-11-11 06:15 UTC)

- Live measure→Neon persist confirmed: GET `/api/visibility/measure` (default org `org_acme_demo`) returns aggregate count 54, `persisted: true`, providers: ["mock"]. Dashboard Evidence panel displays the same (mock labeled).
- Mock provider is labeled in UI banner, Evidence cards, and API responses.
- Onboarding wizard at `/onboarding` is reachable and functional for batch measure.
- Production Vercel deployment READY on latest main (dpl_DUaZ1AsrSrfF6QXGpX1Nm7BFXCt2). PWA assets present.
- Dependabot major-version freeze configured.
- **CI blocker remains:** GitHub Actions fail with account locked due to billing issue. Vercel deploys independent.
- Walkthrough assets advanced: headless screenshots + slideshow MP4 generated (drawtext unavailable; image sequence used). Exact click path and 60s script remain in this file. HUMAN: optional voiceover / Loom upload.

## Seeded live demo note

Public demo org `org_acme_demo` has 54+ persisted evaluation runs. Dashboard Evidence shows them without authentication. Sample/Seeded modes remain independent of the live Evidence panel.
