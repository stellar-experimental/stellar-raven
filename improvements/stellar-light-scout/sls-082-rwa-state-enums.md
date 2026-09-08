---
id: sls-082
service: stellar-light-scout
status: verified
discovered: 2026-09-08
upstreamTitle: The RWA state request and response enums omit issued-single-holder
evidence:
  - 2026-09-08 live OpenAPI 1.9.48 read from https://stellarlight.xyz/api/openapi.json; SHA-256 2f042393eec673f80b661b65c5e6e11c4af10b7f2496b6d530e3bb7aa70f9639.
  - The GET /api/rwa state parameter description names issued-single-holder, but its request and response enums contain only live, deployed-no-supply, and not-found.
  - A live state=issued-single-holder request returned 200 with 34 matches at 2026-09-08T14:38:50.935Z; response SHA-256 7c83cbf33ac8643c5c68e337598c5a78391cdfe664af78c38584860226e1c95c.
  - A live state=bogus request returned 400 and listed issued-single-holder as a valid state; response SHA-256 7c328a1c93872800fc93b2f2a71e278c9a54a8db72614a8f35e576d7e1e1789b.
  - .agents/rounds/2026-09-08-live-drift-91.md
---

## Finding

The `GET /api/rwa` request and response schemas omit one accepted state value.
The parameter description lists `issued-single-holder`.
The live handler accepts that value and returns matching rows.
Neither enum includes it.

A generated client can reject a valid request before it reaches the service.
A generated client can also reject a valid response from the service.

## Evidence

Both live OpenAPI 1.9.48 state enums contain `live`, `deployed-no-supply`, and `not-found`.
The same parameter description also names `issued-single-holder`.

The live endpoint accepted `state=issued-single-holder` and returned 34 matches.
The invalid-state response also lists `issued-single-holder` as valid.
The handler and its error contract therefore disagree with both schemas.

## Recommendation

Add `issued-single-holder` to the query parameter and response state enums.
Add a contract test that compares accepted and returned handler values with both OpenAPI enums.
Keep the description, schemas, validation error, and filter implementation from one value set.
