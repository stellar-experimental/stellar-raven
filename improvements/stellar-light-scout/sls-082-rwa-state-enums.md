---
id: sls-082
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-09-08
upstreamTitle: The RWA state request and response enums omit issued-single-holder
evidence:
  - 2026-09-09T18:27:37Z root read OpenAPI 1.9.49; SHA-256 2a44488dbf4c9fc3d7114a38d8cee29596d0cc37f367d74b0b7e5fc323f1cc01. Both state enums now contain issued-single-holder. At 18:27:19Z the matching request returned 200, one matching row, and 34 matches; state=bogus returned 400. The original upstream trigger is fixed. Raven catalog acceptance remains separate under issue 141.
  - .agents/rounds/2026-09-09-upstream-sweep-terra.md independently repeats the live enums and request checks.
  - https://github.com/Stellar-Light/stellarlight/pull/1532
  - 2026-09-09 drift issue 141 recheck still finds both enum omissions in OpenAPI 1.9.48. A fresh issued-single-holder request returned that state and 34 matches. .agents/rounds/2026-09-09-drift-141-astra.md records hashes, the independent live trigger, and the rejected candidate. No new upstream reminder was posted.
  - 2026-09-08 fresh OpenAPI 1.9.48 read reproduced the omission in both state enums; SHA-256 2f042393eec673f80b661b65c5e6e11c4af10b7f2496b6d530e3bb7aa70f9639. `state=issued-single-holder&limit=100` returned 34 matching assets, SHA-256 17d68f1b6638ced73e48674595b61511b6c383831b9f797b21a3ec21dfd556e6. `state=bogus&limit=1` returned the four-value validation error, SHA-256 7c328a1c93872800fc93b2f2a71e278c9a54a8db72614a8f35e576d7e1e1789b.
  - 2026-09-08 live OpenAPI 1.9.48 read from https://stellarlight.xyz/api/openapi.json; SHA-256 2f042393eec673f80b661b65c5e6e11c4af10b7f2496b6d530e3bb7aa70f9639.
  - The GET /api/rwa state parameter description names issued-single-holder, but its request and response enums contain only live, deployed-no-supply, and not-found.
  - A live state=issued-single-holder request returned 200 with 34 matches at 2026-09-08T14:38:50.935Z; response SHA-256 7c83cbf33ac8643c5c68e337598c5a78391cdfe664af78c38584860226e1c95c.
  - A live state=bogus request returned 400 and listed issued-single-holder as a valid state; response SHA-256 7c328a1c93872800fc93b2f2a71e278c9a54a8db72614a8f35e576d7e1e1789b.
  - .agents/rounds/2026-09-08-live-drift-91.md
  - upstream issue filed 2026-09-09: https://github.com/Stellar-Light/stellarlight/issues/1529
---

## Finding

The `GET /api/rwa` request and response schemas omit one accepted state value.
The parameter description lists `issued-single-holder`.
The live handler accepts that value and returns matching rows.
Neither enum includes it.

A generated client can reject a valid request before it reaches the service.
A generated client can also reject a valid response from the service.

## Evidence

The original trigger no longer reproduces on OpenAPI 1.9.49.
Both enums include `issued-single-holder`; the valid and invalid request checks agree with the schemas.
Raven's full catalog update remains unaccepted because its routing review is separate.

The following observations describe the previous defect.

Both live OpenAPI 1.9.48 state enums contain `live`, `deployed-no-supply`, and `not-found`.
The same parameter description also names `issued-single-holder`.

The live endpoint accepted `state=issued-single-holder` and returned 34 matches.
The invalid-state response also lists `issued-single-holder` as valid.
The handler and its error contract therefore disagree with both schemas.

## Recommendation

Add `issued-single-holder` to the query parameter and response state enums.
Add a contract test that compares accepted and returned handler values with both OpenAPI enums.
Keep the description, schemas, validation error, and filter implementation from one value set.
