# NEXT — current handoff

Updated 2026-09-17 during the [routing audit](rounds/2026-09-17-routing-audit.md).
Use [TODO.md](TODO.md) for task requirements and completion criteria.
This file ranks the work and retains unresolved owner decisions, not deployment history.

## Next work

1. Resolve the remaining general routing and source-authority work from the September 17 audit.
   Production uses Scout `1.9.52`; RWA stays excluded under issue #167.
   D3 failed its answer gate and was withdrawn. Keep the current scorer until a general repair passes.
2. Follow Docs PR #2837 for `sd-027` / `sd-034`.
   Decide the follow-up for stale-bot-closed `sd-037`; its original source trigger still reproduces.
3. Complete source-metadata follow-up before October 1 and review dependency upgrades.
4. Complete the private usage checks and coordinate the separately gated history cleanup.

The [September 14 improvements review](../research/audits/2026-09-14-improvements-review.md) records upstream blockers.
Keep monitor-only programs at their triggers in TODO.md.
The protocol-history contracts remain source-expired; changing the source hash alone does not renew them.

## Evaluation state

The September 4 candidate run remains diagnostic and non-comparable.
No valid paired baseline or two-week causal measurement exists.
The old `$882.50` plan is spent for P6 and the candidate, and stopped for all other methods.
Its stored `meanContinuousCoverage` is invalid and must not be quoted.
The user approved a separate $250 evaluation cap for the September 17 routing audit.
The round spent $24.7944578 and closed collection after a verified loss. No remaining method is active.
This approval does not resume the historical plan.
Never transfer a diagnostic budget to headline collection.
Use [the evaluation map](../eval/EVALS.md) and [the eval runbook](skills/run-evals/SKILL.md) for the measurement sequence.

## Owner decisions

Each decision names the question and the evidence it needs. Record each answer in a round ledger,
`eval/qa/README.md`, or a decision record. The historical decisions below remain separate from the current routing audit.

### A. Authorize the supervised paired subset measurement

Question: sign the authorization block in
`.agents/rounds/2026-09-03-truth-maintenance/revised-impact-measurement-fable.md` revision 3, or
do not. The block lists every method, cap, manifest field, command array, stop rule, and review
requirement. The signed record lives outside the plan file. It must name the canonical plan
SHA-256 printed by `npm run eval:qa:paired:plan-sha256`. The signature covers that hash and
every command array in the plan. The arrays are capacity, P6, both collections, both stored
judges, both flip re-judges, and the comparison. Any plan edit after the signature voids it. The
general round approval of 2026-09-03 is not this authorization. It needs these ten answers first.

1. Retire or retain the 2026-09-03 `$882.50` plan. Recommended: retire.
2. Denominator: 200 selected (recommended), 150 selected, or 500 under a reviewed deadline change.
3. Two concurrent server pairs under the supervisor (recommended), or sequential Option B.
4. Answer-only collection with stored judging (recommended).
5. Accept the concurrent-load estimand. The free v2 capacity artifact exists and passed the
   fixed technical gate. It does not accept the estimand. This decision is still open.
6. Keep the landed whole-arm guard stop for this look. Decide Option E separately.
7. Launch window: weekend UTC start, four-hour deadline, no retry in the same authorization.
8. Keep `0.08` as the experimental no-change radius. Print the `0.05` and `0.10` tables.
9. Keep the candidate-only T4 or T5 rule terminal.
10. Run the P6 judge self-test once at `$3.50` through the exact frozen wrapper command.

Evidence needed before signing: a capacity artifact at most 24 hours old at launch. The launch also
needs one clean launch revision and the printed canonical plan SHA-256. The final Opus confirmation
granted `LAUNCH-OK`. Maximum spend: `$273.50`. Safe default: no spend.

### C. Golden truth and product judgment blockers

The evidence for each item is in
`.agents/rounds/2026-09-03-truth-maintenance/golden-followup-fable.md`. No golden changes from
these items without a `golden-truth` edit and independent review.

- B1 `q-scf-rfp-tooling`. Question: does "developer tooling or indexing infrastructure" bind by the
  RFP-track definition or by each brief's Scout category? Evidence: the SCF handbook RFP-track text
  and the two live briefs labeled Infrastructure and Payments.
- B2 `q-sor-persistent-unbounded-collection-cap`. Question: does an attributed, dated 64 KiB docs
  figure trip avoid item 2? Evidence: the storage-strategies page states 64 KiB twelve times. The
  live network setting was not queried.
