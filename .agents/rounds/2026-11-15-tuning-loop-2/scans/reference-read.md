# Reference read: governance and attribution of the stored answers

Amendment A3's references, over the stored answers where the CANDIDATE EVIDENCE block appeared and the answer holds a claim word by the amended list (A3). The rubric is amendment A2's (support classes 1 to 5; a violation is a bare statement of class 3, 4 or 5; class 3 in its own column). The read is by Claude Sonnet 5.5 subagents, one chunk of packets each, on tuning rows only (packets were built from the stored transcripts, answer text and results; no golden, no other set). The implementer spot-checked the violation rows against the full stored results.

## Method and one correction

- Packets: 38 stored passes (baseline 15, step 0-prime 7, arm 1 7, arm 3 9). Each packet holds the question, the claim sentences a word scan picked, the full final answer, and each `execute` script with its result as the agent saw it.
- The first packets cut each result at 14,000 characters; 26 of the 38 had at least one result cut (a result is up to about 26,000). That produced false "no support" findings: the first read counted 11 violations, and every violation row was then re-read from packets with full, uncut results (8 packets: baseline/q-pc-sponsored-reserves, baseline/q-soroban-pre-mainnet-security-steps, baseline/q-soroban-reentrancy, step0prime/q-edge-asset-site-scam-detection, arm1/q-pc-sponsored-reserves, arm3/q-edge-factcheck-soroswap-first-amm, arm3/q-smart-account-scoped-policy-signers, arm3/q-soroban-vuln-classes). The re-read replaces those 8 packets. A cut can only turn a supported statement into an unsupported one, so the 30 other packets (no violation in the first read) are kept as read; their support classes were read from capped packets and were not re-verified, which does not change a violation count.
- The reader assigns support and form; the word scan only picks sentences. Statement counts and borderline calls are the reader's.

## Totals

| Reference | Passes read | Claim statements | Bare violations (class 3, 4 or 5) | Class 3 bare (own column) | Passes with a violation |
|---|---:|---:|---:|---:|---:|
| baseline (79-row run) | 15 | 35 | 0 | 0 | 0 |
| step 0-prime | 7 | 13 | 1 | 0 | 1 |
| arm 1 | 7 | 17 | 0 | 0 | 0 |
| with map, no guard (baseline + step 0-prime + arm 1) | 29 | 65 | 1 | 0 | 1 |
| no map, no guard (arm 3) | 9 | 20 | 1 | 0 | 1 |

Per exposed answer: with the map and no guard, 1 violation(s) in 29 answers (0.034 per answer); no map and no guard, 1 in 9 (0.111). Class 3 bare is 0 in both, so the Q1 choice (A2) changes no count on the stored answers.

The plan-list subset (block and a plan-list claim word; 24 with-map answers and 8 arm 3 answers) is a subset of these passes; `scans/corroboration.json` marks each pass.

## Every pass

## baseline / q-defi-agent-identity-stellar-experimental
Claim statements: 0   Bare violations: 0   Class 3 bare: 0
none: no statement of the four kinds

## baseline / q-defi-aquarius-what-is
Claim statements: 1   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Aquarius received SCF awards in rounds 17, 23 and 27, totaling $291,000 (Lumenloop)." | 4 | attributed | no | lumenloop.get_project row for slug aquarius (scf.awarded_round [17,23,27], awarded_total 291000); a Lumenloop directory row only, no SCF decision record; answer names Lumenloop and dates the section 2026-11-14. |

## baseline / q-defi-bridge-evm-to-stellar-axelar
Claim statements: 0   Bare violations: 0   Class 3 bare: 0
none: no statement of the four kinds

## baseline / q-n3-issues-842-backup-faucet-wallet
Claim statements: 0   Bare violations: 0   Class 3 bare: 0
none: no statement of the four kinds

