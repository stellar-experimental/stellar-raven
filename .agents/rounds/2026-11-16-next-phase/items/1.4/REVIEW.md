# Item 1.4: Fable plan review

Reviewer: Claude Fable 5.2, high effort, agentpc, 2026-11-17. Read-only apart from this file. No
subagent, `hc` child, model-calling eval or paid call. Case files opened: the nine the brief allows.
No split file was read (only `stat`), so the split counts in PLAN.md and the v5 SHA-256 are not
re-derived here. Live reads were keyless: Horizon root, status.stellar.org, the Software Versions
page, the SCF awards page, the Scout RFP feed, the `stellar-core` releases, and read-only `gh api`.

What holds, so the lead need not re-check it:

- The deadline arithmetic is right. `lintStale` fails when `reverifyBy < today` in UTC
  (`eval/qa/lint-corpus.mjs:628-633`), so a case due 11-24 fails from 2026-11-25 00:00 UTC.
- The four timers are armed with the planned times, `Persistent=true`, enabled under
  `timers.target.wants`, with stamp files, and `Linger=yes`. Installed units and launcher equal the
  copies in `dated/`.
- Every binary the launcher and a lead need resolves under the launcher's `PATH` (`hc`, `claude`,
  `jq`, `git`, `systemd-run`, `gh`, `node` 26, `npm`, `codex`, `grok`). `gh` is logged in from a
  file, so it works without a login session.
- `main` requires the checks `secrets` and `test`, squash only, zero approvals, and auto-merge is
  off. Watch-then-merge is therefore the right shape.
- The register mechanics are as the plan says: stamp first, then `--review`; a trap review matches
  the old trigger text and may rewrite it (`eval/qa/register-helper.mjs:114-115, 176-181, 213`).
- A change to `reverifyBy` alone passes the gospel lint (`lint-corpus.mjs:389-395`). That makes a
  pure extension always available as a safe fallback (finding 1).

## Blocking

### 1. The outcome test can write a false "did not activate" into three goldens

Severity: blocking.

Evidence:

- PLAN.md:143-147 accepts "the status.stellar.org maintenance marked completed" as the primary
  confirmation of outcome A, and sends a lasting conflict (C) to outcome B. PLAN.md:183 makes B
  write "the 2026-11-23 Mainnet vote did not activate Protocol 30" as a gospel change.
- The status page completes a maintenance by the clock. From
  `https://status.stellar.org/api/v2/scheduled-maintenances.json` today: the 2024-06-18 "Mainnet
  Protocol Upgrade Vote" has `scheduled_until` 17:01:00 and `resolved_at` 17:01:02. The Bell row
  has `scheduled_for` 17:00 and `scheduled_until` 17:05. So "completed" will appear at 17:05
  whether or not the upgrade activated.
- Two consequences. If Horizon reports 30 and no announcement is out yet at 18:00, the run is
  neither A nor B, so it is C, and after 60 minutes C becomes B: a false statement merged
  unattended. If the vote fails, the page still says "completed", which the plan reads as a
  conflict rather than as no evidence.

Change: key the test on the ledger, and separate "uncertain" from "not activated".

- **A (activated).** Horizon Mainnet root reports `current_protocol_version` 30 or above; the
  probe's bisection finds ledger L at 30 with L-1 at 29; a second read path agrees (the
  `/ledgers/{L}` record, or an RPC `getLatestLedger`); and one class A or B record ties Protocol 30
  to this vote (the Bell upgrade guide's schedule line, with L's `closed_at` at the scheduled time,
  or an SDF announcement). The status row's state is recorded but proves nothing.
- **B (not activated).** Both read paths report 29 at two probes at least 6 hours apart, the later
  one after 2026-11-24 00:00 UTC. The text states the observation only: "As of <timestamp> Mainnet
  still runs Protocol 29; Protocol 30 had not activated after the vote scheduled for 2026-11-23
  17:00 UTC." Add a new date only when a primary source gives one. Never "failed" or "cancelled"
  without a primary source that says so.
- **X (uncertain).** The read paths disagree, Horizon is unreachable, the re-derivation reviewer
  cannot run, or a question to `t40j` got no answer. Change `reverifyBy` only (run date plus 7
  days) on the due cases, update the trap's quoted dates (finding 6), leave reopened register
  entries open, schedule the follow-up, and alert (finding 9). No judge-facing text changes.

