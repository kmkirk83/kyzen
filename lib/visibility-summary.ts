export type SurfaceKey = "answer_engines" | "assistants" | "search_overviews";
export type DataMode = "sample" | "seeded";

export type SurfaceScore = {
  key: SurfaceKey;
  label: string;
  coverage: number;
  trust: number;
  sentiment: number;
  score: number;
};

export type Improvement = {
  id: string;
  title: string;
  why: string;
  impact: "coverage" | "trust" | "sentiment" | "overall";
  priority: "high" | "medium" | "low";
  surface?: SurfaceKey;
  href: string;
  cta: string;
};

export type VisibilitySummary = {
  source: DataMode;
  featureFlag: "VISIBILITY_SAMPLE_DATA" | "VISIBILITY_SEEDED_DATA";
  organization: string;
  brand: string;
  generatedAt: string;
  overallScore: number;
  pillars: { coverage: number; trust: number; sentiment: number };
  surfaces: SurfaceScore[];
  trend: "up" | "flat" | "down" | "unavailable";
  improvements: Improvement[];
  notes: string[];
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function compositeScore(coverage: number, trust: number, sentiment: number) {
  return clamp(coverage * 0.4 + trust * 0.4 + sentiment * 0.2);
}

const SAMPLE_RAW: Array<Omit<SurfaceScore, "score">> = [
  { key: "answer_engines", label: "Answer engines", coverage: 42, trust: 71, sentiment: 78 },
  { key: "assistants", label: "Assistants", coverage: 36, trust: 64, sentiment: 58 },
  { key: "search_overviews", label: "Search overviews", coverage: 51, trust: 78, sentiment: 82 },
];

/** Seeded catalog — stands in for Prisma tenant rows without requiring DATABASE_URL */
const SEEDED_RAW: Array<Omit<SurfaceScore, "score">> = [
  { key: "answer_engines", label: "Answer engines", coverage: 58, trust: 76, sentiment: 81 },
  { key: "assistants", label: "Assistants", coverage: 49, trust: 70, sentiment: 66 },
  { key: "search_overviews", label: "Search overviews", coverage: 63, trust: 82, sentiment: 85 },
];

export function buildImprovements(
  pillars: VisibilitySummary["pillars"],
  surfaces: SurfaceScore[],
): Improvement[] {
  const items: Improvement[] = [];
  const weakest = [...surfaces].sort((a, b) => a.score - b.score)[0];

  if (pillars.coverage < 55) {
    items.push({
      id: "expand-source-presence",
      title: "Expand authoritative source presence",
      why: "Coverage is the largest drag on the headline score. AI systems answer from sources they already trust; more high-quality pages in your category increases how often you appear.",
      impact: "coverage",
      priority: "high",
      href: "/start#evaluation",
      cta: "Review evaluation path",
    });
  }
  if (pillars.trust < 70) {
    items.push({
      id: "strengthen-citations",
      title: "Strengthen citation-ready claims",
      why: "Trust rises when answers can point to clear, structured facts. Tightening claim structure makes mentions more attributable.",
      impact: "trust",
      priority: pillars.trust < 60 ? "high" : "medium",
      href: "/api/visibility/summary",
      cta: "Inspect score contract",
    });
  }
  if (pillars.sentiment < 65) {
    items.push({
      id: "improve-narrative",
      title: "Improve brand narrative consistency",
      why: "Sentiment reflects how you are framed when mentioned. Aligning public messaging reduces mixed portrayals in AI answers.",
      impact: "sentiment",
      priority: "medium",
      href: "/start",
      cta: "Open buyer quick start",
    });
  }
  if (weakest && weakest.score < 60) {
    items.push({
      id: `surface-${weakest.key}`,
      title: `Prioritize ${weakest.label.toLowerCase()}`,
      why: `${weakest.label} is your weakest surface (score ${weakest.score}). Closing the gap here usually lifts the overall score faster than small gains on already-strong surfaces.`,
      impact: "overall",
      priority: "high",
      surface: weakest.key,
      href: `/dashboard#surface-${weakest.key}`,
      cta: "Jump to surface",
    });
  }
  items.push({
    id: "wire-live-tenants",
    title: "Connect live tenant visibility data",
    why: "Seeded mode simulates tenant rows in-process. Wiring Prisma + DATABASE_URL replaces catalogs with production measurements.",
    impact: "overall",
    priority: "medium",
    href: "https://github.com/kmkirk83/kyzen/blob/main/SALES.md",
    cta: "Read sale / scope notes",
  });

  const order = { high: 0, medium: 1, low: 2 } as const;
  return items.sort((a, b) => order[a.priority] - order[b.priority]);
}

export function buildVisibilitySummary(
  generatedAt = new Date().toISOString(),
  mode: DataMode = "sample",
): VisibilitySummary {
  const raw = mode === "seeded" ? SEEDED_RAW : SAMPLE_RAW;
  const surfaces: SurfaceScore[] = raw.map((s) => ({
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
    source: mode,
    featureFlag: mode === "seeded" ? "VISIBILITY_SEEDED_DATA" : "VISIBILITY_SAMPLE_DATA",
    organization: mode === "seeded" ? "Acme Analytics (seed)" : "Sample workspace",
    brand: mode === "seeded" ? "Acme" : "kyzen",
    generatedAt,
    overallScore,
    pillars,
    surfaces,
    trend: "unavailable",
    improvements: buildImprovements(pillars, surfaces),
    notes:
      mode === "seeded"
        ? [
            "Seeded mode uses in-repo catalog rows that mirror a tenant snapshot (no DATABASE_URL required).",
            "Scores use coverage 40% + trust 40% + sentiment 20%.",
            "Swap this catalog for Prisma reads when DATABASE_URL is configured.",
          ]
        : [
            "Scores use coverage 40% + trust 40% + sentiment 20%.",
            "Sample data — no database or API keys required.",
            "Toggle Seeded on the dashboard to preview a higher-fidelity tenant snapshot.",
          ],
  };
}
