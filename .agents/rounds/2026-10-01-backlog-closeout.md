# Backlog closeout — 2026-10-01

## Scope

Complete the remaining actionable `.agents/TODO.md` work after the audit verification round, and
resolve the open owner decisions the owner delegated. RWA exposure (#167) stays out of scope.

Owner authority (2026-10-01): "complete any remaining obvious work clearly and completely other than
the RWA"; "all spending is approved". Decision A: "we'll run it later likely Friday or Saturday so
save the run details but don't run it yet". Decision K: act only after independent adversarial
review from other models gives a clear answer. Decisions C, D, G, H, and I: resolve with evidence and
record each for veto. Upstream: update PR stellar/stellar-protocol#2021 and file reproduced leads.

## Lanes

| lane | agent (model, effort) | branch | write set | status |
| --- | --- | --- | --- | --- |
| sd-adapter | GPT-6-Astra, high | `feat/stellardocs-adapter-contract` | Stellar Docs adapter, tests, its docs | running |
| skills-drift | GPT-6.1-Sol, high | `chore/skills-drift-pick-mode` | drift check, ecosystem-skills docs | running |
| golden | Claude Fable 5.1, high | `golden/owner-judgments` | owned golden cases (decision C, Soroswap) | running |
| adjudicate | GPT-6-Astra, high | `eval/owner-adjudications` | decisions D, G, H, I; harness items | running |
| gt-leads | GPT-6.1-Sol, high | `improvements/gt-leads` | `improvements/` findings | running |
| scf-fable, scf-grok, scf-astra | Claude Fable 5.1, Grok 4.7, GPT-6-Astra (high) | read-only | decision K reviews | running |
| orchestration | Claude Opus 5.5 | `chore/backlog-closeout-2026-10-01` | ledger, decision A run sheet, monitors, usage checks | running |

Model-facing changes get a measured QA comparison (pre-spend plan reviewed by another tier) before
release. Each branch gets an independent review by a model that did not author it.

## Ledger

- Base `main` `bcfa617f`.
- Upstream checks (free): Cloudflare agents#2296 open, no reply; `@cloudflare/codemode` 0.5.2;
  `@cloudflare/vitest-pool-workers` 0.22.0 (override stays); stellar-docs#2837 open,
  `REVIEW_REQUIRED`; stellar-protocol#2021 approved but `BEHIND` master. Docs title count 651 (below
  the 1,000 probe ceiling).
- stellar-protocol#2021: branch updated from master (`gh pr update-branch`, head `53557ae2`).
- RWA #167 waits on an owner-authorized general Raven scoring repair (TODO "Preserve structured
  routing intent"), not on an upstream service; Cloudflare agents#2296 is the related upstream bug.
- The stopped 2026-09-04 QA candidate artifact no longer exists locally (it lived in a removed
  temporary worktree); decisions D and G use the retained review reports.
- Usage scheduled checks (TODO item removed): every nightly retention cleanup run since 2026-09-12
  succeeded (Cloudflare GraphQL `workersInvocationsScheduled`), and the last 30 hourly usage-health
  runs succeeded. The private record is `audits/2026-10-01-usage-scheduled-checks.md` in the evidence
  folder.
