# Security Policy

## Supported Versions

Clarion is pre-1.0. Support is best-effort for the latest `main` branch and the most recent tagged release.

## Reporting a Vulnerability

Please do **not** open public issues for security concerns.

1. Email the maintainer privately with a detailed report.
2. Include reproduction steps, impact, affected endpoints, and any proof-of-concept artifacts.
3. Expect an initial response within 3 business days.

## Security Controls in this Repository

- CodeQL workflow for code scanning
- Dependabot for dependency and GitHub Actions updates
- Environment-variable readiness checks
- Docker standalone runtime with reduced attack surface
- Next.js security headers configured in `next.config.ts`
