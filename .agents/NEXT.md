# NEXT — current handoff

Updated 2026-09-04. The truth-maintenance round stopped its paid pair, landed its repairs, and
completed its production deployment.
The final Opus review first withheld `LAUNCH-OK` on L1 and `CLOSEOUT-OK` on C1 to C3.
Its appended confirmation grants both verdicts after repair. The historical verdicts stay unchanged.
The round has no review gate. Read this first.
`TODO.md` holds the full item text.
This file only ranks and sequences. Delete or rewrite this file when the block is done.
Open work is trigger-only or owner-blocked. It is not deployment work. Every paid, filing, and
golden action stays owner-blocked. Herdr cleanup remains open.

## State at handoff

- PR #125 merged at `2026-09-04T12:27:17Z` as
  `50bf5518860584ec1e5d352acbe11033515a0b7f`. The Copilot comment `3933695212` was fixed in
  `ab5388e` and resolved. Final CI passed Analyze in 49 seconds, CodeQL in 3 seconds, secrets in
  23 seconds, and tests in 1 minute 33 seconds.
- Deployment preflight proved that clean `HEAD` equals `origin/main`. `npm audit --omit=dev` found
  zero vulnerabilities. Wrangler deployed at `2026-09-04T12:29:24.371Z`. Worker Version
  `8022e211-c731-49cc-aef1-a20f1da798b9` is at 100 percent. The rollback version is
  `f62b64fa-1fb7-4c25-970d-7f98c83ab302`.
- Production verification passed. The closeout record is
  `.agents/rounds/2026-09-03-truth-maintenance/production-deployment-terra.md`. Terra author
  pane `w16:p2J` is recorded there and in the round ledger.
- The paired launch contract is enforced at `1847ffd`. The plan schema is
  `qa-paired-collection-plan-v2`. Launch requires `--authorized-plan-sha256` equal to the canonical
  plan SHA-256. The plan freezes every paid command array and the flip Claude pins. It binds the
  fixed capacity contract with 24-hour freshness. It requires exactly 200 selected and 500 active
  corpus IDs with all four corpus hashes. Report: `launch-contract-repair-sol.md`.
  The supplied final Opus review inspected revision 3 and the launch contract.
  That review first withheld `LAUNCH-OK` because the `run-evals` skill still published v1.
  The repair updates the skill to v2. The appended confirmation grants `LAUNCH-OK` after repair.
- The free two-agent capacity check is complete. The authoritative v2 `PASS` artifact has SHA-256
  `f94663390187a52a89007ca22a23530c873cb8e00b4117bece045265a56c2423` and completed at
  `2026-09-04T10:25:17.815Z`. It expires at `2026-09-05T10:25:17.815Z`. It proves the technical
  gate only. The owner has not accepted the concurrent-load estimand.
- Measurement design revision 2 received `CHANGES-REQUIRED` from Sol (`final-synthesis-review-sol.md`,
  P1 to P3 and S1 to S3). Revision 3 repairs all six against `1847ffd`. The final Opus review
  checked revision 3 and first withheld its verdict on L1. Its appended confirmation grants the
  verdict after repair. It authorizes nothing.
- The full validation after `1847ffd` is complete. The orchestrator ran it on the root branch
  with the work through `dc0761d`. `npm run typecheck`, `npm test` (108 files, 1,971 tests),
  `npm run test:smoke` (4 files, 83 tests), and `npm run build` passed. `eval:selftest`,
  `eval:compile`, `eval:qa:lint -- --stale` (0 errors, 62 warnings), `eval:qa:register -- --check`,
  `eval:routing` (gate), `eval:qa:paired:validate`, and `improvements:lint` passed.
  `eval:qa:compile` produced 500 cases with content SHA-256 `c5d0c804…7b43e`.
  `eval:protocol-history` stopped correctly as `source-expired` with no scored question.
  `improvements:index` produced 70 findings. The final repair full run passed 108 files and 1,974
  tests. The documentation follow-up passed its final diff and secret checks.
- PR #125 failed only on two vectorize test timeouts. Controlled CPU load reproduced both failures.
  The repair keeps all behavior checks and timeout limits. The two-file run fell from
  13.72–13.83 seconds to 1.41 seconds. The CI-like suite passed 108 files and 1,974 tests.
  Report: `ci-vectorize-timeout-repair-sol.md`.
