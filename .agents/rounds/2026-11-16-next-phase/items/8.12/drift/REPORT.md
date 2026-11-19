# Item 8.12 (`drift`) — Community Catalog Drift on #223

- **Branch:** `np/8.12-drift`
- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/510
- **Issue:** Refs #223 (left open; no comment posted — orchestrator owns #223)
- **Drift class:** Directory snapshot data only (community-only drift; zero skill-pin, operation-surface, routing-text, or Worker-bundle changes)

## What Changed

Ran `node scripts/check-skills-drift.mjs --json` before editing. All 5 pinned GitHub skill sources (`lumenloop`, `openzeppelin-stellar`, `stellar-dev`, `stellar-light`, `trustless-work`) were `ok` (zero source/pin drift). Only the two directory snapshots had drifted, both on community entries:

1. **`ecosystem-skills/community.json`** (`stellar-community-catalog`, 51 → 52 entries) — regenerated via `node scripts/lib/stellar-community.mjs ecosystem-skills/community.json`:
   - Added: `RELAY Task Market` (`https://raw.githubusercontent.com/yssoft-gif/relay-agent-client/c4bae7df04dbe99b23b1b071b4ef0ad0a7b65584/SKILL.md`).
   - Moved: `Nirium Agentic Payments` URL from `https://raw.githubusercontent.com/nirium-protocol/nirium-sdk/main/skills/nirium-agentic-payments/SKILL.md` to `https://raw.githubusercontent.com/nirium-protocol/nirium/main/skills/nirium-agentic-payments/SKILL.md`.
2. **`ecosystem-skills/catalog.json`** (`stellarlight-catalog`, 83 → 84 entries; `counts.bySource.community` 40 → 41) — regenerated using the exact `fetch_catalog` projection from `ecosystem-skills/update.sh`:
   - Added: `community/relay-task-market` (`title: "RELAY Task Market"`, `source: "community"`, `kind: "skill-md"`, `repository: "https://github.com/yssoft-gif/relay-agent-client"`).
   - Updated: `community/nirium-agentic-payments` (`install`, `repository`, `homepage` updated from `nirium-protocol/nirium-sdk` to `nirium-protocol/nirium`).
3. **`ecosystem-skills/INDEX.md`** — regenerated via `node ecosystem-skills/build-index.mjs` (21 categorized pinned skills, 0 uncategorized; updated Ecosystem directory and Community directory tables).

`ecosystem-skills/MANIFEST.json` was intentionally left untouched because zero pinned skill sources moved; keeping its `synced_at` unchanged avoided gratuitous timestamp churn across `catalog/manifest.json`, `specs/super-spec.json`, and `eval/gates.json`.

### Exposure Review of Added/Updated Community Entries

| Surface | `RELAY Task Market` (`community/relay-task-market`) & `Nirium Agentic Payments` (`community/nirium-agentic-payments`) | Changed by this PR? |
| --- | --- | --- |
| Curated `skills.*` catalog (`search`, `codemode.skill.list`, `codemode.skill.read`) | **Not pinned, not indexed, not searchable, not served.** Neither `ecosystem-skills/community.json`, `catalog.json`, nor `INDEX.md` is read by `scripts/build-catalog.mjs`, `scripts/build-super-spec.mjs`, or `src/`. Existing admission rules (`ecosystem-skills/README.md`) apply; no exceptions added. | No |
| Live Scout pass-through (`scout.listSkills`, `scout.getSkill`) | **Already listed and served live from `stellarlight.xyz`.** `scout.listSkills` (`specs/super-spec.json:3802`) lists both entries and supports `q` filtering; `scout.getSkill` (`specs/super-spec.json:3070`, `src/adapters/scout.ts:245`) fetches `https://stellarlight.xyz/api/skills/{slug}` live and returns non-empty `data.skill.content` (`4141` chars for `relay-task-market`, `6332` chars for `nirium-agentic-payments`). | No (live upstream API, independent of repo snapshots) |

### Worker Bytes & Served Text

- **`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc`**: **empty** (0 files changed).
- **`git diff origin/main -- catalog/ specs/ ecosystem-skills/MANIFEST.json eval/gates.json`**: **empty** (0 files changed).
- **Model-facing / served text changed by this PR:** **No.** Diff of served text is empty; no production deploy is required for this PR.
- **Consumers search:** Bounded `rg --hidden -g '!.git'` over `eval/`, `improvements/`, `docs/`, `src/`, `test/`, `research/` found zero references to `nirium-sdk`, `nirium-agentic-payments`, `relay-task-market`, `relay-agent-client`, or the old snapshot counts outside `ecosystem-skills/`.

## Gates & Verification

Every command was run bare in `/home/tyler/code/raven-wt/np-8.12-drift`:

| Command | Exit | Result |
| --- | ---: | --- |
| `node scripts/check-skills-drift.mjs --json` (before) | `1` | 5 GitHub skill pins `ok`; `stellar-community-catalog` (51 → 52) and `stellarlight-catalog` (83 → 84) `DRIFT` |
| `npm run eval:routing -- --gate` (before, aggregate only) | `0` | `GATE PASS` — legacy 338 (64.8% / 86.7% / 96.4%), extended 122 (76.2% / 91.8% / 95.9%), skills 23 (73.9% / 100.0% / 100.0%), holdout 49 (24.5% / 53.1% / 61.2%, forbidden 11/49) |
| `node scripts/check-skills-drift.mjs` (after) | `0` | All 7 sources `ok` (`stellar-community-catalog` 52 entries, `stellarlight-catalog` 84 entries, all 5 pins `ok`) |
| `npm run eval:routing -- --gate` (after, aggregate only) | `0` | `GATE PASS` — identical aggregate scores across all lanes |
| `node scripts/check-mirrors.mjs --fetch` | `0` | `fetched + verified 67 pinned skill files (upstream, cache bypassed)` / `mirror checks ok` |
| `node scripts/check-pin-review.mjs --base origin/main` | `0` | `pin-review: no skill pin or file selection moved.` |
| `npm run typecheck` | `0` | Clean |
| `npm test` | `0` | 173 passed \| 5 skipped (178 files); 4153 passed \| 3 expected fail \| 5 skipped (4161 tests) |
| `npm run build` | `0` | Dry-run bundle clean (`6922.73 KiB / gzip: 1376.10 KiB`) |
| `npm run secrets:scan -- --tree` | `0` | `secret-scan: clean — scanned all tracked files.` |
| Generated-artifact sync (`build-catalog.mjs`, `family-text:build`, `spec:build`, `check-mirrors.mjs`, `build-index.mjs`) | `0` | Only `ecosystem-skills/{INDEX.md,catalog.json,community.json}` modified; all other generated files byte-identical |
| `git diff --check` | `0` | Clean |

## Independent Review & Challenge

- **Review:** [SOL-REVIEW.md](./SOL-REVIEW.md) — Codex Sol (`gpt-6.2-sol`, high effort, read-only)
- **Challenge:** [CHALLENGE.md](./CHALLENGE.md)
- **Verdict counts:** **1 valid**, **0 invalid**, **1 valid but not worth fixing**
  - **F1 (valid, medium):** Sol caught that our commit/PR exposure summary called both entries unconditionally "unserved", overlooking that `scout.listSkills` and `scout.getSkill` already list and return both live upstream `SKILL.md` bodies (`data.skill.content`) from `stellarlight.xyz` independently of this commit. Verified live (`4141` and `6332` chars) and fixed in PR #510's description and this report. Sol's secondary citation of `ecosystem-skills/INDEX.md:166` is pre-existing boilerplate from `scripts/lib/stellar-community.mjs:156`, untouched by this diff and outside lane scope.
  - **F2 (valid but not worth fixing, low, pre-existing):** `scripts/check-skills-drift.mjs:344` routes `stellarlight-catalog`-only drift to "Source remediation: run `ecosystem-skills/update.sh`" instead of a directory-only refresh. Verified, but pre-existing and outside this lane's scope.

## TODO Item Closed

None — `.agents/TODO.md` was not modified. Issue #223 stays open (it also tracks the held routing repair in `.agents/TODO.md` under "Preserve structured routing intent across extraction caps and gate tiers"), and no `.agents/TODO.md` entry is dedicated solely to this daily community-catalog drift.

## Model Calls Made

| CLI | Model ID | Effort / Mode | Billing | Purpose |
| --- | --- | --- | --- | --- |
| `codex` (`OpenAI Codex v0.169.0`) | `gpt-6.2-sol` | `high`, `-s read-only` | Subscription | Independent read-only review of `git diff origin/main...HEAD` ([SOL-REVIEW.md](./SOL-REVIEW.md)) |

No AI Gateway, Workers AI, or provider-API calls were made.

## Open Questions / Follow-ups

1. **Scout directory-only drift remediation (`scripts/check-skills-drift.mjs:344`, Sol F2):** Consider extracting `fetch_catalog` from `ecosystem-skills/update.sh` into a small standalone helper (parallel to `scripts/lib/stellar-community.mjs`) and updating `check-skills-drift.mjs:344` so `stellarlight-catalog`-only drift recommends refreshing `catalog.json` + `INDEX.md` instead of full `update.sh` (which bumps `MANIFEST.json` `synced_at` and cascades into `catalog/manifest.json`, `specs/super-spec.json`, and `eval/gates.json`).
2. **Community directory disclaimer wording (`scripts/lib/stellar-community.mjs:156` / `ecosystem-skills/INDEX.md:166`, Sol F1 sub-note):** Consider narrowing `"before Raven can serve it"` to `"before Raven can serve it as a curated skills.* entry"`, since `scout.getSkill` already passes through live `skills.stellar.org` community `SKILL.md` bodies.
3. **Orchestrator closeout:** Comment on #223 (keeping it open for the held routing repair). No Worker deploy is required when merging PR #510 because Worker bytes did not change.
