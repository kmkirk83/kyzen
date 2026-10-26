/**
 * Tenant context helpers. Demo mode uses explicit org headers/params.
 * Production should replace `resolveTenantContext` with session/API-key derivation.
 */

export type TenantContext = {
  organizationId: string;
  role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
  source: "header" | "demo";
};

const DEMO_ORGS = {
  acme: "org_acme_demo",
  beta: "org_beta_demo",
} as const;

export function resolveTenantContext(input: {
  organizationId?: string | null;
  role?: string | null;
}): TenantContext {
  const organizationId =
    input.organizationId?.trim() ||
    DEMO_ORGS.acme;

  const roleRaw = (input.role || "ANALYST").toUpperCase();
  const role =
    roleRaw === "OWNER" || roleRaw === "ADMIN" || roleRaw === "VIEWER" || roleRaw === "ANALYST"
      ? (roleRaw as TenantContext["role"])
      : "ANALYST";

  return {
    organizationId,
    role,
    source: input.organizationId ? "header" : "demo",
  };
}

export function assertOrgAccess(resourceOrgId: string, ctx: TenantContext) {
  if (resourceOrgId !== ctx.organizationId) {
    const err = new Error("Tenant isolation: organization mismatch");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}

export function canWrite(ctx: TenantContext) {
  return ctx.role === "OWNER" || ctx.role === "ADMIN" || ctx.role === "ANALYST";
}

export function demoOrganizations() {
  return [
    { id: DEMO_ORGS.acme, name: "Acme Analytics" },
    { id: DEMO_ORGS.beta, name: "Beta Labs" },
  ];
}
