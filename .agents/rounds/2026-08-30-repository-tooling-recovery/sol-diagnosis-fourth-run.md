# Fourth repository-recovery run diagnosis

## Verdict

The fourth collection is valid, complete, comparable, and correctly reviewed.

The contract-card repair fixed malformed repository calls.
It did not fix source selection, answer truth, or the gate's evidence-state rule.

The reported `3/12` result combines three different failure classes.

- Five valid recovery sequences fail only because the reviewed evidence state differs from the frozen subtype.
- Three positives never call the required thematic Docs operation.
- Five positives fail answer review, including two failures after successful repository recovery.

The smallest product mechanism is a manifest-derived authority bundle in `search`.
It must make the relevant thematic Docs operations one executable first step.
It must keep broader recovery targets out of that first step.

The gate also needs one method correction.
It must accept both qualifying states, `empty` and `adjacent`, as the suite definition requires.
This correction needs an explicit grading-rule stamp and decision record.

Do not change the frozen cases, goldens, ordered IDs, threshold, receipt state, or repository answers.

## Scope and method

This was an audit-only diagnosis.
The repository remained unchanged.

I read these instruction and product sources:

- `AGENTS.md`
- the complete `diagnosing-bugs` skill
- the complete `run-evals` skill
- the complete `audit-reviewability` skill and rubric
- `PLAN.md`
- the relevant `ARCHITECTURE.md` sections
- `eval/EVALS.md`
- `eval/repo-recovery/README.md`
- `research/decisions/0009-recovery-only-discovery-receipts.md`
- `.agents/rounds/2026-08-30-repository-tooling-recovery.md`
- the third-run diagnosis, approved plan, and contract-card review
- the fourth collection, packet, annotations, and reviewed artifact
- every fourth positive transcript, answer, search projection, and operation projection
- every third positive operation sequence and reviewed result
- the exact receipt, search, executor, provider, manifest, and grader implementation

No paid call ran during this diagnosis.
No service was deployed.
No branch was pushed or merged.

## Evidence identity

### Fourth collection

- Server revision: `497181ca5b774e7639f663f9ee22d61facb749f1`
- Surface SHA-256: `8a2232842f10d28f985881c93dbc1760e1aa15365be3f7162cf682e2e219769b`
- Canonical collection SHA-256: `8800785288fa185a2c392acc2608f781ee49d5c060ea59a7f6561aedd887a565`
- Collection file SHA-256: `7b7c1cb69eb044060f78b595f6f8616da37c572a3fbfefadb420ea8e510ddbc6`
- Packet file SHA-256: `965ccc0f61e9ffe5ff97f73e726e452cda0bd7f8a49c0ac4df70f6793f3191d0`
- Canonical annotation SHA-256: `9c0a817a9e513733f626258a83807ef7e13a5419ae60f831aef0e3fac1c307e0`
- Annotation file SHA-256: `8d0e025b22f38b8a978f67c7fc9ab843c1619246b33f2bb248b3796b43803087`
- Reviewed file SHA-256: `27f653f930afe0fa3196ca0cd2232b51963c2599b9788c1ccd0458708f688ade`
- Cost: `$4.263449`
- Calls: `20`
- Retries: `0`
- Collection completeness: `20/20`
- Projection errors: `0`
- Identity and review integrity: `PASS`

The packet targets the canonical collection hash above.
Its 20 cases preserve the frozen content and order digests.

The annotations target the same canonical collection.
The reviewed artifact embeds the unchanged collection and annotations.

### Third collection

- Server revision: `d23766db4ccd41eab5e6f232ac8aca6803030791`
- Canonical collection SHA-256: `88b70743cb1b74e7e40d7b1810799c86f47b48fb4295b34b62ff4111e865898c`
- Reviewed file SHA-256: `e3af5bc1386f2eb8533052546c68cc6308cc253be2d9abf8d025262903bc4704`
- Cost: `$6.5671102`
- Calls: `20`
- Retries: `0`
- Positive passes: `0/12`
- Negative premature detours: `0/8`
- Correct answers: `13/20`
- Grounded answers: `19/20`

