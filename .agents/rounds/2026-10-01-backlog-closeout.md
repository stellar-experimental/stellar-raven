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
  runs succeeded. Those runs executed the check, because `USAGE_REPORT_TOKEN` exists (the workflow
  skips only without it); the latest printed "Usage archive healthy". The private record is `audits/2026-10-01-usage-scheduled-checks.md` in the evidence
  folder.
- Decision K: not pinned. Three independent reviews (Claude Fable 5.1, Grok 4.7, and GPT-6-Astra,
  all at high effort) concluded "pin none now". The reviews are in `2026-10-01-backlog-closeout/`.
  [ADR-0010](../../research/decisions/0010-scf-community-fund-skills-stay-unpinned.md) records the
  decision and its reopening conditions. `ecosystem-skills/PIN-REVIEW.md` now records the Scout
  body's plugin install prompt as an accepted risk (a Fable side finding).
- Decision A run blocker found: `eval/qa/paired-collection-supervisor.mjs` required exactly 500
  active cases; the battery has 501. Lane `paired-prep` fixes this and writes the run sheet.
- GT-41/GT-43 leads: all three closed, none filed (lane `gt-leads`, GPT-6.1-Sol high; independent
  review Grok 4.7 high, ACCEPT WITH FIXES, all three findings reconciled here).
  - GT-41 dependency: fresh `soroban-sdk` requirements `26`, `26.1`, `27`, and `28` resolve SDK
    26.1.1, 27.0.6, and 28.0.0. Those pin host `=26.1.4`, `=27.0.1`, and `=28.0.2`, whose
    `ed25519-dalek` requirement is `2.0.0` (caret), so `cargo test` passes. The fix is
    stellar/rs-soroban-env#1706 (issue #1705). Exact older pins (SDK 26.0.1, 26.1.0, 27.0.0; host
    `=26.1.3`, `=27.0.0`, and 28.0.0 with `>=2.0.0`) can still resolve dalek 3.0.0. The closure
    covers the current requirement ranges only.
  - GT-41 CLI template: release order explains the skew. CLI v27.0.0 (2026-06-17) and v28.0.0
    (2026-08-26) shipped before SDK 27.0.0 (2026-07-08) and 28.0.0 (2026-09-18). Each scaffolded
    the newest released SDK major. CLI v27.1.0 and v28.1.0 moved the template to SDK 27 and 28.
    This is release timing, not a defect.
  - GT-43 CAP-0075: current CAP text and released host `v28.0.2` agree on `Symbol` selectors and
    the Protocol 25 floor. `sd-036` (stellar/stellar-protocol#1980, fixed by #1996) already covers
    the defect. `sd-048` stays open for the separate S-box degree conflict.
  - The lane's draft audit file had no current consumer under `.agents/README.md` "Retention", so
    it is not committed. This entry and the commit message hold the evidence.
