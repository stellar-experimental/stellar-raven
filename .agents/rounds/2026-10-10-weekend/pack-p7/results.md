# Results: pack p7 versus p6 paired re-judge

Date: 2026-10-10, 16:06Z to 17:02Z. Operator: Claude Opus 5.5 (lane R author).
Plan: [measurement-plan.md](measurement-plan.md) at `00964a8d`. Pins: [ledger.md](ledger.md).
Data: [rejudge-artifacts.json](rejudge-artifacts.json) (paths and SHA-256 of the 24 artifacts) and
[rejudge-summary.json](rejudge-summary.json) (output of [analyze-rejudge.mjs](analyze-rejudge.mjs)).
The artifacts are in the ignored `eval/qa/results/` folders of the two arm worktrees.

## Verdict

**The p7 result is blocked. The change returns for repair.**

- Stage 1 passes. p7 repairs the claim support on the omission rows.
- Stage 3 passes. p7 causes no false upgrade on the stored-wrong rows.
- Stage 2 fails. One stored-correct control falls from `correct` to `wrong`, and the cause is in
  the p7 pack. The plan's rule says that any pack regression blocks the p7 result.

The post-run independent review is still required. I did not do it. The plan names Codex frontier
(`gpt-6-astra`) at high effort as the reviewer.

## Method completeness

| Check | Result |
|---|---|
| Invocations | 24 of 24 (12 per arm); every artifact status is `successful` |
| Judge calls | 192 of 192 (32 rows × panel 3 × 2 arms); every call reported a cost |
| Error verdicts | 0 in each stage |
| Identity pins | The postflight guard passed in all 24 artifacts: no binary change and no environment change |
| Arm A packs | 32 of 32 equal the stored p6 pack SHA-256 |
| Case modes | 16 invocations in revision mode (`cases.matches: true`); 8 in worktree mode for the two incomplete source files, as the plan states |
| Stop rules | No rule fired. The maximum single call cost $0.1810 (limit $0.60). No file reached its cap. |
| Incomplete or unattempted rows | None |

Both arms of one stage ran at the same time; the plan permits this. Each arm ran its files in
order, and a checker read each artifact before the next file started.

## Costs

| Invocation | Rows | Cap per arm | Arm A | Arm B | Max call (A / B) |
|---|---|---|---|---|---|
| S1a | 1 | $0.85 | $0.2952 | $0.3171 | $0.1015 / $0.1114 |
| S1b | 3 | $2.45 | $0.9896 | $1.0907 | $0.1503 / $0.1395 |
| S1c | 2 | $1.65 | $0.4989 | $0.5522 | $0.1000 / $0.1122 |
| S2a | 13 | $10.55 | $3.4141 | $3.3853 | $0.1810 / $0.1546 |
| S2b | 3 | $2.45 | $0.8766 | $0.9406 | $0.1151 / $0.1219 |
| S2c | 2 | $1.65 | $0.4833 | $0.5204 | $0.1021 / $0.1228 |
| S2d | 1 | $0.85 | $0.1812 | $0.1725 | $0.0660 / $0.0597 |
| S2e | 1 | $0.85 | $0.3216 | $0.3686 | $0.1213 / $0.1305 |
| S3a | 1 | $0.85 | $0.3702 | $0.3240 | $0.1447 / $0.1126 |
| S3b | 1 | $0.85 | $0.2578 | $0.3045 | $0.0919 / $0.1079 |
| S3c | 1 | $0.85 | $0.4867 | $0.3821 | $0.1748 / $0.1608 |
| S3d | 3 | $2.45 | $0.8354 | $0.8190 | $0.1287 / $0.1114 |

| Stage | Spend | Stage cap |
|---|---|---|
| 1 | $3.7438 | $11.00 |
| 2 | $10.6642 | $34.00 |
| 3 | $3.7797 | $10.00 |
| Total | **$18.1876** (arm A $9.0107, arm B $9.1770) | $55.00 |

The plan's estimate at the stored mean was $25.25. The real mean was $0.0947 per call.

## Stage 1: omission rows (6)

Rule: the stage passes on support, not on grade. Arm B must not call transcript-supported text
fabricated or absent from evidence.

| Row | Arm A (votes) | Arm B (votes) | Move |
|---|---|---|---|
| `q-defi-etherfuse-stablebonds` | partial (P P P) | partial (P P P) | same |
| `q-edge-fresh-latest-blend-tvl` | wrong (W P W) | correct (C C C) | up |
| `q-sor-deploy-invoke-from-js-sdk` | wrong (W W W) | wrong (W W P) | same |
| `q-ti-rpc-gettransactions-pagination-xdr` | partial (P W P) | wrong (W W W) | down |
| `q-hist-quantum-preparedness-plan` | wrong (W W P) | wrong (P W W) | same |
| `q-soroban-oz-upgradeable-macro` | wrong (W W W) | wrong (W W W) | same |

- Support: in arm A, 5 of 6 rows have at least one vote with `evidenceSupportCheck: pack-omission`
  (8 votes). In arm B, no vote has it.
