# Item 1.4 plan: pre-stage the dated golden runs (2.1, 2.2) and their timers

Lead: Claude Opus 5.5, agentpc `t1rs`. Worktree `/home/tyler/code/raven-wt/np-1.4`, branch
`np/1.4-prestage-dated-goldens` from `origin/main` at `d596b36f`. No local server. USD 0.

This plan has been reconciled with the Fable review in [REVIEW.md](REVIEW.md). The table at the end
maps each finding to the place in this plan that takes it.

## Decision this item changes

Items 2.1 and 2.2 become fill-ins that run unattended. A systemd user timer on agentpc starts an
Opus lead for each dated run. That lead plans, gets a Fable review, has Sonnet execute, runs the
required independent re-derivation review, and merges its own pull request on green CI within
stated limits. It leaves a REPORT.md.

When an event cannot be shown to have happened, the lead writes a dated extension and never
guesses. Model-free watchdogs alert the owner when a deadline is near and the work has not merged.

## Facts (re-checked 2026-11-17, `main` at `d596b36f`)

**Dated cases.** Their `truth.reverifyBy` dates:

| Case | `reverifyBy` |
|---|---|
| `q-edge-fresh-latest-protocol-version` | 2026-11-24 |
| `q-pc-protocol-upgrade-timing` | 2026-11-24 |
| `q-protocol-version-history-list` | 2026-11-24 |
| `q-infra-software-versions-current-protocol` | 2026-11-30 |
| `q-hist-quantum-preparedness-plan` | 2026-12-01 |
| `q-scf-current-round` | 2026-12-04 |

- `lintStale` fails a case when `reverifyBy` is earlier than today in UTC
  (`eval/qa/lint-corpus.mjs:628`). So each case must merge before 00:00 UTC on the day after its
  date.
- A change to `reverifyBy` alone passes the gospel lint, so an extension is always available.

**Split.** The orchestrator answered [QUESTION.md](QUESTION.md) with option 1, so the lead wrote
split v5 with [amend-split.mjs](amend-split.mjs):

- path `~/backups/gca-2026-11-14-split-v5.json`, mode 600;
- SHA-256 `c8796ec14c4d77d114693cfcf5a51a9f5da80a6506956bb7f88c6992725f4b15`;
- 86 tuning, 114 held-out and 47 reserve cases; v4 is kept;
- all six dated cases may now be opened;
- 67 cases outside tuning carry a `reverifyBy`, and the earliest is 2027-01-14. The runner's
  "scheduled" count (64) used `tags.freshness`, which undercounts; the TODO uses 67.

**Held-out rule for every committed file.** These files are the plan, the briefs, PRESTAGE.md,
the REPORTs, the pull-request bodies and the register `reSwept` reasons. They:

- name no case as in or out of tuning, beyond the six dated cases and the siblings a run edits;
- give no count of cases outside tuning per register entry or per pattern match;
- record only "pending-state matches among the cases this lane may not open: n".

`sibling-check.mjs` prints the ids a lane may open to stdout only.

**Live sources** (the reviewer read these on 2026-11-17):

- status.stellar.org resolves a maintenance by the clock. The Bell row runs 17:00 to 17:05, so
  "completed" proves nothing.
- Upgrade rows are named inconsistently, so filter them on `/upgrade/i`.
- The token `gh` uses is a repository admin, and branch protection does not apply to admins. The
  required checks are `secrets` and `test`. Merges are squash only and auto-merge is off.

**Sentinels.**

- `mainnet-protocol-29`, `-29-latest` and `-29-history` read the Horizon root.
- `bell-mainnet-vote-scheduled` reads the status JSON.
- `scf-46-submission-deadline`, `scf-47-not-listed` and `scf-45-ended` read the awards page.
- `test/source-sentinels.test.mjs:185-216` checks a sentinel's `caseAsOf` against its case's
  `truth.asOf`, and tests `mainnet-protocol-29` by id.

**Register.** A Bell edit reopens:

- the Bell date trap (its trigger also covers "any AddressV2 successor change");
- the "Mainnet protocol activation history" invariant;
- up to 13 clusters.

An SCF edit reopens:

- the SCF #46/#45/#44 trap;
- the "SCF Submission" invariant, which pins "SCF #46 Initial Review";
- four clusters.

