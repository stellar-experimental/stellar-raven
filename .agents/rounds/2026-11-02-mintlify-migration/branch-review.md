# Independent review — Stellar Docs migration from Algolia to Mintlify

- Reviewer: Claude Fable 5.1, effort high (independent; not the author or the orchestrator).
- Date: 2026-11-02.
- Commit reviewed: `dfccf526827c88fef0a04adc02c3e83ea42cac5a` (branch `feat/mintlify-docs-migration`), diff against `03c863a3e30e20d0e8bb44b272f9e3c06235fdaf`.
- Worktree: `/private/tmp/claude-501/raven-mintlify-review` (detached). No commits, pushes, or GitHub writes. No wrangler process. No paid command.
- External evidence: the public Mintlify API reference, fetched 2026-11-02 from `https://www.mintlify.com/docs/api/assistant/search.md` and `.../get-page-content.md`, and the public `.md` renderings of four `developers.stellar.org` pages. No keyed Mintlify call was made.

## Findings

### 1. Major — every HTTP 404 becomes `soft-empty`, so a dead or renamed backend reads as "inconclusive"

- `src/adapters/stellar-docs.ts:400-403` (search) and `src/adapters/stellar-docs.ts:364-376` (page).
- The Mintlify API reference overloads 404 on both endpoints. Search 404: "No documentation site exists for this domain, or the search returned no results." Page 404: "No documentation site exists for this domain, the site doesn't have a search index, or no page exists at this path." The adapter maps every 404 on both endpoints to `kind: "soft-empty"`. `docs/stellar-docs.md` ("Result and absence semantics") does not mention the search 404 case at all; the spec `constraints.pagePaths` records only the `{"message":"Page not found"}` body for a missing page.
- Failure scenario: the docs team renames the Mintlify project subdomain, the site loses its search index during a rebuild, or the key's domain access changes in a way the API reports as 404. Every `stellarDocs.*` call then returns `soft-empty` with the hint "an empty search result does not prove the docs lack the topic". The model answers "the docs search was inconclusive" for every docs question. No `error` reaches logs, so the observability review sees no spike. The daily refresh contract probe is the only detector, and it runs once a day. The research note states the search endpoint never returned an empty set in 1,498 probes, so a search 404 is far more likely a configuration failure than "no results". This breaks the hard rule "Preserve service distinctions among soft-empty, error, and data responses".
- Suggested fix: on the search endpoint, classify a 404 as `error` (status 404, message from the body) unless the body carries a documented no-results form. On the page endpoint, classify a 404 as `soft-empty` only when the body `message` is `Page not found`; any other 404 body is `error`. Keep the `/index` retry and the site-redirect probe on the "Page not found" form only. Update the test at `test/adapters.test.ts:759` ("treats a search 404 ... as no sections") and add a test for a domain-level 404 body such as `{"message":"Documentation site not found"}`. Document the rule in `docs/stellar-docs.md`.

### 2. Minor — a single `get_doc_page` can run for 88 s; the execute budget is 60 s

- `src/adapters/stellar-docs.ts:355-367` (`fetchPage`, `siteRedirectPath`), `src/executor/run.ts:237` (`EXECUTE_TIMEOUT_MS = 60_000`).
- Each Mintlify request may take 8,000 + 12,000 ms. A page read chains up to four requests (path, `/index`, redirect target, redirect target `/index`) plus one 8,000 ms site probe: 4 × 20 s + 8 s = 88 s. The retired Algolia ladder capped one request at 20 s and the old sections operation was one request. The ledger's own latency data (p99 3.7 s, 4 of 1,498 first attempts over 8 s) shows the first-attempt timeout is sized well; the chain is not.
- Failure scenario: Mintlify degrades so that attempts time out. A script with one `get_doc_page` and several other calls is killed at 60 s by the execute runner. The model receives a generic timeout and loses every other result in the script, including results that had already arrived.
- Suggested fix: carry one per-operation deadline (for example 24 s) through `mintlifyRequest`, `fetchPage`, and `siteRedirectPath`, and skip the `/index` retry and the site probe when the deadline has passed. Record the per-operation bound in `docs/stellar-docs.md` "Limits".

