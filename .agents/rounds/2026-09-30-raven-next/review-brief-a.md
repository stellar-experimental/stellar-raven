# Review brief — PR A (bookkeeping and docs), round raven-next 2026-09-30

You are an independent reviewer. The author and orchestrator is `raven-next` (Claude Fable 5.1).
Review the branch `chore/raven-next-bookkeeping` against `origin/main` (`6dd94394`) in the worktree
`/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/raven-next-a`.

Read `AGENTS.md` and `.agents/rounds/2026-09-30-raven-next.md` first.

## What changed

1. `.agents/rounds/2026-09-30-skill-system-audit.md` — a "PR #184 release receipt" section.
2. `.agents/rounds/2026-09-30-raven-next.md` — the new round ledger with a survey and a ranked list.
3. [`research/agent-model-roster.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/agent-model-roster.md) — runtime facts refreshed to the installed CLIs on 2026-09-30.
4. `improvements/stellar-docs/sd-052-cli-bindings-placeholder-languages.md` — status
   `fixed-upstream` with dated evidence; `improvements/INDEX.md` regenerated.
5. `PLAN.md` §7 and [`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) item 4 — stale pointers corrected.

## What to verify, independently

- Re-derive every runtime fact in the roster from the catalogs on this host, not from the diff:
  `jq` over `~/.codex/models_cache.json` and `~/.grok/models_cache.json`, `grok models`,
  `codex --version`, `claude --version`, `opencode --version`, and `~/.codex/config.toml`.
  Name any id, version, context figure, default, or effort list the roster gets wrong.
- Re-derive the `sd-052` live state: read
  `https://developers.stellar.org/docs/tools/cli/stellar-cli` and `gh pr view 2766 -R
  stellar/stellar-cli`. Say whether `fixed-upstream` is the correct classification under
  `.agents/skills/improvements-pipeline/SKILL.md` step 5, and whether the note about the missing
  external-tool link is right.
- Re-derive the receipt facts: `gh pr view 184 --json mergeCommit,mergedAt,statusCheckRollup` and
  `npx wrangler deployments status` (read-only).
- Check the ranked list for wrong evidence, wrong labels (`simple` versus `needs-decision`), and
  items the survey missed that a reader of `.agents/TODO.md` and [`.agents/NEXT.md`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/NEXT.md) would expect.
- Check every edited sentence for the writing rules in `AGENTS.md` and for claims the diff does not
  support.

Do not edit repository files. Do not post anything upstream. Do not run paid evaluations.

## Output

Write your findings to `tmp/review-a-<your-lane>.md` under the worktree root (the Codex sandbox
cannot write under `.agents/`). Use this shape: a verdict line (`accept`, `accept with fixes`, or
`reject`), then a numbered list of findings, each with the file, the claim, your evidence, and the
fix you expect. End with a short list of things you verified and found correct. Reply in the pane
with only the file path.
