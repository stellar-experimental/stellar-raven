# MCP quality improvement execution plan

Status: ready for implementation planning, not authorized for paid execution or deployment.

> [!IMPORTANT]
> **Tooling note, 2026-08-25.** This plan was written against Solo, which this repository no longer
> uses. Ignore every Solo mechanic in it: `fan-solo`, `solo-orchestrate-agents`, `Owner: Solo todo`,
> and "the existing Solo `dev` process". Use `AGENTS.md` “Coordination” and the global `herdr`
> skill for orchestration, `.agents/TODO.md` for ownership, and a pane already running `npm run dev`
> for the local server. The plan's technical content is unchanged and still current; only its
> tooling references are dead.

Date: 2026-08-17.

Parent evidence: `solo://proj/49/scratchpad/mcp-eval-learning-an--811`, revision 11.

Drafted from repository revision `b5ba1a435328f3953ce5f3868b164bd70a895ca4`.

Related Solo todos: 1566, 1567, 1568, and 1569.

## Purpose

This plan turns the 2026-08-14 quality review into a safe execution sequence.

The sequence repairs measurement before it changes MCP behavior.

Each product change must show a general mechanism and a reviewed quality gain.

The main MCP service is the only product surface in scope.

The Playground is outside this plan.

No work may weaken the MCP service to simplify the Playground.

## Required outcome

The work must produce five outcomes.

1. The judge receives a truthful bounded evidence pack.
2. The eval runner classifies provider and runner failures correctly.
3. The team can prove whether truncation caused each suspected miss.
4. Artifact continuation works through the existing MCP contract.
5. Any shipped product change improves reviewed answers without a verified regression.

A higher aggregate score alone does not prove a product gain.

## Evidence baseline

The 2026-08-14 run provides diagnostic evidence.

It does not provide a current-revision product baseline.

The paid run used server revision `70726884a723786c669283953f576277ce9d955b`.

This plan was drafted at revision `b5ba1a435328f3953ce5f3868b164bd70a895ca4`.

| Measurement                         |                           Reviewed value | Meaning                                                   |
| ----------------------------------- | ---------------------------------------: | --------------------------------------------------------- |
| Clean QA response rows              |                                      117 | 100 main, 15 live, and 2 digest final-answer rows         |
| Tainted agentic workflow rows       |                                       60 | Separate grade-only artifact; 44 accepted and 16 rejected |
| Execute calls                       |                                      272 | Calls in the 117 QA rows                                  |
| Truncated execute results           |                                       82 | Events across 64 rows                                     |
| Rows with truncation                |                                       64 | 54.70% of QA response rows                                |
| Rows using `codemode.artifact.read` |                                       15 | Rows with static read call sites                          |
| Static artifact read call sites     |                                       36 | Textual source occurrences, not runtime calls             |
| Read-containing execute results     |                                       36 | Executes with a static read call site                     |
| `readExecutes` partition            |                       19 / 6 / 9 / 0 / 2 | Bounded, truncated, guard-failed, host-denied, other-failed |
| `readOutcomes` partition            |                               0 / 0 / 36 | Successful, denied, indeterminate                         |
| `finalProjection` across 117 rows   |                             102 / 4 / 11 | None, truncated, bounded                                  |
| Confirmed judge pack-loss defects   |                                        2 | Beans and indexer exact facts were absent                 |
| Stored verdicts, all 117 rows       |                     59C / 39P / 18W / 1E | Stored results, before root-cause review                  |
| Stored main verdicts                |                     45C / 39P / 15W / 1E | The 100 main rows of that total                           |
| Reviewed wrong causes               | 5 agent / 4 judge / 8 upstream / 1 craft | Manual root-cause classes for all 18 wrong rows in the 117 |
| Median final-turn input             |                            83,560 tokens | No context exhaustion signal                              |
| Interpolated p95 final-turn input   |                         118,804.8 tokens | Recomputed from the stored 117-row set                    |
| Maximum final-turn input            |                           174,145 tokens | No context overflow occurred                              |

An earlier draft of this table reported 25 successful post-read executes and 11 failures. Both
figures used a superseded definition. The 25 were 19 bounded plus 6 truncated completions. The 11
were 9 guard failures plus 2 other failures.

Neither figure was a read success. A read is proven successful only when the execute completed
and its own visible result body parses as an object with `ok: true`. No saved execute meets that
bar, so `readOutcomes.successful` is 0 and all 36 are indeterminate.

