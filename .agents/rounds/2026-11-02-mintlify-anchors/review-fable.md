# Review rv-mint — Mintlify section anchors (independent review)

Reviewer: Claude Fable 5.1 (lane rv-mint). Author: Codex gpt-6.1-sol. Worktree:
`/private/tmp/claude-501/raven-mint-1102`, uncommitted diff vs main. No file in the worktree was
edited. All claims below were re-derived; the author's report was not trusted.

## Verdict: SHIP-WITH-FIXES

The lookup is safe. Across 12 live pages that are not in the fixture (949 source headings), the
adapter emitted 332 anchors and 0 wrong anchors. Every emitted anchor matched a rendered element
whose text equals the heading. The remaining 616 headings got the plain page URL (ambiguous or
absent). Two things must change before merge: the exposed manifest still tells the model that
sections have no anchor, and the index needs a refresh lane. The rest are minor.

Tests: `npx vitest run test/adapters.test.ts test/stellar-docs-anchors.test.ts test/stellar-docs-anchor-build.test.mjs`
passed, 3 files, 122 tests.

## Evidence summary

Live probe (scratchpad vitest file; fetched each page's HTML and its `.md` rendering, ran the real
`sectionAnchor` on every H2–H6 source heading, and compared the result with the rendered `id`):

| page | source H2–H6 | anchors | wrong | no anchor |
|---|---|---|---|---|
| /docs/build/smart-contracts/example-contracts/delegate-auth | 10 | 10 | 0 | 0 |
| /docs/tools/cli/agent-cli/reference/troubleshooting | 31 | 31 | 0 | 0 |
| /docs/tools/cli/agent-cli/reference/output-and-errors | 11 | 9 | 0 | 2 |
| /docs/tools/cli/agent-cli/reference/architecture | 12 | 11 | 0* | 1* |
| /meetings/2024/01/18 | 0 | 0 | 0 | 0 |
| /docs/learn/migrate/evm/solidity-and-rust-advanced-concepts | 36 | 22 | 0 | 14 |
| /docs/learn/fundamentals/contract-development/contract-interactions/stellar-transaction | 10 | 7 | 0 | 3 |
| /docs/build/guides/auth/contract-authorization | 17 | 15 | 0 | 2 |
| /docs/tools/cli/stellar-cli | 790 | 205 | 0 | 585 |
| /docs/data/oracles/oracle-providers | 19 | 11 | 0 | 8 |
| /docs/build/building-with-ai | 13 | 11 | 0 | 2 |
| /docs/build/apps (index page) | 0 | 0 | 0 | 0 |

\* My first pass flagged `Composition & Piping` → `composition-&-piping` as wrong because my raw
regex read the attribute as `composition-&amp;-piping`. HTML decodes attribute entities, and
happy-dom confirms the DOM id and the nav link href are both `composition-&-piping`. The generator
is right; the anchor is correct.

Coverage of the brief's cases: code spans (`__check_auth()` → `__check_auth`,
`` `stellar ledger entry fetch trustline` `` → `stellar-ledger-entry-fetch-trustline`), punctuation
(`Error(Contract, #13), "trustline entry is missing for account"` → `error-contract-#13--trustline-entry-is-missing-for-account`),
non-ASCII (`→` in delegate-auth headings, `’` on output-and-errors), repeated headings (six
`Solidity` headings → no anchor; `Test`/`test-1` → no anchor; `Connect your agent` with two custom
IDs → no anchor), index pages (`/docs/build/apps` has 10 card `<h2>` with React ids `_R_…` and no
nav link; the index records `{}`, so nothing is emitted), and a meetings page.

Real search hit shapes (production `stellarDocs.search_docs`, 7 queries, 52 hits): every `path` has
a leading slash, no trailing slash, no `/index`; index pages arrive as `/docs/build/apps`,
`/docs/build/smart-contracts`, which exist as keys. Section content starts with ATX headings such as
`#### When to \`require_auth\``, `### \`Error(Contract, #13)\`, \`"trustline …"\``, or with raw
HTML such as `<h3 id="app">` and `<h3 id="\_\_check_auth-get--verify--forward">`, or with
components (`<CardGroup cols={2}>`). Only the ATX form can receive an anchor today.

Sitemap: 972 `<loc>` entries, 0 end in `/index` or `/`, 1 excluded (`/meetings` root). The
generator's key form equals the adapter's `siteRelative` form.

Bundle: `dist/server.js` is 8,518,931 bytes raw, 1,678,760 bytes gzip, and contains the index
(`capturedAt` present). The Workers limit is 10 MB compressed on the paid plan; headroom is wide.
The 357,713-byte object literal is evaluated at isolate start; that cost is negligible.

## Findings

### 1. major — the exposed surface still says "Sections have no anchor"

