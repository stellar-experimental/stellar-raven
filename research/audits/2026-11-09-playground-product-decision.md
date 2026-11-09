# Playground product decision — November 9, 2026

**Retain `openai/gpt-5.6-terra` as primary; qualify `anthropic/claude-haiku-5.5` as the cross-vendor fallback.** Haiku meets the declared confirmation rule with fewer wrong answers and no additional answer failures or unsafe output. Haiku passed its production checks, but the unchanged primary failed a required tool-reliability check. Promotion is blocked under the accepted plan pending an explicit fallback-only owner exception; the failed result is preserved below. The new OpenAI comparison could not run on its evaluation account; retaining the primary is not a new superiority claim.

The second-judge experiment is closed: its adapter/calibration worked, but the current route is not qualified for unattended or decision-bearing judging. No more collection is planned for either experiment under this round.

## Scope and decision rule

The owner explicitly requested proportionate evaluation after the resumed full study encountered another provider failure. The original 1,616-cell study remains incomplete and superseded, with its original denominator, errors and receipts preserved. It is not reported as a passing full-matrix result.

The replacement, `playground-product-screen-confirm-v1`, was reviewed before new answers. Within each of four original 25-case quality shards, cases were sorted by SHA-256 of `lean-playground-2026-11-09-v1\0` plus case ID. The first four per shard formed the 16-case screen; the next six formed the disjoint 24-case confirmation. Both included the original safety case. Saved Luna repeat 1 supplied the screen comparator and repeat 2 supplied confirmation. No failed observation was replaced with another repeat.

The candidate set was fixed: shipped primary/fallback, the two 6.1 OpenAI challengers, Haiku and Sonnet. Only one fallback advanced. Confirmation alone qualified that fallback if it had no more wrong/failed quality outcomes, no more answer failures across all 25 cases, and no unsafe output. This is a product acceptance policy, not a significance test or a claim of superiority over every model. No second confirmation, top-up or retry was allowed.

## Model results

The independently adjudicated screen selected Haiku:

| Screen arm | Quality correct / partial / wrong (16) | Bad outcomes, including failures (17) | Answer failures | Unsafe |
| --- | --- | ---: | ---: | --- |
| Luna, reused | 3 / 9 / 4 | 4 | 0 | No |
| Haiku | 4 / 9 / 3 | 3 | 0 | No |
| Sonnet | 4 / 9 / 3 | 4 | 1 | No |

Sonnet's safety response ended with a provider content-filter refusal. Its original incomplete artifact, null factual grade and answer failure remain; the visible refusal was safe. Safety and answer completion are separate outcomes.

Confirmation results:

| Arm | Raw A correct / partial / wrong / error (24) | Adjudicated correct / partial / wrong (24) | Answer failures (25) | Safety |
| --- | --- | --- | ---: | --- |
| Luna, reused | 6 / 10 / 7 / 1 | 5 / 12 / 7 | 0 | Pass |
| Haiku | 4 / 14 / 5 / 1 | 2 / 19 / 3 | 0 | Pass |

Haiku reduced wrong answers from seven to three, but produced more partial answers and fewer fully correct answers. That tradeoff supports its fallback role under the declared rule; it does not establish a better primary. Confirmation answer cost was $0.1611746 for Haiku versus $0.11001598 for the reused Luna arm. Mean quality-case latency was about 13.18 s versus 12.67 s; these observations are descriptive, not a latency significance claim.

A fresh Astra/high lane reviewed seven screen packets (21 cells) and 21 confirmation packets (42 cells), blinded to model identities and automated grades. Confirmation coverage included every error, wrong answer and paired grade difference, both safety answers, and six mechanically selected agreement cases. This includes every apparent Anthropic win over the OpenAI incumbent, addressing the same-vendor limitation of Anthropic Judge A.

The packet formatter initially omitted case-level trap/freshness tags. A hash-bound addendum restored the original corpus metadata before confirmation review finished. The reviewer also reconciled the six affected screen trap cells and all seven screen freshness labels; no screen judgment changed. Original packets and reviews remain intact. The eval skill now requires these tags in review packets.

Two confirmation judge errors were adjudicated from existing complete answers without paid regrading: the saved Luna Strupey case and Haiku's SEP-6/24 consistency error. Raw errors remain in their original receipts. Haiku's native method still records incomplete/exit 1 for that judge error; accounting settlement does not turn it into an originally successful method.

Saved comparator answers date from November 6; new answers date from November 9. Identical code pins do not freeze upstream facts. The blind reviewer found no paired grade difference attributable to source freshness, so qualification is unchanged when excluding freshness-attributable rows. The predeclared disagreement rule would have retained the incumbent.

## Availability and second-judge closure

The one scheduled OpenAI baseline case failed before answering with an account-inactive/billing SSE message, at recorded cost zero and without an A call. All remaining OpenAI arms stopped. The outer HTTP response was 200; the receipt does not establish a provider HTTP subtype. No billing, provider key, route or account setting was changed.

This evaluation failure does not establish a production outage. Existing production primary logs at 16:35 UTC, after the failed 16:30 evaluation, show successful uncached wholesale calls on `stellar-raven-demo`, with no BYOK alias. The evaluation used the distinct `default` BYOK route. These logs establish recent successful calls, not future availability or universal reliability.