The single error was `q-n3-ssrf-metadata-endpoint`.

Two runs produced the same provider safeguard result before any MCP call.

The error was not a Raven failure.

The run did not justify a larger execute-result cap.

The run did not justify automatic artifact reads.

The 60 agentic rows are not part of a clean 177-row denominator.

Their reconciliation reports `tainted=true` with 44 accepted and 16 rejected rows.

## Fixed decisions

These decisions apply to every phase.

- Keep the current model-boundary result cap during the measurement phases.
- Keep artifact ownership, expiry, size, and read limits unchanged.
- Keep `globalOutbound: null` for model-authored code.
- Keep the manifest as the exposed surface.
- Keep exact-match operation and skill resolution.
- Keep soft-empty, error, and data outcomes distinct.
- Keep large results out of final answers.
- Keep artifact identifiers out of final answers.
- Do not add automatic artifact reads.
- Do not use `resource_link` as the primary continuation path.
- Do not duplicate large payloads in text and structured content.
- Do not add a Playground dependency.
- Do not add a per-question production rule.
- Do not add a compatibility flag for an experimental response shape.

An experiment can use separate revisions or worktrees.

It must not ship two production contracts.

## Architecture and test seams

The work must use the smallest stable interfaces.

The interface is the test surface.

| Module                                | Interface                               | Responsibility                                                  | Primary tests                          |
| ------------------------------------- | --------------------------------------- | --------------------------------------------------------------- | -------------------------------------- |
| `eval/qa/evidence-pack.mjs`           | `buildTranscriptEvidencePack`           | Select bounded judge evidence from saved transcripts            | Focused evidence-pack fixtures         |
| Planned agent-result parser           | One pure parse function                 | Convert Claude stream JSON into one structured outcome          | Saved stream fixtures, including q-n3  |
| `eval/qa/run-qa.mjs`                  | Runner command and stored result schema | Spawn the agent and persist the parsed outcome                  | Stored-judge and runner contract tests |
| `eval/qa/re-judge.mjs`                | Saved-answer re-judge command           | Apply a current judge tuple to a revision-pinned case snapshot  | Historical snapshot guard tests        |
| `src/executor/run.ts`                 | `createExecuteRunner` result            | Apply redaction, truncation, source basis, and artifact storage | Real Dynamic Worker smoke tests        |
| `codemode.artifact.info/read`         | Existing `{ ok, data }` envelope        | Recover an owner-bound full result                              | Provider and smoke tests               |
| `eval/qa/analyze-composition.mjs`     | `analyzeRow` and summary output         | Report transcript composition and truncation                    | Analyzer fixture tests                 |
| `eval/qa/compare-architecture-ab.mjs` | `analyzeArchitectureRow`                | Report usage, tool calls, and errors                            | Architecture comparison tests          |

Do not create a general eval framework.

Extract a parser only because production and fixture adapters will both use it.

Keep parsing details inside that module.

Extend an existing analyzer when its interface already owns the metric.

Create a narrow audit script only when no existing interface fits.

## Work graph

The execution has six gates.

```text
Gate 0: freeze evidence and free baseline
  ├─ Gate 1A: repair evidence-pack integrity (todo 1568)
  └─ Gate 1B: add runner and continuation diagnostics (todo 1566)
       └─ Gate 2: complete causal audits (todo 1569)
            └─ Gate 3: select or reject product experiments
                 └─ Gate 4: run a paid targeted A/B (todo 1567)
                      └─ Gate 5: run broader verification, if justified
```

Gates 1A and 1B can run in parallel.

Gate 2 can collect evidence while those lanes run.

Gate 2 cannot finalize causes before both lanes pass.

No product experiment starts before Gate 2.

No paid run starts before Gate 3.

## Gate 0: freeze evidence and the free baseline

### Objective

Create a reproducible starting point before any implementation.

### Actions

1. Record the runner revision and the server revision separately.
2. Record `git status --porcelain=v1 --untracked-files=all` and its SHA-256.
3. Record the manifest, runner, evidence-pack, rubric, and corpus hashes.
4. Record the exact 64 truncated row identifiers.
5. Record the exact 15 artifact-reading row identifiers.
6. Record the two confirmed judge pack-loss row identifiers.
7. Record the two initial tail-loss candidates.
8. Select six truncated-correct controls before reading target outcomes.
9. Select controls across services, result sizes, and read behavior.
10. Save the selection in a dated reviewed record.

