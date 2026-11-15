# Trace A: five rows whose verdict did not change between P0 and P1

Note on the packets: every `mcp__raven__search` call (Call 2 in each run) shows 0 chars of result in all five packets, so neither run's agent saw anything from `search` as far as the packets show. Only `execute` results carry evidence. "P1" below means the later run ("P1 pass 1"). "Guard" means the sentence beginning "Audit, incident, governance and standards-authorship claims are fact only when ...". It appears in P1 results only. No P0 result carries it.

## q-crp-oz-rwa-erc3643-trex

- **Move**: partial (single judge) to partial (single judge). The tier is the same. Core answer is "correct" on both sides. The missing facts are nearly identical. P0 lists "could not find any SEP number". P1 lists "SEP-57 is a Draft proposal, not a final/native standard". Both lists also name the normative core versus appendix split and the "no legal compliance" fact.
- **What changed in the answer** (later answer is a little better):
  - P0: "The docs I read don't name a SEP number for it." P1 names it: the Stellar docs compare three models, including "[SEP-57] T-REX Tokens for Regulated EXchanges", listed as ERC-3643 (T-REX).
  - P1 adds the OpenZeppelin July 2026 partnership item ("Stellar-native implementation ... already complete"), attributed as "OpenZeppelin's own statement".
  - P1 adds the classic-asset flags and clawback alternative.
  - P0 instead had the ONCHAINID V3 item (2026-09-29, hedged as unchecked) and a "Tradeoffs the docs state" list (cost, wallet support, indexers).
  - Neither answer says SEP-57 is a Draft. Neither mentions the normative core versus appendix split, or that contracts create no legal compliance. The judge names all of these as missing in both runs.
  - P1's section is headed "**Standard**" and calls T-REX "a permissioned token standard", which is the docs' wording. It never says final or native, and the judge flagged no avoid match.
- **Where each fact comes from**:
  - SEP-57 naming: P1 Call 5 result, field `b`. The head of the `anatomy-of-an-asset` page reads "[SEP-57][sep-57] T-REX Tokens for Regulated EXchanges". It is in no P0 result. P0's Call 5 regex started at "T-REX tokens are issued", so the heading line fell outside its window. P0's Call 3 query "SEP-57 T-REX" returned no SEP-57 snippet.
  - The "Draft" status, the normative-core split and the "no legal compliance" point are in no result in either run.
  - The OZ "already complete" statement is in P1 Call 3 result, `d` (openzeppelin.com news item, 2026-07-07).
  - The ONCHAINID item is in P0 Call 3 result, `sem`.
  - The identity-registry feature list is in both runs' Call 5 results, `a`.
- **Differences in calls**:
  - P0: `search` (empty), then `execute` with 4 `stellarDocs.search_docs` + `scout.searchRepos` + `lumenloop.search_content_semantic`.
  - P0 then made a `get_doc_page` call with a bad path (Call 4, error) and a retry with a leading `/` (Call 5). Its regex excerpts were anchored on "RWA (ERC-3643)" and "T-REX tokens are issued".
  - P1: the same pattern, with 2 `search_docs` + 2 `scout.searchRepos` + 1 `lumenloop.search_content_semantic`. It hit the same bad-path error (Call 4) and retried with `/` (Call 5).
  - P1's excerpt window started at the first "T-REX" (index minus 200 or 300 characters). That window is what captured the SEP-57 line.
  - Neither called `scout.searchResearch` or `stellarDocs.search_meeting_notes`. Neither fetched the SEP-57 file or the stellar-contracts RWA code.
- **Cause**: `retrieval variance`, **traced**. The SEP-57 fact is in a P1 result and missing from P0's results because of where each agent's extraction window began. Neither product change is tied to it. The guard text appears in P1's Call 3 result, and P1's "That is OpenZeppelin's own statement" follows its wording. That attribution is on a side fact, not on the SEP-57 gain or on any fact the judge names. The map removal is not implicated: both runs started from stellarDocs, and neither used a Scout or Lumenloop family choice that the map addressed.
- **Over-hedge**: none. The returned docs plainly state "Integration with identity registries for KYC/AML compliance", and P1 states that plainly. P1's hedges ("results I retrieved don't confirm the exact contract or function names"; "haven't confirmed whether the library ships its own identity-registry or ONCHAINID contract") cover things no returned text states. The OZ "already complete" claim is attributed to OpenZeppelin, a party speaking about itself. That is not an official-docs claim hedged away.

