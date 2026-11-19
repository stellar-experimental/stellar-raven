# Review: item 8.9, lane `hooks` (PR #505, `np/8.9-hooks` @ `f2aa29b2`)

Reviewer: Antigravity, Claude Opus 5.5 (high effort). Independent of the author (Gemini 4 Neon) and
the orchestrator. No model calls were made. No files changed except this one.

Scope: `git diff origin/main...HEAD` (7 files, +483/−64) checked against the TODO item "Wire the
case-search guard into Codex and Grok", the `hooks` section of `orch/8.9-LANES.md` (adds
Antigravity), and `AGENTS.md`.

## Verdict: **PASS WITH NOTES**

The wiring is correct for all four CLIs. The payload normalization keeps the guard's
fail-open-on-error and deny-when-scope-is-unknown behavior. The new deny for a truncated Grok input
fails closed in the right place. Tests and CI are green. Nothing blocks the merge. Fix the two
documentation findings (m2, m3) before merge, or hand them to the orchestrator. Carry m1 into
REPORT.md and the TODO.

## What I verified independently

| Check | Result |
|---|---|
| `npx vitest run test/case-search-guard.test.mjs` | 275/275 pass |
| `gh pr checks 505` | all green (test, secrets, CodeQL) |
| **Antigravity live (this session, agy 1.5.12):** a harmless `run_command`, `grep -c zzqq $(echo README.md)`, at the worktree root | **Denied** by the pre-tool hook (`rule: command-substitution file list`). Every other `run_command` in this session ran through the hook's empty-stdout pass-through. So the `.agents/hooks.json` load, the `run_command\|grep_search` matcher alternation, the `../scripts/...` cwd assumption, the deny JSON and the empty-stdout allow all work live. |
| Antigravity contract (`agy-customizations/docs/hooks.md`) | Named top-level hook key, grouped `PreToolUse` with `matcher`. `sh -c` runs from the directory holding `hooks.json`. The input is `toolCall.{name,args}` plus `cwd`/`workspacePaths`, and the output is `{decision, reason}`. The diff matches all of this. The `grep_search` arg names `SearchPath` and `Includes` match the agy binary's tool schema. |
| Codex 0.169.0 contract (schema embedded in the binary) | The `pre-tool-use.command.input` schema requires `cwd`, `tool_name` and `tool_input` (typed `any`). The output rejects a `deny` that has no non-empty `permissionDecisionReason`, and the guard always sends one. The `$(git rev-parse --show-toplevel)` command pattern matches OpenAI's documented example (the hook runs via the shell from the session cwd). |
| Grok 1.0.88 contract (docs embedded in the binary) | Project hooks load from `<project>/.grok/hooks/*.json` and need folder trust. `GROK_WORKSPACE_ROOT` is set. A `Bash` matcher also matches `run_terminal_command`. A `toolInputTruncated` input is cut only past 128 KiB, and Grok's docs say a text-checking guard "should deny unless `toolInputTruncated` is false", which is what the diff does. Grok also sets `CLAUDE_PROJECT_DIR`, so the Claude-compat copy of the hook resolves too. |
| AGENTS.md hard rules | No case text opened, no generated file edited, no `src/`/`package*.json`/`wrangler.jsonc` change (Worker bytes unchanged), no secrets. Node built-ins only (that test still passes). |

## Findings

### Blockers
None.

### Major
None.

### Minor

**m1 — Codex was not probed live. Codex worktree lanes stay unguarded.** The TODO's done criterion
is "each CLI denies the hook's probe set in a live probe, or this item records why one cannot". The
PR body and `eval/qa/README.md` give the reason: Codex skips project hooks in an untrusted folder,
and `-c projects.…trust_level` does not override that. The criterion is therefore met through the
"records why" branch, and the Codex wiring rests on the schema and a subprocess test. The practical
consequence needs to be stated, though. `~/.codex/config.toml` trusts only the main checkout
(`/home/tyler/code/stellar-raven-codemode`), not the `raven-wt/*` worktrees where lanes run. Even in
a trusted folder, the hook also needs `/hooks` approval or `--dangerously-bypass-hook-trust`. So
today `.codex/hooks.json` guards **no** Codex lane. Action: say this in REPORT.md. The orchestrator
should keep the Codex half of the TODO open until the owner either trusts the lane worktree root
and approves the hook, or adds `--dangerously-bypass-hook-trust` to the Codex launch line in
`.agents/model-roster.md`, and then runs one live probe. Only the owner can take either step, and
neither is in this lane's file set.

