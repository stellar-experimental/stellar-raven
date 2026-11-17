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
5. **A thing to decide before 2026-11-23.** Outcomes B and X extend to "the run date plus 7 days" =
   2026-11-30, which is not later than 2.2a's due date (2026-11-30), so 2.2a's launcher would not skip
   its lead, and 2.1's follow-up (`reverifyBy - 1d 18:00` = 2026-11-29 18:00) would run before it on the
   same Software Versions case. Briefs follow the plan as written. A date of 2026-12-02 or later for the
   Software Versions and quantum cases would make 2.2a and 2.2b end in the launcher.
6. **Dry-run log.** The dry run wrote `~/.local/state/raven-dated/dry-2.2b.log` (the launcher's own log
   folder, a dry-run-only file name), and its `git fetch --prune` removed one stale remote-tracking ref
   in the shared repository, as the existing launcher's fetch does.
7. **Residual inference.** The orchestrator's answer 2 (1) leaves register entries at `reopen` when a
   member cannot be read. A committed register then shows which entries those are, so a reader can
   infer that each holds a member outside the lead's reach. That is the accepted cost of answer 2 (1);
   nothing in this item names a case.
8. **Names in the lead's files.** `REVIEW.md` (the lead's file, committed with this item) names two
   sibling ids in findings 7. They appear in `sibling-check.mjs`'s 2.1 output as openable, so they do
   not reveal a non-tuning case, but the held-out rule says to name only edited siblings; the lead may
   want to drop them.
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
