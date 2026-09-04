# Revised impact measurement review

Date: 2026-09-04

Reviewer: Codex GPT-5.6 Sol at high effort.

Reviewed design commit: `f101ceeb6c73fa1e7d67e2d8e781f8ae1d675823`.

Reviewed guard repair: `5d47ab6900af6aa14d65d271879c9340f5b6bf3c`.

I made no paid call. I made no implementation change.

## Verdict

The 200-case sample is deterministic. Its stated membership hash is correct.

The statistical formulas are correct as planning approximations. The result estimates the fixed selected case set.

Option C cannot launch with the current printer and runner. Four contract failures block it.

The printer rejects the distinct ports required by concurrent server pairs.

The stored-judge caps conflict with the cumulative spend ledger.

Two independent runners do not implement lockstep or a shared stop.

The printer does not compare stored-judge binary and environment pins.

The existing `$882.50` authorization does not authorize this changed method.

## Evidence read

I read the following evidence:

- `AGENTS.md` and `.agents/skills/run-evals/SKILL.md`.
- The paired printer and its topology tests.
- The remote identity guard, probe, runner, and budget ledger.
- Scout audit commit `3fed7cf9e5cd1447d5595630d5f5a5632198f9ed`.
- Opus guard review commit `c78141d4c1813a6311ae84527d5fc17526166b41`.
- Guard repair commit `5d47ab6900af6aa14d65d271879c9340f5b6bf3c`.
- The current round ledger and candidate stop reports.

Commit `f101cee` adds only `revised-impact-measurement-fable.md`.

## Recomputed facts

| Fact | Recomputed value | Result |
| --- | --- | --- |
| Active cases | `500` | Match |
| `eval/qa/cases.json` file SHA-256 | `1842a188437ea0ae265f6ab6c897de00220de23f4b34b9fe7b6d93f80f142396` | Missing from design |
| Full case-content SHA-256 | `c5d0c804ddd9ce241fae90398ee0d83808e5d847f049d118e4ad15903d07b43e` | Match |
| Ordered 500-ID SHA-256 | `b557bcb5cff8a434ad684b90a60343358360330ca1f91072089ceb57a38310d0` | Match |
| Ordered 200-ID SHA-256 | `8ba8e687ace17711cabb3932ca6d5e2edebede2bfbfcfbfd79ce3fca3bbd20da` | Match |
| Selected 200-content SHA-256 | `b8512352599ed9df760113cb86db8337ae3136a1cec4aea8461ef08d61e55ee1` | Missing from design |
| Ordered 150-ID SHA-256 | `cbc850c65ad18709ae5a5d94c6ae009f041b78a6a11b0f51e5888959ca7001cc` | Match |

The 200 cases contain 96 Docs, 57 Scout, 25 Lumenloop, 13 skills, and nine `none` cases.

They contain 84 stable, 60 scheduled, and 56 live cases. They contain 16 traps.

The same sampler gives the same 200 IDs at `80aaf52`. Golden changes alter content, not membership.

The sampler stratifies only by `tags.service`. It does not randomize cases or stratify freshness.

The estimand therefore covers the selected 200 IDs. It does not estimate all 500 IDs.

## Statistics and detectable effects

The printer uses two paired cumulative-grade components.

The components are strict-correct difference and non-wrong difference.

It uses one-sided `alpha = 0.007143`. The derived value is `z = 2.4499904614092016`.

For discordance `d`, the planning radius is `z * sqrt(d / n)`.

At `n = 190` and `d = 0.20`, the radius is `0.080`.

An 80-percent one-component loss target is `(z + 0.8416) * sqrt(d / n)`.

That target is `0.107` for `n = 190` and `d = 0.20`.

At `n = 480` and `d = 0.20`, the radius is `0.050`.

The corresponding 80-percent loss target is `0.067`.

These calculations match the design. They assume a fixed discordance rate and eligible denominator.

The expected `n = 190` value has no same-tuple evidence. It is a planning assumption.

The current simulator does not test the proposed `n = 190`, `d = 0.20` joint outcome.

The reported `PASS` probability near one-half is therefore illustrative. It is not a validated operating characteristic.

The default `0.08` remains an experimental no-change radius. It is not a product tolerance.

The full 500-case arm is still necessary for a current-quality headline.

This 200-case pair cannot replace that result. It can only detect large changes and calibrate discordance.

## Standards review

### S1. The proposed ports fail the paired printer

Option C uses candidate ports `8788/8790`. It uses baseline ports `8789/8791`.

The current printer compares adapter revision, implementation hash, public port, and upstream port.

It requires all four values to match across both artifacts.

The topology test explicitly rejects mixed public or upstream ports.

The proposed artifacts will return `INDETERMINATE` with `runtime-adapter-pairing`.

The four-worktree topology is otherwise appropriate. It isolates both runners and both servers.

Required repair: revise the printer before any paid call.

The printer must keep each artifact's internal port and listener checks.

