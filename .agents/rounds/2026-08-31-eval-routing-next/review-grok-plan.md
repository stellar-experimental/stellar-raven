# Independent plan review — eval stability and protocol-history routing

Date: 2026-08-31
Reviewer: Grok 4.6 high
Author: Claude Fable 5 high (`plan-fable.md`)
Orchestrator: Claude Fable 5 high
Reviewed file: `.agents/rounds/2026-08-31-eval-routing-next/plan-fable.md`
Status: complete. No paid call ran. No code or shared ledger changed.

This review does not authorize spend. It does not authorize a product commit.

## Verdict

The free-first sequence is sound. Do not run a same-100 collection in this round.

The judge-stability TODO can close. Whole NEXT.md block 2 cannot close.

Do not start step 2 until the allowed-mechanism list matches the Sol design.

Repair the R0, R1, and R2 defects before any later paid delta review.

## Evidence this review checked

All checks were free and read-only.

| Check | Result |
| --- | --- |
| Branch | `next/eval-routing-stability` |
| `HEAD` | `1bfb9838491fa571166a2a631789a3b0e814980c` |
| `origin/main` | same commit |
| Tree | four untracked round files; not a clean paid-launch tree |
| Plan file hashes | all ten listed hashes match the worktree bytes |
| `JUDGE_RUBRIC` | `v2.10` |
| Pack | `p5` |
| Routing trace | `eval/results/routing-2026-08-31T15-02-56-852Z.json` |
| Protocol-history trace | `eval/results/protocol-history-2026-08-31T15-02-49-140Z.json` |
| Gate | `PASS`; legacy 208/279/311; skills 16/23/23; holdout 10/22/25 with 11 forbidden captures |
| Frozen diagnostics | 4/8 and 1/4; 3/11 and 6/9; both `FAIL` |
| Extended strict | 90/109/117 |
| Dump composition | 338 + 122 + 23 + 12 = 495. Holdout and blind sets are outside the dump. |
| Worktree `eval/qa/results` | absent |
| Desktop results | 163 collection files and 34 rejudge files that match the register name rule |

Register files this review hashed:

| File | SHA-256 |
| --- | --- |
| Terra `/tmp/qa-register-2026-08-31.json` | `5d7a0afa7a06dc5f54ef30dea5aeff740f85bda7ead6ee56f352aa5d08243a53` |
| Fable scratch `stability-refresh-2026-08-31.json` | `f13c687b642b514d90e6fd3c3899e8b3fc5be1729dcc92eac0ffd32fd173fdd6` |
| 2026-08-29 durable register | `50dd2d79adae60cba85935776f4bb3458ac191f84a9bb43dc8f94657f9bdbd00` |

The Terra file and the Fable file share one case body.
The case-body digest is `0c9face7c641a84c5829416570a1dbf24aa27ff8f02a58528e172f21e0985315`.
The `_meta` objects match after `generatedAt` is removed.
Terra `generatedAt` is `2026-08-31T14:59:16.388Z`.
Fable `generatedAt` is `2026-08-31T15:01:08.296Z`.
Both used 197 artifacts: 163 collections and 34 rejudges. Both register 538 cases.

The proposed durable path does not exist:

`/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/2026-08-31-eval-routing-next-stability.json`

## Block 2 — can it close?

The TODO item is: "Judge stability on the same-100 set is degrading".

Done when: the next post-collection refresh shows a stable or falling unstable-count trend, or the policy accounts for the drift.

This refresh is the post-2026-08-30 collection refresh. The unstable count stayed at 57.

The count trend is stable. The policy did not change.

Close that one TODO item at round closeout. Record the two file hashes, the case-body digest, the 4-in/4-out lists, and the mean-score drop.

Do not close NEXT.md block 2. That block still holds the Raven diagnostic and the Friendbot monitor.

Do not write "block 2 is done". The plan title overstates the close.

The 47 to 57 jump did not reverse. It held. A close note must say "stable at 57", not "no degradation".

## What the 57 count means

The 57 is the number of pinned same-100 IDs with `stabilityScore < 0.75`.

It is not a judge-only noise rate. Collection artifacts add a new answer and a new verdict. Rejudge artifacts hold the answer fixed. The register mixes both.

The committed 23.3% noise floor is identical-input rejudge noise. It is a different quantity.

Independent same-100 totals:

| Register | Unstable | Mean score | Pooled events / comparisons |
| --- | ---: | ---: | ---: |
| 2026-08-29 | 57 | 0.7137 | 277 / 920 = 0.301 |
| 2026-08-31 Terra and Fable | 57 | 0.7085 | 311 / 1023 = 0.304 |

