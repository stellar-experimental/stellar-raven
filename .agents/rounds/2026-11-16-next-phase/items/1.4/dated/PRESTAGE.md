# Dated golden runs: pre-staged evidence slots and edits

Staged by round item 1.4 on 2026-11-17 from `main` at `d596b36f`. Each dated lead
(`2.1-LEAD.md`, `2.2a-LEAD.md`, `2.2b-LEAD.md`, `2.2c-LEAD.md`) reads this file once and fills the
slots for its run. [PLAN.md](../PLAN.md) is the reasoning and [REVIEW.md](../REVIEW.md) the review
behind it; this file is the spec a lead follows when no orchestrator is awake. Re-check every
quoted fact against `origin/main` and the live source before you edit.

Terms: the run key is `<item><run>` (`2.1`, `2.1r1`); `<key>` below means it. The split file is
`~/backups/gca-2026-11-14-split-v6.json` (SHA-256 `04107a463c462eecb02a64fe0b69fab6cb4a1bc388197c3e3a01107e9350c362`; if `.agents/TODO.md` names a later split in its held-out status, use that one, because `sibling-check.mjs` asserts `TUNING_ROW_COUNT`).
A **dated case** is one of the six below. Evidence classes come from
[`golden-truth`](../../../../../skills/golden-truth/SKILL.md): A official docs and sites, B source code
and repos, C live service APIs (status feed, Scout), D the CLI's built-in web search only, E the Docs
search index, F empirical execution. Horizon and RPC ledger reads are class F, as in the existing rows.

| Item | Cases | Due | Cutoff (stop if CI red or review unreconciled) | Merge deadline |
|---|---|---|---|---|
| 2.1 | `q-edge-fresh-latest-protocol-version`, `q-pc-protocol-upgrade-timing`, `q-protocol-version-history-list`, `q-hist-quantum-preparedness-plan` | 2026-11-24 | 2026-11-24 20:00 UTC | 2026-11-25 00:00 UTC |
| 2.2a | `q-infra-software-versions-current-protocol` | 2026-11-30 | 2026-11-30 20:00 UTC | 2026-12-01 00:00 UTC |
| 2.2b | `q-hist-quantum-preparedness-plan` (normally done by 2.1) | 2026-12-01 | 2026-12-01 20:00 UTC | 2026-12-02 00:00 UTC |
| 2.2c | `q-scf-current-round` | 2026-12-04 | 2026-12-04 20:00 UTC | 2026-12-05 00:00 UTC |

`lintStale` fails a case once its `reverifyBy` is earlier than today in UTC, so a case must merge
before 00:00 UTC on the day after its date. A change to `reverifyBy` alone passes the gospel lint, so
a dated extension is always available.

## 1. Rules every run follows

**Held-out rule for every committed file.** The files you commit are this file's edits, the REPORT,
the pull-request body, the register `reSwept` reasons and the TODO. They:

- name no case as in or out of tuning, beyond the six dated cases and the siblings you edit;
- give no count of cases outside tuning per register entry or per pattern match;
- record only the line `sibling-check.mjs` prints last: "pending-state matches among the cases this
  lane may not open: n".

You may open only the six dated case files, `q-pc-quantum-preparedness-dormant` (2.1 only), and the
ids `sibling-check.mjs` prints to stdout. Never open another file under `eval/qa/corpus/`. Never read
another case's fields from `cases.json` or `sample.json`, and never read the split file, except
through `sibling-check.mjs`. Never commit or paste its id list.

**Write set.** A run may change only:

- its cases and the siblings it edits, under `eval/qa/corpus/battery/`;
- the compiler outputs `eval/qa/cases.json`, `eval/qa/sample.json`, `eval/qa/lifecycle-registry.json`
  and (only when the compiler changes it) `eval/qa/tool-cases.json`. They are never hand-edited:
  `npm run eval:qa:compile` rebuilds them, and even a `reverifyBy`-only extension changes the
  lifecycle registry's content hash;
