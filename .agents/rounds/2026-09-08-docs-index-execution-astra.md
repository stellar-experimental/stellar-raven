# Docs verification report

Route: `gpt-6-astra`, reasoning `medium`, explicitly selected by the user.
This selection overrides the older fleet omission.
Authority: `.agents/rounds/2026-09-08-maintenance-execution.md` and the narrower lane instruction.
Observation window: **2026-09-09T02:44Z–02:48Z**; the report filename retains the requested local date.

**Verdict: CHANGES-REQUIRED.** All three original production search triggers still reproduce.
The source corrections are deployed. The production index still contains the previous text.
The evidence does not establish an extraction failure or a completed crawl after deployment.
The schedule discrepancy prevents an unconditional “routine delay” conclusion.

## Scope and method

I read `AGENTS.md`, the improvements-pipeline skill, `improvements/README.md`, and `research/services/stellar-docs-algolia.md` completely before operator calls.
I also read the authority ledger, `PLAN.md`, `ARCHITECTURE.md`, the three findings, and the upstream writing reference.
I used live GitHub reads, public HTML reads, raw MDX reads, direct production Algolia queries, and production Raven queries.
Operator responses used explicit field projections. No credential values or raw crawler configuration entered the output.
No paid calls, new agents, GitHub comments, finding edits, queue edits, or crawler/index/settings writes occurred.
No crawl, reindex, or URL-test mutation endpoint ran. Only this report was written, through `apply_patch`.

## Independent content and search checks

HTML checks fetched the production pages and inspected their `<article>` text at **02:46:11Z**.
All eight page requests returned HTTP 200.
These checks inspected server-rendered HTML; they did not execute browser JavaScript.

| Finding | Current content | Production Raven result at 02:48:09Z | Closure eligibility |
| --- | --- | --- | --- |
| sd-039 | Both Tools pages remove the alias. They distinguish the framework, Channels plugin, and managed service. | `search_sdk_cli_tools_docs({query:"managed Channels",hitsPerPage:15,includeContent:true})` returns the old alias on both pages. | No. Original search trigger reproduces. |
| sd-042 | The EVM guide says `Horizon API (nearing end-of-life)`. Its deprecated phrase is absent. | `search_docs({query:'"deprecated Horizon API"',hitsPerPage:15,includeContent:true})` returns one stale EVM hit. | No. Original search evidence remains stale. |
| sd-047 | Validators and Stellar Stack both say `every 5-7 seconds`. Validators contains no `every 3-5 seconds`. | `search_docs({query:"3-5 seconds",hitsPerPage:15,includeContent:true})` returns one stale Validators hit. | No. Original index trigger reproduces. |

Exact affected result URLs:

- sd-039: https://developers.stellar.org/docs/tools#openzeppelin-relayer and https://developers.stellar.org/docs/tools/openzeppelin-relayer
- sd-042: https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment#soroban-client
- sd-047: https://developers.stellar.org/docs/validators

The sd-039 search excerpt still starts `OpenZeppelin Relayer, also known as Stellar Channels Service`.
The category query reports `nbHits:10`; three returned hits survive its Tools filter.
Two of those hits carry the alias. `nbHits` is not the filtered page count.
The corrected Relayer page says the operator controls the signer and funds fee accounts.
It names local keystore, Google Cloud KMS, and Turnkey options.
It attributes managed account operation and fee coverage to OpenZeppelin, subject to fair use.

The separate `stellar-sdk networking layer` query returns two hits.
The EVM hit ranks first and still contains `deprecated Horizon API` in its content.
All four canonical Horizon pages retain future deprecation wording:
`/docs/data/apis`, `/docs/learn/fundamentals/stellar-stack`, `/docs/tools/lab/api-explorer`, and `/docs/tools/lab/api-explorer/horizon-endpoint`.

The `5-7 seconds` query returns Stellar Stack first and an unrelated workspace hit second.
The second result does not establish another cadence statement.
Direct production-index checks through the local adapter at **02:44:58Z** independently reproduced these results.
Those direct queries set `analytics:false` and `clickAnalytics:false`.

