# NEXT — current handoff

Updated 2026-09-01 after the reviewed release deployment. Read this first.
`TODO.md` holds the full item text.
This file only ranks and sequences. Delete or rewrite this file when the block is done.
One unconditional agent-actionable block remains.

## State at handoff

- The free improvements maintenance block and release closeout are complete.
- Pull requests #112, #113, and #114 merged into `main` in that order.
- Production runs Worker Version `5ea8c1fe-e052-494d-b36b-ee8f5486a662` at 100 percent traffic.
- Deployment `bc6cbb36-3d17-4f43-86a9-f9b24fb597d2` started at `2026-09-01T22:27:28.631905Z`.
- The deployed source commit is `ea01f0d03c2bba88f5846922465c6a03af57e41e`.
- `/playground`, `/health/skills`, authorized MCP initialize, and a free `search` call passed.
- The Playground now serves the merged input-limit and accessibility changes from PR #99.
- `improvements/` contains 66 active findings.
- The statuses are 60 `reported-upstream`, three `proposed`, and three `declined-upstream`.
- The service counts are 29 Lumenloop, 21 Stellar Docs, nine Stellar Light, six skills, and one provider finding.
- No `fixed-upstream` deletion candidate remains.
- `sd-048` is `reported-upstream` at https://github.com/stellar/stellar-protocol/issues/2010.
- `sd-047` is `reported-upstream` at https://github.com/stellar/stellar-docs/issues/2805.
- Issue #2805 and PR #2806 remain open. The cadence conflict still reproduces.
- Retired `sls-074` remains fixed while Stellar-Light/stellarlight#1031 stays open.
- The maintainer owns the close for issue #1031.
- Retired `sls-080` has a complete receipt in `improvements/resolved.json`.
- Stellar-Light/stellarlight#1134 is closed as completed, and PR #1174 is merged.
- Deployed API `1.9.16` returned source parity at `2026-09-01T20:08:07.092Z`.
- Corpus lint: 0 errors and 62 warnings.
- One symmetric-caution warning preserves the resolved `sd-036` root cause without a stale grading caution.
- The warnings retain their recorded dispositions. Do not chase these counts to zero.
- Golden import validates Stellar strkeys (CRC16, SEP-23 version bytes) in `eval/qa/compile-qa.mjs`
  through `eval/qa/strkey.mjs`.
- The first `qa-five-track-v1` same-100 result is local at
  `eval/qa/results/2026-08-30T03-43-11-variantA.json`. Its independent decision is
  `VALID WITH A T4 EXCEPTION`. The one five-track T4 exclusion leaves 99 paired-eligible IDs, so the
  100-ID method is `INDETERMINATE`. Judge stability remains 57 of 100 below 0.75.
- The 2026-08-31 post-collection register refresh kept the same-100 unstable count at 57.
  Four cases entered and four left the unstable set. The judge-stability TODO is closed.
- The `clause-fit-hysteresis-v1` routing experiment completed with a reviewed `FAIL`.
  No production routing change shipped. Its harness and pinned artifact remain as evidence.
- The paid artifact used rubric `v2.9`. The closeout fixes its `partial-without-issue` defect in
  rubric `v2.10`. Cross-rubric comparison requires a rejudge under the target tuple.
- Consistency register: reconciled on 2026-09-01; 0 reopen entries.
- The Terms are in force. `TERMS_EFFECTIVE_DATE` is `August 5, 2026` and stays as is.
- Ledgers for the finished blocks: `.agents/rounds/2026-08-29-golden-truth-session-3.md`,
  `.agents/rounds/2026-08-29-five-track-same-100.md`, and
  `.agents/rounds/2026-08-30-golden-metadata-remainder.md` (PR #100, merged 2026-08-30 as
  `a617512`). The 2026-08-31 verify-and-close ledger is
  `.agents/rounds/2026-08-31-golden-metadata-remainder.md`.
- Both temporary-path classes are gone from the battery (0 files on 2026-08-31).
  301 battery files carry a `solo://` reference; these are retained historical dated records.
- Recovery PR https://github.com/stellar-experimental/stellar-raven/pull/102 closed without merge.
  QA PR https://github.com/stellar-experimental/stellar-raven/pull/103 also closed without merge.
  The record-only evidence is in
  `.agents/rounds/2026-08-31-rejected-experiments-closeout.md`.
- The `clause-support-fit-v1` routing experiment completed on 2026-09-01 with a verified `FAIL`.
  Its stamp is `2026-09-01T14-22-28-993Z-clause-support-fit-v1`.
  Attempt three is spent, so the three-attempt box is spent. No production routing change shipped.
- The cache-only support referee and its 18 tests are frozen at commit `24de1220`.
- The owned QA battery contains 500 cases as of 2026-08-28. The committed QA record now includes
  the first `qa-five-track-v1` same-100 checkpoint.

## Agent-actionable block

### Add paid-run preconditions to agent discovery

Use `run-evals`.

`eval/discovery/run-agent-discovery.mjs` still lacks the QA runner's required environment and
budget pins. Its binary pin also accepts duplicate and equals-form values.

Add fail-closed binary, environment, and total-budget preconditions.
Record complete spend provenance.
Add focused tests that prove every rejected form makes zero paid calls.
Do not make a provider call while implementing or testing this block.

Exit gate: focused tests, the release baseline, and an independent review pass.

## Owner-blocked blocks

