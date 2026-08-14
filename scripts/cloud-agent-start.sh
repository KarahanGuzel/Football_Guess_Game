#!/usr/bin/env bash
#
# Per-boot reconciliation for the Football Guess Game Cloud Agent.
#
# Brings up the Docker daemon and the local Supabase stack, then returns. It is
# safe to run repeatedly: it detects an already-running daemon/stack and only
# starts what is missing. The Next.js dev server itself is launched separately
# as a long-running terminal so its logs stay visible.
#
# Docker and the Supabase CLI are driven through `sudo` so the stack works
# regardless of whether the current login session has the `docker` group active
# yet (e.g. the first session right after the group is added, or a pod whose
# daemon socket is root-owned).
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
    sudo tail -n 40 /var/log/dockerd.log >&2 || true
    exit 1
  fi
fi

# In this nested-container VM, bridged container-to-container traffic is dropped
# when it is forced through iptables (PostgREST cannot reach Postgres, etc.).
# Docker re-enables this on daemon start, so it must be disabled AFTER dockerd is
# up and BEFORE the Supabase network is used.
echo "==> [start] Disabling bridge netfilter so container-to-container traffic flows"
sudo modprobe br_netfilter 2>/dev/null || true
sudo sysctl -w net.bridge.bridge-nf-call-iptables=0 >/dev/null 2>&1 || true
sudo sysctl -w net.bridge.bridge-nf-call-ip6tables=0 >/dev/null 2>&1 || true

# Also make the socket group-accessible so plain (non-sudo) `docker`/`supabase`
# commands work in normal interactive sessions where the docker group is active.
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

echo "==> [start] Ensuring .env.local exists"
"${REPO_DIR}/scripts/cloud-agent-write-env.sh"

# When dockerd restarts it may auto-restart the Supabase containers; wait for the
# database to finish initialising before reconciling, otherwise `supabase start`
# aborts with "container is not ready: starting".
if sudo docker ps -a --format '{{.Names}}' 2>/dev/null | grep -qx "supabase_db_workspace"; then
  echo "==> [start] Waiting for the database container to become healthy"
  for _ in $(seq 1 60); do
    health="$(sudo docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' supabase_db_workspace 2>/dev/null || echo missing)"
    case "${health}" in healthy|none|missing) break ;; esac
    sleep 2
  done
fi

echo "==> [start] Starting the local Supabase stack (idempotent)"
for attempt in $(seq 1 10); do
  if sudo -E supabase start --workdir "${REPO_DIR}"; then
    break
  fi
  if [ "${attempt}" -eq 10 ]; then
    echo "!! [start] Supabase failed to start after ${attempt} attempts." >&2
    exit 1
  fi
  echo "==> [start] Supabase not ready yet (attempt ${attempt}); retrying..."
  sleep 5
done

echo "==> [start] Ready. REST API at http://127.0.0.1:54321"
