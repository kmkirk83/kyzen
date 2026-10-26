/**
 * Evidence-backed visibility measurement workflow.
 * Brand → prompts → provider response → citations → versioned score.
 * Persists to Prisma when DATABASE_URL is set; otherwise in-memory store.
 */

import { compositeScore } from "@/lib/visibility-summary";

export const SCORING_VERSION = "v1.0.0";

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
  scoringVersion: string;
  createdAt: string;
};

const memoryStore: MeasurementRun[] = [];

function newId() {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
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

export function scoreFromResponse(response: ProviderResponse, brandName: string) {
  const text = response.rawText.toLowerCase();
  const brand = brandName.toLowerCase();
  const mentionCount = Math.max(1, text.split(brand).length - 1);
  const coverage = Math.min(100, 25 + mentionCount * 20 + response.citations.length * 10);
  const trust = Math.min(
    100,
    40 +
      response.citations.filter((c) => c.snippet.toLowerCase().includes(brand)).length * 25 +
      (response.citations.length > 0 ? 15 : 0),
  );
  const positive = /(strong|frequently|quality|leading|recommended)/i.test(response.rawText);
  const negative = /(not the primary|rarely|weak|missing)/i.test(response.rawText);
  const sentiment = positive ? 78 : negative ? 42 : 60;
  return {
    coverage,
    trust,
    sentiment,
    overall: compositeScore(coverage, trust, sentiment),
  };
}

function toRun(row: {
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
}): MeasurementRun {
  return {
    id: row.id,
    organizationId: row.organizationId,
    brandId: row.brandId || "",
    brandName: row.brandName,
    prompt: row.prompt,
    surface: row.surface as MeasurementRun["surface"],
    response: {
      provider: row.provider as ProviderResponse["provider"],
      model: row.model,
      rawText: row.rawResponse,
      citations: JSON.parse(row.citationsJson) as Citation[],
      measuredAt: row.measuredAt.toISOString(),
    },
    scores: {
      coverage: row.coverage,
      trust: row.trust,
      sentiment: row.sentiment,
      overall: row.overall,
    },
    scoringVersion: row.scoringVersion,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function runMeasurement(input: {
  organizationId: string;
  brandId: string;
  brandName: string;
  prompt: string;
  surface?: MeasurementRun["surface"];
}): Promise<MeasurementRun> {
  const response = mockProviderRespond(input.brandName, input.prompt);
  const scores = scoreFromResponse(response, input.brandName);
  const surface = input.surface ?? "answer_engines";

  if (hasDatabase()) {
    try {
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
      return toRun(row);
    } catch (err) {
      console.error("Prisma persist failed, using memory store", err);
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
    scoringVersion: SCORING_VERSION,
    createdAt: new Date().toISOString(),
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
      console.error("Prisma list failed", err);
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
  return {
    count: runs.length,
    coverage,
    trust,
    sentiment,
    overall: compositeScore(coverage, trust, sentiment),
    scoringVersion: SCORING_VERSION,
    latestMeasuredAt: runs[0]?.response.measuredAt,
    persisted: hasDatabase(),
  };
}

export function __resetMeasurementStore() {
  memoryStore.length = 0;
}
