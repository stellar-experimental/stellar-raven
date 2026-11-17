#!/usr/bin/env bash
# Schedule a follow-up dated run: one lead timer and one watchdog timer, as systemd user units.
# Installed copy: ~/.local/share/raven-dated/schedule-followup.sh.
#
#   schedule-followup.sh <item> <run> '<UTC fire time>' <due>   e.g. 2.1 r1 '2026-12-01 18:00' 2026-12-02
#   schedule-followup.sh --remove <item><run>                   e.g. --remove 2.1r1
#
# The lead timer raven-dated-<item><run> runs launch-dated-lead.sh for the item and run. The
# watchdog timer raven-watchdog-<item><run> fires at 16:00 UTC on <due>, 8 hours before the merge
# deadline (00:00 UTC the next day). <due> is the date the item's cases are due again (their new
# reverifyBy); the launcher skips the run if every case is already later than it.
set -euo pipefail
export PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin"

UNITS="$HOME/.config/systemd/user"
BIN="$HOME/.local/share/raven-dated"
REPO="$HOME/code/stellar-raven-codemode"
ITEMS=".agents/rounds/2026-11-16-next-phase/items/1.4/dated/items.json"

if [[ "${1:-}" == --remove ]]; then
  KEY="${2:?item+run, e.g. 2.1r1}"
  for u in "raven-dated-$KEY" "raven-watchdog-$KEY"; do
    systemctl --user disable --now "$u.timer" 2>/dev/null || true
    systemctl --user stop "$u.service" 2>/dev/null || true
    rm -f "$UNITS/$u.timer" "$UNITS/$u.service"
  done
  systemctl --user daemon-reload
  echo "removed raven-dated-$KEY and raven-watchdog-$KEY"
  exit 0
fi

ITEM="${1:?item}"; RUN="${2:?run, e.g. r1}"; WHEN="${3:?UTC fire time}"; DUE="${4:?due date YYYY-MM-DD}"
KEY="$ITEM$RUN"
[[ "$RUN" =~ ^r[0-9]+$ ]] || { echo "run must look like r1" >&2; exit 2; }
[[ "$DUE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || { echo "due must be YYYY-MM-DD" >&2; exit 2; }
FIRE=$(date -u -d "${WHEN% UTC} UTC" '+%F %T') || { echo "cannot parse fire time: $WHEN" >&2; exit 2; }
DOG=$(date -u -d "$DUE 00:00 UTC +1 day -8 hours" '+%F %T')
SLUG=$(git -C "$REPO" show "origin/main:$ITEMS" | jq -er --arg i "$ITEM" '.[$i].slug') || { echo "item $ITEM not in items.json on origin/main" >&2; exit 2; }
[[ ! -e "$UNITS/raven-dated-$KEY.timer" ]] || { echo "raven-dated-$KEY already exists; remove it first" >&2; exit 2; }
mkdir -p "$UNITS"

# $1 unit name, $2 description, $3 ExecStart, $4 OnCalendar, $5 RestartSec, $6 extra [Service] line (may be empty).
# No start rate limit: the launcher and the watchdog bound their own retries.
write_pair() {
  {
    echo "[Unit]"; echo "Description=$2"; echo "StartLimitIntervalSec=0"
    echo; echo "[Service]"; echo "Type=oneshot"; echo "ExecStart=$3"; echo "TimeoutStartSec=15min"
    echo "Restart=on-failure"; echo "RestartSec=$5"; [[ -z "$6" ]] || echo "$6"
  } >"$UNITS/$1.service"
  printf '[Unit]\nDescription=One-shot: %s\n\n[Timer]\nOnCalendar=%s UTC\nPersistent=true\nAccuracySec=1min\n\n[Install]\nWantedBy=timers.target\n' "$2" "$4" >"$UNITS/$1.timer"
}
write_pair "raven-dated-$KEY" "Raven dated run $KEY: start the Opus lead for item $ITEM (due $DUE)" "$BIN/launch-dated-lead.sh $ITEM $SLUG $RUN $DUE" "$FIRE" 20min "RestartPreventExitStatus=75"
write_pair "raven-watchdog-$KEY" "Raven dated run $KEY: watchdog for item $ITEM (due $DUE)" "$BIN/watchdog-dated.sh $ITEM $DUE" "$DOG" 15min ""
systemctl --user daemon-reload
systemctl --user enable --now "raven-dated-$KEY.timer" "raven-watchdog-$KEY.timer"
systemctl --user list-timers --all "raven-dated-$KEY.timer" "raven-watchdog-$KEY.timer" --no-pager