The initial tail-loss candidates were these rows.

- `q-defi-wisdomtree-crdt`
- `q-soroban-auth-recursion-dos-audit`

The free audit reclassified both rows as upstream or retrieval concerns.

They do not justify a model-boundary projection change.

The confirmed judge pack-loss rows are these rows.

- `q-tool-indexer-repos-discovery`
- `q-live-beans-cross-service-reconcile`

The extraction controls are these rows. They are controls, not confirmed pack-loss defects.

- `q-infra-horizon-vs-rpc`
- `q-scf-ecosystem-listing-partner-jobs`

### Free preflight

Run these commands before code changes.

```sh
npm run eval:selftest
npm run eval:compile
npm run eval:qa:compile
npm run eval:qa:lint -- --stale
npm run eval:routing -- --gate
```

Compilation must leave generated files unchanged.

Any existing failure becomes a recorded baseline condition.

Do not hide or reclassify a failure.

### Gate 0 acceptance

- The current tree and all input hashes are recorded.
- The target and control identifiers are fixed.
- The free gates pass or have an explicit baseline exception.
- No paid call occurs.

## Gate 1A: repair evidence-pack integrity

Owner: Solo todo 1568.

### Current defect

`eval/qa/evidence-pack.mjs` has a 12,000-character maximum.

At the frozen baseline, its `PACK_VERSION` was `p3`.

At that baseline, `tryParseJsonPrefix`, `shapeLine`, and `truncationLine` detected
`--- TRUNCATED ---` only.

Current execute results use `--- SOURCE BASIS ---`.

The pack can therefore report a false `truncated=0` value.

The pack can also fail to parse the JSON prefix.

### Implementation contract

1. Add one result splitter inside `eval/qa/evidence-pack.mjs`.
2. Detect `--- SOURCE BASIS ---`, legacy `--- TRUNCATED ---`, and console boundaries.
3. Parse only the result body as JSON.
4. Preserve a bounded source-basis summary separately.
5. Keep exact identifiers, dates, amounts, URLs, and matched field names.
6. Keep candidate-claim snippets deterministic.
7. Keep HTTPS URL sanitization.
8. Keep scraped text untrusted.
9. Keep the total pack within `EVIDENCE_PACK_MAX_CHARS`.
10. Increment `PACK_VERSION` because selection and serialization will change.

Do not raise the pack limit as the primary fix.

Do not send the complete transcript to every judge.

### Full-transcript support check

Add a free post-judge support check.

The check reviews claims labeled unsupported or fabricated.

It compares exact identifiers, numbers, dates, URLs, and field names with the saved transcript.

It also compares the saved transcript with the evidence pack.

The check must flag a pack omission.

It must not silently change a verdict.

It must require transcript review or an identical-input re-judge.

This check remains diagnostic.

It does not change `JUDGE_RUBRIC` unless score semantics also change.

### Deterministic fixtures

Create minimal fixtures from these real failure shapes and controls.

- Beans IDs, dates, and SCF rounds.
- Indexer repository names and exact URLs.
- Horizon and RPC distinctions as an answer-craft extraction control.
- Ecosystem partner-job fields as a post-run golden-drift extraction control.
- A large correct control with `--- SOURCE BASIS ---`.
- A legacy result with `--- TRUNCATED ---`.
- A stable case that must still receive no transcript pack.
- A result containing instruction-like scraped text.

The fixtures must contain only required fields.

They must not copy large production transcripts.

### Focused tests

The tests must prove these outcomes.

- The source-basis marker sets `truncated=1`.
- The JSON prefix parses before the source-basis block.
- Each required exact fact enters the pack.
- The pack hash is deterministic.
- The pack never exceeds its configured maximum.
- HTTPS sanitization removes credentials, queries, and fragments.
- Legacy results remain readable.
- Stable cases remain corpus-blind.
- A changed pack blocks incompatible stored judging.
- Primary and re-judged verdict files remain separate.

### Gate 1A acceptance

- Both confirmed judge pack-loss fixtures retain their support.
- Both extraction controls retain their exact saved-transcript evidence.
- Six fixed correct controls retain their required support.
- The pack stays bounded.
- Every change to the pack bytes takes a new pack version. The work reached `p5`: `p3` collected
  the saved rows, `p4` served the superseded paid probe, and a later byte change made `p5` current.
