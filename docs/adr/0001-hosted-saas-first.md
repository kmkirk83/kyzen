# ADR 0001: Hosted SaaS First

## Status
Accepted

## Context

Clarion is intended for commercialization and broad developer-platform distribution, but the repository currently centers on a web application and operational platform requirements.

## Decision

Clarion will launch first as a hosted multi-tenant SaaS. Developer-platform distribution will follow as separate publishable surfaces after the hosted API contract stabilizes.

## Consequences

- The root repository remains a deployable application rather than an npm package.
- Release automation versions the application itself.
- Docker support is included for enterprise deployment without requiring immediate package publication.
- Future SDK/CLI packages should be added under `packages/` once public API semantics are stable.