## Reproduction loop

This free command reproduces the fourth failure:

```sh
npm run eval:repo-recovery:grade -- \
  eval/repo-recovery/results/repository-tooling-recovery-v1-reviewed.json --gate
```

It exits with status 1.
It reports `3/12` positive passes and `0/8` premature detours.

The same command against the third reviewed artifact reports `0/12` and `0/8`.

The loop is deterministic and stored-evidence only.
It exercises the exact frozen grader.

## What the contract-card repair fixed

The third run projected malformed, repeated, unpinned, or misplaced repository calls.
It produced zero valid positive sequences.

The fourth run projected nine `scout.explainRepo` calls.
Every call had these properties:

- one projected repository call;
- one later execute;
- the exact `{ q, repo }` argument shape;
- the current frozen repository pin;
- the receipt at the top-level execute input;
- no hard argument error;
- no receipt placement error;
- no repeated repository call.

Ten positive transcripts displayed a receipt card.
Nine agents used it correctly.
One agent ignored it and continued with Docs.

The repair therefore solved its stated failure class.
More contract-card prose is not justified.

## Exact gate partition

Four positives satisfy the frozen sequence rule.

- `rr-pos-js-rpc-sleep-strategies`
- `rr-pos-go-sdk-default-horizon-clients`
- `rr-pos-cli-config-home-env`
- `rr-pos-go-sdk-timebound-factories`

`rr-pos-cli-config-home-env` then fails answer review.
The other three become the reported positive passes.

Five positives have a valid later repository call and a correct pin.
They fail only the exact evidence-subtype comparison.

| Case | Frozen state | Reviewed state | Answer |
| --- | --- | --- | --- |
| `rr-pos-go-sdk-trade-resolutions` | `empty` | `adjacent` | correct and grounded |
| `rr-pos-env-host-depth-limit` | `adjacent` | `empty` | correct and grounded |
| `rr-pos-cli-stellar-soroban-dir-precedence` | `empty` | `adjacent` | correct and grounded |
| `rr-pos-horizon-max-supported-protocol` | `empty` | `adjacent` | incorrect but grounded |
| `rr-pos-go-sdk-horizon-timeout` | `empty` | `adjacent` | correct and grounded |

Three positives never call their frozen thematic Docs operation.

- `rr-pos-go-sdk-query-enums`
- `rr-pos-js-rpc-durability-values`
- `rr-pos-js-rpc-insecure-http-guard`

All three search projections show the required operation at rank 1 or 2.
The agent selected broader Docs or research operations instead.

The eight negative controls produce zero premature detours.
All eight answers are correct and grounded.

## Positive transcript audit

### 1. `rr-pos-go-sdk-trade-resolutions`

The agent ranks `stellarDocs.search_sdk_cli_tools_docs` first.
It runs that operation in execute 2.
It runs one pinned repository call in execute 3.
The answer is correct and grounded.
The sequence fails because `adjacent` differs from frozen `empty`.

### 2. `rr-pos-go-sdk-query-enums`

The required SDK Docs operation ranks first.
The agent never runs it.
It uses broad Docs and `scout.searchResearch` six times.
No receipt appears.
No repository call occurs.
The answer gives wire strings but omits exported Go symbols.
The answer is incorrect and ungrounded.

### 3. `rr-pos-js-rpc-sleep-strategies`

The required SDK Docs operation ranks second.
The agent includes it with two other Docs calls in execute 4.
It returns `soft-empty`.
The agent uses the receipt in execute 5.
The repository pin is `stellar/js-stellar-sdk`.
The answer is correct and grounded.

### 4. `rr-pos-go-sdk-default-horizon-clients`

The required SDK Docs operation ranks first.
The agent runs two thematic Docs operations in execute 6.
It uses one receipt in execute 7.
The repository pin is `stellar/go-stellar-sdk`.
The answer is correct and grounded.

