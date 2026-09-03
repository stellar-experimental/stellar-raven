# Owner decisions — Raven capability boundary and protocol-history PH2

Date: 2026-09-03
Base commit: `560ab73c3776ed8a4b00483432131604f8f8b349`
Status: complete

## Scope

This round records the decisions from the Ask Matt review and the following document grill.
It resolves two owner-blocked items in `.agents/NEXT.md`.

The round makes no production routing change. It authorizes no paid eval or deployment.

## Decisions

| Question | Owner decision | Repository effect |
|---|---|---|
| Raven unsupported account lookup | Monitor-only | Replace the open diagnostic-design block with a trigger-based monitor. |
| Defect ownership for the protocol-history miss | Own-repository search ranking | Keep the item in `.agents/TODO.md`. Do not create an `improvements/` finding. |
| Best-route selection | Use measured, grounded coverage as diagnostic evidence | Do not add a runtime payload-probing selector from this evidence. |
| Protocol-history next step | PH2 contract repair | Add versioned tri-state contracts. Keep PH3 closed. |
| Disputed control treatment | Neutral | Preserve each question and rank without using it for pass or fail. |

## Raven capability-boundary decision

The owner selected `monitor-only`.

The stored evidence contains six unsupported offers among 2,406 answers. Five offers repeat
`q-n3-missing-funds-account-support`. One offer comes from `q-edge-send-me-free-xlm`.
All six answers have no tool transcript.

Raven exposes no account-scoped operation. No direct shipped prose advertises account lookup.
The evidence contains no production occurrence and identifies no causal product surface.

The monitor reopens a free cause audit when one of these events occurs:

1. A production answer offers a Raven account or transaction lookup.
2. A transcript shows Raven attempting an account-scoped operation.
3. Direct model-facing Raven prose starts advertising that capability.
4. A later run adds a third distinct QA case with the unsupported offer.

The fourth event authorizes a free evidence refresh only. No event authorizes a prompt change,
a paid diagnostic, or a production change by itself.

The control remains `q-jutsu-check-account-history`. Raven must continue to permit valid guidance
for public lookup through another service.

This decision was reviewed on 2026-09-03. It uses event-based review instead of a calendar date.

## Protocol-history defect ownership

A direct `scout.searchResearch` call returned the complete required fact set for the target case.
Raven `search` did not surface that operation. The evidence shows an own-repository ranking defect.

The evidence does not show an upstream endpoint, data, or adapter defect. Therefore, this round
creates no `improvements/` finding.

If a future direct operation call violates its supported contract, record that upstream defect in
`improvements/`. Raven can continue using another measured route while the finding remains open.

Grounded required-fact coverage can compare candidate routes during a bounded evaluation. It does
not remove human judgment from required-fact authorship, fact granularity, or provenance.

This round does not adopt live payload coverage as a runtime selector. That design would require
separate latency, cost, candidate-set, input, matcher, and tie-break decisions.

## PH2 contract decision

The v1 contracts and their historical results remain unchanged. The three spent ranking
experiments continue to use those v1 inputs.

The v2 contracts use three roles:

- `required`: `scout.searchResearch` must appear in the top five.
- `forbidden`: `scout.searchResearch` must not appear in the top five.
- `neutral`: the evaluator reports its rank without affecting pass or fail.

The original v2 contract has eight required, two forbidden, and two neutral cases. The blind v2
contract has eleven required, seven forbidden, and two neutral cases.

The four neutral cases are:

- `ph-control-validator-vote`
- `ph-control-clawback-cap`
- `phb-control-sdk-version-history`
- `phb-control-cap-history-sep-support`

The independent 2026-09-02 label review found `scout.searchResearch` in scope for these questions.
That evidence invalidates a forbidden label. It does not prove that this operation must rank.
Neutral status prevents both a false penalty and a post-hoc positive promotion.

The 19 required cases retain their exact content and order. The pass rule remains 19 of 19
required top-five hits and zero captures among the nine forbidden cases.

PH2 changes the measurement contract only. It does not reopen a fourth ranking mechanism.
Attempt three still fails after the label repair, so its historical `FAIL` remains unchanged.

## Independent review reconciliation

Muse Spark 1.3 xhigh supported monitor-only and PH2 before PH3. Its proposed `improvements/`
ranking finding conflicts with repository routing rules and was rejected.

Fable 5.1 xhigh supported PH2 before PH3. Its strongest contribution was the explicit boundary
between deterministic measurement and human-authored facts. Its live all-operation derivation
proposal exceeded the bounded PH2 decision and was not adopted.

Kimi K3 max supported PH2 before PH3. Its payload-versus-ranking warning was adopted. Its proposed
hard-coded trigger violated the no-query-map rule and was rejected.

Kimi also treated the historical 13-control denominator as an arithmetic defect. That finding was
rejected because the v1 results correctly preserve the labels used at measurement time.

Grok 4.6 did not complete a usable review. The owner reported that route as broken, so Kimi
replaced it. No Grok output informed this decision.

## Verification

Terra high implemented the v2 evaluator and contract pins. Its report is
`.agents/rounds/2026-09-03-owner-decisions/implementation-terra.md`.

The Fable repository review did not start. Its approval covered only the bounded summary, so no
private repository content was sent. A separate local Sol high agent completed the implementation
review. No setting change was required.

The first Sol review found one medium issue. The self-test did not pin the predecessor and label
review provenance fields. The fix added both exact pins and verified every v1 control survives
unchanged in one v2 boundary role. The closure review returned `PASS` with no open findings.

Review records:

- `.agents/rounds/2026-09-03-owner-decisions/review-sol.md`
- `.agents/rounds/2026-09-03-owner-decisions/review-sol-closure.md`

The final v2 diagnostic wrote the local trace
`eval/results/protocol-history-2026-09-03T14-39-45-624Z.json` and returned the expected diagnostic
exit code `1`.

| Contract | Required top five | Forbidden captures | Neutral captures | Verdict |
|---|---:|---:|---:|---|
| `protocol-history-routing-v2` | 4/8 | 1/2 | 1/2 | `FAIL` |
| `protocol-history-blind-v2` | 3/11 | 4/7 | 2/2 | `FAIL` |

Validation results:

- `npm run eval:selftest`: passed.
- `npm run eval:routing -- --gate`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed with 100 files and 1,699 tests.
- `npm run build`: passed.
- `npm run secrets:scan -- --tree`: passed for tracked files.
- `npm run secrets:scan`: passed for all staged changes.
- `git diff --check`: passed.

No production code, catalog text, runtime prompt, or upstream finding changed.
