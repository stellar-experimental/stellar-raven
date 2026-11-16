=== chunk 1 (P0 and P1 pass 1, interleaved)
# Reference read: Chunk 1

## P1 / q-smart-account-scoped-policy-signers
Claim statements: 4   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The audited policies include `simple_threshold`, `weighted_threshold`, and `spending_limit` (the files listed in the audit scope, report 87)" | 2 | attributed | no | no | Call 2 returned report 87 (stellarsecurityportal.com/report/87) scope text listing policies/simple_threshold.rs, spending_limit.rs, weighted_threshold.rs. |
| 2 | "Per the v0.5.0 audit (report 86), rules are evaluated newest-first and fall back to defaults. Policies are all-or-nothing checks. A rule with no policies requires all of its signers to authenticate. Each rule must have at least one signer or policy." | 2 | attributed | no | no | Call 2 returned report 86 text: "evaluates rules newest-first, falling back to defaults... all-or-nothing... If a rule has no policies, all its signers must authenticate... each rule must contain at least one signer or one policy". |
| 3 | "Context rules store `signer_ids` and `policy_ids`... That audit notes no view method returns those ID vectors (report 89)" | 2 | attributed | no | no | Call 2 returned report 89 text (Medium severity): no view method returns the stored ID vectors; IDs must be stored off-chain. |
| 4 | "The audit flags a risk when the delegate is the direct caller, because the check can pass with empty signatures (report 90)" | 2 | attributed | no | no | Call 2 returned report 90 text: delegate as direct caller of `__check_auth` passes with empty signatures. |
Over-hedges: 0 (guard shown)

## P0 / q-sep-45-contract-auth
none: no statement of the four kinds
Over-hedges: 0

## P1 / q-soroban-storage-types
none: no statement of the four kinds
Over-hedges: 0

## P1 / q-soroban-pre-mainnet-security-steps
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SEP-0055 ... is a Draft." | 1 | bare | no | no | The stellar-dev smart-contracts skill text (verify-your-build section, call 1) says "SEP-0055 (Draft)". |
| 2 | "SDF consolidated its bug bounty into a single HackerOne program, effective 2026-05-07: https://hackerone.com/stellar." | 3 | attributed | no | no | Returned only as Scout rows: stellar.org/grants-and-funding/bug-bounty ("Effective 7 May 2026 ... consolidated ... single HackerOne program") and hackerone.com/stellar policy rows dated 2026-05-07; SDF's own page, cites URL and date. |
Over-hedges: 0 (guard shown)

## P1 / q-scf-instawards
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SCF v7.0 introduced Instawards as 'decentralized ambassador-led incubation for early-stage projects up to $15K' (Stellar blog, 2026-01-16)" | 4 | attributed | no | no | Call 2 returned the introducing-scf-v7 article as a Lumenloop articles row (2026-01-16) containing that wording; row only, no primary rulebook (the answer says so). |
Over-hedges: 0 (guard shown)

## P0 / q-hot-sdf-xlm-holdings-sales
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SDF holds XLM under a formal mandate, adopted in 2019 and updated on 2025-12-12." | 3 | attributed | no | no | Call 3 returned SDF's own 2025-12-12 blog post ("in 2019 the SDF adopted a formal mandate...") via a Scout row; the URL and date are cited in the same bullet group, though not in the sentence itself. |
| 2 | "The 2019 burn happened alongside the mandate announcement of Nov 2019. The post says 'after today's burn'..." (sdfs-next-steps) | 3 | attributed | no | no | Call 2 returned the 2019-11-04 "SDF's Next Steps" post text ("In total, after today's burn, SDF's lumen allocation...") and the 2019 mandate page (announced Nov 5, 2019); SDF's own post, cited by URL. |
Over-hedges: 0

## P1 / q-scf-how-to-apply
none: no statement of the four kinds
Over-hedges: 0 (guard shown)