- No arm-B wrong claim calls supported text fabricated or absent. The held `wrong` grades come
  from golden contradictions: the quantum row's "already shipping" claim against a Draft CAP, the
  macro row's retired API, and the deploy row's own code inconsistency.
- The blend-tvl upgrade is a repair. Its rationale relies on values that the pack shows
  (`tvlUSD`, `tvlAsOf`, the $80M and $100.6M figures). It does not rely on the omission line.
- The rpc downgrade has no pack cause. The arm-B rationale cites an answer-visible example that
  joins `startLedger` and `cursor`, against the golden's exclusivity rule. Arm A had split votes.
  This is judge variance.

**Stage 1: pass.**

## Stage 2: stored-correct controls (20)

Rule: the stage passes when no row scores lower in arm B. A lower score is a pack regression
when the rationale cites p7 pack content.

Result: 17 same, 1 up, 2 down.

- **`q-hist-quantum-preparedness-plan` (`2026-10-07T23-25-14`): correct (C C C) to wrong (W W W).
  Pack regression.** The arm-B rationale cites the source sentence "expected to be able to ... in
  2026" as a contradiction of the answer's "move to quantum-safe signing immediately". The p7 pack
  shows that span. The p6 pack showed a different source snippet, "enabling enterprise wallets to
  migrate immediately", which supports the answer's wording. The p7 pack does not hold that
  snippet. The answer's "immediately" is a single lowercase word. It is not an anchor, and the
  answer shares no 4-word phrase with that source sentence. So p7 dropped supporting evidence and
  kept a span that reads as a contradiction.
- `q-gap-leaderboard-project-not-builder`: correct (C C P) to partial (P P P). No pack cause.
  Both rationales name the same minor omission (the leaderboard's developer macro block). Arm A
  calls it trivial; arm B caps at partial. Neither pack holds the term. This is judge variance.
  The arm-B pack is smaller (7,515 characters against 9,846).
- `q-pc-quantum-preparedness-dormant`: wrong (W W W) to partial (P P C). Arm A called the answer's
  INRIA figure undated and "unsupported by the transcript evidence pack". The p7 pack shows no span
  for it. The figure appears only in the `claimSupportOmitted` line, as `"only ~1,193 logical
  qubits" (entry=4)` and `"INRIA" (entry=4)`. No arm-B vote repeats the arm-A objection.
  Arm-B vote 2 uses that line's entry number: it says the research "comes from a separate research
  source (entry 4), not the QPP announcement (entry 1)", and it records that as a wrong claim.
  So a judge did read the omission line as evidence of where content lives. Here it supported a
  wrong claim, not an upgrade. No arm-B rationale says the omission line establishes the figure.
  The stored grade is `correct`. The move toward it can come from the omission line or from
  variance; the rationales do not decide this.

**Stage 2: fail (one pack regression).**

## Stage 3: stored-wrong no-false-upgrade controls (6)

Rule: the stage passes when no row scores higher in arm B. An upgrade that cites
`claimSupportOmitted` is a pack regression.

| Row | Arm A (votes) | Arm B (votes) |
|---|---|---|
| `q-defi-bridge-evm-to-stellar-axelar` | partial (P W P) | partial (P P P) |
| `q-ti-freighter-localhost-not-detected` | wrong (W W W) | wrong (W W W) |
| `q-sor-force-fast-archival-localnet` | partial (P P P) | partial (W P P) |
| `q-scf-verified-members` | wrong (W W W) | wrong (W W W) |
| `q-soroban-sdk-cve` | partial (P P P) | partial (P W P) |
| `q-tool-sdk-repos-discovery` | partial (P W P) | partial (P P P) |

0 up, 6 same, 0 down. No Stage 3 rationale or wrong claim uses the omission line.
Across all 96 arm-B votes, one vote uses its entry numbers (`q-pc-quantum-preparedness-dormant`,
Stage 2; see above). No vote names `claimSupportOmitted`.

**Stage 3: pass.**

## What the result means

- p7 removes the pack-omission class that it targets: 8 arm-A votes against 0 arm-B votes.
- The omission line caused no false upgrade in this sample. But one judge vote read its entry
  numbers as evidence of a record's source. The caution text did not stop that use.
- p7 can still drop support that p6 showed by chance. p6 showed it through wide raw windows
  around unrelated anchors. A claim word that is not an anchor, and that the source states in other
  words, gets no unit in p7. Under budget pressure, p7 can then show only a span that reads as a
  contradiction.
- Panels split more often in arm A (12 of 32 rows) than in arm B (8 of 32 rows).

## Limits

- One panel of 3 per arm per row. No identical-input noise floor exists for panel 3 under `v2.11`.
- The sample is 32 rows. It cannot rule out rarer regressions.
- Rows from the two incomplete source files use the current corpus, not the saved run's snapshot.
  Both arms read the same content.
- The attribution of each changed score is my reading of the rationales. The post-run review must
  check it.
