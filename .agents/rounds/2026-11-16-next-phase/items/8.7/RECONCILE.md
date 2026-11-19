# Item 8.7 reconcile record

Executor: Claude Sonnet (`claude-sonnet-5-5`), 2026-11-19, branch `np/8.7-playground-billing`. Input:
[CODEX-REVIEW.md](CODEX-REVIEW.md) (verdict CHANGES, seven findings) and the lead's binding dispositions
in [briefs/RECONCILE-BRIEF.md](briefs/RECONCILE-BRIEF.md). No model call, eval, Gateway call or push.
Edits are in commit `bad293d6`.

## Per finding

| # | Finding | What changed |
|---|---|---|
| 1 | Logged ID, cost settlement | `eval/EVALS.md:109-111`: the routing row lost "the logged model ID"; two new rows. The logged-ID row answers first from a matching saved receipt or log (cites `research/gauntlets/2026-11-03-sweep-probe-summary.md`); live needs E2 `--models` with an authorized `--max-budget-usd`, comparing observed IDs with the configured ID. The cost-settlement row says offline tests, with live settlement only inside an already authorized product run. `eval/playground/README.md:3`: the gauntlet example carries `--max-budget-usd 1`. `eval/playground/README.md:162`: "other vendors are covered only by mocks" now cites the dated live IDs for Haiku, Sonnet, Kimi and Grok |
| 2 | Shared-surface trigger | `eval/EVALS.md:114`: the prompt row covers Playground-specific changes only (`DEMO_PREAMBLE`, caps, loop). `eval/EVALS.md:117`: shared MCP text goes to subscription QA first; an E1 sample is added only when the changed text is about a constraint the Playground caps or overrides, or matched stored transcripts show top-level `search`/`execute` calls moving across a cap; `searchQueries` also counts searches nested in `execute`. `.agents/skills/run-evals/SKILL.md:67` (bullet) and `:103` (table row) and `DECISIONS.md` (Outcome, "Follow-up answers") point at that rule. The skill contains no chat route string, item number or date |
| 3 | E2 default smoke | `eval/EVALS.md:112` (reason cell) and the sizing item 1 (`:122-131`): the default verifies isolated per-model requests on the configured test Gateway (`stellar-raven-demo`) with slug-only overrides. A tuple change runs the offline request-equivalence test (`test/demo-chat.test.ts`, "preserves each measured request in the shipped mixed tuple") and pins `--openai-api-mode` and `--reasoning-effort` where the shipped tuple differs from the per-model default. A Gateway ID or Gateway-setting change left the smoke trigger list. The text says E2 cannot verify it and points at the post-deploy Gateway log read in `cloudflare-observability-review`. No harness code changed |
| 4 | Plan-only comparison | `eval/EVALS.md:114`: plan-only uses stored matched traces where possible, else E1 `--no-judge` plus `npm run eval:plan`; the judge runs only when the decision needs answer grades |
| 5 | Gauntlet header | `scripts/run-demo-model-gauntlet.mjs:45-52`: checked `git show face6a28:scripts/run-demo-model-gauntlet.mjs`; its matrix listed `openai/gpt-5.6-terra`, so the 2026-08-06 matrix is attributed to 5.6. The 6.1 evidence is the 2026-11-03 probe (1/1) and the 2026-11-10 8/8. Haiku has both denominators: 16/16 on the five required promotion fields, 14/16 on the broader diagnostic (two Soroswap-builder turns missed the expected search call) |
| 6 | Default-matrix test | `test/demo-model-config.test.ts:82-85`: renamed "keeps the gauntlet default in step with the shipped primary then fallback" with a comment saying it is a drift check (catches the old list or a reversed pair; a literal copy of the current IDs passes until the next tuple change). Assertion unchanged |
| 7 | Accounting sentence | `eval/playground/README.md:87`: names the OpenAI Responses primary and the Anthropic run-path fallback, sharing one accounting ledger |

## Gates (each bare, status read directly)

| Gate | Result |
|---|---|
| `npm run typecheck` | Exit 0 |
| `npm test` | Exit 0. 177 files passed, 5 skipped; 4,283 tests passed, 3 expected fail, 8 skipped. The earlier timing-ratio flake did not recur |
| `npm run build` | Exit 0 |
| `npm run eval:selftest` | Exit 0, "all checks passed" |
| `npm run secrets:scan -- --tree` | Exit 0, clean. The pre-commit hook also ran clean on the staged change |
| `git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` | Empty |

## Deviations

- None from the dispositions. Line numbers are as of `bad293d6`.
- The research summary supports observed Gateway IDs for Haiku, Sonnet, Kimi and Grok at one turn each,
  and the gauntlet only records observed IDs when `--max-budget-usd` is set (the `evalCost.models` field).
  The new rows rely on both facts; I read them in the files rather than running anything.
- `DECISIONS.md` is outside `AGENTS.md` and the ledger. I edited only its "Follow-up answers" outcome, as
  the brief directs, and left the ledger, `AGENTS.md`, the roster and `test/model-call-billing.test.mjs` alone.
