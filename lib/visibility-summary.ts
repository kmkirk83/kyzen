export type SurfaceKey = "answer_engines" | "assistants" | "search_overviews";

export type SurfaceScore = {
  key: SurfaceKey;
  label: string;
  /** 0-100 presence in AI answers */
  coverage: number;
  /** 0-100 how often cited with quality */
  trust: number;
  /** 0-100 tone favorability */
  sentiment: number;
  /** derived composite for this surface */
  score: number;
};

export type VisibilitySummary = {
  source: "sample";
  featureFlag: "VISIBILITY_SAMPLE_DATA";
  organization: string;
  brand: string;
  generatedAt: string;
  /** Single headline score 0-100 */
  overallScore: number;
  /** Three simple pillars that explain the headline */
  pillars: {
    coverage: number;
    trust: number;
    sentiment: number;
  };
  surfaces: SurfaceScore[];
  trend: "up" | "flat" | "down";
  notes: string[];
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Weighted composite: coverage 40%, trust 40%, sentiment 20% */
export function compositeScore(coverage: number, trust: number, sentiment: number) {
  return clamp(coverage * 0.4 + trust * 0.4 + sentiment * 0.2);
}

const SAMPLE: Array<Omit<SurfaceScore, "score">> = [
  { key: "answer_engines", label: "Answer engines", coverage: 42, trust: 71, sentiment: 78 },
  { key: "assistants", label: "Assistants", coverage: 36, trust: 64, sentiment: 58 },
  { key: "search_overviews", label: "Search overviews", coverage: 51, trust: 78, sentiment: 82 },
];

export function buildVisibilitySummary(generatedAt = new Date().toISOString()): VisibilitySummary {
  const surfaces: SurfaceScore[] = SAMPLE.map((s) => ({
    ...s,
    score: compositeScore(s.coverage, s.trust, s.sentiment),
  }));

  const pillars = {
    coverage: clamp(surfaces.reduce((t, s) => t + s.coverage, 0) / surfaces.length),
    trust: clamp(surfaces.reduce((t, s) => t + s.trust, 0) / surfaces.length),
    sentiment: clamp(surfaces.reduce((t, s) => t + s.sentiment, 0) / surfaces.length),
  };

  const overallScore = compositeScore(pillars.coverage, pillars.trust, pillars.sentiment);

  return {
    source: "sample",
    featureFlag: "VISIBILITY_SAMPLE_DATA",
    organization: "Sample workspace",
    brand: "kyzen",
    generatedAt,
    overallScore,
    pillars,
    surfaces,
    trend: "up",
    notes: [
      "Scores use a simple weighted model: coverage 40%, trust 40%, sentiment 20%.",
      "Sample data — no database or API keys required to evaluate the product surface.",
      "Live tenant queries are the main remaining integration step.",
    ],
  };
}
