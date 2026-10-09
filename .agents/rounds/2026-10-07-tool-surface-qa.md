# 2026-10-07 — tool-surface non-regression QA

Status: collection, re-judges, row review, live verification, and the independent closeout review are
complete (Conclusion at the end). The upstream candidates were filed on 2026-10-09 (follow-up pointer at the end).

## Question

Did the week's MCP tool-surface changes degrade end-to-end answer quality?

- #224 `95dba7d4`: `annotations.title` on `search` and `execute` (top-level titles already existed).
- #225 `91cf8282`: `execute` `readOnlyHint: false` → `true`.
- #234 `65f38b83`: `execute` `openWorldHint: true` → `false`; the description opens with the call scope
  ("no network access (`fetch()` fails). Scripts can call only catalogued …"); the cap sentence drops
  "sandbox", "model-boundary", and "by default"; the artifact rule adds the 7-day private-storage
  disclosure (`ARTIFACT_TTL_MS`).

Out of scope: #226, #235–#237 (docs, deploy script, static assets; not model-facing) and #228–#232
(dependency, adapter, catalog, golden, and improvement work). The arm design below holds those fixed.

## Free preflight (done 2026-10-07, `main` at `dd8724e5`)

`eval:selftest`, `eval:compile`, `eval:qa:compile`, `eval:qa:lint -- --stale`,
`eval:qa:lint -- --stale --enforce-floors`, `eval:qa:register -- --check`: pass. Baseline revision
validation (typecheck and unit tests at `1cc1f3a6`) runs before launch and is recorded here.
`eval:routing -- --gate`: GATE PASS (baseline 2026-10-06T14:45:34.593Z). Routing math does not read
tool descriptions, so this gate cannot see the change; it only confirms nothing else moved.

## Arms

| Arm | Revision | Surface |
|---|---|---|
| T (treatment) | `dd8724e5` (`main`) | Current tool surface |
| B (baseline) | `1cc1f3a6`, local branch `eval-baseline-pre-tool-surface` = `dd8724e5` + revert of #224, #225, #234 | Pre-change tool surface; everything else identical |

The baseline commit changes only `src/mcp/tools.ts` and two test files; its `src/mcp/tools.ts` is
byte-identical to pre-#224 `eedba44a`. It is a fair counterfactual for the bundle on the current
implementation, not a reproduction of any historical deployment. It is never pushed or merged.

Worktrees: the runner and the T server use a clean worktree at `dd8724e5`; the B server uses the clean
worktree at `1cc1f3a6`. The main checkout is not used (it holds this ledger and another session's
untracked `plugins/`). Only the server revision and surface hash may differ across arms.

## Attribution (predeclared)

The round measures the bundle and claims nothing about any single edit or about annotation
visibility. Every selected row is potentially exposed to every change. Mechanism table, for
description only:

| Change | Could plausibly affect |
|---|---|
| Scope sentence first | whether scripts attempt `fetch`; which globals scripts use; early tool framing |
| Cap sentence shortened | how much a script returns; projection and truncation behavior |
| 7-day storage sentence | artifact reads; answer wording about storage; tool-choice caution |
| Titles, `readOnlyHint`, `openWorldHint` | unknown for the pinned client; not assumed absent |

Artifact activity is descriptive telemetry, not an exposure filter. This is a **diagnostic**: the only
allowed summary is "no reproduced regression detected in these selected cases" or a list of
reproduced, live-verified regressions. No battery-wide non-regression or release verdict.

## Instrument

- QA headline, variant A. Scope: a frozen 100-case diagnostic subset (`--sample 100`; owner decision, see Budget). The
  battery has 501 active, 0 quarantined cases; the subset gives broader coverage than 30 cases but
  carries the same diagnostic conclusion limits and no statistical non-regression claim. A broader
  claim needs a separately reviewed method. The experimental paired printer is not used. Same ordered IDs in both arms, frozen in the
  launch manifest with case-content hashes and the lifecycle partition.
- Answering `claude-sonnet-5`, judge `claude-sonnet-5`, rubric `v2.10`, pack `p6`,
  `QA_AGENT_PROMPT_APPEND` unset in both arms.
- Judge tiering `stability-boundary-v1` with one stability register generated before arm B: path, byte
  hash, provenance, selected-case coverage, and low-stability count recorded. The register mixes
  historical contracts; it is not an identical-input noise estimate. Both arms pass the same explicit
  `--max-panel-cases`. The register is never regenerated after B.
- Order B then T, back to back. One remote identity vector must match across both arms (fresh stable
  probe for this authorization). Collection windows and per-row timestamps are recorded. B-then-T is
  a stated limitation: the identity probe does not prove content equality, so live content can differ.
