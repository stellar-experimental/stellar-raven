# ADR-0010: Repository recovery measurement contract v2

- Status: accepted (2026-08-30)
- Date: 2026-08-30

## Context

The v1 grader required blind review to match a frozen `empty` or `adjacent` label.
The product receipt mechanism accepts both outcomes.
The label changed across blind reviews for the same frozen operation.

## Decision

Use `repository-tooling-recovery-v2` for later collections.
A positive requires `empty` or `adjacent` reviewed evidence.
It also requires the frozen Docs operation, one later pinned repository call, a correct grounded answer, and no projection errors.
The threshold remains 10 of 12 positives and zero of eight premature detours.

## Consequences

The v1 result remains a v1 result.
The v2 identity uses new case-content digests.
No v1 artifact receives retroactive promotion.
The reviewer vocabulary remains `empty`, `adjacent`, `sufficient`, and `other`.
A `sufficient` result still fails a positive.
