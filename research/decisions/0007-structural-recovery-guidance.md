# ADR-0007: Evidence-poor recovery guidance stays structural, advisory, and bounded

- Status: accepted (2026-07-14). The structural, advisory, bounded principle remains active.
- Scope clarification: the [catalog reference](../../src/catalog/README.md) defines the implemented advice conditions and ordering.
  These include unresolved one-token queries on gated pages and canonical anchors for proper-name identity questions.
- Driver: production Playground rays `a1b328e51c12dec9` and `a1b32a611df3dec9`
- Review: Fable 5 first review and delta review, Grok 4.5 adversarial review, GPT-5.6-Sol
  implementation-shape audit
- Plan: `solo://proj/49/scratchpad/low-evidence-retriev--641`

## Context

The deployed Playground handled “Who is Justin Rice?” and then “do deeper research” with A/V,
Scout research/projects, and Docs, but never called the exposed free
`lumenloop.search_content_semantic` operation. A direct semantic call returned exact-name,
dated source rows. The deployed recovery contract only recommended wider operations after an
explicit caller-reported miss or a narrow-only execute. Any successful broad operation suppressed
execute recovery guidance, even when the model still considered its answer incomplete.

This under-retrieval problem is separate from attribution failures after broad data is already
present. More calls cannot substitute for exact identity or canonical slug, source, and date
checks.

## Decision

1. Search may return at most three advisory `widerCandidates` outside ranked `hits` when an
   operation-search page has zero hits or only backfill hits.
   - On an all-backfill page, broad operations already present in the page are recommended first,
     in page order, based on their own `retrievalProfile.lane`.
   - Missing slots are filled from deterministic manifest-derived broad-lane anchors.
   - Zero-hit pages use only those anchors.
   - The implementation must not scrape `recoverWith` edges from incidental backfill hits. That
     design was rejected because it surfaced unrelated repo/project operations and skipped the
     useful broad operations already visible on the page.
   - Candidates remain exposed, free/read-only operations; skill-only searches suppress them and
     an explicit service filter constrains them.
2. Execute keeps the existing narrow-only recovery path. A successful profiled broad operation
   may additionally produce `EvidenceRecoveryHint.mode = "conditional-alternatives"`, derived
   only from called operation IDs and manifest recovery edges.
   - Every attempted operation is excluded regardless of outcome in both modes. Narrow-mode graph
     sources are limited to the successful operation-scoped lookups named by the hint; successful
     inconclusive-scope operations do not silently contribute unnamed edges.
   - The hint is capped at three exact exposed operations and rendered by the existing standalone
     evidence-checkpoint formatter, independent of whether the operation belongs to the
     candidate-evidence allowlist.
   - Copy is conditional: the host observes operation classes, not payload relevance. It says to
     consider one bounded alternative pass only if the open-world question remains unanswered,
     and to stop for exact evidence or a named-source closed-world answer.
3. Playground consumes at most one hint-driven recovery cycle per turn when the first standalone
   checkpoint is emitted. A later execute clears any pending next-step restatement while the latch
   stays consumed, so newer hints remain suppressed without mislabeling an older hint as the latest
   execute. The latch does not suppress independent structural failure recovery such as all-error/
   soft-empty, truncation, or no-host-evidence paths.
4. No payload-derived ledger expansion ships in this change. In particular, there is no
   similarity threshold, token scan, or host `weak | grounded` verdict. A future adapter-owned
   observation contract requires separate evidence and review.

## Invariants and measurement

- Ranked hit membership, order, scores, tiers, totals, truncation, pagination, and the frozen
  `searchCatalog(...).hits` contract do not change.
- MCP, in-sandbox `codemode.search`, and Playground project the same candidate IDs; demo clipping
  cannot remove IDs or output-shape metadata.
- Broad execute advice is graph-only, never auto-executes, never repeats an attempted operation,
  and cannot create more than one host-prompted Playground recovery cycle.
- Existing explicit caller `recovery` remains a separate field. Playground projection of that
  pre-existing field is a named non-goal of this change.
- Before/after comparisons across the clean `ac21d24` baseline and current code use operation-ledger
  adoption facts only. Footer/prose and verdict deltas across the reverted observation-context
  boundary are diagnostic.
- Mixed gated/backfill pages do not receive search `widerCandidates` in this change. The exact
  “Who is Tyler van der Hoeven?” Playground-shaped control is all-backfill at the demo page size
  and therefore receives M1 advice; movement for genuinely mixed Tyler variants is attributable
  to execute guidance instead.
- Long technical all-backfill queries, grounded stablecoin discovery, closed-world lookup,
  exact-slug/fuzzy-bleed, Strupey ambiguity, and the non-person YieldBlox incident are explicit
  controls.

## Consequences

Tool descriptions, schemas, architecture, plan text, and all three search projections change
together. The base server instructions remain unchanged because they are under a measured
truncation budget. Paid evaluation remains blocked until deterministic gates pass and the
canonical Solo dev process is available through its owner or an explicit user exception.

## Amendment — 2026-07-14

Todo 1014 subsequently closed the advertised Playground top-level search projection mismatch for
the pre-existing explicit caller `recoverFrom` / `reason` / `recovery` contract. The original
non-goal above remains the historical scope boundary of this accepted decision. Playground now
mirrors MCP precedence after its demo-only call-budget refusal, validates exposed operation ids by
exact match, computes recovery only after the ranked page and only for non-empty `recoverFrom`, and
returns `recovery: []` on refusal and validation-error shapes. Demo compaction affects only recovery
description/signature text; identity, graph, lane, reason, and output-shape metadata remain intact.
This amendment adds no fuzzy resolution, ranking change, recovery edge, payload interpretation, or
automatic execution.
