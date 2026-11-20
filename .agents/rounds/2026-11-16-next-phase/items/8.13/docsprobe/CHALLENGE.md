# Item 8.13 (`docsprobe`): Challenge of Codex Sol Review

- **Reviewer:** Codex Sol (`gpt-6.2-sol`, `model_reasoning_effort="high"`, read-only sandbox)
- **Review file:** [SOL-REVIEW.md](./SOL-REVIEW.md)
- **Reviewed diff:** `origin/main...d8ad450d`
- **Verdict counts:** **7 valid** (1 partially refuted on a sub-claim), **0 invalid**, **0 valid but not worth fixing**

## Finding-by-Finding Verification

### 1. Medium — `PROBE.md:18`: Contract-ID Raven routing pass overstates recorded results
- **Verdict:** **Valid** (with one sub-claim refuted).
- **Evidence:**
  - *Confirmed:* `PROBE.md:18` wrote "`search_docs` is #3–4 (#2 under `service: "stellarDocs"`)", whereas the raw probe output shows `search_docs` was `#4` unfiltered / `#3` under `service: "stellarDocs"` on `Q4a`, `#3` / `#2` on `Q4b`–`Q4c`, absent from top-7 unfiltered / `#2` under `service: "stellarDocs"` on `Q4d`, and `#7` / `#2` on `Q4e`. Also `Q4f`–`Q4h` were Mintlify-only checks without Raven `search` calls.
  - *Refuted sub-claim:* Sol's assertion that `search_soroban_contract_docs` omitting `stellar-transaction` on `Q4a` undercuts the Raven `search` routing pass conflates the two mechanisms. Raven `search` only chooses catalog operations (`search_soroban_contract_docs` #1 covers `/docs/learn/fundamentals/contract-development/`), and the omission occurred upstream in Mintlify (0 of 40 returned sections for `Q4a`).
- **Fix applied:** Updated `PROBE.md` summary matrix and Page 4 table to scope the routing verdict to `Q4a`–`Q4e`, state exact `search_docs` ranks across all five queries (`#3–4` on `Q4a`–`Q4c`, `#7` on `Q4e`, absent from top-7 unfiltered on `Q4d`; `#2–3` under `service: "stellarDocs"`), and explicitly separate operation routing from Mintlify's 0-section retrieval on `Q4a`.

### 2. Medium — `PROBE.md:16`: Custom Account verdict claims more coverage than the table shows
- **Verdict:** **Valid**.
- **Evidence:** `PROBE.md:16` claimed "all in top 10 across all 4 queries", but on `Q2d` (`"custom account __check_auth"`), `/docs/build/guides/contract-accounts/examples` ranked #19 in `stellarDocs.search_docs` (top 20) and #21 in direct Mintlify (`pageSize: 50`), while `complex-account` (#2), `simple-account` (#5), and `contract-accounts` (#9) ranked in top 10.
- **Fix applied:** Narrowed `PROBE.md:16` and `PROBE.md:56` to state that `complex-account` (the 308 target of `custom-account`) and `simple-account` rank in top 10 across all 4 queries (`Q2a`–`Q2d`), while `contract-accounts/examples` ranks in top 10 on `Q2a`–`Q2c` (#1, #1, #8) and #19 on `Q2d`.

### 3. Medium — `sd-114:30`: Upstream impact paragraph generalizes beyond observed hits
- **Verdict:** **Valid**.
- **Evidence:** In `sd-114` at `d8ad450d`, `evidence` named top hits only for `Q4f` (the two deployer guides) and did not cite the observed EVM migration hit (`/docs/learn/migrate/evm/smart-contract-deployment`, which ranked #2 on `Q4a` and #1 on `Q4b` in our probe output). In addition, "unless they already know the XDR symbol name" overstated the miss without the top-10 cutoff, because `Q4b` and `Q4h` surface `stellar-transaction` at ranks 16 and 19 without an XDR symbol.
- **Fix applied:** Recorded the observed leading hit paths for `Q4a` (`/docs/build/guides/transactions/signing-soroban-invocations` #1, `/docs/learn/migrate/evm/smart-contract-deployment` #2) and `Q4b` (`/docs/learn/migrate/evm/smart-contract-deployment` #1) in `sd-114`'s `evidence`, and qualified the impact paragraph to match the observed hits and the top-10 cutoff.

### 4. Low — `PROBE.md:111`: TODO handoff misstates two measurements
- **Verdict:** **Valid**.
- **Evidence:** `PROBE.md:111` wrote "all 50 candidates on 2 of 5 phrasings" (Mintlify returned 40 sections on `Q4a` and 35 sections on `Q4f` with `pageSize: 50`) and "all three HackMeridian pages pass `stellarDocs.search_docs` top 5 today" (true on item queries `Q1a`, `Q2a`, `Q3a`–`Q3b`, but on `Q2b` `simple-account` is #9 and on `Q2c` `complex-account` is #7).
- **Fix applied:** Corrected both measurements in `PROBE.md:111` to "0 of 40 and 0 of 35 returned sections with `pageSize: 50`" and "top 5 on their item queries (`Q1a`, `Q2a`, `Q3a`–`Q3b`) and top 10 across all probed queries".

### 5. Low — `PROBE.md:44`: Redirect example shows the wrong response shape
- **Verdict:** **Valid**.
- **Evidence:** Checked `src/adapters/stellar-docs.ts:487` (`okResult({ url, path, title, content })`) and `docs/stellar-docs.md:165` (`{ ok: true, data }`). `PROBE.md:44` had shown our probe script's flattened projection `{ ok: true, path, title }` instead of `{ ok: true, data: { path, url, title, content }, asOf, asOfBasis }`.
- **Fix applied:** Corrected `PROBE.md:44` to the actual `stellarDocs.get_doc_page` envelope shape.

### 6. Low — `PROBE.md:36`: Reset section URL uses heading text as its fragment
- **Verdict:** **Valid**.
- **Evidence:** Checked `src/adapters/stellar-docs-anchors.json:7561`: heading `"Testnet and Futurenet data reset"` maps to rendered anchor `"testnet-and-futurenet-data-reset"`. `PROBE.md:15,31–33,36` wrote `/docs/networks#Testnet and Futurenet data reset` with spaces instead of the real anchor.
- **Fix applied:** Updated `PROBE.md` to use `#testnet-and-futurenet-data-reset` for the fragment and label `Testnet and Futurenet data reset` as the section heading.

### 7. Low — `sd-114:12,14`: Rendered issue violates upstream writing rules
- **Verdict:** **Valid**.
- **Evidence:** Checked `scripts/improvements-file-issue.mjs:277` and ran `npm run improvements:file -- --file improvements/stellar-docs/sd-114-docs-search-contract-id-derivation.md --dry-run`: every entry in frontmatter `evidence` is copied verbatim into the rendered GitHub issue under `Additional recorded evidence:`. Line 12 contained a 40-word sentence, and line 14 (`Verified locally on 2026-11-20; not yet posted upstream pending review.`) leaked an internal pre-filing note into the rendered public issue body.
- **Fix applied:** Split line 12 (and tightened the other `evidence` entries) into concise sentences, and moved the local-only pending-review note into frontmatter `statusNote:` (which satisfies `.agents/skills/improvements-pipeline/SKILL.md`, passes `npm run improvements:lint`, is preserved by `writeFindingFrontmatter`, and is NOT emitted into the public GitHub issue body by `improvements-file-issue.mjs`).