- No MCP response code changes.
- An independent reviewer verifies every fixture against the saved transcript.

## Gate 1B: add runner and continuation diagnostics

Owner: Solo todo 1566.

This gate has three separate parts.

### Part 1: structured agent outcomes

Extract one pure parser from `runAgent`.

The parser consumes stdout, stderr, exit status, signals, and spawn errors.

It returns one structured outcome.

New result artifacts must use one failure field.

They must not write two equivalent failure formats.

Increment a results-schema version when the stored shape changes.

The failure classes must include these values.

- `provider-safeguard`
- `transport`
- `timeout`
- `spawn`
- `protocol`
- `agent`
- `unclassified`

Classification must use narrow fixture-backed rules.

An unknown outcome must remain `unclassified`.

Only `transport` can enter an automatic retry policy.

A provider safeguard must never trigger a bypass or rewritten attack request.

### q-n3 fixture

Create a sanitized fixture from `q-n3-ssrf-metadata-endpoint`.

The fixture must prove these facts.

- The provider returned a safeguard result.
- The MCP transcript is empty.
- The output-token count is zero.
- The parser returns `provider-safeguard`.
- The runner does not retry the request.
- The judge stores one error result.

Preserve bounded diagnostic data for failures.

Store whitelisted terminal fields and numeric usage.

Store a redacted stderr excerpt and a SHA-256 for full stderr.

Do not store an unbounded provider stream.

Do not commit local result artifacts.

### Part 2: per-turn usage and search shape

Capture per-turn numeric usage when the provider emits it.

Record missing usage as unavailable.

Do not infer missing token counts from character counts.

Store bounded search-result structure for future runs.

The structure can include these fields.

- Query and filter inputs already visible to the model.
- Response character count and SHA-256.
- Returned hit identifiers, kinds, tiers, and count.
- `total`, `truncated`, and recovery identifiers.
- Character counts by allowed response field.

Do not store raw search descriptions or signatures by default.

The result row must distinguish consumed model usage from advertised tool-surface size.

### Part 3: artifact continuation fixture

Extend the existing real Dynamic Worker smoke seam.

The current smoke already proves large artifact storage and same-owner reads.

The new fixture must prove the complete continuation sequence.

1. The first execute returns more than 24,000 characters.
2. The first execute returns one visible owner-bound handle.
3. The next execute calls `codemode.artifact.info(id)`.
4. The next execute calls `codemode.artifact.read(id)`.
5. The script branches on `r.ok`.
6. The script reads the full value from `r.data`.
7. The script returns one bounded projection.
8. The projection includes a sentinel stored only near the original tail.
9. The final projection does not truncate.
10. The final answer fixture contains the sentinel and no artifact identifier.

Keep the existing ownership and cap controls.

Also test wrong-owner, expired, oversized, missing, and fifth-read failures.

Test a wrong-level payload read through the existing fail-loud guard.

### Envelope experiment rule

The default candidate keeps `{ ok, data }`.

First test clearer source-basis examples and fail-loud errors.

Do not add a second successful shape.

Consider a changed artifact envelope only after two unrelated failures remain.

A changed envelope must replace the old envelope in one forward-only change.

It must update instructions, tests, and all call sites together.

The service operation envelope must remain unchanged.

### Eval artifact metrics

Store derived artifact metrics in eval result rows.

Use transcript inputs and outcomes for these metrics.

- Handles observed.
- `artifact.info` calls.
- `artifact.read` calls.
- Successful reads.
- Failed reads by reason.
- Read bytes when host evidence exists.
- Post-read projection truncation.
- Wrong-envelope failures.
- Successful final projection.

Do not expose these metrics in the model-visible MCP result.

Host observability remains a separate evidence source.

### Gate 1B acceptance

- The q-n3 fixture receives the correct class.
- The runner does not call MCP for that fixture.
- The continuation fixture recovers the tail sentinel.
- The final projection stays bounded.
- All ownership and security failures remain fail-closed.
- No production result cap changes.
- An independent reviewer checks the parser and the real Worker test.

## Gate 2: complete free causal audits

Owner: Solo todo 1569.

### Audit A: all truncated rows

Audit all 64 truncated QA rows.

