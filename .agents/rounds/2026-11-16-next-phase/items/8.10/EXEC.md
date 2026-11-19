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
