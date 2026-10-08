export type VisibilitySurface = {
  surface: string;
  shareOfAnswer: number;
  citationQuality: number;
  sentiment: "positive" | "neutral" | "mixed";
};

export type VisibilitySummary = {
  source: "sample";
  featureFlag: "VISIBILITY_SAMPLE_DATA";
  organization: string;
  brand: string;
  generatedAt: string;
  overallScore: number;
  surfaces: VisibilitySurface[];
  notes: string[];
};

const SAMPLE_SURFACES: VisibilitySurface[] = [
  { surface: "Answer engines", shareOfAnswer: 42, citationQuality: 71, sentiment: "positive" },
  { surface: "Conversational assistants", shareOfAnswer: 36, citationQuality: 64, sentiment: "mixed" },
  { surface: "Search overviews", shareOfAnswer: 51, citationQuality: 78, sentiment: "positive" },
];

export function buildVisibilitySummary(generatedAt = new Date().toISOString()): VisibilitySummary {
  const overallScore = Math.round(
    SAMPLE_SURFACES.reduce((total, item) => total + (item.shareOfAnswer + item.citationQuality) / 2, 0) /
      SAMPLE_SURFACES.length,
  );

  return {
    source: "sample",
    featureFlag: "VISIBILITY_SAMPLE_DATA",
    organization: "Sample workspace",
    brand: "Clarion",
    generatedAt,
    overallScore,
    surfaces: SAMPLE_SURFACES,
    notes: [
      "Sample catalog is enabled so the dashboard and API work without a database.",
      "Live tenant queries remain behind DATABASE_URL and are not yet wired to this endpoint.",
    ],
  };
}
