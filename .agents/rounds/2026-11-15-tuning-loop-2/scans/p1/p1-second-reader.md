# Reference read: second reader

## P0 / q-soroban-reentrancy
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The SDF blog post on Soroban's design decisions ... says Solidity allows contract re-entry, which enabled The DAO hack (about $60M lost)" | 3 | hedged | no | no | Call 2 returned the SDF blog text ("one of the most famous hacks was The DAO hack, which led to a loss of $60M"); a foundation post about a third-party incident, stated as "the post says". |
| 2 | "A Moonlight (privacy-channel) report describes a temporary-storage reentrancy guard that panics with `ReentrantCall`, and rates it 'Informative'" | 2 | hedged | no | no | Call 1 research row for stellarsecurityportal.com/report/78 returned the report text ("Severity: Informative ... panics with ReentrantCall"); the answer says it read only short excerpts. |
| 3 | "A Certora report on the Spectra bridge lists 'Arbitrary Execution & Reentrancy' as a threat vector" | 2 | hedged | no | no | Call 1 research row for stellarsecurityportal.com/report/77 returned the report text with that threat-vector line; excerpt only, answer says so. |

## P0 / q-org-sdf-structure-mandate
Claim statements: 3   Violations: 1   Class 3 bare: 1   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "In 2019 SDF adopted a formal mandate on using XLM, with the mission wording above." | 3 | bare | yes | no | Only the foundation's own 2025-12-12 blog ("in 2019 the SDF adopted a formal mandate to use the XLM entr...", cut) and the 2019 mandate page snippet returned; no decision record. The statement itself names no source. |
| 2 | "A blog post by Denelle Dixon dated 2025-12-12 announced an updated mandate." | 3 | attributed | no | no | The blog post "An Updated Mandate for a Growing Stellar Ecosystem" (2025-12-12) was returned in call 1; foundation's own announcement, named with date and URL. |
| 3 | "The 2025 year-in-review, dated 2026-02-13 ... the mandate framework was updated, moving from Stellar Growth ... to a new Assets and Liquidity fund" | 3 | attributed | no | no | The SDF year-in-review row (2026-02-13) was returned in call 1 with the "updated our mandate framework" text; foundation post, named with date and URL. |

## P2 / q-smart-account-scoped-policy-signers
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "OpenZeppelin's audit scope for the stellar-contracts v0.5.0 re-audit lists `policies/simple_threshold.rs`, `spending_limit.rs` and `weighted_threshold.rs`." | 2 | hedged | no | no | Call 1 research row for stellarsecurityportal.com/report/87 returned the report's Scope section listing those three files; source named by report URL, no date. |
| 2 | "An OpenZeppelin audit (v0.8.0) reports a medium-severity issue with `Signer::Delegated` ... passes with empty signatures ... treat it as that source's finding" | 2 | hedged | no | no | Call 1 research row for stellarsecurityportal.com/report/90 returned the Medium-severity text on `Signer::Delegated` and empty signatures; answer scopes it to that report. |

## P2 / q-defi-agent-identity-stellar-experimental
Claim statements: 3   Violations: 1   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "not an official standard. I found no SDF-endorsed ERC-8004 SEP and nothing in the official Stellar docs. That is an absence in what I searched" | 5 | hedged | no | no | Source-scoped absence over Scout repo, Lumenloop and docs searches; no result states a standard status either way (docs hits were dropped from the shown result). |
| 2 | "Audit and usage: I found no audit evidence" | 5 | hedged | no | no | Source-scoped absence ("I found no"); nothing in results addresses audits of these repos. |
| 3 | "two competing registry sets are deployed on mainnet, and neither is a Stellar standard" | 4 | bare | yes | no | Stated flatly; only Scout repo rows (tier "community") returned and no result states the standard status. |

## P3 / q-defi-agent-identity-stellar-experimental
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "I found no SDF-official standard or Stellar docs page for it." | 5 | hedged | no | no | Source-scoped absence over Scout repo index and docs search; docs hits shown cover agent CLI and x402 only. |
| 2 | "no audit evidence found" | 5 | hedged | no | no | Source-scoped absence ("found"); no result addresses audits of these repos. |
| 3 | "no official standard or SEP" | 5 | hedged | no | no | Same sentence as the "found" hedge and the opening "I found no" scope; no result states a standard status. |

## Totals
Packets: 5   Claim statements: 14   Violations: 2   Class 3 bare: 1   Unreturned attributions: 0