It must compare adapter revision and implementation hash across arms.

It must permit distinct cross-arm port pairs for a concurrent topology.

Add tests for two valid distinct port pairs. Keep tests for internal attestation drift.

### S2. The cap table conflicts with stored-judge accounting

The collection cap is `$80` per arm. The proposed stored-judge cap is `$40` per arm.

`--judge-stored` restores `meta.budget`. Its new cap covers all earlier spend in that artifact.

Expected collection spend is `$52`. A new total cap of `$40` leaves no judge budget.

Required repair: define each arm as one cumulative `$120` method.

Use `$80` during answer collection. Raise that same ledger to `$120` during stored judging.

The two commands then keep the existing `$240` total across both arms.

The complete maximum can remain `$273.50`.

The authorization must permit this planned phase continuation. It must forbid every unplanned resume.

The corrected command cap sequence is:

```text
candidate --no-judge:       --max-budget-usd 80
candidate --judge-stored:   --max-budget-usd 120
baseline --no-judge:        --max-budget-usd 80
baseline --judge-stored:    --max-budget-usd 120
```

### S3. The proposed lockstep does not exist

Starting two processes within 60 seconds does not create lockstep.

Each process owns an independent loop, guard, and spend ledger.

One process can advance several rows while the other process stops.

No shared cancellation stops the peer before its next authorization.

The claimed one-call maximum loss is false.

Required repair: add a reviewed paired collection supervisor.

The supervisor must enforce one shared ordered-ID sequence. It must use a barrier after each answer.

It must stop both arms after either failure. It must enforce the four-hour answering deadline.

It must prevent a new authorization after shared cancellation.

Add tests for a guard stop, a budget stop, a child exit, and the deadline.

The owner can select sequential Option B instead. That option needs a revised survival statement and command set.

### S4. Stored judging has two fail-closed gaps

`judgeStoredResults` rejects only `meta.comparable === false`.

It accepts a missing or malformed comparability field before judge spend.

Change the condition to `meta.comparable !== true`. Add missing-field and malformed-field tests.

The printer compares answering binary and environment hashes. It ignores stored-judge hashes.

Add `meta.judgeBinary.sha256` and `meta.judgeEnvironment.sha256` to the paired tuple.

Require their expected hashes and match stamps. Require equality across both artifacts.

The proposed single binary and environment pin must also match both collection pins.

### S5. The guard repair makes three Fable facts stale

Commit `5d47ab6` closes R3. The process timeout is now 145 seconds.

That timeout covers the 140-second maximum network budget.

Commit `5d47ab6` also closes R5. Pre-arm mismatches now receive the correct reason.

The current probe makes seven HTTP requests per capture. It no longer makes six requests.

The current Docs path uses seven search operations and one settings read per capture.

The `0.36 s` timing predates the sequential Docs phase. Remeasure it before using that duration.

Correct the facts table, risks, option timings, and all derived request totals.

Also update the report's HEAD from `898063e` to `f101cee`.

### S6. Same-second safety is topology-dependent

`run-qa.mjs` uses a second-resolution filename. It writes without exclusive creation.

Separate runner worktrees prevent cross-arm overwrite. A 60-second start window does not provide this protection.

The plan must require one collection process per runner worktree.

It must keep both artifacts at their full, separate paths. It must not copy them into one results directory.

A unique suffix or exclusive file creation would remove the remaining local collision risk.

## Spec review

### P1. Repo-owned concurrent state is isolated only under strict topology

Each spend ledger is an in-memory object. Two Node processes cannot mutate the same ledger.

Each answering run creates unique temporary directories. The two MCP configuration files do not overlap.

A pinned stability register is read-only. Both processes can safely read the same file.

Separate runner worktrees isolate result directories. Separate server worktrees isolate Wrangler state.

The present plan does not machine-check these four distinct roots. The supervisor must attest them.

The design also shares the Claude account, `HOME`, network limits, and live services.

The repository cannot prove that external shared state is corruption-safe.

Do not claim that two arbitrary `run-qa` processes cannot corrupt other state.

The valid claim is narrower. Repo-owned state is isolated by the enforced four-worktree topology.

### P2. Shared rate limits can change the measured treatment

The candidate starts first. The two independent runners then move at different speeds.

Their Claude, Lumenloop, Docs, and Scout requests can overlap asymmetrically.

A probe 429 stops one arm. A tool-level service error can remain inside a graded answer.

An answering transport failure becomes a T5 exclusion. These effects are not necessarily symmetric.

The proposed result estimates behavior under this shared concurrent load.

It does not estimate isolated production behavior unless the shared limits never bind.

Required repair: perform a free capacity check and record the allowed concurrency.

The supervisor must alternate the first arm deterministically by ID. It must record start and finish times.

If capacity remains uncertain, use sequential collection. Do not describe concurrent throttling as symmetric.

### P3. Answer-only collection and stored judging can be comparable