- Plan regrade (`npm run eval:plan`) on both stored runs afterward (free).

## Reading rules

- Review every row in both arms with its stored golden and transcript, including unchanged wrongs,
  baseline wrongs, surprising passes, and execution failures.
- Report selected, active, quarantined, attempted, completed, and graded denominators and T1–T5 for each
  arm. Missing or invalid grades are incomplete evidence, never unchanged quality.
- For every cross-arm score difference, and every wrong that would count as an agent failure, re-judge
  **both** saved answers once on identical input with explicit `--ids`, as two separate methods (one per
  arm), each with its own cap; the two caps sum to at most the $20 reserve and are fixed in the launch
  manifest. A difference counts as reproduced only if each fresh valid grade equals its own original
  effective grade. Any changed grade, from a single vote or a panel, makes the row unresolved
  (monitor-only). An empty selection is recorded and launches no paid method.
- Every counted wrong is live-verified. For a proposed regression, inspect whether the cited sources
  changed between arms; changed evidence makes that row inconclusive, not removed from the denominator.
- A regression claim needs reproduced, live-verified downward differences on 2+ unrelated rows.
  Single-row observations stay monitor-only, except a reproducible defect or contract mismatch, which
  is filed regardless. Re-judging fixed answers does not measure answering variance.
- If the re-judge reserve runs out, unresolved differences stay monitor-only and no clean result is stated.
- Aggregate comparison requires both arms complete and comparable: successful final guards,
  `meta.comparable === true`, and unsuppressed aggregates. If either arm is incomplete, stopped, or
  non-comparable (collection cap exhausted, identity failure), no aggregate delta is reported; a labeled
  comparison of completed valid rows is allowed with the original selected denominator stated.
- The clean summary is forbidden while unresolved missing or invalid grades could conceal a regression.
- Closeout: Step 5 root-cause triage, `improvements/` findings or an explicit "nothing new, rechecked X"
  note, own-repo TODO entries, retained evidence links, and the independent review.

## Budget

No stored run matches the current contract (rubric `v2.10`, pack `p6`), so all figures below are
unmatched planning evidence. Stored totals (`meta.totalCostUsd`, `claude-sonnet-5` both roles):
30-case runs $14.70 (2026-07-28, pack p3) and $20.89 (2026-08-18, p5); 100-case runs $30.64–$64.95
(2026-08-14 to 2026-08-30, p3–p5). Boundary and low-stability panels add judge calls that the older
runs did not all have. Counted cost = answering + judging + panels + permitted retries; a missing
reported cost invalidates the method.

| Scope | Arm B cap | Arm T cap | Directed re-judge reserve | Total |
|---|---|---|---|---|
| Diagnostic, sample 30 | $25 | $25 | $10 | $60 |
| Stratified sample 100 (`--sample 100`) | $75 | $75 | $20 | $170 |
| Full active battery (501) | ~$330 | ~$330 | $40 | ~$700 |

**Owner authorization (2026-10-07):** `--sample 100` (the owner first chose a scope mislabeled
"full battery (~100)"; the battery has 501 active cases, and the owner then confirmed sample 100), $170 total: arm B $75, arm T $75,
directed re-judge reserve $20. Each method run has exactly one `--max-budget-usd`. Unused caps never transfer; a stopped method is
never resumed without new authorization.

## Launch manifest (filled and checked before any paid call)

Full runner and server revisions, worktree paths, ports, per-arm surface hashes, Claude executable
realpath/version/hash (private `PATH` link, `DISABLE_AUTOUPDATER=1`), agent environment hash, remote
identity probe hash and vector, ordered IDs and case-content hashes, lifecycle partition, rubric, pack,
implementation hash, stability register hash and status, `--max-panel-cases`, and exact commands.
Equal across arms except server revision and surface hash. Rechecked before each method; any change
stops the method and is never adopted as a new expected value. Server configuration and upstream
accounts are confirmed equivalent without recording secrets.

### Launch manifest values (recorded 2026-10-07 before arm B)

