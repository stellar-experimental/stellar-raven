# Answer-style signals — pre-spend QA measurement brief

Status: **draft, not authorized.** No paid call and no server start happened in this lane. The
`run-evals` pre-spend plan review is outstanding. A reviewer tier that differs from the author
(Claude Opus) must review this brief, and the orchestrator must reconcile every finding before
spend. The owner must authorize the budget.

Change under test: [`design.md`](design.md) (branch `w1010/a`).

## Question

Does the branch keep abstention, absence, soft-empty, and volatile-value answers at least as good
as `main`, while the server instructions lose four phrasing rules?

The `.agents/TODO.md` done-condition needs "no regression in abstention or absence answers". This
brief measures that condition. It does not try to show an improvement.

## Arms

| Arm | Revision | Server |
|---|---|---|
| Baseline (B) | `main` at the merge base of `w1010/a` (`d15a4ce5` when this brief was written) | `npm run dev:eval` from a clean worktree at that commit |
| Candidate (C) | The `w1010/a` head commit that the orchestrator approves | `npm run dev:eval` from a clean worktree at that commit |

Each arm needs its own clean server worktree and its own port. The QA launcher refuses a dirty
tree. The orchestrator starts and stops both servers in panes that it owns. This lane starts none.

Run all four collections from one clean runner worktree at the baseline commit.
`run-qa.mjs` records the runner revision and `qaImplementationSha256`, and it refuses a dirty
runner tree. One runner keeps the QA implementation and the case bytes identical across arms. The
`--server-revision` flag names the server of each arm. This branch changes no file under `eval/`.

Do not run while the owner's paired collection runs. Confirm with the owner that it finished
first. Do not create or touch `/private/tmp/stellar-raven-paired-launch`.

## Pins (assert before the first paid call)

| Pin | Value |
|---|---|
| Answering model | `claude-sonnet-5` (runner default; pass no `--model`) |
| Judge model | `claude-sonnet-5` (runner default; pass no `--judge-model`) |
| Rubric and pack | `v2.11` and `p6` (the current `judge.mjs` and `evidence-pack.mjs`); confirm the stamp on the first judged row of each run |
| `SERVER_REVISION` | The 40-character commit of each arm, from a clean worktree |
| `SURFACE_SHA256` | `node eval/report-live-surface.mjs --port <port> --expect-source-revision <rev> --json <out>` per arm. The two arms must differ, because the instructions differ. |
| `AGENT_BINARY_SHA256` | One versioned `claude` executable, linked from a private `PATH` directory, with `DISABLE_AUTOUPDATER=1` |
| `AGENT_ENVIRONMENT_SHA256` | Computed once in the collection shell after every Claude variable has its final value; the same for all four runs |
| Remote identity | `eval/qa/probe-remote-identities.mjs`, its SHA-256, and one `--stable-sha256` vector for this authorization |
| Case snapshot | `eval/qa/cases.json` at the baseline commit. This branch changes no case file, so both arms read the same case bytes. |

A changed pin stops the method before the next paid call. Do not replace an expected value in the
same authorization.

Expected surface delta, measured locally with `npm run mcp:surface`: server instructions go from
7,864 to 7,760 characters. The `execute` description also changes.

## Cases (40, fixed order)

Use this exact ID list as one `--ids` argument in every run. The runner filters `cases.json` by
the list and keeps battery order, so every run has the same order. All IDs were `active` in
`eval/qa/lifecycle-registry.json` at `d15a4ce5`.

