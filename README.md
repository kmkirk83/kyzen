# Kyzen

Commercialization-focused foundation for an **AI Visibility Intelligence** platform. Kyzen is designed as a hosted, multi-tenant SaaS product that helps brands measure, monitor, and improve their visibility across AI and search surfaces.

## What Is Included

- Next.js 16 + TypeScript application baseline
- Prisma data model for organizations, memberships, reports, billing, API keys, and audits
- Environment readiness checks and operational API endpoints
- Docker-ready standalone runtime configuration
- CI, CodeQL, Dependabot, and release automation scaffolding
- Commercialization documentation for security, support, releases, and contribution workflows

## Product Direction

1. **Hosted SaaS first** — commercial launch focus
2. **Developer platform second** — public API and future SDK/CLI packages
3. **Enterprise distribution third** — Docker-based self-hosting

## Requirements

- Node.js 22+
- npm 11+
- PostgreSQL 15+

## Local Development

```bash
cp .env.example .env
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

See `.env.example` for the full contract. Key integrations include:

- `DATABASE_URL` — PostgreSQL connection
- `AUTH_SECRET` — session security
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` — scoring and Telegram copilot
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_WEBHOOK_SECRET` — Telegram connector
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — billing
- `SENTRY_DSN` — monitoring

## Available Commands

| Command              | Description                          |
|----------------------|--------------------------------------|
| `npm run dev`        | Start development server             |
| `npm run build`      | Production build                     |
| `npm run start`      | Run production server                |
| `npm run lint`       | ESLint                               |
| `npm run typecheck`  | TypeScript checks                    |
| `npm run test`       | Jest tests                           |
| `npm run prisma:validate` | Validate Prisma schema          |
| `npm run check`      | Lint + typecheck + test + build      |

## HTTP Endpoints

- `GET /api/health` — liveness
- `GET /api/readiness` — environment and subsystem readiness
- `POST /api/integrations/telegram` — Telegram webhook relay

## Telegram Copilot Connector

1. Create a bot via BotFather and obtain the token.
2. Configure the relevant environment variables.
3. Optionally restrict access with `TELEGRAM_ALLOWED_CHAT_IDS`.
4. Point the webhook at `https://<your-domain>/api/integrations/telegram`.

A standalone seed for a separate `telepilot` repository is available under the `telepilot/` directory.

## Deployment

The application is configured for hosted Next.js deployment with Docker-compatible standalone output. See:

- `docs/runbooks/production.md`
- `Dockerfile`

## Governance

- Semantic versioning via Release Please
- `CHANGELOG.md`, `SECURITY.md`, `CONTRIBUTING.md`, and `CODEOWNERS` are present

## License

See the [LICENSE](LICENSE) file.
