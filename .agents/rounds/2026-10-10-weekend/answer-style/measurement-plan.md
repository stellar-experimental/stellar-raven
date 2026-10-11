# Answer-style signals — pre-spend QA measurement brief

Status: **authorized and run on 2026-10-11. Result: FAIL.** The pins, the case swap, and the
results are in [`measurement-ledger.md`](measurement-ledger.md).
Claude Fable 5.1 reviewed this brief as the independent pre-spend reviewer
(`/private/tmp/claude-501/w1010/ar-review.md`). Its findings P1 to P5 are reconciled below, and
the "Review reconciliation" section maps each one. The orchestrator authorized the budget under
the owner's delegation.

Change under test: [`design.md`](design.md) (branch `w1010/a`).

## Question

Does the branch keep abstention, absence, and volatile-value answers at least as good as `main`,
while the server instructions lose four phrasing rules?

The `.agents/TODO.md` done-condition needs "no regression in abstention or absence answers". This
brief measures that condition. It does not try to show an improvement.

## Arms

| Arm | Revision | Server |
|---|---|---|
| Baseline (B) | `main` at the merge base of `w1010/a` (`d15a4ce5` when this brief was written) | `npm run dev:eval` from a clean worktree at that commit |
| Candidate (C) | The `w1010/a` head commit that the orchestrator approves | `npm run dev:eval` from a clean worktree at that commit |

Each arm needs its own clean server worktree. The QA launcher refuses a dirty tree. The
orchestrator starts and stops the servers in panes that it owns. This lane starts none.

**One server at a time.** `AGENTS.md` forbids a second Wrangler process, so the orchestrator uses
this layout: start the baseline server for B1 and stop it; start the candidate server for C1 and
C2 and stop it; start the baseline server again for B2. Use the same port each time. Re-assert
the server revision and the surface SHA-256 after each start, before the next paid call.

Run all four collections from one clean runner worktree at the baseline commit.
`run-qa.mjs` records the runner revision and `qaImplementationSha256`, and it refuses a dirty
runner tree. One runner keeps the QA implementation and the case bytes identical across arms. The
`--server-revision` flag names the server of each arm. This branch changes no file under `eval/`.

The runner tree must have no untracked file. A stray `plugins/` folder trips the guard. The
candidate commit must resolve in the runner repository. If the runner is a separate clone, fetch
the `w1010/a` commit into it before C1.

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
| Judge-stability register | One frozen register file outside the runner tree, generated once before B1. Record its SHA-256. Pass the same `--stability-register <path>` to all four collections. |
| Server `.dev.vars` identity | One salted hash, computed with the same fresh salt for both server worktrees. The two hashes and name lists must match. Record only the salt and the hash, never a value. |

A changed pin stops the method before the next paid call. Do not replace an expected value in the
same authorization.

Expected surface delta, measured locally with `npm run mcp:surface`: server instructions go from
7,864 to 7,839 characters. The `execute` description also changes.

## Cases (34, fixed order)

Use this exact ID list as one `--ids` argument in every run. The runner filters `cases.json` by
the list and keeps battery order, so every run has the same order. All IDs were `active` in
`eval/qa/lifecycle-registry.json` at `d15a4ce5`.

| Slice | IDs | Why |
|---|---|---|
| Abstention (8) | `q-edge-noinfo-sep-9999`, `q-edge-noinfo-stellar-pos-staking-rewards`, `q-edge-noinfo-stellar-native-privacy-default`, `q-edge-noinfo-exact-tvl-figure`, `q-edge-strupey-ambiguous-stellar-history`, `q-edge-ambig-stellar-token-meaning`, `q-raph-xlm-staking`, `q-edge-xlm-price-investment-advice` | Fabrication-bait, ambiguous, cant-do, and speculation traps. The removed "say unverified or ask for context" and "abstain" rules apply here. |
| Absence (8) | `q-edge-closed-world-builder-directory-miss`, `q-edge-open-world-recovery-after-narrow-miss`, `q-gap-builders-person-empty`, `q-gap-related-projects-empty`, `q-gap-contracts-domain-empty`, `q-edge-lumenloop-person-entity-empty`, `q-gap-semantic-directory-fallback`, `q-edge-doc-title-zero-hits` | Closed-world and open-world empties, ok-with-empty rows, and the semantic directory fallback. The removed "not found in these sources" rule and the new `inconclusive` signal apply here. |
| Volatile (8) | `q-eco-defi-tvl-current`, `q-eco-stablecoins-on-stellar`, `q-asset-rwa-tokenized-freshness`, `q-defi-category-funding-ratio-live`, `q-history-ecosystem-index-freshness-live`, `q-eco-most-active-defi-projects`, `q-pc-protocol-upgrade-timing`, `q-jutsu-cash-crypto-ramps` | Live values whose goldens need a visible observation date. The removed "date volatile values" rule and the new `asOf` signal apply here. |
| Control (10) | `q-aas-burn-clawback-redemption-mechanics`, `q-asset-trustline-basics`, `q-defi-defindex-honest`, `q-pc-sequence-numbers-ordering-replace`, `q-raph-xlm-simple`, `q-sep-interactive-deposit-withdraw`, `q-soroban-cross-contract-call`, `q-soroban-fuzz-testing`, `q-stellar-recurring-payments`, `q-hist-scp-rewrite-2015` | Stable, non-trap rows. The first nine are the stable non-trap active rows of the committed sample-30, in sample order. The tenth is a stable Scout row, added so the control covers each service family. |

