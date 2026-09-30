## Verdict

**reject** — The selector still accepts skills without `SKILL.md`, and the admission procedure runs coverage gates before activation.

Reviewed `git diff f65e165d..a6db8c1a` at HEAD `a6db8c1a915e874b5787818c1220dfb67b883779`.

## Notes

1. **Finding 1: resolved.** `ecosystem-skills/README.md:188–194` distinguishes reference procedures from sandbox permissions.
   It records accepted credential and supply-chain risks and describes the actual exposure scrub.

2. **Finding 2: partly resolved.** `ecosystem-skills/README.md:72–78` and `:204–207` now require explicit exclusions.
   The checker still skips sources with empty exclusion maps at `scripts/check-skills-drift.mjs:115`.
   `.agents/TODO.md:64–72` records the remaining code and test work.
   I accept this bounded deferral because both current cherry-picked sources have nonempty exclusion maps.

3. **Finding 3: partly resolved.** `ecosystem-skills/README.md:196–223` adds proposal-first activation, per-skill QA coverage, fingerprints, and reviewer independence.
   However, step 5 still requires `--enforce-floors` before step 6 activates the new cases.
   The proposed cases do not satisfy active battery coverage.
   See `eval/qa/lint-corpus.mjs:627–630`.
   Move activation and corpus regeneration before the final acceptance gates.
   The reconciliation incorrectly marks the complete finding fixed.

4. **Finding 4: partly resolved.** The selector rejects truncated trees, missing picks, empty selections, and root skills without `SKILL.md`.
   The mirror checker now rejects empty sources.
   However, directory mode validates `SKILL.md` only for explicit picks.
   `scripts/lib/skill-source-selection.mjs:52–56` performs no such check when `picks` is empty.
   This read-only reproduction succeeds:

   ```js
   selectGitHubSkillFiles({
     tree: [{
       type: "blob", path: "skills/broken/notes.md",
       size: 1, sha: "a".repeat(40)
     }]
   }, { sourcePath: "skills" })
   // [{ skill: "broken", relpath: "notes.md", ... }]
   ```

   SDF and Lumenloop use this all-directory mode.
   The script can still replace accepted pins before the catalog rejects the invalid skill.
   The mirror checker also accepts a current skill after removing its `SKILL.md` file row.
   My in-memory check returned `[]` failures.
   Validate every inferred selected skill, rather than explicit picks only.
   Add an unpicked-directory test and a mirror-check test for missing `SKILL.md`.
   The seven current selector tests omit this failure.
   For malformed `source.skills: {}`, the new mirror guard records a failure and then throws during iteration.
   Normalize invalid arrays or stop checking that source after recording the malformed-manifest result.
   This exception predates the diff, but the new guard does not resolve it.
   I accept queued index staging because the README at `:84–87` now describes the actual replacement behavior.
   Also narrow the remaining “fails closed at every step” statement at `:104`.

5. **Finding 5: not resolved.** `scripts/check-pin-review.mjs:46–57` remains unchanged.
   `.agents/TODO.md:83–92` queues the source-location guard.
   I accept the bounded provenance deferral, but disagree with its migration rationale.
   Changing the projection does not automatically require five new attestations.
   The running checker applies its current projection to both the base and current manifests.
   See `scripts/check-pin-review.mjs:63–65`, `:86`, and `:114–120`.
   My in-memory expanded projection changed five digest values but detected zero moved sources.
   **New documentation problem:** TODO lines `88–92` incorrectly require fresh entries for every source.
   Correct that requirement; require new attestations when canonical source selections actually change.

6. **Finding 6: resolved.** The finding now includes `README.md:76`, the HTTP results, and source-specific install locations.
   `improvements/skills/sk-027-scout-skill-stale-skills-catalog.md:35–69` also removes the incorrect location count.
   A fresh `gh api` read confirmed [the correction comment](https://github.com/Stellar-Light/stellar-scout/issues/14#issuecomment-5919085549).
   It explicitly includes the dead `soroban` URL and the revised recommendation.

7. **Finding 7: resolved.** The diff corrects all four locations.
   These are `inventory/README.md:7`, `ecosystem-skills/update.sh:36`, the observability section count, and the eval collection template.

The inactive index branches and SCF body review remain explicitly queued.
I accept those dispositions.
Fresh production catalog counts and exact skill reads remain unverified by this reviewer.
The release receipt attributes the successful connector checks to the orchestrator, which preserves that distinction.

The golden diff changes provenance only; parsed comparison confirmed unchanged judge-facing fields.
Fresh reads of the pinned Quickstart README, proxy configuration, and startup script confirmed local `/lab` and the custom-network default.
The rejection of the stale-`master` Quickstart claim is correct.
The register check reports `up to date`.

Verification commands:

- `node node_modules/vitest/vitest.mjs run test/skill-source-selection.test.mjs --no-cache`: `7 passed`.
- Real upstream tree selections: all five sources match their manifest paths, hashes, and sizes.
  File counts: Lumenloop `15`, OpenZeppelin `3`, SDF `22`, Scout `4`, Trustless Work `22`.
- `node scripts/check-mirrors.mjs`: `mirror checks ok`.
- `node scripts/check-pin-review.mjs --base f65e165d`: no selection moved.
- `node eval/qa/register-helper.mjs --check`: `up to date`.
- `node scripts/improvements-lint.mjs`: `improvements lint ok (65 findings)`.

I found no new runtime regression in the changed selector code.
The missing all-directory validation remains an original finding, despite the reconciliation's complete-fix claim.
Correct that validation, the admission-step order, and the new digest-migration statement before acceptance.
