# Docs crawler ingestion follow-up

Lane: bounded independent Sol read-only verification.

Observation window: **2026-09-09T16:39:56Z–16:50:48Z**.

Repository branch: `maintenance/drift-141`.

Repository HEAD: `1ef0cdd2bd839c156ec175e04b61df9db51926b9`.

## Scope and authority

This lane followed the checkpoint after `2026-09-09T12:05Z`.
It covered Raven #130, Raven #132, `sd-039`, `sd-042`, and `sd-047`.

I read these instructions and records before the live checks:

- `AGENTS.md`
- `PLAN.md`
- `ARCHITECTURE.md`
- `.agents/TODO.md`
- `.agents/rounds/2026-09-08-docs-index-execution-astra.md`
- `improvements/README.md`
- `research/services/stellar-docs-algolia.md`
- The improvements-pipeline, truth-maintenance, and golden-truth skills
- The three active finding files

I used only read operations.
I made no paid call.
I created no agent.
I posted no GitHub comment.
I changed no crawler, index, rule, setting, finding, golden, or generated artifact.
This report is the only file that this lane wrote.

## Verdict

All three findings are **fixed** at their original live triggers.
The new crawl ingested every corrected source record.

| Finding | Result | Fresh original-trigger result | Retirement state |
| --- | --- | --- | --- |
| `sd-039` | **fixed** | `managed Channels` returns the corrected Tools records. Neither record uses the old alias. | Ready for a distinct deletion review. Not terminally retired. |
| `sd-042` | **fixed** | The TODO query returns the corrected EVM record. Exact `"deprecated Horizon API"` returns zero hits. | Ready for a distinct deletion review. Not terminally retired. |
| `sd-047` | **fixed** | `3-5 seconds` no longer returns Validators. Exact `"every 3-5 seconds"` returns zero hits. | Ready for a distinct deletion review. Not terminally retired. |

No finding remains `still-repro`.
No finding result is inconclusive.

The crawler schedule interpretation remains inconclusive.
That residual does not block these ingestion verdicts.

## Crawler and index state

Crawler ID: `79c5d36e-ce6e-4ec3-bed3-04a30818122d`.

The crawler detail read completed at `2026-09-09T16:39:56Z`.

| Field | Value |
| --- | --- |
| `name` | `Stellar Docs` |
| `running` | `true` |
| `blocked` | `false` |
| `reindexing` | `false` |
| `lastReindexStartedAt` | `2026-09-09T12:00:02.394Z` |
| `lastReindexEndedAt` | `2026-09-09T12:03:55.702Z` |
| `blockingError` | `null` |
| `error` | `null` |
| `status` | `null` |
| `schedule` | `every 1 day at 12:00 am` |
| `renderJavaScript` | `false` |
| `rateLimit` | `8` |

The start URL remains `https://developers.stellar.org`.
The sitemap remains `https://developers.stellar.org/sitemap.xml`.
The action still matches `https://developers.stellar.org/**`.

`GET /crawl_runs` returned `logs:[]` at `2026-09-09T16:40:11Z`.
It exposes no named terminal run result.
The end timestamp and serving-index change establish the completed crawl.

The URL statistics read completed at `2026-09-09T16:40:34Z`.

| URL status | Reason | Count |
| --- | --- | ---: |
| `DONE` | `success` | 661 |
| `SKIPPED` | `http_redirect_invalid` | 6 |
| `SKIPPED` | `http_not_found` | 179 |
| `SKIPPED` | `unmatched_file_type` | 10 |

The response total is 856 URLs.
It contains no `FAILED` row.
The prior report showed `success_from_cache` for all 661 successes.
This read shows `success` instead.

Both serving indexes changed during the completed crawl.

| Index | Entries | `updatedAt` |
| --- | ---: | --- |
| `crawler_Stellar Docs - Docusaurus` | 14,806 | `2026-09-09T12:03:49.402Z` |
| `docs_replica_agent` | 14,806 | `2026-09-09T12:03:49.402Z` |

