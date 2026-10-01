# Independent review: Stellar Docs adapter

## Verdict

ACCEPT

The implementation meets the three adapter requirements.
I found no actionable correctness or security defect in the reviewed diff.
The coordinator must complete the separately reviewed QA comparison before release.
This review includes no live Algolia request or paid evaluation.

## Findings

No actionable findings.
No code fix is required by this review.

## Checked

Review date: 2026-10-01.
Worktree: `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/sd-adapter`.
Baseline: `bcfa617ffcb6e58e6a7498a1e42135a059535402`.
I reviewed the uncommitted diff against that baseline.
I read `AGENTS.md`, `PLAN.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, the lane report, and the review brief.
I checked both repository rules and the requested behavior.
I changed no worktree file and ran no Git write.

### Request ownership and endpoint

`src/adapters/stellar-docs.ts:219` uses the documented read endpoint, `POST /1/indexes/*/objects`.
Each record request carries its own `attributesToRetrieve`, `indexName`, and `objectID`.
[Algolia's REST contract](https://www.algolia.com/doc/rest-api/search/get-objects) confirms that shape and the required `search` permission.
The same contract defines missing records as `null`.

`src/adapters/stellar-docs.ts:585` supplies `transport.index`, not a caller argument.
All 12 exposed Stellar Docs operations currently use `crawler_Stellar Docs - Docusaurus`.
The meetings conditional changes a facet filter and disables the URL filter.
It does not change the index.
A synthetic alternate-index operation confirms that the second request follows its host-configured index and credential pair.
Injected caller `index`, `objectID`, and `path` arguments cannot redirect that request.
Record IDs come only from the preceding search response.

### Selection, order, and metadata

`src/adapters/stellar-docs.ts:566` applies the requested limit before content retrieval.
The existing input schemas permit at most 20 returned hits.
The eight category operations keep their 100-hit search window.
More than 1,000 requested IDs cannot occur through those exposed operations.
A mocked 1,001-hit upstream response still causes only 20 record requests.
The guard rejects `hitsPerPage: 1001`.

`src/adapters/stellar-docs.ts:224` removes duplicate IDs from the content request.
`src/adapters/stellar-docs.ts:245` preserves duplicate search hits and their original order.
The ID map also handles reordered content results correctly.
Only the full `content` value comes from the second response.
The adapter preserves search URLs, anchors, breadcrumbs, snippets, `nbHits`, `nbPages`, and `page`.
The public response never included upstream `hitsPerPage`; this change preserves that shape.

### Error, soft-empty, and data

`src/adapters/stellar-docs.ts:216` rejects missing or empty search record IDs.
`src/adapters/stellar-docs.ts:236` rejects invalid result arrays, invalid records, and `null` records.
`src/adapters/stellar-docs.ts:240` rejects a response that omits any requested record.
`src/adapters/stellar-docs.ts:587` returns these failures as `kind: "error"`.
A partially missing record response therefore produces no successful partial hit list.
A heading record can legitimately omit `content`, as `docs/stellar-docs.md:77` states.

The shared request helper preserves terminal HTTP errors, retryable failures, and malformed-JSON errors.
Its new validation errors contain fixed text and no credentials.
The existing helper can return bounded upstream diagnostic text.
`src/executor/providers.ts:440` redacts that result before the sandbox receives it.
A synthetic credential-echo probe confirms the same redaction on a content-request error.

### Defaults and miss guidance

`src/adapters/stellar-docs.ts:370` sends `5` for an omitted mapped `hitsPerPage` argument.
Tests cover all three directly mapped operations and explicit values `1` and `20`.
Over-fetching operations still send `100` upstream and apply the caller limit locally.
Direct searches and page-section retrieval retain their existing content paths.

The miss messages at `src/adapters/stellar-docs.ts:535` and `src/adapters/stellar-docs.ts:574` describe query scope.
They preserve the page URL guidance and broader-source recovery hints.
They make no corpus-absence claim.
They agree with the inconclusive-outcome instructions at `src/mcp/tools.ts:336`.

### Transport cost and limits

Both requests use `algoliaRequest` and `classifyAlgoliaAttempt`.
A probe confirms the same four hosts and timeout sequence for each request.
The sequence is `2000`, `4000`, `6000`, and `8000` milliseconds.
Content retrieval restarts that sequence from the first host.
The requests run sequentially and do not add simultaneous connections within one adapter call.

An affected successful call now usually makes two fetches instead of one.
The maximum explicit retry count rises from four fetches to eight fetches per affected call.
The combined configured timeout allowances total 40 seconds before processing time.
[Cloudflare documents](https://developers.cloudflare.com/workers/platform/limits/#subrequests) 50 subrequests on Workers Free and 10,000 on Workers Paid.
Redirects also count toward that limit.
Seven affected calls with all retry attempts can exceed the Free limit through 56 explicit fetches.
The existing executor exposes no per-execution service-call cap.
This review does not establish the account's live subrequest limit or live latency.
The required release measurement must account for the extra request.

### Tests, documentation, and scope

The three TODO items become one QA measurement item.
No unrelated TODO item changes.
The added documentation accurately describes selection, content retrieval, failure handling, defaults, and scoped misses.

| Check | Result |
| --- | --- |
| `npx --no-install vitest run test/adapters.test.ts` | 72 passed; exit 0 |
| Updated adapter tests against baseline source in a scratch copy | 43 passed; 29 failed; expected exit 1 |
| All 19 added tests against baseline source | All 19 fail |
| `npm run typecheck` | Exit 0 |
| `npm test` | 126 files passed; 2213 tests passed; 3 expected failures; exit 0 |
| Ten independent mocked edge-case probes | All passed |
| `git diff --check` | Exit 0 |
| Changed-file hashes before and after review | Identical |

The baseline failures include all added tests and ten amended tests.
The baseline run therefore verifies that the new assertions distinguish the old behavior.
The probes cover duplicate IDs, oversized candidate responses, partial responses, heading records, alternate indices, meetings, retries, and credential redaction.

Evidence directory: `/private/tmp/review-sd-adapter-_7rrvoow/`.
It contains `reviewed.diff`, `probes.mjs`, bundled review modules, and `logs/`.
The scratch baseline copy contains the reviewed tests with the baseline implementation.
I did not repeat the build because it writes generated files in this read-only review.
The author's report records a passing dry-run build and secrets scan.
I ran no server, deployment, paid call, credential read, or upstream write.

Reviewed SHA-256 values:

```text
0d3a347b7bea4b4d03c833c07fe3d0d1d3e1995479d597c23ac264e99a7d0d93  src/adapters/stellar-docs.ts
b42d9006fa587e97d500f181b751d0bec4087ce3e59fd7d1f18c4a41c2257267  test/adapters.test.ts
fdc588de29be67c1295235227eb8ad41ad71b17270fc19f118024aaecfc81c93  docs/stellar-docs.md
4b309887b7c4448ed6ddf0b4216ddb5287246c3cd67bd0628844221b46d9bffa  .agents/TODO.md
```