- `eval/qa/consistency-register.json`;
- `eval/qa/source-sentinels.json`;
- `test/source-sentinels.test.mjs`, with the staged edit in section 5 only;
- `.agents/TODO.md`;
- the round ledger `.agents/rounds/2026-11-16-next-phase.md`;
- its item folder `.agents/rounds/2026-11-16-next-phase/items/<key>/`;
- `improvements/`, in 2.2a only.

**Spend.** Never run `npm run eval:qa:selftest` (the paid judge), `eval:qa`, or any
`eval:qa:paired:*` command. Never re-judge stored rows: record instead that stored verdicts on the
edited ids predate the change. Class D evidence comes from the CLI's built-in web search only: no
`parallel-cli`, no metered research tool, no paid Lumenloop research.

**Merge authority** (orchestrator's answer 2 in [QUESTION.md](../QUESTION.md)).

- May: push your own branch; open one pull request; run `gh pr merge <n> --squash` once all hold:
  `secrets` and `test` are green on the head commit, the re-derivation review is reconciled, you
  have read the full diff, and the diff is inside the write set (the compiler outputs included).
- Never: `--admin` (the token is an admin; branch protection does not bind it); any change to
  protection, rulesets, workflows, `package.json` scripts, or lint or test logic (the staged sentinel
  test edit excepted); a push to `main`; a force push; merging another pull request; a deploy;
  `--no-verify`; weakening a gate to get green.
- Wait on checks with `gh pr checks <n> --required --watch`, and retry while it reports no checks.
- If `main` moves: merge it, re-run compile, register and the gates, then push.
- A red check after two attempts, or a reviewer that cannot run: switch to outcome X in a fresh
  commit. If that is red too, leave the pull request open and alert.
- At the cutoff in the table above, if CI is red or the review is not reconciled: stop, leave the
  pull request open, write the blocker at the top of REPORT.md, and alert.

**Alert and ask.** To alert: `hc send kalepail-c3614nvxph-mbp/t40j '<message>'` (best effort, 90 s
timeout) and `gh issue create -R stellar-experimental/stellar-raven --label dated-golden --title … --body …`
(drop `--label` if it fails; never create a label). To ask a question: `hc send` it, wait 10
minutes, and with no answer take outcome X and record the question. Never guess.

**Report.** Commit `items/<key>/REPORT.md` in the pull request before the merge: outcome, PR URL,
ids edited, evidence rows, each gate's result, register entries closed and left at `reopen` (counts
only), the sibling-check last line, and the reviewer's tier, model, effort and findings. After the
merge write `~/.local/state/raven-dated/<key>-REPORT.md` with the merge commit, run
`hc send kalepail-c3614nvxph-mbp/t40j '<that path>'`, kill and remove your own children, and leave
your worktree.

## 2. Probe and sibling commands

```sh
node .agents/rounds/2026-11-16-next-phase/items/1.4/dated/probe.mjs --protocol --quantum --out <scratch>/probe-1.json
node .../probe.mjs --software-versions       # 2.2a
node .../probe.mjs --scf                     # 2.2c
node .../sibling-check.mjs --run 2.1 --split ~/backups/gca-2026-11-14-split-v6.json   # or 2.2a, 2.2c
```

`probe.mjs` is keyless and prints JSON; a failed section reports `{ok:false,error}` and the rest
still run. [`baseline-2026-11-17.json`](baseline-2026-11-17.json) is the committed result of one run
on 2026-11-17 (Mainnet at Protocol 29, no activation ledger, the vote scheduled for 2026-11-23
17:00 UTC, Software Versions without Protocol 30, SCF #46 in Initial Review with Panel Review
2026-11-11 to 2026-11-18 and Community Vote 2026-11-23 to 2026-12-03). Compare, never copy. Keep
probe output in your scratch folder and quote the rows you need in the evidence table.
`--protocol` reads both Horizon roots, both latest ledgers, both RPC `getLatestLedger`, a bisection
for the first Mainnet ledger L at Protocol 30 or above (from ledger 64717645, a known Protocol 29
ledger), the status feeds' rows matching `/upgrade/i`, the last 10 `stellar-core` releases, and the
Bell upgrade guide's schedule lines (a stellar.org blog page: the Docs inventory does not list it).

