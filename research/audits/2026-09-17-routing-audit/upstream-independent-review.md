# Independent verification: codemode `searchConnectors` short-token prefix match

- **Date:** 2026-09-17.
- **Mode:** read-only.
  - No issue, comment, or message was filed.
  - No product edits, servers, paid calls, or holdout access.
  - External calls were read-only GitHub API calls, raw GitHub downloads, and `npm pack` / `npm view`.
- **Reviewed:** `upstream-prefix-review.md` and `code/upstream/repro.mjs`.
- **Verification workspace:** `/tmp/raven-routing-audit-2026-09-17/upstream-verify/`.
- **Final issue body reviewed:** `upstream-issue-body.md`, SHA-256
  `de948519df7c9ba4ca65f5d760a535029b7a659b05efb970bc5e758ec39f7e74`.
- **My earlier draft (superseded by the body):** `upstream-issue-draft.md`, SHA-256
  `059248bab1e12eefc7e92a78f49ea3e0cafa79dc2ff294047802cbed13a54a92`.

## Verdict

**No factual blocker.** The defect is real and upstream. It reproduces from independently obtained
sources. The final issue body is accurate and complete, and its reproduction instructions run as
written.

The prior review was correct on owner, versions, mechanism, scores, and duplicates. It understated
the scope: ordinary short words cause the same false match, not only punctuation fragments. Its
"control" descriptions were not free of short tokens. The final issue body contains both
corrections.

## Owner

- **Repository:** `cloudflare/agents`, file `packages/codemode/src/connectors/search.ts`.
- **Faulty line:** line 68 in `scoreField`:
  `field.tokens.some((c) => c.startsWith(token) || token.startsWith(c))`.
- **npm metadata** (`npm view @cloudflare/codemode`): `repository.url`
  `git+https://github.com/cloudflare/agents.git`, directory `packages/codemode`; `bugs.url`
  `https://github.com/cloudflare/agents/issues`.
- **Repository settings:** issues are enabled, and the default branch is `main`. The only template
  is `.github/ISSUE_TEMPLATE/bug_report.md`, with these sections: Describe the bug, To Reproduce,
  Expected behavior, Screenshots, Version, Additional context. The prior review omitted Screenshots.
  The final body includes it.