Four IDs entered the unstable set:

- `q-gap-builders-person-empty`
- `q-history-ecosystem-index-freshness-live`
- `q-protocol-ledger-close-time` (0.75 to 0.60)
- `q-soroban-sdk-macros`

Four IDs left:

- `q-edge-fresh-latest-scf-round`
- `q-org-sdf-enterprise-fund`
- `q-quickstart-manual-ledger-close`
- `q-sor-p23-auto-restore-extendto`

The set moved. The count did not.

The threshold 0.75 allows at most 0.25 events per comparison. The pooled rate is 0.30. The 57 of 100 count sits near that rate. That reading is fair for the count. It does not erase the earlier 47 to 57 jump.

The plan table that says "10 comparisons 15 of 24" is wrong as labeled.

Independent buckets for the refresh:

| Comparisons | Unstable | All same-100 |
| ---: | ---: | ---: |
| 7 | 28 | 51 |
| 8 | 13 | 23 |
| 9 | 1 | 2 |
| 10 | 2 | 5 |
| 12 or more | 13 | 19 |

The 15 of 24 figure is the lump of 10 or more, not the 10-comparison band.

A later same-100 collection with this register selects 57 uncapped panels and 43 singles. That is 214 judge calls.

The 2026-08-30 panel-row mean was `$0.244`. The single-row mean was `$0.0617`. `57 × 0.244 + 43 × 0.0617` matches the stored judge spend `$16.5629124`. Future briefs must use those means.

## Two register hashes and the durable copy

Two hashes do not mean two schedules. They mean two files with different `generatedAt` values.

`generateStabilityRegister` writes `generatedAt` and source `mtimeMs` into `_meta`. A second run of the same sources cannot reproduce the file SHA-256.

Do not pin "the 2026-08-31 register" by regenerating it.

Pin one existing file by copy. Record its full SHA-256. Also record the case-body digest `0c9face7…`. Use the body digest to prove reproduction.

The round ledger already says no register is pinned for paid use. Keep that rule for this round. This round has no paid method that consumes the register.

If a later method needs a pin, copy one of the two existing files at authorization time. Do not regenerate.

The proposed desktop name does not match the collection or rejudge name rule. A later refresh will not ingest it. That part is safe.

Terra said not to copy into a durable results path before approval. That is the right paid-method rule. A closeout copy is optional documentation only. It is not a paid pin.

The worktree has no `eval/qa/results`. A default refresh from this tree would be empty. Any refresh command must keep `--results-dir /Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results`.

## Same-100 deferral

Agree. Do not spend on another same-100 collection now.

Reasons that hold:

- No shipped product candidate exists.
- The owner product-loss margin is still open.
- The stored same-100 artifact uses rubric `v2.9`. Current rubric is `v2.10`.
- The reviewed T4 exclusion leaves 99 eligible IDs. The powered method needs 100.
- A new collection cannot repair that old paired result.

Trigger for later spend: a merged product candidate that needs a paired look, plus the owner margin in `.agents/NEXT.md`. Calibration spend alone is not a reason.

The Method 2 shape of `$50` per collection remains the right cap shape. Stored same-100 totals are `$31.9693122`, `$40.9579502`, and `$45.711693`. The median is `$40.96`.

Terra's optional one-row `v2.10` rejudge of `q-eco-stellar-wallets-list` stays out of this round. That is acceptable. Record the T4 defect as still untested under `v2.10`.

## R0, R1, and R2 validity

The unpaid routing slice idea is the right product check. The current method text cannot launch.

### R0

R0 uses `q-protocol-24-whisk-incident` with `--no-judge`.

The QA question equals `ph-protocol-24-archival-root-cause`. A candidate that passes 8/8 will rank `scout.searchResearch` for that string in the dump.

R0 does not test the dump. It tests the answering agent's own search query. The agent can rephrase the question. A miss then does not prove that the dump is wrong. The stop rule overclaims.

Search hits are readable. `eval/qa/search-projection.mjs` stores `hits[].id`. That part of R0 is valid.

The case `tags.service` is `stellarDocs`. The golden `surface` is `stellarDocs.search_protocol_concepts_docs`. A successful research route can move execute onto Scout. See H4.

### R1 ID rule

The dump has 495 IDs. Holdout and blind IDs are outside it. Blind coverage stays a free ship gate. That split is acceptable.

`S = C ∩ active QA IDs` is the right overlap rule. Compiled QA has 500 active cases and 0 quarantined.

