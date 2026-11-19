# Item 8.9 scrub: independent review, round 2 (simplification)

- **Scope:** `git diff origin/main...HEAD` at `8f6d6be3`. Only the code and test files matter here: `src/skills/scrub.ts` and `test/skill-scrub.test.ts`.
- **Reviewer:** Claude Opus tier, Claude Opus 5.5, high effort, running in Antigravity. This model differs from the round-2 author (Gemini, per the commit trailer) and from the orchestrator. Opus is the stable fallback for a security-adjacent scrub change.
- **Checked against:** the `.agents/TODO.md` item "Narrow the skill scrub so an excluded operation keeps the skill's workflow", the round-2 simplification directive, and `AGENTS.md`.

## Verdict

**APPROVE.** I found no critical, high or medium issues. The two low items and the nits do not block the merge.

- **No leaks.** No excluded Scout path or retired skill reference can reach served text. The whole-output guard at the end of `scrubExcludedScoutOperationRefs` has not changed and still runs last. Every new code path can only drop text, or keep a prefix it has already checked with `containsExcludedScoutPath`.
- **Directive met.** The implementation is the smallest general rule asked for: drop the last top-level `, or …` / ` or …` clause only when the remaining prefix names no excluded path. In every other case the scrub removes the whole sentence (paragraph) or the whole item (list). `scrub.ts` adds 74 lines and deletes 9 against `origin/main`, under the 80-line budget. Round 1 added 531.

## Evidence I gathered

| Check | Result |
|---|---|
| `npm run typecheck` (bare) | exit 0 |
| `npm test` (bare, full suite) | exit 0: 177 files passed, 4298 tests passed, 3 expected fail, 5 skipped |
| Served-text diff, `origin/main` scrub vs HEAD scrub, run with `scrubNonExposedRefs` over all 67 pinned files in `ecosystem-skills/MANIFEST.json` | Exactly two files change. (1) `stellar-scout/SKILL.md` gets step 4 "Rails and partners the demo needs." back, including the peg guidance, the partner filters and the "none listed at our source" rule, minus only the `, or POST /api/partners/match …` clause. (2) `references/api-reference.md` gets the `**Use when** … use \`/api/partners\` filters.` sentence back. The `## POST /api/partners/match` section is still removed. No other file changes by a single byte. |
| Served-text diff, round-1 code (`58d5efff`) vs round-2 code over the same 67 files | Identical output. The served-text check and the before/after routing gate in `REPORT.md` were run on round-1 code, and they still hold for round 2. |
| Linear-time probe: pathological inputs of 10k, 100k and 400k chars (long whitespace runs, comma runs, repeated ` or `, unbalanced `(`, repeated code spans, `%2F` runs, repeated templated-path prefixes) | Time grows linearly: 400k chars takes about 5–25 ms per input. There is no super-linear case. |
| Adversarial leak probe: `OR` and other case variants, `,or`, tab separators, Markdown link targets, percent-encoded `%2F`, task-list and nested markers, CRLF lines, lazy continuation lines, indented code after a blank line, an indented fence inside an item, HTML comments and `<code>` | Each probe ends in one of three ways: a narrowed prefix with no excluded path, whole-sentence or whole-item removal, or a throw (indented code block). None leaks. |

## Focus questions

### 1. Can an excluded Scout path or retired skill reference survive into served text?

No.

- `stripTrailingExcludedOrClause` returns `null` unless `prefix` passes `containsExcludedScoutPath`. Callers keep only sentences that never contained an excluded path, or that prefix.
- The cut always lands on `,` or whitespace. Before the cut, the character after any path was one of those; after the cut it is the terminator or end of string. Neither is in the `(?![\w/-])` lookahead class, so a cut cannot turn a non-matching longer path into a match. The prefix re-check would catch that anyway.
- Re-joining lines with `" "` cannot build a path or a `%xx` run across a boundary, because the patterns contain no whitespace.
- `scrubRetiredSkillRefs` runs first and keeps its own guard. This diff does not touch it, and removing or joining text cannot create `lumenloop-api-*`, `lumenloop-mcp-connect` or `stellar-developer-activity`.
- The corpus test now also runs `assertNoNonExposedRefsInText` on every scrubbed Scout body. That guard catches excluded op names (`matchPartners` / `match_partners`) and paths in any letter case. Skill bytes are pinned by blob sha, so this test fixes what is actually served at runtime.

### 2. Does fail-closed still hold for fences, indented fences and indented code blocks?

Yes, and it is slightly stricter than before.

