# Demo visuals & walkthrough

## Live base (primary)

**https://kyzen-demo.vercel.app**

Alternate project URL may appear in older docs; prefer the primary above.

## Super demo click path (buyer)

1. **Start** — https://kyzen-demo.vercel.app/start  
   60-second path: Evidence → Sample/Seeded → optional onboarding measure.
2. **Dashboard Evidence** — https://kyzen-demo.vercel.app/dashboard  
   Scroll to **Evidence**. Live aggregate and runs are loaded from `GET /api/visibility/measure` (Neon when `DATABASE_URL` is set).
3. **Toggle Sample ↔ Seeded** in the dashboard header.
4. **Mark one recommendation done** (browser-local checklist).
5. **Onboarding batch measure** — https://kyzen-demo.vercel.app/onboarding  
   Welcome → Environment → Organization → **Measure** (brand + prompts) → Ready → Open dashboard Evidence.
6. **API** — https://kyzen-demo.vercel.app/api/visibility/summary  
   and https://kyzen-demo.vercel.app/api/health

## Suggested stills for listing / README

- Hero score + pillars
- Surface cards
- Recommended improvements with one item checked
- Evidence panel with multiple runs (Kyzen brand prompts)
- Sample vs Seeded toggle
- Onboarding Measure step

## 60-second script (HUMAN: record 60s)

1. (0:00–0:08) Open `/start` — “Buyer super demo: live Evidence, no login.”
2. (0:08–0:25) Open `/dashboard` — headline score, pillars, surfaces; scroll to **Evidence**.
3. (0:25–0:35) Toggle **Seeded** — scores update without a database.
4. (0:35–0:45) Tick a recommendation — checklist persists in the browser.
5. (0:45–0:55) Optional cut: `/onboarding` Measure step or show `GET /api/visibility/measure`.
6. (0:55–1:00) Point to repo + SALES.md — price band, Escrow, transfer.

Record at 1080p; link the video URL in README when uploaded.

## Seeded live demo note

Public demo org `org_acme_demo` has persisted evaluation runs (including Kyzen-brand prompts). Dashboard Evidence should show them without authentication when the deployment has `DATABASE_URL`.
