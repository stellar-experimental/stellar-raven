# Item 8.12 (`drift`) — Challenge of Codex Sol Review

- **Reviewer:** Codex CLI (`OpenAI Codex v0.169.0`), resolved model `gpt-6.2-sol`, `model_reasoning_effort="high"`, sandbox `read-only` (subscription)
- **Review file:** [SOL-REVIEW.md](./SOL-REVIEW.md)
- **Reviewed commit:** `45eed120` (`git diff origin/main...HEAD`)

## Summary of Verdicts

| Class | Count | Findings |
| --- | ---: | --- |
| **valid** | 1 | F1 (commit/PR exposure wording; `INDEX.md:166` sub-claim is pre-existing boilerplate outside lane scope) |
| **invalid** | 0 | — |
| **valid but not worth fixing** | 1 | F2 (pre-existing `check-skills-drift.mjs:344` remediation routing, outside lane scope) |

---

## F1 — Medium: Exposure review overlooks live Scout responses

- **Sol's claim:** `ecosystem-skills/INDEX.md:166` and the HEAD commit message call both entries repo-only and unserved and imply a pin is required before Raven can serve them, whereas `scout.listSkills` already lists both community entries and `scout.getSkill` already returns non-empty `data.skill.content` for each (`specs/super-spec.json:3072`, `src/adapters/scout.ts:245`).
- **Verdict:** **valid** (for the commit message / PR description; the `ecosystem-skills/INDEX.md:166` citation is pre-existing generator boilerplate outside this lane's scope).
- **Verification & evidence:**
  1. Read `specs/super-spec.json:3070-3121` (`scout.getSkill`) and `specs/super-spec.json:3802-3835` (`scout.listSkills`), plus `src/adapters/scout.ts:245`. Confirmed `scout.getSkill` returns upstream `skill.content` (raw `SKILL.md` text) verbatim through `okResult(body)` from `https://stellarlight.xyz/api/skills/{name}`.
  2. Probed live Scout endpoints directly:
     - `GET https://stellarlight.xyz/api/skills/relay-task-market` → HTTP `200`, `skill.content` length `4141` chars (`name: relay-task-market`).
     - `GET https://stellarlight.xyz/api/skills/nirium-agentic-payments` → HTTP `200`, `skill.content` length `6332` chars (`name: nirium-agentic-payments`).
  3. Confirmed `git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc catalog/ specs/ ecosystem-skills/MANIFEST.json eval/gates.json` is empty — this snapshot commit changes zero Worker bytes and zero served text. The live Scout responses changed upstream independently of this repo's snapshot files.
  4. Checked `ecosystem-skills/INDEX.md:166` (`"These links support discovery. Each skill needs a separate pin and exposure review before Raven can serve it."`). Verified via `rg --hidden -g '!.git'` that this line is pre-existing untouched context emitted by `scripts/lib/stellar-community.mjs:156` (mirroring `ecosystem-skills/README.md:126-127` for the curated `ecosystem-skills/` pin surface). Modifying `scripts/lib/stellar-community.mjs` is outside this lane's file scope (`8.12-COMMON.md`: "Touch only your lane's files").
- **Action taken:** Updated PR #510's description (`gh pr edit 510`) and documented the exact two-surface exposure distinction in [REPORT.md](./REPORT.md) and the follow-up commit message: neither entry is pinned, searchable, listed, or served via Raven's curated `skills.*` path (`search`, `codemode.skill.list`, `codemode.skill.read`), while both are already listed via live `scout.listSkills` and returned with full `SKILL.md` bodies via live `scout.getSkill` independently of this commit. Commit `45eed120` was not amended/force-pushed because `8.12-COMMON.md` prohibits force-pushing.

---

## F2 — Low (pre-existing): Drift checker gives wrong remediation for Scout directory-only drift

- **Sol's claim:** `scripts/check-skills-drift.mjs:344` classifies `stellarlight-catalog` drift under "Source remediation" (`ecosystem-skills/update.sh`), whereas the documented community-only commands refresh only `ecosystem-skills/community.json` and `ecosystem-skills/INDEX.md` (`ecosystem-skills/README.md:115`, `ecosystem-skills/update.sh:178`). Sol notes this commit correctly refreshed both snapshots without following that advice.
- **Verdict:** **valid but not worth fixing** (in this lane).
- **Verification & evidence:**
  1. Read `scripts/check-skills-drift.mjs:344-356`: `drifted.some((entry) => entry.id !== "stellar-community-catalog")` triggers the `Source remediation: run ecosystem-skills/update.sh` message whenever `stellarlight-catalog` drifts, even if all 5 GitHub skill pins are `ok`.
  2. Running `ecosystem-skills/update.sh` would rewrite `ecosystem-skills/MANIFEST.json`'s `synced_at` timestamp, cascading into `catalog/manifest.json` (`scripts/build-catalog.mjs:963,1390`), `specs/super-spec.json` (`scripts/build-super-spec.mjs:882`), and `eval/gates.json` for zero actual pin changes.
  3. Conversely, running only `node scripts/lib/stellar-community.mjs ecosystem-skills/community.json` + `node ecosystem-skills/build-index.mjs` leaves `ecosystem-skills/catalog.json` drifted and `check-skills-drift.mjs` exiting `1`.
- **Why not fixed here:** Pre-existing tooling gap outside this lane's scope (`8.12-COMMON.md`: "Touch only your lane's files"; `8.12-LANES.md`: absorb only community-catalog drift). Captured as an open follow-up item in [REPORT.md](./REPORT.md).
