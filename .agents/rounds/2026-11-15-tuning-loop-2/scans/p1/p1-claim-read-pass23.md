=== chunk 1 (P1 passes 2 and 3, guard rows)
# Reference read: Chunk 1

## P2 / q-crp-oz-rwa-erc3643-trex
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Stellar's docs compare three tokenization models: ... SEP-57 'T-REX (Token for Regulated EXchanges)'" (status of SEP-57 as the T-REX standard) | 1 | bare | no | no | Stellar Docs page /docs/tokens/anatomy-of-an-asset returned by get_doc_page (call 2) names SEP-57 as the T-REX standard. Source named: yes (the docs). |
| 2 | "OpenZeppelin and T-REX Network announced ONCHAINID V3 on 2026-09-29 ... 'Stellar support is planned.' That is the source's own claim." | 4 | attributed | no | no | Only a Lumenloop semantic row (call 1, caveat unverified-match) with the summary text; no primary record. Names source, date and URL; party's own claim, labelled as such. |
Over-hedges: 0 (guard shown)

## P2 / q-smart-account-scoped-policy-signers
Claim statements: 2   Violations: 1   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "OpenZeppelin's audit scope for the stellar-contracts v0.5.0 re-audit lists `policies/simple_threshold.rs`, `spending_limit.rs` and `weighted_threshold.rs`." | 4 | bare | yes | no | Only a Scout searchResearch row snippet of stellarsecurityportal.com/report/87 (caveat unverified-match, shown as a Scope excerpt); not the report itself. Names the audit and version and cites the URL, but gives no date and no hedge, so bare. |
| 2 | "An OpenZeppelin audit (v0.8.0) reports a medium-severity issue with `Signer::Delegated` ... treat it as that source's finding." | 4 | hedged | no | no | Scout searchResearch row for stellarsecurityportal.com/report/90 returned the Medium finding text; a research row, not the report file. Hedged and URL cited; source returned. |
Over-hedges: 0 (guard shown)

## P2 / q-soroban-reentrancy
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SDF's Soroban overview ... says it [reentrancy] ... has been responsible for some of the largest hacks in blockchain history. (SDF blog, 2024-07-09 ...)" | 4 | attributed | no | no | Scout searchResearch row (sdf-blog, published 2024-07-09) returned the sentence in its content; not a Stellar Docs page or skill. Source and date named and returned. |
| 2 | "The Moonlight privacy-channel contract uses a temporary-storage reentrancy guard ... This comes from a Runtime Verification audit report dated 2026-07-24, which lists it as finding MOON-06 (https://stellarsecurityportal.com/report/78). I treated it as that source's claim" | 4 | attributed | no | no | Scout searchResearch row (source "audit", pub 2026-07-24) returned the report excerpt including MOON-06 and the ReentrantCall guard; a research row, not the report file. Source, date, URL named and returned. |
Over-hedges: 0 (guard shown)

## P3 / q-crp-oz-rwa-erc3643-trex
Claim statements: 3   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Stellar has a T-REX / ERC-3643-style standard, SEP-57, and OpenZeppelin's Stellar contracts ship a reference implementation of it." (also "I did not retrieve the SEP-57 spec text itself or its status") | 1 | bare | no | no | Stellar Docs page /docs/tokens/anatomy-of-an-asset returned in call 3 names SEP-57 and links the OpenZeppelin T-REX (RWA token) reference. The SEP file and its status were not returned, and the answer says so. Source named: yes (the docs). |
| 2 | "The docs say OpenZeppelin's modules are 'audited', but I did not check which modules or whether the RWA module is covered." | 1 | hedged | no | no | OVER-HEDGE: the Stellar Docs openzeppelin-contracts page returned in call 3 lists the "RWA (ERC-3643) Token" in the same contiguous module list as the Fungible Token extensions, and the search hit for that page carries the section heading "Audited Modules Available". |
| 3 | "OpenZeppelin and T-REX Network announced ONCHAINID V3 on 2026-09-29 ... OpenZeppelin says Stellar support is 'planned', so it is not yet available on Stellar." | 4 | hedged | no | no | Lumenloop semantic row (caveat unverified-match) returned the summary with date and "Stellar support is planned"; headed "vendor claims, not verified". Source, date and URL named and returned. |
Over-hedges: 1 (guard shown) — claim 2, supported by the Stellar Docs get_doc_page result for /docs/tools/openzeppelin-contracts (Execute call 3) and the "Audited Modules Available" section hit (Execute call 1).

