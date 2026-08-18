---
id: q-fixture-full-source-card
q: "How does the full source-card compiler contract work?"
category: fixture-category
subcategory: compiler-contract
axes: [tool-targeted, ecosystem-spectrum]
query_type: how-to
difficulty: medium
freshness_sensitive: true
freshness_horizon: weekly

expected_cards: [stellar_docs_mcp]
acceptable_cards:
  - scout_research
  - lumenloop_search_content_semantic
forbidden_cards: [parallel_search]
expected_service: stellar_docs
should_fire: true

must_have:
  - { claim: "Preserves the first required answer claim.", weight: 5 }
  - claim: Preserves the second required answer claim.
    weight: 4
should_have:
  - { claim: "Preserves the recommended answer claim.", weight: 3 }
nice_to_have:
  - { claim: "This optional source claim is outside the compiled answer-guidance contract.", weight: 1 }
must_avoid:
  - { claim: "Do NOT drop a required routing label.", weight: 5 }
must_cite:
  - "The primary compiler source."
must_not_use_tier: [deep-research]

pass_threshold: 0.8
weight_profile: standard
sources:
  - "https://example.com/primary"
  - "https://example.com/secondary"
status: reviewed
authored: { phase1: 2026-08-18, phase2: 2026-08-18, reviewed: 2026-08-18 }
confidence: high
notes: "A complete compiler fixture."
---

## Reference answer (gospel)

The compiler preserves the complete canonical answer.

It also preserves paragraph boundaries.

## Why these cards (routing rationale)

The routing labels exercise every compiled routing field.

## Edge / traps

The compiler must not read a second routing format.
