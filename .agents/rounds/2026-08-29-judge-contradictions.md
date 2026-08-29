# Judge contradictions — 2026-08-29

## Route card

| Field | Value |
| --- | --- |
| Lane | `judge-contradictions` only |
| Author | Codex, Sol lane |
| Base | `35c90ec` |
| Scope | Repair both judge-prompt contradictions and reconcile Grok Issues 1 through 7. |
| Write set | `eval/qa/judge.mjs`, `eval/qa/README.md`, focused tests, `test/helpers/fake-judge-cli.mjs`, and this ledger |
| Excluded | T3 rules, T4 checks, attempt semantics, evidence semantics, corpus goldens, and unrelated TODO items |
| Paid authority | None. No paid command can run. |

## Design

Rubric `v2.9` gives complete required trap behavior precedence over topical coverage.
The judge derives required behavior only from the current golden.
It does not infer behavior from key-fact position, trap type, another case, or a general catalog.

Trap prompts use consistent behavior terms in the header, walk, rationale, schema, and score rules.
Non-trap prompts keep their key-fact terms and do not reference an undefined trap rule.
One behavior cannot replace a different behavior required by the current golden.
A bare refusal is wrong when the current golden requires more useful behavior.
Played-along output stays wrong, even when the answer also gives safe behavior.

Every non-empty `avoidMatches` value requires `wrong`.
Trap `partial` requires an empty `avoidMatches` list.
A fired avoid is never a minor slip.
The deterministic T4 checks remain unchanged.
ADR-0008 T3 classification remains unchanged.

The behavior fixtures cover a legitimate answer, clarifying question, boundary, named alternative, and scam warning.
Each fixture puts a background fact before the required behavior.
Each positive answer completes its required behavior without repeating the background.
Each bare refusal omits the required behavior and receives `wrong`.
Cross-class fixtures prove that one behavior cannot satisfy another behavior class.

The seven-call self-test keeps exactly seven candidates.
Its header and banner now describe the current labels.
The cap displaced the generic deploy-fabrication `wrong` candidate.
Two other contradiction and numeric negative candidates remain.
This exact generic coverage loss is recorded here because the cap cannot increase.

The lane does not change answer-attempt or evidence-pack semantics.

## Review reconciliation

Grok requested changes in `/tmp/judge-rules-review-grok.md`.
Issues 1 through 7 were blocking.

| Issue | Reconciliation |
| --- | --- |
| 1 | Trap prompts now use behavior-specific header, walk, rationale, schema, and score text. Background details are not required output. |
| 2 | Tests now use background-first goldens and the full fake-CLI judge path. They cover completed behavior, bare refusals, and cross-class failures. |
| 3 | The prompt no longer lists all five classes globally. It derives requirements only from the current golden. Played-along output always remains wrong. |
| 4 | Trap `partial` now requires empty `avoidMatches`. The prompt says a fired avoid is never a minor slip and always requires `wrong`. |
| 5 | The README now defines current non-trap and trap scores. The historical `v2.8` table remains unchanged. |
| 6 | The self-test header and banner now describe all current labels. The self-test still makes exactly seven paid calls. |
| 7 | Non-trap prompts no longer mention the trap rule. A focused test protects this split. |

## Tests

| Command | Result |
| --- | --- |
| `./node_modules/.bin/vitest run test/qa-verdict-consistency.test.mjs test/qa-judge-evidence.test.mjs` | PASS: 2 files and 152 tests |
| Local prompt-hash probe through `buildJudgePrompt` | PASS: 15 of 15 hashes match |
| `npm run eval:selftest` | PASS: all checks |
| `npm run eval:compile` | PASS: 338 legacy and 122 extended cases |
| `npm run eval:qa:compile` | PASS: 500 cases and 30 sample cases |
| `npm run eval:qa:lint -- --stale` | PASS: 0 errors and 60 existing warnings |
| `npm run eval:routing -- --gate` | PASS: all routing gates |
| `npm run eval:qa:register -- --check` | PASS: register up to date |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 91 files and 1,398 tests |
| `npm run build` | PASS: Wrangler dry run |
| `npm run secrets:scan -- --tree` | PASS: no leaks |
| `git diff --check` | PASS |

