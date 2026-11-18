# Item 8.6 execution report

Executor: Claude Sonnet 5.5 (`claude-sonnet-5-5`), agentpc, 2026-11-18. Branch `np/8.6-subs-first`, based
on `origin/main` at `3e490ec5`. Steps 1 to 8 of [PLAN.md](PLAN.md) are done. Step 9 (the ledger row) is
the lead's. No model call, paid call, Gateway call or Workers AI call. No QA case file opened, no QA lint,
no Wrangler dev server, no subagent. `src/` is untouched (0 files).

Four commits, none pushed, all through the normal hooks:

| Commit | Steps |
|---|---|
| `94a64e70` Remove the AI Gateway judge; keep a frozen reader for stored receipts | 1, 2, 3 |
| `ccf91f1b` Refuse Claude Code paid runs that are not on the claude.ai subscription | 4 |
| `e8398fa0` Subscriptions first: hard rule, billing section, OpenCode probe and roster row | 5, 7, 8 |
| `64f0b246` Guard the subscriptions-first rule with a cheap string test | 6 |

## Per step

1. **DECISIONS.md.** New section "Follow-up answers (2026-11-18, subscriptions first)": the owner's
   instruction verbatim, the standing OpenCode rule quoted from answer 7, and a line that item 8.6 applies
   it. No other part of the file changed.
2. **Frozen reader.** `research/audits/2026-11-06-playground-final-resolution/gateway-receipt.mjs` holds
   verbatim copies of `finiteCost`, `ROW_FAILURES`, `isSettledJudgeRowFailure` and `gatewayJudgeConfig`,
   under the one-line header. `orchestrate.mjs:14` imports it. In
   `test/playground-final-orchestrator.test.mjs` the `prepareGatewayRejudge` import, the plan fixture, the
   `prepare` call, its expectations and the `prepare` throws are gone. The `verifySourceCases` assertions
   stay, and the test no longer says "plans exactly two B calls". The file passes alone (83 tests).
3. **Producer deleted.** `git rm` of `eval/qa/gateway-judge.md`, `gateway-judge.mjs`,
   `gateway-rejudge.mjs` and `test/gateway-judge.test.mjs`. `test/README.md` no longer lists
   `gateway-judge*`. No live file imports a removed path (`rg` over everything outside `.agents/rounds/`
   and `research/`; the remaining `gateway-rejudge-v1` strings in the orchestrator test are receipt schema
   names). [DISPOSITION.md](DISPOSITION.md) has each file's last commit, what covers its job, what covers
   `partialRecoverySource` (the orchestrator test's reject cases call it directly; its accept path runs
   through `validateReceipt` in the `settlePartial` tests) and the inert `freeze-judge-b` / `judge-b`
   bookkeeping.
4. **`assertClaudeSubscription`.** In `eval/lib/harness-guards.mjs`, beside
   `answeringAgentIsolationArgs`. It runs `<claude> auth status --json` with the child's environment and
   throws unless `authMethod === "claude.ai"` and `subscriptionType` is a non-empty string. It refuses a
   spawn error, a non-zero exit and non-JSON output. It returns only those two fields and never repeats
   the status body (the body holds an account email and organization) or an unexpected `authMethod` value
   that is not a short plain token. Called once per paid run, beside the executable identity, in:
   `run-qa.mjs` (after the binary and environment pins), `run-agent-discovery.mjs` (same place),
   `re-judge.mjs` `attestRejudgeIdentity`, `run-p6-judge-self-test.mjs` `attestP6SelfTestIdentity`,
   `judge.mjs` `attestJudgeSelfTestIdentity` (see deviation 2) and
   `scripts/run-playground-semantic-eval.mjs` after the judge executable is resolved (skipped with
   `--no-judge`). The three `attest*` functions take an injectable `claudeSubscriptionImpl`. No environment
   strip; no identity pin moved (the identity-pinning suites pass with only the fixture changes below).
   Tests: the fake `claude` in `test/qa-harness-preconditions.test.mjs` and
   `test/discovery-paid-run-guards.test.mjs` has an `auth status` case (`QA_FAKE_AUTH_METHOD`,
   `DISCOVERY_FAKE_AUTH_METHOD`; default `claude.ai`). New: a `describe` of unit tests (pass; `api_key`,
   `oauth_token`, `third_party`, missing `authMethod`, missing and blank `subscriptionType`, non-zero exit,
   spawn error, bad JSON; no echo of a secret-shaped value or an email) and a run-qa CLI test that refuses
   `api_key`, `oauth_token` and `third_party` before any paid call (`paidCalls()` stays empty). The
   re-judge and p6 attest tests inject the check and assert it is called and that its refusal propagates.