**m2 — `AGENTS.md` now misstates which CLIs are guarded.** `AGENTS.md:211-212` reads "A Claude Code
hook denies these; Codex and Grok lanes rely on this rule." After this PR, Grok in a trusted folder
and Antigravity are hook-guarded, and Codex is guarded only under the trust conditions in m1.
`.agents/skills/golden-truth/SKILL.md:21` ("a Claude Code hook") is incomplete in the same way. The
Definition of done requires documentation that describes current behavior. Both files are outside
the lane's file list, so the orchestrator should make the one-line edit, for example: "A
`PreToolUse` hook (Claude Code, Antigravity, and Grok/Codex in a trusted folder) denies these;
other sessions rely on this rule." The TODO item's text at `.agents/TODO.md:1227-1228` goes stale
too, and the orchestrator handles it at reconciliation.

**m3 — The script header contradicts the code on Antigravity pass-through.**
`scripts/agent-hooks/case-search-guard.mjs` (the "Contracts used" block) says "Antigravity … deny
is … `{"decision":"deny",…}`; pass-through is {} on stdout". The code, the README table and the
test all emit **empty** stdout. Per the PR body, `{}` defaults proto3 `allow_tool` to `false`,
which is the exact bug the live probe caught. A future editor who trusts the header would bring
the bug back. Change it to "pass-through is empty stdout (`{}` would deny via proto3
`allow_tool=false`)".

**m4 — The Grep-tool branches still depend on each tool honoring `.ignore`, and that is
unverified.** For an unglobbed search, the guard allows Grok `grep` and agy `grep_search` and relies
on the tool skipping the `.ignore`-listed paths, the same assumption the Claude `Grep` branch makes.
For agy, the binary bundles ripgrep, which honors `.ignore`. The agy binary also contains "ripgrep
… could not be executed, falling back to in-process search" and an
`ANTIGRAVITY_DISABLE_EMBEDDED_RIPGREP` switch, and nothing confirms that the in-process fallback
honors `.ignore`. I found no `.ignore` handling statement in Grok's embedded docs. Action, one or
the other: add "the agy in-process search fallback, and Grok `grep` if it ignores `.ignore`" to
"What the guard does not stop", or record a one-off probe of an unglobbed search over a fixture
directory. The probe must not touch case paths.

### Nits

- **n1** — `.agents/README.md`'s path table does not list the new `hooks.json` ("Antigravity
  `PreToolUse` hooks; durable").
- **n2** — `extractCommand` returns `null`, and so allows silently, when `command` is not a string.
  Codex types `tool_input` as `any`. If Codex ever sent an argv array, the guard would turn into a
  silent no-op. Cheap hardening: join an all-string array with spaces, or write a stderr line on an
  unexpected shape so the fail-open shows.
- **n3** — Grok loads the native `.grok/hooks/` copy and also the `.claude/settings.json` copy when
  Claude compatibility is on (Grok sets `CLAUDE_PROJECT_DIR`, so both start). That means two node
  processes per guarded call. It is harmless, and the README correctly says why the native copy is
  kept. No action needed.
- **n4** — `extractGrepArgs` reads `SearchPathUri`, which is a step-proto field and not a `grep_search`
  argument. `extractToolCwd` reads `workdir`, which no wired payload uses. Both are harmless
  defensive reads. Drop them, or note in the comment that they are speculative (AGENTS.md
  "Forward-only" discourages shims added only in case).
- **n5** — The test file adds some overlap: the Grok and Antigravity shapes are checked through
  `decide`, again through `parsePayload`, again as a process, and again through the config's own
  command. Each layer catches a different break (field mapping, output format, config path), so
  this is acceptable. The parallel `tests` lane may still want to merge the `decide`-level Grok and
  agy rows into the process-level cases.
- **n6** — If `GROK_WORKSPACE_ROOT` is unset, or `git rev-parse` fails, the hook fails open (node
  cannot find the script and exits with code 1). This matches the documented fail-open
  semantics, but the README could say once that a hook that cannot start fails open in every CLI.

## Fail-open and fail-closed summary (all acceptable)

| Condition | Behavior |
|---|---|
| Parse or internal error in the script | Fails open, writes a stderr line (unchanged) |
| Tool not in `SHELL_TOOLS`/`GREP_TOOLS` | Allowed, including when truncated (correct; `Read` is not guarded) |
| Grok `toolInputTruncated: true` on a guarded tool | **Denied** (fails closed, as Grok's docs advise; happens only past 128 KiB) |
| Hook script cannot start (bad path/env) | Fails open in all CLIs (n6) |
| Codex/Grok folder not trusted | Hook is not loaded (m1; documented) |
| agy allow | Empty stdout (live-verified); `{}` would block every call |
