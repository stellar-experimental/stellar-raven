# Results: pack p8 re-measurement

Date: 2026-10-10, 18:17Z to 19:12Z. Operator: Claude Opus 5.5 (lane R author).
Plan: [measurement-plan-p8.md](measurement-plan-p8.md) at `7ab6a3ca`. Pins: [ledger.md](ledger.md).
Authorization: the owner's weekend spend approval, confirmed by the orchestrator after the delta
re-review (R5: CODE-DELTA APPROVE, PLAN-DELTA LAUNCH-OK).
Data: [rejudge-artifacts.json](rejudge-artifacts.json) (12 reused arm-A and 12 new arm-B artifacts,
with SHA-256) and [rejudge-summary-p8.json](rejudge-summary-p8.json) (output of the predeclared
[analyze-rejudge-p8.mjs](analyze-rejudge-p8.mjs)). The artifacts are in the ignored
`eval/qa/results/` folders of `raven-p6-arm` (arm A) and `raven-p8-arm` (arm B).

## Verdict

**BLOCKED. Under the predeclared rules, the p8 result is blocked.**
The mandatory post-run review (R6) confirms this verdict. See "Post-run review (R6)" below.

- Stage 1 passes. The p8 pack shows the support as real spans, and no arm-B vote calls that text
  fabricated or absent.
- Stage 3 passes. No stored-wrong row scores higher in arm B.
- Stage 2 fails on one row. In `q-defi-arbitrage-pathpayment-bots`, all three arm-B votes cite a
  p8 pack source item as a contradiction of the answer. The plan defines that as a pack regression.

The cited item is correct. The saved transcript shows StellarTerm with `status: "Live"`, and the
answer says StellarTerm is "marked Inactive". So p8 showed accurate evidence of a real answer error
that p6 did not show. The predeclared rule does not separate a correct contradiction from a
misreading. A change to that rule needs a reviewed amendment; I did not apply one.

The p7 regression is resolved: the quantum control (`2026-10-07T23-25-14`) no longer reads the pack
as a contradiction. Its panel is P/P/C, not W/W/W.

The mandatory post-run review is [post-run-review/rr6-review.md](post-run-review/rr6-review.md)
(R6, `POST-RUN: CONFIRMED`). I did not review my own run.

## Method completeness

| Check | Result |
|---|---|
| Free preflight (repeated on the run day) | Pins reproduce; both trees clean; 12 of 12 dry runs exit 0; static self-test GREEN in `raven-p8-arm`; replay equals `replay-p8.json` apart from `revisions.p8`; reading script rebuilds all 32 arm-A packs |
| Paid judge self-test | 7 of 7 grades match; 7 costs reported; total $0.2822; runner `36e77d40`, clean |
| Arm-B invocations | 12 of 12, status `successful`, pack `p8`, rubric `v2.11`, panel 3 |
| Arm-B judge calls | 96 of 96, every cost reported; maximum call $0.1967 (limit $0.60) |
| Identity pins | Postflight guard `passed` in all 12 arm-B artifacts; binary `c9b53416…`, environment `ff926b43…`, the same as arm A |
| Arm-A reuse | 32 of 32 arm-A packs rebuild to their recorded hash; same model, rubric, panel, and pins |
| Arm-B packs | 32 of 32 rebuild to their recorded hash |
| Error votes | 1 (S3c, vote 2: consistency violation `core-incorrect-not-wrong`, judge score partial, cost reported); limit is 2 per stage |
| Stop rules | None fired; no file reached its cap |
| Incomplete or unattempted rows | None |

Arm A made no call. Its verdicts are the p6 verdicts from the p7 run. All 32 arm-B verdicts are new.

## Costs

| Item | Calls | Cap | Spend | Max call |
|---|---|---|---|---|
| Self-test | 7 | $3.50 | $0.2822 | $0.0444 |
| S1a | 3 | $0.85 | $0.2758 | $0.0937 |
| S1b | 9 | $2.45 | $1.0763 | $0.1370 |
| S1c | 6 | $1.65 | $0.5300 | $0.0983 |
| S2a | 39 | $10.55 | $3.2841 | $0.1307 |
| S2b | 9 | $2.45 | $0.8664 | $0.1113 |
| S2c | 6 | $1.65 | $0.4946 | $0.1029 |
| S2d | 3 | $0.85 | $0.1787 | $0.0655 |
| S2e | 3 | $0.85 | $0.2994 | $0.1018 |
| S3a | 3 | $0.85 | $0.3254 | $0.1199 |
| S3b | 3 | $0.85 | $0.2550 | $0.0883 |
| S3c | 3 | $0.85 | $0.4305 | $0.1967 |
| S3d | 9 | $2.45 | $0.7861 | $0.1087 |
| **Total** | **103** | **$29.80** | **$9.0843** | |

