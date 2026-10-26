import { generateApiKey, hashApiKey, hasScope, issueApiKey, verifyApiKey } from "@/lib/api-keys";
import { buildTrend } from "@/lib/trends";
import type { MeasurementRun } from "@/lib/measurement";

describe("api-keys", () => {
  it("hashes and verifies issued keys", async () => {
    const { raw, record } = await issueApiKey({
      organizationId: "org_test",
      userId: "user_1",
      label: "test",
    });
    expect(raw.startsWith("kyz_")).toBe(true);
    expect(record.hashedKey).toBe(hashApiKey(raw));
    const verified = await verifyApiKey(raw);
    expect(verified?.organizationId).toBe("org_test");
    expect(hasScope(verified!.scopes, "measurements:write")).toBe(true);
  });

  it("rejects unknown keys", async () => {
    expect(await verifyApiKey("kyz_deadbeef")).toBeNull();
    expect(await verifyApiKey(null)).toBeNull();
  });
});

describe("trends", () => {
  it("returns unavailable without enough points", () => {
    expect(buildTrend([]).trend).toBe("unavailable");
  });

  it("computes up trend", () => {
    const runs = [
      {
        id: "1",
        organizationId: "o",
        brandId: "b",
        brandName: "B",
        prompt: "p",
        surface: "answer_engines",
        response: { provider: "mock", model: "m", rawText: "", citations: [], measuredAt: "2026-10-01T00:00:00.000Z" },
        scores: { coverage: 40, trust: 40, sentiment: 40, overall: 40 },
        scoringVersion: "v1",
        createdAt: "2026-10-01T00:00:00.000Z",
      },
      {
        id: "2",
        organizationId: "o",
        brandId: "b",
        brandName: "B",
        prompt: "p",
        surface: "answer_engines",
        response: { provider: "mock", model: "m", rawText: "", citations: [], measuredAt: "2026-10-08T00:00:00.000Z" },
        scores: { coverage: 70, trust: 70, sentiment: 70, overall: 70 },
        scoringVersion: "v1",
        createdAt: "2026-10-08T00:00:00.000Z",
      },
    ] as MeasurementRun[];
    expect(buildTrend(runs).trend).toBe("up");
  });
});
