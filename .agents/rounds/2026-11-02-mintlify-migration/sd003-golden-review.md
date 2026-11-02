# sd-003 retirement — independent golden-truth review

- Reviewer: Claude Fable 5.1 (independent of the author, Claude Opus 5.5).
- Worktree: `/private/tmp/claude-501/raven-sd003`, branch `improvements/retire-sd-003`, uncommitted on top of `origin/main` `42496f22`.
- Date: 2026-11-02. All live probes ran between 20:10 and 20:13 UTC.
- Method: read the golden hunks first, re-derived every changed claim from classes A, B, C/E before reading the author's `truth.verified` lines, then re-walked those lines, then re-swept the nine reopened register entries.

## Sources I used

Class A (live site):
- `https://developers.stellar.org/llms.txt` and `https://developers.stellar.org/_llms/data.txt` (page inventory: 14 RPC method pages incl. `queryEvents` and `index`; ~90 Horizon api-reference pages).
- `https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransactions.md` (HTTP 200; line 35: "The limit for getTransactions can range from 1 to 200 - an upper limit that is hardcoded in Stellar-RPC for performance reasons. If this argument isn't designated, it defaults to 50.")
- `.../rpc/api-reference/methods/getFeeStats.md` (200), `.../getTransaction.md` (200; "Available options: `SUCCESS`, `NOT_FOUND`, `FAILED`"), `.../methods/index.md` (200; lists 13 methods incl. `queryEvents`).
- `.../horizon/api-reference/list-all-transactions.md` (200), `.../horizon/api-reference/get-transactions-by-account-id.md` (200), `.../horizon/api-reference/aggregations/fee-stats/index.md` (200).
- `.../horizon/api-reference/errors/result-codes/operation-specific/set-options.md` (200; `**op\_bad\_signer** `SET_OPTIONS_BAD_SIGNER``), `.../errors/result-codes/transactions.md` (200).

