# Item 1.4: executor report

Executor: Claude Sonnet 5.5, high effort, agentpc, 2026-11-17. Worktree
`/home/tyler/code/raven-wt/np-1.4`, branch `np/1.4-prestage-dated-goldens`. No subagent, `hc` child,
model-calling eval or paid call. No case file edited. Files written under `items/1.4/dated/` only,
plus the two bookkeeping edits. Nothing installed: `~/backups`, `~/.local/share/raven-dated/`,
`~/.config/systemd/` and every running timer and terminal are untouched, apart from the dry-run log
named under deviation 6.

## Per step

1. **Bookkeeping.**
   - `eval/qa/tuning-rows.mjs`: `TUNING_ROW_COUNT` 86.
   - `.agents/TODO.md` held-out status: v5 SHA-256 and counts (86/114/47), path, v4 kept (with its
     SHA-256 and 81/117/49), the v5 amendment sentence linking `QUESTION.md`, "scheduled" in the v5
     note means "has a `reverifyBy`", and "Tuning scans pass `--split …-v5.json`". The "future read
     pairs on v4's 117" sentence now says v5's 114.
   - New TODO item "Decide whether golden maintenance may open held-out cases (owner decision)" under
     "Golden answers": 67 cases outside tuning carry a `reverifyBy`, so option 1 erodes the held-out
     set each quarter, the next date is 2027-01-14, option 2 needs the owner, and a line for the count
     of register entries the dated runs leave at `reopen` ("none recorded yet").
   - The Bell bullet and the Software Versions bullet point at the dated runs and PRESTAGE.md.
   - `git grep` for other places naming v4 as current: only the TODO status block. The round ledger
     rows and 1.1/D2 records name v3/v4 as dated history and are left alone.
2. **`dated/probe.mjs`** and **`baseline-2026-11-17.json`** (one run, committed). Sections
   `--protocol`, `--software-versions`, `--scf`, `--quantum`, `--out`. The baseline shows Mainnet at
   Protocol 29 (no activation ledger), the Bell vote scheduled 2026-11-23 17:00 UTC, Software Versions
   without Protocol 30, SCF #46 in Initial Review, CAP-0087 "Implemented" at protocol version 30.
3. **`dated/sibling-check.mjs`**. Run for each run; the last lines (the only ones recorded, in
   PRESTAGE.md section 2): 2.1: 0; 2.2a: 0; 2.2c: 1. The stdout lists were not copied anywhere.
4. **`dated/items.json`**: brief, slug, cases, due, cutoff and merge deadline for 2.1, 2.2a, 2.2b, 2.2c
   and the rehearsal (no cases, due 2099-01-01).
5. **Scripts and units.**
   - `launch-dated-lead.sh` reworked: run key, `git cat-file` brief check before any write, "already
     done" test on `reverifyBy`, exit 1 (retryable) or 75 (final), `done` inside the window fails,
     two-channel `alert()` (`hc` plus `gh issue create`, retried without `--label`), `RAVEN_DATED_DRY=1`.
     The `hc run` line and the start-up dialog handling are unchanged.
   - `watchdog-dated.sh`, `schedule-followup.sh` (`--remove` included).
   - `units/`: four lead services and timers (no `network-online.target`, `Restart=on-failure`,
     `RestartSec=20min`, `RestartPreventExitStatus=75`, `StartLimitIntervalSec=12h`,
     `StartLimitBurst=30`) and four watchdog services and timers at the planned times.
6. **`dated/PRESTAGE.md`** (shared material once: held-out rule, write set, spend, merge authority,
   alert and report, probe commands, current judge-facing text of the six cases and the dormant
   sibling, the 2.1 outcome test and edits field by field, 2.2a, 2.2b, 2.2c, the staged sentinel-test
   edit, the register steps per run with the fields to hand-edit, the closure rule, the `reSwept`
   template, the gates) and the five briefs `2.1-LEAD.md`, `2.2a-LEAD.md`, `2.2b-LEAD.md`,
   `2.2c-LEAD.md`, `rehearsal-LEAD.md`. Each lead brief names its item, cases, due, cutoff, merge
   deadline and outcome test, then the ITEM-LEAD overrides, the child launch lines (Fable, Sonnet,
   Codex workhorse `gpt-6.1-sol`, Grok, Opus fallback) and the finish.

## Gates

