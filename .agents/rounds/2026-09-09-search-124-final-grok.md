# Issue #124 final review — Grok 4.6 high — 2026-09-09

Reviewer: Grok 4.6, high effort.
Author: Sol (eight source/test files plus generated `catalog/manifest.json`).
Orchestrator: parent on this branch.
This reviewer is not the author and is not the orchestrator.

No source edit, gate edit, paid call, Wrangler use, inventory refresh, or external write.
This file is the only write.

Compared against `.agents/rounds/2026-09-09-search-124-design-grok.md`.
Author report `.agents/rounds/2026-09-09-search-124-implementation-sol.md` is complete and was read.
This lane treats that report as context, not proof.

Independent catalog check versus `origin/main` (`58898790348b05601bc70b992507f0a8ba6aed0c`):
strip only `routingPhrases` from worktree entries, then canonical JSON equals `origin/main` and `HEAD`.
253 entries. 26 Scout ops carry phrases. `generatedAt` stays `2026-09-09T16:34:39Z`.
Main/HEAD catalog SHA-256 remains `83d9998f984cae38c363524e0592c6d035e80ba09cc27003f7a65e11bb0350f9`.

Independent focused tests: `npx vitest run test/search.test.ts test/extract-routing-phrases.test.ts test/catalog.test.ts` → **145 passed** (re-run `2026-09-09T15:06:14-04:00`).

## Verdict

**PASS** the accepted-`1.9.1` search experiment for issue #124.

This is a behavior PASS.
At measurement time it was not fingerprint acceptance and not numeric rebaselining.
Those `gates.json` statements below record the pre-decision tree. Root later approved fingerprint-only acceptance. See the dated delta at the end.

The selector implements the restated intent test.
It does not encode the two leaderboard strings or `scout.getLeaderboard` in runtime code.
Both original issue queries improve at default `limit: 5`.
Scorer admission and scores stay the same.
A 544-row frozen comparison changed **zero** pages.
Those 544 rows do not contain the two original trigger strings.

`npm run eval:routing -- --gate` exits 1 only on the catalog SHA-256 fingerprint.
Accepted totals match exactly.
Step 4 allows an explicit fingerprint update after this case-level review.
It does not allow a hidden threshold change.

## Scope

Candidate placement: branch `fix/search-structured-intent-124` on merged main `5889879`.
Runtime experiment files (unstaged on that branch):

| Path | Role |
|---|---|
| `src/catalog/extract-routing-phrases.ts` | new phrase extractor |
| `test/extract-routing-phrases.test.ts` | new extractor tests |
| `src/catalog/search.ts` | overflow reservation |
| `src/catalog/types.ts` | `routingPhrases` schema |
| `scripts/build-catalog.mjs` | phrase ingest, `notFor` still excluded |
| `test/catalog.test.ts` | phrase catalog tests |
| `test/search.test.ts` | trigger and boundary tests |
| `catalog/manifest.json` | generated; 26 Scout ops gain `routingPhrases` only |

At measurement time, `src/catalog/scoring.ts`, `eval/gates.json`, and `inventory/stellar-light.json` were byte-equal to `5889879`.
`scoring.ts` and the Scout inventory remain byte-equal. `eval/gates.json` later received the fingerprint-only write reviewed in the delta.
Scout OpenAPI remains `1.9.1`.
Catalog entry ids remain 253.
The only catalog value change is the new `routingPhrases` key on 26 Scout operations.
`generatedAt` stays `2026-09-09T16:34:39Z`.

HEAD / `origin/main` catalog SHA-256: `83d9998f984cae38c363524e0592c6d035e80ba09cc27003f7a65e11bb0350f9`.
Worktree catalog SHA-256: `0745b09421e0ad56e4398dcdabde8477a047c3852bb4c528567b8af0028abcfd`.
Removing `routingPhrases` from the 26 Scout entries makes the worktree manifest equal `origin/main`.

Ignored as non-runtime: `.agents/rounds/2026-09-09-outstanding-closeout.md`, `.agents/TODO.md`, and any later `eval/gates.json` / `eval/README.md` / `ARCHITECTURE.md` fingerprint or docs edits.
Those files are not selector behavior.

## Design match

The committed design required dropping the four-token floor.
The code uses description coverage `>= 2` instead.

