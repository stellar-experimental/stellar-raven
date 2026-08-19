---
id: sk-019
service: skills
status: reported-upstream
discovered: 2026-08-19
upstreamTitle: Separate read-only Scout guidance from feedback submission instructions
evidence:
  - Stellar-Light/stellar-scout commit 2eebd982dc31c20198f59b40e29c83dcf71f688b SKILL.md lists POST /api/feedback
  - the same commit references/api-reference.md documents POST /api/feedback and GET /api/feedback as agent workflows
  - the prior Raven pin at 0d169e4ab64ddcc87ef61cc8e1737151fd39a05e also advertises both feedback operations
  - Raven excludes the feedback write because it is side-effecting and excludes its schema-only read because the write is unavailable
  - Raven removes complete Markdown blocks for all excluded Scout paths through one manifest-derived build-time and runtime filter
  - upstream issue filed 2026-08-19: https://github.com/Stellar-Light/stellar-scout/issues/13
---

## Finding

The current Scout skill mixes read-only discovery workflows with feedback
submission. `SKILL.md` lists `POST /api/feedback`. The API reference documents
both that write and its `GET /api/feedback` schema helper.

Consumers can expose the read-only Scout catalog without exposing feedback
submission. For those consumers, the new skill body points to an unavailable
write. The schema helper then leads only to that unavailable write.

The new pin expands a pre-existing exposure debt. Raven does not expose
side-effecting model operations without host approval and request controls.

## Evidence

The 2026-08-19 review read commit
`2eebd982dc31c20198f59b40e29c83dcf71f688b` directly. The main skill lists
the feedback write. `references/api-reference.md` contains the submission
workflow and the schema helper.

The prior Raven pin at `0d169e4ab64ddcc87ef61cc8e1737151fd39a05e`
also lists the write. Its API reference encourages submission and mentions the
schema helper. The new pin adds a separate schema-helper section.

Raven adopted the current pin with a general exposure filter. The filter uses
the same excluded operation records as the manifest. It removes complete
Markdown blocks and fails closed when a reference has an unsafe prose shape.

## Recommendation

Keep the default Scout skill read-only. Move feedback submission into a
separate opt-in skill or companion file with clear side-effect metadata.

Publish a read-only selection that omits both feedback operations. This lets
consumers use the other current workflows without filtering upstream prose.