Raw `main` MDX reads at **02:48:22Z–02:48:23Z** independently confirmed the corrections:

| Path | Computed Git blob SHA-1 |
| --- | --- |
| `docs/tools/README.mdx` | `86243e6cf3cc2a672668726cbf94fe87a9cead24` |
| `docs/tools/openzeppelin-relayer.mdx` | `8ef7a6f219393fb8495fecc848982e1f37d78a13` |
| `docs/learn/migrate/evm/smart-contract-deployment.mdx` | `c7b63187d38d9d368e7eadade08df45d88bff886` |
| `docs/validators/README.mdx` | `f74c26290ba7653f584805bb3b02867b97aee3af` |

These are named-file checks. I did not independently repeat the handoffs’ tree-wide negative checks.

## Crawler and index evidence

Crawler: `79c5d36e-ce6e-4ec3-bed3-04a30818122d`, `Stellar Docs`.
Read base: `https://crawler.algolia.com/api/1/crawlers/{id}`.

| Read | Projected result |
| --- | --- |
| `GET /{id}?withConfig=true`, 02:44:24Z | HTTP 200; `running:true`, `blocked:false`, `reindexing:false`; no blocking error field. |
| `GET /{id}`, 02:44:42Z | `lastReindexStartedAt:2026-09-08T12:00:01.930Z`; `lastReindexEndedAt:2026-09-08T12:03:10.118Z`. |
| Config projection | `schedule:"every 1 day at 12:00 am"`; `renderJavaScript:false`; `rateLimit:8`. |
| Discovery projection | Start URL `https://developers.stellar.org`; sitemap `https://developers.stellar.org/sitemap.xml`. |
| Action projection | One action, `Stellar Docs - Docusaurus`; `pathsToMatch:["https://developers.stellar.org/**"]`. |
| Exclusion projection | Excludes data-catalog and selected API-reference paths. None names the four affected paths. |
| `GET /{id}/crawl_runs`, 02:44:24Z | HTTP 200; `logs:[]`. No run-log evidence is available through this response. |
| `GET /{id}/stats/urls`, 02:45:51Z | HTTP 200; total 856. See the status counts below. |
| Search API `GET /1/indexes`, 02:45:27Z | Primary and replica each contain 14,781 records; both show `updatedAt:2026-09-08T12:03:01.745Z`. |

Latest aggregate URL states:

| Status | Reason | Count |
| --- | --- | ---: |
| DONE | `success_from_cache` | 661 |
| SKIPPED | `http_redirect_invalid` | 6 |
| SKIPPED | `http_not_found` | 179 |
| SKIPPED | `unmatched_file_type` | 10 |

The response contains no FAILED row. These counts do not prove that each affected URL succeeded.
All reported successes came from cache. They do not prove a fresh source fetch.
No available run log identifies the four URLs’ fetch timestamps, cache validators, response codes, or extraction results.
The public `/urls?limit=1` read returned HTTP 404.
The dashboard’s GET URL-summary endpoint returned HTTP 401 with the available crawler credentials.
I stopped that access path. I did not change authentication or crawler settings.

