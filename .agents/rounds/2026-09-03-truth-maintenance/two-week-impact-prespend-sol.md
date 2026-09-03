# Two-week product-impact pre-spend review

Date: 2026-09-03

Role: independent pre-spend reviewer

## Decision

The full method is necessary and useful.

The exact baseline cannot run through the current paid runner today.
Revision `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0` lacks the current source-revision attestation.
The final candidate also lacks a clean immutable revision.

No paid call can start until the exact blockers are repaired.
I made no paid call, deployment, or repository implementation edit.

## Evidence

I used the `truth-maintenance` and `run-evals` contracts.
I read the round ledger and the earlier `.50` pre-spend report.
I inspected the current diff and the relevant runner history.

The old revision has these properties:

- It exposes the top-level `search` and `execute` tools.
- Its `SERVER_INFO` contains only `name` and `version`.
- It has no `scripts/run-eval-server.mjs`.
- It has no `eval/report-live-surface.mjs`.
- It has no `eval/lib/mcp-surface.mjs`.
- Its historical evaluator used rubric `v2.4` and pack `p5`.

Commit `a0bdabe` later added the current source-revision checks.
The current launcher compiles `__RAVEN_SOURCE_REVISION__` into the Worker.
The current server returns that value as `serverInfo.sourceRevision`.

The current runner requires the live value before collection.
It checks the value again after collection.
It also verifies the listener worktree and exact server commit.

Therefore, the old server is functionally compatible with the agent tool contract.
It is not compatible with the current paid-run identity contract.

The current working tree is dirty.
`HEAD` is `2ee801f80d626e68f010392a7d541aab7997349d`.
The final candidate has no immutable revision.

The current compiled corpus has 500 unique IDs.
Its current file SHA-256 is `1042c0e226ad44b5ffab8844e1c97a2752f94a3096b13e628ed630fd0f015c7f`.
Its ordered-ID SHA-256 is `b557bcb5cff8a434ad684b90a60343358360330ca1f91072089ceb57a38310d0`.

These hashes are provisional.
The active golden work can still change them.

The committed range from the old revision to `HEAD` changes 586 measured files.
It also changes all 500 per-case corpus files.
An affected-only design cannot represent this product interval safely.

## Measurement question

Use one fresh paired comparison over the final current 500-case corpus.
Collect every answer again on both service arms.
Do not reuse the 2026-08-19 answers or judgments.

The baseline treatment is the exact old service revision.
The candidate treatment is the final clean candidate revision.
Both arms use the current runner revision.

Both arms call the current live upstream services.
Both arms use the same current questions and goldens.
Both arms use the same current evaluator contract.

The candidate arm also becomes the full current-quality result.
Do not run a duplicate 500-case candidate method.

## What the comparison estimates

The primary estimand has two cumulative grade differences.

- `P(candidate=correct) - P(baseline=correct)`
- `P(candidate in {correct,partial}) - P(baseline in {correct,partial})`

The population is the final ordered 500-case corpus.
The randomness comes from one answer and judge realization per service arm.

The estimate covers all Raven behavior changes between both service revisions.
These changes include search, descriptions, schemas, execution, truncation, and recovery behavior.
The estimate also includes new surface capabilities that the final corpus exercises.

The estimate is conditional on the following fixed contract:

- the final 500 questions and goldens
- `claude-sonnet-5` answers
- `claude-sonnet-5` judgments
- rubric `v2.10`
- evidence pack `p6`
- the current runner prompt
- the pinned judge-tier contract
- the pinned Claude binary and environment
- the current live upstream service state
- the collection time and arm order

This is a current-task service-revision effect.
It is not a historical quality reconstruction.

## What the comparison cannot estimate

It cannot estimate service quality on 2026-08-19.
The upstream services and current facts differ from that date.

It cannot isolate Scout `1.9.23` from other candidate changes.
The final candidate is a composite Raven treatment.

It cannot isolate corpus maintenance from product discovery.
The same final corpus removes denominator drift between arms.
However, the corpus was developed during the measured interval.

It cannot estimate quality on the old 497-case corpus.
It cannot compare directly with the old `v2.4` and `p5` aggregate.

