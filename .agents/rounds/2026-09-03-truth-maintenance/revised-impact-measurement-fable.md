# Revised two-week impact measurement — revision 3, 2026-09-04

Lane: measurement design. Model: Claude Fable 5.1 at `high` for revision 3. Revisions 1 and 2
used Fable 5.1 at `xhigh`.

Revision history:

- Revision 1 was written on branch `codex/tm-impact-plan` at `898063e` and committed as `f101cee`.
  The round branch carries it as `74e756d`.
- The independent review `revised-impact-measurement-review-sol.md` (Codex Sol high, commit
  `3ac5bac`) returned `CHANGES-REQUIRED` with findings S1 to S6 and P1 to P7.
- Revision 2 was written in worktree `/private/tmp/stellar-raven-tm-final-synthesis` on branch
  `codex/tm-final-synthesis` at `e0df186`. It was committed as `b5dca1c`.
- The independent review `final-synthesis-review-sol.md` (Codex Sol high, commit `f766893`)
  returned `CHANGES-REQUIRED` on revision 2 with findings P1 to P3 and S1 to S3.
- Sol repaired P1 to P3 in the launch contract. The repair is commit `1847ffd`. The report is
  `launch-contract-repair-sol.md`. The authoritative v2 capacity evidence is commit `dc0761d`.
- Revision 3 is this file. It was written in worktree `/private/tmp/stellar-raven-tm-final-docs-repair`
  on branch `codex/tm-final-docs-repair` at `dc0761d`. The actual whole-round branch
  `codex/truth-maintenance-2026-09-03` contains the work through `dc0761d`. The final supervisor contract is the
  one at `1847ffd`. It includes the mandatory content identity from `a5ac32f`, whose I1 closure
  review is `5603d6d`.

This revision awaits an independent review. Nobody has reviewed revision 3. It authorizes
nothing. I made no paid call, started no server, used no network, and changed no code. The only
live read behind this file is the public Scout changelog read for revision 1 on 2026-09-04.

## What changed from revision 2

| Finding | Revision 3 change |
| --- | --- |
| P1 authorization | The plan uses `qa-paired-collection-plan-v2`. The owner signs an external record that names the canonical plan SHA-256. The signature covers that hash and every command array in the plan. The plan freezes the exact P6, capacity, collection, stored-judge, flip, and comparison commands. Each flip command pins the Claude path, binary SHA-256, and environment SHA-256. A valid zero-flip result requires `--allow-empty`. |
| P2 capacity | The plan binds the exact free capacity command, the instrument bytes, the artifact bytes, a fixed schedule, fixed thresholds, and a 24-hour freshness window. The authoritative v2 `PASS` artifact is recorded below. |
| P3 denominator | The plan records `selected.count: 200` and `selected.activeCorpusCount: 500`. It records all four corpus hashes. Both runner worktrees recompute every one. Any mismatch stops the launch. |
| S1 stale claims | The final supervisor contract is `1847ffd`, not `e0df186`. Commits `a5ac32f`, `5603d6d`, `1847ffd`, and `dc0761d` are in the round record. The whole-round branch contains the work through `dc0761d`. Every provisional hash below is recomputed at `dc0761d`. |
| S2 round state | The round stays open. `NEXT.md` lists completed repair work, not a completed round. |
| S3 production label | Production is described as the last recorded deployment state from 2026-09-02. Nobody verified the live Worker during this documentation pass. |

The revision 2 changes from revision 1 (S1 to S6, P1 to P7 of the first review) stand as written.

## Recommendation

Run one supervised 200-case paired subset. Collect both arms at the same time on two isolated
server pairs under `npm run eval:qa:paired:collect`. Use answering only. Judge both stored
artifacts afterwards, one arm after the other. Keep the landed remote identity guard exactly as
reviewed. Launch inside a weekend UTC window.

This is the smallest design that can return a verdict other than `INDETERMINATE`. It can also
finish inside one Scout identity epoch with a useful probability. It keeps the exact common IDs,
the same tuple, the current corpus, the exact baseline revision, and the remote identity guard.

The full 500x2 sequential pair stays designed and unfunded. Under the landed guard it needs more
than 22 hours without a Scout release. Scout shipped 30 spec versions in the seven days before
2026-09-04.

## Facts that bound the design

