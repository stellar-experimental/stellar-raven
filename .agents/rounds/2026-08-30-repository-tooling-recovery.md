# Repository-level tooling recovery round

- Date: 2026-08-30
- Scope: `.agents/NEXT.md` block 4 only
- Route: Codex GPT-5.6 Sol, high
- Starting revision: `b53f62d3e6370231103b221e5474ecb6cbfd5627`
- Starting tree: clean
- Manifest SHA-256: `4945c3117d464d7155fe6bc2bd2f2f42638ef83159435ae48a90bab046dc6789`
- Routing runner SHA-256: `6f19371a3a68f2bd727c04be27df41ee4f2b56284f5ef0e3c7988305597b2b54`
- QA corpus SHA-256: `08fc1130caafef09444757f5eb7ee96da3ec7cc0a09b675aacd0a49c8361840e`
- Routing gates SHA-256: `95a4f7c1afb9ee3d7de517549994da1986d50411719cecfbb03226ab1bbbb371`

## Fixed scope and stop rules

This round creates one separate 20-case repository-recovery contract.
The contract contains exactly 12 positive cases and eight negative controls.
It never enters another eval denominator.
The contract is frozen before product recovery changes or score inspection.

The shipped gate requires at least 10 positive passes.
A positive pass requires the accepted operation order and a grounded answer.
All eight negatives must avoid a premature `scout.explainRepo` detour.
A negative detour is premature when `scout.explainRepo` precedes Docs or skills.

The recovery mechanism stays query-independent and manifest-owned.
It permits one pinned `scout.explainRepo` attempt after adjacent or empty Docs evidence.
It does not add `sources.locate`.
It does not change ranking unless three qualifying positive misses remain after recovery.
Prompt-only guidance did not enforce the later-execute boundary. The receipt design now keeps the
operation out of ordinary ranking and requires a host-issued receipt for dispatch.

No paid measurement, deployment, push, pull request, external filing, or task-queue edit is authorized.

## Frozen-suite verification

The independent reviewer completed the final bounded review on 2026-08-30.
The reviewer used Grok 4.6 at high effort.
This reviewer differed from the suite author and the orchestrator.
The final truth report is [`truth-review.md`](./2026-08-30-repository-tooling-recovery/truth-review.md).
The report reviews all 20 cases and records every source defect.
The final report ends in `PASS`.
The suite lint also passes with 12 positive cases and eight negative cases.

## Suite identity

The suite became frozen before product recovery changes or score inspection.

- Contract: `repository-tooling-recovery-v1`
- Case content: `sha256(JSON.stringify(cases))=5dee41663f80bde85328e624a02f6fd8f21f2d39a93bac04ef028c1265195534`
- Ordered IDs: `sha256(ids.join("\\n"))=1883592ca7b52ac06cc40881efa49e4b84b2054875aee459be2245f71372115f`
- Counts: 20 total, 12 positive, eight negative
- Positive requirement: at least 10 of 12
- Negative requirement: zero premature detours across all eight

The frozen order is:

1. `rr-pos-go-sdk-trade-resolutions`
2. `rr-pos-go-sdk-query-enums`
3. `rr-pos-js-rpc-sleep-strategies`
4. `rr-pos-go-sdk-default-horizon-clients`
5. `rr-pos-env-host-depth-limit`
6. `rr-pos-js-rpc-durability-values`
7. `rr-pos-cli-config-home-env`
8. `rr-pos-cli-stellar-soroban-dir-precedence`
9. `rr-pos-js-rpc-insecure-http-guard`
10. `rr-pos-go-sdk-timebound-factories`
11. `rr-pos-horizon-max-supported-protocol`
12. `rr-pos-go-sdk-horizon-timeout`
13. `rr-neg-release-profile`
14. `rr-neg-quickstart-diagnostic-flag`
15. `rr-neg-testnet-endpoints`
16. `rr-neg-core-validators-fields`
17. `rr-neg-rpc-history-retention-window`
18. `rr-neg-sdp-max-base-fee`
19. `rr-neg-rpc-max-events-limit`
20. `rr-neg-contract-optimize-deprecated`

## Measurements

### Production telemetry baseline

The query covered `2026-08-23T12:00:00Z` through `2026-08-30T12:00:00Z`.
It used 28 consecutive six-hour windows.
Every query reported `abr_level: 1`.
No query failed.

The search population used app events with `evt = "search"`.
The operation population used app events with `evt = "op"`.
Both populations used `$metadata.service = "stellar-raven-codemode"`.

| Metric | Count | Denominator | Baseline rate |
| --- | ---: | ---: | ---: |
| zero-hit search | 8 | 853 search events | 0.9379% |
| all-backfill search | 205 | 853 search events | 24.0328% |
| `scout.explainRepo` operations | 97 | 8,971 operation events | 1.0813% |

The live Scout status endpoint exposed `/api/repos/explain` on 2026-08-30.
The status response listed 36 endpoints.

### Pre-registered weekly monitoring bands

Use consecutive six-hour telemetry slices.
Require every slice to report `abr_level: 1`.
Suppress a weekly verdict after a query failure or a mixed ABR level.

- The zero-hit search rate must stay from 0% through 5%.
- The all-backfill search rate must stay from 10% through 40%.
- The `scout.explainRepo` operation share must stay from 0% through 5%.

The canary set contains exact exposed IDs only.
It contains `scout.explainRepo` and each Docs recovery source in the frozen suite.
The suite validator will fail when a canary ID is absent or unexposed.

### Product measurements

The pre-change free structural measurement used the frozen suite.
It ran before any product recovery change.

| Measurement | Pre-change result | Post-change result |
| --- | ---: | ---: |
| positive recovery eligibility | 0 of 12 | 12 of 12 |
| required positive eligibility | 10 of 12 | 10 of 12 |
| negative premature rank risks | 0 of 8 | 0 of 8 |
| structural proxy gate | FAIL | PASS |

This measurement does not replace the stored live-agent grader.
That grader owns operation order and grounded-answer checks.
Paid collections are recorded below.

## Promotion collection contract

Collector commit `a7661b5936390bbb358091682f3ff671fee06a79` adds the live collection method.
The method keeps the frozen suite byte-identical.
It reuses the QA answering parser, spend ledger, isolation guard, executable pin, and server identity guards.

The successful path makes exactly 20 paid answering calls.
The method permits one transport retry for each frozen case.
The maximum path therefore makes 40 paid answering calls.
No answering-model call creates `answerReview`.

Two 2026-08-27 collect-only runs provide the cost evidence.
Both used `claude-sonnet-5` and eight answering calls in the QA connector lane.
Both used Claude Code `2.1.247` with wrapper SHA-256
`a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297`.
The planned collector uses the separately pinned Claude Code `2.1.251` binary.
They cost `$2.2461662` and `$2.3726368`.
Their eight-call means are `$0.280770775` and `$0.2965796`.
The pooled 16-row minimum is `$0.0661584`.
The pooled median is `$0.2353369`.
The pooled maximum is `$0.5837418`.
The pooled mean is `$0.2886751875`.
The 20-call mean-based estimate is `$5.6154155` through `$5.931592`.
A 20-call path at the observed row maximum is `$11.674836`.
The 40-call path at the higher run mean is `$11.863184`.
The conservative 40-call bound at the observed row maximum is `$23.349672`.
The hard collector cap is `$30.00`.
It adds `$6.650328`, or 28.4815%, above that conservative bound.

The free exact-branch probe recorded these launch pins:

- MCP surface SHA-256: `21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af`
- Claude path: `/Users/kalepail/.local/bin/claude`
- Claude real path: `/Users/kalepail/.local/share/claude/versions/2.1.251`
- Claude version: `2.1.251 (Claude Code)`
- Claude binary SHA-256: `625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5`

Use this exact collector command once from the final clean branch:

```sh
RECOVERY_SERVER_REVISION="$(git rev-parse HEAD)"
test -z "$(git status --porcelain=v1 --untracked-files=all)"
npm run eval:repo-recovery:collect -- \
  --port 8788 \
  --model claude-sonnet-5 \
  --server-revision "$RECOVERY_SERVER_REVISION" \
  --expect-sha256 21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af \
  --expect-agent-binary-sha256 625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5 \
  --max-paid-calls 40 \
  --max-budget-usd 30.00 \
  --collector-author codex-gpt-5.6-sol-high \
  --orchestrator codex-gpt-5.6-sol-high \
  --output eval/repo-recovery/results/repository-tooling-recovery-v1-collection.json
```

Start `npm run dev:eval -- --port 8788` from that same clean revision first.
The collector refuses an existing output path.
This prevents an accidental overwrite or unrecorded second method run.

The collector stops before spend on a suite, worktree, revision, surface, executable, or isolation mismatch.
It also rejects `QA_AGENT_PROMPT_APPEND`.
After every paid call, it rechecks the bound server, source revision, surface, and runner worktree.
It stops on Raven disconnection, a call-cap breach, a budget-cap breach, or a missing reported cost.
It also stops when a reported cost exceeds the remaining authorization.
Only a typed transport failure gets one byte-identical retry.
Every completed paid call keeps its transcript, even when a later check stops the run.
An identity stop records the failing observation when the probe returned one.

After collection, prepare the deterministic review packet:

```sh
npm run eval:repo-recovery:review -- \
  --collection eval/repo-recovery/results/repository-tooling-recovery-v1-collection.json \
  --prepare /tmp/repo-recovery-review-packet.json
```

An eligible independent reviewer must inspect every answer, transcript, operation, and pinned source.
The planned annotation reviewer identity is `repo_recovery_live_fable`.
Its planned model is `claude-fable-5` at high effort.
This plan needs separate authorization before any paid reviewer call.
The reviewer writes `eval/repo-recovery/results/repository-tooling-recovery-v1-annotations.json`.
It does not change the raw collection.
The reviewer must differ from the answering model, collector author, and orchestrator.

Join the stored annotations deterministically, then grade only that reviewed artifact:

```sh
npm run eval:repo-recovery:review -- \
  --collection eval/repo-recovery/results/repository-tooling-recovery-v1-collection.json \
  --annotations eval/repo-recovery/results/repository-tooling-recovery-v1-annotations.json \
  --output eval/repo-recovery/results/repository-tooling-recovery-v1-reviewed.json
npm run eval:repo-recovery:grade -- \
  eval/repo-recovery/results/repository-tooling-recovery-v1-reviewed.json --gate
```

The join embeds the raw collection and annotations in the reviewed artifact.
The grader recomputes both hashes and validates every reviewed overlay.
The packet and join commands make no model call.
Any paid reviewer method needs separate authorization and its own cap.

The operation projection uses the executor code normalizer.
It records static source order, not runtime order inside one execute.
It resolves common static aliases and rejects unresolved dynamic service calls.
Any projection error makes the stored gate fail.
The strict later-execute rule proves that recovery followed inspection of the first result.
A conditional recovery inside that same first execute is an intentional false negative.

All three result artifacts remain local under `eval/repo-recovery/results/`.
This follows the local-only rule in `eval/EVALS.md`.
After the authorized run, record each artifact SHA-256 and the final gate metrics here.
The round ledger is the durable summary when local result files later expire.

## First paid collection result and invalidation

The owner authorized one collection with at most 40 paid calls and a `$30.00` hard cap.
The collector completed all 20 rows with one answering call per row.
It spent `$4.6211474` and reported every cost.
All revision, surface, binary, isolation, connection, completeness, and budget checks passed.

The collection artifact uses these identities:

- Canonical artifact SHA-256: `d883c39e4d2a73071ec0c2f1e4688f96adfbbb9e478de14e2e0cc99b27920b30`
- File SHA-256: `d32778239c5eb3d763edd7824add3d28a8151faf5ea9fcabe533824f5ac253c5`
- Annotation file SHA-256: `f01ad77538ee4be5cc87aaf3a7225e07264a9e353a33de23ebd3984453b0e77e`
- Reviewed file SHA-256: `943354624c20de3d0410ec3fd71086573c4cdbee5dbd333a5442a5365dfc1354`

The independent annotation review used Herdr agent `repo_recovery_live_fable`.
It used `claude-fable-5` at high effort with a `$12.00` hard cap.
The plain CLI output did not report its actual cost.
The reviewer inspected all 20 raw rows but could not read the prepared `/tmp` packet.
It left the collection hash as a placeholder and misread one double-prefixed skill operation ID.
The operator inserted the deterministic collection hash.
The operator also changed only that exact-ID annotation to `null` and `other` before the join.
The deterministic join and artifact-integrity checks then passed.

The reviewed live gate failed:

- Positive passes: 0 of 12; required 10
- Positive correct and grounded answers: 8 of 12
- Negative premature detours: 0 of 8; maximum 0
- Projection errors: 0
- Review integrity: PASS after the two mechanical corrections above

This result does not measure the recovery mechanism.
Every Stellar Docs operation returned `error.kind: "error"` from the local Worker.
The recovery worktree used one-character placeholder Algolia values.
The main checkout held valid local values.
The model therefore had no `empty` or `adjacent` Docs evidence that could trigger recovery.
Do not cite the 0-of-12 result as a product score.

The failed run exposed two collector defects.
The collector did not exercise required upstream operations before spend.
The operation projector changed `skills.stellar-dev.data` into `skills.skills.stellar-dev.data`.

The repair adds a zero-cost readiness gate before the first paid call.
It exercises the three distinct positive-suite Stellar Docs operations through Raven.
It accepts data and `soft-empty` responses.
It rejects unavailable operations, provider errors, tool errors, protocol errors, and transport errors.
It records only operation IDs, `ok`, `errorKind`, and numeric `errorStatus` values.
It never records error messages or Docs hit payloads.
A failed readiness gate writes a non-comparable artifact with zero paid calls, then stops.

The repair also preserves canonical `skills.*` operation IDs without adding a second prefix.
It does not change the frozen cases, truth, routing rules, or recovery product mechanism.

Terra high implemented the repair through Herdr.
Grok 4.6 high found one high and two medium defects in the first repair.
The final bounded report is `/tmp/repo-recovery-preflight-grok.md`.
All findings were repaired, and the final report ends in `PASS`.
The live zero-cost check passed all three required Docs operations with valid local configuration.

The invalid collection consumed its authorization.
A new paid collection and a new independent review require separate exact authorization.

## Replacement collection, completed review, and failed gate

The owner authorized one replacement collection on repaired revision
`d840d2318aaa47a52ba24eadffb89d4186579789`.
The method allowed at most 40 paid calls and a `$30.00` hard cap.
It pinned surface SHA-256
`21a7c649c340119ab2a0f04347c8afee8aa4fb7ae68fc00c1fc876581ef955af` and Claude binary SHA-256
`625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5`.

The repaired readiness gate passed all three required Docs operations before payment.
The collector completed all 20 rows with one answering call per row.
It spent `$3.9934568` across 20 paid calls, with no retry.
The collection stayed comparable and complete.
The runner and server stayed clean on the pinned revision.
The source revision, surface, binary, process, and implementation guards passed before and after collection.

The replacement collection uses these identities:

- Canonical artifact SHA-256: `152071fcc6e79201643ee42a0d61da8c1b6a2d1930c634795bd028d8ab2f48c3`
- File SHA-256: `cdf9ccbfaf81575cdd4bff02ba4b5e60acc8c5e669397b6e298bd312abc719f1`
- Model: `claude-sonnet-5`
- Answering calls: 20 of 40 allowed
- Reported spend: `$3.9934568` of `$30.00` authorized

The owner also authorized one `claude-fable-5` high review session with a `$12.00` hard cap and no retry.
The first Herdr launch duplicated the Claude binary and sent only the word `claude` as the task.
The same Claude session then resumed with a `$10.00` cap to reserve `$2.00` for that short response.
The resumed session read the 2.3 MB packet until the CLI reported `Exceeded USD budget (10)`.
It wrote no annotation or reviewed artifact.
The plain CLI did not report the exact combined review cost.
The owner then approved all spend required to finish the round.
A same-session `$8.00` continuation also reached its cap without writing an artifact.

A fresh progressive `claude-fable-5` high session used a `$20.00` cap.
It read each complete authoritative transcript once and excluded duplicated `toolCalls` and `attempts` fields.
It wrote progress after each five-case group and completed all 20 independent annotations.
The deterministic join and artifact-integrity checks passed.
The CLI did not report the exact review spend.

The reviewed artifacts use these identities:

- Annotation canonical SHA-256: `d5402c0fc3ee19883bb2a8d26d78fee8d86c81c839dab092447c2b226e2eeaa8`
- Annotation file SHA-256: `4eab5946fddde8d39598b66000956d7d224235c9e0c849ed09231c6455df9e2f`
- Reviewed file SHA-256: `398853b2fe7a4989b1436ca2b6cae1943bf095d5af10247ce2933fbb9cb86fb6`
- Correct answers: 16 of 20
- Grounded answers: 20 of 20
- Positive answer passes: 8 of 12
- Negative premature detours: 0 of 8

The valid reviewed gate still failed with 0 of 12 positive sequence passes.
Every positive failed the required Docs-first, inspect, then one-later-repository-call sequence.
Six positives never ran a Docs operation.
Three more ran Docs and `scout.explainRepo` in the same first execute.
Several cases repeated `scout.explainRepo` after a serialization failure.

The failed measurement exposed two product defects.
The envelope guard put a Proxy in the service payload prototype chain.
Dynamic Worker RPC rejected a raw awaited service envelope even though Node `structuredClone` accepted it.
The ranked-search workflow also told agents to compose ordinary ranked hits in one first execute.
That rule let `scout.explainRepo` bypass a leading Docs authority without any `recoverFrom` request.

Terra high repaired the Dynamic Worker boundary in commit `cc4627c`.
It replaced the Proxy prototype with non-enumerable own accessors and added a real Dynamic Worker smoke test.
Grok 4.6 high rejected the first guidance repair because it covered only explicit recovery candidates.
Terra then added the general ranked-authority rule in commit `349bca6`.
The rule now appears in production search, demo search, search and execute descriptions, and base server instructions.
It requires an authority-only first execute, result inspection, and at most one later repository-detail call.
Grok's final report `/tmp/repo-recovery-runtime-grok-final.md` ends in `PASS`.

The failed measurement is not evidence that the repaired revision passes.
A new blind collection on one clean repaired revision remains required.

## Collector review reconciliation

Claude Fable 5 reviewed the collector at high effort.
Its first report is `/tmp/repo-recovery-collector-fable-review.md`.
That report ended in `CHANGES-REQUESTED`.

All findings received these resolutions:

- H1: the projection now uses the executor normalizer and module parsing.
  It resolves common static aliases and rejects unresolved dynamic service calls.
  Any projection error now fails the stored gate.
- M1: an interrupted case now stores every completed paid attempt and transcript.
  The row also records the stop code and message.
- M2: the join now rejects padded reviewer fields.
  The grader now returns explicit `reviewReasons`.
- M3: focused collector tests now cover transport retry, terminal failure, Raven loss, both caps,
  missing cost, excess cost, prompt drift, identity drift, unsafe isolation, and overwrite refusal.
- L1: the preflight isolation check now reads the actual collector environment.
- L2: reviewer matching now rejects equal or overlapping actor strings.
  The documentation also states that operator independence remains an attestation.
- L3: the documentation now states the static-order limit and the strict later-execute rule.
  It also records the intentional same-execute false negative.
- L4: identity failures now retain the failing observation when the probe returned one.
- L5: the CLI now rejects missing option values and invalid ports.
  The implementation hash now includes `lint.mjs` and the executor normalizer.
- L6: all three reviewed result files now use stable local paths under
  `eval/repo-recovery/results/`.
  This ledger will retain their SHA-256 values and final metrics after an authorized run.

The first arithmetic reviewer did not produce the required final report path.
Its terminal output is not review evidence.
A fresh Grok 4.6 high review must write `/tmp/repo-recovery-collector-grok-review.md`.
The repaired collector also needs one bounded final Fable re-review.

The fresh Grok report at that path found one blocking cost-description defect.
The old text mislabeled two eight-call means as a per-call range.
The repair now records the row-level distribution and the different binary cohort.
It raises the planned hard cap from `$15.00` to `$30.00`.
The new cap covers a 40-call path at the observed row maximum with 28.4815% headroom.

## Implementation

Three thematic Stellar Docs operations now own the same repository recovery edge.
The edge targets the exposed `scout.explainRepo` operation.
It applies only to `empty` and `adjacent` evidence states.
It appears first in each operation's ordered recovery list.
For RPC Docs, this intentionally narrows the prior source-code triggers.
The prior triggers were `weak`, `adjacent`, `ambiguous`, and `partial`.
The new source-code triggers are only `empty` and `adjacent`.

The executor now derives recovery guidance from successful and soft-empty calls.
It continues to exclude error calls from evidence-state guidance.
The checkpoint requires one exact repository owner and name.
It limits repository explanation to one attempt.

The mechanism uses exact operation IDs and evidence states only.
It contains no case terms or question terms.
It does not add `sources.locate`.
The builder reported manifest JSON SHA-256 `1c7fc230406351e285920cfa20678b65c5a140d7a78a68d0f776681e6915de3a`.
The generated manifest file SHA-256 is `d32946e9510b5da0b94e00046d9425312a26be8cd6810c486a47187c53cfabc9`.

## Verification

The required free checks passed:

- `npm run eval:selftest`
- `npm run eval:compile`
- `npm run eval:qa:compile`
- `npm run eval:qa:lint -- --stale` with 0 errors and 60 existing warnings
- `npm run eval:repo-recovery:lint`
- `npm run eval:repo-recovery -- --gate`
- `npm run eval:routing -- --gate`
- `npm run improvements:lint`
- `npm run typecheck`
- `npm test` with 100 files and 1,548 tests after the preflight repair
- `npm run build`
- `npm run test:smoke` with four files and 82 tests
- `npm run secrets:scan -- --tree`
- `git diff --check`

The optional model-backed `npm run eval:qa:selftest` could not authenticate its judge CLI.
It reported `totalCostUsd=0` and changed no files.
This command was outside the required free gates.

The routing runner, routing cases, skills cases, holdout cases, and QA cases kept their starting hashes.
The accepted routing gate totals stayed unchanged at this revision.
The later receipt implementation re-baselined them with the evidence below.

The independent implementation review used Grok 4.6 at high effort.
Its report is `/tmp/repo-recovery-implementation-review.md`.
The reviewer found two non-blocking issues.
Both issues were repaired and re-reviewed.
The final report ends in `PASS`.

The preflight repair also passed these checks:

- focused collector and artifact tests with two files and 24 tests
- the live zero-cost readiness check across three required Docs operations
- `npm run typecheck`
- `npm test` with 100 files and 1,548 tests
- `npm run build`
- `npm run eval:repo-recovery:lint`
- `npm run eval:repo-recovery -- --gate`
- `npm run eval:routing -- --gate`
- `npm run secrets:scan -- --tree`
- `git diff --check`

## Outcome

The frozen structural gate improved from 0 of 12 to 12 of 12 positive eligibility.
Negative premature rank risks stayed at 0 of 8.
The shipped threshold is 10 of 12 and 0 of 8.

