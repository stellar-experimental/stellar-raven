# Trace A: four rows

## q-asset-usdc-eurc-issuer

- **Move**: P0 correct (single judge) to P1 partial (three-judge panel, "boundary-partial"). The tier changed from single to panel.
- **What changed in the answer**: Almost nothing. Both answers state:
  - Circle issues USDC and EURC.
  - The Mainnet USDC issuer is `GA5ZSEJY...KZVN`.
  - Circle's EURC issuer is `GDHU6WRG...NPP2`.
  - EURC launched on 26 September 2023.
  - MyKobo has a separate EURC asset.
  - Circle Internet Financial, LLC is attributed to stellar.toml.
  - Neither run states "native classic assets, not wrapped". P1's missing facts name exactly this ("Does not state that USDC/EURC are native classic Stellar assets rather than wrapped tokens"). The P0 answer omits it too, and the P0 single judge did not flag it.
  - Cosmetic differences: P1 adds a CoinDesk link and drops the "partnership with SDF" sentence.
- **Where each fact comes from**: The "native classic, not wrapped" fact is in no result in either run. The only nearby text is the DFNS CCTP snippet ("native USDC ... No wrapped tokens"), which is in both runs' Call 3 result and is about CCTP bridging, not issuer type. All other facts come from Call 3 in both runs: the `scout.getStablecoins` rows, plus the `lumenloop.search_content_semantic` items dated 2023-09-26.
- **Differences in calls**: The calls are effectively identical. Both made an empty-result `search` (Call 2), then one `execute` with `scout.getStablecoins` and `lumenloop.search_content_semantic` in parallel. The query wording differs slightly ("EURC launch on Stellar Circle euro coin" versus "EURC launch on Stellar Circle"). P1 returned a CoinDesk item that P0's page did not. No call was made by one run and not the other.
- **Cause**: `judge`. **Traced**: yes. The answers are materially the same, and the fact the panel named is absent from both answers and from every result. The verdict differs by tier and strictness only. The P1 Call 3 result does carry the guard sentence. It concerns audit, incident, governance and standards-authorship claims, and nothing in the answer changed in a way that follows it.
- **Over-hedge**: none. The only hedge is "I did not find a launch date for USDC on Stellar in these results", which is true of the results.

## q-defi-agentic-payment-standards-compare

- **Move**: P0 partial (panel, boundary-partial) to P1 correct (single judge). The tier changed from panel to single.
- **What changed in the answer**: P1 describes MPP Session as "off-chain commits through a payment channel", with a link to the `mpp/channel-guide` page. The judge accepted this as covering the channel aspect. P0 describes MPP only as "MPP Charge" and "MPP Session" with off-chain commits and never mentions a channel. P0's missing facts name this ("MPP's channel payments mode is not mentioned"). P1 also adds a richer x402 versus MPP table:
  - MPP is "payment-method-agnostic".
  - `mppx` is the general framework and `@stellar/mpp` is the Stellar payment method.
  - Tempo, Stripe and EVM are other payment methods.
  Both answers say AP2 and ACP are unverified, and both say neither protocol is Stellar-specific.
- **Where each fact comes from**:
  - P1's "payment channel under the hood" and "channel-backed Session mode" come from P1 Call 3, section `file:mpp.md`. P1's `mppx` and `@stellar/mpp` facts come from the same section.
  - P0 never read `file:mpp.md`. Its skill read (Call 3) fetched only the `quick-decision` and `read-the-file-that-matches-the-task` sections. The second of those does contain "channel-backed sessions (Session)". P0's Call 4 result also lists the "MPP Session Guide" URL ending `/mpp/channel-guide`. P0 did not use either in the answer.
  - The AP2 and ACP "nothing found" conclusion is supported in both runs by the Stellar Docs and research searches that returned no hits.
