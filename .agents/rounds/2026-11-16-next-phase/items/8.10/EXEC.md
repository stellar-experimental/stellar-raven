# Item 8.10 executor report

Executor: Claude Sonnet (`claude-sonnet-5-5`), branch `np/8.10-audit-8.9`. Documentation only: no file
under `src/`, `test/`, `eval/lib/`, `scripts/*.mjs` or any generated file changed. No subagent, no
model call, no case file opened.

## Changes per file

- `eval/qa/README.md` (F1): Codex table row replaced with the brief's text; two clauses in "What the
  guard does not stop" reworded as named.
- `.agents/model-roster.md` (F2): `--dangerously-bypass-hook-trust` after `--no-daemon` in the Codex
  launch line; the Codex bullet says what the flag does, plus one sentence on Antigravity and Grok.
- `.agents/rounds/2026-11-16-next-phase/briefs/ITEM-LEAD.md` (F2): same flag on its Codex launch line.
- `scripts/README.md` (F3): entry for `find-uncited-golden-round-json.mjs` after the `agent-hooks` line.
- `.agents/TODO.md` (B1): eight items deleted; decision 5 deleted and decision 6 renumbered to 5;
  Priorities point 4 rewritten (timers sentence kept word for word); the case-file move item's first
  paragraph reworded; "Align the skill scrub with the emitted-text guard" added where the scrub item
  was; "Decide whether `partialRecoverySource` stays" added where the register item was. No frozen
  anchor sits on a `-` line of `git diff origin/main`.
- `.agents/rounds/2026-11-16-next-phase.md` (B2): one row for item 8.9 after the 8.8 row.
- `AGENTS.md`, `.agents/skills/golden-truth/SKILL.md`, `.agents/README.md` (B3): hook wording and the
  `hooks.json` row.
- `usage/README.md` (B4): intro reworded and the `raven-data/qa` row added; the two existing rows
  unchanged.
- `.agents/rounds/2026-11-16-next-phase/DECISIONS.md` (B5): "Follow-up answers" section before
  `## Timing`, quotes verbatim.

## Gates (each bare, one per call)

- `npm run typecheck`: exit 0.
- `npm test`: exit 0 (173 files passed, 5 skipped; 4165 passed, 3 expected fail, 5 skipped).
- `npm run build`: exit 0 (wrangler dry run).
- `npm run secrets:scan -- --tree`: exit 0 ("clean — scanned all tracked files").

Other checks: no deleted heading remains; the `Claude Code hook|covers Claude Code only` search over
the named files finds nothing; the files that the new links point to exist.

## Deviations

- Partial-recovery item: `rg` confirmed both function names and both `research/` paths. One fact
  differed slightly: `partialRecoverySource` calls `isHarnessTransportFailure`, and the test file
  also tests that function directly. I wrote "have one caller outside their own file and test" in
  place of "have one caller".
- `golden-truth/SKILL.md`: the replacement made the line long, so I re-wrapped the three lines of
  that one paragraph. No other text changed.
- `model-roster.md`: I put the new Codex sentences at the end of the Codex bullet, not after its first
  sentence, so "Its `workspace-write` sandbox" still refers to Codex.
- Ledger row: "TODO items closed" says "the eight deleted in the TODO" because the row has no B1 list.

## Second task (F4)

Edits (each adds a one-line comment above the test and `{ timeout: 30_000 }` as the options argument; nothing else changed):

- `test/qa-paired-verdict.test.mjs:1322-1323`: "runs reduced deterministic operating-characteristic gates under npm test".
- `test/find-uncited-golden-round-json.test.mjs:233-234`: the `it.skipIf(...)` test "never leaks file content or case filenames across all CLI output modes and honors --check".

Gates:

- `npx vitest run test/qa-paired-verdict.test.mjs test/find-uncited-golden-round-json.test.mjs`: exit 0 (2 files, 149 tests passed).
- `npm run typecheck`: exit 0.
- `npm test`: exit 0 (173 files passed, 5 skipped; 4165 tests passed, 3 expected fail, 5 skipped; 18.03 s).
- `npm run secrets:scan -- --tree`: exit 0 (clean).

## Third task

Model: Claude Sonnet 5.5. Commit A and commit B, not pushed.

### A. Codex launch line in the five dated lead briefs (commit cf24029d)

- Added `--dangerously-bypass-hook-trust` directly after `--no-daemon` in `2.1-LEAD.md`,
  `2.2a-LEAD.md`, `2.2b-LEAD.md`, `2.2c-LEAD.md` and `rehearsal-LEAD.md` under `items/1.4/dated/`.
  One line changed in each (5 insertions, 5 deletions). Each file had exactly one
  `codex --no-daemon` line; the `rg -c` check printed 1 for each.

### B. Delete `partialRecoverySource` and `isHarnessTransportFailure`

- `eval/qa/diagnostic-rejudge-source.mjs`: 158 to 86 lines (72 deleted). Both functions and their
  doc comments are gone. No import became unused, so none was removed. `diagnosticRejudgeSource`
  and `diagnosticAnswerProblem` are unchanged.
- `test/diagnostic-rejudge-source.test.mjs`: 317 to 163 lines (2 insertions, 156 deletions). Removed
  the two imports, `partialFixture`, the accepting test (1) and the twelve rejection cases (12).
  That is 13 tests: 44 before, 31 after. In the "optional transport details" test I removed the
  two `expect(isHarnessTransportFailure(failure)).toBe(true)` lines and kept its
  `diagnosticRejudgeSource` assertions. The `describe` that held the removed tests and the
  `diagnosticAnswerProblem` classification test is now named "answer-problem classification";
  the classification test is unchanged.
- `.agents/TODO.md`: deleted the item "Decide whether `partialRecoverySource` stays" (16 lines,
  its heading to the line before the next heading). Nothing else there changed.
- `research/` is untouched; its `orchestrate.mjs` keeps an import that no longer resolves.
- `rg --hidden -g '!.git' -n 'partialRecoverySource|isHarnessTransportFailure' eval test scripts src .agents/TODO.md`:
  no match (exit 1). Before the edit the names appeared only in the three files above.

### Gates

- `npx vitest run test/diagnostic-rejudge-source.test.mjs`: exit 0 (1 file, 31 tests passed).
- `npm run typecheck`: exit 0.
- `npm test`: exit 0 (173 files passed, 5 skipped; 4152 tests passed, 3 expected fail, 5 skipped;
  4165 before, 13 fewer).
- `npm run build`: exit 0.
- `npm run eval:selftest`: exit 0 ("all checks passed").
- `npm run secrets:scan -- --tree`: exit 0 (clean).

No test pinned a hash of `eval/qa/*.mjs`.

### Deviations

- The two `isHarnessTransportFailure` asserts inside a `diagnosticRejudgeSource` test were removed
  with the function; the test itself stays. The brief said to keep every `diagnosticRejudgeSource`
  test unchanged, and this is the one place it could not be literal.
- The `describe` rename above.
- I ran `npm run typecheck` once through a pipe by mistake, then reran it bare; the exit code above
  is from the bare run. The other gates ran bare with output sent to a scratch log.
