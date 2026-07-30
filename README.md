# Clarion

> AI-powered middleware for marketing and SEO research.

Clarion is an Express.js middleware service that gives marketers and SEO
practitioners instant access to keyword analysis, campaign planning, and
AI-generated suggestions — all through a clean REST API.

---

## Features

| Feature | Endpoint |
|---|---|
| Keyword SEO analysis | `GET /api/seo/analyze` · `POST /api/seo/analyze` |
| Meta-tag recommendations | `POST /api/seo/meta` |
| AI keyword suggestions | `POST /api/seo/suggestions` |
| Campaign brief builder | `POST /api/marketing/campaign` |
| AI marketing suggestions | `POST /api/marketing/suggestions` |
| AI competitor insights | `POST /api/marketing/competitor-analysis` |
| Health check | `GET /health` |

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment variables
cp .env.example .env
#    Add your OPENAI_API_KEY to .env

# 3. Start the server
npm start        # production
npm run dev      # development (auto-reload with nodemon)
```

The API will be available at `http://localhost:3000`.

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Node environment |
| `OPENAI_API_KEY` | — | **Required for AI endpoints** |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model to use |
| `OPENAI_MAX_TOKENS` | `1024` | Max tokens per AI response |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate-limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `CORS_ORIGIN` | `*` | Allowed CORS origin |

---

## API reference

### SEO endpoints

#### `GET /api/seo/analyze`

Analyse keywords for difficulty, search intent, and summary stats.

| Query param | Type | Required | Description |
|---|---|---|---|
| `keywords` | string (comma-sep) | ✅ | Seed keywords |
| `searchEngine` | string | | `google` · `bing` · `duckduckgo` · `yahoo` |
| `locale` | string | | e.g. `en-US` (default) |

```bash
curl "http://localhost:3000/api/seo/analyze?keywords=best+seo+tools,buy+sneakers&locale=en-US"
```

#### `POST /api/seo/analyze`

Same as `GET` but accepts a JSON body.

```json
{ "keywords": ["best seo tools", "buy sneakers"], "searchEngine": "google" }
```

#### `POST /api/seo/meta`

Generate title, meta description, and structured-data recommendations.

```json
{ "topic": "digital marketing", "keywords": ["seo", "ppc", "content"] }
```

#### `POST /api/seo/suggestions` *(requires `OPENAI_API_KEY`)*

AI-generated long-tail keyword suggestions, intent analysis, and content ideas.

```json
{ "keywords": ["ai marketing tools"], "locale": "en-US" }
```

---

### Marketing endpoints

#### `POST /api/marketing/campaign`

Build a channel-scored campaign brief.

```json
{
  "topic": "AI-powered SEO platform",
  "audience": "marketing managers",
  "channels": ["email", "seo", "content"],
  "goal": "leads"
}
```

Valid goals: `awareness` · `leads` · `sales` · `retention`

#### `POST /api/marketing/suggestions` *(requires `OPENAI_API_KEY`)*

AI-generated campaign messaging, channel tactics, and KPIs.

```json
{ "topic": "SEO SaaS", "audience": "SMB marketers", "channels": ["email", "social"] }
```

#### `POST /api/marketing/competitor-analysis` *(requires `OPENAI_API_KEY`)*

AI-generated competitive landscape insights and positioning recommendations.

```json
{ "industry": "SaaS CRM", "competitors": ["Salesforce", "HubSpot"] }
```

---

## Running tests

```bash
npm test
npm run test:coverage
```

---

## License

MIT