Use one row record for each case.

The record must include these fields.

- Row identifier and lane.
- Stored verdict and reviewed verdict.
- Execute call count and truncation count.
- Result size and source-basis presence.
- Artifact handle count and read count.
- First missing required fact.
- Fact present in the returned prefix.
- Fact present in the saved artifact.
- Fact present in any service response.
- Fact present in the judge pack.
- Final-answer use or omission.
- Root cause and confidence.
- Hashes for every local evidence file.

Use these exclusive primary root causes.

- `no-loss`
- `tail-loss`
- `retrieval-gap`
- `upstream-gap`
- `synthesis-omission`
- `envelope-misuse`
- `judge-pack-loss`
- `judge-variance`
- `provider-failure`
- `unknown`

Start with the two initial candidates.

Then audit the six fixed controls.

Then complete the remaining rows without changing the categories.

### Audit B: all artifact-reading rows

Audit all 15 artifact-reading rows.

Record every read and its containing execute outcome.

Classify the 11 observed failures by exact failure shape.

Separate wrong envelope access from later projection errors.

Confirm whether each row later produced a successful projection.

Do not treat a read as useful only because it succeeded.

A useful read must add an answer-required fact or prove completeness.

### Audit C: search-result shape

The old results did not retain raw search bodies.

Replay the saved search inputs against the current revision.

Use the existing Solo `dev` process and its bound port.

Do not start a second Wrangler process.

Record only bounded structural metadata and hashes.

For each search, record these values.

- Input query, filters, and limit.
- Result SHA-256 and character count.
- Hit identifiers, kinds, tiers, and order.
- `total`, `truncated`, and recovery identifiers.
- Fields used by the following execute script.
- Fields never used in later code or the final answer.

Classify each large search result as useful, redundant, or unresolved.

Do not propose field removal from character count alone.

### Audit D: response discipline

Review all below-correct rows for four answer patterns.

- An unscoped absence claim.
- A volatile claim without an observation date.
- A self-description presented as independent verification.
- A source conflict presented as one settled fact.

Count only reviewed patterns.

Do not change production guidance for one row.

A guidance experiment needs three unrelated cases across two services.

The transcripts must show that the required evidence was already retrieved.

### Audit E: current state of reviewed misses

Recheck the five real agent misses on current main.

- `q-scf-v7-changes`
- `q-sor-cross-warmancer-zk-stack`
- `q-soroban-token-transfer-pattern`
- `q-live-ll-active-jobs-recency`
- `q-live-builders-artifact-continuation`

Recheck the eight upstream gaps on current main and live sources.

- `q-defi-wisdomtree-crdt`
- `q-mpp-discovery-and-modes`
- `q-protocol-base-reserve-min-balance`
- `q-quickstart-manual-ledger-close`
- `q-soroban-auth-recursion-dos-audit`
- `q-ti-freighter-localhost-not-detected`
- `q-ti-rpc-gettransactions-pagination-xdr`
- `q-tool-passkeykit-smart-wallet`

Inspect the existing `improvements/` record for each upstream gap.

Update a finding only after current live verification.

Do not add a local content patch for an upstream gap.

Recheck `q-eco-stellar-wallets-list` in the response-discipline audit.

Do not use its single answer-craft omission to justify a global prompt change.

### Gate 2 outputs

Create one dated committed review record under `eval/qa/reviewed/`.

Keep raw result files local and gitignored.

The review record must include exact result stamps and SHA-256 values.

It must list every row and one primary cause.

It must also list every unresolved disagreement.

### Gate 2 acceptance

- All 64 truncated rows have one primary cause.
- All 15 artifact-reading rows have an outcome classification.
- The two initial candidates have reproducible causal evidence.
- Six fixed controls have the same analysis.
- Search observations contain no raw result bodies.
- Every upstream gap has a current disposition.
- An independent reviewer reproduces all target and control classifications.
- No paid call occurs.

## Gate 3: select or reject product experiments

Do not implement every possible experiment.

Use the Gate 2 evidence to select the smallest useful change.

### Experiment A: same-cap result projection

Trigger this experiment only when two unrelated rows show `tail-loss`.

Both rows must lose answer-required facts at the model boundary.

The service and artifact must contain those facts.

Candidate designs can include JSON-aware sampling or balanced head-tail output.

The audit must select one design before implementation.