The first paid collection was invalid because its local Docs service was misconfigured.
It spent `$4.6211474` and produced no valid product score.
The second valid collection scored 16 of 20 correct and 20 of 20 grounded.
Its sequence result was 0 of 12 positives and 0 of 8 detours.

The live ship gate is unmet at HEAD.
The receipt design has zero live measurements at HEAD.
A third authorized collection is required before promotion.
It must use this frozen suite and one clean repaired revision for runner and server.
It must retain all 20 operation traces and reviewed answers.
It must pass at least 10 positives and all eight negative controls.

No deployment, push, pull request, external filing, or queue edit occurred.
The weekly telemetry canary remains pending until a deployment receives separate authorization.

## Superseded pre-freeze blind suite-truth matrix — Fable 5 high

This matrix records the first candidate suite and is not the frozen contract.
Later reviews found defects and replaced several cases.
The frozen identity and final PASS report above control this round.

- Verifier: Claude Fable 5, high. Independent of the round author (Codex GPT-5.6 Sol).
- Authored: 2026-08-30. All repository facts were read at the pinned commits below on 2026-08-30.
- Blindness statement: the verifier did not open `scripts/catalog-data/retrieval-profiles.mjs`, product
  recovery code, any suite file, or any score output. Disclosure: while extracting the
  `scout.explainRepo` input schema from `catalog/manifest.json`, one manifest hint entry for that
  operation (`relation: source-code`, `on: weak/adjacent/ambiguous/partial`) scrolled past. The verifier
  did not use it to shape any case. No paid tool was used. `scout.explainRepo` was never called.
- Tools used: pinned GitHub raw source (class B), official Stellar Docs pages and published package
  docs (class A), live `horizon.stellar.org` (class C), DeepWiki and web search (class D), Raven
  `stellarDocs.search_docs` through `execute` (class E), and local `stellar` CLI 27.1.0 runs (class F).
- The QA battery (519 cases) was grepped for sibling overlap. It was not changed. Overlap notes are
  per case. No proposed id exists in the battery.
- Rules applied: every positive fact lives only in source code or repository configuration; Docs or
  skills carry at most an adjacent page (checked by Docs search and page grep). Every negative is
  answerable from Docs or a skill and needs no repository code. Counts: 12 positives, 8 negatives,
  10 repositories.

### Pinned repositories (default branch HEAD, 2026-08-30)

| Repo | Commit | Commit date |
|---|---|---|
| `stellar/stellar-core` | `0752b5176d22c8d57ed562c93038f76ab97e8285` | 2026-08-28 |
| `stellar/stellar-rpc` | `9c13d418978631e702d1687490f2a1110af48a22` | 2026-08-28 |
| `stellar/js-stellar-sdk` | `3839fd2ee0a2d3e89e0e73638aa103479733c9d2` | 2026-08-27 |
| `stellar/rs-soroban-sdk` | `8c716fd1dda28cc0e1d59f4c8a40e292b4b7167b` | 2026-08-28 |
| `stellar/rs-soroban-env` | `a97c6ffecbedd6dba74807276a5115ad86b5396f` | 2026-08-28 |
| `kalepail/passkey-kit` | `309537474f689a7948c729a7bab0d1388f509422` | 2026-07-31 |
| `stellar/stellar-cli` | `0cc28fcb61d2746536a92b795f270b2d5d3d506e` | 2026-08-29 |
| `stellar/quickstart` | `98e7824610f1f3fef36a5fe1e03682d778a4a1f3` | 2026-08-28 |
| `stellar/stellar-horizon` | `2abda012313e162d822fda44076893054a3b27a2` | 2026-08-20 |
| `stellar/go-stellar-sdk` | `5ee91ba60a828723ab8cad45067612420161ea4d` | 2026-08-28 |

Note for graders: `stellar/go` is archived (GitHub `archived: true`, last commit 2025-12-10). Horizon
now lives in `stellar/stellar-horizon`; the Go SDK lives in `stellar/go-stellar-sdk`. Answers that
pin `stellar/go` for a current Horizon or Go SDK fact are stale.

### Candidates rejected during verification

- `stellar-rpc` `HISTORY_RETENTION_WINDOW`, `DEFAULT_EVENTS_LIMIT`, `MAX_EVENTS_LIMIT`: all printed
  with defaults on `docs/data/apis/rpc/admin-guide/configuring`. Not repository-only. `MAX_EVENTS_LIMIT`
  became negative `rr-neg-rpc-max-events-limit`.
- SDP `MAX_BASE_FEE` default 10000: printed on
  `docs/platforms/stellar-disbursement-platform/admin-guide/configuring-sdp`. Became negative
  `rr-neg-sdp-max-base-fee`.
- Stellar CLI `$XDG_CONFIG_HOME/stellar` default: printed in the CLI manual. Only the
  `STELLAR_CONFIG_HOME` override and the `.stellar`/`.soroban` precedence remain repository-only.
- `stellar/scaffold-stellar` returned 404; not used.

### Positive cases (12)

#### rr-pos-core-max-slots
- Question: "What is the default value of `MAX_SLOTS_TO_REMEMBER` in stellar-core, and what does it
  bound?"
- Class: positive. Repo: `stellar/stellar-core`.
- Initial operation: `stellarDocs.search_protocol_concepts_docs` (or `stellarDocs.search_docs`) with the
  key name. Observed 2026-08-30: adjacent validator admin pages only; the key is absent from
  `docs/validators/admin-guide/configuring` (0 hits).
- Expected order: Docs search (adjacent) → `scout.explainRepo` `{ repo: "stellar/stellar-core" }` → answer.
- Grounded answer: `Config::Config()` sets `MAX_SLOTS_TO_REMEMBER = 12`. It is the number of most
  recent ledgers a node keeps in memory so peers can join without catchup. The SCP checkpoint message
  does not count toward it. As of commit `0752b51`.
- Key facts: (1) default is 12; (2) unit is ledgers; (3) it bounds recent ledgers kept in memory for
  peers; (4) it is set in `src/main/Config.cpp` and documented in `docs/stellar-core_example.cfg`.
- Avoid: claiming the Docs validator guide prints this value; giving a unit of seconds; confusing it
  with `CATCHUP_RECENT` (default 0).
- Truth: domain real-world; status confirmed; as-of 2026-08-30.
- Corroboration:
  - B: https://github.com/stellar/stellar-core/blob/0752b5176d22c8d57ed562c93038f76ab97e8285/src/main/Config.cpp#L211 — `MAX_SLOTS_TO_REMEMBER = 12;`
  - B: https://github.com/stellar/stellar-core/blob/0752b5176d22c8d57ed562c93038f76ab97e8285/docs/stellar-core_example.cfg#L645-L651 — "defaults to 12".
  - D: DeepWiki `stellar/stellar-core` (2026-08-30) returned 12 and the same purpose; web search returned the example cfg text.
  - A/E (adjacency only): https://developers.stellar.org/docs/validators/admin-guide/configuring — key absent.
- Siblings: none match `MAX_SLOTS_TO_REMEMBER`. `q-protocol-validator-node-roles` and `q-protocol-tier1-requirements` are topical neighbors, not overlaps.

#### rr-pos-rpc-fee-stats-max-window
- Question: "What is the largest value stellar-rpc accepts for `classic-fee-stats-retention-window`
  and `soroban-fee-stats-retention-window`, and where is it enforced?"
- Class: positive. Repo: `stellar/stellar-rpc`.
- Initial operation: `stellarDocs.search_rpc_horizon_data_docs`. Observed: the configuring page prints
  the defaults 10 and 50 but no maximum (adjacent).
- Expected order: Docs search (adjacent) → `scout.explainRepo` `{ repo: "stellar/stellar-rpc" }` → answer.
- Grounded answer: both options run `feeStatsRetentionWindowValidator`, which requires a positive
  value and rejects anything above `MaxFeeStatsRetentionWindow = 1000` ledgers with
  "cannot exceed 1000 ledgers". Defaults are 10 (classic) and 50 (soroban). As of commit `9c13d41`.
- Key facts: (1) maximum is 1000 ledgers; (2) constant `MaxFeeStatsRetentionWindow`; (3) validator
  `feeStatsRetentionWindowValidator` in `cmd/stellar-rpc/internal/config/options.go`; (4) defaults 10 and 50.
- Avoid: claiming the only bound is `HISTORY_RETENTION_WINDOW`; claiming the Docs page prints a maximum;
  reporting 120960 as the fee-stats limit.
- Truth: domain real-world; status confirmed; as-of 2026-08-30.
- Corroboration:
  - B: https://github.com/stellar/stellar-rpc/blob/9c13d418978631e702d1687490f2a1110af48a22/cmd/stellar-rpc/internal/config/options.go#L29-L33 — `MaxFeeStatsRetentionWindow = 1000`.
  - B: same file `#L745-L759` — validator returns "cannot exceed %d ledgers".
  - A (adjacent, defaults only): https://developers.stellar.org/docs/data/apis/rpc/admin-guide/configuring — `CLASSIC_FEE_STATS_RETENTION_WINDOW = 10`, `SOROBAN_FEE_STATS_RETENTION_WINDOW = 50`.
  - D: DeepWiki `stellar/stellar-rpc` (2026-08-30) did not find the constant and named only the history-window check; treated as stale, not as a conflict with pinned source.
- Siblings: `q-pc-practical-fee-setting`, `q-pc-surge-griefing-threat-model` mention fee stats as an API, not this config bound. No overlap.

#### rr-pos-js-rpc-submit-timeout
- Question: "In `@stellar/stellar-sdk`, what is the exported default transaction submission timeout for
  the RPC `Server`, and what is its name?"
- Class: positive. Repo: `stellar/js-stellar-sdk`.
- Initial operation: `stellarDocs.search_sdk_cli_tools_docs`. Observed: only tutorials that construct
  `rpc.Server` (adjacent); the constant is absent.
- Expected order: Docs search (adjacent) → `scout.explainRepo` `{ repo: "stellar/js-stellar-sdk" }` → answer.
- Grounded answer: `src/rpc/server.ts` exports `SUBMIT_TRANSACTION_TIMEOUT = 60 * 1000` (60000 ms).
  The published package 17.0.1 exports the same value. As of commit `3839fd2`.
- Key facts: (1) name `SUBMIT_TRANSACTION_TIMEOUT`; (2) value 60000 milliseconds; (3) exported from the
  `rpc` module; (4) `Server` option `timeout` defaults to 0 and is a separate HTTP setting.
- Avoid: claiming 180 seconds or the `TransactionBuilder.setTimeout` value; claiming the constant is
  in seconds.
- Truth: domain real-world; status confirmed; as-of 2026-08-30.
- Corroboration:
  - B: https://github.com/stellar/js-stellar-sdk/blob/3839fd2ee0a2d3e89e0e73638aa103479733c9d2/src/rpc/server.ts#L64-L67
  - A (published package): https://cdn.jsdelivr.net/npm/@stellar/stellar-sdk@17.0.1/lib/rpc/server.js — `SUBMIT_TRANSACTION_TIMEOUT = 60 * 1000` (line 36, read 2026-08-30).
  - E (adjacency only): Raven `stellarDocs.search_docs` returned tutorials only.
- Siblings: `q-ti-tx-too-late-resubmit` covers tx time bounds, not this constant. No overlap.

#### rr-pos-rs-sdk-test-ledger-ttl
- Question: "When a soroban-sdk test calls `Env::default()`, what TTL values does the default
  `LedgerInfo` carry for `min_temp_entry_ttl`, `min_persistent_entry_ttl`, and `max_entry_ttl`?"
- Class: positive. Repo: `stellar/rs-soroban-sdk`.
- Initial operation: `stellarDocs.search_soroban_contract_docs`. Observed: the check-auth tutorial shows
  a hand-written `LedgerInfo` with `min_persistent_entry_ttl: 16` (adjacent and different from the SDK
  default).