**Schedule:** Algolia documents explicit schedule times in UTC and `12:00 am` as midnight.
See [schedule documentation](https://www.algolia.com/doc/tools/crawler/apis/configuration/schedule).
The observed latest start is **12:00 UTC**, despite the stored midnight expression.
This evidence establishes a discrepancy; it does not establish its cause or the scheduler’s next execution time.
The documented **2026-09-09T00:00Z** slot passed without a newer completed run in the observed state.
Do not silently reinterpret `am` as `pm` or claim a verified timezone offset.

**Source arrival:** the last completed crawl predates both deployments below.
Therefore, that completed crawl cannot prove ingestion of either deployed correction.
The stale primary records confirm that the corrected text has not reached the serving index.
Whether the crawler fetched newer bytes outside that completed run remains unknown.

**Delay versus failure:** the index is about 14 hours 45 minutes old and still answers queries.
No completed post-deployment crawl or blocking error proves an extraction/indexing failure.
The cached successes and unexplained schedule discrepancy require a concrete follow-up.
“Awaiting a verified post-deployment crawl” is supported. “Normal midnight refresh delay” is not established.

## GitHub evidence and proposed responses

[Docs PR #2723](https://github.com/stellar/stellar-docs/pull/2723) merged at **2026-09-08T17:13:49Z**.
Merge: `df8417ab9de4eb75e893e81c2c262fe9d274318f`; review decision: APPROVED.
Its [deployment run](https://github.com/stellar/stellar-docs/actions/runs/34255828473) succeeded and ended at **17:19:07Z**.
Issue #2707 is closed as completed.
One [review thread](https://github.com/stellar/stellar-docs/pull/2723#discussion_r3950651835) remains unresolved in GitHub.
The live page already addresses its signer-custody concern. Thread state alone does not establish a remaining content defect.

Proposed response for #2723/#2707; **not posted**:
> The two live Tools pages now distinguish Relayer, its Channels plugin, and managed Channels.
> At 2026-09-09T02:48:09Z, Raven’s `managed Channels` query still returned the old alias on both pages.
> The last completed crawl preceded deployment. Full verification remains open until the serving index contains the correction.

[Docs PR #2806](https://github.com/stellar/stellar-docs/pull/2806) merged at **2026-09-08T15:05:25Z**.
Merge: `ad0accbd0da545ccba12b5a01fd5dc9e387977f8`; review decision: APPROVED; no unresolved review threads.
Its [deployment run](https://github.com/stellar/stellar-docs/actions/runs/34242504493) succeeded and ended at **15:10:43Z**.
A separate `.devcontainer/devcontainer.json` workflow failed on that commit. The deployment success and live content are independently verified.
Issues #2770 and #2805 are closed as completed.
[Raven #130](https://github.com/stellar-experimental/stellar-raven/issues/130) and [Raven #132](https://github.com/stellar-experimental/stellar-raven/issues/132) remain open without comments.

Proposed response for #130/#2770; **not posted**:
> The live EVM guide now uses the future lifecycle wording. All four canonical pages remain consistent with it.
> At 2026-09-09T02:48:09Z, both original search checks still returned the deprecated Horizon phrase.
> The occurrence’s content correction passes. Index verification remains open.
> The shared lifecycle text refactor remains separate, as your handoff states.

Proposed response for #132/#2805; **not posted**:
> The live Validators and Stellar Stack pages now agree on 5-7 seconds.
> At 2026-09-09T02:48:09Z, `3-5 seconds` still returned the stale Validators record.
> The content correction passes. We cannot close the original index trigger until a fresh search confirms its removal.

## Canaries and next concrete check

`node scripts/check-algolia-rule-canary.mjs --env-file .env --require-env` passed all four named assertions.
The command query ranked first with rules and missed the top five without rules.
The natural install query ranked first with rules and fifth without rules.
Additional direct searches placed `Protocol 24` on software-versions and `brew install stellar-cli` on install-cli at rank one.
`soroban storage` returned 189 hits. These checks establish search availability, not fresh ingestion.

Next check: **2026-09-09T12:05Z**, using the previous observed noon start as a diagnostic checkpoint, not a schedule guarantee.
Re-read crawler start/end times, blocking state, URL statistics, and both index timestamps through the same projections.
Then repeat all five Raven queries above and verify corrected positive records, not merely absent old queries.
If the crawl completes but stale text remains, inspect the affected URLs’ cache/fetch/extraction state through an authorized dashboard session.
If no new crawl starts, request the owner’s scheduler evidence for the midnight/noon discrepancy.
If a crawl is still active, wait for its recorded completion before judging index ingestion.
Do not recrawl, reindex, or change caching or schedules under this lane’s authority.

Keep sd-039, sd-042, and sd-047 unresolved. Neither Raven handoff qualifies for full-resolution closure now.
Final retirement still requires the repository’s distinct-reviewer gate after every original trigger passes.
No code changed, so code tests and builds were unnecessary.
Initial Python HTML access returned 403; Node fetch succeeded. A missing optional HTML parser required no installation.
