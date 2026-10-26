import { NextRequest, NextResponse } from "next/server";

import {
  aggregateOrgScores,
  getMeasurement,
  listMeasurements,
  runMeasurement,
} from "@/lib/measurement";
import { canWrite, resolveTenantContext } from "@/lib/tenancy";

export async function GET(request: NextRequest) {
  const org = request.nextUrl.searchParams.get("organizationId");
  const id = request.nextUrl.searchParams.get("id");
  const ctx = resolveTenantContext({
    organizationId: org || request.headers.get("x-organization-id"),
    role: request.headers.get("x-role"),
  });

  if (id) {
    const run = getMeasurement(id, ctx.organizationId);
    if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(run);
  }

  return NextResponse.json({
    organizationId: ctx.organizationId,
    aggregate: aggregateOrgScores(ctx.organizationId),
    runs: listMeasurements(ctx.organizationId),
  });
}

export async function POST(request: NextRequest) {
  const ctx = resolveTenantContext({
    organizationId: request.headers.get("x-organization-id"),
    role: request.headers.get("x-role"),
  });

  if (!canWrite(ctx)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    brandName?: string;
    brandId?: string;
    prompt?: string;
    surface?: "answer_engines" | "assistants" | "search_overviews";
    organizationId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const organizationId = body.organizationId || ctx.organizationId;
  if (organizationId !== ctx.organizationId) {
    return NextResponse.json({ error: "Tenant isolation violation" }, { status: 403 });
  }

  const brandName = body.brandName?.trim();
  const prompt = body.prompt?.trim();
  if (!brandName || !prompt) {
    return NextResponse.json({ error: "brandName and prompt are required" }, { status: 400 });
  }

  const run = runMeasurement({
    organizationId,
    brandId: body.brandId?.trim() || `brand_${brandName.toLowerCase().replace(/\s+/g, "_")}`,
    brandName,
    prompt,
    surface: body.surface,
  });

  return NextResponse.json(run, { status: 201 });
}
