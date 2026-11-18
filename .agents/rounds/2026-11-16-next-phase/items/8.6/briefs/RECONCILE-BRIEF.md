# Item 8.6 reconcile brief (executor)

Reconcile every finding in `items/8.6/CODEX-REVIEW.md` (Codex `gpt-6.2-sol`, high, verdict CHANGES)
plus the lead's two nits below. The lead adopts all of them. Same rules as EXEC-BRIEF.md (no model call;
`claude auth status --json`, `codex login status`, `--help` reads and `grok usage --help` are free;
check that a command makes no model call before you run it; never print a status body).

1. **Blocking: alternate endpoint.** `assertClaudeSubscription` also refuses when the environment it
   is given has a non-empty `ANTHROPIC_BASE_URL` (and any other base-URL or provider switch that
   `claude --help` or the CLI's env handling names, if you can verify it offline). Fixed refusal text,
   never the value. Test: a loopback base URL with a `claude.ai` status refuses. Note in EVALS.md that a
   base URL set through a settings file is not seen by the check unless that settings source is loaded
   by the probe (finding 2 makes the probe load the same sources as the child).
2. **Probe with each child's configuration.** Let the function take `cwd` and `args` (extra flags passed
   to `auth status`). Verify offline that `claude auth status --json` accepts the flags each child uses
   (`--setting-sources ""`, `--disable-slash-commands`, `--safe-mode`, `--strict-mcp-config`); pass
   only the ones it accepts and say which in EXEC.md. Answering children (run-qa, discovery): the
   neutral cwd and `answeringAgentIsolationArgs(...)` with their spawn env. Judges: `buildJudgeEnv(env)`
   and the judge's cwd. If a flag is rejected by `auth status`, record it and probe without it.
3. **Fixed messages.** Known `authMethod` values (`api_key`, `oauth_token`, `third_party`, missing) get
   fixed text; anything else gets one fixed fallback. Never interpolate the value. Test with an
   unexpected value that matches the old regex (for example `sk-test-abc`).
4. **Preflight once, before any paid call.** Move the call out of `attestRejudgeIdentity`,
   `attestP6SelfTestIdentity` and `attestJudgeSelfTestIdentity`. Call it once per paid entry point
   before its first model call: run-qa main, discovery `runPaidDiscovery`, re-judge's paid main path,
   the p6 wrapper main, the directly invocable judge self-test candidate entry, and the Playground eval
   judge half. Never in a finalizer or post-call attestation. Binary and environment identity checks
   stay where they are. Update the tests that injected `claudeSubscriptionImpl` accordingly.
5. **Guard coverage.** Add `AI.run(` (any receiver, e.g. `env.AI.run(`), `require("ai")` and
   `require("@ai-sdk/…")`, and imports of `agents/models/ai-sdk` (and other `agents/models/` provider
   integrations you can see in `node_modules/agents`), and scan `.github/workflows/*.yml|yaml`. One
   fixture per new form. Keep the held-out exclusions. Check the tree still matches only the allowlist.
6. **Grok and Codex before inference.** In EVALS.md "Pre-run billing checks": every CLI's launch
   environment has no provider API key (Claude: enforced; Codex: `OPENAI_API_KEY`, `CODEX_API_KEY`; Grok:
   `XAI_API_KEY`; name only variables you verified offline from help text or docs). For Grok, if
   `grok usage` (check its help first) prints the plan without a model call, require it before a paid
   lane; otherwise require that the operator establishes the SuperGrok login before launch and that
   `XAI_API_KEY` is unset. Mirror one line in the roster's Grok bullet.
7. **Nits (Codex).** Roster: `--standalone` in both OpenCode fragments. `eval/playground/README.md:63-66`:
   describe the log IDs as identities of the answer's provider calls (no Gateway judge exists).
   `references/source-addition.md`: name the explicit `--judge-model` and `--allow-non-identical`
   flags `re-judge.mjs` needs when the judge family changes (check the exact flag names).
8. **Lead nits.** `eval/qa/README.md`: drop "(round item 8.6)" (docs describe current behavior). In
   `eval/EVALS.md`, the three trailing lines after the old rules ("When a round establishes an upstream
   defect…", "Record problems…", "The improvements workflow…") now sit under "Model-call billing";
   move the new section after them so they stay with the evaluation rules.

Re-run all five gates bare and the `dist/server.js` byte comparison. Commit (normal hooks, your exact
model name in the trailer). Append a "Reconciliation" section to EXEC.md: each finding, what changed,
gate counts. Commit it, then report the EXEC.md path to the lead.