- The 2026-09-04 candidate arm completed 500 rows and stopped as a diagnostic. Raw counts: 199
  correct, 230 partial, 71 wrong. Raw shares: strict 39.8%, half-credit 62.8%, core-answer-correct
  92.6%. Cost `$190.1686672`. Scout changed from `1.9.23` to `1.9.30` inside the arm. The executor
  fault hit 380 rows with 493 serialization failures. The artifact is non-comparable and is not a
  headline. Its stored `meanContinuousCoverage` value is invalid and retired. Never quote it.
- All 500 candidate rows received one independent sharded review. Disagreements are recorded in
  the ledger and are not resolved.
- No valid two-week causal measurement exists. No baseline artifact exists. The old `$882.50` plan
  is spent for P6 and the candidate and stopped for every other method.
- The remote identity guard, the paired collection supervisor, the envelope serialization repair,
  the coverage-metric retirement, and the evidence-support prose probes are landed on the branch
  with independent `PASS` reviews.
- Scout 1.9.23 and 1.9.30 are rejected. The committed inventory remains Scout 1.9.1 with manifest
  `b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729`. Live Scout advertised
  `1.9.30` on 2026-09-04.
- Both protocol-history v2 contracts are `source-expired` on the accepted manifest. The free
  diagnostic returns no counts until a new independently authored contract pins a new epoch.
- `improvements/` contains 70 active findings: 57 `reported-upstream`, 10 `verified`, and 3
  `declined-upstream`. The ten verified findings pass filing dry runs. None is filed.
- Issues stellar-docs#2805, stellar-docs PR #2806, and lumenloop-backend#35 remain open at the
  last recorded reads on 2026-09-04.
- The compiled corpus has 500 active cases. Content SHA-256 `c5d0c804…7b43e`. Cases file SHA-256
  `1842a188…2396`. Corpus lint: 0 errors and 62 warnings. Do not chase these counts to zero.
- The Terms are in force. `TERMS_EFFECTIVE_DATE` is `August 5, 2026` and stays as is.

## Next actions by class

### Deployment closeout complete

- PR #125 merged. Final CI passed. Production verification passed.
- Worker Version `8022e211-c731-49cc-aef1-a20f1da798b9` is at 100 percent.
- Deployment work is complete. Herdr cleanup is still open.

Complete since the previous handoff:

- The full validation after `1847ffd` is complete on the root branch. See "State at handoff".
  The final repair full run passed 108 files and 1,974 tests.
- The dated Scout 1.9.30 rejection is recorded in `eval/README.md` beside the 1.9.23 decision
  (commit `bd8d2d2`).
- The free two-agent capacity check ran twice. The authoritative v2 `PASS` artifact is recorded
  in `paired-capacity-check-terra.md` (commit `dc0761d`). The owner acceptance of the
  concurrent load is a separate open decision.
- The final Opus findings are repaired. L1 now points operators to the v2 paired launch contract.
  R1 persists terminal re-judge outcomes and postflight evidence. R2 reports the first command
  difference. R3 explains the capacity environment wrapper. C1 to C3 correct the dated records.
  Report: `final-launch-contract-repair-sol.md`.
- The PR #125 timeout repair passed five narrow runs, the 32-worker stress loop, and the full suite.
  Typecheck, build, all 83 smoke tests, and final CI passed. No timeout changed.

### Trigger-only and monitor-only

- `sd-047`: re-check only after stellar-docs PR #2806 merges. No polling, no comments.
- `sd-037`: read issue #1981 state after 2026-09-13. No keep-alive comment.
- `sls-080`: one free `scout.explainRepo` reading per improvements or drift round. The 2026-09-03
  reading passed.
- Protocol-history PH1, PH3, and PH4 triggers stay as written in `TODO.md`. PH2 is complete.
- Raven capability boundary: the four monitor triggers stay as written. A candidate third distinct
  case is recorded for owner confirmation. A confirmed trigger allows a free cause audit only.
- Friendbot, vendor short-token, Scout exposure re-evaluation, `sources.locate`, and the Docs
  enumeration ceiling stay monitor-only until their recorded bars fire.

