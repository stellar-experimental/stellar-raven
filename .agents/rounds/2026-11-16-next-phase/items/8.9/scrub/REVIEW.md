# Review: item 8.9 lane `scrub` (narrow the skill scrub for excluded operations)

- Reviewer: Claude Opus 5.5, high effort (independent of the author and the orchestrator)
- Reviewed: `git diff origin/main...HEAD` at `77165d7b` (`src/skills/scrub.ts`, `test/skill-scrub.test.ts`)
- Against: `.agents/TODO.md` "Narrow the skill scrub so an excluded operation keeps the skill's workflow", and `AGENTS.md`
- Date: 2026-11-19

## Verdict

**Approve, with two medium follow-ups to fix or explicitly accept before merge.** No critical or high findings.

- ADR-0003 fail-closed holds. Every scrub output still passes through the unchanged final
  `containsExcludedScoutPath` check (`src/skills/scrub.ts:599-606`). Narrowing only ever keeps a
  strict prefix of a sentence plus its terminator, so it cannot create or hide a path that the
  detector catches on the input. Code fences and indented code blocks still fail closed. Templated
  (`/api/hackathons/builds/abc-1`, `` `GET /api/hackathons/builds/{id}` ``) and percent-encoded
  (`/api/partners%2Fmatch`) tails are recognised and removed.
- Served text is right. I ran the `main` and `HEAD` scrubs over all 67 pinned skill files. Exactly
  two files change, and only in the two intended places:
  - `stellar-scout/SKILL.md`: workflow step 4 ("Rails and partners the demo needs") is back with the
    stablecoin peg guidance, the `/api/partners?type=…&q={country}` filters and the "none listed at
    our source" rule. Only `, or \`POST /api/partners/match\` with the need in plain language` is
    removed.
  - `references/api-reference.md`: the getPartner "**Use when** …" sentence is back as "for
    *finding* a partner use `/api/partners` filters." The `POST /api/partners/match` section stays
    removed.
  - Zero non-exposed references remain. The new test assertion runs `assertNoNonExposedRefsInText`
    on every scrubbed Scout file, and it passes.
- Build time and runtime agree. `scripts/exposure.mjs` re-exports the same `scrubNonExposedRefs`
  that `src/skills/source.ts:192,213` calls. `node scripts/build-catalog.mjs --out <scratch>` writes
  output byte-identical to the committed `catalog/manifest.json`. `build-super-spec.mjs`
  (`:517-532`) reads only frontmatter and `##` headings, and the change does not touch headings. No
  generated artifact needs a rebuild.
- Gates I ran: `npm run typecheck` (exit 0), `npm test` (177 files passed, 4298 tests, exit 0),
  `npx vitest run test/skill-scrub.test.ts` (16/16). I did not run `npm run build`, because its
  `prebuild` writes tracked files and this review must not modify the tree. The diff does not touch
  `src/executor` or `src/demo`, so `test:smoke` is not required.

## Findings

### M1 (medium, latent): the trailing-`or` clause check accepts a tail by its first word, so it can cut the sentence's predicate or a condition that covers both alternatives

`isExcludedAlternativeTail` (`src/skills/scrub.ts:383-397`) accepts the text after the endpoint if
it begins with any `ALT_MODIFIER_RE` word (`:184`: `with|for|to|in|on|by|via|from|using|passing|when|if`).
It never checks what follows that word. `isValidNarrowedPrefix` (`:362-381`) rejects a
subordinator only at the start of the active clause, not after a comma. Concrete outputs from the
`HEAD` scrub:

| Input | Output | Problem |
|---|---|---|
| `` `/api/partners` or `POST /api/partners/match` with a country filter returns anchors. `` | `` `/api/partners`. `` | Subject-only fragment; the predicate is lost |
| `` Calling `/api/partners` or `POST /api/partners/match` with a need yields matches. `` | `` Calling `/api/partners`. `` | Fragment |
| `` Prefer the directory, since `/api/partners` or `POST /api/partners/match` with a plain need both work. `` | `` Prefer the directory, since `/api/partners`. `` | Mid-clause subordinator leaves a fragment |
| `` Fall back to `/api/partners?type=anchor` or `POST /api/partners/match` when the region search is empty. `` | `` Fall back to `/api/partners?type=anchor`. `` | A condition that applied to both alternatives is dropped, so the instruction becomes unconditional |
| `` Call `/api/partners` or `POST /api/partners/match` if the user names a country. `` | `` Call `/api/partners`. `` | Same: the condition is lost |
| `` Use `/api/partners` or `POST /api/partners/match` for ranking and report "none listed at our source" when empty. `` | `` Use `/api/partners`. `` | A coordinated instruction is silently dropped, and it is the very kind of rule this item exists to keep |

