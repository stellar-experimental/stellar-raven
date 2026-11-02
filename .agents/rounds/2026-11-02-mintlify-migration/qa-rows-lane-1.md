# Rows lane 1 — the four rows where arm B scored lower

Replays ran on 2026-11-02 against both adapters. Helper files in the scratchpad: `lane1-ext.cjs`
(row extractor), `lane1-replay-full.mts` (a copy of `replay.mts` with no 12k truncation), and
`lane1-raw.mjs` (raw Mintlify search to list chunks; it does not print the key).

Summary:

| Row | A → B | Cause | Docs backend decisive? |
|---|---|---|---|
| q-aas-list-token-on-exchanges-aggregators | correct → wrong | agent-variance | No |
| q-anchor-endpoint-discovery | correct → partial | judge-variance (+ golden over-strict) | No |
| q-defi-arbitrage-pathpayment-bots | correct → partial | judge-variance on an unstable register (+ agent-variance) | No; B retrieved *better* docs |
| q-ti-classic-submission-errors | partial → wrong | **docs-backend-retrieval** | **Yes** |

---

## 1. q-aas-list-token-on-exchanges-aggregators (correct → wrong)

**Verdicts.**
- A: `correct`. It used a single judge. Missing: none. Wrong: none.
- B: `wrong`, with core `correct`. The panel scored `[wrong, partial, wrong]` and matched avoid item 1. Wrong claim: "there is no separate 'submit to explorer' step once the toml is correct", and "exchanges automatically populate asset info from stellar.toml". Missing: each venue sets its own listing, verification, and liquidity policy.

**Docs calls and replay.**
- Both arms read `/docs/tokens/publishing-asset-info` in full. A used `get_doc_page_sections`. B used `get_doc_page`.
- Both arms ran asset or anchor searches for stellar.toml. The replays show the same core page in each arm.
- B's extra query `search_docs("well-known asset list directory curated assets")` returned Horizon `/assets` reference pages in B. The A replay of the same query returned equally off-target hits. Neither arm surfaced SEP-42.
- The decisive page text is the same in both arms: "required … to be listed by exchanges and wallets" and "Without it, your token cannot be listed anywhere." The page frames the toml as *necessary*, not *sufficient*.

**Cause: `agent-variance`.**
- A made two non-docs calls that B did not make. The first was `scout.searchResearch` for "Stellar Asset List SEP-42". The second was `lumenloop.search_content_semantic` for "…aggregators like CoinGecko stellar.expert".
- With that evidence, A added a paragraph: "Price/market aggregators (CoinGecko, CoinMarketCap…) and centralized exchanges have their own independent listing applications". A's checklist also ends with "apply separately to each exchange/aggregator".
- A also wrote "There's no separate 'submission' step in official docs for this" about explorers. The judge accepted it because the CEX and aggregator caveat balanced it.
- B had no such paragraph. B also extended the "automatic" framing to exchanges.

**Live check of the B wrong claim.** The claim is partly true and materially false.
- Explorers do read toml metadata automatically. A separate curation step still exists. https://stellar.expert/directory/add (fetched 2026-11-02): "Request form for address listing in StellarExpert Directory."
- Exchanges and aggregators do not list automatically. https://support.coingecko.com/hc/en-us/articles/7291312302617 (fetched 2026-11-02): "To submit your token or coin for listing … click on Request Form."
- Wallet asset lists are curated. https://stellar.expert/asset-lists (fetched 2026-11-02): "Inclusion of any particular asset in a list should not be considered as endorsement."

The judge was right that "exchanges … automatically" contradicts golden fact 4.

**Action: none.** The golden is sound. The difference is exploration breadth.

---

## 2. q-anchor-endpoint-discovery (correct → partial)

**Verdicts.**
- A: `correct`. It used a single judge, with `judgeTierUsed: single`. The judge said fact 3 was "implicitly satisfied since no directory step is used at all".
- B: `partial`. The single judge said `partial`, and that sent the row to a panel (`escalationReason: boundary-partial`). The panel was unanimous `partial`. All three missing items say the answer "never raises the directory-vs-stellar.toml contrast".
- Neither verdict lists a wrong claim or an avoid match.