`specs/stellar-docs.json:97` (and 10 more occurrences at lines 202, 321, 494, 602, 708, 814, 920,
1027, 1133) and `catalog/manifest.json` (11 occurrences): the `hits[].url` description reads
"Page URL on developers.stellar.org. Sections have no anchor." The manifest is the exposed surface
(ADR-0003). After this change the model is told the opposite of what it receives, and the
micro-map and super spec inherit the text. `docs/stellar-docs.md` was updated; the model-facing
text was not.

Fix: change the authored description in `specs/stellar-docs.json` to something like "Page URL on
developers.stellar.org, with a `#section` anchor when the section heading maps to exactly one
rendered heading ID; otherwise the page URL." Then run `node scripts/build-catalog.mjs`,
`npm run micro-map:build`, `npm run spec:build`, and `npm test` (the non-exposed-ref guard runs
there). Commit the regenerated artifacts.

### 2. major — the index has no refresh lane

`scripts/build-stellar-docs-anchors.mjs`, `docs/stellar-docs.md:305`, `scripts/README.md`: the
refresh is manual and "not CI-gated". The docs site deploys continuously. A stale index degrades
safely in the browser (a missing id lands at the top of the page; a heading that gains a twin keeps
its original id), so this is not a correctness blocker, but the uniqueness judgement and the
anchors go silently stale and nobody is told. The repository already runs a daily keyless lane for
exactly this class of drift: `.github/workflows/refresh.yml` (cron `17 6 * * *`), whose "detect
drift" step does `git diff --quiet -- inventory catalog specs`.

Recommendation (do not implement in this change): add `npm run docs:anchors:build` to
`refresh.yml` before the "materialize .env" step (it needs no secret), add
`src/adapters/stellar-docs-anchors.json` to the drift diff list, and surface the generator's JSON
summary (`changedPages`, `removedPages`, `ambiguousHeadings`) through
`scripts/summarize-live-drift.mjs` so the drift issue says what moved. The
`live-drift-resolution` skill then owns the bump, and the capture-time preservation already in the
generator keeps a no-change day diff-free. Until that lands, note the manual command in the
`live-drift-resolution` skill so a drift round refreshes it.

### 3. minor — the A/B replay and the custom-ID tests do not exercise real search content

`tmp/mint-a/fixture-ab.json`, `test/adapters.test.ts:483`, `test/stellar-docs-anchors.test.ts:27-31`:
the author's replay re-wrapped fixture headings as ATX lines and fed them to a mocked search. It is
a self-consistency check, not evidence from live hits; the live search attempt returned 401. In
production, the custom-ID headings the report highlights (`Application (app)` → `app`,
`Stellar.toml` → `stellar-toml`) arrive as raw HTML first lines (`<h3 id="app">`), so
`firstHeading` returns nothing and no anchor is emitted. The test `## Application (app)` → `#app`
pins a content form that live search never sends. The rule it pins (exact unique match) is still
right.

Fix: add an adapter test whose chunk content starts with `<h3 id="app">` and assert no `section`
and no anchor, so the actual live behavior is pinned. Optional follow-up, outside this change: when
the first line is `<hN id="…">`, the id is already in the content and could be used directly; that
is the only path by which custom IDs will ever reach a URL.

### 4. minor — the anchor is appended verbatim, including `#`, `&`, `’`, `"`, and `\`

`src/adapters/stellar-docs.ts:543`: `url: anchor ? \`${url}#${anchor}\` : url`. The index holds
ids such as `telling-#13-from-#6`, `composition-&-piping`,
`error-contract-#13--trustline-entry-is-missing-for-account`,
`the-token-family’s-error-envelope`, and `\_\_check_auth-get--verify--forward`. Browsers resolve
all of these: the fragment may contain `#` and `&`, and the HTML "find a potential indicated
element" step tries both the raw and the percent-decoded fragment. But a URL string with a second
`#` or a raw `’` is fragile in client link extraction, Markdown renderers, and log greps.

Fix: emit `encodeURIComponent(anchor)` (unreserved `-_.` stay as-is, `#` becomes `%23`, `’` becomes
`%E2%80%99`); browsers decode before id matching. Add one test pinning the encoded form for an id
with `#` and one with a non-ASCII character. If the team prefers verbatim, pin that choice in a test
instead so it is deliberate.

### 5. minor — generator failure and politeness behavior

`scripts/build-stellar-docs-anchors.mjs:35-37, 51-56`:
- `redirect: "error"` makes one 308 in the sitemap fail the whole run. The 2026-11-02 page-coverage
  check found 11 site 308 redirects for golden URLs, so moved pages are common on this site.
  Fail-closed is the right default, but the error names one URL and the other three workers keep
  fetching until they drain the queue after `Promise.all` has already rejected.
