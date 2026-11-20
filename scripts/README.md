# Scripts ownership and generated artifacts

Top-level scripts provide operator commands, CI checks, and shared build policy.
`exposure.mjs`, `description-notes.mjs`, and `emitted-text-guard.mjs` are imported policy modules.
`improvements-lib.mjs` provides shared finding maintenance functions.
`latest-model.mjs <family>` prints the newest model ID of a Codex or Grok family from the CLI's offline catalog cache (Claude aliases pass through); launch lines use it ([`.agents/model-roster.md`](../.agents/model-roster.md)).
Files under `scripts/lib/` are shared helpers. Files under `scripts/catalog-data/` are builder data.
`scripts/git-hooks/` contains the installed hook.
`scripts/agent-hooks/` holds `PreToolUse` hooks wired by `.claude/settings.json`, `.codex/hooks.json`, `.grok/hooks/case-search-guard.json`, and `.agents/hooks.json`; `case-search-guard.mjs` denies searches that would read case text.
`sync-drift-issues.mjs` builds per-kind (`<class>:<source>`) drift reports for `refresh.yml` and reconciles one `drift`-labeled GitHub issue per key (open, comment only on report change, and close on clear, with `--dry-run` planning).
`find-uncited-golden-round-json.mjs` lists the JSON files in the two golden round folders that no case file, QA register or `improvements/` finding cites. It prints paths and counts and never opens a listed file. `npm test` fails while a file is uncited; `--uncited` prints the list to `git rm`.
Keep a command when a package command, CI check, maintenance workflow, or generated artifact uses it.
Delete a command only after checking package commands, workflows, documentation, and imports.

`npm run mcp:surface` bundles `report-mcp-surface.mjs` into a temporary directory (removed on exit) and runs it in the caller's working directory, forwarding arguments (including `--json`).

## Generated-output entrypoints

| Command | Output | CI sync guard |
|---|---|---|
| `node scripts/build-catalog.mjs` | `catalog/manifest.json` | yes |
| `npm run family-text:build` | `src/mcp/family-text.ts`, `src/policy/corroboration.ts` | yes |
| `npm run spec:build` | `specs/super-spec.json` | yes |
| `npm run site:globes` | `src/demo/globe.ts`, `src/consent-globe.ts` | yes |
| `npm run site:fonts` | `src/fonts.ts` | operator generated; fetches unpinned Google Fonts CSS and font bytes; not CI-gated |
| `npm run site:og` | `src/og.ts` | operator generated; downloads unpinned GitHub fonts; requires ImageMagick; not CI-gated |
| `npm run docs:anchors:build` | `src/adapters/stellar-docs-anchors.json` | daily live-drift check; reads public sitemap and rendered headings |
| `node eval/corpus/raven-next/research/golden/_meta/compile.mjs` | `eval/corpus/raven-next/research/golden/compiled/golden.json` | yes |
| `node eval/compile-routing.mjs` | `eval/routing-cases.json` | yes |
| `npm run eval:routing:overlap` | `eval/routing-qa-overlap.json` | yes (`npm test`) |
| `node eval/qa/compile-qa.mjs` | `eval/qa/cases.json`, `eval/qa/sample.json`, `eval/qa/tool-cases.json`, `eval/qa/lifecycle-registry.json` | yes |
| `node eval/plan/build-op-classes.mjs` | `eval/plan/op-classes.json` | yes |
| `node ecosystem-skills/build-index.mjs` | `ecosystem-skills/INDEX.md` from the pin manifest, directory catalog, and groups | yes (this regeneration only) |
| `node scripts/refresh-skill-directories.mjs` | `ecosystem-skills/catalog.json`, `community.json`, `INDEX.md` (directory snapshots only; leaves pins untouched) | no; CI never runs it, and `check-skills-drift.mjs` reports drift |
| `./ecosystem-skills/update.sh` | `ecosystem-skills/MANIFEST.json`, `catalog.json`, `community.json`, `INDEX.md` | no; CI never runs it, and `check-mirrors.mjs` and `check-pin-review.mjs` gate the result |
| `node scripts/refresh-inventory.mjs` | `inventory/*.json` | no; the daily `refresh.yml` reports drift |
| `npm run improvements:index` | `improvements/INDEX.md` | yes (`npm run improvements:lint`) |

`build-catalog.mjs` and `build-super-spec.mjs` read pinned skill bodies through `scripts/lib/skill-mirror.mjs`, fetching from the upstream commit in `ecosystem-skills/MANIFEST.json`, verifying the Git blob hash (mismatch fails the build), and caching under ignored `ecosystem-skills/.cache/`. Skill bodies are the builders' only uncommitted input.

All catalog, spec, family-text, globe, index, and evaluation generators use `writeFileAtomic` (`scripts/lib/shared.mjs`), and `improvements-file-issue.mjs` / `improvements-resolve.mjs` update the index atomically via `writeIndex` (`improvements-lib.mjs`). The retained prior-art compiler writes directly; CI checks its output. Never hand-edit generated files.

## Typing convention

Scripts use `.mjs` for direct Node execution. Add a `.d.mts` declaration only at an actual TypeScript import boundary (currently `build-catalog.mjs`, `build-family-text.mjs`, `exposure.mjs`, `emitted-text-guard.mjs`, and `lib/skill-mirror.mjs`); test command-only scripts at runtime.
