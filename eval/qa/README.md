# Answer-accuracy evaluation

This evaluation measures whether an agent gives a correct, current answer through `search` and `execute`.
It is the headline instrument in the [evaluation map](../EVALS.md).
Use the [run-evals workflow](../../.agents/skills/run-evals/SKILL.md) to plan a round and obtain paid-call approval.

## Directory / lane map

| Path | Purpose |
|---|---|
| `corpus/battery/<category>/<id>.json` | Authored active and quarantined cases |
| `corpus/proposed/` | Proposals that await verification and activation |
| `corpus/retired/` | Permanent retirement records |
| `corpus/live/live-cases.json` | Frozen `live-data-canonical-v3`, with 15 cases |
| `corpus/live/live-digest-supplement-cases.json` | Frozen `live-digest-supplement-v2`, with two cases |
| `cases.json`, `sample.json`, `lifecycle-registry.json` | Generated cases, sample, membership, and identity records |
| `consistency-register.json` | Cross-case contradictions and numeric invariants |
| `results/` | Local, ignored collection and judging artifacts |
| `reviewed/` | Retained dated evidence |

[lifecycle-registry.json](lifecycle-registry.json) owns current battery membership.
Keep the battery, canonical live cases, and digest supplement separate in reports.
Live-contract edits require a contract-version change, provenance, and updated content digests.

## Commands

Run these offline checks before collection:

```sh
npm run eval:qa:lint -- --stale --enforce-floors
npm run eval:qa:register -- --check
npm run eval:selftest

# Regenerate outputs after approved case changes.
npm run eval:qa:compile

# Check expected-answer changes against a reference.
npm run eval:qa:lint -- --since <ref>
```

`--coverage` reports coverage floors without enforcing them.
`--enforce-floors` makes floor violations errors. `--stale` rejects expired `truth.reverifyBy` values.
Use `npm run eval:qa:register` to update member hashes after reviewed changes.
An unclustered case cannot trigger a cluster's automatic reopening; register coverage needs separate review.

For paid collection, reuse an authorized `dev:eval` server with the expected revision.
The launcher requires a clean worktree and includes that revision in MCP `serverInfo`.
Follow the run-evals workflow if the required server is absent.

```sh
node eval/qa/run-qa.mjs \
  --variant A \
  --sample 30 \
  --port 8788 \
  --max-budget-usd <usd> \
  --server-revision <commit> \
  --expect-sha256 <surface-sha256> \
  --expect-agent-binary-sha256 <wrapper-sha256> \
  --expect-agent-environment-sha256 <environment-sha256> \
  --remote-identity-probe eval/qa/probe-remote-identities.mjs \
  --expect-remote-identity-probe-sha256 <probe-sha256> \
  --expect-remote-identity-sha256 <vector-sha256>
```

Use the actual bound port. Variant A uses the shipped `search` tool.
For the canonical live lane, replace `--sample 30` with `--cases eval/qa/corpus/live/live-cases.json`.
For the digest lane, use `--cases eval/qa/corpus/live/live-digest-supplement-cases.json`.
Use one `--ids a,b,c` argument for an explicit selection.

The [runner parser](run-qa.mjs) owns the complete flag contract.
`--no-judge` is its only bare boolean flag. Other flags require one spaced value.
Unknown flags, equals forms, stray arguments, and duplicate required flags fail before a paid call.
The `--judge-stored` mode rejects `--ids`; use the re-judge tool to select saved rows.

`--surface per-operation` selects a separate 60-operation diagnostic: 18 Lumenloop, 30 Scout, and 12 Docs operations.
[plain-operation-harness.mjs](plain-operation-harness.mjs) defines that surface.
[compare-architecture-ab.mjs](compare-architecture-ab.mjs) compares its results with the two-tool surface.

## Identity and budget requirements

Every paid runner mode requires the total budget, executable hash, and environment hash.
Collection also requires the server revision, surface hash, probe path, probe hash, and stable remote-vector hash.
The runner checks local identities before and after collection.
A stable local listener does not establish remote service identity.

Compute the environment hash after all Claude-related variables have their final values.
Use the same shell for hashing and collection:

```sh
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
```

The artifact records environment names and hashes, never their values.
[executable-identity.mjs](../lib/executable-identity.mjs) defines the executable and environment identity checks.

Before a new paid authorization, run the committed public identity probe:

```sh
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d ' ' -f 1)
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256)
```

