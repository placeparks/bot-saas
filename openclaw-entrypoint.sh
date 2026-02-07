#!/bin/bash
set -e

echo "[ENTRYPOINT] Starting OpenClaw wrapper..."

CONFIG_DIR="/tmp/.openclaw"
mkdir -p "$CONFIG_DIR"

# Check if OPENCLAW_CONFIG is set
if [ -z "$OPENCLAW_CONFIG" ]; then
    echo "[ENTRYPOINT] ERROR: OPENCLAW_CONFIG env var is not set!"
    exit 1
fi

# Write config from env var to file
echo "[ENTRYPOINT] Writing config to $CONFIG_DIR/openclaw.json..."
printf '%s' "$OPENCLAW_CONFIG" > "$CONFIG_DIR/openclaw.json"

# Verify config was written
if [ ! -f "$CONFIG_DIR/openclaw.json" ]; then
    echo "[ENTRYPOINT] ERROR: Failed to write config file!"
    exit 1
fi

echo "[ENTRYPOINT] Config file size: $(wc -c < "$CONFIG_DIR/openclaw.json") bytes"
echo "[ENTRYPOINT] Config preview (first 500 chars):"
head -c 500 "$CONFIG_DIR/openclaw.json"
echo ""
echo "[ENTRYPOINT] ..."

# Decode and start pairing server in background
if [ -n "$_PAIRING_SCRIPT_B64" ]; then
    echo "[ENTRYPOINT] Starting pairing server on port 18800..."
    printf '%s' "$_PAIRING_SCRIPT_B64" | base64 -d > /tmp/pairing-server.js
    node /tmp/pairing-server.js &
    echo "[ENTRYPOINT] Pairing server started (PID: $!)"
    sleep 1
fi

# Start OpenClaw gateway with config (do NOT run doctor --fix, it causes issues)
echo "[ENTRYPOINT] Starting OpenClaw with config..."
echo "[ENTRYPOINT] Command: openclaw --config $CONFIG_DIR/openclaw.json"

# Use exec to replace the shell with openclaw (so it receives signals properly)
exec openclaw --config "$CONFIG_DIR/openclaw.json"