It cannot estimate other answer models, judge models, or Claude binaries.
It cannot estimate production traffic, authentication, latency, or deployment reliability.

It cannot freeze mutable upstream content.
Sequential arms can contain upstream time drift.
Advertised upstream identity checks reduce this risk.
They cannot detect every content change.

It cannot prove a Scout-only causal effect.
It cannot assign gains to one commit inside the revision range.

## Full 500 versus affected-set arms

Use full 500-case arms for both revisions.
Do not buy separate affected-set arms.

The revision range is broad.
The final corpus also differs throughout the range.
An affected-set selector would need subjective exclusions.
It could miss indirect routing and execution effects.

The full pair provides the powered denominator after T4 and T5 exclusions.
It also provides the required full current-quality candidate result.

Create one affected-set list before spend for review stratification only.
Derive it from the final service diff and free routing changes.
Freeze its ordered IDs and SHA-256.

Report that subset as a secondary descriptive view.
Do not give it a separate paid collection.
Do not use it as the primary product-impact result.

## Required measurement tuple

Both arms must share every value below:

- current clean runner revision
- exact final `eval/qa/cases.json` bytes
- exact ordered 500 IDs
- case identity schema `qa-judge-case-v2`
- result schema from the frozen runner
- variant `A`
- surface `search-execute`
- answering model `claude-sonnet-5`
- judge model `claude-sonnet-5`
- rubric `v2.10`
- pack `p6`
- `promptAppend: null`
- policy `stability-boundary-v1`
- stability threshold `0.75`
- one pinned stability-register file and SHA-256
- `--max-panel-cases 34`
- the same Claude executable path, version, and SHA-256
- the same inherited Claude environment SHA-256
- the same server secret values and non-secret settings
- one runner implementation SHA-256
- one launcher or adapter SHA-256

Each arm must use its own server revision and surface SHA-256.
The surface difference is part of the service treatment.

Every artifact must report `meta.comparable: true`.
Every artifact must report complete and allowed aggregates.
Every row must report the `raven` MCP server as connected.

Use one frozen stability register for both arms.
Generate it before the first paid call.
Do not regenerate it between arms.

The paired printer requires at least 100 eligible IDs.
Use its stored-run `--json` output.
The default `0.08` margin is a no-change radius.
It is not a product tolerance or ship gate.

## Exact-old-runtime support

The exact old runtime cannot pass the current runner unchanged.
Its initialize response lacks `serverInfo.sourceRevision`.
The current runner will refuse collection before any answer call.

Do not weaken or bypass this guard.
Do not use the old evaluator.
Either choice would break the same-tuple contract.

Add a local measurement adapter before launch.
Use the same adapter on both service arms.
The adapter must proxy all MCP traffic without changing tool behavior.

For the old arm, the adapter may add only the attested source revision.
For the candidate arm, it must verify and preserve the native revision.
It must preserve instructions, tool schemas, results, errors, and streaming semantics.

The runner must attest both listener processes.
It must attest the adapter listener and the upstream Wrangler listener.
It must record both clean worktree identities before and after collection.

The adapter must live in the clean runner revision.
Its hash must enter the measurement identity.
An independent reviewer must verify its pass-through behavior.

A metadata backport onto the old source is not the exact old revision.
Such a commit can support a behavioral-replica comparison only.
Do not label that fallback as the literal `90d0ba75` revision.

## Clean worktree topology

Create three detached clean worktrees outside the active dirty tree.

| worktree | revision | purpose |
| --- | --- | --- |
| runner | one reviewed measurement revision | current runner, corpus, judge, adapter, and result storage |
| baseline server | `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0` | exact old service runtime |
| candidate server | final candidate SHA | final service runtime |

Install dependencies from each worktree's lockfile.
Use the runner worktree for both paid commands.
Use an empty temporary directory for each answering agent.

Use one owned server pane and one public evaluation port.
Run only one Wrangler process at a time.
For each arm, run one adapter and one upstream Wrangler together.
Run the two service arms sequentially.

Use one private upstream port for Wrangler.
Use one public loopback port for the adapter.
Record both listener process identities.