**Docs calls and replay.**
- A: `search_anchor_sep_docs` and `search_wallet_dapp_docs`, then `get_doc_page_sections` on `/docs/build/apps/wallet/sep24`, `/sep10`, and `/intro`.
- B: two `search_anchor_sep_docs` queries and one `search_wallet_dapp_docs` query. B made no page reads.
- Both arms had the stellar.toml, SEP-10, and SEP-24 material. Neither answer mentions an anchor directory.
- On fact 3 the two answers are equal. Both derive endpoints from the anchor's live stellar.toml and `/info`, and neither relies on a directory.

**Cause: `judge-variance`, with a `golden-issue` contributor.**
- The two answers are equal on the graded point.
- A's single judge read fact 3 as behavior: the answer does not use the directory. B's panel read it as a statement the answer must make: it must say "a directory is not authoritative".
- The question never mentions directories.
- The asymmetry is structural. Only a `partial` verdict escalates to a panel, so A's lenient single-judge `correct` was never re-checked.

**Action: golden re-verification needed (rubric wording only).**
- Use the `golden-truth` skill to decide one point: is fact 3 satisfied by *not* relying on directory metadata, or must the answer *state* the contrast?
- Then add that decision to `notes`. Example: "An answer that derives endpoints only from the live stellar.toml satisfies fact 3; an explicit directory caveat is a bonus."
- No truth change is needed.

---

## 3. q-defi-arbitrage-pathpayment-bots (correct → partial)

**Verdicts.** Both rows went to a panel (`unstable-register`, `stabilityScore 0.625`).
- A: `correct`. The panel was split `[partial, correct, correct]`. Its one missing item was that small capital is not tied to profit scale.
- B: `partial`, with no panel disagreement. Missing items:
  - latency as a profit factor
  - failed transactions framed as a cost
  - slippage named as a profit factor
  - the result codes `UNDER_DESTMIN` and `OVER_SENDMAX`

  Neither verdict lists a wrong claim or an avoid match.

**Docs calls and replay.** The docs backend made B *better* informed.
- A ran `search_rpc_horizon_data_docs("paths strict-send strict-receive find payment path endpoint")`. The Algolia replay returned Hubble SQL pages and result-code pages, but not the `/paths` endpoint pages.
- A's `search_docs_in_category(data, "paths endpoint …")` returned soft-empty.
- A's answer says: "Horizon's … `/paths/strict-send` and `/paths/strict-receive` REST parameter docs are not in this docs search index".
- B ran the same kind of query. The Mintlify replay returned `list-strict-send-payment-paths` and `list-strict-receive-payment-paths` as hits 1 and 2. B then read both with `get_doc_page` and gave an exact parameter list.
- Both arms had the path-payment guide and the fees and reserve pages.
- The B search also returned `…/result-codes/operation-specific/path-payment-strict-receive` as hit 5. B did not use it, and A did not use its own result-code hits either.

**Cause: `judge-variance` on a known-unstable register, plus a small `agent-variance` in wording.**
- A wrote "your execution speed", which a judge can count as latency. A also wrote that a path "fails atomically" and that surge-pricing competition scales cost.
- B wrote "timing" and "fail outright", but did not frame either as a cost.
- The substance is close. The register is flagged unstable at 0.625, and A's panel itself split.
- The docs difference favors B but gets no credit, because the golden does not grade endpoint parameters.

**Action: none for the docs backend.**
- Optional `golden-truth` work: say in `notes` whether "execution speed/timing" satisfies the latency part of fact 3. This would reduce instability.

---

## 4. q-ti-classic-submission-errors (partial → wrong)

**Verdicts.**
- A: `partial`. A unanimous panel gave it, with `boundary-partial`. The only gap was hash-first handling of 429, 5xx, and timeout responses. A correctly paired `op_bad_signer` with `SET_OPTIONS_BAD_SIGNER` and described it as "master key as an additional signer".
- B: `wrong`, with core `incorrect`. A unanimous panel gave it, with `boundary-wrong-claim` and avoid item 2. The wrong claim was that `op_bad_auth` is "the actual generic code behind what's commonly called a 'bad signer' error". Missing items:
  - `op_bad_signer` / `SET_OPTIONS_BAD_SIGNER`
  - `tx_failed` atomicity
  - hash-first handling

**Docs calls and replay.** This difference is decisive. B searched for this code three times, and Mintlify never returned the text that maps it.

