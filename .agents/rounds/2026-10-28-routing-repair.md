# 2026-10-28 — general routing repair and Scout absorb (#223)

Round ledger. Owner request (2026-10-28): "we should really try for it", with both Claude Opus and
OpenAI Sol agents, careful testing, and Cloudflare Clef where it helps. The owner accepts spend for
endpoint fixes or lexical-semantic problems that are hard to resolve deterministically.

## Goal

Land the general scoring repair in `.agents/TODO.md` → "Preserve structured routing intent across
extraction caps and gate tiers". It must pass all twelve acceptance checks. Then absorb the live Scout
spec, the 682-title Docs snapshot, and the held stellar-light skill pin. Then #223 can close.

Read first: `AGENTS.md`; `.agents/skills/live-drift-resolution/SKILL.md`; the TODO item above and
"Absorb the stellar-light skill pin with the Scout operations it describes"; owner decision B;
`rounds/2026-10-08-routing-repair/routing-repair-report.md`;
`rounds/2026-10-09-followup/routing-step1/routing-step1-report.md`;
`rounds/2026-10-09-continuation/routing-step2/routing-step2-report.md` and its independent review.

## Decisions made by the owner for this round

- **Authorization.** The owner authorizes a general Raven scoring repair attempt (the TODO trigger).
- **Decision B, option 1, conditional.** The holdout top3 floor may move from 26 to 25 only for a
  candidate that passes every other check, when the only check-10 failure is the Groth16 ZK skill
  moving from rank 3 to rank 4. Record the evidence when it applies.
- **Spend.** Workers AI calls (Clef, Clef-flash, embeddings) are allowed for research and
  measurement, with a cap of USD 25 for the round. Log each batch: model, calls, input tokens,
  estimated cost. No QA battery, plan, agentic, or judge eval (`eval:qa*`, `eval:plan`, agent
  lanes) runs in this round; ask the parent first.

## Hard constraints (from AGENTS.md and the TODO)

- General mechanisms only. No operation-specific or question-specific exceptions, no per-query
  hacks, no new `SKILL_DESCRIPTION_OVERRIDES` entry.
- Never re-baseline to hide a regression. A re-baseline needs an intended routing-text cause.
- ADR-0003: the manifest is the exposed surface. Each new Scout operation gets an explicit
  exposure decision in `scripts/exposure.mjs`. The prior recommendation: expose
  `analyzeHackathonSubmissions` (broad) and `getHackathonSubmission` (detail); keep
  `reviewSubmission` excluded. `locateSource` is new since then and needs its own evidence.
- Secrets stay host-side. Never print the Cloudflare token. `globalOutbound` stays `null`.
- Generated artifacts come from their scripts only.
- Do not start a Wrangler process. If a live check needs a server, ask the parent.
- Pane ownership is recursive (AGENTS.md "Coordination").

## Cloudflare Clef

`@cf/cloudflare/clef` (27B) and `@cf/cloudflare/clef-flash` (9B) are Workers AI decision models,
released 2026-10-01. They take a `state` and typed `questions` (`noul`, `choice`, `score`) and return a
probability for each allowed option. Price: about USD 0.24 per million input tokens for `clef`;
output tokens are free. Docs: https://developers.cloudflare.com/workers-ai/models/clef/

Candidate uses, in order of preference:

1. **Build time.** Classify each `x-routing` phrase, description clause, or title keyword (for
   example: "specific to this operation" versus "generic English"). Commit the result as reviewed
   data, so serving stays deterministic and free.
2. **Measurement.** Label the intent of probe questions to test invariants at scale (for example,
   "is this question about a hackathon submission?").
3. **Serve time.** A tie-breaker or reranker in `search`. This changes the runtime path, latency, and
   cost. It needs a measured win on all twelve checks, a deterministic fallback, and the parent's
   approval before it can ship.

Call it with the REST API. Read the token with
`node -p 'require(process.env.HOME+"/Library/Preferences/cloudflare/config/default.json").oauth_token'`
into a variable, never print it, and run `cf auth whoami` first to refresh it. The account is
"Ecosystem - Stellar"; get the account ID from `cf auth whoami` or the Cloudflare API.

## Method