### 5. `rr-pos-env-host-depth-limit`

The required Soroban Docs operation ranks first.
It returns `soft-empty` in execute 4.
The agent uses one receipt in execute 5.
The repository pin is `stellar/rs-soroban-env`.
The answer is correct and grounded.
The sequence fails because `empty` differs from frozen `adjacent`.

### 6. `rr-pos-js-rpc-durability-values`

The required SDK Docs operation ranks second.
The agent calls RPC Docs, broad Docs, and a page-section operation.
RPC Docs emits a receipt card.
The agent ignores that card.
No repository call occurs.
The answer confuses `rpc.Durability` with XDR durability constructors.
The answer is incorrect and ungrounded.

### 7. `rr-pos-cli-config-home-env`

The required SDK Docs operation ranks first.
The agent runs it in execute 3.
It later uses one receipt in execute 8.
The repository pin is `stellar/stellar-cli`.
The answer correctly states the environment-variable priority.
It incorrectly says no local directory causes an error.
The pinned source says the fallback is `<cwd>/.stellar`.

### 8. `rr-pos-cli-stellar-soroban-dir-precedence`

The required SDK Docs operation ranks third.
The agent runs it in execute 2.
It uses one receipt in execute 5.
The repository pin is `stellar/stellar-cli`.
The answer is correct and grounded.
The sequence fails because `adjacent` differs from frozen `empty`.

### 9. `rr-pos-js-rpc-insecure-http-guard`

The required SDK Docs operation ranks second.
The agent never runs it.
It calls broad Docs five times.
No receipt appears.
No repository call occurs.
The final answer abstains.
The answer is incorrect and ungrounded.

### 10. `rr-pos-go-sdk-timebound-factories`

The required SDK Docs operation ranks first.
The agent runs it with two other operations in execute 4.
It uses one receipt in execute 5.
The repository pin is `stellar/go-stellar-sdk`.
The answer is correct and grounded.

### 11. `rr-pos-horizon-max-supported-protocol`

The required RPC Docs operation ranks second.
The agent runs it in execute 4.
It uses one receipt in execute 5.
The repository pin is `stellar/stellar-horizon`.
The repository answer reports stale value `25`.
The pinned source value is `28`.
The final answer is grounded but incorrect.

### 12. `rr-pos-go-sdk-horizon-timeout`

The required SDK Docs operation ranks first.
The agent runs it in execute 5.
It uses one receipt in execute 6.
The repository pin is `stellar/go-stellar-sdk`.
The answer is correct and grounded.
The sequence fails because `adjacent` differs from frozen `empty`.

## Answer failures versus sequence failures

### Answer failures

Five positives fail answer review.

| Case | Answer cause | Route |
| --- | --- | --- |
| `rr-pos-go-sdk-query-enums` | no repository evidence; exported symbols omitted | product source-selection gap |
| `rr-pos-js-rpc-durability-values` | no repository evidence; wrong enum entity | product source-selection gap |
| `rr-pos-cli-config-home-env` | repository answer contradicts pinned fallback | upstream Scout answer defect |
| `rr-pos-js-rpc-insecure-http-guard` | no repository evidence; agent abstains | product source-selection gap |
| `rr-pos-horizon-max-supported-protocol` | repository answer is stale at `25` | upstream Scout freshness defect |

The threshold can tolerate the two upstream answer failures.
It cannot tolerate the three source-selection failures.

### Sequence failures

Eight positives fail the exact sequence rule.

- Five fail only the exact `empty` versus `adjacent` subtype comparison.
- Three omit the required thematic Docs operation and repository recovery.

No fourth-run sequence fails from malformed repository arguments.
No sequence fails from a wrong repository pin.
No sequence fails from receipt placement or replay.

## Root cause

The product and grader use different recovery-state contracts.

The product treats every non-error source completion as receipt-eligible.
The model decides whether returned evidence is empty or adjacent.
The host explicitly does not classify row relevance.

