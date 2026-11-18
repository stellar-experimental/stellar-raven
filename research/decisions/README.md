# Architecture decision records

Each file here records one decision. A record keeps the text it had when the decision was made, so
a later change adds a record or a status line and rewrites no earlier text. The living document in
the last column applies the decision today; read it for current behavior.

| ADR | Title | Status | Applied in |
|---|---|---|---|
| [0001](./0001-search-tool-shape.md) | Top-level `search` is a host-side ranked query; code-shaped search retires to `execute`'s sandbox | Accepted | [PLAN.md](../../PLAN.md), [ARCHITECTURE.md](../../ARCHITECTURE.md) |
| [0002](./0002-skills-retirement-twin-dedup.md) | Retire the Lumenloop API-onboarding skills and de-dup the `lumenloop.skill.*` metadata twins | Accepted; the mechanism is superseded by 0003 and the retirements stand | `scripts/build-catalog.mjs`, `src/catalog/types.ts` (code comments only) |
| [0003](./0003-build-time-exposure-filtering.md) | Build-time exposure filtering: the manifest is the exposed surface | Accepted | [AGENTS.md](../../AGENTS.md#hard-rules), [ARCHITECTURE.md](../../ARCHITECTURE.md) section 8, [PLAN.md](../../PLAN.md) |
| [0004](./0004-correlation-id-continuity.md) | Drop model-facing correlation ids | Accepted | [ARCHITECTURE.md](../../ARCHITECTURE.md) section 9 |
| [0005](./0005-skills-form-sections-out-of-search.md) | Skill sections leave search (exposed, `searchable: false`) | Accepted; shipped | [src/skills/README.md](../../src/skills/README.md), [ecosystem-skills/README.md](../../ecosystem-skills/README.md), [PLAN.md](../../PLAN.md) |
| 0006 | Withdrawn: Solo process ownership | Deleted in #195; no file | None |
| [0007](./0007-structural-recovery-guidance.md) | Evidence-poor recovery guidance stays structural, advisory, and bounded | Accepted | [src/catalog/README.md](../../src/catalog/README.md), [PLAN.md](../../PLAN.md) |
| [0008](./0008-human-review-eval-and-playground-policy.md) | Human-review follow-up separates truth, measurement, recovery, and Playground scope | Accepted; golden lifecycle implemented; partial-cap scope amended | [eval/qa/README.md](../../eval/qa/README.md), the `golden-truth` skill |
| [0009](./0009-discovery-stays-lexical.md) | Local catalog discovery stays lexical | Accepted | [ARCHITECTURE.md](../../ARCHITECTURE.md) section 2, [eval/discovery/README.md](../../eval/discovery/README.md) |
| [0010](./0010-scf-community-fund-skills-stay-unpinned.md) | The SCF community-fund skills stay unpinned | Accepted | [ecosystem-skills/README.md](../../ecosystem-skills/README.md) |
| [0011](./0011-tool-surface-stays-code-mode-trimmed.md) | The tool surface stays `search` + `execute`, trimmed for cost | Accepted | [PLAN.md](../../PLAN.md), [the work queue](../../.agents/TODO.md) |

The statuses repeat each record's own status line; the record wins if they differ.
