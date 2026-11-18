# CHANGES

Reviewed `origin/main...HEAD` at `3e490ec5...6525649c`.

1. **Blocking — Claude can pass the subscription check with an overridden model endpoint.**
   `eval/lib/harness-guards.mjs:107` and `:121` only check account authentication. With Claude
   Code 2.1.327, setting `ANTHROPIC_BASE_URL` to a synthetic loopback address still gave exit 0,
   `authMethod: claude.ai`, and a subscription type. The installed CLI uses that variable as an
   API base override. The six callers preserve it if inherited, so an authenticated account can
   pass the check while inference routes through a separately billed gateway or proxy.
   Require the standard first-party model endpoint in the effective launch configuration and add
   a refusal test for an alternate endpoint. The auth-status probe made no model call.

2. **Should — The auth probe uses a different Claude configuration from the answering child.**
   `eval/qa/run-qa.mjs:1797` and `eval/discovery/run-agent-discovery.mjs:472` run the probe in
   the runner's directory with default setting sources. The answering children use neutral
   directories and disable setting sources
   (`eval/qa/run-qa.mjs:836`, `:849`, `:1981`, `eval/discovery/run-agent-discovery.mjs:222`,
   `:478`, and `eval/lib/harness-guards.mjs:81`). In a temporary project with a synthetic
   Bedrock setting, Claude's status changed from `third_party` with default options to
   `claude.ai` with `--setting-sources ""`. The current check can refuse an isolated
   subscription answering run based on settings only the probe loads. Probe answering and
   judging in their respective working directories with the flags and environment each launch
   uses. The judge spawn adds its timeout and retry environment values
   (`eval/qa/judge.mjs:629`, `:753`).

3. **Should — An unexpected auth status value can reach the error output.**
   `eval/lib/harness-guards.mjs:121-125` interpolates any short lowercase token matching the
   regex. The privacy test at `test/qa-harness-preconditions.test.mjs:685-695` uses a sentinel
   containing a space, which the regex rejects. A synthetic hyphenated secret in the same
   field appeared verbatim in the thrown error. Use fixed messages for known auth method
   values and one fixed fallback. Test an unexpected value that matches the existing regex.

4. **Should — The new preflight runs again after model calls and can discard paid evidence.**
   `eval/qa/run-p6-judge-self-test.mjs:108` puts the probe inside identity attestation, which
   runs 16 times for a complete seven-candidate wrapper run (`:222-239`).
   `eval/qa/judge.mjs:1025` adds two more probes per candidate (`:1064-1074`), for 30 probes
   total. If the post-call status probe times out, the candidate throws before returning the
   paid call record. Re-judge similarly reruns the probe in its finalizer
   (`eval/qa/re-judge.mjs:277`, `:328-355`) and can mark completed work
   `attestation-failed` on a status command failure. Run the subscription check as an explicit
   preflight for each paid entry point, including the directly invocable candidate, and keep
   binary and environment identity checks around the calls.

5. **Should — The billing guard misses common direct Workers AI and SDK calls.**
   `test/model-call-billing.test.mjs:17-40` flags the Gateway binding and its REST endpoint
   but misses `env.AI.run(...)`, `require("@ai-sdk/openai")` in an admitted CommonJS file,
   and an import of the installed `agents/models/ai-sdk` integration. It also skips direct
   commands in GitHub Actions YAML. In-memory fixtures for all four returned zero matches,
   while a control shell fixture with a provider endpoint was flagged. Add these obvious
   forms and workflow YAML to the scan, with a fixture for each. Preserve the held-out
   exclusions. I found no current unlisted model caller in the paths reviewed.

6. **Should — The Grok row defers billing verification until after inference.**
   `eval/EVALS.md:68-74` requires a check before a paid lane, but tells Grok operators to
   record billing mode on the first run. The Grok launch line at `.agents/model-roster.md:68`
   inherits its environment without a check, and the installed Grok binary recognizes
   `XAI_API_KEY`. Require a known subscription login and an API-key-free launch environment
   before any model request. Use a verified no-model command if available or require the
   operator to establish the subscription login before launching.

7. **Nit — Align the launch and accounting examples with the new policy.**
   `.agents/model-roster.md:43` shows `--standalone` in the OpenAI launch fragment and
   omits it in the xAI fragment, while `eval/EVALS.md:77-79` requires it on every command.
   Show it in both. `eval/playground/README.md:63-66` still describes a current judge
   sharing the answer's Gateway. Describe the log IDs as identities for the answer's
   provider calls. In `.agents/skills/run-evals/references/source-addition.md:12-14`, mention
   the explicit `--judge-model` and `--allow-non-identical` required when changing the
   judge family (`eval/qa/re-judge.mjs:1015-1029`).

## Verification

- 98 focused tests passed across the billing guard, QA subscription and refusal fixtures,
  P6 wrapper, discovery guards, and selected re-judge identity and dry-run tests.
- The receipt helper copies the original validation code. The historical reader imported
  successfully, accepted a synthetic `gateway-rejudge-v1` receipt, and refused a mismatched
  frozen configuration. No live imports of the deleted producer files surfaced. Remaining
  filename references were in dated records.
- `git diff --check origin/main...HEAD` passed. The Playground check is before the first
  paid answer request and is skipped for `--no-judge`. Review used synthetic fixtures and
  offline CLI checks. Model-call spend was USD 0.
