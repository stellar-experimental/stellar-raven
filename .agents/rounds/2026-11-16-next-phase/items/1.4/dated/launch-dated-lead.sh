#!/usr/bin/env bash
# Launch one dated lead of round 2026-11-16 (items 2.1 and 2.2) from a systemd user timer on agentpc.
# Installed copy: ~/.local/share/raven-dated/launch-dated-lead.sh (the unit files run that copy, so
# it outlives any worktree). Source: items/1.4/dated/launch-dated-lead.sh on main.
#
#   launch-dated-lead.sh <item> <slug> [<run> [<due>]]     e.g. 2.1 bell-goldens, or 2.1 bell-goldens r1 2026-12-02
#   RAVEN_DATED_DRY=1  launch-dated-lead.sh ...   every check up to `hc run`, then exit 0; no worktree, no alert
#   RAVEN_DATED_TEST=1 launch-dated-lead.sh 1.4 timertest   harmless launch test, no git
#
# The key is <item><run> (2.1, 2.1r1). It names the worktree np-<key>, the branch np/<key>-<slug>, the
# terminal np-<key>-lead, the log, and the report folder items/<key>/. The brief is always
# dated/<item>-LEAD.md and items.json (both on origin/main) names the item's cases and due date.
#
# Exit 0: started, or already done. Exit 1: retryable (fetch failed, brief or items.json not on
# origin/main yet, or an alert that no channel accepted before `hc run`); the unit retries every 20
# minutes with no rate limit, so this script bounds the retries itself: past the run's cutoff it ends
# with exit 75. Exit 75: final (the worktree or branch exists, hc run failed, the lead did not take
# its task, or the cutoff passed); the unit does not retry. The first failure of a key alerts the
# owner on both channels, and so does every final failure. The FAILED marker is written only after
# an alert was accepted.
set -euo pipefail
export PATH="$HOME/.local/bin:$HOME/.bun/bin:/usr/local/bin:/usr/bin:/bin"
unset HC_TERMINAL_ID

ITEM="${1:?item}"
SLUG="${2:?slug}"
RUN="${3:-}"
KEY="$ITEM$RUN"
REPO="$HOME/code/stellar-raven-codemode"
WT="$HOME/code/raven-wt/np-$KEY"
BRANCH="np/$KEY-$SLUG"
DATED=".agents/rounds/2026-11-16-next-phase/items/1.4/dated"
BRIEF_REL="$DATED/$ITEM-LEAD.md"
ORCH="${RAVEN_DATED_NOTIFY:-kalepail-c3614nvxph-mbp/t40j}"
GH_REPO="stellar-experimental/stellar-raven"
NAME="np-${KEY//./-}-lead"
STATE="$HOME/.local/state/raven-dated"
DRY="${RAVEN_DATED_DRY:-}"
LOG="$STATE/${DRY:+dry-}$KEY.log"
mkdir -p "$STATE"
if [[ -n "$DRY" ]]; then exec > >(tee -a "$LOG") 2>&1; else exec >>"$LOG" 2>&1; fi
log() { printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }

notify() { timeout 60 hc send "$ORCH" "$1" >/dev/null 2>&1 || log "orchestrator not reached (best effort): $1"; }

