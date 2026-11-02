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
  - "2026-11-02T22:28Z two-path recheck after the triage bot's question on #2995. The site MCP search (POST https://developers.stellar.org/mcp, tool search_stellar_developer_docs) returns a Horizon result-code page first for op_bad_signer, op_too_many_signers (Set Options), op_line_full (Manage Sell Offer), op_cross_self (Manage Buy Offer), tx_bad_auth_extra (Transaction Result Codes), and the verbatim Set Options sentence; op_low_reserve returns Allow Trust, Manage Data, then Set Options result codes. Raven production stellarDocs.search_docs, which calls the Mintlify Discovery API (POST /discovery/v1/search/<domain>, pageSize 50), returns no result-code page in its top 5 for any of the seven queries (observedAt 2026-11-02T22:28:15.134Z). The docs content and the site MCP search find these codes; the gap is in the Discovery API ranking that Raven uses."
---

## Finding

The Stellar Docs search does not find text inside `<ResponseField>` components.
The page store and the rendered site hold the text, but a search for that text rarely returns the page.
93 docs files use `<ResponseField>`, including every Horizon result-code page and the Horizon resource objects.
These components hold the Horizon string codes (`op_bad_signer`, `op_line_full`, `tx_bad_auth_extra`) and their meanings.
A reader who searches for an error code that Horizon returned cannot find the page that explains it.

## Evidence

On 2026-11-02 the Mintlify search API ranked the same 93 pages two ways:

| Query | Page in top 5 | Page not in top 50 |
| --- | --- | --- |
| A sentence from inside a `<ResponseField>` | 8 of 90 | 63 of 90 |
| A prose sentence from the same page | 50 of 84 | 12 of 84 |

Eight of 25 probed identifiers never appear in any of the 50 search candidates.
All eight are Horizon string codes that the docs state only in a `<ResponseField name="...">` attribute.
The rendered `llms-full.txt` shows these names with escaped underscores, for example `op\_bad\_signer`.

The Set Options result-code page is an example.
Its body chunk exists in the index and contains `op_bad_signer`.
Search returns it for the page's opening sentence only.
It does not return it for `op_bad_signer` or for the verbatim description of that code.

## Recommendation

Make `<ResponseField>` names, types, and descriptions searchable in the docs search index.
If the search configuration cannot do this, add the Horizon string codes to searchable prose or a Markdown table on each result-code page.
A recheck: search `op_bad_signer` and confirm the Set Options result-code page is in the top 5.
