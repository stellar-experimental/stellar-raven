# NEXT — handoff for the next work block

Updated 2026-09-01 after six independent remaining-work audits. Read this first.
`TODO.md` holds the full item text.
This file only ranks and sequences. Delete or rewrite this file when the block is done.

## State at handoff

- This audit changed planning and eval documentation only. It authorized no paid run, live fetch,
  deployment, production edit, golden change, routing attempt, or upstream message.
- The last recorded production deployment is Worker Version ID
  `6282fe2a-54d8-471e-9f0a-0a2565110af1` from 2026-08-28. This round did not verify live state.
- `improvements/` contains 69 finding files: 60 `reported-upstream`, 3 `proposed`, 3
  `declined-upstream`, and 3 `fixed-upstream` deletion candidates. `sd-047` is
  `reported-upstream` at https://github.com/stellar/stellar-docs/issues/2805. `sls-080` is
  `reported-upstream` at https://github.com/Stellar-Light/stellarlight/issues/1134.
  Stellar-Light/stellarlight#1031 was last recorded open on 2026-08-31. The maintainer owns the
  close.
- Corpus lint: 0 errors, 61 warnings (0 long-fact, 44 sourcing-guard, 16 corroboration, 1
  symmetric-caution). Every warning carries a recorded disposition: the 44 sourcing-guard items stay
  advisory (20-case audit, two models); the 16 corroboration items are grammar-only (56/56 class
  agreement, two models); the `symmetric-caution` on `q-protocol-ledger-close-time` is accepted under
  the ADR-0008 no-caution decision. Do not chase these counts to zero.
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
- Consistency register: reconciled on 2026-08-29; 0 reopen entries.
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
- PR #99 merged the Playground limit, the real `ai` tool-loop test, and title cleanup at
  commit `3c7f0e5` on 2026-08-30. If the recorded 2026-08-28 deployment is current, this change is
  not deployed.
- The `clause-support-fit-v1` routing experiment completed on 2026-09-01 with a verified `FAIL`.
  Its stamp is `2026-09-01T14-22-28-993Z-clause-support-fit-v1`.
  Attempt three is spent, so the three-attempt box is spent. No production routing change shipped.
- The cache-only support referee and its 18 tests are frozen at commit `24de1220`.
- The owned QA battery contains 500 cases as of 2026-08-28. The committed QA record now includes
  the first `qa-five-track-v1` same-100 checkpoint.

## Ranked blocks

### 1. Verify production state

This block is owner-blocked. Prepare a local comparison of `main` and PR #99. Write the proposed
read-only query plan. Ask the owner to authorize the live production read. After authorization, use
`cloudflare-observability-review` to read the live Worker revision. Then ask the owner whether to
deploy or hold. Do not fetch or deploy from this handoff alone.

Exit gate after both authorizations: record the live revision, the decision, and either the
verified deployment or the hold condition.

### 2. Make the Raven capability-boundary evidence trustworthy

Use `run-evals`.

1. Add the fail-closed `--expect-agent-environment-sha256` guard and its tests.
2. Run the free stored-answer prevalence scan for unsupported Raven capability offers.
3. Inventory the QA and shipped prose surfaces that can reach a no-tool answer.
4. Ask the owner to select the product surface only after those free results exist.
5. Write an independently reviewed diagnostic plan for the selected surface.

The prior prompt measurement is invalid because its environment pin differed. Its five-track T3
safety failure is one observation. Another QA-prompt wording layer is spent.

Exit gate: an independent reviewer passes a plan that names the mechanism, surface, focused
diagnostic, product gate, stop rules, and separate authorization boundaries.

### 3. Complete free improvements maintenance

Use `improvements-pipeline`.

- Read the states of stellarlight#1031, stellarlight#1134, and stellar-docs#2805.
- Independently review and drain `sd-001`, `sd-036`, and `sk-020` if their fixes still hold.
- Run the free `sls-080` Scout reading and record its source-parity fields.

Exit gate: the round ledger records every issue state, probe result, and deletion receipt or deferral.

### 4. Keep the other programs conditional

- Paired QA: free validator design is allowed. No collection occurs without a merged product
  candidate, the owner design decisions, reviewed briefs, and new caps.
- Repository recovery: monitor source parity. A match only removes one blocker. It authorizes no
  paid collection.
- Protocol-history routing: keep the three-attempt box closed. Use PH1 to PH4 in `TODO.md` only.
- `sources.locate`: log incomplete incidents. The phase-zero trigger cannot fire while no recovery
  steering is live.
- Friendbot and vendor short-token items remain monitor-only until their recorded bars fire.

## Completed blocks

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

### Deploy or hold after live verification

Question: should the current `main` revision deploy after the live revision and smoke checks are
known?

Options: deploy through the documented preflight, or hold with a reason and reopen condition.

Safe default: hold until the live revision is verified. A silent hold is not acceptable.

### Select the Raven capability-boundary surface

Question: is the observed unsupported lookup offer a QA-harness fidelity defect, a shipped Raven
product defect, or a monitor-only observation?

Evidence needed first: the stored-answer prevalence scan, the prose-surface inventory, and the
no-tool-answer reachability analysis.

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

Start with the local production comparison and query plan. Then add the fail-closed environment
pin. Run the free Raven evidence work and the improvements maintenance block next. Keep every
fetch, paid action, or production action behind its separate authorization. No current item has
authorization for evaluation ladder stages 3, 4, or 6.
