# sls-080 recovery monitor — 2026-09-03

I used one direct MCP `tools/call` request against `http://localhost:8788/mcp`.
I called `execute` with `scout.explainRepo` only.
I did not use an answering model or a judge model.

Repository: `stellar/stellar-horizon`.

Question: `Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?`

| Field | Returned value |
| --- | --- |
| Constant and value | `MaxSupportedProtocolVersion uint32 = 28` |
| `generatedAt` | `2026-09-03T18:20:47.059Z` |
| `scannedRef` | `82660510ecda7fd365a14d08badb9d85fa22bc32` |
| `answerSource` | `knowledge-note` |
| `answerAsOf` | `2026-09-01T00:00:00Z` |
| Routed repository | `stellar/stellar-horizon` |
| `routedVia` | `explicit` |

The answer states that `internal/ingest/main.go` defines the constant.
I read that file at the returned `scannedRef`.
Lines 36–38 define `MaxSupportedProtocolVersion uint32 = 28`.
The source value equals the returned value.

PASS
