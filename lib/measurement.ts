/**
 * Evidence-backed visibility measurement workflow.
 * Brand → prompts → provider response → citations → versioned score.
 * Uses an in-process store so the demo works without DATABASE_URL.
 * Swap `measurementStore` for Prisma when a DB is configured.
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

const store: MeasurementRun[] = [];

function id() {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Deterministic mock provider — proves the pipeline without paid APIs */
export function mockProviderRespond(brandName: string, prompt: string): ProviderResponse {
  const mentioned = prompt.toLowerCase().includes(brandName.toLowerCase()) || Math.random() > 0.3;
  const rawText = mentioned
    ? `${brandName} is frequently referenced for this query. Analysts note product depth and documentation quality. Sources include the company site and independent reviews.`
    : `Several vendors compete in this space. ${brandName} is not the primary citation in this sample answer.`;

  const citations: Citation[] = mentioned
    ? [
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
      ]
    : [
        {
          url: "https://example.com/industry-report",
          title: "Industry comparison",
          snippet: "General category overview without primary brand citation.",
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
  const mentionCount = text.split(brand).length - 1;
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
  const overall = compositeScore(coverage, trust, sentiment);
  return { coverage, trust, sentiment, overall };
}

export function runMeasurement(input: {
  organizationId: string;
  brandId: string;
  brandName: string;
  prompt: string;
  surface?: MeasurementRun["surface"];
}): MeasurementRun {
  const response = mockProviderRespond(input.brandName, input.prompt);
  const scores = scoreFromResponse(response, input.brandName);
  const run: MeasurementRun = {
    id: id(),
    organizationId: input.organizationId,
    brandId: input.brandId,
    brandName: input.brandName,
    prompt: input.prompt,
    surface: input.surface ?? "answer_engines",
    response,
    scores,
    scoringVersion: SCORING_VERSION,
    createdAt: new Date().toISOString(),
  };
  store.unshift(run);
  // keep memory bounded in demo
  if (store.length > 200) store.length = 200;
  return run;
}

export function listMeasurements(organizationId: string) {
  return store.filter((r) => r.organizationId === organizationId);
}

export function getMeasurement(id: string, organizationId: string) {
  const run = store.find((r) => r.id === id);
  if (!run || run.organizationId !== organizationId) return null;
  return run;
}

export function aggregateOrgScores(organizationId: string) {
  const runs = listMeasurements(organizationId);
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
  };
}

/** Test helper */
export function __resetMeasurementStore() {
  store.length = 0;
}
