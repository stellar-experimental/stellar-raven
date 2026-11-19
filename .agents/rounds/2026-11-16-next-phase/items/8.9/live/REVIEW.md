# Review: item 8.9, lane `live` (`np/8.9-live`, commit `1cb46bb6`)

Reviewer: Claude Opus 5.5, high effort, run from Antigravity. The author was Gemini (Antigravity),
so this reviewer is a different model family.
Scope: `git diff origin/main...HEAD`. It touches two files: `test/live/run-live-execute.mjs` and
`test/live/run-live-spec-search.mjs`.

## Verdict

**No blocking or major findings.** All four failing checks were traced to their real cause. Each
cause is a deliberate product change, not a defect in `src/`. The rewritten checks match the current
contracts. Both suites pass, and the TODO's done-when is met. There are two minor findings and four
nits, and none of them blocks the merge.

## Verification run (free, no model call)

- I ran both suites against the lane's existing server on port 8791. Its working directory is this
  worktree, and I did not start a second Wrangler. `run-live-execute.mjs` passed: initialize plus
  9 of 9 cases, exit 0. `run-live-spec-search.mjs` passed 5 of 5, exit 0.
- `npx vitest run test/live-cases.test.mjs`: 20 of 20 passed.
- The diff touches no file in `src/`, so the `test:smoke` gate does not apply.

## Root-cause check, per failing check

