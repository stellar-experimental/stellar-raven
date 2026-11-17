#!/usr/bin/env bash
# Model-free watchdog for one dated run of round 2026-11-16. A timer fires it 8 hours before the
# merge deadline. It alerts the owner if any case of the item still has a reverifyBy that is not
# later than the due date on origin/main, which means the run has not merged.
# Installed copy: ~/.local/share/raven-dated/watchdog-dated.sh.
#
#   watchdog-dated.sh <item> [<due>]      e.g. 2.1, or 2.1 2026-12-02 for a follow-up run
#
# Exit 0: every case was checked (and an alert for a late case was accepted), or the merge deadline
# has passed (one final alert, then it stops). Exit 1: it could not verify (fetch, git, jq, a missing
# case or a malformed date) or no alert channel accepted an alert; the unit retries every 15 minutes
# with no rate limit until the merge deadline. "ok" is logged only after a positive check of every id.
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

# Both channels: hc to the orchestrator, and a GitHub issue that needs no hc (a comment on an open
# issue with the same title, else a new issue; the label may not exist and this script never creates
# one, so the call retries without it). Each call is bounded. Returns 0 only if a channel accepted.
alert() {
  local title="Dated golden watchdog $ITEM: ${1:0:100}" body accepted=1 number
  body="Item $ITEM: $1"$'\n\n'"Log on agentpc: $LOG"
  if timeout 60 hc send "$ORCH" "$1 (log: agentpc $LOG)" >/dev/null 2>&1; then accepted=0; else log "alert: hc channel did not accept"; fi
  number=$(timeout 60 gh issue list -R "$GH_REPO" --state open --search "\"$title\" in:title" --json number,title 2>/dev/null |
    jq -r --arg t "$title" '[.[] | select(.title == $t)][0].number // empty' 2>/dev/null) || number=""
  if [[ -n "$number" ]]; then
    timeout 60 gh issue comment "$number" -R "$GH_REPO" --body "$body" >/dev/null 2>&1 && accepted=0 || log "alert: issue comment failed"
  elif timeout 60 gh issue create -R "$GH_REPO" --title "$title" --body "$body" --label dated-golden >/dev/null 2>&1 ||
    timeout 60 gh issue create -R "$GH_REPO" --title "$title" --body "$body" >/dev/null 2>&1; then accepted=0
  else log "alert: gh channel did not accept"; fi
  return "$accepted"
}

DEADLINE=99999999999   # unknown until the due date is read: not past
# cannot_verify <message>: alert, then exit 1 to retry; past the merge deadline, one final alert and stop.
cannot_verify() {
  log "cannot verify: $1"
  if (( $(date -u +%s) > DEADLINE )); then alert "final: $1 (the merge deadline has passed; the watchdog stops)" || true; exit 0; fi
  alert "cannot verify: $1" || log "no alert channel accepted"
  exit 1
}

log "start item=$ITEM"
git -C "$REPO" fetch origin --prune || cannot_verify "git fetch failed"
ENTRY=$(git -C "$REPO" show "origin/main:$DATED/items.json" | jq -ce --arg i "$ITEM" '.[$i] // empty') || ENTRY=""
[[ -n "$ENTRY" ]] || cannot_verify "item $ITEM missing from items.json on origin/main"
DUE="${2:-$(jq -r '.due // empty' <<<"$ENTRY")}"
[[ "$DUE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || cannot_verify "no valid due date for $ITEM"
DEADLINE=$(date -u -d "$DUE 00:00 UTC +1 day" +%s) || cannot_verify "cannot compute the merge deadline for $DUE"
IDS=$(jq -c '.cases // empty' <<<"$ENTRY") || IDS=""
[[ -n "$IDS" ]] || cannot_verify "item $ITEM lists no cases array"

ROWS=$(git -C "$REPO" show origin/main:eval/qa/cases.json |
  jq -ce --argjson ids "$IDS" '[.cases[] | select(.id as $i | $ids | any(. == $i)) | {id, d: .truth.reverifyBy}]') || ROWS=""
[[ -n "$ROWS" ]] || cannot_verify "cannot read cases.json on origin/main"
jq -e --argjson ids "$IDS" '
  ($ids - map(.id)) == [] and all(.[]; (.d | type) == "string" and (.d | test("^[0-9]{4}-[0-9]{2}-[0-9]{2}$")))' <<<"$ROWS" >/dev/null ||
  cannot_verify "a case of $ITEM is missing on origin/main or has no valid reverifyBy"

LATE=$(jq -r --arg due "$DUE" '.[] | select(.d <= $due) | .id' <<<"$ROWS") || cannot_verify "cannot compare dates"
if [[ -n "$LATE" ]]; then
  alert "not merged: on origin/main these cases still have a reverifyBy of $DUE or earlier: $(tr '\n' ' ' <<<"$LATE")The lint fails every pull request once it passes. Check the lead terminal np-$ITEM*-lead and its pull request." || exit 1
  exit 0
fi
if [[ "$IDS" == "[]" ]]; then log "no cases to check for $ITEM"; else log "ok: every case of $ITEM is later than $DUE on origin/main"; fi