- An indented fence line now ends list-item collection (`!fenceLine(...)`). The fence body then goes through the `inFence` path verbatim, and any excluded path in it reaches the final guard and throws. Two new tests pin this, one where the parent bullet is kept and one where it is dropped.
- Indented code blocks are still not paragraph lines (`paragraphLine`), and the existing test at "fails closed on an indented code block…" still passes.
- A lazy continuation line indented deeper than the bullet with no blank line is prose in CommonMark. Folding it into the item is correct; the probe drops the whole item.

### 3. Super-linear, ReDoS or correctness bugs in `stripTrailingExcludedOrClause` / `narrowListItem`?

None that leak or break fail-closed.

- **Linear time:**
  - The single pass is O(n).
  - The sticky `TRAILING_OR_RE` (`/(?:,\s*|\s+)or\s+/iy`) is tried only at a comma, or at the first whitespace of a run (the previous character is neither whitespace nor `,`). Each try costs O(run length), so total work stays linear. The timing probe confirms it.
  - On a match the cursor jumps past the match.
- **Fallbacks are conservative:** the function returns `null`, meaning the sentence or item is dropped, in these cases:
  - an unbalanced backtick, `"`, paren or bracket;
  - a negative paren depth;
  - an `or` at position 0;
  - a `,`, `;` or `:` after the last top-level `or`, so a trailing clause that carries more content (`…, then inspect.`) is never cut;
  - an empty prefix;
  - an excluded path in the prefix.
- **`narrowListItem`:** returns `null` (drop the whole item) when the marker does not parse, which includes CRLF lines; when any continuation line starts with `|` or `>`; or when any excluded sentence in the item cannot be narrowed. This matches the directive's whole-item fallback.

### 4. Test adequacy and bloat

Coverage is adequate and proportionate.

- **Restored passages:** pinned against the real pinned corpus (SKILL.md step 4 with its peg, filter and "none listed" text; the api-reference "Use when" sentence).
- **Removed `POST /api/partners/match` section:** pinned as absent.
- **Narrowing:** comma-`or`, wrapped list item, percent-encoded, templated `{id}`, inline paragraph, and wrapped paragraph.
- **Fallback:** excluded path in the prefix, parenthetical, quoted, trailing clause after the `or`, a list item with an un-narrowable sentence, and `>` / `|` continuations.
- **Fail-closed:** indented fence under a kept bullet and under a dropped bullet.

## Findings

### Low

1. **`REPORT.md` still describes the round-1 implementation.** Its summary lists correlative, subordinator, gerund, serial-list and quote-kind heuristics, "one or more trailing" clauses, and line-wise preservation of list items. Round 2 has none of these: it narrows only the last clause and always re-flows a narrowed list item onto one line. The evidence in the report is still valid, because round-1 and round-2 output is byte-identical on all 67 pinned files (verified above). Before closing the item, add a short round-2 note to the report, or rewrite its summary paragraph, so the ledger describes the code that ships.
2. **New fail-closed throw where `origin/main` silently dropped content.** On `origin/main`, a bullet naming an excluded path that was followed by an indented fence naming it too was dropped whole, fence included. With the fence break, the fence survives and the scrub throws. This is intended, is consistent with "fenced lines bypass every removal", and is tested. It has no production effect: bytes are pinned, so a future re-pin with this shape fails `npm test` and the build before anything is served. I record it only so the behavior change is visible.

### Nit

1. **Unbalanced emphasis after a cut.** `stripTrailingExcludedOrClause` detects a terminator only when the sentence's last character is `.`, `!` or `?`. A sentence that ends in closing marks, such as `**Use \`/api/partners\` or \`POST …\`.**`, narrows to `**Use \`/api/partners\``: the emphasis is left unbalanced and the period is lost. This is cosmetic with no leak, inside the orchestrator's out-of-scope grammar class, and absent from the current corpus. Mentioned only for a future re-pin.
2. **Redundant corpus-test assertions.** `expect(skillMd).not.toContain("/api/partners/match")` and `expect(apiRef).not.toContain("## \`POST /api/partners/match\`")` are already implied by the loop's per-file `mentionedPaths` check and `assertNoNonExposedRefsInText`. Dropping them is optional; they cost three lines.
3. **Synthetic list item 2 copies the real step-4 shape.** It duplicates the corpus test in shape. Keeping it is reasonable because it pins the rule independently of a future re-pin, but one of the two could go if the test file needs trimming.

## Out of scope (per the orchestrator), noted only for completeness

Grammar quality of leftover sentences (e.g. "Either X." after a cut, curly or single quotes, serial lists) does not affect leak safety, because the final guard enforces leak safety regardless. A pre-existing difference also stays out of scope: the scrub's path matcher is case-sensitive with a lookahead, while `emitted-text-guard.mjs` matches by case-insensitive `includes`. This diff does not touch either matcher, and the corpus test now runs both.
