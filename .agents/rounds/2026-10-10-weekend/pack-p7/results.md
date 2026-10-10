# Results: pack p7 versus p6 paired re-judge

Date: 2026-10-10, 16:06Z to 17:02Z. Operator: Claude Opus 5.5 (lane R author).
Plan: [measurement-plan.md](measurement-plan.md) at `00964a8d`. Pins: [ledger.md](ledger.md).
Data: [rejudge-artifacts.json](rejudge-artifacts.json) (paths and SHA-256 of the 24 artifacts) and
[rejudge-summary.json](rejudge-summary.json) (output of [analyze-rejudge.mjs](analyze-rejudge.mjs)).
The artifacts are in the ignored `eval/qa/results/` folders of the two arm worktrees.

## Verdict

**The p7 result is blocked. The change returns for repair.**

- Stage 1 passes its predeclared judge-behavior rule. It does not show complete source-span support:
  one row's support exists only in the `claimSupportOmitted` line (see the correction below).
- Stage 3 passes. None of its six panel scores increased.
- Stage 2 fails. One stored-correct control falls from `correct` to `wrong`, and the cause is in
  the p7 pack. The plan's rule says that any pack regression blocks the p7 result.

## Corrections after the post-run review

The mandatory post-run review is [post-run-review/rr3-review.md](post-run-review/rr3-review.md)
(Codex frontier `gpt-6-astra`, high effort). It confirms the p7 block and disputes five items.
This file now states each item as the review established it.

1. **Support claim versus omission metadata.** `findTranscriptEvidencePackOmissions` searches the
   whole serialized pack, so it counts the `claimSupportOmitted` line as support. For
   `q-defi-etherfuse-stablebonds`, the p7 pack has no span with the maturity sentence or `90`;
   only the omission line lists `"90 days" (entry=2)` and `"90" (entry=2)`. Without that line,
   the check reports `pack-omission` with `omittedTerms: ["90"]`. So "0 arm-B omission votes"
   is a diagnostic count, not proof that the supporting spans survived. The full sample has 9
   arm-A omission votes: 8 in Stage 1 and 1 in Stage 3 (Axelar).
2. **Dormant-account source inference.** Arm-B vote 2 for `q-pc-quantum-preparedness-dormant`
   used `entry 4` from the omission line to call the INRIA figures a different source. That is
   false. Execute entry 4 is another retrieval of the same QPP article (`Introducing the Quantum
   Preparedness Plan`, the stellar.org URL), and its content holds the INRIA, `1,193 logical
   qubits`, `44%`, and NIST text. The judge read a transcript entry number as a source identity.
   The cause of the panel upgrade (W/W/W to P/P/C) stays unresolved.
3. **RPC downgrade cause.** For `q-ti-rpc-gettransactions-pagination-xdr`, arm-B vote 3 cites a
   `getLedgers` example with `startLedger` and `limit` that only the p7 pack shows (support unit
   21). So the pack can have contributed to one vote. The other two votes cite the answer-visible
   golden contradiction. The cause is mixed or unresolved, not pure judge variance. It is not a
   lost-support regression and does not fail the Stage 1 rule.
4. **Quantum regression mechanism.** The loss comes from selection, not from the budget. At span
   widths of 440 and 120 characters, no selected unit holds "migrate immediately". At
   `maxChars: 100000`, the pack has 26,736 characters and still omits it. The selector does not
   keep a second sentence that gives different support for a claim whose anchors other sentences
   already cover. The lost Decrypt summary supports the answer's wording; it does not show that
   the capability shipped.
5. **S3a cases hash.** The ledger gave one worktree-mode cases hash to all four such invocations.
   S3a uses the 20-row source and has `7a3401a19f524e0a4f0d8f619c85aecf469cc5404da1d5b2fb7532fc33490017`.
   S1a, S2b, and S3b use the 94-row source and have
   `55831c3cd80f93316a5ca1dff2c8e5dc9e717ede1b70d4050d9742ebe162196f`. Both arms match.

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

- Support diagnostic: in arm A, 5 of 6 rows have at least one vote with
  `evidenceSupportCheck: pack-omission` (8 votes). In arm B, no vote has it. This count includes
  the omission line as support (correction 1). For `q-defi-etherfuse-stablebonds`, the support is
  in that line only; this row passes on judge behavior, not on source-span support.
- No arm-B wrong claim calls supported text fabricated or absent. The held `wrong` grades come
  from golden contradictions: the quantum row's "already shipping" claim against a Draft CAP, the
  macro row's retired API, and the deploy row's own code inconsistency.
- The blend-tvl upgrade is a repair. Its rationale relies on values that the pack shows
  (`tvlUSD`, `tvlAsOf`, the $80M and $100.6M figures). It does not rely on the omission line.
- The rpc downgrade has a mixed or unresolved cause (correction 3). Two arm-B votes cite the
  answer's example that joins `startLedger` and `cursor`, against the golden's exclusivity rule.
  Arm-B vote 3 also cites a `getLedgers` example that only the p7 pack shows.

**Stage 1: pass on the judge-behavior rule. Source-span support is not complete.**

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
  answer shares no 4-word phrase with that source sentence. The selector does not keep a second
  sentence for a claim whose anchors other sentences already cover. The loss is in selection, not
  in the budget: a 100,000-character pack also omits it (correction 4).
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
  That inference is false (correction 2): entry 4 is another retrieval of the same QPP article,
  and it holds the INRIA paragraph. The judge read a transcript entry number as a source identity.
  No arm-B rationale says the omission line establishes the figure. The cause of the upgrade stays
  unresolved, and the artifacts cannot show that the omission line caused no false upgrade.

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
The arm-A Axelar row has one `pack-omission` vote; arm B has none (a diagnostic count; see correction 1).
Across all 96 arm-B votes, one vote uses its entry numbers (`q-pc-quantum-preparedness-dormant`,
Stage 2; see above). No vote names `claimSupportOmitted`.

**Stage 3: pass.**

## What the result means

- The support diagnostic falls from 9 arm-A omission votes to 0 arm-B votes. That count treats
  the omission line as support, so it overstates the repair (correction 1).
- No Stage 3 panel score increased. One judge vote read an omission-line entry number as a source
  identity and drew a false conclusion (correction 2). The caution text did not stop that use.
- p7 can still drop support that p6 showed by chance. p6 showed it through wide raw windows
  around unrelated anchors. A claim word that is not an anchor, and that the source states in other
  words, gets no unit in p7. The selector then keeps another sentence for the same claim, which
  can read as a contradiction. A larger budget does not fix this (correction 4).
- Panels split more often in arm A (12 of 32 rows) than in arm B (8 of 32 rows).

## Limits

- One panel of 3 per arm per row. No identical-input noise floor exists for panel 3 under `v2.11`.
- The sample is 32 rows. It cannot rule out rarer regressions.
- Rows from the two incomplete source files use the current corpus, not the saved run's snapshot.
  Both arms read the same content.
- The attribution of each changed score was my reading of the rationales. The post-run review
  checked it and corrected three attributions (corrections 2, 3, and 4).
