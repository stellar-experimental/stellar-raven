#!/usr/bin/env bash
# Model-free watchdog for one dated run of round 2026-11-16. A timer fires it 8 hours before the
# merge deadline. It alerts the owner if any case of the item still has a reverifyBy that is not
# later than the due date on origin/main, which means the run has not merged.
# Installed copy: ~/.local/share/raven-dated/watchdog-dated.sh.
#
#   watchdog-dated.sh <item> [<due>]      e.g. 2.1, or 2.1 2026-12-02 for a follow-up run
set -euo pipefail
export PATH="$HOME/.local/bin:$HOME/.bun/bin:/usr/local/bin:/usr/bin:/bin"
unset HC_TERMINAL_ID

ITEM="${1:?item}"
REPO="$HOME/code/stellar-raven-codemode"
DATED=".agents/rounds/2026-11-16-next-phase/items/1.4/dated"
ORCH="${RAVEN_DATED_NOTIFY:-kalepail-c3614nvxph-mbp/t40j}"
GH_REPO="stellar-experimental/stellar-raven"
STATE="$HOME/.local/state/raven-dated"
LOG="$STATE/watchdog-$ITEM.log"
mkdir -p "$STATE"
exec >>"$LOG" 2>&1
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }

# Both channels: hc to the orchestrator (best effort), and a GitHub issue that needs no hc. The
# label may not exist and this script never creates one, so the call retries without it.
alert() {
  local title="Dated golden watchdog $ITEM: ${1:0:100}"
  local body="Item $ITEM: $1"$'\n\n'"Log on agentpc: $LOG"
  timeout 90 hc send "$ORCH" "$1 (log: agentpc $LOG)" >/dev/null 2>&1 || log "orchestrator not reached (best effort): $1"
  gh issue create -R "$GH_REPO" --title "$title" --body "$body" --label dated-golden >/dev/null 2>&1 ||
    gh issue create -R "$GH_REPO" --title "$title" --body "$body" >/dev/null 2>&1 ||
    log "gh issue create failed (best effort)"
}

log "start item=$ITEM"
if ! git -C "$REPO" fetch origin --prune; then alert "watchdog could not fetch origin; check the run by hand"; exit 1; fi
ENTRY=$(git -C "$REPO" show "origin/main:$DATED/items.json" | jq -ce --arg i "$ITEM" '.[$i]') ||
  { alert "watchdog could not read item $ITEM from items.json on origin/main"; exit 1; }
DUE="${2:-$(jq -r .due <<<"$ENTRY")}"
LATE=$(git -C "$REPO" show origin/main:eval/qa/cases.json |
  jq -r --argjson ids "$(jq -c .cases <<<"$ENTRY")" --arg due "$DUE" '
    .cases[] | select(.id as $i | $ids | any(. == $i)) | select(.truth.reverifyBy == null or .truth.reverifyBy <= $due) | .id')
if [[ -n "$LATE" ]]; then
  alert "not merged: on origin/main these cases still have a reverifyBy of $DUE or earlier: $(tr '\n' ' ' <<<"$LATE")The lint fails every pull request once it passes. Check the lead terminal np-$ITEM*-lead and its pull request."
else
  log "ok: every case of $ITEM is later than $DUE on origin/main"
fi