| Design rule | Code |
|---|---|
| Description covers at least two query content tokens | `descriptionMatches.length < 2` returns null |
| One contiguous positive phrase | loop over `entry.routingPhrases`; never join two phrases |
| Phrase overlaps at least two query tokens | `phraseMatches.length < 2` skips |
| Phrase adds a token the description lacks | `phraseMatches.some(token => !descriptionTokens.has(token))` |
| Description plus that phrase cover every content token | `structuredIntentCoverage === queryTokens.length` |
| Ignore schema `keywords` | intent functions never read `entry.keywords` |
| Skip `retrievalProfile.lane === "detail"` | missing lane is not detail |
| Never move the first same-service hit | `indexes.slice(1)` |
| Replace at most one later slot per service at quota | one `gated.find` per full-quota service |
| Restore existing score order | sort by score, then id |
| Gated overflow only | selector runs on `scoreEntryWeighted` output before ungated backfill |
| No operation id or query list in the selector | none in `search.ts` or the extractor |

`src/catalog/search.ts` does not mention `getLeaderboard` or the two issue strings.
A catalog test asserts the published `keywords` item `top projects` on `scout.getLeaderboard`.
That is a source sentinel, not a runtime special case.

A synthetic test promotes a **three-token** query when the description covers two tokens and one phrase completes the third.
That is the required correction, not the old four-token floor.

## Original triggers

Independent `searchCatalogPage` against the worktree catalog, control = same catalog with `routingPhrases` stripped.

### `top projects by GitHub activity`

Control: `scout.searchProjects` 165, `lumenloop.find_similar_projects_semantic` 155, `lumenloop.find_content_by_entity` 145, `scout.searchRepos` 139, `skills.lumenloop.stellar-project-dossier` 90. `total` 41.

Candidate: same first three and last skill hit. Slot four is `scout.getLeaderboard` 108 gated. `total` 41, `truncated` true.
First hit unchanged. Scout count stays 2.
Control and candidate keep the same 165/155/145/90 scores on shared hits.
`getLeaderboard` keeps gated score 108. The scorer did not admit a new card or change that score.

### `top Stellar projects by GitHub activity`

Control: dossier 199, `scout.searchProjects` 185, ecosystem-scout 165, `scout.searchRepos` 159, `stellarDocs.get_doc_page_sections` 157. `total` 33.

Candidate: dossier 199, `scout.searchProjects` 185, ecosystem-scout 165, docs 157, `scout.getLeaderboard` 129 gated. `total` 33, `truncated` true.
First hit unchanged. Scout count stays 2.
`searchRepos` leaves; `getLeaderboard` enters and sorts by its existing gated score 129.
Shared hits keep 199/185/165/157. Admission is unchanged.

These two queries are **not** in the 544 frozen rows.
`rg` over `eval/routing-cases.json`, `eval/skills-cases.json`, `eval/holdout-cases.json`, and `eval/protocol-history-cases.json` finds neither string.
The 544 identity check is a no-harm test.
It cannot prove the issue fix. The two probes above do.

## Boundary tests

Command: `npx vitest run test/search.test.ts test/extract-routing-phrases.test.ts test/catalog.test.ts`

First independent run: 3 files, **145 passed**, 1.13s, started `2026-09-09T14:58:52-04:00`.
Second independent run after author-report close: **145 passed**, 1.07s, started `2026-09-09T15:06:14-04:00`.
The `-04:00` offset matches local listing of `routing-2026-09-09T19-06-43-311Z.json` at `15:06`.

Covered in those tests:

- description-only full match does not qualify
- three-token remainder rule does qualify
- two-token query with one description token does not
- ungated overflow cannot enter
- schema `keywords` cannot qualify
- two source phrases cannot combine
- `detail` lane cannot replace
- one later Scout slot moves; scores, total, truncation, first hit, and Scout count stay
- Scout-only pages and exact `scout.getLeaderboard` stay source-identical
- named source-drift controls stay source-identical
- phrases do not join separate keyword items
- `notFor` does not create a `leaderboard` phrase on `getBuilders`
- ADR-0003 scans phrase tokens

## 544 source-identical comparison

Denominator: 338 legacy + 122 extended + 23 skills + 49 holdout + 8 protocol-history positives + 4 controls = **544**.

Control A: worktree search + worktree catalog with `routingPhrases` removed.
Candidate: worktree search + worktree catalog.

Result: **0** page changes (`id`/`score`/`tier`, `total`, `truncated`).

Control B: accepted trace `eval/results/routing-2026-09-09T16-44-14-655Z.json` (catalog SHA `83d9998f…`).
Candidate trace: `eval/results/routing-2026-09-09T18-59-36-518Z.json` (catalog SHA `0745b094…`).

Result: **0** `topHits` diffs and **0** grade-field diffs across 544 rows.

Accepted totals hold: legacy 213 / 279 / 312, card 95; skills 16 / 23 / 23; holdout 10 / 22 / 26, forbidden 11, passed 21.
Protocol-history remains diagnostic FAIL at 4/8 and 2/4 control captures, same as the accepted baseline.