| Check | Cause given by the lane | Verified against | Product defect? |
|---|---|---|---|
| initialize: envelope contract | `r.data.projects` moved out of the server instructions into `EXECUTE_DESCRIPTION` | `src/mcp/tools.ts:174-193`: the `BASE_SERVER_INSTRUCTIONS` doc comment says it "names the envelope without restating the payload-access rule". This came from `e3d0cd55` (#430). Both envelope strings the check now uses appear verbatim at `tools.ts:187`. | No |
| execute case 6: unparseable result | A host block now follows the result JSON, so splitting at `\n--- console` left the manifest inside the text being parsed | `src/executor/run.ts:553-632` adds `\n` and the source manifest whenever the ledger has a call that did not soft-empty. That code came from `3710d116` (Slice C). `tools.ts:516` then appends the recovery, candidate, prior-art, checkpoint and console blocks. | No |
| execute case 8: `isError`, `reading 'slice'` | The `skills.stellar-dev.standards` pin shrank below the 5,000-token notice threshold. The test's own `r.data.notice.slice` then threw on `undefined`. | `ecosystem-skills/MANIFEST.json`: standards `SKILL.md` is 8,399 bytes and stellar-scout is 35,469. `src/skills/store.ts:70-76` sets the threshold at about 20,000 characters. The live run returned 34,660 characters, a notice, and 16 sections. `test/skills.test.ts:284-299` had already switched its own oversized-read test to stellar-scout, so the live case now matches it. The throw came from test code. `store.ts` correctly leaves out `notice` below the threshold. | No |
| spec-search case 4: no `--- TRUNCATED ---` footer | When execute truncates, it keeps only the first `maxChars` characters and replaces the footer with `--- SOURCE BASIS ---`. The loss detail moves into the `shape:` line. | `run.ts:629-632` slices `result.text` to `result.maxChars`, which drops the footer. `source-basis.ts:276` uses `SOURCE_BASIS` only when `truncated` is true. `source-basis.ts:434-438` (`extractLossDetail`) lifts the "Bulk lost…" sentence into the shape line. `source-basis.ts:317/319` puts "prefer a narrower re-run" in the guidance line on both artifact paths. | No |

Each rewritten check still guards what the original was written to guard:
- The envelope contract in initialize.
- The split guard contract. Case 6 is now stronger: `errGuardIsUndefined`, `okGuard` and
  `metaGuard` are read from the parsed object instead of searched for anywhere in the text, and
  `okGuard` was not checked at all before.
- Oversized reads return the full body with a notice, and section reads return no notice.
- Truncation of the whole spec happens host-side. Checking for `SOURCE BASIS` rather than
  `SOURCE METADATA` makes the check specific to truncation.

## Findings

### Minor 1: case 6 parses the result body by cutting at a hand-maintained list of host-block headers

`run-live-execute.mjs:111-113` cuts the text at the first
`\n+--- (SOURCE METADATA|SOURCE BASIS|EVIDENCE|SERVICE|INCONCLUSIVE|PRIOR-ART|console)`. The list is
already incomplete:
- `--- CANDIDATE EVIDENCE ---` (`src/policy/evidence-checkpoint.ts:55`) does not match it.
- The corroboration-guard text seen after the manifest in live case 2 has no `---` header at all.

The check passes today only because `run.ts:632` always puts the source manifest immediately after
the result whenever the ledger has a call that did not soft-empty. Case 6 always has one. This is
the same kind of drift that broke the original check, when a new block appeared and the cut point
stopped working. The script returns `JSON.stringify` output, which never contains a raw newline.
That makes `text.slice(0, text.indexOf("\n"))` exact, with a fallback to the whole text when there
is no newline, and it needs no marker list to keep up to date.

### Minor 2: when an upstream call fails, case 6 reports the wrong reason

`okGuard` and `metaGuard` can only throw when `dir.ok` and `sp.ok` are true and the payload has a
`projects` or `meta` key. If Lumenloop or Scout fails or soft-empties, the check reports
"dir.projects did not throw a pointer at r.data.projects", which blames the guard. The real cause
then surfaces only in the `writeBack` check, which runs after it. Before the guard assertions, add
`if (!out.raw?.ok || out.viaData === null) return "precondition: lumenloop.search_directory not ok
(upstream)"`, plus the same precondition for `sp`, for example by also returning `sp.ok`. That way
a failing upstream reads as an upstream failure, not a guard regression.

### Nit 1: spec-search case 4 hard-codes the 24,000-character cap

`run-live-spec-search.mjs:85` hard-codes `24000`. That number follows from
`EXECUTE_MODEL_BOUNDARY_MAX_TOKENS` = `6000` (`wrangler.jsonc:47`) times `CHARS_PER_TOKEN`. The
variable can be overridden between 1,000 and 32,000 (ARCHITECTURE.md:333). `.dev.vars` does not set
it today, so the check holds. Still, a local server with a raised cap would fail case 4 even though
nothing regressed. The old check had the same coupling through `"limit: 6000"`, so this is not new.
A one-line comment naming the source of the number would be enough.

### Nit 2: the `"paths"` expectation assumes `paths` is the largest truncated key

The expectation `'Bulk lost from top-level keys: "paths"'` holds only while `paths` is the largest
top-level key lost to truncation. `lossDetail` sorts lost keys by size, largest first
(`truncate.ts:168-171`). That is true today and likely to stay true, but if it stops being true the
check fails with nothing actually broken. Expecting only `Bulk lost from top-level keys:` would
also be enough.

### Nit 3: the initialize check depends on the exact instruction wording

`run-live-execute.mjs:204-206` matches the two envelope shapes word for word. The shapes are the
contract, so this is acceptable. A wording-only edit to `BASE_SERVER_INSTRUCTIONS` will fail this
live check while `test/mcp-instructions.test.ts` stays green.

### Nit 4: execute cases 1 to 3 assert nothing beyond `!isError`

This predates the lane and is outside the four checks it was asked to fix. For example, case 3's
label promises "all callable", but `policyFieldsPresent` is never asserted. It is recorded here
only so the gap is visible. It is not a contract mismatch.

## Scope, style and hard rules

- The diff stays within `test/live/**`, as the lane spec requires. It has no `src/` change, no
  generated file, and no edits to TODO, ledger or DECISIONS files.
- The unused `parseRpc` import in the spec-search suite was removed. The new `initRes.ok` guard and
  the per-case `check` hook in the spec-search runner are small and match the style of the execute
  runner.
- The offline contract in `test/live-cases.test.mjs` still holds. The new skill id is a `kind:
  "skill"` manifest entry, and the spec cases' code is unchanged, so `expect(result).toBe(spec)`
  still passes.
- No secret, credential or model call appears in the diff or was needed to verify it. Nothing in
  the diff touches case text.
- Recommendation: merge as is, or fold in Minor 1 and Minor 2 first, since each is a one- or
  two-line change. After the merge, the orchestrator still needs to update the TODO item, including
  the line saying that "AGENTS.md's live check depends on the handshake and smoke lanes".