None of this leaks a path. `main` dropped each of these sentences outright, so the output is never
*less* text than before. But the docstring (`:399-404`) promises that a clause is removed only
"when the remaining prefix stands as a complete, balanced sentence", and these outputs break that
promise in model-facing text. The current pin does not trigger the problem. A re-pin with reworded
upstream prose could.

Suggested fix (cheap, keeps the current outputs):

- Drop `when|if` from `ALT_MODIFIER_RE`. They usually scope over the whole disjunction.
- Reject a tail whose text after the endpoint contains a top-level ` and `, ` but `, ` then `,
  `which`/`that`, or a `SUBORDINATOR_START_RE` word anywhere.
- In the prefix, reject the narrowing when the active clause holds a subordinator word anywhere,
  not only at its start, unless a comma follows it, as the current check already allows.
- Optionally reject a prefix whose active clause is only a code span or a gerund plus a code span
  (the subject-position case).

Add two or three of the counterexamples above to the "drops the whole sentence" test.

### M2 (medium, latent; regression vs `main`): stopping list-item collection at an indented fence orphans that item's code block and later continuation lines

The new `!fenceLine(...)` stop in list-item collection (`src/skills/scrub.ts:581-586`) makes an
indented fence fail closed when it contains an excluded path. That direction is correct. But when
the list item is dropped and its child fence holds **no** excluded path, the fence and every
continuation line after it survive, reattached to the previous item:

```text
in:  - Keep.
     - Call `POST /api/partners/match` like this:
       ```sh
       curl https://x.test/api/partners?q=a
       ```
       Then read the ranking.
     - Next.
out: - Keep.
       ```sh
       curl https://x.test/api/partners?q=a
       ```
       Then read the ranking.
     - Next.
```

On `main` the whole item, fence included, was dropped. Now "Then read the ranking." (about the
excluded operation) hangs under an unrelated item. This is the orphan-continuation outcome that
`narrowListItem`'s docstring (`:442-447`) says the scrub avoids. No path leaks, and the current pin
does not trigger it.

Suggested fix: when `narrowListItem` returns `null` (item dropped) or narrows an item, and the next
line is an indented fence or a deeper-indented continuation that belongs to the item, either throw
(the fail-closed choice, which matches the module contract) or drop the rest of the item through
its end. Pin it with a test next to `fencedAfterBullet`.

### L1 (low): narrowing is quadratic in sentence length

`stripExcludedAlternativeClause` (`:405-426`) re-scans the prefix and the tail for each top-level
`or` split (`topLevelOrSplits`, `:312-360`). Measured on one synthetic sentence: 15 KB took 90 ms,
60 KB took 1.4 s, and 240 KB took 27 s. Input is pinned and hash-verified, and real sentences are
well under 2 KB, so this is not exploitable. Still, a pathological upstream list item (the joined
path at `:474-479` makes a whole multi-line item one "sentence") could burn Worker CPU at read
time. Suggest falling back to whole-sentence removal above a fixed length or split count, for
example 2,000 characters or 16 splits.

### L2 (low): quote balance ignores single and curly quotes

`scanTopLevel`, `hasBalancedMarkdownEmphasis` and `topLevelOrSplits` (`:196-360`) track only
backticks, `"`, `()`, `[]` and `*`. Outputs:

- `Say 'use /api/partners or POST /api/partners/match'.` becomes `Say 'use /api/partners.`
- `“Use /api/partners or POST /api/partners/match”.` becomes `“Use /api/partners.`

Underscore emphasis (`_`/`__`) is not counted either. A trailing `_` after the endpoint is rejected
anyway, but an opening `_` in the prefix is not checked. Tracking `“”` is safe. Tracking `'` is
risky because of apostrophes, so a narrower option is to reject a tail whose endpoint match ends in
`'` or `’`.

### L3 (low): the remaining prefix can be grammatical but semantically incomplete

- `` Use `/api/partners`, `/api/projects`, or `POST /api/partners/match`. `` becomes
  `` Use `/api/partners`, `/api/projects`. `` (serial list with no conjunction).
- `Both X or …` becomes `Both X.`, `Not only X or …` becomes `Not only X.`, and
  `Pick one of X or …` becomes `Pick one of X.`

