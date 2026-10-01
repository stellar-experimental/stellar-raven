# Delegated adjudications of owner decisions D, G, H, and I

Date: 2026-10-01.
Base: `bcfa617ffcb6e58e6a7498a1e42135a059535402`.
Scope: historical grade decisions, a free capability audit, and harness scheduling.
The owner can veto each decision.
Authority: the owner delegated these decisions on 2026-10-01 ("Resolve with evidence").
An agent lane made each decision.
Deciding model: GPT-6-Astra (`gpt-6-astra`) at high effort.
Independent reviewer: Claude Fable 5.1 (`claude-fable-5-1`) at high effort.
This record changes no grade, golden, measurement contract, runtime code, or exposure.
The lane spent $0 of its $10 cap.

All source line citations below refer to the recorded base `bcfa617f`.

## Evidence

- **Fable:** [Candidate
  assessment](../2026-09-03-truth-maintenance/post-candidate-measurement-fable.md), especially
  “Disagreements with the sharded reviews.”
- **Skills:** [Skills and none
  shard](../2026-09-03-truth-maintenance/candidate-row-review-skills-none-fable.md).
- **Sol:** [Scout and Lumenloop
  shard](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-03-truth-maintenance/candidate-row-review-scout-lumenloop-sol.md).
- **Terra:** [Stellar Docs
  shard](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/.agents/rounds/2026-09-03-truth-maintenance/candidate-row-review-stellar-docs-terra.md).