- No retry on 5xx or timeout; one transient error aborts a 971-page run.
- No `User-Agent`; the site cannot identify the crawler.

Fix: share one `AbortController` across workers and abort on first failure; retry once on 5xx and
timeouts; send a `User-Agent` naming the repository; collect every failed URL and print them before
exiting non-zero. Keep concurrency at 4; it is polite enough for ~971 requests.

### 6. minor — malformed previous index throws instead of being replaced

`scripts/build-stellar-docs-anchors.mjs:57`: `previous?.pages[path]` throws `TypeError` when the
existing file parses but has no `pages` (truncated or hand-edited). `JSON.parse` failures other than
ENOENT also propagate.

Fix: validate the previous shape (`previous?.pages && typeof previous.pages === "object"`) and treat
anything else as "no previous", so the run writes a fresh file.

### 7. minor — the fixture test is not an independent oracle

`test/stellar-docs-anchors.test.ts:9-23`, `test/fixtures/stellar-docs-anchors.json`: the fixture
pairs were produced by the same `extractPageAnchors` code that produced the index (captures three
minutes apart). A shared extraction bug (entity decoding, nav-link detection, zero-width handling)
would pass. The real independent checks are the `extractPageAnchors` unit test and the live probe
above. The fixture `heading` values are rendered text, so the fixture test never exercises
backtick stripping on captured data; only the four hand-written cases in the second test do.

Fix: add a handful of hand-transcribed pairs taken by eye from the live DOM, including
`composition-&-piping`, `__check_auth` for the source heading `` `__check_auth()` ``, and
`telling-#13-from-#6` for `` Telling `#13` from `#6` ``, with the source-form heading text, so the
fixture pins the rule against something the code under test did not generate.

### 8. minor — rendered text and search text diverge on smart quotes and wrappers

`src/adapters/stellar-docs.ts:290`: the adapter strips only backticks and zero-width spaces.
Mintlify renders `'` as `’` (source "The token family's error envelope", index key
`The token family’s error envelope`), and headings written as `**Subcommands:**` or
`[RedStone](https://www.redstone.finance)` keep their wrappers. All of these miss safely (page URL),
but they are the bulk of the non-ambiguous misses in the probe (2 of 11 on output-and-errors, 6 of 19
on oracle-providers).

Fix (optional, after a measured win): normalize `’`→`'` and `“”`→`"` on both the index key and the
lookup, and strip `**…**` and `[text](url)` wrappers in the lookup only. IDs are captured, so the
normalization cannot derive a wrong id; it can only widen exact matches. Keep the change behind a
test that proves no new ambiguity collapses two headings into one key.

### 9. nit — uniqueness is judged against SSR output, not source

`scripts/build-stellar-docs-anchors.mjs:19-23`: headings that Mintlify does not render server-side
(for example the first of three `JavaScript Usage` headings on `…/stellar-transaction`, rendered ids
are `javascript-usage-1` and `javascript-usage-2` only) are absent from the index. A search hit on a
non-rendered heading whose text is unique among the rendered ones would receive its rendered twin's
anchor. The target has the same text, so the harm is mild, and the `/docs/build/apps` case shows the
nav-link filter correctly rejects React-generated ids.

Fix: add one sentence to `docs/stellar-docs.md` naming this limit. No code change.

### 10. nit — docs overclaim custom IDs

`docs/stellar-docs.md:199`: "The index records rendered heading text and IDs, including custom IDs."
True of the index, but no custom-ID section can receive an anchor today (finding 3). Reword to say
the index records them and the adapter uses them only when the section content starts with an ATX
heading.

## Checks that passed (no finding)

- Path keys: sitemap and `siteRelative` agree; index pages and meeting pages resolve; pages outside
  the sitemap get no anchor (`Object.hasOwn`, so `__proto__`/`toString` keys are safe).
- H1 exclusion: `atxHeading(firstLine, 1)` skips `# ` lines; the index holds h2–h6 only, and only
  those carrying the "Navigate to header" link with `href === "#" + id`.
- Output shape: only `url` changes; `path`, `title`, `section`, `snippet`, `content` are unchanged;
  one mocked search request before and after (pinned in `test/adapters.test.ts`).
- Atomic write via `writeFileAtomic`; unchanged capture preserves bytes and `capturedAt`; keys sorted
  by path and by heading (`localeCompare` "en" under Node's bundled ICU); no secrets, no headers, no
  key use; `globalOutbound` untouched; happy-dom window closed per page and only heading fragments
  are parsed, so heap stays flat.
- Determinism: not re-run by me (a full capture is ~971 requests against the public site). The
  committed file's capture time (2026-11-02T21:26:45Z) and the author's gate log are consistent
  with the preserve-on-unchanged branch; the refresh lane in finding 2 would make this observable
  daily.
