
- Reviewer: Grok 4.6 high. Vendor-diverse assumption attack.
- Date: 2026-08-30
- Mode: audit only. No repository file was edited.
- No paid eval, deploy, push, or merge ran.
- Scope: commit `d37d74905e464a8f17148151043d42b8d9dc0d2c` and the full branch `014a4e7..d37d749` (16 commits, 71 files, +7338/−224).
- Prior reports rechecked: `.agents/rounds/2026-08-30-repository-tooling-recovery/review-final-fable.md` (M3–M4, L8–L13) and `review-pass2-fable.md` (M-A, L-A through L-C).
- Rubric: `AGENTS.md`, `.agents/skills/audit-reviewability/SKILL.md`, and `references/audit-rubric.md`.
- Worktree: clean before and after this audit.

## Verdict

**PASS.** Commit `d37d749` repairs every requested Fable item. The collector freeze, join, budget, and CLI contracts hold. The branch still matches the receipt design. This pass found no blocking finding.

## Blocking findings

None.

## Recheck of preserved Fable findings

| Finding | Status at `d37d749` | Evidence |
| --- | --- | --- |
| **M3** Frozen digest pin is self-referential | **Fixed** | `eval/repo-recovery/contract.mjs:14-17` exports `FROZEN_CASE_CONTENT_DIGEST` and `FROZEN_ORDERED_IDS_DIGEST`. `lint.mjs:39-50` compares provenance and computed digests to those literals. `test/repo-recovery.test.mjs:99-104` changes a question, recomputes provenance, and still fails lint. Independent recompute of both digests matches the literals and `cases.json`. |
| **M4** Paid `collect` command undocumented | **Fixed** | `eval/repo-recovery/README.md:27-48` shows `npm run eval:repo-recovery:collect` with every required flag, the 1..40 call cap, and the fixed `$30.00` cap. |
| **L8** Readiness test only failed when code contained `response: await` | **Fixed** | `test/repo-recovery-collector.test.mjs:344-371` returns a serialization tool-error unconditionally and asserts `reason: "tool-error"`. The generated readiness code never returns a service envelope. |
| **L9** Join accepted any matching operation id | **Fixed** | `artifact.mjs:398-406` requires the first collected authority. `contract.mjs:202-220` repeats that check at grade time. `test/repo-recovery-artifact.test.mjs:189-199` throws `/first collected authority/` when sequence `2` is selected. |
| **L10** README omitted same-execute detours | **Fixed** | `eval/repo-recovery/README.md:188` now says a negative fails before Docs or a skill, or in the same execute. `negativePrematureDetour` still treats `executeCallIndex <= authorityCall.executeCallIndex` as a detour. |
| **L11** Test name claimed a raw-collection check | **Fixed** | `test/repo-recovery.test.mjs:135` is now "rejects an artifact without the reviewed schema and same-execute recovery". The case still proves the later-execute rule (`positivePasses === 11`). |
| **L12** Duplicated schema, digest, overlap, and CLI helpers | **Fixed** | Schema names, `sha256`, `EVIDENCE_OUTCOMES`, `REVIEW_EFFORTS`, and `sameClaimedActor` live in `contract.mjs`. `cli-args.mjs` is the single `argValue` / `requiredArg` helper. `collect.mjs` and `review-results.mjs` import it. |
| **L13** Budget assertion lived only in CLI `main()` | **Fixed** | `collect.mjs:373` calls `assertRecoveryBudget(maxBudgetUsd)` inside `collectRepositoryRecovery`. Tests default to `$30`. `test/repo-recovery-collector.test.mjs:599-608` rejects `0.1` before any artifact exists. |
| **M-A** Ledger said no paid agent measurement ran | **Fixed** | `.agents/rounds/2026-08-30-repository-tooling-recovery.md:128` now says "Paid collections are recorded below." |
| **L-A** Verification table said "Current repair worktree" | **Fixed** | The last row is `` `ca88ab9` `` (`…:1031`). |
| **L-B** Observability skill omitted receipt fields | **Fixed** | `.agents/skills/cloudflare-observability-review/SKILL.md:270-271` lists `outcome`, `source`, `target`, `reason`, and `errorName`. |
| **L-C** Build-script comment kept "(callable/readable)" | **Fixed** | `scripts/build-catalog.mjs:292-294` now says "emitted (exposed; a recovery-only entry also needs an ADR-0009 receipt)". |

## Focused surfaces

### Frozen digest enforcement

The freeze is no longer a same-file echo.

A case edit that also rewrites `contractProvenance` still fails unless `contract.mjs` changes. Lint, measure, collect, review, and grade all call `lintSuite` first. Independent hashes:

- content: `sha256(JSON.stringify(cases))=5dee41663f80bde85328e624a02f6fd8f21f2d39a93bac04ef028c1265195534`
- ordered IDs: `sha256(ids.join("\n"))=1883592ca7b52ac06cc40881efa49e4b84b2054875aee459be2245f71372115f`

Counts remain 20 total, 12 positive, eight negative. Ordered IDs match the ledger.

### Artifact join and first-authority selection

Join rejects a later duplicate of `initialEvidence.id`. Grade integrity uses the same first-occurrence object, not a second match by id. `positiveRowPass` still grades the first occurrence through `ids.indexOf`. A bypassed join that overlays the second call fails both sequence and review integrity.

