/**
 * GEO Rank Tracking – app integration layer.
 * Re-exports package types and provides mock generation + sample data
 * for the measurement pipeline and dashboard.
 */

export type {
  AIEngine,
  RankStatus,
  Sentiment,
  EngineRank,
  MeasurementRunWithRanks,
} from "@/packages/geo-rank-tracking/types/geo-rank";

export {
  ENGINE_META,
  STATUS_META,
} from "@/packages/geo-rank-tracking/types/geo-rank";

import type { AIEngine, EngineRank, RankStatus } from "@/packages/geo-rank-tracking/types/geo-rank";
import sample from "@/packages/geo-rank-tracking/data/sample-measurement.json";

export const SAMPLE_ENGINE_RANKS: EngineRank[] =
  (sample.engineRanks as EngineRank[]) ?? [];

const ENGINES: AIEngine[] = [
  "chatgpt",
  "perplexity",
  "google_ai",
  "gemini",
  "claude",
  "copilot",
  "grok",
];

function statusFromRanks(
  mentionRank: number | null,
  shareOfVoice: number,
): RankStatus {
  if (mentionRank === null && shareOfVoice < 15) return "poor";
  if (mentionRank === 1 && shareOfVoice >= 70) return "excellent";
  if (mentionRank !== null && mentionRank <= 2 && shareOfVoice >= 55) return "strong";
  if (mentionRank !== null && mentionRank <= 4 && shareOfVoice >= 30) return "moderate";
  if (shareOfVoice >= 15) return "weak";
  return "poor";
}

/**
 * Deterministic mock engine ranks for a brand + prompt.
 * Used when trackGeoRanks is enabled and no live multi-engine probe exists yet.
 */
export function mockEngineRanks(brandName: string, prompt: string): EngineRank[] {
  const seed = `${brandName}|${prompt}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  const now = new Date().toISOString();
  const brandLower = brandName.toLowerCase();

  return ENGINES.map((engine, index) => {
    const n = (h + index * 17) % 100;
    const mentionRank =
      n < 12 ? null : Math.max(1, Math.min(6, 1 + ((n + index) % 5)));
    const citationRank =
      mentionRank === null ? null : Math.max(1, Math.min(5, mentionRank + ((n >> 2) % 2)));
    const shareOfVoice =
      mentionRank === null ? Math.min(14, n % 15) : Math.min(95, 25 + (n % 60) + (6 - (mentionRank || 6)) * 8);
    const isPrimary = mentionRank === 1 && shareOfVoice >= 65;
    const status = statusFromRanks(mentionRank, shareOfVoice);

    const snippet =
      mentionRank === null
        ? `No clear mention of ${brandName} in this sample answer.`
        : isPrimary
          ? `The leading platform in this category is ${brandName}.`
          : `${brandName} is referenced among several options for this query.`;

    return {
      engine,
      mentionRank,
      citationRank,
      isPrimaryRecommendation: isPrimary,
      shareOfVoice,
      sentiment:
        mentionRank === null
          ? null
          : shareOfVoice >= 60
            ? "positive"
            : shareOfVoice >= 30
              ? "neutral"
              : "negative",
      answerSnippet: snippet,
      sourcesCited:
        mentionRank === null
          ? []
          : [`https://${brandLower.replace(/\s+/g, "")}.dev`, "https://example.com/report"].slice(
              0,
              citationRank === 1 ? 1 : 2,
            ),
      measuredAt: now,
      status,
    };
  });
}