C never maps to B.

### 2. Renaming `mainnet-protocol-29` breaks `npm test`, and the plan stages no test edit

Severity: blocking.

Evidence: `test/source-sentinels.test.mjs:207-216` looks the sentinel up by the id
`mainnet-protocol-29` and expects 29 to hold and 30 to drift. PLAN.md:173 renames it to
`mainnet-protocol-30` with pattern 30. `byId` then returns `undefined.check`, the suite throws,
and the required `test` check goes red. The dated brief limits edits to tuning cases
(PLAN.md:232), so the lead has no stated permission to touch the test.

Change: PRESTAGE.md carries the exact test edit for whichever run renames that sentinel: the id,
then expectations `30` hold, `29` drift, `300` drift, Testnet passphrase error. List
`test/source-sentinels.test.mjs` in the dated lead's allowed write set. State the full write set
once: the named case files, `eval/qa/cases.json` and `sample.json` from the compiler,
`consistency-register.json`, `source-sentinels.json`, that test, `.agents/TODO.md`, the round
ledger, the item folder, and `improvements/` in 2.2a only.

### 3. PLAN.md and the planned `reSwept` reasons identify non-tuning cases by elimination

Severity: blocking. Fix before the first commit; it cannot be undone after a push.

Evidence:

- `.agents/TODO.md:56`: "never record which set a case is in". `eval/qa/README.md:227-228`: never
  copy a held-out or reserve id into a ledger.
- PLAN.md:42-45 gives tuning and non-tuning counts per register entry, and PLAN.md:31 says all six
  dated cases are tuning. The register is committed and lists each entry's ids. The Bell trap and
  the SCF trap each hold exactly one id beyond the dated cases, and so does the activation
  invariant. Subtraction names the non-tuning case in each.
- PLAN.md:46-47 says each of six clusters has a non-tuning member. Two of those clusters have one
  member beyond the dated cases.
- PLAN.md:48-52 names eight ids as tuning.
- PLAN.md:180-181 tells the dated lead to write a `reSwept.reason` that "names the tuning members
  read". In a committed entry with a public member list, that is the same subtraction, repeated in
  `consistency-register.json` on every closed entry.

Change:

- PLAN.md: replace the per-entry splits with one pooled sentence ("across these entries and the
  pattern matches, N cases are outside tuning; the strict pending-state test matches 0"). Drop the
  list of tuning ids; say "the cases this lane may open" and keep the ids in an untracked file
  under `~/.local/state/raven-dated/`.
- `sibling-check.mjs`: print the ids the lane may open only to stdout, never to a tracked file.
  Print pooled counts only, never a count per register entry.
- `reSwept.reason` template, the same wording for every entry: what changed in the edited
  member, what the entry's subject is, and "the other members were scanned by
  `sibling-check.mjs`: <pooled count> scanned, <n> pending-state matches". It names no member as
  read or unread.
- REPORT.md and the pull request body follow the same rule.

### 4. The follow-up timer cannot start a lead

Severity: blocking for outcomes B and X.

Evidence: PLAN.md:190 installs a follow-up with "same launcher, same item". The launcher fails
when the worktree exists (`dated/launch-dated-lead.sh:47`) or the local branch exists (line 48).
Both still exist after the first run: the merge deletes the remote branch only, and the brief
removes children, not the worktree. `--name np-<item>-lead` (line 24) must be unique among live
terminals, and the first lead's terminal is still live. The unit name and
`items/<item>/REPORT.md` collide too.

Change: give the launcher a run id: `launch-dated-lead.sh <item> <slug> [<run>]`. The brief stays
`<item>-LEAD.md`; the worktree, branch, terminal name, log, unit and report folder use
`<item><run>` (for example `2.1r1`). Ship `schedule-followup.sh <item> <run> '<UTC time>'` in the
installed folder so a lead writes no unit file by hand, and test it once with the rehearsal in
finding 11.

### 5. The merge authority has no stated limit, and the token is an admin

Severity: blocking for the briefs.

Evidence: `gh api repos/stellar-experimental/stellar-raven --jq .permissions` returns
`admin: true`. Branch protection has `enforce_admins.enabled: false`. So
`gh pr merge --admin` merges past a red required check. The lead runs with
`--dangerously-skip-permissions`, under a deadline, with "two fix attempts" on a red check
(PLAN.md:248). PLAN.md:243-251 says what to do and nothing about what never to do. The standing
merge instruction is recorded only as one line of `briefs/PLAN-BRIEF.md:57`, addressed to the
orchestrator.

Change: each brief states both lists.

- May: push its own branch; open one pull request; `gh pr merge <n> --squash` when all of these
  hold: both required checks green on the head commit, the re-derivation reviewer finished and
  every finding is reconciled, the lead read the full diff, and the diff touches only the write
  set in finding 2.
- Never: `--admin`; any change to branch protection, rulesets, workflows, `package.json` scripts,
  lint or test logic (the staged sentinel test edit excepted); a push to `main`; a force push; a
  merge of any other pull request; a deploy; skipping hooks; weakening a gate to get green.
- A red check after two attempts, or a missing reviewer: switch to outcome X in a fresh commit. If
  that is red too, leave the pull request open and alert.
- Record the delegation: one dated line from the orchestrator in QUESTION.md that the standing
  merge instruction covers the four dated leads within these limits.

## Should-fix

### 6. The register steps cover a fraction of what the edits reopen

Evidence, from the committed register:

- 2.1 edits three cases that sit in 13 clusters (007, 024, 025, 032, 044, 062, 067, 069, 104, 112,
  115, 119, 120), the Bell trap and the activation invariant. PLAN.md:46 and the sibling pool
  (PLAN.md:102-103) cover six clusters.
- 2.2a reopens cluster-024 and the Bell trap. PLAN.md:193-200 has no register step.
- 2.2c reopens clusters 011, 033, 040 and 121, the SCF trap, and the numeric invariant "SCF
  Submission". The plan never mentions that invariant. Its `authoritativeValue`, `rule`,
  `acceptedSpellings` and `datePolicy` all pin "SCF #46 Initial Review", and cluster-033's note
  states the same.
- The sibling patterns are Bell-only (PLAN.md:105). 2.2a and 2.2c have no check for their subject.
- The date-trap lint compares every `q-… reverifyBy YYYY-MM-DD` phrase in a trap string with the
  case (`lint-corpus.mjs:366-386`). The Bell disposition quotes four such dates, one of them the
  Software Versions case; the SCF disposition quotes one.
- The Bell trigger also covers "any AddressV2 successor change". PLAN.md:176 would drop it.
- A stamped entry left at `reopen` passes `eval:qa:register -- --check` (`register-helper.mjs`
  `updateRegister` reports no change), and no lint reads the verdict. So an open entry is legal
  in CI.

Change:

- `sibling-check.mjs --run <item>` derives its pool from the register: every entry that holds an
  edited case. It takes a pattern set per run (Bell; Software Versions release strings; SCF round,
  phase and deadline).
- A non-zero count no longer stops the run. The lead merges its verified edits, leaves that entry
  at `reopen` with the count in the report, and alerts. "Stop and ask" (PLAN.md:106-107) has
  nobody to ask.
- PRESTAGE.md lists the reopened entries per run and, per entry, the fields to hand-edit before
  the review (invariant `authoritativeValue`, `rule`, `acceptedSpellings`, `evidence`,
  `datePolicy`; cluster `note`). It says every quoted `reverifyBy` in a trap must equal the case,
  in 2.1, 2.2a and 2.2c alike. The new Bell trigger keeps the AddressV2 clause.
- Decide now, while the orchestrator is present, whether a scripted count is enough for the
  members of the Bell and SCF traps that the lane may not open. `golden-truth` §5 and the trap's
  own `requiredRecheck` ask for a re-verification of every member when the trigger passes. Record
  the answer in QUESTION.md. The alternatives are a further amendment before 11-23 or leaving
  those two traps open after the runs.

### 7. One sibling the lane may open states the pending state in its answer, with no staged edit

Evidence: `q-pc-quantum-preparedness-dormant`, `golden.answer`: "CAP-0087 ML-DSA, in Bell/Protocol
30, not yet on Mainnet as of 2026-11-14". Its notes carry no "accept a later dated state" clause,
and it has no `reverifyBy`, so nothing else will catch it. PLAN.md:148-173 stages edits for four
cases only.

Change: stage the outcome A edit for that clause (a gospel change with its own evidence rows), and
add its register entries to finding 6. For `q-protocol-ledger-close-time` and
`q-zk-host-functions-status`, record "no judge-facing change" with the reason: their Bell mentions
are dated or structural, and the pending text is in judge-blind `truth.notes`, which the run
refreshes.

### 8. Gaps in the edit per case

- **History list.** PLAN.md:165 says "append". The answer also opens with "As of 2026-11-14
  Mainnet runs Protocol 29" and ends with "Bell (P30) is on Testnet with its Mainnet vote
  scheduled for 2026-11-23". Stage all three spans, and a corroboration row for the P30 line.
- **Quantum.** PLAN.md:170 says "Notes" without naming the field. `golden.notes` is already
  durable ("Accept later sourced developments, including Bell … and a sourced Mainnet
  activation"). The pending text is in `truth.notes`. Edit `truth.notes`, `truth.asOf`,
  `truth.verified`, a corroboration row and the sentinel; leave `golden.*` unchanged, so there is
  no gospel change.
- **Upgrade timing.** "None is announced as of <date>" is a negative claim (`golden-truth` §3:
  absence from primary records plus a web sweep). The status page is not a complete record: its
  last 50 maintenances hold no Mainnet row for Protocol 27 or 29, and vote names vary ("X-Ray
  Mainnet Upgrade Vote", "Mainnet Adapter, Protocol 28 Upgrade Vote"). Name the records to check:
  the status feed, the SDF blog's upgrade guides, the `stellar-core` releases and pre-releases,
  and one web search. Replace the removed vote sentinel with an `absent` one on `upcoming.json`
  (pattern on `Upgrade Vote|Mainnet[^"]*Upgrade`, guard on `"scheduled_maintenances":`), so an
  announced vote fires before the quarter date.
- **Software Versions.** When the page lags, "grade against the GitHub release set"
  (PLAN.md:198) leaves the Rust SDK and CLI pairing to judgment. Name the Bell upgrade guide as
  the class A source and GitHub as class B. Add a sentinel in each outcome (`present` on the
  "Protocol 30 (Mainnet" heading, or `absent` with a guard on the Protocol 29 heading); the case
  has none today. Resolve the date conflict now: `.agents/TODO.md:467-471` and the round plan say
  to file on or after 12-01, and 2.2a runs on 11-30. Add the improvements gates to 2.2a
  (`npm run improvements:lint`, `npm run improvements:index`); the cap lint needs the finding at
  `verified` or later in the same commit (`lint-corpus.mjs:554-579`).
- **SCF.** Add the Scout feed (`https://stellarlight.xyz/api/rfps?status=open`, keyless, 200
  today) and the SCF #46 round page to `probe.mjs --scf`: the awards index alone is one class and
  shows no Panel Review dates. Stage key fact 2, which pins "(SCF #46, Initial Review)".
- **Every edited case.** A changed `truth.asOf` needs `caseAsOf` on each of its sentinels, or
  `npm test` fails (`test/source-sentinels.test.mjs:185-187`). `q-scf-current-round` has three.
- **TODO.** Each run updates its own bullet (`.agents/TODO.md:395-400` for Bell, `467-471` for
  Software Versions).

### 9. Nothing outside the lead notices a lead that stalls, and the only alert path may be dead

Evidence: the launcher exits after about two minutes. The 6-hour deadline guard is the lead's own
(PLAN.md:250), and a lead blocked in `gh pr checks --watch`, out of quota, or waiting on a child
has no clock. Alerts go by `hc send` to `t40j` only (`launch-dated-lead.sh:31`), and PLAN.md:217
allows that the orchestrator is gone. The launcher counts `done` as success (line 68); in the test
that was a nine-second task, but a real lead that is `done` inside two minutes has refused, hit a
limit, or asked a question.

Change:

- One model-free watchdog timer per item, 8 hours before the deadline: `git fetch`, read each of
  the item's cases from `origin/main:eval/qa/cases.json` with `jq`, and alert if any `reverifyBy`
  is not later than the due date.
- A second alert channel that needs no `hc`: `gh issue create` in this repository, assigned to the
  owner, used by the watchdog and by the launcher's `fail`.
- In a real run, `done` within the two-minute window logs the screen, writes the FAILED file and
  alerts.

### 10. Launcher hardening for a late merge and a reboot

Evidence:

- The brief check runs after `git worktree add` (lines 49-51). If PR 1.4 merges late, the first
  failure leaves a worktree and a branch, and every re-run then fails at line 47.
- `systemctl --user list-unit-files network-online.target` lists nothing, and the installed
  service shows empty `After=` and `Wants=`. A catch-up fire at boot can run before the network is
  up, and `git fetch` then fails once with no retry.
- The four timers were armed at 02:21 UTC, before this review, against the unreviewed launcher.

Change: test the brief with `git cat-file -e origin/main:<path>` before creating anything. Split
failures into retryable (fetch, brief missing: exit 1) and final (after `hc run`: exit 75), and set
`Restart=on-failure`, `RestartSec=20min`, `RestartPreventExitStatus=75` and a start limit on the
service, so a late merge or a slow network heals itself. Drop the two `network-online.target`
lines. Reinstall the launcher and units after these changes and record the new `list-timers`
output.

### 11. The real launch path has never run

Evidence: TIMER-TEST.md used `RAVEN_DATED_TEST=1`, which skips fetch, worktree and brief
(`launch-dated-lead.sh:41-44`). No timer-born lead has run `npm ci`, pushed, or started a child.
The first real execution is the unattended one on 11-23.

Change: after PR 1.4 merges, one rehearsal through the real path with a harmless brief on `main`
(`dated/rehearsal-LEAD.md`): `npm ci`, `git push --dry-run`, `gh pr list`,
`npm run eval:qa:sentinels -- --check`, start one Fable child and one Codex child that each report
a line, `schedule-followup.sh` for a time two minutes ahead and its removal, then report. No edit,
no pull request. Budget: about 15 minutes of one Opus session.

### 12. Fewer runs do the same job

- Fold the quantum case into 2.1 in every outcome. Its sentinel is the same Horizon anchor, and by
  finding 8 its outcome A edit is judge-blind.
- In B or X, 2.1 extends all five Bell-dependent cases to one date and schedules one follow-up.
  PLAN.md:192 would otherwise have 2.2a and 2.2b each repeat the extension.
- Put the "already done" test in the launcher, before any model starts, and key it on
  `reverifyBy` alone: every case of the item is later than its due date on `origin/main`. An
  extension leaves `truth.verified.date` unchanged, so the test at PLAN.md:222-223 would miss it.
  2.2b then normally ends in the launcher at no cost.

Spend lines for every brief:

- Never run `npm run eval:qa:selftest` (the paid judge self-test; the gate is the offline
  `eval:selftest`), `npm run eval:qa`, or any `eval:qa:paired:*` command.
- Do not re-judge stored rows (`golden-truth` §6 asks for it when a stored decision depended on the
  golden). Record instead that stored verdicts on these ids predate the change.
- Class D evidence comes from the CLI's built-in web search only. No `parallel-cli`, no metered
  research tool.

### 13. The erosion count measures the wrong field

Evidence: `amend-split.mjs:33` and PLAN.md:30 count `tags.freshness === "scheduled"`. Two of the
five moved cases are `freshness: "live"` with a `reverifyBy`
(`q-edge-fresh-latest-protocol-version`, `q-pc-protocol-upgrade-timing`). Exposure follows
`truth.reverifyBy`, so 64 undercounts, and the v5 note calls all five "scheduled".

Change: leave v5 as written. In the TODO owner-decision bullet, give the count of cases outside
tuning that carry any `reverifyBy` (a count-only script of the same shape), say that the v5 note's
"scheduled" means "has a `reverifyBy`", and state the date the question returns: 2027-01-14
(PLAN.md:21).

## Nits

14. `probe.mjs --protocol`: filter maintenances on `/upgrade/i`, not "Protocol Upgrade", which
    misses three of the last five upgrade rows. Read GitHub through `gh api`; the anonymous API
    allows 60 requests an hour per address.
15. `gh pr checks <n> --watch` can return before any check registers. Use `--required` and retry
    while it reports no checks.
16. Key fact 3 of the upgrade-timing case as staged (PLAN.md:160) repeats key fact 1 when no vote
    is announced. A durable form: "States that SDKs must support a new protocol before that
    network's upgrade vote."
17. PLAN.md:118 keeps "plus any later case that verifies the same day". After finding 12, say
    which: quantum always, Software Versions only when the page already lists Protocol 30.

Verdict: revise before execution. The timer mechanics are sound, but findings 1 to 5 must change first, because as written an unattended run can merge a false "did not activate", go red on a renamed sentinel, commit set membership, fail its own follow-up, or merge past a red check.
