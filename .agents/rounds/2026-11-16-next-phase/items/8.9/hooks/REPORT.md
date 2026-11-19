# Item 8.9, lane `hooks` — Report

- **Branch:** `np/8.9-hooks`
- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/505
- **Author:** Gemini 4 Neon (Antigravity `1.5.12`, high effort)
- **Independent reviewer:** Claude Opus 5.5 (`agy --model claude-opus-5-5 --effort high`), [REVIEW.md](./REVIEW.md) — **PASS WITH NOTES** (0 blockers, 0 majors, 4 minors, 6 nits)
- **Worker bytes changed:** **No** (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty; no deploy needed).
- **TODO item:** "Wire the case-search guard into Codex and Grok" (plus Antigravity per `orch/8.9-LANES.md`). Meets the item's done criterion ("each CLI denies the hook's probe set in a live probe, or this item records why one cannot"): Grok (`1.0.88`) and Antigravity (`1.5.12`) denied the probe set live; Codex (`0.169.0`) is wired and schema/subprocess-verified, and its untrusted-worktree trust gate is recorded below. Recommend either closing the item or keeping a small follow-up for a live Codex probe once the owner trusts the worktree root / approves the hook (see Open questions, m1).

## What changed

1. **`scripts/agent-hooks/case-search-guard.mjs`**
   - Normalized `PreToolUse` stdin payloads (`parsePayload`) and stdout responses (`formatOutput`, `denyOutput`) across four CLIs:
     - **Claude Code (`2.1.328`) & Codex (`0.169.0`)**: snake_case `tool_name` / `tool_input` (`Bash`, `Grep`), `hookSpecificOutput.permissionDecision: "deny"` JSON on deny, empty stdout on allow. Also handles all-string argv arrays for `tool_input.command` (review n2).
     - **Grok (`1.0.88`)**: camelCase `toolName` (`run_terminal_command`, `Shell`, `grep`), `toolInput`, `workspaceRoot`, tool-level working-directory overrides (`working_directory`, `cwd`), built-in grep glob/path keys (`glob`, `glob_pattern`, `path`, `target_directory`), and conservative deny when `toolInputTruncated === true` on a guarded tool.
     - **Antigravity (`1.5.12`)**: `toolCall.{name,args}` (`run_command` with `CommandLine`/`Cwd`, `grep_search` with `Includes`/`SearchPath`), `{"decision":"deny","reason":"..."}` on deny, and empty stdout on pass-through (`{}` falls back to proto3 `allow_tool=false` and denies all calls).
   - Remains Node built-ins only, fail-open on parse/internal error, and blocks without rewriting.
2. **Per-CLI project hook configs**
   - `.codex/hooks.json` (`PreToolUse`, matcher `Bash`, `node "$(git rev-parse --show-toplevel)"/scripts/agent-hooks/case-search-guard.mjs`, timeout 5 s).
   - `.grok/hooks/case-search-guard.json` (`PreToolUse`, matcher `Bash|Grep`, `node "$GROK_WORKSPACE_ROOT"/scripts/agent-hooks/case-search-guard.mjs`, timeout 5 s). Keeps Grok guarded even when `[compat.claude] hooks = false`; Grok also loads `.claude/settings.json` when Claude compatibility is enabled.
   - `.agents/hooks.json` (named hook `case-search-guard`, `PreToolUse`, matcher `run_command|grep_search`, `node ../scripts/agent-hooks/case-search-guard.mjs`, timeout 5 s; Antigravity runs hook commands from the directory containing `hooks.json`).
3. **Tests (`test/case-search-guard.test.mjs`)**
   - Added unit tests for Grok/Antigravity tool shapes, argv-array commands, tool-level cwd overrides, `toolInputTruncated`, and `parsePayload`/`formatOutput` across all four CLIs.
   - Added subprocess tests for Grok and Antigravity payloads (including pinning empty stdout on Antigravity allow).
   - Added wiring tests checking all four config files are valid, tracked, not gitignored, and actually execute end-to-end via `sh -c` under each CLI's runtime cwd and env (`CLAUDE_PROJECT_DIR`, subdirectory cwd for Codex's `git rev-parse --show-toplevel`, `GROK_WORKSPACE_ROOT`, and `.agents/` cwd for Antigravity).