| Pin | Value |
|---|---|
| Runner worktree / revision | `/private/tmp/claude-501/raven-t`, `dd8724e533153dd7306d338690a2a4cda6983c49`, clean |
| Arm B server | worktree `/private/tmp/claude-501/raven-baseline`, `1cc1f3a685cc79b4021aaf6be127b28834d1812f`, port 8788, `npm run dev:eval` |
| Arm B surface | `bd42923ed1dbda0a4b93e83a6a344272c220acc2e025e939d873481b2c2f37f9` (source revision pin OK) |
| Arm T server | worktree `/private/tmp/claude-501/raven-t`, `dd8724e5…`, port 8788 (after B stops) |
| Claude | `2.1.292`, `/Users/kalepail/.local/share/claude/versions/2.1.292` via private `PATH` link, sha `97a01e5bc74a199e67189435d0331ea3a24eac2e07db4b76d9148c5b0386138f`, `DISABLE_AUTOUPDATER=1` |
| Agent environment | `f9517dbaab4ee8284bde06bea28d4daaa0a80b6c64cc7ad7a226bd125a5248a2` (herdr shell pane, no `ANTHROPIC_*`, `CLAUDE*`, `QA_*`, `RAVEN_*`; `QA_AGENT_PROMPT_APPEND` unset) |
| Remote probe / vector | probe sha in `/private/tmp/claude-501/probe.sha`; stable vector `e7a78d3b5c3995ca6837b383df828673c38678b042c19eaedf7b9e0e0fe58be7` (3 captures) |
| Sample | `--sample 100`; ordered-ID sha `3e85fd24cfa520ffa19a6e92af96b2d9fc9447da97e0ec1d601803fc1f983e4d`; case-content sha `460c06c3dd5edf2d7263f104c7d59313aab1c095ef6cb35fcf8f180b9e6793e1`; 501 active, 0 quarantined |
| Judge | `claude-sonnet-5`, rubric `v2.10`, pack `p6`, `stability-boundary-v1`, `--max-panel-cases 34` |
| Stability register | `/private/tmp/claude-501/qa-stability-register.json`, sha `1ec822cd105dee75cfef06f3534d8e19681271490bd3f6c1bba7b39e97230bc9`, 197 artifacts (163 collection, 34 rejudge), covers 100/100 selected, 34 below 0.75 |
| Launch script | `/private/tmp/claude-501/qa-arm.sh` (asserts every pin, then one `run-qa.mjs` with one `--max-budget-usd`) |
| Baseline validation | typecheck pass; `test/server.test.ts` + `test/mcp-instructions.test.ts` 89 passed |

## Review

Pre-spend review 1: Codex frontier, `gpt-6-astra`, high (author and orchestrator are Claude Opus).
Decision: do not launch. Findings 1–10 (1 blocker, 8 major, 1 minor) are reconciled in this revision:
1 launch manifest; 2 annotation claim removed; 3 all rows exposed, diagnostic; 4 diagnostic wording and
an owner scope choice; 5 two-sided directed re-judges; 6 frozen register and panel cap; 7 unmatched-cost
labels and revised caps; 8 shared remote vector and order limitation; 9 full reading and closeout rules;
10 missing checks run.

Delta review (same reviewer): 1, 2, 3, 6, 7, 8, 10 resolved; 4, 5, 9 partly; new 11 (the "full battery"
label covered 501 cases, not ~100). Reconciled: 4 diagnostic limits for the 100-case subset; 5 per-grade
reproduction rule and per-arm re-judge caps within the reserve; 9 aggregate-comparison ban for
incomplete or non-comparable arms and no clean summary with unresolved grades; 11 owner re-confirmed
`--sample 100` after the correction.

Confirmation pass (same reviewer): 4, 5, 9, 11 resolved. Pre-spend review gate passed; launch-manifest
checks remain to be executed.
Post-run independent review: mandatory before closeout.

## Results

### Arm B, attempt 1 — stopped, non-comparable

- Launched 2026-10-07T16:18:52Z; stopped 16:51:53Z. Artifact (local):
  `/private/tmp/claude-501/raven-t/eval/qa/results/2026-10-07T16-51-53-variantA.json`.
- 20 of 100 rows completed, 80 unattempted. `meta.comparable: false`, aggregates suppressed.
- Reported spend $7.4799538 (agent $5.368998, judge $2.1109558). This is a lower bound: the failing call
  reported no cost.
- Cause: the first judge call for `q-defi-perps-whitespace` (ledger attempt `1.1`) returned no
  `costUsd`; `MissingReportedCostError` stopped the method as the contract requires. The answering call
  for that row reported $0.1901618. The row grade keeps only the rationale, but the per-call record in
  the artifact shows `failureClass: "timeout"`: `spawnSync` killed the judge CLI at 180 s (exit 143)
  before it printed a cost envelope.
- Per the rules, this method is not resumed. A re-run needs its own authorization and a fresh stable
  remote probe. No aggregate is reported from it.
- Own-repo gap: a missing-cost judge failure replaces the row grade's failure class with `budget-cost`;
  the original class (`timeout`) survives only in the per-call record. To file in `.agents/TODO.md`.
- Owner authorization (2026-10-07): re-run arm B fresh, new $75 cap, same pins, fresh stable probe.
  Total possible round spend becomes $7.48 + $170.

### Arm B, attempt 2 — stopped, non-comparable

