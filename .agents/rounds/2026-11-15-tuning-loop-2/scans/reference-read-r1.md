# Re-read of the five class 5 rows, from uncut results (review finding R1)

The amended rubric (STEP-1-REVIEW.md R1): a violation is (a) a bare statement of class 3, 4 or 5, or (b) a statement attributed or hedged to a named source or record that no result returned (class 5), reported in its own column "Unreturned attribution". A source-scoped absence statement about a source that was searched is not (b). Brief: `eval/qa/claim-read-brief.md` as amended. Packets: `claim-read-packets.mjs`, results in full. Reader: one Claude Sonnet 5.5 subagent per packet (effort lower), on tuning rows only, no other file opened. The implementer spot-checked the two attributions the review named as possible fabrications against the packets (the 2026-11-06 weekly roundup row and the 2025-10-22 changelog line are both in a returned result) and the Peridot report (its row is in a returned result).

The five reads, verbatim:

### Reference read: baseline / q-pc-quantum-preparedness-dormant

## baseline / q-pc-quantum-preparedness-dormant
Claim statements: 4   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SDF announced it on 2026-06-09. It is a three-stage roadmap to post-quantum cryptography by 2027+." (QPP) | 4 | hedged | no | no | Date and stages come from the Lumenloop row for stellar.org "Introducing the Quantum Preparedness Plan" (call 1 and call 2, dated 2026-06-09). The answer says it is a summary from a community-aggregated index. The 2026-09-17 meeting note (class 1) also says SDF published a three-stage plan, but not the date. |
| 2 | "This is CAP-87, which was under protocol discussion on 2026-09-17." | 1 | attributed | no | no | Stellar Docs meeting note 2026/09/17/protocol returned "a protocol discussion on CAP-87" and "CAP-87 is the first stage: add post…". The answer cites the URL and date. |
| 3 | "Per an SDF blog summary dated 2026-10-20, Protocol 30 'Bell' adds this verification." | 4 | attributed | no | no | The Lumenloop row for "Introducing Bell, Protocol 30 on Stellar" (2026-10-20) was returned in call 1 and says Bell adds post-quantum signature verification for smart contracts. It is a summary row, not the post text. |
| 4 | "The 2026-11-06 weekly roundup says Bell went live on testnet, with a mainnet vote on November 23." | 4 | attributed | no | no | The Lumenloop row "Stellar Weekly Roundup: Week of Nov 6, 2026" (2026-11-06) was returned in call 1 (query "quantum resistant post-quantum"). It says Bell "went live on testnet ahead of a November 23 mainnet vote". The named source was returned. It is a candidate row, so the class is 4, and the form is attributed with a date. |

## Totals
Packets: 1   Claim statements: 4   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0

### Reference read: baseline / q-protocol-version-history-list

## baseline / q-protocol-version-history-list
Claim statements: 7   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Activated 2024-02-20 at 1700 UTC after a vote was postponed from the original date because of a bug in Core v20.1.0." | 1 | attributed | no | no | Call 3 returned the Software Versions page ("Mainnet activated Protocol 20 on February 20, 2024 at 1700 UTC"); the postponement is in the returned SDF post new-protocol-20-vote (call 4), which the answer cites with its URL and date. |
| 2 | "CAP-54 ... and CAP-56 ... are both Final" | 2 | bare | no | no | Call 3 returned the CAP-0054 and CAP-0056 files with the header "Status: Final". |
| 3 | "Mainnet 2024-12-05" (Protocol 22) | 1 | attributed | no | no | Call 1 returned the Software Versions page: "Protocol 22 (Mainnet, December 5, 2024)". |
| 4 | "Testnet 2025-08-14" (Protocol 23) | 1 | attributed | no | no | Call 1 returned the Software Versions page: "Protocol 23 (Testnet, August 14, 2025)". |
| 5 | "A state-archival bug introduced in Protocol 23 was discussed in October 2025, and CAP-76 (marked for protocol 24) remediates it." | 1 | attributed | no | no | Call 1 returned the Developer Meeting 2025-10-16 note (state archival issue introduced by Whisk) and the CAP-0076 file (remediation, protocol version 24); the answer cites the CAP URL. |
| 6 | "The guide's changelog says the Mainnet upgrade completed 2025-10-22." | 3 | attributed | no | no | Call 1 returned the Protocol 24 Upgrade Guide (stellar.org blog) with the uncut changelog line "October 22, 2025: Mainnet upgrade vote, Mainnet upgrade complete."; a foundation guide with no decision record is class 3, but the statement names the guide and the date and the guide appears in a result. |
| 7 | "I didn't find whether Protocol 30 has been voted in on Mainnet." | 5 | hedged | no | no | Hedged source-scoped absence; no result states a Protocol 30 vote or Mainnet status, and the statement names no unreturned source. |

## Totals
Packets: 1   Claim statements: 7   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0

### Reference read: baseline / q-soroban-vuln-classes

