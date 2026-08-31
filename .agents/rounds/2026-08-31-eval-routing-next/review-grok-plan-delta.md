# Bounded delta review — repaired `plan-fable.md`

Date: 2026-08-31
Reviewer: Grok 4.6 high
Source review: `.agents/rounds/2026-08-31-eval-routing-next/review-grok-plan.md`
Reconciliation: `.agents/rounds/2026-08-31-eval-routing-next/plan-reconciliation-fable.md`
Repaired file: `.agents/rounds/2026-08-31-eval-routing-next/plan-fable.md` sections 3, 4.3, 4.5, 5, 6, and 7
Status: complete. No paid call ran. No file except this review was written by this reviewer.

This delta does not authorize spend. It does not authorize the clause-fit build. `S` still does not exist, so this is not the R1 pre-spend review.

## Verdict

**PASS**

Every original H, M, and L repair is present in substance. The paid-section defects that blocked launch are gone.

Three residual record errors remain. None reopens an H issue. Fix them in the next plan edit. They do not require a full re-review.

## Check method

All checks were free and read-only.

| Check | Result |
| --- | --- |
| Terra register SHA-256 | `5d7a0afa7a06dc5f54ef30dea5aeff740f85bda7ead6ee56f352aa5d08243a53` |
| Fable register SHA-256 | `f13c687b642b514d90e6fd3c3899e8b3fc5be1729dcc92eac0ffd32fd173fdd6` |
| 2026-08-29 register SHA-256 | `50dd2d79adae60cba85935776f4bb3458ac191f84a9bb43dc8f94657f9bdbd00` |
| Case-body digest | `0c9face7c641a84c5829416570a1dbf24aa27ff8f02a58528e172f21e0985315` |
| `src/catalog/search.ts` | `04a9aa3d87451fc263aa4ee3df9b31ab8f05c0fcbe8371af5f31c7ed6458f846` |
| `--ids` filter | `cases.filter` over `cases.json` order |
| Even-space rule | `step = pool.length / want`, `pool[Math.floor(i * step)]` in `eval/qa/lib.mjs` |
| `selectJudgeTier` | no history → boundary; `maxPanelCases: 0` returns `single` |
| Pinned `--stability-register` | `prepareJudgeStabilityRegister` loads with `verifySources: false` |
| `--expect-agent-binary-sha256` | asserted at the start of `run-qa.mjs` `main()` |
| Stability panels | still uncapped; `--max-panel-cases` does not consume them |
| Compiled QA | 500 active, 0 quarantined; all eight example ids are present |
| Nearest-rank P90 `ceil(0.9n)-1` | 2026-08-30 `$0.411`; 2026-08-28 `$0.374` |
| Matching max | 2026-08-28 `$0.860`; `20 × 0.860 = 17.20` |
| `node -e` extra path | this Node puts it at `process.argv[1]` |

## Original issue status

| Issue | Status | Evidence |
| --- | --- | --- |
| H1 | repaired | Section 5.3 never keeps more than 20 ids. If `|T| > 20`, only even-spaced picks from id-sorted `T` remain. |
| H2 | repaired | Section 6 adds `--expect-agent-binary-sha256`. Both arms share one hash. |
| H3 | repaired | Section 6 pins an empty register, names the generation command, and requires a free `selectJudgeTier` print of `available`, `0`, and `single`. The `$2.50` cap is valid only for all-single judging. |
| H4 | repaired | Section 5.8 rules 2 and 6 make plan-regrade diagnostic. `FIRST-PAIR-BLOCK` needs the rule-5 trace. |
| H5 | repaired | Section 4.3 names the structured semantic route-fit family. A paid or hosted comparator is forbidden in step 2. See residual R3. |
| H6 | repaired | Sections 5.7 and 5.9 split a verbatim-query miss from a rephrased miss. |
| M1 | repaired | Section 3 title, 3.3, and 7 close only the judge-stability TODO with "stable at 57". NEXT block 2 stays open. |
| M2 | repaired | Section 3.1 records both 2026-08-31 hashes, the 2026-08-29 hash, and the body digest. No regeneration pin. No paid pin this round. No Desktop copy before approval. |
| M3 | repaired, with residual R1 | Bands 7–11 match. The 12-or-more all-count is still wrong. |
| M4 | repaired | Section 5.3 lists the eight QA ids. `q-pc-protocol-upgrade-timing` is named as outside that changed set. |
| M5 | repaired | Section 5.3 step 6 freezes runner order from a dry `cases.json` filter. Section 5.7 checks `meta.selectedIds`. |
| M6 | repaired | Section 5.3 cites the `stratifiedSample` step math. |
| M7 | repaired | Arm cap is `$17.20`. Total ceiling is `$35.40`. No mid-method raise. |
| M8 | repaired | Sections 2, 5.2, and 5.6 require a clean tree including untracked files. Round files must be committed first. |
| M9 | repaired | Section 4.5 starts with the `.dev.vars` placeholder and `npm run typegen`. |
| M10 | repaired | Section 6 judges a scratch copy. The original and the archive stay unjudged. |
| M11 | repaired | Section 6 names the empty-register path, command, hash step, and all-single contract. |
| M12 | repaired | Section 5.4 defines arm A as the product-commit parent. The `main` router claim needs hash `04a9aa3d…`. |
| L1 | repaired | Section 5.5 states nearest-rank P90. Matching values `$0.411` and `$0.374` reproduce. |
| L2 | repaired | Section 5.5 labels the v1 100-row file and the 8-row `2.1.247` arms as extra context. |
| L3 | kept | Sections 5.2 and 5.10 keep the R1 pre-spend review mandatory after `S` exists. |

## Residual findings

These are record errors. They do not reopen H1–H6.

### R1 — leftover M3 arithmetic

Section 3.1 says 12 or more is 13 of 19.

Independent count: 13 unstable of 18. Band 11 is 0 of 1. That 1 is inside the old 19.

Repair: write 13 of 18.

### R2 — "three of the eight" is false

Section 6 says three of the eight example ids sit below `0.75`.

Independent scores: two of eight. `q-hist-remittance-corridors` is 0. `q-protocol-24-whisk-incident` is 0.5. `q-pc-protocol-upgrade-timing` is 0, and it is not in the eight.

The empty-register path is still required. Repair the count to two of eight.

### R3 — attempt one is a blocked brief

Section 4.3 points at `implementation-brief-fable.md`. Section 4.4 calls that experiment attempt one.

`review-grok-clause-brief.md` is **BLOCK**. Do not start that build. Do not treat step 2 as running until that brief is repaired and its own delta review is PASS.

This plan-delta PASS does not lift that BLOCK.

## What this PASS allows

- Close the original plan-review gate.
- Keep the free-first sequence.
- Keep expected paid spend at `$0`.

## What this PASS does not allow

- Any paid call.
- R0 or R1. Those still need frozen `S`, `review-grok-r1-prespend.md` PASS, and user authorization of the exact caps.
- The clause-fit artifact build.
- A product commit.
- A same-100 collection.

The earlier residual notes still hold: the T4 row stays untested under `v2.10`; Friendbot and Raven stay out of scope; repository recovery stays monitor-only until the Horizon probe returns `28`.
