# Protocol-history attempt three — Terra evidence analysis

Date: 2026-09-01
Lane: independent evidence analysis
Scope: free, read-only review only

## Decision

**Recommendation: HOLD.**

The evidence does not support a third product mechanism.
No measured family meets either frozen contract.
No measured family preserves the routing gate.
The two completed attempts reject their exact mechanisms.
They do not prove that all future mechanisms will fail.
They do leave no positive result for a production recommendation.

An attempt-three brief needs a new causal claim.
It must test that claim before production work.
It must not use a case identifier or copied case wording.

## Frozen comparison contract

The target operation is `scout.searchResearch`.
`protocol-history-routing-v1` has eight positives and four controls.
Every positive needs the target in the top five.
Every control must exclude the target from the top five.

`protocol-history-blind-v1` has 11 positives and nine controls.
It applies the same top-five rule.
The original content digest is `5b8ee40f89c846c4e69fa91f5a483f9d224dd79628afa7f9ac45b522f9aaa8a8`.
The blind content digest is `b63cfb605bd98aeba6981535be7bd5ee968e1e8b48ee92a1d55e4d5b07521f53`.

Every candidate also needs the routing gate.
That gate protects legacy, skills, holdout, extended, and accept-either readings.
It also protects the fixed strict top-one result for `q-protocol-version-history-list`.
The comparison set has 495 rows.
The referee reports every changed ranking.

The lexical identity is red on both frozen contracts.
It has 4/8 original positives and one original control capture.
It has 3/11 blind positives and six blind control captures.

## What attempts one and two falsified

### Attempt one: lexical rescue and clause-fit bi-encoder

The initial lexical rescue tests reject a simple corpus-backfill mechanism.
All corpus-scope backfill changed 243 of 495 rankings.
It reduced legacy results to 188/265/314.
The research-and-corpus profile rule changed 126 rankings.
It reduced legacy results to 206/275/308.

The narrow full-page rule kept the routing gate.
It surfaced one named positive at rank five.
It increased original control captures from one to two.
It increased blind control captures from six to eight.
It kept blind positives at 3/11.

This falsifies scope-only rescue and lexical-tier relaxation as a safe general mechanism.
It does not falsify every metadata-based route decision.

The completed `clause-fit-hysteresis-v1` test used Qwen clause vectors.
It used 683 frozen clauses across 79 searchable entries.
It excluded keyword fields.
It used best positive evidence minus excess negative evidence.
It tested pure fit and margins 0.03, 0.06, and 0.10.

No grid passed the full acceptance table.
Margins 0.03 and 0.06 raised blind top-five positives from three to four.
Both still failed the frozen controls and routing gate.
The 0.10 reading had the fewest routing-gate failures.
It still retained 4/8 original positives, 3/11 blind positives, and the baseline captures.

This falsifies this clause-level bi-encoder, max-clause fit, and one-pass hysteresis grid.
It does not test aggregate multi-clause evidence.

### Attempt two: pairwise cross-encoder

The completed `cross-encoder-fit-v1` test reused the frozen clause set and candidate union.
It replaced only the model class.
It used `Xenova/bge-reranker-base` with direct query-clause pair encoding.
It used a raw-logit sigmoid and a local-only pinned snapshot.

Pure fit reached 5/8 original positives.
It also captured two original controls and failed the routing gate.
It changed all 495 comparison rankings.
This result shows a recall and precision trade-off.

Margins 0.05, 0.10, and 0.20 retained lexical frozen counts.
They had 4/8 original positives, one original control capture, 3/11 blind positives, and six blind control captures.
Every margin failed the routing gate.
The 0.20 margin changed 215 rankings and still had four gate failures.

Terra recomputed every reading from the stored cache.
The cache had 563 queries and 383,273 pair scores.
The recomputation confirmed `FAIL` and a null selection.

This falsifies this pairwise cross-encoder, max-clause fit, and fixed hysteresis grid.
It does not test a different evidence aggregation rule.
It does not justify another margin sweep.

## General mechanism families

### 1. Source-need classification with calibrated abstention

**Causal hypothesis.**
A query can require a research source even when its highest lexical operation does not.
A query-level route decision can add that source only with sufficient generic evidence.

