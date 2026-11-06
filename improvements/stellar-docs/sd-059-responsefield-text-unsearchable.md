---
id: sd-059
service: stellar-docs
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: Make ResponseField text findable in the docs search
evidence:
  - "2026-11-02 live Mintlify search over the 93 stellar/stellar-docs files that use <ResponseField>: a verbatim sentence from inside a ResponseField returns its own page in the top 5 for 8 of 90 pages and misses the top 50 for 63 of 90; a prose sentence from the same pages returns the page in the top 5 for 50 of 84 and misses the top 50 for 12 of 84. Data: .agents/rounds/2026-11-02-mintlify-migration/responsefield-rank.json (script rf-rank.mjs)"
  - "2026-11-02 identifier probe: 8 of 25 Stellar result-code and config identifiers never appear in any of the 50 candidates, including op_bad_signer, op_low_reserve, op_too_many_signers, op_line_full, op_cross_self, op_over_source_max, op_under_dest_min, and tx_bad_auth_extra. Identifiers that also appear in prose (op_underfunded, tx_bad_seq, SET_OPTIONS_BAD_SIGNER) rank first. Data: .agents/rounds/2026-11-02-mintlify-migration/identifier-probe.json"
  - "2026-11-02 the Set Options result-code page body chunk exists in the index (1,975 characters, contains op_bad_signer) and is returned for its opening sentence, but not for op_bad_signer, SET_OPTIONS_BAD_SIGNER op_bad_signer, or the verbatim sentence 'Any additional signers added to the account cannot be the master key'. The retired Algolia index ranked that page first for 'op_bad_signer set options result codes'."
  - "2026-11-02 paid QA diagnostic, row q-ti-classic-submission-errors: the Mintlify arm searched for the code three times, never saw the op_bad_signer to SET_OPTIONS_BAD_SIGNER mapping, and mapped 'bad signer' onto op_bad_auth (verdict wrong); the Algolia arm saw the mapping (verdict partial). Ledger: .agents/rounds/2026-11-02-mintlify-migration.md"
  - upstream issue filed 2026-11-02: https://github.com/stellar/stellar-docs/issues/2995
  - "2026-11-02T22:28Z two-path recheck after the triage bot's question on #2995. The site MCP search (POST https://developers.stellar.org/mcp, tool search_stellar_developer_docs) returns a Horizon result-code page first for op_bad_signer, op_too_many_signers (Set Options), op_line_full (Manage Sell Offer), op_cross_self (Manage Buy Offer), tx_bad_auth_extra (Transaction Result Codes), and the verbatim Set Options sentence; op_low_reserve returns Allow Trust, Manage Data, then Set Options result codes. Author measurement (not repeated by the reviewer, who had no authenticated session): Raven production stellarDocs.search_docs, which calls the Mintlify Discovery API (POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation, pageSize 50) and then applies its path scope and query-term guard, returns no result-code page in its top 5 for any of the seven queries (observedAt 2026-11-02T22:28:15.134Z). The site MCP search finds these pages for the tested queries. The raw Discovery candidates were not compared with the adapter output in this recheck, so Raven's filtering is not yet excluded as a contributor. Independent review: .agents/rounds/2026-11-02-upstream-followup/rv-fu-review.md section B3."
  - "2026-11-02 Raven reply https://github.com/stellar/stellar-docs/issues/2995#issuecomment-6590941274 posts the two-path table, agrees that the site MCP search finds the seven checked queries, and withdraws the content-change request (triage option 3) until Raven compares raw Discovery candidates with its adapter output."
  - "2026-11-03T15:05Z raw-candidate comparison for the same seven queries. Method: POST https://api.mintlify.com/discovery/v1/search/stellardevelopmentfoundation with body {query, pageSize: 50} (50 is the documented maximum), then replay the saved responses offline through the real callStellarDocs adapter. Hit rule: exact page path after removing origin, fragment, query string, trailing slash, and a final /index; expected pages are under /docs/data/apis/horizon/api-reference/errors/result-codes/. Result: every request returned HTTP 200 with 50 candidates, and the expected page is absent from all 50 raw candidates for 7 of 7 queries. The only result-code pages in raw output are Transaction Result Codes at rank 26 for op_bad_signer and Operation Result Codes at rank 26 for op_too_many_signers. The adapter path scope removed 1 to 9 meeting sections per query and no result-code page; the replay output equals the unmodified adapter output for 7 of 7. Raven's filter is excluded as a cause. The site MCP search (POST https://developers.stellar.org/mcp, tool search_stellar_developer_docs, no key) returned the expected page first for 7 of 7."
  - "2026-11-03T15:40Z-15:46Z confirmation over every Horizon result-code token. Token set: all name and type attribute values of the 136 <ResponseField> definitions on the 15 leaf result-code pages (190 unique tokens; a repeated token accepts every page that defines it). Query template: '<token> Horizon result code meaning'. Same Discovery request and hit rule as above; site MCP as above. Discovery raw top 50: expected page at rank 1 for 118 of 190, in top 5 for 153 of 190, in top 50 for 190 of 190 (37 misses at ranks 6-10: 19, 11-20: 14, 21-50: 4). Raven adapter top 5 equals raw top 5 for 153 of 190 with identical ranks. Site MCP: expected page in top 5 for 190 of 190 and at rank 1 for 181 of 190. All requests returned HTTP 200; no HTTP 429."
  - "2026-11-03 Raven-side mitigation tested and rejected: fusing site MCP results with Discovery, for all queries or only for underscore identifiers, gained 18 to 25 of the 190 identifier queries but added 1257 to 1424 ms at p95 against a 600 ms limit, and full-site MCP replacement lost broad docs-page hits. Raven keeps the Discovery backend, so the gap remains in Raven output. Both fused designs also ranked the Set Options page 11th for the op_bad_signer template query."
  - "2026-11-03 Raven reply https://github.com/stellar/stellar-docs/issues/2995#issuecomment-6608646512 posts the raw-candidate comparison and the 190-token table, states that Raven's filter and the docs content are not the cause, requests no content change, and asks the holder of the Mintlify relationship whether to forward the Discovery ranking gap."
