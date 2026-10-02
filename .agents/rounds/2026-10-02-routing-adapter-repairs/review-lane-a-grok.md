# Lane A independent review

Verdict: approve with changes

The reviewable diff is the working tree against `76c7f02b`. Current `origin/main` is `af740db5` (`#219`). That commit does not change `catalog/manifest.json`. The catalog blob is the same as `HEAD`.

## Rule from the code

`stellarDocsTitleExtras` in `scripts/build-catalog.mjs` lines 301–335 does this:

1. It keeps page titles whose path starts with one of the operation URL prefixes.
2. It stems tokens with `canonicalRoutingToken`.
3. It drops a token whose stem is a searchable service name. `stellarDocs` yields `stellar` and `doc`. `skills` yields `skill`.
4. It keeps a token whose stem appears in the final id segment of any searchable entry.
5. It drops any other token when every other searchable service has the stem in at least one entry.
6. The fields are id, service, kind, description, keywords, and routingKeywords.
7. Entries with `searchable: false` do not count. Skill sections are already `searchable: false`.
8. The old per-service frequency filter and the keyword cap still run after this.

The named-topic test is the set of those id stems. It is not a hand word list. It has no frequency threshold. One entry in a service is enough for the service test.

## Findings

### 1. should-fix — Do not raise legacy top-1 to 220 on this evidence

`q-infra-hubble-vs-rpc-layer` moves `stellarDocs.search_rpc_horizon_data_docs` from rank 5 to rank 1. The baseline score is 184 in the gated tier. The new score is 445 in the backfill tier. `tmp/lane-a-report.md` line 138 says the new score is 437. The author traces and a fresh gate run both record 445.

The question is "Should I read account balances and history from Stellar RPC or from Hubble/BigQuery? When does each make sense?" Restoring either deleted keyword `history` or `queries` returns the hit to rank 5, score 184, gated tier. Those stems are deleted because one entry in lumenloop, scout, and skills contains each stem. `history` is on `lumenloop.search_content_semantic`, four Scout entries, and two skills. The full-query scorer then returns a score, so `weightedScore` does not take the stopword retry (`src/catalog/scoring.ts` lines 225–235).

The page puts the right docs operation first. The grade change is a tier change after those two words leave the history docs operation. `eval/gates.json` raises `evidence.acceptedTotals.legacy.top1` and `legacy.top1` from 219 to 220. The legacy band is ±3. A measured 220 still passes a baseline of 219. `npm run eval:selftest` checks that the two top-1 fields match each other. It does not require 220.

Expected fix: set both top-1 fields back to 219. Describe the movement as a backfill promotion at score 445. Name `history` and `queries`. Keep the manifest fingerprint.

### 2. should-fix — One entry per service deletes real docs topics

The same test deletes `oracle` from `stellarDocs.search_rpc_horizon_data_docs`. `oracle` is not an id-tail stem. For "what oracle should I use for prices on Stellar" (`q-holdout-c-05-oracle-pick`), the data docs hit leaves the page. Baseline rank is 3, score 220, gated tier. The replacement is `stellarDocs.search_docs_in_category` at score 210. The holdout grade stays a pass. For "What oracle options do I have on Stellar besides Reflector?" the same operation leaves rank 4.

The service set is unstable. Searchable services are lumenloop, scout, skills, and stellarDocs. A fifth service with description "Quote a route" returns 32 title tokens to the SDK operation, including `agents`, `account`, and `events`. Removal of the skills service drops `metadata`, `payments`, `cross`, and three other SDK title tokens. Some kept stems exist only because an id contains them: `get` (24 ids), `build` (`scout.searchHackathonBuilds`), `data`, `token` (`stellarDocs.search_asset_token_docs`), and `in` (`stellarDocs.search_docs_in_category`).

Expected fix: count a stem for a service only when more than one searchable entry in that service contains it, or when the stem is in that service's operation names. Keep a title stem when the existing docs frequency filter would keep it for one docs operation.

### 3. should-fix — Agent CLI titles still gate the contract docs operation

`stellarDocs.search_soroban_contract_docs` includes prefix `https://developers.stellar.org/docs/tools/cli/` (`specs/stellar-docs.json` lines 420 and 467–474). The SDK operation prefix is `https://developers.stellar.org/docs/tools`. Agent CLI pages match both prefixes.

The contract operation gains these new keywords: `spending`, `pay`, `apis`, `x402`, `messages`, `usdt0`, `mainnet`, `quickstart`, `authority`, `security`, `model`, `output`, `troubleshooting`. `messages` stays because lumenloop has zero entries with that stem and Scout has zero. Only `skills.stellar-dev.cross-chain` has it.

For the query "Sign messages", the baseline page has no contract hit. After the rule, `search_soroban_contract_docs` is rank 1, score 26, gated tier. The SDK operation is rank 2, score 41, backfill tier. Titles without the new rule produce the same page. The rule does not stop this rescue. Two keyword matches can still admit an operation (`src/catalog/scoring.ts` lines 187–191).

Expected fix: assign each title path to one docs operation. Do not copy `/docs/tools/cli/agent-cli` title tokens onto `search_soroban_contract_docs`.