- Measure your own baseline on current and fresh sources with one acceptance helper that computes
  all twelve checks (`rounds/2026-10-09-followup/routing-step1/acceptance.mjs` and `snapshot.mjs`
  are the prior helpers; they read a `tmp/routing3/` layout you must rebuild). Fresh sources are the
  live ones today: run `node scripts/refresh-inventory.mjs` in a scratch copy, not in the tracked tree.
- Prior evidence archives (read-only; extract into this worktree's ignored `tmp/`):
  `/Users/kalepail/Desktop/stellar-raven-codemode/eval/results/2026-10-0{8,9}-*-evidence.tar.gz`.
- Change one mechanism at a time. Measure all 544 rows on both sources after each step.
- Stop rule: up to six candidate designs. If none passes, stop and write the failure analysis.

## Lanes

| Lane | Agent | Role |
|---|---|---|
| Lead | Claude Opus high | Orchestrates, owns this ledger, commits, pushes the branch, opens the PR |
| Implementation | Codex gpt-6.1-sol xhigh | Builds and measures candidates; writes reports to `tmp/` |
| Verification | Claude Opus high (separate pane) | Re-derives each measurement, attacks invariants, writes tests |
| Final gate review | Claude Fable high (or Grok 4.7 high) | Independent review of the final change; differs from authors and lead |

Codex lanes cannot commit in a worktree; the lead commits. Codex lanes see about 29
`test/qa-paired-launch` failures (`ps` EPERM) in their sandbox; re-run `npm test` outside it.

## Done

- All twelve checks pass on current and fresh sources in one reviewed general change.
- Scout, the Docs titles, and the stellar-light pin are absorbed, with exposure decisions recorded.
- `it.fails` markers in `test/drift-141-routing.test.ts` are removed if the controls now pass.
- The dApp `SKILL_DESCRIPTION_OVERRIDES` entry is removed if short tokens no longer route alone.
- Baseline gates and CI-equivalent checks pass. The final gate review is reconciled.
- The branch is pushed and a PR is open. The parent merges, deploys, verifies, and closes #223.
- If the repair fails: a report states which checks failed and why, files any real upstream finding
  in `improvements/`, and updates the TODO. Nothing ships.

## Setup

- Worktree: `/private/tmp/claude-501/raven-wt/routing-repair`, branch `routing/general-repair-223`,
  based on `main` `344d6af2` (after PR #303, deployed as `0c7bad9b`).
- `.dev.vars` holds placeholder names only; `npm ci` and `npm run typegen` are done.
- Parent: the Claude Opus session in Herdr pane `w3W:p5A`. The parent merges, deploys, and closes #223.
  Report to the parent by writing `tmp/lead-status.md` and replying in your own pane.

## Log

(Lead appends dated entries here.)

### 2026-10-28 — setup (lead)

- Lead: Claude Opus high, pane `w3W:p5P` (agent `rlead`).
- Fresh source frozen at 23:03Z in `tmp/fresh-inventory-2026-10-28/` (with `SHA256SUMS`): Scout
  1.9.111, 42 operations; 682 Docs titles; Lumenloop and Docs settings unchanged. New operations
  against 1.9.61: `analyzeHackathonSubmissions`, `getHackathonSubmission`, `reviewSubmission`,
  `locateSource`. Live stellar-light pin: `789c9061f0dc`. Every lane measures this snapshot.
- Prior evidence archives extracted to `tmp/evidence/` (2026-10-08, 2026-10-09 step 1, continuation).
- Lanes (panes created by the lead):
  - Implementation: Codex `gpt-6.1-sol` xhigh, pane `w3W:p5Q`, agent `rimpl`, brief
    `tmp/lanes/impl-brief.md`, output `tmp/impl/`.
  - Verification: Claude Opus high, pane `w3W:p5R`, agent `rverify`, brief
    `tmp/lanes/verify-brief.md`, output `tmp/verify/`.
- Phase 0: both lanes measure `baseline-main` and `baseline-fresh` independently.

### 2026-10-28 — Phase 0 baseline (both lanes agree)

- Main (Scout 1.9.61, 666 titles, pin `3b587aa9`): manifest `033e277f…`; L 219/298/326/112,
  E 93/111/117/16, skills top1 17, H 12/26/29/10. Fails checks 5, 8, 12. Equals the 2026-10-09
  main baseline on all 544 rows.
- Fresh (Scout 1.9.111, 682 titles, pin `789c9061`; `analyzeHackathonSubmissions`,
  `getHackathonSubmission`, `locateSource` exposed): manifest `0b345ab3…`; L 220/298/326/112,
  E 93/112/117/16. Fails checks 5, 6, 8, 12. All four named 1.9.71 regressions now meet their main
  grades. Main→fresh grade changes: two gains only (`q-defi-stellarx-what-is` top1,
  `q-edge-scf-v7-centralization-myths` top3).
- The stellar-light pin is routing-neutral (zero changes on 544 rows) and leaks no non-exposed
  Scout path through `codemode.skill.read` (runtime scrub checked on all four files).
- Exposure diagnostics: `reviewSubmission` exposed ranks 1 on `q-pc-sequence-numbers-ordering-replace`
  (keep excluded). `locateSource` enters six poor-fit pages with zero graded changes. The new
  hackathon operations enter seven non-hackathon pages (rank 2 on `q-comp-sep10-auth-role`). RWA
  exposed through the real builder costs legacy top3 298→296; the check 8 fixture lacks the
  builder's schema `keywords`.
- Lead decisions D1–D5 (`tmp/lanes/phase1-go.md`): check 12 is judged on zero graded losses
  (gains listed with causes), with the strict zero-change verdict reported beside it; new-operation
  capture guard; `locateSource` excluded by default; RWA exposure needs the builder entry to pass.

### 2026-10-28 — C1 rejected

C1 = schema keywords cannot admit a base-score failure, plus quota replacement at or above quota.
Fails checks 5, 8, 10, 12 on both sources (holdout top3 26→25 through Groth16; fresh
`q-soroban-x402-auth-entry-signing` −top5 through the check-6 shape: five gated Scout entries at
266–287 block ungated Soroban Docs 399 at the 1.6 interleave margin). Verify lane confirms every
number; the victim-ordering rewrite had no effect and is dropped; the per-service page quota stays a
contract (`test/search.test.ts:1039`). Off-corpus probes (159, verify lane) show RWA capturing 9/20
implementation probes and hackathon operations capturing 5/22 non-hackathon probes.

### 2026-10-28 — C2 rejected; plan for C3–C6

C2 = C1 plus schema keywords as rank evidence only inside whole-token boundaries. Passes checks 5
and 6 on both sources. Fails 8, 10, 12; adds `q-soroban-oz-upgradeable-macro` −top3 and
`q-ti-friendbot-ratelimit-alternatives` −top5, both held up by stopword substrings inside schema
words (verify lane: spurious). Lead: the mechanism stays; the losses must be recovered by
legitimate competition. Plan (`tmp/impl/plan.md`): C3 page-quota enforcement, C4 entry-wide content
anchor, C5 `notFor` target comparison, C6 build-time intent classes (Clef) if needed.

### 2026-10-28 — C3 rejected; revised plan

C3 = C2 plus Porter canonicalization applied globally plus a broad page-quota repair. Legacy
cardHit5 112→107, six paired-source losses, hackathon interference 7→14. Both sub-changes cause
losses. Revised plan (`tmp/lanes/c3-rulings.md`): C4 = C2 with the stem fold scoped to the schema
support test and a narrow fill-path quota fix; C5 = coverage hygiene (near-universal tokens and
example-only tokens do not count toward admission); C6 = build-time intent/object labels (Clef, up
to USD 3) with a committed deterministic query classifier, per the verify lane design
`tmp/verify/design-check8.md`.

### 2026-10-29 — C4 and C5 rejected

- C4 = C2 with the stem fold scoped to the schema support test, plus quota-aware filling of
  already-admitted candidates. Totals improve (main L 220/298/327/113, E 93/115/120/16) and x402 and
  Friendbot recover, but checks 8, 10 (Groth16, OZ) and 12 fail (fresh losses: `q-defi-blend-repo`,
  `q-scf-sdf-marketing-grant`, `q-aas-trusted-asset-list-whitelist`,
  `q-defi-bridge-evm-to-stellar-axelar`). Hackathon interference 7→13, locator 6→9.
- C5 = C4 plus coverage hygiene: (a) near-universal tokens, (b) example-only tokens do not count
  toward admission. Both steps fail checks 7, 8, 9, 10, 12 and add losses.
- C6 (intent/object gate) starts with an offline classifier report for lead and verify review.
- C4 review (verify lane): the full-page block caused every new cardHit5 loss and is outside the
  ruling; the short-page fill changed the effective quota from 6 to 2 and caused all interference
  growth. T1 still fails on main because C1 correctly removes the spurious `scout.getRfps`
  admission. C6 parent = C2 + scoped Porter + vendor constants (grades equal to C2), plus the
  intent/object gate (`tmp/lanes/c4-rulings.md`).

### 2026-10-29 — C6 stopped offline; stop rule reached

C6 = intent/object compatibility gate. Clef labeled 2,138 training strings (242 calls, 2.37 M input
tokens, USD 0.569). A committed naive Bayes classifier reached 50.8% intent and 27.8% object
agreement on the 532 corpus rows (3.9% joint on long rows). Offline, the gate rejects the correct
OpenZeppelin skills and Docs, keeps four of five x402 blockers, keeps the third RWA control, and
rejects RWA on 4 of 10 discovery probes. Both lanes recommend no wiring (verify design stop rule).
Six designs are spent. Final tasks (`tmp/lanes/stop.md`): failure analysis, plus two source-only
diagnostics on the unchanged scorer (Scout+pin alone; Docs titles alone).

### 2026-10-29 — final diagnostics and verification

- Failure analysis: `2026-10-28-routing-repair/impl/failure-analysis.md`. Verify review:
  `verify/final.md` (every re-derived number confirmed; omissions O1–O4 added below).
- Source-only diagnostics on the unchanged scorer:
  - `src-scout` (Scout 1.9.111 + pin, 666 titles, `locateSource` excluded): L 220/298/326/112,
    E 93/112/117/16, H 12/26/29/10; zero graded losses, two explained gains; D1 check 12 PASS,
    strict FAIL; D2 PASS against the fresh baseline. O1: 17 unit failures beyond the scratch
    environment, mostly generated counts and artifacts, plus two routing total assertions
    (`drift-141-routing.test.ts:270`, `search.test.ts:1040`, total 6→7). O2: against production the
    absorb adds seven non-hackathon captures (no graded change).
  - `src-titles` (682 titles only): zero graded changes; check 6 fails (`approach` title →
    `app` prefix match). Keep held.
- O3: the hackathon captures come from own-repo extraction (schema enum values as `keywords`,
  generic tokens from `exampleQuestions`), not from Scout routing text. No upstream finding.

## Outcome

- **Repair: failed under the stop rule.** Six designs (C1–C6); none passes all twelve checks. No
  scorer, policy, inventory, pin, or generated file changes ship. Decision B never applied.
  Best clean partial: C2 with the stem fold scoped to the schema-support test (passes 1–7, 9, 11).
- **Absorb:** not done (the ledger's Done rule for a failed repair). The Scout-plus-pin absorb on the
  unchanged scorer is now owner decision D in `.agents/TODO.md`; the title snapshot stays held.
- **Exposure evidence:** `reviewSubmission` exposed ranks 1 on
  `q-pc-sequence-numbers-ordering-replace` (keep excluded). `locateSource` enters six poor-fit pages
  at no graded cost (exclude by default). RWA through the builder costs four graded rows (keep
  excluded). The two hackathon read operations cause seven non-hackathon captures (decision D).
- **Upstream findings:** none new (the captures are own-repo extraction; see the new TODO item).
- **Spend:** Clef USD 0.569 (242 calls, 2,370,916 input tokens), all in C6 labeling. No paid eval.
- **TODO:** routing item updated with the round summary; new item "Stop schema enum values and
  example tokens from admitting new Scout operations"; stellar-light pin item updated; owner
  decision D added.
- **Retained evidence:** this folder (lane reports, patches, helpers, probes, briefs, rulings) and the
  ignored archive `eval/results/2026-10-28-routing-repair-evidence.tar.gz` in the main checkout
  (30 MB; full runs and diagnostics; scratch source copies excluded). The TODO routing item and
  decision D cite this ledger.
- **Lanes:** implementation `rimpl` (Codex `gpt-6.1-sol` xhigh, pane `w3W:p5Q`), verification
  `rverify` (Claude Opus high, pane `w3W:p5R`), lead `rlead` (Claude Opus high, pane `w3W:p5P`).
  Final gate review of this documentation change: see the PR.