### Upstream-blocked

- `sd-047` waits for PR #2806. `ll-019` and `ll-029` wait for substantive activity on issue #35.
  `sd-044` waits on issue #2772. `sd-037` waits on issue #1981.
- The 57 reported findings stay silent. They are not a filing queue.

### Filing-authority-blocked

- Ten verified findings: `ll-030`, `sd-046`, `sd-049`, `sd-050`, `sd-051`, `sd-052`, `sk-021`,
  `sk-022`, `sk-023`, `sk-024`. Each passes `npm run improvements:file -- --dry-run`. Filing
  needs explicit owner authority. See owner decision B.

### Paid-authority-blocked

- The supervised paired subset method, revision 3. See owner decision A. The owner's general
  approval of paid eval work for this round is not this authorization. Only a signed external
  record that names the canonical plan SHA-256 and covers every command array is.
- The stopped baseline arm, candidate rerun, both flip rejudges, the canonical live-data method,
  and the digest method. None may start under the old plan. A new method needs its own
  authorization.
- Paid rejudges for `q-comp-finclusive-caas`, `q-ti-stellar-lab-usage-and-new-ui`, and
  `q-edge-send-me-free-xlm`. See owner decision D.
- The optional one-row rubric `v2.10` rejudge of `q-eco-stellar-wallets-list`. See owner
  decision I.

### Human-judgment-blocked

- Golden truth blockers B1 to B11. See owner decision C.
- Adjudication of the candidate row-review disagreements. See owner decision D.
- The general Raven scoring repair. See owner decision F.
- The Raven capability-boundary third-case confirmation. See owner decision G.
- Selection of harness follow-ups from the candidate audit. See owner decision H.
- Paired promotion design: denominator, candidate-only T4 rule, and margin. See owner decision J.

### Remaining cleanup

- Owned Herdr cleanup remains open. Do not treat it as deployment work.
- Paid, filing, golden, and human-decision work stays in the blocks below.

## Owner decisions

Each decision names the question and the evidence it needs. Record each answer in a round ledger,
`eval/qa/README.md`, or a decision record. Safe default for every paid or external item: no spend,
no filing, no deployment.

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

### B. Authorize upstream filing for the ten verified findings

Question: file all ten, a subset, or none. Evidence: each record, its independent review, and its
dry-run body. Before filing, re-run the `sk-023` and `sk-024` dry runs at the merged revision.
Owners: `stellar/stellar-docs` (`sd-046`, `sd-049`, `sd-050`, `sd-051`), `stellar/stellar-cli`
(`sd-052`), `stellar/stellar-dev-skill` (`sk-021`, `sk-023`, `sk-024`),
`OpenZeppelin/openzeppelin-skills` (`sk-022`), `lumenloop/lumenloop-backend` (`ll-030`).
Safe default: no filing.

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
  requirement, or accept an attributed docs range with a conflict disclosure? Evidence: no exposed
  operation returns ledger close timestamps. The docs pages conflict (`sd-047`).
- B4 `q-protocol-ledger-close-time`. Question: add a symmetric canonical-page caution for `sd-047`?
  That would be a fourth ADR-0008 case. Evidence: the lint warning and the ADR three-case boundary.
- B5 `q-ti-historical-pointintime-balances`. Question: do trade-implied USD prices from Hubble
  trade rows count as invented ledger-derived prices under avoid item 3? Evidence: the candidate
  transcript method.
- B6 compliance cluster: `q-pay-anchor-msb-licensing`, `q-pay-travel-rule-aid-flows`,
  `q-comp-finclusive-caas`, `q-crp-custodial-vs-noncustodial-wallets`,
  `q-crp-become-an-anchor-licensing`. Question: expand ADR-0008 beyond three cases with independent
  review, or keep the goldens strict and route the gap to a coverage diagnostic? Evidence: the docs
  state the simple framing. The goldens require entity, activity, custody, route, and jurisdiction.
- B7 and B8: paid rejudges. See decision D.
- B9 `q-ti-stellar-lab-usage-and-new-ui`. The `sd-049` caution stays until source, UI, and
  documentation agree. This is upstream-blocked and filing-authority-blocked.
