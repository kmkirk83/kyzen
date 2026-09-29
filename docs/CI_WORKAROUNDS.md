# CI Workarounds (GitHub-hosted runners blocked)

When GitHub shows *"The job was not started because your account is locked due to a billing issue"*, hosted `ubuntu-latest` runners will not start. Use any of the paths below — **none require paying the bill**.

## Option A — Local scripts (already in repo)

```bash
npm run local:ci          # full lint → typecheck → test → build
npm run local:docker      # Docker image build
```

## Option B — Run the real workflows locally with `act`

[nektos/act](https://github.com/nektos/act) executes your `.github/workflows` on your machine via Docker.

```bash
# Install (one-time)
curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
# or: brew install act

# Run the CI workflow locally
act -j validate -P ubuntu-latest=catthehacker/ubuntu:act-latest

# List jobs
act -l
```

Requires Docker. This is the closest equivalent to GitHub-hosted CI without using GitHub runners.

## Option C — Self-hosted runner (often works even under billing lock)

Community reports show **self-hosted runners can still pick up jobs** when hosted runners are blocked.

1. On any Linux machine (local PC, free-tier VPS, old laptop):
   - Repo → **Settings → Actions → Runners → New self-hosted runner**
   - Follow the install commands GitHub shows (download, `./config.sh`, `./run.sh`)
2. Workflows that use `runs-on: [self-hosted, linux, x64]` will be claimed by your runner.
3. Keep the runner process alive (`./run.sh` or install as a service).

**Security:** Prefer self-hosted only on private repos, or carefully review PRs from forks.

## Option D — Support request (no payment)

If you are on the Free plan and only have a failed authorization hold:

1. Settings → Billing → cancel any leftover trials/sponsorships
2. Open https://support.github.com → Billing
3. Ask them to clear `billing.lock` so free-tier Actions work again

## Creating releases without Actions

```bash
git tag -a v0.2.2 -m "Release v0.2.2"
git push origin v0.2.2
# Then: GitHub UI → Releases → Draft a new release
# or: gh release create v0.2.2 --generate-notes
```