| Fact | Value | Source |
| --- | --- | --- |
| Stopped candidate arm | 500 rows, about 11.19 h wall, `$190.1686672` (`$130.17` agent, `$60.00` judge) | artifact `2026-09-04T05-40-51-variantA.json`, SHA-256 `e629666b…5904f7` |
| Stopped arm status | diagnostic and non-comparable; Scout changed from `1.9.23` to `1.9.30` inside the arm | `post-candidate-stop-audit-sol.md` |
| Per-row answering time | mean 44 s, p50 36 s, p90 85 s | same artifact, `attempts.agent[].durationMs` |
| Per-row judge time | about 36 s | same artifact, wall minus agent time |
| Per-row cost | mean `$0.38`; agent `$0.26`; judge `$0.12`; p90 `$0.61`; max `$1.20` | same artifact |
| Executor fault in that arm | 380 of 500 rows and 493 occurrences of `Could not serialize object`; repaired by `795fa41` | row reviews; `envelope-serialization-fix-terra.md` |
| Scout spec cadence | `spec@1.9.0` on 2026-08-28 to `spec@1.9.30` on 2026-09-04: 30 releases in 7 days, mean gap 5.6 h | live `https://stellarlight.xyz/api/changelog`, 232 entries, read 2026-09-04 |
| Scout burst | `1.9.23` at 22:35Z on 09-03 to `1.9.30` by 04:34Z on 09-04: 7 releases in 6 h | stop audit |
| Scout quiet days | 0 releases on 08-22 and 08-30 (both weekend days); 1 on 08-23 | live changelog per-day counts |
| Guard semantics | before and after capture per answering call; every capture must equal the pre-arm vector; any change stops the arm; one postflight capture; printer requires one shared vector across both arms | `remote-identity-guard-review-opus.md`, final `PASS` |
| Guard cost | about 0.47 s and seven public HTTP requests per capture; seven Algolia search operations and one settings read per capture | guard bounds re-review, R2 |
| Guard timeout | 20 s per request, two retries, `Retry-After` capped at 5 s; 140 s network budget; 145 s process timeout | guard bounds re-review, R3 |
| Docs enumeration ceiling | the probe fails closed above 1,000 `lvl1` records; the live set has 650 | guard review, R4 |
| Supervisor deadline | `PAIRED_COLLECTION_DEADLINE_MS` = 14,400,000 ms (four hours) | `eval/qa/paired-collection-supervisor.mjs` |
| Supervisor drain | 30,000 ms drain, then `SIGTERM`, then `SIGKILL` after 5,000 ms; 1,000 ms IPC drain | same file |
| Plan schema | `qa-paired-collection-plan-v2`; canonical SHA-256 over recursively key-sorted JSON; launch requires `--authorized-plan-sha256` | same file, `1847ffd` |
| Capacity contract | `qa-paired-capacity-check-v2`; two captures on one barrier; 14 responses; freshness 86,400,000 ms | `eval/qa/check-paired-capacity.mjs` |
| Printer floor | 100 eligible IDs after the T4 and T5 union exclusion | `MINIMUM_ELIGIBLE_IDS` |
| Look bound | one-sided `alpha = 0.007143`, `z = 2.4499904614`; radius `= z * SE` per cutpoint | `paired-verdict.mjs` |
| Corpus at `dc0761d` | 500 unique active IDs; cases file SHA-256 `1842a188437ea0ae265f6ab6c897de00220de23f4b34b9fe7b6d93f80f142396`; content SHA-256 `c5d0c804ddd9ce241fae90398ee0d83808e5d847f049d118e4ad15903d07b43e`; ordered 500-ID SHA-256 `b557bcb5cff8a434ad684b90a60343358360330ca1f91072089ceb57a38310d0` | recomputed for this revision; the corpus bytes are unchanged since `e0df186` |
| Stability register | `/private/tmp/stellar-raven-tm-paired-stability.json`, SHA-256 `06d3835b63ae05f40f808b9890628add8b905f32f60a65df19cbee1a751f9480`, 538 cases | launch review pins |
| Baseline revision | `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`, adapter mode `add-missing` | ledger and launch review |

The sampler is deterministic and depends only on IDs and service tags. Golden text edits do not
move membership. Added or removed cases do. The supervisor forbids `--sample`, so the sampler only
derives the explicit `--ids` list that the manifest freezes.

## Options compared

Survival is `exp(-W / 5.6 h)` at the weekday mean gap and `exp(-W / 16 h)` at the observed
weekend rate. W is the exposed window: the pre-arm stable probe and preflights plus the answering
phase. These are planning estimates from the dated cadence above. They are not validated operating
characteristics.

| Option | Exposed window W | Survival weekday / weekend | Eligible n (expected) | Cost cap | Verdict |
| --- | --- | --- | --- | --- | --- |
| A. 500x2 sequential, judge inline | about 22.4 h | 2% / 25% | 485 | `$853.50` (spent method table) | Not feasible under the landed guard. Do not fund. |
| A2. 500x2 sequential, answer-only then stored judging | about 13.6 h | 9% / 43% | 485 | about `$900` | Still a coin flip at best. Do not fund now. |
| B. 200 subset sequential, answer-only then stored judging | about 5.5 h | 37% / 71% | 190 | `$273.50` | Feasible on a weekend only. Fallback if the owner refuses two server pairs. |
| C. 200 subset, two server pairs under the supervisor, answer-only then stored judging | 2.75 h to 4.25 h | 61% to 47% / 84% to 77% | 190 | `$273.50` | **Recommended.** |
| C2. 500 subset under the supervisor | 6.8 h or more | 30% / 65% | 485 | about `$600` | Powered upgrade. Fund only with an owner-accepted one-in-three weekday loss risk and a longer deadline decision. |
| D. No new spend | none | n/a | 0 pairs | `$0` | No two-arm evidence exists. Supports free search-layer deltas only. |
| E. Per-pair identity epochs with interleaving | 1.6 min per pair | 99.5% per pair | up to 485 | engineering first | The only route to a powered pair at Scout's cadence. Follow-up decision. |

Option C2 note. The supervisor deadline is a frozen four-hour constant. A 500-row lockstep arm
does not fit inside it. The supervisor also requires exactly 200 selected IDs. C2 therefore needs
a reviewed constant change before it is an option.

Option D detail. The repository holds no baseline answers under the `v2.10` and `p6` tuple. The
2026-08-19 paid artifact is not in the repository. The 2026-08-26 reviewed artifacts hold eight
rows under pack `p5`. The stopped candidate artifact spans two Scout identities and a broken
executor. No stored data can form a pair. Free instruments still measure part of the change:
`npm run eval:routing -- --gate` at both revisions gives exact search-ranking deltas over 460
labeled routing cases, and the affected-case stratum records 215 top-five differences. Those
support a claim about search ranking. They cannot support a claim about answer quality.

Option E detail. The printer and the guard both assume one identity vector for the whole pair.
Interleaving per ID needs a runner mode that alternates two server pairs, records the vector per
row, excludes any pair whose two captures differ, and a printer rule for those exclusions. The
guard review found this need in R1 without prescribing a change. It is one to two agent days plus
an independent review. It is the correct long-term shape. It is not the smallest next measurement.

## Recommended design (Option C)

### Sample construction

- Derive the 200 IDs with the deterministic sampler at the launch revision. Pass them as the
  explicit ordered `--ids` list in both collection commands. `--sample` is forbidden.
- The sampler is proportional by service with even-spaced picks over id-sorted strata.
- Composition at `dc0761d`: Docs 96, Scout 57, Lumenloop 25, skills 13, none 9. Freshness: stable
  84, scheduled 60, live 56. Traps: 16.