## P0 / q-protocol-tier1-requirements
none: no statement of the four kinds
Over-hedges: 0

## P1 / q-org-sdf-structure-mandate
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SDF adopted a formal mandate in 2019 ... An SDF blog post from 2025-12-12 says that core mandate hasn't changed." | 3 | attributed | no | no | Call 1 returned the SDF blog row (2025-12-12) with "in 2019 the SDF adopted a formal mandate... That core mandate hasn't changed"; SDF's own post, named with date and URL. |
Over-hedges: 0 (guard shown)

## P0 / q-zk-host-functions-status
Claim statements: 6   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | Table: CAP-0059 live Protocol 22+, CAP-0074 Protocol 25+, CAP-0075 Protocol 25+, CAP-0080 Protocol 26+ ("live on Stellar, according to the zk-proofs skill") | 1 | attributed | no | no | Call 1 returned the zk-proofs skill table with each CAP marked Available and its protocol version. |
| 2 | "The Stellar docs page for BN254 attributes `g1_add` and `g1_mul` to CAP-74 at Protocol 25." | 1 | attributed | no | no | Call 2 returned developers.stellar.org/docs/build/apps/zk#bn254-host-functions: "X-Ray (Protocol 25) added these functions through CAP-74". |
| 3 | "CAP-74 and CAP-75 were discussed in the 2025-10-02 and 2025-10-09 protocol meetings." | 1 | attributed | no | no | Call 2 returned the meeting-notes hits for 2025/10/02 (CAP-74) and 2025/10/09 (CAP-75 presented). |
| 4 | "CAP-87, covered in the 2026-09-17 protocol meeting, adds post-quantum signature verification as host functions." | 1 | attributed | no | no | Call 2 returned the 2026/09/17 protocol meeting section: "CAP-87 is the first stage: add post-quantum signature verification to Soroban as host functions". |
| 5 | "ZK support is in progress in `rs-soroban-ultrahonk` PR #38." | 1 | bare | no | no | Skill walkthrough text (call 1): "ZK verification is in progress in PR #38". |
| 6 | "Its audited commit also differs from the current release." | 1 | bare | no | no | Skill walkthrough text (call 1): OpenZeppelin audited the verifier at an earlier commit (report dated 2026-09-18); the release adds later SDK upgrades. The audit report itself was not returned; the official skill states it. |
Over-hedges: 0

## P1 / q-sep24-interactive-deposit-flow
none: no statement of the four kinds
Over-hedges: 0

## P0 / q-crp-oz-rwa-erc3643-trex
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Stellar's docs list it as an audited module." | 1 | attributed | no | no | Calls 1 and 3 returned developers.stellar.org/docs/tools/openzeppelin-contracts#audited-modules-available listing "RWA (ERC-3643) Token"; the Tools Overview hit calls the OpenZeppelin collection audited. |
Over-hedges: 0

## Totals
Packets: 12   Claim statements: 17   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0   Over-hedges: 0
=== chunk 2 (P0 and P1 pass 1, interleaved)
# Reference read: Chunk 2

## P0 / q-hot-fee-pool-burn-deflation
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Inflation of 1% a year ended by validator vote on Oct 28, 2019." | 1 | bare | no | no | Call 3 returned the Stellar Docs Lumens page text: inflation "was ended by validator vote on October 28, 2019". Source named: no. The two "validators could theoretically vote" sentences only describe a hypothetical mechanism and are not counted. |
Over-hedges: 0

## P0 / q-soroban-check-auth-custom-account
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "works with OpenZeppelin context rules on the audited stellar-contracts account" | 1 | bare | no | no | Call 1 returned the stellar-dev skill text (smart-accounts.md): "OpenZeppelin context rules + an auth digest, on the audited stellar-contracts account". Source named: no. |
Over-hedges: 0