A trap's quoted `q-… reverifyBy YYYY-MM-DD` must equal the case's date
(`lint-corpus.mjs:366-386`). An entry left at `reopen` is legal in CI.

**Siblings.** One case outside the dated six states Bell's pending state in its `golden.answer`
("CAP-0087 ML-DSA, in Bell/Protocol 30, not yet on Mainnet as of 2026-11-14") and has no
`reverifyBy`: `q-pc-quantum-preparedness-dormant`. Other siblings mention Bell only in dated or
structural terms, or in judge-blind `truth.notes`. Among the cases a lane may not open, the strict
pending-state test matches 0.

**Timers.** Linger is `yes`. Two test fires of the launcher worked: a top-level Opus lane started,
took its argv task and reported back ([TIMER-TEST.md](TIMER-TEST.md)). The test path skipped
fetch, worktree and brief. The real path is rehearsed after this PR merges (step 7).

## Steps

The lead did step 0 and the first install of step 5. The executor (Claude Sonnet 5.5) does steps 1
to 6. The lead reinstalls the units and runs step 7.

0. **Split v5.** Done; see above.

1. **Bookkeeping.**
   - Set `TUNING_ROW_COUNT` to 86.
   - `.agents/TODO.md`, held-out status:
     - v5 path, SHA-256 and counts;
     - v4 kept;
     - an amendment sentence linking QUESTION.md;
     - the v5 note's "scheduled" means "has a `reverifyBy`";
     - "Tuning scans pass `--split …-v5.json`".
   - `git grep` for other places that call v4 current, and fix each one.
   - TODO owner-decision bullet:
     - Each case outside tuning that carries a `reverifyBy` (67) is exposed when its date comes due.
     - So option 1 erodes the held-out set each quarter. The next such date is 2027-01-14.
     - The alternative, option 2, is a maintenance exception that needs the owner.
   - The Bell and Software Versions TODO bullets (`.agents/TODO.md` near lines 395 and 467): point
     each one at the dated run that now owns it.

2. **`dated/probe.mjs`** (node, keyless, no dependencies). Output is JSON on stdout or to
   `--out <path>`. A failed section reports `{ok:false,error}` and the other sections still run.
   GitHub reads go through `gh api`.
   - `--protocol`:
     - the Horizon root of both networks;
     - the latest ledger of both networks;
     - on Mainnet, a bisection over `/ledgers/{seq}` from 64717645 for the first ledger L at
       version 30 or above, with L and L-1 and their `closed_at`;
     - status.stellar.org `scheduled-maintenances.json` and `upcoming.json` rows matching
       `/upgrade/i`;
     - the last 10 `stellar/stellar-core` releases, prereleases included;
     - the Bell upgrade guide's schedule lines (locate the page through the Docs inventory).
   - `--software-versions`: the Software Versions `.md` page. Report its protocol headings, the
     rows under each, and whether Protocol 30 is present.
   - `--scf`:
     - every "SCF #NN <phase>" and "Deadline to submit" on `communityfund.stellar.org/awards`;
     - "SCF #47" present or not;
     - the SCF #46 round page;
     - `https://stellarlight.xyz/api/rfps?status=open`, as a count with titles.
   - `--quantum`: the CAP-0087 status line.
   - Run it once and commit the result as `dated/baseline-2026-11-17.json`.

3. **`dated/sibling-check.mjs --run <2.1|2.2a|2.2c> --split <path>`.** It reads the split for
   `sets.tuning` only, and reads `cases.json` and the register.
   - Pool: the members of every register entry that holds a case the run edits, plus the cases
     whose judge-facing text matches the run's pattern set:
     - Bell: P29, P30, Bell, 2026-11-23, current or latest protocol, CAP-0084/0087/0088;
     - Software Versions: release strings;
     - SCF: SCF #4x, phase names and "Deadline to submit".
   - Stdout: the ids in the pool the lane may open, and which of those match the strict
     pending-state test.
   - A last line safe to commit: "pending-state matches among the cases this lane may not open:
     n".
   - It prints no other count and no id of a case the lane may not open.