### Classify the Raven capability boundary

Use `run-evals`.

The first three free steps are complete.

- The fail-closed `--expect-agent-environment-sha256` guard and its CLI tests pass.
- The all-answer screen found 6 unsupported offers among 2,406 stored answers. It found no
  additional unsupported offer.
- The separate no-tool screen found the same 6 unsupported offers among 44 explicit no-tool
  answers.
- The no-tool screen adjudicated 17 candidates. The all-answer screen adjudicated 51 candidates.
- Five hits repeat the Raven trap. One hit appears in the Friendbot case.
- The prose inventory found no direct shipped text that advertises the unsupported capability.
  The generated micro-map gives Data/RPC guidance only.

Ask the owner to classify the observation as an eval-harness defect, a shipped Raven defect, or
monitor-only. Then write an independently reviewed diagnostic plan for the selected surface.

The prior prompt measurement is invalid because its environment pin differed. Its five-track T3
safety failure is one observation. Another QA-prompt wording layer is spent.

Exit gate: an independent reviewer passes a plan that names the mechanism, surface, focused
diagnostic, product gate, stop rules, and separate authorization boundaries.

## Conditional programs

- Paired QA: free validator design is allowed. No collection occurs without a merged product
  candidate, the owner design decisions, reviewed briefs, and new caps.
- Repository recovery: keep the exact free monitor in `TODO.md`. The durable record is the
  `sls-080` receipt. Source parity authorizes no paid collection. Use `sls-082` for a distinct defect.
- Protocol-history routing: keep the three-attempt box closed. Use PH1 to PH4 in `TODO.md` only.
- `sources.locate`: log incomplete incidents. The phase-zero trigger cannot fire while no recovery
  steering is live.
- Friendbot and vendor short-token items remain monitor-only until their recorded bars fire.

## Completed blocks

- Release closeout: PRs #112, #113, and #114 merged. Version
  `5ea8c1fe-e052-494d-b36b-ee8f5486a662` passed production verification.
- Free improvements maintenance: four resolver receipts are in `improvements/resolved.json`.
- `sd-048` was filed at https://github.com/stellar/stellar-protocol/issues/2010.
- Golden metadata remainder: PR #106, ledger
  `.agents/rounds/2026-08-31-golden-metadata-remainder.md`.
- Judge-stability review: closed at 57 in
  `.agents/rounds/2026-08-31-eval-routing-next.md`.
- Protocol-history attempts one to three: three verified `FAIL` results. The box is spent.
- Recovery v2 and the QA prompt change: rejected and recorded in
  `.agents/rounds/2026-08-31-rejected-experiments-closeout.md`.

## Owner decisions

The 2026-08-28 human-review grill resolved its 21 questions. The questions below can change a
future action. Record each answer in a round ledger, `eval/qa/README.md`, or a decision record.

### Select the Raven capability-boundary surface

Question: is the observed unsupported lookup offer a QA-harness fidelity defect, a shipped Raven
product defect, or a monitor-only observation?

Evidence available: `.agents/rounds/2026-09-01-next-actionable-blocks/raven-free-evidence.md`
contains the stored-answer prevalence, prose-surface inventory, and no-tool reachability analysis.

Safe default: monitor-only. Do not authorize a paid diagnostic until an independently reviewed
plan names a mechanism that reaches the selected surface.

### Resolve paired design only when a product candidate needs a look

The owner must decide three items before any paired collection:

1. The selected denominator that leaves at least 100 eligible IDs with high probability.
2. Whether one candidate-only five-track T4 remains terminal.
3. The largest acceptable product-loss margin: `0.05`, `0.08`, `0.10`, or another validated value.

The current margin table is mixed-tuple calibration. The current `0.08` value is only a no-change
confidence radius. It is not an accepted product tolerance. Use the paired section in
`eval/qa/README.md` for the operating table. A new pair costs about `$82`.

Safe default: no spend and no promotion. This decision does not block current work.

### Keep protocol-history closed or reopen through PH2 or PH3

Options: stay trigger-only; review control labels under PH2; or open a non-card evidence box under
PH3.

Evidence needed first: a free per-control capture matrix, an independent label review, and a
product-impact count over the 76-case inventory and protocol-history QA family.

Safe default: stay trigger-only. Never lower the 19-of-19 bar because three mechanisms failed.

## Evaluation ladder

1. **Free evidence.** Run offline checks, stored-artifact reads, routing diagnostics, and surface
   inventories. Record stamps and hashes.
2. **Reviewed plan.** Pre-register the mechanism, acceptance table, stop rules, leakage guards, and
   budget shape. Reconcile an independent review. A plan pass authorizes implementation only.
3. **Focused diagnostic.** Require an exact owner cap and all environment, binary, revision, and
   surface pins. One authorization permits one method run.
4. **Headline sample.** Require a focused product-gate pass and a separate owner authorization.
   Never transfer the diagnostic cap.
5. **Review and closeout.** Review every result row, file findings, update the lane README, and close
   the round ledger.
6. **Ship.** Require the relevant product decision and deployment authorization. Verify production.

## Suggested sequence

The production release, QA environment pin, and free Raven evidence are complete.
Harden the discovery runner next without provider spend.
Obtain the Raven capability-boundary decision when ready.
Keep each paid action and production action behind its separate authorization.
No current item has authorization for evaluation ladder stages 3 or 4.
