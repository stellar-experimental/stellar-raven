# Item 8.7 report: subscriptions or AI Gateway for each Playground test question

Lead: Claude Opus (`claude-opus-5-5`), agentpc `t1zn`. PR:
[#497](https://github.com/stellar-experimental/stellar-raven/pull/497), branch
`np/8.7-playground-billing`. No issue to reference.

## Question → path (for the owner)

| Question | Path | Why |
|---|---|---|
| Does a model route through the Playground's Gateway transport (slug, provider quirks, xAI `strict`)? | AI Gateway, E2 `--models` | No CLI touches Gateway routing or the AI SDK transport |
| Which model ID does the Gateway log? | Saved receipt first; live E2 with `--max-budget-usd` | Observed IDs come only through the accounting header |
| Do the shipped primary and fallback, each alone, complete the stream and tool loop after a model-path change? | AI Gateway, E2 default (now the shipped tuple) | The Playground route itself |
| Should a candidate replace the primary or fallback? | AI Gateway, E2 then E1 paired | Prompt, loop, caps, effort `none`, temperature 0.1 and model decide it together |
| Did a `DEMO_PREAMBLE`, cap or tool-loop change move quality or plan? | AI Gateway, E1 (plan-only: stored traces or `--no-judge`) | Exists only in the Playground |
| A model only the Gateway reaches (Kimi)? | AI Gateway | No subscription exists |
| Which model family answers Raven questions best; how does it use the tools? | Subscriptions: QA runner, Codex and Grok `hc` lanes | The MCP client and model decide it |
| Did an MCP text, catalog or executor change help or hurt? | Subscriptions first; E1 sample only if the text is about a Playground-capped constraint or stored transcripts show calls crossing a cap | The MCP surface decides it |
| Hand-off, harness contract, cost settlement, deployed health | Free: offline tests, `--dry-run`/`--preflight`, Gateway log read | No model call needed |

Sizing: every tier needs its own written authorization (none standing). Shipped-tuple smoke: 16 turns,
about USD 0.40 to 0.45. One candidate: gauntlet plus one paired E1 run (USD 3.75 last time). Several:
gauntlet each, paired screen, disjoint confirmation. Never a full matrix, never an eval-client matrix
through the Gateway. A subscription pre-screen for candidates is not adopted: nothing shows a CLI's
ranking survives the Playground's effort, temperature and 7-step budget.

## Result

- E1 and E2 stay the only API-billed exceptions, now scoped by question in `eval/EVALS.md`
  "Model-call billing", the `run-evals` skill, `eval/playground/README.md` and both script headers.
- Gauntlet default: `DEFAULT_MODELS` derives from `DEMO_MODELS` (Terra then Haiku, each alone). The
  Sonnet literal and the Grok default are gone; both stay reachable with `--models`. The roster already
  allows Haiku as the Playground fallback.
- Second judge (owner: "Why use opencode for chatgpt vs just using codex or grok?"): Codex 0.169.0 is
  not tool-blind. The offline `codex debug prompt-input` keeps `exec`, `wait`, `request_user_input` and
  the `collaboration` tools defined with every flag; no model call was needed. Grok 1.0.88 had one
  pre-registered probe (`grok-4.7`, SuperGrok, rule committed in `b0b5ed03`). With `--tools ""` it read
  the canary file: an empty allowlist restricts nothing, as its own docs say. Not execution-blind.
  **OpenCode stays the second-judge candidate.** The TODO item records both and the re-probe conditions.
- Owner quotes verbatim in DECISIONS.md, "Follow-up answers (2026-11-19, Playground billing)".
- Reviews: Fable plan review (`t1zp`, 3 blocking and 14 more, all adopted); Sonnet executor `t1zv`;
  Codex `gpt-6.2-sol` high diff review (`t1zw`, CHANGES: 1 blocking, 4 should, 2 nits, all adopted by
  Sonnet `t1zz`). The fixes were docs-only. I read the reconcile diff myself; no Codex re-check.
- Gates (lead, bare): typecheck, test (4283 passed / 3 expected fail / 8 skipped), build,
  `eval:selftest`, secrets scan: all exit 0. The executor saw the known `qa-judge-evidence` timing
  flake once; it did not recur.
- Spend: one Grok subscription call. No eval, no Gateway call, no API spend.

## Deploy

Not needed. `git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty.

## For the orchestrator on the Mac

Nothing beyond merge. Squash-merge is fine (no pinned SHAs).

## Open questions for the owner

- Optional: do you want a standing authorization for the shipped-tuple smoke (about USD 0.45 per
  model-path change)? The policy assumes none, so each run needs its own written authorization.
- If a decision ever needs a Grok judge, a different configuration (a one-tool allowlist, or a
  permission mode that refuses every tool) would need its own pre-registered probe. Nothing needs it now.
