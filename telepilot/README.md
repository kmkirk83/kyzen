# Telepilot

This directory is a standalone public-repository seed for a completely separate GitHub repository named `telepilot`. Copy these files into a new repository root to publish the connector independently.

## What it includes

- Next.js webhook endpoint at `/api/integrations/telegram`
- Telegram chat allowlist support
- OpenAI and Anthropic reply providers
- Marketplace-friendly docs for setup, support, and privacy
- Apache 2.0 license

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

Configure these environment variables before registering the webhook:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- Optional `TELEGRAM_ALLOWED_CHAT_IDS`
- Optional `TELEGRAM_COPILOT_SYSTEM_PROMPT`

Register the Telegram webhook against:

```text
https://<your-domain>/api/integrations/telegram
```

Send the same secret in the `X-Telegram-Bot-Api-Secret-Token` header when creating the webhook.

## Marketplace checklist

Before publishing this as its own repository:

1. Create a new public GitHub repository named `telepilot`.
2. Copy the contents of this directory into that repository root.
3. Add repository description, logo, screenshots, and listing copy.
4. Link `docs/privacy.md` and `SUPPORT.md` from the marketplace listing.
5. Publish your final terms, support contact, and marketplace assets.

## Support and policy docs

- Support: `SUPPORT.md`
- Privacy: `docs/privacy.md`
- Security: `SECURITY.md`
