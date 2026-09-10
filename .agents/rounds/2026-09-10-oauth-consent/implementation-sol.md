# OAuth auth-side completion

## Implementation

- Added `hasAllowedRedirectTransport()` as the shared redirect transport policy.
- Applied the policy to DCR, successful authorization parses, and typed authorization errors.
- Unsafe typed-error metadata now produces a local `400` without a `Location` header.
- Kept native custom-scheme syntax under the provider's existing validation.
- Removed the redirect helper re-export from `src/auth/gate.ts`.
- Added CSRF-validated `decision=deny` handling before the Terms check.
- Cancel returns `access_denied` with validated `state` and `iss` values.
- Cancel clears the consent CSRF cookie and does not park login state.
- Cancel does not call WorkOS or create an authorization grant.
- Approval without a `decision` field keeps the existing behavior.
- Unknown, duplicate, or conflicting decision values retry consent.
- This fail-closed rule prevents ambiguous Cancel data from becoming approval.

## Coverage

- Added real-provider DCR tests for HTTPS, loopback HTTP, native schemes, and refused public HTTP.
- Added unit tests for unsafe typed-error metadata on GET and POST authorization legs.
- Added unit tests for valid Cancel, invalid-CSRF Cancel, and ambiguous decisions.
- Added assembled Worker smoke coverage in `test/smoke/auth-redirects.test.ts`.
- Smoke coverage exercises DCR and both authorization legs through `SELF.fetch()`.
- All test requests use loopback values or reserved example domains and addresses.

## Checks

- `npm run typecheck` — passed.
- `npx vitest run test/auth.test.ts` — passed, 65 tests.
- `npm run test:smoke -- --run test/smoke/auth-redirects.test.ts` — passed, 8 tests.
- `git diff --check` — passed.

## Caveats

- The smoke runner required its pinned, hash-verified skill cache before startup.
- The final smoke run used the local cache and the smoke runner's outbound network wall.
- Wrangler emitted existing missing-source sourcemap warnings.
- I did not run the full suite or build because the parent owns those checks.
- I made no commit, push, deployment, or Wrangler development process.