The implementation must keep the existing token cap.

The fallback for non-JSON results must remain deterministic.

Mechanism metrics are required-fact survival and returned character count.

Reject the candidate after any verified control fact disappears.

### Experiment B: artifact continuation guidance

Trigger this experiment when two unrelated rows fail after a successful read.

The failures must share one general contract problem.

First test a shorter example and a clearer fail-loud message.

Do not auto-read the artifact.

Do not add an artifact-specific top-level MCP tool.

Mechanism metrics are correct envelope use and bounded tail recovery.

Reject the candidate after any ownership or limit regression.

### Experiment C: bounded search projection

Trigger this experiment when the search audit finds a general unused field class.

The class must occur across at least two services or query classes.

Removing it must not reduce discovery recall.

Use the existing search interface.

Do not change exact-match behavior.

Mechanism metrics are result characters, hit order, and later operation use.

Reject the candidate after any routing gate breach.

### Experiment D: response-discipline guidance

Trigger this experiment only after the Gate 2 pattern threshold passes.

Test the text first through `QA_AGENT_PROMPT_APPEND`.

Keep that arm separate from the production prompt contract.

Measure dates, scoped absence claims, evidence tiers, and source conflicts.

Also measure answer length, tool calls, usage, and unsupported claims.

Do not ship guidance from one run.

Reject the candidate if it increases unsupported claims or hides useful detail.

### Product candidate review

Each selected experiment receives a separate implementation todo.

Each todo names its exact target files and tests.

One author owns each write set.

A different model performs the adversarial review.

The reviewer must see the evidence and stop rules.

The reviewer must not receive an expected verdict.

### Gate 3 acceptance

- Every selected experiment has at least two causal cases.
- Every selected experiment has at least six symmetric controls.
- Every selected experiment has one mechanism metric.
- Every selected experiment has a hard stop condition.
- Rejected experiments remain documented.
- No per-question production rule exists.

### Current Gate 3 decision

The phase-one adversarial review rejects Experiments A through D.

The stored data does not show two unrelated product failures with one shared mechanism.

The review also rejects a larger cap, automatic reads, a second envelope, and Playground coupling.

One measurement-only matrix remains eligible after the independent code reviews pass.

#### M1: evidence-pack integrity

M1 re-judges saved answers without collecting new answers.

It uses these two unrelated targets.

- `q-tool-indexer-repos-discovery`
- `q-live-beans-cross-service-reconcile`

It uses these six preselected pack-eligible controls.

- `q-comp-cross-moneygram-partnership-sep24`
- `q-soroban-oz-token`
- `q-soroban-auth-delegation-p27`
- `q-live-fluxity-status-provenance`
- `q-live-zk-repos-current`
- `q-live-digest-blend-coverage`

It also checks two stable cases offline for an empty pack.

- `q-aas-burn-clawback-redemption-mechanics`
- `q-edge-1xlm-activation-fee`

Use the goldens from the paid result snapshot.

Do not join against current goldens when they differ.

Load all three case files from revision `70726884a723786c669283953f576277ce9d955b`.

Require their selected-case hashes to match the recorded result metadata.

M1 permits zero paid answering-agent calls.

It permits 8 initial judge calls, 8 repeat calls, and at most 8 tie-break calls.

The maximum is 24 paid judge calls.

The stored cost estimate is `$1.5810366` for one pass and `$3.1620732` for two passes.

The hard cost reserve is `$6.00` for M1.

Stop after any control fact loss, mixed pack version, pack overflow, or product-file change.

Stop if any stable case receives a pack.

## Free verification for each product candidate

Run the narrowest tests first.

Then run the complete required gates.

### Evidence-pack changes

```sh
npx vitest run test/evidence-pack-per-operation.test.mjs test/qa-judge-stored.test.mjs
```

Add each new focused test file to the command.

### Runner and artifact changes

```sh
npx vitest run test/qa-judge-stored.test.mjs test/executor-providers.test.ts
npm run test:smoke
```

The smoke lane must include `test/smoke/executor.test.ts`.

### Search changes

```sh
npx vitest run test/search.test.ts test/search-resolution.test.ts test/server.test.ts
npm run eval:routing -- --gate
```

### Full free gate

```sh
npm run eval:selftest
npm run eval:compile
npm run eval:qa:compile
npm run eval:qa:lint -- --stale
npm run eval:routing -- --gate
npm run typecheck
npm test
npm run test:smoke
npm run build
npm run secrets:scan -- --tree
git diff --check
```

