=== group 1
# R trace, rows batch 1

Call numbers are the packet's own Call n (Call 1 is the question turn; Calls 2-3 are empty `search` results).

## q-comp-aml-analytics-vendors

Reference (P2, verdict correct / single): P2 Call 4 already ran `scout.searchResearch({q:"SEP-12 KYC API purpose",source:"sep",limit:3})` itself, so P2's own result carried the "Exception: ... returned the document the query names by identifier (`sep-0012`, ...)" sentence. That sentence is therefore not unique to R; it appears wherever the agent itself researches SEP-12. P2 then made one more execute (Call 5, `get_doc_page /docs/tokens/asset-issuance-stack`, ok). P2 used lumenloop (Elliptic 2020 and AnChain.AI 2023 press items) and named Chainalysis, Elliptic, Merkle Science, Scorechain, AnChain.AI. Its answer has no SEP-12 version or status line.

### pass 1
- **Fires**: yes, `SEP-12`, one identifier, in Call 4's EVIDENCE CHECKPOINT ("If `SEP-12` names a document, `scout.searchResearch` holds documents of source `sep`: call it with `{ q: "SEP-12", source: "sep" }`"). Call 4 contained `stellarDocs.search_docs({query:"SEP-12 sanctions screening AML"...})` and an untargeted `scout.searchResearch({q:"blockchain analytics ... Chainalysis Elliptic TRM"})`, so SEP-12 was not yet researched.
- **Followed?** Yes, in the very next execute (Call 5), bundled with the planned page read: `scout.searchResearch({q:"SEP-12",source:"sep",limit:2})` (in a Promise.all with `stellarDocs.get_doc_page({path:"docs/tokens/asset-issuance-stack"})`). Added calls: 1 research call, 0 extra executes, 0 extra turns (R pass 1 has 2 executes and 6 turns, same as P2). It is the same Call 5 the agent was already making to read the Asset Issuance page.
- **What the follow returned**: yes, an exact row (`caveat: unverified-match; exact: sep-0012`; Call 5 CANDIDATE EVIDENCE has the "Exception ... (`sep-0012`, ...)" sentence). The row's returned text is only the preamble (700-char slice): "SEP: 0012, Title: KYC API, Status: Active, Created 2018-09-11, Updated 2024-07-23, Version 1.15.0". The second row was SEP-30 (adjacent, discarded).
- **Did the answer use it?** Only the preamble facts: "SEP-12 is the 'KYC API' standard (Status: Active, Version 1.15.0, updated 2024-07-23)." Nothing else is sourced only from it. The answer also hedges, "I did not read the full SEP-12 text, so I can't rule out screening-related fields beyond that." That hedge comes from the exact row being a preamble-only slice (and the agent not reading the SEP body), not from a wrong statement. No wrong claim.
- **Substitution**: the `get_doc_page` in Call 5 failed (path lacked the leading slash: "must match pattern ^/(docs|meetings)/"), so R1 never got the page text P2 got in its Call 5, and the agent did not retry. This is a path-format error in the agent's own call, not a displacement by the follow (the page read was in the same call and would have run regardless). The vendor list, the "transport of identity data" wording and the Anchor Platform "does not store customer information" text all came from Call 4 snippets, so nothing needed was lost. R1 made no lumenloop call at all (P2 did), but that choice was in Call 4, before the pointer rendered. R1 used `stellarOrg.get_page /ecosystem/service-providers` instead and found the "Analytics companies" list (AnChain, Elliptic, Merkle Science), a fact P2 did not have; R1 lost P2's dated Elliptic-2020 and AnChain.AI-2023 press items. No fact needed by the P0/P1/P2 answers is missing from R1 (vendor-count and all three key facts present).
- **Series**: none (SEP only; no title-case token).
- **Re-fire**: none. The sentence appears once (Call 4); Call 5 ran research, so no second sentence.
- **Verdict move vs P2**: correct (single) vs correct (single). No move. Cause: none. Traced.

### pass 2
- **Fires**: no. The pointer never rendered. In Call 4 the agent itself ran `scout.searchResearch({query:"SEP-12 KYC API customer information scope",source:"sep",limit:4})`, so SEP-12 was already researched and the host suppressed the sentence. The "Exception ... (`sep-0012`)" sentence in Calls 4 and 6 is the host's response to the agent's own call, as in P2.
- **Followed?** n/a. Research for SEP-12 was the agent's own, before any pointer. (Call 6 repeated `searchResearch` with `source:"sep"` for SEP-12 inside the retried page read; not a follow.)
- **What the follow returned**: n/a. For the agent's own call: Call 4 row `d` returned sep-0012 with an "exact" mark but only a `## Customer GET ... SEP-12 does not define ...` snippet (cut); Call 6 returned the preamble (Active, 1.15.0, 2024-07-23).
- **Did the answer use it?** n/a (not the pointer). For the record, the answer states "Status: Active, Version 1.15.0, updated 2024-07-23 per the file's preamble" and notes the snippet was cut off.
- **Substitution**: none attributable. R2 hit the same leading-slash error in Call 5 and re-ran it in Call 6 (one more turn: 7 turns vs 6). It made no lumenloop call (P2 did).
- **Series**: none.
- **Re-fire**: none.
- **Verdict move vs P2**: correct (single) vs correct (single). No move, and the pointer could not be a cause. Traced.

## q-comp-sep8-regulated-assets-approval-server

Reference (P2, verdict correct / single): one execute (Call 3): `stellarDocs.search_anchor_sep_docs` plus `codemode.skill.read("skills.stellar-dev.assets", {sections:["file:regulated-assets.md"]})`. It never called `scout.searchResearch`. Answer built on the skill text, with "I didn't read the SEP text itself". Turns 4.