- Launched 2026-10-07T17:13:54Z with all pins OK; stopped 19:43:18Z. Artifact (local):
  `/private/tmp/claude-501/raven-t/eval/qa/results/2026-10-07T19-43-18-variantA.json`.
- 94 of 100 rows collected; 6 unattempted (`q-ti-vocab-content-tags-live`, `q-tool-freighter-wallet`,
  `q-tool-greenfield-indexer-prior-art-preflight`, `q-tool-passkeykit-smart-wallet`,
  `q-tool-sdk-repos-discovery`, `q-zk-circuit-setup`). `meta.comparable: false`, aggregates suppressed.
- Reported spend $38.945865 (agent $26.4429072, judge $12.5029578), 265 of 266 calls reported. Lower bound.
- Cause: the third panel judge call for `q-ti-testnet-usdc-faucet` (attempt `1.3`) hit the same 180 s
  judge timeout and reported no cost. `q-defi-perps-whitespace` passed this time (`correct`, 3-vote panel).
- Diagnosis: both stops share one cause. A judge timeout always yields a missing cost, and a missing cost
  always invalidates the method. With 2 timeouts in about 190 judge calls, each further 100-case arm
  (about 170 judge calls) has a high chance to stop again. A third launch on the unchanged harness is not
  a sound use of budget.
- Not resumed. Further spend waits for an owner decision on a harness change (see Open decisions).

## Amendment 1 — harness fix and fresh arms (owner-authorized 2026-10-07)

Owner decision after B2: fix the harness, then rerun both arms on it. New authorization: a fresh arm B
(B3) at `--max-budget-usd 60` and arm T at `--max-budget-usd 60`. This replaces the unspent $75 arm-T
authorization. The $20 re-judge reserve is unchanged. Possible round spend: $7.4799538 (B1) +
$38.945865 (B2) + $120 + $20, plus any unreported B1/B2 cost.

### Harness change (PR #238)

Root cause: the judge CLI waits up to 180 s for a first response byte before it retries. The harness
killed the judge at exactly 180 s, so a slow first byte lost the cost envelope and stopped the method.

- First version (`20bc7171`): charge a killed judge call its $1 per-call ceiling and continue.
- Independent review (Codex frontier `gpt-6-astra`, high; `/private/tmp/raven-qa-harness-review.md`):
  1 blocker — `--max-budget-usd` is checked against accumulated cost after a request, so the ceiling
  is an assumption, not a proven bound. 2 major — a timed-out panel vote can yield an accepted grade
  that escapes the re-judge rule. 3 major — stored resumes accept bounded charges without validation.
  4 major — an eval-only merge diff does not prove the T server equals `dd8724e5`. 5 minor — reports
  hide the charged amount. 6 minor — B2/B3 agreement is cross-method.
- Reconciliation:
  - 1, 3, 5: the bounded charge is removed (`ef85aef3`). The missing-cost stop is unchanged. The judge
    CLI now runs with `API_TIMEOUT_MS=240000` and `CLAUDE_CODE_MAX_RETRIES=2`, so it ends a stalled
    request itself and reports cost in its result envelope. The harness timeout is a chosen 1,200 s
    backstop. A kill at the backstop still stops the method.
- Delta review (same reviewer; `/private/tmp/raven-qa-harness-review-delta.md`): 1–6 resolved. New 7
  (major): `API_TIMEOUT_MS` caps the fetch and the first-header window (≤ 239 s), not a streaming
  body. New 8 (major): `CLAUDE_CODE_MAX_RETRIES` limits ordinary retries; fallback and recovery paths
  can add requests. The reviewer confirmed from the pinned binary that a handled retry exhaustion
  prints a result envelope with `total_cost_usd`.
- Reconciliation of 7 and 8: the code comment, test, README, and this brief no longer claim a
  worst-case bound. Accepted limitation: the change reduces premature kills but does not guarantee
  completion. A further missing cost stops the arm, and the owner decides the next step.
  - 2: reading rule below — any judge-call failure on any vote puts the row in the re-judge set.
  - 4: the T server stays at `dd8724e5`; only the runner moves (see manifest item 1 and 3).
  - 6: the B2/B3 read is labeled cross-method below.

### Launch-manifest changes

Each item is checked in the collection shell before each paid method.

1. Runner: a new clean worktree at the `main` commit that merges PR #238. The merge commit's diff
   from `dd8724e5` must touch only `eval/qa/judge.mjs`, `eval/qa/README.md`, and
   `test/qa-budget.test.mjs`. `qa-arm.sh` `RUNNER` and `RUNNER_REV` move to it; nothing else in the
   script changes.
2. Arm B server: unchanged (`raven-baseline` at `1cc1f3a6…`). Its surface must still equal
   `bd42923e…`; recompute before B3.
