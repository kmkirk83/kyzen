import {
  __resetMeasurementStore,
  aggregateOrgScores,
  getMeasurement,
  listMeasurements,
  runMeasurement,
  SCORING_VERSION,
} from "@/lib/measurement";
import { assertOrgAccess, resolveTenantContext } from "@/lib/tenancy";
import {
  __resetTelegramLimits,
  checkTelegramQuota,
  isDuplicateTelegramUpdate,
} from "@/lib/telegram-limits";

describe("measurement workflow", () => {
  beforeEach(() => __resetMeasurementStore());

  it("runs brand to score with citations and version", async () => {
    const run = await runMeasurement({
      organizationId: "org_acme_demo",
      brandId: "brand_acme",
      brandName: "Acme",
      prompt: "What is Acme known for in analytics?",
    });
    expect(run.scoringVersion).toBe(SCORING_VERSION);
    expect(run.response.citations.length).toBeGreaterThan(0);
    expect(run.scores.overall).toBeGreaterThanOrEqual(0);
  });

  it("isolates measurements by organization", async () => {
    await runMeasurement({
      organizationId: "org_a",
      brandId: "b1",
      brandName: "Alpha",
      prompt: "Alpha visibility",
    });
    await runMeasurement({
      organizationId: "org_b",
      brandId: "b2",
      brandName: "Beta",
      prompt: "Beta visibility",
    });
    expect(await listMeasurements("org_a")).toHaveLength(1);
    expect(await listMeasurements("org_b")).toHaveLength(1);
    const a = (await listMeasurements("org_a"))[0];
    expect(await getMeasurement(a.id, "org_b")).toBeNull();
    expect((await aggregateOrgScores("org_a"))?.count).toBe(1);
  });
});

describe("tenancy isolation", () => {
  it("denies cross-org access", () => {
    const ctx = resolveTenantContext({ organizationId: "org_a", role: "ANALYST" });
    expect(() => assertOrgAccess("org_b", ctx)).toThrow(/isolation/i);
  });
});

describe("telegram limits", () => {
  beforeEach(() => __resetTelegramLimits());

  it("dedupes update ids", () => {
    expect(isDuplicateTelegramUpdate(1)).toBe(false);
    expect(isDuplicateTelegramUpdate(1)).toBe(true);
  });

  it("enforces per-chat quota", () => {
    for (let i = 0; i < 30; i++) {
      expect(checkTelegramQuota("chat-1").ok).toBe(true);
    }
    expect(checkTelegramQuota("chat-1").ok).toBe(false);
  });
});
