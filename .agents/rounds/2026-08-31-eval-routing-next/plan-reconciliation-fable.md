# Plan reconciliation — Grok review of `plan-fable.md`

Date: 2026-08-31
Author: Claude Fable 5 high
Review: `.agents/rounds/2026-08-31-eval-routing-next/review-grok-plan.md`
Repaired file: `.agents/rounds/2026-08-31-eval-routing-next/plan-fable.md`
Status: every H, M, and L issue is reconciled. No paid call ran. No shared ledger or production
file changed. The revised plan authorizes no paid work.

Free checks this reconciliation ran: the Terra register hash, the Fable register hash, the
case-body digest rule, the exact comparison buckets, the nearest-rank P90 values, the stored
binary and schema stamps, the `--ids` filter order in `run-qa.mjs`, the `stratifiedSample` step
rule, `selectJudgeTier`, and `prepareJudgeStabilityRegister`.

| Issue | Severity | Disposition | Plan section |
| --- | --- | --- | --- |
| H1 | bug | Repaired. `S` never exceeds 20. If top-1 changes exceed 20, take 20 even-spaced picks from that id-sorted set and nothing else. | 5.3 step 4 |
| H2 | bug | Repaired. The `R2` command carries `--expect-agent-binary-sha256`. Both arms use one hash. | 6 |
| H3 | bug | Repaired. `R2` pins an empty register generated from an empty directory, so no id has usable history. `--max-panel-cases 0` then blocks boundary panels. A free `selectJudgeTier` check must print `single` before spend. The `$2.50` cap is valid only under all-single judging. | 6 |
| H4 | bug | Repaired. Plan regrade is diagnostic only. `FIRST-PAIR-BLOCK` needs the transcript trace in rule 5. A Docs-coverage drop with a correct Scout route is not a regression by itself. | 5.8 rules 2 and 6 |
| H5 | bug | Repaired. The allowed-family list now names the structured semantic route-fit family, measurement only, as defined in `implementation-brief-fable.md`. A paid or hosted comparator inside step 2 is forbidden. The cross-encoder is deferred within the same family. | 4.3, 4.4 |
| H6 | bug | Repaired. `R0` compares the stored search `input` with the case question. A verbatim-query miss stops the method. A rephrased miss is a failed qualification and not a dump contradiction. | 5.7, 5.9 |
| M1 | suggestion | Repaired. Only the judge-stability TODO closes, with the note "stable at 57". NEXT block 2 stays open. The section title and closeout list say so. | 3, 3.3, 7 |
| M2 | suggestion | Repaired. Both 2026-08-31 file hashes, the 2026-08-29 hash, and the case-body digest `0c9face7…` are recorded with the reproduction rule: drop `_meta`, sort keys recursively, compact `JSON.stringify`, SHA-256. No regeneration pin. No register pinned for paid use this round. No Desktop copy before approval. | 3.1, 3.3 |
| M3 | suggestion | Repaired. Exact buckets: 7 → 28/51, 8 → 13/23, 9 → 1/2, 10 → 2/5, 11 → 0/1, 12 or more → 13/19. | 3.1 |
| M4 | suggestion | Repaired. The example lists the eight QA ids. `q-pc-protocol-upgrade-timing` is named as not in that changed set. | 5.3 |
| M5 | suggestion | Repaired. `S` freezes in runner order from a free dry filter over `cases.json`. `meta.selectedIds` must equal it after each arm. | 5.3 step 6, 5.7 |
| M6 | suggestion | Repaired. The fill uses the `stratifiedSample` rule: `step = pool.length / want`, pick `pool[floor(i * step)]` on an id-sorted pool. | 5.3 step 4 |
| M7 | suggestion | Repaired. The arm cap is `20 × $0.860 = $17.20` from the matching maximum. The total ceiling is `$35.40`. No mid-method raise. The delta review may set a different cap before authorization. | 5.5 |
| M8 | suggestion | Repaired. Paid launch needs a clean tree including untracked files. The round-directory files must be committed first. | 2, 5.2, 5.6 |
| M9 | suggestion | Repaired. The candidate command list starts with the `.dev.vars` placeholder and `npm run typegen`. | 4.5 |
| M10 | suggestion | Repaired. `R2` judges a copy under the scratch path. The original and the archive copy stay unjudged. | 6 |
| M11 | suggestion | Repaired. `R2` names the register path, its generation command, its hash, and the all-single panel contract. | 6 |
| M12 | suggestion | Repaired. Arm A is the product-commit parent. The "same router as `main`" claim needs a `src/catalog/search.ts` hash check against `04a9aa3d…`. | 5.4 |
| L1 | nit | Repaired. P90 uses nearest-rank at index `ceil(0.9 × n) - 1`: `$0.411`, `$0.374`, and `$0.495`. The method is stated in the table. | 5.5 |
| L2 | nit | Repaired. The 2026-08-27 100-row file (`qa-agent-result-v1`, no binary pin) and the two 8-row arms (binary `2.1.247`) are labeled extra context. | 5.5 |
| L3 | nit | Kept. The pre-spend delta review is mandatory after `S` exists. The plan review is not that review. | 5.2, 5.10 |

Preserved decisions:

- Free-first sequence. No same-100 collection in this round.
- Expected paid spend `$0`. Every paid step needs a delta review PASS and user authorization.
- Same-100 deferral trigger: a merged product candidate that needs a paired look, plus the owner
  margin in `.agents/NEXT.md`.

Residual non-blocking notes, recorded as the review stated them:

- The T4 `partial-without-issue` row stays untested under rubric `v2.10`.
- Friendbot stays monitor-only. The Raven diagnostic stays out of scope. Repository-tooling
  recovery stays monitor-only until the free Horizon probe returns `28`.
- `improvements/` stays empty unless a transcript shows a verified service gap.

Next action: a bounded Grok delta review of the repaired sections 4.3, 5, and 6. A full re-review
is not needed.

## Delta-review residuals — 2026-08-31

`review-grok-plan-delta.md` returned PASS and left three record residuals. They are repaired in
`plan-fable.md`. No other file changed. No paid call ran.

| Issue | Severity | Disposition | Plan section |
| --- | --- | --- | --- |
| R1 | record error | Repaired. The 12-or-more bucket now reads 13 of 18. The 11-comparison band (0 of 1) is its own row and is no longer counted inside the lump. | 3.1 |
| R2 | record error | Repaired. The `R2` panel note now says two of the eight example ids sit below `0.75`: `q-hist-remittance-corridors` at 0 and `q-protocol-24-whisk-incident` at 0.5. `q-pc-protocol-upgrade-timing` is not in the eight. The empty-register path stays required. | 6 |
| R3 | record error | Repaired. Section 4.4 states that attempt one is blocked: `review-grok-clause-brief.md` returned BLOCK, and the clause-fit build stays blocked until `review-grok-clause-brief-delta.md` is PASS. The plan-delta PASS does not lift that block. | 4.4 |

The delta review PASS closes the original plan-review gate. It allows no paid call, no `R0` or
`R1`, no clause-fit artifact build, no product commit, and no same-100 collection.