- Expected order: Docs search (adjacent) → `scout.explainRepo` `{ repo: "stellar/rs-soroban-sdk" }` → answer.
- Grounded answer: `default_ledger_info()` in `soroban-sdk/src/testutils.rs` sets
  `min_temp_entry_ttl: 16`, `min_persistent_entry_ttl: 4096`, `max_entry_ttl: 6_312_000`. Tests change
  them through the `testutils::Ledger` setters. As of commit `8c716fd`.
- Key facts: (1) temp minimum 16; (2) persistent minimum 4096; (3) max 6,312,000; (4) setters
  `set_min_temp_entry_ttl`, `set_min_persistent_entry_ttl`, `set_max_entry_ttl`.
- Avoid: reporting 16 as the persistent default (that is a tutorial override); gating on
  `protocol_version` (volatile: 28 at the pin, 25 in DeepWiki).
- Truth: domain real-world; status confirmed; as-of 2026-08-30.
- Corroboration:
  - B: https://github.com/stellar/rs-soroban-sdk/blob/8c716fd1dda28cc0e1d59f4c8a40e292b4b7167b/soroban-sdk/src/testutils.rs#L298-L309
  - D: DeepWiki `stellar/rs-soroban-sdk` (2026-08-30) returned 16 / 4096 / 6,312,000 (its `protocol_version` 25 is stale versus the pinned 28).
  - A (adjacent): https://developers.stellar.org/docs/build/guides/auth/check-auth-tutorials#complete-code — tutorial `LedgerInfo` uses 16 for persistent.
- Siblings: `q-sor-ttl-defaults-extend` covers network TTL rules, not the test-environment defaults. `q-soroban-unit-testing` does not name these values. No overlap.

#### rr-pos-env-depth-limits
- Question: "What recursion and size limits does soroban-env-host apply by default for XDR read/write
  and for host depth, and which constants hold them?"
- Class: positive. Repo: `stellar/rs-soroban-env`.
- Initial operation: `stellarDocs.search_soroban_contract_docs`. Observed: software-versions page names
  "DepthLimiter" only (adjacent); no values.
- Expected order: Docs search (adjacent) → `scout.explainRepo` `{ repo: "stellar/rs-soroban-env" }` → answer.
- Grounded answer: `DEFAULT_XDR_RW_LIMITS` is `depth: 500`, `len: 32 * 1024 * 1024` (32 MiB);
  `DEFAULT_HOST_DEPTH_LIMIT` is 100, set lower than the XDR depth on purpose. Both live in
  `soroban-env-host/src/budget/limits.rs`. As of commit `a97c6ff`.
- Key facts: (1) XDR depth 500; (2) XDR len 32 MiB; (3) host depth 100; (4) host limit is
  intentionally below the XDR limit.
- Avoid: swapping the two depth values; claiming the 32 MiB is a deserialization input bound (the
  source says use the input buffer size for deserialization).
- Truth: domain real-world; status confirmed; as-of 2026-08-30.
- Corroboration:
  - B: https://github.com/stellar/rs-soroban-env/blob/a97c6ffecbedd6dba74807276a5115ad86b5396f/soroban-env-host/src/budget/limits.rs#L12-L41
  - A (published crate docs): https://docs.rs/soroban-env-host/latest/soroban_env_host/budget/constant.DEFAULT_HOST_DEPTH_LIMIT.html — `pub const DEFAULT_HOST_DEPTH_LIMIT: u32 = 100;`
  - D: DeepWiki `stellar/rs-soroban-env` (2026-08-30) returned 500 / 32 MB / 100.
- Siblings: none match `DEPTH_LIMIT`. `q-soroban-resource-limits` covers network resource limits, not these constants. No overlap.

#### rr-pos-passkey-kit-tx-timeout
- Question: "What default transaction timeout does `PasskeyKit` use when `timeoutInSeconds` is not
  passed, and why that value?"
- Class: positive. Repo: `kalepail/passkey-kit`.
- Initial operation: `stellarDocs.search_wallet_dapp_docs`. Observed: guestbook tutorial constructs
  `new PasskeyKit({...})` without a timeout (adjacent); `timeoutInSeconds` absent from Docs.
- Expected order: Docs search (adjacent) → `scout.explainRepo` `{ repo: "kalepail/passkey-kit" }` → answer.
- Grounded answer: `DEFAULT_TIMEOUT_SECONDS = 30` in `src/constants.ts`; `kit.ts` applies
  `config.timeoutInSeconds ?? DEFAULT_TIMEOUT_SECONDS`. The comment ties 30 s to the OpenZeppelin
  Relayer's <= 30 s time-bound. `WEBAUTHN_TIMEOUT_MS = 60_000` is a separate ceremony timeout.
  As of commit `3095374` (npm 0.16.5 carries the same constants).
- Key facts: (1) default 30 seconds; (2) option name `timeoutInSeconds`; (3) constant
  `DEFAULT_TIMEOUT_SECONDS`; (4) the WebAuthn ceremony timeout is 60,000 ms and is distinct.
- Avoid: reporting 60 seconds as the transaction timeout; claiming Docs state the default.
- Truth: domain real-world; status confirmed; as-of 2026-08-30.
- Corroboration:
  - B: https://github.com/kalepail/passkey-kit/blob/309537474f689a7948c729a7bab0d1388f509422/src/constants.ts#L87 and `#L49`; https://github.com/kalepail/passkey-kit/blob/309537474f689a7948c729a7bab0d1388f509422/src/kit.ts#L74 and `#L146`
  - A (published package): https://cdn.jsdelivr.net/npm/passkey-kit@0.16.5/dist/constants.js — same "Default transaction timeout" block and `WEBAUTHN_TIMEOUT_MS = 60_000`.
  - A (adjacent): https://developers.stellar.org/docs/build/apps/guestbook/setup-passkeys#passkey-client
- Siblings: `q-tool-passkeykit-smart-wallet`, `q-passkey-smart-account-architecture` cover architecture, not this default. No overlap.

#### rr-pos-cli-config-home-env
- Question: "Which environment variable makes the Stellar CLI use a custom global config directory
  ahead of `$XDG_CONFIG_HOME`, and how does the CLI find a local project config directory?"
- Class: positive. Repo: `stellar/stellar-cli`.
- Initial operation: `stellarDocs.search_sdk_cli_tools_docs`. Observed: the CLI manual prints only
  "By default, it uses $XDG_CONFIG_HOME/stellar if set, falling back to ~/.config/stellar" (adjacent);
  `STELLAR_CONFIG_HOME` has 0 hits on `docs/tools/cli/stellar-cli`.
- Expected order: Docs search (adjacent) → `scout.explainRepo` `{ repo: "stellar/stellar-cli" }` → answer.
- Grounded answer: `global_config_path()` returns `STELLAR_CONFIG_HOME` first, then
  `$XDG_CONFIG_HOME/stellar`, then `~/.config/stellar`. Local config comes from
  `utils::find_config_dir`, which walks from the current directory upward for a `.stellar` (or legacy
  `.soroban`) directory and falls back to `./.stellar`. As of commit `0cc28fc`.
- Key facts: (1) `STELLAR_CONFIG_HOME` wins over `XDG_CONFIG_HOME`; (2) local lookup walks ancestor
  directories for `.stellar`; (3) fallback is `<cwd>/.stellar`; (4) `--config-dir` overrides the global path.
- Avoid: claiming `XDG_CONFIG_HOME` is the only override; claiming local config is never used.
- Truth: domain real-world; status confirmed; as-of 2026-08-30.
- Corroboration:
  - B: https://github.com/stellar/stellar-cli/blob/0cc28fcb61d2746536a92b795f270b2d5d3d506e/cmd/soroban-cli/src/config/locator.rs#L937-L949 and `#L187`; https://github.com/stellar/stellar-cli/blob/0cc28fcb61d2746536a92b795f270b2d5d3d506e/cmd/soroban-cli/src/utils.rs#L127-L139
  - F: local `stellar 27.1.0`: `STELLAR_CONFIG_HOME=<tmp> stellar keys generate blindtest --network testnet` wrote `<tmp>/identity/blindtest.toml` (2026-08-30).
  - A (adjacent): https://developers.stellar.org/docs/tools/cli/stellar-cli#global-options
- Siblings: `q-tool-cli-testnet-identity-howto`, `q-ti-cli-rust-windows-troubleshooting` do not name config-dir resolution. No overlap.

#### rr-pos-cli-stellar-soroban-dir-precedence
- Question: "If both a `.stellar` and a legacy `.soroban` config directory exist at the same path,
  which one does the Stellar CLI use, and what does it print?"
- Class: positive. Repo: `stellar/stellar-cli`.
- Initial operation: `stellarDocs.search_sdk_cli_tools_docs`. Observed: no Docs page names
  `.soroban` precedence (adjacent manual only).
- Expected order: Docs search (adjacent) → `scout.explainRepo` `{ repo: "stellar/stellar-cli" }` → answer.
- Grounded answer: the CLI prefers `.stellar` and logs a WARN "the .stellar and .soroban config
  directories exist at path …, using the .stellar". This applies to both the global path
  (`locator.rs`) and the ancestor walk (`utils.rs`). As of commit `0cc28fc`.
- Key facts: (1) `.stellar` wins; (2) a WARN log names both directories; (3) the rule exists in both
  global and local resolution; (4) `.soroban` remains a legacy fallback when `.stellar` is absent.
- Avoid: claiming `.soroban` wins or that the CLI errors out.
- Truth: domain real-world; status confirmed; as-of 2026-08-30.
- Corroboration:
  - B: https://github.com/stellar/stellar-cli/blob/0cc28fcb61d2746536a92b795f270b2d5d3d506e/cmd/soroban-cli/src/config/locator.rs#L951-L962; https://github.com/stellar/stellar-cli/blob/0cc28fcb61d2746536a92b795f270b2d5d3d506e/cmd/soroban-cli/src/utils.rs#L129-L139
  - F: local `stellar 27.1.0` with `XDG_CONFIG_HOME=<tmp>` holding both dirs printed
    `WARN soroban_cli::config::locator: the .stellar and .soroban config directories exist at path "<tmp>", using the .stellar` (2026-08-30).
- Siblings: none. Shares a repo with `rr-pos-cli-config-home-env`; the facts are disjoint.

#### rr-pos-quickstart-action-inputs
- Question: "Which inputs does the `stellar/quickstart` GitHub Action accept, and what are the
  defaults for `enable` and `health_retries`?"
- Class: positive. Repo: `stellar/quickstart`.
- Initial operation: `stellarDocs.search_sdk_cli_tools_docs`. Observed: quickstart Docs pages describe
  the Docker image; `health_retries` and `uses: stellar/quickstart` have 0 hits on `docs/tools/quickstart`.
- Expected order: Docs search (adjacent) → `scout.explainRepo` `{ repo: "stellar/quickstart" }` → answer.
- Grounded answer: `action.yml` inputs are `tag` ("latest"), `artifact` (""), `image` (""), `enable`
  ("core,horizon,rpc"), `network` ("local"), `protocol_version` (""), `core_log_level` (""),
  `enable_logs` ("true"), `health_interval` ("10"), `health_timeout` ("5"), `health_retries` ("50").
  As of commit `98e7824`.
- Key facts: (1) `enable` default "core,horizon,rpc"; (2) `health_retries` default "50"; (3)
  `network` default "local"; (4) inputs are defined in `action.yml`; (5) `lab` is not in the action's
  default enable list even though the image README lists it.
- Avoid: reporting the Docker `--enable` default "core,horizon,rpc,lab" as the action default; claiming
  a Docs page lists the action inputs.