`sibling-check.mjs` last line at staging (2026-11-17): run 2.1: "pending-state matches among the cases
this lane may not open: 0"; run 2.2a: "…: 0"; run 2.2c: "…: 1". Re-run it at the start of your run
and quote only that line. A non-zero count never stops a run: the entries that hold such a member
stay at `reopen` (section 6) and the count goes in the TODO.

## 3. Current judge-facing text (from `main` at `d596b36f`)

The lead quotes these in the PR; re-read each case file for the current text before editing.

- `q-edge-fresh-latest-protocol-version`, answer: "As of 2026-11-10, Stellar Mainnet (Pubnet) runs
  Protocol 29, activated on 2026-10-01 at ledger 64717645. Protocol 30 (Bell) has a Mainnet validator
  vote scheduled for 2026-11-23 17:00 UTC. Read a live ledger or network response and date the
  observation, because a validator vote can change the version." Notes: "Example as of 2026-11-10:
  Protocol 29 (activated 2026-10-01), Bell (Protocol 30) Mainnet vote scheduled 2026-11-23 17:00 UTC.
  Accept a newer dated observation; after the vote, Protocol 30 may be correct." `asOf` 2026-11-10,
  `reverifyBy` 2026-11-24; sentinel `mainnet-protocol-29-latest`.
- `q-pc-protocol-upgrade-timing`, answer: "As of 2026-11-14 Mainnet runs Protocol 29 and Bell
  (Protocol 30) is live on Testnet; the announced Mainnet vote is 2026-11-23 17:00 UTC. Validators
  install the matching stellar-core release and arm the upgrade for a fixed UTC time; SCP agreement
  then applies it in-band through the ledger header's upgrades field. It is not a token-holder vote.
  SDKs must be upgraded before 2026-11-23 for Mainnet integrations because CAP-0088 changes the
  ledger-header encoding." Key fact 3: "Gives the SDK upgrade deadline for the network and why
  (CAP-0088 encoding)." `asOf` 2026-11-14, `reverifyBy` 2026-11-24; sentinel
  `bell-mainnet-vote-scheduled`.
- `q-protocol-version-history-list`, answer opens "As of 2026-11-14 Mainnet runs Protocol 29. P19
  2022-06-08 … P29 2026-10-01 a security release with no new CAPs." and closes "Bell (P30) is on
  Testnet with its Mainnet vote scheduled for 2026-11-23." Key fact 1 "Maps each of Protocols 19 to 29
  to its headline feature." Avoid: "Do NOT mis-pair features and versions or call P26, P27 or P28 the
  latest after 2026-10-01." `asOf` 2026-11-14, `reverifyBy` 2026-11-24; sentinel
  `mainnet-protocol-29-history`.
- `q-hist-quantum-preparedness-plan`: `golden.*` is about the June 2026 plan at publication and
  already accepts "later sourced developments, including Bell (Protocol 30, CAP-0087) and a sourced
  Mainnet activation". The pending text is in judge-blind `truth.notes` ("Pubnet still runs P29 and
  the Bell Mainnet vote is scheduled for 2026-11-23"). `asOf` 2026-11-10, `reverifyBy` 2026-12-01;
  sentinel `mainnet-protocol-29`.
- `q-pc-quantum-preparedness-dormant` (2.1 only), answer clause: "(CAP-0087 ML-DSA, in Bell/Protocol
  30, not yet on Mainnet as of 2026-11-14)". `asOf` 2026-11-14, no `reverifyBy`.