## baseline / q-soroban-vuln-classes
Claim statements: 6   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "the Halborn report on Peridot Finance flags an auth-ordering gap, `require_auth()` coming after state work, as a pattern to avoid, even though it had no direct exploit path in production (report/83)" | 2 | attributed | no | no | The result returned report/83's own text (Halborn, Peridot Protocol): "In production the auth-ordering gap has no direct exploit path because no state is written before require_auth() ... The primary risk is forward-looking: the pattern normalizes performin[g...]". The excerpt is cut only by the agent's own 300-char slice, and the result in the packet is complete. The report states the gap and the no-exploit-path finding. "As a pattern to avoid" and "after state work" are a light paraphrase of the cut forward-looking sentence, not a separate unsupported claim. Names the report and cites its URL, with the answer's data-as-of 2026-11-14. |
| 2 | "the OpenZeppelin Stellar Contracts Library v0.5.0 audit raises a medium issue in the smart-account `__check_auth` rule evaluation (report/86)" | 4 | attributed | no | no | The report/86 excerpt (Issues section) only describes how `__check_auth` evaluates ContextRule objects and is cut before any flaw. The "medium" rating comes from the Scout row's sev field, so it is a row summary, not the report text. Names the report and cites its URL, with the as-of date. |
| 3 | "Veridise's Wombat-Exchange report recommends strong key management for owners who can upgrade contracts (report/32)" | 2 | attributed | no | no | The report/32 text returned says "Centralization Risk ... authority to upgrade contract implementations, the auditors recommend implementing robust key management practices". Names the report and cites its URL, with the as-of date. |
| 4 | "Veridise's Soroban Core reports include a critical denial of service during authorization in `require_auth_enforcing()` (report/42)" | 2 | attributed | no | no | The report/42 text returned shows "V-SOR-APP-VUL-003: Denial of Service During Authorization, Severity Critical ... require_auth_enforcing()". Names the report and cites its URL, with the as-of date. |
| 5 | "They also include a logic error where metering happens after allocation (report/28)" | 2 | attributed | no | no | The report/28 text returned shows "V-SOR-VUL-009: Metering Happens after Allocation, Severity Warning, Type Logic Error" (Veridise, Soroban Core V2). Cites the URL, with the as-of date. |
| 6 | "Other auditors with Soroban reports: OtterSec (Soroban Governor, Soroswap core), Certora (Cables), Runtime Verification, Oak Security, Coinspect and Hashlock." | 4 | attributed | no | no | Scout audit rows (report/25, 27, 50, 46/64/30/13/29, 84, 31, 82) list these auditors and projects in the auditor and title fields. Some excerpts, such as 27 and 84 ("engaged OtterSec", "engaged ... Oak Security"), show engagement text, but the list rests on row metadata. Names the Stellar Security Portal via the section header, with the as-of date but no per-report URL. Every named auditor and project appears in a returned row. |

## Totals
Packets: 1   Claim statements: 6   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0

### Reference read: arm1 / q-defi-agent-identity-stellar-experimental

## arm1 / q-defi-agent-identity-stellar-experimental
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "I saw no audits, no SCF funding signals and no official SEP for agent identity. I did not run explicit checks for these, so treat the absence as unverified." | 5 | hedged | no | no | Source-scoped absence ("I saw", "unverified") about sources the script searched (Lumenloop semantic, Scout repos, Stellar Docs search); the uncut result shows no audit or SEP row, and the statement names no source or record that no result returned, so it is not case (b) and not bare. |
| 2 | "I found no official Stellar or SDF standard or deployment." | 5 | hedged | no | no | Same scoped absence ("I found no"): the docs search hits are only agent-CLI and x402 pages and no result shows an agent-identity standard; names no unreturned source. |

## Totals
Packets: 1   Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0

### Reference read: arm3-q-defi-agent-identity-stellar-experimental

## arm3 / q-defi-agent-identity-stellar-experimental
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The index has no audit evidence for them." | 4 | hedged | no | no | Source-scoped absence about the Scout repo index, which both scripts searched (call 1 searchRepos rows and call 2 rows for all three repos carry description, stars, activity, scf, hack, tier and no audit field); no source is named that no result returned. The scripts never called a Scout audits operation, so this is absence in the returned repo rows only, not an audit-record lookup; the answer's own "Not verified" and "Scout's ... discovery metadata" lines limit it. |
| 2 | "no official SEP or SDF standard" / "I didn't find an SEP for agent identity or reputation" | 1 | hedged | no | no | Source-scoped absence ("I found only", "didn't find", "absence ... doesn't prove none exists"); stellarDocs.search_docs for "ERC-8004", "agent identity reputation registry", "trustless agents" returned no SEP or standard page (call 1 docs rows: x402 guide, CLI for Agents, asset pages); call 1 is cut for the last two queries, so those docs rows are not visible. |

## Totals
Packets: 1   Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0