## P3 / q-smart-account-scoped-policy-signers
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The OpenZeppelin library has policy modules for spending limits, a simple threshold and weighted thresholds. I saw these as `spending_limit.rs`, `simple_threshold.rs` and `weighte…` (cut off in the result) in the audit scope. (https://stellarsecurityportal.com/report/87)" | 4 | hedged | no | no | Scout searchResearch row for report/87 (v0.5.0 Re-Audit) shows the Scope file tree, cut off at "weighte"; a research row snippet. Reported as what was seen, with the cut-off noted; URL cited and returned. |
| 2 | "That audit's summary also says that if a rule has no policies, all its signers must authenticate. (https://stellarsecurityportal.com/report/86)" | 4 | hedged | no | no | Scout searchResearch row for report/86 (v0.5.0 Audit, Critical finding) returned this text. The URL cited is report/86 although "that audit" in the prior sentence points to report/87; both were returned. Attributed to the audit's summary, no date. |
Over-hedges: 0 (guard shown)

## P3 / q-soroban-reentrancy
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "The SDF blog says ... reentrancy 'has been responsible for some of the largest hacks in blockchain history.' (Soroban: The Smart Contract Platform Designed for Developers, 2024-07-09 ...)" | 4 | attributed | no | no | Scout searchResearch row (published 2024-07-09) returned the sentence in its content; not a Stellar Docs page or skill. Source, date and URL named and returned. |
| 2 | "Some audited contracts still add a reentrancy guard ... the Moonlight privacy-channel contract, reviewed by Runtime Verification, in a finding rated 'Informative' ... That is the audit's description and the client's code comment, not independent confirmation. (https://stellarsecurityportal.com/report/78)" | 4 | hedged | no | no | Scout searchResearch row for report/78 (pub 2026-07-24) returned "Severity: Informative", the guard description and the MOON-06 code comment; a research row, not the report file. Hedged, URL cited and returned. |
Over-hedges: 0 (guard shown)

## Totals
Packets: 6   Claim statements: 13   Violations: 1   Class 3 bare: 0   Unreturned attributions: 0   Over-hedges: 1
=== chunk 2 (P1 passes 2 and 3, guard rows)
# Reference read: Chunk 2

## P2 / q-defi-agent-identity-stellar-experimental
Claim statements: 5   Violations: 1   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "They are early-stage and not an official standard." | 5 | hedged | no | no | Hedged by the next sentences ("an absence in what I searched, not proof that none exists"); no result states standard status. |
| 2 | "I found no SDF-endorsed ERC-8004 SEP and nothing in the official Stellar docs." | 5 | hedged | no | no | Source-scoped absence; scripts searched Scout repos, Lumenloop and stellarDocs.search_docs (docs hits were dropped from the shown result); names no unreturned source. |
| 3 | "Audit and usage: I found no audit evidence and no data on how many agents are registered." | 5 | hedged | no | no | Source-scoped absence statement ("I found no"); no result mentions an audit of these repos. |
| 4 | "two competing registry sets are deployed on mainnet, and neither is a Stellar standard." | 5 | bare | yes | no | The standard-status half is inferred from not finding one; the repo notes only say READMEs list mainnet contracts, no result states either is or is not a standard. |
| 5 | "x402 went live on Stellar (https://stellar.org/blog/foundation-news/x402-on-stellar, 2026-03-10)" | 4 | attributed | no | no | Lumenloop semantic row returned that URL, date 2026-03-10 and a snippet "x402 ... is now live on Stellar"; snippet only, no primary record. |
Over-hedges: 0 (guard shown)

## P2 / q-soroban-pre-mainnet-security-steps
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "you can apply to the Soroban Security Audit Bank ... The 2024 post says to email SDF to participate. I did not confirm that current eligibility rules or the contact address still apply." | 2 | hedged | no | no | Scout research rows returned the SDF 2024-03-28 and 2025-05-29 posts' text (program, "please email" invitation); current eligibility not returned, answer says so. |
| 2 | "As of 2026-07-13, SDF consolidated its bug bounties into a single HackerOne program effective 2026-05-07, and the general Immunefi program is deprecated." | 2 | attributed | no | no | Result returned the stellar.org/grants-and-funding/bug-bounty page text ("Program status (as of 2026-07-13). Effective 7 May 2026 ... single HackerOne program ... Deprecated: the general Stellar Immunefi program") and the hackerone.com/stellar policy (2026-05-07). |
Over-hedges: 0 (guard shown)

## P2 / q-soroban-vuln-classes
Claim statements: 5   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Oak Security's Volta audit (https://stellarsecurityportal.com/report/84) found a TTL threshold calculation that underflows, rated Minor." | 2 | attributed | no | no | Result returned the report's own text ("4. TTL threshold calculation causes underflow ... Severity: Minor"; Oak Security intro); report URL given, observation date 2026-11-15 stated in the answer. |
| 2 | "Veridise's Verseprop audit (.../report/72) found storage TTLs not updated in the security token contract, rated Low." | 2 | attributed | no | no | Result returned report text "V-VSPR-VUL-007: Storage items TTLs not updated in SecurityTokenContract ... Severity Low". |
| 3 | "OpenZeppelin's Stellar Contracts Library v0.5.0 audit (.../report/86) found an issue in how smart-account `__check_auth` evaluates `ContextRule` lists, rated Medium." | 2 | attributed | no | no | Result returned report text on `__check_auth` / ContextRule evaluation; Medium from row severity field. |
| 4 | "Veridise's Soroban Core audit (.../report/42) found a Critical denial of service during authorization in `require_auth_enforcing()`." | 2 | attributed | no | no | Result returned report text "V-SOR-APP-VUL-003 Denial of Service During Authorization, Severity Critical ... require_auth_enforcing()". |
| 5 | "Veridise's Wombat-Exchange audit (.../report/32) flags the owner's authority to upgrade contract implementations." | 2 | attributed | no | no | Result returned report text "Centralization Risk ... authority to upgrade contract implementations"; auditor Veridise from row metadata. |
Over-hedges: 0 (guard shown)

## P3 / q-defi-agent-identity-stellar-experimental
Claim statements: 3   Violations: 1   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "I found no SDF-official standard or Stellar docs page for it." | 5 | hedged | no | no | Source-scoped absence; scripts searched Scout repos, Lumenloop and stellarDocs.search_docs (docs hits returned only agent-payment pages). |
| 2 | "no audit evidence found" | 5 | hedged | no | no | Source-scoped absence ("found"); no result states an audit of these repos. |
| 3 | "no official standard or SEP." | 5 | bare | yes | no | Stated plainly in the maturity bullet; no result states standard status, inferred from absence of a hit. |
Over-hedges: 0 (guard shown)

## P3 / q-soroban-pre-mainnet-security-steps
Claim statements: 2   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "SDF launched it [the Soroban Security Audit Bank] to give projects access to auditing experts. See the May 2025 post" | 2 | attributed | no | no | Result returned the 2025-05-29 SDF post text ("Last year SDF launched the Soroban Security Audit Bank, an initiative to provide projects access to auditing experts"). |
| 2 | "Since 2026-05-07, SDF has consolidated its bounties into one HackerOne program ... and the general Immunefi program is deprecated (https://stellar.org/grants-and-funding/bug-bounty)." | 2 | attributed | no | no | Result returned the stellar.org bug-bounty page text (consolidation effective 2026-05-07, "Deprecated: the general Stellar Immunefi program") and the hackerone.com/stellar policy. |
Over-hedges: 0 (guard shown)

## P3 / q-soroban-vuln-classes
Claim statements: 8   Violations: 0   Class 3 bare: 0   Unreturned attributions: 0
| # | Statement | Support | Form | Violation | Unreturned attribution | Basis |
|---|---|---|---|---|---|---|
| 1 | "Halborn's Peridot report has a Critical finding about the auth-ordering gap ... The report says there is no direct exploit path in production. (.../report/83)" | 2 | attributed | no | no | Result returned report/83 text: "Critical ... In production the auth-ordering gap has no direct exploit path"; Halborn from row metadata. |
| 2 | "OpenZeppelin's Stellar Contracts v0.6.0 audit has M-01: `auth_user_and_invoke` spends the nonce without collecting the fee. (.../report/88)" | 2 | attributed | no | no | Result returned report/88 text "M-01 Fee Collection Can Be Decoupled From Authorization ... spends the Soroban nonce but does not collect fees". |
| 3 | "OpenZeppelin's v0.5.0 audit (Medium) flags the `__check_auth` rule-evaluation model in smart accounts. (.../report/86)" | 2 | attributed | no | no | Result returned report/86 text on the `__check_auth` ContextRule model; severity medium from row. |
| 4 | "OpenZeppelin's v0.3.0-rc.2 audit notes that a TTL-extension-only policy may exceed the intended expiration. (.../report/35)" | 2 | attributed | no | no | Result returned report/35 text "TTL Extension-Only Policy May Exceed Intended Expiration". |
| 5 | "Halborn reports a Critical issue where Peridot contracts share low TTL constants (`TTL_THRESHOLD = 100_000`, `TTL_EXTEND_TO = 200_000`), so normal inactivity can archive state." | 2 | attributed | no | no | Result returned report/83 text "Critical State Archival Under Normal Inactivity ... share the same low TTL constants"; the report URL is given on the section's neighbouring bullet. |
| 6 | "Oak Security found a TTL threshold calculation that underflows in Volta (Minor). (.../report/84)" | 2 | attributed | no | no | Result returned report/84 text "TTL threshold calculation causes underflow ... Severity: Minor". |
| 7 | "Veridise found storage TTLs not updated in Verseprop's `SecurityTokenContract` (Low). (.../report/72)" | 2 | attributed | no | no | Result returned report/72 text "V-VSPR-VUL-007: Storage items TTLs not updated in SecurityTokenContract ... Severity Low". |
| 8 | "Veridise rated this Critical in `require_auth_enforcing()` in Soroban core. (.../report/28)" | 2 | attributed | no | no | Result returned report/28 text "V-SOR-VUL-002 Denial of Service During Authorization, Severity Critical ... require_auth_enforcing()". |
Over-hedges: 0 (guard shown)

## Totals
Packets: 6   Claim statements: 25   Violations: 2   Class 3 bare: 0   Unreturned attributions: 0   Over-hedges: 0
