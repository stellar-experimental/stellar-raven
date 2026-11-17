# Item 3.4 result: the `execute` boundary read (M2), free

Executor: Claude Sonnet 5.5 on agentpc, 2026-11-17. Base `41300519`. Plan: [PLAN.md](PLAN.md).
USD 0: no model call, no network, no local server. Tuning rows only (split v6, 87 ids).

## Decision

**R(16,000) = 32 of 44 exposed rows (89 of 141 exposed units). The stop rule says "many" (R of
3 or more): the boundary stays 6,000 tokens, M2's boundary question closes, and no code or
configuration changes.** Step 11 did not run. The Grok clip read is informational and decides
nothing: a 20,000-byte head clip of today's stored results loses a cited fact on 23 rows of 38
exposed (see "Grok clip").

The floor of 30 exposed rows holds at 16,000 (44 rows) and at 18,000 (38).

## Inputs

`select-tuning.mjs` read the 15 run files in
`/home/tyler/code/raven-wt/gca-eval/eval/qa/results` (read only; no git there) and kept the tuning
rows of each, by id, with the per-run counts asserted from a constant table. A second run of the
selector produced byte-identical output. Every later step read the selector's output.

| Run file | SHA-256 | Tuning rows |
|---|---|---|
| `2026-11-14T06-06-31-variantA.json` | `fdf9aa7f62522bd6a9989ca6ce0795d4b72190a73f0b99e799fd84a54f6f461e` | 23 |
| `2026-11-14T20-13-51-variantA.json` | `81c59225996eacb3a930bc343f0f016f26cafd7c815377eef2c58be2cd5ced56` | 87 |
| `2026-11-14T22-18-17-variantA.json` | `d8048d25d8720d5a192abe354f8df8e00bdb867504b18f26f10ee2535394284f` | 50 |
| `2026-11-14T23-04-27-variantA.json` | `8ba993fefe919c5ee50364e260927b209a2fbb7e8bc34c8a9614b4a033317bc7` | 50 |
| `2026-11-14T23-27-33-variantA.json` | `1898d715b24bf083cc9a95525d4a77427ca93346a30073b32fba3ffe89e1d82e` | 5 |
| `2026-11-14T23-30-06-variantA.json` | `2c1423c6529a907dd9a59d345d81fb94181b7cbc00e96fce1b822bb1de70eb4d` | 5 |
| `2026-11-14T23-33-28-variantA.json` | `4fb818dc3f339566ac938dc542343054eda073282120083fbdd6a5cec5823d03` | 5 |
| `2026-11-15T00-32-53-variantA.json` | `b43f13e09cdcd1e980b4552bd4411a7d9fc15b744a9646608a543e7c46ff3c9b` | 50 |
| `2026-11-15T04-31-41-variantA.json` | `b84feaee83e98791833e11544e8a7f88bcaeb2d4c355c8d1b8fb56b12d3f8e5f` | 58 |
| `2026-11-15T05-28-42-variantA.json` | `8da193d12c33e4cf0533d058a639dbf29edc98b46e524b3a963cdbd6f2a458e7` | 58 |
| `2026-11-15T05-38-45-variantA.json` | `197e1bc34d9b000b5528cfe5d2ab45bc4a805ef9c1eb137769485f1bf024778a` | 10 |
| `2026-11-15T05-45-31-variantA.json` | `c8a4be67761475870f502fa0ea15fb07941dfdb23fde6b9196db62d549b427b1` | 10 |
| `2026-11-15T07-33-40-variantA.json` | `0fbcfe33b8f99d76cc102e4bdf38abc8425e392b43c33989a7bc7b8241b6fb71` | 58 |
| `2026-11-15T08-55-41-variantA.json` | `702171365ffa7b847235c5c8aaf0da8118a2a4c69f0c518f3f255bc3a0330b6d` | 17 |
| `2026-11-15T09-08-35-variantA.json` | `a531bb253f650e0cf99bba2e96a269b05423d7da0e6aef4e5c6bb8ad6800c585` | 17 |

## Sizes (all 15 runs, tuning rows)

| Measure | Value |
|---|---|
| (run, row) units / distinct rows | 503 / 87 |
| `execute` results | 939 (7 failed, longest 683 characters) |
| Truncated at 24,000 (`SOURCE BASIS` at offset 24,000) | 66 |
| Original value over 16,000 | 146 results, 141 units, 44 rows |
| Original value over 18,000 | 119 results, 116 units, 38 rows |
| Original value over 24,000 | 66 results, 66 units, 28 rows |
| Value characters a 16,000 cut removes | 797,260 (9.85% of the stored value characters; about 396 tokens per unit) |
| Value characters an 18,000 cut removes | 532,468 (6.58%; about 265 tokens per unit) |

These match the plan review's figures exactly. Per run (results / units / distinct rows over each
size):

| Run | Rows | `execute` results | Truncated | Over 16,000 | Over 18,000 | Over 24,000 |
|---|---|---|---|---|---|---|
| 2026-11-14T06-06-31 | 23 | 47 | 3 | 8 / 8 / 8 | 5 / 5 / 5 | 3 / 3 / 3 |
| 2026-11-14T20-13-51 (baseline) | 87 | 171 | 19 | 29 / 29 / 29 | 28 / 28 / 28 | 19 / 19 / 19 |
| 2026-11-14T22-18-17 | 50 | 84 | 3 | 15 / 12 / 12 | 12 / 10 / 10 | 3 / 3 / 3 |
| 2026-11-14T23-04-27 | 50 | 81 | 3 | 12 / 11 / 11 | 7 / 7 / 7 | 3 / 3 / 3 |
| 2026-11-14T23-27-33 | 5 | 8 | 1 | 2 / 2 / 2 | 2 / 2 / 2 | 1 / 1 / 1 |
| 2026-11-14T23-30-06 | 5 | 10 | 1 | 2 / 2 / 2 | 2 / 2 / 2 | 1 / 1 / 1 |
| 2026-11-14T23-33-28 | 5 | 12 | 2 | 3 / 3 / 3 | 3 / 3 / 3 | 2 / 2 / 2 |
| 2026-11-15T00-32-53 | 50 | 80 | 6 | 13 / 13 / 13 | 10 / 10 / 10 | 6 / 6 / 6 |
| 2026-11-15T04-31-41 | 58 | 118 | 9 | 15 / 15 / 15 | 13 / 13 / 13 | 9 / 9 / 9 |
| 2026-11-15T05-28-42 | 58 | 107 | 7 | 17 / 17 / 17 | 14 / 14 / 14 | 7 / 7 / 7 |
| 2026-11-15T05-38-45 | 10 | 16 | 1 | 2 / 2 / 2 | 2 / 2 / 2 | 1 / 1 / 1 |
| 2026-11-15T05-45-31 | 10 | 20 | 2 | 5 / 4 / 4 | 5 / 4 / 4 | 2 / 2 / 2 |
| 2026-11-15T07-33-40 (shipped surface) | 58 | 109 | 8 | 18 / 18 / 18 | 14 / 14 / 14 | 8 / 8 / 8 |
| 2026-11-15T08-55-41 (pointer, not shipped) | 17 | 42 | 1 | 3 / 3 / 3 | 1 / 1 / 1 | 1 / 1 / 1 |
| 2026-11-15T09-08-35 (pointer, not shipped) | 17 | 34 | 0 | 2 / 2 / 2 | 1 / 1 / 1 | 0 / 0 / 0 |

## How the read ran

`read-boundary.mjs` follows plan steps 2 to 5 and 8 (matching rules, kept corpus, three candidate
sources, Grok clip). Its output is the unclassified candidates; I classified them by reading
(step 6), and `classes.json` holds the classes. `read-boundary.mjs --classes classes.json`
reproduces every count below.

