# Contributing

## Workflow

1. Create a branch from `main`.
2. Make focused changes with tests where behavior changes.
3. Run `npm ci` and `npm run check` before opening a pull request.
4. Update `CHANGELOG.md` when the change affects users, operators, or integrators.

## Standards

- Prefer TypeScript for all application code.
- Keep production configuration documented in `.env.example`.
- Preserve backward compatibility for public HTTP contracts.
- Document operational changes in `docs/runbooks/production.md`.

## Pull Requests

Each pull request should describe:

- user-visible change
- operational impact
- testing performed
- follow-up work, if any
