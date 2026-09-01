# Safe pre-resolution implementation — Sol

Date: 2026-09-01

## Outcome

The safe pre-resolution changes are complete.
The new `sd-048` finding remains proposed.
The `sd-001` monitor canary passes at rank 1.
The improvements index and base lint pass with 70 findings.

No issue, comment, resolver, or golden change occurred.
No existing lifecycle status changed.

## Files

- Created `improvements/stellar-docs/sd-048-cap-0075-poseidon2-sbox-degree-contradiction.md`.
- Added the `sd-048` route in `improvements/intake.json`.
- Rewrote the `sd-001` case in `scripts/eval-algolia-raven.mjs`.
- Updated the `sd-001` precedent text in `improvements/README.md`.
- Regenerated `improvements/INDEX.md` with `npm run improvements:index`.
- Updated `.agents/rounds/2026-09-01-free-improvements-maintenance.md`.
- Created this implementation report.

Concurrent changes existed before this implementation.
They affected `sd-047`, `sls-080`, and the generated index.
The index regeneration preserved their recurrence counts.
This implementation did not overwrite those finding changes.

## Reproducible evidence

The CAP source revision is `65e2b6262c0825494caf2a94116eb512c8335f22`.
`core/cap-0075.md:78` lists degrees 3, 5, 7, and 11.
`core/cap-0075.md:124` says that only degree 5 is supported.
`core/cap-0075.md:157` says that other degrees trap.

The ABI revision is `a7e15b439c4b49b17ba8f9e4527efee8d8119aba`.
`soroban-env-common/env.json:2725` documents only degree 5.
`soroban-env-host/src/crypto/poseidon/mod.rs:19` defines `SUPPORTED_SBOX_DEGREES = [5]`.
`poseidon2_params.rs` rejects unsupported degrees.

The finding includes read-only commands for every source check.
Its intake override targets `stellar/stellar-protocol`.

## Commands and results

| Command | Result |
|---|---|
| `gh api` source reads for CAP-0075 and `rs-soroban-env` | PASS after sandbox approval; source revisions and lines matched the reviewer evidence |
| `node scripts/eval-algolia-raven.mjs --self-test` | PASS; 9 controls |
| `npm run improvements:index` | PASS; wrote 70 findings |
| `npm run improvements:lint` | PASS; `improvements lint ok (70 findings)` |
| `npm run eval:algolia-raven` | PASS; the `sd-001` target ranked first with rules enabled and disabled |
| `npm test` | PASS; 99 files and 1,588 tests passed |
| `npm run build` | PASS; the Wrangler dry run completed |
| `npm run typecheck` | Initial failure because `env.d.ts` was absent |
| `npm run typegen && npm run typecheck` | PASS; Wrangler reported a non-fatal log-file permission warning |
| `git diff --check` | PASS |

The live canary used query `Protocol 24`.
The target was `/docs/networks/software-versions`.
Both primary docs strategies returned the target at rank 1.
The case reports drift but does not write to Algolia.

## Scope safeguards

- No issue was filed.
- No upstream comment was posted.
- No resolver ran.
- No golden file changed.
- No existing lifecycle status changed.
- `.agents/TODO.md` did not change.
- `.agents/NEXT.md` did not change.
- `improvements/resolved.json` did not change.

## Risks

- The canary uses one exact protocol query.
- It does not measure all software-version queries.
- `sd-048` can become stale if the upstream CAP changes.
- A later live check must use the pinned commands or record a new revision.
- `sd-001` remains active until an authorized resolver run completes.

## Blockers and gated actions

1. `sd-036` still needs the authorized golden reconciliation.
2. `sd-036` still needs a resolution comment on issue #1980.
3. `sk-020` still needs a resolution comment on issue #113.
4. `sls-080` remains deferred under the Grok review.
5. `sls-080` still needs lifecycle, evidence, queue, comment, and snapshot work.
6. `sd-048` needs an authorized filing review before any issue filing.
7. `.agents/TODO.md` and `.agents/NEXT.md` remain gated.
8. Every resolver remains gated.
9. The separate final-diff review remains pending.

The round ledger records the full reviewer outcomes and remaining gates.