- Truth: domain real-world; status confirmed; as-of 2026-08-30.
- Corroboration:
  - B: https://github.com/stellar/quickstart/blob/98e7824610f1f3fef36a5fe1e03682d778a4a1f3/action.yml#L4-L37
  - B (repo docs): https://github.com/stellar/quickstart/blob/98e7824610f1f3fef36a5fe1e03682d778a4a1f3/README.md#L317-L337
  - D: DeepWiki `stellar/quickstart` (2026-08-30) listed the same eleven inputs and defaults.
  - A/E (adjacency only): https://developers.stellar.org/docs/tools/quickstart — no action inputs.
- Siblings: `q-infra-quickstart-local-network`, `q-quickstart-manual-ledger-close` cover the image, not the action. No overlap.

#### rr-pos-horizon-max-path-length
- Question: "What is Horizon's default `max-path-length` for the `/paths` endpoint, and how does it
  relate to the protocol's path limit?"
- Class: positive. Repo: `stellar/stellar-horizon`.
- Initial operation: `stellarDocs.search_rpc_horizon_data_docs`. Observed: Docs say "Stellar only
  considers paths of length 5 or shorter" (protocol limit, adjacent); `MAX_PATH_LENGTH` has 0 hits on
  the Horizon configuring page.
- Expected order: Docs search (adjacent) → `scout.explainRepo` `{ repo: "stellar/stellar-horizon" }` → answer.
- Grounded answer: `internal/flags.go` defines `max-path-length` with `FlagDefault: uint(3)`; it caps
  the number of assets on a `/paths` result and raising it slows responses. The protocol path limit of
  5 is a separate bound. Horizon now lives in `stellar/stellar-horizon`; `stellar/go` is archived.
  As of commit `2abda01`.
- Key facts: (1) default 3; (2) flag `max-path-length`, config `MaxPathLength`; (3) applies to
  `/paths` API commands; (4) the protocol limit 5 is distinct; (5) repo is `stellar/stellar-horizon`.
- Avoid: reporting 5 as the Horizon default; pinning `stellar/go` as the live Horizon repo.
- Truth: domain real-world; status confirmed; as-of 2026-08-30.
- Corroboration:
  - B: https://github.com/stellar/stellar-horizon/blob/2abda012313e162d822fda44076893054a3b27a2/internal/flags.go#L522-L528
  - D: DeepWiki `stellar/stellar-horizon` (2026-08-30) returned default 3.
  - A (adjacent): https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes/operation-specific/path-payment-strict-receive — "paths of length 5 or shorter".
  - B (repo status): GitHub API `stellar/go` `archived: true` (2026-08-30).
- Siblings: `q-asset-path-payment-ops` covers path payments, not this flag. No overlap.

#### rr-pos-horizon-max-supported-protocol
- Question: "Which constant in Horizon ingestion pins the highest supported protocol version, and what
  is its current value?"
- Class: positive. Repo: `stellar/stellar-horizon`. Freshness-sensitive.
- Initial operation: `stellarDocs.search_rpc_horizon_data_docs`. Observed: ingestion admin pages only
  (adjacent); the constant is absent.
- Expected order: Docs search (adjacent) → `scout.explainRepo` `{ repo: "stellar/stellar-horizon" }` → answer.
- Grounded answer: `internal/ingest/main.go` declares `MaxSupportedProtocolVersion uint32 = 28`, checked
  by `checkIfProtocolVersionSupported` and exported as a Prometheus gauge. Live
  `horizon.stellar.org` reports `supported_protocol_version: 28` and `current_protocol_version: 27`.
  As of 2026-08-30 at commit `2abda01`.
- Key facts: (1) name `MaxSupportedProtocolVersion`; (2) value 28 as of 2026-08-30; (3) file
  `internal/ingest/main.go`; (4) the answer must carry an as-of date.
- Avoid: reporting 25 (stale DeepWiki value) without dating; claiming current network protocol equals
  the supported maximum.
- Truth: domain real-world; status confirmed-as-of; as-of 2026-08-30; reverify 2026-11-30.
- Corroboration:
  - B: https://github.com/stellar/stellar-horizon/blob/2abda012313e162d822fda44076893054a3b27a2/internal/ingest/main.go#L36-L38
  - C: `curl https://horizon.stellar.org/` (2026-08-30) → `horizon_version 28.0.1`, `supported_protocol_version 28`, `current_protocol_version 27`.
  - D: DeepWiki `stellar/stellar-horizon` (2026-08-30) said 25 — stale versus B and C; recorded as a conflict resolved by primary sources.
- Siblings: `q-edge-fresh-latest-protocol-version` asks the live network version, not this constant. `q-infra-horizon-vs-rpc` does not name it. No overlap.

#### rr-pos-go-sdk-horizon-timeout
- Question: "What default request timeout does the Go SDK `horizonclient` use, and what is the variable
  called?"
- Class: positive. Repo: `stellar/go-stellar-sdk`.
- Initial operation: `stellarDocs.search_sdk_cli_tools_docs`. Observed: Docs name the
  `github.com/stellar/go-stellar-sdk` module for ingestion (adjacent); no timeout value.
- Expected order: Docs search (adjacent) → `scout.explainRepo` `{ repo: "stellar/go-stellar-sdk" }` → answer.
- Grounded answer: `clients/horizonclient/main.go` sets `HorizonTimeout = 60 * time.Second`;
  `Client.SetHorizonTimeout` changes it per client. The module is `stellar/go-stellar-sdk`
  (`stellar/go` is archived). As of commit `5ee91ba`.
- Key facts: (1) variable `HorizonTimeout`; (2) value 60 seconds; (3) package `clients/horizonclient`;
  (4) setter `SetHorizonTimeout`.
- Avoid: pinning `stellar/go` as the live module; reporting the value in nanoseconds as a different number.
- Truth: domain real-world; status confirmed; as-of 2026-08-30.
- Corroboration:
  - B: https://github.com/stellar/go-stellar-sdk/blob/5ee91ba60a828723ab8cad45067612420161ea4d/clients/horizonclient/main.go#L96-L97
  - A (published docs): https://pkg.go.dev/github.com/stellar/go-stellar-sdk/clients/horizonclient — `HorizonTimeout = 60 * time.Second` and `Client.SetHorizonTimeout`.
  - A (adjacent): https://developers.stellar.org/docs/build/apps/ingest-sdk/overview — names the module only.
- Siblings: `q-tool-go-sdk-ingest`, `q-tool-which-sdk-comparison` reference the module, not this value. No overlap.

### Negative detour controls (8)

#### rr-neg-release-profile
- Question: "Which `[profile.release]` settings does the official Hello World contract template use?"
- Class: negative. Repo: none needed (tempting detour: `stellar/soroban-examples` or `stellar/stellar-cli`).
- Initial operation: `stellarDocs.search_soroban_contract_docs`, then `stellarDocs.get_doc_page_sections` on the Hello World page.
- Expected order: Docs search → answer. No `scout.explainRepo`.
- Grounded answer: `opt-level = "z"`, `overflow-checks = true`, `debug = 0`, `strip = "symbols"`,
  `debug-assertions = false`, `panic = "abort"`, `codegen-units = 1`, `lto = true`; a
  `release-with-logs` profile inherits `release` with `debug-assertions = true`.
- Key facts: (1) `opt-level = "z"`; (2) `overflow-checks = true`; (3) `panic = "abort"`; (4) `lto = true`; (5) `release-with-logs` sets `debug-assertions = true`.
- Avoid: calling `scout.explainRepo` before Docs; claiming `opt-level = 3`.
- Truth: real-world; confirmed; as-of 2026-08-30.
- Corroboration: A https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world (grep 2026-08-30, all eight keys present); A https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment#writing-a-smart-contract (same profile); E Raven Docs search hit both pages.
- Siblings: `q-sor-build-target-wasm32v1` (target, not profile), `q-soroban-wasm-size-limit`. Adjacent, not overlapping.

#### rr-neg-quickstart-diagnostic-flag
- Question: "How do I turn on Soroban diagnostic events in the quickstart container?"
- Class: negative (looks like a repo flag). Tempting detour: `stellar/quickstart`.
- Initial operation: `stellarDocs.search_sdk_cli_tools_docs`.
- Expected order: Docs search → answer. No `scout.explainRepo`.
- Grounded answer: pass `--enable-soroban-diagnostic-events` when starting the container. In local
  mode diagnostics are on by default and can be turned off with the matching disable flag. Core's
  config key is `ENABLE_SOROBAN_DIAGNOSTIC_EVENTS=true`.
- Key facts: (1) flag `--enable-soroban-diagnostic-events`; (2) local mode enables by default; (3) core key `ENABLE_SOROBAN_DIAGNOSTIC_EVENTS`.
- Avoid: repo detour before Docs; claiming the flag must be set inside a core cfg file only.
- Truth: real-world; confirmed; as-of 2026-08-30.
- Corroboration: A https://developers.stellar.org/docs/tools/quickstart/debugging/diagnostic-events (grep 2026-08-30); A https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/events#what-are-diagnosticevents; E Raven Docs search top hit.
- Siblings: `q-soroban-publish-events`, `q-sor-decode-hosterror-codes` mention diagnostic events in other contexts. Not overlapping.

#### rr-neg-testnet-endpoints
- Question: "What are the official SDF testnet RPC, Horizon, and Friendbot URLs, and the testnet passphrase?"
- Class: negative. Tempting detour: `stellar/js-stellar-sdk` `Networks` constants.
- Initial operation: `skills.stellar-dev.data#network-configuration` (skill), then `stellarDocs.search_rpc_horizon_data_docs`.
- Expected order: skill read → Docs corroboration → answer. No `scout.explainRepo`.
- Grounded answer: RPC `https://soroban-testnet.stellar.org`, Horizon
  `https://horizon-testnet.stellar.org`, Friendbot `https://friendbot.stellar.org`, passphrase
  "Test SDF Network ; September 2015" (`Networks.TESTNET`).
- Key facts: (1) RPC URL; (2) Horizon URL; (3) Friendbot URL; (4) passphrase text.
- Avoid: repo detour before Docs or skill; giving the futurenet RPC `https://rpc-futurenet.stellar.org` as testnet.
- Truth: real-world; confirmed; as-of 2026-08-30.
- Corroboration: A https://developers.stellar.org/docs/data/apis/api-providers (testnet RPC line, grep 2026-08-30); skill `skills.stellar-dev.data#network-configuration` read through Raven 2026-08-30 (all four values); E Raven Docs search returned tutorials with the RPC URL and passphrase.
- Siblings: `q-protocol-network-passphrases-list` (passphrases), `q-infra-testnet-vs-futurenet`. Partial topical overlap on the passphrase; the URL set is not covered.

#### rr-neg-core-validators-fields
- Question: "Which fields does a `[[VALIDATORS]]` table in a stellar-core config accept?"
- Class: negative (looks like a repo config key). Tempting detour: `stellar/stellar-core`.
- Initial operation: `stellarDocs.search_protocol_concepts_docs` or `stellarDocs.search_docs`.
- Expected order: Docs search → answer. No `scout.explainRepo`.
- Grounded answer: `NAME`, `QUALITY` (required unless set in `[[HOME_DOMAINS]]`: HIGH, MEDIUM, LOW),
  `HOME_DOMAIN`, `PUBLIC_KEY`, `ADDRESS` (optional), `HISTORY` (optional).
