# Item 8.11 independent review: `np/8.11-hygiene` (PR #508)

- Scope: `git diff origin/main...HEAD` at `618ed361`, 14 files.
- Reviewer: Antigravity, Claude Opus 5.5, high effort. Read-only apart from this file. No commits, pushes, or model or API calls.
- Checked against: `AGENTS.md`, `orch/8.11-NOTE.md`, the three `.agents/TODO.md` items, and the owner's rule of 2026-11-19 ("don't write and maintain permanent tests for ephemeral issues").

## Verdict

One **high** finding has to be fixed before merge. It is a one-line regex change and does not alter today's served text. The rest are medium, low, and nit. The lossDetail change and the comment changes are correct. The fence-kind handling is correct, and the scrub still fails closed.

| # | Severity | Area | Summary |
|---|---|---|---|
| H1 | high | ADR-0003 guard | The emitted-text guard switched from substring matching to the scrub's boundary rule. A trailing-slash reference to an excluded endpoint now passes both the scrub and the guard. The PR does not disclose this. |
| M1 | medium | Ephemeral test (retained) | `test/skill-scrub.test.ts` L306-319 pin today's upstream Scout wording. The new diff-pins report makes them redundant. |
| L1 | low | Ephemeral or redundant test (added) | The new guard test hardcodes `/api/repos` and two exposed child names. It also repeats case and encoding variants the guard suite already covers. |
| L2 | low | Redundant test (retained) | `test/source-basis.test.ts` L289-300 still pins truncate.ts wording. After the structural fix, the only lasting check is that the detail flows through. |
| L3 | low | Docs | `ecosystem-skills/PIN-REVIEW.md` does not mention the new `SCRUB NARROWED` and `SCRUB BLOCKED` lines that diff-pins prints. |
| N1 | nit | diff-pins | The `- before:` / `+ after:` prefixes copy unified-diff syntax. Unchanged narrowings print again on every CHANGED file. `SCRUB BLOCKED` exits 0. |
| N2 | nit | Typing | `scripts/exposure.d.mts` writes out the `ScrubOptions` shape inline instead of importing the exported type. |
| N3 | nit | Process | The PR body does not list the tests added and removed, which the 8.11 note requires in the lane report. |

## Findings

### H1 (high): the guard is now weaker on every ADR-0003 surface. Trailing-slash references pass.

**Where:** `src/policy/scout-exposure.ts` `excludedPathPattern` (`(?![\w/-])` lookahead), now called by `scripts/emitted-text-guard.mjs` through `findExcludedScoutPath`.

**What changed:** on `main`, the guard checked a plain `decodedText.includes(path)` for each path in `EXCLUDED_SCOUT_OPS`, plus a regex for templated paths. The scrub used the stricter boundary rule, which rejects a match followed by `[\w/-]`. Under ADR-0003 the guard is the backstop for the manifest, super-spec, catalog entries, family text, demo copy, and (in the live-skill test) the scrubbed skill bodies. The TODO asked for agreement on **letter case** and the **path set**. Instead, the PR also moved the guard to the scrub's boundary rule. This loosened the backstop, and neither the commit message nor the PR body says so.

**Evidence:** I ran the same probe against `origin/main` (unpacked with `git archive` to /tmp, since deleted) and against the branch:

| Text | `main` guard | branch guard |
|---|---|---|
| `GET /api/feedback/` | throws | **passes** |
| `/api/partners/match/` | throws | **passes** |
| `/api/rwa/` | throws | **passes** |
| `` `/api/repos/` `` | passes (not in the set) | **passes** |
| `/api/hackathons/review/x`, `/api/rwa/assets`, `/api/sources/locate/v2` | throw | pass (acceptable: different paths) |
| `/api/feedbacks`, `/api/verify-claim`, `/api/rwa_x` | throw | pass (correct: these were false positives) |

On `main` the scrub already missed trailing slashes. The guard caught them, which in practice meant the live-skill test in `npm test` failed. After this PR, nothing catches `POST /api/partners/match/` in any guarded surface or in a served skill body. That is a reference to a non-exposed operation, which an AGENTS.md hard rule forbids.

**Current exposure:** none. A scan of all 67 pinned skill files for an excluded path followed by `/` and no further path segment found 0 hits, so the fix below does not change served text today.