The `|S| > 20` cap is broken. The text keeps every top-1 change, then fills to 20. If more than 20 IDs change top-1, `S` exceeds 20. The `$13` arm cap and the "at most 20" reading rule then fail.

If `|S| < 4`, skip R1. That is acceptable.

`--ids` does not keep CLI order. `run-qa.mjs` filters `cases.json` order. Freeze the runner `selectedIds` order, not lexicographic id order.

Even-spaced fill has no formula. Use the existing sampler step: `step = pool.length / want`, then `floor(i * step)` on an id-sorted pool.

The example nine-ID list is wrong. The 2026-08-30 15-change candidate has eight QA IDs, not nine. `q-pc-protocol-upgrade-timing` was not in that changed set. Actual QA overlap:

`q-comp-clawback-cap0035`, `q-hist-remittance-corridors`, `q-protocol-24-whisk-incident`, `q-protocol-bls12-381-cap59`, `q-scf-funding-by-category`, `q-sep-clawback-prereq-flag`, `q-tool-skill-detail-install`, `q-tool-which-sdk-comparison`.

### R1 reading rules

Completeness first is correct. No arm-level claim from an incomplete arm.

The plan-regrade drop rule fights the product goal. `requiredCovered` uses planned services. The motivating case is tagged `stellarDocs`. A real research fix can add Scout and drop Docs. Rule 2 would call that a regression. FIRST-PAIR-BLOCK then becomes possible for a correct candidate.

Use plan-regrade as a diagnostic. A block still needs the transcript trace in rule 5.

FIRST-PAIR-PASS correctly forbids a QA gain claim. Keep that sentence.

### R2

`--judge-stored` does accept `--max-panel-cases 0` on an unjudged artifact. `--no-judge` does not stamp `meta.judgeTiering`. `resolveStoredPanelCaseLimit` then applies the override.

`--max-panel-cases 0` does not stop stability panels. `run-qa.mjs` says so. Stability panels are uncapped.

Of the eight true QA overlap IDs, three are already unstable: `q-hist-remittance-corridors` (0), `q-protocol-24-whisk-incident` (0.5), `q-pc-protocol-upgrade-timing` is unstable but was not in that changed set.

The R2 command omits `--expect-agent-binary-sha256`. `main()` asserts that flag before the `--judge-stored` branch. The command fails before a judge call.

`--judge-stored` writes in place. Do not judge the only desktop archive copy.

The `$2.50` per-arm cap assumes one call per row. A stability panel mean is `$0.244`. A 20-ID arm with many unstable IDs can hit the cap and stop incomplete.

To force no panels, do one of these:

1. Use a register with no usable history, plus `--max-panel-cases 0`.
2. Pin a register in which every `S` ID scores at or above `0.75`.
3. Raise the cap and record uncapped stability panels.

Do not claim "no panels" from `--max-panel-cases 0` alone.

Confirm the chosen no-panel path with a free dry command before spend. The plan already asks for that confirmation. Keep it as a hard gate.

## Caps

Collection cost evidence matches the stored artifacts, with small P90 gaps.

| Stored run | Plan mean / P90 / max | Independent mean / P90 / max |
| --- | --- | --- |
| `2026-08-30T03-43-11` | 0.244 / 0.414 / 0.650 | 0.244 / 0.412 / 0.650 |
| `2026-08-28T19-27-08` | 0.240 / 0.384 / 0.860 | 0.240 / 0.375 / 0.860 |
| `2026-08-27T00-02-11` | 0.337 / 0.509 / 0.969 | 0.337 / 0.497 / 0.969 |
| 8-row A1 | 0.281 | 0.281 |
| 8-row B1 | 0.297 | 0.297 |

The 8-row arms used agent binary `2.1.247`, not `2.1.251`. The 2026-08-27 100-row file is `qa-agent-result-v1` and has no binary pin. The "matching 2.1.251" heading overstates those two rows.

`R0` cap `$1.00` covers the stored maximum. Keep it.

The arm cap `$13.00` is `20 × $0.650` from the closest run. The 2026-08-28 maximum is `$0.860`. `20 × $0.860 = $17.20`. A 20-row protocol-history slice can stop incomplete under `$13`. The plan admits that. A stop then forbids arm B. That risk is real.

Do not raise a cap mid-method. If the method needs a higher arm cap, set it in the later delta review before authorization.

R2 cap `$2.50` per arm is only safe for all-single judging.

## Pins

The section 2 source pins are correct. This review reproduced them.

Paid launch still needs a clean tree including untracked files. This tree currently has:

- `.agents/rounds/2026-08-31-eval-routing-next.md`
- `plan-fable.md`
- `eval-analysis-terra.md`
- `routing-analysis-sol.md`

