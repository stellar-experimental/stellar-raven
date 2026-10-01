# Scripts ownership and generated artifacts

Top-level scripts provide operator commands, CI checks, and shared build policy.
`exposure.mjs`, `description-notes.mjs`, and `emitted-text-guard.mjs` are imported policy modules.
`improvements-lib.mjs` provides shared finding maintenance functions.
Files under `scripts/lib/` are shared helpers. Files under `scripts/catalog-data/` are builder data.
`scripts/git-hooks/` contains the installed hook.
Keep a command when a package command, CI check, maintenance workflow, or generated artifact uses it.
Delete a command only after checking package commands, workflows, documentation, and imports.

`npm run mcp:surface` uses `run-mcp-surface.mjs` to build and run the local report.
Each invocation uses its own temporary directory. The launcher removes that directory after completion.
The launcher forwards arguments, including `--json`, to the report.

## Generated-output entrypoints

| Command | Output | CI sync guard |
|---|---|---|
| `node scripts/build-catalog.mjs` | `catalog/manifest.json` | yes |
| `npm run micro-map:build` | `src/mcp/micro-map.ts` | yes |
| `npm run spec:build` | `specs/super-spec.json` | yes |
| `npm run site:globes` | `src/demo/globe.ts`, `src/consent-globe.ts` | yes |
| `npm run site:fonts` | `src/fonts.ts` | operator generated; fetches unpinned Google Fonts CSS and font bytes; not CI-gated |
| `npm run site:og` | `src/og.ts` | operator generated; downloads unpinned GitHub fonts; requires ImageMagick; not CI-gated |
| `node eval/corpus/raven-next/research/golden/_meta/compile.mjs` | `eval/corpus/raven-next/research/golden/compiled/golden.json` | yes |
| `node eval/compile-routing.mjs` | `eval/routing-cases.json` | yes |
| `node eval/qa/compile-qa.mjs` | `eval/qa/cases.json`, `eval/qa/sample.json`, `eval/qa/lifecycle-registry.json` | yes |
| `node eval/plan/build-op-classes.mjs` | `eval/plan/op-classes.json` | yes |
| `node ecosystem-skills/build-index.mjs` | `ecosystem-skills/INDEX.md` from the pin manifest, directory catalog, and groups | yes |
| `npm run improvements:index` | `improvements/INDEX.md` | yes (`npm run improvements:lint`) |

`build-catalog.mjs` and `build-super-spec.mjs` read pinned skill bodies through `scripts/lib/skill-mirror.mjs`.
The reader fetches each file from the upstream commit in `ecosystem-skills/MANIFEST.json`.
It verifies the recorded Git blob hash and caches the bytes under the ignored `ecosystem-skills/.cache/` folder.
A hash mismatch fails the build. The skill bodies are the builders' only uncommitted input.

The current catalog, spec, micro-map, globe, index, and evaluation generators use `writeFileAtomic` from `scripts/lib/shared.mjs`.
Atomic replacement prevents interrupted writes from leaving truncated tracked outputs.
The retained prior-art compiler writes directly. CI checks its output after compilation.
Generated modules are never edited by hand.
Operator image and font generators stay outside the CI byte-sync checks.

`improvements-file-issue.mjs` and `improvements-resolve.mjs` update the finding index through `writeIndex` from `improvements-lib.mjs`.
Their tracked writes also use atomic replacement.

## Typing convention

Scripts use `.mjs` because Node runs them directly.
A `.d.mts` declaration is required when TypeScript imports a JavaScript module that needs types.
Declarations exist for `build-catalog.mjs`, `exposure.mjs`, `emitted-text-guard.mjs`, and `lib/skill-mirror.mjs`.
Use runtime tests for command-only scripts. Add declarations at an actual TypeScript import boundary.
