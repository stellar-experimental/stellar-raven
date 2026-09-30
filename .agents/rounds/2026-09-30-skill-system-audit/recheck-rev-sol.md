## Verdict

**reject** — The mirror checker still crashes on `skills: {}` when it runs with `--fetch`.

Reviewed `git diff a6db8c1a..406301af` at `406301afa321344d730b7d32183126f0f9039999`.

## Notes

- **Directory selection: resolved.** `scripts/lib/skill-source-selection.mjs:58–62` checks every selected directory for `SKILL.md`.
  My original `skills/broken/notes.md` reproduction now throws the expected error.
  The new test also covers the nested-directory case under `sourcePath: "."`.
  All five real upstream selections match the manifest paths, sizes, and hashes.

- **Missing `SKILL.md` manifest row: resolved.** `scripts/lib/skill-mirror.mjs:49–53` rejects a skill without its entry file.
  `test/pinned-source-shape.test.mjs:23` covers this failure.

- **Non-array `source.skills`: not resolved.** The offline checker now reports the malformed manifest and exits `1`.
  However, `scripts/check-mirrors.mjs:132` still calls `checkPinsResolve()` after it records shape failures.
  Line `107` then iterates `source.skills` without a guard.
  My in-memory execution of the actual checker produced these results for the same malformed manifest:

  ```text
  offline: exit 1; ecosystem-skills source "lumenloop" pins no skills
  --fetch: exit 2; check-mirrors: check could not complete — source.skills is not iterable
  ```

  I replaced manifest reads in memory and replaced file retrieval with a stub.
  I changed no repository files for this reproduction.
  The daily workflow uses `--fetch` at `.github/workflows/refresh.yml:66`.
  It classifies exit `2` as a checker error instead of a malformed pin set.
  Stop retrieval after shape failures, or skip invalid sources while preserving their recorded failures.
  Add a checker-level test that requires exit `1` in both modes.
  The helper tests alone do not exercise this control flow.

- **Admission gate order: resolved.** `ecosystem-skills/README.md:213–220` activates and compiles cases before the final coverage gates.

- **Failure boundary description: resolved.** `ecosystem-skills/README.md:104–107` limits the claim to steps before the swap.
  Lines `82–87` explain the separate moves and the later index rebuild.

- **Digest migration description: resolved.** `.agents/TODO.md:88–93` correctly explains the shared base/head projection.
  It no longer requires new attestations for all unchanged sources.

The original drift-mode and source-location digest problems remain **not resolved**, with accepted deferrals.
Their queue entries remain at `.agents/TODO.md:64–72` and `:83–93`.
Index staging and inactive index branches also remain deferred at `:74–81` and `:95–101`.
My earlier admission-bar, upstream-finding, and stale-description fixes remain **resolved**; this diff does not change them.

I found no new runtime defect introduced by this diff.
The fetch-mode crash is a remaining original problem.
The new verification table overstates its resolution at `.agents/rounds/2026-09-30-skill-system-audit.md:175`.
Update that statement when both checker modes handle the malformed manifest.

Checks: both test files passed (`12 passed`); the current manifest passed `node scripts/check-mirrors.mjs`.
`node scripts/check-pin-review.mjs --base a6db8c1a` reported no movement.
`node eval/qa/register-helper.mjs --check` reported `up to date`.
Parsed comparison confirmed that the golden case changes only `truth.verified`.
`git diff --check a6db8c1a..406301af` passed, and the working tree remained clean.
