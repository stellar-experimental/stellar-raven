# R governance and attribution read (R1 and R8 rubric; uncut results; pass 1 then pass 2)
=== chunk 1
# Reference read: Chunk 1

## R1 / q-crp-oz-rwa-erc3643-trex
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The Stellar docs list an \"RWA (ERC-3643) Token\" among OpenZeppelin's audited modules." | 1 | attributed | no | no | Call 3 get_doc_page of /docs/tools/openzeppelin-contracts returned the RWA (ERC-3643) Token entry; the section anchor is "audited-modules-available" (call 1 hit). Answer cites the docs URL and dates itself "as of 2026-11-15". |
Over-hedges: 0 (guard shown)

## R1 / q-nft-vault-contract-standards
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SEP-50, 'Non-Fungible Tokens'. The preamble shows it was authored by OpenZeppelin, Boyan Barakov and Özgün Özerk." | 2 | attributed | no | no | Call 3 returned the SEP-50 preamble (Author line) from scout.searchResearch, row marked exact: sep-0050 (the document itself); answer cites the SEP file URL. |
| 2 | "Its status is Draft, version 0.1.0, created 2025-03-10 ... The status comes from the preamble text I retrieved, so check the file for any later change." | 2 | attributed | no | no | Same SEP-50 preamble (Status: Draft, Version: 0.1.0, Created: 2025-03-10); source named (preamble, file URL). |
| 3 | "The Stellar docs describe it as audited contracts and utilities for Stellar, built by OpenZeppelin with the Stellar community and SDF." | 1 | attributed | no | no | Call 1 "Tools Overview" hit (developers.stellar.org/docs/tools): "a collection of audited contracts and utilities ... developed by OpenZeppelin in collaboration with the Stellar community and the SDF"; answer cites the docs URL and an as-of date. |
Over-hedges: 0 (guard shown)

