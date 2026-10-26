import { NextRequest, NextResponse } from "next/server";

import { aggregateOrgScores } from "@/lib/measurement";
import { resolveTenantContext } from "@/lib/tenancy";
import { buildVisibilitySummary, type DataMode } from "@/lib/visibility-summary";

export async function GET(request: NextRequest) {
  const modeParam = request.nextUrl.searchParams.get("mode");
  const mode: DataMode = modeParam === "seeded" ? "seeded" : "sample";
  const live = request.nextUrl.searchParams.get("live") === "1";

  const ctx = resolveTenantContext({
    organizationId:
      request.nextUrl.searchParams.get("organizationId") ||
      request.headers.get("x-organization-id"),
    role: request.headers.get("x-role"),
  });

  const summary = buildVisibilitySummary(new Date().toISOString(), mode);

  if (live) {
    const aggregate = await aggregateOrgScores(ctx.organizationId);
    return NextResponse.json({
      ...summary,
      source: aggregate ? "live_measurements" : summary.source,
      organizationId: ctx.organizationId,
      liveAggregate: aggregate,
    });
  }

  return NextResponse.json({ ...summary, organizationId: ctx.organizationId });
}
