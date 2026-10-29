# Day-1 buyer runbook

## 10-minute buyer script (evaluation)

1. (0:00) Open https://kyzen-demo.vercel.app/start — note live Evidence, no login required.
2. (0:01) Click through to /dashboard. Scroll to Evidence panel; confirm persisted runs (Neon, persisted: true).
3. (0:03) Toggle Sample ↔ Seeded in the header; observe fixture score changes.
4. (0:04) Mark one recommendation done (browser-local).
5. (0:05) Open /onboarding. Walk Welcome → Environment → Organization → Measure (enter brand + 1–2 prompts) → Run batch measure.
6. (0:08) Return to /dashboard Evidence; confirm new runs appear for the org.
7. (0:09) Hit GET /api/visibility/measure and /api/health to show the contract.
8. (0:10) Point to repo, SALES.md, and docs/LISTING.md — price $4–9k, revenue $0, Escrow transfer.

## 1. Deploy

1. Fork or transfer `kmkirk83/kyzen`.
2. Create Postgres (Neon / Supabase / Vercel Postgres).
3. Set env:
   - `DATABASE_URL`
   - `AUTH_SECRET` (long random)
   - Optional: `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` for live providers (mock fallback always available)
   - Optional Telegram vars only with `TELEGRAM_ALLOWED_CHAT_IDS` set
4. `npx prisma generate && npx prisma db push` (or `migrate deploy`).
5. Deploy to Vercel/Docker.

## 2. First session

1. Open `/onboarding` (or `/login`).
2. Create workspace with your email.
3. Enter brand + prompts.
4. Run evaluation — scores appear under Evidence on `/dashboard`.

## 3. API automation

```bash
# After login as OWNER/ADMIN in browser, or call:
curl -X POST https://YOUR_HOST/api/keys \
  -H "Cookie: kyzen_session=..." \
  -H "content-type: application/json" \
  -d '{"label":"pipeline"}'

curl -X POST https://YOUR_HOST/api/visibility/measure \
  -H "Authorization: Bearer kyz_..." \
  -H "content-type: application/json" \
  -d '{"brandName":"Acme","prompt":"What is Acme known for?"}'
```

## 4. Fixture vs live

- Public `/api/visibility/summary` without auth → sample/seeded fixtures.
- Measurements via `/api/visibility/measure` → memory or Prisma `EvaluationRun` (Neon on demo).
- Dashboard Evidence panel reads `/api/visibility/measure`.

## 5. Support window

See `SALES.md` for Escrow terms and post-sale support.