Run `npm run improvements:lint` when an upstream finding changes.

Generated files must match their build scripts.

### Paid judge behavior gate

`npm run eval:qa:selftest` makes seven paid judge calls. It calls the judge once for each
`SELF_TEST_CANDIDATES` entry. Run it only after the free gates and the reviewed pre-spend brief
pass. Record an exact seven-call cap and the judge model. This command needs no MCP server, but it
is not a free gate. The command prints `expected`, `actual`, `reportedCosts`, `missingCosts`, and
`totalCostUsd`. CI never runs it.

No test may use production secrets.

## Gate 4: paid targeted A/B

Owner: Solo todo 1567.

This gate requires a separate paid authorization.

The authorization must name the maximum scope and expected cost.

### Pre-spend brief

The brief must pin these items.

- Measurement runner revision.
- Baseline server revision.
- Candidate server revision.
- Runner and server tree cleanliness.
- Exact case identifiers and order.
- Answer model and judge model.
- Judge rubric and evidence-pack version.
- Agent prompt and any prompt append.
- Cases, manifest, and runner hashes.
- Repetition count and arm order.
- Expected spend from stored per-row costs.
- Stop rules and independent review roles.

An adversarial reviewer must approve the brief before launch.

Any later brief change requires a delta review.

### Target slice membership

The final membership comes from Gate 2.

It must include these groups.

- Every causal target for the selected product change.
- At least six fixed truncated-correct controls.
- At least one live control.
- At least one digest control when the changed mechanism affects digest work.
- Security controls when executor or artifact code changes.

The two confirmed pack-loss rows need identical-input re-judging.

They do not require new answer collection for a pack-only change.

Keep main, live, digest, and agentic denominators separate.

Run agentic cases only when search or discovery behavior changes.

Do not run Playground cases.

### A/B mechanics

Use one fixed measurement runner for both arms.

Change only the server revision under test.

Use one existing Solo `dev` process.

Restart that process between server revisions when required.

Do not run two Wrangler processes.

Use clean worktrees or clean pinned checkouts for the two server revisions.

Record `--server-revision` for every artifact.

Collect answers with `--no-judge` first.

Verify row count, identifiers, hashes, and agent cost before judging.

Judge stored results under one identical tuple.

Run two answer collections per arm for causal targets and controls.

Use an alternating arm order when live data can drift.

Do not merge result files across lanes.

### Paid success rules

A candidate passes only when all conditions hold.

- At least two unrelated targets show the intended mechanism.
- The mechanism appears in both candidate repetitions.
- No control has a verified required-fact loss.
- No security control changes its expected outcome.
- No routing gate regresses.
- No manifest or exposure rule changes unexpectedly.
- No context overflow, turn-cap event, or timeout occurs.
- Context and cost changes match the pre-spend limits.
- Manual transcript review confirms every changed verdict.
- Independent re-judging resolves suspect judge variance.

An isolated score flip does not pass this gate.

Repeated judges with the same incomplete evidence do not pass this gate.

A score gain without a mechanism metric does not pass this gate.

### Paid stop rules

Stop the round after any verified security regression.

Stop the round after any verified correct-control loss.

Stop the round when only one target can improve.

Stop the round when target evidence disproves the proposed mechanism.

Stop the round when result metadata or hashes do not match the brief.

Do not retry provider safeguards.

Retry only a predeclared transport failure.

Store a retry as a separate diagnostic artifact.

## Gate 5: broader verification

Do not run a broad paid round automatically.

Seek a second authorization after Gate 4 passes.

Use the exact same case identifiers in both arms.

A 100-row paired set is appropriate for a broad MCP behavior change.

Use the current 492-case corpus when selecting that set.

Do not compare it with a historical 484-case or 490-case aggregate.

Run the canonical live 15 as a separate lane.

Run the digest 2 only when the mechanism can affect digest work.

Run agentic 60 only when search or workflow behavior changes.

Review every row before accepting the result.

Use the same root-cause classes from Gate 2.

### Broader acceptance

- The targeted mechanism still appears at broader scale.
- No reviewed correct answer becomes worse.
- Wrong and partial changes have reviewed causes.
- Usage, cost, turns, and tool calls stay within the brief.
- Upstream findings are filed or updated.
- The relevant eval README records exact result stamps.
- A final independent reviewer accepts the complete portfolio.

