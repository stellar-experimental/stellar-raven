# Item 8.12 `checker` — Report

- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/515
- **Branch:** `np/8.12-checker`
- **TODO item closed:** None (follow-up to lane `drift` #510 / `items/8.12/drift/CHALLENGE.md` F2 and `REPORT.md` Open Questions; Refs #223)

## What changed

1. **Shared Stellar Light directory projection (`scripts/lib/stellarlight-catalog.mjs`):**
   - Extracted `fetch_catalog`'s projection, canonical diff, and atomic snapshot writer into a single module shared by `ecosystem-skills/update.sh`, `scripts/check-skills-drift.mjs`, and `scripts/refresh-skill-directories.mjs`.
   - Fails closed on non-array `skills` or `meta.registry.live === false` (upstream `skills.stellar.org` fallback missing community entries, caught by Sol F1 and confirmed in `inventory/stellar-light.json:19534`).
   - Uses whole-second UTC ISO default `fetched_at` matching `update.sh` (Sol F4).
2. **Single documented directory-only refresh path (`scripts/refresh-skill-directories.mjs`):**
   - Refreshes `ecosystem-skills/catalog.json`, `ecosystem-skills/community.json`, and `ecosystem-skills/INDEX.md` without touching `MANIFEST.json`, `catalog/manifest.json`, `specs/super-spec.json`, `eval/gates.json`, or `PIN-REVIEW.md`.
   - Idempotent: preserves existing `fetched_at` and writes zero bytes on a clean tree; stages inputs and validates `build-index.mjs` before atomically updating changed targets with rollback.
3. **Accurate drift-checker remediation routing (`scripts/check-skills-drift.mjs`):**
   - Routes both `stellarlight-catalog` and `stellar-community-catalog` to `Directory remediation` (`node scripts/refresh-skill-directories.mjs`), and prints `Source remediation` (`ecosystem-skills/update.sh`) only when a pinned GitHub source drifts.
4. **Accurate two-surface community disclaimer (`scripts/lib/stellar-community.mjs`, regenerated `ecosystem-skills/INDEX.md`, `ecosystem-skills/README.md`):**
   - Clarifies that curated `skills.*` entries require a separate pin and exposure review, while Scout's live pass-through (`scout.listSkills`, `scout.getSkill`) already lists and returns upstream community `SKILL.md` bodies published in Stellar Light.
   - Updated `ecosystem-skills/build-index.mjs:128` header comment (Sol F5) so generated `INDEX.md` names all three regeneration commands (`./update.sh`, `node scripts/refresh-skill-directories.mjs`, `node ecosystem-skills/build-index.mjs`) and regenerated `ecosystem-skills/INDEX.md`.
5. **Docs, workflow, and tests:**
   - Updated `ecosystem-skills/update.sh` (`fetch_catalog` delegates to `scripts/lib/stellarlight-catalog.mjs`; removed unused `curl` check), `ecosystem-skills/README.md`, `.agents/skills/live-drift-resolution/SKILL.md` (timeless), `scripts/README.md`, and `.github/workflows/refresh.yml`.
   - Updated `test/check-skills-drift-cli.test.mjs` (covers `stellarlight-catalog`-only drift routing, combined directory-only drift routing, and fail-closed exit `2` on `meta.registry.live === false`) and `test/stellar-community.test.mjs` (preserves concrete-ID guard while allowing family placeholder `` `skills.*` ``).

## Worker bytes and model-facing impact

- **Worker bytes changed:** No (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty).
- **Model-facing:** No. No deploy required.

## Live proofs

1. **Clean-tree idempotency:** `node scripts/refresh-skill-directories.mjs` on the clean tree printed `unchanged` for `catalog.json`, `community.json`, and `INDEX.md`, with identical SHA-256 hashes before and after (0 bytes changed).
2. **Live drift checker:** `node scripts/check-skills-drift.mjs` exited `0` (all 7 sources `ok`).
3. **Byte-identical `catalog.json`:** Running `ecosystem-skills/update.sh`'s `fetch_catalog`, `scripts/refresh-skill-directories.mjs`, and comparing against committed `ecosystem-skills/catalog.json` at the same timestamp produced byte-identical files (SHA-256 `1b7d70bc1c27592dffa0235f3cd45cc5eab040ccc688c89fe9480df3ac717910`). Default-timestamp invocation of `scripts/refresh-skill-directories.mjs` produced whole-second UTC ISO (`2026-11-19T22:28:08Z`), matching `update.sh`.

## Gates (all run bare after final edits)

| Command | Exit code | Result |
| --- | ---: | --- |
| `npm run typecheck` | `0` | Clean |
| `npm test` | `0` | 173 passed \| 5 skipped (178 files); 4156 passed \| 3 expected fail \| 5 skipped (4164 tests) |
| `npm run build` | `0` | Dry-run bundle succeeded (6922.73 KiB / gzip 1376.10 KiB) |
| `npm run secrets:scan -- --tree` | `0` | Clean across all tracked files |
| `node scripts/check-pin-review.mjs --base origin/main` | `0` | No skill pin or file selection moved |
| `node scripts/check-mirrors.mjs` | `0` | `mirror checks ok` |
| `npm run eval:routing -- --gate` | `0` | `GATE PASS` (unchanged baseline) |
| `node ecosystem-skills/build-index.mjs` | `0` | `INDEX.md` in sync (0 diff after regeneration) |
| `node scripts/check-skills-drift.mjs` | `0` | All 7 sources `ok` |
| `git diff --check` | `0` | Clean |

## Codex Sol review and challenge

- **Review file:** `.agents/rounds/2026-11-16-next-phase/items/8.12/checker/SOL-REVIEW.md`
- **Challenge file:** `.agents/rounds/2026-11-16-next-phase/items/8.12/checker/CHALLENGE.md`
- **Counts by class:**
  - **Valid (fixed):** 3 (`F1` `meta.registry.live === false` fail-closed guard + CLI test; `F4` whole-second `fetched_at` default matching `update.sh`; `F5` `build-index.mjs:128` header comment in `INDEX.md`)
  - **Valid, not worth fixing:** 2 (`F2` concurrent `update.sh` vs `refresh-skill-directories.mjs` race; `F3` explicit `--index ecosystem-skills/MANIFEST.json` CLI override)
  - **Invalid:** 0

## Model calls made

| CLI | Model ID | Purpose |
| --- | --- | --- |
| `codex` (subscription, read-only, `model_reasoning_effort="high"`) | `gpt-6.2-sol` (resolved via `node scripts/latest-model.mjs sol`) | Independent review of `git diff origin/main...HEAD` -> `SOL-REVIEW.md` |

No AI Gateway, Workers AI, or provider-API calls were made.

## Open questions

None.