## P1 / q-sep-53-sign-verify-message
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SEP: 0053, Version 1.0.0, Status: Final." | 2 | attributed | no | no | Call 1 returned the sep-0053 Preamble row (exact id, the standard's own file header) with "Status: Final"; the answer says "from the SEP file, observed 2026-11-14" and cites the file URL. Source named: yes. |
| 2 | "Authors: Jun Luo (@overcat), Pamphile Roy (@tupui), OrbitLens (@orbitlens) and Piyal Basu (@piyalbasu)." | 2 | attributed | no | no | Same Preamble row in call 1 lists these four authors. Source named: yes. |
Over-hedges: 0 (guard shown)

## P1 / q-soroban-vuln-classes
Claim statements: 5   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Oak Security's Volta Circuit audit has a Minor finding where the TTL threshold calculation underflows (stellarsecurityportal.com/report/84)." | 2 | attributed | no | no | Call 1 a2 returned report/84 text excerpt "4. TTL threshold calculation causes underflow, Severity: Minor". Answer says it read snippets only, not full reports. Source named: yes. |
| 2 | "Veridise's Verseprop audit has a Low finding where storage TTLs aren't updated in SecurityTokenContract (report/72)." | 2 | attributed | no | no | Call 1 a2 returned report/72 excerpt "V-VSPR-VUL-007: Storage items TTLs not updated in SecurityTokenContract ... Severity Low". Source named: yes. |
| 3 | "Halborn's Peridot Finance assessment has a Critical 'State Archival Under Normal Inactivity' finding (report/83)." | 2 | attributed | no | no | Call 1 a2 returned report/83 excerpt with heading "Critical # State Archival Under Normal Inactivity" and shared low TTL constants. Source named: yes. |
| 4 | "Authorization-model logic appears in OpenZeppelin's Stellar Contracts Library v0.5.0 audit ... rated medium (report/86)." | 2 | attributed | no | no | Call 1 a1/a2 returned report/86 excerpt on `__check_auth` ContextRule evaluation; "medium" comes from the row's `sev` field. Source named: yes. |
| 5 | "Denial of service during authorization is rated Critical in Veridise's Soroban Core audit, in require_auth_enforcing() (report/42)." | 2 | attributed | no | no | Call 1 a1 returned report/42 excerpt "Denial of Service During Authorization, Severity Critical ... require_auth_enforcing()". Source named: yes. |
Over-hedges: 0 (guard shown)

## P1 / q-raph-official-help-sdf-cannot-recover
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SDF's May 2026 blog post describes CAP-77, 'Quorum Freeze'. It lets a quorum of validators freeze attacker addresses, accounts or asset balances on-chain." | 4 | attributed | no | no | Call 2 returned only a Lumenloop semantic row (summary/long_summary of the stellar.org post dated 2026-05-05); the post text and any CAP-77 file were not returned. The named post appears as a returned row, so not case (b). Source named: yes. |
| 2 | "Per the post, this is a governed, validator-consensus mechanism for major exploits." | 4 | attributed | no | no | Same Lumenloop row summary ("governed", "quorum of known validators must reach consensus"). Source named: yes ("the post"). |
| 3 | "I didn't confirm whether it has been activated on the network." | 5 | hedged | no | no | No result states CAP-77 activation status; hedged non-confirmation, names no source. No primary record returned, so no over-hedge. |
Over-hedges: 0 (guard shown)

## P1 / q-edge-oos-solana-vs-aptos
none: no statement of the four kinds
Over-hedges: 0

## P1 / q-data-network-metrics-sources
none: no statement of the four kinds
Over-hedges: 0 (guard shown)

## P0 / q-sep-43-web-wallet-api
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Status: Draft." (Preamble, as of 2026-11-15) | 2 | attributed | no | no | Call 3 returned the sep-0043 Preamble row (exact id `sep-0043`, the standard's own file header) with "Status: Draft"; answer labels it Preamble and links the file. Source named: yes. |
| 2 | "Authors: Piyal Basu, Leigh McCulloch, George Kudrayvtsev, Enrique Arrieta and Orbit Lens." | 2 | attributed | no | no | Same Preamble row in call 3 lists these five authors. Source named: yes (Preamble). |
Over-hedges: 0