No row is fully unaffected: every row that makes an ok service call now gets the footer. The
control slice holds the rows where the removed sentences and new signals matter least.

**No soft-empty slice.** The done-condition names abstention and absence only. The soft-empty
envelope, its hints, and the soft-empty-only footer rule do not change in code, and unit and smoke
tests pin them. Six soft-empty rows would add about $10 and answer no part of the done-condition.
The volatile slice stays: it measures the one removed rule whose replacement reaches the answer
only through the footer when a script does not return `asOf`. The control slice stays: it guards
the footer on every ok run.

Accepted case notes: `q-defi-defindex-honest` and `q-hist-scp-rewrite-2015` have
`truth.status: "disputed"`, and `q-edge-strupey-ambiguous-stellar-history` is `unverifiable` by
design. Their grades are noisier, and the consistent-flip rule absorbs that noise. Before launch,
confirm that the golden of `q-pc-protocol-upgrade-timing` is still valid against its Protocol 28
date-contingent trap in `eval/qa/consistency-register.json`. If it is stale, replace it with the
next active `live` non-trap Stellar Docs row in battery order, and record the swap before spend.

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
drift across arms. Each collection uses the same 34 IDs.

A row changes only when both candidate runs differ from both baseline runs in the same direction.
Use the ordinal `wrong` = 0, `partial` = 1, `correct` = 2, after T4 and T5 exclusions. Any other
grade difference is variance, recorded as monitor-only.

**Noise floor.** The B1-versus-B2 and C1-versus-C2 disagreement counts are the in-round noise
floor. Report them beside the consistent-flip count. They bound what variance can explain. They
are not a significance threshold.

After all four runs, write the consistent-change ID list in the ledger before any re-judge spend.
Then re-judge those IDs once in B1 and once in C1 with `eval/qa/re-judge.mjs --ids`. A change
that the re-judge does not reproduce is judge variance. `re-judge.mjs` does not use stability
tiering, so it takes no `--stability-register`.
Live-verify every `wrong` grade in the candidate arm against the service before it counts, as
`run-evals` Step 4 requires.

The sample is too small for `eval:qa:paired`, which needs 100 eligible IDs. Do not run it.

## Reading rules (fixed before spend)

1. Check completeness first. Each run must hold 34 rows, `meta.comparable: true`, and
   unsuppressed aggregates. A short or non-comparable run allows only a per-row diagnostic on the
   rows that completed.
2. Read `wrong` counts before `correct` counts.
3. **Pass:** zero confirmed consistent regressions in the abstention and absence slices together,
   at most one in the volatile slice, and at most one in the control slice. "Confirmed" means it survived the re-judge and the live check.
4. **Fail:** any confirmed consistent regression in abstention or absence, or two or more in the
   volatile slice or in the control slice. A fail blocks the merge. The orchestrator then restores the smallest removed
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
collection of 34 rows is about $13. Four collections are about $52. The independent reviewer
cross-checked this from the committed totals (about $0.41 per row). Rubric `v2.11` can change the
judge cost a little. The per-collection cap leaves about 48 percent headroom, which also covers
judge-panel escalation.

| Item | Cap |
|---|---|
| Each of the four collections | `--max-budget-usd 19` |
| Directed re-judge in B1 | `--max-budget-usd 4` |
| Directed re-judge in C1 | `--max-budget-usd 4` |
| **Total authorization** | **$84** |

If the consistent-change list needs more than $4 per re-judge, stop. Request a new bounded
authorization.

Each command takes exactly one `--max-budget-usd`. A budget stop ends that run; do not resume it
under the same authorization. A budgeted call without a reported cost invalidates the method.

## Commands

Run every command from the runner repository root in the pinned collection shell. Replace each
bracketed value with an asserted pin. Call `node` directly, not through `npm run`, so that `PATH`
does not change between the identity hashes and the runs.

### Once, before B1

```sh
# Pinned executable and environment (run-evals "Pin the immutable executable").
export DISABLE_AUTOUPDATER=1
PATH="<private dir holding only a link to the versioned claude executable>:$PATH"
AGENT_BINARY_SHA256=$(shasum -a 256 "$(command -v claude)" | cut -d ' ' -f 1)
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')

# Remote identity: three captures five minutes apart; all must match.
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d ' ' -f 1)
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256)

# One frozen judge-stability register, outside the runner tree (P1).
STABILITY_REGISTER=<absolute path outside the runner tree>/judge-stability.json
node eval/qa/judge-stability.mjs --results-dir "<directory of stored QA results>" --out "$STABILITY_REGISTER"
shasum -a 256 "$STABILITY_REGISTER"   # record in the ledger

# One salted .dev.vars identity across both server worktrees (P2). Prints names and a hash only.
DEV_VARS_SALT=$(openssl rand -hex 32)
for WT in "<baseline server worktree>" "<candidate server worktree>"; do
  node --input-type=module -e 'import { devVarsIdentity } from "./eval/qa/paired-collection-supervisor.mjs"; const r = devVarsIdentity(process.argv[1], process.argv[2]); process.stdout.write(JSON.stringify(r) + "\n");' "$WT" "$DEV_VARS_SALT"
done   # the two lines must be identical; record the salt and the hash

# Candidate commit must resolve in the runner repository (P3).
git fetch <remote> w1010/a && git cat-file -e "<candidate revision>^{commit}"
git status --porcelain=v1 --untracked-files=all   # must print nothing
```