The prior primary timestamp was `2026-09-08T12:03:01.745Z`.
The prior completed crawl ended at `2026-09-08T12:03:10.118Z`.

The stored expression still says `12:00 am`.
The observed new start again occurred near `12:00Z`.
Algolia documents explicit schedule times in UTC.
The cause of this mismatch remains unknown.

Reference: https://www.algolia.com/doc/tools/crawler/apis/configuration/schedule

## Deployment and source state

The two deployment reads matched the handoff identifiers.

| Change | Deployment run | Result |
| --- | --- | --- |
| PR #2806, `ad0accbd0da545ccba12b5a01fd5dc9e387977f8` | https://github.com/stellar/stellar-docs/actions/runs/34242504493 | `success`, ended `2026-09-08T15:10:43Z` |
| PR #2723, `df8417ab9de4eb75e893e81c2c262fe9d274318f` | https://github.com/stellar/stellar-docs/actions/runs/34255828473 | `success`, ended `2026-09-08T17:19:07Z` |

The new crawl started after both deployments.
The current Docs head is `db501fe9f2d856f2b38c4da7bf57b325806fe842`.
Its commit timestamp is `2026-09-08T23:05:42Z`.

Named source reads returned these current blob IDs:

| Source path | Blob ID |
| --- | --- |
| `docs/tools/README.mdx` | `86243e6cf3cc2a672668726cbf94fe87a9cead24` |
| `docs/tools/openzeppelin-relayer.mdx` | `8ef7a6f219393fb8495fecc848982e1f37d78a13` |
| `docs/learn/migrate/evm/smart-contract-deployment.mdx` | `c7b63187d38d9d368e7eadade08df45d88bff886` |
| `docs/validators/README.mdx` | `f74c26290ba7653f584805bb3b02867b97aee3af` |
| `docs/learn/fundamentals/stellar-stack.mdx` | `06c92f8dbcd2f30e0f855bd18bf7abbc3c9e9713` |

The five named blobs contain their corrected statements.
They contain none of the three old statements.

Current source links:

- https://github.com/stellar/stellar-docs/blob/db501fe9f2d856f2b38c4da7bf57b325806fe842/docs/tools/README.mdx
- https://github.com/stellar/stellar-docs/blob/db501fe9f2d856f2b38c4da7bf57b325806fe842/docs/tools/openzeppelin-relayer.mdx
- https://github.com/stellar/stellar-docs/blob/db501fe9f2d856f2b38c4da7bf57b325806fe842/docs/learn/migrate/evm/smart-contract-deployment.mdx
- https://github.com/stellar/stellar-docs/blob/db501fe9f2d856f2b38c4da7bf57b325806fe842/docs/validators/README.mdx
- https://github.com/stellar/stellar-docs/blob/db501fe9f2d856f2b38c4da7bf57b325806fe842/docs/learn/fundamentals/stellar-stack.mdx

A current GitHub code search found these exact source counts:

| Phrase | Matches |
| --- | ---: |
| `also known as Stellar Channels Service` | 0 |
| `deprecated Horizon API` | 0 |
| `every 3-5 seconds` | 0 |
| `every 5-7 seconds` | 2 |

The two `5-7` matches are the Validators and Stellar Stack files.

## Live canonical page checks

The HTML check completed at `2026-09-09T16:43:20.930Z`.
All eight requests returned HTTP 200 without a redirect.

| Finding | Live page evidence |
| --- | --- |
| `sd-039` | Both Tools pages contain the Relayer framework and managed Channels distinction. Both have zero old-alias matches. |
| `sd-042` | The EVM guide contains `Horizon API (nearing end-of-life)`. It has zero `deprecated Horizon API` matches. |
| `sd-042` controls | The four canonical Horizon pages retain future-deprecation wording. |
| `sd-047` | Validators and Stellar Stack each contain `every 5-7 seconds`. Both have zero `every 3-5 seconds` matches. |