| Slice | IDs | Why |
|---|---|---|
| Abstention (8) | `q-edge-noinfo-sep-9999`, `q-edge-noinfo-stellar-pos-staking-rewards`, `q-edge-noinfo-stellar-native-privacy-default`, `q-edge-noinfo-exact-tvl-figure`, `q-edge-strupey-ambiguous-stellar-history`, `q-edge-ambig-stellar-token-meaning`, `q-raph-xlm-staking`, `q-edge-xlm-price-investment-advice` | Fabrication-bait, ambiguous, cant-do, and speculation traps. The removed "say unverified or ask for context" and "abstain" rules apply here. |
| Absence (8) | `q-edge-closed-world-builder-directory-miss`, `q-edge-open-world-recovery-after-narrow-miss`, `q-gap-builders-person-empty`, `q-gap-related-projects-empty`, `q-gap-contracts-domain-empty`, `q-edge-lumenloop-person-entity-empty`, `q-gap-semantic-directory-fallback`, `q-edge-doc-title-zero-hits` | Closed-world and open-world empties, ok-with-empty rows, and the semantic directory fallback. The removed "not found in these sources" rule and the new `inconclusive` signal apply here. |
| Soft-empty (6) | `q-edge-doc-category-filter-empty`, `q-edge-doc-page-sections-soft-empty`, `q-edge-partner-detail-soft-empty`, `q-gap-scout-get-skill-detail`, `q-tool-skill-detail-install`, `q-scf-rfps-hackathons-live` | The soft-empty envelope does not change. These rows check that the new ok-result signals do not blur it. |
| Volatile (8) | `q-eco-defi-tvl-current`, `q-eco-stablecoins-on-stellar`, `q-asset-rwa-tokenized-freshness`, `q-defi-category-funding-ratio-live`, `q-history-ecosystem-index-freshness-live`, `q-eco-most-active-defi-projects`, `q-pc-protocol-upgrade-timing`, `q-jutsu-cash-crypto-ramps` | Live values whose goldens need a visible observation date. The removed "date volatile values" rule and the new `asOf` signal apply here. |
| Control (10) | `q-aas-burn-clawback-redemption-mechanics`, `q-asset-trustline-basics`, `q-defi-defindex-honest`, `q-pc-sequence-numbers-ordering-replace`, `q-raph-xlm-simple`, `q-sep-interactive-deposit-withdraw`, `q-soroban-cross-contract-call`, `q-soroban-fuzz-testing`, `q-stellar-recurring-payments`, `q-hist-scp-rewrite-2015` | Stable, non-trap rows. The first nine are the stable non-trap active rows of the committed sample-30, in sample order. The tenth is a stable Scout row, added so the control covers each service family. |

No row is fully unaffected: every row that makes an ok service call now gets the footer. The
control slice holds the rows where the removed sentences and new signals matter least.

## Predeclared attribution

The measurement attributes one bundle: the instruction removals, the envelope signals, the footer
trigger, and the candidate-block trigger. It does not attribute any single part. A per-part claim
is diagnostic only.

Deterministic exposure by row, read from the transcripts after collection:

- **Every service-calling row:** the footer now has `observedAt:` and inconclusive markers.
- **Rows that call `lumenloop.search_directory` or `scout.searchProjects`:** the candidate block
  now fires only on a semantic or corrected match mode. `q-gap-semantic-directory-fallback` is the
  intended trigger row.
- **Rows that call `lumenloop.find_content_about_project`, `scout.vetIdea`, or
  `scout.scfPitch`:** the candidate block now fires where it did not.
- **Every row:** the base instructions differ.

The reviewer lists each row's exposure classes before reading grades.

## Order and variance control

Run four collections, two per arm, in ABBA order: B1, C1, C2, B2. ABBA balances slow live-data
drift across arms. Each collection uses the same 40 IDs.

A row changes only when both candidate runs differ from both baseline runs in the same direction.
Use the ordinal `wrong` = 0, `partial` = 1, `correct` = 2, after T4 and T5 exclusions. Any other
grade difference is variance, recorded as monitor-only.

After all four runs, re-judge each consistent change once with `eval/qa/re-judge.mjs --ids` on
both arms' rows for that ID. A change that the re-judge does not reproduce is judge variance.
Live-verify every `wrong` grade in the candidate arm against the service before it counts, as
`run-evals` Step 4 requires.

The sample is too small for `eval:qa:paired`, which needs 100 eligible IDs. Do not run it.

## Reading rules (fixed before spend)

1. Check completeness first. Each run must hold 40 rows, `meta.comparable: true`, and
   unsuppressed aggregates. A short or non-comparable run allows only a per-row diagnostic on the
   rows that completed.
2. Read `wrong` counts before `correct` counts.
3. **Pass:** zero confirmed consistent regressions in the abstention and absence slices together,
   at most one in the soft-empty and volatile slices together, and at most one in the control
   slice. "Confirmed" means it survived the re-judge and the live check.
4. **Fail:** any confirmed consistent regression in abstention or absence, or two or more in any
   other group. A fail blocks the merge. The orchestrator then restores the smallest removed
   sentence that the failed rows need, and re-measures under a new authorization.
5. **Indeterminate:** an incomplete or non-comparable run. Do not repeat it under the same
   authorization.
6. Do not tune per case. A failed row supplies a test, not new instruction wording.

## Mechanism metrics (free, from stored transcripts)

Report these for both arms. They explain the grades. They are not gates.

- **Dated volatile values:** volatile-slice answers that state an as-of or observation date.
- **Scoped absences:** abstention and absence answers that make an unscoped absence claim, such
  as "does not exist". Count the judge's `avoidMatches` and read each answer.
