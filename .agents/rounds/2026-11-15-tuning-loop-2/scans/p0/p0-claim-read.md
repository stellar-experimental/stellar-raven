# P0 governance and attribution read (amended rubric: R1; support classes of A2; uncut results)

Reader: Claude Sonnet 5.5 subagents, three chunks (A: 8, B: 8, C: 7 packets), brief `eval/qa/claim-read-brief.md` at 06b15651. Tuning rows only; packets built by `eval/qa/claim-read-packets.mjs`. One violation was re-checked by the lane (same model family; not an independent second reader).

---

# Chunk 1

## P0 / q-crp-oz-rwa-erc3643-trex
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Stellar's docs list it as an audited module." | 1 | bare | no | no | Stellar Docs search hit for the RWA (ERC-3643) Token sits under developers.stellar.org/docs/tools/openzeppelin-contracts#audited-modules-available, and the Tools Overview hit calls OpenZeppelin Stellar Contracts "a collection of audited contracts"; call 3 returned the page's RWA token text. Names the source (Stellar's docs) but gives no source date. |

## P0 / q-edge-factcheck-soroswap-first-amm
none: no statement of the four kinds

## P0 / q-hot-sdf-xlm-holdings-sales
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SDF holds XLM under a formal mandate, adopted in 2019 and updated on 2025-12-12." | 2 | attributed | no | no | Returned the SDF mandate pages (stellar.org/foundation/mandate and /mandate/2019, "first announced Nov 5, 2019") and the 2025-12-12 "An Updated Mandate" post ("in 2019 the SDF adopted a formal mandate"); the mandate is SDF's own decision and these are its records. Answer cites the post URL. |
| 2 | "The 2019 burn happened alongside the mandate announcement of Nov 2019. The post says 'after today's burn'..." | 2 | attributed | no | no | Returned the SDF's Next Steps post (2019-11-04) with "after today's burn" and 6B kept from the giveaway pool; Stellar Docs lumens page (call 1/3) shows burnedLumens about 55.44B as of 2026-07-21. |
| 3 | "I found no announcement or plan for another burn." | 2 | hedged | no | no | Source-scoped absence: the returned SDF mandate pages, the 2025-12-12 update and the 2019 post show no burn plan; no source named that is unreturned. Call 1 result was cut by the host (artifact), but calls 2 and 3 returned the relevant SDF posts in full. |

## P0 / q-pc-quantum-preparedness-dormant
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SDF announced the QPP on 2026-06-09. It is a three-stage roadmap to migrate the network to post-quantum cryptography by '2027+'. Lumenloop's summary of the announcement describes the stages" | 4 | attributed | no | no | Date, stages and "2027+" come only from the Lumenloop content row for stellar.org/blog/foundation-news/introducing-the-quantum-preparedness-plan (2026-06-09); the post itself was not returned (answer says so). The 2026-09-17 meeting note (Stellar Docs) independently confirms SDF "published a three-stage quantum readiness plan" with CAP-87 as the first stage. |
| 2 | "CAP-87 is the Stage 1 proposal. It adds ML-DSA signature verification host functions to Soroban. It was discussed at the 2026-09-17 protocol meeting. Those notes say network-level signatures are not part of CAP-87." | 2 | attributed | no | no | 2026-09-17 Protocol Discussion meeting note returned in call 1 and call 2 ("CAP-87 is the first stage: add post-quantum signature verification to Soroban as host functions... Network-level signatures are not part of this CAP"); closing section confirms the CAP-87 discussion. |

## P0 / q-scf-instawards
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Instawards were approved in September and October 2026 in Argentina, Bolivia, Colombia, Costa Rica, Ghana, Mexico, Nigeria, Peru and the Philippines." (SDF ambassador update, 2026-11-06) | 3 | attributed | no | no | Returned the SDF blog post stellar-ambassador-program-september-october-2026 (2026-11-06), whose Instawards section lists these approvals; it is the foundation's own post with no decision record returned. Answer names the post, URL and date. |

## P0 / q-smart-account-scoped-policy-signers
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "An OpenZeppelin audit of the stellar-contracts library (v0.5.0 re-audit) lists `simple_threshold.rs`, `spending_limit.rs` and `weighted_threshold.rs` policies, plus `ed25519` and `webauthn` verifiers, in the `accounts` package." | 2 | bare | no | no | Scout research row for stellarsecurityportal.com/report/87 returned the report's Scope text listing those files under packages/accounts. Names the audit and URL but gives no date, so the form is bare. |

## P0 / q-soroban-pre-mainnet-security-steps
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Run a bug bounty. SDF runs a consolidated HackerOne program, effective 2026-05-07 (https://hackerone.com/stellar, https://stellar.org/grants-and-funding/bug-bounty)." | 4 | attributed | no | no | Only Scout research rows were returned (titles "SDF bug-bounty consolidation (effective 2026-05-07)" and the hackerone.com/stellar policy title, dated 2026-05-07) with content cut to empty; no program text. Cited URLs and date match the returned rows. |
| 2 | "Apply to the Soroban Security Audit Bank. This is SDF's program to help ecosystem projects pay for security review at key growth milestones." (2025-05-29 and 2024-03-28 posts) | 3 | attributed | no | no | Scout rows from the two SDF blog posts were returned: the 2025-05-29 post text (quoted line about supporting ecosystem projects with security review at critical growth milestones) and the 2024-03-28 post text (email to join the Audit Bank). SDF's own posts; no decision record. |
| 3 | "SEP-0055 (Draft): build in GitHub Actions and stamp `source_repo=github:<owner>/<repo>` into the WASM metadata." | 1 | bare | no | no | Skill text returned via codemode.skill.read (skills.stellar-dev.smart-contracts, "Verify your build": "SEP-0055 (Draft) closes that gap"); answer cites the skill's pinned URL but no date. |

## P0 / q-soroban-vuln-classes
Claim statements: 5   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Veridise's audit of Soroban Core (2025-09-26) includes a Critical 'Denial of Service During Authorization' finding in `require_auth_enforcing()`." | 2 | attributed | no | no | Scout row for stellarsecurityportal.com/report/42 (2025-09-26) returned the report text: "Denial of Service During Authorization, Severity Critical ... require_auth_enforcing()". |
| 2 | "Veridise's 2024-01-02 report includes a 'Metering Happens after Allocation' logic error. Source: https://stellarsecurityportal.com/report/42" | 2 | attributed | no | no | Returned in the report/28 row (Veridise, 2024-01-02): "V-SOR-VUL-009: Metering Happens after Allocation ... Type Logic Error". The answer's cited URL (report/42) is the other Veridise report; the named source (the 2024-01-02 report) was returned. |
| 3 | "OpenZeppelin's Stellar Contracts v0.5.0 audit (2025-10-28) has a medium-severity issue in the smart-account `__check_auth` / `ContextRule` authorization model." | 4 | attributed | no | no | report/86 row (2025-10-28) returned the Issues excerpt on the __check_auth / ContextRule model, but "medium" appears only in the row's severity field, not in the returned report text. |
| 4 | "OtterSec's Soroban Governor assessment (2024-07-03) includes a medium-severity finding." | 4 | attributed | no | no | report/25 row (2024-07-03) returned only a garbled Vulnerabilities heading excerpt; "medium" comes only from the row's severity field. |
| 5 | "Other Soroban audits by Runtime Verification, Certora, Oak Security and Hashlock are indexed at stellarsecurityportal.com, for example reports 46, 64, 30, 13, 29, 50, 84 and 82." | 2 | hedged | no | no | Index-scoped statement; rows for reports 46, 64, 30, 13, 29 (Runtime Verification), 50 (Certora), 84 (Oak Security, "engaged by SDF to perform a security audit of Volta Soroban") and 82 (Hashlock) were returned with report excerpts. |

## Totals
Packets: 8   Claim statements: 16   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0

---

# Chunk 2

## P0 / q-data-network-metrics-sources
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds

## P0 / q-edge-oos-solana-vs-aptos
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds

## P0 / q-nft-vault-contract-standards
Claim statements: 8   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SEP-0050 ... Its authors are OpenZeppelin, Boyan Barakov and Özgün Özerk." | 2 | attributed | no | no | Call 1 scout.searchResearch row for sep-0050 returns the SEP's own preamble (Author line); host marks it as the named document itself; answer cites the spec URL and says the preamble lists it. |
| 2 | "The preamble lists Status: Draft, Version 0.1.0, created 2025-03-10." (SEP-0050; "Both SEPs are still Draft") | 2 | attributed | no | no | Same sep-0050 preamble row shows Status: Draft, Created 2025-03-10, Version 0.1.0; answer names the preamble and spec URL, dated as of 2026-11-15. |
| 3 | "SEP-0039 ('Interoperability Recommendations for NFTs', Draft, 2022) also appeared in the results." | 2 | hedged | no | no | Call 1 research row returns the sep-0039 preamble (Status: Draft, Created 02-22-2022). Host labels non-queried rows candidates, but the returned text is the standard's own header; "appeared in the results" is hedged. |
| 4 | "SEP-0056 ... Its authors are OpenZeppelin, Boyan Barakov, Özgün Özerk and Sentinel." | 2 | attributed | no | no | Call 1 scout.searchResearch row for sep-0056 returns the preamble (Author line); host marks it as the named document; spec URL cited. |
| 5 | "The preamble lists Track: Standard, Status: Draft, Version 0.1.2, created 2025-11-04, updated 2025-11-06." | 2 | attributed | no | no | Same sep-0056 preamble row shows all these fields; preamble and spec URL named, as of 2026-11-15. |
| 6 | "SEP-0041 ... It is Draft, v0.5.2, updated 2026-08-24" | 2 | attributed | no | no | Call 1 research rows (a and b) return the sep-0041 preamble with Status: Draft, Version 0.5.2, Updated 2026-08-24 (not the query's named doc, but its own header text); spec URL cited. |
| 7 | "The official docs page lists these audited modules: .../openzeppelin-contracts#audited-modules-available" (NFT module, Fungible Token Vault) | 1 | attributed | no | no | Call 1 stellarDocs.search_docs returned that page at the #audited-modules-available section (snippets show the Non-Fungible Token module and Token Vault); "audited" heading appears only in the returned URL anchor, the snippet is a section of the page. |
| 8 | "The SEP's authors are OpenZeppelin, but confirm the mapping in the repo." | 2 | hedged | no | no | Authors line in the sep-0050 preamble row; the statement is hedged and the NFT-module-to-SEP mapping is explicitly not claimed. |

## P0 / q-pc-sponsored-reserves
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Sponsored reserves, as of 2026-11-15 (Stellar docs, CAP-33 Final)." | 2 | attributed | no | no | Call 1 scout.searchResearch returned the CAP-0033 preamble (Status: Final), marked by the host as the named document itself; the CAP URL is listed under Sources and the date is given. |

## P0 / q-sep-43-web-wallet-api
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Preamble (as of 2026-11-15) - Status: Draft." | 2 | attributed | no | no | Call 3 scout.searchResearch returned the sep-0043 Preamble chunk (Status: Draft, Version 1.2.1, Created 2024-04-11); host marks it as the document itself; answer names the preamble, a date, and the spec URL. |
| 2 | "Authors: Piyal Basu, Leigh McCulloch, George Kudrayvtsev, Enrique Arrieta and Orbit Lens." | 2 | attributed | no | no | Same sep-0043 Preamble chunk in call 3 lists exactly these five authors; listed under the answer's Preamble heading with date and spec URL. |

## P0 / q-soroban-check-auth-custom-account
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "smart-account-kit works with OpenZeppelin context rules on the audited stellar-contracts account." | 1 | bare | no | no | Call 1 skill read (skills.stellar-dev.dapp, smart-accounts.md) returns the "Choosing between the two kits" table with "on the audited stellar-contracts account"; no audit report was returned, and the answer names no auditor or date. |

## P0 / q-soroban-reentrancy
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The SDF blog post ... says Solidity allows contract re-entry, which enabled The DAO hack (about $60M lost)." | 4 | hedged | no | no | Call 2 scout.searchResearch row (source sdf-blog, caveat unverified-match, candidate lane) returns the blog text "one of the most famous hacks was The DAO hack, which led to a loss of $60M"; no primary post-mortem returned. Phrased as what the named post says, and the post was returned. |
| 2 | "A Moonlight (privacy-channel) report describes a temporary-storage reentrancy guard that panics with ReentrantCall, and rates it 'Informative' (stellarsecurityportal.com/report/78)." | 4 | hedged | no | no | Call 1 scout.searchResearch row "Moonlight: Runtime Verification" (report/78, source audit) returned a short chunk with the guard and "Severity: Informative"; a vector-search chunk, not the full report; the answer says it read only short excerpts. |
| 3 | "A Certora report on the Spectra bridge lists 'Arbitrary Execution & Reentrancy' as a threat vector (report/77)." | 4 | hedged | no | no | Call 1 scout.searchResearch row "Spectra Finance: Certora (Spectra Bridge - Certora Report)" (report/77) returned a chunk with that threat-vector line; excerpt only, and the answer says so. |

## P0 / q-zk-host-functions-status
Claim statements: 5   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "As of 2026-11-15, these zero-knowledge host functions are live on Stellar, according to the zk-proofs skill" (CAP-0059 Protocol 22+, CAP-0074 and CAP-0075 Protocol 25+, CAP-0080 Protocol 26+) | 1 | hedged | no | no | Call 1 skill read (skills.stellar-dev.zk-proofs, "what's available") returns the table with these CAPs marked Available at those protocol versions; the skill is named and was returned. |
| 2 | "The Stellar docs page for BN254 attributes g1_add and g1_mul to CAP-74 at Protocol 25." | 1 | attributed | no | no | Call 2 stellarDocs.search_docs hit docs/build/apps/zk#bn254-host-functions: "X-Ray (Protocol 25) added these functions through CAP-74"; URL cited and returned. |
| 3 | "CAP-74 and CAP-75 were discussed in the 2025-10-02 and 2025-10-09 protocol meetings." | 1 | attributed | no | no | Call 2 returned both meeting-note hits (meetings/2025/10/02 on CAP-74; meetings/2025/10/09 on CAP-75); dated meetings named and URLs cited. |
| 4 | "Its audited commit also differs from the current release." (UltraHonk verifier, rs-soroban-ultrahonk) | 1 | bare | no | no | Call 1 skill text on the Noir walkthrough says OpenZeppelin audited an earlier commit (report dated 2026-09-18) and "the audited revision is not the release revision"; the audit report itself was not returned. The answer names no source in this sentence. |
| 5 | "CAP-87, covered in the 2026-09-17 protocol meeting, adds post-quantum signature verification as host functions." | 1 | attributed | no | no | Call 2 hit meetings/2026/09/17/protocol#why-post-quantum-signatures: "CAP-87 is the first stage: add post-quantum signature verification to Soroban as host functions"; the dated meeting is named and the URL cited. |

## Totals
Packets: 8   Claim statements: 20   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0

---

# Chunk 3

## P0 / q-defi-agent-identity-stellar-experimental
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "I found no audit, no SCF award, and no ecosystem announcement tied to an 8004-on-Stellar project." | 5 | hedged | no | no | Source-scoped absence ("I found", "single search pass, not proof"); the scripts searched Scout repos/research, Lumenloop semantic and Stellar Docs and no result shows an audit; no unreturned source is named. Source named: no. |

## P0 / q-hot-fee-pool-burn-deflation
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Inflation of 1% a year ended by validator vote on Oct 28, 2019." | 1 | bare | no | no | Execute call 3 returned the Stellar Docs Lumens page (developers.stellar.org/docs/learn/fundamentals/lumens), inflationLumens definition: "network inflation was ended by validator vote on October 28, 2019." Source named: no. |

## P0 / q-org-sdf-structure-mandate
Claim statements: 3   Violations: 1   Class 3 bare: 1   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "In 2019 SDF adopted a formal mandate on using XLM, with the mission wording above." | 3 | bare | yes | no | Only SDF's own blog post (Dixon, 2025-12-12, "in 2019 the SDF adopted a formal mandate to use the XLM entr...") states the adoption; the 2019 mandate page returned does not state it; the sentence names no source. Source named: no. |
| 2 | "A blog post by Denelle Dixon dated 2025-12-12 announced an updated mandate." | 3 | attributed | no | no | Execute call 1 returned the SDF blog post (stellar.org/blog/foundation-news/an-updated-mandate-for-a-growing-stellar-ecosystem, 2025-12-12, author Denelle Dixon); it is SDF's own post about its own mandate, with no separate decision record. Source named: yes. |
| 3 | "The 2025 year-in-review, dated 2026-02-13 ... says the mandate framework was updated, moving from Stellar Growth ... to a new Assets and Liquidity fund" | 3 | attributed | no | no | Execute call 1 returned the SDF blog post (stellar.org/blog/foundation-news/2025-year-in-review, 2026-02-13) with that wording; a party's statement about itself. Source named: yes. |

## P0 / q-protocol-tier1-requirements
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds

## P0 / q-sep-45-contract-auth
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds

## P0 / q-soroban-oz-token
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds

## P0 / q-soroban-storage-types
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds

## Totals
Packets: 7   Claim statements: 5   Violations: 1   Class 3 bare: 1   Unreturned attributions: 0
