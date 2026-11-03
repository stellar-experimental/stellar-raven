# Non-Anthropic golden QA diagnostic

The collection completed all 100 selected cases.
It produced 97 judged answers and three answer-limit errors.
The quality score remains withheld.
One frozen reference also contains a verified Audit Bank copay error.
Original answers, grades, errors, and the selected denominator remain unchanged.
The two reference corrections and Audit Bank reactivation have independent approval.
The [final independent review](final-closeout-review.md) clears closeout with no actionable hold.

The [reviewed metadata](reviewed-run.json) binds all rows, packets, and reviews to the final artifact.
Artifact SHA-256: `c8ec22427dd373492493b49b1f96c3e46d5476b8a928aa452b3dfd1654e6ea8f`.
The [round ledger](../../../.agents/rounds/2026-11-02-golden-overnight.md) records authorizations, exact commands, repairs, and review decisions.

## Contract and scope

The round uses Codex and Grok through `hc`, with no Anthropic answering model, judge, or helper.
Codex implements and reviews; Grok answers measured questions and performs independent reviews.
The canonical QA command launches Claude; a model-name flag does not change its transport.
This separate host loop uses Workers AI model `xai/grok-4.7`, with reasoning effort `high` requested.
It preserves the seven original judge self-test candidates, rubric `v2.11`, and evidence pack `p9`.
It measures neither the Grok CLI nor canonical QA.
It has no historical QA comparability or canonical five-track claim.

The [fixed selection](selection100.json) contains 100 of 501 active cases across ten categories and eight traps.
It includes 32 live, 38 scheduled, and 30 stable cases, with no quarantine at selection time.
The source mix is 48 Docs, 28 Scout, 13 Lumenloop, seven skills, and four none.
The application revision is `ce21317ff46d7491d82caf058baca7328c4177a9`.

Each answer permits 16 model requests; each completed answer receives one judge request.
The method has no request retry, fallback, panel, replacement, or resume path.
Earlier invalid methods retain separate artifacts and authorizations.
Fresh methods restart the selection; their partial results never merge into this collection.

## Observed performance

Collection ran from `2026-11-03T03:50:17.563Z` through `2026-11-03T08:17:08.302Z`.
Elapsed time was **4 hours, 26 minutes, 51 seconds**.
The table includes requests from incomplete answers.

| Model role | Requests | Recorded USD | Median request time | P90 request time |
| --- | ---: | ---: | ---: | ---: |
| Answering | 678 | 24.221292 | 6.45 seconds | 13.54 seconds |
| Judging | 97 | 4.752540 | 60.84 seconds | 149.94 seconds |
| All | 775 | 28.973832 | 6.98 seconds | 37.67 seconds |

Request time includes cost settlement.
Case time also includes tools, identity checks, and host work.
These observations do not isolate production retrieval latency.
At most two helper lanes run alongside the measured model.
Provider caches are active; this is not a cold-cache comparison.

| Case timing population | Cases | Median | P90 |
| --- | ---: | ---: | ---: |
| All ended cases | 100 | 150.45 seconds | 253.75 seconds |
| Completed answers with judgments | 97 | 150.45 seconds | 285.89 seconds |
| Incomplete answers | 3 | 183.90 seconds | 185.38 seconds |

Judging consumes 119.28 minutes of recorded provider time; answering consumes 90.27 minutes.
Judge calls report 590,325 reasoning tokens.
A future judge-effort experiment requires calibration and a separately approved measurement contract.
This round claims no measured retrieval-quality or production-latency improvement.

Provider fields report 25,611,303 prompt, 378,039 completion, 646,152 reasoning, and 26,635,494 total tokens.
They also report 18,929,280 cached prompt tokens.
The report uses the provider's total directly and does not estimate USD from token counts.

The three incomplete answers are:

- `q-hist-quantum-preparedness-plan`
- `q-sor-force-fast-archival-localnet`
- `q-ti-custodial-account-generation-c-address`

Each reaches the 16-request limit without a final answer or judge.
These are noncompletions, rather than wrong answers or provider outages.
The quantum trace already contains the core evidence before further searches exhaust the limit.

## Checks and interpretation

