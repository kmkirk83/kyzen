import { readAppEnv } from "@/lib/env";

export function getReadinessReport() {
  const envResult = readAppEnv();
  const env = envResult.success ? envResult.data : {};

  const checks = [
    {
      name: "database",
      configured: Boolean(env.DATABASE_URL),
      description: "PostgreSQL connection for tenant, report, and billing data.",
    },
    {
      name: "authentication",
      configured: Boolean(env.AUTH_SECRET),
      description: "Shared secret for production-grade auth/session protection.",
    },
    {
      name: "aiProviders",
      configured: Boolean(env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY),
      description: "At least one AI provider key is configured for scoring workflows.",
    },
    {
      name: "billing",
      configured: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET),
      description: "Stripe billing and webhook secrets are ready.",
    },
    {
      name: "monitoring",
      configured: Boolean(env.SENTRY_DSN),
      description: "Runtime monitoring sink is configured.",
    },
  ];

  return {
    validEnvironmentShape: envResult.success,
    configuredChecks: checks.filter((check) => check.configured).length,
    totalChecks: checks.length,
    checks,
  };
}
