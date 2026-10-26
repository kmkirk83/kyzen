import { NextRequest, NextResponse } from "next/server";

import { issueApiKey } from "@/lib/api-keys";
import { requireAuthTenant } from "@/lib/auth-tenant";

export async function POST(request: NextRequest) {
  const tenant = await requireAuthTenant(request);
  if (tenant instanceof NextResponse) return tenant;

  if (tenant.role !== "OWNER" && tenant.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { label?: string; scopes?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    /* optional body */
  }

  const result = await issueApiKey({
    organizationId: tenant.organizationId,
    userId: tenant.user!.userId,
    label: body.label?.trim() || "default",
    scopes: body.scopes,
  });

  return NextResponse.json(
    {
      apiKey: result.raw,
      record: {
        id: result.record.id,
        label: result.record.label,
        prefix: result.record.prefix,
        scopes: result.record.scopes,
        createdAt: result.record.createdAt,
      },
      warning: "Store this key now. It will not be shown again.",
    },
    { status: 201 },
  );
}
