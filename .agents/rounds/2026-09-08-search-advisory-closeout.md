# Search directory advisory closeout

## Scope and authority

The owner approved the recommendations for issues #109 and #124 on 2026-09-08.
The author used Sol high. The coordinator used Astra. The independent reviewer uses Grok 4.6 high.
The isolated advisory preserves ranking. The broader scoring candidate remains outside this branch.

Base: `8ab7b88f95177022cd24c0d0acb6e619b19ea23c`, merged maintenance PR #135.
PR #135 passed CI and merged at `2026-09-09T03:43:29Z`.
Its runtime files are identical to the earlier base `b2dbde53e9c9910b6d49a87ccea829555eeb4ef1`.

The author supplied an isolated seven-file patch from the existing search worktree.
Patch SHA-256: `b2076acb17852462a4b87ffc8a10be021e95efac498c3a31e4c6a1c7d9015a93`.
The root applied it through `apply_patch` on `fix/search-directory-advisory`.
The existing combined patch remains in `/Users/kalepail/Desktop/sr-wt-search-name-ranking`.
No reset, stash, or discard occurred.

## Design

A query with one content token can receive one directory recommendation in `widerCandidates`.
The query must not identify an operation name under the selected service filter.
The manifest recovery graph selects the directory operation. No query or operation ID receives a special rule.
The recommendation stays outside hits, scores, totals, pagination, and confidence.
Its text recommends a bounded lookup only when ranked hits do not identify the requested entity.
It makes no entity-existence claim and executes no lookup automatically.

Two-content-token names do not receive this new recommendation.
Skill-only requests suppress it. Service filters constrain it.
Public MCP and Playground search expose the same recommendation shape and conditional guidance.
The sandbox uses the shared search result shape.

Changed runtime files: `src/catalog/search.ts`, `src/mcp/tools.ts`, and `src/demo/tools.ts`.
The scorer, manifest, exposure, frozen cases, and gate thresholds remain unchanged.

## Root verification

- Typecheck passed.
- All 1,995 final tests passed across 108 files.
- All 85 final smoke tests passed across four files.
- The Wrangler build dry run passed.
- Routing gate and eval self-tests passed.
- The diff whitespace check passed.

Initial routing result: `eval/results/routing-2026-09-09T03-46-26-701Z.json`.
Final routing result after review repairs: `eval/results/routing-2026-09-09T04-01-09-936Z.json`.
Clean baseline: `eval/results/routing-2026-09-09T02-03-08-425Z.json`.
The root compared complete `cases`, `extendedCases`, `skillsCases`, `holdoutCases`, and `protocolHistoryCases` arrays.
All 544 rows matched exactly in both runs, including ranked IDs, scores, and grades.
The serialized five-array object has SHA-256 `99d09b507c468d2bc2c56ccd0d2fd2d4fc2ad19e50ec7d1c09d5382281c993ef` on both sides.

| Instrument | Result |
| --- | --- |
| Legacy | 213/279/312 top 1/3/5; exact card 95/182 |
| Extended | 90/110/116 top 1/3/5; exact card 17/28 |
| Skills | 16/23/23 top 1/3/5; exact card 23/23 |
| Frozen holdout | 10/22/26 top 1/3/5; 11 forbidden captures; 21 passed |
| Protocol-history v1 diagnostic | 4/4/4 positives; two control captures; existing diagnostic failure |

The separate v2 command stopped as expected: both contracts are `source-expired` on `manifest-sha256`.
It scored no question. Artifact: `protocol-history-2026-09-09T03-48-30-744Z.json`.
No contract repin, paid evaluation, or answer-quality claim follows from these checks.

## Production before deployment

The root queried all seven reported names through production Raven MCP search with default kind and limit five.
The compact results are in `2026-09-08-search-advisory-production-before.json`.
None had a directory recommendation before deployment.
These reads made no service lookup, signing, submission, or paid model request.

## Release completion