- **Signal use:** candidate-arm execute scripts that read `inconclusive` or `asOf`.
- **Footer cost:** the mean footer characters per execute result in each arm.
- **Tool-level errors:** execute errors per row, for parity with the tool-surface round.

Also run the free plan regrade on each stored run:
`npm run eval:plan -- eval/qa/results/<stamp>-variantA.json`.

## Budget

Cost basis: stored `meta.totalCostUsd` and per-row `agent.costUsd + verdict.costUsd` from the two
comparable 100-row runs `2026-10-07T23-25-14` and `2026-10-08T02-40-37`. Those runs used
`claude-sonnet-5` for both roles under rubric `v2.10`. They totalled $40.70 and $41.61. Their
per-row medians were:

| Row class | Run 1 median | Run 2 median |
|---|---|---|
| `stable` | $0.339 | $0.357 |
| `scheduled` | $0.481 | $0.496 |
| `live` | $0.416 | $0.404 |
| `stable` trap | $0.181 | $0.148 |

Six selected IDs have stored costs, and the brief uses them. Other rows use the class median. A
trap row that calls a service uses the `live` median, which is higher than the trap median. One
collection of 40 rows is about $15. Four collections are about $61. Rubric `v2.11` can change the
judge cost a little.

| Item | Cap |
|---|---|
| Each of the four collections | `--max-budget-usd 22` |
| Directed re-judge of consistent changes | `--max-budget-usd 8` |
| **Total authorization** | **$96** |

Each command takes exactly one `--max-budget-usd`. A budget stop ends that run; do not resume it
under the same authorization. A budgeted call without a reported cost invalidates the method.

## Commands (per collection)

Run from the repository root in the pinned collection shell. Replace the bracketed values with
the asserted pins.

```sh
IDS="q-edge-noinfo-sep-9999,q-edge-noinfo-stellar-pos-staking-rewards,q-edge-noinfo-stellar-native-privacy-default,q-edge-noinfo-exact-tvl-figure,q-edge-strupey-ambiguous-stellar-history,q-edge-ambig-stellar-token-meaning,q-raph-xlm-staking,q-edge-xlm-price-investment-advice,q-edge-closed-world-builder-directory-miss,q-edge-open-world-recovery-after-narrow-miss,q-gap-builders-person-empty,q-gap-related-projects-empty,q-gap-contracts-domain-empty,q-edge-lumenloop-person-entity-empty,q-gap-semantic-directory-fallback,q-edge-doc-title-zero-hits,q-edge-doc-category-filter-empty,q-edge-doc-page-sections-soft-empty,q-edge-partner-detail-soft-empty,q-gap-scout-get-skill-detail,q-tool-skill-detail-install,q-scf-rfps-hackathons-live,q-eco-defi-tvl-current,q-eco-stablecoins-on-stellar,q-asset-rwa-tokenized-freshness,q-defi-category-funding-ratio-live,q-history-ecosystem-index-freshness-live,q-eco-most-active-defi-projects,q-pc-protocol-upgrade-timing,q-jutsu-cash-crypto-ramps,q-aas-burn-clawback-redemption-mechanics,q-asset-trustline-basics,q-defi-defindex-honest,q-pc-sequence-numbers-ordering-replace,q-raph-xlm-simple,q-sep-interactive-deposit-withdraw,q-soroban-cross-contract-call,q-soroban-fuzz-testing,q-stellar-recurring-payments,q-hist-scp-rewrite-2015"

node eval/qa/run-qa.mjs \
  --ids "$IDS" \
  --port "<arm port>" \
  --max-budget-usd 22 \
  --server-revision "<arm revision>" \
  --expect-sha256 "<arm surface sha256>" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" \
  --remote-identity-probe eval/qa/probe-remote-identities.mjs \
  --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
  --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256"
```

`--variant` defaults to `A`, the shipped `search` tool. Do not pass `--sample`: it would
re-sample the 40 IDs. Call `node` directly, not through `npm run`, so that `PATH` does not change
between the identity hash and the run.

## Records

Keep the round ledger at `.agents/rounds/2026-10-10-weekend/answer-style/` beside this brief.
Record the four result stamps, the re-judge stamp, each pin, the spend, the per-slice table, and
the mechanism metrics. Results JSON stays local under `eval/qa/results/` (gitignored). File any
upstream finding through the `improvements-pipeline` skill. File an own-repo fix in
`.agents/TODO.md`.