- Ordered 200-ID SHA-256 at `dc0761d`:
  `8ba8e687ace17711cabb3932ca6d5e2edebede2bfbfcfbfd79ce3fca3bbd20da`.
- Selected 200-content SHA-256 at `dc0761d`:
  `b8512352599ed9df760113cb86db8337ae3136a1cec4aea8461ef08d61e55ee1`.
- Ordered 500-ID SHA-256 at `dc0761d`:
  `b557bcb5cff8a434ad684b90a60343358360330ca1f91072089ceb57a38310d0`.
- Cases file SHA-256 at `dc0761d`:
  `1842a188437ea0ae265f6ab6c897de00220de23f4b34b9fe7b6d93f80f142396`.
- The 150-ID fallback hashes to `cbc850c65ad18709ae5a5d94c6ae009f041b78a6a11b0f51e5888959ca7001cc`
  with content `f0ffb53fb3a3312197310a9b157e7e6d6cbd66420d37596e8893fc6c763dcc0c`. The landed
  supervisor rejects a 150-ID plan. The fallback needs a reviewed constant change.
- The plan records `selected.count: 200`, exactly 200 ordered `selected.ids`,
  `selected.activeCorpusCount: 500`, `selected.idsSha256`, `selected.contentSha256`,
  `selected.casesFileSha256`, and `selected.activeCorpusIdsSha256`.
- Both runner worktrees recompute all four hashes from their own `--cases` path. Each runner must
  hold exactly 500 unique active IDs. Every selected ID must be active. Any mismatch stops the
  launch before the first paid call.
- The estimand covers the selected 200 IDs. It does not estimate all 500 IDs. The sampler
  stratifies by service only. It does not randomize cases or stratify freshness.
- The affected-case stratum selects 496 of 500 cases. It cannot narrow the sample. Report it as a
  descriptive view only.

### Tuple and pins

Both arms share every value below. The manifest records each value before spend.

| Pin | Value or rule |
| --- | --- |
| Runner revision | one clean 40-character commit that contains the remote identity guard, the envelope serialization repair, the coverage-metric retirement, the paired supervisor, and the launch-contract enforcement from `1847ffd`; both runner worktrees must sit at this revision |
| Candidate service revision | the same commit as the runner; adapter mode `verify-native`; the candidate server worktree must sit at this revision |
| Baseline service revision | `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`; adapter mode `add-missing`; the baseline server worktree must sit at this revision |
| Adapter | `eval/qa/exact-old-runtime-adapter.mjs` SHA-256 recomputed at the runner revision; one `--adapter-revision` shared by both arms |
| Corpus | cases file SHA-256, selected content SHA-256, ordered 200-ID SHA-256, ordered 500-ID SHA-256; `selected.count: 200`; `selected.activeCorpusCount: 500`; each `--cases` path resolves inside its own runner worktree |
| Answering and judge model | `claude-sonnet-5` |
| Rubric and pack | `v2.10` and `p6` |
| Variant, surface, search tool | `A`, `search-execute`, `search` |
| Judge tier | `stability-boundary-v1`, threshold `0.75`, `--max-panel-cases 34` on both phases; `--judge-panel` absent or equal on every command |
| Stability register | the frozen file above, same path and SHA-256 for both arms and both phases |
| Prompt append | `QA_AGENT_PROMPT_APPEND` unset |
| Claude path, binary, and environment | one `p6.claudePath`; one binary and environment SHA-256 pair; the collection, stored-judge, P6, and flip pins are this same pair; recomputed in each runner worktree |
| Remote identity probe | committed `eval/qa/probe-remote-identities.mjs` bytes at the runner revision |
| Remote identity vector | one `--stable-sha256` result (three captures, five minutes apart) taken once, passed to both arms |
| Capacity | the exact command, the instrument SHA-256, the artifact path, the artifact SHA-256, and the fixed contract; the artifact must be at most 86,400,000 ms old at launch |
| P6 | the exact wrapper command, wrapper SHA-256, judge SHA-256, seven calls, `$0.50` per call, `$3.50` maximum, and the retained summary path |
| Flip re-judge | the re-judge, judge, and evidence-pack SHA-256 values; the frozen judge tuple; `$15` per arm; both exact commands |
| Ports | four pairwise-distinct ports; example: candidate adapter 8788 with Wrangler 8790, baseline adapter 8789 with Wrangler 8791 |
| `.dev.vars` | identical names and salted name-value SHA-256 in both server worktrees; a fresh random 64-character salt per plan; no value recorded |
| Supervisor and control bytes | `eval/qa/paired-collection-supervisor.mjs` and `eval/qa/paired-collection-control.mjs` SHA-256 values; the executing copies and both runner copies must match |
| Runner and printer bytes | `eval/qa/run-qa.mjs` and `eval/qa/paired-verdict.mjs` SHA-256 values, equal across arms |

Provisional contract hashes at `dc0761d` are in `launch-contract-repair-sol.md`. The launch
revision recomputes every one.

### Launch manifest fields

The manifest uses `qa-paired-collection-plan-v2`. Version 1 plans are invalid. The manifest stays
uncommitted. The operator deletes it after success or failure. It must carry every field below.

- `schema`: `qa-paired-collection-plan-v2`.
- `deadlineMs`: `14400000`.
- `selected.count: 200`, `selected.ids` (200 ordered IDs), `selected.idsSha256`,
  `selected.contentSha256`, `selected.casesFileSha256`, `selected.activeCorpusCount: 500`,
  `selected.activeCorpusIdsSha256`.
- `worktrees.baselineRunner`, `worktrees.candidateRunner`, `worktrees.baselineServer`,
  `worktrees.candidateServer`: four distinct roots in one repository.
- `capacity.command`, `capacity.instrumentSha256`, `capacity.artifactPath`,
  `capacity.artifactSha256`, `capacity.contract`.
