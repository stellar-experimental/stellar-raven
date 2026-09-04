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
| `ll-030` | `proposed` | `q-defi-wisdomtree-crdt` | Authorization blocked the exact record check. | No status or recurrence change. |
| `sls-023` | `reported-upstream` | `q-defi-wisdomtree-crdt` | The product and deployment data now exist. | No status or recurrence change. |

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
| `GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/core/cap-0038.md` | 200 | `febebc612e1dd14006ea677161c626a27575be32b7c937d8aacb30677789c1aa` | CAP-0038 states the two-subentry and two-reserve rule. |

The current request reproduces the exact cross-page contradiction. It meets the proposed-to-verified lifecycle rule.

### `sd-044`

The current `stellar/quickstart` commit is `c43c77eb2c2540410fc09b34e207b4edcf943085`.
Its commit date is `2026-09-02T00:35:19Z`.

| Request | HTTP status | SHA-256 | Result |
| --- | --- | --- | --- |
| `GET https://raw.githubusercontent.com/stellar/quickstart/master/start` | 200 | `94bf0b0f67c80a7e0a35a1d3d9d2ee949922eac0713be151702a1b950070e909` | The script sets, parses, and writes `--enable-core-manual-close`. |
| `GET https://api.github.com/repos/stellar/stellar-docs/git/trees/main?recursive=1` | 200 | `d5539baad75bc6a12657555669d065b291924d9ffe938b6810450469d0d4c83a` | The tree identifies the current Quickstart file set. |

The current `stellar/stellar-docs` commit is `3fcd663668fe3ee28f884d883c4062a29d384419`.
Its commit date is `2026-09-02T19:45:20Z`.

| Current Quickstart file | SHA-256 |
| --- | --- |
| `docs/tools/quickstart/README.mdx` | `66c27c72faa693c25be4f44035651d5709cffb4617e1fe344171025ab5472d5` |
| `docs/tools/quickstart/advanced-usage/README.mdx` | `daa04cf6ada15fa80402b4e147b62f31c387b5b3f0a98886df525161a5bef91a` |
| `docs/tools/quickstart/advanced-usage/container.mdx` | `e6a426eb0f447de2a1275eda8695755d2c39331b8f9ca68aaf0aedfbc96f5aca` |
| `docs/tools/quickstart/advanced-usage/operation-modes.mdx` | `ae4c8def01f73323c8e63c59a1cda7f9fe057fb7a2429160b272ddaf1c396db1` |
| `docs/tools/quickstart/advanced-usage/run-command-examples.mdx` | `5c52837bdf49f4b1f359aab74a20b112edcc9b2c341032c16e32a5a8649c9e9f` |
| `docs/tools/quickstart/service-options.mdx` | `e5d7b99aad3fad01041d76b315c3e3da7e0befdf8511a21eb86407aada4d7b11` |

The six files contain neither `--enable-core-manual-close` nor manual-close wording. The exact defect reproduces.

### `sd-037`

The current `stellar/stellar-protocol` commit is `65e2b6262c0825494caf2a94116eb512c8335f22`.
Its commit date is `2026-08-31T23:57:00Z`.

| Request | HTTP status | SHA-256 | Result |
| --- | --- | --- | --- |
| `GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/README.md` | 200 | `ecb809f47f17a42046265c3df7de0f05c2357bc0e909167b0e73697b0da33a0d` | The overview names CAPs and SEPs only. |
| `GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/limits/README.md` | 200 | `4bfd8ffeff53ec0697d77fbee8234152af869574e50c73c0832a7eeeba39d2a3` | The page names SLPs but lacks an identifier, title, and status index. |
| `GET https://raw.githubusercontent.com/stellar/stellar-protocol/master/limits/slp-0004.md` | 200 | `657c2d3344611d10f366a9c19a9d7b3b2428761d25810d8d49312f934e55ffe0` | The canonical SLP-0004 file still exists. |

The limits overview has a partial naming change. It does not resolve the recorded discoverability defect.

### `ll-030`

The public OpenAPI document reports LumenLoop API version `1.0.0`.
Its body SHA-256 is `023bea7bfc99ddab7aefce739049cec2197ca52260afd1d6e64e3e85d5269cc0`.

| Request | HTTP status | SHA-256 | Result |
| --- | --- | --- | --- |
| `POST https://api.lumenloop.com/v1/tools/get_project` with `{"slug":"wisdomtree"}` | 401 | `311d5c564899acfc500ede1001564d8d72c9258a9386ac904165ee7660f2af1c` | The API requires a Bearer credential. |
| `POST https://api.lumenloop.com/v1/tools/search_directory` with `{"query":"CRDT"}` | 401 | `311d5c564899acfc500ede1001564d8d72c9258a9386ac904165ee7660f2af1c` | The API requires a Bearer credential. |

The anonymous public calls cannot read the WisdomTree record. They cannot reproduce its missing named sub-products.

### `sls-023`

| Request | HTTP status | SHA-256 | Result |
| --- | --- | --- | --- |
| `GET https://stellarlight.xyz/api/status` | 200 | `a9b8e92f2761e0d11195254f92382ed1328fea907803ad36b4a32008da6144f1` | The service reports `apiVersion` `1.9.30` and `version` `scout-1.0.0`. |
| `GET https://stellarlight.xyz/api/projects/search?q=real%20world%20asset&limit=100` | 200 | `bd8d4dae2246abf2ac17dfb4a9e8fe6424b37bba6bd9e8fc9f7149feb1a2176b` | All 61 returned records have `deployment`. DTCC has a named announced mainnet product. |

The search response generated at `2026-09-04T06:40:09.298Z` has 61 deployment records.
It has one nonempty `products` value.
DTCC has a separate announced mainnet product record and an H1 2027 note.
The exact missing product and deployment model does not reproduce.

## Changes

- `sd-046` now has status `verified` and one dated recurrence.
- `sd-044` has one dated recurrence.
- `sd-037` has one dated recurrence.
- `improvements/INDEX.md` was regenerated by `npm run improvements:index`.
- `improvements/intake.json` did not need a change. The repository has no intake generator script.

No reported-upstream finding changed except for recurrence evidence.

## Tests and gates

| Command | Result |
| --- | --- |
| `npm run improvements:index` | Passed. It wrote `improvements/INDEX.md` for 70 findings. |
| `npm run improvements:lint` | Passed. The lint checked 70 findings. |
| `npm run improvements:lint -- --live` | Passed with current GitHub reads. |
| `npm run improvements:probes` | Passed. Six probes recur. Two LumenLoop probes are inconclusive without `LUMENLOOP_API_KEY`. |
| `./node_modules/.bin/vitest run test/improvements-lint.test.ts test/improvements-writes.test.mjs test/improvements-run-probes.test.ts` | Passed. 26 tests passed in three files. |
| `npm run secrets:scan -- --tree` | Passed. The scan found no secrets. |
| `git diff --check` | Passed. |

## Rejected recurrence claims

- `ll-030` is inconclusive. The current public API returned 401 for both exact requests.
- `sls-023` does not reproduce. The current response has the previously absent model fields.

## Risks and blockers

An authorized LumenLoop read is required to recheck `ll-030` exactly.
This task did not use credentials.

The `sls-023` record remains `reported-upstream` because this task does not close reported findings.
The current evidence suggests that its original defect is fixed.
