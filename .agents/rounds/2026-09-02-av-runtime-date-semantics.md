# A/V runtime date semantics

Date: 2026-09-02
Status: complete
Scope: `skills.lumenloop.stellar-ecosystem-digest`

## Pins and baseline

| Pin | Value |
| --- | --- |
| Revision | `09c095986dfcf21833d5382fd1cef2518bd0ee31` |
| Initial tree | clean |
| Initial tree diff SHA-256 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| Manifest SHA-256 | `4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b` |
| Initial runner SHA-256 | `a9146a7f84e5e5fc5344f3450030a7d4d74d7c5eef7fa2e1b06a6267b85d8317` |
| QA corpus SHA-256 | `8e144123aae5bb8162bae23347c7f061890b501df62acc4d04ccec7f0b4c97d4` |
| Semantic fixture SHA-256 | `f892a964649a72bb743fd9c4bfb19287bf92696ee4600df17cbe3118f141bec3` |

The initial tree had no tracked or untracked changes.
`npm ci` installed the locked dependencies.
Its prepare script could not update the external worktree Git configuration.
The dependency installation still completed.

## Evidence contract

| Field | Record |
| --- | --- |
| ID | `skills.lumenloop.stellar-ecosystem-digest` |
| Source | Lumenloop and Skills |
| Authority | The runner projects Lumenloop content rows into a bounded digest. |
| Input | `subject`, `subjectType`, `days`, and `perTypeLimit` |
| Output | `window`, projected `items`, per-type `counts`, `softEmpty`, `upcomingEvents`, and host-owned `calls` |
| Runtime shape | The primary call returns normalized semantic `items` or type-keyed entity collections. |
| Responses | Primary data and soft-empty return digest data. A primary error returns an error envelope. |
| Retrieval | The theme mode calls semantic content search. The entity mode calls entity content search. |
| Safety | All declared operations are free and read-only. No live or paid call is authorized. |
| Coverage | Runner unit tests and the existing Worker smoke test cover the callable skill. |
| Finding | A/V `created_at` becomes `items[].date` and controls descending date order. |

## Evidence and hypothesis

The prior matrix recorded `av_id` 445 for a DEVCON 2024 recording.
Its `created_at` value was `2026-04-02T23:21:21.744Z`.
The matrix also recorded `av_id` 1162 with `created_at` `2026-04-28T05:25:34.817Z`.
Upstream calls `created_at` the recording date.
The live rows contradict that claim.
The field's real meaning remains undocumented.

Hypothesis: a type-aware local date selector removes false A/V recency.
The selector keeps the current date fallback for every non-A/V row.
The digest then emits current A/V rows with `date: null`.
The existing sort places those rows after dated rows.

The unchanged baseline arm is the revision above.
The changed variable is the runner's date selection for A/V rows.
The mechanism metric is the projected A/V date and its position among dated rows.
The two paths are normalized theme rows and type-keyed entity rows.
The symmetric controls are an article publication date, an event start date, a research
`created_at`, primary soft-empty, primary error, and the unchanged upcoming-events section.
No service, corpus, prompt, judge, or model call changes.
The cost estimate and hard cap are both `$0`.
The repetition count is one red run, one focused green run, and the complete verification set.
The runner, manifest, corpus, and fixture pins are in the baseline table.
No prompt, evidence pack, rubric, answering model, or judge model applies to this deterministic fix.
The author and orchestrator are Codex.
The independent reviewer is Fable 5 at high effort.

Stop if a non-A/V date changes.
Stop if data, soft-empty, or error handling changes.
Stop if the output schema or exposed operation set changes.
Accept only when the focused regression test and all required repository checks pass.

## Runtime trace

The Lumenloop adapter normalizes theme results into one `items` array.
Each normalized row keeps its upstream fields and gains a `collection` field.
The adapter currently also copies A/V `created_at` into canonical `date` metadata.
The runner does not use that canonical field.

The host sends `date_start` and `date_end` to both primary upstream operations.
Lumenloop performs that filter before the adapter receives any rows.
The host cannot verify the A/V date basis after that filter.
The runner therefore keeps returned A/V candidates but marks them as undated.

The runner groups normalized rows by `collection`.
Entity results already arrive in type-keyed groups.
Both paths use the same local item projection.
That projection selects the date before descending sorting.
The sort places `date: null` after all dated items.
The output returns the same items, counts, and response distinctions.

## Test-first record

The public seam is `stellarEcosystemDigest.run` output.
The first focused test used a normalized A/V row with `created_at` and canonical `date` metadata.
It also used article, event, and research control rows.

The red run failed as expected.
The A/V row received `2026-09-01T00:00:00Z` and sorted first.
Command: `./node_modules/.bin/vitest run test/skill-runners.test.ts -t "keeps A/V created_at out of digest dates and recency sorting"`.

The minimal implementation made date selection type-aware.
The first green run passed one test.
The remaining 17 tests in that file were filtered out.
The review repair added entity-mode coverage and the output-schema oracle.
The complete runner suite then passed 19 tests.

## Verification

| Check | Result |
| --- | --- |
| Focused red test | Failed because A/V received `2026-09-01T00:00:00Z` and sorted first. |
| Focused green test | Passed, 1 test. |
| Complete runner unit suite | Passed, 19 tests after review repairs. |
| Focused Worker smoke | Passed, 1 test. |
| `npm run typecheck` | Passed. |
| `npm test` | Passed, 100 files and 1,632 tests on the final tree. |
| `npm run build` | Passed. |
| `npm run test:smoke` | Passed outside the filesystem sandbox, 4 files and 82 tests. |
| Deterministic local digest probe | Passed with `[["research","2026-08-30"],["av",null]]`. |
| `npm run secrets:scan -- --tree` | Passed with no leaks. |
| `git diff --check` | Passed on the final tree. |

The first full smoke attempt failed because the sandbox refused a local listener.
The permitted rerun passed.

## Decision scorecard

| Dimension | Status | Evidence |
| --- | --- | --- |
| Correctness | pass | Unit, full, build, and smoke checks passed. |
| Causality | pass | The single date-policy change fixes the red test. |
| Retrieval | pass | The deterministic local digest probe passed. |
| Execution | pass | Unit and smoke checks preserve all response distinctions. |
| Context | pass | The output shape and size are unchanged. |
| Cost | pass | No paid call or live provider call is used. |
| Security | pass | The full-tree secret scan found no leak. |
| Exposure | pass | No manifest operation or schema changed. |
| Evaluation | pass | The focused test uses fixed local data and no judge. |

## Review

Fable 5 reviewed the change at high effort.
The full report is
`.agents/rounds/2026-09-02-av-runtime-date-semantics/review-fable.md`.
The verdict was `PASS with four non-blocking findings`.

- F1 added the durable warning about upstream A/V window admission.
- F2 replaced the broad verification claim with the exact A/V invariant.
- F3 added the schema oracle and entity-mode A/V coverage.
- F4 added the missing experiment fields and completed this scorecard.

The review also found an out-of-scope QA evidence-pack use of A/V `created_at`.
That work is now recorded in `.agents/TODO.md` under Eval instruments.
The closure review passed all four repairs and found no new actionable issue.
The closure report is
`.agents/rounds/2026-09-02-av-runtime-date-semantics/review-fable-closure.md`.
The completed Catalog correctness TODO item left `.agents/TODO.md`.