All 775 requests have complete reported costs and matching Gateway observations.
The later exact Gateway join finds no missing receipt, duplicate, or conflict.
Native and Gateway observations count each request once.
Final local and remote identity checks pass.
All 100 full frozen cases, packet projections, original verdicts, and digest-bound reviews pass final integrity checks.

The [calibration observations](judge-calibration.md) separate factual errors, omitted behavior, source defects, and judge concerns.
Safe refusals can receive `wrong` under a frozen trap's complete-behavior requirement.
Some originally correct answers contain extra statements that need qualification.
No manual review produces a replacement grade or quality aggregate.

The experimental runner repairs genuine Node/Miniflare response handling and request-scoped evidence ownership.
It validates complete native reported costs when Gateway settlement is absent.
It rejects invalid, partial, missing, or conflicting amounts.
Failure-case tests establish those guards; this collection itself has complete Gateway coverage.
The experiment stays on `codex/golden-2026-11-02-method`, separate from the application runtime.
Local commit `0aea991fd36ecd5653eef07c317568c7aa71f0e8` preserves all 14 frozen source and test files.
Their committed bytes and five shared source hashes match the measured freeze.

Code validation records 3,206 passing tests and three expected failures, plus passing typecheck, build, and eval self-tests.
Focused transport, accounting, identity, deadline, and mocked QA checks also pass.
The local findings index and lint pass with 132 records.
The four focused corpus, lifecycle, register, and sentinel test files pass all 109 tests.
The pin-review check reports no skill-pin or file-selection change.
Final corpus lint and consistency checks pass after the metadata review.
Lint records zero errors and 93 warnings, including one reviewed issuer-caution warning.