- A candidate is **past the cut** when it occurs in a value tail and nowhere in the kept corpus
  (the `execute` results cut at C with their stored host blocks, search hit ids, the static
  surface text, the question). The static text is the source slice of `src/mcp/tools.ts` from
  `SEARCH_DESCRIPTION` to `SERVER_INSTRUCTIONS`; the generated `SEARCH_OPENING` and `FAMILY_LINE`
  inside it are not expanded (a candidate they hold would be a `search-card` at worst).
- The script flags a candidate `in-script` when the model's own scripts contain it
  (`in-earlier-script` for a chained literal an earlier script held, which is not chained).
- **Reading stops at the unit.** I read the candidates of each (run, row) until one was
  `cited` or `chained`; that unit counts toward R, and its remaining candidates stay unclassified.
  A unit with no such candidate has every candidate classified. R and the unit count do not
  depend on the unread candidates; the candidate counts below say how many were read.
- `classes.json` carries each class under the cut it was read for. A class read at 16,000 carries
  to 18,000 and to the Grok clip when the same candidate is past that cut in the same unit;
  every other candidate was read again.
- Class `search-card` did not occur: no candidate was an operation id or field name that only a
  search card shows. Class `incidental` covers ordinary words, boilerplate and echoes of the
  model's own query.

## R by cut

| Cut | Exposed units / rows | Units with candidates | Positive units (cited or chained) | **R (distinct rows)** | R without the two pointer runs | Units without them |
|---|---|---|---|---|---|---|
| 16,000 | 141 / 44 | 101 | 89 | **32** | 32 | 88 |
| 18,000 | 116 / 38 | 82 | 73 | **30** | 30 | 72 |
| Grok 20,000-byte clip (today) | 117 / 38 | 72 | 55 | 23 | 23 | 54 |

Candidates past the cut: 854 at 16,000 (tail-side 706, answer-side 226, chained 14; a candidate can
come from more than one side), 522 at 18,000, 366 under the Grok clip. Read and classified: 117
(93 cited, 4 chained, 20 incidental), 90 (71, 4, 15), 84 (52, 3, 29). Rows with candidates at
16,000: 35; the three with none counted are `q-asset-sdex-vs-amm`, `q-data-network-metrics-sources`
and `q-crp-oz-rwa-erc3643-trex`. Twelve units had candidates and none counted; 40 exposed units had
no candidate. Every one of the 32 positive rows at 16,000 holds at least one `cited` candidate
that is not a source link and not a chained literal (a code, a date, a figure, a name), so R does
not rest on the weaker classes. Four URL candidates carry the `url-in-first-five` flag (the
truncated block's `canonicalUrls` would have listed them); none was classified. 14 candidates
(11 at 16,000, 3 at 18,000) are kept only in a source block that changes state at the cut; they
are listed apart and not counted.

Examples that settle a row (all absent from the first 16,000 characters of every result of the
unit): `account_merge_is_sponsor` at offset 19,910 (`q-pc-sponsored-reserves`, the answer states
it); `12.7` (the tokenized-asset share, offset 17,113, `q-eco-stellar-rwa-stablecoin-volume`);
`pending_user_transfer_complete` at offset 23,062 (`q-sep24-interactive-deposit-flow`).

## Control (step 7)

Not run. The control exists to refuse a script's zero. The script did not return a zero (R is
32), and a hand read of 12 units could only raise R. It cannot change the decision, so under the
spend rule I spent nothing on it.

## Grok clip (informational, for item 4.1)

Kept corpus: the first 20,000 UTF-8 bytes of each stored `execute` result; lost: everything
after, host blocks included. 119 stored `execute` results exceed 20,000 bytes today. The largest
stored `search` result is 18,755 characters, so `search` loses nothing. Fit table (results over
the cut that still exceed 20,000 bytes, with the stored host blocks / with the manifest at its
1,600-character bound):

| Cut | Results over the cut | Still over 20,000 bytes | Largest simulated size (bytes) |
|---|---|---|---|
| 16,000 | 146 | 0 / 0 | 19,494 / 19,950 |
| 18,000 | 119 | 79 / 100 | 21,498 / 21,956 |

So 4,500 would not fit under the Grok clip (it was dropped as a candidate in the plan), and 4,000
would, with 50 to 506 bytes to spare. The clip loses a cited fact on 23 of 38 exposed rows
today. Part of that loss is host source blocks: the as-of date a model states
(`observedAt`) sits in the block the clip cuts (in 8 of the 55 positive units the read stopped at
such a date, so those units may hold more).
Item 4.1 reads how a real Grok client behaves; this read gives it the stored-transcript side.

## Recount (step 10)

Rule as the plan words it, applied to the stored `execute` scripts of each run
(`count-patterns.mjs` plus a read of every script it flagged and an AST scan for top-level reads).

| Run | Surface | Rows | `execute` scripts | With a service call | `data.sections` misreads / `sectionReadScripts` | `.data` omissions / scripts with a service call | Failed calls with an omitted reason / scripts with a failed call |
|---|---|---|---|---|---|---|---|
| 2026-11-14T20-13-51 | `66301389` (before both tuning loops) | 87 | 171 | 163 | **0 / 26** | **0 / 163** | **0 / 4** |
| 2026-11-15T07-33-40 | `bd9719fb`, surface `42ec6102…` (the shipped surface) | 58 | 109 | 108 | **0 / 19** | **0 / 108** | **0 / 8** |

- **`data.sections` misreads, 0 of 26 and 0 of 19.** The ledger's definition (a read that loses
  or garbles section text, or throws; `sections || content` fallbacks, `JSON.stringify` of the
  whole array and shape inspection do not count). Every script reads `r.data.sections` as an
  array (`.map(x => x.content …)`, `[0].content`, or returns the array or the whole `data`).
  Guard messages in results: 0 in both runs. This is below the 5-in-38 the 2026-10-12 result
  recorded before the section-shape text; it is a direction, not a rate.