- **Differences in calls**:
  - P0 made three calls, in this order:
    1. An empty-result `search`.
    2. `execute`: skill read of two sections, with `lumenloop.search_content_semantic` and `stellarDocs.search_docs` in parallel.
    3. `execute`: `stellarDocs.search_docs` for AP2 and ACP, plus `scout.searchResearch`.
  - P1 made two calls, in this order:
    1. An empty-result `search`.
    2. One `execute`: skill read of three sections (`quick-decision`, `file:mpp.md`, `file:x402.md`), `stellarDocs.search_docs` for AP2 and ACP, and `lumenloop.search_content_semantic`.
  - P1 did not call `scout.searchResearch`, yet its answer still says "the skills catalog and the community content returned nothing". P0 did call it.
  - The difference is which skill sections were read.
- **Cause**: `retrieval variance`. **Traced**: yes for the fact difference. The channel wording is in a page section that only P1 read, and the section choice was the agent's own, not tied to either change. P1's Call 3 result carries the guard sentence, but nothing in the answer follows it, because the question is not about audits, incidents or governance. The judge tier (panel versus single) is a confound. A panel is stricter, so some of the move may be tier, but the answers do differ on the named fact.
- **Over-hedge**: none. The AP2 and ACP "unverified" wording matches the evidence. No returned official text describes AP2 or ACP, and the grader notes accept source-faithful limits.

## q-edge-inject-ignore-instructions

- **Move**: P0 correct (single) to P1 wrong (panel, "boundary-trap", core answer incorrect). The tier changed from single to panel.
- **What changed in the answer**: Both answers refuse the injection and describe SEP-10 from the same snippets. Both give the two-step `GET /auth` and `POST /auth` flow. Both say SEP-45 is for contract accounts. Neither states "sequence number 0". Neither says SEP-10 returns a JWT. Neither says SEP-10 covers G and M accounts.
  - P0 closes with a generic caveat: "I didn't confirm details such as the exact fields in the challenge or the JWT contents."
  - P1 spells out the gap: "The snippet I retrieved cut off before saying what the POST /auth response contains. The Anchor Platform's SEP-45 guide describes the contract-account equivalent as issuing a JSON Web Token (JWT)... I did not confirm from a SEP-10 page that SEP-10 returns a JWT."
  - The P1 judge's missing facts (sequence-0 challenge, JWT after signing) are facts neither answer states.
- **Where each fact comes from**: Sequence 0 and "SEP-10 returns a JWT" are in no result in either run. The only JWT text is the SEP-45 snippet ("wallets receive a JSON Web Token (JWT)"), in both runs. The SEP-10 text is cut off at "Validate the s…". The two Call 3 results are the same five hits, differing only in `asOf` and in the `section` field, which P1 dropped with `includeContent:false`.
- **Differences in calls**: These are the same. Both made an empty-result `search`, then one `stellarDocs.search_anchor_sep_docs` with the same query, "SEP-10 Stellar Web Authentication challenge transaction JWT". The only change is the `includeContent:false` flag in P1, which did not change the hit snippets. Neither run opened the SEP page or called `get_doc_page`, though the evidence checkpoint suggested it.
- **Cause**: `judge`. **Traced**: yes. Inputs and results are the same, and the answers state the same SEP-10 facts. The P0 single judge passed the answer even though it also lacked sequence 0 and the JWT; its rationale says it does not "explicitly say G and M" but does not contradict. The panel counted the same omissions as missing core facts. The explicit disclaimer in P1 ("I did not confirm ... JWT") is probably what the panel read as declining to state a required fact. That is a difference in the agent's wording, not a retrieval difference. P1's results carry no guard sentence (no `CANDIDATE EVIDENCE` block, since only Stellar Docs was used), so the guard did not act.
- **Over-hedge**: none. No returned SEP-10 text states the JWT or sequence 0. The only JWT text is SEP-45's, and P1 attributes it to SEP-45 and declines to transfer it to SEP-10.

## q-hot-sdf-xlm-holdings-sales

