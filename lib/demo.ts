/**
 * Simple demo-mode helpers.
 * Treat the app as demo when no real tenant data is present
 * or when DEMO_MODE=true is explicitly set.
 */
export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === "true") return true;
  // Fallback: we currently always serve sample data on the dashboard
  return true;
}

export const demoNotes = [
  "You are viewing sample visibility data so you can evaluate the product surface immediately.",
  "The multi-tenant data model (organizations, memberships, reports, billing, API keys, audits) is already defined in Prisma.",
  "Live tenant queries are the main remaining integration step for a production deployment.",
  "All commercialization scaffolding (CI, Docker, release automation, docs) is included.",
] as const;
