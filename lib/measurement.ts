/**
 * Evidence-backed visibility measurement workflow.
 * Brand → prompts → provider response → citations → versioned score.
 * Persists to Prisma when DATABASE_URL is set; otherwise in-memory store.
 *
 * Provider resolution order:
 * 1. OpenAI when OPENAI_API_KEY is set
 * 2. Anthropic when ANTHROPIC_API_KEY is set
 * 3. Deterministic mock (always available for demo / sale evaluation)
 *
 * Milestone 1 focus: live measurement from the deployed application must produce
 * persisted, traceable evidence (rawText + structured mention signals) before any
 * Action Center or Content Agent work.
 *
 * GEO Rank Tracking: when trackGeoRanks is true, attaches per-engine ranks.
 */

import { compositeScore } from "@/lib/visibility-summary";
import { mockEngineRanks, type EngineRank } from "@/lib/geo-rank";

export const SCORING_VERSION = "v1.2.1";

export type Citation = {
  url: string;
  title: string;
  snippet: string;
};

export type ProviderResponse = {
  provider: "mock" | "openai" | "anthropic";
  model: string;
  rawText: string;
  citations: Citation[];
  measuredAt: string;
};

export type MeasurementRun = {
  id: string;
  organizationId: string;
  brandId: string;
  brandName: string;
  prompt: string;
  surface: "answer_engines" | "assistants" | "search_overviews";
  response: ProviderResponse;
  scores: {
    coverage: number;
    trust: number;
    sentiment: number;
    overall: number;
  };
  /** Structured evidence extracted from rawText (Milestone 1) */
  evidence?: {
    mentioned: boolean;
    mentionCount: number;
    firstMentionOffset: number | null;
    isLive: boolean;
  };
  scoringVersion: string;
  createdAt: string;
  /** Present when trackGeoRanks was enabled for this run */
  engineRanks?: EngineRank[];
  trackGeoRanks?: boolean;
};

const memoryStore: MeasurementRun[] = [];

function newId() {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function extractUrls(text: string): Citation[] {
  const urls = text.match(/https?:\/\/[^\s)\]>"']+/g) ?? [];
  const unique = Array.from(new Set(urls)).slice(0, 5);
  return unique.map((url) => ({
    url,
    title: url.replace(/^https?:\/\//, "").split("/")[0] || "source",
    snippet: "Extracted from provider response.",
  }));
}

/** Extract structured mention signals from raw provider text. */
export function extractMentionEvidence(rawText: string, brandName: string) {
  const text = rawText || "";
  const brand = brandName.trim();
  if (!brand) {
    return { mentioned: false, mentionCount: 0, firstMentionOffset: null as number | null };
  }
  const lower = text.toLowerCase();
  const brandLower = brand.toLowerCase();
  const mentionCount = Math.max(0, lower.split(brandLower).length - 1);
  const firstIdx = lower.indexOf(brandLower);
  return {
    mentioned: mentionCount > 0,
    mentionCount,
    firstMentionOffset: firstIdx >= 0 ? firstIdx : null,
  };
}

export function mockProviderRespond(brandName: string, prompt: string): ProviderResponse {
  const mentioned =
    prompt.toLowerCase().includes(brandName.toLowerCase()) || true;
  const rawText = mentioned
    ? `${brandName} is frequently referenced for this query. Analysts note product depth and documentation quality. Sources include the company site and independent reviews.`
    : `Several vendors compete in this space. ${brandName} is not the primary citation in this sample answer.`;

  const citations: Citation[] = [
    {
      url: `https://example.com/${brandName.toLowerCase().replace(/\s+/g, "-")}`,
      title: `${brandName} overview`,
      snippet: `${brandName} product and visibility notes.`,
    },
    {
      url: "https://example.com/industry-report",
      title: "Industry comparison",
      snippet: `Independent comparison citing ${brandName}.`,
    },
  ];

  return {
    provider: "mock",
    model: "kyzen-mock-v1",
    rawText,
    citations,
    measuredAt: new Date().toISOString(),
  };
}

async function openaiRespond(brandName: string, prompt: string): Promise<ProviderResponse | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const system = [
    "You are evaluating brand visibility in AI answer surfaces.",
    "Answer the user prompt as an answer engine would.",
    "Mention the brand only when warranted by the query.",
    "Include 1-3 realistic https URLs as supporting sources when possible.",
  ].join(" ");

  const user = `Brand under evaluation: ${brandName}\n\nQuery: ${prompt}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 700,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[measurement] OpenAI failed", res.status, await res.text());
      return null;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const rawText = data.choices?.[0]?.message?.content?.trim() || "";
    if (!rawText) return null;

    const citations = extractUrls(rawText);
    if (citations.length === 0) {
      citations.push({
        url: `https://example.com/${brandName.toLowerCase().replace(/\s+/g, "-")}`,
        title: `${brandName} reference`,
        snippet: "Fallback citation when the model returned no URLs.",
      });
    }

    return {
      provider: "openai",
      model,
      rawText,
      citations,
      measuredAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[measurement] OpenAI error", err);
    return null;
  }
}