5. **Docs and rules.**
   - `AGENTS.md`: the "Run here, on `hc`, first" bullet is now the bold "Subscriptions first. No AI Gateway
     judging." rule (six lines). The "A paid method needs its own written authorization" bullet is
     unchanged.
   - `eval/EVALS.md`: new section "Model-call billing" (standard path, pre-run checks per CLI, the OpenCode
     probe with `--standalone` and the review's five corrections, E1, E2, the not-an-exception rows, the
     guard test). Lines 12-14 and the Playground row now point at it.
   - `.agents/skills/run-evals/SKILL.md`: the "Run here, on `hc`" bullet is rewritten to point at the
     section; the gateway-judge sentence is gone; the Playground row points at E1/E2.
   - `eval/playground/README.md:9`, `references/source-addition.md:12` and `eval/qa/README.md:697-700`
     changed as planned.
   - `.agents/TODO.md`: new "Build a subscription second judge on OpenCode when a decision needs one" with
     the CLI table, trigger, the four preconditions and done-when. "Keep OpenCode out of client
     diagnostics" no longer cites v2.2.7 and points at the probe.
6. **Guard.** `test/model-call-billing.test.mjs` (five tests). Run on the tree it matches exactly the four
   allowlisted files (`run-playground-semantic-eval.mjs` E1, `run-demo-model-gauntlet.mjs` E2,
   `eval/playground/artifact-contract.mjs`, the observability `SKILL.md`), so the allowlist has no stale
   entry. Planted-file demonstration: a temporary `scripts/zz-planted-billing.mjs` naming `api.openai.com`
   made the real-tree test fail with `scripts/zz-planted-billing.mjs: api.openai.com` (path and pattern
   only); I removed the file and the test passes again. In-memory tests plant every pattern, check that the
   plain `"workers-ai-provider"` service ID is not flagged, that out-of-scope folders and case paths are
   skipped, and that a stale allowlist entry fails. Row added to `test/README.md`.
7. **AGENTS.md launch-line clause.** "a dated brief's explicit launch line stays as written" is dropped;
   the rest of the sentence stays.
8. **Roster.** `.agents/model-roster.md`: the OpenCode row (role "Only when a decision names it"), its
   bullet (probe, `opencode models --standalone` must list `<provider>/$M`, stays out of client
   diagnostics) and the Codex `codex login status` check. Nothing else in the file changed.

## Gates (each run bare)

| Gate | Result |
|---|---|
| `npm run typecheck` | exit 0 (needed the README's placeholder `.dev.vars` and `npm run typegen` first; both are gitignored) |
| `npm test` | exit 0. 177 files passed, 5 skipped (182). 4263 tests passed, 3 expected fail, 8 skipped (4274). My first wiring pass failed 11 tests, all from fake-`claude` fixtures with no `auth status` case; fixed before this run |
| `npm run build` | exit 0 (`wrangler deploy --dry-run`) |
| `npm run eval:selftest` | exit 0, 37 `ok` lines, "self-test: all checks passed" |
| `npm run secrets:scan -- --tree` | exit 0, "clean — scanned all tracked files" |

**Byte comparison.** `dist/server.js` from this branch and from a build of `origin/main` (`3e490ec5`) in a
scratch `git worktree add --detach` under `/tmp/claude-1000/`: both 7,084,617 bytes, SHA-256
`8f8ac7f9ca79afb962acb8759d6fbb84a3e7ecefd8fc24cf5669db9e191d0532`, `cmp` identical. Worker bytes do not
change. The first attempt used a symlinked `node_modules` and differed only in bundle path comments
(`../../../../../home/tyler/...`); I rebuilt with a real copy of `node_modules` for the result above. The
scratch worktree and its copy are removed.

## Deviations and notes

1. **Purity header of `harness-guards.mjs`.** It said "no fs, no spawn". `assertClaudeSubscription` spawns
   `claude auth status --json` by design, so I edited the header to name it as the one injectable spawn
   and added requirement 4 to the list.
2. **One extra call site.** The plan lists five runners. `judge.mjs`'s own `attestJudgeSelfTestIdentity`
   (the judge self-test candidate) also spawns `claude -p`, so I added the check there too. It is private
   and injected in its tests, so it has no dedicated test.
3. **Discovery runner has no CLI-level refusal test.** Its fixtures cannot get past the bound-server
   pins, so the check at that call site is covered by the guard's unit tests and by the fake's `auth
   status` case, not by a spawned runner. The run-qa CLI test covers the same call shape.
4. **Guard scope.** `test/model-call-billing.test.mjs` lists files with `git ls-files --cached --others
   --exclude-standard`, so a new untracked script is caught before its commit (the plan said tracked
   files).
5. **`.dev.vars` and `env.d.ts`.** I created the placeholder `.dev.vars` (names only, value `x`) and ran
   `npm run typegen` in the worktree, as the README says. Both are gitignored and still present for the
   lead's re-runs.
6. **Untracked, left for the lead.** `PLAN.md`, `REVIEW.md` and `briefs/` under `items/8.6/` were
   untracked when I started and stay untracked. DISPOSITION.md went in with commit `94a64e70`; EXEC.md is
   committed after the four commits above.
7. **Stop rule.** Not hit. No other reader of stored gateway verdicts needed the deleted code; no pinned
   identity moved; no step needed a model call.

## For the lead's review

- Wording to check: the AGENTS.md rule, the EVALS.md section, and the TODO item's CLI table.
- The OpenCode probe text is the review's corrected form. I ran none of it (no model call). The offline
  commands the brief allows were not needed again because the review recorded them.
- Step 9 (ledger row) and the PR (`Refs` only) are open. `git log origin/main..HEAD` shows the four
  commits above plus the EXEC/DISPOSITION record commit.
