accept with fixes

1. **[P2] Correct the `undici` completion requirement.**

   Files: `research/audits/2026-09-17-dependency-audit/README.md:91` and `.agents/TODO.md:437`.
   Claim: Remediation requires a `miniflare` release that pins `undici` 7.30.0 or later.
   Evidence: All ten reported advisories exclude 7.29.1 from their affected ranges.
   The [upstream advisory](https://github.com/advisories/GHSA-3wwx-pv8p-q78v) also lists 7.29.1 as patched.
   Current registry metadata gives `miniflare@5.20260930.0-alpha` an exact `undici` 7.29.1 dependency.
   `wrangler@4.145.0` already selects that `miniflare` release.
   Thus, the new requirement rejects a release that fixes these advisories.
   The smoke pool remains blocked by its older exact dependencies.
   Fix: Require a version that clears the reported advisories, including 7.29.1.
   Distinguish the available root Wrangler update from the unresolved smoke-pool dependency.
   This review does not require expanding the two-package fix into a toolchain update.

   The requested 7.30.0 experiment also found a partial path without an override.
   In a temporary copy, `npm install undici@7.30.0 --save-exact` succeeded.
   The SDK then used 7.30.0; both `miniflare` copies retained separate 7.29.0 installations.
   The audit still reported eight high findings.
   This experiment does not establish a complete fix or justify an otherwise unused direct dependency.
   No complete 7.30.0 update exists while both installed `miniflare` dependency declarations remain unchanged.

2. **[P2] Update the current dependency count and record the recheck.**

   Files: `.agents/TODO.md:408-437` and `.agents/rounds/2026-09-30-raven-next/review-brief-b.md:14`.
   Claim: The brief says the dependency item records the recheck and the `undici` blocker.
   Evidence: The TODO change adds only a completion condition.
   Its heading and current status still report seven findings.
   The verified post-change audit reports eight high findings, including `undici`.
   Fix: Record the September 30 recheck, state eight remaining findings, and identify the additional `undici` dependency.
   Keep the September 17 evidence clearly historical.

3. **[P2] Provide the cited evidence record.**

   File: `research/audits/2026-09-17-dependency-audit/README.md:95`.
   Claim: `.agents/rounds/2026-09-30-raven-next.md` contains the evidence and checks.
   Evidence: Neither the reviewed commit nor the worktree contains that file.
   The older audit files describe September 17 and cannot substantiate this recheck.
   Fix: Commit the September 30 evidence record or cite an existing committed record.
   Include the compared revisions, audit output, dependency declarations, and check results.
   The independent results below confirm the audit counts, but they do not repair the missing reference.

4. **[P3] Apply the requested sentence rules to the added documentation.**

   Files: `.agents/TODO.md:437`, `research/audits/2026-09-17-dependency-audit/README.md:84-95`, and `.agents/rounds/2026-09-30-raven-next/review-brief-b.md:11-38`.
   Claim: The brief requires every edited sentence to follow the supplied writing rules.
   Evidence: The TODO completion sentence exceeds 20 words, combines three conditions, and uses the passive phrase “is installed.”
   README line 84 combines two audit comparisons; line 91 combines a cause and a completion condition.
   “Dedupes” uses jargon; “No `package.json` change” and “Evidence and gates” omit active verbs.
   The brief combines package changes at lines 11-12 and dependency declarations with an update outcome at lines 21-22.
   Its sentences at lines 21-22 and 35-37 exceed 20 words.
   Lines 25-28 combine separate review instructions; lines 34-35 combine an instruction with a filesystem claim.
   Fix: Use separate active sentences with at most 20 words each.
   Preserve exact commands, versions, paths, and identifiers.
   Also remove README line 96: `git diff --check origin/main...HEAD` reports a new blank line at EOF.

The review compared `6dd9439461a286f5ca5f87722fb60f238c610d3d` with `edbf78233f850becbce67375ef21cbb4fbd39d1c`.
Node was v24.13.0; npm was 11.11.0.
I ran installation, build, and test commands in temporary copies to preserve repository files.
The test copy used the reviewed commit and its Git history.
I generated `env.d.ts` with the CI placeholder variable names; `npm run typegen` exited 0.

| Required command | Independent result |
| --- | --- |
| `npm ci`, baseline | Exit 0; 320 packages installed |
| `npm ci`, reviewed branch | Exit 0; 320 packages installed |
| `npm audit --json`, baseline | Exit 1; 10 findings: 8 high, 2 moderate |
| `npm audit --json`, reviewed branch | Exit 1; 8 findings: 8 high, 0 moderate |
| `npm update undici`, isolated branch copy | Exit 0; no lockfile change; 8 high findings remain |
| `npm run typecheck` | Exit 0 |
| `npm test` | Exit 0; 122 files passed; 2,195 tests passed; 4 skipped; 30.77 seconds |
| `npm run build` | Exit 0; dry run; 7,218.74 KiB upload; 1,417.77 KiB gzip |
| `npm run test:smoke` | Exit 0; 5 files passed; 94 tests passed; 5.84 seconds |
| `npm run secrets:scan -- --tree` | Exit 0; tracked-tree scanner and gitleaks passed in the original worktree |

Initial archive-only tests failed because the temporary copy lacked Git history.
After I supplied that history, the complete suite passed without source changes.
Initial audits used a cache that the sandbox could not write; they produced unreliable counts.
The reported audit results use `--cache /private/tmp/raven-review-b-h29u3uy3/npm-cache`.
Wrangler reported denied writes to its default log directory; the build and smoke commands still exited 0.
Both installations printed the expected Git-hook setup warning before the temporary copies had Git metadata.

Evidence remains in `/private/tmp/raven-review-b-h29u3uy3/`.
The authoritative audit files are `before-audit-writable.json` and `after-audit-writable.json`.
Other evidence includes `registry.json`, `update-undici.log`, `install-direct-undici.log`, and `test-with-history.log`.
Sol high completed separate Standards and Spec checks through Herdr.
I checked their findings against the files and reconciled them above.

Verified correct:

- Only `fast-uri` and `ip-address` change in the lockfile.
- Their versions, resolved URLs, and integrity values account for all twelve changed lockfile lines.
- Every other package record and top-level lockfile field remains identical; `package.json` remains identical.
- Both installed `miniflare` copies require exactly `undici` 7.29.0; `@ai-sdk/provider-utils@5.0.30` declares `^7.28.0`.
- The `fast-uri` advisory range is `>=3.0.0 <3.1.8`.
- The aggregate `ip-address` range is `<=10.7.0`, across four advisories with different individual ranges.
- The aggregate `undici` range is `7.0.0 - 7.29.0`, across ten advisories.
- The README correctly reports the change from ten findings to eight high findings.
- The changes add no runtime source code, overrides, or unrelated dependency resolutions.
- I changed no tracked repository files, posted nothing upstream, and ran no paid evaluations.
