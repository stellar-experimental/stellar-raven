---
id: ll-017
service: lumenloop
status: reported-upstream
discovered: 2026-07-10
evidence:
  - "2026-11-09 sweep at 2026-11-09T20:31:07.666940+00:00: partial. Tyler and negative-control Strupey both return _weak_match=true, _top_similarity (.231/.259), and an explicit generic-filler warning. Tyler includes exact-name AV1487 and article625 mixed with unrelated content. AV passage query still returns topic neighbors without row-level exact-person relation/span. Existing aggregate safety improvement remains deployed; it does not resolve the row-level request. Read-only exact requests and response hashes: research/audits/2026-11-09-improvements-sweep/lane-lumenloop.md; upstream issue state/comments freshly read; no maintainer comments or claimed fix."
  - "2026-11-06 scope/progress reconciliation: .agents/rounds/2026-11-06-remaining-sweep/other.md, row ll-017; replay arguments and response hashes in research/audits/2026-11-06-remaining-sweep/other-receipt.json."
  - exact Tyler van der Hoeven A/V passage query returned ten semantically related but person-unrelated results
  - semantic content search mixed relevant official Tyler material with unrelated low-similarity results
  - official Docs author and event pages provide exact-name controls
  - Solo scratchpad 575 GT-35 primary 3287 and blind 3289
  - 2026-07-13 production Justin Rice interaction recovered exact-name historical event rows only after broad semantic search
  - 2026-07-13 localhost Strupey probe returned voluminous semantic neighbors but zero exact-token rows across the broad families
  - 2026-07-13 production Ray a1aba0be2e5a3f19 stopped after narrow Justin Rice lookups; a paired 2026-07-14 semantic probe returned exact-name dated event rows
  - 2026-07-14 targeted main-MCP QA q-builder-justin-rice-history broadened on-plan across ten tool calls but still promoted adjacent rows into an unsupported byline and missed the exact-name role history
  - 2026-07-14 forward-normalized semantic rows fixed the playground's collection-projection miss and passed exact wording 3/3, but both GPT-5.4 playground and Sonnet main-MCP answers still inferred one unsupported adjacent detail
  - Solo scratchpad 611 evidence-poor retrieval review
  - https://github.com/lumenloop/lumenloop-backend/issues/36
recurrences:
  - date: 2026-11-14
    evidence: "2026-11-14T02:36Z POST https://api.lumenloop.com/v1/tools/search_content_semantic with query 'Tyler van der Hoeven' and with the negative control 'Strupey' (limit 10): both return _weak_match true (top similarity 0.231 and 0.259) and 30 rows. The control scores higher than the real name, and none of its 30 rows contains the token. Row keys are id, slug, title, summary, long_summary, similarity, dates, url, domain, channel and platform: no per-row exact-match flag, entity link or matched span. Still reproduces."
  - date: 2026-11-06
    evidence: "2026-11-06 partial: LL find_av_passages Tyler van der Hoeven; semantic Tyler and negative control Strupey — AV remains topic neighbors without exact-person provenance. Semantic Tyler mixes exact1487/625 with neighbors. Both Tyler and Strupey now carry _weak_match=true, _top_similarity and explicit generic-filler warning; no per-row exact relation/span. Evidence/owner state: .agents/rounds/2026-11-05-truth-maintenance/other.md, row ll-017."
  - date: 2026-07-13
    evidence: production rays a1a519aa3907e144 through a1a51b394acdc572 recovered exact-name Justin Rice history only after broad semantic search, while narrow operations were empty or adjacent
  - date: 2026-07-13
    evidence: localhost Strupey broad-family probe returned voluminous semantic neighbors but no exact-token result row, reproducing the missing match-provenance risk on a negative control
  - date: 2026-07-14
    evidence: forensic join for production Ray a1aba0be2e5a3f19 showed a narrow-only stop; the same-name semantic control produced exact-name dated rows that still require explicit identity/source/date validation
  - date: 2026-07-14
    evidence: eval/qa/results/2026-07-14T03-29-01-variantA.json covered every required broad/detail family yet q-builder-justin-rice-history scored wrong after fabricating an adjacent byline and omitting exact-name dated role evidence
  - date: 2026-07-14
    evidence: normalized {items,counts,meta} localhost probes recovered exact-name Justin Rice rows 3/3 at production reasoning-none; later scored playground and main-MCP answers consumed those rows but each added a different unsupported adjacent attribution
  - date: 2026-08-11
    evidence: "Live Tyler queries still mix exact and unrelated rows without exact-match relation or evidence span; issue #36 remains open."
