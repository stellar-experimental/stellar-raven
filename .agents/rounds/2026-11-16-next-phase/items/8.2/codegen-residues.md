# Item 8.2: codegen residues (ids and finding ids only; no case text)

Source: `research/audits/2026-08-07-codegen-partner-report.md` (moved from
`ideas/codegen-correctness-substrate.md`). For the TODO (executor E3). Nothing here is filed yet.

## 1. Malformed-input guidance gap in a pinned skill

- Skill: `skills.stellar-dev.smart-contracts` (repo `stellar/stellar-dev-skill`, pinned commit
  recorded in the report). Section: the security reference, where the checklist of numbered
  vulnerability classes has no entry for malformed or short input (the nearest entry covers
  check-then-act races, a different thing).
- Kind of gap: missing content. Only generic input-validation advice exists; a length or bounds guard
  before decoding or slicing is absent.
- Route: a candidate `improvements/skills/` finding. It needs a recurrence probe against the current
  pinned commit first (use the `improvements-pipeline` skill), because the evidence is from 2026-08-07.

## 2. Golden gaps for a golden-maintenance lane

Case ids and the field each concerns. A lane that is allowed to open case text decides each.

| Case id | Field | Concern |
|---|---|---|
| `q-zk-nullifier-storage` | golden | closest case to the persistent-collection vs entry-cap gap; not a match |
| `q-soroban-wasm-size-limit` | avoid clauses | same gap; adjacent only |
| `q-sor-decode-hosterror-codes` | golden | closest case to the event-assertion reset gap; also adjacent to the auth-error-surface gap |
| `q-soroban-unit-testing` | notes | points at a case id that is not in the owned battery (stale cross-case pointer) |
| `q-sor-testing-negative-auth-events` | none in the owned battery | the pointer target exists only in the retired prior art; decide whether to author it or reroute the pointer |
| `q-sor-evm-to-soroban-porting` | golden | the only case entering from EVM vocabulary; a retrieval-vocabulary candidate |

Uncovered topics with no owning case: the entry-cap write failure for a growing persistent
collection; the per-call reset of test-side event reads; auth failure error remapping; `try_*`
client-method semantics.

## 3. No instrument measures long-horizon codegen with Raven installed

- Statement for the ideas index: "No instrument measures long-horizon codegen with Raven installed."
- Trigger the note gives: the partner's per-round bug report arrives, or the owner funds a
  with-Raven vs without-Raven codegen A/B graded against the partner's external defect taxonomy.
