#!/usr/bin/env bash
set -euo pipefail
echo "==> Building Docker image"
docker build -t kyzen:local .
echo "==> Image built: kyzen:local"
echo "Run with: docker run -p 3000:3000 -e DATABASE_URL=... kyzen:local"
