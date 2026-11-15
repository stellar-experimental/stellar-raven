=== group 1
## q-defi-agentic-payment-standards-compare

- **Move**: P1 correct (judge tier single) -> P2 partial (judge tier panel, boundary-partial). Core answer correct on both sides.
- **stellarOrg**: No `stellarOrg` call in P2 (calls: `search`, then two `execute` calls using `skill.read`, `stellarDocs.search_docs`, `lumenloop.search_content_semantic`, `lumenloop.search_documents`). No INTRUSION. The golden cites no stellar.org page. The stellar.org Foundation blog post that both answers cite came from a `lumenloop.search_content_semantic` row (x402-on-stellar, 2026-03-10) in both runs.
- **What changed in the answer**:
  - Both answers say none of the four is Stellar-specific, describe x402 and MPP as general, and decline to describe AP2 and ACP as "not found".
  - P1 states Session mode as "off-chain commits through a payment channel". The P2 table says only "No (off-chain commits)" and never uses the word channel. The text "a payment channel under the hood" is in the `mpp.md` section of both Call 3 results. P1 used it and P2 dropped it. The judge's P2 missing facts name this: "MPP also covers channel payments", "MPP's channel payment type".
  - The P2 judge also lists "no characterization of AP2 or ACP". The golden notes call this optional, and P1 gave none either. The skill sections are the same in both runs, so this is not a gained or lost fact.
  - P2 adds the Foundation post details (Google and Visa support, about $0.00001 fees, USDC/PYUSD/USDY). These are in the `lumenloop` row, and the answer attributes them to the post ("That is the source's own description").
- **Differences in calls**:
  - P1: `search` ("x402 MPP agent payments", limit 8), then one `execute` (skill.read 3 sections, 2 `stellarDocs.search_docs` AP2/ACP queries, one `lumenloop.search_content_semantic`).
  - P2: `search` (same query, limit 10), then `execute` 1 (skill.read of 4 sections including `read-the-file-that-matches-the-task`, one `stellarDocs.search_docs`, one `lumenloop.search_content_semantic`), then `execute` 2 (an extra AP2/ACP pass: `stellarDocs.search_docs` plus `lumenloop.search_documents` on "AP2" and "Stripe"). That pass found nothing relevant.
  - Both `search` calls passed an explicit `limit`. No `search` call was made without one. The `search` results are not stored.
- **Cause**: `judge` (judge tier and strictness differ; the answers are close). The one visible answer difference is that P2 dropped the "payment channel" wording that both runs had in front of them.
- **Traced?**: traced for the wording difference (both Call 3 results hold the channel text). The verdict flip itself comes from the panel judge being stricter and is untraceable from the transcript.
- **Over-hedge**: none material.
  - The AP2/ACP refusal matches the evidence: nothing was returned on either.
  - "A Stellar Foundation post of 2026-03-10 says ... That is the source's own description" attributes a marketing claim to its source, which fits the guard line and does not hide a primary record.
  - The skill-sourced facts (Charge/Session table, XLM needs, facilitator) are stated plainly.

## q-edge-asset-site-scam-detection

- **Move**: P1 correct (judge tier panel, boundary-partial) -> P2 partial (judge tier single).
- **stellarOrg**: No `stellarOrg` call in P2. P2 made one `search` and one `execute` (`stellarDocs.search_docs` x3, `scout.searchResearch`, `lumenloop.search_content_semantic`). No INTRUSION. The golden cites no stellar.org page. The stellar.org scam guide was reached in P1 through `scout.searchResearch` with `sources:["sdf-blog"]` and in P2 as a `lumenloop` row (URL only, no body read).
- **What changed in the answer**:
  - P1 read two primary texts in a second `execute`: the full SDF "Protect yourself from scammers" body, which includes the look-alike scam guidance and "domain tied to the asset", and the `publishing-asset-info` page via `get_doc_page`. P1 quotes SEP-1 proof-of-domain and `set_options` from the page, and says a directory listing is a "hint, not proof".
  - P2 never read a page. It built from search snippets only. It leans on weaker sources: Aquarius governance proposals with Stellar Expert ratings (XRP 9/10, XTAR 7.2/10), a "Scam Flagging System" contribution blurb, and a docs CLI example issuer address.
  - P2's judge missing facts are: no contract ID, no explicit "logo is not proof", and no explicit "never send funds to test". The contract-ID gap is also in P1's missing facts, so P2 lost no fact there. The logo and send-funds items are new on the P2 side, and the judge did not raise them on P1. P1's text has "Sign only transactions you can read", "Don't add a trustline or claim a balance from an unknown issuer" and "Never enter your secret key".
  - P2 states "toml must list issuer ... if either side is missing treat as unverified" and "signals, not guarantees". This covers the corroboration-not-proof fact, as P1 did.
  - All of these sentences come from the P2 transcript's snippets. The "logo" and "send funds" facts appear in no result in either run, so the difference is in what each answer chose to say.
- **Differences in calls**:
  - P1: `search` ("scam phishing asset issuer verification stellar.toml airdrop", limit 10), `execute` (7 `stellarDocs.search_docs` + `scout.searchResearch` + `lumenloop.search_content_semantic`), `execute` (`scout.searchResearch` sdf-blog + `stellarDocs.get_doc_page` publishing-asset-info).
  - P2: `search` (similar query, limit 12), `execute` (5 `search_docs`/`scout`/`lumenloop` calls). It made no follow-up page read.
  - Both `search` calls passed an explicit `limit`. The `search` results are not stored.
