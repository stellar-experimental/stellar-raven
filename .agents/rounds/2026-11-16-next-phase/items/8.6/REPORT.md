# Item 8.6 report: subscriptions first, no AI Gateway judging

Lead: Claude Opus (`claude-opus-5-5`), agentpc `t1zf`, 2026-11-18. Branch `np/8.6-subs-first`, built on
`origin/main` at `3e490ec5` (#495).

## Pull request and result

[#496](https://github.com/stellar-experimental/stellar-raven/pull/496), `Refs #387`. Not merged, not
deployed. Gates, run bare by the lead:
- `npm run typecheck`, `npm run build`, `npm run eval:selftest` and `npm run secrets:scan -- --tree`
  all pass.
- `npm test`: 4283 passed, 3 expected fail, 8 skipped.

No model call. USD 0.

- **Removed.** The AI Gateway judge: `eval/qa/gateway-judge.md`, `gateway-judge.mjs`,
  `gateway-rejudge.mjs` and `test/gateway-judge.test.mjs`. No npm script ran them. Stored
  `gateway-rejudge-v1` receipts stay readable through a frozen
  `research/audits/2026-11-06-playground-final-resolution/gateway-receipt.mjs`. See
  [DISPOSITION.md](DISPOSITION.md).
- **Rule.** AGENTS.md "Subscriptions first. No AI Gateway judging." The exception list is in
  `eval/EVALS.md` "Model-call billing".
- **Mechanical guards.**
  - `assertClaudeSubscription` (fail closed) runs before every paid Claude Code run: QA, re-judge, both
    judge self-tests, discovery, and the judge half of the Playground eval.
  - `test/model-call-billing.test.mjs` is a string guard over code and workflows.

## Exception list (for the owner)

| Path | Class | Verdict |
|---|---|---|
| `src/demo/chat.ts` (AI Gateway, Workers AI); `src/demo/eval-cost.ts` (Gateway log read) | The Playground product itself | Allowed; not an eval |
| E1 `scripts/run-playground-semantic-eval.mjs` (`npm run eval:playground`) | Tests the product, whose models are reachable only through its own Gateway route | Exception. A subscription CLI would test a different client. Its judge half already runs on the Claude subscription |
| E2 `scripts/run-demo-model-gauntlet.mjs` | Transport and tool-loop smoke test on the same route | Exception, same reason |
| Gateway judge (`eval/qa/gateway-*`) | Eval judging | **Removed** |
| `cloudflare-observability-review` skill | Log and telemetry reads through the Cloudflare API, no model call | Not a model-call path |
| QA runner, judge, re-judge, self-tests, discovery agent arm, agentic workflow; Codex, Grok and OpenCode lanes | Subscription CLIs | The standard path |
| CI, `test/smoke`, `test/live`, `usage/` | No model call | Checked |

No eval or build step needed a move to a subscription CLI beyond removing the gateway judge.

## Answers to the note's questions

- **Headline judge after this.** Claude Sonnet (the `sonnet` alias) on the Claude Code CLI. The
  seven-case self-test and the stability register never depended on the gateway judge.
- **Planned gateway-judged runs.** None in TODO, ledgers or current briefs. The dated records that
  describe past Judge B runs are listed in PLAN.md and were not edited.
- **Second, non-Claude judge on a subscription.** Checked offline, without model calls:

  | CLI | Tool control | Result |
  |---|---|---|
  | Codex 0.169.0 | Per-feature switches only, no all-tools-off control | Still unsupported |
  | Grok 1.0.88 | `--tools` allowlist | Unproven: nothing shows that an empty list disables every tool |
  | OpenCode 2.3.0 | Agent `permission {"*":"deny"}` | Resolves to deny-all in `opencode debug agents --standalone` |

  Recommendation: no second judge now. When a decision needs one, use OpenCode on the ChatGPT
  subscription. The new TODO item has the setup and preconditions.

## Deploy

**Not needed.** `dist/server.js` is byte-identical to `origin/main`
(`8f8ac7f9…0532`), and `src/` has no diff.

The change is not model-facing for the service. It is measurement-facing: judges now launch with
`--setting-sources ""`, and `judge.mjs` changed, so the judge identity hash moves. The pending paid
judge self-test (TODO "Run the judge self-test on the resolved judge model") covers it before the next
headline judged run.

## AGENTS.md and skill changes (for the orchestrator)

- **AGENTS.md "Spend and evidence".** "Run here, on `hc`, first" becomes the hard rule "Subscriptions
  first. No AI Gateway judging." The "paid method needs its own written authorization" bullet stays.
  The dated-brief launch-line clause is dropped.
- **`run-evals` skill section 2.** It points at "Model-call billing", the gateway-judge sentence is
  gone, and the Playground row names E1 and E2.
- **`references/source-addition.md`.** A second judge is another Claude family, run through
  `re-judge.mjs --judge-model … --allow-non-identical`.
- **Roster.** New OpenCode row ("Only when a decision names it": `--standalone`, `-m openai/$M` or
  `xai/$M`, `--agent` for tool denial) and its probe bullet. The Codex bullet adds `codex login status`
  and an unset `OPENAI_API_KEY`. The Grok bullet requires the SuperGrok login to be in place and
  `XAI_API_KEY` to be unset before launch; Grok has no offline check (`grok usage` is not available
  yet).

## On the Mac

Nothing beyond the merge. Behavior change for every paid Claude run: a run now refuses unless
`claude auth status --json` shows the claude.ai subscription at the first-party endpoint. On the Mac,
make sure the Claude Code login there is the Max subscription, not a Console or API key, before the
next paid run.

## Open questions for the owner

1. Confirm the second-judge stance: none now, OpenCode on ChatGPT when a decision needs one (TODO).
2. E1 and E2 are the only standing API-billed exceptions. Do you accept both, with their reasons?

## Reviews

- **Plan review.** Claude Fable (`claude-fable-5-2`), high: 9 findings, 1 of them blocking (the
  OpenCode probe). All adopted. See [REVIEW.md](REVIEW.md).
- **Diff review.** Codex `gpt-6.2-sol`, high: CHANGES, 7 findings, 1 of them blocking (an
  endpoint-override bypass). All adopted. See [CODEX-REVIEW.md](CODEX-REVIEW.md).
- **Re-check.** Same model: 6 of the 7 resolved. Still open: the judge settings-file endpoint
  (blocking), plus 1 should and 1 nit. All adopted in `f4e3125c`. The lead checked that fix; it was not
  sent back to Codex. See [CODEX-RECHECK.md](CODEX-RECHECK.md).
- **Executor.** Claude Sonnet (`claude-sonnet-5-5`). See [EXEC.md](EXEC.md).