Class B (source):
- `src/adapters/stellar-docs.ts` (header lines 16-19; soft-empty branches lines 500-522; hit shape lines 525-543; `pathFiltered` line 494).
- `specs/stellar-docs.json` (`backend.constraints.noFacets`, `alwaysReturns`, `candidateWindow`; `search_docs_in_category.mintlify.include = ["/docs/{category}/", "/docs/{category}"]`; `search_rpc_horizon_data_docs.description` "Includes the per-RPC-method and per-Horizon-endpoint API reference pages").
- `gh api repos/stellar/stellar-docs/commits/700ed32d…` → `2026-10-22T18:00:55Z`, "build: migrate developers.stellar.org from Docusaurus to Mintlify (#2941)", 300 files; PR #2941 merged at that SHA.
- `gh api repos/stellar/stellar-docs/issues/2566` → still open; comment `6585113964` by kalepail 2026-11-02T18:33:46Z reports the recheck.
- `improvements/stellar-docs/sd-003-rpc-method-reference-pages-unindexed.md` (status `fixed-upstream`, unchanged in this diff); `improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md` (`reported-upstream`, stellar-docs#2995).
- `.agents/rounds/2026-11-02-mintlify-migration/paramfield-rank.json` (committed in #309).
- `npx wrangler deployments list --name stellar-raven-codemode` → latest version `499f58ba-217f-…` created 2026-11-02T19:53:40Z.

Class C/E (production Raven, `mcp__claude_ai_Stellar_Raven__execute`, my own queries):
- `search_rpc_horizon_data_docs`: `getHealth`, `getLatestLedger`, `sendTransaction`, `getNetwork`, `getVersionInfo`, `simulateTransaction` → each ranks its own method page #1, `pathFiltered: true`.
- `search_docs`: `<name> RPC method` for the same six → #1 for five; `simulateTransaction RPC method` ranks the method page #3 behind the simulateTransaction deep-dive guide.
- `search_rpc_horizon_data_docs` and `search_docs`: `list all ledgers`, `get offers by account id`, `list trade aggregations`, `retrieve a claimable balance`, `list strict send payment paths`, `fee stats horizon aggregation`, `list all payments streaming` → each ranks the matching Horizon endpoint page #1 in both operations.
- `search_doc_titles`: `getVersionInfo`, `list all transactions`, `retrieve an account` → #1 each; `Set Options result codes` → #1 the set-options result-code page.
- `search_rpc_horizon_data_docs`: `op_line_full`, `op_cross_self`, `tx_bad_auth_extra` → no result-code page in the window (rank -1); `SET_OPTIONS_BAD_SIGNER` → result-code page not in top 3; `op_underfunded payment result code` → result-code page #1.
- `search_docs`: `op_bad_signer` → top 5 has no result-code page; `The limit for getTransactions can range from 1 to 200` → getTransactions page #1; `ledgerRetentionWindow oldestLedger` → getEvents/getTransaction pages; `includeFailed query parameter Horizon` → transaction-failed page.
- `search_doc_titles`: `qqxyzzy` → soft-empty "None of the 25 candidate sections the docs search returned contains a query term (qqxyzzy)." with the rephrase hint; `zorbulant frimble index page` → ok hits (the words "index" and "page" match content), so a nonsense title query is soft-empty only when no term matches.
- `search_docs_in_category` `{quorum, validators}` → 5 hits all under `/docs/validators/`, `pathFiltered: true`, hit keys `url, path, title, section, snippet` (no breadcrumbs); `{quorum set configuration, validators}` → same shape; `{zzqxv nonsense, validators}` → soft-empty "None of the 50 candidate sections … is under this operation's paths."
- `get_doc_page` `/docs/data/apis/rpc/api-reference/methods/getTransactions` → 68,052 chars, contains "hardcoded" and "defaults to 50"; `/docs/data/apis/rpc/api-reference/methods` → title "Methods", names 13 methods (12 stock + `queryEvents`); `/docs/data/apis/rpc/api-reference/methods/getFeeStats` → 8,691 chars.

## Corroboration matrix

| # | Claim (changed gospel) | Verdict | Sources |
|---|---|---|---|
| 1 | Generated per-method RPC pages are in the docs search and a name query usually ranks the page first (`q-gap…` answer, keyFacts[0]) | confirmed-as-of 2026-11-02 | A: six method `.md` pages HTTP 200, listed in `_llms/data.txt`. B: `specs/stellar-docs.json` description; stellar-docs@700ed32d (#2941, 2026-10-22). E: 6/6 #1 in the scoped op, 5/6 #1 in `search_docs` (simulateTransaction #3). "usually" is the right hedge. |
| 2 | Generated per-endpoint Horizon pages are in the docs search and rank first by name | confirmed-as-of 2026-11-02 | A: `list-all-transactions.md`, `get-transactions-by-account-id.md`, `aggregations/fee-stats/index.md` HTTP 200; ~90 Horizon api-reference paths in `_llms/data.txt`. E: 7/7 endpoint queries #1 in both ops; title search `retrieve an account` #1. |
| 3 | Text inside response-field components (e.g. a Horizon result code) ranks poorly | confirmed-as-of 2026-11-02 | A: set-options result-code page carries `op_bad_signer` inside a ResponseField. E: `op_line_full`, `op_cross_self`, `tx_bad_auth_extra` absent from the 50-candidate window; `op_bad_signer` top 5 has no result-code page; title query recovers the page. B: sd-059 (`reported-upstream`, #2995) with the 2026-11-02 sweep. |
| 3b | Text inside **parameter** components ranks poorly (same sentence in `q-gap…` answer; `truth.corroboration[1]`) | **not established** | E: my ParamField sentence `The limit for getTransactions can range from 1 to 200` ranked the page #1. B: `paramfield-rank.json` (32 pages): ParamField sentences 0/32 top-5, 27/32 miss; prose sentences from the same pages 2/32 top-5, 26/32 miss, so the sweep does not isolate a component effect. The recheck file itself says "widen sd-059 to `<ParamField>` with a measured sweep before filing it." See finding 2. |
| 4 | An empty or off-target search result is not evidence that the API does not exist (`q-gap…` keyFacts[2], avoid[0]) | confirmed | B: adapter header "A soft-empty result never establishes corpus absence"; spec `alwaysReturns`. E: nonsense title query soft-empty hint text. |
| 5 | New avoid: "Do NOT claim the generated … reference pages are excluded from the docs search index" punishes a false claim | confirmed (trap is safe) | Rows 1-2. Notes keep an attributed dated-history statement acceptable, so the trap does not punish "the Algolia index excluded them". |
| 6 | `search_docs_in_category` keeps only `/docs/validators` hits adapter-side, no category facet, `pathFiltered: true`, no breadcrumbs (`q-pc-doc-category…` answer, avoid[1], notes) | confirmed | B: spec `mintlify.include` placeholders; `noFacets` constraint; adapter lines 494, 525-543 (hit shape has no breadcrumb field). C: live `{quorum, validators}` result shape and `pathFiltered: true`. |
| 6b | "A soft-empty result means no candidate in the search window fell under that path" | partially accurate | B: adapter line 509 has two soft-empty causes: zero scoped sections (window-only) **or** scoped sections that contain no query term. C: the window-only message reproduced with a nonsense query. See finding 4 (nit). |
| 7 | A title search with no matching hit returns soft-empty: "none of the candidate sections … contains a query term"; inconclusive (`q-edge-doc-title…` answer, keyFacts, notes) | confirmed | B: adapter lines 509-521 (`termMatched` over title+path+content; message text matches). C: `qqxyzzy` → exactly that message and hint. Nuance: a title query whose words appear only in body text still returns ok hits, which the "scoped to the search" keyFact tolerates. |
| 8 | Removing the sd-003 partial caps is safe: canonical pages now carry what the caps protected (`q-infra-rpc-methods-list`, `q-pc-practical-fee-setting`, `q-pc-tx-finality…`, `q-ti-rpc-gettransactions…` notes) | confirmed-as-of 2026-11-02 | A: methods index lists all 12 stock methods (+ `queryEvents`); getTransaction page lists `SUCCESS, NOT_FOUND, FAILED`; getFeeStats page 200; getTransactions page states 1-200 / default 50. E: `getTransaction status NOT_FOUND` → getTransaction page #1; `getFeeStats` → #1; `get_doc_page` reads each. The sd-004 "hardcoded" caution is correctly retained in `q-ti-rpc-gettransactions…` (page still says "hardcoded"). |
| 9 | Lint `CATALOG_NOTE_TRAPS` `unindexed-api-refs` removal | confirmed | B: grep over `catalog/`, `specs/`, `src/` finds no stellarDocs note with "unindexed / not in the search index"; the only "unindexed" hit is Scout's trust-report description (different surface). Lint: 0 errors with the trap gone. |

## Step 2 — author evidence re-walk

Every live line reproduced: `getTransactions API reference limit` family (#1), `getFeeStats` (#1), `getTransaction status NOT_FOUND` (#1), `Horizon list all transactions endpoint` (#1), `op_bad_signer` (no result-code page in top 5), `Set Options result codes` title (#1), `get_doc_page` getFeeStats 8,691 chars, Methods index names the 12 stock methods, `qzxv …` soft-empty shape, Worker version `499f58ba` is the live deployment (19:53:40Z). The class B commit citation (700ed32d, #2941, 2026-10-22) is exact. The sibling-sweep claim holds: my golden-field grep for `unindexed|search index|breadcrumb|hierarchy|Algolia|not indexed` across the battery finds no other live Algolia-era index claim (only `q-infra-horizon-vs-rpc`'s generic "the Docs search index can lag a deployment", which is still true).

Gates: `npm run eval:qa:lint -- --since origin/main --stale --enforce-floors` → 0 errors, 85 warnings, none naming the seven changed cases. `npm run eval:qa:register -- --check` → "up to date".

## Findings

1. **should-fix** — `rootCause` and prose point at a file state that is not in this change. Six cases (`q-gap-rpc-horizon-unindexed-reference`, `q-edge-doc-title-zero-hits`, `q-infra-rpc-methods-list`, `q-pc-practical-fee-setting`, `q-pc-tx-finality-failure-semantics`, `q-ti-rpc-gettransactions-pagination-xdr`: `truth.verified.rootCause`), plus `research/services/stellar-docs-mintlify.md` line 36 and `ideas/source-delivery-ranked-references.md` line 503, cite "`improvements/resolved.json` entry sd-003". `improvements/resolved.json` has no `sd-003` entry; `improvements/stellar-docs/sd-003-rpc-method-reference-pages-unindexed.md` still exists with `status: fixed-upstream`, and `improvements/` is untouched in the diff. The recheck file's RESOLVE condition 3 asks for the resolver run and `improvements/INDEX.md` regeneration in the same change. Either run `npm run improvements:resolve` for sd-003 in this change, or point the eight references at the existing finding path until the resolver lands. The lint passes only because the pattern accepts any `improvements/` string.
2. **should-fix** — `q-gap-rpc-horizon-unindexed-reference` `golden.answer` sentence "words that appear only inside the page's parameter or response-field components … that text ranks poorly" and `truth.corroboration[1]` (claim "parameter or response-field components", verdict `confirmed-as-of`) extend sd-059 to ParamField without evidence. The cited evidence is ResponseField-only; my ParamField probe ranked the page #1; the committed `paramfield-rank.json` sweep is non-discriminative (prose sentences from the same pages miss just as often). Narrow the sentence and the corroboration claim to response-field components (keep "such as a Horizon result code"), or add a `disputed`/`unverifiable` row for ParamField. Judge impact is low (not a keyFact or avoid), but gospel text should not outrun the evidence.
3. **should-fix** — `truth.verified.by` in all seven cases cites "ledger `.agents/rounds/2026-11-02-mintlify-migration.md`, section \"sd-003 retirement\"". No such section exists; the ledger is unchanged in the diff and only its "Open items" line mentions the retirement. Add the ledger section (with the sweep list and this review) in the same change, or cite `.agents/rounds/2026-11-02-mintlify-migration/sd003-recheck.md`.
4. **nit** — `q-pc-doc-category-validator-search` `golden.answer`: "A soft-empty result means no candidate in the search window fell under that path" names one of two soft-empty causes. The adapter also returns soft-empty when the kept validator sections contain no query term. Suggest "… fell under that path, or no kept section contains a query term".
5. **nit** — `q-infra-rpc-methods-list` `truth.verified.evidence` says the Methods page "names all 12 stock methods". The live page lists 13 entries (it also lists `queryEvents`). The golden notes already treat `queryEvents` as beta-only, so state "names all 12 stock methods plus `queryEvents`" to keep the evidence line exact.
6. **nit** — `q-edge-doc-title-zero-hits` `golden.avoid[0]` still says "indexed-title zero result"; "indexed" is Algolia-era wording. Harmless to the judge; optional cleanup.
7. **nit** — `q-gap-rpc-horizon-unindexed-reference` `golden.answer` opens "As of 2026-11-02 …" while `tags.freshness` stays `live` and `truth.asOf` is 2026-11-02; consistent with the skill. No action.

No blocker. No new avoid item punishes a possibly-true claim. No removed caution is still needed: the getTransaction, getFeeStats, Methods index, and getTransactions pages are searchable and readable, and the sd-004 "hardcoded" caution remains in `q-ti-rpc-gettransactions-pagination-xdr`.

## Step 3 — register re-sweep

All nine reopened entries re-swept against member golden text (47 member cases dumped and grepped by the claims each note pins). Every reopen was caused by this diff's note-only edits to `q-ti-rpc-gettransactions-pagination-xdr`, `q-pc-practical-fee-setting`, `q-infra-rpc-methods-list`, and `q-pc-tx-finality-failure-semantics`; none of those edits touched a pinned claim.

| Entry | Verdict | Basis |
|---|---|---|
| cluster-008 | consistent | All CAP/protocol pairs in the note re-read across 14 members; the changed member carries no CAP claim. |
| cluster-017 | consistent | 100 stroops, 0.5 XLM base reserve, 1 XLM minimum, 2-reserve pool-share trustline unchanged. |
| cluster-018 | consistent | 120960-ledger single retention window, no 24h default, nearing-end-of-life with sd-072 caution, getLedgers-only archive tier plus beta nuance. |
| cluster-041 | consistent | Finality semantics unchanged; live getTransaction statuses SUCCESS/NOT_FOUND/FAILED. |
| cluster-042 | consistent | Fee pool sequestration, CAP-26 and SDF burn separate; fee-setting case makes no supply claim. |
| cluster-056 | consistent | Outer fee charged once, channel sequences, getFeeStats primary, fees not rewards. |
| cluster-061 | consistent | Dated nearing-end-of-life label and sd-072 caution unchanged. |
| cluster-063 | consistent | Dated 100-stroop floor, getFeeStats-first, Horizon /fee_stats, Hubble historical. |
| Stellar base fee floor | consistent | Both members still say 100 stroops per operation with surge qualification. |

Register review JSON: `/private/tmp/claude-501/-Users-kalepail-Desktop-stellar-raven-codemode/d3e0e577-d800-49a9-94f5-596e6caf0ea8/scratchpad/sd003-register-review.json` (all nine entries included; no inconsistency found).

## Verdict

APPROVE WITH CHANGES — the gospel reversal is correct and triangulated (A, B, C/E agree); fix findings 1-3 (re-walkable provenance: the `resolved.json` pointer, the ParamField overreach, the missing ledger section) before merge.
