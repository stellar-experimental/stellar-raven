# 2026-11-02 — Stellar Docs migration from Algolia to Mintlify

Branch `feat/mintlify-docs-migration`. Research: `research/services/stellar-docs-mintlify.md`.
TODO: `.agents/TODO.md` → "Move the `stellarDocs` operations from Algolia to the Mintlify API".
Evidence files: `.agents/rounds/2026-11-02-mintlify-migration/`.

## Decisions

1. **Query-term relevance guard.** Mintlify search always returns its nearest sections. The adapter
   reports soft-empty when the search returns nothing, when no candidate is under the operation's
   paths, or when no in-scope section contains a query term. It is a general rule, not a
   per-query list.
2. **`search_doc_titles` is page-level.** One hit per page, ranked by query words in the title (2),
   then in the path (1), then by search rank.
3. **`get_doc_page_sections` → `get_doc_page`.** Returns `{url, path, title, content}`, the whole
   page as Markdown. It retries `<path>/index`, then follows one same-origin site redirect
   (`redirect: "manual"`, no credentials) to a `/docs/` or `/meetings/` path.
4. **Scope matching uses whole path segments.** `/docs/tokens` no longer keeps
   `/docs/tokens-legacy/...`.
5. **Snippets shrink MDX component tags to their attribute values.** `content` is unchanged.
6. **Descriptions stay routing-neutral where possible.** Only the backend facts changed: the
   returns field lists, the soft-empty sentence, the title-search contract, the meetings selector,
   and the RPC reference-page note.

## Retrieval A/B (free, adapter level)

Harness: `retrieval-ab.mts`. Arm A is the Algolia adapter at `03c863a3`. Arm B is this branch.
Jobs: each golden case question sent to `search_docs`, plus up to 8 docs calls per case replayed from
stored QA transcripts. 255 cases with developers.stellar.org golden sources, 1,498 queries.
Results: `retrieval-ab-results.json`.

| Metric | Algolia (A) | Mintlify (B) |
|---|---|---|
| Cases with any golden page hit | 191 | 225 |
| Mean case recall of golden pages | 0.614 | 0.787 |
| Case recall: B better / A better / tie | — | 75 / 8 / 172 |
| Queries that hit a golden page | 603 | 865 |
| Soft-empty results | 80 | 6 |
| Errors | 0 | 0 |
| Latency p50 / p95 / p99 | 107 / 265 / 320 ms | 493 / 1,735 / 3,717 ms |

Transcript replays alone: mean recall 0.617 → 0.751. Question text alone: 0.236 → 0.552.
Every per-operation lane improved except `search_meeting_notes` (2 → 2 golden hits on 16 queries).

Four of 1,498 Mintlify requests exceeded the 8,000 ms first attempt and passed on the retry.

The 8 A-better cases have small deltas. Most come from query wording where Algolia matched an exact
keyword page. `q-builder-content-by-person` lost `/meetings/authors/kalepail`, an author page that
no longer exists on the site.

## Golden page coverage

`page-coverage.json`: 194 golden developers.stellar.org paths. 173 resolve through the page API.
11 are site 308 redirects and 10 are 404s. Both groups were already absent from Algolia, so they
are stale golden references, not migration losses. `get_doc_page` now follows the 308 group.
The 404 group is an eval-side authoring item in `.agents/TODO.md`.

## Routing gate

The legacy lane moved: top-1 219 → 218, top-3 298 → 294, top-5 326 → 327, cardHit5 112 → 113.
Holdout improved: top-3 26 → 27, top-5 29 → 30, passed 24 → 25. Skills is unchanged (17/23/23).
Protocol-history top-1 went 7/8 → 6/8: `ph-yieldblox-oracle-incident` now ranks
`stellarDocs.search_docs_in_category` first.

