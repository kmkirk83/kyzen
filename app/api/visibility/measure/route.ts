import { NextRequest, NextResponse } from "next/server";

import { denyIfCannotWrite, resolveRequestTenant } from "@/lib/auth-tenant";
import {
  aggregateOrgScores,
  getMeasurement,
  listMeasurements,
  runMeasurement,
} from "@/lib/measurement";

// Simple in-memory rate limit (per-instance; suitable for demo/sale evaluation).
// Limits POST to 10 per minute per organizationId.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

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

  const rateKey = `measure:${tenant.organizationId}`;
  if (!checkRateLimit(rateKey)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429 },
    );
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
