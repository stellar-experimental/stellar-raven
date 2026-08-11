---
id: ll-017
service: lumenloop
status: reported-upstream
discovered: 2026-07-10
evidence:
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

Person-oriented semantic and A/V searches do not expose enough match provenance
to distinguish an exact named-person hit from topic similarity. An exact Tyler
van der Hoeven query returned ten unrelated passages, while broader semantic
search mixed true Tyler appearances with false positives. This is distinct from
ll-005's silent exact-entity person lane: the semantic lane returns data, but its
relationship to the named person is not answer-safe.

## Recommendation

Expose similarity score, matched text span, entity link, source publication/event
date, and an exact-lexical or exact-entity constraint. Also expose a compact
cross-collection candidate projection (collection name/count plus exact-token
rows) so callers do not have to guess among type-keyed `articles`, `research`,
`av`, and `events` collections before applying top-k limits. For a named-person query,
mark topic-only matches explicitly and do not rank them as attributed content
without an exact name/entity match.

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