| Gate | Result |
|---|---|
| `npm run typecheck` | Exit 0, after the placeholder `.dev.vars` (names only, ignored by git) and `npm run typegen`. Before that, 5 `OAUTH_KV` errors, as AGENTS.md says. |
| `npm test` | 166 files passed, 5 skipped; 3680 tests passed, 3 expected fail, 5 skipped. |
| `npm run build` | Exit 0 (wrangler `--dry-run`). |
| `npm run eval:qa:lint -- --stale` | 0 errors, 98 warnings. |
| `npm run secrets:scan -- --tree` | Clean, all tracked files. The pre-commit hook scans the staged new files. |
| `bash -n` on `launch-dated-lead.sh`, `watchdog-dated.sh`, `schedule-followup.sh` | Clean. |
| `node --check` on `probe.mjs`, `sibling-check.mjs` | Clean. |
| `systemd-analyze --user verify` on the 16 unit files | Exit 0 with the three scripts present in a scratch `HOME`. Against the real `HOME` it reports only that `watchdog-dated.sh` is not installed yet (the lead installs it). |
| Dry run: `RAVEN_DATED_DRY=1 launch-dated-lead.sh 2.2b quantum-plan` | Stops at "brief missing on origin/main: …/2.2b-LEAD.md", logs "dry run: would alert", exit 1. No worktree, no alert. |

Also checked by hand: the launcher's "already done" `jq` expression returns "done" only when every
case is later than the due date, never for an empty case list or a missing case; the watchdog's
`LATE` expression lists a case at or before the due date; `date -d` gives the watchdog fire time
`2026-11-24 16:00:00` for due 2026-11-24. `test:smoke` was not needed (no `src/executor` or `src/demo`
change).

## Deviations and notes

1. **A grep over the corpus.** To locate the Bell upgrade guide I ran
   `git grep -i "upgrade guide|upgrade-guide" -- eval/qa/corpus …` and kept the first 8 output lines,
   which came from two dated case files. The command read every file under `eval/qa/corpus/` and the
   matching lines of any other file were cut off by `head`; nothing from another case was shown or
   used. I did not repeat it.
2. **Bell guide location.** The brief says to locate the page through the Docs inventory. The page is a
   stellar.org blog post that the Docs inventory does not list, so `probe.mjs` reads
   `https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide` and falls back to the
   `stellar.org/sitemap.xml` entry for `bell…upgrade-guide`.
3. **"SCF #46 round page".** `https://communityfund.stellar.org/awards/46` is an empty app shell. The
   round's phase windows are embedded in the awards page payload, so `--scf` extracts them from there
   (same source as the awards listing) and adds the Scout feed's `meta.scfRound` as the second class.
4. **Launcher additions the plan did not state.** A retryable failure (exit 1) alerts on both channels
   only the first time for a key, so a 20-minute retry for hours does not file 30 issues; a final
   failure (75) always alerts. The task line gained a second short sentence ("Run key: …. Due: ….")
   because a follow-up lead needs both. Test mode (`RAVEN_DATED_TEST=1`) is kept; `done` counts as
   success only there. No `--assignee` on the issue (the plan does not name one).
5. **Bell follow-up dates.** Resolved by the lead and Codex finding 3: D is never before 2026-12-02,
   and 2.1 schedules `2.1r1` and `2.2ar1` (see "Codex reconciliation").
6. **Dry-run log.** The dry run wrote `~/.local/state/raven-dated/dry-2.2b.log` (the launcher's own log
   folder, a dry-run-only file name), and its `git fetch --prune` removed one stale remote-tracking ref
   in the shared repository, as the existing launcher's fetch does.
7. **Residual inference.** Superseded: closure is now all or none per run, so a closed or open
   register is the same for every reopened entry of that run and shows no per-entry partition.
8. **Names in the lead's files.** Resolved by the lead (two sibling ids redacted).
9. **The 67 count** in the TODO is taken from PLAN.md; I could not re-derive it without reading cases
   outside the allowed set.
10. **TODO shape.** The owner-decision text is a short `###` item with a "Done when" line, as the TODO's
    own convention asks, rather than a bare bullet under the held-out status.
11. **The 2.2c sibling count is 1.** `sibling-check.mjs --run 2.2c` reports one pending-state match among
    the cases the lane may not open. PRESTAGE.md says a non-zero count never stops a run: the entries
    that hold such a member stay at `reopen` and the count goes in the TODO.
12. **Placeholder `.dev.vars`** and generated `env.d.ts` exist in this worktree (both git-ignored) so
    `npm run typecheck` could run.

## For the lead to do

- Install `launch-dated-lead.sh`, `watchdog-dated.sh` and `schedule-followup.sh` to
  `~/.local/share/raven-dated/` and the 16 units to `~/.config/systemd/user/`, `daemon-reload`, enable
  the four lead and four watchdog timers, and record `systemctl --user list-timers`.
- Merge this pull request before 2026-11-23 18:00 UTC, then run the rehearsal (PLAN.md step 7).
- Decide deviation 5.

## Codex reconciliation

