# Day-1 buyer runbook

## 1. Deploy

1. Fork or transfer `kmkirk83/kyzen`.
2. Create Postgres (Neon / Supabase / Vercel Postgres).
3. Set env:
   - `DATABASE_URL`
   - `AUTH_SECRET` (long random)
   - Optional: `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` for copilot
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
- Authenticated measurements → memory or Prisma `EvaluationRun`.
- Dashboard Evidence panel reads `/api/visibility/measure`.

## 5. Support window

See `SALES.md` for Escrow terms and post-sale support.
