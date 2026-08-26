# Product executor build report

## Outcome

The mission is complete on branch `lane/product-executor-20260825`.

Commit: `49a7b652e3ee6c1a9648a47fcdf346464826e77f`

The worktree is clean after the commit.

## Files touched

- `src/executor/providers.ts`
- `src/executor/run.ts`
- `src/mcp/tools.ts`
- `src/policy/source-basis.ts`
- `test/executor-providers.test.ts`
- `test/mcp-instructions.test.ts`
- `test/smoke/executor.test.ts`
- `test/source-basis.test.ts`

## B1 payload-shape guard

Successful service operations now attach a diagnostic proxy as the object payload prototype.

The proxy traps `.map`, `.filter`, `.length`, and `Symbol.iterator` lookups on non-array payloads.

Each error lists the actual top-level payload keys.

The error suggests `r.data.hits` when `hits` is an array.

The error suggests the only array field when one array field exists.

The payload remains a plain object and stays compatible with structured cloning.

Own-property reads bypass the prototype proxy.

Therefore, well-formed reads such as `r.data.hits` keep the existing hot path.

Array payloads receive no shape proxy.

Failed envelopes, Codemode discovery results, skill guards, and artifact guards keep their existing behavior.

## B2 provenance sidecar

The host captures source metadata from redacted successful payloads before sandbox projection.

The dispatcher uses exact paths only.

It performs no recursive field search.

The allowlist contains these locations:

- Payload root and `data.meta`: `generatedAt`, `dataAsOf`, `asOf`, `matchMode`, `match_mode`, `count`, and `total`.
- `data.meta.counts`: `count` and `total`.
- `data.meta.scfRound`: `asOf`, `currentRound`, and `currentPhase`.
- `data.meta.scfRound.submissionWindow`: `closes`.

The source-basis formatter checks the same exact path allowlist again.

It rejects unsupported values, deduplicates identical fields, bounds displayed values, and keeps the 1,600-character manifest cap.

The executor appends a `SOURCE BASIS` block when captured metadata exists.

This block also appears when the model returns a compact, untruncated projection.

Operations without allowlisted fields keep their previous result text and omit the sidecar.

## B3 instruction clause

The server instructions now require five evidence checks.

- Date volatile values with their as-of date.
- Copy exact symbols, types, formulas, and identifiers.
- Scope absence claims to searched sources.
- State visible source conflicts instead of choosing silently.
- Broaden vocabulary or abstain after empty entity lookups.

Instruction size before: 1,986 characters.

Instruction size after: 1,998 characters.

Budget: 2,000 characters, with two characters of remaining space.

## Verification

- `npm ci`: passed and installed 310 packages.
- `npm run typegen`: passed after the required names-only `.dev.vars` setup.
- `npm run typecheck`: passed with zero errors.
- `npm test`: passed 84 test files and 1,239 tests.
- `npm run build`: passed the Wrangler dry run.
- Build size: 6,947.72 KiB total and 1,394.72 KiB gzip.
- `npm run test:smoke`: passed four test files and 79 tests.
- `npm run secrets:scan -- --tree`: passed with no leaks.
- The commit hook also scanned the staged change and found no leaks.
- `git diff --check`: passed before the commit.

The smoke suite printed third-party missing-sourcemap warnings.

These warnings did not fail the suite.

## Risks

The instruction text has only two characters of budget headroom.

Future wording changes must preserve the 2,000-character test.

Metadata-bearing compact results now include JSON followed by a documented `SOURCE BASIS` block.

Consumers must split at the source-basis marker before direct JSON parsing.

The source metadata allowlist intentionally omits nonstandard nested metadata.

This boundary prevents arbitrary response capture.

The diagnostic proxy needs a mutable standard payload object.

If a future adapter returns a frozen exotic object, the shape trap can remain unavailable.

Current adapter payloads cross the provider boundary as standard mutable data objects.

## Review fix — 2026-08-26

The independent review findings are fixed in commit `a7656b7d712ee06ccbf0de56380a06220eeb567a`.

### Marker contract

Untruncated metadata now starts with `--- SOURCE METADATA ---`.

Only truncated results use `--- SOURCE BASIS ---`.

The host escapes exact reserved markers inside model-returned strings.

Therefore, an exact final marker identifies the authoritative host block.

The smoke JSON split helper now applies only when a source-metadata block is expected.

All other smoke checks use direct `JSON.parse` calls.

These external consumers remain outside this lane's ownership:

- `eval/qa/evidence-pack.mjs`
- `eval/qa/analyze-composition.mjs`
- `eval/qa/verify-evidence-pack-fixtures.mjs`

At integration time, these consumers must treat `SOURCE METADATA` as a non-truncation block.

They must keep `SOURCE BASIS` as a truncation boundary only.

### Payload prototype bridge

The guard now proxies a bridge from `Object.create(basePrototype)`.

It no longer proxies the original prototype directly.

The original prototype stays in the prototype chain.

This design restores class and built-in `instanceof` behavior.

It also preserves null-prototype chains.

Map and Set methods continue to receive objects with their required internal slots.

The array-field scan reads own-property data descriptors only.

It does not invoke throwing getters.

Frozen objects remain unchanged when prototype installation is not possible.

Tests cover class instances, null prototypes, Map, Set, throwing getters, frozen objects, and `structuredClone`.

### Instruction correction

The instructions again say `with their as-of date`.

They also restore the option to ask for context.

The final instruction size is 1,977 characters.

The budget remains 2,000 characters.

### Performance correction

The earlier hot-path claim was too strong.

Own-property reads still bypass the proxy after setup.

However, each mutable successful object now needs a bridge allocation, a proxy allocation, and prototype installation.

No benchmark supports a claim that this setup cost is negligible.

### Final verification

- `npm run typecheck`: passed.
- `npm test`: passed 84 files and 1,245 tests.
- `npm run build`: passed with 6,948.61 KiB total and 1,394.91 KiB gzip.
- `npm run test:smoke`: passed four files and 82 tests.
- `npm run secrets:scan -- --tree`: passed with no leaks.
- The commit hook scanned the staged change and found no leaks.
- `git diff --check`: passed.
- The worktree is clean after the commit.

The smoke suite again printed third-party missing-sourcemap warnings.

These warnings did not fail the suite.