### 4. nit — Four tests stay green without the exclusion predicate

`test/title-keywords.test.ts` has five tests. I re-ran the first four fixtures with the predicate removed and the same tokenizer. Only "drops service names and shared prose" fails. The one-service test, the hidden-section test, and the single-service test still match. The URL-scope test also matches a filterless tokenizer: `Quasar` becomes `quasar`, and an operation with no prefixes still gets no titles. The old function fails all five because it returns raw title text. That failure is the output shape. It is not five independent pins of the predicate.

Expected fix: add one fixture that fails when the predicate is removed and the token list stays normalized. Keep the synthetic catalog. Do not copy the probe questions into the test.

## Checks that held

- The inventory diff adds 15 titles and changes `fetchedAt` and `total` from 651 to 666. No path is removed or renamed.
- The manifest keeps 282 entries. `generatedAt` changes. Keywords change on five docs operations only. The five are anchor, protocol, RPC/Horizon, SDK/CLI, and Soroban contract.
- `specs/super-spec.json` changes only `x-generatedAt` and `x-generated.generatedAt`.
- Micro-map, operation classes, and `eval/routing-cases.json` are unchanged. Regeneration is byte-identical, including `catalog/manifest.json`.
- `src/catalog/vendor/search-scoring.ts` has no diff. `src/catalog/scoring.ts` has no diff.
- No other inventory file changes. The secret scan is clean.
- The README lines 53–54 match the service-name rule and the later frequency filter.
- The four probe ranks return to the baseline. `scout.listSkills` is rank 3 on the signing, security, and authority probes. `stellarDocs.search_docs` is rank 3, score 326, backfill tier, on the x402 comparison probe.
- Saved traces and the fresh gate agree: legacy 220/298/326, card 112, extended 93/111/117, skills 17/23/23, holdout 12/26/29, forbidden 10, passed 24. Protocol history stays 7/8 and 3/4, and it fails.
- The only graded flips against the baseline are strict top-1 and accept-either top-1 on `q-infra-hubble-vs-rpc-layer`. Ordered list changes are 10 legacy, 8 extended, 0 skills, and 6 holdout.
- Rebuilt titles-only manifest file SHA-256 `b236eb622192c8e8e6a82db900968de7065c2f8f177b9e4da85e84de41fb4e90` matches `tmp/lane-a-before-manifest.json`. Its legacy top-3 is 297. Its top-1 stays 219.
- `npm test` reports 2370 passed and 3 expected failures across 136 files. `test/title-keywords.test.ts` passes 5 tests.

## Commands and exit codes

