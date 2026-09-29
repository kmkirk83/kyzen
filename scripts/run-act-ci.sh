#!/usr/bin/env bash
# Run the CI workflow via nektos/act (Docker required)
set -euo pipefail
if ! command -v act >/dev/null 2>&1; then
  echo "Install act first: https://github.com/nektos/act#installation"
  echo "  curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
  exit 1
fi
act -j validate -P ubuntu-latest=catthehacker/ubuntu:act-latest "$@"
