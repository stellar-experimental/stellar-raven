# Scripts ownership and generated artifacts

Top-level scripts are operator or CI entrypoints. Files under `scripts/lib/` are imported helpers;
`scripts/catalog-data/` is builder data; `scripts/git-hooks/` contains the installed hook. Keep an
entrypoint when it owns a distinct package command, CI gate, maintenance workflow, or generated
artifact. Delete one only after proving it has no package, workflow, documentation, or import caller.

## Generated-output entrypoints

| Command | Output | CI sync guard |
|---|---|---|
| `node scripts/build-catalog.mjs` | `catalog/manifest.json` | yes |
| `npm run micro-map:build` | `src/mcp/micro-map.ts` | yes |
| `npm run spec:build` | `specs/super-spec.json` | yes |
| `npm run site:globes` | `src/demo/globe.ts`, `src/consent-globe.ts` | yes |
| `npm run site:fonts` | `src/fonts.ts` | release/operator generated; source fonts are local-only |
| `npm run site:og` | `src/og.ts` | release/operator generated; requires ImageMagick and local fonts |
| `node eval/compile-routing.mjs` | `eval/routing-cases.json` | yes |
| `node eval/qa/compile-qa.mjs` | `eval/qa/cases.json` | yes |
| `node eval/plan/build-op-classes.mjs` | `eval/plan/op-classes.json` | yes |
| `node ecosystem-skills/build-index.mjs` | `ecosystem-skills/INDEX.md` from the pin manifest, directory catalog, and groups | yes |
| `npm run improvements:index` | `improvements/INDEX.md` | yes (`npm run improvements:lint`) |

`build-catalog.mjs` and `build-super-spec.mjs` additionally read skill bodies through
`scripts/lib/skill-mirror.mjs`, the one non-committed build input: it fetches each file pinned in
`ecosystem-skills/MANIFEST.json` from its upstream commit, verifies it against the recorded git
blob hash, and caches it under the gitignored `ecosystem-skills/.cache/`. A hash mismatch fails
the build rather than baking unreviewed upstream bytes into a generated artifact.

Every CI-gated generator in the table uses `writeFileAtomic` from `scripts/lib/shared.mjs` so an
interrupted process cannot leave a truncated tracked artifact. Generated modules are never edited by
hand. Release/operator-only image and font generators are outside that offline CI contract.

`improvements-file-issue.mjs` and `improvements-resolve.mjs` already mutate a finding, so they
regenerate `improvements/INDEX.md` in-process through `writeIndex` from `improvements-lib.mjs`
rather than re-spawning the entrypoint; their tracked writes use the same atomic replace.

## Typing convention

Scripts stay plain `.mjs` because they run directly under Node. A `.d.mts` sidecar exists only when
TypeScript source imports that JavaScript module and needs a declaration (`build-catalog.mjs`,
`exposure.mjs`, `emitted-text-guard.mjs`, and `lib/skill-mirror.mjs`); it is not a visual-uniformity requirement
for every script. Prefer runtime tests for CLI-only scripts and add a declaration only at an
actual TS import boundary.