This command makes live, read-only requests without model calls.
It captures three vectors, waits five minutes between captures, and requires all hashes to match.
The probe covers Scout OpenAPI, Lumenloop's public inventory, and Stellar Docs settings and title records.
It receives only `PATH` and records no repository credentials.
[probe-remote-identities.mjs](probe-remote-identities.mjs) defines canonicalization, retry limits, and timeout bounds.

The runner captures remote identity around every answering call and during final postflight.
A failed capture or changed vector stops further spending and suppresses aggregates.
The artifact keeps completed rows, unattempted IDs, and the failed guard.
It records `meta.comparable: false` and `meta.aggregatesSuppressed: true`.
A stopped artifact cannot resume under the same authorization.
Comparable artifacts require a matching final postflight and `skippedReason: null` for a successful attempted postflight.

`--max-budget-usd` sets the total method cap.
Each answering, judging, panel, or retry call receives only the remaining authorization.
Each reported cost reduces the same ledger. Missing cost data invalidates the method.
A judge CLI that the harness kills prints no cost, so the judge CLI owns stall handling.
`judge.mjs` sets its fetch timeout and ordinary retry count, and the harness timeout is a chosen backstop.
These settings reduce harness kills; they do not guarantee that every judge call reports a cost.
Stored judging restores earlier spend; its new cap applies to the cumulative total.
A reported total with missing costs is a lower bound, never a complete spend figure.

## Case schema and golden lifecycle

Use the [corpus guide](corpus/README.md) for case authoring.
[compile-qa.mjs](compile-qa.mjs), [lifecycle.mjs](lifecycle.mjs), and [lint-corpus.mjs](lint-corpus.mjs) enforce the case contract.
Do not edit generated cases, samples, or registry records by hand.

| Field | Consumer |
|---|---|
| `question`, `golden.*`, `tags.trap`, `tags.freshness` | Judge prompt and expected-answer change checks |
| `surface` | Manifest exposure checks and coverage floors; hidden from agent and judge |
| `tags.service` | Sample selection and service reports |
| `truth.*` | Provenance, verification, lifecycle, and consistency checks; hidden from the judge |

The filename must equal the case ID. The directory must equal `tags.category`.
IDs remain permanently reserved. Key facts use one to five entries, except explicitly pinned exceptions.
Scheduled cases require `truth.asOf` and `truth.reverifyBy`.
Live cases use behavioral expectations instead of fixed volatile values.

Changes to questions, expected answers, or judge-facing tags require the [golden-truth workflow](../../.agents/skills/golden-truth/SKILL.md).
The change must include a new verification event, evidence, and a supported root cause.
A desired score increase is not evidence.

Only active and quarantined battery cases compile.
New IDs first enter as proposals. A later reviewed commit can activate them.
Activation requires verification, duplicate checks, boundary checks, and a reviewer who differs from the author.

A credible truth or validity conflict can quarantine a case.
Record its cause, evidence, author, independent reviewer, start date, review date, and decision record.
The first review date must fall within 30 days after the start.
Renewal requires another independent review and a new bounded review date.
Judge noise queues review; it does not justify quarantine.

Retirement requires a reason independent of scores and a permanent retirement record.
That record keeps the final content digest, evidence, independent review, and replacement IDs.
The compiler rejects missing reserved IDs, direct battery additions, duplicate IDs, and retired-ID reuse.

Mass review starts at the earliest configured threshold: 25 queued active cases, five percent queued, or three calendar months.
The percentage calculation rounds upward.
[corpus/lifecycle-policy.json](corpus/lifecycle-policy.json) records the cadence anchor and frozen review identity.
Keep corpus-health results separate from system-quality results.

## Stored outcomes and retries

[agent-result.mjs](agent-result.mjs) parses each agent process into `qa-agent-result-v4`.
`agent.failure` holds one failure class or `null`.
Only a first-pass `transport` failure can receive one answering retry with identical input bytes.
Safeguards, timeouts, spawn failures, protocol failures, agent limits, and unclassified failures do not retry.

Only judge `cli` and `parse` failures can receive one total retry across collection and stored-judge resumes.
Judge safeguards, timeouts, consistency errors, and incomplete prompt writes are terminal.
Stored judging records each completed attempt before an eligible retry.
The first answer, agent outcome, and verdict remain the top-level values.
Retries stay in `attempts.agent[]` and `attempts.judge[]`; they do not replace first-attempt evidence.