## Net-improvement scorecard

Use one scorecard for every candidate.

| Dimension    | Required evidence                                 | Blocking condition                              |
| ------------ | ------------------------------------------------- | ----------------------------------------------- |
| Correctness  | Reviewed required facts and wrong claims          | Any verified control loses a required fact      |
| Causality    | Mechanism occurs before the answer improvement    | Only a judge score moves                        |
| Retrieval    | Required source and operation remain discoverable | Routing or exact-match regression               |
| Truncation   | Required facts survive within the same cap        | A control fact disappears                       |
| Artifact use | Correct bounded projection from `r.data`          | Ownership, expiry, size, or read-cap regression |
| Context      | Per-turn and final usage remain bounded           | Overflow, timeout, or unexplained large growth  |
| Cost         | Stored costs match the reviewed brief             | Unexpected spend or missing cost data           |
| Security     | Network isolation and redaction remain intact     | Any egress or secret exposure                   |
| Exposure     | Manifest and generated artifacts stay truthful    | A non-exposed operation appears                 |
| Evaluation   | Pack, rubric, and hashes stay comparable          | Mixed tuples or incomplete artifacts            |

The final decision must state each dimension as pass, fail, or not applicable.

No aggregate average can override a blocking condition.

## Context-window decision rule

The prior run did not show context exhaustion.

Do not reduce quality only to lower token counts.

Track these values for every paid row.

- Per-turn input and output tokens when available.
- Final-turn input tokens.
- Cache creation and cache read tokens.
- Tool-call count.
- Execute-result characters.
- Search-result structural characters.
- Artifact reads and returned bytes.
- Final answer characters.

Investigate attention loss when usage grows and required evidence was already retrieved.

Do not label that pattern as context exhaustion without a boundary error.

Do not compare advertised tool-schema characters with consumed model tokens.

## Review and model roles

Use `fan-solo` before implementation.

Use `solo-orchestrate-agents` only for independent work lanes.

Use one coordinator for the evidence ledger and final decisions.

Suggested roles follow the project routing rules.

- Sol high: hard implementation and causal analysis.
- Terra high: routine implementation and bounded verification.
- Fable high or xhigh: product and adversarial review.
- Grok high: assumption attack and experiment review.
- Opus high: stable independent fallback.

The author and reviewer must differ.

Reviewers must append evidence to Solo before a todo closes.

Idle status does not mean completion.

The coordinator must verify every consequential claim against code or artifacts.

## Commit and rollback plan

Keep measurement and product changes in separate commits.

Use this preferred sequence.

1. Evidence-pack repair and tests.
2. Runner outcome schema and parser tests.
3. Artifact continuation fixture and metrics.
4. Free audit record.
5. One selected product candidate.
6. Eval records and accepted upstream findings.

Do not mix a product candidate with its baseline collection.

Do not deploy before final independent review.

If a product candidate fails, revert only its commit.

Keep accepted measurement fixes and audit records.

Do not keep a dormant runtime flag after rejection.

## Durable outputs

The work must leave these durable records.

- This execution plan under `research/`.
- Solo scratchpad 811 as the evidence source.
- Todo comments linking each implementation handoff.
- A dated causal-audit record under `eval/qa/reviewed/`.
- Updated eval README records for any paid run.
- Updated `improvements/` findings for verified upstream gaps.
- Generated artifacts from repository scripts only.

Raw paid results remain local and gitignored.

Each committed record must cite exact result stamps and hashes.

## Final definition of done

The program finishes only when every statement is true.

- Todo 1568 passes independent review.
- Todo 1566 passes independent review.
- Todo 1569 assigns every required root cause.
- Every selected product candidate passes its free gates.
- Todo 1567 has separate paid authorization before execution.
- Every paid artifact has complete pins, hashes, rows, and costs.
- Every changed verdict has transcript review.
- Every upstream gap has a current disposition.
- The main MCP surface has no verified regression.
- The Playground remains uncoupled.
- All required tests, smoke tests, builds, and scans pass.
- The final portfolio receives independent adversarial review.
- Solo todos, locks, processes, timers, and scratchpads are reconciled.

If no product candidate passes Gate 3, the measurement fixes still provide a net improvement.

That outcome is valid.