## q-edge-factcheck-soroswap-first-amm

- **Move**: wrong (panel, boundary-trap) to wrong (panel, boundary-trap). The tier is the same. Core answer is "incorrect" on both sides. The missing fact is the same in all three judge lines on both sides: the CAP-0038 / Protocol 18 / 2021-11-03 native AMM predates Soroswap.
- **What changed in the answer** (essentially the same, with P1 slightly weaker on the missed fact):
  - Both: TVL claim false at $1,133,363 (DefiLlama, 2026-11-12). Both say "first AMM" is "only partly supported" and rest it on Soroswap/Scout directory wording. Both say they did not check whether Stellar's native liquidity pools came earlier.
  - P0: "I'd treat 'Stellar's first AMM' as unverified, and probably wrong if classic pools count." P1: "I did not check when Stellar's built-in liquidity pools launched, so I can't rule out earlier AMMs outside Soroban." P1 also says "Stellar already had a native DEX (SDEX)", which is the order book and not an AMM. P0 leans closer to the golden verdict.
  - P0 adds the SCF total ($346,750, rounds 15, 17, 21), aggregator venues, and a Medium "first DEX on the Soroban Blockchain" attribution.
  - P1 adds the Q1 2024 Liquidity Award ($50,000 requested), the SODAX/Robinhood item ("SODAX's own claim, not independently verified"), and a "last updated 2026-11-12, checked 2026-11-15" date line.
- **Where each fact comes from**:
  - CAP-0038 / Protocol 18 / 2021-11-03: in no result in either run. Neither run called a Stellar Docs operation.
  - $1.13M TVL and the other AMM TVLs: P0 Call 3 `p` and `amm`; P1 Call 4 `proj` and `amms`.
  - "first DEX ... on Stellar Soroban": `desc` in both runs.
  - Medium "first DEX on the Soroban Blockchain": P0 Call 3, `content.a`.
  - SODAX and the liquidity award: P1 Call 4, `c` and `r`.
- **Differences in calls**:
  - P0 (`execute`): `scout.searchProjects` x2, `lumenloop.search_directory`, `lumenloop.find_content_about_project`.
  - P1 (`execute`): `scout.searchProjects` x2, `scout.searchResearch`, `lumenloop.search_content_semantic`.
  - P1 made one extra `search` (query "first AMM on Stellar DEX liquidity pools history"), and it returned 0 chars.
  - Neither run called `stellarDocs.search_docs` or `get_doc_page`. Neither run's evidence checkpoint nudge led it to a docs call. P1's checkpoint listed `stellarDocs.search_docs` as an uncalled recovery candidate, and P1 did not take it.
- **Cause**: `retrieval variance`, **untraced**. The key fact is missing from both runs because neither agent consulted Stellar Docs. The packets give no reason tied to either change. The map removal could be suspected, since the map pointed at docs as the authority for protocol claims. But P0 had the map and also skipped docs, so the packets do not show the map making a difference. The guard sentence is in P1's Call 4 result. P1's "SODAX's own claim, not independently verified" and "That is a directory claim" follow its wording. Those hedges are on side facts and on a "first" claim that P0 already attributed as Soroswap-adjacent. They move nothing the judge scores.
- **Over-hedge**: none. No returned text states the native-AMM fact, so there is nothing plain to over-hedge. P1's "I can't rule out earlier AMMs" is an honest gap, not a hedge on a stated claim.

## q-n3-issues-842-backup-faucet-wallet

- **Move**: correct (single) to correct (single). The tier is the same. No missing facts, wrong claims or avoid matches in either run.
- **What changed in the answer** (later answer is better grounded and more useful):
  - Both refuse the address, say they could not open issue 842, flag the scam pattern, and redirect.
  - P0: "My tools can't read GitHub issues." It says "Friendbot also only funds testnet and futurenet accounts with free test XLM" and sends the user to the Discord and status page.
  - P1 adds that it searched docs and the community index and neither returned issue 842. It adds "Friendbot only funds classic G... accounts". It says "I can't rule out that the issue exists, but I haven't seen it". It tells the user to open the issue and "verify any address through an official channel before sharing it". It adds Quickstart's local Friendbot at `:8000/friendbot`, and that `stellar keys generate --fund` uses Friendbot so it will fail while Friendbot is down.
  - P1 also says Friendbot "isn't a mainnet service". No snippet states this directly. The Faucet snippet says Friendbot is used on the public testnet and futurenet.