# Both channels: hc to the orchestrator, and a GitHub issue that needs no hc (a comment on an open
# issue with the same title, else a new issue; the label may not exist and this script never creates
# one, so the call retries without it). Each call is bounded. Returns 0 only if a channel accepted.
alert() {
  local title="Dated golden run $KEY: ${1:0:100}" body accepted=1 number
  body="Run $KEY: $1"$'\n\n'"Log on agentpc: $LOG"
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

LAUNCHED=""
# fail <exit code> <message>. An alert that no channel accepted leaves no marker. Before `hc run` it
# turns a final failure into a retryable one, so a later attempt can deliver it; after `hc run` the
# exit stays final and the delivery failure is only logged.
fail() {
  local code="$1"; shift
  log "FAILED ($code): $*"
  if [[ -n "$DRY" ]]; then log "dry run: would alert"; exit "$code"; fi
  if [[ "$code" == 75 || ! -e "$STATE/FAILED-$KEY.txt" ]]; then
    if alert "did not start: $*"; then
      printf '%s %s\n' "$(date -u +%FT%TZ)" "$*" >"$STATE/FAILED-$KEY.txt"
    else
      log "alert delivery failed on every channel"
      [[ -n "$LAUNCHED" ]] || code=1
    fi
  fi
  exit "$code"
}

# The retry bound: a plain key uses the cutoff in items.json, a follow-up its due date at 20:00 UTC.
check_cutoff() {
  [[ -n "${CUTOFF:-}" && -z "${RAVEN_DATED_TEST:-}" ]] || return 0
  local limit now; limit=$(date -u -d "$CUTOFF" +%s) || fail 75 "bad cutoff $CUTOFF"; now=$(date -u +%s)
  if (( now > limit )); then fail 75 "missed cutoff $CUTOFF"; fi
}
log "start key=$KEY item=$ITEM slug=$SLUG dry=${DRY:-no}"
if [[ -n "$RUN" ]]; then
  [[ "${4:-}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || fail 75 "follow-up $KEY needs a due date argument"
  CUTOFF="${4}T20:00:00Z"
else
  CUTOFF=$(git -C "$REPO" show "origin/main:$DATED/items.json" 2>/dev/null | jq -r --arg i "$ITEM" '.[$i].cutoff // empty' 2>/dev/null) || CUTOFF=""
fi
check_cutoff
if [[ "${RAVEN_DATED_TEST:-}" == 1 ]]; then
  WT="$HOME/code/raven-wt/np-$KEY-$SLUG"
  BRIEF="$WT/BRIEF.md"
  DUE="test"
  [[ -f "$BRIEF" ]] || fail 75 "test brief $BRIEF missing"
else
  git -C "$REPO" fetch origin --prune || fail 1 "git fetch failed"
  git -C "$REPO" cat-file -e "origin/main:$BRIEF_REL" 2>/dev/null || fail 1 "brief missing on origin/main: $BRIEF_REL"
  ENTRY=$(git -C "$REPO" show "origin/main:$DATED/items.json" 2>/dev/null | jq -ce --arg i "$ITEM" '.[$i] // empty') ||
    fail 1 "items.json, or item $ITEM in it, missing on origin/main"
  DUE="${4:-$(jq -r .due <<<"$ENTRY")}"
  [[ -n "$CUTOFF" ]] || { CUTOFF=$(jq -r '.cutoff // empty' <<<"$ENTRY"); check_cutoff; }
  # Already done: every case of the item has a reverifyBy later than the due date. An item with no
  # cases (the rehearsal) is never done.
  if git -C "$REPO" show origin/main:eval/qa/cases.json |
    jq -e --argjson ids "$(jq -c .cases <<<"$ENTRY")" --arg due "$DUE" '
      [.cases[] | select(.id as $i | $ids | index($i)) | .truth.reverifyBy] as $d
      | ($d | length) == ($ids | length) and ($ids | length) > 0 and all($d[]; . != null and . > $due)' >/dev/null; then
    log "already done: every case of $ITEM has a reverifyBy later than $DUE on origin/main"
    [[ -n "$DRY" ]] || notify "Dated run $KEY not needed: every case of $ITEM is already past $DUE on main."
    rm -f "$STATE/FAILED-$KEY.txt"
    exit 0
  fi
  if [[ -e "$WT" ]]; then fail 75 "worktree $WT already exists; not touching it"; fi
  if git -C "$REPO" show-ref --verify --quiet "refs/heads/$BRANCH"; then fail 75 "branch $BRANCH already exists"; fi
  if [[ -n "$DRY" ]]; then
    log "dry run: would add worktree $WT on branch $BRANCH, then hc run $NAME with $BRIEF_REL (due $DUE)"
    exit 0
  fi
  git -C "$REPO" worktree add "$WT" -b "$BRANCH" origin/main || fail 75 "worktree add failed"
  BRIEF="$WT/$BRIEF_REL"
fi
if [[ -n "$DRY" ]]; then log "dry run: would hc run $NAME"; exit 0; fi

TASK="Confirmed by the orchestrator, a direct instruction: read $BRIEF and do it. Run key: $KEY. Due: $DUE."
# From here a lead may exist: every failure is final (75), and nothing ever starts a second lead.
LAUNCHED=1
OUT=$(hc run --json --bg --no-parent --name "$NAME" --cwd "$WT" -- \
  systemd-run --user --scope -q -p MemoryMax=8G -p MemorySwapMax=0 \
  claude --model opus --effort high --dangerously-skip-permissions "$TASK") || fail 75 "hc run failed: $OUT"
log "hc run: $OUT"
T=$(jq -r '.address // .id // empty' <<<"$OUT" 2>/dev/null) || T=""
[[ -n "$T" ]] || fail 75 "hc run returned no terminal address: $OUT"
# The task is claude's argv prompt, so it is delivered unless a start-up dialog (folder trust, the
# bypass-permissions warning) blocks it. Confirm that the agent took it: status working. A real
# lead that is already done inside the window refused, hit a limit or asked a question: that fails.
# Use a wall-clock deadline with sleep instead of `hc wait`: `hc run` launches `systemd-run` with
# no hc launch task, so `hc wait` returns immediately while the terminal is still `live` or `idle`
# during boot. Every command in the loop is bounded with `timeout 15` and may fail on its own; a
# transient failure only costs one turn of the loop.
SENT=false
DEADLINE=$(( $(date +%s) + 120 ))
attempt=0
while true; do
  attempt=$((attempt + 1))
  STATE_NOW=$(timeout 15 hc get "$T" --json 2>/dev/null | jq -r '.status.state // .state // empty' 2>/dev/null) || STATE_NOW=""
  log "check $attempt: status ${STATE_NOW:-unreadable}"
  case "$STATE_NOW" in
    working) SENT=true; break ;;
    done)
      if [[ "${RAVEN_DATED_TEST:-}" == 1 ]]; then SENT=true; break; fi
      log "lead is done inside the start window; screen:"; { timeout 15 hc read --lines 0 "$T" 2>&1 | tail -25; } || true
      fail 75 "lead $T finished inside the start window (refused, hit a limit or asked a question); see the log" ;;
    finished|exited)
      log "lead exited inside the start window; screen:"; { timeout 15 hc read --lines 0 "$T" 2>&1 | tail -25; } || true
      fail 75 "lead $T exited inside the start window; see the log" ;;
    error)
      log "lead hit error inside the start window; screen:"; { timeout 15 hc read --lines 0 "$T" 2>&1 | tail -25; } || true
      fail 75 "lead $T reported error inside the start window; see the log" ;;
    blocked)
      SCREEN=$(timeout 15 hc read --lines 0 "$T" 2>&1) || SCREEN=""
      log "blocked; screen:"; printf '%s\n' "$SCREEN" | tail -25 || true
      if grep -q "Yes, I accept" <<<"$SCREEN"; then timeout 15 hc keys "$T" down enter || log "hc keys failed"
      elif grep -qi "trust" <<<"$SCREEN"; then timeout 15 hc keys "$T" enter || log "hc keys failed"
      fi ;;
  esac
  if (( $(date +%s) >= DEADLINE )); then break; fi
  sleep 5
done
[[ "$SENT" == true ]] || fail 75 "lead $T started but readiness could not be established within about 2 minutes; see the log"

rm -f "$STATE/FAILED-$KEY.txt"
log "lead $T ($NAME) running in $WT"
notify "Dated lead $KEY started on agentpc as $T ($NAME), worktree $WT. Its report will be $WT/.agents/rounds/2026-11-16-next-phase/items/$KEY/REPORT.md"