The grader instead requires the reviewed state to equal one frozen subtype.
That subtype changes with query wording and returned snippets.
The third and fourth runs show stable mismatches across five cases.

The suite definition requires adjacent or empty Docs evidence.
It does not require one exact subtype for promotion.
The exact equality is therefore reviewability debt in the instrument.

The second cause is recovery-edge competition inside ranked search.
Thematic authority operations and their broader recovery targets appear together.
Agents can select `stellarDocs.search_docs` or `scout.searchResearch` before the thematic source.

The exact required operation ranked first or second in all three missing cases.
This is not a lexical ranking miss.
It is an execution-plan miss.

The third cause is upstream repository-answer truth.
Two successful repository calls return wrong source interpretations.
The local receipt or search mechanism cannot correct those answers.

## Hypothesis results

1. Extra operations cause gate rejection: **falsified**.
   The grader permits extra operations.
2. Broad operations displace the thematic authority step: **confirmed**.
   This occurs in three positives despite rank 1 or 2 visibility.
3. The contract card remains malformed or unclear: **falsified**.
   Nine of ten displayed cards produce one correct repository call.
4. Answer failures come from absent or stale repository evidence: **confirmed**.
   Three lack repository evidence, and two receive incorrect repository answers.

## Counterfactual method check

I regraded stored rows without changing any file.
The check accepted either `empty` or `adjacent` as qualifying.

- Third run: `0/12`
- Fourth run: `7/12`

The seven fourth passes are these cases:

- `rr-pos-go-sdk-trade-resolutions`
- `rr-pos-js-rpc-sleep-strategies`
- `rr-pos-go-sdk-default-horizon-clients`
- `rr-pos-env-host-depth-limit`
- `rr-pos-cli-stellar-soroban-dir-precedence`
- `rr-pos-go-sdk-timebound-factories`
- `rr-pos-go-sdk-horizon-timeout`

This check preserves every answer judgment, operation, repository pin, and projection rule.
It proves the contract-card repair produced seven substantive passes.

## Smallest general mechanism

Implement a manifest-derived authority bundle in ranked `search` results.

The bundle applies when visible operations share a `source-code` edge to one recovery-only target.
It contains at most three thematic source operations.
It provides one copyable parallel execute program using the search query.

Broader recovery targets must not compete inside that first bundle.
They remain available after the thematic execute through the existing recovery graph.

This mechanism uses only manifest edges, rank order, operation IDs, and the caller query.
It contains no case IDs, golden text, constant names, repositories, or answers.

The existing receipt card remains unchanged.
It already supplies the second-stage repository contract correctly.

The three missing cases already expose their required authority operation within the top two ranks.
The bundle therefore covers their missing first stage without per-case tuning.

## Required grading-rule correction

Change the positive evidence check from exact subtype equality to qualifying-class membership.

The accepted observed states are exactly:

- `empty`
- `adjacent`

Reject `sufficient`, `other`, and missing evidence.
Keep independent review evidence mandatory.

Stamp the new method as `repository-recovery-gate-v2`.
Preserve all historical v1 artifacts and ledger results.

This method change needs an explicit decision record.
It must not silently reinterpret old published results.

## Implementation plan

### 1. Correct and stamp the gate method

Edit `eval/repo-recovery/contract.mjs`.

- Add a named qualifying-state set.
- Replace exact subtype equality with set membership.
- Return the grading-rule identifier in every grade.

Edit `eval/repo-recovery/artifact.mjs` and `eval/repo-recovery/review-results.mjs`.

- Carry the grading-rule stamp into future reviewed artifacts.
- Reject an unknown grading-rule stamp.
- Preserve raw collection and annotation bytes.

Edit `eval/repo-recovery/grade-results.mjs`.

- Print the grading-rule identifier.
- Refuse unstamped v2 inputs when v2 enforcement is requested.
- Keep the explicit historical v1 path for stored comparisons.

Edit `eval/repo-recovery/README.md` and `eval/EVALS.md`.

