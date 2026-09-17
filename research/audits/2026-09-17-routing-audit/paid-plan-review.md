> Status: original pre-spend review retained below. M1-B1 completed; later methods paused for corrected goldens.
> Later pin reconciliations follow the original review.

# Pre-spend review: measurement plan v3 and discovery measurement changes

Reviewer: Fable high. Read-only. No edits, paid calls, servers, Git, or nested agents.
Inputs: `evals/measurement-plan-draft-v3.json`; worktree `eval/discovery/{cases.json,lib.mjs,run-discovery.mjs}`;
`test/eval-discovery-cases.test.mjs`; pins under `/tmp/raven-routing-audit-2026-09-17`.

## Verdict

**Approve for spend, conditional on four reconciliations (R1-R4).** None changes method terms or runtime bytes.
The reviewer accepts the stated known risk: a single verified fact loss blocks D3 even if it is answering variance.
Verification requires transcript review plus live re-execution, so that trade-off is sound.

## Verified

| Item | Result |
|---|---|
| Pins | `cases.json` a81df0b9…, `lib.mjs` cad1a9c0…, release view 4ade5f68…, challenge 34edbc2f…, stability cb5fcc19…, `search.ts` 3cc4c140… all match v3 |
| Release view | 57 = 54 challenge questions + 3 known controls; zero overlap with holdout; all `acceptableOps` searchable; rc01/rc02 marked fallback-not-authority as the plan states |
| Discovery label repair | 24 of 43 cases changed; every change removes a `searchable:false` section id or replaces it with its whole skill; each has a body-check reason in `discovery-repair-log.json`; identical file for both arms, so no arm advantage |
| Loader | `loadDiscoveryCases` now rejects unsearchable ids; families, ops, and duplicates validated in one place; `run-discovery.mjs` reuses it and keeps only seed/groundTruth checks; existence check is subsumed by the searchable check |
| Loader test | 5 pass; the extra argument was removed |
| Runners | `run-qa --ids` keeps battery (id-sorted) order, matching `executionOrder`; `--max-budget-usd`, `--server-revision`, binary and environment sha flags are required; `run-agent-discovery` has the same preconditions and `--url`; `run-qa` targets `--port` |
| Budget arithmetic | 60+20+24+30+24 = 158; reserve 92; cap 250 |
| Reading rules | Verified loss blocks in one replicate; replicates diagnose only; qa-paired recorded INDETERMINATE |
| M3/M4 | One run per arm, variance claims forbidden; matches the removed repeats |

## Reconciliations required before launch

- **R1. Server port and URL.** Baseline server is on 8793. `run-qa` defaults to 8788 and `run-discovery`/`run-agent-discovery` default to `localhost:8788`. Every command must pass `--port 8793` or `--url http://localhost:8793`, and the candidate session must state its port. Record the exact command arrays in the plan.
- **R2. M1 per-run budget.** 16 rows at the observed max ($1.20) is $19.2, above the $15 budget. Exhaustion leaves an incomplete run and breaks per-ID pairing for that replicate. Raise the M1 per-run budget to $20 (ceiling $80; allocation $178; reserve $72), or accept and state that an incomplete M1 run voids its pair.
- **R3. Cost evidence tuple.** No stored run uses pack p6 or rubric v2.10. The $0.38-0.41 mean and $1.20 max come from p5 with v2.8-v2.9. Record this as a proxy in the plan. Discovery costs ($5.33-$9.83 per 43-case run) are confirmed from stored `agentCost`.
- **R4. Candidate pin.** `pinned: false`. Insert the clean candidate commit SHA and re-hash `search.ts`, `cases.json`, `lib.mjs`, and `run-discovery.mjs` from that commit. Both arms must run the committed discovery files.

## Recommendations (non-blocking)

