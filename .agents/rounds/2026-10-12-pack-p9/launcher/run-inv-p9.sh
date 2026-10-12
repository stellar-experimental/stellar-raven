#!/bin/sh
# Usage: run-inv-p9.sh <invocation id> <dry|paid>
# Arm B only (pack p9), changed rows only. Arm A reuses the p6 verdicts of the p7 run; the other
# arm-B rows reuse the p8 verdicts. The worktree must be the reviewed p9 commit. REVIEWED stays
# empty until the pre-spend review names that commit, so the script refuses to run before then.
set -eu
INV=$1; ACTION=$2
P=/private/tmp/claude-501/w1010/r-pin
HERE=$(cd "$(dirname "$0")" && pwd)
NODE=$HERE/../../2026-10-10-weekend/pack-p8/launcher/run-node.sh
RES=/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results
WT=/Users/kalepail/Desktop/raven-p9-arm
REVIEWED=
[ -n "$REVIEWED" ] || { echo "no reviewed p9 commit is recorded" >&2; exit 2; }
[ "$(git -C "$WT" rev-parse HEAD)" = "$REVIEWED" ] || { echo "raven-p9-arm is not at $REVIEWED" >&2; exit 2; }
LINE=$(awk -F'\t' -v id="$INV" '$1==id' "$HERE/invocations.tsv")
[ -n "$LINE" ] || exit 2
FILE=$(printf '%s' "$LINE" | cut -f2); IDS=$(printf '%s' "$LINE" | cut -f3); CAP=$(printf '%s' "$LINE" | cut -f4); MODE=$(printf '%s' "$LINE" | cut -f5)
set -- "$RES/$FILE" --ids "$IDS" --judge-panel 3 --allow-non-identical
[ "$MODE" = worktree ] && set -- "$@" --cases-ref worktree
cd "$WT"
if [ "$ACTION" = dry ]; then
  exec "$NODE" eval/qa/re-judge.mjs "$@" --dry-run
elif [ "$ACTION" = paid ]; then
  exec "$NODE" eval/qa/re-judge.mjs "$@" --max-budget-usd "$CAP" \
    --claude-path "$P/bin/claude" \
    --expect-agent-binary-sha256 c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937 \
    --expect-agent-environment-sha256 ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac
fi
exit 2