- **Callers:** `searchConnectors` is re-exported from `connectors/index.ts` but not from the package
  root. It is called only in `runtime-handle.ts` (`search`) and `proxy-tool.ts` (the `codemode`
  provider's `search`). GitHub code search for `searchConnectors` returns exactly 4 files: those two,
  plus `search.ts` and `connectors/index.ts`.
- **Tests:** no test file for connector search exists in the `main` tree.

## Source identity (rechecked at write time)

| Source | Result |
|---|---|
| `main` HEAD | `16b6856070f6c711486011b8b9dd926c2eaae52b` (unchanged) |
| Latest commit touching `search.ts` | `80ad8deecfe9606d8ef1d505ad0115bbdb8e7073` (#1969); the only other is `b2b67623deab` (#1581) |
| `search.ts` at `main` | SHA-256 `15ef317d630b3df60e6cc48bb879d835d2a4e968214f0b4096265504364981e0` |
| `search.ts` at the 0.5.2 commit `5f7ad7e4…` | byte-identical to `main` |
| Raw download used by the issue repro | byte-identical to `main` |
| Prior review copy `code/upstream/search-main.ts` | byte-identical to `main` |
| npm `latest` | `0.5.2` |
| Fresh `npm pack @cloudflare/codemode@0.5.2` tarball | SHA-256 `605f140c…64f1`, identical to the prior review's tarball |
| Fresh `npm pack` 0.4.2 and 0.5.1 | extracted `dist/index.js` search regions contain the same rule |

## Reproduction (run independently)

### Implementations

- raw `main` source (Node type stripping; its only imports are type-only)
- the `//#region src/connectors/search.ts` block extracted by me from freshly packed 0.4.2, 0.5.1,
  and 0.5.2 `dist/index.js`

### Results

The results were identical across every implementation:

| Descriptions (weather / billing) | Query | Result |
|---|---|---|
| `Return a city's forecast.` / `Refund a re-billed invoice.` | `send slack message` | `weather.getForecast`, 27 |
| same | `read repository readme` | `billing.refundInvoice`, 55 |
| `Return the forecast for a city.` / `Refund an invoice billed twice.` | `add alarm` | `weather.getForecast`, 45 |
| same | `archive all tasks` | `weather.getForecast`, 27 |
| `Return the city forecast.` / `Refund duplicate invoice.` (no 1–2 character tokens) | all four queries above | no results |
| `Return a city's forecast.` / `Refund a re-billed invoice.` | `city forecast` | `weather.getForecast`, 153 |
| same | `refund invoice` | `billing.refundInvoice`, 481 |

I also ran the exact issue instructions in an empty directory: `curl` the raw file at `16b6856`,
write `repro.mjs`, and run `node repro.mjs` on Node v24.13.0. It printed all ten expected lines and
exited 0. The root also reproduced the exact issue script with all ten expected outputs.

### Hand check of the scores

The description field weight is 5, and a prefix match adds weight × 2 = 10.

- `read repository readme`: each of 3 query tokens matches field token `re` (+30). Coverage is 3/3,
  which adds +25, for **55**.
- `add alarm`: `add` and `alarm` match field token `a` (+20). Coverage is 2/2 (the two-token gate
  requires 1.0), which adds +25, for **45**.
- `send slack message`: `send` and `slack` match `s` (+20). Coverage is 2/3, which passes the
  0.6 gate and adds round(6.67) = 7, for **27**.
- `archive all tasks`: `archive` and `all` match `a` (+20). Coverage is 2/3, which adds +7, for
  **27**.

## Claims in the prior review

| Claim | Status |
|---|---|
| Defect exists upstream; Raven did not introduce it | Confirmed |
| Present in 0.4.2, 0.5.1, 0.5.2, and `main` `16b6856` | Confirmed from fresh packs and fresh source |
| Rule unchanged since #1581 | Confirmed (2 commits touch the file) |
| Mechanism: punctuation fragments plus the reverse prefix direction inflate coverage | Confirmed, but **incomplete**: ordinary words such as `a` and `an` do the same |
| Its "control" descriptions show no false match | True only for its two queries. The control descriptions still contain `a`, `an`, `the`, and `for`, so `add alarm` still matches. Not a true short-token-free control. |
| Scores 27 and 55; intended queries still match (153, 481) | Confirmed |
| Not exported from the package root; reached through `runtime-handle.ts` and `proxy-tool.ts` | Confirmed |
| Issue template sections | Incomplete: Screenshots section omitted |
| No existing issue or PR | Confirmed (see duplicate search) |

## Duplicate search (independent)

Tool: `gh search issues --repo cloudflare/agents --include-prs`. Each query below returned
**0** results:

- `searchConnectors` (rechecked at write time: 0)
- `codemode search prefix`
- `codemode search false positive`
- `codemode search irrelevant`
- `codemode search results`
- `codemode tokenize`
- `codemode search matches`
- `codemode search short`
- `connector search`
- `codemode search scoring`
- `search.ts codemode`
- `codemode startsWith`

The control query `codemode` returned open issues #2134, #2072, and #1576, so the search tool
worked. The prior review's broader query table also found only unrelated results.

## Final issue body review (`upstream-issue-body.md`)

- **Template sections:** all six present, in template order. The title is supplied separately.
- **Mechanism text:** the prefix rule quotation matches `main` line 68 exactly. The description of
  short tokens covers both articles and punctuation fragments. The coverage-gate and `+25` claims
  match the source.
- **Reproduction:** the commit-pinned raw URL resolves to the verified file. The script, the
  ten-line output, and the three score explanations match independent runs and hand calculation.
- **Controls:** there are two unrelated domains (weather and billing). The short-token-free negative
  control returns nothing, and the positive sanity queries still match.
- **Version section:** accurate.
- **Additional context:** accurate. The arbitrary length-3 suggestion is removed. The request to
  preserve intended prefix search while stopping incidental short fragments from satisfying the
  gate is neutral and fits the measured problem.
- **Neutrality:** the body contains no project-specific, ecosystem-specific, or secret content.

## Minor, non-blocking notes

- "Requires Node.js with TypeScript type stripping" is accurate. The tested version is stated. Older
  Node versions may need `--experimental-strip-types`.
- The body's "Short punctuation fragments and common articles" wording under Expected behavior
  describes the observed classes. The mechanism applies to any field token of one or two
  characters, which the Describe-the-bug section already states.
- Filing requires separate owner approval. Nothing was filed.
