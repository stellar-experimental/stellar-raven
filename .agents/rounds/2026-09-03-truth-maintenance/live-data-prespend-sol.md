# Live-data pre-spend amendment review

Date: 2026-09-03

Role: independent reviewer

## Decision

Run both frozen live contracts after the paired 500-case method.

The canonical 15-case contract is necessary.
It tests live execution behavior that the 500-case battery does not isolate.

The two-case digest supplement is also necessary.
The measured revision range changes the runnable digest and its date handling.

Run both contracts against the final candidate only.
Do not add matching baseline live runs.
The paired 500-case method already estimates the service-revision effect.

Keep all three denominators separate.
Do not combine the 500, 15, and two-case results.

The amendment is not ready for paid launch.
The exact blockers appear at the end of this report.

## Evidence reviewed

I read the current round ledger and `two-week-impact-prespend-sol.md`.
I also read the final routing and adapter review records.

The final routing decision rejects the Scout 1.9.23 drift.
It restores the committed Scout 1.9.1 inventory and operation surface.

The two-week treatment still changes execution and grounding behavior.
The revision range changes these relevant files:

- `src/executor/providers.ts`
- `src/executor/run.ts`
- `src/policy/source-basis.ts`
- `src/mcp/tools.ts`
- `src/skills/runners/stellar-ecosystem-digest.ts`
- `src/skills/scrub.ts`
- `src/skills/source.ts`
- `src/skills/store.ts`

The digest runner now removes unverified A/V `created_at` date meaning.
The supplement directly tests recent, dated digest output.

Neither frozen live contract changed since `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`.
`npm run eval:selftest` passes both contract pins.

## Necessity and scope

| Method | Decision | Reason |
|---|---|---|
| `live-data-canonical-v3` | Run | It isolates current live grounding, soft-empty, provenance, and artifact continuation behavior. |
| `live-digest-supplement-v2` | Run | It tests both digest modes and the changed A/V date projection. |
| Baseline canonical live arm | Do not run | The full pair already measures the revision effect. Mutable upstream data weakens another pair. |
| Baseline digest arm | Do not run | The full pair already measures the revision effect. The supplement is a candidate health check. |
| Another candidate 500-case run | Do not run | The candidate arm from the pair is the current-quality result. |
| Sample 30 | Do not run | It duplicates a smaller slice after the complete candidate arm. |

The 17 live IDs have no exact ID overlap with the 500-case battery.
The 500-case battery does cover every named operation.
This operation overlap creates topical duplication, not contract duplication.

The canonical lane adds five important behavioral boundaries.
They cover lifecycle provenance, jobs recency, cross-service reconciliation, soft-empty recovery, and artifact continuation.

The digest supplement adds two different live query modes.
It covers one theme query and one entity query.
The two battery digest cases only check general response handling.

Do not claim extra product impact from the live results.
Use them only as separate candidate grounding diagnostics.

## Frozen contract pins

| Contract | Cases | File SHA-256 | Membership SHA-256 | Case-content SHA-256 |
|---|---:|---|---|---|
| `live-data-canonical-v3` | 15 | `d13ebc2ad9d592dbd91dd8ec02b4e2139a335ac20bb0d5bc6c46fcec97a389f0` | `6f8b02d61176c698e2e6c3a5c11ce8136d0fa8421515569769f530e8202ffa02` | `2a9c98d1088acc7bbbf563ac3a95fbe74e2bea81901c6d0fcc6e5860b1c23340` |
| `live-digest-supplement-v2` | 2 | `35d6e5c3842aaf2b22cc451d3234705e7ad0ce40047e01e5967228cbd3c42628` | `5a228594f3358c7c70ffbf8e1b1024f406dc10c7a0a7de13410f48f367248e3b` | `a0e8ec59360c27d7acb50ff4ee76240cfc78c87e73204b1ecc458ce865e11900` |

Run each complete ordered membership.
Do not use `--ids`, `--sample`, or a merged cases file.

The current 500-case file SHA-256 is provisional.
It is `1042c0e226ad44b5ffab8844e1c97a2752f94a3096b13e628ed630fd0f015c7f`.

The current ordered 500-ID SHA-256 is also provisional.
It is `b557bcb5cff8a434ad684b90a60343358360330ca1f91072089ceb57a38310d0`.

The paired artifacts must carry the final versions of both values.
The live methods must not change either value.

## Required measurement pins

Use the same final candidate and runner identities as the paired candidate arm.

Pin every item below before the first live-data call:

- one clean 40-character runner revision
- one clean 40-character final candidate revision
- the candidate MCP `surfaceSha256`
- the candidate server source revision
- the Claude executable path, version, and SHA-256
- the inherited Claude environment SHA-256
- the judge model `claude-sonnet-5`
- the answering model `claude-sonnet-5`
- rubric `v2.10`
- evidence pack `p6`
- variant `A`
- surface `search-execute`
- `promptAppend: null`
- policy `stability-boundary-v1`
- stability threshold `0.75`
- explicit `--max-panel-cases 10`
- the paired method's pinned stability-register path and SHA-256
- the adapter revision and implementation SHA-256
- public adapter and private Wrangler ports
- equal secret bytes and non-secret settings
- preflight and postflight upstream identities