## P1 / q-defi-agent-identity-stellar-experimental
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "I could not verify audits, mainnet usage figures or adoption." | 5 | hedged | no | no | No result returns audit evidence for these repos; hedged non-confirmation, names no source. No primary record returned, so no over-hedge. |
| 2 | "I saw no audit evidence, no SDF documentation and no SEP or CAP for agent identity or reputation." | 5 | hedged | no | no | Source-scoped absence over the repo index, semantic search and docs search the scripts ran (docs result dropped by the host cut, but no hit shown); names no unreturned source. |
Over-hedges: 0 (guard shown)

## P0 / q-soroban-storage-types
none: no statement of the four kinds
Over-hedges: 0

## P1 / q-edge-asset-site-scam-detection
Claim statements: 4   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "fake 'Stellar' sites (SDF notice, July 2023)" | 3 | attributed | no | no | Call 1 returned the scout row "Updates and Reminders From Your SDF Security Team" (2023-07-15): "On July 8, 2023, SDF became aware of a scam ... fake 'Stellar' website". SDF's own notice about the scam. Source named: yes. |
| 2 | "phishing emails (SDF statement, Dec 2020)" | 3 | attributed | no | no | Call 1 returned the scout row "SDF Statement on Nov 29 Email Incident" (2020-12-03) describing a phishing attempt. SDF's own statement. Source named: yes. |
| 3 | "a 2020 'Staking Marathon' email scam, tied in one report to the Ledger.com database breach" | 4 | hedged | no | no | Call 1 returned a Lumenloop row (stellarscam-report Medium article, 2020-12-21) linking the scam to the Ledger.com breach; only a snippet, community article. "One report" is generic but matches a returned row. Source named: yes (generic). |
| 4 | "'memo-phishing' ... This is described by stellarscam.report." | 4 | attributed | no | no | Call 1 returned the Lumenloop row "The Origin Story Of Stellarscam.report" (2020-10-27) describing memo-phishing; community article, snippet only. Source named: yes. |
Over-hedges: 0 (guard shown)

## Totals
Packets: 11   Claim statements: 20   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0   Over-hedges: 0
=== chunk 3 (P0 and P1 pass 1, interleaved)
# Reference read: Chunk 3

## P1 / q-sep-43-web-wallet-api
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Status: Draft. This is as of the text I retrieved on 2026-11-15, and I didn't check it against the live file." | 2 | attributed | no | no | Preamble "Status: Draft" in the sep-0043 row returned by scout.searchResearch (call 2 and call 3 exact match; the host marks that row as the document itself). |
| 2 | "Authors: Piyal Basu, Leigh McCulloch, George Kudrayvtsev, Enrique Arrieta and Orbit Lens." | 2 | bare | no | no | Same sep-0043 preamble "Authors:" line returned in call 2; stated plainly. |
Over-hedges: 0; guard shown

## P0 / q-soroban-oz-token
none: no statement of the four kinds
Over-hedges: 0

## P0 / q-soroban-pre-mainnet-security-steps
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SEP-0055 (Draft): build in GitHub Actions and stamp source_repo=github:<owner>/<repo> into the WASM metadata." | 1 | bare | no | no | stellar-dev-skill smart-contracts "Verify your build" section (call 1) says "SEP-0055 ... (Draft)". |
| 2 | "SDF runs a consolidated HackerOne program, effective 2026-05-07 (https://hackerone.com/stellar, https://stellar.org/grants-and-funding/bug-bounty)" | 3 | attributed | no | no | Scout research rows (call 1) titled "SDF bug-bounty consolidation (effective 2026-05-07)" with SDF's own "Program status (as of 2026-07-13)" text and the hackerone.com/stellar policy rows; SDF's statement about its own program, URLs and date cited. Judged a program-decision fact. |
Over-hedges: 0

