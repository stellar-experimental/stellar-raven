# Strkey lane report

## Files changed

- `eval/qa/strkey.mjs`
- `eval/qa/compile-qa.mjs`
- `test/qa-strkey.test.mjs`

## Test list

- Valid G account keys decode as `account`.
- Valid C contract keys decode as `contract`.
- The tests include the G and C vectors from SEP-23.
- G and C transcription changes fail CRC16 validation.
- G and C wrong-length inputs fail validation.
- G and C non-alphabet inputs fail validation.
- A valid changed version byte selects the matching key type.
- An unknown version byte with a valid CRC fails validation.
- Two invalid SEP-23 strings fail validation.
- Candidate discovery finds valid and invalid strkey-shaped tokens.
- JSON traversal reports the exact path for an invalid token.
- `validateCaseFile` rejects a broken key in `$.golden.answer`.

## Command outputs

`npx vitest run test/qa-strkey.test.mjs`

```text
 RUN  v4.1.11 /Users/kalepail/.herdr/worktrees/stellar-raven-codemode/codex-golden-truth-session-3

 Test Files  1 passed (1)
      Tests  8 passed (8)
   Duration  103ms (transform 19ms, setup 0ms, import 28ms, tests 4ms, environment 0ms)
```

`npm run eval:qa:compile`

```text
> stellar-raven-codemode@0.1.0 eval:qa:compile
> node eval/qa/compile-qa.mjs

wrote /Users/kalepail/.herdr/worktrees/stellar-raven-codemode/codex-golden-truth-session-3/eval/qa/cases.json (500 cases; sha256 fda6d08244776ed6bff1f28b903111dc560092c1cfa3b318b0b26a7f036219ac)
wrote /Users/kalepail/.herdr/worktrees/stellar-raven-codemode/codex-golden-truth-session-3/eval/qa/sample.json (30 cases)
```

`npm run typecheck`

```text
> stellar-raven-codemode@0.1.0 typecheck
> tsc --noEmit
```

The typecheck used the required generated `env.d.ts` and CI-name `.dev.vars` stub.
The temporary generated files were removed after the typecheck.

`npm test`

```text
> stellar-raven-codemode@0.1.0 test
> vitest run

 RUN  v4.1.11 /Users/kalepail/.herdr/worktrees/stellar-raven-codemode/codex-golden-truth-session-3

 Test Files  91 passed (91)
      Tests  1383 passed (1383)
   Duration  12.78s (transform 5.26s, setup 0ms, import 9.61s, tests 43.21s, environment 4ms)
```

## Current corpus result

No current-corpus strkey failed.
The compiler validated all 500 cases and completed successfully.
