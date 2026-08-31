# Independent final review — golden metadata remainder (2026-08-31)

Mode: audit. The repository is unchanged except this report.
Fixed point: `35b5a38` (`35b5a385df6150309bcdb618185b29f232f16aee`, equal to `HEAD`).
Scope: every changed and new file versus that point.
Reviewer: Grok 4.6 high. Reviewer ≠ author. The author summary was not treated as evidence.

## Verdict

**APPROVE-WITH-FIXES**

The 40 case edits, generated corpus files, register stamps, `sd-047`, and bookkeeping are reviewable. Gospel changes match independent live checks. Bare-relative temporary paths are gone from the 40 files. `solo://` line contents were not rewritten.

Do not commit until the High finding on `sd-047` and the Medium handoff errors are repaired.

## Scope inventory

- 40 battery case files (3 judge-facing, 37 truth-only).
- Generated: `eval/qa/cases.json`, `eval/qa/sample.json`, `eval/qa/lifecycle-registry.json`, `eval/qa/consistency-register.json`, `improvements/INDEX.md`.
- Findings: new `improvements/stellar-docs/sd-047-validators-ledger-close-cadence-conflict.md`; one evidence line on `sd-046`.
- Bookkeeping: `.agents/TODO.md`, `.agents/NEXT.md`, append to `.agents/rounds/2026-08-30-golden-metadata-remainder.md`.
- New round tree: `.agents/rounds/2026-08-31-golden-metadata-remainder.md` and `.agents/rounds/2026-08-31-golden-metadata-remainder/*`.

No implementation code changed.

## Gates run (read-only)

| Command | Result |
|---|---|
| `git diff --check 35b5a38` | clean, exit 0 |
| `npm run eval:qa:lint -- --since 35b5a38` | 0 errors, 61 warnings |
| `npm run improvements:lint` | ok (69 findings) |
| `npm run secrets:scan -- --tree` | clean |
| parsed-JSON judge-field match of 40 cases vs `cases.json` | 0 mismatches |
| `memberContentSha256` vs file bytes for changed register members | 0 mismatches |

`eval:qa:compile` and `eval:qa:register` write files. They were not run. The generated files already match the 40 case judge fields and register hashes.

The 61st lint warning is `[symmetric-caution] q-protocol-ledger-close-time`. The author recorded that warning as accepted under ADR-0008. That is a policy choice, not a lint error.

## 40 case changes

Judge-facing (3), each with a same-diff `truth.verified` update, non-empty `evidence`, and `rootCause`:

1. `q-protocol-ledger-close-time` — `golden.notes` only. The stale `~3-5s ledger close.` lead is replaced by dated 5–7-second wording plus rare 8–9-second deltas. Answer, keyFacts, and avoid are unchanged. Matches the blind ledger-close report: conflict persists; 5–7 s is typical; 8–9 s occurs.
2. `q-raph-lobstr-legitimacy` — `golden.answer` date `2026-07-11` → `2026-08-31`. Storage language stays owner-docs attribution. Matches the blind LOBSTR report for activity dating. The golden does not claim that an unshared phrase proves metadata control.
3. `q-scf-round-43-results` — answer, keyFact 5, avoid item 4, notes, `tags.freshness` `stable` → `scheduled`, `asOf` 2026-08-31, `reverifyBy` 2026-12-10. Official 29 / $3,139,069 stays the selection result. 28 / $3,049,069 is labeled as the dated dashboard `Awarded` paid-state view, with Bexo Wallet absent. Matches the blind SCF #43 report.

Truth-only (37): live re-check lines added, bare-relative `scratchpad/p4/h3-raph/…` and `scratchpad/p4/n2-events-blind/…` evidence lines removed, `truth.verified.date` set to 2026-08-31. No status or lifecycle flip. `solo://` counts per file are unchanged.

`q-comp-finclusive-caas` is not in the lane matrix files. It is listed in `affected-case-ids.md` as a verification-gap repair. That routing is acceptable.

Independent sibling greps found no cadence, LOBSTR, or SCF #43 contradiction among the named siblings. Author sweep lists are narrower than the full grep, but they are not false.

## `solo://` and temporary paths

- `solo://` string counts in the 40 files did not change. One trailing-comma JSON format change sits next to an unchanged `solo://` line. Contents of `solo://` lines were not rewritten.
- Remaining `scratchpad/p4` hits in the battery are inside `solo://project/49/scratchpad/p4/…` URIs. Those are historical Solo records. They are out of this round’s bare-relative repair class.
- `/tmp/raven-qadeep` and `conversions-copy-review` are absent from the 40 files.
- `/tmp/…` paths in lane reports are fetch logs, not corpus evidence.

## `sd-047` versus CAP-0070

The conflict itself is real. Raw and rendered Validators text still says “every 3-5 seconds.” The Stellar Stack page still says “every 5-7 seconds.” Horizon samples show no sub-5-second delta. Filing a `docs-content` finding is warranted. Status `verified` without a GitHub URL is valid. INDEX lists `sd-047`. Intake lint passed.