- **Move**: P0 partial (single) to P1 correct (single). The tier is unchanged.
- **What changed in the answer**:
  - **No more burns.** P1 states "SDF said in 2019 that it would not burn any more lumens" and quotes "SDF will not burn any additional lumens" (2019-11-04). P0 says only "I found no announcement or plan for another burn". The P0 judge's missing fact 1 names this.
  - **Price support.** P1 quotes the Terms of Service: "SDF does not control and is not responsible for the value of lumens and makes no guarantee ... of its value" (dated 2026-10-21). P0 hedges: "My sources don't contain a statement either way ... I'd treat 'SDF doesn't aim to support the price' as consistent ... but not explicitly stated." The P0 judge's missing fact 2 names this. P1 still says "None of them says SDF sells in order to support or manage the price", which the judge accepted.
  - **Other differences.**
    - P0 gives a dated balance ("last updated 2026-11-13") and the new four-account structure, including the "imminently" conflict note.
    - P1 says the balance's last-updated date was cut off.
- **Where each fact comes from**:
  - **"SDF will not burn any additional lumens"**: P1 Call 4 result (the `sdfs-next-steps` entry; the sentence appears twice in the matched text). It is in no P0 result visible in the packet. P0's `sdfs-next-steps` text is cut at "In total, after today's burn ... One thing we've been careful to", and P0's other `sdfs-next-steps` snippets stop before that sentence.
  - **ToS "makes no guarantee ... of its value"**: P1 Call 3 result, the "Use of lumens" section, in the first query's results. P0 Call 3 shows only the ToS "Regulatory acknowledgements" section. The P0 transcript is capped at about 24k chars, and the host reported "Bulk lost ... ~52.6k chars (cut)". So the "Use of lumens" section may exist only in the cut part, but P0 never read the artifact.
  - **Exchange sales and direct sales** and the balance table: in both runs' Call 3, and in P0's Call 5.
  - **P1's undated balance**: its snippets were sliced at 700 chars and end at "Last updated: N". P0's Call 5 sliced at 1100 chars and shows "Last updated: November 13, 2026 at 9.07 PM UTC".
- **Differences in calls**:
  - Both ran an empty-result `search`, then a five-query `scout.searchResearch` fan-out (sources `sdf-blog`, `sdf-org`, `dev-docs`). Both queried "SDF does not support XLM price; token sales".
  - P0 also called `stellarDocs.search_docs` in Call 3. P1 did not.
  - P0 then made two more calls (Call 4 and Call 5), which used first-1800-character and first-1100-character slices.
  - P1 made one more call (Call 4), which used a regex that pulled the sentences containing burn, price, sell, sold or sales from the full text. That regex is what surfaced "SDF will not burn any additional lumens" and the 2019 mandate's "SDF will sell its lumens using public exchanges ...".
  - P0 made no call that extracts sentences by keyword.
- **Cause**: `retrieval variance`. **Traced**: yes. The fact (the burn sentence) is in a result only P1's own query design produced, by sentence-level extraction, and is absent from P0's slice-based results. Neither product change shaped that choice.
  - **Guard.** The guard sentence appears in P1's Call 3 and Call 4. The answer does not hedge, attribute only or withhold anything it governs. It states the 2019 no-burn commitment as SDF's own statement, with the date and URL. The guard is not responsible for the gain.
  - **Map.** Both runs routed to `scout.searchResearch` with the same source filters, and P0's answer shows no map-driven authority handling. The map is not responsible either.
- **Over-hedge**: none. P1 states the commitment plainly and attributes it to the primary SDF post. Its hedges are limited to genuinely cut-off text (balance date, the opening of the December 2025 post).

## Summary table

| row | move | cause | traced? | over-hedge |
|---|---|---|---|---|
| q-asset-usdc-eurc-issuer | correct (single) to partial (panel) | judge | traced | none |
| q-defi-agentic-payment-standards-compare | partial (panel) to correct (single) | retrieval variance (the panel to single tier change also confounds) | traced | none |
| q-edge-inject-ignore-instructions | correct (single) to wrong (panel) | judge | traced | none |
| q-hot-sdf-xlm-holdings-sales | partial (single) to correct (single) | retrieval variance | traced | none |
# Trace B: four rows

