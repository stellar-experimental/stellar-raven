---
id: sd-005
service: stellar-docs
status: reported-upstream
discovered: 2026-07-06
evidence:
  - "2026-11-09 sweep (still-repro): Both agentic-payments overview and x402 page still attribute the protocol to Coinbase Developer Platform. AP2/ACP positioning remains absent on those pages and optional by the accepted maintainer scope decision. Recheck: https://developers.stellar.org/docs/build/agentic-payments.md; https://developers.stellar.org/docs/build/agentic-payments/x402.md"
  - eval/qa/results/2026-07-06T18-48-22-variantA.json (q-defi-agentic-payment-standards-compare, partial — verdict stands)
  - verdict-review workflow wf_01b3347d-1b8 (triage: upstream-data-gap; the answering agent's retrieval was exhaustive and correct)
  - live verification 2026-07-06: get_doc_page_sections full-content read, Algolia term probes, full read of the agentic-payments skill, lumenloop title/summary probes — all zero AP2/ACP content
  - Solo project 49, todo 846
  - upstream issue filed 2026-07-07: https://github.com/stellar/stellar-docs/issues/2565
  - scope narrowed 2026-07-27 accepting maintainer triage https://github.com/stellar/stellar-docs/issues/2565#issuecomment-5035735424: nothing on main is factually wrong about the landscape gap, so positioning stays an optional DevRel scope call; the maintainer volunteered the one concrete correctable, the stale x402 Coinbase attribution
  - 2026-07-10 GT-12 primary plus blind review corrected the comparison taxonomy: x402 and MPP are general/external protocols with Stellar implementations; MPP includes charge as well as session/channel; AP2 x402 composition is optional; ACP is a beta commerce layer
  - independent Docs-team audit 2026-07-14 confirmed the AP2/ACP gap and found the adjacent x402 attribution stale after formation of the x402 Foundation under the Linux Foundation: https://gist.githubusercontent.com/ElliotFriend/3b3641b929b4408a834b85bcb4e75449/raw/a90e6b453ee3505ef2525b4428eaa75752e3ae08/raven-audit-rebuttal.md
  - scope-narrowing reply posted and read back 2026-07-27: https://github.com/stellar/stellar-docs/issues/2565#issuecomment-5091973988
  - "2026-11-20 live check: both agentic-payments overview and x402 page still credit Coinbase Developer Platform; open triage-bot PR https://github.com/stellar/stellar-docs/pull/3142 (Update x402 attribution to the x402 Foundation) is unmerged."
recurrences:
  - date: 2026-11-20
    evidence: "GET agentic-payments.md and x402.md still attribute x402 to Coinbase Developer Platform and omit AP2/ACP; PR https://github.com/stellar/stellar-docs/pull/3142 remains open."
  - date: 2026-11-09
    evidence: "Both agentic-payments overview and x402 page still attribute the protocol to Coinbase Developer Platform. AP2/ACP positioning remains absent on those pages and optional by the accepted maintainer scope decision."
  - date: 2026-11-06
    evidence: "Overview and x402 page still attribute protocol to Coinbase Developer Platform. AP2/ACP comparison search remains ungrounded; comparative positioning was accepted as optional. Exact URLs and upstream state: .agents/rounds/2026-11-05-truth-maintenance/docs.md, row sd-005"
  - date: 2026-11-02
    evidence: live re-check on the Mintlify docs search after the 2026-10-22 migration: `stellarDocs.search_docs` `AP2 Agent Payments Protocol ACP Agentic Commerce Protocol` with includeContent returns /docs/build/agentic-payments and its MPP pages; no returned section names AP2, ACP, or Agentic Commerce. The gap is content, not the search backend. Ledger: .agents/rounds/2026-11-02-mintlify-migration.md
  - date: 2026-08-11
    evidence: live agentic-payments page recheck — AP2 and ACP remain absent, while the page still says x402 is from Coinbase Developer Platform. Issue #2565 remains open; the latest maintainer activity is ElliotFriend's 2026-07-21 enhancement-scope triage, followed by Raven's 2026-07-27 narrowing reply.
  - date: 2026-07-09
    evidence: durable reviewed row `eval/qa/reviewed/2026-07-09-improvements-evidence.md` case `q-defi-agentic-payment-standards-compare` was partial with no wrong claims and one missing fact — it still could not ground AP2/ACP as general coordination standards from the catalog. The controlled Algolia harness now uses token-boundary matching for AP2, Agentic Commerce Protocol, and ACP; generic x402/MPP meetings and the negative mutation `SNAP2 upgrade notes` both miss.
  - date: 2026-07-11
    evidence: P4 H2/N2 review again found that the surfaced material needs an explicit anti-conflation statement: x402 has no SEP number, SEP-41 is the token interface used by Stellar payment flows, and MPP Session is channel-backed rather than a separate settlement rail. solo://proj/49/scratchpad/super-corpus-rebuild--585
  - date: 2026-07-14
    evidence: public search still found no AP2/ACP positioning; retained locally because the open issue showed no maintainer action and did not warrant a follow-up comment
---

## Finding

The docs' agentic-payments coverage credits x402 to Coinbase Developer Platform instead of the x402 Foundation under the Linux Foundation, and contains no positioning against the wider agent-payments landscape (Google's AP2, the Agentic Commerce Protocol).

Per maintainer triage on #2565 (2026-07-21), comparative positioning against fast-moving third-party protocols is an optional DevRel scope call carrying its own drift risk. The plain factual defect is the stale x402 attribution on the overview and x402 pages.

## Evidence

- `GET https://developers.stellar.org/docs/build/agentic-payments.md` and `GET https://developers.stellar.org/docs/build/agentic-payments/x402.md` still attribute x402 to Coinbase Developer Platform (confirmed 2026-11-09 and 2026-11-20; unmerged PR `stellar/stellar-docs#3142` proposes the attribution fix).
- Mintlify search (`stellarDocs.search_docs` for `AP2 Agent Payments Protocol ACP Agentic Commerce Protocol`, 2026-11-02) returns `/docs/build/agentic-payments` and its MPP pages with zero AP2 or ACP mentions; `skills.stellar-dev.agentic-payments` and Lumenloop content also have zero AP2/ACP mentions.

## Recommendation

**Primary (accepted, factual):** update the x402 ownership attribution to the x402 Foundation under the Linux Foundation.

**Optional (DevRel scope call, not a defect):** add a short "x402/MPP vs the broader agent-payments landscape" subsection on the agentic-payments overview page using a layered taxonomy:

- x402 and MPP are general/external payment protocols with Stellar schemes/methods using SEP-41 tokens (MPP includes both charge and session/channel modes);
- AP2 is an emerging mandate/authorization layer whose x402 composition is optional;
- ACP is a beta commerce/checkout interaction protocol, not a settlement rail.