Two existing checks remain flagged.
Live intake lint finds the closed target [soroswap/docs#47](https://github.com/soroswap/docs/issues/47) for `cs-002`.
The separate protocol-history diagnostic records target top-five coverage `7/8` and control captures `3/4`.
The routing gate itself passes.
Corpus lint records 92 existing warnings at quarantine, with no error.
The additional issuer-caution warning needs no grade concession for the valid fresh-account recipe.

## Local upstream findings

The first seven records have independent Grok reviews.
They cover six content errors and one narrower ledger-heading clarification.
The final independent review also clears three further proposed records.
They retain explicit runtime-verification limits.
Their bounded public receipts establish current source text and applicable SDK behavior.
No external issue, message, deployment, or upstream source write occurs.

| Finding | Observed problem | Public evidence |
| --- | --- | --- |
| [sd-082](../../../improvements/stellar-docs/sd-082-issuer-lock-omits-other-signers.md) | Issuer locking omits other signers. | [Docs receipt](issuer-lock-receipts.json), [Core sources](issuer-lock-core-receipts.json) |
| [sd-083](../../../improvements/stellar-docs/sd-083-toml-array-order-is-not-universal.md) | TOML ordering claims a universal syntax restriction. | [Receipt](toml-order-receipts.json), [fixture](toml-order-fixture.toml), [parser](toml-order-result.json) |
| [sd-084](../../../improvements/stellar-docs/sd-084-authorization-sandwich-operations-are-ordered.md) | Ordered operations are called simultaneous. | [Receipt](authorization-source-receipts.json) |
| [sd-085](../../../improvements/stellar-docs/sd-085-sac-authorization-prose-names-set-auth.md) | SAC prose uses the wrong function name. | [Receipt](authorization-source-receipts.json) |
| [sd-086](../../../improvements/stellar-docs/sd-086-strict-send-destination-parameter-descriptions.md) | Destination descriptions name source selectors. | [Receipt](horizon-strict-send-receipts.json) |
| [sd-087](../../../improvements/stellar-docs/sd-087-simulation-authmode-default-is-conditional.md) | OpenRPC omits the conditional invocation default. | [Receipt](late-docs-receipts.json) |
| [sd-088](../../../improvements/stellar-docs/sd-088-ledger-header-scpvalue-nesting.md) | Heading hierarchy obscures consensus-value nesting. | [Receipt](late-docs-receipts.json) |
| [sd-089](../../../improvements/stellar-docs/sd-089-simulation-preview-decodes-before-success-check.md) | Proposed simulation-preview result guard. | [Receipt](tail-source-receipts.json) |
| [sd-090](../../../improvements/stellar-docs/sd-090-contract-spec-enum-encodings.md) | Proposed tagged and integer enum corrections. | [Receipt](tail-source-receipts.json) |
| [sk-037](../../../improvements/skills/sk-037-dapp-mixed-classic-soroban-batching.md) | Proposed removal of unsupported mixed-operation batching. | [Receipt](tail-source-receipts.json) |

The round also adds recurrence evidence to [sls-107](../../../improvements/stellar-light-scout/sls-107-stablecoin-issuer-of-record-and-asset-class.md).
Its [receipt](stablecoin-issuer-recurrence-receipts.json) separates company labels from legal issuer identity.
The tail review checks all findings namespaces and resolved records before creating these proposals.
Six initial primary reads and four later currentness reads call no model or transaction service.
The latest dapp skill still contains the batching recommendation.
No corrected example, simulation, or conversion fixture runs; the three records remain proposed.

The audit-label concern stays held under its section-inferred chunk contract.
The fee-bump wording and SEP-10 shorthand remain narrow clarification candidates.
Repository scores support reference navigation; no security or readiness guarantee is established.
The score-drift attribution is withdrawn because the visible evidence cannot support it.
Dated issuer-control flags and conflicting bounty text remain monitors with explicit source limits.

## Reference epochs

The frozen corpus SHA-256 is `1ec9f413f07de80aa8d3c6c4ed62ddf1adaaa5bc8ab85f465c8833d029e96ba0`.
The known Audit Bank authoring error remains part of this historical measurement's validity limits.
Quarantine commit `a2b1c54721ec6ef08483f00f286fc6f89637738f` changes its lifecycle only after collection.
The [stage receipts](audit-bank-stage-receipts.json) separate Initial Audit copayment from Growth/Scale Audit stage exemptions.
The published page and repository share one policy authority; that dependency remains explicit.
The [exact reference review](reference-correction-review.md) approves both factual corrections and Audit Bank reactivation.
The [provenance confirmation](reference-provenance-confirmation.md) approves the durable review path.
The issuer recipe remains valid for its fresh account; the correction adds the general signer condition.
The [metadata review](reference-metadata-review.md) preserves the original live behavioral contract.
It retains a dated illustration, current-grounding behavior, and the reverify date.
The [register review](reference-register-review.json) checks all 17 cluster members against the corrected reference.
The generated consistency register is current.
The corrected corpus SHA-256 is `103226f7025594b029fa78b75fb2f379509580733a72e77ce567a6fc043ca701`.
No original answer or grade changes.
Future comparisons must name the corrected reference epoch and affected cases.

## Cost boundaries

The owner sets a **$200 total model allocation**, including answers, judges, and checks.
The [cost observations](cost-observations.json) separate reported amounts from policy reserves.
They do not establish an audited total bill.

| Component | Recorded USD | Allocation or reserve |
| --- | ---: | ---: |
| Nine earlier methods | 9.788790 | [Separate method history](method-history.json) |
| Final collection | 28.973832 | $30 launch allocation; unused $1.026168 released |
| Grok helper CLIs | 40.55712260 after the completed final review | $45 total allocation |
| Older unresolved charges | Unknown | $7 policy reserve |
| Codex orchestration and helpers | Dollar charges unreported | $100 policy reserve |

After collection settlement, allocations total $190.762622 and leave $9.237378 unassigned.
Helper work uses its existing allocation; no further paid measurement is authorized.
Reserves are neither charges nor proven upper bounds.
An exact whole-session bill remains unavailable because Codex dollars and some older charges remain unreported.

One earlier final response separately reports native cost `$0.047416` without a Gateway receipt.
That observation does not repair its old ledger or release its reserve.
The [native-cost contract receipt](native-cost-contract-receipts.json) preserves that distinction.
Native ticks use divisor `1e10`; equal Gateway observations are never added again.

## Retained evidence

Full requests, model text, transcripts, and case reviews remain in ignored local artifacts.
Public metadata contains identities, timestamps, hashes, costs, and timing populations.
It excludes credentials, partner-tier details, private account state, and production usage counts.
The source branch and dated ledger preserve this experiment without presenting a supported canonical lane.
Both source and result changes stay in local commits.
No push or deployment occurs.