Per-case cause (token coverage traced with the vendor scorer). The removed Algolia field names in
every docs `Returns:` line supplied incidental tokens to the 60 % coverage gate:
`url_without_anchor` matched "with", `type` matched "types", `lvl1` matched "1", and the old RPC
note supplied "in" (a prefix of "integration"). Losses:

- `q-protocol-ledger-entry-types`: `search_doc_titles` lost "types" (11 → 10 of 16).
- `q-soroban-sac-balance-storage`: `search_docs_in_category` and `search_docs` lost "types".
- `q-sep-catalog-list`: `search_protocol_concepts_docs` lost "with".
- `q-protocol-tier1-org-list`: `search_docs` lost "1".
- `q-infra-horizon-deprecated`: `search_rpc_horizon_data_docs` lost "integration" (top-1 only).
- `q-defi-perps-whitespace`: displaced by `search_doc_titles`.

Gains of the same kind: `q-defi-etherfuse-stablebonds`, `q-infra-hubble-vs-rpc-layer`,
`q-protocol-parallel-execution`, `q-protocol-passkeys-secp256r1`, `q-defi-soroswap-vs-stellarx`,
and the holdout `q-holdout-a-16-current-protocol`.

Decision: re-baseline `eval/gates.json` in the same commit. The output fields must change because
the backend changed, and restoring the lost tokens would be a per-query hack. The root defect is the
vendor scorer's substring and prefix matching on short tokens. It is the general routing repair
already tracked under #223. Zero hit-to-miss regressions is the usual standard. This re-baseline
departs from it on purpose: the old backend no longer updates, so holding is not an option.