- Add a checkpoint after M2-C1b: re-judge the Soroswap rows (about $2) before M3-C1 and M4-C1 spend about $27.
- State the session confound: C1 and C2 share one server session; B1 and B2 do not.
- Write M4 results outside the implementer's worktree; the release view carries challenge questions.
- The phase-0 free one-shot discovery run needs the live server, so it belongs to the session owner, not to a reviewer without server rights.

## Exclusions

Not run by the reviewer: any server, `run-discovery.mjs`, paid runners. No holdout or challenge question text or IDs appear here.

---

Status: this approved plan produced the M1-B1 pilot. Later collection paused for verified golden corrections.
See the round ledger for the current plan and spending record.

# Paid plan v3 and measurement review (final, pre-spend)

- Reviewer: Fable high (route-audit-direction). Coordinator: root Astra. Author of D3: Opus code lane.
- Mode: read-only. No edits, paid calls, servers, Git commands, or nested agents.
- Inputs reviewed:
  - `/tmp/raven-routing-audit-2026-09-17/evals/measurement-plan-draft-v3.json`
  - Worktree `/tmp/raven-routing-audit-2026-09-17/repo`: `eval/discovery/cases.json`, `eval/discovery/lib.mjs`,
    `eval/discovery/run-discovery.mjs` (root's shared-loader change), `test/eval-discovery-cases.test.mjs`
  - Pins under `/tmp/raven-routing-audit-2026-09-17`: `stability.json`, `remote-vector.json`, `remote-stable.sha256`,
    `agent-pins.json`, `evals/pins-v2.sha256`, `evals/challenge-set-v1.json`, `evals/challenge-discovery-cases-release.json`,
    `evals/discovery-repair-log.json`, `evals/stored-costs.json`
  - Baseline server: port 8793 at `848edec4`. Candidate product: D3 only. Source-authority wording is separate and not implemented.
- Exclusions: no holdout or challenge question text or case ID appears in this file. The reviewer did not start a server and did
  not run `run-discovery.mjs`, `run-agent-discovery.mjs`, or `run-qa.mjs`.

## 1. Verdict

**Approve for paid collection, conditional on reconciliations R1-R4 below.** None of them changes method terms, case
membership, budgets beyond one stated per-run raise, or runtime bytes.

The reviewer explicitly accepts the plan's stated known risk: a single verified fact loss on any control or on the Soroswap
case blocks D3 even when it turns out to be answering variance. This is the correct trade-off because "verified" requires a
paired baseline row, transcript review, and live re-execution, and because no paid result may override a verified loss of
required facts.

## 2. What was verified

### 2.1 Pins and frozen inputs

| Pin | Expected (v3) | Observed | Match |
|---|---|---|---|
| `repo/eval/discovery/cases.json` | a81df0b9… | a81df0b9a6867d33… | yes |
| `repo/eval/discovery/lib.mjs` | cad1a9c0… | cad1a9c0dbc491c7… | yes (unchanged after root's run-discovery edit) |
| `evals/challenge-discovery-cases-release.json` | 4ade5f68… | 4ade5f684a4c0410… | yes |
| `evals/challenge-set-v1.json` | 34edbc2f… | 34edbc2fe99dd560… | yes |
| `stability.json` | cb5fcc19… | cb5fcc194bccdd5e… | yes |
| `repo/src/catalog/search.ts` (provisional) | 3cc4c140… | 3cc4c140e323448e… | yes |
| Baseline manifest | da21ab9a… | da21ab9ab7859bb3… | yes |
| Candidate commit | not pinned (`pinned: false`) | root to insert clean SHA | R4 |

### 2.2 Release discovery view (M4 input)

- 57 cases = 54 challenge questions + 3 known issue #167 controls (`kc1`-`kc3`).
- Zero question overlap with the blind holdout (case-folded exact match over all 57).
- Every `acceptableOps` id is a searchable manifest entry.
- The six `rc01*`/`rc02*` rows are `rwa-positive` cases whose routes are directory or semantic fallbacks; their notes carry
  "fallback-not-authority", consistent with the plan's grading note that they are not authority passes.
- Family counts across the view: lumenloop 15, scout 27, skills 33, stellarDocs 24.

### 2.3 Discovery label repair (`eval/discovery/cases.json`, 24 of 43 cases changed)

- Every change either removes a `searchable: false` skill-section id from `acceptableOps` or replaces it with the parent
  whole-skill id. Where a case then had no gradable skills route, `skills` was dropped from `expectedFamilies`.
- `evals/discovery-repair-log.json` records a body-check reason per removal (for example "pinned data body has no offer,
  trade, or order-book coverage").
- No question text changed. No id added or removed. The same file feeds both arms, so the repair cannot favor either arm.
- The affected D3 case `agentic-lumenloop-q-defi-soroswap-what-is` is not among the 24 changed rows.

### 2.4 Shared loader (`eval/discovery/lib.mjs`)

- `loadDiscoveryCases(casesPath, { manifestPath })` now builds the searchable id set from the manifest and rejects any
  `acceptableOps` id that search can never rank (skill sections) or that is absent from the manifest.
- It validates id, question, duplicates, `expectedFamilies` membership in the four families, and non-empty `acceptableOps`
  for labeled cases; unlabeled cases still need a valid `expected_service`.
- `meta` now carries `schemaVersion`, `authoredAt`, and `contract` (null when absent).

### 2.5 Root's `run-discovery.mjs` shared-loader change (reviewed)

Diff summary:
- Imports `loadDiscoveryCases` and drops the local `FAMILIES` set.
- `loadCases` calls the shared loader, then keeps only the free-lane extra checks: required fields present, `seed.pool` and
  `seed.ref`, `groundTruth` in {authored, provisional}, and `groundTruthNote` for provisional cases.
- `validateManifestIds` is replaced by `manifestSummary`, which returns `generatedAt`, `version`, and `entryCount` only.

Assessment: correct and safe.
- The removed duplicate validation (families, non-empty ops, duplicate ids, id existence in manifest) is fully covered by the
  shared loader. The searchable check is strictly stronger than the old existence check, so free and paid discovery now
  apply the same guard.
- `meta` from the loader is a superset of the old `{ schemaVersion, authoredAt }`.
- `entryCount` now counts all manifest entries, the same value the old id set had (ids are unique by `loadManifest`).
- `DEFAULT_URL` stays `http://localhost:8788` (see R1).

### 2.6 Loader test (`test/eval-discovery-cases.test.mjs`)

- Untracked new file. 5 tests pass: rejects a section id, rejects a missing id, accepts whole skills and operations, loads the
  committed cases against the committed manifest, and requires every expected family to be backed by an acceptable op.
- The ignored extra argument in the first test was removed; `labeled(...)` now takes one argument on all three call sites.

### 2.7 Runners and flags relied on by the plan

| Runner | Verified |
|---|---|
| `eval/qa/run-qa.mjs` | `--ids` filters the id-sorted battery and preserves battery order, so the plan's `executionOrder` (alphabetical) is what runs. `--max-budget-usd`, `--server-revision` (40-hex commit), `--expect-agent-binary-sha256`, `--expect-agent-environment-sha256` are required. Server target is `--port` (default 8788). |
| `eval/discovery/run-agent-discovery.mjs` | `withPaidRunPreconditions` requires the same binary/environment sha flags and `--max-budget-usd`; `--url`, `--cases`, `--model`, `--effort` present; results go to `eval/discovery/results/<stamp>.json` under the running checkout. |
| `eval/discovery/run-discovery.mjs` | free one-shot lane; needs a live server (`--url`, default 8788). |
| `eval/qa/re-judge.mjs` | `--flips-vs <baseline.json>` and `--max-budget-usd` present; refuses empty flip sets unless `--allow-empty`. |

### 2.8 Control set for M1 (16 ids)

All 16 ids exist in `eval/qa/cases.json` (501 active). Strata match `tags.service`: affected and same-mechanism neighbors are
Lumenloop-tagged "what is" cases; docs, Scout, Lumenloop, and skills authority strata each map to their tagged service.
The Soroswap case surface lists Lumenloop entity/detail operations, so an answer-level loss would have to be traced to the
lost `scout.searchProjects` route by transcript, as the reading rule requires.

### 2.9 Budget arithmetic and pairing

- Ceilings: M1 60 + M2 20 + M3 24 + M4 30 + M5 24 = 158. Reserve 92. Cap 250. Correct.
- Pairing: M1 C1↔B1 and C2↔B2 per id; M2 a/b pairs per session; six Soroswap observations per arm. Correct.
- M3/M4: one run per arm; within-arm discovery variance claims are forbidden. Consistent with the removed repeats.

### 2.10 Reading and stop rules

- Verified loss is defined at row level with paired baseline, transcript review, and live re-execution.
- Any verified loss blocks in one replicate; replicates and re-judge diagnose only. This matches the coordinator's instruction
  that repeats never excuse a verified fact loss.
- Judge-reversed, transcript-unconfirmed differences are monitor-only. qa-paired output is INDETERMINATE.
- Stops: remote identity change or probe failure, budget exhaustion, non-comparable artifact, revision mismatch after restart,
  verified exposure/exact-ID/security regression. Adequate.

## 3. Reconciliations required before launch

- **R1. Server port in every command.** The baseline server runs on 8793. `run-qa` defaults to port 8788; `run-discovery` and
  `run-agent-discovery` default to `http://localhost:8788`. Every M1-M4 command must pass `--port 8793` (run-qa) or
  `--url http://localhost:8793` (discovery), and the candidate session must state its port. Record the exact command arrays
  in the plan so the supervisor and the artifacts agree.
- **R2. M1 per-run budget.** 16 rows at the observed per-row maximum ($1.20) cost $19.2, above the $15 per-run budget.
  The runner enforces the budget by leaving ids unattempted, which produces an incomplete run and breaks per-id pairing for
  that replicate. Either raise M1 to $20 per run (ceiling $80; allocation $178; reserve $72; cap unchanged), or state in the
  reading rules that an incomplete M1 run voids its paired replicate and cannot be used for any claim.
- **R3. Cost evidence tuple.** `stored-costs.json` has no run with pack `p6` or rubric `v2.10`. The quoted per-row mean
  ($0.38-0.41), p90 ($0.61), and max ($1.20) come from `p5` runs judged with `v2.8`-`v2.9`. Record them as a proxy for the
  v3 tuple. Discovery costs are confirmed: stored 43-case agent runs show `agentCost` $5.33-$9.83.
- **R4. Candidate pin.** Root inserts the clean candidate commit SHA and re-hashes `src/catalog/search.ts`,
  `eval/discovery/cases.json`, `eval/discovery/lib.mjs`, and `eval/discovery/run-discovery.mjs` from that commit. Both arms
  must run the committed discovery files by absolute path; the baseline server at `848edec4` does not contain the repaired
  loader, so the discovery runners must be invoked from the candidate checkout (or an identical copy) against the baseline
  server URL. State this in the plan.

## 4. Non-blocking recommendations

1. Add a checkpoint after M2-C1b: re-judge the Soroswap rows (about $2) before M3-C1 and M4-C1 spend about $27 on the
   candidate. A verified Soroswap loss there stops the session early.
2. State the session confound: C1 and C2 share one candidate server session while B1 and B2 are separate sessions.
3. Write M4 results outside the implementer's worktree; the release view carries challenge questions, and the implementer
   must not see per-case outputs.
4. The phase-0 free one-shot discovery run needs the live server, so it belongs to the session owner.

## 5. Reproduction (read-only)

```
cd /tmp/raven-routing-audit-2026-09-17
shasum -a 256 repo/eval/discovery/cases.json repo/eval/discovery/lib.mjs evals/challenge-discovery-cases-release.json \
  evals/challenge-set-v1.json stability.json repo/src/catalog/search.ts
cd repo && git status --short && git diff eval/discovery/lib.mjs eval/discovery/run-discovery.mjs
npx vitest run test/eval-discovery-cases.test.mjs                      # 5 passed
node -e '<compare HEAD:eval/discovery/cases.json vs worktree per case>' # 24 changed rows, section ids removed or replaced
node -e '<release view: 57 cases; 54 in challenge; 0 in holdout; all acceptableOps searchable>'
grep -n -- '--max-budget-usd\|--server-revision\|--port\|--url' eval/qa/run-qa.mjs eval/discovery/run-agent-discovery.mjs eval/discovery/run-discovery.mjs
node -e '<stored-costs.json: rows with pack p6 or rubric v2.10 -> none; discovery agentCost 5.33..9.83>'
```

## 6. Related records

- D3 code and test review: `/tmp/raven-routing-audit-2026-09-17/d3-review.md` (conditional accept; the real-query absence
  assertion was deleted by the coordinator and verified removed; 65 tests pass, 3 skipped).
- Direction audit and reconciliation: `/tmp/raven-routing-audit-2026-09-17/direction-review.md`.
- Earlier v3 note: `/tmp/raven-routing-audit-2026-09-17/plan-v3-review.md` (superseded by this file).

## 7. Reconciliation confirmation (after R1-R4 response)

Worktree state: clean at `d4cac5a9`. Three commits above `848edec4`:
`181d5b0f` (D3: `src/catalog/search.ts` + synthetic tests), `26f64237` (RWA control activation, test only),
`d4cac5a9` (discovery measurement repair, loader test, records). The only production runtime path touched is
`src/catalog/search.ts` (hash `3cc4c140e323…` at HEAD). `test/drift-141-routing.test.ts` at HEAD has no real-query
absence assertion and carries `exposesRwa`.

Verified at HEAD: `lib.mjs` cad1a9c0…, `cases.json` a81df0b9…, `run-discovery.mjs` 0bcb6512…,
`test/eval-discovery-cases.test.mjs` 5aa50e6d…. `discovery-repair-log-final.json` lists exactly the 24 changed cases and
its after-state equals the committed `cases.json`.

Ledger `.agents/rounds/2026-09-17-routing-audit.md` records all four reconciliations: port 8793 in every command; M1 $20
per run with $178 allocation and $72 reserve; historical QA cost as a p5/v2.8-v2.9 proxy; incomplete M1 voids its pair;
C1/C2 session confound; fresh questions and results sealed from the implementer.

Remaining items are mechanical pins only:
1. Regenerate the plan file: `evals/measurement-plan-draft-v3.json` on disk still says M1 $15, allocation 158, reserve 92,
   and has no port text. Emit the reconciled plan (or a v3-final) with the exact command arrays, then re-hash it.
2. Re-emit `evals/FROZEN-v3.sha256`: it pins the pre-fix test file (3a354c93…, now 5aa50e6d…) and the unreconciled plan
   (75a38723…); add `eval/discovery/run-discovery.mjs` (0bcb6512…).
3. Insert the candidate SHA. If `d4cac5a9` is the final measurement commit, it is clean and carries the reviewed bytes.
4. Note for the command arrays: `run-agent-discovery.mjs` defaults to `localhost:8787`, `run-discovery.mjs` to `8788`,
   `run-qa.mjs` to port 8788. All must pass 8793 explicitly.

No method term, budget beyond the agreed M1 raise, case membership, or runtime byte changes. Approval stands once the
three pin files are regenerated. No paid calls were made.

## 8. Final mechanical pre-spend check of `paid-plan.json`

File: `/tmp/raven-routing-audit-2026-09-17/paid-plan.json`, SHA-256 `3c43f21c23ed3101873250d810d8262431becd0347cca3720c0dc913dce03218` (matches the coordinator's value).

Verdict: **APPROVED for M1-M4 launch**, subject only to the coordinator's own gate that the live S1 remote-identity
capture equals the pinned vector `681943c4…` (`remote-stable.sha256`). M5 arrays are deferred to a separate check once
result paths exist, as the plan states.

Checked:
- Candidate pin `d4cac5a991358475f55c8a7cf0a3065ce40275d2`: the worktree HEAD is that commit and the tree is clean.
  `src/catalog/search.ts` at HEAD is `3cc4c140e323…`. Runner cwd is the worktree; `runner.sameForBothArms` is true and the
  three commits above baseline touch no `eval/qa`, `src/mcp`, or `src/server.ts` file, so the same runner bytes serve both arms.
- `filePins`: all seven match disk or HEAD (`search.ts`, `manifest.json` da21ab9a…, discovery `cases.json` a81df0b9…,
  `lib.mjs` cad1a9c0…, `run-discovery.mjs` 0bcb6512…, `eval/qa/cases.json` 7d5e4dcc… at both revisions, probe script bde386a0…).
- `frozenInputs`: challenge 34edbc2f…, release view 4ade5f68…, historical dfa0025c…, loader cad1a9c0… all match.
  The `discoveryRepaired.path` text still says "(commit it before launch)"; the hash is correct and the commit exists. Cosmetic only; do not edit the pinned file.
- Command arrays (M1-B1/C1/C2/B2, M2 eight runs, M3-B1/C1, M4-B1/C1): every flag is in the runner's fail-closed value-flag
  list. Port 8793 on every run-qa call; `--url http://localhost:8793` on every discovery call. `--server-revision` is the
  40-hex baseline or candidate SHA per session. `--ids` order equals `executionOrder` and the id-sorted battery.
  `--max-budget-usd` equals the method's per-run budget (20, 2.5, 12, 15). Binary and environment sha flags match the tuple.
  `--expect-remote-identity-sha256` equals `remote-stable.sha256`; `--expect-remote-identity-probe-sha256` equals the probe file hash.
- `--expect-sha256 ff66f1f8…` is the live MCP surface identity (instructions + serialized tools) captured from
  `http://localhost:8793/mcp` at `848edec4` on 2026-09-17T00:41Z. Both runners assert it live before any paid call and refuse
  collection on mismatch. D3 changes no tool description, schema, or instruction, so the candidate server should serve the same
  value; if it does not, the runner stops, which is the correct behavior. The different `9da12614…` in `baseline-mcp-surface.json`
  is the static report's serialization and is not the runner's metric.
- Rubric `v2.10` and pack `p6` are the code constants at HEAD; `--judge-model`, `--max-panel-cases 10`, and
  `--stability-register` (cb5fcc19…) match the tuple.
- Budgets: 80 + 20 + 24 + 30 + 24 = 178; reserve 72; cap 250. Per-run budgets cover observed maxima (M1 19.2, M2 1.2, M3 9.83, M4 13.1).
- R1-R4 reconciled in the file: port flags present; M1 $20; cost evidence marked proxy; candidate pinned. Reading rules
  include the incomplete-M1 voids-pair rule, the session confound, and the sealed fresh output.

No edits, servers, or paid calls by the reviewer.

## 9. Environment-pin correction (final command review addendum)

`paid-plan.json` now hashes `46ee65a000553e5016a8f967f47e37e0bb2689e155fb2dbfeccf870a898be87c`.
`tuple.agentEnvironmentSha256` and all 16 M1-M4 command arrays carry
`a460b90255f52a7714f9645701eca60f045c7a10c19dacbe4a2d9c99536212a6`; the old value `7a628915…` appears nowhere.
Binary pin `3509913f…` is unchanged in the tuple and every array. `environmentPinNote` records the reason.

Consistency with the runner: `agentEnvironmentIdentity` (`eval/lib/executable-identity.mjs`) hashes the sorted
name/value pairs of `CI`, `HOME`, `NODE_OPTIONS`, `PATH`, `SHELL`, `TMPDIR`, and every `ANTHROPIC_*`, `CLAUDE_*`,
`RAVEN_CLAUDE_*`, and `QA_AGENT_PROMPT_APPEND` variable. `PATH` is in the set, so a cwd-dependent `PATH` changes the
hash while leaving the binary pin intact. Both arms launch every runner from the candidate worktree cwd
(`runner.cwd`, `sameForBothArms: true`), so the pin is identical across arms and is asserted fail-closed before the
first paid call in each run.

Live gate status: `s1-surface-final.json` (2026-09-17T01:03Z, `http://localhost:8793/mcp`, source revision `848edec4`)
serves `surfaceSha256 ff66f1f8…`, equal to every array's `--expect-sha256`. The remote-identity pin remains `681943c4…`.

Verdict: **APPROVED**. No method or code change. One non-blocking record request: keep the preflight receipt showing
`variableNames`/`variableCount` for the original and candidate cwd, so the "PATH only" attribution is auditable. If any
`ANTHROPIC_*`, `CLAUDE_*`, or `NODE_OPTIONS` name differs between the two, note it in the ledger; it does not affect
arm comparability (same cwd for both arms) but it does affect comparability with the historical cost proxies.

## 10. Command review closed

Root ran `agentEnvironmentIdentity` from the root launch context in both cwd values: only `PATH` differs, and the
candidate cwd yielded `a460b902…` twice. Both arms launch from that cwd, and each runner asserts the pin before spend.
The non-blocking record request in section 9 is satisfied by that statement; no receipt from the reviewer's own
context is relevant, because the reviewer's Herdr Claude context is not the launch context.

Final state: M1-M4 command arrays approved as pinned in `paid-plan.json` (`46ee65a0…`). Remaining launch gate is the
coordinator's: the live S1 remote-identity capture must equal `681943c4…`. M5 arrays receive a separate check once
result paths exist. No further review is open on this plan.

## 11. Realpath correction and bounded replacement launch: APPROVED

Defect confirmed: `run-qa.mjs:2228`, `run-agent-discovery.mjs:640`, and `probe-remote-identities.mjs:407` guard `main`
with `import.meta.url === pathToFileURL(process.argv[1]).href`. `import.meta.url` resolves through the real path
`/private/tmp/…`, while the arrays passed the `/tmp/…` symlink form, so the guard was false and the process exited 0
without running. Evidence: `M1-B1-noop-start.json` (01:10:15Z, plan `46ee65a0…`), empty `M1-B1-noop.log`, no file in the
worktree `eval/qa/results`, no paid call.

Correction verified: `paid-plan.json` now hashes `6fb45829ba79a0af1a9739d680eb2241b7317c44ba3f5d4ff8481288d482e072`.
Field-level diff against `paid-plan-pre-canonical-paths.json` shows 29 changes: 16 runner executables and 12
`--remote-identity-probe` paths rewritten to `/private/tmp/…`, plus one new `pathCorrection` note. No flag, budget,
id list, revision, surface, binary, environment, or method term changed. Data-file arguments (`stability.json`,
discovery `cases.json`, release view) keep the `/tmp/…` form; they are read by content, not compared as module URLs,
and their pins are content hashes, so no change is needed. The probe file at its real path still hashes `bde386a0…`,
matching every array's `--expect-remote-identity-probe-sha256`.

Gates: `remote-stable-s1.sha256` and `canonical-probe.sha256` both read `681943c4…`, equal to every array's
`--expect-remote-identity-sha256`; the S1 surface capture serves `ff66f1f8…`. `paid-authorization.json` references
plan `6fb45829…`, supersedes `46ee65a0…`, scope "exact M1-M4 arrays only, one execution each, no automatic retries",
spend $0. The no-op run made zero calls, so the replacement M1-B1 is the first execution of that array.

Decision: approve the bounded replacement launch of the corrected M1-M4 arrays. One note, non-blocking: keep
`runner.cwd` exactly the string used for the root-context environment verification (`/tmp/…/repo`), since the
environment pin includes a cwd-dependent `PATH`.

No edits, servers, or paid calls by the reviewer.