- `devVars.salt`, `devVars.names`, `devVars.sha256`.
- `caps.baseline.collectionUsd: 80`, `caps.baseline.cumulativeUsd: 120`,
  `caps.candidate.collectionUsd: 80`, `caps.candidate.cumulativeUsd: 120`,
  `caps.twoArmCumulativeUsd: 240`.
- `arms.baseline.collectionCommand`, `arms.baseline.judgeCommand`, `arms.baseline.inputHashes`.
- `arms.candidate.collectionCommand`, `arms.candidate.judgeCommand`, `arms.candidate.inputHashes`.
- `p6.runnerArm`, `p6.command`, `p6.summaryArtifactPath`, `p6.claudePath`, `p6.wrapperSha256`,
  `p6.judgeSha256`, `p6.calls: 7`, `p6.perCallBudgetUsd: 0.5`, `p6.maxAuthorizedCostUsd: 3.5`.
- `flipRejudge.implementationSha256`, `flipRejudge.judgeImplementationSha256`,
  `flipRejudge.evidencePackImplementationSha256`, `flipRejudge.judgeTuple`,
  `flipRejudge.perArmBudgetUsd: 15`, `flipRejudge.commands.baseline`,
  `flipRejudge.commands.candidate`.
- `comparisonCommand`.

Each `inputHashes` object carries twelve hashes: `agentBinarySha256`, `agentEnvironmentSha256`,
`judgeBinarySha256`, `judgeEnvironmentSha256`, `adapterImplementationSha256`,
`remoteIdentityProbeSha256`, `remoteIdentityVectorSha256`, `stabilityRegisterSha256`,
`runQaSha256`, `pairedVerdictSha256`, `pairedCollectionSupervisorSha256`, and
`pairedCollectionControlSha256`. Every hash must match across arms. Within each arm the agent
binary equals the judge binary, and the agent environment equals the judge environment.

### Exact command arrays

The supervisor validates every array below against its own expectation before either child
starts. A different element order, a missing flag, or an extra flag stops the launch.

Capacity command:

```text
[process.execPath, "eval/qa/check-paired-capacity.mjs", "--out", capacity.artifactPath]
```

P6 command, run on the `p6.runnerArm` runner worktree:

```text
[process.execPath, "eval/qa/run-p6-judge-self-test.mjs",
 "--runner-revision", <runner HEAD>,
 "--claude-path", p6.claudePath,
 "--expect-claude-binary-sha256", inputHashes.agentBinarySha256,
 "--expect-claude-environment-sha256", inputHashes.agentEnvironmentSha256,
 "--out", p6.summaryArtifactPath]
```

Each collection command uses the absolute `process.execPath`, `eval/qa/run-qa.mjs`, the explicit
`--ids` list equal to `selected.ids` joined with commas, `--no-judge`,
`--paired-control-arm <arm>`, `--max-budget-usd 80`, the arm's `--adapter-mode`,
`--server-revision`, `--expect-sha256`, `--adapter-revision`, `--expect-adapter-sha256`, `--port`,
`--upstream-port`, `--variant A`, `--surface search-execute`, `--search-tool search`,
`--model claude-sonnet-5`, `--judge-model claude-sonnet-5`, `--max-panel-cases 34`,
`--stability-register`, `--remote-identity-probe`, `--expect-remote-identity-probe-sha256`,
`--expect-remote-identity-sha256`, `--expect-agent-binary-sha256`, and
`--expect-agent-environment-sha256`. It must not carry `--sample` or `--judge-stored`.

Each stored-judge command uses the absolute `process.execPath` and `eval/qa/run-qa.mjs`. It
carries `--judge-stored {<arm>Artifact}`, `--max-budget-usd 120`, `--judge-model claude-sonnet-5`,
and `--max-panel-cases 34`. It carries the same `--stability-register`,
`--expect-agent-binary-sha256`, and `--expect-agent-environment-sha256`. It must not carry
`--paired-control-arm` or `--no-judge`.

Flip re-judge command for the baseline arm:

```text
[process.execPath, "eval/qa/re-judge.mjs", "{baselineArtifact}",
 "--flips-vs", "{candidateArtifact}",
 "--judge-model", "claude-sonnet-5",
 "--claude-path", p6.claudePath,
 "--expect-agent-binary-sha256", inputHashes.judgeBinarySha256,
 "--expect-agent-environment-sha256", inputHashes.judgeEnvironmentSha256,
 "--cases-ref", <the collection --adapter-revision>,
 "--allow-empty",
 "--max-budget-usd", "15"]
```

The candidate command reverses the two artifact placeholders. A `--judge-panel` value appears
after `--judge-model` only when the collection command carries the same value. Neither flip
command may use `--ids`, `--dry-run`, `--allow-non-identical`, or `--allow-golden-drift`. A
zero-flip result is valid only through the explicit `--allow-empty` flag. The re-judge checks the
Claude identity before the first paid call and again after judging. It stamps both identities and
the stability guard in the artifact. The flip judge implementation must equal `p6.judgeSha256`.

Comparison command:

```text
[process.execPath, "eval/qa/paired-verdict.mjs", "{baselineArtifact}", "{candidateArtifact}", "--json"]
```

### Capacity gate

The plan binds the free two-agent capacity check as a fixed contract:

- Schedule `simultaneous-barrier-v1`: two answering agents, one capture each, released on one
  barrier. Each capture makes seven public identity requests. Expected responses: 14, with Scout 2,
  Lumenloop 6, and Stellar Docs 6.
- Thresholds: 14 responses, 14 successful responses, 0 HTTP errors, 0 transport errors, 0 retries,
  0 `Retry-After` headers, at least 2 maximum active fetches, matching vectors, overlapping capture
  windows, at most 120,000 ms total duration, and at most 120,000 ms per capture.
- Freshness: 86,400,000 ms after the artifact `completedAt`. The exact boundary is valid. One
  millisecond beyond it is invalid. A future timestamp is invalid.
