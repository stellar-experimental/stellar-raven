---
id: sls-097
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "POST /api/partners/match returns an undocumented HTTP 502 instead of the documented 503 unavailable response"
evidence:
  - "2026-11-02 Raven execute (production connector, read-only partner ranking): two sequential scout.matchPartners({need:'USDC to Mexican peso off-ramp anchor for remittances'}) calls both failed with 'HTTP 502 from /api/partners/match: error code: 502', status 502, latencies 554 ms and 203 ms. The response body was the plain text 'error code: 502', not JSON."
  - "Earlier same-day observations from the golden audit: three of three calls returned HTTP 502 (batch assets-anchors-seps-03), and a Raven scout.matchPartners call returned HTTP 502 at 2026-11-02T16:01Z (batch history-org-tokenomics-01). The failure persisted for more than one hour."
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/openapi.json (version 1.9.116) documents only 200, 429, and 503 for POST /api/partners/match. The 503 description is 'AI backend unavailable: fall back to GET /api/partners'. The operation description says the endpoint 'returns 503 `unavailable:true` otherwise (fall back to GET /api/partners filters)'."
  - "Raw POST requests to stellarlight.xyz were not sent; the reproduction used only Raven's exposed read operation."
  - "Dedupe 2026-11-02: no active or resolved Raven finding covers partner-match transport errors. Resolved sls-004 concerned non-JSON 404 bodies on other endpoints. GitHub search repo:Stellar-Light/stellarlight 'partners/match 502' returned 0 results."
  - "Golden consumers: eval/qa/corpus/battery case q-gap-match-partners-degrade records the 502 and now keys its fallback to any failure, not only to the documented 503."
---

## Finding

`POST /api/partners/match` returned HTTP 502 with the plain-text body `error code: 502`.
The OpenAPI contract lists only 200, 429, and 503 for this operation.
The documented failure is 503 with a JSON body that carries `unavailable: true`.
A client that follows the contract does not recognize the 502 as "fall back to `GET /api/partners`".
The failure persisted for more than one hour on 2026-11-02.

## Evidence

The calls went through Raven's exposed `scout.matchPartners` operation, which sends the documented POST body.
Two calls at about 17:23Z both returned:

```text
HTTP 502 from /api/partners/match: error code: 502
```

Earlier calls on the same day also returned 502, including one at 16:01Z.
OpenAPI 1.9.116 documents 503 as "AI backend unavailable: fall back to GET /api/partners".
It documents no 502 response.

## Recommendation

Catch upstream model or gateway failures in the match handler.
Return the documented 503 JSON body with `unavailable: true` and a `Retry-After` header.
If a 502 can still reach clients, document it in OpenAPI with the same fallback instruction.
Investigate why the AI path failed for more than one hour, and restore it.