**Training-free signals.**
Use source-family authority, operation kind, retrieval-profile lane, and score distribution.
Use the top-score gap, the number of represented source families, gated or backfill tier, and coverage count.
Use catalog `purpose`, `useWhen`, and `notFor` data only.
Do not use frozen case text, identifiers, classes, or answer facts.

**Likely failure mode.**
Generic history or incident language also appears in hostile controls.
The current lexical baseline already captures six blind hostile controls.
A weak classifier will add research whenever a page lacks source variety.

**Implementation seam.**
Place a reference policy after `scoreCandidates()` in `searchCatalogPage()`.
The policy can decide whether one research-family candidate may enter the selected page.
It must run before paging and keep the existing scorer unchanged.

**Frozen comparison.**
Compare both frozen contracts, the routing gate, and the 495-row ranking diff.
Also retain the fixed protocol-version top-one guard.

**Cheapest falsification test.**
Build a temporary offline policy from current ranked candidates and catalog metadata.
Run it once over the 563 referee queries.
Stop if any control capture increases or any routing gate fails.

**Evidence state.**
Attempt one rejects scope-only backfill, not calibrated source-need classification.
No result shows this family improves both contracts.

### 2. Set-level marginal evidence diversification

**Causal hypothesis.**
The top five can contain redundant evidence from one source family.
A research operation can add more answer-grounding value than a near-duplicate candidate.

**Training-free signals.**
Use candidate service, operation kind, retrieval lane, tier, lexical score, and score gap.
Use the current page's family count and operation repetition.
Use the existing diversity selection inputs.
Do not use query-to-operation mappings.

**Likely failure mode.**
Source variety does not establish research relevance.
The mechanism can promote research into technical or user-support controls.
The full-page rescue result shows that one safe-looking insertion can worsen controls.

**Implementation seam.**
Use a reference selector beside `diversifyByService()` in `searchCatalogPage()`.
It should replace only a low-marginal-value candidate on a complete page.
It must preserve the tier boundary and `TIER_INTERLEAVE_MARGIN` outside the reference harness.

**Frozen comparison.**
Use both frozen contracts and the complete routing gate.
Inspect every newly inserted research operation in the 495-row diff.

**Cheapest falsification test.**
Replay one fixed diversity rule over the current lexical candidate lists.
Require no new frozen control capture before measuring any positive gain.

**Evidence state.**
The repository already diversifies by service.
No evidence shows that another diversity pass separates wanted research from hostile controls.

### 3. Aggregate evidence over independent routing clauses

**Causal hypothesis.**
One clause can be ambiguous.
Several independent clauses can jointly identify an operation's evidence role.
An aggregate score can preserve a direct match while recognizing combined provenance signals.

**Training-free signals.**
Use the existing frozen clause roles and sources.
Use top-k positive scores, positive-minus-negative gaps, support count, and score dispersion.
Use only reconstructed catalog, inventory, and workflow clause text.
Do not add case-derived clauses.

**Likely failure mode.**
Many similar catalog statements can count the same evidence repeatedly.
This can promote broad research operations into controls.
Negative clauses may not cover the hostile shapes.

**Implementation seam.**
Use `clauseFit()` and `entryFitsFromPairScores()` in the reference harness.
Keep production code unchanged.
The candidate union and frozen clause artifact must remain byte-stable.

**Frozen comparison.**
Compare the same two frozen contracts, gate table, and 495-row ranking diff.
Require the identity reading to reproduce the lexical baseline.

**Cheapest falsification test.**
Recompute a single pre-registered aggregate from the retained cross-encoder score cache.
This needs no model load, model fetch, or new pair scoring.
Stop on any control regression or gate failure.

**Evidence state.**
Both completed attempts use a maximum positive clause.
Neither attempt tests multi-clause aggregation.
The evidence supports a cheap diagnostic only.
It does not support a production change.

### 4. Recovery-graph route expansion

**Causal hypothesis.**
A narrow operation can lead to a broader evidence operation through catalog recovery edges.
A graph expansion can expose an untried evidence route after a weak primary page.

