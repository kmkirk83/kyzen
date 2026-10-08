import { buildVisibilitySummary } from "@/lib/visibility-summary";

describe("buildVisibilitySummary", () => {
  it("returns a stable sample contract for the dashboard and API", () => {
    const summary = buildVisibilitySummary("2026-10-08T00:00:00.000Z");

    expect(summary.source).toBe("sample");
    expect(summary.featureFlag).toBe("VISIBILITY_SAMPLE_DATA");
    expect(summary.generatedAt).toBe("2026-10-08T00:00:00.000Z");
    expect(summary.surfaces).toHaveLength(3);
    expect(summary.overallScore).toBeGreaterThan(0);
    expect(summary.overallScore).toBeLessThanOrEqual(100);
  });
});
