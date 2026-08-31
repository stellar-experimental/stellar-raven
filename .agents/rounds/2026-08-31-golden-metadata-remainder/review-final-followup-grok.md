# Follow-up review — golden metadata remainder (2026-08-31)

Mode: audit. No repository edit except this report.
Prior review: `review-final-grok.md` (`APPROVE-WITH-FIXES`, F1–F4).
Fixed point: `35b5a38`.
Checked at: 2026-08-31T14:20:43Z.

## Verdict

**PASS**

F1 through F4 are repaired. The rebuilt ledger, route cards, TODO caution wording, NEXT counts and sequence, and helper removals match the requested repairs. Only the two mirrored Horizon samples remain. No remaining text claims CAP-0070 forbids a 3-second observed close.

## Reproducible checks

| Check | Command or read | Result |
|---|---|---|
| F1 wording in `sd-047` | read `improvements/stellar-docs/sd-047-validators-ledger-close-cadence-conflict.md` | Finding now says the configured target cannot be set below 4000 ms and that the range bounds the target, not observed closes. The “protocol cannot produce” sentence is gone. |
| F1 wording in the case | `q-protocol-ledger-close-time.json` corroboration note on `NetworkConfig.h` | “The configured target cannot be set below 4000 ms. That is a target floor, not an observed-close floor; the two 2026-08-31 samples had no delta below 5 s.” |
| CAP-0070 forbid-3s sweep | `rg` for `protocol cannot produce`, `forbids a 3-second`, `3-second close is below the protocol` in `sd-047`, the case, TODO, NEXT, and the round ledger | No hit that asserts a 3-second observed close is impossible. The case evidence line that says “no evidence claims a 3-second close is impossible” is a repair record, not the forbidden claim. |
| F2 third window | `rg` `64209241` `64209440` `three 199-delta` in the case, `sd-047`, `cases.json`, `sample.json`, and the round tree | Live files keep only `64209159–64209358` (13:10:23Z, blind) and `64209225–64209424` (13:16:30Z, lane B). The third window appears only as a deleted-window mention in this follow-up’s prior review and in the ledger’s “Fixed” note. |
| F3 NEXT counts | read `.agents/NEXT.md` State at handoff | 69 findings; 61 warnings; the `symmetric-caution` is named and accepted. |
| F3 NEXT sequence | read Suggested sequence | Starts with reconcile this review, commit, then file `sd-047`. It no longer says to restart the temporary-path/D1 remainder. |
| F4 notes | parse `golden.notes` in the case, `cases.json`, and `sample.json` | No `GT-32 CORRECTION`. No `~3-5s`. Notes keep the 5–7 s sentence, the Bitcoin/Ethereum trap, and the SCP closeTime hint. Generated files match the case. |
| TODO caution | read `.agents/TODO.md` Goldens item | Records the ADR-0008 no-caution decision and the accepted advisory warning. It does not send the caution to an open NEXT owner queue. |
| Helpers | `ls` of `apply-s1.py`, `orch-checks.py`, `v-checks.mjs`, `v-rewalk.mjs`, `brief-v.md` | All absent. Result files `v-checks.json`, `v-rewalk.json`, `v-report.md`, `s1-applied-lines.json`, and `sample-12.txt` remain. |
| Register hash | sha256 of the case file vs `memberContentSha256` | Match (`0f59733d…`), 2 register copies. |
| INDEX | `improvements/INDEX.md` vs `sd-047` Finding lead | Lead sentence matches. Status `verified`. |
| Gates | `git diff --check 35b5a38`; `npm run improvements:lint`; `npm run eval:qa:lint -- --since 35b5a38` | check clean; improvements lint ok (69); 0 errors / 61 warnings including the accepted `symmetric-caution`. |

## F1–F4

- **F1 repaired.** CAP-0070 and `NetworkConfig.h` are described as a configured-target bound. Observed-close evidence stays the two samples (no delta below 5 s).
- **F2 repaired.** Only the two mirrored windows remain in gospel, finding evidence, and generated corpus files.
- **F3 repaired.** Counts and sequence match the live tree.
- **F4 repaired.** Present-state notes only.

## Ledger, route cards, TODO, NEXT, helpers

The round ledger is one complete record (scope, baseline, lanes, evidence, gates, review reconciliation, outcome). It is no longer truncated.

Route-card wording now names CLI, model, effort, and reason per lane:

- V: Codex GPT-5.6 Terra, high, bounded verification of landed work.
- A and B: GPT-5.6 Sol, high, dense per-fact live verification; workers did not edit the repository.
- R: Grok 4.6, high, vendor-diverse blind re-derivation and adversarial review; differs from Sol, Terra, and Fable.

That matches `AGENTS.md` lane selection. Effort stays at high. The orchestrator edit that rewrote these cards is accurate.

TODO no longer says a caution owner decision remains in NEXT. The no-caution ADR-0008 decision is recorded on the `sd-047` filing item.

Transient helpers named in the ledger are gone from the artifact directory. Their outputs remain.

## Remaining notes (not FAIL)

- NEXT block 1 still says the round needs independent review and a commit. After this PASS, only the commit and the `sd-047` filing remain. The Suggested sequence already states that order.
- NEXT “Consistency register: reconciled on 2026-08-29” is a historical date. The 2026-08-31 register work is recorded in the round ledger.
- `review-final-grok.md` still quotes the pre-fix F1 text. Keep it as the original review.

## Remaining findings

None that block a PASS.