async function anthropicRespond(brandName: string, prompt: string): Promise<ProviderResponse | null> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;
  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-3-5-haiku-latest";

  const system = [
    "You are evaluating brand visibility in AI answer surfaces.",
    "Answer the user prompt as an answer engine would.",
    "Mention the brand only when warranted by the query.",
    "Include 1-3 realistic https URLs as supporting sources when possible.",
  ].join(" ");

  const user = `Brand under evaluation: ${brandName}\n\nQuery: ${prompt}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 700,
        temperature: 0.3,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) {
      console.error("[measurement] Anthropic failed", res.status, await res.text());
      return null;
    }

    const data = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const rawText =
      data.content
        ?.filter((b) => b.type === "text" && b.text)
        .map((b) => b.text)
        .join("\n")
        .trim() || "";
    if (!rawText) return null;

    const citations = extractUrls(rawText);
    if (citations.length === 0) {
      citations.push({
        url: `https://example.com/${brandName.toLowerCase().replace(/\s+/g, "-")}`,
        title: `${brandName} reference`,
        snippet: "Fallback citation when the model returned no URLs.",
      });
    }

    return {
      provider: "anthropic",
      model,
      rawText,
      citations,
      measuredAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[measurement] Anthropic error", err);
    return null;
  }
}

/** Resolve live provider when keys exist; otherwise deterministic mock. */
export async function resolveProviderResponse(
  brandName: string,
  prompt: string,
): Promise<ProviderResponse> {
  const openai = await openaiRespond(brandName, prompt);
  if (openai) {
    console.info("[measurement] using live provider=openai");
    return openai;
  }
  const anthropic = await anthropicRespond(brandName, prompt);
  if (anthropic) {
    console.info("[measurement] using live provider=anthropic");
    return anthropic;
  }
  console.info("[measurement] falling back to mock provider (no live keys or call failed)");
  return mockProviderRespond(brandName, prompt);
}

/** Public helper for readiness / diagnostics. */
export function getProviderCapabilities() {
  return {
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY?.trim()),
    livePreferred: Boolean(
      process.env.OPENAI_API_KEY?.trim() || process.env.ANTHROPIC_API_KEY?.trim(),
    ),
    openaiModel: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    anthropicModel: process.env.ANTHROPIC_MODEL?.trim() || "claude-3-5-haiku-latest",
  };
}

export function scoreFromResponse(response: ProviderResponse, brandName: string) {
  const mention = extractMentionEvidence(response.rawText, brandName);
  const text = response.rawText.toLowerCase();
  const coverage = Math.min(
    100,
    15 + mention.mentionCount * 22 + response.citations.length * 8,
  );
  // Live providers receive a modest trust boost; mock remains usable for demos.
  const trust = Math.min(
    100,
    20 +
      response.citations.length * 18 +
      (response.provider === "mock" ? 5 : 15),
  );
  const positive = (text.match(/\b(strong|leading|trusted|quality|recommended)\b/g) || []).length;
  const negative = (text.match(/\b(weak|unknown|absent|poor|missing)\b/g) || []).length;
  const sentiment = Math.max(
    0,
    Math.min(
      100,
      50 + positive * 12 - negative * 15 + (mention.mentioned ? 10 : -10),
    ),
  );
  const overall = compositeScore(coverage, trust, sentiment);
  return { coverage, trust, sentiment, overall, evidence: { ...mention, isLive: response.provider !== "mock" } };
}

type EvalRow = {
  id: string;
  organizationId: string;
  brandId: string | null;
  brandName: string;
  prompt: string;
  surface: string;
  provider: string;
  model: string;
  rawResponse: string;
  citationsJson: string;
  coverage: number;
  trust: number;
  sentiment: number;
  overall: number;
  scoringVersion: string;
  measuredAt: Date;
  createdAt: Date;
};

function toRun(row: EvalRow): MeasurementRun {
  let citations: Citation[] = [];
  try {
    citations = JSON.parse(row.citationsJson) as Citation[];
  } catch {
    citations = [];
  }
  const response: ProviderResponse = {
    provider: row.provider as ProviderResponse["provider"],
    model: row.model,
    rawText: row.rawResponse,
    citations,
    measuredAt: row.measuredAt.toISOString(),
  };
  const mention = extractMentionEvidence(row.rawResponse, row.brandName);
  return {
    id: row.id,
    organizationId: row.organizationId,
    brandId: row.brandId || "unknown",
    brandName: row.brandName,
    prompt: row.prompt,
    surface: (row.surface as MeasurementRun["surface"]) || "answer_engines",
    response,
    scores: {
      coverage: row.coverage,
      trust: row.trust,
      sentiment: row.sentiment,
      overall: row.overall,
    },
    evidence: {
      mentioned: mention.mentioned,
      mentionCount: mention.mentionCount,
      firstMentionOffset: mention.firstMentionOffset,
      isLive: row.provider !== "mock",
    },
    scoringVersion: row.scoringVersion,
    createdAt: row.createdAt.toISOString(),
  };
}

