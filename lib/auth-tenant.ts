import { NextResponse } from "next/server";

import { getSession, type SessionUser } from "@/lib/session";
import { resolveTenantContext, type TenantContext } from "@/lib/tenancy";

export type AuthedTenant = TenantContext & {
  user?: SessionUser;
  authenticated: boolean;
};

/**
 * Prefer signed session; fall back to demo headers for public evaluation.
 * Protected writers should call requireAuthTenant().
 */
export async function resolveRequestTenant(request: Request): Promise<AuthedTenant> {
  const session = await getSession().catch(() => null);
  if (session) {
    return {
      organizationId: session.organizationId,
      role: session.role,
      source: "header",
      user: session,
      authenticated: true,
    };
  }

  const organizationId =
    request.headers.get("x-organization-id") ||
    new URL(request.url).searchParams.get("organizationId");
  const role = request.headers.get("x-role");
  const ctx = resolveTenantContext({ organizationId, role });
  return { ...ctx, authenticated: false };
}

export async function requireAuthTenant(request: Request): Promise<AuthedTenant | NextResponse> {
  const tenant = await resolveRequestTenant(request);
  if (!tenant.authenticated || !tenant.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  return tenant;
}

export function denyIfCannotWrite(tenant: AuthedTenant) {
  if (tenant.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
