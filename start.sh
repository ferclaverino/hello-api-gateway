#!/usr/bin/env bash
set -euo pipefail

INSTANCES="${1:-2}"
BASE_PORT=3001
GATEWAY_PORT=3000
HOST="127.0.0.1"
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS=()

cleanup() {
  echo ""
  echo "Shutting down..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null
  echo "All instances stopped."
}

trap cleanup EXIT INT TERM

install_deps() {
  local dir="$1"
  if [ ! -d "$dir/node_modules" ]; then
    echo "Installing dependencies in $dir..."
    (cd "$dir" && npm install --silent)
  fi
}

install_deps "$ROOT_DIR/light-service"
install_deps "$ROOT_DIR/api-gateway"

BACKENDS=""
for i in $(seq 0 $((INSTANCES - 1))); do
  port=$((BASE_PORT + i))
  if [ -n "$BACKENDS" ]; then
    BACKENDS="${BACKENDS},"
  fi
  BACKENDS="${BACKENDS}http://${HOST}:${port}"
done

echo "Starting $INSTANCES light-service instance(s)..."
for i in $(seq 0 $((INSTANCES - 1))); do
  port=$((BASE_PORT + i))
  PORT=$port HOST=$HOST npx tsx "$ROOT_DIR/light-service/src/index.ts" &
  PIDS+=($!)
  echo "  → light-service on port $port"
done

echo "Starting API gateway on port $GATEWAY_PORT..."
PORT=$GATEWAY_PORT HOST=$HOST BACKENDS=$BACKENDS npx tsx "$ROOT_DIR/api-gateway/src/index.ts" &
PIDS+=($!)
echo "  → api-gateway on port $GATEWAY_PORT"

echo ""
echo "All services started. Press Ctrl+C to stop."
echo "Test: curl http://${HOST}:${GATEWAY_PORT}/hello"
echo ""

wait