- Key facts: (1) six fields as listed; (2) `QUALITY` inherits from `[[HOME_DOMAINS]]`; (3) `ADDRESS` and `HISTORY` are optional.
- Avoid: repo detour before Docs; confusing this with SEP-1 `stellar.toml` `[[VALIDATORS]]` fields (`ALIAS`, `DISPLAY_NAME`, `HOST`).
- Truth: real-world; confirmed; as-of 2026-08-30.
- Corroboration: A https://developers.stellar.org/docs/validators/admin-guide/configuring#validators-array (field table, grep 2026-08-30); E Raven Docs search top hit; B (secondary, not needed) https://github.com/stellar/stellar-core/blob/0752b5176d22c8d57ed562c93038f76ab97e8285/docs/stellar-core_example.cfg.
- Siblings: `q-protocol-validator-node-roles`, `q-protocol-quorum-slice-vs-quorum`, `q-protocol-tier1-requirements`. Adjacent, not overlapping.

#### rr-neg-getevents-filter-limits
- Question: "What limits apply to `filters`, `contractIds`, and `topics` in a stellar-rpc `getEvents`
  request, and how do I match any value in a topic position?"
- Class: negative (limits look like code constants). Tempting detour: `stellar/stellar-rpc`.
- Initial operation: `stellarDocs.search_rpc_horizon_data_docs`.
- Expected order: Docs search → answer. No `scout.explainRepo`.
- Grounded answer: at most 5 filters per request, at most 5 contract IDs per filter, each topic
  filter is an array of one to four `SegmentMatcher` elements, and `"*"` matches any value in a
  topic position.
- Key facts: (1) max 5 filters; (2) max 5 contract IDs; (3) 1–4 segment matchers; (4) `*` wildcard.
- Avoid: repo detour before Docs; claiming unlimited filters.
- Truth: real-world; confirmed; as-of 2026-08-30.
- Corroboration: A https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getEvents (grep 2026-08-30: "Maximum 5 filters", "Maximum 5 contract IDs", "one to four SegmentMatcher"); A https://developers.stellar.org/docs/build/guides/transactions/send-and-receive-payments#summary ("*" wildcard); E Raven Docs search hit the guide.
- Siblings: `q-soroban-publish-events`, `q-soroban-event-indexing-design` discuss events, not these request limits. Not overlapping.

#### rr-neg-sdp-max-base-fee
- Question: "What is the default `MAX_BASE_FEE` for the Stellar Disbursement Platform, and what does it control?"
- Class: negative (an env key that Docs print). Tempting detour: `stellar/stellar-disbursement-platform-backend`.
- Initial operation: `stellarDocs.search_docs` (platform docs) or `stellarDocs.search_anchor_sep_docs`.
- Expected order: Docs search → answer. No `scout.explainRepo`.
- Grounded answer: default 10000 stroops; it is the maximum base fee SDP uses when submitting Stellar transactions.
- Key facts: (1) default 10000; (2) it caps the base fee of submitted transactions.
- Avoid: repo detour before Docs; reporting 100 (the network minimum).
- Truth: real-world; confirmed; as-of 2026-08-30.
- Corroboration: A https://developers.stellar.org/docs/platforms/stellar-disbursement-platform/admin-guide/configuring-sdp ("MAX_BASE_FEE … Default: 10000", grep 2026-08-30); B (secondary) https://github.com/stellar/stellar-disbursement-platform-backend/blob/1a1051f956d8799b8ed89f26dee8fdd54429f514/cmd/utils/shared_config_options.go#L221-L228 `FlagDefault: 100 * txnbuild.MinBaseFee` with `MinBaseFee = 100` in `go-stellar-sdk` v0.7.2.
- Siblings: `q-anchor-sdp-what`, `q-crp-sdp-operation`, `q-pay-sdp-disbursement`. Adjacent, not overlapping.

#### rr-neg-rpc-max-events-limit
- Question: "What is the largest number of events one stellar-rpc `getEvents` response can return by default, and which config key sets it?"
- Class: negative (a config key that Docs print). Tempting detour: `stellar/stellar-rpc`.
- Initial operation: `stellarDocs.search_rpc_horizon_data_docs`.
- Expected order: Docs search → answer. No `scout.explainRepo`.
- Grounded answer: `MAX_EVENTS_LIMIT = 10000`; the default page size is `DEFAULT_EVENTS_LIMIT = 100`.
- Key facts: (1) `MAX_EVENTS_LIMIT` 10000; (2) `DEFAULT_EVENTS_LIMIT` 100.
- Avoid: repo detour before Docs; reporting 1000 (that is `REQUEST_BACKLOG_GET_EVENTS_QUEUE_LIMIT`).
- Truth: real-world; confirmed; as-of 2026-08-30.
- Corroboration: A https://developers.stellar.org/docs/data/apis/rpc/admin-guide/configuring (grep 2026-08-30: `MAX_EVENTS_LIMIT = 10000`, `DEFAULT_EVENTS_LIMIT = 100`); E Raven Docs search top hit; B (secondary) https://github.com/stellar/stellar-rpc/blob/9c13d418978631e702d1687490f2a1110af48a22/cmd/stellar-rpc/internal/config/options.go#L338-L348.
- Siblings: `q-infra-rpc-methods-list`, `q-ti-rpc-gettransactions-pagination-xdr`. Not overlapping.

#### rr-neg-contract-optimize-deprecated
- Question: "Is `stellar contract optimize` still the way to shrink a contract Wasm?"
- Class: negative. Tempting detour: `stellar/stellar-cli`.
- Initial operation: `stellarDocs.search_sdk_cli_tools_docs`.
- Expected order: Docs search → answer. No `scout.explainRepo`.
- Grounded answer: no. The CLI manual marks `stellar contract optimize` as deprecated in favor of
  `stellar contract build --optimize`, and `stellar contract build` already optimizes the `.wasm` by default.
- Key facts: (1) `optimize` is deprecated; (2) replacement `build --optimize`; (3) build optimizes by default.
- Avoid: repo detour before Docs; telling users to run `optimize` as a required separate step.
- Truth: real-world; confirmed; as-of 2026-08-30.
- Corroboration: A https://developers.stellar.org/docs/tools/cli/stellar-cli#stellar-contract-optimize ("⚠️ Deprecated, use build --optimize"); A https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world#optimizing-builds; E Raven Docs search hit both; F local `stellar 27.1.0` is the same major line as the manual.
- Siblings: `q-soroban-wasm-size-limit` mentions optimize. Partial topical overlap; that case asks about size limits, not deprecation.

### Summary for the suite owner

- Positives: 12 across 10 repositories; every value was read at a pinned commit and corroborated by at
  least one class other than B (A published docs, C live Horizon, D DeepWiki or web, or F local run).
- Negatives: 8; each is answerable from a Docs page or a skill section verified on 2026-08-30, and each
  carries a repository that would tempt a premature `scout.explainRepo` call.
- Two DeepWiki answers were stale versus pinned source (`stellar-horizon` protocol 25 vs 28;
  `stellar-rpc` missing `MaxFeeStatsRetentionWindow`). Primary sources win; the conflicts are recorded.
- Volatile case: `rr-pos-horizon-max-supported-protocol` is `confirmed-as-of` with a reverify date.
- No QA battery file, suite file, or product file was edited. Only this ledger section was appended.

## Superseded pre-freeze adversarial suite review — Grok 4.6 high

This BLOCKING review applies to the superseded candidate suite above.
Every finding was reconciled before the current suite became frozen.

- Reviewer: Grok 4.6, high. Independent of the suite author (Claude Fable 5 high) and of the round author (Codex GPT-5.6 Sol).
- Authored: 2026-08-30.
- Blindness: this review checked `AGENTS.md`, `.agents/skills/golden-truth/SKILL.md`, `eval/repo-recovery/cases.json`, and `catalog/manifest.json` first. It did not open retrieval profiles, product recovery code, scores, or this ledger until after independent checks. Manifest IDs were used only to confirm exposed operations.
- Method: re-derive every case from free, read-only sources. GitHub pinned blobs and headers (class B). Official Docs pages, docs.rs, pkg.go.dev, and published npm files (class A). Live `GET https://horizon.stellar.org/` (class C). Catalog skill file at commit `b78983c` (class E as a skill, not Algolia). Web search on `developers.stellar.org` (class D). No paid Lumenloop, Perplexity, Parallel, or `scout.explainRepo` call. Raven Docs search was unavailable (auth required) and was not used.
- Frozen file checked: `eval/repo-recovery/cases.json`, contract `repository-tooling-recovery-v1`. Count: 20 cases, 12 positive, 8 negative. Every `repository` field is `owner/name`. Every initial operation ID exists and is exposed in `catalog/manifest.json`. Every positive starts with a Docs search then `scout.explainRepo`. Every negative omits `scout.explainRepo` from `expectedOperationOrder`. Positive `initialEvidence.outcome` values are only `empty` or `adjacent` (six each). Negative outcomes are all `sufficient`.

### Findings

1. `rr-neg-testnet-endpoints` named authorities do not carry the pinned passphrase string. Material.
   - Frozen class A source `https://developers.stellar.org/docs/data/apis/api-providers` lists SDF testnet RPC only. It does not list Horizon, Friendbot, or the passphrase.
   - Named skill `skills.stellar-dev.data#network-configuration` at catalog commit `b78983c` lists the three URLs and `StellarSdk.Networks.TESTNET`. It does not print `Test SDF Network ; September 2015`.
   - The four values are true on `https://developers.stellar.org/docs/networks`. Frozen `expectedOperationOrder` is skill-only.
   - Exact correction: change class A `ref` to `https://developers.stellar.org/docs/networks`. Add a grader note that `StellarSdk.Networks.TESTNET` equals that passphrase, or add that Docs page to `expectedOperationOrder`. Do not keep api-providers as the page that "agrees" on all four values.

2. DeepWiki is labeled class D in four numeric positives. The golden-truth skill lists DeepWiki under class B. Affected IDs: `rr-pos-core-max-slots`, `rr-pos-rs-sdk-test-ledger-ttl`, `rr-pos-quickstart-action-inputs`, `rr-pos-horizon-max-path-length`. Exact correction: relabel those DeepWiki rows to class B. For any numeric case that then has only class B, add a true second class (published package, live probe, or official Docs adjacency that does not state the repository-only value).

3. `rr-pos-js-rpc-submit-timeout` class A URL is broken. `https://cdn.jsdelivr.net/npm/@stellar/stellar-sdk@17.0.1/lib/rpc/server.js` returned not found on 2026-08-30. The GitHub pin still exports `SUBMIT_TRANSACTION_TIMEOUT = 60 * 1000`. Exact correction: replace the jsDelivr path with a working published-package URL, or drop that A row and keep a working second class.

4. `rr-pos-horizon-max-supported-protocol` live field name. Live Horizon on 2026-08-30 reported `current_protocol_version: 27` and `core_supported_protocol_version: 28`. The frozen corroboration names `supported_protocol_version`. The golden value 28 as of 2026-08-30 is still true in `internal/ingest/main.go`. The avoid clause correctly separates live protocol 27 from supported maximum 28. Exact correction: name the live JSON field that was actually read.

5. Sibling overlap in `eval/qa/corpus` is topical, not contradictory. `q-soroban-wasm-size-limit` agrees that `stellar contract optimize` is deprecated. `q-ti-rpc-gettransactions-pagination-xdr` agrees `getEvents` 100/10000. `q-protocol-network-passphrases-list` agrees the testnet passphrase string. `q-edge-fresh-latest-protocol-version` asks live protocol, not `MaxSupportedProtocolVersion`. No ID collision. Lanes stay unmerged.

### Independently confirmed (no correction)