Commit those files, or paid `run-qa.mjs` refuses.

The worktree still lacks `.dev.vars` and `env.d.ts`. Section 4.5 runs `npm run typecheck`. That command fails until the `AGENTS.md` placeholder and `typegen` steps run.

`.dev.vars` with `DEV_ALLOW_UNAUTHENTICATED=true` is required for the live server. Record it as an operator prerequisite, as the 2026-08-29 ledger did.

R0 and R1 commands include `--server-revision`, `--expect-sha256`, and `--expect-agent-binary-sha256`. Keep them.

R2 must add `--expect-agent-binary-sha256`. Both R2 arms must share one binary hash.

Keep the five-name environment check from the 2026-08-29 ledger. Both answering arms must share one environment hash.

Arm A is the parent of the product commit. That isolates the product diff. Do not assume the parent equals `1bfb983` if a measurement commit already moved the router.

One Wrangler process at a time is a hard rule. The plan states it. Keep it.

## Stop conditions

Keep these stops:

- Any failed pin in 5.6
- Incomplete row, missing cost, MCP not connected, or `comparable: false`
- Exact cap reached
- No extra retry beyond the harness transport retry
- Record arm A before arm B
- No judge, no repeat, and no second slice under the collection authorization

Change the R0 stop. A missing `scout.searchResearch` hit is a failed qualification. It is not proof that the dump is false. Inspect the stored query string before you abandon the candidate.

Do not run R2 under the R0/R1 authorization. The plan already separates it. Keep that split.

## Completion gates

Required before step 2 implementation:

1. Reconcile this review.
2. Reconcile the Sol mechanism with the allowed-family list. Do not spend the three-attempt box on a family this plan forbids.
3. Keep measurement commits first and one product commit last.
4. Keep both frozen case files byte-stable.

Required before a product commit merges:

1. Both frozen contracts pass: 8/8 and 0/4; 11/11 and 0/9.
2. Routing gates stay at 208/279/311, 16/23/23, and holdout 10/22/25 with at most 11 forbidden captures.
3. Independent Grok high product review at `.agents/rounds/2026-08-31-eval-routing-next/review-grok-product.md` is PASS.
4. Every finding is reconciled.

Required before R0 or R1:

1. This plan review is reconciled.
2. The product commit exists on a clean tree.
3. `S` is frozen with runner order and `caseInputSha256` values.
4. The pre-spend delta review at `review-grok-r1-prespend.md` is PASS.
5. The user authorizes the exact caps after that review.
6. This review is not that delta review. `S` does not exist yet.

Required before R2:

1. The row review documents a fact that the transcript cannot settle.
2. The no-panel path is proven with a free dry command.
3. `--expect-agent-binary-sha256` is present.
4. The user authorizes a separate `$5.00` cap.

Required at closeout:

1. Record every command and its output in the round ledger.
2. Update `eval/README.md` for the candidate result, or state that nothing shipped.
3. Update `eval/qa/README.md` with the two calibration facts in plan 3.3.
4. Delete only the judge-stability TODO. Keep or retarget the routing TODO.
5. Update NEXT.md blocks 2 and 3 without calling block 2 complete.
6. File upstream findings only for a verified service gap. The ranking defect is own-repo.
7. Run `typecheck`, `test`, `build`, `secrets:scan -- --tree`, and `eval:routing -- --gate`.

## Mechanism-list conflict

Sol's design is a pairwise semantic route-fit reranker.

The plan allows only:

- a query-shape feature through manifest profiles
- a generated catalog-note change in `scripts/`
- a retrieval-profile edge change the schema already supports

Those families are not the Sol mechanism.

The plan also forbids case vocabulary, gated coverage-failed hits, full-page research backfill, a fixed bonus, and a classifer that maps diagnostic classes. Those forbids still stand.

A cross-encoder may need model inference. Step 2 is a `$0` eval step. A paid or hosted comparator is out of that box.

Do not start the three-attempt box until the plan names the Sol family as allowed, or Sol names a family this plan allows.

If no allowed family can pass both frozen contracts, stop. Keep the branch measurement-only. Use the stated trigger: a non-lexical retrieval lane, or an upstream Scout query hint.

## Actionable issues

### H1 — Severity: bug

The `|S| > 20` rule can exceed 20 IDs.

Repair: never keep more than 20 IDs. If top-1 changes exceed 20, take an id-sorted even-spaced 20 from that set. Do not fill past 20.

### H2 — Severity: bug

R2 omits `--expect-agent-binary-sha256`. The command fails in `main()` before judging.