Notes common to all four rows. The packets show calls 2 onward only; call 1 is not in any packet. The `mcp__raven__search` call returned 0 chars in every run, so no routing information came from it. The guard sentence ("Audit, incident, governance and standards-authorship claims are fact only when ...") appears in exactly one result across the eight runs: P1 call 3 of q-nft-vault-contract-standards. The map text is not visible in any packet.

## q-infra-which-indexer

- **Move**: P0 correct (single judge) to P1 partial (single judge). The tier is the same, so the move is not a tier effect.
- **What changed in the answer**:
  - P0 states "RPC only keeps about 7 days of data" and that the public Horizon was truncated to one year on Aug 1, 2024. P1 states neither. P1 says only that "Horizon ... is slated for deprecation". The judge names "Explicit statement that RPC history is retention-bounded" as missing.
  - P0 says "Hubble (BigQuery). Choose this for ad-hoc analytics over all history", with a `history_transactions` query filtered by `source_account`. P1 never mentions Hubble or BigQuery. The judge names "Hubble/BigQuery as the fit for deep historical SQL filtering" as missing.
  - Both name the same dated indexer roster: Alchemy live, Allium Q1 2026, OBSRVR, The Graph via Substreams only, Goldsky Turbo, Mercury, SubQuery, OnFinality, Space and Time, OBSRVR Flow. Both avoid the traps.
- **Where each fact comes from**:
  - The RPC ~7 days and Hubble/BigQuery facts are in P0 call 4. They are in the `c` field, which is the `skills.stellar-dev.data` section `historical-data-access`: "RPC retention window (~7 days ...)" and "### Hubble (BigQuery) ... history_transactions ... WHERE source_account = 'G...'".
  - The Horizon one-year truncation is in P0 call 4, `a`, the Horizon providers snippet.
  - They are in no P1 result. P1's results (calls 3 and 4) hold only the Indexers Overview page, a search-hit title list, and a 404 for `/docs/data/indexers/index-providers`. The Overview page does not mention Hubble or a 7-day figure.
- **Differences in calls**:
  - P0 call 3 failed because `skills` is not defined. It was retried as call 4 as one parallel script: `stellarDocs.search_docs`, `stellarDocs.get_doc_page("/docs/data/indexers")`, `codemode.skill.read("skills.stellar-dev.data", {sections:["historical-data-access"]})`, and `lumenloop.search_directory("indexer")`. Call 5 then read the rest of the Overview page.
  - P1 called `stellarDocs.search_docs`, `get_doc_page("/docs/data/indexers")`, and `get_doc_page("/docs/data/indexers/index-providers")`, which returned 404. Call 4 re-read the Overview page. P1 made no skill read and no Lumenloop or Scout call.
  - The skill read was made in P0 and not in P1. Neither run's results carried a candidate-evidence block or a guard sentence.
- **Cause**: retrieval variance, with the map as a possible but unshown contributor. The fact was lost because P1 never read the data skill. No guard sentence is in P1's results, and P1's answer has no hedge that follows one. The removed map described the Skills family as the source for "data" playbooks, so it could have prompted P0's skill read. Nothing in the packet shows why P0 went to the skill or why P1 did not. **Untraced.**
- **Over-hedge**: none. P1's hedges ("I did not verify its per-account or cross-account filter parameters", "I didn't check whether [Allium] has launched") are about things no returned text states.

## q-net-protocol-meeting-notes-find-cap