- `q-infra-software-versions-current-protocol`, answer: "As of 2026-11-14 Mainnet runs Protocol 29,
  activated October 1, 2026. The developer docs' Software Versions page lists the matching releases:
  Stellar Core 29.0.0, Stellar RPC v29.0.0, Horizon v29.0.0, Rust SDK 28.0.0 and Stellar CLI 28.1.0.
  Protocol 30 releases are already published ahead of a Mainnet vote scheduled for November 23, 2026,
  so re-read the page after any upgrade." Notes carry a "grade against the release set the page lists
  for the then-current protocol" clause. `asOf` 2026-11-14, `reverifyBy` 2026-11-30; no sentinel.
- `q-scf-current-round`, answer: "As of 2026-11-14, the official SCF Awards page lists no Build round
  in Submission. SCF #46 is in Initial Review after its November 9, 2026 submission deadline, and
  SCF #45 is the last concluded round. No SCF #47 submission date is published." Key fact 2: "Names
  the in-progress round and its phase (SCF #46, Initial Review)." `asOf` 2026-11-14, `reverifyBy`
  2026-12-04; sentinels `scf-46-submission-deadline`, `scf-47-not-listed`, `scf-45-ended`.

## 4. Run 2.1: the Bell Mainnet vote

**Evidence slots.** Fill one row per claim; the cells start empty.

| Claim | Class | URL | observedAt | Value or quote |
|---|---|---|---|---|
| Mainnet `current_protocol_version` (Horizon root) | F | `https://horizon.stellar.org/` | | |
| Mainnet protocol (RPC `getLatestLedger`) | F | `https://mainnet.sorobanrpc.com` | | |
| First Protocol 30 ledger L and L-1, with `closed_at` | F | `https://horizon.stellar.org/ledgers/<L>` | | |
| Bell guide schedule line for the Mainnet vote | A | `https://stellar.org/blog/developers/bell-protocol-30-upgrade-guide` | | |
| Status feed row (recorded; proves nothing) | C | `https://status.stellar.org/api/v2/scheduled-maintenances.json` | | |
| `stellar-core` Protocol 30 release | B | `https://github.com/stellar/stellar-core/releases` | | |
| CAP-0084, CAP-0087, CAP-0088 status and headline | B | `https://github.com/stellar/stellar-protocol/blob/master/core/cap-00NN.md` | | |
| Next announced Mainnet vote, or none (outcome A, upgrade timing) | A, C, B, D | feed, SDF guides, releases and prereleases, one CLI web search | | |

**Outcome test.** The test is keyed on the ledger. The status page completes a maintenance by the
clock (the Bell row runs 17:00 to 17:05), so its state proves nothing and is only recorded.

- **A, activated.** All hold: the Horizon Mainnet root reports 30 or above; `probe.mjs` finds L at 30
  with L-1 at 29; a second read path agrees (`/ledgers/L`, or RPC `getLatestLedger`); and a class A or
  B record ties Protocol 30 to this vote (the Bell guide's schedule line with L's `closed_at` at the
  scheduled time, or an SDF announcement).
- **B, not activated.** Both read paths report 29 in two probes at least 6 hours apart, the later one
  after 2026-11-24 00:00 UTC. The text states only the observation: "As of <timestamp> Mainnet still
  runs Protocol 29; Protocol 30 had not activated after the vote scheduled for 2026-11-23 17:00 UTC."
  It gives a new date only from a primary source, and never says "failed" or "cancelled" without a
  primary source that says so.
- **X, uncertain.** Any of: the read paths disagree, Horizon is unreachable, the re-derivation
  reviewer cannot run, or a question to `t40j` got no answer in 10 minutes. Then change
  `reverifyBy` only, update the trap's quoted dates, leave reopened entries open, schedule the
  follow-up and alert. No judge-facing text changes. X never becomes B.

Wait for the second probe with a background `until` loop and `Monitor`, never a foreground sleep.
The first probe of a run that fires at 2026-11-23 18:00 UTC is probe 1.

**Outcome A edits, field by field.** `<date>` is L's `closed_at` date, `<L>` the ledger.

- **Edge case.** `golden.answer`: "As of <date>, Mainnet runs Protocol 30 (Bell), activated <date> at
  ledger <L>." Keep the behaviour clause ("Read a live ledger or network response and date the
  observation, because a validator vote can change the version."). `golden.notes`: update the example,
  and drop "after the vote, Protocol 30 may be correct". Sentinel `mainnet-protocol-29-latest` becomes
  `mainnet-protocol-30-latest` (pattern `"current_protocol_version": ?30\b`, same guard).
- **Upgrade timing.** `golden.answer`: Mainnet runs Protocol 30 since <date>. Then either the next
  announced Mainnet vote with its primary source, or "none announced as of <date>". The second is a
  negative claim: phrase it as of a date and relative to the records checked (the status feed, the
  SDF upgrade guides, the `stellar-core` releases and prereleases, one CLI web search), with a
  corroboration row. Keep the validator and SCP sentence. The SDK sentence and key fact 3 become
  "SDKs must support a new protocol before that network's upgrade vote." Remove sentinel
  `bell-mainnet-vote-scheduled` and add `next-mainnet-upgrade-vote-absent`: an `absent` check on
  `https://status.stellar.org/api/v2/scheduled-maintenances/upcoming.json` with pattern
  `Upgrade Vote|Mainnet[^"]*Upgrade` and guard `"scheduled_maintenances":`. If a vote is announced,
  use a `present` check on it instead.
- **History list.** Three spans change, with a corroboration row for the P30 line: the opening "As of
  …, Mainnet runs Protocol 29" becomes Protocol 30; append "P30 Bell <date> <headline>", the headline
  taken from the release's CAPs (0084, 0087, 0088) at two classes; remove the closing Bell sentence.
  Key fact 1 becomes "Maps each of Protocols 19 to 30 to its headline feature." Add an avoid: "Do NOT
  call P29 the latest after <date>." Sentinel `mainnet-protocol-29-history` becomes
  `mainnet-protocol-30-history`.
- **Quantum case** (judge-blind only, so no gospel change). Edit `truth.notes` (CAP-0087 is on Mainnet
  since <date>; the classic-account signer is still future), `truth.asOf`, `truth.verified` and add a
  corroboration row. `golden.*` stays unchanged. Sentinel `mainnet-protocol-29` becomes
  `mainnet-protocol-30`.
- **Sibling `q-pc-quantum-preparedness-dormant`.** `golden.answer` clause: "CAP-0087 ML-DSA, in
  Bell/Protocol 30, active on Mainnet since <date>". This is a gospel change, so it needs
  `truth.verified` with evidence and `rootCause`. Add `tags.freshness: scheduled` and a `reverifyBy`
  only if the lint requires them for a dated value; otherwise state it without a point-in-time date.
- **Other siblings you may open** (the ids `sibling-check.mjs` prints). Refresh only stale judge-blind
  `truth.notes`. For each, record "no judge-facing change" and the reason (a Bell mention that is
  dated or structural).
- **Software Versions case**: in 2.1 only if the page already lists Protocol 30 for Mainnet;
  otherwise 2.2a. Follow section 5.
- **Every edited case.** Set `truth.asOf`, set `caseAsOf` on each of its sentinels to it, and set the
  new `reverifyBy`, staggered by quarter:

  | Case | New `reverifyBy` |
  |---|---|
  | Software Versions | 2027-02-08 |
  | Edge | 2027-02-15 |
  | Upgrade timing | 2027-02-22 |
  | History list | 2027-03-01 |
  | Quantum | 2027-03-08 |

  An announced Protocol 31 vote moves the affected cases to that date plus 1 day. A gospel change
  needs `truth.verified` (`date`, `by`, `evidence`, `rootCause`: `freshness-drift`) in the same diff.

**Outcomes B and X in 2.1.**

- Extend every Bell-dependent case to one date D: the edge, timing, history, quantum and Software
  Versions cases. B with a primary new date: D = that date plus 1 day. B otherwise, or X: D = the
  run date plus 7 days. Either way D is never earlier than 2026-12-02, so that 2.2a (due 11-30) and
  2.2b (due 12-01) end in the launcher as "already done" and no two runs edit the same case.
- In B the judge-facing wording changes as stated above, for the edge, timing and history cases, each
  with root cause `freshness-drift`. In X nothing judge-facing changes.
- Write the Bell trap's dated extension through `--review` only under the all-or-none closure rule
  of section 6. Otherwise leave it at `reopen`. Either way its quoted `q-… reverifyBy YYYY-MM-DD`
  dates must equal the cases.
- Change the vote sentinel to the new date, or remove it.
- Schedule two follow-ups from `~/.local/share/raven-dated/`, both with due date D, and record the
  `list-timers` output. Let F be `<new vote + 1h | D - 1 day 18:00>`:
  - `schedule-followup.sh 2.1 r1 'F' D`: run key `2.1r1`, this same brief;
  - `schedule-followup.sh 2.2a r1 '<F + 4 hours>' D`: run key `2.2ar1`, the `2.2a-LEAD.md` brief,
    which owns the Software Versions case on D.
  Each follow-up takes D from its task line; its cutoff is D at 20:00 UTC and its merge deadline D+1
  at 00:00 UTC (not the fields in `items.json`; the launcher refuses to start after the cutoff). A
  follow-up run that again ends in B or X extends its own cases once more (run date plus 7 days),
  schedules no timer, and alerts on both channels.
- A follow-up `2.1r1` never edits the Software Versions case; `2.2ar1` does.
- 2.2a (11-30) and 2.2b (12-01) then end in the launcher as "already done", because D is later than
  both of their due dates.

## 5. Runs 2.2a, 2.2b and 2.2c

**2.2a, Software Versions** (the owner's 2026-12-01 merge deadline overrides the TODO's "file on or
after 2026-12-01"). Sources: the page `https://developers.stellar.org/docs/networks/software-versions.md`
(class A), the Bell upgrade guide (class A) and the GitHub releases (class B). First read the
register and the Bell cases on `main`: if 2.1 already merged, its Bell trap edit stands.

| Claim | Class | URL | observedAt | Value or quote |
|---|---|---|---|---|
| Mainnet protocol today | F | Horizon root and RPC | | |
| Heading "Protocol 30 (Mainnet" on the page, and its rows | A | the page | | |
| Release set for Protocol 30 (Core, RPC, Horizon, Rust SDK, CLI) | A, B | Bell guide; releases of `stellar-core`, `stellar-rpc`, `stellar-horizon`, `rs-soroban-sdk`, `stellar-cli` | | |

- **Page lists Mainnet Protocol 30.** Pin the set the page lists, each cross-checked against its
  GitHub release. Add a `present` sentinel (id `software-versions-protocol-30-mainnet`) on the heading
  `Protocol 30 \(Mainnet`, with `caseAsOf` set.
- **Page lags while Mainnet runs Protocol 30.** Re-check the next free `sd-` id. File the TODO-described
  finding under `improvements-pipeline` (the class of resolved sd-008), at `verified` or later in the
  same commit, and post it under owner decision 4 (issues only, no cap, never a pull request). Add the
  canonical-page caution with its cap in the case's `golden.notes` (name the page, state that an
  attributed quote is not a wrong claim, state the cap, name the active finding), and grade against
  the release set the Bell upgrade guide names. Add an `absent` sentinel with a guard on the Protocol
  29 heading (id `software-versions-lacks-protocol-30`, pattern `Protocol 30 \(Mainnet`, guard
  `Protocol 29 \(Mainnet`). Extend by a quarter. Extra gates: `npm run improvements:lint` and
  `npm run improvements:index`.
- **Mainnet still runs Protocol 29.** Extend as in 2.1 outcome B, and say so in REPORT.md.
- **Run key `2.2ar1`** (a follow-up that 2.1 scheduled in outcome B or X). Your due date D comes from
  the task line: your cutoff is D at 20:00 UTC and your merge deadline D+1 at 00:00 UTC. Do the same
  three-state test as above. If you again end in "still Protocol 29" or an uncertain state, extend
  your own case (run date plus 7 days), schedule nothing, and alert on both channels.
- **Register:** cluster-024 and the Bell trap's quoted date.

**2.2b, quantum preparedness case.** The launcher normally finds it done and starts no lead. If you
run, 2.1 did not finish its case: apply the 2.1 quantum edit for the outcome the evidence supports
(outcome A, B or X above), and the Bell register steps in section 6.

**2.2c, SCF current round.** Sources: the awards page (class A), read by `probe.mjs --scf`, plus the independent second class
named below.

| Claim | Class | URL | observedAt | Value or quote |
|---|---|---|---|---|
| Phase and "Deadline to submit" of SCF #46, #45 | A | `https://communityfund.stellar.org/awards` | | |
| "SCF #47" listed or not | A | the same page | | |
| SCF #46 round dates (Panel Review, Community Vote) | A | the page's embedded round data | | |
| Current round and phase (retrieval comparison only: it mirrors the awards page) | C | `https://stellarlight.xyz/api/rfps?status=open` (`meta.scfRound`) | | |
| A newly pinned phase or deadline, from outside the awards page (an SDF or SCF announcement) | D | the CLI's built-in web search | | |
| No "SCF #47" published (negative claim: explicit sweep, dated) | D | the CLI's built-in web search, the SCF handbook, SDF announcements | | |

- Scout mirrors the awards page and is the service under test, so it is a retrieval comparison and
  never a second class. Pin a changed phase or deadline only with a second independent class: an SDF
  or SCF announcement outside the awards page, found by the CLI's built-in web search (class D). Pin
  "no SCF #47" only after an explicit dated web sweep, as a negative claim requires. With no
  qualifying second class, use source-relative wording ("per the official SCF Awards page, observed
  <timestamp>") or extend `reverifyBy` only.
- Pin the observed state of SCF #46 and #47. `golden.answer` and key fact 2: replace "(SCF #46,
  Initial Review)" with the observed phase.
- Rewrite the three sentinels `scf-46-submission-deadline`, `scf-47-not-listed` and `scf-45-ended` to
  the observed page text, and set their `caseAsOf`.
- New `reverifyBy`: the next published phase date plus 1 day, otherwise a quarter after the run.
- **Register:** the SCF #46/#45/#44 trap (disposition, with its quoted `reverifyBy` date equal to the
  case), the "SCF Submission" invariant, and the clusters of section 6.

