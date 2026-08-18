---
id: sk-018
service: skills
status: verified
discovered: 2026-08-18
upstreamTitle: The Scout skill API reference omits four live read-only composite endpoints
evidence:
  - 2026-08-18 live Scout OpenAPI 1.8.67 exposes GET /api/contracts as listContracts, GET /api/repos/trust as getRepoTrust, GET /api/scf-pitch as scfPitch, and GET /api/vet-idea as vetIdea
  - 2026-08-18 live reads of the pinned Stellar Scout api-reference.md at commit 0d169e4ab64ddcc87ef61cc8e1737151fd39a05e and upstream main returned 31038 bytes with no path or operationId match for any of the four operations
  - 2026-08-18 drift issue resolution, Solo scratchpad 814, repository impact reviewer 4649
---

## Finding

The live Scout API adds four read-only operations that the Scout skill reference
does not document:

- `GET /api/contracts` enumerates verified mainnet contracts with code, usage,
  audit, and project evidence;
- `GET /api/repos/trust` joins code truth, usage, audit drift, succession, and
  activity for one repository;
- `GET /api/vet-idea` joins competitors, maturity, prior art, supply gaps, and
  SCF funding for one build idea; and
- `GET /api/scf-pitch` joins live round state, funded peers, idea evidence, and
  deterministic pitch angles.

The API reference on upstream `main` matches Raven's pinned file. Neither file
contains any new path or operation ID.

This finding succeeds `sk-009`. That finding covered older missing fields and
filters, which upstream documented. This drift adds four new operations after
that fix. It does not reopen the old field-level defect.

Agents that follow the skill can still use lower-level project, repository,
hackathon, audit, and research calls. They cannot discover the four current
composites from the reference. They can therefore make more calls and miss the
new evidence boundaries.

## Evidence

The live OpenAPI and both skill-reference reads ran on 2026-08-18. The OpenAPI
reported version `1.8.67`. Raven's generated catalog exposes all four operations
after the ADR-0003 read-only exposure review.

The reference check used exact path and `operationId` matches. It did not infer
the omission from headings or summaries.

## Recommendation

Add one concise entry for each new operation to `references/api-reference.md`.
Document the required query fields, the top-level response blocks, and each
operation's evidence limit.

Keep these cautions explicit:

- contract and repository absence is not evidence of nonexistence;
- the idea gap is supply-side coverage, not a demand claim;
- SCF round state must not assert a negative when its source is unavailable;
  and
- audit and usage fields carry provenance, not a synthetic trust score.

Extend the existing schema-to-reference drift check. It must report new public
operation paths and `operationId` values before the reference falls behind a
later release.