### 3. Minor — heading and title regexes are quadratic in whitespace runs and cross line boundaries

- `src/adapters/stellar-docs.ts:219` (`firstHeading`), `:230` (`snippetOf` heading strip), `:387` (page `title`).
- The patterns use `^\s*` and `#\s+` under the `m` flag. `\s` matches newlines, so the engine re-scans the same whitespace run from every line start. Measured in Node 24.13: `/^\s*#\s+(.+?)\s*$/m` on 200,000 blank lines took 19.1 s; `firstHeading` on a heading line with 50,000 spaces took 4.3 s; 20,000 blank lines took 349 ms. The same `\s+` after `#` lets a line that is only `#` swallow the next line as the heading or title.
- Failure scenario: a page or chunk with a very long whitespace run (a large indented code block in a generated reference page, or an upstream formatting accident) stalls the host adapter for seconds on every search hit that carries it. Inputs are upstream docs content and are bounded (about 20 KB per chunk, about 150 KB per page), so this is a hardening item, not an exposure.
- Suggested fix: use `[ \t]` instead of `\s` inside the line: `^[ \t]*#{1,6}[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$`, and for the page title `^[ \t]*#[ \t]+(.+?)[ \t]*$`. Add a test with a bare `#` line followed by text.

### 4. Minor — manual live scripts still read the retired `nbHits` field

- `test/live/run-live-execute.mjs:32`, `test/live/run-live-spec-search.mjs:93`, `test/live-cases.test.mjs:35,51`.
- The search payload is now `{ hits, candidates, pathFiltered? }`. The live scripts print `docsNbHits: undefined`, and the offline test stubs a shape the adapter no longer returns.
- Suggested fix: read `docs.data.candidates` and update the stub.

### 5. Minor — the held title snapshot describes a retired credential pair, and the README describes it as llms.txt-derived

- `inventory/stellar-docs-titles.json:3-11` (`index`, `source.authEnv` naming `ALGOLIA_APPLICATION_ID_DOCS` and `ALGOLIA_API_KEY_DOCS`, the Algolia query URL) versus `inventory/README.md:51` ("Deduplicated page titles and paths from `llms.txt`").
- The ledger records the hold on purpose (routing gate: the 973-title snapshot adds two graded losses). The committed bytes are honest about their own provenance. The README is not: it describes the refreshed form, not the committed form. The daily refresh will rewrite the file and open or update a drift issue every day until #223 lands; `scripts/summarize-live-drift.mjs` will list hundreds of added pairs each time.
- Suggested fix: add one sentence to `inventory/README.md` and to the drift summarizer's titles section that names the hold and #223, so the daily issue reads as expected drift. This is a documentation and operations item, not a code defect.

### 6. Nit — stale comment names `x-algolia`

- `scripts/build-super-spec.mjs:19`. The vendor extension is now `x-mintlify`.

### 7. Nit — snippets drop single-identifier generics from code

- `src/adapters/stellar-docs.ts:226` (`MDX_TAG`). `Vec<Val>` becomes `Vec `, `Option<Address>` becomes `Option `, because `<Val>` matches `<[A-Z][A-Za-z0-9.]*\s*\/?>`. Only `snippet` is affected; `content` is unchanged. A docs reader can still misread a snippet such as `fn balance(env: Env) -> Option ` as the real signature. Consider skipping the replacement inside fenced code or requiring a known component name set.

### 8. Nit — redundant include prefixes

- `specs/stellar-docs.json`, `search_docs_in_category.mintlify.include` is `["/docs/{category}/", "/docs/{category}"]`. With whole-segment matching (`underPrefix`), the two entries are equivalent. Keep one.

## Checks that passed

Gate commands, run in the review worktree with a placeholder `.dev.vars` (names from `ci.yml`):

