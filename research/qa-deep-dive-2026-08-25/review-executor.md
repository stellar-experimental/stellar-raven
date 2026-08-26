# Executor review

Verdict: CHANGES-REQUESTED

## Blocking findings

1. `src/executor/run.ts:434-511` gives an untruncated result the existing `--- SOURCE BASIS ---` marker.

   Existing consumers define that marker as a truncation signal. See `eval/qa/evidence-pack.mjs:263-284` and `eval/qa/analyze-composition.mjs:125-135`.
   `eval/qa/verify-evidence-pack-fixtures.mjs:89-95` also requires marker presence to equal `projection.truncated`.
   The new smoke test proves the conflicting state: the result has the marker while `outcome.truncated` is false.
   This change corrupts truncation metrics and future fixture verification for compact metadata results.
   Add an explicit manifest truncation field, or use a distinct metadata marker.
   Update every consumer to distinguish metadata preservation from truncation.

2. `src/executor/providers.ts:364-379` replaces the payload's prototype with a proxy of the original prototype.

   The original prototype is no longer in the payload's actual prototype chain.
   A plain payload therefore fails `data instanceof Object`.
   A class instance fails `data instanceof ItsClass`.
   A null-prototype object gains `Object` behavior because the fallback is `{}`.
   This behavior conflicts with the plain-object claim and the required edge-case review.
   Use a proxy around a fresh bridge object whose prototype is the original prototype.
   For example, create the bridge with `Object.create(base)`, including when `base` is null.
   An own-accessor design can also avoid prototype replacement.

## Advisory findings

1. `src/executor/providers.ts:369-374` reads every enumerable payload value to find array fields.

   This scan invokes getters and can return a getter error instead of the intended diagnostic.
   Inspect own property descriptors and use only data-property values.
   Add cases for throwing getters, frozen objects, null prototypes, classes, `Map`, `Set`, and structured cloning.

2. `test/smoke/executor.test.ts:56-58` makes many unrelated assertions ignore any source-basis suffix.

   This helper can hide an unexpected sidecar on results that must remain unchanged.
   Keep direct `JSON.parse` checks where no sidecar is expected.
   Use the split helper only in tests that intentionally allow a sidecar.

3. `src/executor/providers.ts:361-379` adds a proxy allocation and `Object.setPrototypeOf` call to every successful object payload.

   Own-property reads avoid the proxy trap, but payload construction does not keep the prior hot path.
   Prototype mutation can also reduce JavaScript engine optimization.
   Measure this path before describing it as unchanged.

4. `src/mcp/tools.ts:325-331` says "with their as-of" instead of "with their as-of date."

   The compressed text also removes the prior option to ask for context after uncertain attribution.
   Restore those meanings before treating the compression as lossless.

5. No code prevents a returned raw string from containing `\n--- SOURCE BASIS ---` before the host block.

   `eval/qa/evidence-pack.mjs:265` selects the first marker.
   A source string can therefore impersonate the host boundary and hide the real manifest from that consumer.
   Define the final marker as authoritative, or escape marker collisions before appending the block.

## Verified live

- I confirmed branch `lane/product-executor-20260825` at `49a7b652e3ee6c1a9648a47fcdf346464826e77f`.
- I confirmed base `e488c4fc6a4a44b01ee58f4276baf7cd4dde2f47`.
- I read every hunk in the eight-file diff.
- I confirmed the worktree is clean and `git diff --check` passes.
- I confirmed metadata capture follows exact own-property paths after secret redaction.
- I confirmed the formatter rechecks paths, scalar types, atom sizes, and the 1,600-character limit.
- I confirmed `BASE_SERVER_INSTRUCTIONS` has 1,998 characters.
- A read-only Node probe confirmed structured cloning succeeds after proxy insertion.
- The same probe confirmed broken `instanceof` behavior and changed null-prototype behavior.
- I inspected all changed tests and the unchanged marker consumers.

## Taken from the build report

I did not run repository test or build commands because this review permits only one write.
The following claims therefore come only from `/tmp/raven-qadeep/build-product.md`:

- `npm ci` passed with 310 packages.
- `npm run typegen` and `npm run typecheck` passed.
- `npm test` passed 84 files and 1,239 tests.
- `npm run build` passed with the reported bundle sizes.
- `npm run test:smoke` passed four files and 79 tests.
- `npm run secrets:scan -- --tree` passed.