**Staged test edit** (only when a run renames `mainnet-protocol-29`; this is the one allowed change
to `test/source-sentinels.test.mjs`). The test at "drifts when Mainnet leaves Protocol 29" becomes:

```js
  it("drifts when Mainnet leaves Protocol 30, whatever the release notes call the change", () => {
    const check = byId("mainnet-protocol-30");
    const root = (network, version) =>
      normalize(`{\n  "network_passphrase": "${network}",\n  "current_protocol_version": ${version},\n  "core_supported_protocol_version": 30\n}`, { html: false });
    const mainnet = "Public Global Stellar Network ; September 2015";
    expect(evaluate(check, root(mainnet, 30)).verdict).toBe("hold");
    expect(evaluate(check, root(mainnet, 29)).verdict).toBe("drift");
    expect(evaluate(check, root(mainnet, 300)).verdict).toBe("drift");
    expect(evaluate(check, root("Test SDF Network ; September 2015", 30)).verdict).toBe("error");
  });
```

## 6. Register steps

The edit changes member files, so run `npm run eval:qa:compile`, then `npm run eval:qa:register`
(stamps the changed hashes and reopens entries). Hand-edit the fields below first, then close an
entry with `npm run eval:qa:register -- --review <file>`; a review can set only `verdict`,
`lastChecked` and `reSwept` (a trap review also `triggerDateEvent` and `disposition`). It matches a
trap by its old `triggerDateEvent` text.

