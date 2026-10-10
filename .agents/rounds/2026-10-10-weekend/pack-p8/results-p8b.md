# Results p8b: one continuation row under the amended Stage 2 rule

Date: 2026-10-10. Author and operator: lane R (Claude Opus 5.5). Method:
[amendment-p8b.md](amendment-p8b.md). Reading output: [p8b-reading.json](p8b-reading.json).

**Verdict under the predeclared reading: PASS, provisional.** The result is not final. The mandatory
post-run review (see the last section) must finish, and the orchestrator must reconcile every finding.

**The original p8 run stays BLOCKED.** Its predeclared Stage 2 rule failed on this row
([results.md](results.md)). This continuation does not change that result.

## Scope

- This continuation measured **one new row**: `q-defi-arbitrage-pathpayment-bots`, arm B, pack `p8`.
- The other **31 rows are reused evidence** from the p8 run, under their unchanged rules
  ([rejudge-artifacts.json](rejudge-artifacts.json)). They were not measured again.
- This result does not describe 32 new rows. It is not a general accuracy estimate.
- The arm-A baseline for this row is the reused p6 panel. The p7 and p8 historical panels stay in
  the record. This continuation does not replace them.

## Invocation

| Item | Value |
|---|---|
| Command | `.agents/rounds/2026-10-10-weekend/pack-p8/launcher/run-inv-p8.sh P8B paid` (one invocation, exit 0) |
| Time | 2026-10-10T19:39:59Z to 19:42:30Z |
| Code | `raven-p8-arm` at `36e77d4067e1a0d0c5156c0eaf1ee2904200b21b`, clean |
| Model, rubric, panel | `claude-sonnet-5`, `v2.11`, 3 |
| Pins | binary `c9b53416…` (2.1.296), environment `ff926b43…`; the identity guard matched before and after |
| Artifact | `/Users/kalepail/Desktop/raven-p8-arm/eval/qa/results/2026-10-10T19-39-59-rejudge.json` |
| Artifact SHA-256 | `26fd63b54533e4f3f1686af88765a5a2ec1682fcc91c175e3f5ee25d2e9b9d30` |
| Pack | `p8`, SHA-256 `ac9c47b6be31afb685b94112c6c205fd7387580ea5ae935a72b5681e02caa1d0` |
| Full prompt | SHA-256 `3cc7187326b5487ae31fb433efcbe87f5eea060e992852eca54c68d4c3b1887e` (all 3 calls) |
| Answer | SHA-256 `7e5ec292…` (all 3 calls; equal to the saved answer) |
| Calls and costs | $0.1380186, $0.1320954, $0.1072764 |
| Total | $0.3773904 of the $0.85 file cap; 3 of 3 costs reported; no call above the $0.60 checkpoint |
| Outcome | `successful`; postflight `passed` |

There was no retry and no other paid call.

## Preflight (19:39Z, before the paid call)

All 7 amendment preflight items passed:

1. The `raven-w1010-r` tree was clean. The pre-spend review (R7 delta, `PRE-SPEND: LAUNCH-OK`) and the
   approval were recorded (`f4005a3e`).
2. The binary and environment hashes reproduced the pins.
3. `raven-p8-arm` HEAD was `36e77d40…`, and its tree was clean.
4. The P8B dry run exited 0: one row, revision mode, `cases.matches: true`, 0 golden-time violations,
   tuple `claude-sonnet-5` / `v2.11` / `p8`.
5. The static judge self-test was GREEN.
6. `verify-r5-1.mjs` reported 64 of 64 packs and 64 of 64 prompts identical, with 0 diagnostic
   changes over 48 votes.
7. `analyze-p8b.mjs` reported `not-run`, both input hashes matching, the baseline C/C/P, and the
   historical panels C/C/C (p7) and W/P/P (p8).

## Acceptance gate

`analyze-p8b.mjs` reports `status: "ready-for-reading"` with 0 gate failures:

- 3 judge calls, 3 graded votes, 0 error votes, 3 reported costs.
- Every input hash equals the expected prompt, and every answer hash equals the saved answer.
- The row and the file record pack `p8` with SHA-256 `ac9c47b6…`.
- The model, rubric, and panel are as declared.
- The outcome is `successful`, the postflight passed, and the identity guard passed with the declared pins.
- The file cap is $0.85, and the highest call cost is $0.1380186.
- The rebuilt pack and prompt for this row match the expected hashes.

## Panels for this row

| Panel | Pack | Votes | Panel score | Cost | Status |
|---|---|---|---|---|---|
| p6 arm A (baseline, reused) | `p6` `76eec18f…` | correct / correct / partial | correct | $0.3143254 | reused |
| p7 run arm B (historical) | `p7` `6525f36b…` | correct / correct / correct | correct | $0.3030652 | kept, not replaced |
| p8 run arm B (historical) | `p8` `ac9c47b6…` | wrong / partial / partial | partial | $0.3563512 | kept, not replaced |
| **p8b continuation arm B (new)** | `p8` `ac9c47b6…` | **wrong / wrong / partial** | **wrong** | $0.3773904 | new |

The new panel score is lower than the baseline (direction `down`). The panel disagrees (2 wrong,
1 partial). Each new vote gives `coreAnswer: correct` and no missing facts.

## Evidence for the lowered grade

