import { buildVisibilitySummary, compositeScore } from "@/lib/visibility-summary";

describe("visibility-summary", () => {
  it("builds sample and seeded modes", () => {
    const sample = buildVisibilitySummary("2026-10-22T00:00:00.000Z", "sample");
    const seeded = buildVisibilitySummary("2026-10-22T00:00:00.000Z", "seeded");
    expect(sample.source).toBe("sample");
    expect(seeded.source).toBe("seeded");
    expect(seeded.overallScore).not.toBe(sample.overallScore);
    expect(sample.improvements.length).toBeGreaterThan(0);
  });

  it("composite weights coverage and trust higher than sentiment", () => {
    expect(compositeScore(100, 100, 0)).toBe(80);
    expect(compositeScore(0, 0, 100)).toBe(20);
  });
});