3. Arm T server: unchanged at `dd8724e5`, served from `raven-t`. Compute and record its surface
   before T. `--server-revision` stays `dd8724e5…`.
4. Unchanged and re-asserted: binary `97a01e5b…`, environment `f9517dba…`, register `1ec822cd…`,
   sample IDs `3e85fd24…`, probe script hash. The judge env additions live in `judge.mjs`, which
   `meta` records by hash; they do not change the runner environment identity.
5. A fresh three-sample stable remote probe before B3. Arm T reuses it only if a re-probe before T
   matches; otherwise stop and ask.
6. Order: B3, then T. Each arm is one method; a stop is not resumed.

### Reading-rule additions

- Re-judge selection: a row enters both arms' directed re-judge sets if any judge call on any vote,
  in either arm, has a failure class, even when its effective grade is valid. These rows count as
  unresolved until a valid re-judge on each side.
- B2 versus B3 on their shared rows is a cross-method, same-surface agreement read only. The judge
  timeout and stall handling differ, and the live window differs. Report valid-grade overlap and
  unresolved IDs separately. It is not a variance estimate and stays out of the B3/T comparison.

### Amendment 1 launch checks

- PR #238 merged as `ae39dcc9fcde983f75709f95964f9f080a8c0091`. `git diff --name-only dd8724e5 ae39dcc9`:
  `eval/qa/README.md`, `eval/qa/judge.mjs`, `test/qa-budget.test.mjs` only. Item 1 passes. Not
  deployed: the Worker bundle is unchanged.
- Runner worktree `/private/tmp/claude-501/raven-runner` at `ae39dcc9`, clean after `npm ci`.
  `qa-arm.sh` diff from the pre-amendment copy: `RUNNER` and `RUNNER_REV` lines only.
- Arm B server surface recomputed: `bd42923e…` (unchanged). Item 2 passes.
- Print-only pin check for B3: runner, clean tree, binary, register, probe script, and sample IDs pass;
  environment `f9517dba…` (unchanged). Item 4 passes.

- Fresh stable probe (3 samples): `e7a78d3b…`, unchanged. Item 5 passes.
- B3 launched 2026-10-07T20:22:37Z with `--max-budget-usd 60`.

### Arm B, attempt 3 — complete, comparable

- Finished 2026-10-07T23:25:14Z. Artifact (local):
  `/private/tmp/claude-501/raven-runner/eval/qa/results/2026-10-07T23-25-14-variantA.json`.
- 100 of 100 rows, `meta.comparable: true`. Cost complete: 292 of 292 calls reported (100 agent, 192
  judge). Spend $40.7040512 (agent $27.0313822, judge $13.672669). No judge or agent failures; 0 timeouts.
- Headline (single arm, not a delta): half-credit 64.0%, strict-correct 38.0%, core-answer 92.0%.
  Panels used 46.
- Arm T server started from `raven-t` at `dd8724e5` on port 8788 after the B server stopped. Surface
  `83d9734fc92bb9d328755de4cf6641171fb7591ec16567c5e28c3af7063f981f`. Item 3 passes.
- Re-probe before T (3 samples): `e7a78d3b…`, matches. Item 5 passes.
- Arm T launched 2026-10-07T23:36:12Z with `--max-budget-usd 60`.

### Arm T — complete, comparable

- Finished 2026-10-08T02:40:37Z. Artifact (local):
  `/private/tmp/claude-501/raven-runner/eval/qa/results/2026-10-08T02-40-37-variantA.json`.
- 100 of 100 rows, `meta.comparable: true`. Cost complete: 292 of 292 calls. Spend $41.6090044.
  No judge or agent failures; 0 timeouts.
- Headline (single arm): half-credit 61.5%, strict-correct 38.0%, core-answer 87.0%. Panels used 46.

### Directed re-judge manifest (fixed before spend)

- Selection: the 26 rows whose effective grade differs between B3 and T (14 down, 12 up). No agent
  failures and no judge-call failures in either arm, so nothing else enters.
- IDs: `q-aas-burn-clawback-redemption-mechanics,q-aas-list-token-on-exchanges-aggregators,q-comp-finclusive-caas,q-defi-arbitrage-pathpayment-bots,q-defi-phoenix-what-is,q-defi-skill-ecosystem-scout,q-edge-fresh-latest-blend-tvl,q-gap-compare-hackathons,q-gap-leaderboard-project-not-builder,q-gap-scout-status-envelope,q-hist-quantum-preparedness-plan,q-infra-hubble-bigquery,q-jutsu-cash-crypto-ramps,q-pc-quantum-preparedness-dormant,q-protocol-parallel-execution,q-raph-claimable-balance-safety,q-raph-withdraw-exchange-self-custody,q-scf-cross-reflector-rounds-current,q-scf-verified-members,q-sor-deploy-invoke-from-js-sdk,q-sor-force-fast-archival-localnet,q-soroban-contract-build-verification,q-soroban-sdk-cve,q-ti-rpc-gettransactions-pagination-xdr,q-tool-greenfield-indexer-prior-art-preflight,q-tool-sdk-repos-discovery`
- Two methods, one vote each (default panel 1), same judge model, runner `ae39dcc9`:
  re-judge B3 at `--max-budget-usd 10`, re-judge T at `--max-budget-usd 10` (sum $20 = reserve).

