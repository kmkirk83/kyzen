import { NextResponse } from "next/server";

import { verifyApiKey, hasScope } from "@/lib/api-keys";
import { getSession, type SessionUser } from "@/lib/session";
import { resolveTenantContext, type TenantContext } from "@/lib/tenancy";

export type AuthedTenant = TenantContext & {
  user?: SessionUser;
  authenticated: boolean;
  scopes?: string[];
  via?: "session" | "api_key" | "header";
};

export async function resolveRequestTenant(request: Request): Promise<AuthedTenant> {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    const key = await verifyApiKey(token);
    if (key) {
      return {
        organizationId: key.organizationId,
        role: "ANALYST",
        source: "header",
        authenticated: true,
        scopes: key.scopes,
        via: "api_key",
        user: {
          userId: key.userId,
          email: "api-key@kyzen.local",
          organizationId: key.organizationId,
          role: "ANALYST",
        },
      };
    }
  }

  const session = await getSession().catch(() => null);
  if (session) {
    return {
      organizationId: session.organizationId,
      role: session.role,
      source: "header",
      user: session,
      authenticated: true,
      scopes: ["*"],
      via: "session",
    };
  }

  const organizationId =
    request.headers.get("x-organization-id") ||
    new URL(request.url).searchParams.get("organizationId");
  const role = request.headers.get("x-role");
  const ctx = resolveTenantContext({ organizationId, role });
  return { ...ctx, authenticated: false, via: "header" };
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
  if (tenant.scopes && !hasScope(tenant.scopes, "measurements:write") && !hasScope(tenant.scopes, "*")) {
    return NextResponse.json({ error: "Missing measurements:write scope" }, { status: 403 });
  }
  return null;
}