4. **Docs (`eval/qa/README.md`, `scripts/README.md`)**
   - Documented all four wired CLIs, their contracts, live-probe status, Codex/Grok trust prerequisites, fail-open on startup failure, and unverified `.ignore` handling for built-in grep tools.

## Live probes (subscription logins, no API keys)

Pre-run billing checks (`eval/EVALS.md` "Model-call billing"): `codex login status` printed `Logged in using ChatGPT`; `OPENAI_API_KEY`, `XAI_API_KEY`, `ANTHROPIC_API_KEY`, and `GEMINI_API_KEY` were all unset. Probe token `HOOK_PROBE_CANARY_89` matches no repository file.

| CLI (installed version) | Model ID | Launch / login | Result |
|---|---|---|---|
| **Grok** (`grok 1.0.88`) | `grok-4.7` (reported in `modelUsage` as `grok-4.7-build`) | `grok --model grok-4.7 --always-approve --output-format json -p …` (SuperGrok login, `projectTrusted: true`) | **4/4 PASS.** Denied `grep -r HOOK_PROBE_CANARY_89 scripts/agent-hooks` (`rule: recursive grep`); denied `rg --hidden -g '*.json' HOOK_PROBE_CANARY_89 eval` (`rule: positive rg glob that reaches a listed path`); denied built-in `grep` tool with `glob='*.json'`, `path='eval'` (`rule: positive Grep glob that reaches a listed path`); allowed control `grep -n IGNORE_FILES scripts/agent-hooks/case-search-guard.mjs` (exit 0). |
| **Antigravity** (`agy 1.5.12`) | `gemini-4-neon` | `agy --model gemini-4-neon --effort low --dangerously-skip-permissions --output-format json --print-timeout 0 -p …` | **Initial probe caught bug, fixed and re-verified live (3/3 PASS).** Initial probe denied both restricted commands (`recursive grep`, `positive rg glob that reaches a listed path`) AND denied the control command with empty reason because `{}` defaulted proto3 `allow_tool` to `false`. Changed pass-through to empty stdout (`""`) and verified live in the Antigravity 1.5.12 session (and independently confirmed by the Claude Opus 5.5 reviewer in its own Antigravity session): both restricted commands denied with full reason, control allowed with exit 0. |
| **Codex** (`codex-cli 0.169.0`) | `gpt-6.2-sol` | `codex --dangerously-bypass-hook-trust -c 'projects."/home/tyler/code/raven-wt/np-8.9-hooks".trust_level="trusted"' exec -m gpt-6.2-sol -c 'model_reasoning_effort="low"' -s read-only --json …` (ChatGPT login) | **Not loaded in untrusted worktree (trust gate).** Codex rejected the session-flag override (`session-flags: projects."/home/tyler/code/raven-wt/np-8.9-hooks" is ignored`) and skipped `.codex/hooks.json`, so all 3 commands ran unblocked (`exit 1`, `exit 1`, `exit 0`). Verified offline from the 0.169.0 binary: `.codex/hooks.json` matches Codex's `pre-tool-use.command.{input,output}` JSON schemas, and Codex enforces two separate gates — folder trust persisted in `~/.codex/config.toml` (`trust_level = "trusted"`, only set for `/home/tyler/code/stellar-raven-codemode`, not `raven-wt/*`) plus per-hook approval via `/hooks` (`hooks.state."...".trusted_hash`) or `--dangerously-bypass-hook-trust`. Host config `~/.codex/config.toml` was not modified. |

## Model calls made

1. **Codex (`codex-cli 0.169.0`, `gpt-6.2-sol`, ChatGPT subscription):** one live PreToolUse hook probe (above).
2. **Grok (`grok 1.0.88`, `grok-4.7` / `grok-4.7-build`, SuperGrok subscription):** one live PreToolUse hook probe (above; reported `$0.206566` equivalent on subscription).
3. **Antigravity (`agy 1.5.12`, `gemini-4-neon`, subscription):** one live PreToolUse hook probe (above).
4. **Antigravity (`agy 1.5.12`, `claude-opus-5-5`, high effort, subscription):** independent code review of PR #505 ([REVIEW.md](./REVIEW.md); `status: SUCCESS`).

No AI Gateway, Workers AI, or provider-API calls were made.

## Gates (final tree, all run bare)

