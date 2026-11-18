# Independent diff review — item 7.3 PR 3

**Verdict: PASS. No blocker, major, or minor findings.**

Reviewed `abd68c639fdbfb2f30c77244f626d7f2096e12a2...8ded7916158f30d53563bc86aa550cd89577f962` on 2026-11-18. Reviewer: Codex frontier, assigned `gpt-6-astra`, high effort; independent of the Sonnet author and Opus lead. Scope: the supplied diff-review brief, AGENTS.md, PLAN.md, REVIEW.md, EXEC.md and the final diff. No paid calls, model evals, installs into the worktree, dev server, commits, or pushes.

## Numbered findings

1. **Note — `package.json:91`, PR 3 `EXEC.md` / Environment.** Local execution uses Node 26 while the supported engine is Node 24. My two rebuilds corroborate the recorded output but do not replace the Node 24 workerd CI lane. **Action:** retain the existing CI-green merge gate; no source change requested. I did not independently rerun the full unit/smoke suites or assess CI status.
2. **Note — `.agents/TODO.md:1021`, PR 3 `EXEC.md` / npm audit.** Removing the migration task is consistent with the reviewed plan's explicit “no new advisory” interpretation, not a claim that `npm audit` exits zero. EXEC.md correctly preserves the existing picomatch advisory and nonzero audit status; the separate picomatch TODO remains. **Action:** none for this PR; keep that advisory tracked separately. My review did not repeat the paired audit.

## Evidence

### Lockfile and overrides

An independent structured comparison of the complete `packages` objects confirms 386 → 360 entries: 28 removed, 2 added, 35 changed package entries, plus the root metadata edit. This exactly matches EXEC.md. No other package entry changed.

- Removed: pool 0.23.0; Wrangler's nested esbuild 0.28.2 and its 26 platform packages.
- Added: plugin 1.8.4 and its nested, dev-only zod 4.6.6.
- Changed: Wrangler, Miniflare, workerd plus its five platform packages, root esbuild plus its 27 platform packages.
- Exactly one key ends in `node_modules/workerd`, at 1.20261117.1; exactly one esbuild installation remains. `npm ls workerd zod` corroborates the installed tree and expected nested zod.
- No overrides remain. The replacement plugin's exact Wrangler/Miniflare/esbuild pins match the root pins. The full lock comparison shows no additional resolution change attributable to removing the overrides. I did not replay installation.

Queried npm's version-specific registry metadata for all **37 added or changed package entries**. Every locked tarball URL and SHA-512 integrity value matches the registry; dependency, optional-dependency, peer-dependency and engine records match too. This verifies the lock against registry metadata; it is not a separate download-and-hash of all platform tarballs. Evidence: `tmp/pr3-diff-review/registry-check.json`; complete entry list: `tmp/pr3-diff-review/lock-diff.json`.

### Smoke isolation and package comparison

Packed `@cloudflare/vitest-pool-workers@0.23.0` with scripts disabled into `tmp/pr3-diff-review/`, extracted it, and compared its source-map sources and declarations with installed `@cloudflare/vitest-plugin@1.8.4`.

The smoke-config diff changes only the import and comments. `remoteBindings: false`, the three fake/test binding values, pinned-body handling, and the unexpected-fetch 503 handler are unchanged. The tsconfig type export and CI comment correctly name the replacement package.

Checked the actual plugin/Miniflare option path:

- Both old and new option schemas default `remoteBindings` to true; the repository's explicit false still short-circuits remote-proxy startup in the Wrangler-config branch (new source `pool/config.ts:772`).
- `mergeWorkerOptions(workerOptionsWithoutModuleRules, options.miniflare)` still makes explicit smoke bindings override config-loaded values. The new native-option conversion preserves the outbound callback as `dev.outboundService: { type: "fetcher", handler }`; runner setup does not replace that handler.
- Plugin `pool/index.ts:506–512` explicitly sets `enableDevRegistry: false`. This preserves the old converted-V4 behavior despite Miniflare's new native-V5 default of true. The plugin's Miniflare construction does not subsequently overwrite that setting.
- New Cloudflare-config handling is opt-in (`normalizeNewConfigOption` returns undefined for absent/false). Container preparation returns before Docker/image work when there is no container plan; this repo has no container configuration. I found no new enabled path that weakens this smoke lane's isolation.
- The existing cold-cache setup fetch for pinned skill files remains documented; the Worker outbound wall is not a claim that setup never accesses the network.

`test/usage-site-runtime.test.mjs:12` uses native V5 options, so its new top-level `enableDevRegistry: false` is correctly placed and necessary. Its local outbound handler and fake report token are unchanged.

The standing TODO note accurately captures the exact pins, expected nested zod, and single-copy workerd guard. The old pool package statically imports `getNodeCompat`, corroborating the recorded reason not to return to that override route; the historical maximum version remains the plan review's evidence, not a new runtime test here.

### Independent rebuilds

Ran the two requested commands bare as owned hc children, sequentially; both exited **0**. Children `t1xv` and `t1xw` were collected and removed. Hashes after rebuilding:

| File | SHA-256 |
|---|---|
| `dist/server.js` | `01822c7b7277fc85874b506a4b3f2ed430484ada40d89b7671cea24b39b476f0` |
| `dist/server.js.map` | `89499deb7d42f89d18b52d345f63f68fcccacd2fcafeb9eebac7e253b6002cb9` |
| `dist/usage/collector.js` | `d09b57299262038a100204313a6d4753807d05a5be829358a1c213468eeb41a7` |
| `dist/usage/collector.js.map` | `2fe1de7b62473968cd7e2503f831c171085caf77ed75197d517bf09b4680bff0` |

All full hashes in EXEC.md match; the server-map prefix matches. This independently reproduces the current bundles against EXEC.md's recorded baseline, rather than reconstructing the old installation. It supports the plan's no-deploy conclusion for these Worker/collector outputs.

`git diff --check origin/main...HEAD` passes. Final tracked worktree remains unchanged; the supplied untracked review brief remains untouched. Only the requested report, scratch evidence, and authorized generated build outputs were written. No case text or `.dev.vars` was opened.
