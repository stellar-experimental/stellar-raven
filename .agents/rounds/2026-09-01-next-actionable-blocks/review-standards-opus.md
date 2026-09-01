# Standards and reviewability review

Reviewer: Claude Opus 5 at high effort.
Mode: read-only.
Fixed point: `9d4362f73ae51e495ac75ee6160593fa2738ef03`.

The reviewer returned `FINDINGS`.

1. Medium: the environment pin is optional, but the queue calls it fail-closed. Omitting the flag
   silently preserves the defect that the item must prevent. This also conflicts with the
   forward-only rule. Make the flag required, or remove the fail-closed claim.
2. Medium: the new `eval/qa/README.md` paragraph breaks the antecedent for the later paid-row and
   non-comparable behavior. Move the environment paragraph after that existing explanation.
3. Low: the operator workflow requires `meta.agentEnvironment.inherited.matches: true`, but the
   new process tests inspect only `meta.judgeEnvironment`. Add collection-path coverage.
4. Low, judgement call: the new parser duplicates the once-only flag parser, SHA-256 pattern, and
   compare-and-stamp behavior. Move the environment assertion beside `assertExpectedExecutable`.
5. Low: the round says that a different-family reviewer covers the combined change. Opus reviews
   a Fable-authored report from the same CLI family. Record the matched-lane skip reason, or make
   the gate accurate.

The reviewer verified the following facts by reading the diff and source:

- The tests use a local fake Claude executable and assert zero paid invocations.
- The code calls the pin before collection and stored judging.
- The production and Raven reports preserve their authorization boundaries.
- The `ARCHITECTURE.md` Playground row matches the current source behavior.

The reviewer could not run `node` or `npm` under its read-only tool policy. The orchestrator owns
all executed validation.

Finding count: 5. Zero critical. Zero high. Two medium. Three low.