- The supervisor verifies the artifact bytes against `capacity.artifactSha256`. It verifies the
  executing instrument and both runner copies against `capacity.instrumentSha256`.

The authoritative v2 artifact is recorded in `paired-capacity-check-terra.md`:

| Item | Value |
| --- | --- |
| Artifact path | `/private/tmp/paired-capacity-live-v2-2026-09-04.json` |
| Artifact SHA-256 | `f94663390187a52a89007ca22a23530c873cb8e00b4117bece045265a56c2423` |
| Instrument SHA-256 | `59a52b96e890f0de4babb911022ed863c4ad5a62a6473b146007544143e8f3a9` |
| Completed | `2026-09-04T10:25:17.815Z` |
| Result | `accepted: true`, 14 of 14 responses, no errors or retries, 12 active fetches, vectors matched |
| Expires | `2026-09-05T10:25:17.815Z` |

This artifact proves the technical capacity gate. It does not accept the concurrent-load
estimand. That acceptance is owner decision 5 and remains open. Any launch after the expiry time
needs a fresh artifact and a new plan hash.

### Topology and sequence

1. Create four clean worktrees: baseline runner, candidate runner, baseline server, candidate
   server. Both runners sit at the runner revision. Separate runner worktrees keep results
   directories, temporary directories, and result stamps apart.
2. Write identical `.dev.vars` bytes into both server worktrees. Record the salted identity only.
3. Start the baseline Wrangler and adapter pair, then the candidate pair, on the four frozen ports.
   Attest both listener pairs.
4. Run the free surface and source-revision probes through both adapters. Record both surface
   hashes. They must differ.
5. Run the free capacity command. Freeze its path and SHA-256 in the plan.
6. Run the formal `--stable-sha256` pre-arm probe once. Both arms take its hash.
7. Freeze every other field and command array. Print the canonical plan SHA-256 with
   `npm run eval:qa:paired:plan-sha256 -- --plan <absolute path>`.
8. The owner signs the external authorization record. It names the canonical plan SHA-256. The
   signature covers that hash and every command array in the plan. Do not edit the plan after
   this step. Any edit needs a new hash and a new signature.
9. Run the exact P6 command from the signed plan. Its `--out` path and `.tmp` path must not
   exist. Retain the machine-readable summary at `p6.summaryArtifactPath`.
10. Launch the supervisor before the capacity artifact reaches its 24-hour limit:
    `npm run eval:qa:paired:collect -- --plan <absolute path> --authorized-plan-sha256 <sha256>`.
    The supervisor validates the hash and the manifest. It spawns both children and releases
    rows in lockstep. It alternates the first IPC send by row. It prints a
    `qa-paired-collection-receipt-v1` receipt only after both comparable artifacts exit cleanly.
11. After the receipt, stop both server pairs. Judging needs no server and no remote identity.
12. Run the frozen baseline judge command, then the frozen candidate judge command, one after the
    other, with the placeholder replaced by the receipt paths.
13. Run the frozen comparison command with the baseline artifact first.
14. Run both frozen flip re-judge commands as stability evidence only.
15. Review every row of both artifacts before any claim leaves the round ledger.

### Deviations from the frozen full method

- The explicit 200-ID subset replaces the full corpus. The subset is not a current-quality
  headline.
- `--no-judge` and `--judge-stored` replace inline judging. This halves the window that upstream
  drift can break. The judge never touches MCP, so the guard review accepts stored judging.
- Two server pairs run at once under one supervisor. The earlier plan ran one Wrangler at a time
  for operator simplicity. Two pinned pairs on distinct ports change no measurement contract. The
  shared Lumenloop key and public rate limits now serve two agents at once. The result therefore
  estimates behavior under that concurrent load. Do not describe throttling as symmetric.
- Candidate-first order becomes alternating lockstep. The candidate-first rule existed to bank the
  full current-quality result before baseline spend. A subset banks no headline, so the rule has no
  purpose here. The alternation orders two IPC writes in one event-loop turn. It does not control
  when each child issues its provider call.

## Detectable effects and uncertainty

The estimand is unchanged in form: `P(candidate=correct) - P(baseline=correct)` and
`P(candidate in {correct, partial}) - P(baseline in {correct, partial})` over eligible IDs. Its
population is the selected 200 IDs under the concurrent load. Under no change, the per-ID delta
has variance close to the discordance rate `d`, so the look radius is `2.45 * sqrt(d / n)`. The
committed `0.10` and `0.08` rates are a mixed-tuple upper bound. The identical-input re-judge floor
alone is 15.6% pairwise, and two arms add answer variance, so `d` between 0.2 and 0.3 is the honest
planning range for the strict cutpoint. This pair recalibrates `d` through
`npm run eval:qa:paired:validate -- --recalibrate`.

| Eligible n | Radius at d = 0.10 | Radius at d = 0.20 | Radius at d = 0.30 | Loss detected at 80% power, d = 0.20 |
| ---: | ---: | ---: | ---: | ---: |
| 100 | 0.078 | 0.110 | 0.134 | 0.147 |
| 150 | 0.063 | 0.089 | 0.110 | 0.120 |
| 190 | 0.056 | 0.080 | 0.097 | 0.107 |
| 480 | 0.035 | 0.050 | 0.061 | 0.067 |

Reading rules for the recommended look at about 190 eligible IDs:

- `FAIL` demonstrates a loss. It needs a true loss near 11 points to fire with 80% power.
- `PASS` clears only the experimental `-0.08` radius. The statement that an exact no-change pair
  passes about half the time at `d = 0.2` is illustrative. The simulator does not test that joint
  case, so it is not a validated operating characteristic. `PASS` is not evidence of improvement
  and not a product tolerance.
- `INDETERMINATE` is the expected outcome for a single-digit true effect. It is unfinished
  evidence, not a null result.
- The service tuning ceiling is single-digit points. Only a 480-eligible pair can bound a
  single-digit effect, and only at radius 0.05 to 0.06. The 200 subset answers "is there a large
  regression or a large gain" and calibrates `d`. It does not resolve a small effect.