---

## Finding

Person-oriented semantic and A/V searches still lack per-result provenance
that distinguishes exact named-person matches from topic similarity. Historical
Tyler van der Hoeven queries returned unrelated passages and mixed exact-person
hits with neighbors; this differs from ll-005's silent exact-entity lane.

On 2026-11-06, semantic Tyler and negative-control Strupey responses both include
`_weak_match=true`, `_top_similarity`, and an explicit generic-filler warning.
That is deployed safety progress. Tyler includes exact-name records 1487/625
alongside neighbors, while A/V remains topic-oriented. Neither aggregate warning
nor similarity establishes an individual row's identity relation or matched span.

## Recommendation

Preserve the deployed weak-match warning and returned similarity/date signals.
Add per-row matched text spans, entity links, and exact-lexical/exact-entity
constraints or flags. Mark topic-only matches explicitly so a caller cannot
mistake them for attributed content. A compact cross-collection count and
exact-token projection can help callers inspect the candidate set before top-k
limits; it must not manufacture identity relations from semantic similarity.

## Recurrence — 2026-07-13

Production rays `a1a519aa3907e144` through `a1a51b394acdc572` showed both sides of
the provenance gap. Narrow directory/project/docs calls for Justin Rice returned
empty or adjacent `ok` data; the later `search_content_semantic` call recovered
exact-name, dated 2020–2021 Stellar event records. A negative-control localhost
probe for `Strupey` also returned large semantic result sets, but compact
exact-token projections found no row containing the requested term in LumenLoop,
Scout research/projects/builders, or Stellar Docs.

The gateway now labels semantic rows as candidates and exposes bounded recovery
operations separately from ranked search hits, but it still cannot manufacture
the missing upstream match provenance. This finding remains the upstream owner
for exact lexical/entity flags, matched spans, similarity, and source/date fields.

The targeted QA run `eval/qa/results/2026-07-13T18-59-22-variantA.json`
confirmed the residual risk. The Strupey open-world case correctly rejected
semantic neighbors and asked for clarification, but the Tyler case found real
exact-name material and then made an unsupported claim that no further articles,
research, or SEP/CAP credits existed. The gateway added a host-observed
candidate-evidence reminder keyed only to broad operation IDs; upstream exact
match/provenance fields would make this constraint data-native instead of prose-
dependent.

The bounded post-fix probe
`eval/qa/results/2026-07-13T19-09-10-variantA.json` improved that Tyler answer to
a source-cited exact-name roster and removed the universal negative. It still
omitted an observation date for mutable role and directory-count claims, so the
gateway reminder now distinguishes source publication dates from the as-of date
needed for current facts. This remains a prose mitigation; structured upstream
match provenance is still the durable fix.

The 2026-07-14 adapter-normalization round separated two failure modes. Flattening
all semantic collections into one similarity-ranked `items` list eliminated the
gateway's collection-guessing loss: the exact reported playground wording passed
three independent GPT-5.4 reasoning-none runs, and Grok 4.5 passed through the same
tool contract. That host-owned shape does not and should not label identity matches.
In the scored follow-up, GPT-5.4 invented a Q2-2021 quarterly-review attribution and
Sonnet inferred a 2025 Roadmap byline from adjacent cross-links. Structured matched
spans and entity links remain necessary even after the transport shape is consumable.

## Current verification — 2026-11-06

AV remains topic neighbors without exact-person provenance. Semantic Tyler mixes exact1487/625 with neighbors. Both Tyler and Strupey now carry _weak_match=true, _top_similarity and explicit generic-filler warning; no per-row exact relation/span.

Record partial safety progress; retain per-result identity provenance request.
Next check: After entity-provenance change, rerun exact Tyler and negative Strupey across AV/content; verify row-level match flags.