New attempts record `startedAt` and `endedAt` as UTC ISO timestamps.
Answering timestamps start before spend authorization and the before-call identity capture.
They end at the completed CLI result and preserve the existing duration interval.
The interval excludes the after-call identity capture.
Judge attempts span the method, including panel calls; each `attempts.judge[].calls[]` entry also records its CLI interval.
Identity captures record `meta.remoteIdentityGuard.captures[].capturedAt`; guard failures record `meta.remoteIdentityGuard.failure.failedAt`.
Join answering attempts to identity captures with the row `id` and the attempt `number` matching capture `attempt`.
A failed after-call guard retains the completed attempt and its timestamps.
A failed before-call guard creates no answering attempt; its failure context identifies the unattempted call.
Partial artifacts retain timestamps for saved attempts without creating attempts for unattempted IDs.
Older artifacts can omit all timestamp fields; readers do not infer absolute times from durations.

Budget-stopped judge verdicts keep the budget class in `failureClass`.
They also record `originalFailureClass` from the judge call that caused the budget stop, such as `timeout`.
`originalFailureClass` is `null` when no such call exists or the call has no failure class.
Older verdicts can omit `originalFailureClass`; their per-call records remain the original failure evidence.

Answering agents run outside the repository with empty setting sources, disabled slash commands, and strict MCP configuration.
Each row must confirm the explicit `raven` MCP server as connected.
A failed connection stops the batch and makes the artifact non-comparable.
Other agent failures remain visible as error rows in a complete QA artifact.

Search calls retain full inputs and bounded ranking evidence in `resultProjection`.
Execute calls retain bounded result text. Compare usage tokens, not captured character counts, across surfaces.
New transcript entries record `assistantTurn`, a one-based ordinal within that answering attempt.
The parser groups consecutive assistant events that share `message.id`, including events without usage counters.
These entries record `assistantTurnBasis: "message-id"`.
Tool calls with the same message ordinal belong to one assistant message, even across separate events.
An assistant event without a message ID consumes its own ordinal and records `assistantTurnBasis: "event"`.
An event without a message ID also ends the previous message group.
Readers must treat message boundaries for these event-based entries as unknown.
Text-only assistant messages consume an ordinal, so transcript ordinals can have gaps.
The ordinal resets for each answering retry.
Shared message ordinals show calls requested together; they do not prove that host execution overlapped.
Older transcripts can omit `assistantTurn` and `assistantTurnBasis`; readers must treat their message boundaries as unknown.
`agent.usage.final` preserves provider usage; `agent.usage.perTurn` contains normalized numeric counters.
`agent.usage.perTurn[].turn` keeps the existing assistant-event ordinal, including events without usage counters.
It can differ from `assistantTurn` when several events share a message ID.
The usage records, provider totals, and reported costs retain their existing values.
Missing counters remain `null`. [evidence-sanitizer.mjs](evidence-sanitizer.mjs) bounds and redacts CLI evidence before storage.

## Five-track result contract

[ADR-0008](../../research/decisions/0008-human-review-eval-and-playground-policy.md) and [five-track.mjs](five-track.mjs) define T1 through T5.
Every rate includes its denominator, and each outcome category lists its IDs.

| Track | Reports |
|---|---|
| T1 | First-attempt coverage, valid-grade coverage, conditional quality, and agent-limit failures |
| T2 | Transport retry attempts, recoveries, repeated failures, and unattempted retries |
| T3 | Answered trap coverage, explicit grades, avoid matches, and consistency evidence |
| T4 | Harness and judge errors, invalid tests, quarantined diagnostics, panels, retries, and costs |
| T5 | Answering and judging safeguards and timeouts, plus answering transport failures |

Sampling uses the complete active-plus-quarantined pool, then reporting partitions the selected IDs.
Quarantined rows stay in T4 and outside T1 and T3.
The runner never replaces selected cases to improve coverage.
`summary.overall` contains raw first-attempt score diagnostics; it is not the T1 or T3 measure.

Artifact telemetry distinguishes static call sites, execute outcomes, and proven read outcomes.
`readOutcomes.successful` requires a bounded execute result whose visible JSON has `ok: true`.
A projected answer without that envelope can remain `indeterminate`.
`readBytes` remains `null`; the instrument does not estimate host byte evidence.

## Judging rubric and score comparability

The default judge model is `claude-sonnet-5`, with rubric `v2.11` and evidence pack `p6`.
[judge.mjs](judge.mjs) owns the prompt and rubric. [evidence-pack.mjs](evidence-pack.mjs) owns evidence selection and serialization.