| Run | Entries reopened by the edit | Hand-edit before the review |
|---|---|---|
| 2.1 | the Bell date trap; invariant "Mainnet protocol activation history"; clusters 007, 024, 025, 032, 044, 062, 067, 069, 104, 112, 115, 119, 120 | trap `disposition` (a dated line saying the event happened, with every quoted `q-… reverifyBy YYYY-MM-DD` equal to its case) and `triggerDateEvent` ("the next Mainnet protocol vote, any later Mainnet protocol activation, or any AddressV2 successor change": keep the AddressV2 clause); invariant `authoritativeValue` (append "Protocol 30 (Bell) from ledger <L> (<date>)"), `rule`, `acceptedSpellings`, `evidence`, `datePolicy`; each cluster's `note` where it carries a P29 or Bell tail |
| 2.2a | the Bell trap (its quoted Software Versions date); cluster-024 | trap `disposition` quoted date; cluster note |
| 2.2c | the SCF #46/#45/#44 trap; invariant "SCF Submission"; clusters 011, 033, 040, 121 | trap `disposition` and its quoted date; invariant `authoritativeValue`, `rule`, `acceptedSpellings`, `evidence`, `datePolicy` (all pin "SCF #46 Initial Review"); each cluster note (033 states it too) |

The reopened list is whatever `npm run eval:qa:register` prints; the table is what to expect.