4. **`dated/items.json`.** Per item: the brief path, the case ids, the due date and the merge
   deadline. The launcher and the watchdog read it from `origin/main`.
   - `2.1`: the three 11-24 cases plus `q-hist-quantum-preparedness-plan` (finding 12), due
     2026-11-24.
   - `2.2a`: `q-infra-software-versions-current-protocol`, due 2026-11-30.
   - `2.2b`: the quantum case, due 2026-12-01. Normally the launcher finds it already done.
   - `2.2c`: `q-scf-current-round`, due 2026-12-04.
   - `rehearsal`: no cases.
   - Each item also carries `cutoff`: 2.1 2026-11-24T20:00Z; 2.2a 2026-11-30T20:00Z; 2.2b
     2026-12-01T20:00Z; 2.2c 2026-12-04T20:00Z.

5. **Scripts and units.** Sources live in `dated/`. The lead installs them to
   `~/.local/share/raven-dated/` and `~/.config/systemd/user/`.
   - `launch-dated-lead.sh <item> <slug> [<run> [<due>]]`. The key is `<item><run>`, for example
     `2.1` or `2.1r1`. The key names the worktree `np-<key>`, the branch `np/<key>-<slug>`, the
     terminal `np-<key>-lead`, the log and the report folder `items/<key>/`. The brief is always
     `dated/<item>-LEAD.md`. In order:
     1. `git fetch`. A failure exits 1, which is retryable.
     2. `git cat-file -e origin/main:<brief>`. A missing brief exits 1 (retryable). This covers a
        late merge of this PR.
     3. Already done: every case of the item has `reverifyBy` later than the due date on
        `origin/main:eval/qa/cases.json`. In that case log it, send a notice, and exit 0 before any
        model starts.
     4. `git worktree add`. An existing worktree or branch is final and exits 75.
     5. `hc run --bg --no-parent` with the Opus line.
     6. Confirm the lane is `working` within 2 minutes, answering a start-up dialog if one blocks
        it. A real run that is already `done` inside that window counts as a failure (exit 75): it
        refused, hit a limit or asked a question. Log the screen.
     7. Notify.
   - `alert()` uses two channels:
     - `hc send t40j`, best effort, with a 90-second timeout;
     - `gh issue create` in this repository, labelled `dated-golden`, with the item, the message
       and the log path.
     - `fail` and the watchdog use both channels. A start notice uses `hc` only.
   - `watchdog-dated.sh <item> [<due>]` (model-free): `git fetch`, then alert if any case of the
     item has `reverifyBy` not later than the due date on `origin/main`.
   - `schedule-followup.sh <item> <run> '<UTC fire time>' <due>`: writes and enables
     `raven-dated-<item><run>` and `raven-watchdog-<item><run>` (the watchdog fires at the due
     date's next day 00:00 minus 8 hours), then prints `list-timers`. `--remove <item><run>`
     deletes both.
   - Units:
     - Drop the `network-online.target` lines; that target does not exist in the user manager.
     - Set `Restart=on-failure`, `RestartSec=20min` and `RestartPreventExitStatus=75`, with
       `StartLimitIntervalSec=12h` and `StartLimitBurst=30`, so a late merge or a slow network
       heals itself.
     - The schedule:

     | Lead timer | Fires (UTC) | Watchdog fires (UTC) | Merge deadline (UTC) |
     |---|---|---|---|
     | `raven-dated-2.1` | 2026-11-23 18:00 | 2026-11-24 16:00 | 2026-11-25 00:00 |
     | `raven-dated-2.2a` | 2026-11-30 06:00 | 2026-11-30 16:00 | 2026-12-01 00:00 |
     | `raven-dated-2.2b` | 2026-12-01 06:00 | 2026-12-01 16:00 | 2026-12-02 00:00 |
     | `raven-dated-2.2c` | 2026-12-04 06:00 | 2026-12-04 16:00 | 2026-12-05 00:00 |

6. **`dated/PRESTAGE.md` and the briefs** `dated/2.1-LEAD.md`, `2.2a-LEAD.md`, `2.2b-LEAD.md`,
   `2.2c-LEAD.md` and `rehearsal-LEAD.md`. The content is set out in the next two sections.

7. **Rehearsal** (lead, after this PR merges). This is the real path with no edit and no pull
   request:
   1. `schedule-followup.sh rehearsal r0 '<now+2min>' 2099-01-01` starts a lead on
      `rehearsal-LEAD.md`.
   2. That lead runs `npm ci`, `git push --dry-run`, `gh pr list` and `npm run eval:qa:sentinels`.
   3. It starts one Fable child and one Codex child, and each reports one line.
   4. It runs `schedule-followup.sh rehearsal r1 '<now+2min>' 2099-01-01`, then removes r0's units.
   5. It reports, and r1 reports in turn.
   6. The lead removes both runs' units, worktrees and branches, which the lead created.
   7. The result goes in TIMER-TEST.md through a follow-up commit to `main` by the orchestrator, or
      in the 2.1 lead's pull request. Cost: about 20 minutes of Opus.

## PRESTAGE.md content

**Write set of a dated run.** A run may change only:

- its cases and staged siblings;
- `eval/qa/cases.json` and `sample.json`, from the compiler only;
- `consistency-register.json`;
- `source-sentinels.json`;
- `test/source-sentinels.test.mjs`, with the staged edit only;
- `.agents/TODO.md`;
- the round ledger;
- its item folder;
- `improvements/`, in 2.2a only.

**Probe and evidence slots.** Give the exact commands, then a table per claim:

| Claim | Class | URL | observedAt | Value or quote |
|---|---|---|---|---|

The cells start empty. Quote each case's current judge-facing text from `main`.

**2.1 outcome test.** The test is keyed on the ledger. The status page's state is recorded but
proves nothing.

- **A, activated.** All of these hold:
  - the Horizon Mainnet root reports 30 or above;
  - the bisection finds L at 30 with L-1 at 29;
  - a second read path agrees (`/ledgers/L`, or RPC `getLatestLedger`);
  - a class A or B record ties P30 to this vote: the Bell guide's schedule line with L's
    `closed_at` at the scheduled time, or an SDF announcement.
- **B, not activated.** Both read paths report 29 in two probes at least 6 hours apart, the later
  one after 2026-11-24 00:00 UTC. The text states only the observation: "As of <timestamp> Mainnet
  still runs Protocol 29; Protocol 30 had not activated after the vote scheduled for 2026-11-23
  17:00 UTC." It gives a new date only from a primary source, and never says "failed" or
  "cancelled" without a primary source.
- **X, uncertain.** Any of these: the read paths disagree, Horizon is unreachable, the re-derivation
  reviewer cannot run, or the lead asked `t40j` a question and got no answer in 10 minutes. Then:
  - change `reverifyBy` only;
  - update the trap's quoted dates;
  - leave reopened entries open;
  - schedule the follow-up and alert.
  - No judge-facing text changes.
- X never becomes B.

**A edits, field by field.**

- **Edge case.**
  - `golden.answer`: "As of <date>, Mainnet runs Protocol 30 (Bell), activated <date> at ledger
    L." Keep the behaviour clause.
  - `golden.notes`: update the example and drop "after the vote, Protocol 30 may be correct".
  - Sentinel: `mainnet-protocol-29-latest` becomes `mainnet-protocol-30-latest`.
- **Upgrade timing.**
  - `golden.answer`: Mainnet runs P30 since <date>. Then either the next announced Mainnet vote with
    its primary source, or "none announced as of <date>". The second is a negative claim; the
    records to check are the status feed, the SDF upgrade guides, the `stellar-core` releases and
    prereleases, and one search with the CLI's built-in web search. Keep the validator and SCP
    sentence.
  - The SDK sentence and key fact 3 become "SDKs must support a new protocol before that network's
    upgrade vote".
  - Remove `bell-mainnet-vote-scheduled`. Add `next-mainnet-upgrade-vote-absent`: an `absent` check
    on `upcoming.json` with pattern `Upgrade Vote|Mainnet[^"]*Upgrade` and guard
    `"scheduled_maintenances":`. If a vote is announced, use a `present` check on it instead.
- **History list.** Three spans change, with a corroboration row for the P30 line:
  - the opening "As of …, Mainnet runs Protocol 29" becomes P30;
  - append "P30 Bell <date> <headline>", with the headline taken from the release's CAPs (0084,
    0087, 0088) at two classes;
  - the closing Bell sentence is removed.
  - Key fact 1 becomes "19 to 30". Avoid: add "call P29 the latest after <date>".
  - Sentinel: `mainnet-protocol-29-history` becomes `mainnet-protocol-30-history`.