Merge re-baseline (later on 2026-11-02): merging `origin/main` at `1539a872` changed 223 skill
entries in the manifest (main's ecosystem-skills updates) and no `stellarDocs` entry. Every lane
total is identical to the 15:05Z baseline, so only the fingerprint (`6e43f09f…`), `baselinedAt`, and
local trace (`routing-2026-11-02T18-20-51-527Z.json`) moved. The merge also brings #310, which
re-verified the five goldens whose `reverifyBy` dates expired, so the stale lane passes.

### Title snapshot held

The new inventory refresh reads page titles from `llms.txt` (666 → 973 titles: +341 path/title
pairs, −34; most additions are API-reference pages Algolia never indexed). A trial rebuild with the
new snapshot changed `keywords` on 7 of 12 docs operations. Against the re-baselined tree it added
two graded losses (`q-infra-hubble-vs-rpc-layer` top-1; holdout `q-holdout-a-05-groth16-soroban`
top-3) and 47 top-five order changes, with no graded gain. The snapshot stays at its Algolia-era
bytes until the general routing repair (#223) lands, the same hold as the 2026-10-08 title
snapshot. The daily refresh will report it as drift.

Final gate: `GATE PASS` with `eval/gates.json` re-baselined to legacy 218/294/327 and the
manifest fingerprint `04065deb…`; local trace `routing-2026-11-02T15-05-00-448Z.json`.

## Golden corpus (golden-truth)

Changed gospel, verified by adapter source (B), spec (B), and live adapter execution (F):

- `q-edge-doc-page-sections-soft-empty`: question, surface, answer, key facts, and avoid now
  describe `get_doc_page` and its 404 soft-empty.
- `q-sor-doc-page-sections-followup`: surface and answer describe full-page Markdown.
- `q-sor-doc-title-discovery`: answer describes page-level hits and `get_doc_page`.

Sibling sweep: five other cases carry only dated evidence strings that name
`get_doc_page_sections` or Algolia. Those are records of past probes and stay unchanged.
`eval:qa:lint -- --stale --since 03c863a3`: the only errors are five pre-existing `reverifyBy`
dates that expired on 2026-11-01 (`q-mpp-discovery-and-modes`, `q-quickstart-manual-ledger-close`,
`q-sor-reflector-integration-code`, `q-zk-host-functions-status`, `q-zk-verification-resource-budget`).

## Improvements

- `sd-003` → `fixed-upstream`. The generated `getTransactions` method page ranks first for the
  original trigger, and its content carries the 1–200 limit. Deletion needs a distinct reviewer and
  a resolution comment on stellar/stellar-docs#2566. Not posted; it needs owner approval.
- `sd-005` and `sd-009`: still reproduce on Mintlify. They are content gaps. Local recurrences only.
- `sd-059` (new, verified): `<ResponseField>` text is not findable in the docs search. See "Paid QA
  diagnostic". Other Mintlify-side asks are in the research note: section anchors in search
  results, a relevance score or threshold, and lower tail latency.

## Whole-page reads close the HackMeridian table-row item

`get_doc_page` returns the whole page, so the oracle-providers testnet table (Q18), the
software-versions table (R22), and the `getEvents` tables (R32) come back complete. A `/meetings`
page reads normally (Q9). The `.agents/TODO.md` item is removed. The software-versions page is
147 KB, so answers rely on host truncation and artifacts for it.

## Paid QA diagnostic

Brief and pre-spend review: `qa-brief.md`, `qa-brief-review.md`. Diagnostic only: 30 IDs is below
the 100-ID paired-verdict minimum, so no PASS/FAIL is claimed.

Run record:

- Runner: this worktree at `dfccf526` for both arms. Arm A server `03c863a3` (Algolia), surface
  `b83aa0e6…`; arm B server `dfccf526` (Mintlify), surface `bb19653b…`. `meta.manifestFileSha256`
  is runner-side, so both artifacts carry the candidate's value.
- Pins: binary `64c327e9…` (2.1.316), env `0fa958e7…`, remote identity probe `aabfb83f…`, stable
  remote vector `70190797…` (three captures), stability register `8a93b230…`, `--max-panel-cases 10`.
- Env amendment: the launch shell also passes `USER` and `LOGNAME`; without them the CLI reported
  `loggedIn: false`. Neither name is in the hashed environment set, so the env pin is unchanged.
- Arm A's Algolia backend was unguarded by the probe. A free `search_docs` call before spend
  returned 5 hits (2026-11-02T15:18:58Z).
- Arm A: 30 of 30 rows, $15.90, guards matched.
- Arm B: stopped after 26 rows, $13.44. The remote guard saw `llms-full.txt` change
  (5,810,884 → 5,831,417 bytes; `llms.txt` unchanged) between 17:07:24Z and 17:08:38Z. Every one of
  the 26 completed rows had matching before and after checks, so those rows are comparable. Missing:
  `q-ti-compute-token-lp-market-data`, `q-ti-enumerate-holders-airdrop`, `q-ti-testnet-usdc-faucet`,
  `q-zk-verification-resource-budget`. Per brief rule 6 there was no re-run. Total spend $29.34 of
  the $60 authorization.

Results on the 26 paired rows:

| Arm | Correct | Partial | Wrong | Half-credit |
|---|---|---|---|---|
| A (Algolia) | 9 | 12 | 5 | 57.7 % |
| B (Mintlify) | 8 | 13 | 5 | 55.8 % |

Eight verdicts changed, four each way. Three review lanes read both transcripts and replayed every
docs call through both adapters (`rows-lane-*` notes are in the session scratchpad; the decisive
evidence is quoted here).

| Row | Slice | A → B | Cause |
|---|---|---|---|
| `q-ti-classic-submission-errors` | downside | partial → wrong | **Backend.** Mintlify never returned the Set Options result-code body (`sd-059`); the agent mapped "bad signer" onto `op_bad_auth`. Algolia returned the `op_bad_signer` ↔ `SET_OPTIONS_BAD_SIGNER` mapping. |
| `q-soroban-instance-storage-dos` | upside | wrong → partial | **Backend.** Mintlify returned the storage-strategies "Red flags in review" section; B's query on Algolia does not. |
| `q-aas-list-token-on-exchanges-aggregators` | upside | correct → wrong | Agent variance: A made a Scout and a Lumenloop call that B did not, and added the exchange-listing caveat. Same docs page in both arms. |
| `q-anchor-endpoint-discovery` | upside | correct → partial | Judge variance on key fact 3 (single judge vs panel); answers equal on the graded point. |
| `q-defi-arbitrage-pathpayment-bots` | downside | correct → partial | Judge variance on an unstable register (0.625). Mintlify retrieved the `/paths` endpoint pages that Algolia missed. |
| `q-mpp-discovery-and-modes` | control | partial → correct | Judge variance. B made no docs call. Golden stale. |
| `q-raph-hardware-wallet` | upside | partial → correct | Agent variance. |
| `q-soroban-reentrancy` | upside | wrong → partial | Agent variance: A dropped the skill's scope qualifier. No docs page mentions reentrancy in either backend. |

Rows wrong in both arms (`q-builder-content-by-person`, `q-raph-remove-scam-token`,
`q-sor-confidential-tokens`) are not caused by the backend. Each `wrong` claim was checked against
live sources. Two goldens are stale because of the 2026-10-21/22 docs changes. A replay of arm A's 14
docs calls for the unrun `q-ti-enumerate-holders-airdrop` shows Mintlify returning the
`list-all-accounts` and Hubble snapshot pages that Algolia missed.

Re-run of the 4 missing rows (owner-authorized, cap $6): server and runner `4388932b` (review fixes
plus the main merge); the surface hash is unchanged (`bb19653b…`). A new stable remote vector was
needed because the docs kept deploying: the first try changed between captures, the second was
stable at 18:47Z (`c1543062…`). All 4 rows ran, guards matched, $2.13.

| Row | A (Algolia) | B (Mintlify) |
|---|---|---|
| `q-ti-compute-token-lp-market-data` | partial | partial |
| `q-ti-enumerate-holders-airdrop` | wrong | partial |
| `q-ti-testnet-usdc-faucet` | partial | partial |
| `q-zk-verification-resource-budget` | correct | correct |

The enumerate-holders gain is the one the lane 3 replay predicted: B's answer cites the
`list-all-accounts` and Hubble snapshot pages that Algolia never returned.

All 30 rows: A 10 correct, 14 partial, 6 wrong; B 9 correct, 16 partial, 5 wrong. Half-credit is
56.7 % in both arms. Total paid spend: $31.47.

Reading: answer quality is flat within single-sample noise. Retrieval gains reach some answers
(instance storage, and better pages on two more rows without a grade change). The one regression
mechanism is general: Mintlify search rarely returns text inside `<ResponseField>` components. On
the 93 files that use them, a ResponseField sentence finds its own page in the top 5 for 8 of 90
pages, against 50 of 84 for a prose sentence (`responsefield-rank.json`). Eight of 25 probed
identifiers, all Horizon string codes, never appear in the 50 candidates (`identifier-probe.json`).

Follow-ups:

- Upstream: `sd-059` (the owner approved filing). `sd-059` stays scoped to `<ResponseField>`. The
  `sd-003` reviewer saw the `getTransactions` limit text inside `<ParamField>` rank poorly, so the
  same sweep ran on the 34 files that use `<ParamField>` (`paramfield-rank.json`). Prose
  sentences on those pages also miss the top 50 (26 of 32), so the weakness there is page-level,
  not component-level. It is not the `sd-059` mechanism, and the pages are still found by
  method-named queries.
- `sd-003`: a distinct reviewer re-derived RESOLVE (`sd003-recheck.md`). The resolution comment is
  posted (`sd003-comment.md`;
  https://github.com/stellar/stellar-docs/issues/2566#issuecomment-6585113964). The resolver runs
  after the Mintlify deploy and the golden audit; see `.agents/TODO.md`.
- Own repo: `.agents/TODO.md` → "Point agents at the page when a docs hit has no body".
- Goldens: the full golden audit (`2026-11-02-golden-audit.md`) owns battery edits, so this branch
  edits none. The five affected cases and their open points are in `golden-handoff.md`; the row
  reviews are `qa-rows-lane-1.md` to `qa-rows-lane-3.md`.
- Mintlify-side ask added to the research note: index `<ResponseField>` text.
- Judge tiering note: a single-judge `correct` is never re-checked, while a single-judge `partial`
  escalates to a panel (`q-anchor-endpoint-discovery`). Recorded here only; no change proposed from
  one row.

## Independent review

Reviewer: Claude Fable 5.1 at high (`branch-review.md`). The author and orchestrator is Claude Opus
5.5. Codex frontier was the matched tier for implementation review; it was skipped because no
Herdr session is running. Commit reviewed: `dfccf526`. Verdict: APPROVE WITH CHANGES.

| # | Finding | Resolution |
|---|---|---|
| 1 | Every `404` became soft-empty | Fixed. A live probe on 2026-11-02 showed distinct bodies: search `{"message":"No results found"}`, page `{"message":"Page not found"}`, unknown subdomain `{"error":"No deployment related to <domain> exists"}`. Only the two `message` forms are absence; any other `404` is `error`. Tests and `docs/stellar-docs.md` updated. |
| 2 | One `get_doc_page` could run 88 s | Fixed. `OPERATION_BUDGET_MS` = 24,000 ms covers all attempts, the `/index` retry, and the site probe. |
| 3 | Heading regexes quadratic on whitespace; a bare `#` line swallowed the next line | Fixed with a linear line parser. The reviewer's inputs (200,000 blank lines; 50,000 spaces) now take ≤ 13 ms. |
| 4 | Live scripts read the retired `nbHits` | Fixed: `candidates`. |
| 5 | Held title snapshot described as `llms.txt`-derived | Fixed: `inventory/README.md` and the drift summary name the hold. |
| 6 | Stale `x-algolia` comment | Fixed. |
| 7 | Snippets dropped `Vec<Val>` generics | Fixed: MDX tags shrink outside fenced code only. |
| 8 | Redundant `include` prefix in `search_docs_in_category` | Declined. Behavior is identical, and the edit changes the manifest fingerprint in `eval/gates.json` for no behavior change. |

The review also confirmed the red `eval:qa:lint -- --stale --enforce-floors` lane predates this
branch (five `reverifyBy` dates expired on 2026-11-01).

## Production switch-over

On 2026-11-02 the owner approved the switch-over. The steps ran in this order:

1. The `MINTLIFY_ASSISTANT_API_KEY` GitHub secret was set at 18:23 UTC. The Worker secret was set
   earlier the same day.
2. CodeQL flagged two `js/incomplete-url-substring-sanitization` alerts in test stubs. Commit
   `e5357463` changed both checks to exact host matches. All PR checks passed.
3. PR #309 was squash-merged as `5d7a4f88`.
4. The deploy ran from a clean detached worktree at `5d7a4f88`. The preflight passed. The rollback
   target was version `50fd8784-b76d-4faa-9fc0-f95dd5e8471b`. The new version is
   `358fd0f5-5263-4a0c-87d1-a909c8aff100`. The usage tail and retention checks passed.
5. Live checks on `https://raven.stellar.org`:
   - The landing page and `GET /health` returned `200`. An unauthenticated `POST /mcp` returned
     `401` with `resource_metadata`.
   - All 12 `stellarDocs.*` operations returned `ok` through the production `execute` tool. Search
     results carry the Mintlify `candidates` field.
   - `get_doc_page` returned whole pages (Setup, 8,368 characters; Fee-bump transactions, 9,695).
   - A missing page and a nonsense query each returned `soft-empty`.
6. No runtime, CI, or refresh code reads `ALGOLIA_*_DOCS`. The secrets were deleted from the
   Worker (19:03 UTC; this created version `66cd90da-b96a-4789-9266-adcb16407d5d`) and from the
   GitHub repository. The checks in step 5 passed again after the delete.
7. The `ALGOLIA_*_SITE` pair stays. It belongs to the dormant `stellarOrg` spec.

One reference to the deleted names remains: `source.authEnv` in the held
`inventory/stellar-docs-titles.json` (see "Title snapshot held"). Nothing reads it. The first
refresh after the #223 hold ends rewrites the file without a key.

## Algolia surface retirement

PR #320 (merged `42496f22`, deployed as Worker version `b048356d`) removed the dormant stellar.org
Algolia spec, every `ALGOLIA_*_SITE` binding, and stale Algolia prose. The `ALGOLIA_*_SITE` secrets
were then deleted from the Worker (current version `499f58ba`) and from the GitHub repository. On
2026-11-02 the owner asked to clean local env files. The `ALGOLIA_*` lines were deleted from the main
checkout `.env` and `.dev.vars` and from this round's worktree. The golden-audit worktree belongs to
another session, which was asked to clean its own `.dev.vars`. The separate `stellar-raven-jev`
repository still uses its own Algolia connector and keys; it was left unchanged.

## sd-003 retirement

Conditions from `sd003-recheck.md`: the resolution comment was posted on stellar/stellar-docs#2566,
the Mintlify adapter is live in production, and the golden audit (#319) released the battery.

Production recheck (2026-11-02T20:02Z, Worker `499f58ba`): `search_docs` 'getTransactions API
reference limit', and `search_rpc_horizon_data_docs` 'getFeeStats', 'getTransaction status
NOT_FOUND', and 'Horizon list all transactions endpoint' each rank the named reference page first.
`get_doc_page` returns the getTransactions 1–200 / default 50 text. `search_docs` 'op_bad_signer'
still misses the result-code page (`sd-059`).

Golden changes (`golden-truth` skill; rootCause `improvements/resolved.json entry sd-003`):

| Case | Change |
|---|---|
| `q-gap-rpc-horizon-unindexed-reference` | Premise reversed: reference pages are searchable by name; response-field text ranks poorly; new avoid item for the false exclusion claim. |
| `q-pc-doc-category-validator-search` | Path filter and `pathFiltered` replace breadcrumbs and the Algolia hierarchy field; both soft-empty causes named. |
| `q-edge-doc-title-zero-hits` | A zero title result is soft-empty and inconclusive, not a reliable zero. |
| `q-infra-rpc-methods-list`, `q-pc-practical-fee-setting`, `q-pc-tx-finality-failure-semantics` | The `sd-003` partial cap is removed. |
| `q-ti-rpc-gettransactions-pagination-xdr` | The `sd-003` note is marked resolved; the `sd-004` caution stays. |

Sibling sweep: `git grep` for unindexed, search-index, `sd-003`, breadcrumb, hierarchy-facet, and
reliable-zero wording over the battery. Four other matches are truth history only. The
`unindexed-api-refs` catalog-note trap floor in `eval/qa/lint-corpus.mjs` was removed, because the
catalog note it guarded no longer exists.

Independent review: Claude Fable 5.1 at high re-derived each claim from classes A, B, and C/E
without the author's notes (`sd003-golden-review.md`). Verdict: APPROVE WITH CHANGES; no blocker.
All three should-fix items and three of four nits are fixed: the resolver ran in this change, the
response-field claim no longer extends to ParamField, this section exists, the second soft-empty
cause is named, the `queryEvents` evidence is exact, and the "indexed-title" avoid wording is gone.
The reviewer re-swept the nine reopened register entries as consistent
(`sd003-register-review.json`).

The resolver retired `sd-003` to `improvements/resolved.json` with resolving ref
stellar/stellar-docs#2941.

## Open items

- None for the switch-over. Follow-ups are in `.agents/TODO.md`: section anchors, `sd-059`, the
  golden-audit hand-off, and the `sd-003` retirement.