- **`.data` omissions, 0.** Fields read at an envelope's top level other than `ok`, `data`,
  `error`, `asOf`, `asOfBasis`, `caveat`: none in either run. Rejected as not envelope reads:
  `r.fullName`-style reads on rows inside `.map`, `s.hits` on a `codemode.search` result
  (baseline `q-data-network-metrics-sources` #4), `c.results` after a helper that returns
  `r.data` (shipped `q-comp-aml-analytics-vendors` #3), and `.catch` on a call.
  No `r.data?.hits ?? r.hits` fallback occurs.
- **Failed calls with an omitted reason, 0.** Scripts with at least one failed call
  (`error.kind` `"error"`): baseline 4 (`q-eco-defi-market-map` #3, `q-protocol-version-history-list`
  #2, #4, #5), shipped 8. Every one returns the error object (the value carries `kind` and
  `message`). Soft-empty calls, listed apart and not counted: one script in each run.
- Seen while reading, not asked for: the shipped run holds 10 `[invalid-args: path]` failures in
  8 scripts, from `stellarDocs.get_doc_page` paths written without the leading slash
  (`docs/...`); the host's error names the pattern and the script returns it. The baseline holds
  one script that calls `codemode.call`, which does not exist.

## What this read does not see

It does not credit a narrower re-run at the lower cap, and it does not see paraphrased facts, so
it is a count of cited facts that sat only past the cut, not a bound on loss in either direction.
It cannot see what a lower cap costs in extra `execute` calls or artifact reads. Logs and errors
share the boundary budget; the sample has no console block and no error over 683 characters, so
it says nothing about them. `search` results are not stored, so a fact the model read on a card
cannot be checked (class `search-card`, none found).

## Candidate tables

Source: how the candidate was found (`answer`, `tail`, `chained`). Flag: `in-script`,
`in-earlier-script`, `url-in-first-five`.

#### Cut at 16,000 characters (117 candidates classified)

| Run | Row | Candidate | Source | Class | Flag | Reason |
|---|---|---|---|---|---|---|
| 11-14 06:06 | q-asset-sdex-vs-amm | provider | tail | incidental | in-script | tail's provider is an RPC provider; the answer's is a liquidity provider |
| 11-14 06:06 | q-eco-defi-market-map | sushiswap | tail | cited | - | venue named as priced by the aggregator; the tail holds the sentence |
| 11-14 06:06 | q-raph-official-help-sdf-cannot-recover | 2026-10-21 | answer | cited | - | ToS page date stated; the tail holds it |
| 11-14 06:06 | q-soroban-cli-bindings | --id | answer | cited | - | CLI alias stated; the tail holds it |
| 11-14 06:06 | q-soroban-pre-mainnet-security-steps | sunbeam | tail | cited | - | tool named; only the tail holds it |
| 11-14 06:06 | q-ti-parse-raw-ledger-data | after_all_txs | answer+tail | cited | - | event stage stated; the tail holds the table |
| 11-14 20:13 | q-comp-aml-analytics-vendors | https://stellarlight.xyz/project/merkle-science | answer | cited | - | answer links the directory entry; the URL is only in the tail |
| 11-14 20:13 | q-comp-aml-analytics-vendors | needs_info | answer+tail | cited | - | status value named in the answer; only the tail shows it |
| 11-14 20:13 | q-data-network-metrics-sources | catalog | tail | incidental | - | ordinary word |
| 11-14 20:13 | q-data-network-metrics-sources | hubble | tail | incidental | in-script | the model's own script contains it |
| 11-14 20:13 | q-defi-agent-identity-stellar-experimental | 2026-04-13 | answer | cited | - | last-commit date stated; the tail holds it |
| 11-14 20:13 | q-eco-defi-market-map | sushiswap | tail | cited | - | venue named as priced by the aggregator; the tail holds the sentence |
| 11-14 20:13 | q-eco-stellar-rwa-stablecoin-volume | 12.7 | answer+tail | cited | - | share figure stated; the tail holds it |
| 11-14 20:13 | q-eco-stellar-rwa-stablecoin-volume | 2026-11-13 | answer | cited | - | roundup date stated; the tail holds it |
| 11-14 20:13 | q-hot-sdf-xlm-holdings-sales | responsible | tail | cited | - | answer quotes the terms of service sentence; only the tail holds it |
| 11-14 20:13 | q-pc-protocol-upgrade-timing | 0084 | answer | cited | - | CAP number stated; the tail holds it |
| 11-14 20:13 | q-pc-protocol-upgrade-timing | 17.3.0 | answer | cited | - | SDK version stated; the tail holds it |
| 11-14 20:13 | q-pc-quantum-preparedness-dormant | 2026-11-06 | answer | cited | - | roundup date stated; the tail holds it |
| 11-14 20:13 | q-pc-quantum-preparedness-dormant | dormant account quantum | chained | incidental | in-earlier-script,in-script | the script's own query, echoed back by the earlier result |
| 11-14 20:13 | q-pc-sponsored-reserves | 0033 | answer+tail | cited | - | CAP number stated; the tail holds it |
| 11-14 20:13 | q-protocol-tier1-requirements | 100 | answer | cited | - | 100 GB disk stated; the tail table holds it |
| 11-14 20:13 | q-scf-how-to-apply | prescreen: what happens | chained | chained | in-script | heading learned from the tail of result 0, used to slice the next read; the answer reports that section |
| 11-14 20:13 | q-scf-instawards | 2026-09-30 | answer | cited | - | workshop date stated; the tail holds it |
| 11-14 20:13 | q-scf-vs-sdf-enterprise-fund | 150000 | answer | cited | - | build award cap stated; the tail holds it |
| 11-14 20:13 | q-smart-account-scoped-policy-signers | https://developers.stellar.org/docs/build/guides/auth/check-auth-tu... | answer | cited | - | source link; only the tail holds the URL |
| 11-14 20:13 | q-sor-deploy-invoke-from-js-sdk | contract.client | answer+tail | cited | - | API named; the tail holds it |
| 11-14 20:13 | q-soroban-oz-token | 2026-11-09 | answer | cited | - | last-commit date stated; the tail holds it |
| 11-14 20:13 | q-soroban-pre-mainnet-security-steps | immunefi | tail | cited | - | answer says the HackerOne program replaces the Immunefi one; the tail holds the notice |
| 11-14 20:13 | q-soroban-vuln-classes | https://stellarsecurityportal.com/report/83 | answer | cited | - | source link; only the tail holds the URL |
| 11-14 20:13 | q-ti-classic-submission-errors | createaccount | answer+tail | cited | - | operation named; the tail holds it |
| 11-14 20:13 | q-ti-enumerate-holders-airdrop | code:issueraccountid | answer | cited | - | query format stated; the tail holds it |
| 11-14 20:13 | q-tool-cli-skills-discovery | mariaelisaaraya/stellar-security-guide | answer | cited | - | skill repo named; the tail holds the install lines |
| 11-14 20:13 | q-tool-wallets-comparison | defaultmodules() | answer | cited | - | kit call named; the tail holds it |
| 11-14 22:18 | q-comp-aml-analytics-vendors | automatically | tail | incidental | - | ordinary word |
| 11-14 22:18 | q-comp-aml-analytics-vendors | on-chain | tail | incidental | - | ordinary word |
| 11-14 22:18 | q-crp-oz-rwa-erc3643-trex | off-chain | tail | incidental | - | ordinary word |
| 11-14 22:18 | q-defi-agent-identity-stellar-experimental | caxyxfbo26rsbu2hrnpdwoq7m2witx67e7pi543whddmm5f7u4wqouxm | answer+tail | cited | - | contract id stated; the tail holds it |
| 11-14 22:18 | q-protocol-tier1-requirements | kubernetes | tail | cited | - | docs statement on Kubernetes; the tail holds the page |
| 11-14 22:18 | q-scf-instawards | currently | tail | cited | - | no round open per Scout's live check; the tail holds the note |
| 11-14 22:18 | q-sor-custom-errors-find-failure-cause | tx_bad_seq | answer+tail | cited | - | result code named; the tail holds it |
| 11-14 22:18 | q-sor-deploy-invoke-from-js-sdk | signandsend | answer+tail | cited | - | method named; the tail holds it |
| 11-14 23:04 | q-pc-quantum-preparedness-dormant | activity | tail | incidental | - | ordinary word |
| 11-14 23:04 | q-pc-sponsored-reserves | https://developers.stellar.org/docs/build/guides/transactions/creat... | answer | cited | - | source link; only the tail holds the URL |
| 11-14 23:04 | q-protocol-tier1-requirements | #validator | answer | cited | - | Discord channel named; the tail holds it |
| 11-14 23:04 | q-sep24-interactive-deposit-flow | /docs/build/apps/wallet/sep24 | chained | chained | in-script | path read in the tail of result 0, used by get_doc_page in the next script; the answer cites that page |
| 11-14 23:04 | q-sor-deploy-invoke-from-js-sdk | https://developers.stellar.org/docs/learn/fundamentals/contract-dev... | answer | cited | - | source link; only the tail holds the URL |
| 11-14 23:04 | q-soroban-check-auth-custom-account | smart-account-kit | answer+tail | cited | - | package named; the tail holds it |
| 11-14 23:04 | q-soroban-check-auth-custom-account | webauthnverifieraddress | answer+tail | cited | - | parameter named; the tail holds it |
| 11-14 23:04 | q-soroban-oz-token | https://developers.stellar.org/docs/build/guides/contract-accounts/... | answer | cited | - | source link; only the tail holds the URL |
| 11-14 23:27 | q-comp-aml-analytics-vendors | anchain.ai | tail | cited | - | vendor named; only the tail holds it |
| 11-14 23:27 | q-pc-sponsored-reserves | account_merge_is_sponsor | answer+tail | cited | - | result code stated; the tail holds it |
| 11-14 23:30 | q-comp-aml-analytics-vendors | stellar dashboard | tail | cited | - | Allium dashboard named; the tail holds it |
| 11-14 23:30 | q-pc-sponsored-reserves | final | tail | cited | - | CAP-33 status stated; the tail holds it |
| 11-14 23:33 | q-comp-aml-analytics-vendors | merkle science | tail | cited | - | vendor named; the tail holds it |
| 11-14 23:33 | q-edge-asset-site-scam-detection | auth_clawback_enabled | answer+tail | cited | - | flag named; the tail holds it |
| 11-14 23:33 | q-pc-sponsored-reserves | 0031 | answer+tail | cited | - | CAP number stated; the tail holds it |
| 11-15 00:32 | q-defi-agent-identity-stellar-experimental | https://github.com/eunomia-finance/eunomia | answer | cited | - | repo link stated; only the tail shows it |
| 11-15 00:32 | q-edge-asset-site-scam-detection | attacker | tail | incidental | - | tail's attacker is about validator signatures; the answer's is an account hijack |
| 11-15 00:32 | q-edge-asset-site-scam-detection | single | tail | incidental | - | ordinary word |
| 11-15 00:32 | q-pc-sponsored-reserves | 100 | answer+tail | cited | - | base fee 100 stroops stated; the tail holds it |
| 11-15 00:32 | q-protocol-tier1-requirements | start | tail | incidental | - | ordinary word |
| 11-15 00:32 | q-sep24-interactive-deposit-flow | stellartoml.resolver.resolve(domain) | answer | cited | - | API call stated; the tail holds it |
| 11-15 00:32 | q-sor-custom-errors-find-failure-cause | gettransactions | answer+tail | cited | - | RPC method named; the tail holds it |
| 11-15 00:32 | q-sor-deploy-invoke-from-js-sdk | operation.createcustomcontract | answer | cited | in-script | API named; the tail holds it |
| 11-15 00:32 | q-soroban-pre-mainnet-security-steps | 2026-05-07 | answer | cited | - | policy date stated; the tail holds it |
| 11-15 04:31 | q-comp-aml-analytics-vendors | 2026-05-01 | answer | cited | - | webinar date stated; only the tail shows it |
| 11-15 04:31 | q-comp-aml-analytics-vendors | https://stellar.org/blog/policy/compliance-the-stellar-network | answer | cited | - | source link; only in the tail |
| 11-15 04:31 | q-crp-oz-rwa-erc3643-trex | more | tail | incidental | - | ordinary word |
| 11-15 04:31 | q-defi-agent-identity-stellar-experimental | covering | tail | incidental | - | ordinary word |
| 11-15 04:31 | q-hot-sdf-xlm-holdings-sales | https://stellar.org/quarterly-reports | answer | cited | - | source link; only the tail holds the URL |
| 11-15 04:31 | q-org-sdf-structure-mandate | 2026-02-13 | answer | cited | - | report date stated; the tail holds it |
| 11-15 04:31 | q-pc-sponsored-reserves | account_merge_is_sponsor | answer+tail | cited | - | result code stated; the tail holds it |
| 11-15 04:31 | q-protocol-tier1-requirements | validators: | answer | incidental | - | tail's heading shares the bold label by coincidence |
| 11-15 04:31 | q-scf-ambassador-program | 666 | answer+tail | cited | - | students-trained figure stated; the tail holds it |
| 11-15 04:31 | q-scf-how-to-apply | prescreen: what happens | chained | chained | in-script | heading learned from the tail of result 0, used to slice the next read; the answer reports that section |
| 11-15 04:31 | q-scf-vs-sdf-enterprise-fund | https://stellar.org/blog/foundation-news/announcing-the-matching-fund | answer | cited | - | source link; only the tail holds the URL |
| 11-15 04:31 | q-sep24-interactive-deposit-flow | &callback=postmessage | answer | cited | - | URL parameter stated; the tail holds it |
| 11-15 04:31 | q-sor-deploy-invoke-from-js-sdk | /docs/build/guides/transactions/install-deploy-contract-with-code | chained | incidental | in-earlier-script,in-script | path is in an earlier script of the same unit |
| 11-15 04:31 | q-sor-deploy-invoke-from-js-sdk | basicnodesigner | answer+tail | cited | - | API named; the tail holds it |
| 11-15 04:31 | q-soroban-vuln-classes | https://developers.stellar.org/docs/build/guides/auth | answer | cited | - | source link; only the tail holds the URL |
| 11-15 05:28 | q-comp-sep8-regulated-assets-approval-server | action_required | answer+tail | cited | in-script | SEP-8 status named; the tail holds it |
| 11-15 05:28 | q-comp-sep8-regulated-assets-approval-server | approval_server | answer+tail | cited | - | stellar.toml field named; the tail holds it |
| 11-15 05:28 | q-comp-sep8-regulated-assets-approval-server | authorized_to_maintain_liabilities | answer+tail | cited | - | flag state named; the tail holds it |
| 11-15 05:28 | q-defi-agent-identity-stellar-experimental | trustful | answer+tail | cited | - | directory entry named; only the tail holds it |
| 11-15 05:28 | q-eco-stellar-rwa-stablecoin-volume | 158 | answer+tail | cited | - | growth figure stated; the tail holds it |
| 11-15 05:28 | q-edge-asset-site-scam-detection | 61c06d98fd21 | answer | cited | - | cited article id (URL slug); only the tail shows it |
| 11-15 05:28 | q-hot-sdf-xlm-holdings-sales | https://stellar.org/quarterly-reports | answer | cited | - | source link; only the tail holds the URL |
| 11-15 05:28 | q-protocol-tier1-requirements | validators: | answer | incidental | - | tail's heading shares the bold label by coincidence |
| 11-15 05:28 | q-scf-ambassador-program | showcases | tail | cited | - | answer paraphrases the tail's QF round entry |
| 11-15 05:28 | q-scf-how-to-apply | 1000 | answer | cited | - | instaward range stated; the tail holds it |
| 11-15 05:28 | q-scf-instawards | incubation | tail | cited | - | answer quotes the blog description; the tail holds it |
| 11-15 05:28 | q-scf-vs-sdf-enterprise-fund | 150000 | answer | cited | - | build award cap stated; the tail holds it |
| 11-15 05:28 | q-smart-account-scoped-policy-signers | add_secp256r1 | answer+tail | cited | - | function named; the tail holds it |
| 11-15 05:28 | q-soroban-check-auth-custom-account | https://github.com/stellar/smart-account-kit | answer | cited | - | source link; only the tail holds the URL |
| 11-15 05:28 | q-soroban-pre-mainnet-security-steps | 2025-05-29 | answer | cited | - | post date stated; the tail holds it |
| 11-15 05:28 | q-ti-classic-submission-errors | createaccount | answer+tail | cited | - | operation named; the tail holds it |
| 11-15 05:38 | q-defi-agent-identity-stellar-experimental | 100 | answer+tail | incidental | - | tail's 100 is Nasdaq-100; the answer's 55/100 is a Scout reposcore from elsewhere |
| 11-15 05:38 | q-defi-agent-identity-stellar-experimental | trustful | tail | cited | - | directory entry named; only the tail holds it |
| 11-15 05:38 | q-soroban-pre-mainnet-security-steps | 2026-07-13 | answer+tail | cited | - | consolidation date stated; the tail holds it |
| 11-15 05:45 | q-defi-agent-identity-stellar-experimental | 0.1.0 | answer+tail | cited | - | npm version stated; the tail holds it |
| 11-15 05:45 | q-defi-agent-identity-stellar-experimental | 2026-02-23 | answer+tail | cited | - | deploy date stated; the tail holds it |
| 11-15 05:45 | q-edge-factcheck-soroswap-first-amm | 2026-11-13 | answer | cited | - | roundup date stated; the tail holds it |
| 11-15 05:45 | q-soroban-pre-mainnet-security-steps | https://developers.stellar.org/docs/tools/lab/smart-contracts/contr... | answer | cited | - | source link; only the tail holds the URL |
| 11-15 05:45 | q-soroban-vuln-classes | min_out | answer | cited | - | parameter named; the tail holds it |
| 11-15 07:33 | q-crp-oz-rwa-erc3643-trex | partners | tail | incidental | - | tail's partners are an event's sponsors |
| 11-15 07:33 | q-defi-agent-identity-stellar-experimental | attestation | tail+chained | incidental | in-script | the script's own search word; the tail's phrase is a coincidence |
| 11-15 07:33 | q-defi-agent-identity-stellar-experimental | stellar attestation service | tail | cited | - | directory entry named; only the tail holds it |
| 11-15 07:33 | q-pc-sponsored-reserves | account_merge_is_sponsor | answer+tail | cited | - | result code stated; the tail holds it |
| 11-15 07:33 | q-raph-official-help-sdf-cannot-recover | developer site | tail | cited | - | answer states the developer site links to the Discord; the tail holds the heading |
| 11-15 07:33 | q-scf-ambassador-program | asia pacific | tail | cited | - | regions stated; the tail holds the list |
| 11-15 07:33 | q-scf-vs-sdf-enterprise-fund | netxd | tail | cited | - | investment named; the tail holds it |
| 11-15 07:33 | q-sep24-interactive-deposit-flow | pending_user_transfer_complete | answer+tail | cited | - | status value stated; the tail holds it |
| 11-15 07:33 | q-sor-deploy-invoke-from-js-sdk | /docs/build/guides/conversions/scval-conversions | chained | chained | in-script | path read in the tail, used by the next script; the answer cites that guide |
| 11-15 07:33 | q-sor-deploy-invoke-from-js-sdk | /docs/build/guides/transactions/install-deploy-contract-with-code | chained | incidental | in-earlier-script,in-script | path is in an earlier script of the same unit |
| 11-15 07:33 | q-soroban-pre-mainnet-security-steps | https://stellar.org/grants-and-funding/bug-bounty | answer | cited | - | source link; only the tail holds the URL |
| 11-15 07:33 | q-ti-classic-submission-errors | tx_fee_bump_inner_failed | answer+tail | cited | - | result code stated; the tail holds it |
| 11-15 08:55 | q-edge-asset-site-scam-detection | num_accounts | answer+tail | cited | - | field named; the tail holds it |

#### Cut at 18,000 characters (90 candidates classified)

| Run | Row | Candidate | Source | Class | Flag | Reason |
|---|---|---|---|---|---|---|
| 11-14 06:06 | q-eco-defi-market-map | sushiswap | tail | cited | - | venue named as priced by the aggregator; the tail holds the sentence |
| 11-14 06:06 | q-raph-official-help-sdf-cannot-recover | custodial | tail | incidental | - | common term; the sentence is not tied to the tail's page title |
| 11-14 06:06 | q-raph-official-help-sdf-cannot-recover | non-custodial | tail | incidental | - | common term; the sentence is not tied to the tail's page title |
| 11-14 06:06 | q-raph-official-help-sdf-cannot-recover | possible | tail | incidental | - | ordinary word |
| 11-14 06:06 | q-soroban-cli-bindings | --id | answer | cited | - | CLI alias stated; the tail holds it |
| 11-14 06:06 | q-soroban-pre-mainnet-security-steps | sunbeam | tail | cited | - | tool named; only the tail holds it |
| 11-14 20:13 | q-comp-aml-analytics-vendors | https://stellarlight.xyz/project/merkle-science | answer | cited | - | answer links the directory entry; the URL is only in the tail |
| 11-14 20:13 | q-comp-aml-analytics-vendors | needs_info | answer+tail | cited | - | status value named in the answer; only the tail shows it |
| 11-14 20:13 | q-data-network-metrics-sources | hubble | tail | incidental | in-script | the model's own script contains it |
| 11-14 20:13 | q-defi-agent-identity-stellar-experimental | 2026-04-13 | answer | cited | - | last-commit date stated; the tail holds it |
| 11-14 20:13 | q-eco-defi-market-map | sushiswap | tail | cited | - | venue named as priced by the aggregator; the tail holds the sentence |
| 11-14 20:13 | q-eco-stellar-rwa-stablecoin-volume | 395.5m | tail | cited | - | Q2 stablecoin market cap stated; the tail holds it |
| 11-14 20:13 | q-hot-sdf-xlm-holdings-sales | responsible | tail | cited | - | answer quotes the terms of service sentence; only the tail holds it |
| 11-14 20:13 | q-pc-protocol-upgrade-timing | 0084 | answer | cited | - | CAP number stated; the tail holds it |
| 11-14 20:13 | q-pc-quantum-preparedness-dormant | 2026-11-06 | answer | cited | - | roundup date stated; the tail holds it |
| 11-14 20:13 | q-pc-quantum-preparedness-dormant | dormant account quantum | chained | incidental | in-earlier-script,in-script | the script's own query, echoed back by the earlier result |
| 11-14 20:13 | q-pc-sponsored-reserves | 0033 | answer+tail | cited | - | CAP number stated; the tail holds it |
| 11-14 20:13 | q-protocol-tier1-requirements | 100 | answer | cited | - | 100 GB disk stated; the tail table holds it |
| 11-14 20:13 | q-scf-how-to-apply | prescreen: what happens | chained | chained | in-script | heading learned from the tail of result 0, used to slice the next read; the answer reports that section |
| 11-14 20:13 | q-scf-instawards | 2026-09-30 | answer | cited | - | workshop date stated; the tail holds it |
| 11-14 20:13 | q-scf-vs-sdf-enterprise-fund | 150000 | answer | cited | - | build award cap stated; the tail holds it |
| 11-14 20:13 | q-smart-account-scoped-policy-signers | https://developers.stellar.org/docs/build/guides/auth/check-auth-tu... | answer | cited | - | source link; only the tail holds the URL |
| 11-14 20:13 | q-sor-deploy-invoke-from-js-sdk | contract.client | answer+tail | cited | - | API named; the tail holds it |
| 11-14 20:13 | q-soroban-pre-mainnet-security-steps | immunefi | tail | cited | - | answer says the HackerOne program replaces the Immunefi one; the tail holds the notice |
| 11-14 20:13 | q-ti-enumerate-holders-airdrop | https://developers.stellar.org/docs/build/guides/transactions/claim... | answer | cited | - | source link; only the tail holds the URL |
| 11-14 20:13 | q-tool-cli-skills-discovery | trustless-work/trustlesswork-skill | answer | cited | - | skill repo named; the tail holds the install line |
| 11-14 20:13 | q-tool-wallets-comparison | defaultmodules() | answer | cited | - | kit call named; the tail holds it |
| 11-14 22:18 | q-comp-aml-analytics-vendors | on-chain | tail | incidental | - | ordinary word |
| 11-14 22:18 | q-crp-oz-rwa-erc3643-trex | off-chain | tail | incidental | - | ordinary word |
| 11-14 22:18 | q-defi-agent-identity-stellar-experimental | chaincred | tail+chained | chained | in-script | name read in the tail of result 0, used as a query in script 1; the answer names it |
| 11-14 22:18 | q-protocol-tier1-requirements | kubernetes | tail | cited | - | docs statement on Kubernetes; the tail holds the page |
| 11-14 22:18 | q-sor-custom-errors-find-failure-cause | tx_bad_seq | answer+tail | cited | - | result code named; the tail holds it |
| 11-14 23:04 | q-pc-quantum-preparedness-dormant | activity | tail | incidental | - | ordinary word |
| 11-14 23:04 | q-pc-sponsored-reserves | https://developers.stellar.org/docs/build/guides/transactions/creat... | answer | cited | - | source link; only the tail holds the URL |
| 11-14 23:04 | q-protocol-tier1-requirements | phase | tail | cited | - | onboarding phase 4 stated; the tail holds the section anchor and text |
| 11-14 23:04 | q-sep24-interactive-deposit-flow | /docs/build/apps/wallet/sep24 | chained | chained | in-script | path read in the tail of result 0, used by get_doc_page in the next script; the answer cites that page |
| 11-14 23:04 | q-sor-deploy-invoke-from-js-sdk | https://developers.stellar.org/docs/learn/fundamentals/contract-dev... | answer | cited | - | source link; only the tail holds the URL |
| 11-14 23:04 | q-soroban-check-auth-custom-account | context rules | tail | cited | - | kit feature stated; the tail holds the list |
| 11-14 23:27 | q-comp-aml-analytics-vendors | anchain.ai | tail | cited | - | vendor named; only the tail holds it |
| 11-14 23:27 | q-pc-sponsored-reserves | account_merge_is_sponsor | answer+tail | cited | - | result code stated; the tail holds it |
| 11-14 23:30 | q-comp-aml-analytics-vendors | services | tail | cited | - | answer repeats the SEP-12 description phrase held only in the tail |
| 11-14 23:30 | q-pc-sponsored-reserves | final | tail | cited | - | CAP-33 status stated; the tail holds it |
| 11-14 23:33 | q-comp-aml-analytics-vendors | scorechain | tail | cited | - | vendor named; the tail holds it |
| 11-14 23:33 | q-edge-asset-site-scam-detection | auth_required | answer+tail | cited | - | flag named; the tail holds it |
| 11-14 23:33 | q-pc-sponsored-reserves | 0031 | answer+tail | cited | - | CAP number stated; the tail holds it |
| 11-15 00:32 | q-defi-agent-identity-stellar-experimental | https://github.com/eunomia-finance/eunomia | answer | cited | - | repo link stated; only the tail shows it |
| 11-15 00:32 | q-edge-asset-site-scam-detection | single | tail | incidental | - | ordinary word |
| 11-15 00:32 | q-pc-sponsored-reserves | https://developers.stellar.org/docs/build/guides/transactions/creat... | answer | cited | - | source link; only the tail holds the URL |
| 11-15 00:32 | q-protocol-tier1-requirements | start | tail | incidental | - | ordinary word |
| 11-15 00:32 | q-sor-custom-errors-find-failure-cause | gettransactions | answer+tail | cited | - | RPC method named; the tail holds it |
| 11-15 00:32 | q-sor-deploy-invoke-from-js-sdk | operation.createcustomcontract | answer | cited | in-script | API named; the tail holds it |
| 11-15 00:32 | q-soroban-pre-mainnet-security-steps | 2026-05-07 | answer | cited | - | policy date stated; the tail holds it |
| 11-15 04:31 | q-comp-aml-analytics-vendors | 2026-05-01 | answer | cited | - | webinar date stated; only the tail shows it |
| 11-15 04:31 | q-comp-aml-analytics-vendors | https://stellar.org/blog/policy/compliance-the-stellar-network | answer | cited | - | source link; only in the tail |
| 11-15 04:31 | q-org-sdf-structure-mandate | 2026-02-13 | answer | cited | - | report date stated; the tail holds it |
| 11-15 04:31 | q-pc-sponsored-reserves | final | tail | cited | - | CAP-33 status stated; the tail holds it |
| 11-15 04:31 | q-protocol-tier1-requirements | validators: | answer | incidental | - | tail's heading shares the bold label by coincidence |
| 11-15 04:31 | q-scf-ambassador-program | 666 | answer+tail | cited | - | students-trained figure stated; the tail holds it |
| 11-15 04:31 | q-scf-how-to-apply | prescreen: what happens | chained | chained | in-script | heading learned from the tail of result 0, used to slice the next read; the answer reports that section |
| 11-15 04:31 | q-scf-vs-sdf-enterprise-fund | https://stellar.org/blog/foundation-news/announcing-the-matching-fund | answer | cited | - | source link; only the tail holds the URL |
| 11-15 04:31 | q-sor-deploy-invoke-from-js-sdk | /docs/build/guides/transactions/install-deploy-contract-with-code | chained | incidental | in-earlier-script,in-script | path is in an earlier script of the same unit |
| 11-15 04:31 | q-sor-deploy-invoke-from-js-sdk | basicnodesigner | answer+tail | cited | - | API named; the tail holds it |
| 11-15 05:28 | q-comp-sep8-regulated-assets-approval-server | draft | tail | cited | - | SEP-57 status stated; the tail holds it |
| 11-15 05:28 | q-defi-agent-identity-stellar-experimental | trustful | answer+tail | cited | - | directory entry named; only the tail holds it |
| 11-15 05:28 | q-eco-stellar-rwa-stablecoin-volume | 158 | answer+tail | cited | - | growth figure stated; the tail holds it |
| 11-15 05:28 | q-edge-asset-site-scam-detection | 61c06d98fd21 | answer | cited | - | cited article id (URL slug); only the tail shows it |
| 11-15 05:28 | q-hot-sdf-xlm-holdings-sales | https://stellar.org/quarterly-reports | answer | cited | - | source link; only the tail holds the URL |
| 11-15 05:28 | q-protocol-tier1-requirements | validators: | answer | incidental | - | tail's heading shares the bold label by coincidence |
| 11-15 05:28 | q-scf-ambassador-program | showcases | tail | cited | - | answer paraphrases the tail's QF round entry |
| 11-15 05:28 | q-scf-how-to-apply | 1000 | answer | cited | - | instaward range stated; the tail holds it |
| 11-15 05:28 | q-scf-vs-sdf-enterprise-fund | 150000 | answer | cited | - | build award cap stated; the tail holds it |
| 11-15 05:28 | q-smart-account-scoped-policy-signers | add_secp256r1 | answer+tail | cited | - | function named; the tail holds it |
| 11-15 05:28 | q-soroban-pre-mainnet-security-steps | 2026-07-20 | answer | cited | - | post date stated; the tail holds it |
| 11-15 05:38 | q-defi-agent-identity-stellar-experimental | 100 | answer+tail | incidental | - | tail's 100 is Nasdaq-100; the answer's 55/100 is a Scout reposcore from elsewhere |
| 11-15 05:38 | q-defi-agent-identity-stellar-experimental | trustful | tail | cited | - | directory entry named; only the tail holds it |
| 11-15 05:38 | q-soroban-pre-mainnet-security-steps | 2026-07-13 | answer+tail | cited | - | consolidation date stated; the tail holds it |
| 11-15 05:45 | q-defi-agent-identity-stellar-experimental | 0.1.0 | answer+tail | cited | - | npm version stated; the tail holds it |
| 11-15 05:45 | q-edge-factcheck-soroswap-first-amm | 2026-11-13 | answer | cited | - | roundup date stated; the tail holds it |
| 11-15 05:45 | q-soroban-pre-mainnet-security-steps | https://developers.stellar.org/docs/tools/lab/smart-contracts/contr... | answer | cited | - | source link; only the tail holds the URL |
| 11-15 05:45 | q-soroban-vuln-classes | min_out | answer | cited | - | parameter named; the tail holds it |
| 11-15 07:33 | q-pc-sponsored-reserves | account_merge_is_sponsor | answer+tail | cited | - | result code stated; the tail holds it |
| 11-15 07:33 | q-raph-official-help-sdf-cannot-recover | developer site | tail | cited | - | answer states the developer site links to the Discord; the tail holds the heading |
| 11-15 07:33 | q-scf-ambassador-program | asia pacific | tail | cited | - | regions stated; the tail holds the list |
| 11-15 07:33 | q-scf-vs-sdf-enterprise-fund | netxd | tail | cited | - | investment named; the tail holds it |
| 11-15 07:33 | q-sep24-interactive-deposit-flow | pending_user_transfer_complete | answer+tail | cited | - | status value stated; the tail holds it |
| 11-15 07:33 | q-sor-deploy-invoke-from-js-sdk | /docs/build/guides/transactions/install-deploy-contract-with-code | chained | incidental | in-earlier-script,in-script | path is in an earlier script of the same unit |
| 11-15 07:33 | q-sor-deploy-invoke-from-js-sdk | https://developers.stellar.org/docs/build/guides/transactions/insta... | answer | cited | - | source link; only the tail holds the URL |
| 11-15 07:33 | q-soroban-pre-mainnet-security-steps | sunbeam | tail | cited | - | tool named; only the tail holds it |
| 11-15 07:33 | q-ti-classic-submission-errors | tx_fee_bump_inner_failed | answer+tail | cited | - | result code stated; the tail holds it |
| 11-15 08:55 | q-edge-asset-site-scam-detection | num_accounts | answer+tail | cited | - | field named; the tail holds it |

#### Grok 20,000-byte head clip (84 candidates classified)

| Run | Row | Candidate | Source | Class | Flag | Reason |
|---|---|---|---|---|---|---|
| 11-14 06:06 | q-defi-agent-identity-stellar-experimental | these | tail | incidental | - | host boilerplate word |
| 11-14 06:06 | q-eco-defi-market-map | sushiswap | tail | cited | - | venue named as priced by the aggregator; the tail holds the sentence |
| 11-14 06:06 | q-raph-official-help-sdf-cannot-recover | custodial | tail | incidental | - | common term; the sentence is not tied to the tail's page title |
| 11-14 06:06 | q-raph-official-help-sdf-cannot-recover | non-custodial | tail | incidental | - | common term; the sentence is not tied to the tail |
| 11-14 06:06 | q-raph-official-help-sdf-cannot-recover | possible | tail | incidental | - | ordinary word |
| 11-14 06:06 | q-soroban-cli-bindings | 2026-11-14 | answer | cited | - | as-of date stated; only the clipped source block holds the observation time |
| 11-14 06:06 | q-soroban-pre-mainnet-security-steps | 2026-11-14 | answer | cited | - | as-of date stated; only the clipped source block holds the observation time |
| 11-14 20:13 | q-comp-aml-analytics-vendors | https://stellarlight.xyz/project/merkle-science | answer | cited | - | answer links the directory entry; the URL is only in the tail |
| 11-14 20:13 | q-data-network-metrics-sources | hubble | tail | incidental | in-script | the model's own script contains it |
| 11-14 20:13 | q-defi-agent-identity-stellar-experimental | 2026-04-13 | answer | cited | - | last-commit date stated; the tail holds it |
| 11-14 20:13 | q-eco-defi-market-map | sushiswap | tail | cited | - | venue named as priced by the aggregator; the tail holds the sentence |
| 11-14 20:13 | q-eco-stellar-rwa-stablecoin-volume | 395.5m | tail | cited | - | Q2 stablecoin market cap stated; the tail holds it |
| 11-14 20:13 | q-hot-sdf-xlm-holdings-sales | responsible | tail | cited | - | answer quotes the terms of service sentence; only the tail holds it |
| 11-14 20:13 | q-pc-protocol-upgrade-timing | 2026-11-14 | answer | cited | - | as-of date stated; only the clipped source block holds the observation time |
| 11-14 20:13 | q-pc-quantum-preparedness-dormant | dormant account quantum | chained | incidental | in-earlier-script,in-script | the script's own query, echoed back by the earlier result |
| 11-14 20:13 | q-pc-sponsored-reserves | 0033 | answer+tail | cited | - | CAP number stated; the tail holds it |
| 11-14 20:13 | q-protocol-tier1-requirements | contribution | tail | incidental | - | the sentence is not tied to the tail span |
| 11-14 20:13 | q-scf-ambassador-program | these | tail | incidental | - | host boilerplate word |
| 11-14 20:13 | q-scf-how-to-apply | prescreen: what happens | chained | chained | in-script | heading learned from the tail of result 0, used to slice the next read; the answer reports that section |
| 11-14 20:13 | q-scf-instawards | pitching | tail | cited | - | workshop stated; the tail holds it |
| 11-14 20:13 | q-scf-vs-sdf-enterprise-fund | https://stellar.org/blog/foundation-news/announcing-the-matching-fund | answer | cited | - | source link; only the tail holds the URL |
| 11-14 20:13 | q-sor-deploy-invoke-from-js-sdk | contract.client | answer+tail | cited | - | API named; the tail holds it |
| 11-14 20:13 | q-soroban-pre-mainnet-security-steps | immunefi | tail | cited | - | answer says the HackerOne program replaces the Immunefi one; the tail holds the notice |
| 11-14 20:13 | q-ti-enumerate-holders-airdrop | https://developers.stellar.org/docs/build/guides/transactions/claim... | answer | cited | - | source link; only the tail holds the URL |
| 11-14 20:13 | q-tool-wallets-comparison | defaultmodules() | answer | cited | - | kit call named; the tail holds it |
| 11-14 22:18 | q-comp-aml-analytics-vendors | 2026-11-14 | answer | cited | - | as-of date stated; only the clipped source block holds the observation time |
| 11-14 22:18 | q-defi-agent-identity-stellar-experimental | chaincred | chained | chained | in-script | name read in the tail of result 0, used as a query in script 1 |
| 11-14 22:18 | q-defi-agent-identity-stellar-experimental | these | tail | incidental | - | host boilerplate word |
| 11-14 22:18 | q-protocol-tier1-requirements | published | tail | incidental | - | ordinary word |
| 11-14 23:04 | q-pc-quantum-preparedness-dormant | activity | tail | incidental | - | ordinary word |
| 11-14 23:04 | q-pc-sponsored-reserves | final | tail | cited | - | CAP-33 status stated; the tail holds it |
| 11-14 23:04 | q-protocol-tier1-requirements | phase | tail | cited | - | onboarding phase 4 stated; the tail holds it |
| 11-14 23:27 | q-comp-aml-analytics-vendors | announced | tail | incidental | - | ordinary word |
| 11-14 23:27 | q-pc-sponsored-reserves | numsponsoring > 0 | answer | cited | - | condition stated; the tail holds it |
| 11-14 23:30 | q-comp-aml-analytics-vendors | services | tail | cited | - | answer repeats the SEP-12 description phrase held only in the tail |
| 11-14 23:33 | q-comp-aml-analytics-vendors | scorechain | tail | cited | - | vendor named; the tail holds it |
| 11-14 23:33 | q-pc-sponsored-reserves | behavior | tail | incidental | - | ordinary word |
| 11-14 23:33 | q-pc-sponsored-reserves | caveat: | answer | incidental | - | host boilerplate label |
| 11-14 23:33 | q-pc-sponsored-reserves | mechanism | tail | incidental | - | ordinary word |
| 11-14 23:33 | q-pc-sponsored-reserves | sep | tail | incidental | in-script | ordinary word |
| 11-15 00:32 | q-defi-agent-identity-stellar-experimental | https://developers.stellar.org/docs/tools/cli/agent-cli | answer | cited | - | source link; only the tail holds the URL |
| 11-15 00:32 | q-pc-sponsored-reserves | 2026-11-15 | answer | cited | - | as-of date stated; only the clipped source block holds the observation time |
| 11-15 00:32 | q-sor-custom-errors-find-failure-cause | gettransactions | answer+tail | cited | - | RPC method named; the tail holds it |
| 11-15 00:32 | q-sor-deploy-invoke-from-js-sdk | operation.createcustomcontract | answer | cited | in-script | API named; the tail holds it |
| 11-15 00:32 | q-soroban-pre-mainnet-security-steps | third-party | tail | cited | - | out-of-scope wording stated; the tail holds it |
| 11-15 04:31 | q-comp-aml-analytics-vendors | 2026-05-01 | answer | cited | - | webinar date stated; only the tail shows it |
| 11-15 04:31 | q-eco-stellar-rwa-stablecoin-volume | 2026-11-15 | answer | cited | - | as-of date stated; only the clipped source block holds the observation time |
| 11-15 04:31 | q-org-sdf-structure-mandate | 2026-02-13 | answer | cited | - | report date stated; the tail holds it |
| 11-15 04:31 | q-pc-sponsored-reserves | final | tail | cited | - | CAP-33 status stated; the tail holds it |
| 11-15 04:31 | q-protocol-tier1-requirements | validators: | answer | incidental | - | tail's heading shares the bold label by coincidence |
| 11-15 04:31 | q-scf-ambassador-program | 666 | answer+tail | cited | - | students-trained figure stated; the tail holds it |
| 11-15 04:31 | q-scf-how-to-apply | prescreen: what happens | chained | chained | in-script | heading learned from the tail of result 0, used to slice the next read; the answer reports that section |
| 11-15 04:31 | q-scf-vs-sdf-enterprise-fund | https://stellar.org/blog/foundation-news/announcing-the-matching-fund | answer | cited | - | source link; only the tail holds the URL |
| 11-15 04:31 | q-sor-deploy-invoke-from-js-sdk | /docs/build/guides/transactions/install-deploy-contract-with-code | chained | incidental | in-earlier-script,in-script | path is in an earlier script of the same unit |
| 11-15 04:31 | q-sor-deploy-invoke-from-js-sdk | basicnodesigner | answer+tail | cited | - | API named; the tail holds it |
| 11-15 05:28 | q-crp-oz-rwa-erc3643-trex | statement | tail | incidental | - | host guidance wording; a behavior effect, not a cited source fact |
| 11-15 05:28 | q-crp-oz-rwa-erc3643-trex | stellar docs | tail | incidental | - | host guidance wording; a behavior effect, not a cited source fact |
| 11-15 05:28 | q-defi-agent-identity-stellar-experimental | trustful | answer+tail | cited | - | directory entry named; only the tail holds it |
| 11-15 05:28 | q-eco-stellar-rwa-stablecoin-volume | 158 | answer+tail | cited | - | growth figure stated; the tail holds it |
| 11-15 05:28 | q-edge-asset-site-scam-detection | 61c06d98fd21 | answer | cited | - | cited article id (URL slug); only the tail shows it |
| 11-15 05:28 | q-hot-sdf-xlm-holdings-sales | https://stellar.org/quarterly-reports | answer | cited | - | source link; only the tail holds the URL |
| 11-15 05:28 | q-protocol-tier1-requirements | stellar docs | tail | incidental | - | host guidance wording; a behavior effect, not a cited source fact |
| 11-15 05:28 | q-protocol-tier1-requirements | validators: | answer | incidental | - | tail's heading shares the bold label by coincidence |
| 11-15 05:28 | q-scf-ambassador-program | showcases | tail | cited | - | answer paraphrases the tail's QF round entry |
| 11-15 05:28 | q-scf-how-to-apply | 1000 | answer | cited | - | instaward range stated; the tail holds it |
| 11-15 05:28 | q-scf-vs-sdf-enterprise-fund | 150000 | answer | cited | - | build award cap stated; the tail holds it |
| 11-15 05:28 | q-soroban-pre-mainnet-security-steps | 2026-07-20 | answer | cited | - | post date stated; the tail holds it |
| 11-15 05:38 | q-defi-agent-identity-stellar-experimental | 100 | answer+tail | incidental | - | tail's 100 is Nasdaq-100; the answer's 55/100 is a Scout reposcore from elsewhere |
| 11-15 05:38 | q-defi-agent-identity-stellar-experimental | trustful | tail | cited | - | directory entry named; only the tail holds it |
| 11-15 05:45 | q-defi-agent-identity-stellar-experimental | 0.1.0 | answer+tail | cited | - | npm version stated; the tail holds it |
| 11-15 05:45 | q-edge-factcheck-soroswap-first-amm | 2026-11-13 | answer | cited | - | roundup date stated; the tail holds it |
| 11-15 05:45 | q-soroban-pre-mainnet-security-steps | https://developers.stellar.org/docs/tools/lab/smart-contracts/contr... | answer | cited | - | source link; only the tail holds the URL |
| 11-15 05:45 | q-soroban-vuln-classes | min_out | answer | cited | - | parameter named; the tail holds it |
| 11-15 07:33 | q-comp-aml-analytics-vendors | anything | tail | incidental | - | host guidance wording; a behavior effect, not a cited source fact |
| 11-15 07:33 | q-comp-aml-analytics-vendors | stellar docs | tail | incidental | - | host guidance wording; a behavior effect, not a cited source fact |
| 11-15 07:33 | q-raph-official-help-sdf-cannot-recover | whether | tail | incidental | - | ordinary word |
| 11-15 07:33 | q-scf-ambassador-program | 2026-11-15 | answer | cited | - | as-of date stated; only the clipped source block holds the observation time |
| 11-15 07:33 | q-scf-vs-sdf-enterprise-fund | better | tail | incidental | - | ordinary word |
| 11-15 07:33 | q-sep24-interactive-deposit-flow | pending_user_transfer_complete | answer+tail | cited | - | status value stated; the tail holds it |
| 11-15 07:33 | q-sor-deploy-invoke-from-js-sdk | /docs/build/guides/transactions/install-deploy-contract-with-code | chained | incidental | in-earlier-script,in-script | path is in an earlier script of the same unit |
| 11-15 07:33 | q-sor-deploy-invoke-from-js-sdk | https://developers.stellar.org/docs/build/guides/transactions/insta... | answer | cited | - | source link; only the tail holds the URL |
| 11-15 07:33 | q-soroban-pre-mainnet-security-steps | 2026-11-15 | answer | cited | - | as-of date stated; only the clipped source block holds the observation time |
| 11-15 07:33 | q-ti-classic-submission-errors | assets | tail | incidental | - | ordinary word |
| 11-15 08:55 | q-edge-asset-site-scam-detection | num_accounts | answer+tail | cited | - | field named; the tail holds it |

#### Kept only in a source block that changes state at the cut (flagged, not counted)

| Cut | Run | Row | Candidate |
|---|---|---|---|
| 16000 | 11-14 06:06 | q-soroban-pre-mainnet-security-steps | verification |
| 16000 | 11-14 22:18 | q-defi-agent-identity-stellar-experimental | https://github.com/berkingurcan/stellar-agent-search |
| 16000 | 11-14 22:18 | q-scf-instawards | 2026-11-14 |
| 16000 | 11-15 05:28 | q-comp-sep8-regulated-assets-approval-server | 2026-11-15 |
| 16000 | 11-15 05:28 | q-comp-sep8-regulated-assets-approval-server | returned |
| 16000 | 11-15 05:28 | q-comp-sep8-regulated-assets-approval-server | show |
| 16000 | 11-15 05:28 | q-comp-sep8-regulated-assets-approval-server | success |
| 16000 | 11-15 05:28 | q-scf-how-to-apply | 2026 |
| 16000 | 11-15 05:45 | q-soroban-vuln-classes | 2026 |
| 16000 | 11-15 07:33 | q-eco-stellar-rwa-stablecoin-volume | 2026-11-15 |
| 16000 | 11-15 07:33 | q-edge-asset-site-scam-detection | 2026-11-15 |
| 18000 | 11-15 05:28 | q-comp-sep8-regulated-assets-approval-server | 2026-11-15 |
| 18000 | 11-15 05:28 | q-scf-how-to-apply | 2026 |
| 18000 | 11-15 07:33 | q-eco-stellar-rwa-stablecoin-volume | 2026-11-15 |
