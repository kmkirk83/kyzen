import { NextRequest, NextResponse } from "next/server";

import { requireAuthTenant } from "@/lib/auth-tenant";

export async function POST(request: NextRequest) {
  const tenant = await requireAuthTenant(request);
  if (tenant instanceof NextResponse) return tenant;

  if (process.env.DATABASE_URL?.trim()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.organization.update({
        where: { id: tenant.organizationId },
        data: { onboardingCompletedAt: new Date() },
      });
    } catch (err) {
      console.error(err);
    }
  }

  return NextResponse.json({ ok: true, organizationId: tenant.organizationId });
}