All 15 prompt hashes were recomputed through the existing prompt mechanism.
The focused tests also validate the trap and non-trap prompt surfaces.

## Pending paid gate

`npm run eval:qa:selftest` remains pending.
It makes exactly seven paid `claude-sonnet-5` judge calls.
This lane has no paid authorization, so the command did not run.
The later gate must record call counts, reported costs, missing costs, and total cost.
A later paid QA run must also confirm zero errors for both contradiction pairs.

## Outcome

Every blocking review finding is reconciled.
The focused tests and every free gate pass.
The paid seven-call judge gate remains pending.

## Independent Grok recheck

Grok rechecked the repaired tree on 2026-08-29.
The reviewer did not edit files or run paid commands.

| Finding | Final status | Review evidence |
| --- | --- | --- |
| 1. Conflicting trap prompt surfaces | Resolved | Trap prompts use `GOLDEN DETAILS` and behavior-specific walk, rationale, schema, and score rules. |
| 2. Tautological behavior tests | Resolved | Background-first fixtures use the fake-CLI judge path for positive, bare-refusal, and cross-class cases. |
| 3. Global five-class trap catalog | Resolved | The catalog is absent. Each trap derives requirements only from its current golden. |
| 4. Fired avoid competing with partial | Resolved | Trap and non-trap partial scores require empty `avoidMatches`. A fired avoid is never minor. |
| 5. Stale README score meanings | Resolved | Current score prose separates non-trap coverage from trap behavior. Historical `v2.8` data remains unchanged. |
| 6. Stale self-test descriptions | Resolved | The header and banner describe all seven current labels. The call count remains seven. |
| 7. Undefined non-trap trap rule | Resolved | Non-trap prompts contain no trap scoring rule. A focused test protects the split. |

The reviewer confirmed all 15 prompt hashes.
The reviewer also confirmed both deterministic T4 violations still fire.
The focused recheck passed 2 files and 152 tests.

Final Grok verdict: **PASS**.

## Paid judge self-test authorization

The user authorized one `npm run eval:qa:selftest` method run.
The authorization permits exactly seven `claude-sonnet-5` judge calls and no retry.
Each JSON judge call receives `--max-budget-usd 0.40`.
The method has a hard total limit of `$0.80`.

The independent Grok review covered the seven candidates and the paid summary fields.
The final Grok verdict was `PASS` before this spend.

| Launch field | Value |
| --- | --- |
| Real Claude path | `/Users/kalepail/.local/bin/claude` |
| Real Claude version | `2.1.251 (Claude Code)` |
| Wrapper path | `/tmp/judge-selftest-wrapper.QOkrXw/claude` |
| Wrapper SHA-256 | `1f06cd9c1c7b5662288f0314b3ad4688a92926f2514ceff1bb7c2fda64da062e` |
| Wrapper shell | `/bin/zsh` |
| Per-call cap | `$0.40` |
| Method cap | `$0.80` |
| Expected calls | `7` |
| Retry authority | None |

The wrapper is first on `PATH` only for the authorized method process.
It prints no arguments or environment values.

## Paid judge self-test result

The authorized method ran exactly once with `/bin/zsh`.
The wrapper injected `--max-budget-usd 0.40` into each JSON judge call.
The method used `claude-sonnet-5` with rubric `v2.9`.

| Result field | Value |
| --- | --- |
| Method runs | `1` |
| Expected calls | `7` |
| Actual calls | `7` |
| Reported costs | `7` |
| Missing costs | `0` |
| Total cost | `$0.2465634` |
| Hard total limit | `$0.80` |
| Retry count | `0` |
| Prompt hashes | `15/15` pass |
| Expected behaviors | `7/7` pass |
| Process result | `self-test GREEN`, exit `0` |

Every stop condition remained false.
The actual call count matched seven.
All costs were present.
Every expected behavior passed.
The total cost stayed `$0.5534366` below the hard limit.

Paid gate verdict: **PASS**.