For ordinary cases, `correct` requires all substantive key facts and no wrong claim or fired avoid.
`partial` permits omissions or minor errors when no avoid fires and the verdict names the issue.
`wrong` covers an incorrect core answer, fabrication, or a fired avoid.

For traps, the golden defines the complete required behavior.
A bare refusal is insufficient when the golden also requires an answer, boundary, warning, alternative, or clarifying question.
A completed safe behavior can be correct without background facts that only explain it.
`error` records judge failure and never grades the answer.

The judge ignores style, length, and citation format.
Beyond-golden details remain unverified unless the evidence establishes a contradiction.
The freeze clause of a must-avoid item (a permanent, complete, exhaustive, timeless, or network-wide list) does not fire on a list the candidate presents as dated, source-scoped, or non-exhaustive.
An omitted list item in such an answer is a missing key fact, not a fired avoid.
An explicit permanence claim, or an instruction not to re-check, overrides that exemption even when the answer carries a date or a source.
A completeness claim overrides it only when it exceeds the stated source or date bounds or lacks support; a complete query result within its stated source stays exempt.
Other conditions in the same must-avoid item, such as operator verification, bind on their own terms.
Concrete wrong content inside the list still fires, such as a category called empty when the golden names live members.
For non-stable cases, the bounded evidence pack supports sourced changes from the golden snapshot.
Pack absence does not prove source absence.
The pack omits detected A/V `created_at` values and preserves source-basis boundaries.

[verdict-consistency.mjs](verdict-consistency.mjs) validates issue arrays, avoid indexes, and score consistency.
A consistency error preserves `judgeScore`, sets `coreAnswer: null`, and records violations.
It does not parse answer prose to decide which avoid fired.

Compare artifacts only when case content, model, rubric, pack, prompt semantics, and judge-tier policy match.
A model or contract mismatch requires an explicitly labeled comparison under a common target contract.
Changes to grading semantics require a rubric-version change.
Changes to evidence selection or serialization require a pack-version change.
Use prompt-hash fixtures to demonstrate that a comment or formatting change preserves prompt bytes.

The sampler allocates by service, sorts IDs, and selects evenly spaced cases.
Corpus growth can change membership even when the requested sample size stays fixed.
Use matched IDs or disclose membership changes before comparing aggregates.
Single-run movement requires transcript review or repeated evidence before a regression claim.
The [retained QA records](reviewed/2026-09-30-qa-guide-records.md) include the earlier variance and membership evidence.

### Measurement shares

Complete judged artifacts report these active-row measures; suppressed aggregates omit them.

| Field | Meaning |
|---|---|
| `halfCreditShare` | `(correct + partial / 2) / active rows` |
| `strictCorrectShare` | `correct / active rows` |
| `coreAnswerCorrectShare` | Correct core answers divided by graded rows |
| `gradedCoreAnswerNullCount` | Graded rows with a null core answer |
| `coreAnswerVerdictCount` | The graded-row denominator |

There is no key-fact coverage share.
`missingFacts` contains judge prose, so its length cannot measure missing golden facts.

## Judge-tier contract

The default policy is `stability-boundary-v1`.
It starts with one judge vote and can expand to three votes.
A usable stability score below `0.75` triggers a panel without using the boundary cap.
A usable score at or above the threshold stays single.

Without usable history, boundary verdicts can trigger panels within `--max-panel-cases`.
The default cap is `ceil(selected / 3)`, bounded between 10 and 34.
`--max-panel-cases` or `QA_MAX_PANEL_CASES` can override it, including with zero.
A skipped boundary panel records its reason and remains single.

Judge errors never trigger tier escalation.
`--judge-panel 2|3` forces a fixed panel. Re-judging uses one vote by default and does not use tier selection.

[judge-stability.mjs](judge-stability.mjs) derives the local register from saved results.
A missing or invalid register selects the boundary path and records that status.
`meta.judgeTiering` records the policy, threshold, register hash, cap, source, denominator, and panel counts.
A stored resume preserves its first cap and refuses a different explicit cap.
Freeze one register for paired comparisons and use the same `--stability-register <file>` in all arms and resumes.

## Paid judge self-test

Run this only after approval for the paid rubric, prompt, pack, or adapter check:

```sh
npm run eval:qa:selftest -- \
  --runner-revision <commit> \
  --claude-path <absolute-path> \
  --expect-claude-binary-sha256 <sha256> \
  --expect-claude-environment-sha256 <sha256> \
  --out eval/qa/results/<stamp>-p6-selftest.json
```

