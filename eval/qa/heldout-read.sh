#!/usr/bin/env bash
# heldout-read.sh — one held-out collection on the kept commit. The orchestrator runs it; no agent does.
#
#   eval/qa/heldout-read.sh <sealed-ids-file> <port> <sealed-output-dir> <stored-baseline-results.json>
#
# It starts nothing. A `npm run dev:eval` server for THIS commit must already listen on <port>
# (the surface check below stops the run otherwise). Every byte the runner, the probe and the
# surface report write goes to files inside <sealed-output-dir>; this script itself prints only the
# summary at the end, or one fixed line naming the failed check. It never echoes an id.
#
# Known exposure, outside this script's reach: `run-qa.mjs` takes its ids as one `--ids` argument, so
# the ids are in the runner's process arguments (`ps`) on this machine while it runs.
set -uo pipefail
umask 077
set +x

[ "$#" -eq 4 ] || { echo "usage: heldout-read.sh <sealed-ids-file> <port> <sealed-output-dir> <stored-baseline-results.json>" >&2; exit 64; }
IDS_FILE=$1; PORT=$2; SEALED=$3; BASELINE=$4
ROOT=$(cd "$(dirname "$0")/../.." && pwd -P)
cd "$ROOT" || exit 70
fail() { echo "heldout-read: stopped: $1" >&2; exit "${2:-1}"; }

[ -f "$IDS_FILE" ] || fail "ids file not found"
[ -f "$BASELINE" ] || fail "stored baseline file not found"
[[ "$PORT" =~ ^[0-9]+$ ]] || fail "port is not a number"
[ -d "$SEALED" ] || fail "sealed output directory not found"
SEALED=$(cd "$SEALED" && pwd -P)
case "$SEALED/" in "$ROOT"/*) fail "the sealed directory must be outside the repository" ;; esac
chmod 700 "$SEALED" 2>/dev/null
LOG="$SEALED/launcher.log"; RUNLOG="$SEALED/runner.log"
: > "$LOG"; : > "$RUNLOG"

# Clean tree, so the revision names the code on the server.
[ -z "$(git status --porcelain)" ] || fail "the worktree is not clean"
REV=$(git rev-parse HEAD)

# 1. Job count: the plan equals the id count before any spend.
N=$(node eval/qa/heldout-read.mjs plan "$IDS_FILE" 2>>"$LOG") || { tail -n 1 "$LOG" >&2; fail "plan check failed" 2; }
COUNT=$(node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");console.log(t.split(/[\s,]+/).filter(Boolean).length)' "$IDS_FILE")
[ "$N" = "$COUNT" ] && [ "$N" -gt 0 ] || fail "planned jobs do not equal the id count" 2

# 2. Pins, computed here, as TUNE-IMPL-1.md section 7 gives them.
export DISABLE_AUTOUPDATER=1
PIN_BIN=$(mktemp -d) && ln -s "$HOME/.local/share/claude/versions/2.1.325" "$PIN_BIN/claude" && export PATH="$PIN_BIN:$PATH"
AGENT_BINARY_SHA256=$(sha256sum "$PIN_BIN/claude" | cut -d' ' -f1)
[ "$AGENT_BINARY_SHA256" = 0dc4f4a9a165fc60746d7ae8489712e5fc352f1e7ad4eb22e7141bd0812eb0cf ] || fail "agent binary pin differs from the panel runs"
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)' 2>>"$LOG") || fail "environment identity failed"
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d' ' -f1)
[ "$REMOTE_IDENTITY_PROBE_SHA256" = aabfb83fb8e956856d70f9b5657ea6fca2f64551073812fb646b3689a8f28d99 ] || fail "remote probe pin differs from the panel runs"
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256 2>>"$LOG") || fail "remote identity probe failed"
STABILITY_REGISTER=${STABILITY_REGISTER:-/home/tyler/code/raven-wt/gca-eval/eval/qa/judge-stability.json}
[ "$(sha256sum "$STABILITY_REGISTER" 2>/dev/null | cut -d' ' -f1)" = 4322dd4d1ebfc30bc02a9def008039aba4f4b2395b1f9da5cabef56ec24bf458 ] || fail "stability register pin differs from the panel runs"
node eval/report-live-surface.mjs --port "$PORT" --expect-source-revision "$REV" --json "$SEALED/surface.json" >>"$LOG" 2>&1 || fail "the server on that port does not serve this commit"
SURFACE_SHA256=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).surfaceSha256)' "$SEALED/surface.json") || fail "surface hash unreadable"
{ echo "revision=$REV"; echo "planned=$N"; echo "agentBinary=$AGENT_BINARY_SHA256"; echo "agentEnvironment=$AGENT_ENVIRONMENT_SHA256"; echo "probe=$REMOTE_IDENTITY_PROBE_SHA256"; echo "remoteVector=$REMOTE_IDENTITY_SHA256"; echo "register=4322dd4d1ebfc30bc02a9def008039aba4f4b2395b1f9da5cabef56ec24bf458"; echo "surface=$SURFACE_SHA256"; } > "$SEALED/pins.txt"

# 3. One collection. --max-panel-cases equals the row count, so no boundary-eligible row is skipped.
IDS=$(tr -s ' \t\r\n' ',' < "$IDS_FILE" | sed 's/^,//; s/,$//')
BEFORE=$(ls eval/qa/results 2>/dev/null | sort)
node eval/qa/run-qa.mjs --variant A --port "$PORT" --ids "$IDS" --max-budget-usd 30 \
  --max-panel-cases "$N" --stability-register "$STABILITY_REGISTER" \
  --server-revision "$REV" --expect-sha256 "$SURFACE_SHA256" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" \
  --remote-identity-probe "$REMOTE_IDENTITY_PROBE" \
  --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
  --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256" >>"$RUNLOG" 2>&1
RC=$?
unset IDS
echo "runner exit $RC" >> "$LOG"

# 4. Take the artifact out of eval/qa/results/, record its SHA-256, and run no register or plan script on it.
NEW=$(comm -13 <(printf '%s\n' "$BEFORE") <(ls eval/qa/results 2>/dev/null | sort) | grep -E -- '-variantA\.json$' | grep -v '\.plan\.json$')
[ "$(printf '%s\n' "$NEW" | grep -c .)" = 1 ] || fail "the runner left no single results file (exit $RC); see the sealed directory" 3
mv "eval/qa/results/$NEW" "$SEALED/results.json" || fail "could not move the results file" 3
RESULTS_SHA256=$(sha256sum "$SEALED/results.json" | cut -d' ' -f1)
echo "$RESULTS_SHA256  results.json" > "$SEALED/results.sha256"
grep -q "active $N of $N selected cases" "$RUNLOG" || echo "warning: the runner's active count differs from the planned count" >> "$LOG"

# 5. The summary: counts only.
echo "results SHA-256: $RESULTS_SHA256"
echo "runner exit: $RC"
node eval/qa/heldout-read.mjs summary "$SEALED/results.json" "$BASELINE" "$IDS_FILE" --planned "$N" 2>>"$LOG" || fail "summary failed" 4
exit "$RC"