- The expected `n = 190` value has no same-tuple evidence. It is a planning assumption.

Per-service reads inside the sample are descriptive only. Docs 96, Scout 57, and Lumenloop 25 are
each below the powered floor.

## Wall time

Under lockstep, each row takes the longer of the two arms' row times plus about one second of guard
captures. The stopped arm gives the candidate distribution only. No same-tuple baseline timing
exists. The answering estimate is therefore a range.

| Phase | Expected | Maximum before a stop |
| --- | ---: | ---: |
| Pre-arm stable probe, capacity check, plan freeze, signature, P6, and preflights | 30 min | 60 min |
| Answering, both arms in lockstep | 2.5 h to 3.5 h | 4.0 h (supervisor deadline) |
| Stored judging, baseline then candidate | about 4.0 h | 6.0 h |
| Flip rejudges | 30 min | 1.5 h |
| Total inside one calendar day | about 8 h to 9 h | 12.5 h |

The answering phase is the only phase exposed to upstream drift. Launch it at the start of a
weekend UTC day. The guard stop ends the method. Rows collected before a stop stay non-comparable
and are not judged. The supervisor cancels both arms on any guard, budget, child, IPC, ordering,
artifact, or deadline failure. It prints no receipt on failure.

Guard load for the pair: 802 captures plus the three pre-arm captures and the two capacity
captures. That is about 5,600 public HTTP requests, about 5,600 Algolia search operations, and
about 800 Algolia settings reads.

## Caps

Each command carries exactly one `--max-budget-usd`. No transfer, resume, or automatic repeat. The
supervisor validates the collection caps. The judge command must carry the cumulative arm cap.

| Method | Expected | Cap | Rule |
| --- | ---: | ---: | --- |
| P6 judge self-test | `$0.25` | `$3.50` | seven calls, `$0.50` each, no retry, direct Node, exact frozen command |
| Baseline collection, 200 rows, `--no-judge` | `$52` | `$80` | one supervised `run-qa.mjs` child |
| Candidate collection, 200 rows, `--no-judge` | `$52` | `$80` | one supervised `run-qa.mjs` child |
| Baseline stored judging | `$24` | cumulative `$120` | one `--judge-stored` command on the same ledger |
| Candidate stored judging | `$24` | cumulative `$120` | one `--judge-stored` command on the same ledger |
| Two-arm cumulative total | `$152` | `$240` | `twoArmCumulativeUsd` |
| Baseline flip rejudge | `$7` | `$15` | one frozen `re-judge.mjs --flips-vs` command |
| Candidate flip rejudge | `$7` | `$15` | one frozen `re-judge.mjs --flips-vs` command |
| Method maximum | about `$166` | `$273.50` | no other method |

The exact command cap sequence is:

```text
P6 wrapper:                seven internal caps of $0.50, $3.50 maximum
baseline  --no-judge:      --max-budget-usd 80
candidate --no-judge:      --max-budget-usd 80
baseline  --judge-stored:  --max-budget-usd 120
candidate --judge-stored:  --max-budget-usd 120
baseline  flip re-judge:   --max-budget-usd 15
candidate flip re-judge:   --max-budget-usd 15
```

The `$80` collection cap is 1.5 times the expected agent spend. The stopped arm spent 48% of its
`$400` cap, so this ratio is consistent with observed variance. A collection cap stop before the
last ID cancels both arms under the supervisor. A judge cap stop before the last row leaves the
artifact incomplete and ends the method.

## Stop rules

Before the first paid call, stop when any item below holds:

- Any of the four worktrees is dirty, or any revision is not 40 characters.
- The runner revision lacks the remote identity guard, the envelope serialization repair, the
  coverage-metric retirement, the paired supervisor, or the launch-contract enforcement.
- The supplied `--authorized-plan-sha256` differs from the canonical plan SHA-256.
- The external authorization record does not name that hash, or does not state that the
  signature covers the hash and every command array.
- Any hash in the pin table or the manifest differs from its recomputed value.
- Either runner does not hold exactly 500 unique active IDs, or `selected.count` is not 200.
- The ordered 200-ID, ordered 500-ID, content, or cases-file hash differs in either runner.
- The capacity artifact is missing, fails any fixed threshold, or is older than 86,400,000 ms.
- The `--stable-sha256` probe fails or returns two different vectors.
- The P6 `--out` path or `.tmp` path exists before P6 starts.
- The P6 self-test fails, exceeds `$3.50`, or lacks a retained summary that matches the frozen
  wrapper contract and identity pins.
- Either surface probe or source-revision probe fails, or the two surface hashes are equal.
- Either listener pair or adapter attestation is missing or mismatched.
- Any frozen command array differs from the supervisor's expected array.
- The owner has not accepted the concurrent load.
- `QA_AGENT_PROMPT_APPEND` is set.
- The manifest fails `validatePairedCollectionPlan` for any reason.
- The independent review of this revision, the owner decisions, or the signed external
  authorization is missing from the round ledger.

During collection, the supervisor stops both arms when any item below holds:

- The guard stops either arm for an identity change, a probe failure, or a pre-arm mismatch.
- Either arm reaches its `$80` cap, omits a reported cost, or loses the `raven` MCP connection.
- Either child exits before a successful completion, sends malformed IPC, breaks the row order,
  or reports a readiness record that does not match the manifest.
- The four-hour deadline fires.
- Either listener or adapter identity changes at postflight.
- Either reported artifact is not comparable, is outside its results directory, or does not match
  the frozen IDs, content identity, or server revision.

After collection, stop the method when any item below holds:

- The supervisor printed no receipt.
- Either artifact reports `meta.comparable: false` or suppressed aggregates.
- The two artifacts do not share identical ordered IDs, case hashes, pins, and pre-arm vector.
- Either postflight vector differs from the pre-arm vector.
- Two unrelated rows in the candidate arm show the same executor fault class as the stopped arm.
  This is a post-run review rule, not a supervisor rule.
