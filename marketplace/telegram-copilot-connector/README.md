# Clarion Telegram Copilot Connector

This directory is a standalone public-repository seed for the Clarion Telegram connector. Copy these files into a new GitHub repository when you are ready to publish the connector separately from the private Clarion SaaS codebase and list it in a marketplace.

## What it includes

- Next.js webhook endpoint at `/api/integrations/telegram`
- Telegram chat allowlist support
- OpenAI and Anthropic reply providers
- Marketplace-friendly docs for setup, support, and privacy
- Apache 2.0 license copied from the main project

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

1. Create a new public GitHub repository.
2. Copy the contents of this directory into that repository root.
3. Add repository description, logo, screenshots, and listing copy.
4. Link `docs/privacy.md` and `SUPPORT.md` from the marketplace listing.
5. Replace any Clarion-specific branding or support details that should differ in the public listing.

## Support and policy docs

- Support: `SUPPORT.md`
- Privacy: `docs/privacy.md`
- Security: use the parent repository's `SECURITY.md` or add a connector-specific policy before publishing