| Command | Exit |
|---|---:|
| `npm run typecheck` | 0 |
| `npm test` | 0 |
| `npm run build` | 0 |
| `npm run eval:compile` | 0 |
| `npm run eval:selftest` | 0 |
| `npm run eval:routing -- --gate` | 0 |
| `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |
| `npm run secrets:scan -- --tree` | 0 |
| `node scripts/build-catalog.mjs --out /tmp/lane-a-review/regen-manifest.json` | 0 |
| `npm run micro-map:build` | 0 |
| `npm run spec:build` | 0 |
| `node eval/plan/build-op-classes.mjs` | 0 |
| `node /tmp/lane-a-review/attack.mjs` (second run) | 0 |

The first `attack.mjs` run exited 1. It looked for a missing `eval/extended-cases.json`. Extended cases live in `eval/routing-cases.json`. The second run is the one above.

The titles-only catalog build used `HEAD:scripts/build-catalog.mjs` and `--out /tmp/lane-a-review/before-manifest.json`. The builder printed the catalog summary. The wrapper then exited 1 because zsh rejected `status=$?`. The source file was restored. Its SHA-256 is `7dcd97f7aacf3121a553862279cbe1451f73c0bed88aacc3cd311f99cff96ecd`. `git status` shows the author's files only.

Fresh routing trace: `eval/results/routing-2026-10-02T16-40-21-239Z.json`. Manifest SHA-256 `d76640e00d7d8617d4627682ccac33b54e9f610c43c73a952b910d475dfeefe2`. Gate pass. Regenerated micro-map, super-spec, operation classes, routing cases, and manifest were byte-identical to the worktree copies and were restored after the compare.

## Verification

Final verdict: approve

The four repairs hold. Source files stayed unchanged. `tmp/lane-a-measure.mjs` rewrote two tmp JSON files. Those two files were restored after the run.

### Gate and regeneration

Both legacy top-1 fields in `eval/gates.json` are 219. The manifest fingerprint is `efea602c3ea4f0e66e3f58273e0827e79cbaaa566430d267204fbaaf9e93afe6`.

`node scripts/build-catalog.mjs --out /tmp/lane-a-review/regen/manifest.json` exits 0. The side file matches `catalog/manifest.json`.

The four generators below each exit 0. Micro-map, super-spec, operation classes, and routing cases stay byte-identical. Their SHA-256 prefixes are `bb4aefc536d48537`, `4f13fa6aad144950`, `4cda9783f098c9e5`, and `9e863cedc1f1754f`.

The fresh gate trace is `eval/results/routing-2026-10-02T17-09-03-494Z.json`. Every graded boolean matches `eval/results/routing-2026-10-02T16-50-47-817Z.json`. Legacy is 219/298/326. Card@5 is 112/182. Extended is 93/111/117. Skills is 17/23/23. Holdout is 12/26/29, with 10 forbidden captures and 24 passes. Protocol history remains 7/8 and 3/4.

`node tmp/lane-a-measure.mjs` exits 0 on that fresh trace. Graded flips are 0. Ordered page changes are 11, 16, 2, and 8.

The vendor scorer SHA-256 remains `718924d10533ea49d472602f600ece0e4d7a0aae3e9e0ca5a95d9a8c6e611b14`.

### Queries

`searchCatalog` with limit 5 matches `76c7f02b` and the repaired manifest.

| Query | Hit | Rank / score / tier |
|---|---|---|
| what oracle should I use for prices on Stellar | `stellarDocs.search_rpc_horizon_data_docs` | 3 / 220 / gated |
| What oracle options do I have on Stellar besides Reflector? | `stellarDocs.search_rpc_horizon_data_docs` | 4 / 114 / gated |
| Sign messages | `stellarDocs.search_soroban_contract_docs` | absent from the page |
| Sign messages | `stellarDocs.search_sdk_cli_tools_docs` | 1 / 41 / backfill |
| Should I read account balances and history from Stellar RPC or from Hubble/BigQuery? When does each make sense? | `stellarDocs.search_rpc_horizon_data_docs` | 5 / 184 / gated |

The stem `oracle` is in a Stellar Docs description. The stem `query` is in one too. Both stay eligible when Scout and another service repeat them. `history` stays eligible the same way. The RPC keyword list includes `queries` and `oracle`. It omits `history`. The stem `agent` still has repeated entries in lumenloop and Scout, so `agents` stays out. The payment probe still shows `stellarDocs.search_docs` at rank 3, score 326, backfill.

The discovery probe exits 0. `origin/main` is `d1b46f2fb504632c2db8e0f0df9bc8f4ea177b74`. Its catalog blob equals the `76c7f02b` catalog blob `5d8b5f5371ceb152fbef4041f1d0594aa77f2671`. Two non-target rows move. The signing page keeps `scout.listSkills` at rank 3, score 166. The SDK score there moves from 144 to 153. The authority page keeps `scout.listSkills` at rank 3, score 135. The SDK operation enters that page at rank 4.

### Prefix and visible fields

`specs/stellar-docs.json` adds one prefix on `stellarDocs.search_sdk_cli_tools_docs`. The prefix is `https://developers.stellar.org/docs/tools/cli/agent-cli`. No prefix is removed.

The adapter keeps a hit when `url_without_anchor` starts with any prefix. The new prefix starts with `https://developers.stellar.org/docs/tools`. The accepted URL set stays the same. Every other field in that transport object stays the same.

Search hits, `codemode.describe`, and `codemode.catalog` omit transport and keywords. Descriptions, schemas, ids, and retrieval profiles are unchanged. `codemode.spec()` returns the extra prefix in `x-algolia.clientFilter`. Callable signatures stay the same. Catalog `generatedAt` is `2026-10-02T15:55:26.831Z` because that is the title snapshot time.

All 666 titles have one owner. The builder finds no equal prefixes. Nine nested pairs exist. The longer path in each pair is the more specific operation already present in the spec. The nested owners are the SEP, anchor, contract, Freighter, token, dapp, RPC, CLI, and agent CLI prefixes. The new prefix moves only the 14 `/docs/tools/cli/agent-cli` paths. They move from the contract operation to the SDK operation. The contract keyword list omits `messages`, `x402`, and `authority`. The segment-boundary rule changes no current title. The `topic-other` fixture still requires it. 130 titles match no prefix.

### Two-service threshold

One added service leaves every title body unchanged.

Two services with two description entries each remove `quasar`. The token `feed` stays.

Two services that place `quasar` only in one operation id keep `quasar`. The id-tail allowlist returns before the exclusion test. An operation name therefore cannot supply exclusion evidence. Dropping that clause leaves this catalog unchanged. Repeated entries do the exclusion work. They still remove `agents`. They still make `resources containers packages` return no keywords.

The same fixture without the exclusion predicate returns `resources`, `containers`, and `packages`. `npm test` runs all 11 title tests.

### Commands

| Command | Exit |
|---|---:|
| `node scripts/build-catalog.mjs --out /tmp/lane-a-review/regen/manifest.json` | 0 |
| `npm run micro-map:build` | 0 |
| `npm run spec:build` | 0 |
| `node eval/plan/build-op-classes.mjs` | 0 |
| `npm run eval:compile` | 0 |
| `npm run eval:routing -- --gate` | 0 |
| `npm run eval:selftest` | 0 |
| `npm test` | 0 |
| `npm run typecheck` | 0 |
| `node tmp/lane-a-measure.mjs` | 0 |
| `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |

`npm test` reports 2376 passed tests and 3 expected failures across 136 files.