recurrences:
  - date: 2026-11-06
    evidence: "All7 original bare/verbatim queries return HTTP200 but omit expected result-code page from raw Discovery candidates (38–50 candidates). Site MCP op_bad_signer returns Set Options first. Backend discrepancy persists before adapter. Exact URLs and upstream state: .agents/rounds/2026-11-05-truth-maintenance/docs.md, row sd-059"
---

## Finding

The Mintlify Discovery search API (`POST /discovery/v1/search/<domain>`) ranks Horizon result-code pages low for the codes those pages define.
The site's MCP search (`search_stellar_developer_docs`) finds the same pages for the same queries.
Both search paths are Mintlify services over the same docs content, so the docs content is not the cause.
Raven's own filter is not the cause: the raw Discovery candidates already omit or rank down the expected pages.
The 15 Horizon result-code pages define these codes in `<ResponseField>` attributes, for example `op_bad_signer`.
A client that searches Discovery for a code that Horizon returned often does not get the page that explains it.

## Evidence

On 2026-11-02 the Mintlify search API ranked the same 93 pages two ways:

| Query | Page in top 5 | Page not in top 50 |
| --- | --- | --- |
| A sentence from inside a `<ResponseField>` | 8 of 90 | 63 of 90 |
| A prose sentence from the same page | 50 of 84 | 12 of 84 |

On 2026-11-03 Raven compared raw Discovery candidates (`pageSize: 50`) with the site MCP search:

| Query set | Discovery raw top 5 | Discovery raw top 50 | Site MCP top 5 |
| --- | --- | --- | --- |
| 6 bare codes and 1 verbatim Set Options sentence | 0 of 7 | 0 of 7 | 7 of 7 |
| `<token> Horizon result code meaning`, all 190 result-code tokens | 153 of 190 | 190 of 190 | 190 of 190 |

Raven's adapter keeps every raw top-5 hit at the same rank, so the adapter adds no loss.
The Set Options result-code page is an example.
Its body chunk exists in the index and contains `op_bad_signer`.
Discovery does not return it in the top 50 for `op_bad_signer`.
The site MCP search returns it first, with the `SET_OPTIONS_BAD_SIGNER` mapping.

## Recommendation

No docs content change is requested; the 2026-11-02 Markdown-table workaround stays withdrawn.
Forward the Discovery ranking gap to Mintlify through the docs team's Mintlify relationship.
The ask to Mintlify: rank pages for `<ResponseField>` names in the Discovery API as the site MCP search already does.
A recheck: send `op_bad_signer` to the Discovery search API with `pageSize: 50`.
The fix is confirmed when the Set Options result-code page is in the top 5.
A broader recheck: run the 190-token template above and compare Discovery top 5 with the site MCP top 5.