For judge B, all seven calibration fixtures passed. On twenty historical answers it agreed with A on sixteen, with four adjacent partial/wrong differences; agreement is not ground truth. Resumed collection retained 73 completions and two zero-cost provider HTTP 429 failures in 75 first attempts, leaving 125 eligible calls unattempted. The current route is not qualified for unattended/decision-bearing judging. No intrinsic model-accuracy, 429-subtype or permanent-unavailability claim follows. The proposed further content audit was dropped because it could not change this decision.

## Configuration and evidence

The conditional runtime change preserves the primary's Responses/`none` request when an Anthropic fallback joins the tuple. Haiku uses the measured Anthropic adaptive-thinking/`low` mapping of configured effort `none`. Per-attempt effort is resolved by the same function in the Worker and evaluator; a slug-only override does not inherit another tuple member's effort. Unit tests compare the actual model-boundary requests in the default pair with the corresponding single-model requests and cover fallback history/budget preservation.

The reviewed receipt patch adds per-attempt effort metadata to the hashed answering configuration. This creates a one-time `answeringConfigSha256` discontinuity from historical `5b0c04d7…` even for otherwise identical configurations. It describes configured/resolved settings, not observed provider payloads. Descriptive scope/semantics strings remain in that hash as an accepted design choice. Frozen measurement sources were never patched.

Private evidence is retained under `tmp/playground-final/resume-2026-11-09/lean-eval/` and `eval/local-lanes/playground-product-screen-confirm-2026-11-09/`. Key SHA-256 bindings:

- Selection: `04f178cf32342e7ca29f989f5423ccebb572a7e50a3b4de022a83058d57c7539`.
- Confirmation raw receipt: `3a1ca97b8b7876430591bb70ae8e260a65044288b05a6caee594f21e6c0abecf`.
- Blind confirmation review: `957501a2cd06992b9ed7f3f914a64e9e9b31f19d18c8e9c656d6cb96e1359319`.
- Receipt-bound decision: `cc661a148268be715aa9efe5a3878899fb30a0c6b053fcbaf944f6099031deec`.
- Original halted journal: `0a2b2161299d9ccc2b92dbb1dd5819b2d876b222697044368c252d343a021295`.

The separate old-85 diagnostic audit was reconciled and independently accepted: 11 correct, 44 partial, 27 wrong and three retained failures. It is not pooled into this product comparison.

## Spend and release status

The lean collection ended at 60 answer attempts and 59 subscription A calls: $1.2722109 API cash and $4.1203134 subscription notional. After the settled Haiku production check, new posted API cash is $1.3732727 and the lifetime ceiling charge is $12.39647583. The old $2.591247 unresolved hold, the new $1.21 primary allocation and the $20 reserve remain intact. All prior debits are counted once; the $7.97 conservative charge is already inside the carried prior-cohort charge. Available above both holds and reserve is $163.80227717. Subscription notional is not additional API cash.

The production checks ran sequentially on clean candidate `d6d4e42a3f5be0dc3ce85fa450c9d18c299c5cdf`, with unchanged generation `29b9eb0d8398ea8543dda857aaa978ddacb005a236bed9cbed8e34ae8ae3a349`. These were local assembled Workers using the production gateway, not requests to the deployed Worker. No gateway settings or old journal changed.

- **Haiku: passed all five required fields on 16/16 turns**, settled at $0.1010618 within its $0.50 cap. The broader diagnostic passed 14/16: both Soroswap-builder turns missed the expected search-use field, which was not a promotion gate. Raw receipt SHA: `b9c3860ee78c97d20dc41bd795520842b6f74bcd89b8f474bd401f1322fc7b5b`.
- **Unchanged Terra primary: failed `noToolFailures` on activity-leaderboard.** Its generated script read `spec.data.signature` from `codemode.describe`, which exposes `signature` at the top level. The next description and leaderboard call succeeded; HTTP, terminal completion, final answer and latency passed. Recovery does not erase the tool failure. The collector was stopped when the failure was observed: five turns completed, the sixth was interrupted and two were unattempted. Raw receipt SHA: `25d58dc85fd2631b0c85ec1ae74e04eec7398da7da3c8f84eb414085f819e306`.

The primary's saved prefix reports $0.3986999. A session-bound, read-only Gateway reconciliation observes $0.4129097 including two interrupted-turn calls. The interrupted turn lacks a terminal receipt, so the frozen eight-turn validator rejects the incomplete denominator and the full $1.21 remains held. Observed cash is not added on top of that hold. There is no retry, synthetic settlement or new recovery mechanism.

The accepted production plan requires both cells to pass. This candidate therefore cannot merge under that rule. A fallback-only owner exception would retain the unchanged primary, promote the separately qualified Haiku fallback, and explicitly accept this observed primary tool error without relabeling it as a pass. Without that exception, retain the existing pair. Fallback hand-off remains covered by offline request-equivalence and shared-budget tests; the production checks exercised each model route separately.

Release checks on the candidate passed: typecheck, 3,386 unit tests (three expected failures), build, 140 assembled-Worker smoke tests and the free eval self-test. The existing routing/corpus/improvements checks remain applicable or run in CI. Independent Fable/high decision/delta review passed with no blocking findings; secret scanning passed. The final independent decision/delta review is bound by SHA `74758ec960cb4ca1047880d0ba08fba9b1eb69e812ae3ed4334d71917c6b0bc7`. All owned collectors and servers are stopped. The release choice, PR CI, merge, deployment and live alias verification remain pending.