## Quota at varied limits and tie order

`serviceQuota(limit)` is `max(2, ceil(limit * 0.4))`.
The selector runs only when a service occupies **exactly** that quota on the already-diverse page.
It then replaces at most one later slot (`indexes.slice(1)`).
Backfilled extras make `indexes.length !== quota`, so the selector is a no-op.

Independent mixed-service pages, phrase-stripped control vs candidate:

| Query | limit | quota | Scout slots | Membership change |
|---|---:|---:|---:|---|
| short | 1 | 2 | 1 | none |
| short | 2 | 2 | 1 | none |
| short | 3 | 2 | 1 | none |
| short | 5 | 2 | 2 | `searchRepos` → `getLeaderboard` |
| short | 10 | 4 | 4 | none; `getLeaderboard` already fits |
| short | 20 | 8 | ≥4 | none |
| short | 50 | 20 | ≥4 | none |
| long | 1–3 | 2 | 1 | none |
| long | 5 | 2 | 2 | `searchRepos` → `getLeaderboard` |
| long | 10–50 | 4–20 | ≥4 | none; `getLeaderboard` already fits |

Default MCP search is `limit: 5`. That is the failing quota.

Scout-only `limit: 2` is the other exact-quota case.
Control: `searchProjects`, `searchRepos`.
Candidate: `searchProjects`, `getLeaderboard`.
First Scout hit stays. Rank and score of `searchProjects` stay 165 / 185.
Scout-only `limit: 5` and `limit: 10` are byte-identical to control, because backfill already includes `getLeaderboard` and `indexes.length !== quota`.

Tie order: shared equal scores stay `lumenloop.get_project` then `lumenloop.get_related_projects` at 134.
That is score-desc, then id-asc.
The selector’s final sort uses the same rule.
Limit-50 raw score order is not monotone because gated/backfill interleave already existed.
Control and candidate match there. This is not a selector regression.

Every shared hit keeps the same score and gated/backfill tier.

## Phrase metadata in emitted model text

`routingPhrases` is catalog-only selection metadata.

Independent checks:

- `searchCatalogPage` JSON has no `routingPhrases` key.
- `SearchHit` fields are `id`, `service`, `kind`, `score`, `tier`, `description`, `signature`, `outputKeys`, `outputItemKeys`.
- `catalogEntryView` (`codemode.catalog`) copies id, service, kind, description, schemas, optional retrievalProfile, optional runnable. It omits `routingPhrases` and `routingKeywords`.
- `describeCatalogEntry` (`codemode.describe`) uses the same public fields plus usage/signature. It omits phrases.
- `specs/`, `src/mcp/`, and `src/site.ts` have no `routingPhrases` references.
- Scorer reads `routingKeywords`, not `routingPhrases`. Phrase ingest therefore cannot change admission or scores.

ADR-0003 scans phrase tokens at catalog build. That is a host leak guard, not model text.

The committed generated manifest still stores the phrases on disk.
The model-facing search/describe/catalog/spec surfaces do not emit them.

## Gate fingerprint vs numeric rebaseline

`eval/run-routing.mjs --gate` has two separate checks.

1. **Fingerprint** (`gateEvidenceFailures`): SHA-256 of `catalog/manifest.json` and the three frozen case files must match `eval/gates.json` `evidence.inputs`.
2. **Numeric**: legacy 338 top-1/3/5 stay inside the ±1% band of 213/279/312; skills top-1 floor 16; holdout floors 10/22/26 and forbidden ceiling 11.
   `evidence.acceptedTotals` is the recorded identity of those counts.

This experiment fails (1) and passes (2).

`run-evals` Step 4 says: on FAIL, if the change is a regression, fix or revert; if the numbers moved legitimately, re-baseline `gates.json` in the same commit, record the decision, and check per-case hit→miss regressions.
It forbids hidden threshold edits.

Two later owner acts exist. They are not the same act:

| Act | What changes | When it is legitimate | This experiment |
|---|---|---|---|
| Fingerprint-only acceptance | `evidence.inputs` SHA for `catalog/manifest.json`, plus `note` / `baselinedAt` / `localTrace` | After case-level review shows no grade or page movement | Allowed by Step 4 after this review. At measurement time root had not approved. Root later approved and implemented it. |
| Numeric rebaselining | `legacy` / `skills` / `holdout` floors or `acceptedTotals` | Only if counts actually moved and per-case losses were accepted | **Not justified.** Counts are identical. Changing floors would hide a threshold change. |

This reviewer’s PASS covers behavior and the case-level review Step 4 needs for a later fingerprint-only write.
It does not approve that write.
It does not approve a numeric rebase.

