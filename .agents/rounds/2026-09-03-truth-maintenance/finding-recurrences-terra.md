# Finding recurrence recheck — Terra

Date: 2026-09-04

This recheck used read-only public requests. It did not post comments or file issues.
It read Cluster 7 as historical candidate evidence. It did not treat a candidate as current evidence.

## Deterministic state

| Finding | Status before | Cluster 7 row | Current result | Action |
| --- | --- | --- | --- | --- |
| `sd-046` | `proposed` | `q-asset-amm-fee-reserve`; `q-protocol-base-reserve-min-balance` | Exact omission reproduces on both general Docs pages. | Move to `verified`. Add a dated recurrence. |
| `sd-044` | `reported-upstream` | `q-quickstart-manual-ledger-close` | Exact flag-documentation omission reproduces. | Add a dated recurrence only. |
| `sd-037` | `reported-upstream` | `q-pc-slp-0004-0006-status` | The root omits SLPs. The limits page lacks the proposal index. | Add a dated recurrence only. |
| `ll-030` | `proposed` | `q-defi-wisdomtree-crdt` | An authenticated production read reproduces the exact record gap. | Move to `verified`. Add a dated recurrence. |
| `sls-023` | `reported-upstream` | `q-defi-wisdomtree-crdt` | Fourteen rows improved. Forty-seven still lack deployment facts. | Add dated recurrences only. |

The active collection contains one file for each checked ID. `improvements/resolved.json` contains no checked ID.

## Historical candidate rows

The stored result file is
`/private/tmp/stellar-raven-tm-runner/eval/qa/results/2026-09-04T05-40-51-variantA.json`.

- `q-asset-amm-fee-reserve` and `q-protocol-base-reserve-min-balance` omitted the two-reserve pool-share rule.
- `q-quickstart-manual-ledger-close` omitted the manual-close flag and operation.
- `q-pc-slp-0004-0006-status` did not find the canonical SLP proposal family.
- `q-defi-wisdomtree-crdt` did not reach CRDT information.

These rows named the recurrence candidates. The public requests below made the decisions.

## Current requests, versions, and hashes

All SHA-256 values are response-body hashes. All requests ran on 2026-09-04.

### `sd-046`

| Request | HTTP status | SHA-256 | Result |
| --- | --- | --- | --- |
| `GET https://developers.stellar.org/docs/learn/fundamentals/lumens` | 200 | `4cc085d05768d143ddc6a406846f934cc6cbd70212300bd4d221678c02cf3029` | The trustline list includes pool shares. It omits the two-reserve exception. |
| `GET https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts` | 200 | `c2307eb97e1cb9f20f42eb1027339e11e7a03d53e26492df756c02f35cf4b481` | The trustline list includes pool shares. It omits the two-reserve exception. |
| `GET https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools` | 200 | `2a6906e9171e1f8d1b11a31f6d6590a7c337003fdb3639e08b30fbcc4e8b0a11` | The page states that a pool-share trustline requires two base reserves. |
| `GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0038.md` | 200 | `febebc612e1dd14006ea677161c626a27575be32b7c937d8aacb30677789c1aa` | The CAP-0038 raw file states the two-subentry and two-reserve rule. |

The general Docs pages were updated on 2026-09-02. They still reproduce the exact cross-page contradiction.
It meets the proposed-to-verified lifecycle rule.

### `sd-044`

The current `stellar/quickstart` commit is `c43c77eb2c2540410fc09b34e207b4edcf943085`.
Its commit date is `2026-09-02T00:35:19Z`.

| Request | HTTP status | SHA-256 | Result |
| --- | --- | --- | --- |
| `GET https://raw.githubusercontent.com/stellar/quickstart/c43c77eb2c2540410fc09b34e207b4edcf943085/start` | 200 | `200eba3f488563d9a6474fb217c937b5a4a9e5fdb2923b8f7323904f885a9f73` | The main-branch script sets, parses, and writes `--enable-core-manual-close`. |
| `GET https://api.github.com/repos/stellar/stellar-docs/git/trees/main?recursive=1` | 200 | `d5539baad75bc6a12657555669d065b291924d9ffe938b6810450469d0d4c83a` | The tree identifies the current Quickstart file set. |

The current `stellar/stellar-docs` commit is `3fcd663668fe3ee28f884d883c4062a29d384419`.
Its commit date is `2026-09-02T19:45:20Z`.

The tree contains 19 `.mdx` pages under `docs/tools/quickstart/`.
All 19 pages contain neither `--enable-core-manual-close` nor manual-close wording.
The exact defect reproduces.

### `sd-037`

The current `stellar/stellar-protocol` commit is `65e2b6262c0825494caf2a94116eb512c8335f22`.
Its commit date is `2026-08-31T23:57:00Z`.