| Query (arm) | Set-options result-code hit? | `op_bad_signer` in hit content? |
|---|---|---|
| A `search_docs("op_bad_signer set options result codes")` | yes, content 2614 chars | **yes**: "op_bad_signer SET_OPTIONS_BAD_SIGNER Any additional signers added to the account cannot be the master key" |
| A `search_docs("op_bad_signer account merge set options bad signer")` | yes, 2614 chars | **yes** |
| B `search_rpc_horizon_data_docs("…op_no_destination op_bad_signer")` | no (operations page only, which has `op_bad_auth`) | no |
| B `search_docs("bad signer signer weight threshold invalid signer SetOptions")` | no | no |
| B `search_docs("SET_OPTIONS_BAD_SIGNER … set options result codes")` | yes, but **content is 134 chars** (title and description only) | **no** |

- The only B hit that shows `SET_OPTIONS_BAD_SIGNER` is the `list-of-operations` table: "`SET_OPTIONS_BAD_SIGNER` | -8 | Any additional signers…". That table has no Horizon `op_*` column.
- In B's evidence, the only `op_*` signer code was `op_bad_auth` ("Too few valid signatures"). B therefore mapped "bad signer" onto `op_bad_auth`.
- Root cause, confirmed with raw Mintlify search (`lane1-raw.mjs`, 5 queries, including "op_bad_signer Any additional signers added to the account cannot be the master key"):
  - The Mintlify index has only one chunk for `…/operation-specific/set-options`, which is the 134-char description.
  - The body, which is made of `<ResponseField name="op_bad_signer" type="SET_OPTIONS_BAD_SIGNER">` blocks, is never returned by search.
  - The adapter does not drop it. `groupPages` keeps the first chunk for each path, and no second chunk exists.
- The page store has the body. `get_doc_page` on that path returns `name="op_bad_signer" type="SET_OPTIONS_BAD_SIGNER"`.
- In contrast, the Payment result-code page *does* have a body chunk (1865 chars).
- B had the set-options path in a hit but did not call `get_doc_page` on it. A small agent factor remains.

**Cause: `docs-backend-retrieval`.**
- The Mintlify search index has no body chunk for the Set Options result-code page.
- Algolia indexed that body, so A saw the exact `op_bad_signer` ↔ `SET_OPTIONS_BAD_SIGNER` mapping.

**Live check of the B wrong claim.** The claim is false.
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes/operation-specific/set-options (fetched 2026-11-02, page cache dated 2026-10-01) lists "op_bad_signer SET_OPTIONS_BAD_SIGNER — Any additional signers added to the account cannot be the master key." The Mintlify page store shows the same on 2026-11-02.
- https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes/operations (same date) lists "op_bad_auth opBAD_AUTH — There are too few valid signatures, or the transaction was submitted to the wrong network."
- These are two different codes in two different namespaces. `op_bad_auth` is not "the code behind" `op_bad_signer`. The golden's GT-51 correction stands.

**Side observation, not a cause.**
- The live Payment result-code page labels its codes `OpSrcNoTrust` and `OpNoDestination` (PascalCase). Horizon returns `op_src_no_trust` and `op_no_destination`.
- The Set Options page mixes both styles: `OpLowReserve` next to `op_too_many_signers`.
- The Algolia arm shows this too, so it predates the backend switch. It is a possible upstream docs finding: the Horizon result-code pages show inconsistent string codes.

**Actions.**
1. **Upstream finding (Stellar Docs / Mintlify index).** The search index for `/docs/data/apis/horizon/api-reference/errors/result-codes/operation-specific/set-options` returns only the description chunk. The `<ResponseField>` body is not searchable. Check the other operation-specific result-code pages for the same gap. Payment is fine. Use the `improvements-pipeline` skill.
2. **Own-repo fix (Mintlify adapter, branch under review).** Some hits carry only the page description, with content at or under the page's frontmatter description. Mark those hits, for example with `contentIsDescriptionOnly`, or add a hint: "body not in search index; read with `stellarDocs.get_doc_page`". The agent then knows to read the page. This is a general mechanism, not a per-query fix. Optional: auto-read the top N such pages when `includeContent` is true.
3. **Optional upstream docs finding.** Inconsistent Horizon string labels (`OpSrcNoTrust` and `op_bad_signer` styles) on the operation-specific result-code pages.
4. **Golden: none.** The golden is correct and live-verified.