Use identical `.dev.vars` bytes for both server worktrees.
Do not print any secret or raw environment value.
Record a secret-safe equality attestation before and after both arms.

Run the candidate arm first.
It gives the current-quality result before any baseline spend.
Stop before the baseline when the candidate artifact is incomplete.

Stop the candidate server after its postflight.
Start the baseline server on the same ports.
Run the baseline arm immediately after its free preflight.

## Paid command shape

Use this command shape from the clean runner worktree.
Substitute only recorded hashes, revisions, paths, and the port.

```sh
node eval/qa/run-qa.mjs \
  --cases eval/qa/cases.json \
  --variant A \
  --surface search-execute \
  --model claude-sonnet-5 \
  --judge-model claude-sonnet-5 \
  --max-panel-cases 34 \
  --stability-register <PINNED_STABILITY_REGISTER> \
  --port <ADAPTER_PORT> \
  --server-revision <ARM_SERVICE_REVISION> \
  --expect-sha256 <ARM_SURFACE_SHA256> \
  --expect-agent-binary-sha256 <CLAUDE_BINARY_SHA256> \
  --expect-agent-environment-sha256 <CLAUDE_ENVIRONMENT_SHA256> \
  --max-budget-usd 400
```

Do not pass `--sample`, `--ids`, `--judge-panel`, or `--no-judge`.
Keep `QA_AGENT_PROMPT_APPEND` unset for both arms.

After both arms complete, run this free comparison:

```sh
npm run eval:qa:paired -- <BASELINE_RESULT> <CANDIDATE_RESULT> --json
```

Use rejudges only as review evidence.
They must not replace the primary stored verdicts.

```sh
node eval/qa/re-judge.mjs <CANDIDATE_RESULT> \
  --flips-vs <BASELINE_RESULT> \
  --cases-ref <RUNNER_REVISION> \
  --max-budget-usd 25

node eval/qa/re-judge.mjs <BASELINE_RESULT> \
  --flips-vs <CANDIDATE_RESULT> \
  --cases-ref <RUNNER_REVISION> \
  --max-budget-usd 25
```

## Exact caps

Replace the earlier `.50` arm design with this ledger.

| method | cap | rule |
| --- | ---: | --- |
| `p6` judge self-test | `$3.50` | seven calls, `$0.50` each, no retry |
| final candidate, full 500 | `$400` | one `run-qa.mjs` total cap |
| exact old revision, full 500 | `$400` | one `run-qa.mjs` total cap |
| candidate flip rejudge | `$25` | one `re-judge.mjs` total cap |
| baseline flip rejudge | `$25` | one `re-judge.mjs` total cap |
| total | `$853.50` | no transfer and no automatic repeat |

The `$400` arm cap has historical support.
The prior 497-case collection cost `$303.86782035`.
The current same-100 collection cost `$40.9579502`.
Those runs used different grading contracts.
They are cost references only.

The self-test still lacks one native total cap.
Use one reviewed wrapper with seven `$0.50` per-call caps.
Hash the wrapper and Claude executable before use.

The two `$25` rejudge caps cover only grade-discordant rows.
A cap exhaustion leaves remaining flips unconfirmed.
It does not change the primary paired result.

Unused money authorizes no extra method or rerun.
Any repeat needs a new ledger amendment and pre-spend review.

## Reconciliation with the earlier `.50` plan

The earlier `.50` plan totals `$853.50`.
It uses two `$140` affected-set arms and one `$500` candidate arm.
That structure does not estimate the requested full-corpus revision effect.

Remove both `$140` affected-set collections.
Replace the `$500` candidate cap with `$400`.
Add one `$400` exact-old-revision arm.

Remove the `$20` live-15 method from this authorization.
The full candidate arm has priority for this product-impact question.
The live-15 method can receive separate authorization later.

Keep the `$3.50` self-test and both `$25` flip batches.
The resulting maximum stays exactly `$853.50`.

The round ledger still contains the older `$875` table.
The `.50` report does not amend that ledger by itself.
The coordinator must record this replacement before spend.

## Upstream-state controls