CI `--gate` stays red until root records the fingerprint. That red is bookkeeping, not a ranking failure.

Actual acceptance criteria for this experiment:

1. Design remainder rule is in code, not the four-token floor.
2. Both original #124 queries keep `scout.getLeaderboard` at default limit 5, without moving the first Scout hit or changing scores, totals, or tiers.
3. Selector has no operation-id or query-list special case.
4. Boundary tests pass.
5. 544 frozen-lane pages and grades stay identical on accepted Scout `1.9.1`.
6. Scorer, labels, and gate **thresholds** stay unchanged.
7. Phrase metadata does not appear in search/describe/catalog model text.

Authority:

- This reviewer: PASS on 1–7.
- Root fingerprint-only `gates.json` write: not approved at measurement time; later approved and checked in the dated delta.
- Numeric rebase remains unjustified.

## Commands

```sh
git diff --name-status HEAD
npx vitest run test/search.test.ts test/extract-routing-phrases.test.ts test/catalog.test.ts
node --experimental-strip-types --input-type=module   # original triggers + 544 phrase-stripped compare
npm run eval:routing -- --gate
```

Independent compare artifact: `/tmp/search-124-544.json` (`n` 544, `changed` []).

## Residuals (non-blocking)

- `routingPhraseSchema` allows a one-token phrase; the extractor still drops those.
- Protocol-history diagnostic remains FAIL. It is outside the routing gate and unchanged.
- Scout-only `limit: 2` also swaps the later quota slot. Default mixed `limit: 5` is the issue surface. This is exact-quota behavior, not a frozen-lane change.

## 2026-09-09T19:06:43Z acceptance-delta verdict

**PASS** the fingerprint-only `gates.json` write.

This is Step 4 fingerprint acceptance, not numeric rebaselining, not production acceptance, and not #124 closure.

Independent `eval/gates.json` vs `5889879`:

Changed keys only: `baselinedAt` (`2026-09-09T18:59:36.518Z`), `evidence.inputs[0].sha256` (`0745b09421e0ad56e4398dcdabde8477a047c3852bb4c528567b8af0028abcfd`), `evidence.localTrace` (`routing-2026-09-09T18-59-36-518Z.json`), and `note`.
Unchanged: `$comment`, `gradingRule`, `holdoutNote`, legacy/skills/holdout numeric objects, `acceptedTotals`, and the three non-catalog input SHA-256 values.
The catalog file SHA-256 equals the new fingerprint.

Root post-acceptance gate `eval/results/routing-2026-09-09T19-06-43-311Z.json`: `gate.pass` true, failures empty.
All 544 complete rows (`topHits` and other grade fields) exactly equal accepted passing `routing-2026-09-09T16-46-02-887Z.json`.
Counts remain 213/279/312, 16/23/23, 10/22/26, forbidden 11, passed 21.

`ARCHITECTURE.md` now states the implemented selector: post-diversity, gated overflow, two description tokens, one positive phrase with two-token overlap and one missing description token, full coverage, weaker-coverage later slot, no detail lane, score-desc/id-asc restore, separate `routingPhrases`, no `notFor`, 256-token complete phrases, no schema-keyword or combined-phrase evidence.
That matches `preserveStructuredIntentWithinServiceQuota` and `extractRoutingPhrases`.

`eval/README.md` and `.agents/rounds/2026-09-09-outstanding-closeout.md` both say this local fingerprint acceptance does not deploy and does not close #124.

`localTrace` names the 18:59 fingerprint-fail stamp, which is the optional evidence pointer.
The post-write passing stamp is `19-06-43-311Z`. Both 544-row sets match `16-46-02-887Z`. Not a numeric change.

Earlier statements that `eval/gates.json` was byte-equal to `5889879` and that root had not approved a write are pre-decision measurements. They remain true of that tree. They are not the current fingerprint file.

No source re-review. No paid or live check.

## Findings

None that block a behavior PASS of this #124 experiment on accepted Scout `1.9.1`.
None that block the fingerprint-only gate write.

The independent review is complete.
Sol is idle. No source editing remains in progress.

Root moved this unchanged candidate onto `fix/search-structured-intent-124`.
HEAD is merged main `58898790348b05601bc70b992507f0a8ba6aed0c`.
The eight runtime files were not rewritten in that switch.
Catalog SHA-256 is still `0745b09421e0ad56e4398dcdabde8477a047c3852bb4c528567b8af0028abcfd`.
Metadata-only files from merged main, or later docs/fingerprint edits, are not candidate behavior changes.
Original command timestamps in this report remain the measurement record.

The pre-decision close here still stands as measurement: numeric thresholds must not change.
Root later implemented fingerprint-only acceptance. See the dated delta.