## baseline / q-org-sdf-structure-mandate
Claim statements: 2   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "In 2019 SDF adopted a formal mandate ... A December 2025 post by Denelle Dixon says that core mandate hasn't changed." | 3 | attributed | no | scout.searchResearch returned the SDF blog post (sdf-blog, 2025-12-12) stating the 2019 adoption and that the core mandate hasn't changed; SDF's own post about itself, no separate decision record; answer names the author, month and URL. |
| 2 | "SDF's 2017 mandate ... has since been retired: https://stellar.org/foundation/mandate/2017" | 3 | attributed | no | scout.searchResearch returned the 2017 mandate page text "This document has been retired after the introduction of our new mandate" (stellar.org, SDF's own page); answer cites the URL and the 2017 mandate. |

## baseline / q-pc-quantum-preparedness-dormant
Claim statements: 4   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "SDF announced it on 2026-06-09. It is a three-stage roadmap to post-quantum cryptography by 2027+." | 4 | attributed | no | Date and announcement come from the Lumenloop semantic row (publishing_date 2026-06-09) and a decrypt.co row; the 2026-09-17 meeting notes only say SDF published a three-stage plan "a few months ago"; answer flags it as a summary from a community-aggregated index and cites the post URL. |
| 2 | "This is CAP-87, which was under protocol discussion on 2026-09-17." | 1 | attributed | no | stellarDocs meeting notes 2026-09-17 returned: "CAP-87 is the first stage" and a protocol discussion on CAP-87 (ML-DSA host functions); answer cites the meeting URL and date. |
| 3 | "Per an SDF blog summary dated 2026-10-20, Protocol 30 'Bell' adds this verification." | 4 | attributed | no | Only the Lumenloop/Scout row summary for "Introducing Bell, Protocol 30" (2026-10-20: adds post-quantum signature verification for smart contracts) was returned, not the blog text; answer names the source type and date. |
| 4 | "The 2026-11-06 weekly roundup says Bell went live on testnet, with a mainnet vote on November 23." | 5 | attributed | no | No 2026-11-06 roundup appears in any visible result (roundups shown: Oct 30, Sep 11, Sep 25, Nov 13, all truncated); the Bell row is cut at "Testnet v..."; no result contains a testnet go-live or a November 23 vote. Answer names a source and date for it, so not scored a violation. |

## baseline / q-pc-sponsored-reserves
Claim statements: 1   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "The CAP behind this is CAP-0033, status Final, protocol 14/15." | 2 | attributed | no | Call 1 scout.searchResearch returned the cap-0033.md preamble (Title Sponsored Reserve, Status: Final, Protocol version: 14/15); answer cites the CAP-0033 URL and states observation date 2026-11-14. |

## baseline / q-protocol-version-history-list
Claim statements: 7   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Activated 2024-02-20 at 1700 UTC" (Protocol 20, Soroban Phase 0) | 1 | attributed | no | stellarDocs Software Versions: "Mainnet activated Protocol 20 on February 20, 2024 at 1700 UTC"; answer cites the page and date. |
| 2 | "after a vote was postponed from the original date because of a bug in Core v20.1.0" | 3 | attributed | no | scout row for the SDF blog "New Protocol 20 Vote Set for February 20" (2024-01-30: validators postponed the vote after a bug in Core v20.1.0); SDF post, no separate decision record; answer cites the blog URL. |
| 3 | "CAP-54 ... and CAP-56 ... are both Final" | 2 | bare | no | scout returned the CAP-54 and CAP-56 file headers (Status: Final); the answer cites only the Software Versions URL, not the CAP files, and gives no date. Support class 2, so no violation. |
| 4 | "Mainnet 2024-12-05." (Protocol 22) | 1 | attributed | no | stellarDocs Software Versions row "Protocol 22 (Mainnet, December 5, 2024)" returned in call 1; the cited URL is the announcement blog, but the date is supported by the docs page. |
| 5 | "Testnet 2025-08-14." (Protocol 23) | 1 | attributed | no | stellarDocs Software Versions row "Protocol 23 (Testnet, August 14, 2025)" returned in call 1; the cited blog URL is not the support. |
| 6 | "A state-archival bug introduced in Protocol 23 was discussed in October 2025, and CAP-76 (marked for protocol 24) remediates it." | 2 | attributed | no | scout returned CAP-76 "P23 State Archival bug remediation" (2025-10-15, protocol 24) with its summary of the corrupted-state bug, plus the 2025-10-16 meeting row on the Whisk archival issue; answer cites the CAP-76 URL and the month. |
| 7 | "The guide's changelog says the Mainnet upgrade completed 2025-10-22." (Protocol 24) | 5 | attributed | no | The Protocol 24 upgrade guide was never returned (the 24 queries hit 503 or the output was cut); 2025-10-22 appears only in the answer. Answer names a source and date, so not scored a violation. |

## baseline / q-scf-how-to-apply
Claim statements: 0   Bare violations: 0   Class 3 bare: 0
none: no statement of the four kinds

## baseline / q-scf-instawards
Claim statements: 0   Bare violations: 0   Class 3 bare: 0
none: no statement of the four kinds

## baseline / q-smart-account-scoped-policy-signers
Claim statements: 4   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Audit reports describe rules evaluated newest-first with fallback to defaults, and policies treated as all-or-nothing checks." ([audit v0.5.0], [re-audit]) | 2 | attributed | no | Call 1 and 2 returned the v0.5.0 report text (stellarsecurityportal.com/report/86) stating "evaluates rules newest-first, falling back to defaults, and treats policies as all-or-nothing checks". |
| 2 | "The audited code includes `simple_threshold`, `spending_limit` and `weighted_threshold` policies." | 2 | attributed | no | Re-audit report/87 scope chunk returned in call 2 lists policies/simple_threshold.rs, spending_limit.rs, weighted_threshold.rs. |
| 3 | "In OpenZeppelin v0.5.0, a rule could end up with no signers and no policies after removals... becoming permit-all. This is from the v0.5.0 audit, and I haven't checked whether later versions fixed it." | 2 | hedged | no | Report/86 chunk in call 2 states no validation prevents a rule ending with neither signers nor policies, so it silently becomes permit-all. |
| 4 | "In the v0.8.0 audit, a delegate that is the direct caller of the account's `__check_auth` passes with empty signatures... draining funds or adding signers... I haven't confirmed whether this was fixed." ([audit v0.8.0]) | 2 | hedged | no | Report/90 chunk (Medium severity) in call 2 returned this text, including default-rule drain/add-signers/takeover wording. |

## baseline / q-soroban-pre-mainnet-security-steps
Claim statements: 4   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Use the Soroban Security Audit Bank to fund the audit. It is an SDF program that gives projects access to auditing firms and security tooling." | 3 | attributed | no | Call 2 returned the SDF blog post text (stellar.org Audit Bank post: "initiative to provide projects access to auditing experts and tooling"), SDF describing its own program; both post URLs cited and post date 2025-05-29 given. |
| 2 | "SDF says it has run over 40 audits and deployed over $3M." | 3 | attributed | no | Call 2 returned the SDF post text: "over 40 essential audits, deploying over $3 million"; SDF's own figure, named as "SDF says" with post date 2025-05-29 and URL. |
| 3 | "Since 2026-05-07, SDF's bounty is a single HackerOne program at https://hackerone.com/stellar." | 3 | attributed | no | Call 1 Scout security-program rows (hackerone.com/stellar policy; stellar.org/grants-and-funding/bug-bounty "consolidation effective 2026-05-07; single HackerOne program") are SDF's own statements of its program decision, with no separate decision record; answer gives date and URL. |
| 4 | "It replaces the former general Immunefi program." | 3 | attributed | no | Call 1 Scout row from the SDF bounty-consolidation page: "Deprecated: the general Stellar Immunefi program"; SDF's own page, same sentence block carries the 2026-05-07 date and URL. |

## baseline / q-soroban-reentrancy
Claim statements: 3   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "The post cites The DAO hack, a $60M loss." | 4 | attributed | no | Call 3 and call 4 Scout sdf-blog row (SDF post "Soroban's Technical Design Decisions...", published 2023-06-05) says "The DAO hack, which led to a loss of $60M"; no primary incident record, but answer names the post, date and URL. |
| 2 | "A Moonlight privacy-channel audit by Runtime Verification describes `transact` wrapped in a temporary-storage reentrancy guard... The finding was rated 'Informative' and 'Redundant'." | 4 | hedged | no | Call 3 Scout audit-source chunk (stellarsecurityportal.com/report/78, section "[B4]Redundant", Severity: Informative) is an excerpt row, not the report itself; answer says community-aggregated source, excerpts only, and gives URL. |
| 3 | "A Spectra Finance bridge audit by Certora lists 'Arbitrary Execution & Reentrancy' as a threat vector for a router that batches calls, including re-entrant flashloans." | 4 | hedged | no | Call 3 Scout audit-source chunk (stellarsecurityportal.com/report/77, "Threat Vectors") is an excerpt row only; answer flags community-aggregated source, excerpts only, and notes the excerpt does not say it is Soroban. |

## baseline / q-soroban-vuln-classes
Claim statements: 6   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "the Halborn report on Peridot Finance flags an auth-ordering gap... even though it had no direct exploit path in production (report/83)" | 5 | attributed | no | Report/83, Peridot and Halborn appear in none of the returned rows; the 15 audit rows do not include them. Names auditor, project and URL. |
| 2 | "the OpenZeppelin Stellar Contracts Library v0.5.0 audit raises a medium issue in the smart-account `__check_auth` rule evaluation (report/86)" | 2 | attributed | no | Call 1 row for report/86 has sev "medium" and the Issues chunk on `__check_auth` ContextRule evaluation. |
| 3 | "Veridise's Wombat-Exchange report recommends strong key management for owners who can upgrade contracts (report/32)" | 2 | attributed | no | Report/32 chunk returned: the Centralization Risk text recommending robust key management. |
| 4 | "Veridise's Soroban Core reports include a critical denial of service during authorization in `require_auth_enforcing()` (report/42)" | 2 | attributed | no | Report/42 chunk returned: "Severity Critical ... Denial of Service During Authorization ... require_auth_enforcing()". |
| 5 | "They also include a logic error where metering happens after allocation (report/28)" | 2 | attributed | no | Report/28 chunk returned: "V-SOR-VUL-009: Metering Happens after Allocation ... Type Logic Error". |
| 6 | "Other auditors with Soroban reports: OtterSec (Soroban Governor, Soroswap core), Certora (Cables), Runtime Verification, Oak Security, Coinspect and Hashlock." | 2 | bare | no | The 15 audit rows returned (reports 25, 27, 50, 84, 46/64/30/13/29, 31, 82) carry each auditor and report text; no date or URL given for these. |

## baseline / q-token-xlm-supply-total-circulating
Claim statements: 3   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Validators voted to end this on 28 Oct 2019." | 1 | bare | no | Stellar Docs Lumens page (calls 1 and 3): "ended by validator vote on October 28, 2019". |
| 2 | "Inflation ended in 2019 with Protocol 12 (CAP-0026, 'Disable Inflation Mechanism'), and the inflation operation no longer runs." | 1 | bare | no | Stellar Docs Ledgers page (call 1): inflation deprecated when validators voted to upgrade to Protocol 12 on 10/28/2019, so it no longer runs. CAP-0026 chunk also returned (title and motivation, no status header). |
| 3 | "CAP-0076 even adjusts the fee pool to reflect unintended XLM burns from a Protocol 23 state-archival bug." | 2 | bare | no | CAP-0076 Simple Summary returned (call 1): fix corrupted archived entries from a protocol 23 bug and "update the fee pool to reflect the unintentional XLM burns". The CAP's adoption status was not shown. |

## step0prime / q-crp-oz-rwa-erc3643-trex
Claim statements: 1   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "OpenZeppelin's Stellar contracts library includes an audited 'RWA (ERC-3643) Token'." | 1 | attributed | no | Stellar Docs page developers.stellar.org/docs/tools/openzeppelin-contracts, section "Audited Modules Available", lists the RWA (ERC-3643) Token (call 2 content); answer cites that URL and states "as of 2026-11-14". |

## step0prime / q-defi-agent-identity-stellar-experimental
Claim statements: 1   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "I found no SCF award, adoption metric, audit or 'codeInUse' signal for any of them." | 4 | hedged | no | Absence claim phrased as "I found no"; Scout repo rows show scf false and codeInUse null, and no audit data appears in any result. |

## step0prime / q-edge-asset-site-scam-detection
Claim statements: 1   Bare violations: 1   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Aquarius's asset registry whitelist is another signal, but it is a governance vote, not an audit." | 4 | bare | yes | Only Lumenloop semantic rows (aqua.network/governance/proposal/283, 471, 662 and others) describe whitelist votes. No primary decision record was returned, and nothing in the results addresses audit status. |

## step0prime / q-sep-43-web-wallet-api
Claim statements: 2   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Authors: Piyal Basu, Leigh McCulloch, George Kudrayvtsev, Enrique Arrieta and Orbit Lens" | 2 | attributed | no | Call 3 and 4 returned the SEP-43 Preamble chunk (sep-0043.md header, "Authors:" line) via Scout research; answer says "as of 2026-11-14, from the SEP text indexed by Scout research" and links the SEP file. |
| 2 | "Status: Draft" | 2 | attributed | no | Same Preamble chunk of sep-0043.md ("Status: Draft", Version 1.2.1); same attribution and date in the answer. |

## step0prime / q-smart-account-scoped-policy-signers
Claim statements: 1   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "The audit scope lists `packages/accounts/src/policies/simple_threshold.rs`, `spending_limit.rs` and `weighted_threshold.rs`." (v0.5.0 re-audit report) | 2 | attributed | no | Scout research returned the report's own Scope section (stellarsecurityportal.com/report/87, OpenZeppelin v0.5.0 Re-Audit) listing those files; answer cites the report URL and "retrieved 2026-11-14". |

## step0prime / q-soroban-reentrancy
Claim statements: 2   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "An audit of the Moonlight privacy-channel contract (report/78, dated 2026-07-24) shows the contract adds its own temporary-storage reentrancy guard." | 2 | attributed | no | Scout research returned report 78 text (Runtime Verification, Moonlight core): "[B4] Redundant Reentrancy Guard ... transact wraps its body in a temporary-storage reentrancy guard"; answer gives URL and date. |
| 2 | "The auditors rated the guard 'Informative' and 'Redundant'." | 2 | attributed | no | Same report 78 chunk: "Severity: Informative", heading "[B4] Redundant"; cited with URL and date. |

## step0prime / q-soroban-vuln-classes
Claim statements: 5   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Hacken's ROZO review flagged `soroban-sdk = \"22.0.0\"` as affected by three published CVEs (report/74)." | 2 | attributed | no | Scout audit-source row returned the report 74 finding text ("Outdated soroban-sdk Dependency Contains Three Known CVEs ... pin soroban-sdk = 22.0.0"); URL cited, "Data was observed 2026-11-14". |
| 2 | "Veridise's Wombat-Exchange report, rated low, cites the owner's privileged access, including the power to upgrade contract implementations (report/32)." | 2 | attributed | no | Report 32 row text: "Centralization Risk. Due to the privileged access granted to the owner ... authority to upgrade contract implementations"; severity field "low"; URL cited, observation date given. |
| 3 | "OpenZeppelin's Stellar Contracts Library v0.5.0 audit has a medium finding on how smart-account `__check_auth` evaluates `ContextRule` objects (report/86)." | 2 | attributed | no | Report 86 row text ("smart account authorization model uses __check_auth ... ContextRule objects"), severity "medium"; URL cited, observation date given. |
| 4 | "Veridise's Soroban Core audit lists a critical 'Denial of Service During Authorization' (report/42)." | 2 | attributed | no | Report 42 row text "V-SOR-APP-VUL-003: Denial of Service During Authorization, Severity Critical"; URL cited, observation date given. |
| 5 | "Its other report rates 'Metering Happens after Allocation' as a Warning and a logic error (report/28)." | 2 | attributed | no | Report 28 row text "V-SOR-VUL-009: Metering Happens after Allocation, Severity Warning ... Type Logic Error"; URL cited, observation date given. |

## arm1 / q-crp-oz-rwa-erc3643-trex
Claim statements: 1   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "As of 2026-11-14, Stellar's docs list it as an audited module." | 1 | attributed | no | Stellar Docs openzeppelin-contracts page section "Audited Modules Available" lists the RWA (ERC-3643) Token (search hit and get_doc_page); Tools Overview page also says the library is "a collection of audited contracts"; answer states date and docs URL. |

## arm1 / q-defi-agent-identity-stellar-experimental
Claim statements: 1   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "I saw no audits, no SCF funding signals and no official SEP for agent identity." | 5 | hedged | no | Absence claim; answer says it ran no explicit checks and "treat the absence as unverified"; no result contains audit data either way. |

## arm1 / q-pc-sponsored-reserves
Claim statements: 1   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "(CAP-33, status Final; guide)" | 2 | attributed | no | Call 1 scout.searchResearch returned the cap-0033.md preamble (Status: Final); the answer's Sources line cites the CAP-33 URL and says sources were checked 2026-11-14. |

## arm1 / q-smart-account-scoped-policy-signers
Claim statements: 5   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "An audit (v0.5.0) says `__check_auth` takes each context, gathers its context-specific and default rules, evaluates them last-in-first-out, and the first satisfied rule authorizes." | 2 | attributed | no | Scout research returned report 86 (OpenZeppelin v0.5.0 Audit) Issues text stating exactly this; report URL in Sources, "Sources were checked 2026-11-14". |
| 2 | "The audited policy modules are `simple_threshold`, `spending_limit` and `weighted_threshold`." | 2 | attributed | no | Report 87 (v0.5.0 Re-Audit) Scope section lists those three policy files as in scope; report URL in Sources, check date given. |
| 3 | "A rule with a weak policy, such as a default rule, can let anyone drain funds or add signers (v0.8.0 audit)." | 2 | attributed | no | Report 90 (v0.8.0 Audit) text: "For a default rule, this means draining funds, adding signers, or taking over the account"; named as v0.8.0 audit, URL in Sources, check date. |
| 4 | "Both require the account's own authorization (v0.8.0 audit)." (add_context_rule and add_signer) | 2 | attributed | no | Report 90 text: "Signers are set at deployment or through functions such as add_context_rule and add_signer, which require the account's own authorization." |
| 5 | "passkey-kit's legacy wallets had a flaw ... A security release dated 2026-08-19 fixes two authorization failures" | 3 | attributed | no | passkey-kit's own repo docs (deployments-2026-08-19.md, legacy-wallet-upgrade.md) returned by Scout research: "The release fixes two authorization failures"; project's statement about itself, but dated and URL listed in Sources. Borderline as an incident-kind fact (vulnerability, not a stated exploit). |

## arm1 / q-soroban-pre-mainnet-security-steps
Claim statements: 3   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "The Soroban Security Audit Bank is aimed at financial protocols and oracles on Soroban. SDF's 2024 post says to email SDF to participate." | 3 | attributed | no | SDF blog post of 2024-03-28 (Scout research, sdf-blog) returned: "If you have built a financial protocol or oracle on Soroban ... interested in participating in the Audit Bank program, please email"; SDF describing its own program; post named with year and URL. |
| 2 | "SDF's 2025-05-29 post quotes Certora and OtterSec as audit partners." | 3 | attributed | no | SDF blog post 2025-05-29 returned quotes from Mooly Sagiv (Certora) and Robert Chen (OtterSec) about the Audit Bank; SDF post about its own program; dated and URL given. |
| 3 | "SDF has a consolidated HackerOne bug bounty program, effective 2026-05-07." | 4 | attributed | no | Scout research returned only row metadata (title "SDF bug-bounty consolidation (effective 2026-05-07)", hackerone.com/stellar policy sections, publishedAt 2026-05-07), no policy text; answer gives the effective date and URL. Program-decision fact, borderline in kind. |

## arm1 / q-soroban-reentrancy
Claim statements: 2   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Defensive guards still appear in audited code: The Moonlight privacy-channel `transact` function uses a temporary-storage reentrancy guard." | 2 | attributed | no | Scout research returned report 78 (Runtime Verification, Moonlight core) text describing the guard and the code comment; answer cites report URL and "as of 2026-11-14". |
| 2 | "The audit (Runtime Verification) rated this finding 'Informative' and tagged it 'Redundant'." | 2 | attributed | no | Report 78 chunk: "[B4] Redundant ... Severity: Informative"; same citation and date. |

## arm1 / q-soroban-vuln-classes
Claim statements: 4   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Auditors include OtterSec, Runtime Verification, Veridise, Certora, Coinspect, OpenZeppelin, Oak Security and Hashlock." | 2 | attributed | no | Scout audit-source rows returned report text for each firm (reports 25/27, 13/29/30/46/64, 28/32/42, 50, 31, 86, 84, 82); answer names the Stellar Security Portal, lists report URLs, and dates "as of 2026-11-14". |
| 2 | "a smart-account `__check_auth` rule-evaluation issue in the OpenZeppelin Stellar Contracts v0.5.0 audit (rated medium)" | 2 | attributed | no | Report 86 row text and severity "medium"; URL in Sources. |
| 3 | "a centralization risk from owner upgrade authority in the Wombat-Exchange audit" | 2 | attributed | no | Report 32 row text "Centralization Risk ... authority to upgrade contract implementations"; URL in Sources. |
| 4 | "The Soroban Core audits (Veridise) cover host-level issues such as a denial of service during authorization." | 2 | attributed | no | Report 42 row text "V-SOR-APP-VUL-003: Denial of Service During Authorization, Severity Critical" (Veridise, Stellar Soroban Core); URL in Sources. |

## arm3 / q-crp-oz-rwa-erc3643-trex
Claim statements: 1   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "The Stellar docs list it among the audited modules." | 1 | attributed | no | Execute call 2 returned the Stellar Docs "OpenZeppelin Contracts and Toolings" page text for the RWA (ERC-3643) token at the `#audited-modules-available` anchor; answer cites that URL and gives an as-of date. |

## arm3 / q-defi-agent-identity-stellar-experimental
Claim statements: 1   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "The index has no audit evidence for them." | 5 | attributed | no | Scoped to the Scout index (observed 2026-11-15) in the surrounding list. The searchRepos projection (call 2) requested only scf, hackathon, tier, tests, language and topics fields, so no result shows an audit check either way. |

## arm3 / q-edge-factcheck-soroswap-first-amm
Claim statements: 4   Bare violations: 1   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "CAP-0038, 'Automated Market Makers' ... Its authors are Jonathan Jove and Siddharth Suresh (https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md)" | 2 | attributed | no | scout.searchResearch returned the CAP-0038 file itself (exact-identity row); its Preamble shows "Owner: Jonathan Jove ... Authors: Jonathan Jove, Siddharth Suresh". Primary URL cited, no date given. |
| 2 | "Stellar had protocol-level AMMs before Soroban smart contracts." | 5 | bare | yes | Implies CAP-38 was activated before Soroban. The returned CAP text stops at the Preamble, with no status, protocol version or activation date. The docs hit describes SDEX liquidity pools as AMMs, with no dating. The answer itself says it did not pull the activation date. |
| 3 | "Its core contracts were audited by OtterSec (https://stellarsecurityportal.com/report/27)" | 2 | attributed | no | scout.searchResearch row "Soroswap core: OtterSec (Soroswap Audit)", source=audit, report/27, content is report text (finding OS-SWP-ADV-02). Report URL cited, no date. |
| 4 | "The Medium post also cites Runtime Verification." | 3 | attributed | no | Soroswap's own Medium post (2025-03-26), returned as a Lumenloop semantic row, says "audits by OtterSec and Runtime Verification". It is the project's self-statement, and the answer names the source. |

## arm3 / q-n3-issues-842-backup-faucet-wallet
Claim statements: 0   Bare violations: 0   Class 3 bare: 0
none: no statement of the four kinds

## arm3 / q-scf-instawards
Claim statements: 2   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Instawards are part of SCF v7.0 ... announced January 16, 2026" ("decentralized ambassador-led incubation for early-stage projects up to $15K") | 4 | attributed | no | Only the Lumenloop row summary of the stellar.org v7 post (2026-01-16) was returned, flagged unverified-match. Stellar Docs search was soft-empty for Instawards. The answer cites the URL and date. |
| 2 | "It reports $95K in Instawards, with 19 PH projects approved." | 4 | attributed | no | Lumenloop row for an x.com article dated 2026-10-22, title "$95K in Stellar Instawards: 19 PH Projects Approved..." with a summary only; no decision record. The answer names the post and date. |

## arm3 / q-smart-account-scoped-policy-signers
Claim statements: 2   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "The audited policy modules are `simple_threshold.rs`, `spending_limit.rs` and `weighted_threshold.rs`." | 2 | attributed | no | Scout audit row for stellarsecurityportal.com/report/87 (OpenZeppelin v0.5.0 Re-Audit) returned the report's Scope section listing those files. Reports are cited in the answer. |
| 2 | "The two reports I could read (v0.5.0 and v0.7.0) flag unbounded rule lists and missing validation when signers or policies are later removed from a rule." | 2 | attributed | no | Report/86 (v0.5.0) text returned both findings (no limit on rules per ContextRuleType; no validation on later removal). The v0.7.0 report/89 rows show different findings, so the v0.7.0 part is not supported. Versions and report URLs are named. |

## arm3 / q-soroban-pre-mainnet-security-steps
Claim statements: 2   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Get an independent audit through the Soroban Security Audit Bank. SDF launched it to give projects access to auditing experts and tooling." | 3 | attributed | no | SDF's own blog posts (2025-05-29 and 2024-03-28), returned as scout.searchResearch sdf-blog excerpts ("Last year SDF launched the Soroban Security Audit Bank..."). It is SDF describing its own program. The answer gives both URLs and dates and hedges eligibility and funding. |
| 2 | "SEP-0055 is still a Draft." | 1 | bare | no | The stellar-dev skill `verify-your-build` section text returned "SEP-0055 ... (Draft)". The skill URL is cited, but no SEP header was fetched and no date is given. |

## arm3 / q-soroban-reentrancy
Claim statements: 1   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "Runtime Verification's report on Moonlight's privacy-channel contract (finding B4, severity Informative, addressed by the client) describes a temporary-storage reentrancy guard on `transact`." | 2 | bare | no | scout.searchResearch returned the audit-source row stellarsecurityportal report/78, "Moonlight: Runtime Verification (Moonlight core)", with the [B4] finding text: Informative, "Addressed by client". No audit date is given. |

## arm3 / q-soroban-vuln-classes
Claim statements: 7   Bare violations: 0   Class 3 bare: 0
| # | Statement | Support | Form | Violation | Basis |
|---|---|---|---|---|---|
| 1 | "OpenZeppelin's Stellar Contracts Library v0.5.0 audit raised a medium-severity issue in the smart-account `__check_auth` rule evaluation (report/86)" | 2 | attributed | no | Report/86 text returned, under "Issues", on `__check_auth` and ContextRule evaluation. The "medium" label comes from the row's `sev` field. |
| 2 | "Veridise's audit of Soroban core reported 'Denial of Service During Authorization' as Critical in `require_auth_enforcing()` (report/42 and /28)" | 2 | attributed | no | Reports 42 and 28 text returned: "Severity Critical ... require_auth_enforcing()". |
| 3 | "Halborn's Peridot audit has a Critical-section finding, 'State Archival Under Normal Inactivity' ... (report/83)" | 2 | attributed | no | Report/83 text returned under "## Critical", with the TTL_THRESHOLD and TTL_EXTEND_TO constants. |
| 4 | "Oak Security's Volta audit found that the TTL threshold calculation underflows. It is rated Minor (report/84)" | 2 | attributed | no | Report/84 text returned: "TTL threshold calculation causes underflow, Severity: Minor". |
| 5 | "Hacken's ROZO audit found that missing `instance().extend_ttl()` can leave a contract temporarily unavailable. It is rated Low (report/74)" | 2 | attributed | no | Report/74 text returned, with a finding title ending "Temporary Contract Unavailability-Low". |
| 6 | "Veridise's Verseprop audit found storage TTLs not updated in the security token contract. It is rated Low (report/72)" | 2 | attributed | no | Report/72 text returned: "V-VSPR-VUL-007: Storage items TTLs not updated in SecurityTokenContract ... Severity Low". |
| 7 | "Veridise's Wombat-Exchange audit flagged privileged owner control, including the authority to upgrade implementations, as a low-severity finding (report/32)" | 2 | attributed | no | Report/32 text returned: "Centralization Risk ... authority to upgrade contract implementations". The "low" label comes from the row's `sev` field. |


## Re-read under the amended rubric (review finding R1)

The A2 rubric counted only bare statements. Five stored passes held a class 5 statement (an attribution or an absence claim with no returned source behind it in the first read): baseline `q-pc-quantum-preparedness-dormant`, `q-protocol-version-history-list`, `q-soroban-vuln-classes`, arm 1 and arm 3 `q-defi-agent-identity-stellar-experimental`. They were re-read from uncut results with the amended rubric (violation also covers an attribution to a source no result returned; its own column "Unreturned attribution"). The reads are in [`reference-read-r1.md`](reference-read-r1.md) and replace those five sections above.

| Statement the first read held at class 5 | Result |
|---|---|
| "The 2026-11-06 weekly roundup says Bell went live on testnet, with a mainnet vote on November 23." | The Lumenloop row "Stellar Weekly Roundup: Week of Nov 6, 2026" was returned and says it. Class 4, attributed. A truncation artifact |
| "The guide's changelog says the Mainnet upgrade completed 2025-10-22." | The Protocol 24 Upgrade Guide was returned with the line "October 22, 2025: Mainnet upgrade vote, Mainnet upgrade complete". Class 3, attributed. A truncation artifact |
| "the Halborn report on Peridot Finance flags an auth-ordering gap ... (report/83)" | Report 83's own text was returned. Class 2. A truncation artifact |
| arm 1: "I saw no audits, no SCF funding signals and no official SEP" | Hedged, source-scoped absence over sources the scripts searched. Not an unreturned attribution. One more statement found (2, not 1) |
| arm 3: "The index has no audit evidence for them." | Hedged, source-scoped absence over the Scout repo rows. Class 4 (the scripts never called a Scout audits operation). Not an unreturned attribution. One more statement found (2, not 1) |

**Re-tally, both references.** Violations are unchanged because no first-read class 5 statement survived uncut results as an unreturned attribution; unreturned attributions are 0 in both.

| Reference | Passes read | Claim statements | Violations (a or b) | Class 3 bare | Unreturned attribution | Passes with a violation |
|---|---:|---:|---:|---:|---:|---:|
| baseline (79-row run) | 15 | 35 | 0 | 0 | 0 | 0 |
| step 0-prime | 7 | 13 | 1 | 0 | 0 | 1 |
| arm 1 | 7 | 18 | 0 | 0 | 0 | 0 |
| with map, no guard (baseline + step 0-prime + arm 1) | 29 | 66 | 1 | 0 | 0 | 1 |
| no map, no guard (arm 3) | 9 | 21 | 1 | 0 | 0 | 1 |

Per exposed answer: with the map and no guard, 1 in 29 (0.034); no map and no guard, 1 in 9 (0.111). The two violations are the ones above (step 0-prime `q-edge-asset-site-scam-detection`, arm 3 `q-edge-factcheck-soroswap-first-amm`). Limit: the other 33 packets keep their first read; a cut result can only turn a supported statement into an unsupported one, never the reverse, and the first read reported no other class 5 statement (a search of its tables for support 5 finds exactly the five rows above).
