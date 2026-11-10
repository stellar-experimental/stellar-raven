# Independent golden review — truth maintenance 2026-11-10

Reviewer: Claude Fable 5.2 (high), independent of the Codex author lane and the Opus orchestrator.
Subject: uncommitted diff on `8e58f7a8` in `/private/tmp/claude-501/raven-wt/gold1110` (15 files).
All live reads below were made by me on 2026-11-10 between 23:05 and 23:25 UTC. I edited no
repository file; this report is the only file written.

## Verdict: approve with required fixes

Every judge-facing fact in the ten cases re-derives correctly from the primary sources. No golden
states something false today, and no avoid clause punishes a true claim. The required fixes are
all about what happens next: the diff moves `reverifyBy` past three known events and leaves the one
SCF event that flips the answer without an anchor.

| # | Severity | Finding | Where |
| --- | --- | --- | --- |
| R1 | High | Bell-vote `reverifyBy` dates moved from 2026-11-24 to Jan/Feb 2027; lint-enforced trap pairing removed | three protocol cases, register trap |
| R2 | High | No sentinel fires when a new SCF round is listed | `source-sentinels.json` |
| R3 | Low | Two proposals' `reverifyBy` now sit after the December 16 Testnet reset | two proposed cases |
| R4 | Medium | One corroboration row cites a source that does not say what the claim says, and hides its provenance | two RFP cases |
| R5 | Low | The #47 web-sweep queries exist only in ignored `tmp/` | two round cases |
| R6 | Low | Two status-incident URLs in the author's report do not resolve | `tmp/gold-report.md` |

## Required fixes

### R1 — restore the post-vote `reverifyBy` dates

- **Files and fields.** `truth.reverifyBy` in
  `eval/qa/corpus/battery/protocol-core/q-pc-protocol-upgrade-timing.json` (now `2027-02-09`),
  `eval/qa/corpus/battery/edge-behavior/q-edge-fresh-latest-protocol-version.json` (now `2027-01-26`),
  `eval/qa/corpus/battery/protocol-core/q-protocol-version-history-list.json` (now `2027-02-16`);
  `eval/qa/consistency-register.json` → `dateContingentTraps.entries[0].disposition`.