Repair: add the flag. Use the same hash on both arms.

### H3 — Severity: bug

`--max-panel-cases 0` does not disable stability panels.

Repair: state an explicit no-panel path. Prove it with a free dry command. Recost the cap if panels remain.

### H4 — Severity: bug

A plan-regrade drop is treated as a candidate regression. The motivating case is tagged `stellarDocs`. A correct Scout research route can drop Docs coverage.

Repair: plan-regrade is diagnostic. FIRST-PAIR-BLOCK still needs the transcript trace in rule 5.

### H5 — Severity: bug

The allowed-mechanism list rejects the Sol design. Step 2 cannot start.

Repair: reconcile the family list before any product attempt.

### H6 — Severity: bug

R0 treats a missing agent search hit as proof that the dump is false.

Repair: compare the stored search query with the case question. A rephrased miss is a failed qualification, not a dump contradiction.

### M1 — Severity: suggestion

The plan title says block 2 is done. Only the judge-stability TODO can close.

Repair: close that TODO with "stable at 57". Keep Raven and Friendbot open.

### M2 — Severity: suggestion

The two register hashes are not interchangeable pins.

Repair: copy one existing file. Record its SHA-256 and the case-body digest. Do not regenerate. Do not pin it for paid use in this round.

### M3 — Severity: suggestion

The comparison-count table labels the ≥10 lump as "10 comparisons".

Repair: print the real buckets. The 15 of 24 figure is 10 or more.

### M4 — Severity: suggestion

The example S list includes `q-pc-protocol-upgrade-timing` and claims nine QA IDs. The 15-change candidate has eight QA IDs.

Repair: use the eight-ID list, or drop the example.

### M5 — Severity: suggestion

`--ids` order is battery order, not CLI id order.

Repair: freeze `meta.selectedIds` from a dry filter.

### M6 — Severity: suggestion

Even-spaced fill has no formula.

Repair: cite `eval/qa/lib.mjs` `stratifiedSample` step math on an id-sorted remainder.

### M7 — Severity: suggestion

The `$13` arm cap sits below the 2026-08-28 maximum.

Repair: either accept a likely incomplete stop, or set the arm cap from `20 × $0.860` in the later delta review.

### M8 — Severity: suggestion

Paid launch requires a clean tree including untracked files. The round files are untracked.

Repair: commit the round files before any paid command.

### M9 — Severity: suggestion

Section 4.5 runs `typecheck` without the `.dev.vars` and `typegen` setup.

Repair: add those two steps to the candidate command list.

### M10 — Severity: suggestion

`--judge-stored` writes in place.

Repair: judge a copy. Keep an unjudged archive.

### M11 — Severity: suggestion

R2 has no `--stability-register` pin. The worktree results dir is empty. That empty dir may accidentally yield all-single judging. A desktop cwd would panel.

Repair: name the register path and the intended panel contract.

### M12 — Severity: suggestion

Arm A is described as the same router as `main` `1bfb983`. Measurement commits can move the router.

Repair: define arm A as the product-commit parent. Verify `src/catalog/search.ts` against `1bfb983` if that claim is needed.

### L1 — Severity: nit

P90 values in the cap table do not match an independent percentile on the same files.

Repair: quote `meta` row costs with one stated percentile method.

### L2 — Severity: nit

The 8-row connector arms and the 2026-08-27 100-row file are not 2.1.251 `qa-agent-result-v4` matches.

Repair: label them as extra context.

### L3 — Severity: nit

This review is not the R1 pre-spend review. The plan already names a later path. Keep it mandatory after `S` exists.

## Residual non-blocking notes

The T4 `partial-without-issue` row remains untested under rubric `v2.10`. That is acceptable for this round.

The Friendbot item stays monitor-only. Agree.

The Raven capability-boundary diagnostic stays out of scope. Agree.

Repository-tooling recovery stays monitor-only until the free Horizon probe returns `28`. Agree.

No deployment, push, or pull request belongs in this round. Agree.

Upstream `improvements/` stay empty unless a transcript shows a service gap. The ranking defect is own-repo. Agree.

## Required repairs before the next action

Before step 2:

- H5 mechanism-list reconciliation
- M1 close language
- M2 register identity
- M3 and M4 record repairs
- M9 typecheck setup

Before any paid delta review:

- H1 through H4 and H6
- M5, M6, M7, M8, M10, M11, M12
- H2 and H3 if R2 remains in the brief

After those repairs, this review does not need a full rewrite. A bounded delta review of the repaired paid section is enough.

Do not spend until that delta review is PASS and the user authorizes the exact caps.