- **Quantum case** (folded into 2.1). Change only the judge-blind fields: `truth.notes` (CAP-0087
  is on Mainnet since <date>; the classic signer is still future), `truth.asOf`, `truth.verified`
  and a corroboration row. `golden.*` stays unchanged.
  - Sentinel: `mainnet-protocol-29` becomes `mainnet-protocol-30`.
  - Staged test edit in `test/source-sentinels.test.mjs`: the new id, with 30 held, and 29 and 300
    drifting. The Testnet passphrase still errors.
- **Sibling `q-pc-quantum-preparedness-dormant`.**
  - `golden.answer` clause: "CAP-0087 ML-DSA, in Bell/Protocol 30, active on Mainnet since <date>".
  - This is a gospel change, so it needs `truth.verified` and evidence rows.
  - Add `tags.freshness: scheduled` and a `reverifyBy` only if the lint requires them for a dated
    value. Otherwise state it without a point-in-time date.
- **Other siblings the lane may open.** Refresh only stale judge-blind `truth.notes`. Record "no
  judge-facing change" and the reason.
- **Software Versions case** (in 2.1 only if the page already lists P30 for Mainnet; otherwise
  2.2a). See 2.2a.
- **Every case.** Set `truth.asOf`, set `caseAsOf` on each of its sentinels, and set the new
  `reverifyBy`, staggered by quarter:

  | Case | New `reverifyBy` |
  |---|---|
  | Software Versions | 2027-02-08 |
  | Edge | 2027-02-15 |
  | Upgrade timing | 2027-02-22 |
  | History list | 2027-03-01 |
  | Quantum | 2027-03-08 |

  An announced P31 vote moves the affected cases to that date plus 1 day.

