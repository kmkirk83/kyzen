# Architecture Overview

Clarion is structured as a hosted, multi-tenant SaaS platform with the following layers:

- **Next.js web application** for product UI and HTTP APIs
- **Prisma + PostgreSQL** for tenant, subscription, report, and audit persistence
- **AI provider integrations** for visibility scoring and comparative analysis
- **Billing integration** for commercial subscriptions and entitlement management
- **Operational tooling** for CI, release automation, container delivery, and security scanning

## Initial bounded contexts

- Identity and access
- Organizations and membership
- Brand and competitor monitoring
- Visibility audits and reporting
- Billing and entitlement management
- API platform and automation access