Finding numbers are those of `CODEX-REVIEW.md`; the lead's dispositions are in `briefs/exec-codex.md`.
The lead's own edits (D never before 2026-12-02, the follow-up cutoff wording in `2.1-LEAD.md`, the
redacted sibling ids in `REVIEW.md` and `briefs/review.md`, the TODO wording) are kept.

1. **Write set.** PRESTAGE.md now lists the compiler outputs `lifecycle-registry.json` and, only when
   changed, `tool-cases.json`, never hand-edited, in the write set, the merge "May" condition and the
   section 7 commit instruction.
2. **Membership disclosure.** `REVIEW.md` finding 3's evidence now holds the bracketed redaction line
   and finding 6's "members of the Bell and SCF traps that the lane may not open" is redacted too.
   Closure is all or none within a run (PRESTAGE.md sections 4 and 6, PLAN.md register paragraph,
   risks and reconciliation row, the briefs, the TODO item). *Audit* of every new or changed file for
   entry-specific membership statements, per-entry counts and read/unread partitions: PRESTAGE.md,
   the five briefs, `sibling-check.mjs`, the launcher, watchdog and units, `items.json`, the TODO and
   this file are clean; the only per-entry material is the list of entries each run reopens, which
   follows from the dated cases' public membership. `QUESTION.md` (the verbatim question and answer)
   says that a Bell or SCF edit reopens entries "that also hold cases outside tuning" as a class
   statement without naming an entry or a count; I left that record unedited, and the lead may want
   to decide whether to soften it.
3. **Software Versions after a Bell follow-up.** In B or X, 2.1 schedules `2.1 r1` and `2.2a r1`
   (fired 4 hours later), both with due D. `2.2a-LEAD.md` handles run key `2.2ar1` with D from the task
   line (cutoff D 20:00 UTC, merge deadline D+1 00:00 UTC); a follow-up that again ends in B or X
   extends its own cases, alerts and schedules nothing. `2.1r1` never edits Software Versions.
4. **Start limit.** Units and `schedule-followup.sh` use `StartLimitIntervalSec=0` (no burst), with
   `Restart=on-failure`, `RestartSec=20min` and `RestartPreventExitStatus=75` for the lead. The launcher
   bounds retries itself: for a plain key the cutoff comes from `items.json` (read from the local
   `origin/main` ref before the fetch, again after it), for a suffixed key it is the due date at 20:00
   UTC, and after it the launcher does `fail 75 "missed cutoff <time>"`, which alerts.
5. **Watchdog.** Rewritten: it checks that every expected id is present with a valid `reverifyBy`;
   a failed fetch, `git` or `jq` step, a missing id or a malformed date alerts and exits 1; "ok" is
   logged only after a positive check of every id; its services have `Restart=on-failure`,
   `RestartSec=15min`, `StartLimitIntervalSec=0`; past the merge deadline it sends one final alert and
   exits 0; it exits 1 when no alert channel accepted. Tested offline with stubbed `hc`, `gh` and a
   scratch repository: ok, late, missing id, and both channels failing.
6. **Launcher after `hc run`.** `hc get | jq`, the address parse, `hc read` and `hc keys` are guarded;
   a transient failure costs one loop turn; any path that cannot establish readiness ends in
   `fail 75` with the terminal address in the log; nothing starts a second lead.
7. **Alert delivery.** Each channel is wrapped in `timeout 60`; `alert` returns 0 only if a channel
   accepted; the `FAILED-<key>.txt` marker is written only after an accepted alert; with no accepted
   alert the launcher exits 1 before `hc run` and keeps 75 after it; an open issue with the same title
   gets a comment instead of a duplicate. Tested with stubs: cutoff missed with alert ok (exit 75,
   marker), with no channel (exit 1, no marker), and a second retryable failure not re-alerting.
8. **SCF corroboration.** PRESTAGE.md 2.2c: Scout is a retrieval comparison, not a second class; a
   newly pinned phase or deadline needs an independent class-D source outside the awards page; "no
   #47" needs an explicit dated web sweep; otherwise use source-relative wording or extend only.

Gates re-run after these edits: `npm run typecheck` exit 0; `npm test` 166 files passed, 3680 tests
passed; `npm run build` exit 0; `npm run eval:qa:lint -- --stale` 0 errors, 98 warnings;
`npm run secrets:scan -- --tree` clean; `bash -n` and `node --check` clean;
`systemd-analyze --user verify` exit 0 on the 16 units with the updated scripts in a scratch `HOME`,
and on a generated follow-up unit pair (read by eye; `schedule-followup.sh` tested with a stub
`systemctl`); the dry run against `2.2b` stops at "brief missing on origin/main", exit 1; a dry run of
`2.1 r1` with a past due date stops at "missed cutoff", exit 75.