**Register (A).**

- Bell trap:
  - a dated disposition saying the event happened;
  - the trigger becomes "the next Mainnet protocol vote, any later Mainnet protocol activation, or
    any AddressV2 successor change";
  - every quoted `reverifyBy` equals its case.
- Activation invariant: append "Protocol 30 (Bell) from ledger L (date)" to `authoritativeValue`,
  and update `evidence` and `datePolicy`.
- Cluster notes: update the P29 and Bell tails.
- Run `npm run eval:qa:register`. Closure is all or none within one run. If any reopened entry
  holds a member the lead may not open, close none of that run's reopened entries: every one stays
  at `reopen` with no `reSwept` written, and the TODO, under the held-out maintenance owner
  question, records the count of entries left open. Only when the lead has read every member of
  every reopened entry does the run close them, by a register-helper review. This is the
  orchestrator's answer 2 (1) in [QUESTION.md](QUESTION.md), applied more strictly so that which
  entries close never reveals which hold an unreadable member.
- The `reSwept.reason` template, the same for every entry:
  - what changed in the edited member;
  - the entry's subject;
  - "all members read".
  - Entries left open get no review. The TODO count is the only record of them.

**B and X in 2.1.**

- Extend every Bell-dependent case to one date: the edge, timing, history, quantum and Software
  Versions cases.
  - B with a primary new date: that date plus 1 day.
  - B otherwise, or X: the run date plus 7 days.
- In B, the judge-facing wording changes as stated above. The edge, timing and history cases each
  get it, and the root cause is `freshness-drift`.
- Write the Bell trap's dated extension through `--review` only under the all-or-none closure
  rule above. Otherwise leave it at `reopen`. Either way its quoted dates must equal the cases (the date-trap
  lint).
- Change the vote sentinel to the new date, or remove it.
- Run `schedule-followup.sh 2.1 r1 '<new vote + 1h | reverifyBy - 1d 18:00>' <new reverifyBy>`
  and record it. A second slip goes to the alert channel, not to a third timer.
- 2.2a and 2.2b then end in the launcher as "already done".

**2.2a, Software Versions** (fires 11-30; the orchestrator's 12-01 deadline overrides the TODO's
"file on or after 12-01").

- Sources: the page (class A), the Bell upgrade guide (class A) and the GitHub releases (class B).
- **Page lists the Mainnet protocol's set.**
  - Pin the versions, each cross-checked against its GitHub release.
  - Add a `present` sentinel on the "Protocol 30 (Mainnet" heading.