- State that `empty` and `adjacent` form one qualifying class.
- Explain the v1 and v2 comparison boundary.
- Keep the frozen case and threshold rules unchanged.

Record the method decision in the repository-recovery ledger.
Do not rewrite earlier run sections.

### 2. Add the authority bundle

Edit `src/catalog/search.ts`.

- Derive source-code authority groups from visible ranked operation hits.
- Group only hits that target the same recovery-only operation.
- Preserve rank order.
- Limit each group to three source operations.
- Render one compact parallel execute program.
- Exclude broader recovery targets from the authority bundle.
- Keep those targets available through explicit recovery.

Add the authority bundle to the shared search-page type.
Keep the derivation beside existing wider and recovery derivation.

Edit `src/mcp/tools.ts`.

- Return the structured authority bundle from top-level `search`.
- Keep the existing receipt and execute descriptions unchanged.
- Avoid another prose-only instruction layer.

Edit `src/executor/providers.ts`.

- Return the same authority bundle from `codemode.search`.
- Keep exact service and recovery-ID validation unchanged.

Edit `src/demo/tools.ts`.

- Preserve the same bundle in the Playground search projection.
- Apply existing output limits to its rendered program.

Edit `ARCHITECTURE.md` and ADR-0009.

- Document the two-stage manifest progression.
- Keep the document in present-state form.
- Do not add fourth-run narrative to product documentation.

### 3. Preserve the current receipt implementation

Do not change these behaviors:

- `scout.explainRepo` remains `recovery-only`.
- ordinary ranking excludes it;
- a non-error authority execute issues one receipt;
- the receipt permits one later target call;
- argument validation precedes receipt consumption;
- the receipt remains identity-bound and single-use;
- the contract card remains manifest-derived.

### 4. Route upstream answer defects

Do not patch local prompts for the two wrong repository answers.

Update or create one Scout improvement for each verified defect.
Use the improvements workflow before any external filing.

- `stellar/stellar-cli`: local fallback incorrectly reported as an error.
- `stellar/stellar-horizon`: `MaxSupportedProtocolVersion` returned as stale `25`.

The live collection and pinned sources provide the initial evidence.
A fresh free service probe must verify each defect before `verified` status.

## Exact tests

### Gate tests

Edit `test/repo-recovery.test.mjs`.

- Accept observed `empty` for a frozen `adjacent` case.
- Accept observed `adjacent` for a frozen `empty` case.
- Reject `sufficient`, `other`, and missing evidence.
- Keep later-execute, one-call, exact-pin, answer, and projection checks.
- Confirm the third stored pattern remains zero under v2 logic.

Edit `test/repo-recovery-artifact.test.mjs`.

- Require the new grading-rule stamp.
- Reject a mismatched or missing stamp.
- Preserve collection and annotation integrity checks.

### Search tests

Edit `test/search.test.ts`.

- Build an authority bundle from shared source-code edges.
- Preserve ranked source order.
- Limit the bundle to three sources.
- Exclude the recovery-only target from ordinary hits.
- Keep broader targets available through explicit recovery.
- Prove unrelated searches produce no authority bundle.

Use the three missing-case query shapes only as regression fixtures.
Do not copy golden answers or case-specific rules into production code.

### Boundary tests

Edit `test/server.test.ts`.

- Assert top-level `search` returns the authority bundle.
- Assert its code uses exact manifest operation IDs.
- Assert the existing receipt card remains unchanged.

Edit `test/executor-providers.test.ts`.

- Assert `codemode.search` returns the same authority bundle.
- Assert explicit recovery still returns the recovery-only target.

Edit `test/smoke/demo-tools.test.ts`.

- Assert Playground search preserves the bundle.
- Assert output clipping keeps the callable lines.

Add a focused smoke case in `test/smoke/executor.test.ts` only if provider parity needs Worker proof.

## Required free gates

Run focused tests first:

```sh
npx vitest run \
  test/search.test.ts \
  test/server.test.ts \
  test/executor-providers.test.ts \
  test/repo-recovery.test.mjs \
  test/repo-recovery-artifact.test.mjs
```

Run the focused Worker tests:

```sh
npx vitest run --config test/smoke/vitest.config.ts \
  test/smoke/demo-tools.test.ts \
  test/smoke/executor.test.ts
```

Run all free eval checks:

```sh
npm run eval:selftest
npm run eval:compile
npm run eval:qa:compile
npm run eval:qa:lint -- --stale
npm run eval:repo-recovery:lint
npm run eval:repo-recovery -- --gate
npm run eval:routing -- --gate
```

Regrade both stored collections under the explicit historical and new method paths.
The expected diagnostic is third `0/12` and fourth `7/12` under v2.

Run the repository baseline:

```sh
npm run typecheck
npm test
npm run build
npm run test:smoke
npm run secrets:scan -- --tree
git diff --check
```

The routing gate must keep every accepted lane within its committed limits.
Inspect every hit-to-miss routing regression caused by result shaping.

## Live acceptance gate

Do not run another paid collection without separate authorization.

Use one clean revision for the server and collector.
Pin the revision, surface, binary, process, prompt, and implementation hashes.
Run the zero-cost Docs readiness gate before payment.

Use the unchanged 20 cases and ordered IDs.
Use `claude-sonnet-5` as the answering model.
Keep every transcript, search projection, execute input, operation projection, and reported cost.

Prepare the deterministic review packet after collection.
Use an independent high-effort reviewer.
Join annotations without changing raw evidence.

The live promotion gate remains:

- at least `10/12` positive passes under `repository-recovery-gate-v2`;
- exactly `0/8` negative premature detours;
- zero operation projection errors;
- complete collection and review integrity;
- correct and grounded answers for every passing positive;
- one exact pinned repository call in a later execute.

Also report these diagnostics:

- authority bundle visibility by positive case;
- authority source operations used;
- receipt cards emitted and used;
- missing thematic authority calls;
- ignored receipt cards;
- wrong or absent repository pins;
- repeated or malformed repository calls;
- answer failures after successful repository recovery;
- later negative repository detours.

Stop after one authorized method run.
Do not repeat an honest gate failure without a new authorization.

## Risks

### Method comparability

The grading-rule correction changes method semantics.
Stamp it and preserve historical v1 readings.
Never present `7/12` as the original fourth-run result.

### Search response size

An authority bundle adds response bytes.
Cap it at three sources and use compact signatures.
Measure serialized response characters in tests.

### Extra Docs traffic

A bundle can encourage multiple free Docs calls.
Measure operation counts and latency.
Do not auto-dispatch service calls inside `search`.

### Unrelated discovery regressions

Recovery-edge dominance can hide a useful broad operation too early.
Keep broader targets available through explicit recovery.
Review every routing regression, not only aggregate totals.

### Model compliance

The bundle remains model-facing guidance.
Only the live gate proves adoption.
Do not claim success from structural tests.

### Post-authority negative detours

The frozen negatives do not reject a later unnecessary repository call.
Keep the existing telemetry band and report later detours diagnostically.

### Upstream repository truth

The current threshold has exactly two misses of tolerance.
The two verified upstream answer defects can consume that entire margin.
A third answer miss still blocks promotion.

### Reviewability

Keep the authority derivation in one catalog module.
Do not duplicate rules across prompts, descriptions, and demo code.
Do not add case phrases or answer fragments to production files.

## Final conclusion

The fourth run is not a contract-card failure.
The card repair changes valid repository-call adoption from zero to nine positives.

The official `3/12` result understates that gain because the gate compares unstable evidence subtypes.
After a contract-aligned regrade, the fourth artifact reaches `7/12`.

Three remaining recoverable misses come from execution-plan selection.
A manifest-derived authority bundle is the smallest general product mechanism.

Two remaining answer failures belong upstream.
The frozen threshold can tolerate them, but no additional answer miss.

IMPLEMENTATION-READY
