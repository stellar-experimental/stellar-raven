---
id: sd-005
service: stellar-docs
status: reported-upstream
discovered: 2026-07-06
evidence:
  - eval/qa/results/2026-07-06T18-48-22-variantA.json (q-defi-agentic-payment-standards-compare, partial — verdict stands)
  - verdict-review workflow wf_01b3347d-1b8 (triage: upstream-data-gap; the answering agent's retrieval was exhaustive and correct)
  - live verification 2026-07-06: get_doc_page_sections full-content read, Algolia term probes, full read of the agentic-payments skill, lumenloop title/summary probes — all zero AP2/ACP content
  - Solo project 49, todo 846
  - upstream issue filed 2026-07-07: https://github.com/stellar/stellar-docs/issues/2565
  - scope narrowed 2026-07-27 accepting maintainer triage https://github.com/stellar/stellar-docs/issues/2565#issuecomment-5035735424: nothing on main is factually wrong about the landscape gap, so positioning stays an optional DevRel scope call; the maintainer volunteered the one concrete correctable, the stale x402 Coinbase attribution
  - 2026-07-10 GT-12 primary plus blind review corrected the comparison taxonomy: x402 and MPP are general/external protocols with Stellar implementations; MPP includes charge as well as session/channel; AP2 x402 composition is optional; ACP is a beta commerce layer
  - independent Docs-team audit 2026-07-14 confirmed the AP2/ACP gap and found the adjacent x402 attribution stale after formation of the x402 Foundation under the Linux Foundation: https://gist.githubusercontent.com/ElliotFriend/3b3641b929b4408a834b85bcb4e75449/raw/a90e6b453ee3505ef2525b4428eaa75752e3ae08/raven-audit-rebuttal.md
recurrences:
  - date: 2026-08-11
    evidence: live agentic-payments page recheck — AP2 and ACP remain absent, while the page still says x402 is from Coinbase Developer Platform. Issue #2565 remains open; the latest maintainer activity is ElliotFriend's 2026-07-21 enhancement-scope triage, followed by Raven's 2026-07-27 narrowing reply.
  - date: 2026-07-09
    evidence: durable reviewed row `eval/qa/reviewed/2026-07-09-improvements-evidence.md` case `q-defi-agentic-payment-standards-compare` was partial with no wrong claims and one missing fact — it still could not ground AP2/ACP as general coordination standards from the catalog. The controlled Algolia harness now uses token-boundary matching for AP2, Agentic Commerce Protocol, and ACP; generic x402/MPP meetings and the negative mutation `SNAP2 upgrade notes` both miss.
  - date: 2026-07-11
    evidence: P4 H2/N2 review again found that the surfaced material needs an explicit anti-conflation statement: x402 has no SEP number, SEP-41 is the token interface used by Stellar payment flows, and MPP Session is channel-backed rather than a separate settlement rail. solo://proj/49/scratchpad/super-corpus-rebuild--585
  - date: 2026-07-14
    evidence: public search still found no AP2/ACP positioning; retained locally because the open issue showed no maintainer action and did not warrant a follow-up comment
  - scope-narrowing reply posted and read back 2026-07-27: https://github.com/stellar/stellar-docs/issues/2565#issuecomment-5091973988
---

## Finding

The docs' agentic-payments coverage documents x402 and MPP mechanics in depth
but contains **zero positioning against the wider agent-payments landscape**
(Google's AP2, the Agentic Commerce Protocol). "How do Stellar's x402/MPP
relate to AP2/ACP?" is the natural comparison question the docs invite by
covering the mechanics — and a corpus-grounded agent must punt on it, because
the answer exists nowhere in the corpus: not in the docs page, not in the
Algolia index, not in the bundled agentic-payments skill, and not in any
lumenloop title or summary. In the 2026-07-06 QA round the answering agent
did exhaustive, correct retrieval across all of those surfaces and could only
report "not indexed"; the golden's landscape keyFact (AP2/ACP are
general/coordination-layer standards, not Stellar settlement) was
unreachable from grounded sources, and the partial verdict stands as a
measurement of the corpus, not the agent.
**The actionable defect is narrower than the original framing.** The docs
maintainer's 2026-07-21 triage accepted the landscape gap as real but classed
comparative positioning against fast-moving third-party protocols as an
optional DevRel scope call carrying its own drift risk, and we accept that.
What remains a plain factual defect is the adjacent attribution: the x402 page
still credits Coinbase Developer Platform rather than the current x402
Foundation under the Linux Foundation.

## Evidence

All probes live on production, 2026-07-06, reproducible verbatim:

- `stellarDocs.get_doc_page_sections("/docs/build/agentic-payments",
  includeContent)` — 2,798 chars total, 0 matches for "AP2" / "Agentic
  Commerce" / "coordination".
- Algolia `search_docs("AP2 Agent Payments Protocol")` — 5 hits, all
  substring artifacts (Algolia bolds "AP" inside "APIs" on the x402/MPP
  pages); `"Agentic Commerce Protocol ACP"` — noise hits only (passkeys, SCP
  glossary).
- Full read of `skills.stellar-dev.agentic-payments` — 28,563 chars, 0
  matches for AP2 / ACP / "Agentic Commerce" / "Agent Payments Protocol" /
  Google / Visa.
- Lumenloop title/URL probes for "AP2" / "agentic commerce" / "agent payments
  protocol" across articles/research/av/events/proposals — 0 hits; the top
  semantic candidates (articles 5934, 3015, 7050, 2596) have 1.3–1.6k-char
  summaries with 0 mentions.

QA case q-defi-agentic-payment-standards-compare in the 2026-07-06 stamp;
review triage in workflow wf_01b3347d-1b8.

Recurrence 2026-07-09: targeted QA smoke
`eval/qa/reviewed/2026-07-09-improvements-evidence.md` preserves the reviewed
row from the 2026-07-09T19-53-07 round: it again left
`q-defi-agentic-payment-standards-compare` ungrounded for AP2/ACP. The verdict
was `partial`, with no wrong claims and one missing fact: AP2/ACP as general
coordination standards rather than Stellar-native settlement mechanisms. The
controlled Algolia harness now requires token-bounded AP2/ACP names in returned
text. Its former any-`/meetings/` target could incorrectly count a generic
x402/MPP meeting, while substring matching could count `SNAP2`; both controls
now miss. The matcher scans only URL, breadcrumb, and the query-conditioned
snippet, so a harness miss is not proof of absence without checking raw hits or
the full record.

## Recommendation

**Primary (accepted, factual):** correct the x402 ownership attribution to the
x402 Foundation under the Linux Foundation.

**Optional (DevRel scope call, not a defect):** a short "x402/MPP vs the
broader agent-payments landscape" subsection on the agentic-payments overview
page. If it is ever written, it should use a layered taxonomy rather than
calling x402/MPP "Stellar standards":

- x402 and MPP are general/external payment protocols with documented Stellar
  schemes/methods that use SEP-41 tokens;
- MPP includes one-time charge plus session/channel behavior, not streaming
  alone;
- AP2 is an emerging mandate/authorization layer whose x402 composition is
  optional, not a universal settlement route; and
- ACP is a beta commerce/checkout interaction protocol, not a settlement rail.

That compact subsection would convert an unanswerable comparison into an indexed
answer without implying that all four belong to one standards body or layer.
Secondary (lumenloop, noted here since the gap spans both corpora): no article
or research summary mentions AP2 or ACP — a current landscape explainer would
fill the same hole on the editorial side.
Consumer-side workaround: none from grounded retrieval; an agent can state
the general characterization from parametric knowledge without fabricating,
but corpus-faithful agents will keep punting until the docs say it.