| Gate | Exit code | Result / counts |
|---|---|---|
| `npm run typecheck` | 0 | Clean (`tsc --noEmit`) |
| `npm test` | 0 | 177 passed \| 5 skipped (182 files); 4301 passed \| 3 expected fail \| 5 skipped (4309 tests); `test/case-search-guard.test.mjs` 275/275 |
| `npm run build` | 0 | Dry-run bundle clean (`Total Upload: 6918.57 KiB / gzip: 1375.14 KiB`) |
| `npm run secrets:scan -- --tree` | 0 | Clean |
| `npm run eval:selftest` | 0 | All checks passed |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 error(s), 98 warning(s) |
| `npm run eval:qa:register -- --check` | 0 | `[register-helper] up to date` |

## Independent review and reconciliation

- **Reviewer:** Antigravity `claude-opus-5-5`, high effort (differs from author `gemini-4-neon` and orchestrator; no matched tier skipped).
- **Verdict:** **PASS WITH NOTES** (0 blockers, 0 majors, 4 minors, 6 nits) in [REVIEW.md](./REVIEW.md). The reviewer also live-verified `.agents/hooks.json` inside its own Antigravity session (`grep -c zzqq $(echo README.md)` denied with `rule: command-substitution file list`, normal commands passed).

| ID | Severity | Disposition | Action / reason |
|---|---|---|---|
| m1 | minor | Accepted | Recorded Codex's two-layer trust gate and practical consequence (no Codex `raven-wt/*` worktree lane is guarded until trusted + approved or launched with `--dangerously-bypass-hook-trust`) here and in Open questions for the orchestrator. |
| m2 | minor | Accepted (handoff) | `AGENTS.md:211-212` and `.agents/skills/golden-truth/SKILL.md:21` are outside lane `hooks`'s file list; listed under Open questions for the orchestrator. |
| m3 | minor | Accepted (fixed) | Updated `scripts/agent-hooks/case-search-guard.mjs` header comment to say Antigravity pass-through is empty stdout (`{}` would deny via proto3 `allow_tool=false`). |
| m4 | minor | Accepted (fixed) | Added unverified `.ignore` handling for Grok `grep` and Antigravity's in-process fallback to `eval/qa/README.md` ("What the guard does not stop"). |
| n1 | nit | Accepted (handoff) | `.agents/README.md` is outside lane `hooks`'s file list; listed under Open questions for the orchestrator. |
| n2 | nit | Accepted (fixed) | Hardened `extractCommand` to join all-string argv arrays (shell-quoting tokens with metacharacters) and added unit tests. |
| n3 | nit | No action | Grok running both `.grok/hooks/` and `.claude/settings.json` when Claude compat is enabled is harmless and documented. |
| n4 | nit | Accepted (fixed) | Removed speculative `SearchPathUri` and `workdir` fallbacks per `AGENTS.md` "Forward-only". |
| n5 | nit | Declined | Multi-layer test assertions (unit `decide`, `parsePayload`, subprocess, end-to-end config shell command) each cover a distinct failure mode. |
| n6 | nit | Accepted (fixed) | Added one parenthetical in `eval/qa/README.md` noting that a hook that cannot start also fails open in every CLI. |

## Open questions / orchestrator follow-ups

1. **Codex trust & live verification (m1):** Because `~/.codex/config.toml` only trusts `/home/tyler/code/stellar-raven-codemode` (not `raven-wt/*` worktrees) and Codex requires per-hook trust (`/hooks` or `--dangerously-bypass-hook-trust`), `.codex/hooks.json` guards no Codex worktree lane today. After merging PR #505, the owner/orchestrator should decide whether to (a) run one live probe in `/home/tyler/code/stellar-raven-codemode` with `--dangerously-bypass-hook-trust` (or after `/hooks` trust), and (b) add `--dangerously-bypass-hook-trust` (and trusted worktree root policy, if desired) to `.agents/model-roster.md`, or keep the Codex half of the TODO item open until then.
2. **Out-of-lane doc updates (m2, n1):** Update `AGENTS.md:211-212` ("A Claude Code hook denies these; Codex and Grok lanes rely on this rule"), `.agents/skills/golden-truth/SKILL.md:21`, and `.agents/README.md` (add `hooks.json` row) to reflect the four-CLI guard wiring.