The wrapper requires a clean tree and checks runner, executable, and environment identities before and after judging.
It makes seven calls with a `$0.50` per-call cap and a `$3.50` total cap.
The output path and its `.tmp` path must not exist.
This command is paid and does not run in CI.

## Re-judge stored results

Use `run-qa.mjs --judge-stored <results>` for first judging of a capture made with `--no-judge`.
It requires a comparable artifact, matching schema and case snapshot, reproducible evidence, and the paid identity and budget flags.
It updates that capture's judging records and cumulative spend.

Use [re-judge.mjs](re-judge.mjs) to grade saved answers again into a separate `qa-rejudge-v1` artifact.
It never overwrites the source artifact and does not report T1 through T5.

```sh
node eval/qa/re-judge.mjs eval/qa/results/<stamp>-variantA.json \
  --ids <id-a,id-b> \
  --cases-ref <collecting-commit> \
  --dry-run
```

For an approved paid run, replace `--dry-run` with these flags:

```text
--max-budget-usd <usd>
--claude-path <absolute-path>
--expect-agent-binary-sha256 <sha256>
--expect-agent-environment-sha256 <sha256>
```

| Flag | Effect |
|---|---|
| `--ids <ids>` | Select saved rows once, without repeated IDs |
| `--flips-vs <baseline>` | Select rows with a different effective score from the baseline |
| `--cases-ref <revision>` | Resolve the case snapshot at that revision |
| `--judge-model <model>` | Select the judge model; a changed model makes the comparison non-identical |
| `--judge-panel <2|3>` | Use a fixed panel instead of one vote |
| `--allow-non-identical` | Permit source case or judge-tuple differences and label the artifact accordingly |
| `--allow-golden-drift` | Acknowledge goldens dated after the source collection |
| `--allow-empty` | Permit a zero-row flip artifact |
| `--dry-run` | Inspect selection and guards without paid calls |
| `--help` / `-h` | Print the parser's full usage contract |

`--cases-ref` does not establish pack identity. A `p3` source still differs from a `p6` re-judge.
Non-identical comparisons cannot establish identical-input judge variance.
`--allow-non-identical` does not waive baseline guards for `--flips-vs`.
`--allow-golden-drift` does not waive case, tuple, or baseline identity checks.
The flip baseline must reproduce its snapshot and share current judge identity and identical overlapping case content.

Re-judging records preflight and postflight executable identities separately from judging outcomes.
An identity or attestation failure remains visible even when judging also fails.
Missing grades produce `agreement: null`; they do not count as disagreements.

## Paired `PASS` / `FAIL` / `INDETERMINATE` verdict

[paired-verdict.mjs](paired-verdict.mjs) is an experimental stored-result printer, not a release gate.
It requires at least 100 eligible IDs after exclusions, so it does not apply to sample-30.

```sh
npm run eval:qa:paired -- <baseline.json> <candidate.json> --json
npm run eval:qa:paired:validate
```

Each eligible ID must have an identical, recomputable `caseInputSha256` across artifacts.
The artifacts must share answering identity, judge identity, schemas, implementation, prompt additions, tier policy, and pinned stability register.
Both must be complete and comparable, with matching remote baseline vectors.

The method compares two cumulative-grade differences: `correct`, and `correct` plus `partial`.
T4 and T5 outcomes exclude an ID from both arms.
An agent-limit termination remains a T1 system failure and counts as wrong.
A candidate-only T4/T5 loss forces `INDETERMINATE`.

The default `0.08` margin is an experimental no-change confidence radius, not an accepted product tolerance.
`FAIL` requires an upper bound below zero for either component.
After that check, `PASS` requires both lower bounds above the negative experimental margin.
All other results remain `INDETERMINATE`.
[validate-paired-verdict.mjs](validate-paired-verdict.mjs) owns the deterministic calibration checks.

Stop after an initial `PASS` or `FAIL`.
Only an initial statistical `INDETERMINATE` permits one complete repeat of both arms with unchanged IDs and pins.
Use `--baseline-repeat` and `--candidate-repeat` for that second look, then stop.
Do not repeat guard failures, insufficient denominators, or candidate-only T4/T5 losses.

### Concurrent paired collection

[paired-collection-supervisor.mjs](paired-collection-supervisor.mjs) validates and runs the `qa-paired-collection-plan-v2` contract.
Read that validator before preparing a plan; do not infer accepted fields from a prior result.
The contract fixes 200 selected IDs.
The plan pins `selected.activeCorpusCount` as an integer of at least 200.
Each runner must reproduce that exact count and the ordered active-ID hash.
It does not select from the current battery automatically.

