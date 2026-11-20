# Temporal observation scorer (Lane T)

Offline, deterministic, judge-blind diagnostic measuring whether the host observation anchor improves answer-time dating of mutable facts without promoting the anchor into evidence. Scores only the 12 preregistered cases in `expectations.json` (`temporal-expectations-v1`: 6 mutable positives × 2 rows, 6 controls × 1 row per surface/arm) from saved QA `/mcp` or `/playground/chat` artifacts (`{ meta, rows }`), passed with explicit `--input` labels.

Attribution is fail-closed: candidate rows must contain `--- OBSERVATION CONTEXT ---` inside a recorded `execute` result; baseline rows must lack it. Reported metrics per surface and arm:

- `asOfDatingRate`: positive answers binding an answer-time date/qualifier to the mutable claim.
- `staleAsCurrent`: stale assertions lacking their historical/as-of guard.
- `anchorAsFact`: control answers promoting the July 14 observation date into the CCTP publication or Meridian event date.
- `spuriousHedge`: hedging on a stable control core.

Does not read verdicts, goldens, or truth metadata (`perSurfaceBaseline` is context only; headline C/P/W stays separate).

## Commands

```sh
npm run eval:temporal:selftest

node eval/temporal/score-temporal.mjs \
  --input mcp:baseline:eval/qa/results/<mcp-baseline>.json \
  --input mcp:candidate:eval/qa/results/<mcp-candidate>.json \
  --input playground:baseline:eval/local-lanes/playground-semantic/<playground-baseline>.json \
  --input playground:candidate:eval/local-lanes/playground-semantic/<playground-candidate>.json \
  --output /tmp/temporal-score.json
```

Repeat an `--input` label when replicates span files. Schema, replicate, surface, or attribution errors exit non-zero (`Temporal scorer:`). No network or model calls.