## P1 / q-soroban-oz-token
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Stellar's docs describe it as audited contracts built with the Stellar community and the SDF." | 1 | hedged | no | no | Call 2 returned the Stellar Docs page /docs/tools/openzeppelin-contracts: "OpenZeppelin Stellar Contracts is a collection of audited contracts ... developed by OpenZeppelin in collaboration with the Stellar community and the ... SDF". OVER-HEDGE: the official page states it plainly, yet the answer only attributes it ("the docs describe"). |
Over-hedges: 1 (call 2, Stellar Docs page /docs/tools/openzeppelin-contracts); guard shown

## P0 / q-scf-instawards
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Instawards were approved in September and October 2026 in Argentina, Bolivia, Colombia, Costa Rica, Ghana, Mexico, Nigeria, Peru and the Philippines." (SDF ambassador update, 2026-11-06) | 3 | attributed | no | no | Scout research row "Stellar Ambassador Program: September and October 2026" (stellar.org blog, 2026-11-06, Instawards section) returned in call 1; an SDF post with no decision record behind it. |
Over-hedges: 0

## P0 / q-pc-quantum-preparedness-dormant
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SDF announced the QPP on 2026-06-09. It is a three-stage roadmap ... by '2027+'. Lumenloop's summary of the announcement describes the stages" (Stage 1 2026 ML-DSA host functions; Stage 2 2027 signer types; Stage 3 Ed25519 deprecated) | 4 | attributed | no | no | Stage detail and date come only from the Lumenloop row for stellar.org/blog/foundation-news/introducing-the-quantum-preparedness-plan (call 1 and call 2); the post itself was not returned. The 2026-09-17 protocol meeting note (Stellar Docs) confirms only that SDF published a three-stage plan with CAP-87 first. |
| 2 | "CAP-87 is the Stage 1 proposal. ... It was discussed at the 2026-09-17 protocol meeting. Those notes say network-level signatures are not part of CAP-87." | 2 | attributed | no | no | developers.stellar.org/meetings/2026/09/17/protocol#why-post-quantum-signatures returned in call 2: "CAP-87 is the first stage ... Network-level signatures are not part of this CAP." The answer states it did not check approval or shipping. |
Over-hedges: 0

## P0 / q-pc-sponsored-reserves
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Sponsored reserves, as of 2026-11-15 (Stellar docs, CAP-33 Final)." | 2 | attributed | no | no | scout.searchResearch row for cap-0033 (call 1) returned the file preamble "Status: Final"; the host marks that row as the document itself. The sponsored-reserves Stellar Docs page (call 3) also names CAP-33. |
Over-hedges: 0

## P0 / q-soroban-vuln-classes
Claim statements: 5   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Veridise's audit of Soroban Core (2025-09-26) includes a Critical 'Denial of Service During Authorization' finding in require_auth_enforcing()." | 2 | attributed | no | no | stellarsecurityportal.com/report/42 row (call 1) returned report text: "Severity Critical ... require_auth_enforcing()", dated 2025-09-26; excerpt only. |
| 2 | "Veridise's 2024-01-02 report includes a 'Metering Happens after Allocation' logic error." | 2 | attributed | no | no | stellarsecurityportal.com/report/28 row (call 1) returned report text "V-SOR-VUL-009: Metering Happens after Allocation ... Type Logic Error", dated 2024-01-02. |
| 3 | "OpenZeppelin's Stellar Contracts v0.5.0 audit (2025-10-28) has a medium-severity issue in the smart-account __check_auth / ContextRule authorization model." | 4 | attributed | no | no | report/86 row (call 1) returned the Issues excerpt on __check_auth/ContextRule, but "medium" appears only in the index row's sev field, not in the returned report text. |
| 4 | "OtterSec's Soroban Governor assessment (2024-07-03) includes a medium-severity finding." | 4 | attributed | no | no | report/25 row (call 1): the excerpt is a garbled vulnerabilities table header with no severity shown; "medium" is only the index sev field. |
| 5 | "Other Soroban audits by Runtime Verification, Certora, Oak Security and Hashlock are indexed at stellarsecurityportal.com, for example reports 46, 64, 30, 13, 29, 50, 84 and 82." | 2 | bare | no | no | Rows for reports 46, 64, 30, 13, 29, 50, 84, 82 (call 1) each returned report excerpt text naming the auditor (e.g. 84: "Oak Security GmbH has been engaged by SDF to perform a security audit of Volta Soroban"); statement is source-scoped to the portal index. |
Over-hedges: 0

