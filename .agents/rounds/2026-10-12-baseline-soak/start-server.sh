#!/bin/zsh -f
# Starts the baseline Wrangler dev server the way paired-launch.mjs started it: node runs
# wrangler.js directly, stdin is closed, stdout and stderr go to one file, and NODE_OPTIONS
# carries the paired process guard. The cf OAuth token comes from the wrapper (never printed).
# Usage: start-server.sh <server-worktree> <run-dir> <port>
set -u
SERVER=$1 RUN=$2 PORT=$3
ROUND=${0:A:h}/../2026-10-01-backlog-closeout
GUARD=${ROUND:A}/paired-process-guard.cjs
mkdir -p "$RUN" && mkdir -m 700 "$RUN/registry"
cd "$SERVER" || exit 1
cf auth whoami > /dev/null || exit 1
node -e 'const c=require(process.env.HOME+"/Library/Preferences/cloudflare/config/default.json");console.log(JSON.stringify({tokenExpiresAt:c.expiration_time,startedAt:new Date().toISOString()}))' > "$RUN/token-window.json"
export PAIRED_PROCESS_GUARD=$GUARD PAIRED_PROCESS_REGISTRY=$RUN/registry PAIRED_PROCESS_GENERATION=$(uuidgen)
export NODE_OPTIONS="--require \"$GUARD\""
/private/tmp/claude-501/w1010/with-cf-token.sh node node_modules/wrangler/bin/wrangler.js dev --host localhost --port "$PORT" \
  < /dev/null > "$RUN/wrangler.log" 2>&1
code=$?
print "{\"exitCode\":$code,\"at\":\"$(date -u +%FT%TZ)\"}" | tee "$RUN/wrangler-exit.json"
