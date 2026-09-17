# Upstream short-fragment prefix match — verification report

- Date: 2026-09-16 (local).
- Mode: read-only. No filing, no messages, no vendor or product edits.
- Not inspected: holdout cases and fresh54 controls.
- Artifacts: `/tmp/raven-routing-audit-2026-09-17/code/upstream/`

## Verdict

- The defect exists upstream in `@cloudflare/codemode` `searchConnectors`. Raven's adaptation did not introduce it.
- It is present in 0.4.2 (our vendor base), 0.5.1 (installed), 0.5.2 (npm `latest`), and current `main` at `16b6856`.
- No existing issue or PR covers it.
- Correct target: Issues in `cloudflare/agents`, `packages/codemode`, using the repository `bug_report.md` template.

## Source commits checked

| Source | Tag object | Commit | Prefix rule |
|---|---|---|---|
| `main` (2026-09-17T00:16:47Z) | — | [`16b6856070f6c711486011b8b9dd926c2eaae52b`](https://github.com/cloudflare/agents/blob/16b6856070f6c711486011b8b9dd926c2eaae52b/packages/codemode/src/connectors/search.ts#L66-L71) | present, line 68 |
| `@cloudflare/codemode@0.5.2` (npm `latest`, modified 2026-09-11) | `cd99ecbe53d8879fc98f11cef86488c168fe1459` | [`5f7ad7e4edac2ec8dd1d6a31758f251cb52373fa`](https://github.com/cloudflare/agents/blob/5f7ad7e4edac2ec8dd1d6a31758f251cb52373fa/packages/codemode/src/connectors/search.ts#L68) | present, line 68 |
| `@cloudflare/codemode@0.5.1` (installed in `package.json`) | `df882216b8b7af1a1ac96cb2ad4f5e13e4978c76` | [`f089c5b6a13f98ad728f9c9cb9d729469b945233`](https://github.com/cloudflare/agents/blob/f089c5b6a13f98ad728f9c9cb9d729469b945233/packages/codemode/src/connectors/search.ts#L68) | present, line 68 |
| `@cloudflare/codemode@0.4.2` (vendor base) | `d872405ce7a13c526d5b2b8291925cee28529146` | [`062611de3dcf9278c5759a959d408ed0d736b64d`](https://github.com/cloudflare/agents/blob/062611de3dcf9278c5759a959d408ed0d736b64d/packages/codemode/src/connectors/search.ts#L68) | present, line 68 |

Upstream history of `packages/codemode/src/connectors/search.ts`:

- `80ad8deecfe9606d8ef1d505ad0115bbdb8e7073` (2026-07-21): codemode: add host-side runtime APIs (#1969)
- `b2b67623deab327042b99344d8ee530ae37a71b2` (2026-06-10): feat(codemode): connector model + durable runtime, snippets, and vite plugin (#1581)

Neither commit changed the prefix rule.

Published package checks:

- Installed `node_modules/@cloudflare/codemode/dist/index.js` (0.5.1), `//#region src/connectors/search.ts`: prefix rule at dist line 1319.
- `npm pack @cloudflare/codemode@0.5.2`, `dist/index.js`: prefix rule at line 1265.
- The extracted search regions of 0.5.1 and 0.5.2 are byte-identical (`diff s051.mjs s052.mjs`).
- `npm pack @cloudflare/codemode@0.4.2`: the same rule is present. The search region differs only in approval-annotation passthrough.

## Upstream code path

```ts
function normalizeSearchText(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_./:-]+/g, " ")
    .toLowerCase()
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeSearchText(value)
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

// scoreField
} else if (
  field.tokens.some((c) => c.startsWith(token) || token.startsWith(c))
) {
  score += weight * 2;
  matchedTokens.add(token);
}

// scoreMatch
const coverage = matchedTokens.size / queryTokens.length;
const minimumCoverage = queryTokens.length <= 2 ? 1 : 0.6;
if (coverage < minimumCoverage && !exactPhrase) return null;
if (coverage === 1) score += 25;
```

Mechanism:

1. `tokenize` keeps one- and two-character fragments created by punctuation. For example, `city's` → `city`, `s`, and `re-billed` → `re`, `billed`.
2. The second prefix direction, `token.startsWith(c)`, lets such a fragment match every query token that starts with it.
3. Each fragment match counts toward the coverage gate. An unrelated connector method can therefore pass the gate and can receive the full-coverage bonus.

Upstream use: `searchConnectors` is re-exported from `packages/codemode/src/connectors/index.ts:8`. It is called from `packages/codemode/src/runtime-handle.ts:170` and `packages/codemode/src/proxy-tool.ts:471`. It is not in the published package root exports.

## Minimal ecosystem-neutral reproduction

Script: `/tmp/raven-routing-audit-2026-09-17/code/upstream/repro.mjs`

Implementations tested:

- `s042.mjs`: search region extracted from the 0.4.2 dist.
- `s051.mjs`: search region extracted from the installed 0.5.1 dist.
- `s052.mjs`: search region extracted from the 0.5.2 dist.
- `search-main-run.ts`: `main` source at `16b6856`. Its type-only imports are erased by Node type stripping.

Connectors:

```js
[
  { name: "weather", descriptors: { getForecast: { description: DESC_A } } },
  { name: "billing", descriptors: { refundInvoice: { description: DESC_B } } }
]
```

| Case | DESC_A | DESC_B |
|---|---|---|
| Trigger | `Return a city's forecast.` | `Refund a re-billed invoice.` |
| Control | `Return the forecast for a city.` | `Refund an invoice billed twice.` |

Tokens:

- `Return a city's forecast.` → `return, a, city, s, forecast`
- `Refund a re-billed invoice.` → `refund, a, re, billed, invoice`

Results (identical for 0.4.2 dist, 0.5.1 dist, 0.5.2 dist, and `main` source):

| Query | Expected | Actual with trigger | Actual with control |
|---|---|---|---|
| `send slack message` | no results | `weather.getForecast`, score 27, total 1 (`send` and `slack` match fragment `s`; coverage 2/3) | no results |
| `read repository readme` | no results | `billing.refundInvoice`, score 55, total 1 (all three tokens match fragment `re`; coverage 3/3 plus the +25 bonus) | no results |

Patched comparison: `/tmp/raven-routing-audit-2026-09-17/code/upstream/repro2.mjs`. The patch requires `c.length >= 3` before `token.startsWith(c)` can match.

| Query | `main` | Patched | Raven vendored `scoreEntry` (weather, billing) |
|---|---|---|---|
| `send slack message` | `weather.getForecast` | no results | `[27, null]` |
| `read repository readme` | `billing.refundInvoice` | no results | `[null, 55]` |
| `city forecast` | `weather.getForecast` | `weather.getForecast` | `[153, null]` |
| `refund invoice` | `billing.refundInvoice` | `billing.refundInvoice` | `[null, 481]` |

The candidate patch is shown only to confirm the mechanism. It is not a proposed upstream change without broader measurement.

## Ownership

- Upstream owner: Cloudflare, `cloudflare/agents` monorepo, `packages/codemode/src/connectors/search.ts`.
  - Package `repository.url`: `git+https://github.com/cloudflare/agents.git`, directory `packages/codemode`.
  - Package `bugs.url`: `https://github.com/cloudflare/agents/issues`.
- Issue template: `.github/ISSUE_TEMPLATE/bug_report.md`. Sections: bug description, reproduction, expected behavior, version, additional context. Issues are enabled; the default branch is `main`.
- Raven adaptation, from `src/catalog/vendor/search-scoring.ts` (vendored from 0.4.2):
  - Field mapping is id/name/service/description, plus a low-weight `kind` field (2).
  - `normalizeSearchText` also treats `#` as a separator.
  - The tokenizer split, bidirectional prefix rule, and coverage gate match upstream exactly.
  - Raven vendored scores equal upstream scores for both false matches: 27 and 55.
- Conclusion: the defect is upstream.
  - Raven's separate layers (stopword gate-rescue, routing-keyword rescue, gated-tier treatment) can make the effect worse in Raven routing. They do not create it.
  - The RWA controls in the Raven audit show `simulate` matching `s` from "issuer's" and `read` matching `re` from "re-verified".

## Existing issue search

Method: authenticated `gh search issues --repo cloudflare/agents --include-prs` and the GitHub search API (`repo:cloudflare/agents …`) on 2026-09-16.

| Query | Total | Relevant result |
|---|---|---|
| `codemode search prefix` | 0 | none |
| `searchConnectors` | 0 | none |
| `"searchConnectors"` | 0 | none |
| `codemode search token` | 0 | none |
| `codemode search coverage` | 0 | none |
| `codemode search apostrophe` | 0 | none |
| `startsWith token` | 0 | none |
| `codemode search ranking` | 0 | none |
| `codemode search false positive` | 0 | none |
| `codemode search in:title` | 1 | #1588 [closed] export an OpenAPI search/execute tool helper — unrelated |
| `"connectors/search"` | 1 | #1656 [closed] reusable browser sessions — unrelated |
| `tokenize` | 2 | #1581 [closed] connector model introduction; #1159 [closed] memory FTS — neither reports this defect |
| `codemode "search" prefix` | 18 | none relevant |
| `codemode ranking` | 1 | #1297 [closed] Postgres sessions — unrelated |
| `search relevance` | 1 | #1297 — unrelated |
| `codemode search in:title,body` | 26 | none about ranking, tokenization, or prefix matching |

A control query, `codemode`, returned open issues (#2065, #2134, #2072, #1954, #1576). So the search worked, and the empty results are meaningful.

Status: no existing issue or PR found. Code search for `searchConnectors` found only `search.ts`, `connectors/index.ts`, `runtime-handle.ts`, and `proxy-tool.ts`. No upstream `search.test.ts` exists at `main`.

## Recommended upstream report content (not filed)

- Title: `codemode: searchConnectors matches unrelated methods through one- and two-character punctuation fragments`
- Version: `@cloudflare/codemode` 0.5.2 and `main` `16b6856`. Also reproduced in 0.4.2 and 0.5.1.
- Reproduction: the two connectors and two queries above, with the control descriptions.
- Expected: no result for `send slack message` or `read repository readme`.
- Actual: `weather.getForecast` (27) and `billing.refundInvoice` (55, full-coverage bonus).
- Context: this can inflate coverage for model-facing connector search through `runtime-handle` and `proxy-tool`. A minimal direction is to stop short field fragments from acting as universal prefixes. The upstream owner should measure that choice.
- Filing and messaging require separate approval. No external write was made.