- Either stored-judge command stops before its last row.
- Either flip re-judge reports a Claude identity change between its two checks.
- Fewer than 100 IDs remain eligible after the T4 and T5 union exclusion.
- Any candidate-only T4 or T5 loss appears. It forces `INDETERMINATE` and ends the method.

After the printer: stop after `PASS` or `FAIL`. Treat statistical `INDETERMINATE` as unfinished
evidence. The one permitted repeat needs a new authorization and its own pre-spend review. There is
no third look.

## Result review requirements

- Review all 400 selected answer rows. Review every verdict and transcript.
- Review every grade transition and every T3, T4, or T5 row.
- Review all panel disagreements, skipped panels, cost entries, guard captures, and the receipt
  timeline.
- Verify the paired JSON, both flip batches, and the recalibrated simulator output.
- Live-check each mutable claim before confirming a wrong result.
- Classify each confirmed failure with the `run-evals` root-cause table. Route own-repo defects to
  `.agents/TODO.md` and verified upstream defects to `improvements/`.
- The result reviewer must differ from the executor and from this design author.
- The final reviewer must recompute counts, costs, hashes, exclusions, and transitions.
- Per-service results remain descriptive. No service stratum reaches the powered denominator.

## What the result can and cannot support

The pair can support these statements:

- A bounded paired difference between the final service revision and the 2026-08-19 revision on
  this 200-ID stratified sample, under the current corpus, the current live upstream state, the
  accepted concurrent load, and the `claude-sonnet-5`, `v2.10`, `p6` tuple.
- A `FAIL` demonstrates a loss on at least one cutpoint at the stated bound.
- A same-tuple discordance calibration for the printer.
- Per-row diagnostic leads after full review of both arms.

The pair cannot support these statements:

- Service quality on 2026-08-19. Upstream facts and the corpus have moved.
- A Scout release effect. Both arms call the same live Scout inside one identity epoch.
- Attribution to any single commit. The candidate is a composite treatment.
- A current-quality headline. That needs a full 500-case candidate arm under a separate
  authorization.
- A product improvement claim from `PASS`. The margin is a no-change radius.
- Any claim about all 500 cases. The estimand is the selected 200.
- Any claim about isolated production behavior. The estimate is under shared concurrent load.
- Any claim from rows collected before a guard stop.
- Any inference to other models, judges, binaries, production traffic, or latency.

The treatment also includes the executor repair that landed after the stopped arm. The stopped arm
measured a fault in 380 rows. The new candidate must be the repaired revision, and the stopped
artifact must not enter this comparison.

## Strict new-authorization block

This report authorizes no spend. The old `$882.50` authorization does not transfer to this method.
The owner must explicitly retire that plan. The owner's general approval of paid eval work for this
round is not this authorization. Only the signed block below, with the canonical plan hash, is the
strict paid authorization. A new authorization is valid only when it states every item below in
the round ledger before the first paid call.

```text
AUTHORIZATION: two-week impact, supervised paired subset (Option C, revision 3)

Prior plan: the 2026-09-03 $882.50 plan is RETIRED. Its P6 and candidate methods are spent.
No other method from it may start. No unspent amount transfers.
The general round approval of 2026-09-03 does not authorize this method.

Plan: schema qa-paired-collection-plan-v2, uncommitted, deleted after the run.
  canonical plan SHA-256: <printed by npm run eval:qa:paired:plan-sha256>
  This signature covers that hash and every command array in the plan:
  capacity.command, p6.command, arms.baseline.collectionCommand,
  arms.candidate.collectionCommand, arms.baseline.judgeCommand,
  arms.candidate.judgeCommand, flipRejudge.commands.baseline,
  flipRejudge.commands.candidate, and comparisonCommand.
  Any plan edit after this signature voids it.

Methods and caps, one run each, no transfer, no resume, no automatic repeat, no added method:
  P6 judge self-test              $3.50   (seven calls, $0.50 each, exact frozen wrapper command)
  baseline  --no-judge            $80     (supervised child)
  candidate --no-judge            $80     (supervised child)
  baseline  --judge-stored        $120    (cumulative on the same ledger)
  candidate --judge-stored        $120    (cumulative on the same ledger)
  two-arm cumulative              $240
  baseline  flip rejudge          $15     (frozen command, --allow-empty)
  candidate flip rejudge          $15     (frozen command, --allow-empty)
  method maximum                  $273.50

Denominator: explicit --ids, selected.count 200, activeCorpusCount 500.
  ordered-200 SHA-256: <recomputed at the launch revision>
  selected-content SHA-256: <recomputed>
  cases-file SHA-256: <recomputed>   ordered-500 SHA-256: <recomputed>
  Both runner worktrees recompute all four values.
Tuple: claude-sonnet-5 / claude-sonnet-5 / v2.10 / p6 / stability-boundary-v1 / 0.75 / 34.
Flags: --variant A --surface search-execute --search-tool search; --judge-panel absent.
Baseline: 90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0, add-missing, surface <sha256>.
Candidate and runner: <one clean 40-character revision>, verify-native, surface <sha256>.
Register: /private/tmp/stellar-raven-tm-paired-stability.json <sha256>.
Adapter: <sha256>.  Probe: <sha256>.  Pre-arm vector: <sha256>.
Claude path: <p6.claudePath>.  Binary: <sha256>.  Environment: <sha256>.
  Collection, stored-judge, P6, and flip pins are this same pair.
Runner bytes: run-qa <sha256>, paired-verdict <sha256>, supervisor <sha256>, control <sha256>.
Contract bytes: capacity instrument <sha256>, P6 wrapper <sha256>, judge <sha256>,
  re-judge <sha256>, evidence pack <sha256>.
Capacity: artifact <absolute path> <sha256>, completedAt <timestamp>, fixed v2 contract;
  launch before completedAt + 86,400,000 ms.
P6: runner arm <baseline|candidate>, summary <absolute path>; the path must not exist.
Worktrees: baselineRunner <path>, candidateRunner <path>,
           baselineServer <path>, candidateServer <path>.
Ports: baseline <public>/<upstream>, candidate <public>/<upstream>, four distinct values.
.dev.vars: salt <64 hex>, names <list>, salted SHA-256 <sha256>; no value recorded.
Concurrent load: ACCEPTED by the owner, two answering agents, evidence: the capacity artifact above.
Topology: npm run eval:qa:paired:collect -- --plan <absolute path>
          --authorized-plan-sha256 <the canonical hash above>;
          answer-only; lockstep; alternating release; stored judging baseline then
          candidate; frozen comparison command with the baseline artifact first;
          frozen flip commands with --allow-empty.
Window: weekend UTC start; four-hour supervisor deadline; one calendar day total.
Stop rules: the three lists in this report, copied verbatim into the ledger.
Reviews:
  - independent review of revision 3 by a lane that is not Fable 5.1 and not the
    orchestrator, verdict LAUNCH-OK, every finding reconciled;
  - result review of all 400 rows by a lane that is not the executor and not Fable 5.1;
  - final recomputation of counts, costs, hashes, exclusions, and transitions.
Reporting: record the subset result in eval/qa/README.md as a labeled paired diagnostic,
           never as the current-quality headline.
Owner decisions 1 to 10 below: each recorded with its answer.
Signature: AUTHORIZED <date> <owner>   or   NOT AUTHORIZED
```

