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
- Protocol 29 activated on Mainnet at ledger 64717645 (2026-10-01T17:00:07Z), found by the golden
  review. Corpus impact check: no golden states a current protocol version as an undated fact.
  `q-edge-fresh-latest-protocol-version` gates a dated live lookup, not the number. No edit needed.
- Decisions D, G, H, and I: resolved by lane `adjudicate` (GPT-6-Astra high) under the owner's
  delegation; independent review by Claude Fable 5.1 high, ACCEPT WITH FIXES, all sixteen findings
  applied. The record is `2026-10-01-backlog-closeout/owner-adjudications.md`; its current consumers
  are the capability monitor, the four H follow-ups, and the prompt-conflict TODO item. It needs the
  two September 3 candidate reports and the September 1 free-evidence report.
  - D: leave all 19 recorded grades unchanged; the evidence supports five; owner veto open.
  - G: the third distinct case is confirmed; the monitor stays; owner veto open.
  - H: four harness items scheduled, five candidates rejected; owner veto open.
  - I: skip the optional one-row rejudge before the next pair; owner veto open.
- Stellar Docs adapter measurement (lane `sd-adapter`, GPT-6-Astra high; candidate
  `36787b3a9b051fa366b7648ca201691715253fbc`, baseline `bcfa617ffcb6e58e6a7498a1e42135a059535402`).
  Plan and review disposition: `2026-10-01-backlog-closeout/sd-measure/` (`plan.md`, SHA-256
  `b1f014f1cec7a5de1ec53a4058b0abf284a9c0cca68613842b1a6d6cdffe2028`).
  - Pre-spend review: Grok 4.7 high, LAUNCH-OK WITH FIXES; both fixes applied; delta review found one
    script gap, fixed. Coordinator decisions: a separate detached baseline worktree, and a cost
    exception under the owner's 2026-10-01 spend approval (no same-tuple stored run; hard caps
    `$25`, `$20`, `$25`, `$20`, method cap `$90`).
  - Free differential 1: INCOMPLETE (retained hits were headings only); preserved. Bounded
    baseline-only coverage amendment: Grok GO DIFF 2 OK. Free differential 2: 101 of 101 input pairs
    passed, with content equivalence in all nine branches.
  - Paid run 1 stopped before spend: the Claude Code CLI auto-updated (2.1.286 to 2.1.287). The
    executable re-pin to the immutable versioned file: GPT-6.1-Sol high, GO PAID 2 OK.
- Decision C follow-ups merged (#204), and `sd-054` filed as stellar/stellar-docs#2889 (read back:
  open, `raven` label). The finding records `reported-upstream`.
- Source-authority lane (`authority`, GPT-6-Astra high): pure deletion of "purely factual questions
  use docs first" from `EXECUTE_DESCRIPTION` (Option A), plus answer and judge cost accounting for
  the Playground runner. Code review: Grok 4.7 high, ACCEPT, no findings (eval mode is gated to
  localhost hosts after origin and auth checks). Plan review: Claude Fable 5.1 high, LAUNCH-OK WITH
  FIXES, then LAUNCH-OK on the bounded delta. Frozen arms: baseline `295a90cc` (accounting only),
  candidate `2cc020de` (adds the deletion). The demo AI Gateway has a daily spend limit with
  adequate headroom for the planned ceiling (figures kept private).
- Stellar Docs adapter measurement result (#208): both arms complete and comparable on 20 battery
  and 15 live cases (`$26.52`); the repeated-judging union ran on 18 panels (`$2.78`). Independent
  result review (Claude Fable 5.1 high): RELEASE OK; no grade difference reaches a changed adapter
  behavior. The run exposed a Scout gap: a failed backend read under load returns HTTP 200 with a
  zero total. `sls-089` is filed as Stellar-Light/stellarlight#1751, and an own-repo TODO item
  covers the adapter mapping. Run stops along the way (CLI auto-update, a `.dev.vars` mismatch, a
  fresh-shell environment hash) all happened before spend.
- Decision A launch preparation (#206, #207): the supervisor pins the active corpus count in the
  plan (the battery has 501 active cases); the run sheet, operator scripts, and stability register
  are in this folder; the launch pins the immutable Claude executable. Reviews: GPT-6-Astra high,
  ACCEPT WITH FIXES, two delta rounds, final CONFIRMED; the pin follow-up ACCEPT.
- Source-authority measurement (#209): the arms were re-frozen after the Gateway-transport
  accounting repair (baseline `5ebffbac`, candidate `894f5fea`); no routing regression and no
  verified answer regression; blind second reader BOUNDED PASS; `$3.23`.

## Outcome

- Merged: #200 to #209. Upstream: stellar/stellar-docs#2889 (`sd-054`) and
  Stellar-Light/stellarlight#1751 (`sls-089`) filed; stellar/stellar-protocol#2021 updated and
  waiting for a maintainer re-approval.
- Owner decisions resolved under delegation, each open to veto: C (#202, #204), D, G, H, and I
  (#201). K: not pinned (ADR-0010). A: ready for a weekend UTC run after the owner signs the plan
  hash (run sheet in this folder).
- Paid spend this round: about `$33` (adapter `$29.30`, authority `$3.23`, plus one probe with an
  unknown charge).
- Retained evidence and its current consumers: `scf-review-*.md` (ADR-0010);
  `owner-adjudications.md` (TODO monitor, H items, prompt-conflict item);
  `golden-owner-judgments.md` and `golden-followups.md` (case provenance, `sd-054`);
  `paired-*` files (TODO decision A); `sd-measure/` (`sls-089` evidence, release record);
  `authority-*.md` (release record). This ledger stays open until decision A runs; prune the
  folder then under `.agents/README.md` "Retention".