```sh
npm run eval:qa:paired:capacity -- --out /absolute/path/to/paired-capacity.json
npm run eval:qa:paired:plan-sha256 -- /absolute/path/to/paired-collection-plan.json
npm run eval:qa:paired:collect -- \
  --plan /absolute/path/to/paired-collection-plan.json \
  --authorized-plan-sha256 <owner-authorized-canonical-sha256>
```

The capacity command makes live public requests without model calls or a local server.
Its artifact requires two overlapping captures and 14 successful responses: Scout 2, Lumenloop 6, and Stellar Docs 6.
It requires matching vectors, actual request concurrency, and no errors, retries, or `Retry-After` headers.
Each capture and the complete check must finish within 120,000 ms.
The artifact remains valid through exactly 86,400,000 ms after completion. Future timestamps fail.

Freeze the capacity artifact and every command array before requesting the owner's signature.
Keep the authorization outside the plan and bind it to the canonical plan hash and every command array.
Any plan edit requires a new hash and authorization.
Run the exact approved P6 command before launching the supervisor within the capacity window.

The plan binds these inputs:

- Four distinct worktrees: two runners and two servers in one repository.
- Selected ID order, full active membership, selected content, case bytes, and identical runner inputs.
- Binary, environment, implementation, remote-probe, remote-vector, and stability-register hashes.
- Different server revisions and surface hashes, with four distinct public and upstream ports.
- Baseline `add-missing` and candidate `verify-native` adapter modes, with matching measurement flags.
- Collection, stored-judge, P6, directed flip re-judge, and paired-comparison command arrays.

Both servers must reproduce one salted `.dev.vars` identity without storing values in the plan.
Use a fresh 64-character lowercase hexadecimal salt and exact code-unit ordering for names.
Hash the UTF-8 bytes of `JSON.stringify({ salt, entries })` with sorted `[name, value]` entries.
Keep the plan uncommitted and delete it after success or failure.

Collection commands use explicit `--ids`, `--no-judge`, and the supervisor's arm flag; `--sample` is forbidden.
The executable is the absolute `process.execPath`.
The supervisor runs collection only. Run stored judging later with artifact paths from the successful receipt.
The collection arms inherit the supervisor's process group; cancellation signals each recorded child directly.
The launch operator owns group cleanup and verifies all surviving group members before signaling.
After each stored judge, the operator requires complete judging evidence and unsuppressed aggregates before the next phase.
Each arm collects under `$80`; stored judging raises the same cumulative ledger to `$120`.
The two-arm cumulative cap is `$240`.

The P6 block fixes seven `$0.50` calls and a new output path.
Each directed flip re-judge has a `$15` cap, pinned executable identity, fixed judge tuple, and `--allow-empty`.
It cannot use selection overrides, dry-run mode, or non-identical and golden-drift overrides.
The supervisor validates the retained P6 summary before starting a child.

The supervisor enforces row barriers, alternating release order, shared cancellation, bounded child shutdown, and a four-hour deadline.
A failed guard, budget, child, or deadline cancels both arms.
It emits a receipt only after both complete artifacts pass content, selection, revision, comparability, and location checks.
Each artifact must reside inside its arm's results directory.
A failure emits no paired aggregate or success receipt.
Release order records IPC order; it does not prove provider-call start order.

Stored judging requires `meta.comparable === true` and matching collection and judge identities.
Repeats preserve each arm's port pair. Baseline and candidate retain different exact server revisions.

## CI contract and evidence

CI regenerates and compares `cases.json`, `sample.json`, and `lifecycle-registry.json` byte-for-byte.
It runs the offline corpus, consistency-register, and frozen-contract checks.
The paid judge self-test requires separate approval and does not run in CI.
The [golden-truth workflow](../../.agents/skills/golden-truth/SKILL.md) defines verification and independent-review requirements.
The [truth-maintenance workflow](../../.agents/skills/truth-maintenance/SKILL.md) owns expired verification schedules.

The [headline baseline record](reviewed/2026-07-super-corpus-baseline.md) and [canonical live baseline](reviewed/2026-07-12-live-v3-baseline.md) preserve their separate contracts.
[Cited QA records](reviewed/2026-09-30-qa-guide-records.md) retain additional evidence used by current artifacts.
[Earlier QA history](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/eval/qa/README.md) remains available at the audit base.