### Directed re-judge results

- B3 re-judge `/private/tmp/claude-501/raven-runner/eval/qa/results/2026-10-08T02-41-23-rejudge.json`,
  $2.1083024, 0 missing costs. T re-judge `…/2026-10-08T02-54-52-rejudge.json`, $2.051454, 0 missing.
- Reproduced (both fresh grades equal their originals): 6 down, 9 up.
  - Down: `q-comp-finclusive-caas` (partial→wrong), `q-defi-phoenix-what-is` (partial→wrong),
    `q-gap-leaderboard-project-not-builder`, `q-infra-hubble-bigquery`,
    `q-pc-quantum-preparedness-dormant`, `q-raph-withdraw-exchange-self-custody` (each correct→partial).
  - Up: `q-aas-list-token-on-exchanges-aggregators`, `q-defi-skill-ecosystem-scout`,
    `q-gap-compare-hackathons`, `q-scf-cross-reflector-rounds-current`,
    `q-soroban-contract-build-verification`, `q-tool-greenfield-indexer-prior-art-preflight`
    (partial→correct); `q-edge-fresh-latest-blend-tvl`, `q-sor-deploy-invoke-from-js-sdk`,
    `q-ti-rpc-gettransactions-pagination-xdr` (wrong→partial).
- Unresolved, monitor-only (a fresh grade changed): 8 down (`q-aas-burn-clawback-redemption-mechanics`,
  `q-gap-scout-status-envelope`, `q-hist-quantum-preparedness-plan`, `q-protocol-parallel-execution`,
  `q-raph-claimable-balance-safety`, `q-scf-verified-members`, `q-soroban-sdk-cve`,
  `q-tool-sdk-repos-discovery`), 3 up (`q-defi-arbitrage-pathpayment-bots`, `q-jutsu-cash-crypto-ramps`,
  `q-sor-force-fast-archival-localnet`).
- Reproduction tests judge stability on fixed answers only; it does not measure answering variance.

### Noise read (cross-method, diagnostic only)

B2→B3, same surface, 93 shared valid rows: 23 discordant (16 down, 7 up; 3 two-step). B3→T: 26 of 100
discordant (14 down, 12 up; 3 two-step). The directions differ: all three B2→B3 two-step moves are up,
and all three B3→T two-step moves are down. Per Amendment 1, this read stays out of the B3/T comparison.
It is not a variance estimate; B2 used the old judge stall handling and is non-comparable.

### Plan regrade (free)

B3: 91/100 required covered, mean onPlanRatio 0.97. T: 94/100, 0.96. Wrong with required covered:
B3 10, T 14.

### Surface delta between arms