`CORRELATIVE_PAIRS` (`:189-194`) covers either/whether/neither/between, but not `both` or a trailing
`one of`. For the serial list, the fix is to replace the last remaining `, ` with ` or `, or to
reject a prefix whose active clause holds a top-level comma-separated list of endpoints.

### L4 (low): test coverage gaps

The new tests guard distinct behaviour. I found no redundant new case. These narrowing paths have
no pin:

- Correlatives `neither…nor` and `between…and`. Two of the four `CORRELATIVE_PAIRS` are untested.
- `narrowListItem` returning `null` for a `>` or `|` continuation (`:454`).
- A rejected non-lead-in tail, e.g. `` or the AI ranking at `POST /api/partners/match` `` (this is
  the guard that keeps a prose description of the excluded op from surviving).
- A percent-encoded or templated excluded endpoint in a narrowed tail. I verified both work.
- The multi-line list item whose lines each end a sentence (line-wise branch, `:457-472`). Item 2
  of the workflow fixture is one line, and item 3 takes the joined branch.
- A wrapped paragraph (joined branch, `:556-558`) narrowed rather than dropped.

### Nits

- N1. `test/skill-scrub.test.ts:274-278`: the old `mentionedPaths` loop is mostly redundant. The
  scrub throws on any surviving excluded path, and the new `assertNoNonExposedRefsInText` assertion
  (`:273`) is stricter. Its only unique coverage is `/api/repos`, which the emitted-text guard does
  not list. A one-line comment saying so, or replacing the loop with
  `expect(scrubbed).not.toMatch(…)` per path, would make that intent explicit.
- N2. The joined list-item branch (`:474-479`) flattens hard-wrapped lines and two-space hard
  breaks onto one line. That is acceptable, but the module docstring could say a narrowed wrapped
  item is re-flowed.
- N3. `ENDPOINT_REF_RE` (`:181`) omits `HEAD|OPTIONS`, which `DANGLING_END_WORD_RE` includes.
  Harmless, but inconsistent.
- N4. `isValidNarrowedPrefix` treats a single-letter article (`a`) as dangling, so
  `Use a or \`POST …\`` drops the sentence. This is correct and conservative; noted only because it
  shaped my perf fixtures.

### Pre-existing, outside this diff (for the lead's awareness, not blocking)

- P1. `excludedPathPattern` (`src/skills/scrub.ts:79-87`) is case-sensitive, while
  `scripts/emitted-text-guard.mjs:68-73` lowercases. `` Use `/api/partners` or GET /API/PARTNERS/MATCH. ``
  passes the scrub unchanged. The runtime read path runs only the scrub. Paths are case-sensitive
  over HTTP, so this is a weak affordance, not a working call, but the two detectors disagree.
- P2. `emitted-text-guard.mjs` `RAW_SCOUT_PATHS` (`:30`) is derived from `EXCLUDED_SCOUT_OPS` only,
  so it does not cover `SCOUT_PATHS_ABSENT_FROM_SPEC` (`/api/repos`). The scrub does cover it.
- P3. A `~~~` line inside a ```` ``` ```` fence toggles `inFence` (`:519`). The fenced content after
  it is then scrubbed as prose instead of failing closed. That removes rather than leaks, so it is
  safe, but it is not what the comment says.

## TODO "Done when" check

| Criterion | Status |
|---|---|
| Served `stellar-scout` keeps the partner-filter step with the operation excluded | Met. Verified on the pinned bytes, and the output diff vs `main` is exactly step 4 plus the getPartner sentence |
| A test pins it | Met (`test/skill-scrub.test.ts:280-293`). It pins exact upstream prose, so a re-pin that rewords it will fail this test, which is intended |
| Served text checked afterwards; "its own gate run" | Not shown in the diff. My evidence: catalog byte-identical, super-spec unaffected, and only the two intended served-text changes across all 67 files. So the routing gate cannot move. Whether an answer-quality run is also wanted for the restored skill text is the lead's call, and the round ledger should record it |

## AGENTS.md conformance

- The diff is scoped to two files, with no generated-file edits (none needed) and no compatibility
  shim. The module comment describes current behaviour.
- The manifest and exposure surface are unchanged. `EXCLUDED_SCOUT_OPERATIONS` is untouched, and
  no excluded operation becomes callable.
- I did not run the secrets scan, because I made no commit. The diff contains no credential-shaped
  content.
- Review method: I opened no eval or golden case text. Scratch probes ran from the conversation
  scratch directory. A temporary copy of `main`'s `scrub.ts`, placed under `src/skills/` for the
  A/B, was deleted before the gates ran. `git status` is clean apart from this file.