| Request | HTTP status | SHA-256 | Result |
| --- | --- | --- | --- |
| `GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/README.md` | 200 | `ecb809f47f17a42046265c3df7de0f05c2357bc0e909167b0e73697b0da33a0d` | The README prose names CAPs and SEPs only. |
| `GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/limits/README.md` | 200 | `4bfd8ffeff53ec0697d77fbee8234152af869574e50c73c0832a7eeeba39d2a3` | The page names SLPs but lacks an identifier, title, and status index. |
| `GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/limits/slp-0004.md` | 200 | `657c2d3344611d10f366a9c19a9d7b3b2428761d25810d8d49312f934e55ffe0` | The canonical SLP-0004 file still exists. |

The limits overview has a partial naming change. It does not resolve the recorded discoverability defect.
Issue #1981 is open. Its only comment is the 2026-08-14 stale-bot notice.

### `ll-030`

The production Raven server completed this authenticated read-only re-execution at `2026-09-04T07:00:31.027Z`.
The host kept the LumenLoop credential outside the sandbox.

| Call | Result |
| --- | --- |
| `lumenloop.get_project({slug:"wisdomtree"})` | The record names 13 digital funds and a Gold token. It has no `CRDT` or `CRDYX` substring. |
| `lumenloop.search_directory({query:"CRDT",limit:10})` | `match_mode` is `semantic`. Ten adjacent rows have no `CRDT` substring. |
| `lumenloop.search_content_semantic({query:"WisdomTree CRDT CRDYX private credit alternative income digital fund Stellar",limit:15})` | The response has 24 rows across six collections. It has no `CRDT` or `CRDYX` substring. |

The authenticated read reproduces the exact record-content gap. It meets the proposed-to-verified lifecycle rule.

### `sls-023`

| Request | HTTP status | SHA-256 | Result |
| --- | --- | --- | --- |
| `GET https://stellarlight.xyz/api/status` | 200 | `59b15559c1cbd9916536741483754801013480d40d0acbc30325b327db29a5c0` | The service reports `apiVersion` `1.9.30` and `version` `scout-1.0.0`. |
| `GET https://stellarlight.xyz/api/projects/search?q=real%20world%20asset&limit=100` | 200 | `f6c976a7b9c82f61e4f2ab5c5cbfd0b9cb907ff09b89289fa45fd47905d32e0d` | The 61-row response has partial deployment data. |

The search response generated at `2026-09-04T06:54:40.644Z` has 61 deployment objects.
Fourteen rows have `mainnet` and `onchain-activity` deployment facts.
Forty-seven rows have `network: "unknown"`, null `basis`, and null `sourceUrl`.
Only DTCC has a nonempty `products` value. No row has `productKind`.
No row has an `assets` key.
DTCC is `Development` and has an announced mainnet product with an H1 2027 note.
This is a partial improvement. The exact partial product and deployment model defect still reproduces.

## Changes

- `sd-046` now has status `verified` and one dated recurrence.
- `sd-044` has one dated recurrence.
- `sd-037` has one dated recurrence.
- `ll-030` now has status `verified` and one dated recurrence.
- `sls-023` has dated recurrences for 2026-09-03 and 2026-09-04.
- `.agents/TODO.md` now schedules the `sd-037` stale-issue state check.
- `improvements/INDEX.md` was regenerated by `npm run improvements:index`.
- This repair does not change `improvements/intake.json`. The repository has no intake generator script.

No reported-upstream finding changed except for recurrence evidence.

## Tests and gates

| Command | Result |
| --- | --- |
| `npm run improvements:index` | Passed. It wrote `improvements/INDEX.md` for 70 findings. |
| `npm run improvements:lint` | Passed. The lint checked 70 findings. |
| `npm run improvements:lint -- --live` | Passed with current GitHub reads. |
| `npm run improvements:probes` | Passed. Six probes recur. Two LumenLoop probes are inconclusive without `LUMENLOOP_API_KEY`. |
| `./node_modules/.bin/vitest run test/improvements-*.test.ts test/improvements-writes.test.mjs` | Passed. 41 tests passed in five files. |
| `npm run secrets:scan -- --tree` | Passed. The scan found no secrets. |
| `git diff --check` | Passed. |

## Lifecycle decisions

`ll-030` moves from `proposed` to `verified`.
The authenticated live re-execution reproduces all three original checks.

`sls-023` remains `reported-upstream`.
The current response has partial improvements but still reproduces the recorded defect.

## Risks and blockers

`sd-037` issue #1981 may close through stale automation after 2026-09-13.
The TODO requires a state read without a reminder comment.

The LumenLoop probe command remains inconclusive without `LUMENLOOP_API_KEY`.
That result does not affect the authenticated `ll-030` verification.