Stage spend: Stage 1 $1.8821, Stage 2 $5.1231, Stage 3 $1.7970, self-test $0.2822.
These figures round the sum of the raw call costs. An earlier version showed Stage 2 as $5.1232,
the sum of the rounded file figures; R6 corrected it.

## Stage 1: omission rows (6)

Rule: the stage passes on support, not on grade. The p8 pack must show each supported claim as a
real span (the replay shows 12 of 12). Arm B must not call that text fabricated or absent.

| Row | Arm A (votes) | Arm B (votes) | Move |
|---|---|---|---|
| `q-defi-etherfuse-stablebonds` | partial (P P P) | partial (P P P) | same |
| `q-edge-fresh-latest-blend-tvl` | wrong (W P W) | correct (P C C) | up |
| `q-sor-deploy-invoke-from-js-sdk` | wrong (W W W) | wrong (P W W) | same |
| `q-ti-rpc-gettransactions-pagination-xdr` | partial (P W P) | wrong (W W W) | down |
| `q-hist-quantum-preparedness-plan` | wrong (W W P) | wrong (W W W) | same |
| `q-soroban-oz-upgradeable-macro` | wrong (W W W) | wrong (W W W) | same |

- Stablebonds (explicit check): the p8 pack shows "These treasuries often mature in 90 days or
  less." from the record "Etherfuse Aims to Bring 100 Sovereign Currencies Onchain". No arm-B vote
  objects to the maturity claim; all three votes have no wrong claim.
- Support check, recomputed with the span-only diagnostic: arm A has a `pack-omission` vote on 5 of
  6 rows; arm B has none on these rows.
- No arm-B wrong claim calls supported text fabricated. The held `wrong` grades come from golden
  contradictions: "already shipping as protocol" beside a Draft CAP, the retired OpenZeppelin
  derive API, and the `createCustomContract` constructor-argument claim.
- Blend TVL upgrade: the votes cite values the pack shows (`tvlAsOf`, `tvlMethodUrl`, and the
  $100.6M source). This is a repair.
- RPC downgrade: mixed cause. All three votes cite the answer's "Example request shape confirmed in
  the docs" that joins `startLedger` and `cursor`; the golden forbids that combination. All three
  votes also say the docs example in the evidence does not join them. The transcript does not
  support the combined example, so this is not a call against supported text.

**Stage 1: pass.**

## Stage 2: stored-correct controls (20)

Rule: no row may score lower in arm B. A lower score is a pack regression when its rationale cites
p8 pack content, such as a span read as a contradiction or a lost source item.

Result: 14 same, 2 up, 4 down.

| Row | Arm A (votes) | Arm B (votes) | Reading |
|---|---|---|---|
| `q-defi-arbitrage-pathpayment-bots` | correct (C C P) | partial (W P P) | **Pack regression under the rule.** All three votes cite the pack's StellarTerm source item (`status="Live"`) against the answer's "marked Inactive". The transcript confirms `Live`. The p6 pack did not show that item. |
| `q-scf-funding-by-category` | correct (C C C) | partial (P P C) | No p8-specific pack cause. Vote 1 applies the grader-note cap for missing `methodologyVersion` labeling. Vote 2 says the "2026-10-03" snapshot date is not in the evidence; the transcript has it, but neither the p6 nor the p8 pack shows it. |
| `q-hist-quantum-preparedness-plan` (`23-25-14`) | correct (C C C) | partial (P P C) | No pack cause. The partial votes cite the answer's missing ML-DSA-44/65 variants (the answer has generic "ML-DSA"). Vote 3 cites the recovered "immediately" span as support. No vote reads a contradiction. |
| `q-gap-leaderboard-project-not-builder` | correct (C C P) | partial (P P C) | No pack cause. Both partial votes cite the answer's missing ecosystem developer macro block, as in the p7 run. Judge variance. |
| `q-agent-identity-erc8004-stellar` | partial (P P P) | correct (P C C) | Up. Vote 3 says the answer is "consistent with transcript source-basis entries 10-17"; it uses entry numbers as locations, not as source identities. |
| `q-pc-quantum-preparedness-dormant` | wrong (W W W) | partial (P P P) | Up. Dormant-account check: the p8 pack shows the INRIA paragraph ("1,193 logical qubits") as a span from entry 4, record "Introducing the Quantum Preparedness Plan". No vote repeats the false source inference of the p7 run. All three votes cite the answer's "readiness targeted for 2027" for Stage 3. Vote 3 also says the NIST "2030+ to 2029+" detail is not in the evidence; the transcript has it, but neither pack shows it. |

