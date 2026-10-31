/**
 * Kyzen GEO Rank Tracking – Type Definitions
 * Drop into your existing types directory.
 */

export type AIEngine =
  | "chatgpt"
  | "perplexity"
  | "google_ai"
  | "gemini"
  | "claude"
  | "copilot"
  | "grok";

export type RankStatus =
  | "excellent"
  | "strong"
  | "moderate"
  | "weak"
  | "poor"
  | "pending";

export type Sentiment = "positive" | "neutral" | "negative" | null;

export interface EngineRank {
  engine: AIEngine;
  mentionRank: number | null;
  citationRank: number | null;
  isPrimaryRecommendation: boolean;
  shareOfVoice: number; // 0–100
  sentiment: Sentiment;
  answerSnippet: string;
  sourcesCited: string[];
  measuredAt: string; // ISO
  status: RankStatus;
}

export interface MeasurementRunWithRanks {
  id: string;
  target: string;
  kyzenScore: number;
  status: "pending" | "measuring" | "completed" | "failed";
  trackGeoRanks: boolean;
  engineRanks: EngineRank[];
  createdAt: string;
  completedAt?: string;
}

export const ENGINE_META: Record<
  AIEngine,
  { label: string; short: string; color: string }
> = {
  chatgpt: { label: "ChatGPT", short: "GPT", color: "#10a37f" },
  perplexity: { label: "Perplexity", short: "PPX", color: "#20808d" },
  google_ai: { label: "Google AI", short: "GAI", color: "#4285f4" },
  gemini: { label: "Gemini", short: "GEM", color: "#8e75b2" },
  claude: { label: "Claude", short: "CLD", color: "#d4a27f" },
  copilot: { label: "Copilot", short: "COP", color: "#0078d4" },
  grok: { label: "Grok", short: "GRK", color: "#1da1f2" },
};

export const STATUS_META: Record<
  RankStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  excellent: {
    label: "Excellent",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  strong: {
    label: "Strong",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  moderate: {
    label: "Moderate",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  weak: {
    label: "Weak",
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-500/30",
  },
  poor: {
    label: "Poor",
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/30",
  },
  pending: {
    label: "Pending",
    bg: "bg-zinc-500/15",
    text: "text-zinc-400",
    border: "border-zinc-500/30",
  },
};