`git diff 1cc1f3a6 dd8724e5 -- src catalog` touches only `src/mcp/tools.ts`: the `execute` description's
first two paragraphs (no-network and call-scope wording moved first; cap sentence shortened), one
artifact-storage sentence, and annotation changes (`execute` `readOnlyHint` false→true,
`openWorldHint` true→false; `title` copied into both tools' annotations). Search description unchanged.

### Downward-row causal analysis (Codex frontier `gpt-6-astra`, high; `/private/tmp/raven-qa-down-rows.md`)

- All 14 downward rows compared on matching case-input hashes. Primary causes: answering variance 4
  (`q-comp-finclusive-caas`, `q-gap-leaderboard-project-not-builder`, `q-infra-hubble-bigquery`,
  `q-raph-withdraw-exchange-self-custody`), evidence difference 2 (`q-defi-phoenix-what-is`,
  `q-pc-quantum-preparedness-dormant`; different queries/projections, not shown upstream drift),
  golden or judge issue 8 (the eight unresolved rows). Surface-attributable: 0.
- No T script attempts `fetch()`, reacts to the call-scope wording, discusses 7-day retention, or avoids
  artifacts (T reads an artifact in `q-soroban-sdk-cve`). T makes 38 execute calls on these rows vs 24 in
  B3, which rules out general execute avoidance.
- Grading-consistency concerns: `q-raph-claimable-balance-safety` (shared safety omission graded both
  ways), `q-protocol-parallel-execution`, `q-tool-sdk-repos-discovery` (ranked-table rubric reading).
- Answer-quality concerns independent of arm: unsupported "licensed" inference (FinClusive), roadmap vs
  shipped status blur (QPP), narrow projections dropping catalog fields (leaderboard macro block).

### Row review and live verification (Codex workhorse `gpt-6.1-sol`, high; `/private/tmp/raven-qa-row-review.md`, evidence `/private/tmp/raven-row-evidence/`)

- All 200 rows reviewed. 25 original wrong grades over 20 cases: 17 confirmed wrong, 5 judge error
  (`q-gap-scout-status-envelope`, `q-jutsu-cash-crypto-ramps`, `q-scf-verified-members`,
  `q-soroban-sdk-cve`, `q-tool-sdk-repos-discovery`), 3 inconclusive. No whole golden proved stale.
- Five cases are wrong in both arms (`q-defi-wisdomtree-crdt`, `q-eco-defi-market-map`,
  `q-edge-send-me-free-xlm`, `q-n3-missing-funds-account-support`, `q-soroban-oz-upgradeable-macro`).
- Confirmed-wrong T-only rows among the unresolved downs (`q-hist-quantum-preparedness-plan`,
  `q-protocol-parallel-execution`, `q-raph-claimable-balance-safety`) carry the same defect in B3's
  answer (shipping-status blur, activation conflation, missing scam warning); B3's re-judge downgrades
  two of them.
- Surprising passes: B3 `q-raph-claimable-balance-safety`; both arms `q-protocol-ledger-header-fields`
  (inherits a docs defect: `feePool` units, missing `ext`).
- Upstream candidates (not filed in this round; open closeout item): recurrences for `ll-012`, `ll-030`, `ll-025`, `sk-022`; new
  Stellar Docs candidates (`assembleTransaction` example, ledger-header page); Scout exact-advisory-ID
  retrieval; Scout Zenex Live/Testnet conflict.
- Own-repo candidates: skill/artifact envelope `.data` mistakes, unfollowed truncation (26 B3 / 22 T
  rows), invalid input types and enums, invented `codemode.scout.*` namespace, account-support
  capability overclaim, judge evidence-pack omissions, judge scope removal and trap-grading
  inconsistency, wrong-network address passing provenance checks.

## Closeout review (Grok `grok-4.7`, high; `/private/tmp/claude-501/raven-qa-closeout-review.md`)

Reviewer differs from the author (Claude Opus) and both analysis lanes (Codex); Codex frontier was
skipped as the matched tier because it authored the causal lane. Findings and reconciliation:

1. Blocker — the draft added a mechanism gate the rule does not have, and misgrouped the QPP rows (only
   the dormant row is in the reproduced set). Reconciled: the conclusion applies the rule as written
   (reproduced + live-verified downward on 2+ unrelated rows; the round measures the bundle). The four
   unverified correct→partial rows and Phoenix go to live verification before the verdict.
2. Blocker — the clean-summary ban does not apply (no missing or invalid grades); the "no evidence they
   hide a regression" sentence is not allowed wording. Reconciled: sentence removed; the eight
   unresolved rows stay monitor-only with no further claim.
3. Major — the B2→B3 noise read was used inside the B3/T conclusion. Reconciled: removed from the
   conclusion. It stays a separate diagnostic; its split (16/7) and two-step directions (all up) differ
   from B3→T (14/12; all three two-step moves down).
4. Major — core-answer 92%→87% unexplained. Reconciled below: 9 losses, 4 gains; only
   `q-comp-finclusive-caas` is a reproduced loss; `q-eco-defi-market-map` flips core with no score change
   (wrong in both arms, not re-judged); the other 7 losses are unresolved rows. Reproduced gains:
   `q-edge-fresh-latest-blend-tvl`, `q-sor-deploy-invoke-from-js-sdk`.
5. Major — client-visible annotation effects are untested. Claude `2.1.292` maps `readOnlyHint` to
   `isReadOnly()`/`isConcurrencySafe()` and `openWorldHint` to `isOpenWorld()`. Observed in T: execute
   calls 195→214 over 100 rows; `codemode.artifact.read` 8 calls on 5 rows → 3 calls on 2 rows. No
   demonstrated mechanism, and absent wording cannot prove absent influence. Reconciled: the conclusion
   says "no demonstrated mechanism", not "no mechanism", and an annotation-only follow-up is a TODO.
6. Major — closeout items missing. Reconciled: TODO entries added (see `.agents/TODO.md`); upstream
   filings are recorded as candidates and deferred to a TODO, not dropped.

### Live verification of reproduced downs (Codex workhorse; `/private/tmp/claude-501/raven-qa-live4.md`, evidence `/private/tmp/raven-live4-evidence/`)

| Row | Saved pair | Call |
|---|---|---|
| `q-comp-finclusive-caas` | partial → wrong | live-verified downward (row review): unsupported "licensed on/off-ramp" claim |
| `q-gap-leaderboard-project-not-builder` | correct → partial | live-verified downward: live `getLeaderboard` returns the `ecosystem` developer block; T's projection dropped it |
| `q-pc-quantum-preparedness-dormant` | correct → partial | live-verified downward: current QPP keeps the unreachable-holder / forced-cutoff passage B3 gave and T missed |
| `q-infra-hubble-bigquery` | correct → partial | inconclusive: T's omission is real, but B3's credited "about ten-minute lag" overstates the documented schedule |
| `q-raph-withdraw-exchange-self-custody` | correct → partial | inconclusive: the secret-key warning difference is real; B3's procedure also has errors (address-network claim, unconditional 1 XLM) and T has a missed `CreateAccount` error |
| `q-defi-phoenix-what-is` | partial → wrong | golden disputed: avoid 1 forbids even an attributed historical governance plan (SCF #18 says "If approved … utility and governance token") |

No demonstrated between-run source change explains these differences. Document histories apply only
where available (Hubble and withdrawal pages). For the leaderboard, the check is the live `ecosystem`
block, a shared project-index timestamp, and an unchanged schema; for dormant accounts, the passage is
in B3's saved step 8 and on the current page. These checks do not prove source immutability.

## Conclusion

Rule (Reading rules): a regression claim needs reproduced, live-verified downward differences on 2+
unrelated rows. The round measures the change bundle; it does not need a per-edit mechanism.

**Result: the rule flags three reproduced, live-verified downward differences on unrelated rows.**

1. `q-comp-finclusive-caas` (partial → wrong): T added an unsupported "licensed" claim from shared
   marketing evidence.
2. `q-gap-leaderboard-project-not-builder` (correct → partial): T's projection dropped the leaderboard's
   aggregate developer block, which the catalog describes and the live service returns.
3. `q-pc-quantum-preparedness-dormant` (correct → partial): T's queries missed the QPP dormant-holder
   passage that B3 retrieved.

Context that limits this result (it does not cancel the rule):

- None of the three has a demonstrated surface mechanism. The best-supported local explanations are
  synthesis (1), projection (2), and query selection (3); they do not exclude the untested
  client-visible annotation path (TODO).
- Nine upward differences also reproduce. The rule live-verifies only downward rows, so the round has
  no symmetric up count.
- Eight downward and three upward differences are unresolved and stay monitor-only. Phoenix is a
  disputed golden; Hubble and withdrawal are inconclusive.
- Headline aggregates (both arms complete and comparable): half-credit 64.0% → 61.5%, strict 38% →
  38%, core-answer 92% → 87%. Of the 9 core losses, 1 reproduces (FinClusive); 1 has no score change
  (`q-eco-defi-market-map`, wrong in both arms); 7 are unresolved. 2 of the 4 core gains reproduce.
- This is a diagnostic over 100 selected cases, not a battery-wide or release verdict.

Next-step options for the owner: a bounded re-collection of the three flagged rows (several answering
samples per arm) to separate answering variance from a surface effect; the annotation-only TODO; or
accept the bundle, which already shipped and serves the directory listings.

Spend: B1 $7.4799538 + B2 $38.945865 (both lower bounds) + B3 $40.7040512 + T $41.6090044 +
re-judges $4.1597564 = $132.8986308 reported. Each method stayed under its own cap (B1 and B2 $75,
B3 and T $60, re-judges $10 each).

### Closeout delta review (same reviewer; `/private/tmp/claude-501/raven-qa-closeout-delta.md`)

1, 2, 4 resolved. 3, 5, 6 partly resolved and new 7 (source-history overstatement) — reconciled: the
Noise read no longer says "same size"; "Causes are" became "best-supported local explanations"; the
source-change sentence now states the per-row checks and their limits; the account-support overclaim
joined the triage TODO as a recurrence of the existing monitor; the status line is current.

Open closeout item, stated plainly: the upstream candidates are not filed and no "nothing new" note
applies. The `.agents/TODO.md` item "File the 2026-10-07 tool-surface round's upstream candidates"
owns them.

## Follow-up pointer (2026-10-08)

The three flagged rows were re-collected with five fresh samples per arm, plus an annotation-only arm:
[`2026-10-08-flagged-row-recollection.md`](2026-10-08-flagged-row-recollection.md). This pointer changes nothing above.

## Follow-up pointer (2026-10-09)

The upstream candidates and the own-repo candidates were resolved in
[`2026-10-09-backlog.md`](2026-10-09-backlog.md): seven findings filed upstream, four recurrences recorded, and
each own-repo candidate made an item, merged, or rejected. This pointer changes nothing above.