- Candidate sentence: "Current Soroban-side DEX/AMM TVL (scout directory, generated 2026-10-08):
  Aquarius ~$38.9M, Soroswap ~$1.24M, with Phoenix, Octarine, Zenex, Noether, Raum Network,
  StellarTerm (classic SDEX UI), and Comet marked Inactive. … (scout.searchProjects, type=DEX)".
- Source: execute entry 1 (transcript index 5), `scout.searchProjects`, `generatedAt`
  `2026-10-08T00:04:52.749Z`. The only StellarTerm record is
  `{"name":"StellarTerm","slug":"stellarterm","status":"Live", …}`, URL
  `https://stellarlight.xyz/project/stellarterm`. No other result gives StellarTerm a status.
- p8 pack: source item 8, `title="StellarTerm" url="https://stellarlight.xyz/project/stellarterm"
  fields="status="Live", …"`. The p6 pack omits this record and shows only the URL.
- This is the predeclared evidence check of the amendment. It was done before the spend.

## Reading of each rationale

The reading applies the amended Stage 2 rule to the new panel only. It checks each rationale for
missing context, unsupported inference, and source identity.

| Vote | Grade | Basis of the lower grade | Fidelity check | Reading |
|---|---|---|---|---|
| 1 | wrong | StellarTerm is "marked Inactive" in the answer; the scout.searchProjects result shows `status='Live'`. | The entity, field, snapshot, and source are correct. "The candidate's own cited source" is correct: the answer cites `scout.searchProjects, type=DEX` and "generated 2026-10-08". The other statements (dates, destMin/sendMax, `UNDER_DESTMIN`/`OVER_SENDMAX`/`TOO_FEW_OFFERS`, no profit promise) agree with the answer. No entry number, no notice, no lost qualifier. | Rests on the confirmed StellarTerm correction. Pass. |
| 2 | wrong | The same StellarTerm contradiction ("scout directory data"; source-basis evidence shows `Live`). | The entity, field, and source are correct. The other statements agree with the answer. No entry number, no notice, no lost qualifier. | Rests on the confirmed StellarTerm correction. Pass. |
| 3 | partial | The same StellarTerm contradiction ("scout TVL list"; source-basis evidence shows `Live`). It calls this "a specific contradiction of the given evidence, not merely an unverifiable addition". | "Scout TVL list" is correct: the sentence is the scout DEX/AMM TVL list. It also names the path-query flow, latency, and failed-transaction codes, and the answer contains each. No entry number, no notice, no lost qualifier. | Rests on the confirmed StellarTerm correction. Pass. |

Mechanical checks from `p8b-reading.json`:

- All 3 votes cite StellarTerm.
- No vote cites the claim-support notice, and no rationale reads an entry number as a source.
- The span-only support diagnostic gives `no-pack-omission` for each vote.
  The recorded check in the artifact (older diagnostic) gives the same status for each vote.

No vote rests on lost support, a changed meaning, a removed qualifier, a misattributed source, or a
notice. No lower vote has an unresolved cause. Under the predeclared reading, the continuation passes.

## Points for the post-run reviewer

These points do not change the predeclared reading. The reviewer must assess them.

1. **Sentence interpretation.** The p6 baseline vote 1 read the sentence narrowly: only Comet is
   "marked Inactive". It called the sentence "a bit ambiguous". The predeclared reading treats this as
   a sentence-interpretation difference, not competing source evidence. All three new votes read the
   sentence broadly: every listed name is "marked Inactive".
2. **The other listed names.** The same saved result gives these statuses: Phoenix `Live`, Octarine
   `Live`, Zenex `Live`, Noether `Pre-Release`, Raum Network `Development`, and Comet `Inactive`.
   - Under the broad reading, the answer misstates 6 of 7 statuses, so the downgrade is stronger.
   - Under the narrow reading, the sentence agrees with the source, and no contradiction exists.
   - The p8 pack shows a status record only for StellarTerm (source item 8). It has no record for
     the other six names. So the new votes could check only StellarTerm.
   - The p6 pack shows a snippet for the term `Zenex` (it also shows Comet `Inactive`). The p6
     vote 3 (partial) flagged Zenex as `Live`. So the broad reading also lowered one baseline vote.
3. **Must-avoid mapping.** Votes 1 and 2 match must-avoid item 4 ("unsupported memory … as a
   source-supported current observation"). The claim is a contradicted sourced claim, not memory. This
   is a rubric-mapping question. It does not change the source basis of either vote.

## Stage 1 and Stage 3

Stage 1 and Stage 3 keep their unchanged rules and their p8 readings (both passed). The
continuation does not measure them again. The other three p8 Stage 2 downgrades keep the
predeclared variance classification, with no statistical variance claim.

## Post-run review (mandatory, not done by the author)

- Reviewer: Codex frontier `gpt-6-astra` at high effort.
- Fallback, in order: Grok `grok-4.7` at high, then Claude Fable `claude-fable-5-1` at high.
- Claude Opus is not eligible: the author and the orchestrator are both Claude Opus.
- The orchestrator records the tier, model, and effort, and any skip reason.
- The orchestrator reconciles every finding before this result is final or p8 is used for judge input.
- The merge note in the amendment still applies: do not merge `w1010/r` as a diagnostic-only change.
