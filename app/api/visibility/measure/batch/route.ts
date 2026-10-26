import { NextRequest, NextResponse } from "next/server";

import { denyIfCannotWrite, resolveRequestTenant } from "@/lib/auth-tenant";
import { runMeasurement } from "@/lib/measurement";

export async function POST(request: NextRequest) {
  const tenant = await resolveRequestTenant(request);
  const denied = denyIfCannotWrite(tenant);
  if (denied) return denied;

  let body: {
    brandName?: string;
    brandId?: string;
    prompts?: string[];
    surface?: "answer_engines" | "assistants" | "search_overviews";
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const brandName = body.brandName?.trim();
  const prompts = (body.prompts || []).map((p) => p.trim()).filter(Boolean).slice(0, 10);
  if (!brandName || prompts.length === 0) {
    return NextResponse.json({ error: "brandName and prompts[] required" }, { status: 400 });
  }

  const brandId = body.brandId?.trim() || `brand_${brandName.toLowerCase().replace(/\s+/g, "_")}`;
  const runs = [];
  for (const prompt of prompts) {
    runs.push(
      await runMeasurement({
        organizationId: tenant.organizationId,
        brandId,
        brandName,
        prompt,
        surface: body.surface,
      }),
    );
  }

  return NextResponse.json({ count: runs.length, runs }, { status: 201 });
}
