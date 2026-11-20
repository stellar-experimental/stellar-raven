# Codex Sol Review Challenge — Item 8.13 Lane `codetools` (PR 1/2: `scripts/**` + `.github/workflows/*.yml`)

- Reviewer: Codex CLI (`gpt-6.2-sol`, `model_reasoning_effort="high"`, read-only)
- Source review: `.agents/rounds/2026-11-16-next-phase/items/8.13/codetools/SOL-REVIEW.md`
- Scope reviewed: `git diff origin/main...HEAD` on branch `np/8.13-codetools` (PR #526)

## Verdict Summary

| Class | Count |
|---|---|
| Valid (confirmed and fixed) | 12 |
| Invalid | 0 |
| Valid but not worth fixing | 0 |

Every finding was checked directly against the cited implementation lines. All 12 identified genuine comment-precision inaccuracies or dropped "why" details; each was fixed in place with a one-line comment clarification without touching code or YAML behavior.

## Finding-by-Finding Verification

1. **Medium — `refresh.yml` / `scripts/check-mirrors.mjs` (exit 1 semantics)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** In `scripts/check-mirrors.mjs`, `checkEcosystemSkills()` records manifest shape failures and `readSkillFile()` throws on blob hash mismatches; both reach `process.exit(1)` unless `transportOnly` is true (exit 2). `refresh.yml` said exit 1 "proves a missing pin", which overstated the case. Updated both comments to state pin, manifest, or hash mismatch.

2. **Medium — `scripts/scan-secrets.mjs` (`--tree` and binary files)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Confirmed at `treeLines()` (`if (buf.includes(0)) continue; // binary`): Layer A checks all `git ls-files` paths, while Layer B scans only `treeLines()` (text files). Updated header and `IGNORE_GLOBS` comment accordingly (this inaccuracy predated the edit and was caught on accuracy review).

3. **Medium — `scripts/refresh-inventory.mjs` (secret output guard scope)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Confirmed at `SECRET_ENV_NAMES` / `SECRET_VALUES`: the guard checks `.env` values and `process.env` values for `SECRET_ENV_NAMES` (`LUMENLOOP_API_KEY`, `MINTLIFY_ASSISTANT_API_KEY`) with `length >= 6`, not arbitrary environment variables. Narrowed the header comment to state the exact scope.

4. **Medium — `scripts/exposure.mjs` ("never surface anywhere" vs ADR-0003 boundary)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** `exposure.mjs` controls Raven-emitted surfaces (`catalog/manifest.json`, `specs/super-spec.json`, descriptions, scrubbed skills), not runtime upstream payloads such as `scout.getStatus` (which `scripts/description-notes.mjs` explicitly leaves intact). Changed wording to "never emitted on Raven surfaces".

5. **Medium — `scripts/build-super-spec.mjs` (why unreachable components are pruned)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** `pruneUnreachableComponents` exists not just for size reduction, but because upstream `components` copied wholesale can describe excluded operations (ADR-0003). Added "so schemas for excluded operations cannot leak into the spec".

6. **Medium — `scripts/eval-partner-docs.mjs` (why Phase 1 recall does not prove generalization)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Confirmed in `eval-partner-docs.mjs` that fact groups match literal strings from candidate pages regardless of `caseType`. Restored the concise warning that Phase 1 recall does not prove generalization (Phase 3 measures that).

7. **Low — `.github/workflows/refresh.yml` (who fails on drift; what counts as drift)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** `scripts/sync-drift-issues.mjs sync` exits 0 after reconciling issues; the workflow's `fail on drift` step exits 1. Also, `detect drift` flags any inventory or derived file diff, not only op-id sets. Clarified both in the workflow header.

8. **Low — `.github/workflows/refresh.yml` (when `.env` is deleted)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Confirmed `.env` is removed by `rm -f .env` inside the `detect drift` step (after `refresh-inventory.mjs`, `builders`, and `check skills-mirror drift`). Updated comment from "removed before later steps" to "removed in detect-drift".

9. **Low — `.github/workflows/refresh.yml` (`check-skills-drift.mjs` does not read `LUMENLOOP_API_KEY`)**
   - **Verdict:** Valid — fixed.
   - **Evidence:** Confirmed in `scripts/check-skills-drift.mjs`: it checks only public GitHub/catalog sources and optionally reads `GITHUB_TOKEN`/`GH_TOKEN`; it never reads `LUMENLOOP_API_KEY` (pre-existing stale comment carried over). Updated to state keyless + `GITHUB_TOKEN`.

10. **Low — `scripts/diff-pins.mjs` (cold-cache write to `ecosystem-skills/.cache/`)**
    - **Verdict:** Valid — fixed.
    - **Evidence:** Confirmed `diff-pins.mjs` calls `readSkillFile` -> `readSkillFileWithDigest`, which writes fetched bytes into gitignored `ecosystem-skills/.cache/`. Updated header from "writes nothing to the repo" to "writes no tracked files — cold fetches still populate gitignored ecosystem-skills/.cache/".

11. **Low — `scripts/classify-canary.mjs` (5-minute future clock-skew tolerance)**
    - **Verdict:** Valid — fixed.
    - **Evidence:** Confirmed at `if (age < -5 * 60 * 1000) return "error";`: verdicts up to 5 minutes in the future are tolerated. Updated header summary from "future-dated" to ">5m future-dated".

12. **Low — `scripts/description-notes.mjs` (`scrubScoutDescription` vs `SCOUT_DESCRIPTION_SCRUBS`)**
    - **Verdict:** Valid — fixed.
    - **Evidence:** Confirmed `scrubScoutDescription` applies both authored needles (`SCOUT_DESCRIPTION_SCRUBS`) and general exposure-derived clause dropping (`dropNonExposedScoutClauses`). Updated comment to name `scrubScoutDescription`.
