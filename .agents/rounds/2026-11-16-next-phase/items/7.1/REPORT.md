# Item 7.1 report: keep agents out of the case folders

Lead: Claude Opus 5.5, agentpc `t1wn`, 2026-11-17. Branch `np/7.1-case-search-guard`.

## Pull request and result

- PR: https://github.com/stellar-experimental/stellar-raven/pull/478 (no issue tracks it, so no
  `Refs`). CI status is in the "CI" line at the end.
- **Decision** ([PLAN.md](PLAN.md)): (b) parent-folder `.ignore` files + (c) a Claude Code hook +
  (a) one AGENTS.md rule + (e) aggregate-only runners, plus a case-text ratchet. (d), encrypting or
  moving cases, is rejected.
  - Two independent assessors decided the options: Fable ([ASSESS-FABLE.md](ASSESS-FABLE.md)) and
    Sonnet ([ASSESS-SONNET.md](ASSESS-SONNET.md)).
  - Each point where I differ from either assessor is reasoned in PLAN.md.
  - Key measurement: a root `.ignore` leaks (`rg X eval`, `rg X .agents`); the parent-folder layout
    does not.
- **Reviews.**
  - Fable plan review: 1 blocker and 12 findings, all reconciled.
  - Required Codex frontier review (`gpt-6-astra`, high): FAIL with 7 major and 1 minor
    ([CODEX-REVIEW.md](CODEX-REVIEW.md)).
  - Codex re-check: FAIL with 3 major and 1 minor ([CODEX-RECHECK.md](CODEX-RECHECK.md)).
  - All twelve Codex findings are fixed with tests. I verified the re-check reproducers myself and
    did not run a third Codex pass.
  - Scope principle, written into the hook and the README: the hook stops accidental, ordinary
    command forms. A deliberate bypass is out of scope.
- **Live probe:** under `--dangerously-skip-permissions`, a Claude child in the worktree was denied
  `grep -r` and `rg -g '*.json' … eval`.
- **Gates**, run bare by the lead on the final tree, all exit 0:
  - typecheck;
  - `npm test`: 173 files, 4045 tests;
  - build;
  - `eval:selftest`;
  - `eval:routing -- --gate`: GATE PASS, with 0 of 81 holdout and protocol-history ids in stdout
    and stderr;
  - `secrets:scan -- --tree`.

  The QA lint was not run. No model-calling eval; the one probe was a model call.
- **Not done: flushing the golden-round JSON.** The Fable review found that the corpus cites 24 of
  the 109 files as per-case provenance, so only 84 could go. Squash merge would also have put the
  deletion diff in the code commit. Proposal below.
- **Data flushed (outside git):** the main checkout's ignored `tmp/fp/`, `tmp/agentic/` and
  `tmp/size-audit/` (12 GB; per-case FP round data that no archive held).
  - Archived to `~/backups/raven-next-phase/7.1-main-tmp-2026-11-17.tar.zst` on agentpc (mode
    600), with a source manifest.
  - Verified file by file (6,958 files and 1 symlink), then removed.
  - Details: [DISPOSITION.md](DISPOSITION.md).

## Deploy

**Not needed.** `src`, `catalog`, `wrangler.jsonc`, `public` and the package files are unchanged
against `131c6c1c`. Nothing in the change is model-facing.

## For the orchestrator on the Mac

1. **Before pulling `main` after the merge**, check `ls -a .claude/` in each Mac checkout.
   - The PR commits `.claude/settings.json`.
   - An untracked file at that path would block the checkout.
   - A local hook config would merge with the committed one.
2. **Replace the search line in 7-COMMON for 7.2 and 7.3.** The hook now denies a plain
   `git grep … -- ':!eval/qa' ':!eval/corpus'`, because it lacks the other exclusions. Use instead:
   "Search with `rg --hidden -g '!.git' <pattern> [path]`; never `grep -r`, `git grep`, or
   `rg -u`/`--no-ignore` (AGENTS.md)".
3. Worktrees branched before the merge have no hook. Start 7.2 and 7.3 from `origin/main` after the
   merge.
4. If the Mac checkout has a `tmp/fp/`, it holds the same kind of per-case data. The same
   archive-then-remove treatment applies (DISPOSITION.md).
5. The hook runs on every Bash call in every Claude session in this repository, including yours.
   - Cost: one Node start, about 25 to 40 ms.
   - Routine scoped `grep -r` is denied, by design; use `rg X src`.

## Proposals (not done here)

1. **Golden-round JSON flush, as a ledger-only PR.** Remove the 84 JSON intermediates that no
   current artifact cites. Build the list with a committed token-only script that also searches the
   case folders. Reviewers read `--stat` only.
2. **Move `eval/qa/cases.json`, `sample.json` and `tool-cases.json` into `eval/qa/compiled/`.** That
   closes the `rg -g '*.json'` file-entry hole for non-Claude lanes at the source. It touches about
   30 references and the paths the dated runs read, so do it after 2026-11-23.
3. **Codex hook wiring.**
   - Codex 0.169 has a Claude-shaped `PreToolUse` deny contract, so the same script may serve.
   - The payload field names are unverified.
   - Grok 1.0.88 has a hook dispatcher, not investigated.
4. **Install ripgrep on agentpc.** A plain `bash -c` has no `rg` here; Codex ships its own. This
   needs sudo.
5. Already in TODO: move the `gca-eval` stored results out of the worktree.

## Open questions for the owner

None.

## CI

All checks pass on #478: `test` (2m24s; includes the real-ripgrep layout test, which fails rather than skips in CI), `secrets`, CodeQL.
