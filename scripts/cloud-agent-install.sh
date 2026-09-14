#!/usr/bin/env bash
#
# One-time environment bootstrap for the Football Guess Game Cloud Agent.
#
# Runs after the repository is checked out. It installs system tooling (Docker +
# Supabase CLI), the Node dependencies, and primes the local Supabase stack so
# its container images and seeded database are baked into the environment
# snapshot. It is idempotent: re-running it converges without duplicating work.
#
# Per-boot reconciliation (starting dockerd, the Supabase stack, etc.) lives in
# scripts/cloud-agent-start.sh instead.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUPABASE_CLI_VERSION="2.114.0"

echo "==> [install] Installing system packages (docker, fuse-overlayfs)"
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq
# --force-confold keeps existing conffiles so package postinst prompts never block.
sudo apt-get install -y -o Dpkg::Options::="--force-confold" \
  docker.io fuse-overlayfs fuse3 uidmap curl ca-certificates

echo "==> [install] Configuring Docker daemon to use fuse-overlayfs"
sudo mkdir -p /etc/docker
# fuse-overlayfs works inside the unprivileged nested-container VM where the
# default overlay2 driver is unavailable.
echo '{ "storage-driver": "fuse-overlayfs" }' | sudo tee /etc/docker/daemon.json >/dev/null

echo "==> [install] Installing Supabase CLI ${SUPABASE_CLI_VERSION}"
if ! command -v supabase >/dev/null 2>&1 || [ "$(supabase --version 2>/dev/null || true)" != "${SUPABASE_CLI_VERSION}" ]; then
  tmp_deb="$(mktemp --suffix=.deb)"
  curl -fsSL -o "${tmp_deb}" \
    "https://github.com/supabase/cli/releases/download/v${SUPABASE_CLI_VERSION}/supabase_${SUPABASE_CLI_VERSION}_linux_amd64.deb"
  sudo dpkg -i "${tmp_deb}"
  rm -f "${tmp_deb}"
fi
supabase --version

echo "==> [install] Granting the current user access to the Docker socket"
sudo groupadd -f docker
sudo usermod -aG docker "$(id -un)" || true

echo "==> [install] Installing Node dependencies"
cd "${REPO_DIR}"
npm install

echo "==> [install] Writing .env.local (if missing)"
"${REPO_DIR}/scripts/cloud-agent-write-env.sh"

echo "==> [install] Priming the local Supabase stack (pulls images + applies migrations)"
"${REPO_DIR}/scripts/cloud-agent-start.sh"

echo "==> [install] Done."