- **Page lags while Mainnet runs P30.**
  - Re-check the next free `sd-` id.
  - File the TODO-described finding under `improvements-pipeline`, at `verified` or later in the
    same commit, and post it under decision 4.
  - Add the canonical-page caution with its cap, and grade against the release set the Bell guide
    names.
  - Add an `absent` sentinel with a guard on the Protocol 29 heading.
  - Extend by a quarter.
  - Gates: add `npm run improvements:lint` and `npm run improvements:index`.
- **Mainnet still runs P29.** Extend, as in B.
- **Register:** cluster-024 and the Bell trap's quoted date.

**2.2c, SCF current round.**

- Pin the observed state of SCF #46 and #47 from the awards page plus one more class (the round
  page or the Scout RFP feed).
- `golden.answer` and key fact 2: replace "(SCF #46, Initial Review)" with the observed phase.
- Rewrite the three `scf-*` sentinels, and set their `caseAsOf`.
- Register:
  - SCF trap disposition with its quoted date;
  - the "SCF Submission" invariant (`authoritativeValue`, `rule`, `acceptedSpellings`, `evidence`,
    `datePolicy`);
  - the four clusters' notes.
- New `reverifyBy`: the next published phase date plus 1 day, otherwise a quarter.

**Gates of every dated run.** Run them bare:

- `npm run eval:qa:compile`
- `npm run eval:qa:lint -- --since origin/main --stale --enforce-floors`
- `npm run eval:qa:register`
- `npm run eval:qa:sentinels -- --ids <changed ids>`
- `npm run eval:selftest`
- `npm test`
- `npm run secrets:scan -- --tree`

Never run:

- `npm run eval:qa:selftest` (the paid judge), `eval:qa` or any `eval:qa:paired:*` command;
- a re-judge of stored rows. Record instead that stored verdicts on these ids predate the change.
- Class D evidence comes only from the CLI's built-in web search.

## The lead briefs

Each brief makes `briefs/ITEM-LEAD.md` the procedure, with these overrides.

- **Identity.** An Opus lead started by a timer, with no parent. The orchestrator may be gone.
  - A question goes to `t40j` by `hc send`, with a 10-minute wait.
  - With no answer, take outcome X and record the question.
  - Never guess.
- **Worktree.** The launcher created it. Run `npm ci`.
- **Children.**
  - Fable plan review.
  - Sonnet executor.
  - The independent re-derivation reviewer (golden-truth §4, PLAN.md 2.1): Codex workhorse
    re-derives each changed claim from live sources, without the author's notes or PRESTAGE
    evidence. Fallbacks: Grok 4.7, then Claude Opus. The executor reconciles its findings.
  - Launch lines are copied from ITEM-LEAD.md. Model ids come from `.agents/model-roster.md`.
- **Scope.**
  - Open only the cases `sibling-check.mjs` prints. The split path is
    `~/backups/gca-2026-11-14-split-v5.json`.
  - Write only inside the write set.
  - Follow the held-out rule for committed files.
