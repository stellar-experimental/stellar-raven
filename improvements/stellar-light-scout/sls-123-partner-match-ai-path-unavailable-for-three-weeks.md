---
id: sls-123
service: stellar-light-scout
status: verified
discovered: 2026-11-17
upstreamTitle: "POST /api/partners/match has returned no matches in any observed call since 2026-10-26"
evidence:
  - "2026-11-17T14:21:11Z, direct, OpenAPI info.version 1.9.150: HTTP 503 with unavailable:true and no Retry-After header (command and body in the Evidence section). The same call at 14:04:50Z gave the same result."
  - "A search of Stellar-Light/stellarlight on 2026-11-17 for partners match, matchmaking, and AI not configured finds no open issue. Issue 1908 covers only the OpenAPI documentation of the 502."
---

## Finding

`POST /api/partners/match` has not returned a match in any call we observed since 2026-10-26. The
503 `unavailable: true` response is the documented contract, and it is correct. The hosted
deployment is the defect: the AI path behind the operation is not available.

The OpenAPI operation still publishes routing hints. Its description says to use the operation when
a client needs a scored shortlist for a concrete integration need. A client that follows the hint
gets a 503 on every call we observed.

The 503 is correct, but it gives the client no way to know in advance. A client can learn that the
AI path is off only by sending the request.

## Evidence

Reproduction. The call returns at once:

```sh
curl -sS -i -X POST https://stellarlight.xyz/api/partners/match \
  -H 'content-type: application/json' \
  -d '{"need":"I need a USDC off-ramp in Mexico with SEP-24"}'
# HTTP/2 503
# {"error":"AI matchmaking isn't available right now. Try the /partners directory filters.","unavailable":true}
```

The dated observations:

| Date | What the operation returned |
|---|---|
| 2026-10-26 | AI not configured |
| 2026-11-02 | HTTP 502 (issue 1908, now documented and closed) |
| 2026-11-17 01:29Z | 503 `unavailable: true`, through an MCP gateway |
| 2026-11-17 14:04:50Z | 503 `unavailable: true`, direct, 1.9.150 |
| 2026-11-17 14:21:11Z | 503 `unavailable: true`, direct, 1.9.150, no `Retry-After` header |

Issue 1908 added the 502 entry to the OpenAPI. The operation still returns no match.
The OpenAPI 503 description names two causes of `unavailable: true`: no model is configured, or the
provider refuses the request or account. A resend does not help.

Related: https://github.com/Stellar-Light/stellarlight/issues/1908.

## Recommendation

Restore the hosted AI path for `POST /api/partners/match`. Check both causes that the OpenAPI
names: no model is configured, or the provider refuses the request or account.

Optionally, report the state of the AI path in `GET /api/status`. A client can then skip the
operation while the AI path is off.

Do not remove the operation from the OpenAPI. The 503 contract is correct, and clients that call
the operation after the fix will need it.