Reuse the paired method's stability register.
Do not regenerate it after the 500-case results enter the results directory.

Use candidate adapter mode `verify-native`.
The current adapter SHA-256 is:

`ff392a22f2de96d8c11d54bcb2fa0092602d97ba1b2efef4c5c1c3be917b9dfd`

Recompute this hash from the clean runner revision.
Reject any difference.

The current runner-related file hashes are provisional:

| File | Current SHA-256 |
|---|---|
| `eval/qa/run-qa.mjs` | `329f10df71d4bc54c6ed73d737beeaf869e21ba83216d89e587e89c3890f3ad9` |
| `eval/qa/judge.mjs` | `1e96f3ebe9806b3f9f3554fdb2a1a8f8ea0342d82a25f5b6db9c3a63f8e9c2d9` |
| `eval/qa/evidence-pack.mjs` | `9f10cea4641ad808d8469e4518a4c77bffeda05f32546d0af5ac8cf9d6b31cc7` |
| `eval/qa/run-p6-judge-self-test.mjs` | `85dd6a22bdb1c1acbcc742d7b80fb8cfcf02898c15dba2c9b3570bbcee36f834` |

Freeze the committed hashes before launch.
Do not use these provisional values as launch authority.

## Exact caps

| Method | Cap | Calls and scope |
|---|---:|---|
| Canonical live collection | `$20` | One complete 15-case `run-qa.mjs` method. |
| Canonical verdict rejudge | `$3` | One single-call batch for review-disputed IDs only. |
| Digest supplement collection | `$5` | One complete two-case `run-qa.mjs` method. |
| Digest verdict rejudge | `$1` | One single-call batch for review-disputed IDs only. |
| Amendment maximum | `$29` | No transfer, resume, repeat, or added method. |

The canonical cap exceeds the recorded `$9.54` p3 maximum.
It also covers bounded p6 panel escalation.

The digest cap exceeds the recorded `$1.80` p3 maximum.
It also covers bounded p6 panel escalation.

Skip a rejudge method when no verdict remains disputed after review.
Unused money authorizes no other call.

Do not repeat the paid p6 self-test.
Require its valid result from the paired method.

## Command shapes

Run this command from the clean runner worktree:

```sh
node eval/qa/run-qa.mjs \
  --cases eval/qa/corpus/live/live-cases.json \
  --variant A \
  --surface search-execute \
  --model claude-sonnet-5 \
  --judge-model claude-sonnet-5 \
  --max-panel-cases 10 \
  --stability-register <PAIR_STABILITY_REGISTER> \
  --port <ADAPTER_PORT> \
  --upstream-port <WRANGLER_PORT> \
  --adapter-mode verify-native \
  --adapter-revision <RUNNER_SHA> \
  --expect-adapter-sha256 <ADAPTER_SHA256> \
  --server-revision <CANDIDATE_SHA> \
  --expect-sha256 <CANDIDATE_SURFACE_SHA256> \
  --expect-agent-binary-sha256 <CLAUDE_BINARY_SHA256> \
  --expect-agent-environment-sha256 <CLAUDE_ENVIRONMENT_SHA256> \
  --max-budget-usd 20
```

Run the digest supplement with the same pins:

```sh
node eval/qa/run-qa.mjs \
  --cases eval/qa/corpus/live/live-digest-supplement-cases.json \
  --variant A \
  --surface search-execute \
  --model claude-sonnet-5 \
  --judge-model claude-sonnet-5 \
  --max-panel-cases 10 \
  --stability-register <PAIR_STABILITY_REGISTER> \
  --port <ADAPTER_PORT> \
  --upstream-port <WRANGLER_PORT> \
  --adapter-mode verify-native \
  --adapter-revision <RUNNER_SHA> \
  --expect-adapter-sha256 <ADAPTER_SHA256> \
  --server-revision <CANDIDATE_SHA> \
  --expect-sha256 <CANDIDATE_SURFACE_SHA256> \
  --expect-agent-binary-sha256 <CLAUDE_BINARY_SHA256> \
  --expect-agent-environment-sha256 <CLAUDE_ENVIRONMENT_SHA256> \
  --max-budget-usd 5
```

Use one `re-judge.mjs` call per contract when review requires it.
Freeze the selected ID list before each call.
Use `--cases-ref <RUNNER_SHA>` and the matching method cap.
Do not use `--flips-vs` because these are candidate-only diagnostics.

## Required order

1. Complete the candidate and baseline 500-case arms.
2. Run the free paired printer with `--json`.
3. Complete the full paired-result review and apply its stop rules.
4. Restart the exact final candidate on the registered ports.
5. Run all free identity, surface, contract, and upstream checks.
6. Run the canonical 15-case method.
7. Complete its postflight and all-row review.
8. Run its rejudge batch only for unresolved verdict disputes.
9. Run the digest method only if the canonical review finds no systemic blocker.
10. Complete its postflight and both-row review.
11. Run its rejudge batch only for unresolved verdict disputes.
12. Run the free plan grade on each complete artifact.
13. Report the 500, 15, and two-case results separately.