Live URLs:

- https://developers.stellar.org/docs/tools
- https://developers.stellar.org/docs/tools/openzeppelin-relayer
- https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment
- https://developers.stellar.org/docs/data/apis
- https://developers.stellar.org/docs/learn/fundamentals/stellar-stack
- https://developers.stellar.org/docs/tools/lab/api-explorer
- https://developers.stellar.org/docs/tools/lab/api-explorer/horizon-endpoint
- https://developers.stellar.org/docs/validators

## Exact positive serving records

The primary strict-query batch completed at `2026-09-09T16:41:43Z`.
The replica batch completed at `2026-09-09T16:47:30Z`.
Both batches sent `analytics:false` and `clickAnalytics:false`.
Both indexes returned the same records and object IDs.

| Finding | Object ID | URL | Corrected indexed text |
| --- | --- | --- | --- |
| `sd-039` | `2-https://developers.stellar.org/docs/tools/openzeppelin-relayer` | https://developers.stellar.org/docs/tools/openzeppelin-relayer | Relayer is an open-source framework. Channels is the managed service. |
| `sd-039` | `13-https://developers.stellar.org/docs/tools` | https://developers.stellar.org/docs/tools#openzeppelin-relayer | Users can self-host both layers or use managed Channels. |
| `sd-042` | `21-https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment` | https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment#soroban-client | `Horizon API (nearing end-of-life)` |
| `sd-047` | `6-https://developers.stellar.org/docs/learn/fundamentals/stellar-stack` | https://developers.stellar.org/docs/learn/fundamentals/stellar-stack#stellar-core | `every 5-7 seconds` |
| `sd-047` | `2-https://developers.stellar.org/docs/validators` | https://developers.stellar.org/docs/validators | `every 5-7 seconds` |

Strict negative searches returned zero hits in both indexes:

- `"also known as Stellar Channels Service"`
- `"deprecated Horizon API"`
- `"every 3-5 seconds"`

## Fresh Raven trigger results

The production Raven batch completed at `2026-09-09T16:42:19.343Z`.

### `sd-039`

Original trigger:

```js
stellarDocs.search_sdk_cli_tools_docs({
  query: "managed Channels",
  hitsPerPage: 15,
  includeContent: true,
})
```

The response reports `nbHits:10` before the Tools filter.
The returned Tools list contains three records.
The two affected page records contain the correction.
Neither record contains the old alias.

### `sd-042`

Original TODO trigger:

```js
stellarDocs.search_docs({
  query: "deprecated Horizon API stellar-sdk networking layer",
  hitsPerPage: 10,
  includeContent: true,
})
```

The affected EVM record ranks first.
Its content contains `Horizon API (nearing end-of-life)`.
It contains no present-tense deprecated phrase.

The exact old-phrase query returns a `soft-empty` zero-hit result:

```js
stellarDocs.search_docs({
  query: "\"deprecated Horizon API\"",
  hitsPerPage: 15,
  includeContent: true,
})
```

### `sd-047`

Original trigger:

```js
stellarDocs.search_docs({
  query: "3-5 seconds",
  hitsPerPage: 10,
  includeContent: true,
})
```

The response reports `nbHits:476` because the index uses optional-word fallback.
None of the ten returned records is the Validators page.
None contains the old cadence statement.

The corrected positive query returns both relevant records:

```js
stellarDocs.search_docs({
  query: "5-7 seconds",
  hitsPerPage: 10,
  includeContent: true,
})
```

Validators and Stellar Stack both contain the corrected sentence.

## Current upstream handoffs

The GitHub reads identified each comment author and current state.