### Each server start (one server at a time)

```sh
# In the orchestrator's own pane, from the arm's clean server worktree:
npm run dev:eval -- --port "<port>"
# Then, from the runner repository:
node eval/report-live-surface.mjs --port "<port>" --expect-source-revision "<arm revision>" --json "<out>.json"
# Assert surfaceSha256 equals the recorded value for this arm.
```

### Each collection (B1, C1, C2, B2)

```sh
IDS="q-edge-noinfo-sep-9999,q-edge-noinfo-stellar-pos-staking-rewards,q-edge-noinfo-stellar-native-privacy-default,q-edge-noinfo-exact-tvl-figure,q-edge-strupey-ambiguous-stellar-history,q-edge-ambig-stellar-token-meaning,q-raph-xlm-staking,q-edge-xlm-price-investment-advice,q-edge-closed-world-builder-directory-miss,q-edge-open-world-recovery-after-narrow-miss,q-gap-builders-person-empty,q-gap-related-projects-empty,q-gap-contracts-domain-empty,q-edge-lumenloop-person-entity-empty,q-gap-semantic-directory-fallback,q-edge-doc-title-zero-hits,q-eco-defi-tvl-current,q-eco-stablecoins-on-stellar,q-asset-rwa-tokenized-freshness,q-defi-category-funding-ratio-live,q-history-ecosystem-index-freshness-live,q-eco-most-active-defi-projects,q-pc-protocol-upgrade-timing,q-jutsu-cash-crypto-ramps,q-aas-burn-clawback-redemption-mechanics,q-asset-trustline-basics,q-defi-defindex-honest,q-pc-sequence-numbers-ordering-replace,q-raph-xlm-simple,q-sep-interactive-deposit-withdraw,q-soroban-cross-contract-call,q-soroban-fuzz-testing,q-stellar-recurring-payments,q-hist-scp-rewrite-2015"

node eval/qa/run-qa.mjs \
  --ids "$IDS" \
  --port "<port>" \
  --max-budget-usd 19 \
  --stability-register "$STABILITY_REGISTER" \
  --server-revision "<arm revision>" \
  --expect-sha256 "<arm surface sha256>" \
  --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
  --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256" \
  --remote-identity-probe "$REMOTE_IDENTITY_PROBE" \
  --expect-remote-identity-probe-sha256 "$REMOTE_IDENTITY_PROBE_SHA256" \
  --expect-remote-identity-sha256 "$REMOTE_IDENTITY_SHA256"
```

`--variant` defaults to `A`, the shipped `search` tool. Do not pass `--sample`: it would
re-sample the 34 IDs.

### Directed re-judge (after the ID list is in the ledger)

```sh
for ART in "<B1 results file>" "<C1 results file>"; do
  node eval/qa/re-judge.mjs "$ART" \
    --ids "<consistent-change IDs>" \
    --cases-ref "<baseline revision>" \
    --max-budget-usd 4 \
    --claude-path "$(command -v claude)" \
    --expect-agent-binary-sha256 "$AGENT_BINARY_SHA256" \
    --expect-agent-environment-sha256 "$AGENT_ENVIRONMENT_SHA256"
done
```

Run each re-judge with `--dry-run` first, without the budget flags, to check the selection.

## Review reconciliation

| Finding | Reconciliation |
|---|---|
| P1 shared stability register | One frozen register, generated once, hash recorded, and passed to all four collections. |
| P2 `.dev.vars` identity | One salted `devVarsIdentity` hash across both server worktrees; values never printed. |
| P3 missing commands | The environment-hash, probe, register, `.dev.vars`, candidate-fetch, server-start, and surface commands are now written out. |
| P4 soft-empty slice | Dropped. The plan is now 34 rows, about $52, with an $84 cap. |
| P5 noise floor and order | The noise-floor sentence is in "Order and variance control". The one-server-at-a-time layout is in "Arms". The re-judge ID list is recorded before spend. |
| P6 case notes (info) | Disputed and unverifiable rows accepted; `q-pc-protocol-upgrade-timing` gets a pre-launch golden check with a fixed swap rule. |

## Records

Keep the round ledger at `.agents/rounds/2026-10-10-weekend/answer-style/` beside this brief.
Record the four result stamps, the re-judge stamp, each pin, the spend, the per-slice table, and
the mechanism metrics. Results JSON stays local under `eval/qa/results/` (gitignored). File any
upstream finding through the `improvements-pipeline` skill. File an own-repo fix in
`.agents/TODO.md`.