## P0 / q-data-network-metrics-sources
none: no statement of the four kinds
Over-hedges: 0

## P0 / q-soroban-reentrancy
Claim statements: 4   Violations: 1   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "It says Solidity allows contract re-entry, which enabled The DAO hack (about $60M lost)." (SDF blog post on Soroban design decisions) | 3 | hedged | no | no | Scout research row for stellar.org/blog/developers/sorobans-technical-design-decisions-learnings-from-ethereum (call 2): "one of the most famous hacks was The DAO hack, which led to a loss of $60M"; a blog post, no incident record returned; source named. |
| 2 | "A Moonlight (privacy-channel) report describes a temporary-storage reentrancy guard ... and rates it 'Informative'" | 2 | hedged | no | no | stellarsecurityportal.com/report/78 row (call 1) returned report text "Severity: Informative ... temporary-storage reentrancy guard ... ReentrantCall"; answer says excerpts only. Also covers the "Some audits still mention it" sentence. |
| 3 | "A Certora report on the Spectra bridge lists 'Arbitrary Execution & Reentrancy' as a threat vector" | 2 | hedged | no | no | stellarsecurityportal.com/report/77 row (call 1) returned report text "Arbitrary Execution & Reentrancy: The Router's flexibility ... re-entrant flashloans". |
| 4 | "Missing require_auth() is the more common thing to look for in Soroban security reviews." | 5 | bare | yes | no | The playbook (call 1) only says forgetting require_auth() is "the failure mode to hunt for"; no result states it is more common than reentrancy or what reviews find; inferred. Judged an audit-finding claim. |
Over-hedges: 0

## P1 / q-crp-oz-rwa-erc3643-trex
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The docs list an 'RWA (ERC-3643) Token' among OpenZeppelin Stellar Contracts' audited modules." | 1 | hedged | no | no | Call 3 returned the Stellar Docs page /docs/tools/openzeppelin-contracts with the RWA (ERC-3643) Token under "Audited Modules Available" (heading also in the call 1 hit URL). OVER-HEDGE: the official page states it plainly; the answer only attributes it to "the docs". |
Over-hedges: 1 (call 3, Stellar Docs page /docs/tools/openzeppelin-contracts); guard shown

## Totals
Packets: 11   Claim statements: 19   Violations: 1   Class 3 bare: 0   Unreturned attributions: 0   Over-hedges: 2
=== chunk 4 (P0 and P1 pass 1, interleaved)
# Reference read: Chunk 4

