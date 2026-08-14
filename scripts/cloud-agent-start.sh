#!/usr/bin/env bash
#
# Per-boot reconciliation for the Football Guess Game Cloud Agent.
#
# Brings up the Docker daemon and the local Supabase stack, then returns. It is
# safe to run repeatedly: it detects an already-running daemon/stack and only
# starts what is missing. The Next.js dev server itself is launched separately
# as a long-running terminal so its logs stay visible.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_DIR}"

echo "==> [start] Ensuring the Docker daemon is running"
if ! sudo docker info >/dev/null 2>&1; then
  sudo mkdir -p /var/log
  sudo bash -c 'nohup dockerd >/var/log/dockerd.log 2>&1 &'
  for _ in $(seq 1 30); do
    if sudo docker info >/dev/null 2>&1; then break; fi
    sleep 1
  done
  if ! sudo docker info >/dev/null 2>&1; then
    echo "!! [start] Docker daemon failed to start; see /var/log/dockerd.log" >&2
    exit 1
  fi
fi

echo "==> [start] Making the Docker socket accessible to the current user"
sudo chmod 666 /var/run/docker.sock || true

# In this nested-container VM, bridged container-to-container traffic is dropped
# when it is forced through iptables. Docker re-enables this on daemon start, so
# it must be disabled AFTER dockerd is up and BEFORE the Supabase network is used.
echo "==> [start] Disabling bridge netfilter so container-to-container traffic flows"
sudo modprobe br_netfilter 2>/dev/null || true
sudo sysctl -w net.bridge.bridge-nf-call-iptables=0 >/dev/null || true
sudo sysctl -w net.bridge.bridge-nf-call-ip6tables=0 >/dev/null || true

echo "==> [start] Ensuring .env.local exists"
"${REPO_DIR}/scripts/cloud-agent-write-env.sh"

echo "==> [start] Starting the local Supabase stack (idempotent)"
supabase start

echo "==> [start] Ready. REST API at http://127.0.0.1:54321"