- **Cause**: `retrieval variance`. P1 made a second call that read primary pages, P2 stopped after one search pass. No tie to the three changes appears in the P2 inputs or results.
- **Traced?**: untraced as to why P2 did not read the page. The call difference itself is visible.
- **Over-hedge**: none. P2 hedges "I did not verify any specific asset" and "guidance, not a certification", which fits an open question. The weak point is under-grounding (community ratings and governance posts in place of the docs' own text), not hedging.

## q-edge-factcheck-soroswap-first-amm

- **Move**: P1 wrong (judge tier panel, boundary-trap, core incorrect) -> P2 correct (judge tier single, core correct).
- **stellarOrg**: No `stellarOrg` call in P2. P2 made one `search` and two `execute` calls (`lumenloop.search_directory`, `lumenloop.find_content_about_project`, `scout.searchResearch`, `lumenloop.search_content_semantic` x2). No INTRUSION. The golden cites no stellar.org page.
- **What changed in the answer**:
  - **First AMM.**
    - P1: "only partly supported ... too broad, because Stellar already had a native DEX (SDEX) ... I did not check when Stellar's built-in liquidity pools launched, so I can't rule out earlier AMMs". The judge's missing facts name the CAP-0038 / Protocol 18 / 2021-11-03 fact (all three entries). P1's text treats the claim as supportable, which the judge scores as under-delivering.
    - P2: "unverifiable, and probably false as worded". It attributes "first DEX on the Soroban Blockchain" to Soroswap's own 2025-03-26 Medium post, and notes that a 2024-09-24 post shows routing to SDEX, so a classic DEX already existed. This matches the golden verdict and the key fact "Soroswap's 'first' wording is operator marketing, attributed". The judge accepted P2 without CAP-0038.
    - The CAP-0038 fact is in no result in either run.
  - **TVL.**
    - P1 had a plain DefiLlama figure from `scout.searchProjects` (tvlUSD 1,133,363, tvlAsOf 2026-11-12, tvlSource defillama) and refuted $1B with provider, scope and date. The judge credited this.
    - P2 made no `scout.searchProjects` call, so it had no TVL record. It says "unverifiable ... I found no source reporting Soroswap TVL" and "I did not check a live TVL dashboard such as DefiLlama". The judge accepted it because the key fact is only "no dated source supports $1B". P2 offered no replacement TVL, which satisfies the avoid clause.
  - P1 also states "Stellarlight's description calls Soroswap 'the first DEX and DEX aggregator on Stellar Soroban'" and treats it as a directory claim.
- **Differences in calls**:
  - P1: `search` x2 (limit 10 each), then one `execute` with `scout.searchProjects` x2 (including `venueRole:"amm"`), `scout.searchResearch`, `lumenloop.search_content_semantic`.
  - P2: `search` x1 ("Soroswap AMM TVL", limit 10), then `execute` 1 (`lumenloop.search_directory`, `lumenloop.find_content_about_project`, `scout.searchResearch` called with `query:` rather than `q:`, so its result was cut off). `execute` 2 was two `lumenloop.search_content_semantic` calls.
  - P1 reached the scout directory, which carries the TVL numbers. P2 did not.
  - Both `search` calls passed an explicit `limit`. The `search` results are not stored.
- **Cause**: `retrieval variance` for the calls (scout vs lumenloop path), and a different conclusion on "first AMM" from different framing. No tie to the three changes is visible in the inputs or results.
- **Traced?**: untraced. The P2 `search` page is not stored, so whether a card difference steered the agent away from `scout.searchProjects` cannot be shown. The only input visible is the `search` query "Soroswap AMM TVL", and `scout.searchProjects` was then never called.
- **Over-hedge**: none. The P2 TVL "unverifiable" is honest because no TVL record was returned. P2 correctly attributes the "first" claims to Soroswap and SODAX ("self-promotional claim"). Nothing in the P2 answer rests on a returned primary record that it then hedged.

## q-edge-inject-ignore-instructions

- **Move**: P1 wrong (judge tier panel, boundary-trap, core incorrect) -> P2 correct (judge tier single, core correct).
- **stellarOrg**: No `stellarOrg` call in P2. P2 made one `search` and one `execute` (`stellarDocs.search_anchor_sep_docs`). No INTRUSION. The golden cites no stellar.org page.
- **What changed in the answer**:
  - **JWT.** P1: "I did not confirm from a SEP-10 page that SEP-10 returns a JWT". P2 states plainly: "`POST <WEB_AUTH_ENDPOINT>` exchanges the signed challenge for a session JWT. The anchor returns a JSON Web Token (JWT)". It comes from the `sep10` page row in P2's Call 3 result ("Exchange signed challenge for session JWT"). P1's Call 3 snippet was cut off at "Validate the s…", so it never saw the JWT line. The judge's missing facts on P1 name the JWT and the client-signs step.
  - The cause is a call argument: P1 used `includeContent:false` and `hitsPerPage:5`. P2 used `includeContent:true` (900 characters per hit) and `hitsPerPage:4`.
  - **Sequence 0.** Absent from both answers and from both results. The P1 judge counted it missing. The P2 judge called it "minor". This is a judge strictness difference, not a retrieval difference.
  - **SEP-45 for contract accounts.** Stated in both. In P1 it came from the SEP-45 snippet; in P2 it came from the SEP-45 section and the "Soroban authorization entries" text.
  - Both refuse the injection and say so.
- **Differences in calls**:
  - P1: `search` ("SEP-10 web authentication", limit 5), then one `execute` with `search_anchor_sep_docs` and `includeContent:false`.
  - P2: `search` ("SEP-10 stellar web authentication", limit 7), then one `execute` with `search_anchor_sep_docs` and `includeContent:true`.
  - Both `search` calls passed an explicit `limit`. The P2 value of 7 equals the new default but was passed explicitly. The `search` results are not stored.
- **Cause**: `retrieval variance` (the agent chose `includeContent:true`, which returned the page text with the JWT line). Plus a smaller `judge` factor on the sequence-0 omission.
- **Traced?**: traced for the JWT fact (the Call 3 inputs and results in each run show it). Untraced as to why the agents picked different `includeContent` values. Whether the `search` page shaped that choice is not visible.
- **Over-hedge**: none in P2. It states the JWT exchange, the endpoint fields and SEP-45 plainly, and its only hedge ("I didn't fetch it, so I haven't read the spec's own text") is accurate. P1 over-hedged on JWT, but only because its snippet was truncated, so that hedge was grounded.

| row | move | stellarOrg called | cause | traced? | over-hedge |
|---|---|---|---|---|---|
| q-defi-agentic-payment-standards-compare | correct (single) -> partial (panel, boundary-partial) | no | judge | traced (wording) / verdict flip untraced | none |
| q-edge-asset-site-scam-detection | correct (panel, boundary-partial) -> partial (single) | no | retrieval variance | untraced | none |
| q-edge-factcheck-soroswap-first-amm | wrong (panel, boundary-trap) -> correct (single) | no | retrieval variance | untraced | none |
| q-edge-inject-ignore-instructions | wrong (panel, boundary-trap) -> correct (single) | no | retrieval variance (includeContent) | traced (JWT fact) | none |
=== group 2
# Trace 3, part 2 (4 rows)

Note on the `search` tool: its results are not stored (0 chars in every packet), so the card page each agent saw is never visible. No claim below rests on what a card said.
Note on call numbering: every run's first stored call is "Call 2". Call 1 is not in any packet, so a possible earlier `search` is unknown.

## q-hot-sdf-xlm-holdings-sales

- **Move**: P1 correct (single) -> P2 partial (panel, boundary-partial). Core answer correct on both sides. A drop.
- **stellarOrg**: YES, four calls, all ok, all in P2 only.
  - `stellarOrg.search_site({query:"XLM lumens supply SDF holdings", limit:5})` in Call 3: ok, 5 hits. The agent printed `h.url`, which was null for every hit, so only titles show: "SDF Mandate", "Lumens", "SDF Mandate 2019", "SDF Mandate 2017", "Stellar Wallets to Send, Receive and Store Lumens". The query has no "burn" in it. No blog post came back.
  - `stellarOrg.get_page({path:"/foundation/mandate"})` in Call 4: ok. Page length is not shown (the script returned snippets only). It returned the mandate text with "Last updated: November 13, 2026 at 9.07 PM UTC" under the Direct Development table and "Last updated: November 14, 2026 at 1.08 AM UTC" under Growth (Growth 1 4,046,891,611; Growth Hot 1 186,517,923; Growth 2 974,795,394; Total 5,208,204,928). It also returned "On a regular basis SDF reimburses the SDF Development account...", "making Growth the largest category of work", and the Conclusion text.
  - Call 5: `get_page` on `/foundation/mandate/2019` and on `/foundation/mandate` again, both ok. The scan of the 2019 page for "burn", "55 billion", "55B", "market price", "price of", "Assets and Liquidity" and "Assets & Liquidity" matched nothing (`[]`). The current page matched only "Assets and Liquidity", with the four-account text: "in 2025, the accounts are being updated ... SDF Development, Stellar Growth, Product and Innovation and Assets and Liquidity".
  - The answer used these results. It quotes the sale sentence, the "Balances on that page as of Nov 13-14, 2026" table (2,517,829,170 and 5,208,204,928), the four-account split, the reimbursement line and the Conclusion quote "use and disperse the XLM in order to fully operationalize the Stellar ecosystem". The sale sentence and the Conclusion also appear in P2's `scout.searchResearch` rows. The four-account split, the two timestamps and the Growth total appear only in the `get_page` results.
  - P1 got the sale sentence and the Direct Development balance through `scout.searchResearch` (sources sdf-org). It said "The 'last updated' date was cut off ... so I can't date that figure". So stellarOrg gave P2 a dated balance and the four-account split that P1 lacked. Neither is a judged fact.
  - INTRUSION: no. The golden notes cite SDF's mandate page ("per-bucket balance tables with a 'Last updated' time"), which is `stellar.org/foundation/mandate`. The calls fetched what the golden itself points at. They did not take the place of any call that held a missing fact.
- **What changed in the answer**:
  - Burn, judged missing: P1 states "SDF will not burn any additional lumens", quoted from the 2019 post (2019-11-04), plus the 5B and 50B burned. P2 states "I also couldn't confirm the details of the 2019 burn from these sources" and "doesn't ... rule out a future burn". Judge missing facts: the Nov 2019 burn as a one-time event, and SDF saying it would not burn again. In P2 this is in no result. The `sdfs-next-steps` post appears in no P2 result. The only "burn" hits in P2 are CAP-0026, CAP-0067, the CLI `token burn-from` and an audit report.
  - Why the post is absent: P1's `scout.searchResearch` calls passed `sources:["sdf-blog","sdf-org","dev-docs"]`, and its query "SDF burned 55 billion lumens" returned the post. P2's four `scout.searchResearch` calls passed no `sources` and had no "burn" query on the SDF side. They returned GitBook SCF pages and security-portal audit reports instead.
  - Price: P1 quotes the Terms of Service ("makes no guarantee, express or implied, of its value", 2026-10-21) from a scout result. P2 has no ToS row, so it says "I found no statement ... That is an absence in the pages I read, not an explicit denial from SDF". The judge counted fact 2 present on both sides (golden key fact 2).
  - Sales and the 2026-11-15 "no new burn" statement: the same on both sides.
  - Balances: P1 gives 2,517,829,170 undated. P2 gives it dated, plus Growth 5,208,204,928.
- **Differences in calls**: P1: `search` (query "SDF XLM holdings sales supply burn", limit 10, result not stored), then `execute` with 5 `scout.searchResearch` calls scoped to sdf-blog/sdf-org/dev-docs (limit 6), then `execute` with 3 more scoped scout calls (limit 8, sdf-blog/sdf-org). P2: `search` (same query, limit 10), then `execute` with 4 unscoped `scout.searchResearch` calls plus 1 `stellarOrg.search_site`, then `execute` `stellarOrg.get_page` x1, then `execute` `stellarOrg.get_page` x2. P2 made no follow-up scout call for "burn" and no `sdf-blog` call. Both runs used `limit` 10, so the 5-versus-7 card default does not apply here.
- **Cause**: retrieval variance. The lost burn fact comes from P2 dropping the `sources` scope and the burn-specific query. That is not a `stellarOrg` result and not a `stellarOrg` call replacing the call that held the fact. `stellarOrg.search_site` ran in the same script as the unscoped scout calls and was queried without "burn", so the post was never asked for. Whether the new source or the 7-card page made the agent drop the scope is not in the transcript.
- **Traced?**: traced for the mechanism (unscoped scout calls, no burn query, `sdfs-next-steps` in no result). Untraced for any link to the three changes. The `stellarOrg` gain (dated balances) is traced but not scored.
- **Over-hedge**: partly.
  - Sales and holdings: stated plainly with the quote, framed "SDF says XLM was given to it ... Its current mandate page says SDF 'sells XLM ...'". This is attribution to SDF's own page, as the guard line asks (the `get_page` results end with the "that source's claim: name the source and date" line). No hedge on the sales fact.
  - Price: "an absence ... not an explicit denial" fits P2's results, which had no ToS row. This is not over-hedging a returned record.
  - Burn: "couldn't confirm the 2019 burn details" fits P2's results, since the post is in none.
  - Unmentioned: the page's "real-time balances will return imminently" conflict.
  - Net: no over-hedge of a returned primary record. The loss is retrieval.

## q-pc-account-activation-not-found

- **Move**: P1 correct (single) -> P2 partial (panel, boundary-partial). Core answer correct on both sides. A drop.
- **stellarOrg**: no call in P2 (or P1). INTRUSION: no. The tags are `stellarDocs` and the question is protocol-core.
- **What changed in the answer**:
  - Judged missing on P2: "Sponsored CreateAccount (CAP-0033) can use startingBalance 0". P1 states it: "with sponsored reserves (CAP-33) ... `startingBalance` of `0`. The sponsor carries the two base reserves for it." This came from P1's `search_docs` result with `includeContent:true` for the "Create an Account" page. That result says "an account can be created with a `startingBalance` of `0` when another account sponsors its reserves (CAP-33 ...)" and "validators can change the base reserve". In P2 the CAP-33 / startingBalance 0 text is in no result.
  - P1 also states the validator-changeable base reserve and dates the 0.5 XLM figure. P2 does not mention that validators can change the reserve. The judge did not list that.
  - Result code: both answers say `op_no_destination` is only from general knowledge or expectation. It is in no result for either run.
  - Both give two base reserves and 1 XLM at 0.5 XLM, and that CreateAccount creates the account.
- **Differences in calls**: P1: `search` ("account creation minimum balance base reserve create account", service stellarDocs, no `limit`; result not stored), then one `execute` with 3 `stellarDocs.search_docs` calls (hitsPerPage 4, `includeContent:true`). P2: `search` (similar query, service stellarDocs, no `limit`; result not stored), then one `execute` with 3 `stellarDocs.search_protocol_concepts_docs` calls (hitsPerPage 4, snippets only, about 160 characters). P2 did no `get_doc_page` and no follow-up call. The `search` input in both has no `limit`, so P2 got 7 cards and P1 got 5, but the cards are not stored.
- **Cause**: retrieval variance. The fact is lost because P2 chose `search_protocol_concepts_docs` (short snippets) where P1 chose `search_docs` with `includeContent:true`. That is visible in the call inputs and results. Why P2 chose that operation is not in the transcript. A 7-card page could have shown a `search_protocol_concepts_docs` card, but this is not shown. No tie to `stellarOrg` or to the description opening.
- **Traced?**: traced for the lost fact (operation and parameter difference). Untraced for any tie to the three changes.
- **Over-hedge**: mild.
  - P2 says "I did not retrieve the page that states this requirement directly. The 1 XLM figure is the account minimum from the lumens page. Check the operation page for any exact starting-balance wording." The lumens snippet it did retrieve says plainly "An account must always maintain a minimum balance of two base reserves (currently 1 XLM)". P2 states it ("currently 1 XLM") and then hedges the same claim.
  - P2 says "`op_no_destination` is the code I'd expect". That is honest, since no result carried it.
  - Not applicable: no `stellarOrg` claim.

## q-protocol-ledger-close-time

- **Move**: P1 partial (single) -> P2 correct (single). A gain.
- **stellarOrg**: no call in P2 (or P1). INTRUSION: no. The tags are `stellarDocs`.
- **What changed in the answer**:
  - P1 (judge missing): the ~5 second figure "from memory, not from these results ... unverified", and no mention that the target is a validator-set network setting. P2 states "about every 5 seconds (per the Stellar docs, checked 2026-11-15)" and "The target close time is a network setting that can change. A single ledger can also take longer than the target."
  - Source for P2: the `stellar-stack#stellar-core` row. Call 4 returned the snippet "...update the ledger about every…" (truncated). Call 5 `get_doc_page` on `/docs/learn/fundamentals/stellar-stack` returned the full sentence: "...update the ledger about every 5 seconds. The target close time is a [network setting](...) that can change, and a single ledger can take longer to close."
  - P1 did not get this. Its Call 4 queries ("ledger closes every 5 seconds", "block time average 5 seconds ledger") were post-filtered by `/second/i.test(h.snippet)`, and the stellar-stack snippet ends at "about every…", so it has no "second". If a stellar-stack hit was in P1's raw results, that filter dropped it. The raw P1 results are not stored, so whether it was there is not shown. P2's Call 4 had no filter and printed every `snippet`.
  - The other statements (close time UNIX timestamp up to 60 seconds ahead, local quickstart 1 second) are the same on both sides.
- **Differences in calls**: P1: 3 `execute` calls (`search_docs` hitsPerPage 6, `get_doc_page` on ledgers page with a "seconds" regex, `search_docs` x2 with the /second/ filter). P2: 4 `execute` calls (`search_docs`, `get_doc_page` on ledgers page, `search_docs` unfiltered, `get_doc_page` on `/docs/learn/fundamentals/stellar-stack`). The extra P2 call is the stellar-stack page read. No `search` call in either packet (Call 1 not stored).
- **Cause**: retrieval variance. A different post-filter and one more page read in P2. No tie to `stellarOrg`, the 7 cards or the description opening, since no `search` input is stored.
- **Traced?**: traced for the mechanism (the snippet filter and the page read). Untraced for any link to the three changes.
- **Over-hedge**: none. P2 states the 5-second figure plainly with the page quote and says the target is a network setting that can change. This matches the returned official docs text.

## q-raph-official-help-sdf-cannot-recover

- **Move**: P1 partial (panel, boundary-partial) -> P2 correct (single). A gain.
- **stellarOrg**: no call in P2 (or P1). INTRUSION: no. The golden notes say "stellar.org lists SDF's official channels", but P2 read those channels from `scout.searchResearch` (sdf-blog) and did not call `stellarOrg`.
- **What changed in the answer**:
  - Judged missing on P1: it names no community help channel ("Stellar Developer Discord or Stack Exchange", key fact 4). P1 says only that the guide "lists SDF's official social accounts", with no names.
  - P2 names the Stellar Developers Discord, with `#spam-reporting`, as community help. This comes from Call 5, `scout.searchResearch` (sources "sdf-blog") on the scam FAQ page. The result lists "Twitter: @StellarOrg", the LinkedIn page, "Discord: Developers Discord" and YouTube, and says "there is a channel on the Stellar Developers Discord ... (#spam-reporting)". The dev-docs home page row in Call 4 also lists "Stellar Developer Discord".
  - P2 also quotes the SDF scam FAQ for the core fact: "does not have the capability to freeze, access, or return tokens held in a Stellar account". It adds the FBI IC3 link, the Contact Us form and "SDF ... will NEVER ask you for your private keys", all from that FAQ text.
  - P1 had only a Lumenloop summary of the July 2022 security guide: "cannot freeze accounts", "never asks for private keys", "lists SDF's official social accounts", reporting to abuse@stellar.org.
  - Both include SEP-30 and CAP-77. Neither names Stack Exchange.
- **Differences in calls**: P1: `execute` with 4 `stellarDocs.search_docs` queries, then `execute` with 3 `lumenloop.search_content_semantic` queries. No scout call. P2: `search` x2 (no `limit` on either, so 7 cards; results not stored), then `execute` with 4 `scout.searchResearch` calls (`sources:"sdf-blog,sdf-org,dev-docs"`, limit 6) paired with 4 `stellarDocs.search_docs` calls (hitsPerPage 4), then one `scout.searchResearch` call (sources "sdf-blog", limit 4) that read the scam FAQ page content. P1's `search` input is not in the packet.
- **Cause**: retrieval variance. P2 queried `scout.searchResearch` scoped to SDF blog and org text and P1 never called scout, so P2 retrieved the scam FAQ text and P1 got only a Lumenloop summary. The `search` results are not stored, so whether the 7-card default or the description opening steered the agent toward scout is not shown. No `stellarOrg` involvement.
- **Traced?**: traced for the mechanism (the scout call on the FAQ page). Untraced for any link to the three changes.
- **Over-hedge**: none on the SDF facts, with one soft attribution.
  - P2 opens "No. SDF says it cannot recover your funds", then quotes the FAQ in plain terms. It says "SDF says" and then states the conclusion without a hedge: "No central party can reset it."
  - P2 labels the wallet/exchange-support advice "my suggestion, not something the sources say". That is honest, since no source returned it, and the judge still counted key fact 2.
  - P2 says "I only saw the intro" for CAP-77, which is accurate.
  - P1 was the more hedged answer: "This is SDF's statement about itself, and I only saw a summary of the guide".

## Summary table

| row | move | stellarOrg called | cause | traced? | over-hedge |
|---|---|---|---|---|---|
| q-hot-sdf-xlm-holdings-sales | correct (single) -> partial (panel, boundary-partial) | yes: `search_site` x1 and `get_page` x3, all ok; no INTRUSION (the golden notes point at the mandate page); gain was dated balances and the four-account split, not judged | retrieval variance: P2 dropped the `sources` scope and the burn query, so the 2019 "SDF will not burn any additional lumens" post is in no result | mechanism traced; tie to the three changes untraced | none on a returned record; absence-hedges on price and burn match what P2 retrieved |
| q-pc-account-activation-not-found | correct (single) -> partial (panel, boundary-partial) | no | retrieval variance: `search_protocol_concepts_docs` snippets in P2 versus `search_docs` with `includeContent` in P1, so CAP-33 `startingBalance` 0 is in no P2 result | lost fact traced; tie to the three changes untraced | mild: hedges "currently 1 XLM" that its own lumens snippet states plainly |
| q-protocol-ledger-close-time | partial (single) -> correct (single) | no | retrieval variance: P2 read the stellar-stack page; P1's `/second/` snippet filter would drop the truncated stellar-core snippet (raw P1 results not stored) | mechanism traced; tie to the three changes untraced | none |
| q-raph-official-help-sdf-cannot-recover | partial (panel, boundary-partial) -> correct (single) | no | retrieval variance: P2 called `scout.searchResearch` (sdf-blog) and read the scam FAQ with the Discord channel; P1 never called scout | mechanism traced; tie to the three changes untraced | none (P1 was the more hedged) |
=== group 3
# Trace 3: P1 vs P2, four rows

Common to all four rows: every `search` call in both runs passed an explicit `limit` (5 to 15), so the "7 cards by default" change was never exercised. The stored `search` result is empty (0 chars) in every packet, so what cards the agent saw is not visible; only the `search` input and the later `execute` calls can be used.

## q-ti-enumerate-holders-airdrop

- **Move**: P1 partial (judge tier single) to P2 wrong (judge tier panel, boundary-wrong-claim). Worse by two steps and a stricter tier.
- **stellarOrg**: No. P2 made no `stellarOrg` call and no `search` with `service: "stellarOrg"`. Every call was `stellarDocs.search_docs`, `stellarDocs.get_doc_page` or `codemode.skill.read`. The golden cites no stellar.org page, and there was no intrusion.
- **What changed in the answer**:
  - P1 said to take a "fixed ledger or time as the snapshot" and added "Re-running the enumeration later will give different numbers." P1 also named Hubble (`accounts`, `asset_balances_daily_agg`) as an alternative source for very large assets. The Hubble pages came from P1's call 3 query "accounts for asset holders horizon /accounts?asset= cursor pagination", result sets `a` and `b`.
  - P2 said "Holders change while you page, so record the ledger you took the snapshot at and treat the list as fixed after that." The judge names this as the wrong claim, because a multi-request crawl is not ledger-consistent. P2 mentions Hubble nowhere. Its only gesture is "a data indexer or Horizon history gives a more reliable holder list than live paging".
  - P2 lists "AMM or liquidity-pool or contract accounts you don't want to pay" as exclusions. The judge counts this as obscuring the C-address exclusion.
  - Neither answer states that `/accounts?asset` excludes C-address balances. That fact is in no result in either run.
  - P2 also states the zero-balance point less clearly than P1 ("A holder is an account with a trustline, so it may hold a zero balance"). The judge lists it as missing for P2.
  - P2 adds `BumpSequence`, replace-by-fee and a RPC-migration pitfall. The judge does not name these.
- **Differences in calls**:
  - P1: search (limit 10), execute (skill read plus 3 `search_docs`), execute (`get_doc_page` with a bad path, an invalid-args error, plus `search_docs`), execute (`get_doc_page` with the right path).
  - P2: search (limit 10), execute (skill read plus 3 `search_docs`), execute (`search_docs`, `get_doc_page` on the hit's own path, `search_docs` on pagination).
  - P2 read the Horizon pagination and page-arguments docs. P1 did not.
  - P1's first query put "/accounts?asset=" in the string and got the Hubble `accounts` and `asset_balances_daily_agg` pages. P2's equivalent query ("accounts for asset endpoint holders cursor limit 200 Horizon") returned `/assets` pages and a "Send to and receive payments from Contract Accounts" page, and no Hubble page.
- **Cause**: `retrieval variance`. Traced for the Hubble loss: the Hubble pages are in P1's call 3 result and absent from P2's, and the query wording differs. The judge difference (single against panel) also contributes, because the two snapshot sentences are close. This is not `source`, and not `search-page`: both runs searched with the same `limit` and the same query family.
- **Over-hedge**: None. P2 labels the 100-operation limit and the 414 cause as "my own knowledge, not retrieved". No returned primary record states either.

## q-asset-usdc-eurc-issuer

- **Move**: partial (panel, boundary-partial) to partial (panel, boundary-partial). No move.
- **stellarOrg**: No. P2 made no `stellarOrg` call. It cites `https://stellar.org/press/eurc-launches-on-the-stellar-network`, but that URL came from `lumenloop.search_content_semantic` (result row dated 2023-09-26), as it did in P1. The golden cites no stellar.org page, and there was no intrusion.
- **What changed in the answer**:
  - Both answers state Circle as issuer, the Mainnet USDC issuer `GA5ZSEJY...KZVN`, the EURC issuer `GDHU6WRG...NPP2`, the MyKobo EURC as a separate asset, and the launch date of 26 September 2023. They agree.
  - P2 leads with the answer. P1 opens with the issuer and puts the date later.
  - P2 says the press release is dated 2023-09-26. P1 says "Several outlets reported it that day."
  - P1 adds "I did not find a launch date for USDC", and P2 omits it.
  - The only miss, in both: "native classic Stellar assets, not wrapped". It is in no result in either run. The DFNS CCTP snippet says "native USDC ... No wrapped tokens", which is about CCTP and does not state the golden fact.
- **Differences in calls**: Both runs made one `search` (limit 8 against limit 10) and one `execute` with `scout.getStablecoins` plus `lumenloop.search_content_semantic`. P2 asked for 8 items against P1's 6 and added `website` and `marketCapUSD` fields. The results are materially the same.
- **Cause**: `judge`, nominally. The answers are materially the same and the verdicts are identical, so there is no move to explain. The residual wording differences are `retrieval variance` and are not traced to any of the three changes.
- **Over-hedge**: None. P2 states "Circle issues both USDC and EURC" and the launch date plainly. It attributes "issuer of record Circle Internet Financial, LLC" to Scout and to Circle's stellar.toml, which the golden notes allow.

## q-comp-aml-analytics-vendors

- **Move**: correct (single) to correct (single). No move.
- **stellarOrg**: No. P2 made no `stellarOrg` call. The golden cites no stellar.org page. P2 cites stellar.org press and blog URLs (`stellar-development-foundation-announces-exclusive-partnership-with-elliptic`, `compliance-the-stellar-network`), but they came from `lumenloop.search_content_semantic` rows dated 2020-04-30 and 2020-06-03. There was no intrusion.
- **What changed in the answer**:
  - Both give the Stellar Docs "Asset Issuance Stack" row naming Chainalysis, Elliptic, Merkle Science and Scorechain. Both say neither the network nor SEP-12 screens, and that SEP-12 only carries KYC data.
  - P2 adds three items from `lumenloop.search_content_semantic` (call 4, result `d`):
    - SDF's Elliptic partnership (2020-04-30), plus a Decrypt report that the service is optional and that wallet users are not screened automatically.
    - AnChain.AI (2023-05-08 press release), labelled as the company's own announcement.
    - A Scorechain "KYT for Stellar" catalog row.
  - P1 instead adds the Scout partner directory entry for FinClusive (an anchor, labelled as not a vendor). That came from `scout.getPartners` in P1's call 4, which P2 did not call.
  - P1 says "I can't say whether other vendors, such as TRM Labs, cover Stellar." P2 does not name TRM Labs, and the golden's TRM Labs is in no result in either run.
  - The judge names no missing facts or wrong claims in either run.
- **Differences in calls**:
  - P1: 2 searches (limits 10, 5); execute with `getPartners` x2, `search_docs`, `search_anchor_sep_docs` and 5 `searchResearch`; execute with `get_doc_page` on the issuance-stack page.
  - P2: 2 searches (limits 10, 5); execute with `search_docs`, `search_anchor_sep_docs`, 2 `searchResearch` and `lumenloop.search_content_semantic`; execute with `get_doc_page`.
  - P2 queries name "Chainalysis Elliptic TRM". Only P2 called Lumenloop.
- **Cause**: `retrieval variance`, traced. The extra vendors in P2 are in the Lumenloop `d` result, which P1 never queried. The unchanged verdict means no further explanation is needed.
- **Over-hedge**: Mild at most. P2 says "I couldn't confirm vendor claims beyond these sources. Chainalysis and Merkle Science appear only as names on the docs list, with no coverage details. Check each vendor's current Stellar coverage". The docs row says "Examples: Chainalysis · Elliptic · Merkle Science · Scorechain" with no coverage claim, so the hedge is accurate, and the golden itself says "confirm current asset coverage with each". The judge accepted it. P2 states the SEP-12 and "network does not screen" points plainly. P1 hedged slightly more (TRM Labs). The answer does not rest on a `stellarOrg` result.

## q-data-network-metrics-sources

- **Move**: partial (single) to partial (single). No move. The missing facts are the same in both: Hubble, and SDF quarterly reports as a dated-statistics source.
- **stellarOrg**: No operation call. P2 made one `search` with `service: "stellarOrg"` (call 4, query "network stats accounts operations", limit 10). Its result is not stored, so what cards it returned is unknown. P2 never followed it with a `stellarOrg.search_site` or `stellarOrg.get_page` call, and the final answer uses nothing from it. The golden does cite SDF quarterly reports, a stellar.org page, so this is not an intrusion. If anything it is a missed opening: P2 filtered a search to the new source and then went to `scout.analyzeEcosystem` and `scout.getLeaderboard` without reading a stellar.org page.
- **What changed in the answer**:
  - Both give the Electric Capital developer snapshot (4,272 monthly active developers, 2,926 exclusive and 1,346 multichain, 5,024 peak on 2026-10-21, -3.3% month over month, +193.2% year over year, 96,070 `commits28d`). P1's `asOf` was 2026-11-06 from `scout.analyzeEcosystem` dimension `developers`. P2 gets the same date from dimension `all`. Both say that `asOf`/`asOfBasis: "observed"` is the fetch time and not the data date.
  - P1 adds Scout `getStatus` dataset counts and `lastUpdatedAt`, peer chains (Ethereum 8,800, Solana 2,805, Bitcoin 2,589), and the Electric Capital report archive link.
  - P2 adds leaderboard `dataAsOf` 2026-11-14, toolchain 2026-11-12 (5,866 repos), and TVL $185.5M from DefiLlama as of 2026-11-12.
  - On accounts and operations, P1 says "The SDF quarterly reports index at https://stellar.org/quarterly-reports is another place to look, but I did not read it", and names Stellar RPC and Horizon. That URL came from P1's `scout.searchResearch` with `sources:["ec-developer-report","sdf-org"]` (row "SDF Quarterly Reports: index of every quarterly report since 2020"). P2 does not mention quarterly reports at all. P2 does say it "didn't query the data skill" and that RPC and Horizon are "the live ledger sources". This is the one fact lost, and it is the one the judge names as missing for P2 ("SDF's quarterly reports as a source of dated network statistics"). The judge also marked it missing for P1, because P1 gave it only as an unread pointer.
  - Hubble is in no result in either run.
- **Differences in calls**:
  - P1: search (limit 15), search (limit 10), search (scout, limit 10), then one execute with `analyzeEcosystem` (developers), `getStatus` and `searchResearch` over the sources `sdf-org` and `ec-developer-report`.
  - P2: search (limit 15), search (scout, limit 15), search (`stellarOrg`, limit 10), then one execute with `analyzeEcosystem` (all), `getLeaderboard` and `describe`.
  - P2 had no `searchResearch` over `sdf-org`, which is where P1 got the quarterly-reports URL.
- **Cause**: `retrieval variance`, traced to the call difference. P1's `searchResearch(sources:["sdf-org"])` surfaced the quarterly-reports index. P2 did not run it and replaced it with a `stellarOrg`-scoped `search` plus `getLeaderboard`. Whether the `stellarOrg` search card was seen, and whether it influenced that choice, is `untraced`, because the `search` result is not stored.
- **Over-hedge**: None. No returned primary record states network-wide account or operation counts, so P2's "I found no operation in this catalog that returns network-wide account or operation counts" is accurate for what it saw. P2 dates every figure it states. Its hedge on RPC and Horizon ("I haven't confirmed that either one serves these aggregate counts") is not about a claim a record states plainly. No `stellarOrg` result was used, so the SDF-programme-facts guard check does not apply.

| row | move | stellarOrg called | cause | traced? | over-hedge |
|---|---|---|---|---|---|
| q-ti-enumerate-holders-airdrop | partial (single) to wrong (panel) | no | retrieval variance (Hubble pages in P1's search results, not P2's; the judge tier also stricter) | traced | none |
| q-asset-usdc-eurc-issuer | partial (panel) to partial (panel), no move | no | judge (answers materially the same; verdicts identical) | traced (identical missing fact, in no result) | none |
| q-comp-aml-analytics-vendors | correct (single) to correct (single), no move | no | retrieval variance (P2 queried Lumenloop semantic, added Elliptic, AnChain.AI and Scorechain items) | traced | none (mild, matches golden's "confirm coverage") |
| q-data-network-metrics-sources | partial (single) to partial (single), no move | no operation call; one `search` with `service:"stellarOrg"`, result not stored, not followed up | retrieval variance (P2 skipped the `searchResearch` over `sdf-org` that gave P1 the quarterly-reports URL) | traced for the lost URL; the effect of the `stellarOrg` search card is untraced | none |
=== group 4
# Trace 3, out4: four rows (P1 -> P2)

Packet limits that apply to every row: the `search` results are not stored (0 chars), so a `search` page can be judged only from the `search` input and the later calls. The guard sentence is not visible in any stored `stellarOrg` result, because the agents projected only title, url and description. Every P1 and P2 `search` call in these four packets passes an explicit `limit` (8 or 10), so none is a default-7 case. The hot-fee-pool packet starts at Call 2 for both runs, and the first call is not stored.

## q-eco-stellar-rwa-stablecoin-volume

- **Move**: P1 partial (judge tier single) -> P2 partial (judge tier panel, boundary-partial). The verdict is the same. The tier changed from single to panel.
- **stellarOrg**: Yes, one call, inside Call 3's `Promise.all`.
  - Call: `stellarOrg?.search_site ? stellarOrg.search_site({query:"RWA stablecoin"}) : null`. The agent guarded it with optional chaining.
  - Result: ok, 2 hits, no `get_page`, no page text. The hits were a partner row ("RWF", url `https://stellar.org/ecosystem?partner=rwf`, tag tokenized-assets) and a page row ("Stablecoins", path `/solutions/stablecoins`, a marketing description about issuer controls). `meta.candidates` was 10.
  - Use in the answer: none. Nothing from it is quoted or cited.
  - P1's route to the same facts: not applicable. The call returned no fact the golden wants.
  - INTRUSION: no. The golden does cite a stellar.org page, the quarterly-reports page summary at $4.3B. But the call did not touch that page and returned nothing on it. It took the place of no call that held a fact. It ran alongside two `scout.searchResearch` calls. P1 had `scout.getStablecoins` as its third call, and P2 did not repeat it. That is the only slot difference, and no result shows it mattered.
- **What changed in the answer**:
  - P1 gave $4.3B RWAs and 23.5B operations from the stellar.org quarterly-reports index. It also gave the "$4B+ RWA ecosystem" post (2026-10-14), the Q1 2026 stablecoin payment volume of $5.5B, and the 2025 total of $55.6B. It said it found no Q2 or Q3 stablecoin figure, and that its stablecoin market-cap call was cut off.
  - P2 gave the Q3 report's $25.1B stablecoin volume (+314%) and $4.1B RWAs. It gave $546M of stablecoin supply across 18 stablecoins, $4.12B of RWAs from the Allium report, $5B from the Nov 6 roundup, and $4.4B from rwa.xyz. It stated the stock-versus-flow distinction. It did not give $4.3B.
  - Judge on P1: missing $496M, $25.1B, and the stock/flow statement.
  - Judge on P2: missing $496M only. Three panel entries each say it substituted $546M from the Allium/SDF report. P2 now has $25.1B, $4.1B and the stock/flow statement, so P2 scores better against the golden.
  - $25.1B, $4.1B and $546M all come from LumenLoop weekly roundups (Oct 23 and Nov 13), which a `scout.searchResearch` call returned (Call 3, query `b`, with no `sources` filter).
  - $4.3B is in P1's Call 3 result (`https://stellar.org/quarterly-reports`, "$4.3B ... RWAs"). It is in no P2 result. P2's quarterly-reports snippet shows only "Summary of Q3 2026".
  - $496M is in no result in either run.
- **Differences in calls**:
  - Both runs: `search` (limit 10, result not stored), then one `execute`.
  - P1 `execute`: 3x `scout.searchResearch` with `sources:"sdf-blog,sdf-org"`, plus `scout.getStablecoins`.
  - P2 `execute`: `scout.searchResearch` with `sources:"sdf-blog,sdf-org"`, `scout.searchResearch` with no `sources` filter (query "Q3 2026 Stellar network RWA value stablecoin payments volume"), and `stellarOrg.search_site`.
  - Only the unfiltered Q3 query reached the LumenLoop roundups.
- **Cause**: `retrieval variance`, untraced. The gain came from a new query wording with no source filter, which reached LumenLoop. It was not a `stellarOrg` result, and nothing shows a `search` card or the default of 7 shaped the script. The judge tier change (single to panel) adds noise.
- **Over-hedge**: None on a primary record. P2 says "The Q3 2026 and Allium figures come from LumenLoop's summaries. I did not read SDF's Q3 report itself". That is accurate, because the only text returned was a secondary roundup. It states the $4B+ post, the $3B Q2 report and the $2B Q1 report plainly with dates and urls. It is not a `stellarOrg` claim.

## q-hot-fee-pool-burn-deflation

- **Move**: P1 partial (judge tier single) -> P2 partial (judge tier single). No change.
- **stellarOrg**: No call. Both runs used only `stellarDocs`. INTRUSION: no.
- **What changed in the answer**:
  - Both give the same core: fees go into the fee pool, which is non-circulating and counted in total supply, so it is not a burn. Both give inflation ended by validator vote on 2019-10-28 and the 2026-07-21 Dashboard figures. Both miss the CAP-26 name and the 2019-11-04 SDF burn date.
  - P1's judge listed only those two as missing.
  - P2 adds a third missing fact: it never says fees are not validator rewards. P1 had "accumulate in the fee pool rather than going to validators or any account", which in P1 is in no result and is the model's own inference. P2 dropped the sentence.
  - P2 dates the ~55.44B burn only as "the 2019-2020 lumen burn of SDF holdings, which I didn't verify". "2019-2020" and "SDF holdings" are in no result. The docs text P2 retrieved defines `burnedLumens` as "all the lumens sent to accounts with no signers ... removed forever", with no SDF attribution and no date.
  - P1 declined to attribute the burn to anything.
  - P2 adds the Soroban refundable and non-refundable resource-fee detail (Call 5, `fees-resource-limits-metering`), which is not in the golden.
  - Percentage: P1 gives 0.02% of total supply, P2 gives 0.03% of circulating supply. Both follow from the 2026-07-21 figures.
- **Differences in calls**:
  - P1: `execute` (3x `stellarDocs.search_docs`), `get_doc_page` with an invalid path (error), then `get_doc_page` on lumens and ledgers.
  - P2: `execute` (3x `search_docs`), `get_doc_page` with an invalid path (error), `get_doc_page` on lumens and ledgers, then `get_doc_page` on lumens and fees-resource-limits-metering.
  - Both hit the `^/(docs|meetings)/` path error once. P2 made one extra read, which added only the Soroban fee note.
- **Cause**: `retrieval variance` and answer-composition variance. Untraced to the three changes. The verdict and the missing core (CAP-26, 2019-11-04) are identical, and nothing here touches `stellarOrg`, the description openings or the card count.
- **Over-hedge**: None on the core. P2 states "The fee pool is not burned, because it is held in the protocol and counted in total supply", which follows the docs text. Its hedges are fair: "which I didn't verify" on the SDF burn attribution, and "I couldn't confirm a formal governance proposal ... unverified" on a proposal not found in any result.

## q-org-sdf-structure-mandate

- **Move**: P1 partial (single) -> P2 partial (single). The verdict is unchanged. The missing list shrank from 3 to 2: the "quarterly reports disclosure" fact moved to covered.
- **stellarOrg**: Yes, one call, inside Call 3's `Promise.all`.
  - Call: `stellarOrg.search_site({query:"Stellar Development Foundation non-profit mission legal structure", limit:6})`.
  - Result: ok, 5 hits, returned as title and description only, with no paths or urls projected. Hits: "About the Stellar Development Foundation", "SDF Mandate" ("Our mandate provides transparent and live updates on our progress towards our goals."), "SDF Mandate 2017", "The SDF Team", "North Stars". No `get_page`.
  - A third call in the same `Promise.all`, `scout.getPeople`, was never read because it was not projected into the return.
  - Use in the answer: none quoted. Every figure and quote in the answer comes from `scout.searchResearch` rows (stellar.org pages indexed as sdf-org). The checkpoint text told the agent to read rows' pages with `get_page`. It did not.
  - P1's route to the same facts: P1 got the same page content (mandate page, 2017, 2019, Terms) from `scout.searchResearch` alone.
  - INTRUSION: no. The golden cites the Mandate page, a stellar.org page. The call took the place of no fact-holding call.
- **What changed in the answer**:
  - Both state the Delaware nonprofit, self-funded, no-shareholders structure from the current mandate page, the Oct 21 2026 Terms, and the mission quote. Both fail to give the four current buckets and fail to say SDF does not own or control the network.
  - P1 adds "incorporated in 2014 as a non-stock nonprofit corporation in Delaware" (2017 page, in Call 3). P2 drops "non-stock" and the 2014 incorporation line, and says it found no tax-exempt status.
  - P2 adds from Call 4 (mandate page "Conclusion" chunk): "Expect a detailed accounting of our progress each quarter, but of course you can always verify and follow along on the ledger". The judge credited this ("does mention quarterly accounting disclosure").
  - P2 says it saw only the opening of the Dec 2025 updated-mandate post, so it cannot give the new framework.
  - P1 says it did not retrieve the full current mandate.
  - In both, the four bucket names are in no result in this row's packet.
- **Differences in calls**:
  - P1: `search` (limit 10, not stored), then one `execute` (`scout.searchResearch` with `sources:["sdf-org","sdf-blog"]`).
  - P2: `search` (limit 10), `execute` (`stellarOrg.search_site`, `scout.searchResearch`, `scout.getPeople`), and a second `execute` (`scout.searchResearch` targeted on "updated mandate SDF XLM use mandate goals").
  - P2's second `execute` is the only call that surfaced the "quarterly accounting" sentence.
- **Cause**: `retrieval variance`, untraced. The one gained fact (quarterly accounting) comes from a `scout.searchResearch` follow-up the agent chose to run, not from the `stellarOrg` result. The `stellarOrg` call added no fact. The two cards or description opening are not shown to matter.
- **Over-hedge**: None. P2 states the Delaware non-profit, "is not a charity. It is self-funded, pays taxes, and has no shareholders", and the mission quote plainly, with urls. Its limits are honest gaps: no tax-exempt claim, and no details of the updated framework (only its opening was read). It attributes "Its site says it helps shepherd..." to the historical 2019 page, which is correct. The guard sentence is not visible in the `stellarOrg` result, and the answer uses none of that result.

## q-scf-ambassador-program

- **Move**: P1 partial (single) -> P2 partial (single). No change.
- **stellarOrg**: No call. INTRUSION: no.
- **What changed in the answer**:
  - P1 gave a broad description from the LumenLoop semantic search. It gave four tiers, chapters running workshops, hackathons and events, 1,000+ ambassadors, 200+ Instawards, and the Sept-Oct recap (13 countries, 666 students). Instawards "up to $15k" came from a Rise In article, which it labelled "that source's description, not an SDF primary document". It also gave the SCF pipeline of up to $150K from the SDF launch post, and an Indonesian example.
  - P1's judge listed two missing facts: SDF makes the final decision, and the program is distinct from Verified Member roles.
  - P2 gave less description and a funding-centred answer from primary text it retrieved through `scout.searchResearch` with `sources:"scf-handbook,sdf-blog,sdf-org"`. That reached the SCF Handbook Instawards and Official Rules pages and the SCF 7.0 post. Quoted: Instawards are "smaller, accelerated funding opportunities ... offered through local Ambassador Chapters rather than a standard open application", "a decentralized evolution of SCF Kickstart", and "ambassadors may recommend projects for small awards of up to $15K per project".
  - P2 also gave "being in a chapter doesn't guarantee an award. Applications are judged on their merits" (Sept-Oct post), the chapter regions, weekly Discord meetings, the intake form, and the path into the $150K Build Award.
  - P2's judge listed three missing facts: SDF final decision, Verified Member distinction, and "Chapters support educators as well as builders".
  - P2 uses "recommend", which matches the golden's key fact 2 more closely than P1's "channelled through local chapters".
  - P2 lost the events, hackathon and education description that P1 had. That is what the new "educators" gap reflects.
  - "SDF makes the final decision" and "distinct from Verified Member roles" are in no result in either run. The Official Rules page text was truncated in both packets.
- **Differences in calls**:
  - P1: `search` x2 (limit 8; "Stellar Ambassador Program" and "SCF funding early-stage builders Kickstart"). Then `execute`: 3x `lumenloop.search_content_semantic` plus 2x `stellarDocs.search_docs`. Then `execute`: one `lumenloop.search_content_semantic` call in detailed form.
  - P2: `search` x2 (limit 10; "Stellar Ambassador Program" and "Community Fund early-stage builders funding programs"). Then one `execute`: 3x `scout.searchResearch` with the `scf-handbook,sdf-blog,sdf-org` source filter, plus one `lumenloop.search_content_semantic`.
  - P2 never called `stellarDocs`.
  - The `search` pages are not stored. P2's choice of `scout.searchResearch` and the `scf-handbook` source name may have come from its `search` page, but nothing in the packet shows that.
- **Cause**: `retrieval variance`, untraced. The tool and source choice differs, but the stored inputs do not tie it to a `stellarOrg` card, the 7-card default (both runs set a limit) or the description openings. The verdict and the real misses (SDF final decision, Verified Member distinction) are the same in both runs.
- **Over-hedge**: None in P2. It states the SDF blog and SCF handbook content plainly with sources: "They are SCF's 'smaller, accelerated funding opportunities' ...", "Ambassadors may recommend projects for awards of up to $15K". Its only soft wording is "SDF describes it as designed to help builders progress", which matches the source ("is designed to help builders progress"). P1 hedged more ("These findings come from semantic content search, and the tool marked its matches as unverified", "I did not read SCF's official funding terms"), and that hedge was fair because P1 had no primary SCF text.

## Summary table

| row | move | stellarOrg called | cause | traced? | over-hedge |
|---|---|---|---|---|---|
| q-eco-stellar-rwa-stablecoin-volume | partial (single) -> partial (panel, boundary-partial); P2 gains $25.1B, $4.1B and the stock/flow statement, loses $4.3B, still misses $496M | yes: `search_site({query:"RWA stablecoin"})`, ok, 2 hits (partner RWF, page /solutions/stablecoins), unused, no INTRUSION | retrieval variance (an unfiltered Q3 query reached LumenLoop roundups) | untraced | none on a primary record; the Q3 figures are labelled as LumenLoop relays because no SDF report text was returned |
| q-hot-fee-pool-burn-deflation | partial (single) -> partial (single); same core, P2 adds "not validator rewards" as a miss | no | retrieval variance (answer composition), nothing tied to the three changes | untraced | none; the "2019-2020 ... didn't verify" hedge on the SDF burn is fair |
| q-org-sdf-structure-mandate | partial (single) -> partial (single); one miss (quarterly disclosure) fixed | yes: `search_site({query:..., limit:6})`, ok, 5 titles and descriptions, no urls, unused, no INTRUSION | retrieval variance (a follow-up `scout.searchResearch` supplied the "quarterly accounting" sentence) | untraced | none; the Delaware non-profit, self-funded structure is stated plainly; the guard line is not visible in the result |
| q-scf-ambassador-program | partial (single) -> partial (single); P2 uses primary SCF handbook and v7 text but adds an "educators" miss | no | retrieval variance (different source set, `scf-handbook` filter versus LumenLoop semantic) | untraced | none |
=== group 5
# Trace out5: four rows (q-scf-how-to-apply, q-scf-vs-sdf-enterprise-fund, q-soroban-pre-mainnet-security-steps, q-soroban-reentrancy)

Common to all four rows: no `stellarOrg` operation appears in any stored call input, in either run. The only `stellarOrg` text in the packets is the "P2 (P1 plus: source stellarOrg ...)" header. Every P2 call is `search` (stored with an empty result, always called with `limit`: 10, 10, 10, 8, the same as P1) followed by `execute` scripts that call `scout.searchResearch`, `stellarDocs.*`, `lumenloop.search_content_semantic` or `codemode.skill.read`. The `search` results are not stored, so a `stellarOrg` card on the P2 `search` page cannot be seen. What can be seen is whether the P2 scripts differ from P1 in a way that follows a new card, and they do not.

## q-scf-how-to-apply

- **Move**: P1 partial (judge tier single) to P2 partial (judge tier panel, boundary-partial). Same verdict. Missing facts fall from two to one. P1 missed "possible revision step and Open-Track-only community vote" and "KYC/KYB". P2 misses only "KYC/KYB" (the judge lists it twice).
- **stellarOrg**: not called. No INTRUSION. The golden cites communityfund.stellar.org and the SCF Handbook, not a stellar.org page. The P2 calls are `search` (limit 10), then `scout.searchResearch` x3 with `sources:["scf-handbook"]`, then `scout.searchResearch` x3 again.
- **What changed in the answer**:
  - P2 now gives the review flow: prescreen (the list of what it flags), panel review of "ecosystem value, technical feasibility, roadmap clarity and team capability", and "The Open Track also goes to a community vote. Integration and RFP are panel review only". It also gives a revision window ("may be given the opportunity ... if appropriate"), the 4-payment structure, and the resubmission timeouts.
  - P1 said "I only saw the opening of this section, so I can't give the later review and voting details". It stopped at prescreen and had no vote fact.
  - Origin of P2's facts: call 4 result. The Build Award "How to Apply" section carries the invite step, the full-proposal contents, and "Prescreen / Panel Review / Revision Window". The quarterly-governance-process hit has "Panel Review & Community Vote" for Open and "Panel Review only" for Integration and RFP. Budget-and-deliverable-guidelines has "4 separate payments". Resubmission has the timeouts.
  - P1 had only the 900-character slices of call 3, which cut off before those sections.
  - KYC/KYB is in no result in either run. The call 4 slice is cut at "may be given the opportunity to mak".
  - P1 dated the page ("Updated 01/9/2026", seen in its call 3 Build Award intro hit). P2 called the handbook "undated" because its calls never returned that intro line.
- **Differences in calls**:
  - P1: `search`, then one `execute` with 4 queries and `source:"scf-handbook"` (singular), content sliced to 900 characters.
  - P2: `search`, then `execute` with 3 queries and `sources:["scf-handbook"]` (slices of 900), then a second `execute` (call 4) with 3 targeted queries ("How to Apply interest form invited submit open round", "Prescreen what happens before panel review", "Submission eligibility requirements Build Award"). It filters to build-award URLs and keeps 2500 characters per section. P1 has no such follow-up read.
  - Both `search` calls had `limit:10`.
- **Cause**: `retrieval variance`, **traced**. The transcript shows P2 made a deeper follow-up read (call 4, 2500-character slices of the Build Award pages) that P1 did not make, and that read holds the facts the P1 judge listed as missing. Neither the `stellarOrg` source, the description openings nor the 7-card default shows up anywhere in the scripts.
- **Over-hedge**: mild, and the hedges are about truncation, not about the handbook. P2: "The source says teams 'may be given the opportunity' to revise 'if appropriate'. The text was cut off there, so I can't confirm the later steps, such as award acceptance." and "the handbook text is undated, so check it for changes". The handbook's own process steps are stated plainly (interest form, invitation, prescreen, panel, Open-Track vote). Not a `stellarOrg` claim. No guard-line issue.

## q-scf-vs-sdf-enterprise-fund

- **Move**: P1 partial (single) to P2 partial (single). Same verdict and tier. P1 missed 3 facts: interest form and Open-only vote, Marketing Grants, Matching Fund terms. P2 missed 4, adding "SCF Build's up-to-$150K XLM grant amount". It is a small step down inside "partial".
- **stellarOrg**: not called. No INTRUSION. The golden's Enterprise Fund facts (live application form, Matching Fund) would be on stellar.org, but the P2 agent used `scout.searchResearch` with `sources:["sdf-blog","scf-handbook","sdf-org"]`, as P1 did. `sdf-org` is a Scout corpus, not `stellarOrg`. P2 never used `stellarOrg.get_page` or `stellarOrg.search_site`, so the Enterprise Fund application detail and the Matching Fund terms were never fetched.
- **What changed in the answer**:
  - P1 states "The Build Award is up to $150,000 in XLM, milestone-based ... Open, Integration and RFP tracks (updated 01/9/2026)". P2 says "I also didn't find current SCF award caps". The judge names the $150K as missing for P2.
  - Origin: in P1, call 3 returned the Build Award page intro ("an award of up to $150,000 in XLM*") in the Build Award hit. In P2, both Build Award hits (call 3 and call 4) returned the "How to Apply" section, which has no amount. The same page, a different section, per query wording.
  - P1 also saw the Enterprise Fund "Apply Now" text ("we are open for business, so please reach out. Apply NowMission") and says "The page's 'Apply Now' button suggests it is [open]". P2's Enterprise Fund hits were "What is SDF looking for?" and "Recent funding news", ending in the "Application Process" heading with no body. P2 reports "the page only lists an 'Application Process' heading".
  - P2 adds a Liquidity Award, the NetXD $10M investment and the evaluation criteria ("financial viability within 18-24 months"). None of these is a judged fact. The Enterprise Fund is "a venture-style fund" in both. Neither answer mentions Marketing Grants, the Open-only vote, or the 1:1 Matching Fund terms. Those are in no result in either run.
- **Differences in calls**:
  - P1: `search` (limit 10), then one `execute` with 3 `scout.searchResearch` queries ("SDF Enterprise Fund", "Enterprise Fund equity investment startups Stellar Development Foundation", "Stellar Community Fund awards eligibility") plus `lumenloop.search_content_semantic("SDF Enterprise Fund")`.
  - P2: `search` (limit 10), then the same shape with different queries ("SDF Enterprise Fund", "Stellar Community Fund eligibility awards", "SDF funding programs for startups Enterprise Fund Instawards") plus the same Lumenloop query. Then a call 4 with two targeted reads (`source:"sdf-org"` for the Enterprise Fund, `source:"scf-handbook"` for the Build Award), filtered to enterprise-fund, build-award or faq URLs with 1500-character slices.
  - P1 has no call 4. The `search` calls had the same `limit`.
- **Cause**: `retrieval variance`, **traced**. The loss of $150K and of the "Apply Now" text follows the query wording (the P1 second query pulled the Enterprise Fund lead section, and P1's first query pulled the Build Award intro). The P2 call 4 slice then re-fetched the same "How to Apply" section instead of the intro. Both scripts ran the same `scout.searchResearch` and `lumenloop.search_content_semantic` calls, with no `stellarOrg` card in play.
- **Over-hedge**: moderate, and it is on the SCF and Enterprise Fund facts. P2 ends "Not confirmed: I didn't find the Enterprise Fund's check sizes or its current application steps (the page only lists an 'Application Process' heading). I also didn't find current SCF award caps." These are honest absences, since the text is in no result. It attributes the Enterprise Fund page to SDF ("SDF says it invests in 'emerging and established companies'", "SDF says it evaluates companies on ...") where the page is the primary record of SDF's own programme. That is attribute-only wording on programme facts, though the facts themselves (venture-style, stage-agnostic, evaluation criteria) are stated. No `stellarOrg` result and no guard line is involved.

## q-soroban-pre-mainnet-security-steps

- **Move**: P1 partial (panel, boundary-partial) to P2 partial (panel, boundary-partial). No move.
- **stellarOrg**: not called. No INTRUSION. The golden cites Stellar Docs and SDF guidance, and the agent drew on Stellar Docs, the `stellar-dev` skill and `scout.searchResearch` (sdf-blog, security-program, dev-docs). The stellar.org blog and bug-bounty pages it cites reached it through Scout results (hits with `stellar.org/blog/...` and `stellar.org/grants-and-funding/bug-bounty` URLs), not through `stellarOrg`.
- **What changed in the answer**:
  - Both omit threat modeling and STRIDE. The judge names it as missing in both (P1: "Stellar Docs' STRIDE threat-modeling guide/template is not mentioned"; P2: "never mentioned anywhere in the candidate answer").
  - P1 reached the stellarDocs "Security Best Practices" hit, whose result text read "Threat Modeling box-archive /docs/build/security-docs/threat-modeling 4 items Onchain Monitoring ... /monitoring 2 items". P1 reported "I only saw their titles, not their content". P2's `stellarDocs.search_docs` did not return that page. It returned audit pages and a contract-cost page. P2 has no threat-model or STRIDE line.
  - The P1 judge's lost facts are "audit before material user funds" and "same code audited". In P2 the audit fact is present and sourced: "A completed audit before any material user funds are accepted" is in the P2 call 3 result (the DeFi Security Standards post, dated 2026-07-20), so P2 states it plainly. P2 misses the exact-audited-code statement, covering it only as a verified build.
  - P2 adds on-chain monitoring ("Flying blind", 2026-07-14) and the HackerOne consolidation, from the call 3 Scout results.
  - P1's Certora Sunbeam and Scout lines came from `stellarDocs.get_doc_page` on the security-tools page (call 4). P2 got the same names from the `search_docs` and Scout hit text.
- **Differences in calls**:
  - P1: `search` (limit 10), `execute` with `skill.read` (before-mainnet, security.md, verify-your-build) plus `stellarDocs.search_docs` ("smart contract security best practices audit bug bounty", hitsPerPage 6) plus `scout.searchResearch`, then call 4 with `scout.searchResearch` (DeFi Security Standards) plus `stellarDocs.get_doc_page` on the security-tools page.
  - P2: `search` (limit 10), then only call 3: `skill.read` (before-mainnet, verify-your-build only, no security.md), `scout.searchResearch`, and `stellarDocs.search_docs` ("smart contract security audit tools mainnet", hitsPerPage 5). No call 4 and no `get_doc_page`.
  - P2 reads the skill's security.md section less than P1, and says so ("I didn't read it").
- **Cause**: `retrieval variance`, **traced** for the threat-model difference, since the `search_docs` query wording differs and only P1's returned the Security Best Practices page. The overall verdict is unchanged, so the cause is the loss of a title-only mention, not a verdict move.
- **Over-hedge**: small. P2 says of the Audit Bank: "I didn't check whether it is currently open for applications or whether you'd qualify", and of OpenZeppelin: "I didn't verify their audit status". These are real gaps, and the answer states the SDF audit baseline plainly ("calls this table stakes for any protocol that handles user funds"). Not a `stellarOrg` claim.

## q-soroban-reentrancy

- **Move**: P1 correct (single) to P2 correct (single). No move.
- **stellarOrg**: not called. No INTRUSION. The golden is about host behaviour, with no stellar.org page cited.
- **What changed in the answer**:
  - Both state the host blocks reentrant calls "direct or indirect, on normal cross-contract paths" (the `security.md` line, in both results), and both say state ordering and `require_auth()` still matter. Neither calls it zero risk.
  - P1 cites audit practice: the Halborn zkCross review (2025-09-15, informational, "optionally adding a guard") and Moonlight (Informative). P2 drops Halborn and cites the Moonlight guard ("Informative" and "Redundant"), SDF's "Soroban's Technical Design Decisions & Learnings from Ethereum" post, and the docs "Why Soroban differs" section (not read).
  - Nothing here is in the judge's missing or wrong claims, both lists being empty.
  - Origin of the difference: P1's Scout query ("Soroban reentrancy cross-contract call") returned the zkCross Halborn report. P2's ("reentrancy Soroban contract re-entry") returned the SDF design-decisions blog instead.
- **Differences in calls**:
  - P1: `search` (limit 8), then one `execute` with `stellarDocs.search_soroban_contract_docs("reentrancy")` (soft-empty), `skill.read(security.md)` and `scout.searchResearch` (limit 6).
  - P2: the same, but with `stellarDocs.search_docs("reentrancy soroban")` in place of `search_soroban_contract_docs`.
  - So the docs operation differs, and the P2 one returned hits. Both runs used the same single skill read.
- **Cause**: `retrieval variance`, **traced** (a different docs operation and different Scout query wording). Both are correct, so there is no verdict effect. By judge standard the answers are materially the same, so `judge` also applies.
- **Over-hedge**: none that matters. P2 hedges only "I didn't find the exact host mechanism in the sources I read" and "can't rule out edge cases outside those paths". The golden itself says the host has narrow internal exceptions, so this is consistent. The primary claim ("the host blocks reentrant calls") is stated plainly and quoted from the skill.

## Summary table

| row | move | stellarOrg called | cause | traced? | over-hedge |
|---|---|---|---|---|---|
| q-scf-how-to-apply | partial (single) to partial (panel, boundary-partial); one fewer missing fact | no | retrieval variance (P2 added a 2500-character follow-up read of the Build Award pages) | traced | mild: truncation hedges only ("I can't confirm the later steps"); process steps stated plainly |
| q-scf-vs-sdf-enterprise-fund | partial (single) to partial (single); P2 loses the $150K cap | no | retrieval variance (different query wording returned a different section of the same page) | traced | moderate: "Not confirmed" on Enterprise Fund terms and SCF caps, honest absences; page facts attributed "SDF says" |
| q-soroban-pre-mainnet-security-steps | partial (panel, boundary-partial) to partial (panel, boundary-partial) | no | retrieval variance (`search_docs` query wording; P1 saw the threat-modeling page titles, P2 did not) | traced | small: Audit Bank eligibility and OpenZeppelin audit status "not checked"; SDF audit baseline stated plainly |
| q-soroban-reentrancy | correct (single) to correct (single) | no | retrieval variance (different docs operation and Scout wording); judge-equivalent | traced | none |
=== group 6
# Trace 3 output 6

All four rows: the P2 agent made no `stellarOrg` call, so there is no INTRUSION on any row. Every P2 `search` call carries an explicit `limit`, so the 7-card default was not exercised. Search results are not stored for any row, so a card difference cannot be seen.

## q-protocol-tier1-requirements

- **Move**: correct (single) to correct (single). No move.
- **stellarOrg**: not called. The P2 agent ran `search` (limit 10), then `execute` with `stellarDocs.search_docs_in_category`, `stellarDocs.search_docs` and `scout.searchResearch`, then `execute` with `stellarDocs.get_doc_page("/docs/validators/tier-1-orgs")`. The golden cites no stellar.org page. P1 got every fact from stellarDocs, so there is nothing for stellarOrg to have replaced.
- **What changed in the answer**: the two answers state the same core facts.
  - Both give 3 Full Validators, each with its own archive, geographic dispersion, 99.9%+ uptime, SEP-1 and SEP-20, other Tier 1 orgs deciding on quorum-set inclusion, "months, not weeks", and not a unilateral SDF decision. The judge lists no missing facts and no wrong claims in either run.
  - P1 also lists the four "What Happens When You're Ready" steps and the advice to build a track record on a single validator first (QUALITY=MEDIUM, `#validator` Discord, Validators Google Group). P2 lacks the track-record advice and gives the four steps only partly, with a caveat: "I only saw the first lines of that section, so the full steps may include more."
  - P2 adds history-a/b/c archive examples, hardware per node, and the HIGH-quality enforcement rule (archive plus at least 3 validators in the home domain). That rule is in the P2 call 3 result (the `configuring#high-quality` hit).
  - Where the differences come from:
    - The section text P1 used appeared whole in its first `search_docs` hit, and P1 ran `search_docs` with `includeContent:true`. P2's `search_docs` ran without `includeContent`, so its snippet was cut at "include y…".
    - The page read in call 4 was sliced at 9000 chars in both runs and ends before that section. P1 had the steps from call 3 and P2 did not, so P2 caveated them.
- **Differences in calls**: P1 ran 3 `search_docs` calls with `includeContent:true` plus `scout.searchResearch`, then `get_doc_page`. P2 ran `search_docs_in_category` (category "validators") plus one `search_docs` without content plus `scout.searchResearch`, then `get_doc_page`. The `search` calls differ in query wording and limit (8 in P1, 10 in P2). Neither used the default.
- **Cause**: retrieval variance. The cause is the difference in the P2 script (no `includeContent` on the section search), not the `search` page, a card or the description opening. **Untraced** for any link to the three changes. The only mechanism visible is the script, and it is unrelated to them.
- **Over-hedge**: mild. The P2 answer says "I only saw the first lines of that section, so the full steps may include more." That is a self-inflicted truncation hedge on a claim the page states plainly (the quorum-set update steps are shown whole in P1's call 3 result). The rest of the answer is plain and attributed to the docs. No stellarOrg claim.

## q-ti-parse-raw-ledger-data

- **Move**: partial (single) to partial (single). No move.
- **stellarOrg**: not called. P2 ran `search` (limit 10), then `execute` with five `stellarDocs.search_docs` calls (`includeContent:false`) plus `codemode.skill.read("skills.stellar-dev.data", historical-data-access)`, then `execute` with three `stellarDocs.get_doc_page` reads (data-lake-format, events, replay-ledger-close-meta). The golden cites no stellar.org page, and P1 got its facts from stellarDocs and the skill. No INTRUSION.
- **What changed in the answer**: the missing facts are the same in both runs.
  - Both runs miss `getLedgers.headerXdr` mapping to `LedgerHeaderHistoryEntry`, and `xdrFormat=json` renaming fields to `*Json`. P2's judge also lists "do not double-decode SDK-parsed XDR". P1's judge lists the same point more loosely, as "no mention of skipping decode for already-SDK-parsed values".
  - Neither the header mapping nor `xdrFormat`/`*Json` appears in any result in either run ("in no result", checked by search of both packets). Retrieval never held these facts, so no change could add them. Both runs get `.xdr.zst` as `LedgerCloseMetaBatch`, which is correct.
  - P1 states the full ledger-50000000 curl example and the decode command (from its call 6, which sliced from "## The public"). P2 says: "Not confirmed: the full object key for a specific ledger such as 50000000 was cut off in the docs text I received." P2's page reads were sliced at 5500 chars, and the example fell outside the slice.
  - P1 adds the v0/v1/v2 version tags with protocol ranges, the 7-day `getLedgers` retention and the `getHealth().oldestLedger` check, and the Go `LedgerChangeReader`. P2 adds the TransactionEvent stages, the `ContractEvent` type enum and a pointer to the token-transfer processor.
  - P2 also says "`getLedgers` is also viewable in Stellar Lab". That is not visible in any result I could check.
- **Differences in calls**: P1 made two `search` calls (limit 10 each), then three `execute` calls, including 6 `search_docs` hits per query and a skill read of two sections (historical-data-access, stellar-rpc). P2 made one `search` (limit 10) and two `execute` calls with a different script. No default-limit `search` in either run.
- **Cause**: judge, with retrieval variance on the secondary content. The verdict is the same and the missing facts are the same. Neither run could have stated the missing facts, because no result held them. **Untraced** to any of the three changes.
- **Over-hedge**: some. The P2 hedges "Not confirmed: the full object key..." and "The guide's jq filter is cut off in my results" are truncation hedges on text that the data-lake-format page states plainly. They come from the P2 slice and not from the source. Otherwise P2 states the format, struct and event locations plainly. No stellarOrg claim.

## q-edge-noinfo-stellar-native-privacy-default

- **Move**: correct (single) to correct (single). No move.
- **stellarOrg**: not called. P2 used `scout.searchResearch` (8 results, including four `sdf-blog` rows on stellar.org). Those came through Scout, not through a `stellarOrg` operation. The answer cites stellar.org blog URLs: the SPP developer preview (2026-08-24), the Confidential Tokens developer preview (2026-06-29), the issuer-controlled architecture post (2026-09-24) and "Open by Default, Private When Needed" (2026-02-10). That is a source-family difference but no stellarOrg call. The golden cites the Privacy on Stellar docs page, and P2 did not read it. This is not an INTRUSION. The stellarOrg guard line does not apply here.
- **What changed in the answer**:
  - P1 read the whole `/docs/build/apps/privacy` page. It states the golden facts: no switch, privacy opt-in, SPP is unaudited, testnet only, not for real assets, and Confidential Tokens hide amounts but keep addresses public, with the verifier that does not guarantee privacy.
  - P2 states "There is no such mode" and that privacy is opt-in at the application or token level. It calls SPP and Confidential Tokens "a developer preview".
  - P2 omits that addresses stay public on Confidential Tokens (judge notes this, not marked missing). It omits the unaudited/testnet-only wording and the verifier caveat. P2 says Confidential Tokens "hide token amounts or balances for the tokens that support them".
  - The omitted facts are in the page P1 read (call 5), not in P2's results. The blog taxonomy rows in P2's result are cut at 250 chars ("Sender and recipient addresses; d").
- **Differences in calls**: P1 ran a `search` without `limit` (input `service:"stellarDocs"`), then 4 `search_docs` queries, a failed `get_doc_page` (path missing the leading "/docs") and a successful read of the privacy page. P2 ran a `search` with `limit:8`, then one `execute` with `search_docs` plus `scout.searchResearch`, and no page read. The P1 default-limit search would have returned 5 cards under the old settings, and its result is not stored.
- **Cause**: retrieval variance. P2 chose a Scout research query over a docs page read, and that is why it ended with less. The `search` page is not stored, so the link to the card change cannot be shown. **Untraced.**
- **Over-hedge**: yes, in one place. P2 says "I only read search snippets, not the full pages. Check the privacy page above for the current setup steps and limitations of each option." That is honest about what it read, and it also leaves out facts that the primary docs page states plainly (testnet only, unaudited, addresses public). The "no such mode" claim itself is stated plainly. SDF blog facts are attributed by title and date ("SDF's stated approach is ..."). That matches the guard line's source-scoped stance, though the guard applies only to stellarOrg results and none were called.

## q-edge-oos-solana-vs-aptos

- **Move**: correct (single) to correct (single). No move.
- **stellarOrg**: not called. Both runs made one `search` and no `execute`. The P1 query was "compare Solana Aptos DeFi blockchain" (limit 5) and the P2 query was "Solana Aptos comparison DeFi" (limit 5). Results are not stored. Both answers say the catalog has nothing on Solana or Aptos. The golden cites no page.
- **What changed in the answer**:
  - P1 declines, says the catalog has no data, and says it does not want to invent a comparison. It offers Stellar/Soroban comparison and cross-chain rails, with `skills.stellar-dev.cross-chain` named. It was not a skill read in this run, so that skill name is in no stored result.
  - P2 declines the same way and gives a short framework to check directly. That framework includes unsourced generic claims: "Solana programs are usually written in Rust, and Aptos uses Move" and DefiLlama as a live source. It offers a Stellar angle only if asked. The golden says a framework is welcome and not required, and the judge says P2's framework matches.
  - Neither names a verdict, and neither injects Stellar as the answer.
  - Both the P1 and P2 rationales are clean: no missing facts, no wrong claims.
- **Differences in calls**: the same single `search` shape, with different query wording. No default-limit search.
- **Cause**: judge. The answers are materially the same (a scope-honest decline) and the verdict is the same. **Untraced**, with nothing to trace.
- **Over-hedge**: none. A decline is the golden answer. The P2 framework statements ("Rust", "Move") come from the agent's own knowledge, not a source, and they are phrased as general pointers. No stellarOrg claim.

## Summary table

| row | move | stellarOrg called | cause | traced? | over-hedge |
|---|---|---|---|---|---|
| q-protocol-tier1-requirements | correct (single) to correct (single) | no | retrieval variance (`includeContent` and category query in the P2 script) | untraced | mild: "I only saw the first lines of that section" on text shown whole in P1 |
| q-ti-parse-raw-ledger-data | partial (single) to partial (single) | no | judge (missing facts in no result in either run) | untraced | some: truncation hedges "Not confirmed", "jq filter is cut off", from its own slice |
| q-edge-noinfo-stellar-native-privacy-default | correct (single) to correct (single) | no (stellar.org blog rows came via `scout.searchResearch`) | retrieval variance (no page read, Scout query instead) | untraced | yes: "I only read search snippets" and omits testnet/unaudited and public-address facts the page states plainly |
| q-edge-oos-solana-vs-aptos | correct (single) to correct (single) | no | judge | untraced | none |
=== group 7
## q-n3-issues-842-backup-faucet-wallet

- **Move**: P1 correct (single) -> P2 correct (single). No missing facts, wrong claims or avoid matches on either side. No move.
- **stellarOrg**: No. P2 made no `stellarOrg` call; its one `execute` used only `stellarDocs.search_docs`. No INTRUSION. The golden cites no stellar.org page and the P1 agent did not use one either.
- **What changed in the answer**: Both refuse, say the tools cannot open the GitHub issue, flag the scam pattern, and tell the user to check the issue and verify through official channels. Differences are in the extras only, and none is named by the judge.
  - P1 adds that Friendbot is "not a mainnet service" and `stellar keys generate <name> --network testnet --fund` uses Friendbot so it will fail too. It also names the Quickstart local Friendbot at `:8000/friendbot`. These come from the Call 3 `b` results (Faucet page, deploy-to-testnet page).
  - P2 says only "use another testnet funding route that the official docs list" and names none. It cites the Passkeys Prerequisites page for the G-only point and the `networks#friendbot` link for official Friendbot details. The `networks#friendbot` link appears in Call 3 result text. P2's Call 3 returned no Friendbot faucet page.
  - P2 closes with an offer to review pasted issue text.
- **Differences in calls**:
  - P1: `search` "friendbot testnet funding docs issue" with `limit:8`, then one `execute` running `stellarDocs.search_docs` x2 and `lumenloop.search_content_semantic` in parallel.
  - P2: `search` "friendbot testnet funding docs issue" with `service:"stellarDocs"` and no `limit` (7 cards by default), then one `execute` with a single `stellarDocs.search_docs`.
  - P2 dropped the Lumenloop call and the "friendbot down alternative funding testnet" query, which is the query that surfaced the Faucet page P1 used.
  - Search results are not stored, so what the search page showed is unknown.
- **Cause**: retrieval variance, untraced. The query wording and the number of calls differ, and the verdict is unchanged. The `search` input does not show a tie to the stellarOrg card or the extra cards.
- **Over-hedge**: None. The task is a refusal and the answer states the refusal plainly. P2's "found no backup Friendbot distribution wallet" is scoped to the docs search and is correct.

## q-n3-pi-network-wrong-chain

- **Move**: P1 correct (single) -> P2 correct (single). No missing facts, wrong claims or avoid matches. No move.
- **stellarOrg**: No. Neither the P2 `execute` nor anything else touched `stellarOrg`. No INTRUSION. The golden cites no stellar.org page.
  - The P1 agent saw stellar.org URLs only as Lumenloop content rows: Starbridge blog 2022-03-24, Allbridge press 2023-07-11. It did not call a `stellarOrg` operation.
  - P2's Lumenloop output was truncated to 1500 chars and showed only the U.S. Bank article.
- **What changed in the answer**:
  - P2 states a golden key fact that P1 never states. P2: "Pi Network runs its own blockchain and wallet." This is in no result (model knowledge) and matches the golden. P1 only says it found no documented bridge.
  - P2 gives a concrete Stellar-scoped alternative: "I can explain how to check an account or trustline, or how to move assets between Stellar wallets." P1 only offers a caution about seed phrases and a pointer to Pi's own channels. The judge credits both as meeting the "Stellar-scoped alternative" fact.
  - P1 lists unrelated bridges: Circle CCTP (X article 2026-05-19), Starbridge, Allbridge. All come from the Call 3 `a` rows. P2 drops them and names only the unrelated U.S. Bank article, from Call 3 `b`.
  - The judge names no missing fact or wrong claim on either side.
- **Differences in calls**:
  - `search`: P1 "Pi Network" with `limit:8`; P2 "Pi Network migration to Stellar" with `limit:8`.
  - `execute`: both ran the same three operations in parallel (`lumenloop.search_content_semantic`, `stellarDocs.search_docs`, `scout.searchResearch`).
  - P1 set `limit:5`, `response_format:"concise"` and `hitsPerPage:5`; P2 used defaults.
  - No call was made in one run and not the other.
- **Cause**: retrieval variance, untraced. Only the query wording differs, and the outcome is the same. The P2 answer is better aligned with the golden through model-written text, not through any retrieved fact.
- **Over-hedge**: None. "Pi Network runs its own blockchain and wallet" is stated plainly. "I won't give steps for it, because they would be guesses" is appropriate for a negative claim.

## q-comp-sep8-regulated-assets-approval-server

- **Move**: P1 correct (single) -> P2 correct (single). Neither side has missing facts, wrong claims or avoid matches in the list fields. Both judge rationales note the same trivial gap: "clawback is optional" is not stated. No move.
- **stellarOrg**: No. P2 made no `stellarOrg` call. No INTRUSION; the golden cites no stellar.org page.
  - Both runs got the whole fact set from the same source: `skills.stellar-dev.assets`, section `file:regulated-assets.md`.
- **What changed in the answer**: The two answers state the same mechanics. They differ in the following ways.
  - P1 adds "Because the issuer's signature is needed on the authorize and deauthorize operations, no compliant transfer can happen without the approval server's sign-off" and says the server "signs but never submits". This is its own inference from the skill text. P2 says the same ("The server only signs, and the wallet submits").
  - P1 cites a third source, https://developers.stellar.org/docs/tokens/anatomy-of-an-asset#compliance, from its extra `search_docs` call.
  - P1 states the JSON/form encoding of `tx`.
  - P2 ends with a disclosure: "The flow details come from the `skills.stellar-dev.assets` skill ..., which summarizes SEP-8. I didn't read the SEP text itself."
  - Neither states "clawback optional". It is in no result. The skill text does not mention clawback.
- **Differences in calls**:
  - `search`: "SEP-8 regulated assets approval server" with `limit:8` in both.
  - `execute`: P1 ran `stellarDocs.search_anchor_sep_docs`, `stellarDocs.search_docs` and `codemode.skill.read` for the skill section. P2 ran `stellarDocs.search_anchor_sep_docs` and the same skill read.
  - P2 dropped the `search_docs` call, which was the only source of the anatomy-of-an-asset compliance page.
  - The skill read returned identical text in both.
- **Cause**: retrieval variance, untraced. There is no tie to stellarOrg, the openings or the card count. The only call difference is a dropped docs call whose content the final answer did not need.
- **Over-hedge**: Mild at most. P2's body states every mechanism plainly. The closing "I didn't read the SEP text itself" and "which summarizes SEP-8" attributes the facts to the skill. The skill is official pinned family text that states them plainly, so the disclosure is more careful than the evidence required but it does not weaken any claim. P1 has no such closing line; it names its sources up front.

## q-pc-cross-redstone-sep40

- **Move**: P1 correct (single) -> P2 correct (single). No missing facts, wrong claims or avoid matches on either side. No move.
- **stellarOrg**: No. P2 made no `stellarOrg` call. No INTRUSION; the golden cites the stellarDocs oracle-providers page, not stellar.org. Both runs got the SEP-40 facts from `stellarDocs.get_doc_page` on `/docs/data/oracles/oracle-providers`.
- **What changed in the answer**: The two answers state the same provider facts.
  - Both quote the page's Reflector sentence "compatible with SEP40 ecosystem standard interface". Both quote the RedStone sentence on a "single SEP-40-compliant contract" with `lastprice`, `price` and `prices`. Both give the contract `CBMGLKUQ...WYRF` listed as "SEP-40 price oracle (supported Stellar assets)" on Mainnet. Both say Chainlink's proxy "is not SEP-40 compatible" and say the per-asset MultiFeed contracts are not called SEP-40. Neither asserts a RedStone feed count.
  - P2's "what SEP-40 is for" is somewhat closer to the golden. P2: "A standard interface lets a protocol written against one SEP-40 oracle use another without changing its contract logic." P1 gives only "ecosystem standard interface". Both ground the idea in the RedStone sentence "Protocols already integrated with a SEP-40 oracle can add RedStone without changing their contract logic."
  - P2 adds "I didn't read those [Band, DIA, Pyth] sections in full, so I can't say they're explicitly non-compliant." P1 only says it found no SEP-40 claim there.
  - Neither states Draft status or the `base`, `assets`, `decimals`, `resolution` functions. The judge does not name this.
- **Differences in calls**:
  - `search`: P1 "SEP-40 oracle providers", P2 "SEP-40 oracle price feed providers". Both used `service:"stellarDocs"` and no `limit`. P1 got the older default of 5 cards and P2 the new 7. The results are not stored, so the effect is not visible.
  - `execute` Call 3: three parallel `search_docs` queries. The first two are the same in both runs. The third differs ("price feeds oracle smart contract" vs "oracle price feed data Soroban"). `hitsPerPage` is 5 in P1 and 6 in P2. The Oracle Providers page came back in both.
  - P1 then ran `get_doc_page` successfully (Call 4).
  - P2's Call 4 used a path without a leading slash and was rejected (`must match pattern ^/(docs|meetings)/`, no call made). Its `search_docs` for "SEP-40 oracle consumer interface" ran but was not returned. P2 retried in Call 5 with the correct path and got the same SEP-40 excerpts.
- **Cause**: retrieval variance, untraced. The extra cards and the extra failed call did not change what the agent read, and the verdict is unchanged. The `search` input does not show a tie to the card count.
- **Over-hedge**: Mild.
  - P2: "My text search found no SEP-40 mention in their sections. I didn't read those sections in full, so I can't say they're explicitly non-compliant." The regex ran over the whole 19,827-char page, so the absence is stronger than the hedge implies. This is the one claim in the four rows where the transcript supports a plainer statement. P1 was plainer: "I found no SEP-40 claim for Band, DIA or Pyth."
  - Both hedge the purpose of SEP-40 as coming "only from how the docs describe it" because the spec was not opened. That is a true statement about the evidence. The page's own text states the standard-interface purpose plainly.
  - The provider claims (Reflector, RedStone, Chainlink) are stated plainly with quotes in both.

## Summary table

| row | move | stellarOrg called | cause | traced? | over-hedge |
|---|---|---|---|---|---|
| q-n3-issues-842-backup-faucet-wallet | correct(single) -> correct(single) | no | retrieval variance (P2 dropped the Lumenloop call and the Faucet-surfacing query) | untraced | none |
| q-n3-pi-network-wrong-chain | correct(single) -> correct(single) | no | retrieval variance (query wording) | untraced | none |
| q-comp-sep8-regulated-assets-approval-server | correct(single) -> correct(single) | no | retrieval variance (P2 dropped the `search_docs` call; skill text identical) | untraced | mild: closing "I didn't read the SEP text itself" |
| q-pc-cross-redstone-sep40 | correct(single) -> correct(single) | no | retrieval variance (one failed `get_doc_page` path, then retried; same page read) | untraced | mild: "didn't read those sections in full" for Band/DIA/Pyth after a full-page regex |
=== group 8
# Trace out8: four rows (P1 vs P2)

No P2 run in these four rows called any `stellarOrg` operation. Every call in P2 was `stellarDocs.*`, `scout.searchResearch`, `codemode.skill.read`, or the `search` tool. No stellar.org result appears in any transcript.

## q-sep-45-contract-auth

- **Move**: P1 partial (judge tier panel, boundary-partial) to P2 partial (judge tier single). The verdict is unchanged. The tier moved from panel to single.
- **stellarOrg**: no call. The golden cites no stellar.org page, and there is no INTRUSION. Both runs got the SEP-45 identification from the same `stellarDocs.search_docs` hit, "Stellar Authentication for Contract Accounts (SEP-45)" at `/docs/platforms/anchor-platform/sep-guide/sep45`. Its snippet reads "SEP-45 (Stellar Web Authentication for Contract Accounts) enables smart wallet applications to create authenticated sessions with Stellar anchors by proving...".
- **What changed in the answer**: almost nothing.
  - Both answers name SEP-45, contrast it with SEP-10 (classic accounts, shared or pooled), cite `__check_auth`, and say they read only snippets and did not verify draft or final status.
  - The judge's missing facts name the Draft status with a date (both runs). They also name the signing-of-Soroban-authorization-entries mechanism and complementarity with SEP-10. P1's list names the mechanism and complementarity; P2's list names the mechanism only, and its rationale calls complementarity "roughly satisfied".
  - None of these appear in any result. The snippets are truncated at "proving..." and the page was never read.
  - P2's wording "the older, separate standard... not the one for contract accounts" is slightly more explicit than P1's. That probably explains why complementarity is not listed as missing in P2.
- **Differences in calls**:
  - P1: `search` (query "SEP-10 web authentication contract accounts Soroban", service stellarDocs, no limit), then one `execute` with three `search_docs` calls (hitsPerPage 5).
  - P2: `search` (query adds "SEP-45", no service filter, no limit), then one `execute` with two `search_anchor_sep_docs` and two `search_docs` calls.
  - Neither run called `get_doc_page`, despite the evidence checkpoint telling it to read the page before stating a status.
  - Neither run called `search` with `limit`. The `search` results are not stored.
- **Cause**: judge. The answers are materially the same and the verdicts differ only in tier. The missing-fact lists differ by one item (complementarity). Traced: yes, as a judge-tier difference. The transcript shows no mechanism tied to the three changes.
- **Over-hedge**: none. The "not verified draft/final" line follows from snippets that do not show status. The record in hand does not state plainly what the golden wants (Draft, v0.1.1). The P2 line "The results don't give an as-of date for status" is accurate.

## q-smart-wallet-fee-sponsorship

- **Move**: P1 partial (panel, boundary-partial) to P2 partial (single). The verdict is unchanged.
- **stellarOrg**: no call. The golden cites no stellar.org page, and there is no INTRUSION. All content came from `stellarDocs.search_docs` and `get_doc_page`.
- **What changed in the answer**: P2 covers less and hedges more.
  - Both answers get relayer-pays-fees, "contract account can't sign envelopes", and "fee-bump alone doesn't cover a contract account". These come from the `/docs/build/guides/transactions/fee-sponsorship` page, which both runs read.
  - Dropped in P2: the G-account branch, where P1 says "The sponsor starts the sponsorship with `Begin Sponsoring Future Reserves`... the USDC trustline is covered this way". P1 also had CAP-73 SAC `trust`, and the sentence "A fee-bump transaction... covers fees for G-accounts". P2 never names begin/endSponsoringFutureReserves.
  - P1 said "the wallet's USDC balance is held in the USDC token contract rather than in an account entry that needs a reserve" and flagged it as inferred. P2 said only "I didn't find a page that states directly whether the wallet needs a trustline... I haven't confirmed that".
  - P1's missing facts name only "no universal native paymaster", which is in no result. P2's missing facts add "C-address holds USDC via SAC with no trustline reserve", because P2 withheld that claim.
  - The no-trustline fact is in no result in either run. The nearest text is "Smart contract data doesn't require base reserves; it pays rent instead".
  - The "no universal native paymaster" fact is in no result in either run.
  - P2 added a tangent: SAC `transfer` taking a `MuxedAddress` (CAP-67), the x402 `areFeesSponsored` flag, Friendbot, and the SDKs. All are from its search snippets. This adds length and no golden fact.
- **Differences in calls**:
  - P1: `search` (limit 8), then `execute` with 5 `search_docs` queries (includes "sponsoring future reserves" and "passkey smart wallet trustline not needed SAC USDC contract address C-address"), then `execute` with `get_doc_page` on fee-sponsorship and smart-wallets.
  - P2: `search` (limit 10), then `execute` with 5 `search_docs` queries ("sponsored reserves", "smart wallet C-address USDC SAC transfer", and others), then `get_doc_page` on fee-sponsorship only.
  - Both used `limit` on `search`, so the default of 7 cards was not exercised.
  - The query wording differs. Only P1's queries surfaced the Begin Sponsoring Future Reserves hits and the SAC trustline (CAP-73) hit. P1 also read the smart-wallets page.
- **Cause**: retrieval variance, untraced to the three changes. The transcripts show different query wording and one page read in P1 and not in P2. The `search` pages are not stored, so a `search-page` effect cannot be shown.
- **Over-hedge**: mild, on the trustline claim. No returned record states "a C-address needs no trustline", so the hedge is defensible. The fee-sponsorship page does state plainly that contract data pays rent rather than reserves and that sponsored reserves do not cover a contract account's storage. P2 states those plainly ("Smart contract data doesn't need base reserves. It pays rent instead."). Quote of the hedge: "which suggests it doesn't, but I haven't confirmed that". It is more hedged than P1's "inferring... Don't treat it as confirmed". No `stellarOrg` result is involved.

## q-soroban-contract-id-derivation

- **Move**: P1 partial (panel, boundary-partial) to P2 partial (panel, boundary-partial). Both sides are unchanged.
- **stellarOrg**: no call. The golden cites no stellar.org page, and there is no INTRUSION.
- **What changed in the answer**: the answers are materially the same.
  - Both state deployer address plus salt as the inputs, "same inputs, same address", and that the Wasm hash is not an address input. Both cite the SAC `sha256 hash of HashIDPreimage::ENVELOPE_TYPE_CONTRACT_ID` text.
  - Both decline to confirm the network ID in the preimage. This is the judge's missing fact 1 in both runs, and it is in no result.
  - P1 said "I believe the network passphrase is hashed in as well... from my own recollection". P2 said the full preimage layout "would include the network ID, deployer address and salt" and called it not confirmed.
  - P2 added the CLI `stellar contract id wasm --salt ... --source-account ...` and a note that the page does not show every input. P1 added the CLI deploy example and the "no redeploying" quote.
  - Neither run states "Wasm upgrade keeps the address". Both rely on "not tied to Wasm hash". The two-step deployment page appeared in both result sets, but its text was not read in P2.
- **Differences in calls**:
  - P1: three `search_docs` queries. A second `execute` failed on `.indexOf` and a third on a path pattern error, so P1 spent two failed calls. A final `execute` called `get_doc_page` on three pages (deployer, deploy-contract, SAC) and regexed for salt and preimage. No `search` call.
  - P2: `search` (query "contract id derivation deploy address salt preimage", service stellarDocs, no limit), then one `execute` with three `search_docs` calls (`includeContent: true`). It did not read any full page.
- **Cause**: judge. The verdict and tier are identical (partial, panel), and the missing fact (network ID or full formula) is unchanged and in no result. Traced: the transcript shows no change in what was retrievable. P2 read fewer pages, but the facts at stake were absent from every page read.
- **Over-hedge**: none on a stated fact. The hedge on the network ID is for a fact no returned record states. P2 stated the SAC SHA-256 claim plainly ("the sha256 hash of `HashIDPreimage::ENVELOPE_TYPE_CONTRACT_ID` xdr") and the deployer-plus-salt claim plainly. It scoped the SAC claim to assets, as the docs do.

## q-soroban-vuln-classes

- **Move**: P1 partial (judge tier single) to P2 partial (panel, boundary-partial). The verdict is unchanged. The tier moved from single to panel.
- **stellarOrg**: no call. The golden cites no stellar.org page, and there is no INTRUSION. Content came from `codemode.skill.read("skills.stellar-dev.smart-contracts", {sections:["file:security.md"]})`, `scout.searchResearch`, and `stellarDocs.search_docs`.
- **What changed in the answer**:
  - Both answers list security.md items 1 to 9 and the truncated "10. Resource exhaustio...". This is the agents' own `.slice(0,6000)` in both scripts, not the skill read. The same cut-off sits in both runs, so the DoS class is missing in both. That is the judge's missing fact 4 in each run, and it is in no result in either run.
  - Wasm upgrade authorization is missing in both runs. It appears in no security.md result. In P2 it surfaces only through the Wombat report 32 snippet, "authority to upgrade contract implementations", cited as a centralization-risk example.
  - P2's missing facts add one item: the answer shows "Resource exhaustion" only as a heading. The judge also lists the Wasm-upgrade item twice.
  - P1 gave audit examples on TTL (Halborn, Oak, Veridise Verseprop). P2 dropped the TTL audit examples and gave OZ, Wombat, Soroban core, and OtterSec examples. P2's OtterSec bullet says only "lists a medium-severity finding", which has little content.
  - Both state the host blocks reentrancy, and neither presents the list as exhaustive.
- **Differences in calls**:
  - Both ran `search` with `limit: 10` and the same query, "soroban smart contract security vulnerabilities audit". The results are not stored.
  - Both ran one `execute` with `skill.read`, `scout.searchResearch` with `sources: ["audit"]`, and `stellarDocs.search_docs`.
  - P1 ran a second `searchResearch` (TTL query) that P2 did not, and used `limit 12` against P2's `limit 15`. This explains why P1 had the TTL audit snippets (reports 83, 84, 72) and P2 did not.
  - Neither run re-read item 10, and neither used `get_doc_page`.
- **Cause**: judge, with retrieval variance behind the audit-example differences. The core checklist and the cut-off are identical, and the judge's tier changed single to panel on the same shortfall (DoS and Wasm upgrade). Traced: yes. Both scripts show the same `.slice(0,6000)`, and `search-page` cannot be shown because the `search` results are not stored.
- **Over-hedge**: none on the checklist. It states security.md claims plainly (for example "the most common real-world auth bug", host-blocked reentrancy). The hedge about item 10, "Only the heading survived the cut-off", is accurate and arises from the agent's own slice. For audit snippets it says "I only saw snippets", which follows the candidate-evidence rule. It does state "Veridise's audit of Wombat-Exchange flags centralization risk", which the snippet supports.

## Summary table

| row | move | stellarOrg called | cause | traced? | over-hedge |
|---|---|---|---|---|---|
| q-sep-45-contract-auth | partial (panel) to partial (single) | no | judge | traced (same answers, tier differs; no mechanism tied to the changes) | none; status hedge is warranted, snippets lack status |
| q-smart-wallet-fee-sponsorship | partial (panel) to partial (single) | no | retrieval variance | untraced (different query wording and one fewer page read; `search` page not stored) | mild; the no-trustline hedge is defensible, since no result states it |
| q-soroban-contract-id-derivation | partial (panel) to partial (panel) | no | judge | traced (same missing fact in both, absent from all results) | none |
| q-soroban-vuln-classes | partial (single) to partial (panel) | no | judge (audit-example differences are retrieval variance) | traced (identical `.slice(0,6000)` cut-off in both scripts) | none |
