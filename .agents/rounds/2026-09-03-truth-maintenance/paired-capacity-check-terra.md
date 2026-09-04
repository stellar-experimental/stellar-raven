# Free two-agent capacity check

Date: 2026-09-04
Route: Codex Terra, high effort
Orchestrator verification: Codex Sol
Outcome: `TECHNICAL PASS`

## Decision boundary

The free technical capacity gate passed.
The result supports the proposed two-agent concurrent topology.
It does not approve that topology for a paid run.
The owner must still accept the concurrent-load estimand in the signed authorization block.

## Method

Terra designed `eval/qa/check-paired-capacity.mjs` as a reusable free probe.
The script releases two remote-identity captures on one barrier.
Each successful capture makes seven public read-only requests.
The two captures therefore make 14 physical requests without retries.

The requests cover Scout OpenAPI, three Lumenloop inventory surfaces, and three Stellar Docs reads.
The script records concurrency, statuses, retries, transport errors, and response-header latency.
It also compares the two remote identity vectors.

The check used no paid model call.
It started no Wrangler process.
It changed no upstream or production state.
It did not read repository secrets.

## First attempt

Terra ran the first attempt inside its restricted agent sandbox.
The sandbox blocked every network request before an HTTP response arrived.
That attempt was `INDETERMINATE` and supplied no service-capacity evidence.

The attempt ran from `2026-09-04T09:36:20.636Z` through `2026-09-04T09:36:21.918Z`.
It produced 30 transport failures and 24 retry events.
The saved attempt has SHA-256 `238f75c4fc831b07b4d6ea90d5af0b1e8c514f0ee3d885e80e263f5955b9c58e`.

## Provisional v1 network run

The orchestrator reran the same script with an empty environment and approved network access.
The exact command was:

```sh
/usr/bin/env -i PATH=/usr/local/bin:/usr/bin:/bin \
  /usr/local/bin/node eval/qa/check-paired-capacity.mjs \
  --out /private/tmp/paired-capacity-live-2026-09-04.json
```

The run started at `2026-09-04T09:43:18.088Z`.
It completed at `2026-09-04T09:43:18.527Z`.
Its wall time was 439 ms.
The machine record has SHA-256 `23f02c458a788c1a66769e7af5451dbaa3dde0dd807aaa7e8f9dff8c9f1a0140`.
The executed script has SHA-256 `ed599fa3bc284cf41d1f9904da870705c3205aba5158eceaf2c23f6ae590b9f1`.

| Service | Requests | Successful | HTTP errors | Transport errors | Retries | `Retry-After` |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Scout | 2 | 2 | 0 | 0 | 0 | 0 |
| Lumenloop | 6 | 6 | 0 | 0 | 0 | 0 |
| Stellar Docs | 6 | 6 | 0 | 0 | 0 | 0 |
| Total | 14 | 14 | 0 | 0 | 0 | 0 |

The run reached 12 active fetches.
Both captures completed successfully.
Their remote identity vectors matched.
Both vectors had SHA-256 `afd993854a981d4a5a3026ad047347c7a62a1b731b887ec08d48d5b9e07bbc7f`.

| Measure | Minimum | p50 | p95 | Maximum | Mean |
| --- | ---: | ---: | ---: | ---: | ---: |
| Scout response headers | 232 ms | 232 ms | 255 ms | 255 ms | 244 ms |
| Lumenloop response headers | 167 ms | 171 ms | 173 ms | 173 ms | 171 ms |
| Stellar Docs response headers | 76 ms | 300 ms | 316 ms | 316 ms | 234 ms |
| Complete identity capture | 420 ms | 420 ms | 429 ms | 429 ms | 425 ms |

This run passed the provisional contract.
The `qa-paired-collection-plan-v2` repair later replaced that contract.
The provisional artifact cannot enter a v2 launch manifest.

## Authoritative v2 network run

The orchestrator reran the revised instrument after commit `1847ffd`.
The exact command used the same empty environment and public read-only request set.

```sh
/usr/bin/env -i PATH=/usr/local/bin:/usr/bin:/bin \
  /usr/local/bin/node eval/qa/check-paired-capacity.mjs \
  --out /private/tmp/paired-capacity-live-v2-2026-09-04.json
```

The run started at `2026-09-04T10:25:17.201Z`.
It completed at `2026-09-04T10:25:17.815Z`.
Its wall time was 613 ms.
The machine record has SHA-256 `f94663390187a52a89007ca22a23530c873cb8e00b4117bece045265a56c2423`.
The executed script has SHA-256 `59a52b96e890f0de4babb911022ed863c4ad5a62a6473b146007544143e8f3a9`.

The artifact uses `qa-paired-capacity-check-v2`.
It records `accepted: true` and an empty `rejectionReasons` array.
It reached 12 active fetches.
Both capture windows overlapped.

| Service | Requests | Successful | HTTP errors | Transport errors | Retries | `Retry-After` |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Scout | 2 | 2 | 0 | 0 | 0 | 0 |
| Lumenloop | 6 | 6 | 0 | 0 | 0 | 0 |
| Stellar Docs | 6 | 6 | 0 | 0 | 0 | 0 |
| Total | 14 | 14 | 0 | 0 | 0 | 0 |

Both remote identity vectors matched.
Their SHA-256 was `afd993854a981d4a5a3026ad047347c7a62a1b731b887ec08d48d5b9e07bbc7f`.

| Measure | Minimum | p50 | p95 | Maximum | Mean |
| --- | ---: | ---: | ---: | ---: | ---: |
| Scout response headers | 384 ms | 384 ms | 518 ms | 518 ms | 451 ms |
| Lumenloop response headers | 131 ms | 135 ms | 223 ms | 223 ms | 176 ms |
| Stellar Docs response headers | 75 ms | 251 ms | 386 ms | 386 ms | 258 ms |
| Complete identity capture | 499 ms | 499 ms | 613 ms | 613 ms | 556 ms |

The v2 artifact expires 86,400,000 ms after its completion time.
Any paid launch needs a fresh artifact and a final manifest at that launch revision.

## Instrument checks

- `node eval/qa/check-paired-capacity.mjs --self-test`: passed.
- `vitest run test/qa-paired-capacity.test.mjs`: passed.
- The test covers host classification, telemetry summaries, the release barrier, and vector matching.
- The complete branch validation later covers the instrument with the full test suite.

## Limits

This check covers public identity and inventory reads only.
It does not cover paid answering calls.
It does not cover authenticated Lumenloop operation traffic.
It does not prove sustained capacity across 200 paired rows.
It does not prove that future throttling will affect both arms equally.

The initial request burst exceeds the guard load from two serial answer turns.
This makes the check useful for immediate shared transport and rate-limit failures.
The paired receipt must still record timing and cancellation evidence.
Any runtime rate limit remains a stop condition.

## Conclusion

The free capacity check found no immediate shared transport or rate-limit problem.
The technical capacity evidence is sufficient for the proposed diagnostic.
The owner must still accept the concurrent-load estimand before paid collection.