- B3 `q-protocol-ledger-close-time`. Question: does key fact 1 keep the live multi-ledger sample
  requirement, or accept a dated attributed Docs range? No exposed operation returns ledger close timestamps.
  The September 9 source and index checks now agree; the sampling requirement remains an owner decision.
  The former B4 caution expansion is unnecessary after the `sd-047` fix. No ADR-0008 expansion ships.
- B5 `q-ti-historical-pointintime-balances`. Question: do trade-implied USD prices from Hubble
  trade rows count as invented ledger-derived prices under avoid item 3? Evidence: the candidate
  transcript method.
- B6 compliance cluster: `q-pay-anchor-msb-licensing`, `q-pay-travel-rule-aid-flows`,
  `q-comp-finclusive-caas`, `q-crp-custodial-vs-noncustodial-wallets`,
  `q-crp-become-an-anchor-licensing`. Question: expand ADR-0008 beyond three cases with independent
  review, or keep the goldens strict and route the gap to a coverage diagnostic? Evidence: the docs
  state the simple framing. The goldens require entity, activity, custody, route, and jurisdiction.
- B7 and B8: paid rejudges. See decision D.
- B10 `q-edge-metamask-evm-mental-model`. Question: move the case from `stable` to `scheduled` with
  a re-verify cadence? Evidence: the answer carries a dated third-party Snap claim.
- B11 `q-defi-aquarius-what-is`. Question: should key fact 3 bind on the tested surface? Evidence:
  no exposed surface hosts the Aquarius ICE documentation.
Recheck these dated questions against the current corpus before proposing edits.
The per-case truth metadata, not this handoff, owns current dispute status.

### D. Adjudicate the candidate row-review disagreements

Question: for each row below, does the recorded grade stand? Evidence: the raw transcripts in the
stopped artifact and the three shard reports. A paid rejudge needs its own small authorization.
No artifact is rewritten. No grade change affects any claim, because the artifact is diagnostic.

- Judge-artifact sentences: `q-comp-finclusive-caas`, `q-edge-scf-v7-centralization-myths`,
  `q-ti-stellar-lab-usage-and-new-ui`, `q-ti-scout-refresh-cached-rows`.
- Nine disputed `correct` grades from the Scout and Lumenloop shard, listed in the ledger.
- Two disputed avoid matches: `q-edge-send-me-free-xlm`, `q-soroban-x402-auth-entry-signing`.
- Two three-way ties resolved to wrong: `q-eco-dex-saturation`, `q-eco-stablecoins-on-stellar`.
- Two trap goldens with tone or scope requirements to confirm: `q-edge-oos-solana-vs-aptos` and
  `q-n3-wallet-hacked-support-redirect`.

Safe default: no rejudge spend; grades stand as diagnostic values.

### G. Confirm the Raven capability-boundary third case

Question: does `q-n3-wallet-hacked-support-redirect` count as the third distinct QA case with an
unsupported account-lookup offer? Evidence: the candidate answer offered a Horizon or Stellar
Expert trace that Raven does not expose. A confirmed trigger allows a free cause audit only. No
prompt, paid diagnostic, or product change follows from confirmation.

### H. Select harness follow-ups from the candidate audit

Question: which of these recorded candidates become `TODO.md` items? Evidence:
`post-candidate-measurement-fable.md` and the skills shard. None is scheduled now.

- Per-row start and end timestamps and a per-row identity vector in the result schema.
- Per-turn cost in `agent.usage.perTurn`.
- A serialization hint in the sandbox error path.
- Row-order randomization or category interleaving for long live runs.
- Judge evidence on stable rows, or an instruction that stable-row specifics are unverifiable.
- The stable-row gate that hides wrong-claim rows from `evidenceSupportCheck`.
- Boundary rows skipped by the panel cap treated as low confidence in flip analysis.
- A harness metric for planning text that leaks into final answers.
- Capability self-description drift in zero-tool refusals.

### I. Decide the optional one-row rubric `v2.10` rejudge

Question: is the one-row rubric `v2.10` rejudge of `q-eco-stellar-wallets-list` still useful? It
is judge-contract evidence only. It is paid and needs its own small authorization. Safe default:
no spend.

### J. Resolve the paired promotion design

The three questions from the 2026-08-28 grill remain open. They overlap decision A.

1. The selected denominator that leaves at least 100 eligible IDs with high probability.
2. Whether one candidate-only five-track T4 remains terminal.
3. The largest acceptable product-loss margin: `0.05`, `0.08`, `0.10`, or another validated value.

The current margin table is mixed-tuple calibration. The `0.08` value is only a no-change
confidence radius. A same-tuple pair from decision A recalibrates it. Safe default: no promotion.
