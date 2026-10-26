import { NextRequest, NextResponse } from "next/server";

import { denyIfCannotWrite, resolveRequestTenant } from "@/lib/auth-tenant";
import {
  aggregateOrgScores,
  getMeasurement,
  listMeasurements,
  runMeasurement,
} from "@/lib/measurement";

export async function GET(request: NextRequest) {
  const tenant = await resolveRequestTenant(request);
  const id = request.nextUrl.searchParams.get("id");

  if (id) {
    const run = await getMeasurement(id, tenant.organizationId);
    if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(run);
  }

  const runs = await listMeasurements(tenant.organizationId);
  const aggregate = await aggregateOrgScores(tenant.organizationId);
  return NextResponse.json({
    organizationId: tenant.organizationId,
    authenticated: tenant.authenticated,
    aggregate,
    runs,
  });
}

export async function POST(request: NextRequest) {
  const tenant = await resolveRequestTenant(request);
  const denied = denyIfCannotWrite(tenant);
  if (denied) return denied;

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

  if (body.organizationId && body.organizationId !== tenant.organizationId) {
    return NextResponse.json({ error: "Tenant isolation violation" }, { status: 403 });
  }

  const brandName = body.brandName?.trim();
  const prompt = body.prompt?.trim();
  if (!brandName || !prompt) {
    return NextResponse.json({ error: "brandName and prompt are required" }, { status: 400 });
  }

  const run = await runMeasurement({
    organizationId: tenant.organizationId,
    brandId: body.brandId?.trim() || `brand_${brandName.toLowerCase().replace(/\s+/g, "_")}`,
    brandName,
    prompt,
    surface: body.surface,
  });

  return NextResponse.json(run, { status: 201 });
}