**Fix:** keep the shared matcher, but count a trailing `/` as a match unless a path segment follows it. For example, change the lookahead to `(?![\w-]|\/[\w{%-])`. Then `/api/feedback/`, `/api/feedback/?x`, and `` /api/feedback/` `` match. `/api/repos/search` and `/api/hackathons/builds?q=…` still do not. Add one assertion for the matcher invariant, in either suite: a trailing-slash excluded path is rejected and an exposed child is allowed. The owner's rule allows this test because it guards a lasting boundary, not today's wording. State the boundary semantics in the PR body, then rerun the served-text check (expected: no diff).

### M1 (medium): a retained test pins today's upstream text (owner's rule)

`test/skill-scrub.test.ts` L306-319 (the "keeping the partner-filter workflow" assertions) check for exact upstream strings in today's pinned `stellar-scout/SKILL.md` and `references/api-reference.md`: `"4. **Rails and partners the demo needs.**"`, the stablecoin `peg=` string, the partners filter string, `'"none listed at our source"'`, and the `**Use when** you already hold a slug…` sentence. Any upstream rewording fails `npm test` at re-pin, even when the scrub works. This is the "today's upstream text" test the owner ruled out. It is also redundant after this PR: diff-pins now prints every narrowed sentence (before and after) for the re-pin reviewer, which is what these lines tried to check, and the loop above them (L300-304) asserts that every scrubbed Scout file passes the guard. I ran it: diff-pins prints `SCRUB NARROWED 1 sentence(s)` for each of those two files.

**Fix:** delete L306-319. The `not.toContain("/api/partners/match")` and `not.toContain("## \`POST /api/partners/match\`")` lines are already implied by the guard loop. Keep the loop and the `selected.size > 0` check: they guard the lasting invariant that pinned Scout bodies scrub clean. Rename the `it(...)` title to match.

### L1 (low): the added guard test pins policy data and repeats existing coverage

`test/emitted-text-guard.test.ts` "rejects paths absent from the Scout spec while allowing exposed child paths":

- It hardcodes `/api/repos` plus two exposed children, `/api/repos/search` and `/api/repos/explain`. If `/api/repos` enters the spec or gets exposed, or if Scout renames a child, the test breaks without any regression.
- Its case and `%2F` variants repeat the `it.each` matrix a few lines above. Now that both sides call `findExcludedScoutPath`, the matrix already covers those matcher properties.
- The child-path boundary is covered against the same matcher in `skill-scrub.test.ts`, "matches a collection path with query parameters without matching longer path names".

The lasting fact is only "the guard covers `SCOUT_PATHS_ABSENT_FROM_SPEC`". **Fix:** read the paths from data, as the other tests in this file do. For example: `for (const path of EXCLUDED_SCOUT_PATHS) expect(() => assertNoNonExposedRefsInText(\`Use ${path}.\`, "t")).toThrow()`, with `EXCLUDED_SCOUT_PATHS` added to the `.d.mts` export list (already done). This checks the wiring for both sets with no hardcoded names. Drop the variant and child-name lines.

The other test edits pass the owner's rule:

- `~~~` inside a backtick fence (`skill-scrub.test.ts` L109-110) is a minimal check of a lasting rule. I confirmed it tells the old toggle apart from the new one: the old code would drop the list item and not throw.
- The case-variant line in the templated test is a minimal check of the new case-insensitive scrub.
- The `onNarrow` assertions (L220-233, L268-276) cover the callback contract on synthetic fixtures. The `[]` case guards that an item discarded whole reports no narrowing.
- Removing the `mentionedPaths` loop is correct. The guard now covers `SCOUT_PATHS_ABSENT_FROM_SPEC`, so the loop was redundant.

### L2 (low): `source-basis.test.ts` still couples to truncate.ts wording

The TODO named this test as the "one indirect test". In "uses truncate.ts loss detail for generic shape summaries" (L289-300), the lines `toContain("Bulk lost from top-level keys:")` and `` toMatch(/"rows" ~\d+(\.\d+)?k chars \(cut\)/) `` pin `lossDetail()` wording. `test/policy.test.ts` L290-302 already covers that wording directly. With the detail now passed as a field, this test's lasting job is to show that `shape.lossDetail` reaches the manifest. **Fix:** assert that `shape.lossDetail` is non-empty and that `text` contains it, or contains its leading part, since `truncateAtom` may clip it. Keep `shape: object` and `top-level keys`, which come from source-basis's own template. This is optional. It is a pre-existing test that the structural fix made partly redundant.

### L3 (low): the re-pin docs don't describe the new output

AGENTS.md "Definition of done" says documentation describes current behavior. `ecosystem-skills/PIN-REVIEW.md` ("Procedure" / "What to look for") and the update.sh banner do not mention the `### SCRUB NARROWED … (review the served wording)` and `### SCRUB BLOCKED` lines. Add one sentence to "What to look for": a narrowed sentence is the wording that will be served, so check that its meaning survived (the 8.10 audit's qualifier-drop risk). A blocked file will fail the catalog build.

### N1 (nit): diff-pins presentation

- The `- before:` and `+ after:` lines follow the unified hunk and use the same `- ` and `+ ` prefixes as hunk lines. A reader, or the existing heuristic in `test/diff-pins.test.ts` that counts `+ ` lines, can mistake them for diff content. Use distinct labels such as `  narrowed from:` / `  served as:`.
- For CHANGED files, the report shows every narrowing in the new text, including ones already present in the old pin. The old text is available, so print only the narrowings that are new or different. Reviewers then don't learn to skip it.
- `SCRUB BLOCKED` prints and exits 0, so `update.sh` continues. The catalog build fails later anyway, so nothing leaks, but a non-zero exit would stop the re-pin at its first review step.
- The report misses a narrowing caused by an exposure-policy change in a pinned file that did not change. Out of scope here; the served-text check covers that case.

### N2 (nit): duplicated option type at the JS/TS boundary

`scripts/exposure.d.mts` writes out `{ onNarrow?: (change: { before: string; after: string }) => void }` inline. `src/skills/scrub.ts` exports `ScrubOptions` and `NarrowedSentence`, so `import type { ScrubOptions } from "../src/skills/scrub.ts"` keeps a single source and prevents drift. The other new declarations (`EXCLUDED_SCOUT_PATHS: Set<string>`, `SCOUT_PATHS_ABSENT_FROM_SPEC: Set<string>`, `findExcludedScoutPath(text): string | null`) match the TS source. Declaring `SCOUT_PATHS_ABSENT_FROM_SPEC` fixes an export that was previously untyped.

### N3 (nit): test ledger

The 8.11 note says: "In the report, list every test added or removed and why." The PR body lists gates but not test changes. The lane report does not exist yet: `items/8.11/` was empty when I reviewed it. Include the list there or in the PR body.

## Checks with no findings

**Item 1, lossDetail:** done correctly. `lossDetail()` returns the detail without the leading space that `footer()` adds, and the old regex trimmed its capture, so the value is byte-identical. The detail is now correct even when custom advice text or a key name contains ` Re-run returning`, which the old non-greedy regex would have cut. Logs truncation returns `""`, matching the old parse. No silent failure path remains, so the TODO's "direct test" was rightly skipped. `tsc --noEmit` passes, so all the code that builds `Truncated` values compiles with the new field.

**Item 2, comments:** done. `ARCHITECTURE.md` has `### Request routes and authorization` (L23). `EXECUTE_DESCRIPTION` exists. The Grok 2,033-character claim matches `GROK_CUT_CHARS` and `test/mcp-instructions.test.ts`. The `src/server.ts` pointer the TODO missed was also fixed. `rg` finds no `DESIGN.md` or `.agents/rounds` pointers left under `src/`. The comments describe current behavior only, with no history.

**Item 3, structure:** one matcher over `EXCLUDED_SCOUT_PATHS` (including `SCOUT_PATHS_ABSENT_FROM_SPEC`), case-insensitive in both consumers. The duplicated regex builder in the guard was removed. The regexes have no `g` flag, so `.test` keeps no state between calls. `findExcludedScoutPath` returns the canonical path, which keeps the guard's error message useful. H1 is the only problem.

**Fence parsing:**

- Character and length matching is CommonMark-correct. A closing fence cannot carry an info string. A backtick info string cannot contain a backtick, so a one-line ```` ```x``` ```` is not a fence. An unclosed fence runs to the end of the text. Trailing `\r` from CRLF input is handled, because `\s*$` matches it.
- The heading pass now tracks fences too. On `main`, a `# GET /api/…` shell comment inside a fence was read as a heading and deleted the section, eating the fence close. Now the fence is skipped. Inside a removed section, fences are skipped, so a `#` line in a code block no longer ends the section early.
- Edge cases (a fence indented 4+ spaces, a ```` ```js `x` ```` line that makes the next ```` ``` ```` an opener) mis-detect toward "fenced". Fenced lines bypass removal, so a path inside one throws. That is the fail-closed direction.
- The leak guarantee does not depend on fence parsing. The final `containsExcludedScoutPath(scrubbed)` check still runs over the whole output, and `onNarrow` fires only after it passes, so a blocked scrub never reports partial narrowings.

**Served text:** with the cached pins, offline, I compared `scrubNonExposedRefs` from `origin/main` against the branch on all 67 manifest files: **0 differences**. Today 2 sentences are narrowed. The only throw is the retired `lumenloop-mcp-connect`, which also throws on `main` and is not served. This agrees with the lane's 63-file `codemode.skill.read` check.

**diff-pins end to end:** I marked the two Scout files as NEW in a temporary old manifest. diff-pins printed `### SCRUB NARROWED 1 sentence(s)` for each, after the full body. Runtime (`src/skills/source.ts`) scrubs every pinned file from every source, and diff-pins does the same, so they agree.

## What I ran

- `npm run typecheck`: pass.
- `npx vitest run` on `test/skill-scrub.test.ts`, `test/emitted-text-guard.test.ts`, `test/diff-pins.test.ts`, `test/source-basis.test.ts`, `test/source-basis-readers.test.mjs`: 57/57 pass.
- Guard boundary probe, `main` vs branch, offline served-text comparison, trailing-slash scan, and diff-pins narrowing smoke test. The scripts are in the reviewer's scratch directory, outside the repo, and the /tmp copies are deleted.
- I did not rerun the full `npm test`, `npm run build`, `test:smoke`, or the routing gate. The PR reports them green.
- No case text under `eval/` or the golden round folders was opened. No credentials were printed.