**Closure rule** (orchestrator's answer 2 (1), applied all or none so that which entries close
never shows which hold an unreadable member). For one run, check every reopened entry: each member
must be a dated case or an id `sibling-check.mjs` printed.

- If every member of every reopened entry was read in full, close all of them with the neutral
  template below.
- If any reopened entry holds a member you may not open, close none of that run's reopened entries.
  Every one stays at `reopen` (legal in CI) with no `reSwept` written. Record the count of entries
  left open in `.agents/TODO.md`, under "Decide whether golden maintenance may open held-out cases",
  replacing "none recorded yet" with the running count.

State no per-entry reason anywhere. The `sibling-check.mjs` scan is a warning signal only; it never
closes an entry.

**`reSwept.reason` template**, identical in form for every closed entry: "<what changed in the
edited member>; <the entry's subject>; all members read." Name no member as read or unread, and no
count. Set `reSwept.date` equal to `lastChecked` and `verdict` to `consistent`.

## 7. Gates of every run

Run each bare and record a one-line summary in REPORT.md:

- `npm run eval:qa:compile` (commit the regenerated `cases.json`, `sample.json`, `lifecycle-registry.json`
  and, if it changed, `tool-cases.json`; never hand-edit them)
- `npm run eval:qa:lint -- --since origin/main --stale --enforce-floors`
- `npm run eval:qa:register`
- `npm run eval:qa:sentinels -- --ids <changed sentinel ids>`
- `npm run eval:selftest`
- `npm test`
- `npm run secrets:scan -- --tree`

Also `npm run improvements:lint` and `npm run improvements:index` in 2.2a when a finding is filed.
Only the intended cases may change (compare parsed JSON). The independent re-derivation reviewer
([`golden-truth`](../../../../../skills/golden-truth/SKILL.md) section 4) runs after your edit, on the
changed claims only, from live sources and without your notes or the evidence tables above.
