# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1](https://github.com/kmkirk83/kyzen/compare/clarion-ai-visibility-v0.2.0...clarion-ai-visibility-v0.2.1) (2026-08-05)


### Bug Fixes

* migrate DATABASE_URL to prisma.config.ts for Prisma 7 compatibility ([69dd455](https://github.com/kmkirk83/kyzen/commit/69dd455a77bbb050e48a1883089576d6e4017630))
* migrate DATABASE_URL to prisma.config.ts for Prisma 7 compatibility ([8ad9990](https://github.com/kmkirk83/kyzen/commit/8ad9990090a24a3b372ca25471b8dd0fbc3b1834))
* use non-null assertion for DATABASE_URL in prisma.config.ts ([cc4e145](https://github.com/kmkirk83/kyzen/commit/cc4e1451299c84c7942f6d620b1beda516e387e8))

## [0.2.0](https://github.com/kmkirk83/kyzen/compare/clarion-ai-visibility-v0.1.0...clarion-ai-visibility-v0.2.0) (2026-08-05)


### Features

* add commercialization foundation scaffolding ([7c2fc6f](https://github.com/kmkirk83/kyzen/commit/7c2fc6f1cbdbd9e9fc215d3e4d33763b38fa2598))


### Bug Fixes

* prevent auto-approve workflow from failing without bot token ([ef1f095](https://github.com/kmkirk83/kyzen/commit/ef1f095ef3dfd0fc654fb080f78a13baa8fb973f))
* stabilize validation and ci configuration ([b2c5de7](https://github.com/kmkirk83/kyzen/commit/b2c5de7e38c1e3f0282da82512c2ca08cee96d70))
* tighten ci workflow permissions ([6a5be1c](https://github.com/kmkirk83/kyzen/commit/6a5be1c8e1ae690e57a7b2513fc25c58ebb0b9d8))

## [0.1.0] - 2026-08-01

### Added
- Scaffolded a Next.js 16 + TypeScript commercialization baseline.
- Added Prisma schema for organizations, memberships, reports, subscriptions, API keys, and audit logs.
- Added health and readiness API routes.
- Added CI, CodeQL, Dependabot, Release Please, Docker, and launch-readiness documentation.