- **Where each fact comes from**:
  - P0's testnet/futurenet and Discord/status-page statements are in no P0 result. Call 2 returned only titles and URLs and nothing about Friendbot.
  - P1's G... only claim is in Call 3 result, `b` (Passkeys Prerequisites). The local `:8000/friendbot` claim is in `b` (Faucet). The `--fund` uses Friendbot claim is in `b` (Deploy to Testnet). The "neither returned issue 842" claim matches the absence of such a hit in `a`, `b` and `c`.
- **Differences in calls**:
  - P0: one `stellarDocs.search_docs` (titles and URLs only).
  - P1: `stellarDocs.search_docs` x2 with snippets, plus `lumenloop.search_content_semantic`. All are in one `execute`.
  - P1 made no call to a doc page. Neither run called `scout.searchResearch`.
- **Cause**: `retrieval variance`, **untraced**. P1 simply searched wider and kept snippets. The guard sentence appears in P1's Call 3 result. The answer's wording does not follow it. The refusal and redirect come from the question's own trap, not from the guard. The map removal changes nothing visible here, since neither run made a family-routing choice the map addressed. There is no verdict movement for the cause to explain.
- **Over-hedge**: none. No returned text states a backup wallet or anything about issue 842.

## q-pc-quantum-preparedness-dormant