- All 12 positive numeric and config facts match the pinned repository blobs.
- Official Docs for those positives omit the repository-only value, or give only an adjacent default or protocol bound.
- Seven of eight negatives are fully answerable from the named Docs page: release profile, diagnostic-events flag, VALIDATORS fields, getEvents filter limits, SDP `MAX_BASE_FEE` default 10000, `MAX_EVENTS_LIMIT` 10000, and `stellar contract optimize` deprecation.
- `MAX_SLOTS_TO_REMEMBER = 12` is set in `Config.cpp`. `docs/stellar-core_example.cfg` says other nodes can join without catchup. The frozen "for peers" wording is acceptable.
- Horizon `max-path-length` default is 3. Official Docs state the separate protocol bound of 5.
- Passkey `DEFAULT_TIMEOUT_SECONDS` is 30 in source and in `passkey-kit@0.16.5`.
- CLI `STELLAR_CONFIG_HOME` wins over `XDG_CONFIG_HOME`. `.stellar` wins over `.soroban` and logs a warning.
- Quickstart Action has eleven inputs. `enable` defaults to `core,horizon,rpc`. `health_retries` defaults to 50.

### Verdict

**Reject.** Finding 1 makes a frozen negative claim a Docs-and-skill sufficiency it does not have. Fix `rr-neg-testnet-endpoints` before accepting the suite. Findings 2–4 are provenance defects. They do not make the other nineteen goldens false, but they should be corrected in the same pass. Do not edit `cases.json` in this review.

## Second valid collection and receipt implementation (2026-08-30)

The second valid `repository-recovery-collection-v1` collection used the frozen contract without
editing cases or goldens. It made 20 calls for `$3.5414198`. The reviewed result was 16/20 correct
and 20/20 grounded. The sequence gate result was 0/12 positives and 0/8 detours.

The evidence identities are:

- Canonical SHA-256: `53ef4426739eb1de24114dc59af87890ed56ac5a35019386ae3039e1dd97cc97`
- File SHA-256: `ddc53526b31bf9d2d7c09d61b0ab2014a089ee219f86d66b60de97cb393591e2`
- Annotation SHA-256: `0a359a87f3d34a57b3c8be1728c8021e87d96792582800ca5a74644bcfe7c894`
- Reviewed SHA-256: `a01c1e91e0b73ae457356c54324f9062f4507f3f7977ae11a44d401fae4dcc56`
- Packet SHA-256: `d26e2b8a6d20510faa3640f9e8629e64605c3dc468163a01cd29b4ad3a906192`
- Revision: `892d899ab8a6f1fd87d77ceaa31ce69e04a79392`
- Surface SHA-256: `e5306079db1a0b8535b1c64242d4d65eb5dfb5cf7e9fa4ecb5a8fa24d35675d9`

Prompt-only guidance failed to produce the required later-execute operation sequence. Receipt
implementation `a92ccf4` moved `scout.explainRepo` from ordinary ranking and raised the routing
totals to the accepted 209/280/312 legacy and 11/23/26 holdout floors in `eval/gates.json`.
The re-baseline passed `npm run eval:repo-recovery:lint`,
`npm run eval:repo-recovery -- --gate`, and `npm run eval:routing -- --gate`.
`eval/README.md` records the exact routing totals and the evidence trace.

Grok high reviewed `a92ccf4` and reported PASS. Fable high requested changes. The receipt gate
stays manifest-owned, host-enforced, one-use, and forward-only.

### Deviation (2026-08-30)

The pre-registered rule says: "It does not change ranking unless three qualifying positive misses
remain after recovery." It did not fire as written. The second collection had 0 of 12 sequence
passes, 16 of 20 correct answers, and prompt-only guidance failed the later-execute boundary.

Decision: user approval authorized removal from ranked membership and a host receipt for dispatch.
This deviation changes no frozen case or golden. `.agents/TODO.md` and `.agents/NEXT.md` block 4
still need owner reconciliation. This round did not edit either queue.

### Post-authority detour risk

The frozen contract does not flag a recovery detour after sufficient Docs evidence. Each qualifying
non-error Docs call can issue a receipt. Receipt consumption now emits privacy-bounded telemetry.
Observe the pre-registered 0–5% `scout.explainRepo` operation-share band after deployment.
This risk remains unmeasured. Frozen cases and goldens remain unchanged.

### Current verification

| Revision | Verification | Result | Review record |
| --- | --- | --- | --- |
| `ae00292` | typecheck, 101 unit files / 1,567 tests, 4 smoke files / 85 tests, build, both free recovery gates, routing gate, secrets scan, diff check | PASS | Grok high PASS: [`review-final-grok.md`](./2026-08-30-repository-tooling-recovery/review-final-grok.md). Prior repair: [`repair-terra.md`](./2026-08-30-repository-tooling-recovery/repair-terra.md). |
| `f33b755` | same free checks; manifest file SHA-256 `efd567d04ed0b00d27d0a664ab2d225d04362e657f1661ae7cfab330e89324d1` | Checks passed; final audit requested B1 and B2 repairs | Fable high: [`review-final-fable.md`](./2026-08-30-repository-tooling-recovery/review-final-fable.md). |
| `ca88ab9` | focused recovery tests: 4 files / 145 tests; typecheck; 101 unit files / 1,570 tests; 4 smoke files / 85 tests; build; catalog, micro-map, and super-spec generation; both free recovery gates; routing gate; secrets scan | PASS | Final repair: [`final-audit-repair-terra.md`](./2026-08-30-repository-tooling-recovery/final-audit-repair-terra.md). |
| `d37d749` | focused recovery tests: 7 files / 161 tests; both free recovery gates; independent digest and manifest SHA-256 checks; diff check | PASS | Grok 4.6 high PASS: [`collector-grok-final.md`](./2026-08-30-repository-tooling-recovery/collector-grok-final.md). |

## Third collection (2026-08-30)

The third collection is valid but fails the frozen live gate. It kept the frozen cases, digests,
grader, annotations, and receipt state algorithm unchanged.

- Collection revision: `d23766d`
- Surface SHA-256: `8a2232842f10d28f985881c93dbc1760e1aa15365be3f7162cf682e2e219769b`
- Canonical collection SHA-256: `88b70743cb1b74e7e40d7b1810799c86f47b48fb4295b34b62ff4111e865898c`
- Collection file SHA-256: `a325559c9f4d3eb47c1d4ceba2252e06700cfc41ce5a6d87f234ad3068a3b457`
- Packet SHA-256: `bd806eb8d2d018112cc22271e3bf27e1c6661079f04ddd3fd2e93186b01030b1`
- Canonical annotation SHA-256: `29ccb06c06f47417ad069bf6dde2c50294aabcf39b7749f24fd07b896363f6d1`
- Annotation file SHA-256: `aedbccf432352b7003cf94ad93ea86b6c5d6eb2208355faa7987bc42f35a5df4`
- Reviewed file SHA-256: `e3af5bc1386f2eb8533052546c68cc6308cc253be2d9abf8d025262903bc4704`
- Cost: `$6.5671102`; 20 calls; 0 retries
- Gate results: 0/12 positive passes; 0/8 premature detours; 13/20 correct; 19/20 grounded

The receipt handoff issued a capability without its callable manifest contract. It also retained a
stale repository identity cue, so models guessed arguments and pins or misplaced the receipt.

Repair revision: `4e2bb6bfa381f2e2ce83a0971268c377697a9368`. It renders the manifest description,
signature, and a single-receipt execute JSON input. The free recovery gate remains 12/12 eligible
with 0/8 risks. The refreshed manifest SHA-256 is
`6417a51391464e6de81ecbcd224de10b3d6acf55dc1c66a8a8a2430b7177a779`; routing totals remain
209/280/312 legacy, 16/23/23 skills, and 11/23/26 holdout with 11 forbidden captures.

The preserved diagnosis is [`sol-diagnosis-third-run.md`](./2026-08-30-repository-tooling-recovery/sol-diagnosis-third-run.md).
The approved plan is [`fable-plan-third-run.md`](./2026-08-30-repository-tooling-recovery/fable-plan-third-run.md).

## Contract-card final review (2026-08-30)

Grok 4.6 at high effort completed the independent final audit.
The reviewer differed from the Sol diagnosis, the Fable plan, and the Terra implementation.
The review used fixed point `014a4e7` and deeply checked `4e2bb6b` and `2b9a9c7`.
The reviewer reported PASS with no blocking defect.
The complete report is [`contract-card-review-grok.md`](./2026-08-30-repository-tooling-recovery/contract-card-review-grok.md).

Residual risks remain non-blocking:

- A later second recovery-only operation would receive the hard-coded `{ q, repo }` JSON example.
- The demo smoke test would miss a demo-only field swap.
- `test/policy.test.ts` checks hint text, while provider tests prove receipt consumption order.
- `scout.explainRepo` accepts extra properties, including `{ owner, name, q }`.
- The review did not re-score routing, run full tests, scan secrets, or run a paid collection.

The focused verification was:

```text
npx vitest run test/recovery-receipt.test.ts test/executor-providers.test.ts \
  test/policy.test.ts test/server.test.ts test/catalog.test.ts
# 5 files, 241 tests passed

npx vitest run --config test/smoke/vitest.config.ts \
  test/smoke/demo-tools.test.ts test/smoke/executor.test.ts
# 2 files, 61 tests passed

npm run typecheck
# exit 0

npm run eval:repo-recovery:lint
# PASS, frozen repository-tooling-recovery-v1

npm run eval:repo-recovery -- --gate
# pass true, 12/12 eligible, 0/8 risks

git diff --check 014a4e7..HEAD
# clean
```

Independent Node SHA-256 checks confirmed the recorded ledger identities.
The direct `recoveryReceiptBlock` render showed one receipt, valid JSON, and the identity note.

## Fourth collection and v2 measurement block (2026-08-30)

The fourth collection is valid and remains a v1 result.
The product and ranking stay unchanged in this block.
The full diagnosis is [`sol-diagnosis-fourth-run.md`](./2026-08-30-repository-tooling-recovery/sol-diagnosis-fourth-run.md).
The controlling plan is [`fable-plan-fourth-run.md`](./2026-08-30-repository-tooling-recovery/fable-plan-fourth-run.md).

### Fourth v1 collection identity

- Server and runner revision: `497181ca5b774e7639f663f9ee22d61facb749f1`.
- Surface SHA-256: `8a2232842f10d28f985881c93dbc1760e1aa15365be3f7162cf682e2e219769b`.
- Answering model: `claude-sonnet-5`.
- Answering binary: Claude Code `2.1.251`, SHA-256 `625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5`.
- Collection window: `2026-08-30T23:43:05.685Z` through `2026-08-30T23:53:17.043Z`.
- Cost: `$4.263449`, 20 calls, zero retries, and zero missing costs.
- Docs readiness: ready, comparable `true`, and complete `true`.
- Canonical collection SHA-256: `8800785288fa185a2c392acc2608f781ee49d5c060ea59a7f6561aedd887a565`.
- Canonical annotation SHA-256: `9c0a817a9e513733f626258a83807ef7e13a5419ae60f831aef0e3fac1c307e0`.

The four local v1 artifacts now have these exact paths and file SHA-256 values:

- `eval/repo-recovery/results/repository-tooling-recovery-v1-fourth-label-equality-failed-collection.json`: `7b7c1cb69eb044060f78b595f6f8616da37c572a3fbfefadb420ea8e510ddbc6`.
- `eval/repo-recovery/results/repository-tooling-recovery-v1-fourth-label-equality-failed-review-packet.json`: `965ccc0f61e9ffe5ff97f73e726e452cda0bd7f8a49c0ac4df70f6793f3191d0`.
- `eval/repo-recovery/results/repository-tooling-recovery-v1-fourth-label-equality-failed-annotations.json`: `8d0e025b22f38b8a978f67c7fc9ab843c1619246b33f2bb248b3796b43803087`.
- `eval/repo-recovery/results/repository-tooling-recovery-v1-fourth-label-equality-failed-reviewed.json`: `27f653f930afe0fa3196ca0cd2232b51963c2599b9788c1ccd0458708f688ade`.