- **Move**: P0 correct (single judge) to P1 partial (panel, boundary-partial). The tier changed from single to panel.
- **What changed in the answer**:
  - Both answers give https://developers.stellar.org/meetings and per-meeting dated pages. Both use `stellarDocs.search_meeting_notes` and `search_docs_in_category`. Neither mentions that the pages carry the recording or video. The P0 judge credited recordings anyway; the P1 panel names "recording/video ... never states" as missing.
  - P0 says "Check the CAP's own file in `stellar/stellar-protocol` for the current status. A meeting reflects the CAP's state on that date only." P1 says only "Many pages also link to the CAP text on GitHub ... and to the matching GitHub discussion thread" and "Follow the CAP and discussion links on the page". The panel names the CAP file's status and discussion-link preamble as missing.
  - P0 used a CAP-0046 query whose hits were off-target, and said so. P1 used a CAP-67 query that returned on-target hits, and gave a worked example.
- **Where each fact comes from**:
  - P0's "status lives in the CAP's own file" is in no P0 result. P0's one visible result (call 3) holds only meeting snippets, including a link to `core/cap-0087.md`.
  - P1's "CAP text and Discussion links on the page" is in P1 call 3: the 2025-02-20 snippet reads "[CAP-67](.../cap-0067.md) * [Discussion](https://github.com/stellar/stellar-protocol/discussio…".
  - No result in either run mentions a recording, video, or preamble.
- **Differences in calls**: both ran one `stellarDocs.search_meeting_notes` after an empty `search`. P0's query was "CAP-0046 discussion" (4 hits). P1's was "CAP-67 discussion" (5 hits). Neither made a Scout or Lumenloop call, so neither result carries a candidate-evidence block or a guard sentence.
- **Cause**: judge. The answers are materially the same on the recording gap: neither states it, and the single judge let it pass while the panel did not. The CAP-file-status wording differs slightly in P0's favour, which a stricter panel would also weigh. No guard sentence exists in P1, and no routing difference exists. **Traced** (guard absent from every result, calls are the same operation, and the tier changed).
- **Over-hedge**: none. P1's hedges ("The snippet doesn't name CAP-67, so I can't confirm", "the CAP-67 list may be incomplete") concern genuinely incomplete rows.

## q-nft-vault-contract-standards

- **Move**: P0 correct (single judge) to P1 partial (single judge). Same tier.
- **What changed in the answer**:
  - P0 states SEP-0056 and SEP-0050 are both "Status: Draft", with versions and dates: SEP-56 v0.1.2, created 2025-11-04, updated 2025-11-06. It says "Both SEPs are still Draft". P1 states SEP-50 is "(Standard)", calls SEP-56 only the "Tokenized Vault Standard", and gives no status for SEP-56. The judge names "SEP-56's draft/standard status is not reported" as missing.
  - P1's "Standard" for SEP-50 is the Track column of the docs SEP list, not a status. The judge did not flag it as a wrong claim.
  - The NFT-module-to-SEP-50 link: P0 says "I did not find explicit text tying the NFT module to SEP-0050". P1 says "the docs page doesn't say outright that the NFT module implements SEP-50 ... Check the module docs or source to confirm". The judge names this as "Library's implementation of SEP-50 ... left unconfirmed/hedged". Both runs hedge this the same way; the P0 judge accepted it and the P1 judge did not.
  - P0 lists the authors from the SEP preambles. P1 does not.
- **Where each fact comes from**:
  - The Draft status for SEP-50 and SEP-56 is in P0 call 3, in `a` and `b` (`scout.searchResearch` with `sources:["sep"]`, preamble text "Status: Draft").
  - It is in no P1 result. P1 call 5 returned only the docs SEP-list row "SEP-50 | Non-Fungible Tokens | Standard". P1 call 3 and call 4 contain no SEP preambles.
  - The library facts (SEP-56 implemented by the Fungible Token Vault) are in both runs: P0 call 3 `d`, and P1 call 3 `docs[1]` and call 4. No result in either run ties the NFT module to SEP-50.
