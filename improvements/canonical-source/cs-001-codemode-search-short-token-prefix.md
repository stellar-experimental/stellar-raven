---
id: cs-001
service: canonical-source
status: reported-upstream
discovered: 2026-09-17
upstreamTitle: "codemode: searchConnectors matches unrelated methods through short tokens"
evidence:
  - "Source: https://github.com/cloudflare/agents/blob/16b6856070f6c711486011b8b9dd926c2eaae52b/packages/codemode/src/connectors/search.ts#L66-L71 (main, 2026-09-17). The same rule is at line 68 in tags @cloudflare/codemode@0.4.2 (062611de), 0.5.1 (f089c5b6), and 0.5.2 (5f7ad7e4)."
  - "2026-09-17T01:46Z local reproduction against the pinned main search.ts with Node v24.13.0 type stripping. Unrelated queries return weather.getForecast (27, 45, 27) or billing.refundInvoice (55). Controls without 1-2 character field tokens return no results. Intended queries still match (153, 481)."
  - The published dist/index.js search regions of 0.4.2, 0.5.1, and 0.5.2 return the same false matches; the 0.5.1 and 0.5.2 regions are byte-identical.
  - "Raven impact: src/catalog/vendor/search-scoring.ts:85 (adapted from 0.4.2) and the ungated replica at src/catalog/scoring.ts:474 carry the same rule. On one Raven routing control, the vendor gate matched 15 of 25 query tokens (coverage 0.6, the threshold). The reverse match actually→a supplied the deciding token; without it, coverage is 14/25 and the gate fails."
  - research/audits/2026-09-17-routing-audit/upstream-prefix-review.md records the commits, reproduction, ownership, and dedupe search.
  - research/audits/2026-09-17-routing-audit/scorer-followup-plan.md and porter-stem-experiment.md record the Raven-side ablations. Removing only the reverse prefix direction also removed query-side word forms such as forecasts→forecast.
  - "upstream issue filed 2026-09-17: https://github.com/cloudflare/agents/issues/2296"
---

## Finding

`searchConnectors` in `@cloudflare/codemode` returns connector methods that share no real word with
the query. `scoreField` accepts a prefix match in both directions:
`field.tokens.some((c) => c.startsWith(token) || token.startsWith(c))`.
With `token.startsWith(c)`, a one- or two-character field token matches every query token that starts
with it. Such tokens include articles such as `a` and fragments from `tokenize`, such as `s` from
`city's` and `re` from `re-billed`. Each match counts toward the coverage gate and the full-coverage bonus.

## Evidence

Reproduction at `main` commit `16b6856070f6c711486011b8b9dd926c2eaae52b`, with two unrelated connectors
(`weather.getForecast` and `billing.refundInvoice`):

| Descriptions | Query | Result |
|---|---|---|
| `Return a city's forecast.` / `Refund a re-billed invoice.` | `send slack message` | `weather.getForecast` 27 |
| same | `read repository readme` | `billing.refundInvoice` 55 |
| `Return the forecast for a city.` / `Refund an invoice billed twice.` | `add alarm` | `weather.getForecast` 45 |
| same | `archive all tasks` | `weather.getForecast` 27 |
| `Return the city forecast.` / `Refund duplicate invoice.` | all four queries | no results |
| `Return a city's forecast.` / `Refund a re-billed invoice.` | `city forecast`, `refund invoice` | 153, 481 |

The rule is unchanged in 0.4.2, 0.5.1, 0.5.2, and current `main`. No test file exists for
`connectors/search.ts` at `main`.

### Reproduce

Requires Node.js with TypeScript type stripping (tested on v24.13.0). No install is needed.

1. Download the file at the tested commit:

   ```sh
   mkdir codemode-search-repro && cd codemode-search-repro
   curl -fsSLo search.ts https://raw.githubusercontent.com/cloudflare/agents/16b6856070f6c711486011b8b9dd926c2eaae52b/packages/codemode/src/connectors/search.ts
   ```

2. Create `repro.mjs`:

   ```js
   import { searchConnectors } from "./search.ts";

   const connectors = (weather, billing) => [
     { name: "weather", descriptors: { getForecast: { description: weather } } },
     { name: "billing", descriptors: { refundInvoice: { description: billing } } }
   ];

   const cases = [
     ["punctuation fragment", "Return a city's forecast.", "Refund a re-billed invoice.", ["send slack message", "read repository readme"]],
     ["one-letter word", "Return the forecast for a city.", "Refund an invoice billed twice.", ["add alarm", "archive all tasks"]],
     ["control: no 1-2 char tokens", "Return the city forecast.", "Refund duplicate invoice.", ["send slack message", "read repository readme", "add alarm", "archive all tasks"]],
     ["sanity: intended queries", "Return a city's forecast.", "Refund a re-billed invoice.", ["city forecast", "refund invoice"]]
   ];

   for (const [label, weather, billing, queries] of cases) {
     for (const query of queries) {
       const { results } = searchConnectors(query, connectors(weather, billing));
       console.log(`${label} | ${JSON.stringify(query)} ->`, JSON.stringify(results.map((r) => [r.path, r.score])));
     }
   }
   ```

3. Run `node repro.mjs`. Output:

   ```text
   punctuation fragment | "send slack message" -> [["weather.getForecast",27]]
   punctuation fragment | "read repository readme" -> [["billing.refundInvoice",55]]
   one-letter word | "add alarm" -> [["weather.getForecast",45]]
   one-letter word | "archive all tasks" -> [["weather.getForecast",27]]
   control: no 1-2 char tokens | "send slack message" -> []
   control: no 1-2 char tokens | "read repository readme" -> []
   control: no 1-2 char tokens | "add alarm" -> []
   control: no 1-2 char tokens | "archive all tasks" -> []
   sanity: intended queries | "city forecast" -> [["weather.getForecast",153]]
   sanity: intended queries | "refund invoice" -> [["billing.refundInvoice",481]]
   ```

How the false matches score:

- `read repository readme`: all three query tokens match the field token `re`. Coverage is 3/3, so
  the score is 3 × 10 + 25 = 55.
- `add alarm`: both query tokens match the field token `a`. Coverage is 2/2, which passes the
  strict two-token gate, and the result gets the full-coverage bonus.
- `send slack message`: `send` and `slack` match `s`. Coverage is 2/3, which passes the 0.6 gate.

## Recommendation

Stop short field tokens and punctuation fragments from satisfying the coverage gate for unrelated query
words. Keep intended matches and regular query-side word forms. Raven measured that removing only
`token.startsWith(c)` also drops matches such as `forecasts` → `forecast`. Add regression tests with the
unrelated queries, the controls, and the intended queries above.