The reviewer was Herdr agent `repo_recovery_live_fable`.
It used `claude-fable-5` at high effort and was independent.
The annotations recorded `reviewedAt: 2026-08-30T23:58:17Z`.
The Sol collector author, the Terra implementation lanes, the Grok reviewers, and the answering model differed from this reviewer.

### Fourth v1 result

The v1 grade was 3 of 12 positives, with 10 required.
It had zero of eight premature detours and zero projection errors.
Review integrity passed.
Answers were 15 of 20 correct and 17 of 20 grounded.
The preserved Fable plan contains the earlier 15 of 20 grounded transcription error.
The fourth annotations are the controlling record for this aggregate.

Four positives failed only the `empty` versus `adjacent` label equality.
Three positives omitted their required thematic Docs operation.
One positive had an answer error.
One positive had label inequality and a stale upstream answer.

The diagnostic v2 regrade of the stored fourth trace is 7 of 12 positives.
It remains below the unchanged threshold of 10.
The diagnostic does not promote or rejoin the v1 artifact.

The final Grok review is [`review-v2-grok.md`](./2026-08-30-repository-tooling-recovery/review-v2-grok.md).
It requested the grounded-count correction.

The ranking trigger was not met.
The three remaining source-selection misses already ranked the required thematic Docs operation first or second.
The fourth trace does not justify a ranking or receipt change.

`rr-pos-horizon-max-supported-protocol` exposed a Scout freshness defect.
The verified upstream finding is [`sls-080-explain-repo-deepwiki-answer-freshness.md`](../../improvements/stellar-light-scout/sls-080-explain-repo-deepwiki-answer-freshness.md).

### v2 decision

`repository-tooling-recovery-v2` accepts a blind `empty` or `adjacent` label for every positive.
It preserves the required operation, repository, order, count, answer checks, and thresholds.
It removes the per-case outcome label from the suite and review packet inputs.
The decision record is [`ADR-0010`](../../research/decisions/0010-repository-recovery-contract-v2.md).

### v2 verification

| Command | Result |
| --- | --- |
| `npx vitest run test/repo-recovery.test.mjs test/repo-recovery-artifact.test.mjs test/repo-recovery-collector.test.mjs test/repo-recovery-cost.test.mjs` | PASS, 35 tests |
| `npm run eval:repo-recovery:lint` | PASS, 12 positive, 8 negative, v2 |
| `npm run eval:repo-recovery -- --gate` | PASS, 12 of 12 eligible for both trigger outcomes, 0 of 8 risks |
| `npm run improvements:index` and `npm run improvements:lint` | PASS, 68 findings |
| `npm run typecheck` | PASS |
| `npm test` | PASS, 101 files and 1,578 tests |
| `npm run build` | PASS |
| `npm run eval:routing -- --gate` | PASS; all committed routing gate totals held |
| `npm run secrets:scan -- --tree` | PASS, no leaks |
| `git diff --check` | PASS |

The change did not touch `src/executor` or `src/demo`.
The smoke suite was not required for this measurement-only block.

### v2 reconciliation

The final independent review is [`review-v2-grok.md`](./2026-08-30-repository-tooling-recovery/review-v2-grok.md).
Grok 4.6 reviewed commit `d451ca4` at high effort and requested changes.
The review recorded B1: the fourth-run grounded aggregate was 17 of 20, not 15 of 20.
The reviewer was independent of the Terra author, Sol, Fable, and the answering model.

Commit `d5f1721` reconciled B1.
It also reconciled the non-blocking identity, fixture, test, and ADR notes.

The direct fourth annotations record 15 of 20 correct and 17 of 20 grounded answers.
The earlier 15 of 20 grounded value was a transcription error.
`rr-pos-cli-config-home-env` and `rr-pos-horizon-max-supported-protocol` are incorrect but grounded.
The three ungrounded rows are `rr-pos-go-sdk-query-enums`, `rr-pos-js-rpc-durability-values`, and `rr-pos-js-rpc-insecure-http-guard`.

The grade CLI now fails with exit status 1 when reviewed identity is invalid.
It reports identity and review reasons without positive-pass aggregates.
The focused grade test covers this boundary.
Collector fixtures now use v2 and omit expected evidence outcomes.

The follow-up review is [`review-v2-follow-up-grok.md`](./2026-08-30-repository-tooling-recovery/review-v2-follow-up-grok.md).
It requested only this report-attribution correction.

### Record-only review

Grok 4.6 reviewed commit `657f741` at high effort.
The review scope was the record-only reconciliation.
It reported PASS.
The complete report is [`review-v2-record-pass-grok.md`](./2026-08-30-repository-tooling-recovery/review-v2-record-pass-grok.md).

The original and follow-up CHANGES-REQUESTED reports remain controlling historical evidence.

## Fifth collection, v2 (2026-08-31)

### Identity and artifacts

- Contract: `repository-tooling-recovery-v2`.
- Revision: `8195f2c6020ccd3352e6760e85bbaf5e50ffc0f2`.
- Surface SHA-256: `8a2232842f10d28f985881c93dbc1760e1aa15365be3f7162cf682e2e219769b`.
- Answering model: `claude-sonnet-5`.
- Answering binary SHA-256: `625869b01e0050f260b2980fac248fd9cef9e462612bded4ec9d3d49ff8969a5`.
- Prompt SHA-256: `3f29c317b416ce00b7cc16f8cb15465053b46d37ae29e46841a5642f6ecfc5d6`.
- Collection window: `2026-08-31T00:44:40.313Z` through `2026-08-31T00:56:44.235Z`.
- Canonical collection SHA-256: `da4a4e245b05c737023d6e858e8b8866b00375649b0a90b2be0a1b68da6424da`.
- Reviewer: `repo_recovery_v2_live_fable`, `claude-fable-5`, high effort, independent.
- Reviewed at: `2026-08-31T01:02:36Z`.

The stable artifacts were renamed without byte changes.

| Artifact | Path | File SHA-256 |
| --- | --- | --- |
| Collection | `eval/repo-recovery/results/repository-tooling-recovery-v2-fifth-upstream-stale-failed-collection.json` | `4f4ee34353b236dd6d00ec896fa7888b5c19702a76a0809a67a9f35246e68bb8` |
| Review packet | `eval/repo-recovery/results/repository-tooling-recovery-v2-fifth-upstream-stale-failed-review-packet.json` | `08a41ee2cad8822043b5263bfbcc8f28378e0fd85dc1499dd0710e56aefd1c33` |
| Annotations | `eval/repo-recovery/results/repository-tooling-recovery-v2-fifth-upstream-stale-failed-annotations.json` | `08691d62a8f501d57684866d56e00d801474799754544308df2684e3bf24a207` |
| Reviewed result | `eval/repo-recovery/results/repository-tooling-recovery-v2-fifth-upstream-stale-failed-reviewed.json` | `e53a83952e5701ef49a33c955e59ebfa002413b542937c22c49a166f8e0a7ac0` |

The Fable plan is preserved at
[`fable-plan-v2-live-failure.md`](./2026-08-30-repository-tooling-recovery/fable-plan-v2-live-failure.md).
Its SHA-256 is `689a1fda1639a3122b8df4404d663c34fa0463beabbaf34bd99e9d4e40dcb4b3`.

### Result and failure partition

The collection completed 20 calls with zero retries.
It cost `$4.5646914`.
The reviewed result has 9 of 12 positive passes and 0 of 8 premature detours.
It has zero operation projection errors.
Identity and review integrity passed.
It has 18 of 20 correct answers and 20 of 20 grounded answers.

The stored grade fails as expected because 9 positive passes are below the requirement of 10.

The three positive failures have separate causes:

1. `rr-pos-go-sdk-query-enums` missed the required thematic operation. This is an operation-selection miss.
2. `rr-pos-cli-config-home-env` synthesized the Docs result over repository evidence. It omitted the `<cwd>/.stellar` fallback.
3. `rr-pos-horizon-max-supported-protocol` copied a stale DeepWiki value of 25. The pinned source defines 28.

### Comparison and decision

The fifth collection improves the fourth collection from 3 to 9 positive passes.
It also improves correct answers from 15 of 20 to 18 of 20.
The selection miss remains, the configuration conflict remains, and the upstream stale answer remains.

No paid rerun may occur until the Horizon free probe returns `28`.
Two structural misses consume the gate tolerance.
The remaining selection variation does not supply a new measurement reason.
A future collection requires the pre-registered free upstream-freshness trigger.

The ranking trigger remains unmet because this collection has one selection miss.
The Docs-versus-repository conflict remains monitor-only until three successful-recovery recurrences.
G1 remains a pre-registered v3 candidate only.
It requires an owner decision, new digests, and an ADR before a fresh collection.

The free probe records a recurrence for `sls-080`.
The complete local-config answer removes the unverified candidate from the active findings queue.
No product, ranking, receipt, catalog, corpus, golden, reviewer-guidance, or measurement-code change occurred.

### Grok close review reconciliation

Grok 4.6 high requested changes on `b659233` for B1 and B2.
This commit restores the fifth-collection cost to `$4.5646914`.
It records the prompt SHA-256 and the collection window.
It returns the four qualified result JSON files to the ignored local-only contract.
It restores `scripts/scan-secrets.mjs` to its previous content.
The stored v2 gate remains a failure.

### Mandatory secret-scan restoration

The tracked Grok review is complete except for two secret-shaped public example redactions.
The original report SHA-256 `89230001f951e0004bca392a043db2782588398f68a201a0be5a705b8fbee716` remains provenance.
The redacted tracked file SHA-256 is `72ec1ca150b328ecb904465b7bb32cdd567f4325f664583b6624f0bead9bddd8`.
This record-only correction does not change `scripts/scan-secrets.mjs`.
It does not track any file under `eval/repo-recovery/results/`.

### Grok close follow-up

Grok 4.6 high reviewed commits `88c53fa` and `3294b75`.
The review is PASS and confirms that B1 and B2 are reconciled.
The complete report is
[`review-v2-close-followup-grok.md`](./2026-08-30-repository-tooling-recovery/review-v2-close-followup-grok.md).
Its SHA-256 is `07d0e79da0231b98cbaf3d6cac897829c70ea1eaa8088be62d3902b239d6a19e`.
The original CHANGES-REQUESTED report and its redaction provenance remain preserved above.

### Approved free-probe reconciliation

The approved free probe used the existing local server at port 8788.
The concise record is
[`free-probe-2026-08-31.md`](./2026-08-30-repository-tooling-recovery/free-probe-2026-08-31.md).
The Horizon response still returned `MaxSupportedProtocolVersion = 25`.
It recorded `generatedAt: 2026-08-31T01:42:10.098Z` and the pinned scanned ref.
The freshness trigger did not fire.
The Stellar CLI response includes the ancestor search and the `<cwd>/.stellar` fallback.
The candidate never reached verified status, so it has no upstream report or resolved receipt.
The Docs-versus-repository synthesis pattern remains monitor-only.
No paid rerun may occur until the Horizon free probe returns `28`.
This free evidence does not change the no-post-hoc rule or the stored v2 FAIL.

### Independent Grok free-probe review

Grok 4.6 reviewed the approved free probe at high effort.
The reviewer independently re-executed both free probes and reported PASS.
The full report is [`review-free-probe-grok.md`](./2026-08-30-repository-tooling-recovery/review-free-probe-grok.md).
Its SHA-256 is `392ff3fb48b2115b966be1392e7d3d22d0deb960c46f3efe3d33bf5fba47d2fd`.

`sls-081` remains a historical withdrawn identifier.
It has no active finding and no resolved receipt.
The next Scout finding must use `sls-082`.