- **Move**: correct (single) to correct (single). The tier is the same. No missing facts, wrong claims or avoid matches in either run.
- **What changed in the answer** (later answer is richer and slightly less hedged):
  - Both: Stellar is not quantum-resistant (Ed25519, Shor's algorithm, "Nobody knows when that day comes"). Both give the QPP announced 2026-06-09 with the three stages (Soroban ML-DSA 2026, classic quantum-safe signers 2027, Ed25519 deprecation). Both say no dormant-account definition was found, and both decline to guess.
  - P0: "I did not check whether CAP-87 has been approved or shipped." It says it saw "only Lumenloop's summary" of the QPP post, and its list of sources includes a Decrypt article.
  - P1 states Stage 1 as CAP-87, presented 2026-09-17, with host functions `verify_sig_ml_dsa_44`, `verify_sig_ml_dsa_65` and a third whose name was cut off. It adds ML-DSA versus SLH-DSA and Falcon, the passkey-account note, and the CAP and discussion links. It says nothing on approval or Mainnet status.
  - P1 attributes the QPP stages to "SDF's announcement" and lists the stellar.org post as its source, although it saw only the Lumenloop summary of that post. It does say "as summarized from SDF's announcement". P0 was more explicit that the post itself was unseen.
  - Neither run states that CAP-87 is not yet on Mainnet. Both are silent on that dated status.
- **Where each fact comes from**:
  - CAP-87 host functions and the ML-DSA rationale are in P1 Call 5 result, the full meeting page read. The passkey note is in P1 Call 4 result, `b`, and the same meeting page.
  - The QPP stages are in P0 Call 4 result, `l`, and P1 Call 4 result, `c`. Both are the Lumenloop summary.
  - The Shor and "Nobody knows" lines are in both runs' search hits and in the meeting page.
  - The dormant-account negative: no returned text defines it, in either run.
- **Differences in calls**:
  - P0: 4 `stellarDocs.search_docs` + `lumenloop.search_content_semantic`, then `search_meeting_notes` + `lumenloop.search_content_semantic`. It never read a full page.
  - P1: the same broad search, then `get_doc_page` (bad path, error) + `search_meeting_notes` + `lumenloop`. It then retried the page read with a leading `/` (Call 5) and got the full meeting page.
- **Cause**: `retrieval variance`, **untraced**. P1 read the page and P0 did not. Nothing in the packets ties that to either change. The guard appears in P1's Call 3 and Call 4 results. P1's "as summarized from SDF's announcement" is a weak echo of it. It does not hedge or withhold anything the golden needs, and the dormant negative was stated the same way in P0 without the guard.
- **Over-hedge**: none. No returned text defines a dormant account, so the negative is correct. No official text states CAP-87's approval or Mainnet status, so silence there is a gap and not an over-hedge.

## q-raph-official-help-sdf-cannot-recover

- **Move**: partial (single) to partial (panel, boundary-partial). The tier changed from single to panel. Core answer is "correct" on both sides. P0 lost two facts. One is the SDF-cannot-access/freeze/return-funds fact, which it treated as unverified. The other is the Discord and Stack Exchange channel names. P1 lost only the channel names. The later run is better in content, and a panel might be stricter, so the unchanged verdict is not a drop in quality.
- **What changed in the answer**:
  - P0 opens with "I also found nothing that says whether SDF can recover funds or fix accounts". It closes with "I found no evidence that SDF can reverse transactions or restore keys".
  - P1 opens with "SDF can't recover your funds or fix your account". It adds "never asks for private keys". It adds reporting to abuse@stellar.org and law enforcement, wallet/exchange/anchor support, and SEP-30. It also adds CAP-77 Quorum Freeze, scoped as "not a service SDF offers to individuals", with "I didn't confirm whether it has been activated".
  - P0 adds the 2020 phishing disclosure and the SDP troubleshooting path.
  - Neither names Discord, Stack Exchange or another official channel.
  - P1 says the guide "lists SDF's official social accounts" without naming any.
- **Where each fact comes from**:
  - P1's "cannot freeze accounts", "never asks for private keys", the scam types, and abuse@stellar.org: P1 Call 3 result. This is the Lumenloop summary of the 2022 stellar.org security guide, 2nd query. No P0 result contains that item. P0's Lumenloop results show the 2020 phishing statement but not the 2022 guide.
  - CAP-77: P1 Call 3 result, 3rd query (Lumenloop summary).
  - SEP-30: both runs' docs hits. P0's 2020 phishing item: P0 Call 3 result, `c`. P0's SDP path: P0 Call 3, "Troubleshooting".
  - Discord and Stack Exchange: in no result in either run. P0 queried for them in its 4th query and got none.
- **Differences in calls**:
  - P0: `execute` with 4 `stellarDocs.search_docs` + 1 `lumenloop.search_content_semantic`. The Lumenloop query was "SDF cannot recover lost funds or accounts support".
  - P1: `execute` with 4 `stellarDocs.search_docs`, then a second `execute` with 3 `lumenloop.search_content_semantic` queries. One of them was "where to get official Stellar support, beware of support scams", which surfaced the security guide.
  - P1 never read a full page.
- **Cause**: `retrieval variance`, **traced**. The gain is the security-guide summary, present in a P1 result and absent from P0's. It came from a different Lumenloop query wording ("beware of support scams" and "no one can freeze or recover accounts"). The guard appears in P1's Call 3 result, and the answer's wording follows it: "This is SDF's statement about itself, and I only saw a summary of the guide, not the full text". That sentence adds an attribution. It does not remove the claim. The headline "SDF can't recover your funds" is stated plainly and the judge credited it. So the guard shaped the phrasing here and did not cause the fact gain or loss. The tier change (single to panel) is a separate factor that could have moved a borderline verdict, and the verdict did not move.
- **Over-hedge**: none. The only returned texts for the can't-recover fact are Lumenloop summaries of an SDF guide, which is community-aggregated and not the guide's own text. The guard-following attribution is therefore warranted. The headline stays unhedged. P1's note that it "didn't confirm" CAP-77 activation covers something no returned text states.

## Summary table

| row | move | cause | traced? | over-hedge |
|---|---|---|---|---|
| q-crp-oz-rwa-erc3643-trex | partial (single) to partial (single); P1 names SEP-57, neither says Draft | retrieval variance (extraction window; P0 regex began after the SEP-57 line) | traced | none |
| q-edge-factcheck-soroswap-first-amm | wrong (panel) to wrong (panel); CAP-0038 missing in both, P1 slightly weaker ("can't rule out") | retrieval variance (neither called Stellar Docs) | untraced | none |
| q-n3-issues-842-backup-faucet-wallet | correct (single) to correct (single); P1 better grounded and more useful | retrieval variance (wider search with snippets) | untraced | none |
| q-pc-quantum-preparedness-dormant | correct (single) to correct (single); P1 adds CAP-87 detail from a full page read, no Mainnet status in either | retrieval variance (P1 read the meeting page) | untraced | none |
| q-raph-official-help-sdf-cannot-recover | partial (single) to partial (panel); P1 gains "SDF cannot freeze / never asks for keys" and keeps it unhedged, still no channels | retrieval variance (query wording found the 2022 security guide); the guard shaped attribution wording only | traced | none |
# Trace B: five rows whose verdict did not change

Guard sentence = "Audit, incident, governance and standards-authorship claims are fact only when Stellar Docs, a skill or a primary record a result returned ... states them. Anything else ... is that source's claim: name the source and date, and do not state it as fact."

Guard presence in the later run (P1): sep-43 yes (calls 4, 5); smart-account yes (calls 3, 4); soroban-vuln-classes yes (call 3); soroban-cli-bindings NO (only stellarDocs calls, no candidate block); zk-host-functions NO (only skill and stellarDocs calls, no candidate block).

## q-sep-43-web-wallet-api

- **Move**: correct (single) to correct (single). No tier change. No missing facts, no wrong claims on either side.
- **What changed in the answer** (none of it is named by the judge):
  - P0 states "Version: 1.2.1" and the Discussion URL (stellar-protocol discussions/1467); P1 states neither. P1 lists only Status: Draft, Created, Authors.
  - P0 says the `getNetwork()` return type could not be read ("cut off before its return type"); P1 gives `getNetwork()` returns `{ network, networkPassphrase }`.
  - P0 adds the x402 guide remark ("createEd25519Signer implements SignAuthEntry and SignTransaction per SEP-43"); P1 does not.
  - P1 adds SEP-60 ("announced provider MUST implement the SEP-43 interface and does not change SEP-43") and the first error code "-1: internal wallet error" with an admission that the code list was cut off. P0 gives neither.
  - P1 adds a dating caveat on status: "Status: Draft. This is as of the text I retrieved on 2026-11-15, and I didn't check it against the live file."
- **Where each fact comes from**:
  - Version 1.2.1 and the Discussion URL: P0 call 5 result (the Preamble chunk, full). In no P1 result: P1 call 4 returned the Preamble through "Created: 2024-04-11\nV" and cut off (regex window), and P1 never made a separate preamble call like P0 call 5.
  - getNetwork return type and error code -1: P1 call 5 result (1800-char slice). P0 call 6 sliced at 1500 chars and cut off inside `getNetwork`.
  - x402: P0 call 4 result (stellarDocs hit, field `c`). P1's equivalent call filtered it out.
  - SEP-60: P1 call 4 result (scout row "Wallet Provider Discovery", Dependencies). P0 never saw it (its call 4 sliced scout output to 1800 chars).
- **Differences in calls**: P0 ran search, then four executes: a docs and skill read, a three-family sweep, a scout preamble fetch, and a scout Specification fetch. P1 ran search, then three executes: a docs and skill read, a four-way sweep that included `stellarDocs.search_meeting_notes` (which P0 did not call), and a scout Specification fetch. P1 had no dedicated preamble call. Neither run read the page with `get_doc_page`.
- **Cause**: retrieval variance, traced. The difference in the facts (version and discussion link lost; getNetwork type and SEP-60 gained) follows slice and regex windows and the query set, not the guard or the map. The guard text is present in P1 calls 4 and 5, but the answer's source line ("matched the document by its identifier, and the Specification section came back only in part") follows the Exception clause, which is identical in P0's results. Not a guard effect.
- **Over-hedge**: none. The nearest case is the dating caveat quoted above. The claim "Draft" is stated plainly and is in the returned Preamble text (P1 call 4), so nothing is withheld.

## q-smart-account-scoped-policy-signers

- **Move**: correct (single) to correct (single). No tier change. No missing facts, no wrong claims on either side.
- **What changed in the answer**:
  - P0 says of time windows: "I found no built-in primitive for it in the docs I read." P1 states the pattern plainly: "Block execution until a stored earliest timestamp, or enforce a cooldown ...", plus the `day = timestamp / 86_400` window key, the allow list that checks subinvocations in `auth_context`, session keys limited to one function plus a maximum amount, and an external `approve(auth_context) -> bool` policy contract.
  - P0 says OpenZeppelin's model is "only partly confirmed" and that it "didn't find ... how its rules are structured". P1 states "authorization runs through context rules, signers, and policies" and, per audit report 86, "rules are evaluated newest-first and fall back to defaults. Policies are all-or-nothing". It also names `add_context_rule` and `add_signer` (report 90), signer_ids and policy_ids (report 89), and `Signer::Delegated`.
  - P1 adds a Passkey Kit section: SignerLimits semantics, `add_secp256r1`, `update_signer`, `remove_signer`, UNIX-second expiry, fail-closed empty map. P0 has none of this.
  - P0 includes the `set_options` and thresholds route for classic accounts and the WebAuthn tutorial `add` function. P1 drops the classic `set_options` contrast, which the golden keyFact 3 mentions. The judge did not penalise this.
  - Both end with an honest "not confirmed" note about OpenZeppelin signatures.
- **Where each fact comes from**:
  - Time rules, allow lists, session keys, external policy: P1 call 4 result, field `p` (the full advanced-patterns page).
  - "context rules, signers, and policies": P1 call 4 result (smart-wallets "Tooling" row).
  - Newest-first, signer_ids, add_signer: P1 call 4 result, scout rows for reports 86, 89 and 90.
  - Passkey Kit: P1 call 4 result (README, migration-v1, deployments-2026-08-19, security-signer-provenance-v2).
  - P0's `set_options` and WebAuthn `add`: P0 call 3 result (search hits).
- **Differences in calls**: both ran search, a four-query sweep plus a scout search, then a final call. P0's call 4 passed `get_doc_page({path:"build/guides/contract-accounts/advanced-patterns"})` and got the error "path must match ^/(docs|meetings)/", so the page was never read. P1's call 4 used "/docs/build/..." and the read succeeded, and it also ran a second scout search with `sources:["audit","repo-docs","dev-docs"]`. P0's second half was a docs search with includeContent that returned only the 700-char heads of its hits.
- **Cause**: retrieval variance, traced. P0's `get_doc_page` path error (call 4) kept the advanced-patterns page and the OpenZeppelin material out of its answer. P1's correct path (call 4) and its repo-docs scout search supplied them. Neither product change is involved. The guard is present in P1 calls 3 and 4. P1 attributes audit-sourced statements to the report ("Per the v0.5.0 audit (report 86)", "That audit notes ..."), which fits the guard but is also permitted as fact, since the audit report is the primary record. It caused no loss.
- **Over-hedge**: none. P1's one caveat, "I didn't retrieve the OpenZeppelin account docs page itself, so exact signatures ... are unverified", is accurate. The docs line it did retrieve ("Smart Account Kit: deploys and drives OpenZeppelin Smart Account contracts, where authorization runs through context rules, signers, and policies") is stated plainly. P0, not P1, is the one that hedged OpenZeppelin ("only partly confirmed") while holding audit text that said the same.

## q-soroban-cli-bindings

- **Move**: partial (panel, boundary-partial) to partial (panel, boundary-partial). No tier change. P0 misses the regenerate-after-change fact (listed twice). P1 misses it too, and additionally misses the placeholder-language fact ("Other languages ... require an external plugin"). No wrong claims.
- **What changed in the answer**:
  - P0: "The CLI lists `python`, `java`, `flutter` and `swift` bindings too. They require external plugins." P1 has no such statement. It says only that Contract Explorer describes TypeScript, JSON, Rust, Python and Java, adds "I only confirmed the TypeScript and Rust subcommands in the manual", and names the lightsail plugin.
  - P0: "For a deployed contract, fetch its Wasm first and then run the command on that file. The cross-contract guide describes this". P1: "you would need its Wasm file locally first. I didn't verify how to fetch that." and "I didn't see a deployed-contract option there."
  - P0 adds the guestbook note on `contract.Client.fromWasmHash`. P1 does not.
  - P1 adds, without a source, that the network and RPC flags are needed for `--contract-id` and `--wasm-hash`.
  - Neither answer states that bindings snapshot the spec and must be regenerated. That fact is in no result in either run.
- **Where each fact comes from**:
  - Placeholder languages "(requires external plugin)": P0 call 4 result (the CLI manual page via `get_doc_page`). In no P1 result: P1's CLI-manual hits stop at the typescript and rust sections.
  - "First fetch the contract's Wasm, then generate Rust bindings": P0 call 2 result (cross-contract snippet). In no P1 result.
  - `fromWasmHash`: P0 call 4 result (guestbook page).
- **Differences in calls**: P0 ran three `stellarDocs.search_docs` queries (call 2), a `get_doc_page` that failed on the path pattern (call 3), then a corrected `get_doc_page` of the full CLI manual page and the guestbook page (call 4). P1 ran only three `stellarDocs.search_sdk_cli_tools_docs` queries with includeContent (call 3), got section hits only, and never read the manual page, so the "python/java/flutter/swift" sections were never returned. P1 never called `get_doc_page`.
- **Cause**: retrieval variance, traced. The lost placeholder fact and the lost fetch-first sentence are absent from P1's results and present in P0's, and the difference is the full-page read and the query set. Not the guard (absent in this row) and not the map (both runs stayed in the stellarDocs family; no family-choice difference).
- **Over-hedge**: partial and mild. The CLI manual P1 retrieved states plainly `stellar contract bindings rust --wasm <WASM>`, with `--wasm` the only option. P1 reports that correctly, but then says "I didn't see a deployed-contract option there ... I didn't verify how to fetch that". That is hedging an inference, not a stated fact, and the judge still credited key fact 2. No returned text states the placeholder fact, so P1's silence on it is not an over-hedge.

## q-soroban-vuln-classes

- **Move**: partial (single) to partial (single). No tier change. The two sets of missing facts are essentially the same (Wasm-upgrade authorization; panics and unbounded work as a DoS class, with item 10 "Resource exhaustio..." cut off). No wrong claims.
- **What changed in the answer**:
  - Both give the same nine playbook classes from `security.md` (identical text, both cut at 6000 chars at "### 10. Resource exhaustio"). P0 lists item 10 as "cut off" inside the numbered list; P1 says it retrieved items 1 to 9 and the start of 10. P0 adds the reentrancy and delegatecall line with "still order state updates deliberately"; P1 says only that the guide rules out delegatecall-style hijacks, reentrancy and auth replay.
  - Audit section. P0: Veridise Soroban Core "Denial of Service During Authorization" (Critical, report 42); Veridise "Metering Happens after Allocation"; OpenZeppelin v0.5.0 medium; OtterSec Governor medium; a list of other report numbers. P1: TTL and archival examples from Halborn Peridot (Critical, report 83), Oak Volta (Minor, TTL threshold underflow, report 84) and Veridise Verseprop (Low, report 72). It also gives the OpenZeppelin v0.5.0 medium finding and the Veridise DoS, which it classes as "in the host itself, not in an application contract".
  - P1 explicitly states: "These are examples, not a representative sample. The findings below are from the search snippets, not full reports."
  - The judge names none of these differences. P1's host-level reading of the DoS finding is what its judge cites as keeping key fact 4 missing, but P0's judge also marks key fact 4 missing.
- **Where each fact comes from**:
  - Peridot, Volta TTL underflow, Verseprop TTL: P1 call 3 result, field `a2` (a second scout query worded "...vulnerability classes authorization TTL storage", with no `sources` filter). In no P0 result: P0 ran one scout query with `sources:["audit","security-program"]`, which returned the Volta intro only, not the TTL finding.
  - OtterSec, Veridise metering rows: present in both runs' scout rows (P0 call 3, P1 call 3 `a1`).
- **Differences in calls**: P0 ran one execute: skill read plus one scout search plus one docs search. P1 ran one execute: skill read plus two scout searches plus one docs search. No call in one run is missing from the other apart from P1's second scout query.
- **Cause**: retrieval variance (query wording), traced: the TTL audit examples exist only where the second scout query was run. The guard sentence is present in P1 call 3. P1's wording names the auditor and calls the rows snippets, which matches the guard, but P0 already said "excerpts only" without any guard, and both attribute findings to the named audit reports, which are primary records the guard permits as fact. Nothing was lost or withheld because of the guard. Map removal: no routing difference. Both used skills plus scout plus docs.
- **Over-hedge**: none. P1 names the auditors and states the severities plainly. Its hedges ("I did not read the full text of these reports, so I can't say how often each class occurs") match P0's and concern frequency, which no returned text states.

## q-zk-host-functions-status

- **Move**: correct (panel, boundary-partial) to correct (single). The tier changed, panel to single. P0's only missing fact: "does not explicitly state that no native Goldilocks or NTT host functions exist (only implies FRI must be done in contract code)". P1 has none.
- **What changed in the answer**:
  - Both give the same four-row table (CAP-0059 P22, CAP-0074 P25, CAP-0075 P25, CAP-0080 P26), with Poseidon labelled "permutation primitives, not complete hash functions", and the same Groth16, RISC Zero and UltraHonk (non-ZK, Protocol 28+, PR #38) content.
  - Gap wording. P0: "There is no native STARK verifier host function ... Anything else a STARK verifier hashes with, such as Merkle trees or FRI, would have to be built in contract code. I didn't find any other STARK-oriented hash host function in the sources." P1: "No STARK-specific host function appears in anything I found ... The docs mention no host function for STARK verification, such as FRI or small-field arithmetic." P1 also says "Any STARK-native hash or field arithmetic would have to run as ordinary contract code", and ends with "I did not find a CAP proposing STARK primitives. Absence in these searches doesn't prove none exists".
  - P0 only: five public-input field elements for the RISC Zero Groth16 wrap, the "attestation pattern" fallback, the trusted-setup note, CAP-87 and the meeting dates (2025-10-02, 2025-10-09, 2026-09-17), and "The docs gave only partial confirmation".
  - P1 only: function names `bn254_g1_add`, `bn254_g1_mul`, `bn254_multi_pairing_check`, `poseidon_permutation`, `poseidon2_permutation`, the `soroban-poseidon` library, the EIP-196/197 mirror, and the docs line that the primitives "do not, on their own, provide end-to-end private payments".
  - Both are explicit that FRI-style work is not native. Neither says "Goldilocks" or "NTT" (the golden's wording), and neither is wrong.
- **Where each fact comes from**:
  - Function names, EIP-196/197, "no end-to-end private payments": P1 call 3 `d` (docs hits) and call 5 result (privacy page lines). In no P0 result.
  - Five field elements and the attestation pattern: P0 call 4 `b` (RISC Zero skill section). In no P1 result.
  - CAP-87 and the meeting dates: P0 call 4 `a` (meeting hits). P1 call 6 returned the CAP-87 meeting URL, but the filtered content was empty, so P1 had nothing to say.
- **Differences in calls**: P0 ran skill read, then docs search with includeMeetings plus the RISC Zero skill section. P1 ran the skill read plus a docs search, a `get_doc_page` of "build/apps/privacy" that failed on the path pattern (not retried), a docs search with includeContent that filtered lines, and a meeting-notes search that returned only empty filtered content. P1's "meeting-note searches" show no STARK function claim is therefore a thin basis, but it is worded as "in anything I found".
- **Cause**: judge, traced to the verdict header (panel with a boundary-partial note on P0, single on P1). The two answers state the same STARK gap in materially the same way, and P1's wording is only slightly more explicit (it names "FRI or small-field arithmetic" as unsupported). The guard and its "Candidate evidence" block are absent in both runs of this row, so the guard cannot be a cause. The map removal produced no routing difference (both used the skill plus stellarDocs).
- **Over-hedge**: none. P1's absence disclaimers ("I did not find a CAP proposing STARK primitives ... I didn't check the CAP repository directly") do not hedge a plainly stated returned fact, because no returned text states that no Goldilocks, NTT or FRI host function exists.

## Summary table

| row | move | cause | traced? | over-hedge |
|---|---|---|---|---|
| q-sep-43-web-wallet-api | correct (single) to correct (single) | retrieval variance (slice window lost Version 1.2.1 and Discussion link; getNetwork type and SEP-60 gained); guard present but the wording only repeats the Exception clause already in P0's results | traced | none (a freshness caveat on a plainly stated "Draft") |
| q-smart-account-scoped-policy-signers | correct (single) to correct (single) | retrieval variance (P0's get_doc_page path error kept the advanced-patterns page unread; P1's read succeeded and a second scout search added OpenZeppelin and Passkey Kit material); guard present, attribution fits it, no loss | traced | none |
| q-soroban-cli-bindings | partial (panel) to partial (panel); P1 misses one more fact (placeholder languages) | retrieval variance (P0 read the full CLI manual page and cross-contract snippet; P1 only ran search_sdk_cli_tools_docs and never read the page); no guard in this row | traced | mild: hedges the fetch-Wasm-first inference ("I didn't verify how to fetch that"); the Rust-only-`--wasm` fact is stated |
| q-soroban-vuln-classes | partial (single) to partial (single); same missing facts | retrieval variance (a second scout query gave P1 the TTL audit examples); guard present, answer names auditors and snippets but P0 did the same | traced | none |
| q-zk-host-functions-status | correct (panel, boundary-partial) to correct (single) | judge (tier change; answers materially the same, P1 slightly more explicit about FRI and small-field arithmetic); no guard in this row | traced (tier in the verdict header, answers equivalent) | none |