Any blank field, any changed cap, any missing command array, or any missing decision makes the
authorization invalid. The record lives outside the plan file, so the plan hash cannot refer to
itself.

## Exact owner decisions

1. Retire or retain the 2026-09-03 `$882.50` plan. Recommended: retire it. Its P6 and candidate
   methods are spent. Its baseline, flip, live-data, and digest methods are stopped.
2. Denominator. Recommended: 200 selected. The landed supervisor accepts only 200. Alternatives
   need a reviewed constant change. One is 150 selected (floor, radius 0.09 at `d = 0.2`). The
   other is 500 selected under the supervisor (powered, needs a reviewed deadline change, about
   `$600`).
3. Two concurrent server pairs under the supervisor. Recommended: yes. If no, use Option B
   sequential with 37% weekday and 71% weekend survival and a revised command set.
4. Answer-only collection with stored judging. Recommended: yes. If no, the window grows by about
   two hours per arm and the supervisor contract does not apply.
5. Accept the concurrent-load estimand. The free v2 capacity artifact of 2026-09-04 passed the
   fixed technical gate. That artifact does not accept the estimand. The owner has not accepted
   it. This decision remains open. If capacity is uncertain, choose sequential Option B.
6. Guard semantics for this look. Recommended: keep the landed whole-arm stop. Decide separately
   whether to fund Option E (per-pair epochs and interleaving) before any powered 500 pair.
7. Launch window. Recommended: weekend UTC start, four-hour answering maximum, no retry inside the
   same authorization.
8. Product-loss margin. Recommended: keep `0.08` as the experimental no-change radius and print the
   `0.05` and `0.10` tables. Do not adopt a product tolerance from this look.
9. Candidate-only T4 or T5 rule. Recommended: keep it terminal.
10. P6 judge self-test. Recommended: run it once at `$3.50` through the exact frozen wrapper
    command under the final pinned environment. Retain the machine-readable summary.

Reporting is fixed by the authorization block. The subset result is a labeled paired diagnostic.
The full 500 candidate arm stays a separate future authorization.

## Risks

- Scout can still release inside the answering window. The design accepts a 16% to 53% chance of a
  guard stop, depending on the day and the window. A stop costs at most the two collection caps and
  returns no comparison.
- The Lumenloop key and the public Docs search key serve two agents at once. Throttling would raise
  transport failures in both arms. Those rows count as T1 outcomes inside answers, not as
  exclusions. The effect is not necessarily symmetric. The capacity artifact and the receipt
  timeline are the evidence for this condition. The capacity check covers 14 public reads only.
  It does not prove sustained capacity across 200 paired rows.
- The capacity artifact expires 24 hours after completion. A launch that slips past the expiry
  needs a fresh artifact, a new plan hash, and a new signature.
- A supervised soft cancellation settles within 35 s. A hard cancellation settles within 5 s. An
  in-flight child may not flush a partial artifact. The no-new-spend marker survives forced
  settlement.
- The Docs title probe has a 1,000-record ceiling (R4). The set is at 650. Not a risk this month.
- Judge discordance may exceed 0.3. The look would then be `INDETERMINATE` under almost any true
  effect. The recalibration output is still useful and is the reason to run this look before any
  powered pair.
- A subset invites per-service over-reading. Every stratum is below the powered floor.
- The salt and the salted digest live in the same manifest. The handling rule, not the salt,
  protects the secrets. Keep the manifest uncommitted and delete it after the run.

## Blockers

- An independent review of this revision must return `LAUNCH-OK`. Revision 1 and revision 2
  received `CHANGES-REQUIRED`. Nobody has reviewed revision 3.
- The owner must record decisions 1 to 10 and sign the external authorization block with the
  canonical plan SHA-256. The general round approval does not substitute for it.
- The owner must accept the concurrent-load estimand (decision 5). It is still open.
- The launch revision must be one clean commit that contains the guard, the envelope repair, the
  coverage-metric retirement, the supervisor, and the launch-contract enforcement. The branch
  `codex/truth-maintenance-2026-09-03` contains the work through `dc0761d`. It contains all five
  but is not merged.
- The full validation after `1847ffd` is complete on the round branch through `dc0761d`. See
  the ledger `## Final checklist`. The documentation-only correction after it still needs final
  diff and secret checks.
- The manifest instance must be produced at that revision with a fresh salt and recomputed hashes.
- The capacity artifact must be at most 24 hours old at launch. The 2026-09-04 artifact expires at
  `2026-09-05T10:25:17.815Z`.
- The launch must start inside a weekend UTC window.