Capture free upstream identity evidence before each arm.
Capture it again after each arm.

Record every available upstream version, catalog hash, and service timestamp.
Record the Scout OpenAPI version and SHA-256.
Record equivalent identities for Lumenloop and Stellar Docs when available.

Stop when an advertised upstream identity changes between arm preflights.
Stop when an advertised identity changes during either arm.
Do not silently restart after such a change.

Run both arms in one continuous measurement window.
Record the candidate-first order as a limitation.
Do not claim that the method removes upstream time drift.

## Stop rules

Stop before all paid calls when any condition below occurs:

- The final candidate has no clean 40-character revision.
- The runner or either server worktree is dirty.
- Any required deterministic repository gate fails.
- The final corpus does not contain exactly 500 unique active IDs.
- The final corpus bytes or ordered-ID hash changes after registration.
- The adapter lacks an independent pass-through review.
- The exact old runtime fails the free adapter compatibility proof.
- Any model, rubric, pack, tier, binary, environment, or prompt pin differs.
- The `p6` self-test fails or exceeds `$3.50`.
- A live surface or source-revision preflight fails.
- Either listener identity is missing or mismatched.
- An advertised upstream identity changes.

Stop the next paid call when any condition below occurs:

- A result reaches its method cap.
- Any paid call omits reported cost.
- Any planned row is missing, duplicated, or unjudged.
- A source, surface, listener, binary, environment, or corpus pin changes.
- The artifact reports `meta.comparable` as false.
- The artifact suppresses its aggregate.
- Any row loses the required `raven` connection.
- Review confirms an unsafe or fabricated candidate answer.
- Two unrelated rows show the same candidate-caused regression.

Do not convert an incomplete 500-case run into a smaller-denominator result.
Do not resume with a changed stability register or panel cap.

After the paired printer, apply these rules:

- Stop after `FAIL`.
- Stop after `PASS`.
- Stop after any candidate-only T4 or T5 loss.
- Stop when fewer than 100 IDs remain eligible.
- Treat other `INDETERMINATE` results as unfinished evidence.

The fixed method requests one repeat after statistical `INDETERMINATE`.
This ledger does not fund that repeat.
Request new authorization before any repeat.
There is never a third look.

## Review coverage

Review all 1,000 collected answers and verdicts.
Review all 500 baseline-candidate row pairs.
Record every ID once in a coverage table.

For every candidate row, verify these items:

- the answer follows the question scope
- the selected tools fit the task
- every material claim has transcript support
- omissions match the golden requirements
- the verdict follows rubric `v2.10`
- the evidence pack represents the transcript fairly

Apply the same checks to every baseline row.
This prevents asymmetric review credit.

Deep-review every wrong, partial, T3, T4, and T5 row.
Deep-review every grade transition between arms.
Review every correct row for unsupported claims and hidden omissions.

Live-check each mutable claim before confirming a wrong result.
Do not treat a current upstream change as an agent failure.

Run both bounded rejudge batches for grade-discordant rows.
Treat those outputs as stability evidence only.
Do not overwrite the primary tiered verdicts.
Review every rejudge output before making a row-level claim.

Run the free plan regrade on both complete artifacts.
Keep plan quality separate from answer quality.

Classify each confirmed failure with the `run-evals` root-cause table.
Route own-repo defects to `.agents/TODO.md`.
Route verified upstream defects to `improvements/`.
Use `golden-truth` for every gospel change.

The result reviewer must differ from the executor and orchestrator.
The adapter reviewer must differ from its author.
The final reviewer must recompute counts, hashes, costs, exclusions, and transitions.

## Exact blockers

1. The exact old server lacks `serverInfo.sourceRevision`.
2. The current runner lacks a dual-listener attestation adapter.
3. The adapter needs tests and an independent pass-through review.
4. The final candidate has no clean immutable revision.
5. The final 500-case bytes and ordered IDs are not frozen.
6. The final binary, environment, stability, surface, and upstream pins are absent.
7. The paid `p6` judge self-test has not passed.
8. The round ledger does not contain the revised `$853.50` full-pair method.
9. The final free gates and candidate review have not completed.

BLOCKERS: 1-9