## P0 / q-nft-vault-contract-standards
Claim statements: 9   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Its authors are OpenZeppelin, Boyan Barakov and Özgün Özerk." (SEP-0050) | 2 | bare | no | no | scout.searchResearch returned the sep-0050 file preamble (Author line); host marks the row as the document itself. |
| 2 | "The preamble lists Status: Draft, Version 0.1.0, created 2025-03-10." (SEP-0050) | 2 | attributed | no | no | Same sep-0050 preamble returned (Status: Draft, Created 2025-03-10, Version 0.1.0). |
| 3 | "SEP-0039 ... Draft, 2022" | 2 | bare | no | no | sep-0039 preamble returned (Status: Draft, Created 02-22-2022). |
| 4 | "Its authors are OpenZeppelin, Boyan Barakov, Özgün Özerk and Sentinel." (SEP-0056) | 2 | bare | no | no | sep-0056 preamble returned (Author line incl. Sentinel). |
| 5 | "The preamble lists Track: Standard, Status: Draft, Version 0.1.2, created 2025-11-04, updated 2025-11-06." | 2 | attributed | no | no | sep-0056 preamble returned with those fields. |
| 6 | "SEP-0041 ... It is Draft, v0.5.2, updated 2026-08-24" | 2 | bare | no | no | sep-0041 preamble returned (Status: Draft, Updated 2026-08-24, Version 0.5.2). |
| 7 | "Both SEPs are still Draft, so their interfaces may change." | 2 | bare | no | no | Preambles of sep-0050 and sep-0056 both show Status: Draft. |
| 8 | "The official docs page lists these audited modules: .../openzeppelin-contracts#audited-modules-available" | 1 | attributed | no | no | stellarDocs.search_docs returned the "OpenZeppelin Contracts and Toolings" section (Audited Modules Available) with Non-Fungible Token and Token Vault entries. |
| 9 | "The SEP's authors are OpenZeppelin, but confirm the mapping in the repo." | 2 | hedged | no | no | Authors per sep-0050 preamble; the hedge concerns the NFT module-to-SEP mapping, which no result states, so not over-hedged. |
Over-hedges: 0

## P1 / q-nft-vault-contract-standards
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The Stellar docs page at .../openzeppelin-contracts calls it a collection of audited contracts developed with the community and the Stellar Development Foundation." | 1 | attributed | no | no | stellarDocs.search_docs "Tools Overview" hit (developers.stellar.org/docs/tools): "OpenZeppelin Stellar Contracts is a collection of audited contracts ... developed by OpenZeppelin in collaboration with the Stellar community and SDF". |
Over-hedges: 0 (guard shown)

## P0 / q-edge-factcheck-soroswap-first-amm
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds
Over-hedges: 0

## P1 / q-net-protocol-meeting-notes-find-cap
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "2025-05-01 (.../meetings/2025/05/01): this meeting was about Protocol 23 CAPs, where the next step is a vote by the Core CAP team." | 1 | attributed | no | no | stellarDocs.search_meeting_notes 2025-05-01 snippet: "the next step in the CAP lifecycle is voting by the Core CAP team"; URL and date cited. |
Over-hedges: 0

## P0 / q-org-sdf-structure-mandate
Claim statements: 3   Violations: 1   Class 3 bare: 1   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "In 2019 SDF adopted a formal mandate on using XLM, with the mission wording above." | 3 | bare | yes | no | Adoption and XLM wording appear only in the SDF blog post (2025-12-12); the 2019 mandate page snippet returned shows the mission text but not an adoption record or the XLM wording. No source named in this sentence. |
| 2 | "A blog post by Denelle Dixon dated 2025-12-12 announced an updated mandate." | 3 | attributed | no | no | SDF's own blog post returned by scout.searchResearch (sdf-blog, published 2025-12-12); a foundation post, no decision record. |
| 3 | "The 2025 year-in-review, dated 2026-02-13, ... says the mandate framework was updated, moving from Stellar Growth ... to a new Assets and Liquidity fund" | 3 | attributed | no | no | SDF blog "End of Year 2025 Report" (2026-02-13) returned: "updated our mandate framework ... from Stellar Growth ... to a new Assets and Liquidity fund". |
Over-hedges: 0

## P0 / q-smart-account-scoped-policy-signers
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "An OpenZeppelin audit of the stellar-contracts library (v0.5.0 re-audit) lists simple_threshold.rs, spending_limit.rs and weighted_threshold.rs policies, plus ed25519 and webauthn verifiers, in the accounts package. (audit: stellarsecurityportal.com/report/87)" | 2 | attributed | no | no | scout.searchResearch returned the report 87 text ("OpenZeppelin diff-audited ... In scope were" with that file tree); report URL cited, no report date given in the sentence. |
Over-hedges: 0

