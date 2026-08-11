---
id: ll-014
service: lumenloop
status: reported-upstream
discovered: 2026-07-10
evidence:
  - live Soroswap project-content retrieval returned mixed valid and adjacent/false-positive rows across content types
  - repeated Soroswap semantic-similarity calls changed from an empty result to a ranked list during the same audit
  - Solo scratchpad 575 GT-18 primary process 3249 and independent blind process 3252
  - https://github.com/lumenloop/lumenloop-backend/issues/30 (filed 2026-07-13)
recurrences:
  - date: 2026-08-11
    evidence: "Live Soroswap content retrieval still includes adjacent rows without match class or evidence span; issue #30 remains open."
---

## Finding

Project-content and similarity retrieval do not expose enough match provenance
or confidence for a consumer to distinguish exact Soroswap coverage from
semantic adjacency. On 2026-07-10, the Soroswap content lane returned a mix of
valid articles/AV/events/research and false positives. The similarity lane also
changed from an earlier empty result to a ranked list in the final call.

The response is useful for discovery, but a model can easily turn it into an
exhaustive "everything about Soroswap" list or treat an empty response as proof
that no related project/content exists.

## Evidence

GT-18's primary and blind lanes independently queried the live Lumenloop
Soroswap surfaces and then checked returned rows against original source URLs,
operator docs, and repositories. Both lanes found that identity/funding/routing
facts from the project profile cannot substitute for the returned content set,
and that every content result needs title/date/source-level validation.

This differs from `ll-006`: that finding concerns recency ranking for recurring
article series. This finding concerns exact-project relevance, false-positive
confidence, and empty-result semantics across content types and similarity.

## Recommendation

Expose per-result match provenance and confidence:

- exact entity/project match versus semantic neighbor;
- matched entity IDs/aliases and the supporting text span;
- content type, original publication date, and canonical source URL;
- result-set generated/as-of time;
- explicit soft-empty/retrieval-warning metadata when no results are returned;
- deterministic ordering or a documented ranking score.

Add Soroswap regression fixtures with known exact and adjacent rows. Consumers
should be able to request exact-only coverage, and an empty semantic result must
not be indistinguishable from an exhaustive no-match conclusion.