The other 14 rows keep their score. I did not read their rationales in full, although the plan
required every individual rationale in both arms. R6 completed that reading for all rows and both
arms and found no additional blocking pack cause.

**Stage 2: fail (one pack regression under the predeclared rule; the cited evidence is accurate).**

## Stage 3: stored-wrong no-false-upgrade controls (6)

Rule: no row may score higher in arm B. An upgrade that relies on a notice, a label, or an entry
number instead of a span is a pack regression.

| Row | Arm A (votes) | Arm B (votes) |
|---|---|---|
| `q-defi-bridge-evm-to-stellar-axelar` | partial (P W P) | partial (W P P) |
| `q-ti-freighter-localhost-not-detected` | wrong (W W W) | wrong (W W W) |
| `q-sor-force-fast-archival-localnet` | partial (P P P) | partial (P, error, P) |
| `q-scf-verified-members` | wrong (W W W) | wrong (W W W) |
| `q-soroban-sdk-cve` | partial (P P P) | partial (P P P) |
| `q-tool-sdk-repos-discovery` | partial (P W P) | partial (P P P) |

0 up, 6 same, 0 down. No Stage 3 rationale cites `claimSupportNotice` or an entry number.

**Stage 3: pass.**

## Notices and entry numbers

- No arm-B rationale or wrong claim in any stage cites `claimSupportNotice`.
- One arm-B vote mentions entry numbers (`q-agent-identity-erc8004-stellar`, "entries 10-17"), as
  evidence locations. No vote reads an entry number as a source identity.

## Limits

- One panel of 3 per arm per row. No identical-input noise floor exists for panel 3 under `v2.11`.
  Arm A ran on 2026-10-10 at 16:06Z to 17:02Z; arm B ran at 18:20Z to 19:12Z.
- Rows from the two incomplete source files use the current corpus. Both arms read the same content.
- Per review R5, the diagnostic still counts `provenance:` and `(+N more)` counters. This file cites
  no support-check result for a bare-number claim.
- The attribution of each changed score was my reading of the rationales. R6 checked it.

## Post-run review (R6)

[post-run-review/rr6-review.md](post-run-review/rr6-review.md), `POST-RUN: CONFIRMED`.

- R6 confirms the BLOCKED verdict. It rebuilt all 64 packs and all 64 full prompts and matched every
  recorded hash, pin, budget, and panel score.
- R6 read all individual rationales in both arms. That completes the reading that this file skipped
  for 14 unchanged Stage 2 rows. It found no additional blocking pack cause.
- R6 agrees that the RPC downgrade has a mixed cause and that the other three Stage 2 downgrades
  have no identified p8 cause. That classification is the plan's attribution rule, not a measured
  variance rate.
- R6 adds a residual finding: in `q-scf-funding-by-category`, arm-B vote 2 treats the
  `2026-10-03` snapshot date as fabricated because the compact pack omits it. The saved source holds
  it, and both packs omit it. In the dormant-account row, arm-B vote 3 likewise rejects the NIST
  `2029+` detail, which the saved source holds and both packs omit.
- R5-1 was open at the time of R6: the support diagnostic kept the whole `provenance:` line and the
  `(+N more)` suffix. R6's probes accepted `18126` (a character counter) and `20` (`(+20 more)`) as
  support. The p8b preparation closes it as a diagnostic-only change; see
  [amendment-p8b.md](amendment-p8b.md).
- R6 recommends a prospective Stage 2 amendment and a fixed three-call continuation on the
  StellarTerm row. Both are in [amendment-p8b.md](amendment-p8b.md). This run stays BLOCKED.