CAP-0070 does **not** prove that the network cannot close a ledger in 3 seconds. It proves the **configured target** `ledgerTargetCloseTimeMilliseconds` has initial value 5000 and a sanity range [4000, 5000]. `NetworkConfig.h` stores the same bounds. Observed closes already leave that range on the high side (6–9 s). A target floor is not an observed-close floor.

The Recommendation paragraph is careful. The Finding paragraph is not.

## Findings

### F1 — High — `sd-047` overstates CAP-0070

**Path:** `improvements/stellar-docs/sd-047-validators-ledger-close-cadence-conflict.md` lines 30–36; also `eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json` corroboration note at the 2026-08-31 `NetworkConfig.h` row.

**Evidence:** Finding text: “A 3-second close is below the minimum legal target.” Then: “A reader who opens the Validators introduction receives a cadence that the protocol cannot produce.” CAP-0070 defines a configurable **target** with range [4000, 5000] ms. The case’s own 2026-08-30 CAP-0070 note already says “a target, not an observed range.” Live samples include 8–9 s closes, which the target range also does not “produce” as a configured value.

**Consequence:** An upstream issue drafted from this file would tell docs owners a false protocol invariant. The live conflict remains true without that sentence.

**Smallest repair:** Keep the two-page wording conflict and the Horizon sample. Replace “the protocol cannot produce” with: the configured target cannot be set below 4000 ms; this 2026-08-31 sample had no delta below 5 s. Apply the same wording in the case corroboration note.

### F2 — Medium — third Horizon window is not in the mirrored reports

**Path:** `q-protocol-ledger-close-time.json` `truth.verified.evidence` and `sd-047` evidence bullet listing ledgers `64209241–64209440`.

**Evidence:** Blind report documents `64209159–64209358` at 13:10:23Z. Lane B matrix documents `64209225–64209424` at 13:16:30Z. Grep of `.agents/rounds/2026-08-31-golden-metadata-remainder/` finds no `64209241` and no `64209440`.

**Consequence:** A stranger cannot re-walk the third window from the round record. The 5–7 s typical range does not depend on that window.

**Smallest repair:** Delete the third window from the case and from `sd-047`, or add the missing fetch log with URL, timestamp, and histogram.

### F3 — Medium — `.agents/NEXT.md` handoff is internally stale

**Path:** `.agents/NEXT.md` “State at handoff” (68 findings, 60 warnings) and “Suggested sequence” (“Start with the block 1 remainder (second temporary-path class, D1, two gaps)”).

**Evidence:** This tree has 69 findings and 61 lint warnings. Block 1 already says the remainder landed and only `sd-047` filing plus this review remain.

**Consequence:** The next agent is told to redo closed work and is given wrong lint and finding counts.

**Smallest repair:** Point the suggested sequence at filing `sd-047` and committing after this review. Set counts to 69 findings and 61 warnings, and name the accepted `symmetric-caution`.

### F4 — Low — accretive `golden.notes` on ledger close

**Path:** `eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json` `golden.notes`.

**Evidence:** The `~3-5s` lead is gone, but the paragraph still keeps “GT-32 CORRECTION 2026-07-10…” after the new present-state sentence.

**Consequence:** A grader still reads a correction narrative instead of one current note.

**Smallest repair:** Keep the 5–7 s present-state sentence, the Bitcoin/Ethereum trap, and the SCP closeTime hint. Drop the GT-32 correction clause.

## Checks that passed

- Judge-facing gospel has matching `truth.verified` evidence and rootCause.
- Independent blind reports for ledger close, LOBSTR, and SCF #43 agree with the applied gospel.
- Register `reSwept` reasons name the durable shared rule. Hashes match file bytes. 0 reopen keys.
- `sd-046` and `q-protocol-base-reserve-min-balance` now name each other.
- Generated `cases.json` judge fields match the 40 battery files. `sample.json` carries the new ledger-close notes. LOBSTR and SCF #43 are not in the 30-row sample.
- `improvements/INDEX.md` is generated and lists `sd-047`.
- TODO closed the three completed Goldens items and left a concrete `sd-047` filing item.
- Round artifacts include `affected-case-ids.md` (40 ids), lane matrices, and three blind reports.

## Unresolved / deferred

- ADR-0008 still caps canonical-page cautions at three. The author added no caution and accepted the advisory lint warning. That is an owner decision, not a defect in this diff.
- `sd-047` has no `probe` frontmatter. Probes are optional. Add one only if filing wants a cheap recurrence check.
- Full `npm test`, `typecheck`, and `build` were not re-run here. No application code changed.
- This reviewer previously wrote the three blind reports in this same worktree. Case facts were re-checked against those reports and against the diff, not against the orchestrator ledger.

## Required repairs before commit

1. Fix F1 in `sd-047` and the matching case note.
2. Fix F2 (drop or prove the third Horizon window).
3. Fix F3 in `.agents/NEXT.md`.

F4 may land in the same edit. It is not a merge blocker.
