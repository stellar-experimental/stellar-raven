---
id: sls-097
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "POST /api/partners/match omits its HTTP 502 failure response from OpenAPI"
evidence:
  - "2026-11-02 Raven execute (production connector, read-only partner ranking): two sequential scout.matchPartners({need:'USDC to Mexican peso off-ramp anchor for remittances'}) calls both failed with 'HTTP 502 from /api/partners/match: error code: 502', status 502, latencies 554 ms and 203 ms. The response body was the plain text 'error code: 502', not JSON."
  - "Earlier same-day observations from the golden audit: three of three calls returned HTTP 502 (batch assets-anchors-seps-03), and a Raven scout.matchPartners call returned HTTP 502 at 2026-11-02T16:01Z (batch history-org-tokenomics-01). Failures occurred at observations more than one hour apart."
  - "2026-11-02T17:18Z live GET https://stellarlight.xyz/api/openapi.json (version 1.9.116) documents only 200, 429, and 503 for POST /api/partners/match. The 503 description is 'AI backend unavailable: fall back to GET /api/partners'. The operation description says the endpoint 'returns 503 `unavailable:true` otherwise (fall back to GET /api/partners filters)'."
  - "The original reproduction used Raven only. The 22:39Z recheck below also uses direct public POST requests."
  - "Golden consumers: eval/qa/corpus/battery case q-gap-match-partners-degrade records the 502 and now keys its fallback to any failure, not only to the documented 503."
  - "2026-11-02T22:39:05Z and 22:39:06Z recheck: the curl POST command in Evidence returned HTTP 502 twice. Content-Type is application/json. The error field says: Matchmaking hit a snag. Try the /partners directory filters. unavailable is absent. The earlier plain-text body does not recur in these checks."
  - "2026-11-02T22:37Z contract check: curl -sS https://stellarlight.xyz/api/openapi.json returned HTTP 200, version 1.9.116. POST /api/partners/match lists responses 200, 429, and 503, with no 502. Its 503 schema carries unavailable true and the GET /api/partners fallback."
  - "2026-11-02 calibration: rg -n '502|503|Anthropic.APIError|unavailable' over src/app/api/partners/match/route.ts at upstream 1388bdd79b3151208d2be3ce0117316c0bc9694b confirms an explicit 502 JSON handler for Anthropic.APIError. The missing-client path returns 503. A model failure cause and an introducing release remain unknown. The request uses the live documented need field; no dependency-bound broken snippet is alleged."
  - "2026-11-02 dedupe: gh search issues partners/match and gh search prs partners/match, each with --repo Stellar-Light/stellarlight and --state open/closed, found no dedicated report for this 502 schema omission. Merged #1755 and #1764 concern other failed reads and error contracts. rg -n -i 'partners/match|partner.match.*502|matchmaking' improvements/ found only this active Scout finding for the defect. Resolved sls-004 concerns method errors on other routes."
  - "2026-11-02 owner check: improvements/intake.json resolves this API finding to Stellar-Light/stellarlight. gh api repos/Stellar-Light/stellarlight confirms archived false and has_issues true. No override is needed."
---

## Finding

`POST /api/partners/match` returns HTTP 502, but OpenAPI does not describe that response.
OpenAPI `1.9.116` lists only 200, 429, and 503.
The live 502 now carries JSON with an `error` field and a directory fallback instruction.
It has no `unavailable: true` field.
Clients cannot derive this failure response from the published contract.

## Evidence

Read-only partner ranking reproduction:

```sh
curl -sS -D - -H 'Content-Type: application/json' \
  --data '{"need":"USDC to Mexican peso off-ramp anchor for remittances"}' \
  https://stellarlight.xyz/api/partners/match
curl -sS https://stellarlight.xyz/api/openapi.json
```

Two sequential requests at 2026-11-02T22:39:05Z and 2026-11-02T22:39:06Z returned HTTP 502.
Both returned `Content-Type: application/json` and this body:

```json
{"error":"Matchmaking hit a snag. Try the /partners directory filters."}
```

Earlier requests on 2026-11-02 returned the plain-text body `error code: 502`.
The current requests do not reproduce that body-format defect.
They still reproduce the undocumented status.
The response does provide a human-readable fallback instruction.

The published handler catches `Anthropic.APIError` and returns this 502 JSON response.
It returns 503 with `unavailable: true` when no AI client is configured.
OpenAPI describes only the latter response.
The observations do not establish the provider failure cause or continuous outage duration.

## Recommendation

Document the existing 502 JSON response in OpenAPI for `POST /api/partners/match`.
Describe the `error` field and the fallback to `GET /api/partners` filters.
Keep the handler response and the OpenAPI response schema consistent.
Alternatively, return the documented 503 unavailable response for this handler failure.
Investigate the ranking failure separately from the contract correction.