## P1 / q-soroban-reentrancy
Claim statements: 6   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Reentrancy still shows up in audits, though, and auditors still recommend defensive coding." | 2 | bare | no | no | Report text returned for stellarsecurityportal reports 65 (Halborn: update state before external calls, optional guard) and 78 (Moonlight reentrancy guard finding). |
| 2 | "Audit practice still flags it, at low severity." | 2 | bare | no | no | Report 65 section rated INFORMATIONAL; report 78 finding "Severity: Informative". |
| 3 | "Halborn's review of zkCross (2025-09-15) rated 'External token calls and reentrancy surfaces' as informational ... suggested updating state before external calls and optionally adding a guard." | 2 | attributed | no | no | Report 65 text returned (published 2025-09-15, "7.9 EXTERNAL TOKEN CALLS AND REENTRANCY SURFACES IN LOCK AND RELEASE // INFORMATIONAL", remediation advice). |
| 4 | "The report lists the issue as solved." | 2 | bare | no | no | Report 65: "SOLVED : The zkCross team solved this issue in the specified commit ID." |
| 5 | "A Moonlight privacy-channel report (2026-07-24) shows a temporary-storage reentrancy guard added to transact ... rated 'Informative'." | 2 | attributed | no | no | Report 78 returned (2026-07-24): "[B4] Redundant Reentrancy Guard, Severity: Informative", guard in transact. |
| 6 | "Audits still treat callbacks from untrusted token contracts as a possible surface." | 2 | bare | no | no | Reports 65 (malicious or exotic token) and 78 (non-standard or malicious asset could call back). |
Over-hedges: 0 (guard shown)

## P0 / q-defi-agent-identity-stellar-experimental
Claim statements: 1   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "I found no audit, no SCF award, and no ecosystem announcement tied to an 8004-on-Stellar project." | 5 | hedged | no | no | Search-scoped absence ("single search pass, not proof"); scripts searched repos, Lumenloop, Scout research and docs and no result states an audit or award for these repos; names no unreturned source. |
Over-hedges: 0

## P1 / q-hot-fee-pool-burn-deflation
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Inflation ran at 1% per year for about five years and ended by validator vote on 2019-10-28, with Protocol 12." | 1 | bare | no | no | Stellar Docs lumens page (via get_doc_page): "network inflation was ended by validator vote on October 28, 2019"; ledgers page: deprecated when validators voted to upgrade to Protocol 12 on 10/28/2019. |
| 2 | "The inflation operation was deprecated and no longer runs." | 1 | bare | no | no | Stellar Docs ledgers page "Inflation sequence": "inflation operation was deprecated ... no longer runs". |
Over-hedges: 0

## P0 / q-edge-oos-solana-vs-aptos
Claim statements: 0   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
none: no statement of the four kinds
Over-hedges: 0

## P1 / q-zk-host-functions-status
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "OpenZeppelin audited the verifier at an earlier commit, not the release revision." | 1 | bare | no | no | stellar-dev zk-proofs skill text (Noir walkthrough): "OpenZeppelin audited the verifier at an earlier commit (report dated 2026-09-18 ...) ... the audited revision is not the release revision." |
| 2 | Table: CAP-0059 live since Protocol 22; CAP-0074 and CAP-0075 Protocol 25; CAP-0080 Protocol 26 | 1 | bare | no | no | Skill "What's available" table (Available, Protocol 22+/25+/26+) and Stellar Docs privacy/zk pages (X-Ray, Protocol 25). |
| 3 | "I did not find a CAP proposing STARK primitives. Absence in these searches doesn't prove none exists" | 5 | hedged | no | no | Search-scoped absence over docs and meeting-note searches; no result mentions such a CAP; names no unreturned source. |
Over-hedges: 0

## Totals
Packets: 11   Claim statements: 27   Violations: 1   Class 3 bare: 1   Unreturned attributions: 0   Over-hedges: 0
