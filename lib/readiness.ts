import { readAppEnv } from "@/lib/env";
import { getProviderCapabilities } from "@/lib/measurement";

export function getReadinessReport() {
  const envResult = readAppEnv();
  const env = envResult.success ? envResult.data : undefined;
  const caps = getProviderCapabilities();

  const checks = [
    {
      name: "database",
      configured: Boolean(env?.DATABASE_URL),
      description: "PostgreSQL connection for tenant, report, and billing data.",
    },
    {
      name: "authentication",
      configured: Boolean(env?.AUTH_SECRET),
      description: "Shared secret for production-grade auth/session protection.",
    },
    {
      name: "aiProviders",
      configured: caps.livePreferred,
      description: caps.livePreferred
        ? `Live measurement ready (OpenAI: ${caps.openaiConfigured ? "yes" : "no"}, Anthropic: ${caps.anthropicConfigured ? "yes" : "no"}).`
        : "No AI provider keys configured — measurements will use the deterministic mock provider.",
    },
    {
      name: "telegramConnector",
      configured: Boolean(
        env?.TELEGRAM_BOT_TOKEN &&
          env?.TELEGRAM_WEBHOOK_SECRET &&
          (env?.OPENAI_API_KEY || env?.ANTHROPIC_API_KEY),
      ),
      description: "Telegram bot credentials and a copilot provider are configured.",
    },
    {
      name: "billing",
      configured: Boolean(env?.STRIPE_SECRET_KEY && env?.STRIPE_WEBHOOK_SECRET),
      description: "Stripe billing and webhook secrets are ready.",
    },
    {
      name: "monitoring",
      configured: Boolean(env?.SENTRY_DSN),
      description: "Runtime monitoring sink is configured.",
    },
  ];

  return {
    validEnvironmentShape: envResult.success,
    configuredChecks: checks.filter((check) => check.configured).length,
    totalChecks: checks.length,
    checks,
    liveMeasurement: {
      ready: caps.livePreferred,
      openaiConfigured: caps.openaiConfigured,
      anthropicConfigured: caps.anthropicConfigured,
      openaiModel: caps.openaiModel,
      anthropicModel: caps.anthropicModel,
    },
  };
}