| Reference | Current state | Current evidence |
| --- | --- | --- |
| https://github.com/stellar-experimental/stellar-raven/issues/130 | Open | ElliotFriend filed the handoff. Its only comment is kalepail's stale-index result from `2026-09-09T03:10:50Z`. |
| https://github.com/stellar-experimental/stellar-raven/issues/132 | Open | ElliotFriend filed the handoff. Its only comment is kalepail's stale-index result from `2026-09-09T03:10:51Z`. |
| https://github.com/stellar/stellar-docs/issues/2707 | Closed as completed | kalepail's only comment records the prior stale index at `2026-09-09T03:10:53Z`. |
| https://github.com/stellar/stellar-docs/issues/2770 | Closed as completed | ElliotFriend linked Raven #130 and the deployed correction. |
| https://github.com/stellar/stellar-docs/issues/2805 | Closed as completed | ElliotFriend linked Raven #132 and the deployed correction. |
| https://github.com/stellar/stellar-docs/pull/2723 | Merged and approved | The check rollup is successful. One review thread remains unresolved in GitHub. |
| https://github.com/stellar/stellar-docs/pull/2806 | Merged and approved | The check rollup is successful. Both review threads are resolved. |

The unresolved PR #2723 thread asked for signer-authority wording.
The current page now says the operator controls the signer.
The unresolved thread state does not reproduce a content defect.

I did not accept the handoff claims as proof.
The source, live pages, crawler, indexes, and Raven triggers supplied independent proof.

No current handoff contains the new completed-crawl result.
This lane had no authority to post that result.

## Residuals and retirement eligibility

Each finding can now enter the `fixed-upstream` deletion-candidate state.
No finding can be deleted from this report alone.

The terminal workflow still needs these steps:

1. An author updates the finding with this live evidence and sets `fixed-upstream`.
2. A distinct reviewer reruns every original trigger and reviews the source and handoffs.
3. The author reconciles every current-state repository reference.
4. The author commits the fixed finding to create its immutable Raven source URL.
5. The author posts the terminal result and immutable URL on every upstream reference.
6. The resolver runs first with `--dry-run`.
7. The author closes Raven #130 and #132 only after their terminal receipts exist.

### `sd-039` references

The pre-report scan found 21 files containing `sd-039`.
Most dated round and eval records are historical evidence.
They must remain unchanged.

Current-state cleanup needs these files:

- `.agents/TODO.md`
- `.agents/NEXT.md`
- `improvements/INDEX.md`
- `improvements/intake.json`
- `eval/qa/corpus/battery/tooling-infra/q-ti-openzeppelin-relayer.json`
- Generated `eval/qa/cases.json`
- `improvements/skills/sk-024-x402-facilitator-and-api-key-scope.md`

The golden case still says official Stellar Docs uses the old alias.
That statement is now stale.
Other version and service-health disputes can remain after fresh verification.
The golden-truth workflow must separate those disputes from the fixed Docs conflict.

The resolver will remove the `sd-039` intake override.
The `sk-024` boundary reference needs a resolved-receipt link or a deliberate retained-ID note.

The final resolution comment still needs these upstream references:

- https://github.com/stellar/stellar-docs/issues/2707
- https://github.com/stellar/stellar-docs/pull/2723

### `sd-042` references

The pre-report scan found 27 files containing `sd-042`.
Dated rounds and research audits remain historical evidence.

Current-state cleanup needs these files:

- `.agents/TODO.md`
- `.agents/NEXT.md`
- `improvements/INDEX.md`
- `improvements/intake.json`
- `eval/qa/corpus/battery/tooling-infra/q-infra-horizon-vs-rpc.json`
- `eval/qa/corpus/battery/protocol-core/q-pc-practical-fee-setting.json`
- Generated `eval/qa/cases.json`

`q-infra-horizon-vs-rpc` still marks the live-page and search-index state as disputed.
That dispute no longer exists.
`q-pc-practical-fee-setting` still names the stale search phrase in its notes and evidence.

The golden-truth workflow must update both cases from class A and class E evidence.
The shared lifecycle-text refactor did not ship.
That unverified class-risk does not keep this corrected occurrence open.

The resolver will remove the `sd-042` intake override.

The final result must reach these references before resolution:

- https://github.com/stellar-experimental/stellar-raven/issues/130
- https://github.com/stellar/stellar-docs/issues/2770
- https://github.com/stellar/stellar-docs/pull/2806

Raven #130 must remain open until the resolver creates the receipt.

### `sd-047` references

The pre-report scan found 40 files containing `sd-047`.
Dated rounds preserve real historical observations.

Current-state cleanup needs these files:

- `.agents/TODO.md`
- `.agents/NEXT.md`
- `improvements/INDEX.md`
- `eval/qa/corpus/battery/protocol-core/q-protocol-ledger-close-time.json`
- Generated `eval/qa/cases.json`
- Generated `eval/qa/sample.json`

The golden answer does not need a factual change.
Its latest verification event still records the stale index as current evidence.
The event and root-cause link need a golden-truth refresh.

The dated 2026-08-30 and 2026-08-31 contradiction rows are valid history.
They should remain dated history after the refresh.
`.agents/NEXT.md` also states that the Docs pages still conflict.
That current-state statement is now false.

The final result must reach these references before resolution:

- https://github.com/stellar-experimental/stellar-raven/issues/132
- https://github.com/stellar/stellar-docs/issues/2805
- https://github.com/stellar/stellar-docs/pull/2806

Raven #132 must remain open until the resolver creates the receipt.

## Command evidence

The commands below show the exact read classes.
Credential values never entered command output.

### Crawler projections

```sh
GET https://crawler.algolia.com/api/1/crawlers/79c5d36e-ce6e-4ec3-bed3-04a30818122d?withConfig=true
jq '{name,running,blocked,reindexing,lastReindexStartedAt,lastReindexEndedAt,blockingError,error,status,config:{schedule:.config.schedule,renderJavaScript:.config.renderJavaScript,rateLimit:.config.rateLimit,startUrls:.config.startUrls,sitemaps:.config.sitemaps,actions:[.config.actions[]? | {indexName,pathsToMatch}]}}'

GET https://crawler.algolia.com/api/1/crawlers/79c5d36e-ce6e-4ec3-bed3-04a30818122d/crawl_runs
jq '{keys:keys,logCount:(.logs|length),logs:[.logs[]? | {id,status,startedAt,endedAt,createdAt,updatedAt,error,reason}]}'

GET https://crawler.algolia.com/api/1/crawlers/79c5d36e-ce6e-4ec3-bed3-04a30818122d/stats/urls
jq '{count,data}'
```

### Index projections

```sh
GET https://VNSJF5AWIZ-dsn.algolia.net/1/indexes
jq '[.items[] | select(.name == "crawler_Stellar Docs - Docusaurus" or .name == "docs_replica_agent") | {name,entries,updatedAt,primary,replicas}]'
```

The two six-query batches used `POST /1/indexes/*/queries`.
They targeted the primary and replica separately.
Each query set `analytics:false` and `clickAnalytics:false`.
Strict checks also set these values:

```json
{
  "removeWordsIfNoResults": "none",
  "queryType": "prefixNone",
  "typoTolerance": false
}
```

### GitHub and reference reads

```sh
gh api graphql
gh api repos/stellar/stellar-docs/actions/runs/34242504493
gh api repos/stellar/stellar-docs/actions/runs/34255828473
gh search code '"also known as Stellar Channels Service" repo:stellar/stellar-docs'
gh search code '"deprecated Horizon API" repo:stellar/stellar-docs'
gh search code '"every 3-5 seconds" repo:stellar/stellar-docs'
gh search code '"every 5-7 seconds" repo:stellar/stellar-docs'
rg -l --hidden --glob '!.git/**' 'sd-039|sd-042|sd-047' .
```

## Final boundary

This report supplies author-side live verification.
It does not supply the required distinct deletion review.
It does not authorize comments, status edits, golden edits, resolver execution, deployment, or closure.

The concurrent Astra lane owned the existing generated-artifact changes.
This lane did not modify those paths.