The tracked-tree secret scan passed. The independent final review passed at `2026-09-09T04:01:36Z`.
Commit `677ffe4cf1e526c964feb03f4b80ecd19731cdd1` passed every PR #137 check.
PR #137 merged at `2026-09-09T04:05:30Z` as `f6d31dc07705bc16d83696fc234506534b1e2b5e`.
Deployment preflight proved a clean tree with HEAD equal to origin/main.
Wrangler deployed Worker Version `b8e5dd1d-d965-401d-92dd-96091639a1a7` from that merged commit.
Deployment readback shows 100 percent at `2026-09-09T04:07:34.057Z`.
The previous deployment is Worker Version `c08f9e17-661b-40e4-af1d-2ece67b02fb7`.
Production acceptance passed for all seven reported names on 2026-09-09.
Their complete ranked IDs, scores, tiers, totals, and truncation flags match the committed before artifact exactly.
Each now includes `scout.searchProjects` with basis `short-query-directory` and conditional lookup guidance.
The production boundary checks passed for ordinary terms, two-token names, skill-only searches, and all three service filters.
Sandbox `codemode.search` independently returned the same freighter ranking and advisory.
These checks executed no upstream directory lookup or paid model operation.
The compact production result is `2026-09-09-search-advisory-production-after.json`.
Issue #109 closed after https://github.com/stellar-experimental/stellar-raven/issues/109#issuecomment-5595645825 recorded production acceptance.
The root verified the comment body and author byte-for-byte before closure.
Issue #124 remains open. The combined candidate has a separate routing-gate failure and unaccepted source dependencies.
Its measured update is https://github.com/stellar-experimental/stellar-raven/issues/124#issuecomment-5595611718.
The root verified that body and author byte-for-byte. No scoring code or new source pin deployed.
The independent production closeout review passed through `2026-09-09T04:16:00Z`.
Report: `2026-09-09-production-closeout-review-grok.md`. It rechecked deployment, ranking artifacts, issue states, and source boundaries.
The evidence-only follow-up passed improvements lint, live intake checks, whitespace checks, and secret scans.

## Preserved #124 candidate

The author finished six bounded designs and retained the final combined candidate without a release claim.
Its local gate fails on legacy top-five `319 > 315`. The thresholds and frozen labels did not change.
Legacy exact-card totals are 95/182 on both base and candidate; extended totals are 17/28 on both.
The root independently recomputed the substitutions: 14 legacy losses and gains, plus two extended losses and gains.
Equal totals do not resolve the case-level losses.
The dated-launch case replaces `lumenloop.search_content_semantic` with `scout.searchProjects`; directory data does not replace dated launch content.

The candidate returns `scout.getLeaderboard` at rank four for `top projects by GitHub activity` on accepted Scout 1.9.1.
The jobs and Blend examples remain rejected-source 1.9.48 fixture evidence, not production acceptance.
The v1 diagnostic changes from 4/4/4 positives with two control captures to 3/3/4 with zero captures.
The author corrected the baseline control count after the root read `protocolHistoryLane.controlTop5Captures` directly.

No independent reviewer accepted the remaining 16 losses. No scoring code from that candidate entered this branch.
The root retained the concrete release blockers in TODO and NEXT.

## Independent review reconciliation

The first review found stale public descriptions and missing boundary tests.
The root corrected SEARCH_DESCRIPTION, EXECUTE_DESCRIPTION, PLAN, and the architecture table to describe both advisory triggers.
The root retained bounded broad guidance after directory advice on zero-hit pages.
The root added exact default-kind ranking and page-fact tests, service filters, hyphenated names, and zero-hit composition tests.
The regular-plural matcher now handles short identity tokens such as `rfp` and `rfps` uniformly.
The matcher does not add a `person`/`people` exception. Semantic matches can remain ranked while literal identity matching stays unresolved.
The guidance states that token boundary explicitly and remains conditional; it executes no directory lookup automatically.
The reviewer accepted this boundary and reconciled H1, H2, and M1–M5.

The corrected description initially exceeded the existing clipped-prefix budget.
The full suite caught one failure: the open-world breadth rule fell outside the first 2,048 characters.
The root shortened the Returns paragraph without weakening the existing prefix test.
All 14 instruction tests then passed. The final full suite passed all 1,995 tests, and the final routing gate passed.
The root recomputed the complete 544-row comparison after that repair; the same digest and equality hold.
Grok independently reran all 14 instruction tests and issued final PASS on the applied tree.
All actionable findings are reconciled in `2026-09-08-search-advisory-independent-review-grok.md`.