The runner preserves answers, transcripts, case inputs, evidence-pack hashes, and collection pins.

Stored judging verifies the case snapshot, lifecycle snapshot, result schema, pack, and evidence-pack reproduction.

It writes judge model, rubric, tier policy, register hash, binary, and environment records.

This design is valid after repairs S2 and S4. It reduces the remote-identity exposure window.

Judging needs no MCP server. Remote service drift after collection cannot change stored answers.

Run stored judging sequentially. This avoids needless judge-side shared-rate contention.

### P4. The remote identity and adapter pins are conceptually correct

Both arms must use one current live upstream vector. They must also use one probe hash.

Both arms can call live Scout while the committed inventory remains `1.9.1`.

The Scout audit rejects shipping `1.9.30`. It does not prohibit measuring one stable live identity.

The exact baseline remains `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0` with `add-missing`.

The candidate remains the final clean revision with `verify-native`.

At `5d47ab6`, the adapter SHA-256 is `473690c7f10d5384be252bb97f9aa16ee88428d23589779289f5910c08e60303`.

At `5d47ab6`, the probe SHA-256 is `bde386a01ceb5bfdd325f3cd24369e00e2c111f7b4747ec7c0c9e77bc84485ef`.

These values are review evidence only. Recompute them at the final merged runner revision.

Both runner worktrees must independently reproduce the final binary and environment hashes.

One pane's hash does not attest the second runner pane.

### P5. The corpus needs an exact launch manifest

The design calls current hashes provisional. Paid launch needs final values before authorization.

Record the file, full-content, full-ID, selected-content, and selected-ID hashes from this report.

Record the exact final runner, candidate, baseline, adapter, probe, register, binary, and environment hashes.

Record both worktree roots and all four ports. Record `.dev.vars` equality without secret values.

Require the two selected-ID arrays to match before either first paid call.

The clean runner revision provides the reproducible corpus source. The artifact supplies post-run verification.

### P6. Stop rules need machine ownership

The remote identity guard, local postflight, minimum denominator, and candidate-only loss rule are implemented.

The repeat rule is also implemented by the paired printer.

The four-hour limit and cross-arm interruption are not implemented.

The repeated executor-fault stop needs live human classification. It cannot guarantee immediate peer cancellation.

Move the deadline and cross-arm stop into the supervisor. Keep fault classification as a post-run review rule.

Stop both collections after any guard, budget, listener, process, or supervisor failure.

Do not judge a stopped collection. Do not use its rows in the pair.

### P7. Review coverage is sufficient after the gate repairs

Review all 400 selected answer rows. Review every verdict and transcript.

Review every transition and every T3, T4, or T5 row.

Review all panel disagreements, skipped panels, cost entries, and guard captures.

Verify the paired JSON, both flip batches, and the recalibrated simulator output.

The result reviewer must differ from the executor and this design author.

Per-service results remain descriptive. No service stratum reaches the powered denominator.

## Free verification

I tested the exact `5d47ab6` archive in an isolated temporary repository.

The focused guard, probe, paired, precondition, budget, and stored-judge tests passed.

The exact result was six files and 235 tests.

`npm run eval:qa:paired:validate` passed all deterministic gates at `5d47ab6`.

These passes confirm current behavior. They do not resolve the design conflicts above.

## Required authorization and owner decisions

The old `$882.50` plan covers sequential full arms. It does not transfer to Option C.

The owner must explicitly supersede or retain that plan. Unused money authorizes no revised method.

The owner must record these decisions after all code repairs pass independent review:

1. Select the 200-case diagnostic or a separately reviewed full-500 method.
2. Select a supervised concurrent method or the sequential fallback.
3. Approve answer-only collection with stored judging.
4. Approve cumulative `$120` per-arm caps and the `$273.50` total maximum.
5. Approve the whole-arm remote identity rule and the launch window.
6. Keep `0.08` as an experimental radius, not a product tolerance.
7. Keep candidate-only T4 or T5 as terminal.
8. Run the P6 self-test once with direct Node under the final pinned environment.
9. Label the subset as diagnostic and keep the full-500 headline obligation open.

The P6 self-test remains useful before this large judged batch. Its exact cap stays `$3.50`.

The new authorization must list every command and cumulative cap. It must identify all final hashes.

It must include the revised stop rules verbatim. It must name the independent result reviewer.

## Exact repairs before launch

1. Correct the stale Fable facts from S5.
2. Repair and test the paired printer's concurrent port contract.
3. Add and test the paired collection supervisor.
4. Make stored judging require `meta.comparable === true`.
5. Add stored-judge binary and environment hashes to the paired tuple.
6. Replace separate judge caps with cumulative `$120` arm caps.
7. Freeze the exact launch manifest and operator commands.
8. Record a shared-rate capacity decision and the result's concurrent-load estimand.
9. Obtain a new authorization after an independent repair review.

CHANGES-REQUIRED
