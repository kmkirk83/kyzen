import { buildVisibilitySummary, compositeScore } from "@/lib/visibility-summary";

describe("visibility-summary", () => {
  it("builds a weighted overall score", () => {
    const summary = buildVisibilitySummary("2026-10-22T00:00:00.000Z");
    expect(summary.source).toBe("sample");
    expect(summary.overallScore).toBeGreaterThan(0);
    expect(summary.pillars.coverage).toBeGreaterThan(0);
    expect(summary.surfaces).toHaveLength(3);
    expect(summary.surfaces[0].score).toBe(
      compositeScore(
        summary.surfaces[0].coverage,
        summary.surfaces[0].trust,
        summary.surfaces[0].sentiment,
      ),
    );
  });

  it("composite weights coverage and trust higher than sentiment", () => {
    expect(compositeScore(100, 100, 0)).toBe(80);
    expect(compositeScore(0, 0, 100)).toBe(20);
  });
});