**Training-free signals.**
Use `retrievalProfile.recoverWith`, lane, relation, tier, page completeness, and candidate count.
Use no learned model and no frozen-case wording.

**Likely failure mode.**
The current wider-candidate path activates only for all-backfill pages.
Many failing protocol-history pages have complete gated pages.
The mechanism can therefore miss positives without changing controls.
Relaxing its trigger risks the same false captures as backfill rescue.

**Implementation seam.**
The present seam is `deriveWiderCandidates()` in `src/catalog/search.ts`.
It returns guidance, not a top-five hit.
It cannot pass the frozen contract without a separate ranking policy.

**Frozen comparison.**
The frozen contract counts only top-five `scout.searchResearch` hits.
Guidance outside the page has zero contract value.

**Cheapest falsification test.**
Read current recovery edges for all 32 frozen questions.
Count target reachability without changing rank order.
Stop if the target is unreachable for any positive.

**Evidence state.**
This family cannot satisfy the current contract in its current form.
It is not an attempt-three product candidate.

## Evidence-based conclusion

The two completed attempts reject two different clause relevance models.
Attempt one also rejects uncomplicated lexical rescue.
The remaining families are hypotheses without a measured positive result.

The aggregate-evidence family has the lowest new measurement cost.
It can reuse the retained cross-encoder cache.
It remains unsupported for production.
The correct present decision is a hold.

If work resumes, authorize only a reviewed measurement brief.
Use one pre-registered aggregate rule and cache-only computation.
Do not run another model, fetch, margin sweep, production edit, or paid lane.

## Commands and results

All commands were free and read-only except directory creation for this report.
No dependency install, model fetch, model load, paid call, contract change, or production edit occurred.

| Command | Result |
| --- | --- |
| `pwd && sed -n '1,260p' AGENTS.md && sed -n '1,260p' .agents/skills/run-evals/SKILL.md` | Read the repository rules and the selected eval runbook. |
| `sed -n '261,620p' .agents/skills/run-evals/SKILL.md; rg --files .agents eval` | Read the remaining runbook and located protocol-history materials. |
| `sed -n '621,980p' .agents/skills/run-evals/SKILL.md; rg --files .agents/rounds` | Completed the runbook and located both completed attempt records. |
| `wc -l` over the requested ledgers, contracts, harnesses, and vectorize files | Measured 5,670 lines in the initial requested code and records. |
| `sed` over `.agents/NEXT.md`, `.agents/TODO.md`, `eval/EVALS.md`, and `eval/vectorize/README.md` | Read the current queue, eval contract, and prior experiment results. |
| `sed` over the protocol contracts and `eval/run-protocol-history.mjs` | Read both frozen contracts and their exact top-five grader. |
| `sed` over the 2026-08-30 and 2026-08-31 attempt ledgers | Read the baseline, rejected lexical paths, clause-fit outcome, and cross-encoder outcome. |
| `sed` over both attempts' briefs, reconciliations, reviews, implementations, and result checks | Read the reviewed hypotheses, pins, acceptance tables, and cache-only verification. |
| `sed` over `eval/vectorize/*.mjs`, `src/catalog/scoring.ts`, and `src/catalog/search.ts` | Read the vectorize harnesses, scoring logic, candidate union, tiering, and recovery seams. |
| `rg -n` over `src`, `eval/vectorize`, and `eval/run-routing.mjs` | Located `searchCatalogPage`, scorer exports, protocol checks, and vectorize call sites. |
| `node -e` over `package.json` scripts | Confirmed the available protocol-history, routing, and vectorize commands. |
| `git status --short` | Returned no output. The worktree was clean before this report. |
| `git rev-parse --short HEAD` | Returned `7c2c285`. |
| `git hash-object` over both contracts and the clause artifact | Returned `a3b6d679eea451bf50fb83f225f678b43c42b797`, `c63fc968c0f61d3d73df88d774017ed6a76172b2`, and `3f0c3c766433c2754b06f7a5e117155cc5c93cf2`. |

The report directory was created with `mkdir -p .agents/rounds/2026-09-01-protocol-history-attempt-three`.
That command only created the requested report path.