- **Problem.** At HEAD all three carried `reverifyBy: 2026-11-24`, and the trap disposition named
  them ("q-protocol-version-history-list reverifyBy 2026-11-24, q-pc-protocol-upgrade-timing
  reverifyBy 2026-11-24, and q-edge-fresh-latest-protocol-version reverifyBy 2026-11-24"). The
  `date-trap` lint lane checks that sentence against `truth.reverifyBy`, so the pairing was
  enforced. The diff pushes the dates 9–12 weeks past the vote and deletes the sentence. The
  author's report does not mention this.
- **Why sentinels are not enough.** The new sentinels do fire (see "Sentinel behavior"), but a
  sentinel is a trigger with a failure mode: an unreadable source is `error`, not `drift`, and
  opens no issue (`golden-sentinels.yml`: "No drift and no open issue"). The stale gate is the
  only deterministic mechanism. The statement "the next announced Mainnet vote is November 23"
  expires at 17:00 UTC on that day whatever the outcome, so a date is the right tool.
- **Stale answers are rewarded until re-verification.** After the vote, "next vote is November 23"
  and "Pubnet runs Protocol 29" both match the dated example. Only the judge's own knowledge would
  catch them.
- **Side effect.** After the diff, no battery case has a `reverifyBy` between 2026-11-10 and
  2027-01-04. The stale queue is empty across the vote, the SCF #46 phases, and the Testnet reset.
- **Fix.** Set `truth.reverifyBy` to `2026-11-24` on the three cases (the HEAD values). Append to
  the trap disposition: "q-protocol-version-history-list reverifyBy 2026-11-24,
  q-pc-protocol-upgrade-timing reverifyBy 2026-11-24, and q-edge-fresh-latest-protocol-version
  reverifyBy 2026-11-24." Rerun `eval:qa:compile`, `eval:qa:register`, and the lint. A
  `reverifyBy`-only change needs no new `truth.verified` evidence.

### R2 — add an anchor for a new SCF round

- **File.** `eval/qa/source-sentinels.json`.
- **Problem.** The golden's main claim is "no Build Award round in Submission; no #47 date". No
  anchor tests it. I ran the three SCF anchors against the live awards page with a synthetic
  "SCF #47 Submission Deadline to submit: February 7, 2027" row inserted: `scf-46-initial-review`,
  its edge twin, and `scf-45-ended` all still hold. The #46 anchor fires only on a #46 phase label
  change, and each re-authoring ("Panel Review", "Community Vote", "Ended") keeps the gap.
- **Evidence for timing.** The awards index lists "SCF #40 … November 9, 2025" then "SCF #41 …
  February 8, 2026". The same cadence puts a #47 submission window before the two round cases'
  `reverifyBy` dates (2027-02-04 and 2027-02-11).
- **Fix.** Add two sentinels (I tested the check: holds live with 0 matches, drifts with a #47 row):

```json
{
  "id": "scf-47-not-listed",
  "caseId": "q-scf-current-round",
  "caseAsOf": "2026-11-10",
  "url": "https://communityfund.stellar.org/awards",
  "check": {
    "kind": "absent",
    "pattern": "SCF #47\\b",
    "guard": "SCF #46 [A-Za-z ]+ Deadline to submit: November 9, 2026"
  }
}
```

  and the same check as `scf-47-not-listed-edge` for `q-edge-fresh-latest-scf-round`. Confirm both
  live with `npm run eval:qa:sentinels -- --ids scf-47-not-listed,scf-47-not-listed-edge`.

### R3 — proposals: `reverifyBy` after the December 16 reset

- **Files and fields.** `truth.reverifyBy` in
  `eval/qa/corpus/proposed/tooling-infra/q-infra-testnet-reset-schedule-recovery.json`
  (HEAD `2026-12-02`, now `2027-02-25`) and
  `eval/qa/corpus/proposed/soroban/q-sor-reflector-testnet-contract-addresses.json`
  (HEAD `2026-12-09`, now `2027-03-02`).
- **Problem.** The Networks page still lists December 16, 2026 and says a reset clears "smart
  contract data". The reset case asks about a December 2026 demo, and its own evidence line says
  "Recheck the schedule before any December use or activation". The Reflector case pins three
  Testnet contract IDs that the reset clears. Proposals are outside the stale gate and cannot have
  sentinels, so the date is their only signal.
- **Fix.** Reset case: `2026-12-02` (the day the two-week advance notice is due). Reflector case:
  `2026-12-17`.

### R4 — RFP cases: one corroboration row overstates its source

- **Files and fields.** `truth.corroboration[]` and `truth.sources[]` in
  `eval/qa/corpus/battery/scf-grants-builders/q-scf-open-rfps.json` and `q-scf-rfp-tooling.json`:
  the class-D row with ref
  `https://github.com/Stellar-Light/awesome-stellar-community-fund/blob/main/docs/rfp-response-guide.md`.
- **Problems.**
  1. The claim "Eligible teams start with the interest form, then submit a full proposal … if
     invited" is marked `confirmed` on the handbook plus this guide. The guide contains neither
     "interest" nor "invit" anywhere. It supports only the current-quarter open-RFP rule (its
     lines 24 and 209).
  2. The note calls it a "separate community guide". The repository description reads "Created by
     LumenLoop; maintained by Stellar Light". Stellar Light operates Scout. The guide was last
     pushed 2026-07-23, so it says nothing about the Q4 roster.
  3. The same row's note opens with "The independent web sweep … found no newer published SCF
     brief". The ref does not evidence a sweep.
- **Fix.** Rewrite the guide row's note to: "Maintained by Stellar Light, the Scout operator;
  created by LumenLoop; last pushed 2026-07-23. Restates the handbook's current-quarter open-RFP
  requirement. Not independent of Scout or the handbook. No evidence for the Q4 roster or the
  invitation flow." For the interest-form claim, add a second source that states the flow: class A
  `https://communityfund.stellar.org/awards` ("Teams start by submitting an interest form … The
  interest form is always open, and forms are reviewed on a rolling basis") or class D
  `https://grants.watch/programs/stellar-community-fund-build-award?awardPage=2` ("takes full
  proposals by invitation after the interest form"; cites SCF). Keep the sweep statement only in
  `truth.verified.evidence`, where the queries already are.

### R5 — record the #47 sweep in the round cases

- **Files and field.** `truth.verified.evidence` in `q-scf-current-round.json` and
  `q-edge-fresh-latest-scf-round.json`.
- **Problem.** "No #47 submission date" is a negative claim. The skill requires an explicit web
  sweep a stranger can re-walk. The queries are only in `tmp/gold-report.md`, which is ignored.
- **Fix.** Add: "Dated web sweep queries: \"SCF #47\" \"Stellar Community Fund\" November 2026;
  Stellar SCF 46 Initial Review November 2026 SCF 47 submission period next. No dated #47 schedule
  surfaced." The RFP cases already carry the equivalent line.

### R6 — report-only: two status URLs do not resolve

- **File.** `tmp/gold-report.md`, items P8 and P13 and the first upstream candidate.
- **Problem.** `https://status.stellar.org/incidents/gwdkf8rzcdlx` and `…/incidents/qgql0kmg7xvk`
  redirect to the status home page. Those are shortlink codes, not incident IDs.
- **Fix.** Use `https://status.stellar.org/incidents/4p75xxpd0kkv` (Bell Testnet upgrade,
  completed 2026-11-03T17:05:18Z) and `https://status.stellar.org/incidents/w33m5pjv2q6d`
  (Mainnet vote), or the shortlinks `https://stspg.io/gwdkf8rzcdlx` and
  `https://stspg.io/qgql0kmg7xvk`. No case file carries the broken URLs. Correct them before the
  round ledger or an upstream filing copies them.

## Recommended, not blocking

- **S1. `q-scf-current-round` and edge twin, `golden.keyFacts[2]`.** "Reports the applicable
  submission deadline when published" is ambiguous when no round is open. Suggested: "Reports the
  open round's submission deadline when one is published; with no round open, says no upcoming
  deadline is published."
- **S2. `q-pc-protocol-upgrade-timing`, `golden.keyFacts[0]`.** After November 23 no vote may be
  announced. Suggested: "Identifies the next announced vote for the relevant network, or says none
  is announced as of the source date." R1 makes this a post-vote edit rather than a blocker.
- **S3. `q-hist-quantum-preparedness-plan`.** `reverifyBy` moved from `2026-12-01` to
  `2027-02-23` while `golden.notes` says "Pubnet still runs P29 and the Bell Mainnet vote is
  scheduled for 2026-11-23". Restore `2026-12-01`, and add "Accept a later sourced Mainnet
  activation" to the notes, as the history case has.
- **S4. SCF round cases, `truth.reverifyBy`.** With R2 in place the February dates are a
  defensible backstop, but they land near the likely #47 deadline. Consider `2026-12-04` for
  `q-scf-current-round` (the day after the published Community Vote close) and early January for
  the edge twin.
- **S5. The #46 anchor will drift almost immediately.** The round record schedules Panel Review
  for November 11–18. `scf-46-initial-review` and its twin drift on that label change, then again
  at Community Vote (November 23) and at Ended. The register asks for a recheck at each phase, so
  this is by design; expect #406 to re-fire within a day or two of merge. A phase-agnostic anchor
  (`SCF #46 (?!Submission\b)[A-Z][A-Za-z ]+ Deadline to submit: November 9, 2026`) plus R2 would
  cut three alarms that do not change the answer.
- **S6. Register, "Mainnet protocol activation history" rule.** The rewrite dropped "a dated later
  answer that reports P30 as current is correct". Restore it.
- **S7. Stale dated notes to refresh when the clusters are closed.** Cluster notes 081 and 122
  still describe #46 "in Submission through November 9" and a synthetic round row; 025, 067, and
  120 still say the Testnet vote is scheduled. Four `-live` siblings (`q-scf-open-rfps-live`,
  `q-scf-passkey-rfps-live`, `q-scf-rfps-hackathons-live`, `q-scf-contract-verification-rfp-live`)
  carry the same November 5 sentence in `golden.notes`, and `q-infra-testnet-vs-futurenet` notes
  record Testnet at Protocol 29 on November 2. All are dated and none is a trap, so they do not
  contradict the changed cases. They have no `reverifyBy`, so nothing will refresh them.
- **S8. Class labels.** `mainnet.sorobanrpc.com` is class C in the November 3 rows and F in the
  November 10 rows of the same file. Pick one.

## Per-case re-derivation

| Case | Result | What I read |
| --- | --- | --- |
| `q-scf-current-round` | Facts confirmed. R2, R5, S1, S4. | Awards index: "SCF #46 Initial Review Deadline to submit: November 9, 2026"; #45 and #44 Ended; no "#47" anywhere. Round record: "Build Submission TBD - November 9, 2026", Panel Review November 11–18, Community Vote November 23–December 3, notification "TBD - TBD". Scout `meta.scfRound`: round 46, Initial Review, `submissionWindow` null, `syntheticRounds` 0. grants.watch: "Next deadline None announced". |
| `q-edge-fresh-latest-scf-round` | Same golden, same result. | Same sources. |
| `q-scf-open-rfps` | Facts confirmed. R4. | Handbook: "October 2026: New Q4 RFPs are coming soon" with two "Coming Soon" placeholders. Latest path commit `e07b4bfc`, 2026-10-16T18:20:46Z. Scout: open 0, closed 16, `layerzero-dvn` and `x402-facilitator-bazaar` closed in q3-2026. |
| `q-scf-rfp-tooling` | Facts confirmed. R4. | Same, plus handbook "must address an open RFP from the current quarter" and "Eligible teams will be invited to submit to an upcoming Build round". |
| `q-edge-fresh-latest-protocol-version` | Facts confirmed. R1. | Horizon Pubnet `current_protocol_version` 29, supported 30, ledger 65413176 at 23:05:22Z. Mainnet RPC `protocolVersion` 29. Ledger 64717644 is P28, 64717645 is P29 at 2026-10-01T17:00:07Z. |
| `q-pc-protocol-upgrade-timing` | Facts confirmed. R1, S2. | Bell guide: "November 3, 2026, 1700 UTC — Testnet upgrade vote. November 23, 2026, 1700 UTC — Mainnet upgrade vote"; SDK "before November 3" and "before November 23"; "an older SDK may fail to decode Protocol 30 ledgers". Status API: vote `scheduled` for 2026-11-23T17:00:00.000Z; Testnet upgrade `completed`. Testnet Horizon and RPC report 30. CAP-0088: new `STELLAR_VALUE_SIGNED_MS` and `STELLAR_VALUE_EMPTY_TX_SET_MS` arms with `closeTimeMs`; whole-second `closeTime` unchanged. |
| `q-protocol-version-history-list` | Facts confirmed. R1. | Software Versions headings give the Mainnet dates for P20–P29 as stated. P27, P28, P29 boundary ledgers match. Core v30.0.0 (published 2026-10-16) names CAP-0084, CAP-0087, CAP-0088. |
| `q-hist-quantum-preparedness-plan` | Answer unchanged and confirmed; notes confirmed. S3. | Plan: Stage 1 "ML-DSA-44 and ML-DSA-65", Stage 2 opt-in migration (2027), Stage 3 timing "determined by the threat"; page date 2026-06-09. Bell overview: "a native post-quantum signer for classic accounts will come in a future protocol change". CAP-0087: Implemented, Protocol 30, three parameter sets. |
| `q-infra-testnet-reset-schedule-recovery` (proposed) | Facts confirmed. R3. | Networks: "December 16, 2026"; "typically happen 2-4 times per year at 17:00 UTC"; resets clear accounts, trustlines, offers, contract data, transactions, history. Packages runbook: "always occur at 09:00 UTC". Status upcoming list has no reset entry. Triport: "the next reset is 16 December 2026", checked 2026-10-24, attributed to Stellar docs. |
| `q-sor-reflector-testnet-contract-addresses` (proposed) | Facts confirmed. R3. | Oracle Providers lines 78–80 list the three IDs as Testnet. Reflector config: `network` testnet; `CAVLP5…6HLP` → pubnet, `CCYOZJ…RN63` → exchanges, `CCSSOH…NV4W` → forex. I did not re-run the CLI interface read. |

Later-answer check. Each changed golden accepts a later sourced state ("Accept a later sourced
opening, phase, or deadline", "Accept a later dated status or reschedule", "Accept a later sourced
Mainnet activation", "Accept newer dated observations"). No avoid clause would penalize "Protocol
30 is live on Mainnet" or "SCF #47 is open". The removed traps ("say no round is in Submission",
"claim syntheticRounds=0") were correct removals: both claims are now true. The stale-answer
exposure is covered under R1 and R2.

## Sentinel behavior

I ran each new anchor against the live body, then against the body mutated for the event.

| Sentinel | Live | Event simulated | Result |
| --- | --- | --- | --- |
| `mainnet-protocol-29`, `-latest`, `-history` | hold | `current_protocol_version` 30 | drift |
| `bell-mainnet-vote-scheduled` | hold | entry leaves `upcoming.json` when the vote starts | drift |
| `bell-mainnet-vote-scheduled` | hold | vote rescheduled to another date | drift |
| `scf-46-initial-review`, `-edge` | hold | #46 label becomes Panel Review | drift |
| `scf-46-initial-review`, `-edge`, `scf-45-ended` | hold | new #47 Submission row added | **hold (gap, R2)** |
| `scf-rfp-q4-roster`, `-tooling-roster` | hold | a named brief replaces a placeholder | drift |

The workflow runs daily at 07:17 UTC, so a 17:00 UTC vote surfaces the next morning. An explicit
earlier `reverifyBy` is needed for the three protocol cases (R1).

## Gospel-change discipline

- `truth.verified` has a date, author, evidence, and `rootCause: ["freshness-drift"]` on all ten.
  The diff-aware lint passes.
- Every source and corroboration row added today carries `observedAt: 2026-11-10`. Undated rows
  are pre-existing "class inferred at migration" entries.
- Independence is labeled honestly for the SCF round state: the Scout and grants.watch rows both
  say they cite the SCF site. That fact has one authority, and the rows do not pretend otherwise.
  The exception is R4.
- New dates are staggered weekly from 2027-01-26 to 2027-03-02 with no two alike. No wall. The
  problem is their distance from known events, not their spacing.
- Generated artifacts: `cases.json` changes exactly the eight battery cases, compiled goldens equal
  the case files, sample membership is identical, and no ID was added or removed.

## Consistency register

- 22 clusters, two invariants, and two traps are reopened by member-content change. None was
  self-closed by the author. The two entries re-swept on 2026-11-10 (017 and 065) are from #408.
- The author's sweep reasons hold. I scanned every unchanged battery case for Bell, Protocol 30,
  and SCF submission-state statements. All are dated, and none is an avoid clause that punishes a
  now-true claim.
- The "SCF Submission" invariant and SCF trap disposition match the live state. The Bell trap
  disposition needs the R1 sentence. The protocol invariant needs S6.
- Closure is the orchestrator's. Refresh the notes listed in S7 when closing.

## Gates I ran

| Command | Exit | Result |
| --- | --- | --- |
| `npm run eval:qa:register -- --check` | 0 | "up to date" |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 errors, 81 warnings |
| `npm run eval:qa:lint -- --since HEAD --stale --enforce-floors` | 0 | 0 errors, 81 warnings |
| `npm run eval:qa:sentinels -- --check` | 0 | 31 sentinels, 0 errors, 0 stale |
| `npm run eval:qa:sentinels -- --ids` (the nine touched IDs) | 0 | all nine hold, one match each |

I did not run `npm test`, `eval:qa:compile` (it writes), any paid eval, or any QA answering run.

## Upstream candidates

- Confirmed: Software Versions has no Protocol 30 entry while Testnet runs 30.
- Confirmed: Networks says 17:00 UTC is typical; the linked packages runbook says 09:00 UTC always.
- New, for routing: on `https://communityfund.stellar.org/awards` the "SCF Dashboard" link in the
  interest-form paragraph points to `/redirect?url=http%3A%2F%2Flocalhost%3A8080%2Fdashboard`.

## Sources I fetched

`communityfund.stellar.org/awards` and `/awards/recxrSMYwAl8vcglg`;
`stellarlight.xyz/api/rfps?status=open` and `?status=closed` (cached, `generatedAt` 22:51:22Z);
`stellar.gitbook.io/scf-handbook/scf-awards/build-award/rfp-track.md`;
`api.github.com/repos/stellar/scf-handbook/commits?path=…/rfp-track.md`;
`horizon.stellar.org/`, `/ledgers?order=desc&limit=1`, and ledgers 63386818–19, 64458445–46,
64717644–45; `horizon-testnet.stellar.org/` and its latest ledger; `mainnet.sorobanrpc.com` and
`soroban-testnet.stellar.org` (`getNetwork`, `getLatestLedger`);
`status.stellar.org/api/v2/scheduled-maintenances/upcoming.json` and `/scheduled-maintenances.json`,
plus the four incident URLs in R6; `stellar.org/blog/developers/bell-protocol-30-upgrade-guide` and
`/introducing-bell-protocol-30-on-stellar`;
`stellar.org/blog/foundation-news/introducing-the-quantum-preparedness-plan`;
`developers.stellar.org/docs/networks.md`, `/networks/software-versions.md`,
`/validators/admin-guide/network-upgrades.md`, `/data/oracles/oracle-providers.md`;
`raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0087.md` and `cap-0088.md`;
`api.github.com/repos/stellar/stellar-core/releases/tags/v30.0.0`;
`raw.githubusercontent.com/stellar/packages/master/docs/testnet-reset.md`;
`orchestrator-testnet.reflector.network/config`;
`grants.watch/programs/stellar-community-fund-build-award?awardPage=2`;
`raw.githubusercontent.com/Stellar-Light/awesome-stellar-community-fund/main/docs/rfp-response-guide.md`
and its repository record; `triport.io/tools/chain-config/stellar`.

## Fix verification (second pass, 2026-11-10 23:24 UTC)

**Updated verdict: approve.** Every required fix passes and no required fix remains. I checked
each item against `git diff` and the files, re-read the awards page live, and re-ran the gates.
The worktree still shows the same 15 modified files; I edited none of them.

| Item | Result | What I checked |
| --- | --- | --- |
| R1 | Pass | `truth.reverifyBy` is `2026-11-24` on `q-pc-protocol-upgrade-timing`, `q-edge-fresh-latest-protocol-version`, and `q-protocol-version-history-list`. The Bell trap disposition ends with the three lint-checked `reverifyBy 2026-11-24` references. |
| R2 | Pass | `scf-47-not-listed` and `scf-47-not-listed-edge` exist with the guarded `absent` check. Live: hold, 0 matches. With a synthetic #47 row: drift. |
| R3 | Pass | Reset proposal `2026-12-02`; Reflector proposal `2026-12-17`. |
| R4 | Pass | The guide row's note now states its provenance and that it is no evidence for the roster or the invitation flow. The roster claim no longer cites it. The interest-form claim adds the grants.watch record, with its reliance on SCF stated; that matches what the page says. |
| R5 | Pass | Both round cases carry the two #47 sweep queries and the result in `truth.verified.evidence`. |
| R6 | Pass | `tmp/gold-report.md` cites `4p75xxpd0kkv` and `w33m5pjv2q6d` only. |
| S1 | Pass | Both round cases: "Reports the open round's published deadline or says no upcoming deadline is published." |
| S2 | Pass | "Reports the relevant network's next announced vote or its absence as of the source date." |
| S3 | Pass | Quantum case `reverifyBy` is `2026-12-01`; notes end "Accept a later sourced Mainnet activation." |
| S4 | Pass | `q-scf-current-round` `2026-12-04`; edge twin `2027-01-07`. |
| S5 | Pass | IDs are `scf-46-submission-deadline` and `-edge` again, with the phase-agnostic pattern. See the simulation below. |
| S6 | Pass | The protocol invariant rule ends "A dated later answer that reports P30 as current is correct." |
| S7 | Pass | Cluster notes 025, 067, 081, 120, and 122 describe the 2026-11-10 state. The live sibling cases were left as dated, which is acceptable. |
| S8 | Pass | All six November 10 Mainnet RPC rows are class C. |

Simulation of the changed SCF anchors against the awards page fetched in this pass:

| Mutation | `scf-46-submission-deadline` | `scf-47-not-listed` | `scf-45-ended` |
| --- | --- | --- | --- |
| live | hold | hold | hold |
| #46 → Panel Review, Community Vote, or Ended | hold | hold | hold |
| #46 → back to Submission | drift | hold | hold |
| #46 deadline changed | drift | error (guard) | hold |
| #47 Submission row added | hold | drift | hold |
| #47 added and #46 Ended | hold | drift | hold |
| #46 label with a non-letter ("Prescreen & Panel Review") | drift | error (guard) | hold |

### Gates

| Command | Exit | Result |
| --- | --- | --- |
| `npm run eval:qa:register -- --check` | 0 | up to date |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 errors, 81 warnings |
| `npm run eval:qa:lint -- --since HEAD --stale --enforce-floors` | 0 | 0 errors, 81 warnings |
| `npm run eval:qa:sentinels -- --check` | 0 | 33 sentinels, 0 errors, 0 stale |
| `npm run eval:qa:sentinels -- --ids scf-46-submission-deadline,scf-46-submission-deadline-edge,scf-45-ended,scf-47-not-listed,scf-47-not-listed-edge,scf-rfp-q4-roster,scf-rfp-q4-tooling-roster,mainnet-protocol-29,mainnet-protocol-29-latest,mainnet-protocol-29-history,bell-mainnet-vote-scheduled` | 0 | all 11 hold; the two absence checks have 0 matches, the rest 1 |

Generated artifacts still change exactly the eight battery cases, compiled goldens equal the case
files, and sample membership is identical. I did not run `npm test` or `eval:qa:compile`.

### Notes, not blocking

- **N1. Three unrelated sentinel lines changed bytes.** The fix pass rewrote `✅` as `✅` in
  two patterns and `è` as `è` in one. The parsed file is identical for those entries, and
  only the intended entries differ from HEAD. Restore the three escapes if you want the diff
  scoped to this round; HEAD had no non-ASCII bytes in the file.
- **N2. Phase labels are now watched by date, not by sentinel.** This follows from my own S5. The
  golden text still names Initial Review, and the register asks for a recheck at each phase
  change. Nothing fires on a review-phase label change until `q-scf-current-round` comes due on
  2026-12-04. The draft closure below records this in the SCF trap disposition. A label with a
  non-letter character drifts the #46 anchor and errors the #47 guard, so it is visible.
- **N3. Issue #406 should close by itself.** Its drift set names the two restored IDs, and both
  now hold. The workflow closes the issue on the first clean run after merge.

## Register closure draft

`tmp/register-review.json` closes every entry marked `reopen` with `reopened.date: 2026-11-10`:
22 clusters, two numeric invariants, and two date-contingent traps. I judged all 26 consistent,
so none is left out.

- **Basis.** I re-read the golden of every unchanged member (40 cases) for protocol version,
  activation, round, phase, deadline, roster, and application-flow statements, and compared them
  with the eight changed cases. Each reason names that entry's members and what was compared, and
  cites `.agents/rounds/2026-11-10-truth-maintenance.md`.
- **One field beyond closure.** The SCF trap entry also sets `disposition`: the existing text plus
  a sentence naming the watch mechanisms, including "q-scf-current-round reverifyBy 2026-12-04 and
  q-edge-fresh-latest-scf-round reverifyBy 2027-01-07". The `date-trap` lint lane will then check
  those two dates against the cases, as it does for the Bell trap. Delete the `disposition` key
  from that entry if you do not want the pairing.
- **Validation on a copy.** The real register was not touched.

| Command | Exit | Result |
| --- | --- | --- |
| `node eval/qa/register-helper.mjs --register tmp/register-copy.json --review tmp/register-review.json` | 0 | "updated; 0 reopened" |
| `node eval/qa/register-helper.mjs --register tmp/register-copy.json --check` | 0 | "up to date" |
| `node eval/qa/lint-corpus.mjs --register tmp/register-copy.json --stale --enforce-floors` | 0 | 0 errors, 81 warnings |

  The copy has no `reopen` entry left; the real register still has 26.
- **Order of operations.** Apply the review after the last case edit. Any later change to a member
  case re-stamps its hash and reopens the entry. Reverting N1 does not affect the register.
