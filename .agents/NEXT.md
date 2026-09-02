# NEXT — current handoff

Updated 2026-09-02 after production deployment. Read this first.
`TODO.md` holds the full item text.
This file only ranks and sequences. Delete or rewrite this file when the block is done.
No unconditional agent-actionable block remains. Every open item is owner-blocked, trigger-only,
or monitor-only.

## State at handoff

- The reviewed queue is merged on `main` through `0c71b99` (PR #119). The completed ledgers below
  record each release baseline and independent review.
- PR #119 passed CI, CodeQL, secrets scanning, and test checks before it merged. Its compatible
  transitive refresh leaves `npm audit --omit=dev` at zero vulnerabilities.
- Production runs Worker Version `f62b64fa-1fb7-4c25-970d-7f98c83ab302` from source commit
  `0c71b99c02425307be5ef5c5c4ff1ef05935663d`. Post-deployment checks passed the public routes,
  authenticated MCP search and execute, and the digest A/V `date: null` contract. The deployment
  record is `.agents/rounds/2026-09-02-agent-queue-deployment.md`.
- Both paid runners use fail-closed CLI syntax. Every value flag needs the spaced form.
  Equals forms, unknown flags, stray arguments, and duplicate `--ids` fail before any paid call.
- The QA evidence pack is `p6`. Detected A/V rows omit `created_at` and any `date` derived from
  it. Non-A/V date handling and fixtures are byte-identical to `p5`. Same-tuple comparisons
  require the same pack, so `p5` artifacts are not paired-comparable with `p6` artifacts.
- `eval/gates.json` was re-baselined on 2026-09-02 for manifest `4cd28f4b…fe8b`: legacy
  213/279/312, extended 90/110/116, skills 16/23/23, holdout 10/22/26 with 11 forbidden
  captures. Decision record: `.agents/rounds/2026-09-02-av-created-at-semantics.md`.
- The protocol-history free evidence is complete in
  `.agents/rounds/2026-09-02-protocol-history-free-evidence.md`. The blind label review
  disputes four of 13 frozen controls. The product-exposure union is 78 QA cases. On the
  current manifest the original diagnostic reads 4/8 positives and 2/4 controls; the blind set
  reads 3/11 and 6/9. The three-attempt box stays spent.
- `improvements/` contains 66 active findings: 60 `reported-upstream`, three `proposed`, and
  three `declined-upstream`. `ll-019` carries the 2026-09-02 A/V `created_at` recurrence.
  Issues stellar-docs#2805, stellar-docs PR #2806, and lumenloop-backend#35 remain open.
- Corpus lint: 0 errors and 62 warnings. Do not chase these counts to zero.
- The Terms are in force. `TERMS_EFFECTIVE_DATE` is `August 5, 2026` and stays as is.

## Owner-blocked blocks

### Classify the Raven capability boundary

Use `run-evals`. The free evidence is complete. Ask the owner to classify the observation as
an eval-harness defect, a shipped Raven defect, or monitor-only. Then write an independently
reviewed diagnostic plan for the selected surface. Full text: `TODO.md` "Design a new Raven
capability-boundary diagnostic".

Exit gate: an independent reviewer passes a plan that names the mechanism, surface, focused
diagnostic, product gate, stop rules, and separate authorization boundaries.

## Conditional programs

- Paired QA: free validator design is allowed. No collection occurs without a merged product
  candidate, the owner design decisions, reviewed briefs, and new caps.
- Repository recovery: keep the exact free monitor in `TODO.md`. The durable record is the
  `sls-080` receipt. Source parity authorizes no paid collection. Use `sls-082` for a distinct defect.
- Protocol-history routing: keep the three-attempt box closed. Use PH1 to PH4 in `TODO.md` only.
  The PH2 decision now has its evidence.
- `sources.locate`: log incomplete incidents. The phase-zero trigger cannot fire while no recovery
  steering is live.
- Friendbot and vendor short-token items remain monitor-only until their recorded bars fire.

## Completed blocks

- Ids selector guards: `.agents/rounds/2026-09-02-ids-selector-guards.md`.
- Residual fail-closed runner flags: `.agents/rounds/2026-09-02-residual-optional-flag-guards.md`.
- Protocol-history free evidence: `.agents/rounds/2026-09-02-protocol-history-free-evidence.md`.
- A/V `created_at` catalog contract: `.agents/rounds/2026-09-02-av-created-at-semantics.md`.
- Digest A/V date policy: `.agents/rounds/2026-09-02-av-runtime-date-semantics.md`.
- QA evidence pack `p6`: `.agents/rounds/2026-09-02-av-evidence-pack-source-date.md`.
- Queue closeout audit: `.agents/rounds/2026-09-02-agent-queue-closeout/review-fable.md`.
- Production deployment: `.agents/rounds/2026-09-02-agent-queue-deployment.md`.
- Earlier: agent-discovery paid-run guards (#116), stale-gospel refresh (#115), release closeout
  (#112 to #114), golden metadata remainder (#106), protocol-history attempts one to three, and
  the rejected experiments closeout.

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

### Keep protocol-history closed or reopen through PH2 or PH3

Evidence available: the blind label review in
`.agents/rounds/2026-09-02-protocol-history-free-evidence/label-review-grok.md` disputes
`ph-control-validator-vote`, `ph-control-clawback-cap`, `phb-control-sdk-version-history`, and
`phb-control-cap-history-sep-support`. The card `useWhen` and `source` text assigns each ask to
`scout.searchResearch`. All 19 positive labels hold. The current manifest captures
`ph-control-validator-vote` at rank five with no mechanism. The exposure union is 78 QA cases.

Options: stay trigger-only; re-adjudicate the four labels under PH2 with label evidence,
provenance, and a contract-version change; or open a PH3 non-card evidence box.

Safe default: stay trigger-only. Never lower the 19-of-19 bar because three mechanisms failed.

### Resolve paired design only when a product candidate needs a look

The owner must decide three items before any paired collection:

1. The selected denominator that leaves at least 100 eligible IDs with high probability.
2. Whether one candidate-only five-track T4 remains terminal.
3. The largest acceptable product-loss margin: `0.05`, `0.08`, `0.10`, or another validated value.

The current margin table is mixed-tuple calibration. The current `0.08` value is only a no-change
confidence radius. It is not an accepted product tolerance. Use the paired section in
`eval/qa/README.md` for the operating table. A new pair costs about `$82`. A new pair must use
pack `p6`; stored `p5` artifacts are not same-tuple baselines.

Safe default: no spend and no promotion. This decision does not block current work.

### Decide the optional one-row rubric `v2.10` rejudge

Question: is the one-row rubric `v2.10` rejudge of `q-eco-stellar-wallets-list` still useful?
It is judge-contract evidence only. It is paid and needs its own small authorization.

Safe default: no spend.

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

Obtain the Raven capability-boundary and protocol-history decisions.
Keep each paid action and production action behind its separate authorization.
No current item has authorization for evaluation ladder stages 3 or 4.