- B10 `q-edge-metamask-evm-mental-model`. Question: move the case from `stable` to `scheduled` with
  a re-verify cadence? Evidence: the answer carries a dated third-party Snap claim.
- B11 `q-defi-aquarius-what-is`. Question: should key fact 3 bind on the tested surface? Evidence:
  no exposed surface hosts the Aquarius ICE documentation.
- Disputed cases stay disputed: `q-soroban-x402-auth-entry-signing`, `q-tool-cctp-stellar-integration`,
  `q-ti-rpc-gettransactions-pagination-xdr`, `q-ti-stellar-lab-usage-and-new-ui`.

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

### E. Merge and deployment authority — exercised

The owner granted this authority. PR #125 merged as
`50bf5518860584ec1e5d352acbe11033515a0b7f`. Wrangler deployed Worker Version
`8022e211-c731-49cc-aef1-a20f1da798b9` at `2026-09-04T12:29:24.371Z`. Production verification
proved that the repaired raw-envelope path works. See `production-deployment-terra.md`.

### F. Authorize the general Raven scoring repair

Question: open the general scoring design in `TODO.md` ("Preserve structured routing intent
across extraction caps and gate tiers") after this round closes? Evidence: the 2026-09-03
attribution of eight real regressions and the 2026-09-04 category-routing miss. The repair changes
routing and its gates, so it needs an owner start and independent review.

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

## Conditional programs

- Paired QA: the supervisor, the remote identity guard, and the v2 launch contract are landed. No
  collection occurs without the signed external authorization in decision A. That record names
  the canonical plan SHA-256. Collection needs the owner acceptance of the concurrent load. It
  also needs a current capacity artifact and the final manifest.
- Repository recovery: keep the exact free monitor in `TODO.md`. The durable record is the
  `sls-080` receipt. Source parity authorizes no paid collection. Use `sls-082` for a distinct
  defect.
- Protocol-history routing: PH2 is complete. Keep the three-attempt box closed. Use PH1, PH3, and
  PH4 in `TODO.md` only. The v2 diagnostic is source-expired and authorizes no mechanism. A new
  epoch needs a new independently authored contract under PH3.
- Raven capability boundary: keep the exact monitor triggers in `TODO.md`. A trigger allows a free
  cause audit only. No diagnostic or product mechanism is active.
- `sources.locate`: log incomplete incidents. The phase-zero trigger cannot fire while no recovery
  steering is live.
- Friendbot, vendor short-token, and the Docs enumeration ceiling remain monitor-only until their
  recorded bars fire.

## Completed repair work

The truth-maintenance round 2026-09-03 has no review gate. Integration, deployment verification,
and cleanup remain. The items below are complete.

- Repair work inside the open round: `.agents/rounds/2026-09-03-truth-maintenance.md`, section
  "Repairs after the stop (2026-09-04)", and its report directory. Key reports:
  `post-candidate-stop-audit-sol.md`, `post-candidate-measurement-fable.md`,
  `remote-identity-guard-review-opus.md`, `paired-collection-supervisor-review-opus.md`,
  `scout-1.9.30-drift-terra.md`, `revised-impact-measurement-review-sol.md`,
  `final-synthesis-review-sol.md`, `launch-contract-repair-sol.md`,
  `paired-capacity-check-terra.md`, `final-launch-contract-repair-sol.md`.
- Raven monitor and protocol-history PH2 decisions: `.agents/rounds/2026-09-03-owner-decisions.md`.
- Production deployment of `0c71b99`: `.agents/rounds/2026-09-02-agent-queue-deployment.md`.
- Earlier: ids selector guards, residual fail-closed runner flags, protocol-history free evidence,
  A/V `created_at` contract, digest A/V date policy, QA evidence pack `p6`, queue closeout audit,
  agent-discovery paid-run guards (#116), stale-gospel refresh (#115), release closeout (#112 to
  #114), golden metadata remainder (#106), protocol-history attempts one to three, and the rejected
  experiments closeout.

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

PR #125 merged, final CI passed, and production verification passed. Finish the exact task-owned
Herdr, worktree, branch, and remote-reference cleanup. Bring open decisions A to D and F to J to
the owner together. Decision E is complete. Keep each paid and filing action behind its
authorization.
No current item has authorization for evaluation ladder stages 3 or 4.
