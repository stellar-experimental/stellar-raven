# Improvements evidence

These scripts repeat the five priority source and Raven index checks.
They load local credential values without logging them.
They do not write to the Docs index or any GitHub repository.

Run every command from the repository root.
Each script uses `process.cwd()` to find `.dev.vars`.
The scripts load credential values in memory and never log them.

```sh
./node_modules/.bin/esbuild .agents/rounds/2026-09-16-truth-maintenance/improvements-evidence/priority-source-index-recheck.ts --bundle --platform=node --format=esm --outfile=/tmp/priority-source-index-recheck.mjs
node /tmp/priority-source-index-recheck.mjs

./node_modules/.bin/esbuild .agents/rounds/2026-09-16-truth-maintenance/improvements-evidence/sd044-search-recheck.ts --bundle --platform=node --format=esm --outfile=/tmp/sd044-search-recheck.mjs
node /tmp/sd044-search-recheck.mjs

./node_modules/.bin/esbuild .agents/rounds/2026-09-16-truth-maintenance/improvements-evidence/priority-index-section-extract.ts --bundle --platform=node --format=esm --outfile=/tmp/priority-index-section-extract.mjs
node /tmp/priority-index-section-extract.mjs
```

The preserved result file contains only concise public markers.
It contains no environment values or private issue bodies.