### Shared-definition refactor

`COLLECTION_ARTIFACT_SCHEMA` and `REVIEWED_ARTIFACT_SCHEMA` are aliases of the single schema strings. They are not a second format. `artifact.mjs` re-exports the schema names. Tests now import them from `contract.mjs`.

### CLI helper behavior

`cli-args.mjs` rejects a missing value, a following `--` token, and a repeated flag. `requiredArg` rejects an absent flag. Direct checks:

- missing optional flag returns `undefined`
- `--port 8788` returns `"8788"`
- duplicate `--port` throws `--port may appear only once`
- `--port` with no value throws `--port requires a value`
- `--port --model x` throws `--port requires a value`
- missing `--server-revision` throws `--server-revision is required`

`collect.mjs` `main()` and `review-results.mjs` both use this helper. `grade-results.mjs` still parses `--suite` by `indexOf`. A missing value there fails loud in `path.resolve`. That split is not a collector spend path.

### Budget enforcement

`assertRecoveryBudget` accepts only `30`. `parseMaxBudgetUsd("30.00")` and `parseMaxBudgetUsd("30")` both return `30`. The exported collector path now uses that check before overwrite, lint, or a paid call. Cap tests spend against `$30`, not a looser test cap.

### Readiness evidence

The zero-cost gate still runs before the first paid call. It accepts data and `soft-empty`. It rejects unavailable operations, provider errors, tool errors, protocol errors, and transport errors. The stored record keeps ids, `ok`, `errorKind`, and numeric `errorStatus`. The tool-error path is now a real assertion, not a dead `response: await` probe.

### Telemetry skill text

The field list now includes the receipt fields. Emitters remain:

- consumed: `outcome`, `source`, `target`
- denied: `outcome`, `reason`, `target`
- error: `outcome`, `source`, `target`, `errorName`

No emitter logs the receipt string, nonce, identity, request id, or expiry. Unit tests still assert the receipt string is absent.

### Ledger truth

The stop rule remains in "Fixed scope and stop rules". The 2026-08-30 deviation names the 0/12 sequence, 16/20 correct result, user approval, and unmet live gate. Product measurements no longer deny the paid runs.

### Generated artifacts and frozen corpus integrity

`catalog/manifest.json` sha256 `efd567d04ed0b00d27d0a664ab2d225d04362e657f1661ae7cfab330e89324d1` matches `eval/gates.json`. Routing, skills, and holdout input hashes also match. `scout.explainRepo` is the only `discoveryMode` entry and is `searchable: false`.

`git diff 014a4e7..HEAD` does not touch `eval/routing-cases.json`, `eval/holdout-cases.json`, `eval/skills-cases.json`, `eval/qa/corpus/**`, or `eval/corpus/**`. `eval/repo-recovery/cases.json` appears once, in `ffd5ba6`, and does not change after freeze. `d37d749` does not edit generated catalog, micro-map, or super-spec bytes.

### Full-branch receipt mechanism (spot check)

HMAC verification still runs before the version check (`src/policy/recovery-receipt.ts:171-172`). Consume still happens before `callService`. Same-execute recovery still denies with `missing`. One later consume still logs `outcome: "consumed"` without receipt content. Replay still logs `reason: "replayed"`. This matches ADR-0009 and the prior PASS reports.

## Residual notes (not blocking)

1. The README collect block copies the first-method surface and binary pins. A run at HEAD must replace `--expect-sha256` with the live surface. The collector refuses a mismatch before spend.
2. `implementationIdentity()` hashes collect, artifact, contract, grade, review, lint, and the executor normalizer. It does not list `cli-args.mjs`. A clean worktree plus `--server-revision` still bind that file.
3. The observability skill lists receipt fields but does not name `evt = "recovery_receipt"`. The lane README and ledger do name the event.
4. The verification table ends at `ca88ab9`. It does not yet describe `d37d749`.
5. The live ship gate is still unmet at HEAD. The receipt design still has zero live measurements. A third authorized collection is still required.

## Tests run (this audit, read-only)

| Command | Result |
| --- | --- |
| `npx vitest run` on repo-recovery, cost, artifact, collector, recovery-receipt, catalog, and executor-providers tests | 7 files, 161 tests, PASS |
| `npm run eval:repo-recovery:lint` | PASS — 12 positive, 8 negative, frozen `repository-tooling-recovery-v1` |
| `npm run eval:repo-recovery -- --gate` | PASS — 12/12 eligible, recovery-only, 0 ordinary leaks, 0 rank risks |
| Independent digest and manifest SHA-256 recompute | MATCH ledger and `eval/gates.json` |
| `git diff --check 014a4e7..HEAD` | clean |
| CLI helper direct checks | missing, duplicate, and valueless flags rejected |

No paid command ran. `npm run eval:routing -- --gate` was not re-run. Frozen routing inputs and the committed manifest hash did not change after `a92ccf4`.

## Conclusion

`d37d749` closes the collector freeze, join, helper, budget, ledger, skill, and comment gaps from the preserved Fable reports. The branch remains host-gated, one-use, and fail-closed. No blocking finding remains.

PASS
