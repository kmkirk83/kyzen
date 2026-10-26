# Outside-code execution log (2026-10-26)

## Done from agent

- [x] AUTH_SECRET set on Vercel project `kyzen-demo` (production/preview/development)
- [x] docs/LISTING.md paste-ready marketplace copy
- [x] docs/OUTREACH_BATCH.md email/LI/X/IH templates + tracker
- [x] README buyer section with demo + listing links

## Requires your account (cannot complete without browser login)

### A. Postgres (required for durable runs on Vercel)
1. Open https://vercel.com/kmkirk83s-projects/kyzen-demo/stores
2. Create **Postgres** (Vercel Postgres / Neon integration)
3. Confirm `DATABASE_URL` appears under Environment Variables
4. Redeploy production
5. From a local clone: `npx prisma db push`

Direct: https://vercel.com/kmkirk83s-projects/kyzen-demo/settings/environment-variables

### B. Loom (60s)
1. https://www.loom.com/record
2. Script: docs/DEMO.md
3. Record: home → onboarding → run → dashboard Evidence
4. Paste URL into README and Acquire listing

### C. Publish listing
1. https://acquire.com — New listing — paste docs/LISTING.md
2. https://www.indiehackers.com — post sale thread

### D. Send outreach
1. Fill tracker in docs/OUTREACH_BATCH.md
2. Send 5 messages (email/LI) using Body A or B