async function ensureOrganization(organizationId: string, brandName?: string) {
  const { prisma } = await import("@/lib/prisma");
  const slug = organizationId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "demo";
  await prisma.organization.upsert({
    where: { id: organizationId },
    create: {
      id: organizationId,
      name: brandName ? `${brandName} workspace` : `Workspace ${organizationId}`,
      slug: `${slug}-${organizationId.slice(-6) || "x"}`,
    },
    update: {},
  });
}

export async function runMeasurement(input: {
  organizationId: string;
  brandId: string;
  brandName: string;
  prompt: string;
  surface?: MeasurementRun["surface"];
  trackGeoRanks?: boolean;
}): Promise<MeasurementRun> {
  const response = await resolveProviderResponse(input.brandName, input.prompt);
  const scored = scoreFromResponse(response, input.brandName);
  const { evidence, ...scores } = scored;
  const surface = input.surface ?? "answer_engines";
  const trackGeoRanks = Boolean(input.trackGeoRanks);
  const engineRanks = trackGeoRanks
    ? mockEngineRanks(input.brandName, input.prompt)
    : undefined;

  if (hasDatabase()) {
    try {
      await ensureOrganization(input.organizationId, input.brandName);
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.evaluationRun.create({
        data: {
          organizationId: input.organizationId,
          brandId: input.brandId,
          brandName: input.brandName,
          prompt: input.prompt,
          surface,
          provider: response.provider,
          model: response.model,
          rawResponse: response.rawText,
          citationsJson: JSON.stringify(response.citations),
          coverage: scores.coverage,
          trust: scores.trust,
          sentiment: scores.sentiment,
          overall: scores.overall,
          scoringVersion: SCORING_VERSION,
          measuredAt: new Date(response.measuredAt),
        },
      });
      const run = toRun(row);
      run.evidence = evidence;
      if (engineRanks) {
        run.engineRanks = engineRanks;
        run.trackGeoRanks = true;
      }
      return run;
    } catch (err) {
      console.error("[measurement] Prisma persist failed, using memory store", err);
    }
  }

  const run: MeasurementRun = {
    id: newId(),
    organizationId: input.organizationId,
    brandId: input.brandId,
    brandName: input.brandName,
    prompt: input.prompt,
    surface,
    response,
    scores,
    evidence,
    scoringVersion: SCORING_VERSION,
    createdAt: new Date().toISOString(),
    trackGeoRanks: trackGeoRanks || undefined,
    engineRanks,
  };
  memoryStore.unshift(run);
  if (memoryStore.length > 200) memoryStore.length = 200;
  return run;
}

export async function listMeasurements(organizationId: string): Promise<MeasurementRun[]> {
  if (hasDatabase()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.evaluationRun.findMany({
        where: { organizationId },
        orderBy: { measuredAt: "desc" },
        take: 100,
      });
      return rows.map(toRun);
    } catch (err) {
      console.error("[measurement] Prisma list failed", err);
    }
  }
  return memoryStore.filter((r) => r.organizationId === organizationId);
}

export async function getMeasurement(id: string, organizationId: string) {
  if (hasDatabase()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const row = await prisma.evaluationRun.findFirst({ where: { id, organizationId } });
      return row ? toRun(row) : null;
    } catch {
      /* fall through */
    }
  }
  const run = memoryStore.find((r) => r.id === id);
  if (!run || run.organizationId !== organizationId) return null;
  return run;
}

export async function aggregateOrgScores(organizationId: string) {
  const runs = await listMeasurements(organizationId);
  if (runs.length === 0) return null;
  const coverage = Math.round(runs.reduce((t, r) => t + r.scores.coverage, 0) / runs.length);
  const trust = Math.round(runs.reduce((t, r) => t + r.scores.trust, 0) / runs.length);
  const sentiment = Math.round(runs.reduce((t, r) => t + r.scores.sentiment, 0) / runs.length);
  const providers = Array.from(new Set(runs.map((r) => r.response.provider)));
  const liveCount = runs.filter((r) => r.response.provider !== "mock").length;
  return {
    count: runs.length,
    liveCount,
    coverage,
    trust,
    sentiment,
    overall: compositeScore(coverage, trust, sentiment),
    scoringVersion: SCORING_VERSION,
    latestMeasuredAt: runs[0]?.response.measuredAt,
    persisted: hasDatabase(),
    providers,
  };
}

export function __resetMeasurementStore() {
  memoryStore.length = 0;
}
