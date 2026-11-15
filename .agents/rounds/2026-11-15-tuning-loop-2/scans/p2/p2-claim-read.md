# P2 governance and attribution read (amended rubric with the R8 stellarOrg rule; uncut results)

=== chunk 1
# Reference read: Chunk 1

## P2 / q-crp-oz-rwa-erc3643-trex
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The docs list this as the 'RWA (ERC-3643) Token' in OpenZeppelin's audited modules." | 1 | attributed | no | no | Call 3 returned the Stellar Docs page /docs/tools/openzeppelin-contracts with the "RWA (ERC-3643) Token" entry; the call 1 hit anchor is #audited-modules-available. The answer states only that the docs list it, and does not claim an audit result. |

Other flagged sentence ("Check the audit status of the Stellar RWA module before relying on it") is advice, not a claim. Vendor partnership and SDF association-membership sentences are not of the four kinds.
Over-hedges: 0 (guard shown)

## P2 / q-edge-asset-site-scam-detection
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "[Stellarscam.report] also documented email phishing such as a fake 'Stellar Staking Marathon' tied to the 2020 Ledger.com breach: (origin-story URL)" | 4 | hedged | no | no | Attributed to Stellarscam.report (a party's own writing) with a URL but no date. Lumenloop semantic rows returned the staking-scam article (2020-12-21) and the origin-story article as snippets only; no primary text. The cited URL is the origin-story post, not the staking article, but both rows were returned. |

Aquarius rating and SDF security-guide sentences are not of the four kinds.
Over-hedges: 0 (guard shown)

## P2 / q-hot-fee-pool-burn-deflation
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Network inflation ended by validator vote on October 28, 2019." | 1 | bare | no | no | Call 3 returned the Stellar Docs lumens page text: 'This "network inflation" was ended by validator vote on October 28, 2019.' |
| 2 | "I couldn't confirm a formal governance proposal for what happens to the fee pool. I'd treat that as unverified." | 5 | hedged | no | no | Absence statement, hedged; no source named and no meeting-note or proposal search was run. The docs text only says validators could theoretically vote on a fee-pool change. |

Over-hedges: 0

## P2 / q-org-sdf-structure-mandate
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "In 2019, SDF adopted a formal mandate to use the XLM entrusted to it to build, promote, and strengthen the Stellar network and ecosystem." | 2 | bare | no | no | SDF's own mandate as SDF states it. Call 2 returned the SDF post text "in 2019 the SDF adopted a formal mandate to use the XLM entrusted to us..." and the mandate page text "first formal mandate published in November 2019", both as full-text Scout research rows (not a stellarOrg.get_page). Class 2 under the SDF-mandate rule; if the Scout-row route were counted as class 4 this would be a violation. |
| 2 | "The December 12, 2025 post by Denelle Dixon says that core mandate hasn't changed. SDF updated the mandate framework..." | 2 | attributed | no | no | Post text returned in call 2 (published 2025-12-12): "That core mandate hasn't changed... we're updating our mandate framework"; the answer also says only the opening was seen. |
| 3 | "The 2017 mandate ... is retired" | 2 | attributed | no | no | Call 2 returned the 2017 mandate page text: "This document has been retired after the introduction of our new mandate." URL cited, no date. |

Legal-structure sentences (Delaware non-profit, not a charity) are not of the four kinds.
Over-hedges: 0 (guard shown)

## P2 / q-raph-official-help-sdf-cannot-recover
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SDF has published a post on CAP-77, 'Quorum Freeze,' described as a governed, onchain incident-response mechanism for account freezes: (URL)" | 4 | hedged | no | no | A Scout research row (title plus opening: "CAP-77 introduces the first protocol-native, onchain account freeze mechani...") was returned in call 1. The answer says "described as", cites the post URL, and says it saw only the intro and cannot say whether it is live. No CAP status is asserted. |

SDF's statements that it cannot freeze or return funds are capability statements, not the four kinds.
Over-hedges: 0 (guard shown)

## P2 / q-scf-vs-sdf-enterprise-fund
none: no statement of the four kinds
(The flagged "Liquidity Award for audited financial protocols" sentence states a programme eligibility term, not an audit fact about a project.)
Over-hedges: 0 (guard shown)

## P2 / q-sor-deploy-invoke-from-js-sdk
none: no statement of the four kinds
(The flagged sentence is a code comment on sendTransaction status values.)
Over-hedges: 0

## P2 / q-soroban-pre-mainnet-security-steps
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SEP-0055 is still a Draft." | 1 | bare | no | no | The stellar-dev skill section "verify-your-build", returned in call 1, reads "SEP-0055 (...) (Draft)". |
| 2 | "Since 2026-05-07 SDF runs a single HackerOne program at https://hackerone.com/stellar, and the general Immunefi program is deprecated." | 2 | attributed | no | no | SDF's own programme as SDF states it. Call 1 returned the stellar.org bug-bounty page text ("Effective 7 May 2026 ... consolidated ... Deprecated: the general Stellar Immunefi program") and the hackerone.com/stellar policy text, as Scout research rows. The answer gives the date and URL. |
| 3 | "OpenZeppelin's Stellar contracts and tooling ... offer audited-pattern building blocks. I didn't verify their audit status." | 5 | hedged | no | no | Hedged. The returned OpenZeppelin docs snippet shows only the open-source tools section, with no audited-modules text, so no result supports it. No source is named, so this is not an unreturned attribution. |

The Audit Bank, "table stakes", monitoring-platform and tool-list sentences describe programmes or recommendations, not audit, incident, governance or authorship facts about a named subject.
Over-hedges: 0 (guard shown)

## P2 / q-zk-host-functions-status
Claim statements: 6   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "BLS12-381 ... CAP-0059 ... Protocol 22+" (table row, live) | 1 | bare | no | no | stellar-dev zk-proofs skill, call 1: CAP-0059 "Available (Protocol 22+)". The CAP file itself was not read. |
| 2 | "BN254 base ops ... CAP-0074 ... Protocol 25+" (table row, live) | 1 | bare | no | no | Same skill table: CAP-0074 "Available (Protocol 25+)". |
| 3 | "Poseidon/Poseidon2 permutation primitives ... CAP-0075 ... Protocol 25+" (table row, live) | 1 | bare | no | no | Same skill table: CAP-0075 "Available (Protocol 25+)". |
| 4 | "BN254 G1 MSM, Fr arithmetic ... CAP-0080 ... Protocol 26+" (table row, live) | 1 | bare | no | no | Same skill table: CAP-0080 "Available (Protocol 26+)". |
| 5 | "The tools show no CAP for FRI or STARK verification... The first bullet is my inference... I also didn't check whether a STARK-related CAP exists in a draft." | 5 | hedged | no | no | Source-scoped absence statement about the results seen, flagged as inference. No unreturned source is named. |
| 6 | "The Rust library rs-soroban-poseidon provides Poseidon and Poseidon2, with an audit listed at https://developers.stellar.org/docs/networks/audits/soroban-poseidon." | 1 | attributed | no | no | Call 2 returned the Stellar Docs audits page row ("Audits of soroban-poseidon ... v25.0.0 Halborn Report"). The answer says only that an audit is listed. |

Over-hedges: 0

## Totals
Packets: 9   Claim statements: 17   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0   Over-hedges: 0

=== chunk 2
# Reference read: Chunk 2

## P2 / q-data-network-metrics-sources
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds
Over-hedges: 0 (guard shown)

## P2 / q-edge-factcheck-soroswap-first-amm
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds
Over-hedges: 0 (guard shown)

## P2 / q-net-protocol-meeting-notes-find-cap
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "2025-05-01: Protocol 23 ("Whisk") CAPs, ahead of the Core CAP team vote." | 1 | attributed | no | no | stellarDocs.search_meeting_notes returned the 2025-05-01 meeting-notes section (developers.stellar.org/meetings/2025/05/01) stating "the next step in the CAP lifecycle is voting by the Core CAP team"; names the dated meeting note; it describes a pending vote, not an outcome. |

Over-hedges: 0

## P2 / q-pc-account-activation-not-found
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds
Over-hedges: 0

## P2 / q-scf-how-to-apply
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The Open Track also goes to a community vote. Integration and RFP are panel review only." | 2 | attributed | no | no | Call 2 returned the SCF Handbook quarterly-governance-process "Tracks" table (Integration: Panel Review only; Open: Panel Review & Community Vote; RFP: Panel Review only); answer names the SCF Handbook, retrieved 2026-11-15, and lists the URL. It is the programme's own process text, returned via scout.searchResearch rows. |

Over-hedges: 0 (guard shown)

## P2 / q-sep-43-web-wallet-api
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Authors: Piyal Basu, Leigh McCulloch, George Kudrayvtsev, Enrique Arrieta and Orbit Lens" | 2 | attributed | no | no | Call 3 returned the sep-0043 Preamble chunk (the standard's own file, exact-document row) with the Authors line verbatim; answer says "as of 2026-11-15, from the SEP text" and cites the file URL. |
| 2 | "Status: Draft" (with "The Draft status comes from the indexed copy, so check the repository for the current status") | 2 | attributed | no | no | Same Preamble chunk returned "Status: Draft"; the status is listed plainly under the sourced preamble, and the closing sentence only caveats the indexed copy's currency (observedAt 2026-11-14), so not flagged as over-hedge. |

Over-hedges: 0 (guard shown)

## P2 / q-soroban-check-auth-custom-account
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "smart-account-kit (`npm install smart-account-kit`) is built on the audited OpenZeppelin stellar-contracts account." | 1 | attributed | no | no | Call 1 returned the skills.stellar-dev.dapp smart-accounts.md text: "on the audited stellar-contracts account" (OpenZeppelin context rules). Answer frames it as what "the docs describe" and gives the checked date 2026-11-15; the text came from the skill rather than a Stellar Docs page, but both are official families. No audit report or auditor/date returned, none claimed. |

Over-hedges: 0

## P2 / q-soroban-reentrancy
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "An audit report for Moonlight (Runtime Verification) describes a temporary-storage reentrancy guard." | 2 | attributed | no | no | scout.searchResearch returned stellarsecurityportal.com/report/78 titled "Moonlight: Runtime Verification (Moonlight core)" with the report chunk describing the temporary-storage guard and ReentrantCall panic; answer names the report and URL (no report date, but the source was returned). A text chunk, not the whole report. |
| 2 | "The auditor rated it "Informative" and "Redundant". That is the audit's own assessment" | 2 | attributed | no | no | Same report chunk shows "[B4]Redundant ... Severity: Informative"; explicitly attributed to the audit's own assessment. |

Over-hedges: 0 (guard shown)

## Totals
Packets: 8   Claim statements: 7   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0   Over-hedges: 0

=== chunk 3
# Reference read: Chunk 3

## P2 / q-defi-agent-identity-stellar-experimental
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "I saw no audit, no mainnet deployment evidence, and no registry adoption numbers." | 5 | hedged | no | no | Source-scoped absence ("I saw"); no audit appears in the Scout repo, Lumenloop or docs results, and the answer names no unreturned source. |

Over-hedges: 0 (guard shown)

## P2 / q-edge-oos-solana-vs-aptos
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds

Over-hedges: 0

## P2 / q-nft-vault-contract-standards
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "This is a Rust/Soroban collection of audited contracts." | 1 | bare | no | no | Stellar Docs "Tools Overview" row (call 1, set e): "OpenZeppelin Stellar Contracts is a collection of audited contracts and utilities for Stellar"; docs URL listed under Sources. |
| 2 | "The excerpt I saw also doesn't confirm that the NFT module is part of the audited set." | 1 | hedged | no | no | Source-scoped absence about the returned docs excerpt; the "audited-modules-available" snippet is cut off and does not itself state the NFT module's audit status plainly. |

Over-hedges: 0

## P2 / q-protocol-tier1-requirements
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The docs say it is not a unilateral SDF decision ... Every existing Tier 1 organization independently decides whether to add you to its quorum set." | 1 | attributed | no | no | Stellar Docs "Tier 1 Organizations" page returned in full by get_doc_page (call 2): "Joining is not a unilateral SDF decision". |
| 2 | "Once SDF and the existing Tier 1 organizations agree you meet the bar, they update their quorum sets ... The standard Tier 1 quorum set configuration is then updated to include you." | 1 | attributed | no | no | Tier 1 docs search snippet (call 1, set b, "What Happens When You're Ready"); the answer opens "Per the Stellar docs page ... Tier 1 Organizations" and notes it only saw the first lines. |

Over-hedges: 0 (guard shown)

## P2 / q-scf-instawards
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SDF's announcement of v7.0 (stellar.org, 2026-01-16) describes them as 'decentralized ambassador-led incubation for early-stage projects up to $15K'." | 4 | attributed | no | no | Lumenloop articles row for stellar.org/blog/ecosystem/introducing-scf-v7 (2026-01-16) returned in call 3 with that wording; it is a Lumenloop row, not a stellarOrg.get_page result, and the source and date are returned. |
| 2 | "A post dated 2026-10-22 reports that 19 Philippine teams were approved for $95,000 in Instawards, at $5K per project." | 4 | attributed | no | no | Lumenloop articles row for x.com/i/article/2113249413430931456 (2026-10-22) returned in call 3; the answer says to treat it as that source's own report. |

Over-hedges: 0 (guard shown)

## P2 / q-smart-account-scoped-policy-signers
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Its repo has `spending_limit.rs`, `simple_threshold.rs` and `weighted_threshold.rs` under `packages/accounts/src/policies/` (stellarsecurityportal.com/report/87, an audit scope listing)." | 4 | hedged | no | no | Scout searchResearch row for stellarsecurityportal.com/report/87 (v0.5.0 Re-Audit) shows the scope file tree in a snippet (call 1); the report itself was not returned. |
| 2 | "A v0.5.0 audit (https://stellarsecurityportal.com/report/86) describes rules being evaluated newest-first ... a critical finding ... That is the audit's own claim, and it concerns v0.5.0" | 4 | hedged | no | no | Scout searchResearch row for report/86 (call 1) shows the "Critical" newest-first rule-evaluation and missing-removal-validation text in a snippet; the full report was not returned, and the answer marks it as the audit's own claim. |
| 3 | "This was introduced by CAP-71." | 1 | bare | no | no | Stellar Docs Delegate Auth example (call 2 snippet): "CAP-71 specification — the protocol change that introduced auth delegation." |

Over-hedges: 0 (guard shown)

## P2 / q-soroban-oz-token
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The Stellar docs say it is built with the Stellar community and SDF, and call it a collection of audited contracts and utilities. They list these as 'Audited Modules'" | 1 | attributed | no | no | get_doc_page for /docs/tools/openzeppelin-contracts (call 3) returned the page, which says "OpenZeppelin Stellar Contracts is a collection of audited contracts..." and has the "Audited Modules Available" heading. |

Over-hedges: 0 (guard shown)

## P2 / q-soroban-vuln-classes
Claim statements: 4   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "OpenZeppelin's Stellar Contracts Library v0.5.0 audit has a medium-severity finding on the smart-account `__check_auth` rule-evaluation model: https://stellarsecurityportal.com/report/86" | 4 | hedged | no | no | Scout searchResearch row for report/86 (sev medium, auditor OpenZeppelin, published 2025-10-28) with an "Issues" snippet on `__check_auth` ContextRule evaluation; the answer says it saw only snippets. |
| 2 | "Veridise's audit of Wombat-Exchange flags centralization risk, where the owner can upgrade contract implementations: https://stellarsecurityportal.com/report/32" | 4 | hedged | no | no | Scout row for report/32 returned with a "Centralization Risk ... authority to upgrade contract implementations" snippet; the full report was not returned. |
| 3 | "Veridise's audit of Soroban core reports a critical denial of service during authorization in `require_auth_enforcing()`." | 4 | hedged | no | no | Scout row for report/42 (Veridise, severity critical) with the V-SOR-APP-VUL-003 snippet; the full report was not returned. |
| 4 | "The OtterSec Soroban Governor assessment lists a medium-severity finding: https://stellarsecurityportal.com/report/25" | 4 | hedged | no | no | Scout row for report/25 (OtterSec, sev medium, 2024-07-03) returned; the finding text itself was not shown. |

Over-hedges: 0 (guard shown)

## Totals
Packets: 8   Claim statements: 15   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0   Over-hedges: 0