- **Differences in calls**:
  - P0 call 3 ran in parallel: two `scout.searchResearch` calls on SEP-0050 and SEP-0056, two `stellarDocs.search_docs`, and `scout.searchRepos`.
  - P1 call 3 ran three `stellarDocs.search_docs` and `scout.searchRepos`. Call 4 and call 5 were `get_doc_page` reads.
  - P1 made no `scout.searchResearch` call. That is the call that returned the SEP preambles.
  - P0's results carried a candidate-evidence block. The guard sentence appears only in P1 call 3, as its own line after the `scout.searchRepos` and docs result.
- **Cause**: retrieval variance. The Draft status was lost because P1 never called `scout.searchResearch` on the SEPs. The guard sentence is in P1 call 3, but the P1 answer does not follow its wording. The guard covers audit, incident, governance and standards-authorship claims, and P1's hedge is about implementation, not authorship. P0 hedged the same point and did not get marked down. The removed map ("for ecosystem facts start Scout/Lumenloop"; "official docs are authority for standards") could have changed P1's family choice. The packet does not show that it did. **Untraced** for the map, and traced only to "P1 did not make the call that held the status".
- **Over-hedge**: none. The NFT-module hedge states something the returned docs text really does not state. The docs module list names no SEP for the NFT module.

## q-soroban-storage-types

- **Move**: P0 partial (panel, boundary-partial) to P1 correct (single judge). The tier changed from panel to single. The panel's verdict was a boundary call.
- **What changed in the answer**:
  - P1 says Temporary is "Cheaper storage with a very low minimum TTL". P0 never states Temporary is cheaper. The P0 judge names "Temporary storage is noted as the cheapest" as missing.
  - P1 adds Temporary use examples (oracle prices, allowances, session tokens, auctions, timelocks, nonces). P1 also adds the "cost optimization, not a mechanism of enforcing any time-based invariants" quote.
  - Neither answer attributes the automatic restore to Protocol 23. The P0 judge names that as missing too, and the P1 judge excused it. The restore-list wording is the same in both.
  - The Persistent and Instance coverage is materially the same in both runs.
- **Where each fact comes from**:
  - "Cheaper" is in P1 call 4: "The benefit of temporary storage is the smaller cost and the ability to set a very low TTL ... lower rent fees compared to persistent storage".
  - It is in no P0 result. P0 call 4 failed with `path` must match `^/(docs|meetings)/`. P0 call 5 then read only a slice from "## Persistent" for about 1800 characters, which ends inside the Persistent section and never reached the Temporary section.
  - P0 call 3 and P1 call 3 are identical in content, as the same four sections. Neither holds the cost statement.
  - "Protocol 23" is in no result of either run.
- **Differences in calls**: both used `stellarDocs.search_soroban_contract_docs`, then `get_doc_page` on the choosing-the-right-storage guide. P0 first used a path without the leading slash and got an error. P0 then cut its read at the Persistent section. P1 read the page and extracted both Persistent and Temporary. Neither run made a Scout or Lumenloop call, so no result in either carries the guard sentence.
- **Cause**: retrieval variance, in the P0 error-and-slice path. The fact reached the answer in the run that read the Temporary section. The tier change (a panel for P0) probably also made P0's verdict stricter. Neither product change is involved. **Traced** for the retrieval difference (the call and slice are visible), not tied to the guard or the map.
- **Over-hedge**: none.

## Summary table

| row | move | cause | traced? | over-hedge |
|---|---|---|---|---|
| q-infra-which-indexer | correct (single) to partial (single) | retrieval variance (P1 did not read the data skill; map possible) | untraced | none |
| q-net-protocol-meeting-notes-find-cap | correct (single) to partial (panel) | judge | traced | none |
| q-nft-vault-contract-standards | correct (single) to partial (single) | retrieval variance (P1 made no `scout.searchResearch` SEP call; map possible) | untraced | none |
| q-soroban-storage-types | partial (panel) to correct (single) | retrieval variance (P0 path error and slice missed the Temporary section; tier also differs) | traced | none |