### pass 1
- **Fires**: yes, `SEP-8`, one identifier, in Call 3's EVIDENCE CHECKPOINT ("If `SEP-8` names a document, `scout.searchResearch` holds documents of source `sep`: call it with `{ q: "SEP-8", source: "sep" }`"). The agent had not researched SEP-8 (Call 3 = `stellarDocs.search_docs` plus the skill read).
- **Followed?** No. No later execute exists: R1 has a single execute (Call 3), then the final answer. Turns 4, same as P2. No research call anywhere in the pass.
- **What the follow returned**: n/a.
- **Did the answer use it?** Nothing in the answer comes from an exact row. The answer states "I did not read the SEP-8 text itself, so the details below come from those summaries."
- **Substitution**: none. Same calls as P2 (the docs search used `search_docs` rather than `search_anchor_sep_docs`; it returned the "Assets Overview & Comparison" #compliance section, quoted in the answer, which P2's search missed). All five key facts present (flags, stellar.toml fields, wallet flow and re-sign, server never submits, classic-only).
- **Series**: none.
- **Re-fire**: none.
- **Verdict move vs P2**: correct (single) vs correct (single). No move. Traced.

### pass 2
- **Fires**: yes, `SEP-8`, one identifier, in Call 3's EVIDENCE CHECKPOINT (same sentence). Not previously researched.
- **Followed?** No. Single execute (Call 3), then the answer. Turns 4, same as P2. No research call.
- **What the follow returned**: n/a.
- **Did the answer use it?** Nothing in the answer comes from an exact row. It says "I didn't read the SEP-8 text itself" and cites the Stellar docs SEP list only for the title and Standard track.
- **Substitution**: none. Same two-source plan as P2 (`search_anchor_sep_docs` plus the skill section). All five key facts present.
- **Series**: none.
- **Re-fire**: none.
- **Verdict move vs P2**: correct (single) vs correct (panel, boundary-partial). Judge flagged "does not state that clawback is optional alongside Authorization Required/Revocable" as a missing fact. P2's answer (and P1's and R pass 1's) lacks that same point and the single-judge calls it trivial. Cause: `judge` (materially the same answer; the tier and strictness differ). Traced: both answers share the same sources and omit the same clawback nuance, and the pointer was not followed.

## q-crp-oz-rwa-erc3643-trex

Reference (P2, verdict partial / single): Call 3 (repo search, docs search, lumenloop), Call 4 (`get_doc_page` with `docs/...` paths, both failed on the missing leading slash), Call 5 (retried with `/docs/...`, both ok). The Call 5 read returned the anatomy-of-an-asset page, which names "[SEP-57] T-REX Tokens for Regulated EXchanges" and "SEP-57 (T-REX / Token for Regulated EXchanges)". The P2 answer names SEP-57. No SEP number appears in any call argument. The pointer is keyed on identifiers the agent's calls name, so it could not fire here.

### pass 1
- **Fires**: no. The pointer never rendered (searching the whole row for "names a document, `scout.searchResearch`" returns nothing). The only identifier-shaped token in R1's calls is `ERC-3643` (series ERC) in the query strings of Call 2 and Call 3. It drew no sentence.
- **Followed?** n/a. R1 made no `scout.searchResearch` call (it used `scout.searchRepos`).
- **What the follow returned**: n/a.
- **Did the answer use it?** n/a. Nothing comes from a pointer. The answer reaches the SEP-57 designation only through the Call 5 page read (the "SEP-57 / ERC-3643 (T-REX) Tokens" decision-guide line) and states "I did not verify the SEP-57 designation against the SEP text itself". It never says Draft, never gives the verifier core versus appendix split, never says contracts create no legal compliance.
- **Substitution**: none. Path is the same shape as P2: a failed `get_doc_page` (Call 4, no leading slash), then a successful retry (Call 5).
- **Series**: `ERC-3643` (series ERC, not sep or cap) in the queries; no sentence rendered for it. No title-case token.
- **Re-fire**: none.
- **Verdict move vs P2**: partial (single) vs partial (single). No move. Traced.

### pass 2
- **Fires**: no. Not rendered. `ERC-3643` appears in queries (Call 2, Call 3, Call 4), no sentence.
- **Followed?** n/a. No `scout.searchResearch` call.
- **What the follow returned**: n/a.
- **Did the answer use it?** n/a.
- **Substitution**: n/a to the pointer. The agent's own call differs from P2 and R1. Call 4 read `get_doc_page({path:"docs/tools/openzeppelin-contracts"})` without the leading slash. It failed ("must match pattern ^/(docs|meetings)/") and the agent never retried a page read (R2 has 5 turns, P2 and R1 6). It therefore never saw the anatomy page's "SEP-57" text. The search snippets it did see only show an "ERC-3643 (T-REX)" column header (Call 3 `docs` rows) with no SEP number. It then wrote "That is a library module, not a SEP. I found no Stellar SEP for ERC-3643."
- **Series**: `ERC-3643` (series ERC); no sentence rendered. No title-case token.
- **Re-fire**: none.
- **Verdict move vs P2**: wrong (panel, boundary-wrong-claim; core incorrect) vs partial (single; core correct). The new wrong claim is "I found no Stellar SEP for ERC-3643", which contradicts SEP-57. Cause: `retrieval variance`. The transcript ties it to the unretried failed `get_doc_page` (missing leading slash) in Call 4; P2 and R1 each retried and read the page that names SEP-57. The pointer was never rendered, so it cannot be the cause. Traced.

## Summary table

| row | pass | fired (tokens) | followed | exact row | answer used it | move vs P2 | cause | traced? |
|---|---|---|---|---|---|---|---|---|
| q-comp-aml-analytics-vendors | 1 | SEP-12 (Call 4; not yet researched) | yes, Call 5 `scout.searchResearch({q:"SEP-12",source:"sep",limit:2})`, bundled into an already-planned execute; +0 turns | yes (sep-0012, preamble only) | only "Status: Active, Version 1.15.0, updated 2024-07-23" plus a "did not read full SEP-12 text" hedge | correct(single) to correct(single), none | none | traced |
| q-comp-aml-analytics-vendors | 2 | none (agent researched SEP-12 itself in Call 4; Exception sentence is the host reply to its own call) | n/a (own research, not a follow) | n/a | n/a | correct(single) to correct(single), none | none | traced |
| q-comp-sep8-regulated-assets-approval-server | 1 | SEP-8 (Call 3) | no | n/a | no | correct(single) to correct(single), none | none | traced |
| q-comp-sep8-regulated-assets-approval-server | 2 | SEP-8 (Call 3) | no | n/a | no | correct(single) to correct(panel, boundary-partial) | judge (clawback-optional gap equally absent in P2) | traced |
| q-crp-oz-rwa-erc3643-trex | 1 | none rendered (only `ERC-3643`, series ERC, in queries) | n/a | n/a | n/a | partial(single) to partial(single), none | none | traced |
| q-crp-oz-rwa-erc3643-trex | 2 | none rendered (only `ERC-3643`, series ERC, in queries) | n/a | n/a | n/a | partial(single) to wrong(panel, wrong-claim) | retrieval variance (unretried failed `get_doc_page`, so SEP-57 never seen; "found no Stellar SEP for ERC-3643") | traced |

Notes for the reader: (1) Non-sep/cap identifier seen: `ERC-3643` only, in the erc3643 row, with no sentence. No title-case token (`Sep-24`) appears in any R call. (2) The AML P2 packet contains an "Exception" sentence because P2 researched SEP-12 itself; the brief's "P2 had no such sentence" holds for the pointer, not for the Exception clause. (3) No re-fires in any pass. (4) In this batch the pointer produced one follow (aml R1), at zero added turns, with an answer effect limited to a version/status line; it displaced no call that mattered.
=== group 2
## q-edge-asset-site-scam-detection

P2 reference: partial (single). It made one execute (Call 3: five parallel calls with scout.searchResearch and lumenloop.search_content_semantic, no skill read) in 4 turns.

### pass 1
- **Fires**: not rendered. The pointer text never appears in any result. The only execute that ran (Call 4, after Call 3 failed on `.hits` versus `r.data.hits`) names no identifier in its calls. Its `scout.searchResearch` calls use plain-text `q` values and `sources`.
- **Followed?** n/a (no sentence). Call 4 called `scout.searchResearch` twice, for its own reasons.
- **What the follow returned**: n/a.
- **Did the answer use it?** Nothing in the answer comes from the pointer.
- **Substitution**: n/a. This pass added a `codemode.skill.read("skills.stellar-dev.assets", ...)` call that P2 did not make. That is unrelated to the pointer.
- **Series**: none.
- **Re-fire**: none.
- **Verdict move vs P2**: R1 correct (single) versus P2 partial (single), an improvement. The pointer never rendered, so it cannot be `pointer`. Cause: `retrieval variance`. R1 read the assets skill, and the judge accepted its "toml/home_domain alone doesn't prove legitimacy" line and the secret-key and trustline warnings. P2's judge flagged missing facts R1 also lacks (contract ID, never send funds), so `judge` strictness plays a part. **Untraced** to the pointer; the path difference (skill read) is visible.

### pass 2
- **Fires**: yes, one sentence, for `SEP-0001` (source `sep`), in Call 3 (the only execute). The call's queries included both "SEP-1 stellar.toml currencies" and "SEP-0001 asset verification ...". Only the `SEP-0001` spelling got a sentence, so one sentence covers both spellings or only one is kept. Not previously researched: the call's single `scout.searchResearch` used `{query: "scam phishing asset verification"}`, which does not name the identifier.
- **Followed?** No. There was no later execute (4 turns: search, one execute, answer). It never called `scout.searchResearch` with `SEP-0001` or `SEP-1`. It called research in the same Call 3 for a generic scam query, so the follow added 0 calls and 0 turns.
- **What the follow returned**: n/a.
- **Did the answer use it?** Nothing in the answer comes from the pointer. The answer cites the SEP-1 stellar.toml material from `search_docs` hits and the assets skill.
- **Substitution**: none from the pointer. Compared with P2, this pass made no `lumenloop.search_content_semantic` call, so it has no SDF scam-guide or Stellarscam.report content. It admits "They don't cover scam-specific guidance such as phishing or fake airdrops". That is a path difference, not displacement by a follow.
- **Series**: none (`sep`).
- **Re-fire**: none.
- **Verdict move vs P2**: partial (panel) versus partial (single). No verdict move; the tier differs only. Both lack "never send funds to test". Cause: `judge` tier (the answers are materially similar on the golden facts), with `retrieval variance` on the scam-resource content. **Untraced** to the pointer (not followed).

## q-edge-inject-ignore-instructions

P2 reference: correct (single). It made one execute (Call 3: `stellarDocs.search_anchor_sep_docs`, includeContent true) in 4 turns. Its answer says anchors exchange the signed challenge for a JWT.

### pass 1
- **Fires**: `SEP-10` (source `sep`), in Call 3 (the only execute, `search_anchor_sep_docs`). Not previously researched.
- **Followed?** No. There was no later execute (4 turns: search, one execute, answer). The follow added 0 calls and 0 turns.
- **What the follow returned**: n/a.
- **Did the answer use it?** Nothing in the answer comes only from the pointer. The answer says "A successful validation returns a JWT". The `POST /auth` snippet is truncated ("Validate the s…"), so that is an inference or carry-over from the SEP-45 snippet, not from any exact row. It correctly caveats "I read these as search snippets, not full pages."
- **Substitution**: none. Same source family as P2 (`search_anchor_sep_docs`); `includeContent:false` this time.
- **Series**: none.
- **Re-fire**: none.
- **Verdict move vs P2**: correct (single) versus correct (single); no move. Cause: none. The pointer rendered but was ignored. **Traced** (no mechanism, no change).

### pass 2
- **Fires**: `SEP-10` (source `sep`), in Call 2 (the only execute, `stellarDocs.search_docs`). Not previously researched.
- **Followed?** No. There was no later execute (3 turns: search, one execute, answer). It stopped after the pointer rendered. Calls and turns: nothing added; it was one turn fewer than P2.
- **What the follow returned**: n/a.
- **Did the answer use it?** Nothing in the answer comes from the pointer. The answer hedges: "I only read search snippets ... So I can't give you the challenge-transaction flow or the token format." The hedge comes from thin snippets, not from the sentence.
- **Substitution**: it called `search_docs` instead of P2's `search_anchor_sep_docs`. The result held the tutorial page and a cut-off `WEB_AUTH…` snippet, and no JWT or challenge text. The follow did not take its place; the agent simply picked a different search op. Missing against P0/P1/P2: the challenge/JWT flow and the SEP-45 note for C accounts (P2 had both, from the `search_anchor_sep_docs` hits).
- **Series**: none.
- **Re-fire**: none.
- **Verdict move vs P2**: wrong (panel, boundary-trap, core incorrect) versus correct (single). A real move down. Cause: `retrieval variance`. The transcript ties the loss to the agent choosing `stellarDocs.search_docs` with a 400-char slice, and no call or exact row from the pointer is involved. Lack of follow means it cannot be `pointer`. The judge tier also differs (panel versus single), which makes the fact-3 miss strict. **Traced** to the path difference, not to the pointer.

## q-net-protocol-meeting-notes-find-cap

P2 reference: partial (single). It made one execute (Call 3: `search_meeting_notes("CAP-0046 discussion")`) in 4 turns. Its answer stops at "follow the CAP links ... for the proposal text itself".

### pass 1
- **Fires**: `CAP-0067` (source `cap`), in Call 4 (the only execute, `search_meeting_notes({query:"CAP-0067"})`, which was the last tool call before the answer). Not previously researched. Calls 2 and 3 were `search` calls only.
- **Followed?** No. There was no later execute (5 turns: two searches, one execute, answer). The extra turn versus P2 came from the second `search` call, which ran before the pointer could render, so the pointer did not cause it.
- **What the follow returned**: n/a.
- **Did the answer use it?** Nothing in the answer comes only from the pointer. It does not mention `scout.searchResearch` or `source: "cap"`. It points to CAP texts in `stellar/stellar-protocol` via the CAP-68 link found in a meeting snippet. It hedges: "I can't say whether a meeting covered CAP-67". That hedge comes from the off-target hits.
- **Substitution**: none.
- **Series**: none (`cap`).
- **Re-fire**: none.
- **Verdict move vs P2**: partial (single) versus partial (single); no move. Missing in both: video on dated pages, and the preamble status/discussion link. Cause: none. **Traced** (no change).

### pass 2
- **Fires**: `CAP-0067` (source `cap`), in Call 3 (the only execute, `search_meeting_notes({query:"CAP-0067 discussion"})`). Not previously researched.
- **Followed?** No. There was no later execute (4 turns: search, one execute, answer). The follow added 0 calls.
- **What the follow returned**: n/a.
- **Did the answer use it?** Only as advice, not as a result. Step 3 reads: "Read the CAP itself for its status and text. You can search the CAP corpus (`scout.searchResearch` with `source: "cap"`) or open it in the stellar-protocol repo." The `scout.searchResearch` with `source: "cap"` wording comes only from the pointer sentence. It brings the answer closer to golden fact 3 (the CAP file holds the status), and P2 only said "proposal text itself". It did not change the verdict (the judge still marks the preamble discussion-link and video facts missing). Nothing wrong or hedged because of it. The answer also carries two false first-person claims, "I used `stellarDocs.get_doc_page`" and "I used ... query: 'CAP-0081'"; neither call was made. The pointer did not cause them.
- **Substitution**: none.
- **Series**: none (`cap`).
- **Re-fire**: none.
- **Verdict move vs P2**: partial (single) versus partial (single); no move. Cause: none; the pointer text shows in answer wording only. **Traced** (wording only, no verdict effect).

## Summary table

| row | pass | fired (tokens) | followed | exact row | answer used it | move vs P2 | cause | traced? |
|---|---|---|---|---|---|---|---|---|
| q-edge-asset-site-scam-detection | 1 | none (not rendered) | n/a | n/a | no | partial(single) -> correct(single), up | retrieval variance (skill read) plus judge strictness; not pointer | untraced (not pointer) |
| q-edge-asset-site-scam-detection | 2 | `SEP-0001` (Call 3; `SEP-1` in the same call got no separate sentence) | no | n/a | no | partial(single) -> partial(panel), no move | judge tier plus retrieval variance | untraced (not followed) |
| q-edge-inject-ignore-instructions | 1 | `SEP-10` (Call 3) | no | n/a | no | correct(single) -> correct(single), no move | none | traced (no change) |
| q-edge-inject-ignore-instructions | 2 | `SEP-10` (Call 2) | no | n/a | no | correct(single) -> wrong(panel, boundary-trap), down | retrieval variance (`search_docs` instead of `search_anchor_sep_docs`; thin snippets) | traced to the path difference, not the pointer |
| q-net-protocol-meeting-notes-find-cap | 1 | `CAP-0067` (Call 4) | no | n/a | no | partial(single) -> partial(single), no move | none | traced (no change) |
| q-net-protocol-meeting-notes-find-cap | 2 | `CAP-0067` (Call 3) | no | n/a | wording only ("`scout.searchResearch` with `source: "cap"`" as advice) | partial(single) -> partial(single), no move | none | traced (wording only) |

Across the three rows: the pointer rendered in 5 of 6 passes (not in asset-scam pass 1). The agent never followed it (0 of 5). No exact row was returned, no re-fire occurred, and every identifier was `sep` or `cap` with no title-case token. The one verdict regression (inject pass 2) comes from a different search choice.
=== group 3
# R trace, rows q-nft-vault-contract-standards, q-pc-cross-redstone-sep40, q-pc-quantum-preparedness-dormant

Call numbers follow each packet (Call 2 is the `search`, Call 3 the first `execute`). I searched every packet for "names a document, `scout.searchResearch`" to find where the pointer rendered.

## q-nft-vault-contract-standards

Reference points. P2 made one `search` and one `execute` (4 turns, $0.083). It scored partial (single). It missed each SEP's status and the NFT-module-implements-SEP-50 confirmation. Its answer said "I didn't read the SEP itself, so I can't tell you its status."

### pass 1
- **Fires**: Call 3, the first `execute`. It carried three sentences, for `SEP-50`, `SEP-56` and `SEP-41`. The Call 3 queries named them ("non-fungible token SEP-50", "tokenized vault SEP-56", "SEP-41 token interface"). The agent had researched none of them, and no `scout.searchResearch` call had been made.
- **Followed?**
  - SEP-50 and SEP-56: yes, in Call 4: `Promise.all([scout.searchResearch({q:"SEP-50",source:"sep"}),scout.searchResearch({q:"SEP-56",source:"sep"}),stellarDocs.get_doc_page({path:"/docs/tools/openzeppelin-contracts"})])`.
  - SEP-41: not followed.
  - Call 5 re-ran `scout.searchResearch({q:"SEP-50",source:"sep"})` to pull the SEP-50 row out.
  - Cost of the follow: +2 `execute` calls and +2 turns over P2 (6 turns versus 4, $0.112 versus $0.083). Call 4 also carried a `get_doc_page` read of the OpenZeppelin page. The P2 checkpoint text already suggests that read, and P2 did not make it, so its link to the pointer is unclear.
  - Call 5 only existed because Call 4 projected `JSON.stringify(a.data).slice(0,1200)`, which cut off every row.
- **What the follow returned**: exact rows for both. The host marks "exact: sep-0056" and "exact: sep-0050", and the CANDIDATE EVIDENCE block carries an "Exception" sentence for each. The agent saw only the SEP-50 row, in Call 5. Its content is the preamble: "Title: Non-Fungible Tokens", authors OpenZeppelin, Boyan Barakov and Özgün Özerk, Status: Draft, Created 2025-03-10, Updated 2025-03-10, Version 0.1.0. The SEP-56 row was returned but never displayed, because of the 1200-character slice.
- **Did the answer use it?** Yes, for SEP-50 only. These words come only from the exact row: "SEP-50, 'Non-Fungible Tokens'. The preamble shows it was authored by OpenZeppelin, Boyan Barakov and Özgün Özerk. Its status is Draft, version 0.1.0, created 2025-03-10." For SEP-56 it hedged: "The search tool returned this document, but I did not read its status or version. Check those on GitHub." The agent did not read the exact row it had obtained. Nothing wrong was stated. The SEP-56 hedge is the same hedge P2 made.
- **Substitution**: none attributable to the follow.
  - P2's `scout.searchRepos` and `skills.stellar-dev.standards` reads occurred in Call 3, before any pointer. R1 did not make them, which is a different first-call mix and so retrieval variance.
  - The follow displaced no Docs or skill call.
  - R1 lost nothing the earlier answers needed. P0 mentioned SEP-39, and P2/P0 gave the repo's last-commit date. Both were dropped in Call 3, not by the follow.
  - R1 gained the OpenZeppelin page read (Royalties, Stablecoin and RWA modules, and the "Token Vault ... implements SEP-56" sentence).
- **Series**: only `sep` (SEP-50, SEP-56, SEP-41). No title-case token.
- **Re-fire**: none. Call 4 and Call 5 results contain the Exception sentences and no pointer sentence. SEP-41 was never followed and never re-fired, because there was no later execute naming it.
- **Verdict move vs P2**: partial (single) to partial (panel, boundary-partial). No verdict move.
  - Missing facts fell from two to one. SEP-50's status and date were gained. SEP-56's status is still missing.
  - The gain is traced to the pointer: the Call 5 exact row is the only source of "Draft, 0.1.0, 2025-03-10".
  - The judge tier differs (single versus panel) while the verdict is the same.
  - R1 still hedges the NFT-module-to-SEP-50 link ("do not say it implements SEP-50 by name"), as P2 did. Its opening line says the library "implements both".
  - Cause: no move. **Traced** for the fact gain.

### pass 2
- **Fires**: the pointer never rendered. The only `execute` (Call 3) already called `scout.searchResearch` with `q:"SEP-0050 non-fungible token NFT smart contract interface"` and `q:"SEP-0056 tokenized vault standard ERC-4626"`, both with `sources:["sep"]`. That suppresses the sentence. The host did mark both rows exact. The agent then answered from Call 3.
- **Followed?** Not applicable. The research calls were the agent's own first move.
- **Verdict move vs P2**: partial (single) to partial (panel, boundary-partial). No verdict move.
  - R2 gained both SEPs' Draft status and dates, because it queried research itself.
  - R2 lost P2's confirmation that the Token Vault module implements SEP-56. It wrote "I didn't see a vault module listed", and the judge counted that as missing. This follows from not reading the OpenZeppelin page, which is unrelated to the pointer.
  - Cause: retrieval variance. A move on a pass where the sentence never rendered cannot be `pointer`. **Traced** (the transcript shows the self-made research call).

## q-pc-cross-redstone-sep40

Reference points. P2 made three `execute` calls (Call 3 searches, Call 4 a failed `get_doc_page` retried in Call 5 with a heading and SEP-40 text scan), 6 turns, $0.110. It scored correct (single). Its answer said "I didn't open that file, so the purpose above comes from how the docs describe it", and gave no SEP status.

### pass 1
- **Fires**: Call 3, one sentence, for `SEP-40` only. SEP-24, SEP-10 and SEP-45 appeared in result rows but not in the calls, so they got none. The agent had not researched it before.
- **Followed?** Yes, in Call 4: `Promise.all([stellarDocs.get_doc_page({path:"docs/data/oracles/oracle-providers"}),scout.searchResearch({q:"SEP-40",source:"sep"})])`. Call 5 repeated it with `scout.searchResearch({q:"SEP-40",source:"sep",limit:1})`. Both bundled the research call with the page read that P2 also made (Call 4 failed on the path pattern, and Call 5 was the corrected read).
  - Count: R1 made four `execute` calls versus P2's three, 7 turns versus 6, $0.135 versus $0.110.
  - The extra call is Call 6, a SEP-40 text scan. P2 had that scan inside its Call 5. R1's Call 5 did not include it, so the scan became its own call. The research follow itself added no stand-alone call.
- **What the follow returned**: an exact row ("exact: sep-0040" and the Exception sentence). Call 4 cut it at about 2500 characters ("Created: 202"). Call 5 showed the full preamble: "Title: Oracle Consumer Interface", Authors Alex Mootz, OrbitLens and Markus Paulson-Luna, Status: Draft, Created 2023-02-17, Updated 2023-05-13, Version 0.1.0. That is the preamble only, not the spec body.
- **Did the answer use it?** Yes. These words come only from the exact row: "SEP-40 is titled 'Oracle Consumer Interface'." and "The preamble lists authors Alex Mootz, OrbitLens and Markus Paulson-Luna. It also gives Status: Draft, Version 0.1.0, created 2023-02-17 and updated 2023-05-13." The answer hedged the purpose ("I'm inferring this purpose from its title and from how the docs use it. I only retrieved the SEP's preamble, not its full text"), because the row held no body. P2 hedged too ("I didn't open that file"). Nothing wrong was stated.
- **Substitution**: none. R1 made every Docs call P2 made (search, then page read and SEP-40 scan). Its answer kept all P2 content: Reflector, RedStone with the mainnet contract, MultiFeed not SEP-40, Chainlink not compatible, Band/DIA/Pyth hedged.
- **Series**: only `sep`. No title-case token.
- **Re-fire**: none. The Call 4, 5 and 6 results carry no pointer sentence.
- **Verdict move vs P2**: correct (single) to correct (single). No move.
  - The golden's "Draft SEP" and the SEP's title now come from the exact row. P2 was already correct without them.
  - Cause: none. **Traced** that the answer's extra facts come from the exact row.

### pass 2
- **Fires**: Call 3, one sentence for `SEP-40` (queries "SEP-40 oracle", "SEP-40 compatible oracle providers"). The agent had not researched it before.
- **Followed?** Yes, in Call 4: `Promise.all([stellarDocs.get_doc_page({path:"/docs/data/oracles/oracle-providers"}),scout.searchResearch({q:"SEP-40",source:"sep"})])`. Call 5 used `scout.searchResearch({q:"SEP-40 Oracle Consumer Interface summary abstract",source:"sep",limit:2})`, together with a page-heading and SEP-text scan.
  - Count: three `execute` calls (3, 4, 5), the same as P2. 6 turns, the same as P2. Cost $0.135 versus $0.110.
  - The research calls were bundled into page-read calls. The follow added no turn.
- **What the follow returned**: an exact row ("exact: sep-0040"). Call 5 showed the preamble: title "Oracle Consumer Interface", the same authors, Draft, 2023-02-17, 2023-05-13, 0.1.0. It is the preamble only.
- **Did the answer use it?** Yes. These words come only from the exact row: "SEP-40 is titled 'Oracle Consumer Interface.' Its header, as returned from the SEP document, shows: Authors ..., Status: Draft, Created 2023-02-17, Updated 2023-05-13, Version 0.1.0." It hedged: "The text I retrieved was only that header block, so I couldn't read the full specification. The purpose below comes from how the docs use it." No wrong claim.
- **Substitution**: none. R2 made the same page read and "SEP-40" string scan as P2. Its answer kept P2's content.
- **Series**: only `sep`. No title-case token.
- **Re-fire**: none. No pointer sentence appears in the Call 4 or Call 5 results.
- **Verdict move vs P2**: correct (single) to correct (single). No move. Cause: none. **Traced**, as in pass 1.

## q-pc-quantum-preparedness-dormant

Reference points. P2 made four `execute` calls (3 to 6), 7 turns, $0.138. It scored correct (single). Its `execute` calls named no identifier. The pointer does not appear anywhere in this packet (zero matches of "names a document").

### pass 1
- **Fires**: never rendered. No R1 `execute` named a document-series identifier. The queries were topical ("quantum preparedness plan", "dormant accounts", "post-quantum signatures Stellar"). "CAP-87" appears only in result text.
- **Followed?** Not applicable.
- **Other notes**
  - R1 called `scout.searchResearch({query:"Stellar quantum dormant accounts"})` in Call 6 and Call 7 itself. Those calls name no identifier and use no `source`.
  - The calls were motivated by the checkpoint text that offers `scout.searchResearch` as a recovery candidate, and P2 had that text too.
  - Call 7 returned the QPP blog post text. R1's answer used the quote "Stellar has a large population of dormant accounts whose holders are unreachable".
  - R1 took 8 turns at $0.185, versus P2's 7 turns at $0.138.
- **Verdict move vs P2**: correct (single) to correct (single). No move. The difference in answer content comes from the agent's own research calls, which is retrieval variance. A move or difference on a pass where the sentence never rendered cannot be `pointer`. **Traced** (the transcript shows the self-chosen research calls).
- **Series, re-fire**: none.

### pass 2
- **Fires**: never rendered. The Call 3, 4 and 5 queries are topical ("quantum preparedness plan", "dormant accounts quantum Ed25519 freeze"). No identifier is named in any call input. R2 made no `scout.searchResearch` call.
- **Followed?** Not applicable.
- **Verdict move vs P2**: correct (single) to correct (single). No move. The shorter path (6 turns, $0.137) is retrieval variance. R2's answer left the third ML-DSA function name truncated ("`verify_s…`"), which P2's read of the page (Call 5) avoided. That difference is retrieval variance and unrelated to the pointer. **Traced**.
- **Series, re-fire**: none.

## Table

| row | pass | fired (tokens) | followed | exact row | answer used it | move vs P2 | cause | traced? |
|---|---|---|---|---|---|---|---|---|
| q-nft-vault-contract-standards | 1 | Call 3: SEP-50, SEP-56, SEP-41 (sep) | SEP-50 and SEP-56 in Call 4; SEP-50 re-extracted in Call 5; SEP-41 not followed; +2 turns | SEP-50 and SEP-56 rows exact; only SEP-50's row displayed (preamble: Draft, 0.1.0, 2025-03-10) | Yes, SEP-50 status, version, date and authors; SEP-56 status hedged as unread | none: partial (single) to partial (panel, boundary-partial); missing facts 2 to 1 | none; fact gain from pointer, verdict unchanged | traced (the gain) |
| q-nft-vault-contract-standards | 2 | not rendered; the agent's own Call 3 already researched SEP-0050 and SEP-0056 | no | n/a (host marked both rows exact on the agent's own calls) | n/a | none: partial (single) to partial (panel, boundary-partial) | retrieval variance (vault module not seen) | traced |
| q-pc-cross-redstone-sep40 | 1 | Call 3: SEP-40 (sep) | Call 4 and Call 5, bundled with the page read; +1 execute and +1 turn, the extra call being a text scan | SEP-40 row exact; full preamble in Call 5 | Yes: title "Oracle Consumer Interface", Draft, 0.1.0, 2023-02-17 and 2023-05-13, authors; purpose hedged | none: correct (single) to correct (single) | none | traced |
| q-pc-cross-redstone-sep40 | 2 | Call 3: SEP-40 (sep) | Call 4 and Call 5, bundled with the page read; no added turn | SEP-40 row exact; preamble in Call 5 | Yes, same preamble facts; purpose hedged | none: correct (single) to correct (single) | none | traced |
| q-pc-quantum-preparedness-dormant | 1 | not rendered (no identifier named in any call) | no (the agent's own two research calls named no identifier) | n/a | n/a | none: correct (single) to correct (single) | retrieval variance (own research calls, quote of QPP post) | traced |
| q-pc-quantum-preparedness-dormant | 2 | not rendered (no identifier named in any call) | no | n/a | n/a | none: correct (single) to correct (single) | retrieval variance | traced |
=== group 4
# R trace, rows q-pc-sponsored-reserves, q-sep-43-web-wallet-api, q-sep-45-contract-auth

Call numbers are the packet's Call n (Call 1 is the question turn; Call 2 is always `search`).

Note on the brief: the CANDIDATE EVIDENCE "Exception: ... returned the document the query names by identifier" sentence also appears in the P2 transcript of q-sep-43 (P2 Calls 4, 5, 6, `exact: sep-0043`), because P2's own `scout.searchResearch({query:"SEP-43 wallet interface"})` returned the exact row. So the Exception sentence is not R-only here. Only the "names a document, `scout.searchResearch` holds documents of source `sep`" sentence is R-only.

## q-pc-sponsored-reserves

P2 reference: 6 turns, executes at Calls 3, 4, 5 (docs search, a failed `get_doc_page` with a bad path, then `get_doc_page` of the sponsored-reserves guide). Verdict partial (panel, boundary-partial); missing issuer authorization for the sponsored trustline.

### pass 1
- Fires: never. Searched the whole pass text for "names a document, `scout.searchResearch`" and found no match. Execute Calls 3, 4 and 5 name no letters-then-digits identifier (queries are plain words such as "sponsored reserves begin sponsoring future reserves"; paths are `build/guides/...`). The only `scout.searchResearch` mentions are the pre-existing recovery-candidate lists in the EVIDENCE CHECKPOINT.
- Followed?: n/a. No `scout.searchResearch` call anywhere in the pass.
- What the follow returned: n/a.
- Did the answer use it?: nothing in the answer comes from research; docs only.
- Substitution: none. Path is the same as P2 (search, bad-path `get_doc_page`, retry with `/docs/...`). 6 turns, same as P2.
- Series: none.
- Re-fire: none.
- Verdict move vs P2: partial (panel, boundary-partial) to partial (panel, boundary-partial), no move. Both miss issuer authorization. Cause: none; wording differences are retrieval variance (R1 adds fee-bump inference, the Wallet Sponsorship Calculator pointer, and "owner must then cover the reserve"). Not pointer, since the sentence never rendered. Traced: yes (mechanism absent).

### pass 2
- Fires: never. No match for the pointer text. Call 3 queries ("sponsored reserves", "numSponsored numSponsoring", "revoke sponsorship operation", "sponsored account zero balance") contain no identifier.
- Followed?: n/a. Only Calls 2 (search) and 3 (one execute with `stellarDocs.search_docs`) exist. Turns 4 vs P2's 6; no research call.
- What the follow returned: n/a.
- Did the answer use it?: nothing from research. This pass never opened the guide page via `get_doc_page` (P2 did, Call 5), so it works from `search_docs` content only. New items versus P2 (CLI `stellar tx operation add revoke-sponsorship`, `TxInsufficientBalance`, "Sending needs a fee-bump or a little XLM") come from the Call 3 docs hits, not from the pointer.
- Substitution: this pass dropped P2's `get_doc_page` read of the guide, but the pointer did not render, so this is not a follow displacement. The cause is the agent's own choice (4 turns, one execute). Facts P2 had that this pass lacks: the `BEGIN_SPONSORING_FUTURE_RESERVES_*` error codes (-1, -2, -3), the Begin signature mapping per operation, and "owner pays the reserve" is replaced by a hedged "needs enough XLM or the operation fails; I didn't confirm the failure code".
- Series: none.
- Re-fire: none.
- Verdict move vs P2: partial (panel, boundary-partial) to partial (panel, boundary-partial), no move. Cause: none, and `pointer` is impossible because the sentence never rendered. Traced: yes (mechanism absent).

## q-sep-43-web-wallet-api

P2 reference: 7 turns, executes at Calls 3 (docs search ×2 and a skill read), 4 (`scout.searchResearch({query})` plus `lumenloop.search_content_semantic` plus `stellarDocs.search_meeting_notes`), 5 and 6 (two more `scout.searchResearch({query})` calls to read the spec chunk). Call 4 already returned `exact: sep-0043` and the Exception sentence. Verdict correct (single). P2 answer: Draft, v1.2.1, five methods, error shape; codes cut off after `-1`; hedged "check the repository for current status".

### pass 1
- Fires: Call 3 only. One sentence, for `SEP-0043` ("If `SEP-0043` names a document, `scout.searchResearch` holds documents of source `sep`: call it with `{ q: "SEP-0043", source: "sep" }`"). The call also named `SEP-43` in its second query; only the `SEP-0043` token rendered. The agent had not researched it before Call 3.
- Followed?: Yes, the very next execute. Call 4: `scout.searchResearch({q:"SEP-0043",source:"sep"})`. A fifth call (Call 5) was the agent's own deeper read: `Promise.all` of three `scout.searchResearch({q, source:"sep", limit:12})` queries, filtered by `url.includes("sep-0043")`, with the same `q`/`source` argument shape the pointer gave. Net calls: 3 executes (Calls 3, 4, 5) against P2's 4; 6 turns against P2's 7. The follow added zero turns relative to P2, and one fewer turn overall.
- What the follow returned: an exact row. Call 4 shows `exact: sep-0043` and the Exception sentence naming `sep-0043` and the GitHub URL. The exact row it contains is the Preamble chunk: SEP 0043, "Standard Web Wallet API Interface", Status Draft, Created 2024-04-11, Version 1.2.1, five authors, discussion link. The Call 4 output was cut to 6000 chars by the agent's own `.slice`. Call 5 then returned the Specification chunk (full interface and codes -1 to -4) and the Preamble.
- Did the answer use it?: nothing in the answer comes only from the Call 4 exact row, because P2 had the same Preamble row from its own Call 4/5. What differs from P2 is the error codes `-1` to `-4` ("`-4`: the user rejected the request, and the client app should not retry it"). That text came from Call 5 (`content.slice(0,2500)`). P2's Call 6 sliced the same chunk at 1800 chars and lost the codes, so the gain is tied to a longer slice, not to the pointer; the pointer's `{q, source:"sep"}` shape was reused. The answer hedges nothing because of the pointer and states nothing wrong. It dropped P2's "check the repository for current status" hedge and says "the SEP file (observed 2026-11-14) lists it as Draft", which matches the row's `observedAt`.
- Substitution: P2's Call 4 (the `scout` + `lumenloop.search_content_semantic` + `search_meeting_notes` trio) is absent here. The follow took its place for the scout part; lumenloop and meeting notes were not called, and they returned only off-topic rows in P2. P2's Call 3 (docs search + `skills.stellar-dev.standards` read) was repeated here unchanged. No fact in P0/P1/P2 answers is lost. P0 and P1 mention the x402 guide and SEP-60 respectively, and P2 does not mention either, so this pass is not behind P2. The follow did not pull the agent off a needed source.
- Series: only `sep`. No title-case token.
- Re-fire: none. Calls 4 and 5 name the identifier inside `scout.searchResearch`, so no later sentence rendered.
- Verdict move vs P2: correct (single) to correct (single), no move. Cause: none. Traced: n/a (no move). The path was shortened and the codes added, with no verdict effect.

### pass 2
- Fires: Call 3 only. One sentence, for `SEP-43` ("call it with `{ q: "SEP-43", source: "sep" }`"). Call 3's second query used lowercase `sep-0043`, which did not get its own sentence. The agent had not researched it before Call 3.
- Followed?: Yes. Call 4: `scout.searchResearch({q:"SEP-43",source:"sep"})`. Call 5: three `scout.searchResearch({q, source:"sep", limit:10})` queries, filtered to sep-0043 rows. 3 executes against P2's 4; 6 turns against 7. No added turns versus P2.
- What the follow returned: an exact row (`exact: sep-0043`, Exception sentence naming `sep-0043`). Rank 1 is the Preamble chunk: Draft, v1.2.1, 2024-04-11. Rank 2 is SEP-60 "Dependencies": "The announced `provider` MUST implement the SEP-43 interface. This proposal does not change SEP-43." That row is a non-exact candidate. Call 5 returned the Specification chunk with the codes and the `-1`/`-2`/`-3` examples, truncated mid `-4`.
- Did the answer use it?: nothing comes only from the exact row (P2 had the same Preamble). The answer adds: the codes `-1` to `-4`, which came from Call 5 (`slice(0,3500)`, so the mapping is shown in full), and "Related: SEP-60 ... says an announced `provider` MUST implement the SEP-43 interface", from the Call 4 follow output (a non-exact SEP-60 row). P1 also stated the SEP-60 relation, so this is not unique to the pointer. The answer opens "I have what I need from the SEP-43 document itself", a small meta-phrase. It states nothing wrong. It hedges only that the error section was cut off after `-4`, which is accurate.
- Substitution: same as pass 1. The follow replaced P2's Call 4 trio (the `scout.searchResearch({query})` call, `lumenloop.search_content_semantic` and `search_meeting_notes`). No needed fact was lost.
- Series: only `sep`. No title-case token.
- Re-fire: none.
- Verdict move vs P2: correct (single) to correct (single), no move. Cause: none. Traced: n/a (no move).

## q-sep-45-contract-auth

P2 reference: 4 turns, one execute (Call 3: `search_anchor_sep_docs` ×2 and `search_docs` ×2). No research call. Verdict partial (single). Missing: the auth-entry mechanism and Draft status with version/date.

### pass 1
- Fires: Call 3 (the only execute). Two sentences, for `SEP-10` and `SEP-45`, both in the EVIDENCE CHECKPOINT block. The agent had not researched either identifier (its queries named "SEP-45 ...", "SEP-10 web authentication ..." against `stellarDocs.search_docs` only).
- Followed?: No. No `scout.searchResearch` call anywhere. The agent made one execute, then answered. Turns: 4 vs P2's 4. Its answer says "I didn't open the SEP-45 spec itself, so I haven't confirmed its current status (draft or final)".
- What the follow returned: n/a. A follow would have reached the SEP-45 row, which would carry Status Draft and the version, the exact fact the golden requires and the answer lacks.
- Did the answer use it?: nothing from research. The answer is docs-snippet only.
- Substitution: none. Same single docs execute as P2.
- Series: only `sep` (`SEP-10`, `SEP-45`). No title-case token.
- Re-fire: none. Single execute.
- Verdict move vs P2: partial (single) to partial (single), no move. Cause: none. The pointer rendered but was ignored. Judge differences: R1 faults the missing "complements SEP-10" statement and P2 does not, but both lack Draft status and the mechanism. Traced: yes. The transcript shows a single execute and no research call.

### pass 2
- Fires: Call 3 (the only execute). Two sentences, for `SEP-10` and `SEP-45` (`search_anchor_sep_docs` queries; "SEP-45" also appeared bare). Not researched before.
- Followed?: No. No `scout.searchResearch` call. One execute, 4 turns, same as P2.
- What the follow returned: n/a.
- Did the answer use it?: nothing from research. The new content versus P2 (SDP `ENABLE_SEP45` default `false`, Anchor Platform "SEP-10 and SEP-45 ... for both traditional and smart contract accounts") comes from different `search_anchor_sep_docs` hits, i.e. retrieval variance. The answer hedges "I'm inferring that the token is a JWT" and "I also didn't check the proposal's current status".
- Substitution: none.
- Series: only `sep`. No title-case token.
- Re-fire: none.
- Verdict move vs P2: partial (single) to partial (panel, boundary-partial). Same verdict, different judge tier. Cause: `judge` (answers are materially the same; both lack Draft status and mechanism; R2 gets the panel tier and credits complementarity). It cannot be `pointer` because the follow was never taken. Traced: yes (no follow).

## Summary table

| row | pass | fired (tokens) | followed | exact row | answer used it | move vs P2 | cause | traced? |
|---|---|---|---|---|---|---|---|---|
| q-pc-sponsored-reserves | 1 | none (sentence never rendered) | no (no research call) | n/a | no | partial (panel) to partial (panel); none | none (retrieval variance in wording) | traced |
| q-pc-sponsored-reserves | 2 | none (sentence never rendered) | no (no research call) | n/a | no | partial (panel) to partial (panel); none | none (retrieval variance; `get_doc_page` dropped by agent choice) | traced |
| q-sep-43-web-wallet-api | 1 | SEP-0043 (Call 3) | yes, Call 4 `{q:"SEP-0043",source:"sep"}`; 6 turns vs 7 | yes (`exact: sep-0043`, Preamble) | nothing only from it; codes -1..-4 came from Call 5's longer slice | correct (single) to correct (single); none | none (path shortened, no verdict effect) | n/a (no move) |
| q-sep-43-web-wallet-api | 2 | SEP-43 (Call 3) | yes, Call 4 `{q:"SEP-43",source:"sep"}`; 6 turns vs 7 | yes (`exact: sep-0043`, Preamble) | nothing only from it; SEP-60 line from a non-exact follow row; codes from Call 5 | correct (single) to correct (single); none | none (path shortened, no verdict effect) | n/a (no move) |
| q-sep-45-contract-auth | 1 | SEP-10, SEP-45 (Call 3) | no | n/a | no | partial (single) to partial (single); none | none (pointer ignored) | traced |
| q-sep-45-contract-auth | 2 | SEP-10, SEP-45 (Call 3) | no | n/a | no | partial (single) to partial (panel, boundary-partial); tier only | judge | traced |
=== group 5
# R trace, out5: q-sep-53-sign-verify-message, q-sep24-interactive-deposit-flow, q-sep6-sep24-sep31-choice

Call n is the packet's Call n (Call 2 is the `search`; the first `execute` is Call 3). P2 turn counts: sep-53 = 5, sep24 = 6, sep6 = 4.

## q-sep-53-sign-verify-message

P0/P1/P2 on this row: partial / partial / partial, all judge tier single except P1 (panel, boundary-partial). P2 missing facts: Final status, prefix, SHA-256+ed25519. P2 got the "off-chain" fact from the CLI sign-messages page ("runs fully offline"). P2 never called `scout.searchResearch`.

### pass 1
- **Fires**: Call 5 only (a `stellarDocs.search_docs` execute): one sentence, for `SEP-53` (`{ q: "SEP-53", source: "sep" }`). Calls 3 and 4 both called `scout.searchResearch`, so they rendered no sentence. The agent had already researched SEP-53 (Call 3: `q:"SEP-0053 sep-0053", source:"sep"`; Call 4 the same with a longer query) before it fired.
- **Followed?** No. Call 5 was the last execute, so no later execute exists. The research the agent did was its own, ahead of any sentence, and cost 2 calls (Calls 3, 4); Call 4 returned the same single Preamble chunk as Call 3. Turns: 6 against P2's 5.
- **What the follow returned**: no follow. The agent's own research calls returned an exact row ("caveat: unverified-match; exact: sep-0053", with an "Exception: ... returned the document the query names by identifier (`sep-0053`, ...)" sentence). The row was the Preamble chunk only: Title "Sign and Verify Messages", Status Final, Version 1.0.0, Created 2025-02-01, Updated 2026-06-18, authors, discussion URL. The body text (prefix, hashing) was not returned in any call.
- **Did the answer use it?** The Final/1.0.0/dates/authors header ("Status: Final, Version 1.0.0 ... Created 2025-02-01, updated 2026-06-18") comes only from that exact row. It came from the agent's own earlier research call, so the pointer did not cause it. The Exception sentence in those results may have licensed stating the status as fact, but I cannot show that. The answer hedges honestly: "I couldn't retrieve the spec's body text ... I didn't see the exact byte-level signing format". Nothing is wrong.
- **Substitution**: P2 called `get_doc_page` on the sign-messages page (CLI usage, exit codes, `--base64`, "fully offline") and read the standards skill. This pass made neither call, so CLI usage and the offline wording are absent. The pointer sentence rendered only in the last execute, so it displaced nothing. The research calls took the place of the P2 page read, but they were the agent's own choice.
- **Series**: none (sep only; lowercase `sep-0053` in the Exception sentence).
- **Re-fire**: yes. Call 5 rendered `SEP-53` although Calls 3 and 4 had already called research for sep-0053 in earlier executes. The rule counts per execute, so the sentence fires when that execute has no research call.
- **Verdict move vs P2**: partial/single to partial/single, no move. Facts swapped: Final gained, off-chain lost. Cause: `retrieval variance` (the agent chose to call research on its own in Call 3, before any sentence). **Traced**: the transcript shows the research call preceding the first rendered sentence. The pointer cannot be the cause.

### pass 2
- **Fires**: Call 3 (two `search_docs` calls plus a skill read): one sentence, for `sep-0053` (`{ q: "sep-0053", source: "sep" }`). The queries spelled the id as both "SEP-53" and "sep-0053", and only one sentence rendered. No prior research.
- **Followed?** Yes, in Call 4: `scout.searchResearch({q:"sep-0053",source:"sep"})`. It was 1 call and 1 turn. It took the slot P2 used for `get_doc_page` on the sign-messages page. Total turns: 5, the same as P2.
- **What the follow returned**: an exact row (Exception sentence names `sep-0053` and the sep-0053.md URL; "exact: sep-0053"). Content: Preamble chunk only (Status Final, Version 1.0.0, dates, authors, discussion). The Call 4 output was cut at 4000 chars after 2 of 8 rows. The second row is SEP-60's Changelog, which lists `[SEP-53]` in its link list.
- **Did the answer use it?** Yes: "The SEP's own text (preamble, observed 2026-11-15) gives this metadata: Status: Final, Version: 1.0.0, Created: 2025-02-01 ... Authors ... Discussion ..." and "Related SEP: SEP-60 (Wallet Provider Discovery) references SEP-53 and SEP-43 in its link list." Both come only from the follow. The answer hedged: "I only retrieved the preamble chunk of the SEP. I didn't see the message-encoding or signing format". That is honest and states nothing wrong. It adds a marginal SEP-60 aside that the agent says it did not read.
- **Substitution**: the follow replaced P2's Call 4 `get_doc_page` on `/docs/tools/cli/agent-cli/guides/sign-messages`. Lost versus P2: CLI flags and usage, exit codes, `--base64`, signatures-are-base64, "runs fully offline, no funded account". The "off-chain, not a transaction" key fact depended on that page, so it is now missing. The agent also dropped the "Final" gap that P2 had. The standards-skill read (Call 3) is in both.
- **Series**: none.
- **Re-fire**: none (no later execute).
- **Verdict move vs P2**: partial/single to partial/single, no move. Missing-fact lists are the same size (3 each). P2 missed Final, prefix, SHA/ed25519. R2 misses prefix, SHA/ed25519, off-chain. Cause: `pointer` (Final gained from the exact row the follow returned; off-chain lost from the `get_doc_page` call the follow displaced). **Traced**, but with no verdict effect.

## q-sep24-interactive-deposit-flow

P0/P1/P2 on this row: correct / correct / correct (single). P2 missing facts: none.

### pass 1
- **Fires**: Call 3 (search execute): `SEP-24` and `SEP-10`. Call 4 (two failed `get_doc_page` calls, path `docs/build/apps/...sep24`), Call 5 and Call 6 (`get_doc_page` retries): `sep24`, rendered from the path string. The sentence appeared in 4 of the 4 executes. In none of them did the agent mention research or `scout.searchResearch`.
- **Followed?** No. No `scout.searchResearch` call anywhere in the pass. Turns: 7 against P2's 6. The extra turn comes from the two failed `get_doc_page` calls, the same path error P2 hit (P2 hit it once, with one path; R1 ran two paths at once, so it paid one extra retry-plus-slice), and then a third read in Call 6. It is not tied to the pointer.
- **What the follow returned**: n/a.
- **Did the answer use it?** Nothing in the answer comes from the pointer or from any research row. The answer reads "I did not read the SEP-24 spec text itself". Its content (SEP-10 `GET/POST /auth`, `POST .../transactions/deposit/interactive`, url+id, popup with `&callback=postMessage`, polling `GET /transaction`) all comes from Docs search and page reads. Nothing wrong; hedges about status names are the same kind as P2's.
- **Substitution**: none from the pointer. P2 made the same call types (search, retry `get_doc_page`).
- **Series**: none, though the sentence rendered the lowercase token `sep24` taken from a URL path (`.../wallet/sep24`), not an identifier the agent wrote as a document name.
- **Re-fire**: yes. Calls 4, 5, 6 each re-fired `sep24` after Call 3 had already fired `SEP-24` (a different spelling). None was acted on.
- **Verdict move vs P2**: correct/single to correct/single, no move. Cause: none; `retrieval variance` for any wording differences. **Traced** (no research call, so the pointer had no mechanism).

### pass 2
- **Fires**: Call 3 (search execute): `SEP-24` and `SEP-10`. Calls 6 and 7 (`get_doc_page` only, path contains `sep24`): `sep24`. Calls 4 and 5 named `scout.searchResearch`, so no sentence.
- **Followed?** Yes, SEP-24 only (SEP-10 never followed). Call 4: `scout.searchResearch({q:"SEP-24",source:"sep"})`, in the same `Promise.all` as a `get_doc_page` call that failed on the path pattern. The agent sliced the result to 1500 chars and saw only the `meta` block, so Call 5 repeated the same call (`scout.searchResearch({q:"SEP-24",source:"sep"})`), together with the `get_doc_page` retry, and printed the exact row. Two research invocations, no separate turn: both rode on executes the `get_doc_page` retry needed anyway (P2 also needed Call 4 fail and Call 5 retry). Turns: 8 against P2's 6; the extra two are Calls 6 and 7, page-section reads, not the research.
- **What the follow returned**: an exact row (host marks "exact: sep-0024"; Exception names `sep-0024` and the sep-0024.md URL). Content: Preamble only: "Hosted Deposit and Withdrawal", Status: Active, Created 2019-09-18, Updated 2025-09-10, Version 3.8.0.
- **Did the answer use it?** Yes: "The SEP-24 spec (v3.8.0, Active, updated 2025-09-10) was confirmed only by its preamble." Nothing else in the answer depends on it. It is not a golden key fact. Nothing wrong. The hedge ("confirmed only by its preamble") is honest.
- **Substitution**: no P2 call is missing (the research rode inside the retry executes). Facts in P2 but not here: the BasicPay `&callback=postMessage` popup listener and the withdrawal status list (`completed`, `refunded`, `expired` ...). This answer says "the SDK doesn't mention a callback for the iframe" and "docs don't show the exact status strings". P2 read the same wallet page with a larger slice and used the example-app search snippet. Both losses are tied to the slice sizes of Calls 6 and 7, not to the follow. The golden's callback-or-polling key fact is still covered through polling and the `Watcher`.
- **Series**: none (lowercase `sep24` is from the path).
- **Re-fire**: yes. Calls 6 and 7 rendered `sep24` after SEP-24 had been researched in Calls 4 and 5. They were not acted on.
- **Verdict move vs P2**: correct/single to correct/single, no move. Cause: none. The Active/3.8.0 detail is a fact gained from the exact row, outside the golden. **Traced.**

## q-sep6-sep24-sep31-choice

P0/P1/P2 on this row: partial / partial / partial (single). P2 missing: SEP-6 interactive-flow-only deprecation (grader note caps at partial), Active status as of a date.

### pass 1
- **Fires**: Call 3 (the first execute; four `search_anchor_sep_docs` calls plus a skill read): three sentences, for `SEP-31`, `SEP-24`, `SEP-6` (in that order). SEP-12 and SEP-10-style tokens in the qs did not appear, because the first query list used only SEP-6, SEP-24, SEP-31 and "SEP-6 vs SEP-24". No prior research. Calls 4 and 5 (`get_doc_page`) rendered no sentence.
- **Followed?** No. No `scout.searchResearch` call anywhere. Turns: 6 against P2's 4. The two extra come from a `get_doc_page` path error (`docs/learn/fundamentals/anchors` without a leading slash) and its retry, not from the pointer.
- **What the follow returned**: n/a.
- **Did the answer use it?** Nothing in the answer comes from a research row. The answer states "My sources didn't cover SEP-31's authentication or KYC details", an honest gap statement, not caused by the sentence.
- **Substitution**: none. P2 made the search execute only; R1 added the `get_doc_page` read of the anchors page ("SEP-6 vs. SEP-24" section), which no pointer text asked for.
- **Series**: none.
- **Re-fire**: none.
- **Verdict move vs P2**: partial/single to partial/single, no move. Missing facts identical (SEP-6 deprecation scope, Active). Cause: none (variance in the extra page read). **Traced**: no research call, so no pointer mechanism.

### pass 2
- **Fires**: Call 3 (search execute): three sentences, for `SEP-12`, `SEP-38`, `SEP-24`. The queries named SEP-6, SEP-24, SEP-31 and SEP-12/SEP-38; the cap of three kept SEP-12, SEP-38 and SEP-24, and left out SEP-6 and SEP-31, the identifiers the question asks about. No prior research. Call 4 (`get_doc_page`) rendered no sentence.
- **Followed?** No. No `scout.searchResearch` anywhere. Turns: 5 against P2's 4: one extra `get_doc_page` of the anchors page (Call 4), which the pointer did not ask for.
- **What the follow returned**: n/a.
- **Did the answer use it?** Nothing comes only from a pointer. The answer's "SEP-38 provides quotes when the assets being exchanged are not equivalent" comes from the agent's own query ("SEP-12 KYC SEP-38 quotes") and the SEP-6/SEP-24 integration "Quotes and fees" snippets, not research. It echoes the golden's SEP-38 point. Caveats ("I didn't read SEP-31's own text") are the agent's, as in P2.
- **Substitution**: none.
- **Series**: none.
- **Re-fire**: none.
- **Verdict move vs P2**: partial/single to partial/single, no move. Missing facts as in P2. Cause: none (retrieval variance only). **Traced**: no research call.

## Summary table

| row | pass | fired (tokens) | followed | exact row | answer used it | move vs P2 | cause | traced? |
|---|---|---|---|---|---|---|---|---|
| q-sep-53-sign-verify-message | 1 | Call 5: `SEP-53` (already researched in Calls 3, 4) | no (no later execute; agent's own research came first) | own research returned exact `sep-0053`, Preamble only | Final/1.0.0/dates header, from the agent's own pre-sentence call | none (partial/single to partial/single); Final gained, off-chain lost | retrieval variance | traced |
| q-sep-53-sign-verify-message | 2 | Call 3: `sep-0053` | yes, Call 4 `scout.searchResearch({q:"sep-0053",source:"sep"})`, replaced P2's `get_doc_page` | yes, Preamble only | yes: Status Final, v1.0.0, dates, authors; SEP-60 aside | none (partial/single to partial/single); Final gained, off-chain lost | pointer (fact swap, no verdict effect) | traced |
| q-sep24-interactive-deposit-flow | 1 | Call 3: `SEP-24`, `SEP-10`; Calls 4-6: `sep24` (from path) | no | none | no | none (correct/single to correct/single) | none (variance) | traced |
| q-sep24-interactive-deposit-flow | 2 | Call 3: `SEP-24`, `SEP-10`; Calls 6, 7: `sep24` (from path) | yes for SEP-24, Calls 4 and 5 (same call twice); SEP-10 not followed | yes, Preamble only (Active, v3.8.0) | yes: "v3.8.0, Active, updated 2025-09-10", outside golden | none (correct/single to correct/single) | none | traced |
| q-sep6-sep24-sep31-choice | 1 | Call 3: `SEP-31`, `SEP-24`, `SEP-6` | no | none | no | none (partial/single to partial/single) | none (variance) | traced |
| q-sep6-sep24-sep31-choice | 2 | Call 3: `SEP-12`, `SEP-38`, `SEP-24` (SEP-6, SEP-31 cut by the cap of three) | no | none | no | none (partial/single to partial/single) | none (variance) | traced |

Notes beyond the brief:
- No non-sep/cap series and no title-case token appeared in any of the six passes.
- The sentence fires on tokens inside `get_doc_page` path strings (`sep24` in sep24 R1 Calls 4-6 and R2 Calls 6-7), so it re-fires after the identifier has been researched or followed.
- The cap of three chose SEP-12, SEP-38 and SEP-24 over SEP-6 and SEP-31 in sep6 pass 2, though the question is about SEP-6 and SEP-31.
- In the sep24 R2 follow, the agent sliced the research result to 1500 chars, saw only `meta`, and repeated the identical call. That is a duplicate research call, but it rode in an execute that was needed anyway.
- No verdict or judge-tier move versus P2 in any of the six passes. The only fact-level change tied to a pointer follow is sep-53 pass 2 (Final gained, off-chain lost).
=== group 6
# R trace, rows q-soroban-oz-token and q-zk-host-functions-status

Call numbers are the packet's Call n (Call 2 is the empty `search`; the `execute` calls start at Call 3).

## q-soroban-oz-token

P2 baseline: partial (judge tier single). Calls: search, execute 3 (skills + scout.searchRepos + search_docs), execute 4 (get_doc_page, invalid-args error), execute 5 (get_doc_page ok). P2 had no `scout.searchResearch` call and no pointer.

### pass 1
- **Fires**: Call 3 only. One sentence, for `SEP-41` (named in the query text `"SEP-41 token interface OpenZeppelin"`): "If `SEP-41` names a document, `scout.searchResearch` holds documents of source `sep`: call it with `{ q: "SEP-41", source: "sep" }`." The agent had not researched SEP-41 (it made no `scout.searchResearch` call).
- **Followed?** No. Pass 1 ended after Call 3 (turns: 4; one `search`, one `execute`). No later `execute`, so no research call. Calls and turns added: none.
- **What the follow returned**: not applicable.
- **Did the answer use it?** Nothing in the answer comes only from an exact row; no research row was ever returned. The answer states nothing wrong and hedges nothing because of the pointer. Its own gap list ("I did not read the SEP-41 spec, so I can't confirm method by method that `FungibleToken` covers it") is the same hedge P0, P1 and P2 made.
- **Substitution**: The pass made no Docs call that P2 made except the `get_doc_page` reads (P2 Calls 4 and 5). That is not a displacement by the follow, because no follow occurred. The agent simply stopped after Call 3, and the answer cites the docs page from the `search_docs` snippet. Facts in the P0/P1/P2 answers and missing here: the Confidential Token and RWA token, the Token Vault (SEP-56) and Contract Wizard notes, and the TTL caveat. All came from the full docs page or from sections this pass did not read. They are not tied to the pointer; the agent chose to stop earlier.
- **Series**: none (only `sep`). No title-case token.
- **Re-fire**: none.
- **Verdict move vs P2**: partial (single) to partial (panel). The same verdict. The missing fact is the same (audits scoped to specific releases), and the rationales agree. Cause: `judge` (tier only). Traced: yes. The pointer rendered but the agent never acted on it, so it cannot account for the answer.

### pass 2
- **Fires**: Call 3 only, for `SEP-41` (query `"OpenZeppelin SEP-41 fungible token"`). Same sentence as pass 1. The agent had not researched it. Calls 4 and 5 (`get_doc_page` only) name no identifier, so they carry no pointer.
- **Followed?** No. Calls 4 and 5 are `stellarDocs.get_doc_page({path:"docs/tools/openzeppelin-contracts"})` (invalid-args error) and the same call with a leading slash (ok). No `scout.searchResearch` anywhere. The two `get_doc_page` calls are the same two calls P2 made, so the pass added no calls or turns relative to P2 (turns: 6 against P2's 6).
- **What the follow returned**: not applicable.
- **Did the answer use it?** Nothing in the answer comes only from an exact row. It hedges "I didn't find a source that states in so many words that the base `FungibleToken` trait implements the full SEP-41 interface", the same hedge P2 made. That hedge is not caused by the pointer. The answer links the SEP-41 file URL (`.../ecosystem/sep-0041.md`) as a pointer for the reader, never read.
- **Substitution**: none; the Docs reads P2 made are all present.
- **Series**: none. No title-case token.
- **Re-fire**: none.
- **Verdict move vs P2**: partial (single) to partial (panel). The same verdict, with the same missing fact (audit scoping). Cause: `judge` (tier only). Traced: yes; the pointer was ignored.

## q-zk-host-functions-status

P2 baseline: correct (judge tier single). Calls: search, execute 3 (zk-proofs skill sections), execute 4 (`stellarDocs.search_docs`). P2's calls name no identifier, so the pointer would not have fired in P2.

### pass 1
- **Fires**: Call 4 only, for `CAP-0075` and `CAP-0080`, both named in the `search_meeting_notes` query `"STARK Poseidon BN254 CAP-0075 CAP-0080"`. Each got "If `CAP-0075` names a document, `scout.searchResearch` holds documents of source `cap`: call it with `{ q: "CAP-0075", source: "cap" }`. A row it marks exact is the document itself." The agent had not researched either CAP; the CAP numbers came from the skill table. `CAP-0059` and `CAP-0074` were not named in any call, so they got no sentence.
- **Followed?** No. The answer came after Call 4 (turns: 5). Pass 1 made only two `execute` calls (3, 4) and no `scout.searchResearch`. Calls and turns added: none.
- **What the follow returned**: not applicable.
- **Did the answer use it?** Nothing in the answer comes only from an exact row. The answer says "I did not read the CAP texts themselves" and lists the CAP file URL pattern. That is the same disclaimer P2 made ("I didn't read the CAP texts themselves"). No wrong claim and no new hedge due to the pointer.
- **Substitution**: P2's Call 4 was `search_docs` only. This pass's Call 4 ran `search_docs` plus `search_meeting_notes`. That addition came before the pointer rendered, so it is not caused by it. The pass lost nothing the P2 answer needed. All four CAPs and Protocol numbers match. The extra fact in this pass's answer (the OpenZeppelin audit report dated 2026-09-18) comes from the skill's Noir walkthrough, which this pass read in Call 3.
- **Series**: `cap` only (CAP-0075, CAP-0080). No title-case token.
- **Re-fire**: none.
- **Verdict move vs P2**: correct (single) to correct (single). No move. Cause: none. Traced: yes (pointer rendered, not followed, answer same in kind).

### pass 2
- **Fires**: Call 3 (the pass's only `execute`), for `CAP-74` and `CAP-75`, both named in the `search_meeting_notes` query `"CAP-74 CAP-75 BN254 Poseidon"`. Sentences: "If `CAP-74` names a document, `scout.searchResearch` holds documents of source `cap`: call it with `{ q: "CAP-74", source: "cap" }`..." and the same for `CAP-75`. The agent had not researched either. The CAP-0074 and CAP-0075 spellings in the skill sections returned by the same call are results, not call arguments.
- **Followed?** No. The pass had one `execute`, then the answer (turns: 4). No `scout.searchResearch` call. Calls and turns added: none. This pass was the shortest of the row's passes.
- **What the follow returned**: not applicable.
- **Did the answer use it?** Nothing in the answer comes only from an exact row. The answer cites `.../core/cap-0074.md` as a source, with "(CAP-0059, 0075 and 0080 follow the same path)", which it never fetched, and cites meeting dates (2025-10-02, 2025-10-09, 2026-01-29) from the meeting-note hits. The answer hedges "This is my reading of the roster above. The tools did not return an explicit statement about STARK support." That hedge is the same kind P2 made ("my inference") and is not due to the pointer.
- **Substitution**: P2's Call 4 was `stellarDocs.search_docs`. This pass dropped that Docs search and ran `search_meeting_notes` alone in the same call as the skill read. The follow did not take its place (no follow). Fact differences: the P2 answer's Poseidon library link (`rs-soroban-poseidon`) and audit link are absent here; the P2 answer's "Groth16 trusted setup" point is absent here. The answer here adds CAP discussion dates and the Goldilocks/BabyBear inference. Neither the loss nor the gain is tied to the pointer: the pass shaped its calls before the pointer rendered and then stopped.
- **Series**: `cap` only. No title-case token.
- **Re-fire**: none.
- **Verdict move vs P2**: correct (single) to correct (single). No move. Cause: none. Traced: yes (pointer rendered, not followed).

## Summary table

| row | pass | fired (tokens) | followed | exact row | answer used it | move vs P2 | cause | traced? |
|---|---|---|---|---|---|---|---|---|
| q-soroban-oz-token | 1 | SEP-41 (Call 3) | no | none | no | partial (single) to partial (panel); same verdict | judge | traced |
| q-soroban-oz-token | 2 | SEP-41 (Call 3) | no | none | no | partial (single) to partial (panel); same verdict | judge | traced |
| q-zk-host-functions-status | 1 | CAP-0075, CAP-0080 (Call 4) | no | none | no | correct (single) to correct (single); none | none (no move) | traced |
| q-zk-host-functions-status | 2 | CAP-74, CAP-75 (Call 3) | no | none | no | correct (single) to correct (single); none | none (no move) | traced |

Across these four passes the pointer rendered every time (SEP-41 twice; CAP-0075 and CAP-0080; CAP-74 and CAP-75) and was never followed. The agent made no `scout.searchResearch` call in any of them, so no exact row came back and no answer wording depends on one. Series seen: `sep` and `cap` only; no title-case token. No re-fire.