Do not insert either live method between the two 500-case arms.
That delay would increase upstream-time imbalance between paired arms.

## Stop rules

Stop before the amendment when the paired result reports `FAIL`.
Also stop for any paired guard failure or candidate-only T4 or T5 loss.

A statistical `INDETERMINATE` does not automatically block these diagnostics.
The two 500-case artifacts must still be complete and comparable.

Stop before the first live call when any condition below occurs:

- the final candidate or runner lacks a clean commit
- any frozen contract hash differs
- any model, rubric, pack, prompt, tier, binary, or environment pin differs
- the paid p6 self-test did not pass under the same runner identity
- any deterministic free gate fails
- the candidate adapter review remains unresolved
- the candidate listener or surface attestation fails
- an upstream advertised identity changed after the pair
- the amendment lacks recorded authorization in the round ledger

Stop the next paid call when any condition below occurs:

- a method reaches its cap
- a paid call omits reported cost
- a planned row is missing, duplicated, or unjudged
- `meta.comparable` is not `true`
- an aggregate is suppressed
- a row lacks the connected `raven` MCP server
- a source, listener, surface, binary, environment, or contract pin changes
- the postflight identity differs from the preflight identity
- review confirms an unsafe or fabricated candidate answer
- two unrelated rows show the same candidate-caused defect

The runner may use only its fixed typed judge retry.
Do not retry a safeguard, timeout, consistency error, or provider failure.

Do not convert an incomplete contract into a smaller result.
Do not resume or rerun a stopped method under this amendment.

A canonical systemic failure stops the digest method.
It also stops both optional rejudge methods unless a rejudge can classify that failure.

## Duplication risks

The main battery has topical matches for most canonical questions.
It also has two cases that name the digest skill.

This creates four risks:

1. A report can count the same topic twice.
2. A report can mistake operation coverage for behavioral coverage.
3. A report can attribute mutable upstream drift to the candidate.
4. A report can merge different denominators into one quality rate.

Control these risks with separate artifacts and separate tables.
Do not average or pool their grades.

Do not label live-lane movement as a paired treatment effect.
Do not compare p6 results directly with the historical p3 baselines.

## Review coverage

Review every answer, transcript, and verdict in both contracts.
Record all 17 IDs once in a coverage table.

For every row, verify these items:

- the agent used a suitable live operation
- the transcript supports every material claim
- the answer preserves data, soft-empty, and error distinctions
- the answer gives an as-of date for mutable facts
- the answer does not invent unsupported facts
- the evidence pack represents the transcript correctly
- the verdict follows rubric `v2.10`
- the T1 through T5 classification is correct

Review the canonical behaviors by boundary:

- current RFP membership and status
- passkey and smart-account RFP filtering
- hackathon winner-order evidence
- repository activity and maturity qualifications
- leaderboard freshness and basis
- category taxonomy limits
- latest SCF round and approximate counts
- region vocabulary shape
- market-price refusal
- lifecycle status provenance
- jobs recency and duplicate-title handling
- cross-service attribution and reconciliation
- guessed-slug soft-empty recovery
- artifact continuation after truncation

Review both digest modes separately.
Check the returned window, calls, counts, items, URLs, and `softEmpty` value.

Verify that A/V `created_at` is not presented as a recording or publication date.
Verify that valid article and event dates remain available.

Deep-review every wrong, partial, T3, T4, and T5 row.
Deep-review every correct row for hidden fabrication or material omission.

Live-check every mutable claim before confirming an agent failure.
Use rejudges only as stability evidence.
Never replace the primary verdicts with rejudge results.

The result reviewer must differ from the executor and orchestrator.
The final reviewer must recompute counts, costs, hashes, and exclusions.

## Current blockers

B1. The paired 500-case method has not completed.

B2. The active tree has 63 changed or untracked entries.
`HEAD` remains `2ee801f80d626e68f010392a7d541aab7997349d`.
No clean final candidate or runner revision exists.

B3. `adapter-review-sol.md` remains `CHANGES-REQUIRED`.
Its paired guard, accounting, runtime proof, and codec findings remain unresolved.

B4. The paid p6 judge self-test has not passed.
The free static and contract preflights pass, but they do not replace that paid gate.

B5. The final surface, binary, environment, stability-register, listener, and upstream pins are absent.

B6. The round ledger still carries the older `$875` plan.
It does not adopt the revised `$853.50` pair or this separate `$29` amendment.

B7. The final candidate gates and full independent review have not completed.

B8. The paired result and its all-row review do not exist yet.
Therefore, this review cannot apply the required post-pair stop decision.

BLOCKERS: B1, B2, B3, B4, B5, B6, B7, and B8.