- **Merge authority**, as bounded in QUESTION.md question 2 and the orchestrator's answer.
  - **May:** push its branch, open one pull request, and run `gh pr merge <n> --squash` once all of
    these hold:
    - `secrets` and `test` are green on the head commit;
    - the re-derivation review is reconciled;
    - the lead has read the full diff;
    - the diff is inside the write set.
  - **Never:** `--admin`; any change to protection, rulesets, workflows, `package.json` scripts, or
    lint or test logic (the staged sentinel-test edit excepted); a push to `main`; a force push;
    merging another pull request; a deploy; `--no-verify`; weakening a gate.
  - **Waiting on checks:** use `gh pr checks <n> --required --watch`, and retry while no check is
    registered.
  - **If `main` moves:** merge it, re-run compile, register and the gates, then push.
  - **A red check after two attempts, or a reviewer that cannot run:** switch to outcome X in a
    fresh commit. If that is red too, leave the pull request open and alert.
  - **Cutoff** (orchestrator's answer 2 (2)): stop if CI is red or the review is not reconciled by
    either of these times:
    - 2.1 (and its follow-ups): 2026-11-24 20:00 UTC;
    - a 2.2 run: its merge deadline minus 4 hours, which is `cutoff` in `items.json`.
  - At the cutoff, leave the pull request open, write the blocker at the top of REPORT.md, and
    alert.
- **Report.**
  - Commit `items/<key>/REPORT.md` in the pull request before the merge.
  - After the merge, write `~/.local/state/raven-dated/<key>-REPORT.md` with the merge commit.
  - `hc send kalepail-c3614nvxph-mbp/t40j '<path>'`, best effort.
  - Kill and remove its own children. Leave its worktree.

## Gates (this item)

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run eval:qa:lint -- --stale`
- `npm run secrets:scan -- --tree`
- `bash -n` on the three shell scripts
- `node --check` on the two node scripts
- `systemd-analyze --user verify` on the units
- `launch-dated-lead.sh` in a dry mode (`RAVEN_DATED_DRY=1`: every check up to `hc run`, then exit
  0) run against `2.2b` today. It must stop at "brief missing on origin/main", exit 1.

## Stop rule

The baseline probe runs once. This item is done when all of the following hold:

- the branch carries the scripts, the briefs, PRESTAGE.md and items.json;
- the reinstalled units are listed;
- the dry mode behaves as stated.

The rehearsal (step 7) runs once after the merge. No case file is edited in this item.

## Risks

- **This PR merges after 2026-11-23 18:00 UTC.** The launcher retries every 20 minutes, and the
  watchdog alerts on 11-24 at 16:00.
- **A reboot.** `Persistent=true` covers a missed fire. That the `hc` core restarts on the first
  `hc` call is assumed, not tested across a reboot.
- **Quota.** A real lead that is `done` within 2 minutes fails loudly, and the watchdog backs it.
- **Members a lane may not open.** If any exist among a run's reopened entries, the whole run's
  entries stay at `reopen` (answer 2 (1), all or none). They are counted in the TODO, and the
  scripted scan is a warning signal only.

## Needs from the orchestrator

- Merge this PR before 2026-11-23 18:00 UTC. Then the lead runs the rehearsal.
- Copy split v5 to the Mac (SHA-256 above).

## Reconciliation of REVIEW.md

| # | Finding | Disposition |
|---|---|---|
| 1 | Outcome test can write a false "did not activate" | Adopted: A/B/X keyed on the ledger; X never becomes B |
| 2 | Sentinel rename breaks `npm test` | Adopted: staged test edit; write set stated once |
| 3 | Set membership by elimination | Adopted: held-out rule for committed files; sibling-check prints ids to stdout only; neutral `reSwept` template; per-entry splits and the sibling list removed from this plan |
| 4 | Follow-up cannot start a lead | Adopted: run key, `schedule-followup.sh`, rehearsed in step 7 |
| 5 | Merge authority unbounded; admin token | Adopted: May and Never lists, confirmed by the orchestrator (answer 2), with a cutoff added |
| 6 | Register coverage | Adopted: pool derived from the register per run; per-run patterns; invariant fields; quoted dates; AddressV2 clause kept; closure by answer 2 (1), all or none per run: entries close only when every reopened entry was read in full |
| 7 | Dormant sibling's pending answer | Adopted: staged edit; the other siblings get "no judge-facing change" with the reason |
| 8 | Gaps in the edit per case | Adopted, all bullets |
| 9 | Stalls go unnoticed; the alert path may be dead | Adopted: watchdogs, `gh issue` channel, early `done` fails |
| 10 | Launcher hardening | Adopted: brief checked before any write; exit 1 or 75; `Restart=on-failure`; no `network-online` |
| 11 | Real path never run | Adopted: rehearsal after merge (step 7) |
| 12 | Fewer runs | Adopted: quantum folded into 2.1; one extension date; "already done" checked in the launcher on `reverifyBy` |
| 13 | Erosion count field | Adopted: 67 cases with `reverifyBy`, next date 2027-01-14; v5 left as written |
| 14 | Probe details | Adopted: `/upgrade/i`; `gh api` |
| 15 | `gh pr checks --watch` | Adopted: `--required` with a retry |
| 16 | Key fact 3 wording | Adopted |
| 17 | "Any later case" | Adopted: quantum always; Software Versions only when the page already lists P30 |