| Command | Result |
| --- | --- |
| `npm ci` | exit 0 |
| `npm run typegen` | exit 0; `Env` carries `MINTLIFY_ASSISTANT_API_KEY`, no `ALGOLIA_*_DOCS` |
| `npm run typecheck` | exit 0 |
| `npm test` | exit 0; 141 files, 3010 passed, 3 expected fail |
| `npm run build` | exit 0 (prebuild emitted-text guard passed) |
| `npm run test:smoke` | exit 0; 8 files, 125 passed |
| `npm run eval:routing -- --gate` | `GATE PASS`; legacy 218/294/327 within band; holdout and skills at or above floors; committed fingerprint `04065deb…` verified. Protocol-history diagnostic reports top-1 6/8 "FAIL"; it is a diagnostic that `eval/run-routing.mjs:349` never merges into a gate, and the ledger records the 7/8 → 6/8 move with its cause. |
| `npm run secrets:scan -- --tree` | clean (gitleaks: no leaks) |
| `npm run eval:qa:register -- --check` | exit 0 |
| `npm run improvements:lint` | exit 0 |
| `npm run eval:selftest` | exit 0 |
| `npm run eval:qa:lint -- --stale --enforce-floors` | **exit 1**: five `reverifyBy` dates past due (2026-11-01). All five cases carry the same date at base `03c863a3` and are untouched by this branch. CI runs this exact command, so the PR will be red until those five cases are re-verified under `golden-truth` or the owner records an override. Not caused by this branch. |

Adapter safety (`src/adapters/stellar-docs.ts`):

- The Bearer key is attached only in `attempt()`, which is called only with `${transport.apiBase}${searchPath|pagePath}`. The site redirect probe sends no headers, uses `redirect: "manual"`, cancels the body, and reads only status and `Location`. Every catalog entry carries `apiKeyEnv: MINTLIFY_ASSISTANT_API_KEY` and `apiBase: https://api.mintlify.com` (verified over all 12 entries); `test/adapters.test.ts:482-514` and `:977-1001` pin both through the real manifest entries.
- Redirect follow is bounded to one hop, same origin (`new URL(location, base).origin`), `/docs/` or `/meetings/` target, normalized target different from the request. A protocol-relative or cross-origin `Location` is rejected; `test/adapters.test.ts:1070` covers a cross-origin target and a redirect to `/`. No loop is possible.
- `normalizePagePath` strips origin, query, fragment, trailing slash, `.md`/`.mdx`, and leading slashes. The input schema pattern `^/(docs|meetings)/` is enforced host-side by `src/policy/validate.ts:81-90` before the adapter runs. `..` segments resolve inside `developers.stellar.org` and reach only the uncredentialed probe.
- Scoping: `underPrefix` matches whole segments (`/docs/tokens` does not keep `/docs/tokens-legacy`); exclude wins over include; conditional overrides resolve by `arg=value`; `{category}` fills from validated enum arguments. Tests at `test/adapters.test.ts:620-696, 776-792` cover these.
- Error classes: 4xx (401, 403, 429, 400) return at once as `error` with status; 5xx, network, body-read, and timeout retry once; malformed 2xx JSON and a non-array body are `error`, not soft-empty; a missing key is `error` before any request. `test/adapters.test.ts:865-958` and `:1102-1116` exercise each class with real call counts, not a throwing stub.
- `MDX_TAG` and the link rewriter show no catastrophic backtracking on adversarial inputs (50,000-space tag, 1,000 unterminated attributes in 1 MB: ≤ 2 ms; 1,000 unterminated brace values in 1 MB: 772 ms, linear in occurrences). The heading regexes are finding 3.
- The sandbox projection (`src/executor/providers.ts:590-603`) omits `transport` and `provenance`; env names and the API base never reach model code.

Secrets:

- `MINTLIFY_ADMIN_API_KEY` appears in no Worker binding, no `wrangler.jsonc` comment, no `ci.yml` stub, no `refresh.yml` secret, and no `src/` file. `scripts/scan-secrets.mjs:82` adds a `mint_(dsc_)?…` pattern. `src/policy/redact.ts` scrubs `MINTLIFY_ASSISTANT_API_KEY`; `test/policy.test.ts` and `test/code-scanning-regressions.test.mjs` assert the name set. `scripts/refresh-inventory.mjs:82,101` asserts the key value absent from every output; `inventory/stellar-docs.json` holds names only.
- `.agents/rounds/2026-11-02-mintlify-migration/retrieval-ab.mts` loads `.env` into memory and prints only aggregate JSON; `retrieval-ab-results.json` and the whole tree pass the secrets scan.

Manifest, spec, catalog, emitted text:

- 12 `stellarDocs` entries, all `transport.type: "mintlify"` with `endpoint` in `{search, page}`; no `algolia` key; `get_doc_page_sections` absent from the manifest, the super spec, `src/mcp/micro-map.ts`, `scripts/catalog-data/*`, `eval/plan/op-classes.json`, and `src/demo/page.ts`. The only remaining `get_doc_page_sections` strings outside dated records are negative assertions in tests, the dated note `ideas/docs-recency-ranking.md` (recorded 2026-07-15), and finding 4's live scripts.
- Spec descriptions match the adapter: `search_doc_titles` is page-level and ranks title (2), path (1), then rank (`groupPages`); search ops return `{ hits, candidates, pathFiltered? }` with `url, path, title, section?, snippet, content?`; `get_doc_page` returns `{ url, path, title, content }`; `includeContent` is absent from `search_doc_titles` and ignored for `groupBy: "page"`. `test/adapters.test.ts:1230-1285` validates every search op's wire payload against its `outputSchema`.

Golden and eval edits:

- The three changed cases (`q-edge-doc-page-sections-soft-empty`, `q-sor-doc-page-sections-followup`, `q-sor-doc-title-discovery`) match the adapter: status 404 soft-empty with hints naming `search_doc_titles` and `search_docs` (`stellar-docs.ts:370-376`); whole-page Markdown with `url, path, title, content`; page-level title ranking. Each cites class B sources (adapter, spec) and a class F live execution (the A/B harness), dated 2026-11-02, with a sibling sweep. `lifecycle-registry.json` hashes and `sample.json` corpus hash were regenerated; `eval:qa:register -- --check` passes.
- `eval/gates.json`: the re-baseline is an explicit act with per-case causes in the ledger (incidental tokens `with`, `types`, `1`, `in` from removed Algolia field names), a stated departure from the zero-regression standard with its reason (the Algolia index stopped updating on 2026-10-22), the held title snapshot with its measured cost, and the fingerprint of the committed manifest. The local gate reproduces the committed totals exactly.

Docs and skills:

- `docs/stellar-docs.md` describes the implemented transport, timeouts, scoping order, redirect rules, output shape, and limits accurately, except for the search-404 omission in finding 1. `AGENTS.md`, `ARCHITECTURE.md`, `PLAN.md`, `README.md`, `inventory/README.md`, `eval/qa/README.md`, `test/README.md`, and the three skills no longer describe Algolia docs behavior as current; the remaining Algolia text is scoped to the dormant `stellar-org` site pair or to dated records.
- `refresh.yml` drops the rule canary and its enum, keeps the drift and check-error classes distinct, and requires `MINTLIFY_ASSISTANT_API_KEY` in the canonical repository. The remote identity probe is keyless (`llms.txt`, `llms-full.txt` bytes), and the capacity check classifies only `developers.stellar.org` for docs.

## Verdict

APPROVE WITH CHANGES.

Required before merge: finding 1 (404 classification), with its test and the `docs/stellar-docs.md` sentence. Recommended in the same change: findings 2, 3, and 4. Findings 5 to 8 can follow. The red `eval:qa:lint --stale` lane predates the branch and needs a separate golden-truth re-verification of the five expired cases, or a recorded owner override, before CI can show green.