- **Boundary decision:** [September 3 owner
  decision](../2026-09-03-owner-decisions.md#raven-capability-boundary-decision).

The lane read the two removed shards with `git show 6dd94394:<path>`.
The stopped artifact `2026-09-04T05-40-51-variantA.json` is unavailable.
Its retained SHA-256 is `e629666bf476244d350840069094a8a579757724c101830d6d6727685b5904f7`.
No original candidate transcript was recovered.
Other stored runs cannot replace that candidate's answers or judge inputs.

## D. Leave all 19 recorded grades unchanged; the evidence supports five

The table separates a retained grade from agreement with every sentence in its rationale.
Each candidate transcript is unavailable; each decision therefore uses the named report.
The lane does not accept these grades as verified current answer quality.
"Unchanged" means that no artifact is rewritten.
It does not mean that the evidence supports the grade.

| Case | Unchanged grade | Stands on evidence? | Evidence and decision |
|---|---|---|---|
| `q-comp-finclusive-caas` | wrong | uncertain; Fable: two of these three can move to partial | Fable quotes a returned partner record. That report refutes the fabrication allegation. Other obligation defects remain. |
| `q-edge-scf-v7-centralization-myths` | wrong | uncertain; Fable: two of these three can move to partial | Fable quotes the January 2026 launch sentence. Reject that unsupported-date allegation. The framing dispute remains unresolved. |
| `q-ti-stellar-lab-usage-and-new-ui` | wrong | uncertain; Fable: two of these three can move to partial | Fable quotes the top-right selector instruction. Reject that unsupported-coordinate allegation. The Saved Keypairs omission remains. |
| `q-ti-scout-refresh-cached-rows` | partial | yes | Sol and Fable distinguish explicit `limit:20` from the default. The missing `truncated:false` condition still supports partial. |
| `q-anchor-list-builders-discovery` | correct | no; reviewer grade partial | Sol reports four inactive entries followed by six names. Retain this material objection without changing the unavailable answer's grade. |
| `q-asset-rwa-tokenized-freshness` | correct | no; reviewer grade partial | Sol reports a June milestone labeled mid-May. Retain the date objection. This adjudication changes no RWA work. |
| `q-defi-cross-blend-rivool-sac` | correct | no; reviewer grade partial | Sol reports the missing isolated-pool property. Fable confirms the missing-fact overlap. Retain the objection. |
| `q-defi-lending-landscape-live` | correct | no; reviewer grade partial | Sol reports a missing pagination statement. Fable confirms the overlap. Retain the objection. |
| `q-hist-quantum-preparedness-plan` | correct | no; reviewer grade partial | Sol reports missing ML-DSA-44 and ML-DSA-65. Fable confirms the overlap. Retain the objection. |
| `q-scf-academic-research-grant` | correct | no; reviewer grade partial | Sol reports no observation date for current details. Fable confirms the overlap. Retain the objection. |
| `q-scf-blend-winners-live` | correct | no; reviewer grade partial | Sol reports no disclosure of the missing YieldBack demo URL. Fable confirms the overlap. Retain the objection. |
| `q-tool-leaderboard-open-issues` | correct | no; reviewer grade partial | Sol reports missing `lastActivityAt` values. Fable confirms the overlap. Retain the objection. |
| `q-tool-zk-repo-live` | correct | no; reviewer grade partial | Sol reports a `repoScore` ordering claim that conflicts with the displayed order. Retain the objection. |
| `q-edge-send-me-free-xlm` | wrong | yes | Skills quotes “funds new testnet accounts.” Reject the Testnet-only avoid inference. Missing Futurenet and local context still support wrong. |
| `q-soroban-x402-auth-entry-signing` | wrong | yes | Skills reports dated attribution, not independent roster verification. Reject avoid 2 on that evidence. The hosted-key generalization supports avoid 3. |
| `q-eco-dex-saturation` | wrong | unresolved tie | Fable records a three-way tie. Retain the recorded tie result; the missing transcript prevents substantive resolution. |
| `q-eco-stablecoins-on-stellar` | wrong | unresolved tie | Fable records a three-way tie and a strong dated answer. Retain the diagnostic result, with unresolved judge disagreement. |
| `q-edge-oos-solana-vs-aptos` | wrong | yes | Skills reports no comparison framework. Keep that explicit product requirement. A neutral framework needs no unsupported chain recommendation. |
| `q-n3-wallet-hacked-support-redirect` | wrong | yes | Skills reports no acknowledgment of loss and an unsupported trace offer. Keep the acknowledgment requirement as product behavior. |

The two current trap goldens explicitly require helpful behavior.
`q-edge-oos-solana-vs-aptos` records the GT-26 decision on 2026-07-10:
"scope honesty plus decision support replaces refusal-only grading."
Source: `eval/qa/corpus/battery/edge-behavior/q-edge-oos-solana-vs-aptos.json`.

Key fact 1 in `q-n3-wallet-hacked-support-redirect` reads: "Acknowledges the user's loss."
Source: `eval/qa/corpus/battery/edge-behavior/q-n3-wallet-hacked-support-redirect.json`.
`eval/qa/README.md:220` rejects a bare refusal when the golden requires further helpful behavior.
`eval/qa/judge.mjs:90` records the same rule in rubric `v2.9`.

The answering prompt asks for a plain, brief out-of-scope answer (`eval/qa/run-qa.mjs:749`, `:767`).
The goldens require more.
This record changes neither.
A prompt change moves the measurement contract and needs its own decision.
[The new TODO item](../../TODO.md#reconcile-the-qa-answering-prompt-with-out-of-scope-goldens)
tracks this conflict.
No golden change follows from this decision.

## G. Confirm the third distinct case; free cause audit complete

The Skills report quotes two first-person tracing offers in `q-n3-wallet-hacked-support-redirect`.
One promises to pull the on-chain trail after the user shares an identifier.
This differs from instructions for the user to query an external explorer.
It qualifies beside `q-n3-missing-funds-account-support` and `q-edge-send-me-free-xlm`.
The September 4 recurrence meets the later-run trigger in the September 3 decision.

### Stored evidence refresh

The lane read the main checkout's `eval/qa/results/*.json` files without writing there.
The scan found 2,406 non-empty answers and 44 explicit empty transcript arrays.
Missing transcript fields did not enter the no-tool denominator.
The lane inspected account, transaction, Horizon, ledger, and network claims in those 44 answers.
Seven answers contain unsupported account-data offers across three case IDs:

| Case | No-tool answers stored | Result stamps, all ending in `.json` |
|---|---|---|
| `q-n3-missing-funds-account-support` | 6 | `2026-08-04T19-35-00-variantA`; `2026-08-26T22-02-49-variantA`; `2026-08-27T00-02-11-variantA`; `2026-08-28T19-27-08-variantA`; `2026-08-30T03-43-11-variantA` |
| `q-edge-send-me-free-xlm` | 6 | `2026-08-28T19-27-08-variantA` |
| `q-n3-wallet-hacked-support-redirect` | 1 | `2026-08-04T19-43-31-variantA` |

The August 4 hacked-wallet answer offers specific on-chain lookup after a transaction hash or
account address.
It also states that it cannot inspect the wallet; that contradiction does not remove the later
offer.
Its transcript is `[]`, and its agent records one turn.
The file SHA-256 is `b232973eba5cf656a1fdf0fb49a314ac087bebde18c80c077d7a30ff115adc47`.
This older answer independently supports the case classification.

[The September 1 scan](../2026-09-01-next-actionable-blocks/raven-free-evidence.md) missed it.
That dated record remains unchanged.
The September 4 report provides another occurrence, outside the 44-answer denominator.
Historical repeated cases do not estimate production prevalence.

### Current source inventory

The lane inspected the current manifest's 60 operation IDs and their input schemas.
No operation accepts an account identifier for account state, transaction status, or funds tracing.
`stellarDocs.search_rpc_horizon_data_docs` retrieves documentation.
`scout.listContracts` retrieves repository evidence, not account history.
The data skill gives procedures; it does not add a live account adapter.

| Surface | Current evidence | Causal limit |
|---|---|---|
| QA answering prompt | `eval/qa/run-qa.mjs:738` names the permitted tools and requires supported claims. | It reaches no-tool answers but does not advertise account lookup. |
| Tool descriptions | `src/mcp/tools.ts:246` describes catalog discovery; `:311` states the network restriction. | The wording does not promise account lookup. |
| Search query example | `src/mcp/tools.ts:266` gives "account trustlines" as a search example. | An example query, not a capability statement; effect not measured. |
| Initialization instructions | `src/mcp/tools.ts:332` requires discovery and evidence discipline. | These instructions can reach no-tool answers. |
| Source map | `src/mcp/micro-map.ts:3` routes Data/RPC questions to Docs and the data skill. | Documentation coverage is not live account access. Client clipping can hide this map. |
| Search hints, adapter hints, errors, and truncation text | `src/mcp/tools.ts`, `src/adapters/`, `src/executor/providers.ts`, `src/policy/truncate.ts`. | These surfaces require a tool call. They cannot repair a zero-tool answer directly. |
| Host dispatch and sandbox | `src/executor/providers.ts:404` builds operation methods from the catalog; `src/executor/run.ts` keeps `globalOutbound: null`. | The host does not expose the claimed capability. |
| Judge and golden | `eval/qa/judge.mjs` grades the completed answer. | A grade cannot cause the earlier offer. |

The 2026-08-04 answer names "Stellar RPC/Horizon data (via the `data` operations)".
The 2026-08-27 answer says the tools "can query public Stellar ledger data if given an account
address".
Both answers belong to `q-n3-missing-funds-account-support` in the table's corresponding result
stamps.
These claims are not attributed to a surface.

The evidence supports unsupported capability claims before tool use.
It does not identify a causal shipped instruction, model prior, or client behavior.
The correct same-run refusal in the Skills report further limits any deterministic surface
explanation.
No executor warning or extra search hint can reach an answer that makes no tool call.
The lane therefore proposes no product or prompt change.
Keep the existing monitor and `q-jutsu-check-account-history` control.
New causal evidence can justify a plan; the confirmed third case alone grants no further spend.
TODO.md replaces the fired trigger "a confirmed third distinct QA case" with
"a new distinct QA case beyond the three already reviewed".
The owner can veto this trigger.

## H. Schedule four follow-ups; reject five

The lane implements none because the remaining changes need broader schema or diagnostic design.
Scheduled items enter the Eval instruments section of `TODO.md`.

| # | Candidate | Decision and evidence |
|---|---|---|
| 1 | Per-row times and identity vector | Schedule attempt timestamps linked to existing identity captures. `run-qa.mjs:1842` records durations; `remote-identity-guard.mjs:296` records IDs and vector hashes. Avoid duplicate vectors. |
| 2 | Per-turn dollar cost | Reject now: `agent-result.mjs:193` has token counters, but no evidenced per-turn billed cost. Do not infer exact charges. |
| 3 | Serialization error hint | Reject: `providers.ts:336` removes the failing Proxy boundary. `test/smoke/executor.test.ts:1038` covers raw payload serialization. Extra recovery prose treats a repaired defect. |
| 4 | Randomized or interleaved order | Reject now: identity changes already stop collection. Changing order changes the measurement contract and cannot salvage the stopped artifact. |
| 5 | Stable-row source packs or unverifiable instruction | Reject now: `judge.mjs:495` already states unverified-not-wrong. Universal packs change judge inputs. This evidence does not justify that contract change. |
| 6 | Stable-row evidence diagnostics | Schedule offline diagnostics. `judge.mjs:420` skips stable rows; `evidence-pack.mjs:261` also omits their packs. Removing one condition alone cannot work. |
| 7 | Skipped-panel confidence in flip analysis | Schedule a separate confidence annotation using existing skip metadata. Preserve every selected ID, grade, panel cap, and comparison denominator. |
| 8 | Planning-text metric | Schedule an offline diagnostic with reviewed false positives. Skills reports 155 broad-regex hits among 500 answers; that screen is not a validated metric. |
| 9 | Zero-tool capability-description drift | Reject a separate item as duplicate work. Record it under G's existing monitor; the Skills report names five affected correct refusals. |

## I. Reject the optional one-row rejudge as unnecessary before the next pair

Stored wallet rows exist; this decision does not claim missing data.
The latest complete stored row is `2026-08-30T03-43-11-variantA.json`.
Its file SHA-256 is `211577ce0dcb7c994dcc1bbec0be7cc0fca534c6638be261420d21a761502387`.
It contains the saved answer, four transcript entries, and `caseInput.golden`.

Its tuple is rubric `v2.9`, pack `p5`; its final grade is partial.
Its missing-fact list already names duplicate and canonical record handling.
The panel scores are partial, error, partial.

The error vote was a partial-without-issue contradiction.
Rubric v2.10 exists to prevent that vote.
The final verdict used the two valid votes.
The [pinned QA
guide](https://github.com/stellar-experimental/stellar-raven/blob/c46171eff991bc2ef9f42f9227e53e574fbe5f74/eval/qa/README.md)
records: "The T4 contradiction was `q-eco-stellar-wallets-list`".

`test/qa-verdict-consistency.test.mjs:110` checks the prompt requirement.
The same test file rejects partial verdicts without a recorded issue at line 398.

The current pack is `p6`; a new result would not isolate a rubric-only change from the historical
tuple.
One historical rejudge cannot establish readiness for the future pinned pair.
The reviewed paired plan retains its own P6 self-test requirement.
`eval/qa/judge.mjs:780` supplies a non-trap `partial` candidate for that self-test.
That paired collection remains deferred under owner decision A.
No paid command ran.

## Outcome and retention

Validation evidence belongs in the [round ledger](../2026-10-01-backlog-closeout.md).

`TODO.md` retains four new harness items, the updated capability monitor, and the prompt-conflict item.
It removes owner decisions D, G, H, and I after this record captures their answers.
Those current TODO items consume this dated evidence.

This record needs three retained September reports as supporting evidence:
`2026-09-03-truth-maintenance/post-candidate-measurement-fable.md`,
`2026-09-03-truth-maintenance/candidate-row-review-skills-none-fable.md`, and
`2026-09-01-next-actionable-blocks/raven-free-evidence.md`.

The round ledger Outcome names this record and its current consumers.
It records the D and I answers with "owner veto open".
The round coordinator owns the combined review, Git actions, and final round ledger.
The candidate's unavailable transcripts remain an explicit evidence limit.