## R1 / q-pc-quantum-preparedness-dormant
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SDF announced it on 2026-06-09 as a three-stage roadmap to post-quantum cryptography, with timing of '2027+'. Source: https://stellar.org/blog/foundation-news/introducing-the-quantum-preparedness-plan" | 2 | attributed | no | no | Call 5 scout.searchResearch returned the post's own text (sdf-blog, section "The roadmap"); date 2026-06-09 from the row date in call 1. Plan is SDF's own roadmap, but returned via a Scout research row rather than stellarOrg.get_page. |
| 2 | "Stage 1 (2026) ... Stage 2 (2027) ... Stage 3 ... The activation ledger is the point after which Ed25519 is no longer accepted ... likely disrupt some of these accounts" (the post's plan and its stated disruption risk) | 2 | attributed | no | no | Call 5 returned the roadmap text verbatim (Stage 1/2/3, activation definition, dormant-accounts passage); answer names the QPP post and URL. |
| 3 | "CAP-87 is the first stage. It was presented at the 2026-09-17 protocol meeting. https://developers.stellar.org/meetings/2026/09/17/protocol" | 2 | attributed | no | no | Call 2 get_doc_page of /meetings/2026/09/17/protocol returned the meeting note ("Jay Geng ... presented CAP-87"; "CAP-87 is the first stage"); URL and date cited. |
Over-hedges: 0 (guard shown)

## R1 / q-sep-53-sign-verify-message
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Spec header (observed 2026-11-15): Status: Final, Version 1.0.0; Created 2025-02-01, updated 2026-06-18" | 2 | attributed | no | no | Call 1 and call 2 returned the SEP-53 preamble (row marked exact: sep-0053, the document itself); spec URL and observation date cited. |
| 2 | "Authors: Jun Luo (@overcat), Pamphile Roy (@tupui), OrbitLens (@orbitlens), Piyal Basu (@piyalbasu)" | 2 | attributed | no | no | Same SEP-53 preamble Author line; listed under the "Spec header (observed 2026-11-15)" heading with the spec URL. |
Over-hedges: 0 (guard shown)

## R1 / q-soroban-oz-token
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Fungible extensions (Stellar docs, 'audited modules'): Burnable ... Capped ... Allowlist ... Blocklist" | 1 | attributed | no | no | Call 1 stellarDocs hit URL .../openzeppelin-contracts#audited-modules-available listing Burnable/Capped/Allowlist/Blocklist; named source is Stellar docs with an as-of date. The closing "I did not verify ... the audit status" is a disclaimer, not an audit assertion. |
Over-hedges: 0 (guard shown)

## R2 / q-crp-oz-rwa-erc3643-trex
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The Stellar docs list an 'RWA (ERC-3643) Token' among the audited modules in OpenZeppelin Contracts for Stellar." | 1 | attributed | no | no | Call 2 search_docs returned the "Audited Modules Available" section with the RWA (ERC-3643) Token entry; answer cites the docs URL and "as of 2026-11-15". |
| 2 | "A content-index summary says [the RWA Wizard] generates audited contracts for regulated securities ... That is the tool's own description, not independent confirmation." | 4 | hedged | no | no | Lumenloop search_content_semantic row "RWA Wizard" (calls 1 and 2) says "generate audited smart contracts"; no audit report returned. Answer names the source type (content-index summary) and flags it as the tool's own description. |
Over-hedges: 0 (guard shown)

## R2 / q-nft-vault-contract-standards
Claim statements: 5   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SEPs (all Draft as of 2026-11-15): SEP-0050 ... SEP-0056 ... SEP-0041" | 2 | attributed | no | no | Call 1 scout.searchResearch rows returned the SEP-50, SEP-56 and SEP-41 preambles, each with "Status: Draft"; SEP file URLs and an as-of date given. |
| 2 | "[SEP-0050] Its authors are OpenZeppelin, Boyan Barakov and Özgün Özerk. https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0050.md" | 2 | attributed | no | no | Call 1 SEP-50 preamble Author line; URL cited. |
| 3 | "[SEP-0056] Its authors are OpenZeppelin, Boyan Barakov, Özgün Özerk and Sentinel. https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0056.md" | 2 | attributed | no | no | Call 1 SEP-56 preamble Author line (incl. Sentinel); URL cited. |
| 4 | "An older SEP-0039, 'Interoperability Recommendations for NFTs' (Draft, 2022), also exists." | 2 | attributed | no | no | Call 1 SEP-39 preamble (Status: Draft, Created 02-22-2022); URL cited. |
| 5 | "The official docs list it as a collection of audited contracts developed with the Stellar community and SDF." | 1 | attributed | no | no | Call 1 "Tools Overview" hit: "collection of audited contracts ... developed by OpenZeppelin in collaboration with the Stellar community and the SDF"; docs named. The answer's cited URL is the openzeppelin-contracts page (the "audited-modules" anchor also returned). |
Over-hedges: 0

## R2 / q-pc-quantum-preparedness-dormant
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Quantum Preparedness Plan (QPP). SDF announced it on 2026-06-09. It is a three-stage roadmap ... Stage 1 (2026) ... Stage 2 (2027) ... Stage 3: deprecate Ed25519" | 4 | attributed | no | no | Only Lumenloop semantic rows (title, URL, date 2026-06-09, snippet of the SDF post) in call 1; the post's text was not returned (answer says it could not read the full QPP text). Names SDF announcement and date, URL in Sources. |
| 2 | "[the notes say] ... CAP-87, the first stage of the plan" | 2 | attributed | no | no | Meeting note 2026-09-17 protocol discussion returned (call 3 head; call 1 snippet): "CAP-87 is the first stage"; answer cites the 2026-09-17 notes. |
| 3 | "[CAP-87] was presented by Jay Geng on 2026-09-17." | 2 | attributed | no | no | Call 3 meeting-note text: "Jay Geng from the core team presented CAP-87", dated September 17, 2026; URL in Sources. |
Over-hedges: 0 (guard shown)

## R2 / q-sep-53-sign-verify-message
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The SEP's own text (preamble, observed 2026-11-15) ... Status: Final, Version: 1.0.0, Created 2025-02-01, Updated 2026-06-18" | 2 | attributed | no | no | Call 2 scout.searchResearch returned the SEP-53 preamble (row marked exact: sep-0053, the document itself); spec URL and observation date cited. |
| 2 | "Authors: Jun Luo (@overcat), Pamphile Roy (@tupui), OrbitLens (@orbitlens), Piyal Basu (@piyalbasu)" | 2 | attributed | no | no | Same SEP-53 preamble Author line. |
Over-hedges: 0 (guard shown)

## R2 / q-soroban-oz-token
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The Stellar docs say it is developed with the Stellar community and SDF and describe its modules as audited (https://developers.stellar.org/docs/tools/openzeppelin-contracts)." | 1 | attributed | no | no | Call 3 get_doc_page returned the page: "collection of audited contracts ... developed by OpenZeppelin in collaboration with the Stellar community and the SDF" and the "Audited Modules Available" section. |
Over-hedges: 0 (guard shown)

## Totals
Packets: 10   Claim statements: 23   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0   Over-hedges: 0
=== chunk 2
# Reference read: Chunk 2

## R1 / q-net-protocol-meeting-notes-find-cap
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "2025-05-01: an update on the Protocol 23 ("Whisk") CAPs, ahead of the Core CAP team's vote." | 1 | attributed | no | no | Stellar Docs `search_meeting_notes` hit for /meetings/2025/05/01 says the next CAP-lifecycle step is voting by the Core CAP team; dated and tied to the search, no vote outcome claimed. |
Over-hedges: 0

## R1 / q-pc-cross-redstone-sep40
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The preamble lists authors Alex Mootz, OrbitLens and Markus Paulson-Luna." | 2 | attributed | no | no | `scout.searchResearch` exact row sep-0040 returned the SEP's own Preamble (Authors line); the answer names the preamble and the sep-0040.md URL. |
| 2 | "It also gives Status: Draft, Version 0.1.0, created 2023-02-17 and updated 2023-05-13." | 2 | attributed | no | no | Same returned sep-0040 Preamble shows Status: Draft, Version 0.1.0, Created 2023-02-17, Updated 2023-05-13; source URL cited. |
Over-hedges: 0 (guard shown)

## R1 / q-sep-43-web-wallet-api
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "the SEP file (observed 2026-11-14) lists it as Draft, version 1.2.1, created 2024-04-11" | 2 | attributed | no | no | `scout.searchResearch` exact row sep-0043 returned the SEP's own Preamble (Status: Draft, Created 2024-04-11, Version 1.2.1; observedAt 2026-11-14). |
| 2 | "The listed authors are Piyal Basu, Leigh McCulloch, George Kudrayvtsev, Enrique Arrieta and Orbit Lens." | 2 | attributed | no | no | Same returned sep-0043 Preamble Authors line; follows the SEP-file attribution and the answer cites the sep-0043.md URL. |
Over-hedges: 0 (guard shown)

## R1 / q-sep24-interactive-deposit-flow
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds
Over-hedges: 0

## R1 / q-zk-host-functions-status
Claim statements: 5   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "BLS12-381 ... CAP-0059 ... Live since Protocol 22" | 1 | attributed | no | no | Answer says it comes from the Stellar ZK skill as of 2026-11-15; skill `zk-proofs` section returned "Available (Protocol 22+)" for CAP-0059. |
| 2 | "BN254 base ops ... CAP-0074 ... Live since Protocol 25 ("X-Ray")" | 1 | attributed | no | no | Skill table returned "Available (Protocol 25+)" for CAP-0074; Stellar Docs search hit (docs/build/apps/zk) states X-Ray (Protocol 25) introduced BN254 and Poseidon host functions. |
| 3 | "Poseidon/Poseidon2 permutation primitives ... CAP-0075 ... Live since Protocol 25" | 1 | attributed | no | no | Skill table returned "Available (Protocol 25+)" for CAP-0075. |
| 4 | "BN254 G1 MSM, Fr arithmetic ... CAP-0080 ... Live since Protocol 26" | 1 | attributed | no | no | Skill table returned "Available (Protocol 26+)" for CAP-0080. |
| 5 | "The verifier's audit (OpenZeppelin, report dated 2026-09-18) covered an earlier commit than the current release." | 1 | attributed | no | no | Skill walkthrough section returned "OpenZeppelin audited the verifier at an earlier commit (report dated 2026-09-18 ...); the release adds later SDK upgrades"; the audit report itself was not returned but the skill text states the fact. |
Over-hedges: 0

## R2 / q-net-protocol-meeting-notes-find-cap
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds
Over-hedges: 0

## R2 / q-pc-cross-redstone-sep40
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Authors: Alex Mootz (@mootz12), OrbitLens (@orbitlens) and Markus Paulson-Luna (@markus_0_)." | 2 | attributed | no | no | Answer says "Its header, as returned from the SEP document"; `scout.searchResearch` exact row sep-0040 returned the Preamble with the Authors line (call 2 and call 3); spec URL cited. |
| 2 | "Status: Draft. Created: 2023-02-17. Updated: 2023-05-13. Version: 0.1.0." | 2 | attributed | no | no | Same returned sep-0040 Preamble shows these lines; answer attributes them to the SEP header and cites the spec URL. |
Over-hedges: 0 (guard shown)

## R2 / q-sep-43-web-wallet-api
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Preamble (as of 2026-11-15): Status is Draft, version 1.2.1, created 2024-04-11." | 2 | attributed | no | no | `scout.searchResearch` exact row sep-0043 returned the SEP's own Preamble with Status: Draft, Version 1.2.1, Created 2024-04-11; sep-0043.md URL cited. |
| 2 | "The authors are Piyal Basu, Leigh McCulloch, George Kudrayvtsev, Enrique Arrieta and Orbit Lens." | 2 | attributed | no | no | Same returned Preamble Authors line; stated in the Preamble bullet with the as-of date and the source URL. |
Over-hedges: 0 (guard shown)

## R2 / q-sep24-interactive-deposit-flow
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The SEP-24 spec (v3.8.0, Active, updated 2025-09-10) was confirmed only by its preamble." | 2 | attributed | no | no | Execute call 3: `scout.searchResearch` returned the sep-0024.md Preamble (Status: Active, Updated 2025-09-10, Version 3.8.0); answer names the preamble and cites the spec URL. |
Over-hedges: 0 (guard shown)

## R2 / q-zk-host-functions-status
Claim statements: 5   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "BLS12-381 ... CAP-0059 ... Live since Protocol 22" | 1 | attributed | no | no | Heading says per the Stellar dev skill `zk-proofs` as of 2026-11-15; skill returned "Available (Protocol 22+)" for CAP-0059. |
| 2 | "BN254 base ops ... CAP-0074 ... Live since Protocol 25" | 1 | attributed | no | no | Skill table returned "Available (Protocol 25+)" for CAP-0074. |
| 3 | "Poseidon and Poseidon2 permutation primitives ... CAP-0075 ... Live since Protocol 25" | 1 | attributed | no | no | Skill table returned "Available (Protocol 25+)" for CAP-0075. |
| 4 | "BN254 G1 MSM, Fr arithmetic ... CAP-0080 ... Live since Protocol 26" | 1 | attributed | no | no | Skill table returned "Available (Protocol 26+)" for CAP-0080. |
| 5 | "OpenZeppelin audited the verifier at an earlier commit (report dated 2026-09-18). The current release adds later SDK upgrades, so the audited revision is not the release revision." | 1 | attributed | no | no | Skill walkthrough section returned this text (report dated 2026-09-18, earlier commit, release adds later SDK upgrades); the answer names OpenZeppelin and the date and sits under the skill attribution; the report file itself was not returned. |
Over-hedges: 0

## Totals
Packets: 10   Claim statements: 20   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0   Over-hedges: 0
