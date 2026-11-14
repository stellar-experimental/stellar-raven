# SORG-REVIEW: independent review of `feat/stellar-org-source`

Lane `sorg-review`, Claude Sonnet 5.5 (reviewer; author was Claude Opus 5.5), 2026-11-14. Brief:
[`briefs/sorg-review.md`](../briefs/sorg-review.md). Reviewed `866c5f9f` against `origin/main`
(`fc33c6e8`). No deploy, no upstream post, no model-calling eval. Tier note: the matched tier for
a Claude-authored adapter change is Codex frontier; this lane was assigned Sonnet 5.5 by the
orchestrator, so the review is Claude-on-Claude and the vendor-diverse attack is still open.

## Verdict

**Not fit to merge as is. Two blocking findings, each a one-line fix. Everything else is
non-blocking.** After F1 and F2, the branch is fit to merge.

- The routing claim holds: 0 grade changes and 0 top-1 changes on all 544 rows against
  `origin/main`; the `gates.json` re-baseline follows the `run-evals` rule.
- Generated files are in sync, the five bare gates exit 0, and no secret, binding, or sandbox
  egress changed (`globalOutbound` is still `null`).
- **F1 (blocking):** the `/api` refusal does not hold. Percent-encoded dot segments and letters
  pass the guard and reach `https://stellar.org/api/search` live.
- **F2 (blocking):** the HTML tag scanner is quadratic. An unterminated `<!--` of 800 KB costs 88
  s of CPU, and the page cap is 2 MB.

## Findings, ranked

### F1 (blocking): the path guard passes encoded dot segments and encoded letters

`src/adapters/stellar-org.ts:35` (`PATH_RE` allows `%`), used at `:60`.

`normalizeSitePath` checks `.` and `..` and the `/api` prefix on the raw string. `fetch` then
parses the URL, and WHATWG parsing treats `%2e` as a dot and collapses `/foo/%2e%2e/api/x` to
`/api/x`. Percent-encoded letters (`/%61pi/search`) are decoded by the server. Observed live:

| Input `path` | Expected | Observed |
|---|---|---|
| `/%2e%2e/api/search` | refused, no request | request sent; `HTTP 400 {"error":"invalid_query"}` (the `/api/search` handler answered) |
| `/foo/%2e%2e/api/x` | refused | accepted by `normalizeSitePath`; `new URL(...).pathname` is `/api/x` (not sent live; same class as the rows around it) |
| `/.%2e/api/search`, `/%2e/api/search` | refused | request sent; same 400 |
| `/%61pi/search` | refused | request sent; same 400 |
| `/foundation/%2e%2e/foundation/roadmap` | refused or normalized | **ok**, and `data.url`/`data.path` echo the un-normalized `%2e%2e` form |
| `/foundation%2fstrategy` | refused | request sent; the site answers 307, then "redirects more than 3 times" |
| `/foundation/strategy%00` | refused | request sent; raw nginx `400 Bad Request` HTML in the error message |

The blast radius is small: a keyless same-origin GET with no query string. But the tool schema
description, the spec, and the error hint all say `/api` paths are refused, and that is false. The
brief's encoded-slash and encoded-dot cases are exactly this class.

**Fix** (one character, `src/adapters/stellar-org.ts:35`): stop allowing `%`. No stellar.org page
slug measured in this lane needs it.

```ts
const PATH_RE = /^\/[A-Za-z0-9._~\-/]*$/;
```

I ran this change against a scratch copy of the module: `/%2e%2e/api/search`, `/%61pi/search`
and `/foo%2fbar` all return `null`; `/foundation/strategy` and `/foo-bar_1.2~x` still pass. Search
rows whose path contains `%` are then dropped by `siteHits` (it calls `normalizeSitePath`), which
also closes the `/%62log/x` hole in F9. I did not re-run `test/stellar-org-adapter.test.ts` against
the change; no existing test uses `%` in a path.

Add these cases to the refusal table in `test/stellar-org-adapter.test.ts` (the `it.each` after
line 192, which asserts `normalizeSitePath(raw)` is `null` and that no request is made):

```ts
"/%2e%2e/api/search",
"/foo/%2e%2e/api/x",
"/.%2e/api/search",
"/%2E/api",
"/%61pi/search",
"/foundation%2fstrategy",
"/foundation%5cstrategy",
"/foundation/strategy%00",
```

Cases that already behave correctly (all `null`): `//evil.com`, `/\evil.com`, `/foo\bar`,
`/a@b`, `/@evil.com`, `/é`, `/foo\r\nHost: x`, `/foo%0d%0aX:1`, `/foo?x=1`, `/foo#x`, `/foo/./bar`,
`/foo/..`, `https://evil.com/x`, `stellar.org/x`, a 601-character path, `/foo;a=b`, `/foo:bar`.
Leading and trailing whitespace is trimmed (`" /foo "` becomes `/foo`).

### F2 (blocking): `TAG_RE` backtracks quadratically on unterminated markup

`src/adapters/stellar-org.ts:130` (`TAG_RE`), used by `mainHtml` (`:194`) and `htmlToText`
(`:142`).

`<!--[\s\S]*?-->` scans to the end of the document for every unterminated `<!--`, and
`<(...)\b[^>]*>` scans to the end for every `<a ` that has no `>`. Measured (Node 26, one pass of
`htmlToText(mainHtml(s))`):

| Input | Size | Time |
|---|---|---|
| `<main>` + `<!--` repeated | 100 KB | 1.4 s |
| same | 200 KB | 5.4 s |
| same | 400 KB | 21.8 s |
| same | 800 KB | **88.1 s** |
| `<main>` + `<a ` repeated | 75 KB | 2.6 s |

The doubling-times-four growth is quadratic. The page cap is 2,000,000 bytes, so the worst case
is minutes of CPU on the Worker thread. Reaching it needs hostile markup on a stellar.org page or
a compromise of that site, so this is a robustness defect, not a live exploit; but the cap
exists to bound exactly this kind of cost, and the fix is one line.

**Fix** (`src/adapters/stellar-org.ts:130`): let an unterminated comment run to the end, and stop
tag bodies at the next `<`.

```ts
const TAG_RE = /<!--(?:[\s\S]*?-->|[\s\S]*$)|<(\/?)([A-Za-z][A-Za-z0-9-]*)\b[^<>]*>/g;
```

Scratch-copy result with 1,000,000 repeats: unterminated comment (4 MB) 11 ms, `<a ` (3 MB) 182
ms, `<a<a` (4 MB) 42 ms. A normal fragment still renders as before
(`# T`, `a b`, `- one`, `- two`). Add a test that feeds `"<main>" + "<!--".repeat(500_000)` and
asserts it returns within a second.

### F3 (should fix): an empty page is an `ok` result with no caveat

`src/adapters/stellar-org.ts:359-368`.

`get_page` on a client-rendered shell (empty `<main>`, or a body that is only chrome) returns
`ok` with `content: ""`. The host's `hasServiceData` treats the `url`, `path`, and `title` strings
as data, so no `no-rows` caveat appears. Observed with a fake 200 `<html><body><nav>menu</nav></body></html>`:
`ok`, `content: "menu"`; with an empty body: `ok`, `content: ""`. The author's own note says later
pages of `/audit-bank/projects` render client-side, so this case is real.

**Fix:** after `const text = htmlToText(mainHtml(html));`, return a soft-empty when it is empty:

```ts
if (!text) {
  return errResult({
    service: SERVICE, kind: "soft-empty",
    message: `${path} rendered no server-side text.`,
    hint: "The page may load its content in the browser. This is not evidence the topic is absent."
  });
}
```

Optionally drop the `<body>` fallback in `mainHtml` (`:221`): it returns navigation chrome as page
text, and a real page always has `<main>` (`/foundation/strategy`, `/ecosystem`, `/` all do).

### F4 (should fix): the redirect error says "off stellar.org" for on-site redirects

`src/adapters/stellar-org.ts:316-324`.

A same-origin redirect to a URL with a query string, or to `/api/...`, is refused with
"redirects off stellar.org to https://stellar.org/b; it is not a stellar.org page. Read the target
with the source that owns that site." Observed: `302 -> https://stellar.org/b?x=1` and
`302 -> /api/search?q=x` both produce that text. The refusal is right; the message points the
model at the wrong source. Split the message: off-origin keeps the current text; a same-origin
refusal says "redirects to a stellar.org URL this tool does not read (query string or /api)".
Also, `new URL(location, ...)` on an unparsable `Location` throws, and the caller reports a bare
`Invalid URL`. Both still end in `kind: "error"`, so the envelope stays right.

### F5 (should fix): no per-operation deadline

`src/adapters/stellar-org.ts:24, 259-266, 309`.

Each hop gets a fresh 12 s signal, so `get_page` can take 4 x 12 = 48 s of a 60 s execute
timeout (`src/executor/run.ts:238`). The Docs adapter bounds one operation to 24 s
(`OPERATION_BUDGET_MS`, `stellar-docs.ts:36`). Measured: a fetch that never answers, and a body
that drips, both end at 12.00 s with `"The operation was aborted due to timeout"` as `kind: "error"`
(correct kind). **Fix:** compute one `deadline = Date.now() + 24_000` in `page()` and pass
`Math.min(12_000, deadline - Date.now())` to each hop; return the same error when it runs out.

### F6 (low): search reads an unbounded body and keeps unbounded row fields

`src/adapters/stellar-org.ts:275` (`await res.text()`), `:92-102`.

`get_page` reads through `readCapped`; `search` does not, and a row's `description` or `tags`
are not clipped (a 100,000-character description passed through unchanged in my probe). The host
caps the final `execute` return near 6k tokens, so this costs context, not safety. **Fix** if you
touch the file anyway: `readCapped(res, 256_000)` for the search body and
`description.slice(0, 500)` in `siteHits`. Skip it otherwise.

### F7 (low): filter holes for case and a locale prefix

`src/adapters/stellar-org.ts:49-51, 91`.

`underPrefix` is case-sensitive and does not know `/en/...`: `/BLOG/x`, `/en/blog/x` and
`/es/blog/x` pass `siteHits`. The site's search returns canonical lower-case, unprefixed paths
for `locale=en` (every row I saw), so this only matters if upstream changes. `/BLOG` redirects to
`/blog` live. **Fix** if desired: lowercase the path before the `EXCLUDED_PREFIXES` test.
Not worth a test round.

### F8 (info, no change): decoding and line handling

- Charset is ignored (`:256`, `new TextDecoder()` is UTF-8). A `charset=iso-8859-1` body decodes
  `é` to U+FFFD. stellar.org serves `text/html; charset=utf-8`; leave it.
- Consecutive identical lines are dropped (`:177`). That is deliberate for responsive duplicates,
  and it would also drop a genuine repeated cell such as two adjacent "Yes" rows. Acceptable for
  the pages this source serves.
- Content type is matched as `text/html` case-insensitively; `application/xhtml+xml`, JSON,
  `text/plain`, `text/xml` (`/sitemap.xml`) and a missing type are all refused as errors.
  A 2,000,001-byte body is refused both by declared `content-length` and while streaming
  (two-byte characters included). Verified.

## 1. Fetch boundary: what held

Observed by running the adapter (fake `fetch`, plus live reads for the paths marked live):

| Input | Result |
|---|---|
| redirect to `https://evil.com/x`, `//evil.com/x`, `http://stellar.org/b` (downgrade), `https://stellar.org@evil.com/b`, `https://evil.com\@stellar.org/b` | `kind: "error"`, no second request, target named |
| redirect with a query string, to `/api/...`, to `/%2e%2e/api/x` | `kind: "error"`, no second request (message wrong, F4) |
| 302 with no `Location` | `kind: "error"` |
| 3 hops then 200 | ok; a 4th hop is refused ("redirects more than 3 times") |
| A to B to A loop | refused after 4 requests |
| `Location` with CRLF | the platform rejects the header before the adapter sees it |
| query `a\r\nHost: evil`, `é☃ ✓`, 5,000 characters | sent URL-encoded (`%0D%0A`); the `&locale=` parameter cannot be injected |
| query of 201 characters at the adapter (live) | upstream 400 `invalid_query`, `kind: "error"`; the manifest `maxLength: 200` refuses it first |
| search returns HTML (challenge page) with 200 | `kind: "error"`, "malformed JSON" |
| search 403 with HTML body | `kind: "error"`, first 512 characters of the raw body in the message |
| search 308 | `kind: "error"` (`manual` redirect is not followed) |
| `get_page` `/nonexistent-zzz-12345` (live) | `soft-empty`, status 404 |
| `/robots.txt`, `/sitemap.xml` (live) | refused, not HTML |
| `/BLOG`, `/Foundation/Strategy` (live) | server redirects to the lower-case path; followed; ok |

No secret, binding, or egress change: `git diff origin/main...HEAD` touches no file under
`src/executor/`, `wrangler.jsonc`, `package.json`, or `package-lock.json`. `globalOutbound: null` is
still at `src/executor/run.ts:312` and `:545`. `callStellarOrg(entry, args, fetchImpl)` takes no
`env`, so no key can reach it; the call still goes through the shared `guard` and `redactSecrets`
path in `buildOpsFns`. The origin is a constant at `:21` and the URL is built by concatenation to
a path that cannot contain `@`, `\`, `?`, `#`, `//`, or non-ASCII (once F1 closes `%`).
User-Agent is `RavenMCP/1.0`.

## 2. Untrusted text: is this adapter weaker than Docs?

Neither adapter labels upstream text as data; the model-facing data-versus-instruction guidance is
host-wide (`source-basis.ts` marks emitted URLs "data-derived/untrusted"; the execute return is
capped near 6k tokens). So the comparison is on bounds and on who writes the text.

| | Docs adapter | stellar.org adapter |
|---|---|---|
| Page text bound | none in the adapter; host cap only | 40,000 characters, `truncated: true` |
| Raw body bound | n/a (JSON API) | 2,000,000 bytes (page); **none on search** (F6) |
| Row field bounds | snippets are windows of section text | none on `title`, `description`, `tags` (F6) |
| Error text | first 1,024 characters | first 512 characters |
| Author of the text | SDF docs repo (reviewed PRs) | SDF's CMS, plus **partner rows**: ecosystem partner descriptions written by third parties |
| Hidden text | markdown source, visible by construction | `htmlToText` keeps every text node, including `hidden` and screen-reader-only text |

**Verdict: slightly weaker in two places, stronger in one.** Weaker: the search rows carry
third-party partner descriptions with no length bound (F6, and see bloat item 1: cutting partner
rows removes the third-party channel), and hidden page text is not filtered. Stronger: a hard
page-text cap that Docs does not have. I would not build hidden-element filtering (first-party
site, no measured case); cutting partner rows is the cheap mitigation.

## 3. Envelope and errors

Distinct as in the other adapters, with one gap (F3):

- Search with rows: `ok`, no caveat. Search with 0 rows, or all rows filtered: `ok`, `hits: []`;
  the host adds `caveat: "no-rows"` (`hasServiceData` ignores `meta`, `providers.ts:220`). Verified
  through `buildSandbox` by the author's test at line 123 and by my probe of `{results: []}`.
- Page 404 or 410: `soft-empty` with a hint that absence on this site is not absence of the
  topic. Verified live.
- 403, 5xx, 400, network failure, timeout, malformed JSON, non-HTML, over-size, redirect refusal,
  bad path: `kind: "error"`. Verified.
- Empty or chrome-only page: `ok` with no caveat. **Gap, F3.**
- `asOfBasis` is `"observed"`; the site states no data date.

## 4. Routing

Command, run bare on the branch: `npm run eval:routing -- --gate` exit 0, `GATE PASS`.
Baseline: the same `node eval/run-routing.mjs` on a clean `origin/main` worktree (removed after).
Compared case by case on all 544 rows, fields `top1/top3/top5/any1/any3/any5/cardHit5`, the
top-1 operation id, and the full top-five list.

| Lane | Rows | Grade-flag changes | Top-1 id changes | Top-five list changes |
|---|---|---|---|---|
| legacy | 338 | 0 | 0 | 4 |
| extended | 122 | 0 | 0 | 1 |
| skills | 23 | 0 | 0 | 0 |
| holdout | 49 | 0 | 0 | 1 |
| protocol-history | 12 | 0 | 0 | 0 |

The author's claim (0 grade changes, 0 top-1 changes, six top-five lists) is **confirmed**.
Legacy totals are 220/293/327 on both sides.

The six lists, judged:

| Case | New | Displaced | Judgment |
|---|---|---|---|
| `q-org-sdf-mandate-buckets` | `search_site` rank 4 | `stellarDocs.search_doc_titles` | Fair hit: the question is how SDF organizes its work. |
| `q-scf-hackathons-dorahacks` | `search_site` rank 4 | `scout.searchHackathonBuilds` | The one displacement of an on-target operation. Scout still holds ranks 1-3 and 5, grades unchanged. Accept, watch. |
| `q-pay-travel-rule-aid-flows` | `search_site` rank 3, `get_page` rank 5 | `stellarDocs.search_meeting_notes`, `stellarDocs.search_docs` | Worst of the six: two noise hits, one above `search_anchor_sep_docs`. Grades unchanged. The author attributes this to lexical noise like `stellarDocs.get_doc_page` carries; I did not isolate the tokens. Accept. |
| `q-protocol-operations-vs-transactions` | `get_page` rank 5 | `lumenloop.search_content_semantic` | Noise at rank 5, off-target operation displaced. Accept. |
| `q-ti-rpc-gettransactions-pagination-xdr` | `get_page` rank 5 | `stellarDocs.search_docs` | Noise at rank 5; four Docs operations remain. Accept. |
| `q-holdout-c-01-defi-map` | `search_site` rank 5 | `lumenloop.get_related_projects` | Noise at rank 5. Accept. |

I accept all six. No per-query tuning (hard rule), and the lexical noise is bounded to ranks 3-5.

**`eval/gates.json` re-baseline, by the `run-evals` rule** (legitimate named reason; `gates.json`
updated in the same commit; zero per-case hit-to-miss regressions; provenance filled): met. The
reason is a new source family, named. The same commit moves the manifest fingerprint, `localTrace`
and `notes`; totals and baseline date are unchanged. The note says plainly that six top-five lists
change. F1-F7 touch only `src/adapters/stellar-org.ts` and tests, so the manifest fingerprint does not
move. Bloat item 1 below changes `specs/stellar-org.json` text and needs one more gate run and
fingerprint.

## 5. Generated files

The CI "generated artifacts in sync" sequence, run bare in order (`build-catalog`,
`micro-map:build`, `spec:build`, `site:globes`, `check-mirrors`, `ecosystem-skills/build-index`,
`golden compile`, `compile-routing`, `compile-qa`, `build-op-classes`): exit 0, and
`git diff --exit-code --stat` over the CI path list: exit 0, empty. The worktree was clean
afterwards except for the brief itself. `inventory/stellar-org.json` is produced by
`refresh-inventory --service stellar-org`, a live read that CI does not byte-check; I did not
re-run it.

## 6. Bloat

2,147 added lines, by kind: about 650 are generated or recorded (manifest 223, super-spec 212,
inventory 36, fixtures 146, micro-map), about 325 are round records (SORG.md 165,
the brief 76, the research note 84), about 385 are the adapter, 353 are its tests, and about 200
are scripts. Little hand-written code can go; this is what I would cut or keep.

| Item | Verdict | Reason |
|---|---|---|
| **1. Partner rows** (`PARTNER_DIRECTORY_PATH`, the merge map in `siteHits` `:72-107`, one test, fixture rows) | **Cut** | A partner row points `get_page` at `/ecosystem`, which the author measured as rendering no partner detail, so a hit that the page read cannot support. Scout and Lumenloop already own the partner and project directory. The three target leaves need pages only. It is also the one third-party text channel (section 2). Replace the merge logic with `if (kind !== "page") continue;`. About 20 lines of code, a fixture block, and one test go. Keep the output shape (`kind`, `tags`) so the scored description does not move; the spec `filtered` constraint text changes, so re-run the routing gate once and re-stamp the fingerprint. |
| **2. `meta.candidates`** | **Keep** | One line. It is the only way a model can tell "the site returned nothing" from "the site returned rows and they were all blog, press, or events". It sits under `meta`, which `hasServiceData` ignores, so `no-rows` still fires. |
| **5. Retrieval profiles** | **Keep** | Eight lines. Every Docs operation has one, and removing them changes the manifest and reopens the routing gate that was just measured. |
| **6. Eval harness namespaces** | **Keep** | The plan grader (`OP_RE`), evidence pack, stable-evidence diagnosis and plain harness count a call only if its namespace matches. Without the change, a `stellarOrg` call is not counted as service evidence in QA grading, which would undercount the exact leaves this source exists for. The plain-harness operation counts must equal the manifest (62) or its test fails. The discovery `FAMILIES` and enum edits are two lines; keep. |
| **Drift classifier** (`classifyStellarOrg`, `summarizeStellarOrgInventory`, 28 lines, plus 26 test lines) | **Cut** | The drift issue already lists every changed generated file (`inventory/stellar-org.json` appears under "Generated files changed"), and detection is the `git diff` over `inventory` in `refresh.yml:201`, not the classifier. The classifier only adds two hint lines. Put one sentence in `.agents/skills/live-drift-resolution/SKILL.md` (adapter tests plus a live smoke of both operations) instead. |
| **Inventory lane** (`refreshStellarOrg`, the `--service stellar-org` arm, `inventory/stellar-org.json`) | **Keep** | The only mechanism that notices the two things the adapter depends on: the search row keys and a `<main>` element. It records shape only, so ranking and page copy cannot cause false drift (`writeInventory` already ignores `fetchedAt`). One change: the probe page is `/foundation/roadmap`, a content page that still reads 2025 and that SDF may retire; a 404 there files a drift issue that needs no code change. Probe `/` instead (live: 200, `text/html`, one `<main>`). |

Optional, not required: `mainHtml` and `htmlToText` each carry their own skip-depth state
machine over `TAG_RE` (about 30 duplicated lines). They could share one walker. I would not do it
in this change: it is where F2 lives, and the fix above is smaller than the refactor.

## 7. Micro-map authority rule 3

Rule 3 (`scripts/catalog-data/source-families.mjs`, `AUTHORITY_RULES[2]`) says to start ecosystem
facts, naming "program names" and "coverage/directories", with Scout and Lumenloop. The new
`stellarOrg` line says it is primary for SDF's "programs" and "those directories". A model asked
"which programs does SDF run" meets both. **Propose a one-sentence addition to rule 3, with the
existing text unchanged:**

> Official docs are authority for protocol, standards, API, and implementation claims; for ecosystem facts (funding/awards/amounts, program names, coverage/directories, who-builds-what, adoption), start Scout/Lumenloop even when docs mention the topic, then use docs only to corroborate standards mechanics. SDF's own strategy, roadmap, and its stellar.org service-provider and audited-project directories start with stellar.org.

That is about 25 tokens (the estimate is 638 now; check `test/mcp-instructions.test.ts`, which holds
the 2,048-character cap on the base contract, and the micro-map is outside that cap). The sentence
scopes the exception to the three page groups the source was built for, so Scout and Lumenloop
keep "program names" in general. Leaving rule 3 alone is defensible (the family line already says
"not for ... blog, press, and events", and "those directories" is explicit); I recommend the
sentence because the ambiguity sits in text every agent reads on connect, and because a
`q-sdf-2026-strategy-priorities`-style question should not be sent to Scout first. The micro-map
text changes the agent prompt, not the routing scorer, so the routing gate is unaffected; run
`npm run micro-map:build` and `npm test`.

## 8. Docs describe current behaviour

Mostly yes. Stale after this change:

- `ARCHITECTURE.md:57`: "the only globals are the three services, `codemode`, and standard
  JavaScript" is now four services (`lumenloop`, `scout`, `stellarDocs`, `stellarOrg`).
- `AGENTS.md:10`: the project line lists "Lumenloop, Stellar Light/Scout, Stellar Docs (Mintlify),
  and pinned ecosystem skills" and omits stellar.org.
- `.agents/skills/live-drift-resolution/SKILL.md:3`: the description names three upstream
  surfaces; there are four (resolved by the one sentence in the drift row above).
- After F1: the "`/api` paths are refused" claim in the operation's `path` description, the
  error hint (`stellar-org.ts:305`), and the research note becomes true; until then it is not.

Correct: `README.md` source table, `PLAN.md`, `CONTRIBUTING.md`, `inventory/README.md`,
`research/services/stellar-org-site.md`, the site families list in `src/site.ts`, and the counts
in `SORG.md` (3,446 tests passed matches my run). I did not re-verify the author's live retrieval
table (read-only, free, but outside this brief's list); its one weak case, `q-defi-blend-audit-record`
at 0/4, is reported honestly by the author.

## 9. Gates

All run bare on the branch at `866c5f9f` with the worktree clean, in this order, from the repo
root; none piped.

| Command | Exit | Note |
|---|---|---|
| `npm run typecheck` | 0 | |
| `npm test` | 0 | 151 passed, 1 skipped (152 files); 3,446 passed, 3 expected fail, 1 skipped |
| `npm run build` | 0 | wrangler `--dry-run`; bindings unchanged (`OAUTH_KV`, `ARTIFACTS`, `AI`, `LOADER`) |
| `npm run test:smoke` | 0 | 9 files, 141 passed |
| `npm run secrets:scan -- --tree` | 0 | |
| `npm run eval:routing -- --gate` | 0 | `GATE PASS`; compared per case against `origin/main` (section 4) |
| CI generated-artifacts sequence, then `git diff --exit-code --stat` | 0, 0 | section 5 |

Not run: `eval:selftest`, `eval:qa:lint`, `eval:qa:register` (the author recorded them as 0; the
sequence above regenerated `eval/qa/*` with no diff). No model-calling command ran. I did not
start Wrangler.

## What to do next

1. Apply F1 and F2 (two regex changes) with the new tests; re-run `npm run typecheck`,
   `npm test`, `npm run test:smoke`, `npm run secrets:scan -- --tree`.
2. Apply F3, F4, F5 in the same pass if the author agrees; they are small and stay in one file.
3. Decide bloat items 1 and the drift classifier (cut), and probe `/` in the inventory lane. Item 1
   needs one more routing gate run and a fingerprint re-stamp.
4. Apply the rule 3 sentence; fix the three stale doc lines.
5. The vendor-diverse attack (Grok) on the adapter is still open if the owner wants it.

## Delta review

Reviewer Claude Sonnet 5.5, 2026-11-14. Reviewed `bd971784` ("Apply the stellar.org source
review", on top of a merge of `origin/main` at `66301389`) against my findings at `866c5f9f`.
No deploy, no model-calling eval, no Wrangler.

### Verdict: **not fit to merge yet. One new blocking finding (D1), a one-line fix.**

F1 and F2 are closed as written, and the other findings are applied. But the F2 fix left a second
quadratic regex in the same file, with the same defect and the same cost: `documentTitle`.
Everything else passes.

### D1 (blocking): `documentTitle` is still quadratic on an unterminated `<title `

`src/adapters/stellar-org.ts:212`, `/<title\b[^>]*>([^<]*)<\/title>/i`.

`[^>]*` scans to the end of the body for every `<title ` that has no `>`, exactly as the old
`TAG_RE` did. `documentTitle(html)` runs on the whole 2 MB body in `page()`, before and
independent of the `<main>` text, so the `TAG_RE` fix does not reach it. Measured through
`callStellarOrg` (fake 200 `text/html`, `<head>` + `"<title "` repeated + `</head><main>ok</main>`):

| Repeats | Size | Time |
|---|---|---|
| 12,500 | 0.09 MB | 0.9 s |
| 25,000 | 0.18 MB | 3.6 s |
| 50,000 | 0.35 MB | 14.1 s |
| 100,000 | 0.70 MB | **56.5 s** |
| 280,000 | 1.96 MB | did not finish in 40 s |

Same trigger conditions as F2 (hostile markup on a stellar.org page), same cost, and the test the
author added for F2 uses `<!--` and `<a ` only, so it does not see this.

**Fix** (one character class): stop the tag body at the next `<`.

```ts
const match = /<title\b[^<>]*>([^<]*)<\/title>/i.exec(html);
```

On a scratch copy with only this change, the 280,000-repeat body takes 34 ms (before `<main>`)
and 6 ms (after it), and a normal `<title>Hello &amp; bye</title>` still reads `Hello & bye`.
Add a test: `"<title ".repeat(280_000)` in the head and again after `<main>`, asserting the call
returns in under a second with `ok: true`.

### F1 re-run: closed

All eight inputs from my table now return `kind: "error"` ("path must be a site-relative ...")
with **0 requests sent**, live and fake: `/%2e%2e/api/search`, `/foo/%2e%2e/api/x`,
`/.%2e/api/search`, `/%2E/api`, `/%61pi/search`, `/foundation%2fstrategy`,
`/foundation%5cstrategy`, `/foundation/strategy%00`, and
`/foundation/%2e%2e/foundation/roadmap`. The refusal table in the test file carries the encoded
cases.

Three new bypass variants, none of which gets past the guard to content:

| Input | Result |
|---|---|
| `/foundation/..;/api`, `/api\t/search`, `/ap​i/search`, `/／api/search` (`;`, interior tab, zero-width space, fullwidth solidus) | refused, 0 requests |
| `/%2F%2Fevil.com`, `/foo/%252e%252e/api`, `/api%2fsearch` (encoded and double-encoded) | refused, 0 requests |
| `/API/search`, `/Api` (case; the `/api` check is case-sensitive) | **one request sent**; the site answers 307 to `/api/search`, and the adapter refuses the redirect with the new same-origin message ("a stellar.org URL this tool does not read"). No `/api` body returned. |

The third row is the only residue and it is harmless, but the guard is not self-contained: if the
site ever served `/API/...` without a redirect it would be read. Optional one-liner:
`underPrefix(trimmed.toLowerCase(), "/api")` at `:63`. Also checked: `/api./search` and
`/_next/data/x.json` and `/.well-known/security.txt` are allowed and return live 404 (`soft-empty`);
they are ordinary same-origin GETs with no query string.

### F2 re-run: closed for `TAG_RE`; open for the title regex (D1)

At 1.5-1.9 MB (under the 2,000,000-byte cap, so the parser actually runs), through
`callStellarOrg`:

| Input | Time | Result |
|---|---|---|
| `<main>` + `<!--` x 380,000 (original) | 25 ms | soft-empty (no text) |
| `<main>` + `<a ` x 600,000 (original) | 139 ms | ok |
| `<main>` + `<a<a` x 380,000 | 40 ms | ok |
| `<main>` + `</a ` x 380,000 (new: closing tags) | 129 ms | ok |
| `<main>` + `<!-->` x 380,000 (new: degenerate comment) | 57 ms | soft-empty |
| `<main>` + `<script>` x 240,000 (new: nested skip) | 77 ms | soft-empty |
| `<main>` x 290,000 (nested main) | 130 ms | soft-empty |
| `<main>` + `<li>x</li>` x 190,000 | 239 ms | ok |
| `<main>` + `<a x="` + `<` x 1.9M | 34 ms | ok |
| `<main>` + `&a` x 900,000, and `&#x` + 1.9M hex (entity regex) | 31 ms, 30 ms | ok, text kept as-is |
| `<title ` x 280,000 in head | **> 40 s** | **D1** |

Cases that exceeded 2,000,000 bytes were refused by the size cap and are not counted as tested;
I re-ran them below the cap, as listed.

### Other findings, as applied

| Finding | Applied as written? |
|---|---|
| F3 empty page | Yes. `soft-empty` with the hint; the `<body>` fallback is gone from `mainHtml` (`""` when no `<main>`). Verified: empty body and chrome-only page both soft-empty. |
| F4 redirect message | Yes. Off-origin keeps the old text; same-origin refusal says "a stellar.org URL this tool does not read (query string, /api, or an unsafe path)"; an unparsable `Location` is its own error. |
| F5 deadline | Yes. `OPERATION_BUDGET_MS = 24_000`, each hop `min(12 s, remaining)`; a test covers budget exhaustion. |
| F6 search bounds | Yes. `readCapped(res, 256_000)` and descriptions cut at 500 characters (test with 100,000). |
| F7 case filter | Yes for the blog/press/events test (`path.toLowerCase()`); `/en/...` still not handled, as I said it need not be. The `/api` check stays case-sensitive (variant above). |
| Bloat 1 partner rows | Cut. `siteHits` keeps `kind === "page"` only; the merge map is gone. |
| Bloat drift classifier | Cut (`scripts/summarize-live-drift.mjs` -28, its tests -28); the `live-drift-resolution` skill gains the one-sentence item and names stellar.org in its description. |
| Inventory probe | Yes. `/` instead of `/foundation/roadmap`. |
| Rule 3 | Yes, my sentence is appended to `AUTHORITY_RULES[2]`. |
| Stale docs | Yes. `ARCHITECTURE.md:57` (four services), `AGENTS.md:10` (stellar.org added), the skill description. Not re-read: the research note and `SORG.md` additions (an author record, 50 lines). |

### Generated files and gates (bare, on `bd971784`, clean worktree)

| Command | Exit | Note |
|---|---|---|
| `npm run typecheck` | 0 | |
| `npm test` | 0 | 151 passed, 1 skipped (152 files); 3,458 passed, 3 expected fail, 1 skipped |
| `npm run build` | 0 | |
| `npm run test:smoke` | 0 | |
| `npm run secrets:scan -- --tree` | 0 | |
| `npm run eval:routing -- --gate` | 0 | `GATE PASS`. I did not re-diff per case against the moved `origin/main`; the manifest text changed only by the dropped partner wording and the rule 3 sentence, which the author's `gates.json` note records. |
| CI generated-artifacts sequence, then `git diff --exit-code --stat` | 0, 0 | tree clean afterwards |

### Next step

Apply D1 (one character class plus the test), re-run `npm run typecheck`, `npm test`,
`npm run test:smoke`, `npm run secrets:scan -- --tree`. With D1 closed this branch is fit to
merge from this reviewer's side; the optional `/api` lowercase one-liner and the open
vendor-diverse attack stay the owner's call.

## Final delta

Reviewer Claude Sonnet 5.5, 2026-11-14. Reviewed `11c58871` ("Close D1 and a second quadratic tag
regex") against my Delta review at `ca025654`. The diff is `src/adapters/stellar-org.ts` (+7/-3),
`test/stellar-org-adapter.test.ts` (+28) and the regex audit in `decisions/SORG.md` (+50). No
deploy, no model-calling eval, no Wrangler.

### Verdict: **fit to merge.** D1 is closed, the audit holds, and I found no pattern it called linear that is not.

### D1 re-run: closed

Through `callStellarOrg` (fake 200 `text/html`), 1.90 MB bodies:

| Input | Before (`ca025654`) | Now |
|---|---|---|
| `<head>` + `"<title "` repeated + `</head><main>ok</main>` | > 40 s at 280,000 repeats | 37 ms, `ok` |
| `<main>ok</main>` + `"<title "` repeated | not run | 26 ms, `ok` |

The regex is `/<title\b[^<>]*>([^<]*)<\/title>/i` as I proposed. The new `TAG_RE` change
(`(?![\w-])` in place of `\b`) is a real second defect that I missed: `\b` holds at every hyphen of
`<a-a-a…`, so a failed match backtracked into the name. My `<a<a` and `<a ` cases did not reach it.
`<a` followed by `-a` repeated now takes 51 ms at 1.9 MB.

### Attack on the audit

I read the audit table against every regex use in the file (`grep` for literals, `.test`, `.exec`,
`.replace`, `.match`): eleven sites, all eleven in the table, none missing. Then I tried to find
one that is not linear, with a 1.9 MB body each, through `callStellarOrg`. Times are wall clock,
one run, Node 26.

| Family (what it targets) | Body | Time |
|---|---|---|
| Tag name, hyphens: `<a` + `-a` repeated | 1.90 MB | 51 ms |
| Tag name, many short hyphen tags: `<a-a-a-a ` repeated | 1.90 MB | 76 ms |
| Tag name, `_` and digits: `<a` + `_a` repeated; `<a` + `1` repeated | 1.90 MB | 27 ms, 46 ms |
| Title, hyphen after `<title`: `<title-` repeated; `<title` + `-t` repeated | 1.90 MB | 39 ms, 39 ms |
| Title, `>` but no `</title>`: `<title>a` repeated | 1.90 MB | 65 ms |
| Comment, far close: `<!--` repeated then one `-->` | 1.90 MB | 26 ms |
| Comment, near miss: `<!-- -- ` repeated; `<!--->` repeated | 1.90 MB | 27 ms, 52 ms |
| Entity, many `&aaaa…1` runs; one 1.9 M `a` run; 1.9 M digit run; `&#xff` repeated | 1.90 MB | 29-31 ms |
| Whitespace, `" \t"` repeated; `#` x 1.9 M; `>` x 1.9 M; `<` x 1.9 M; `</` repeated | 1.90 MB | 27-32 ms |
| Nested skip: `<svg>` repeated | 1.90 MB | 97 ms |
| Output-heavy: `<li>a</li>`, `<h1>a</h1>`, `<p>a</p>`, `<td>a` repeated | 1.90 MB | 202-328 ms |
| Attribute with `<`: `<a b="<">` repeated | 1.90 MB | 68 ms |

The slowest is 328 ms, linear in the number of output lines. I also ran a token fuzz: six seeds, 40
bodies each (240 bodies, 1.9 MB each), each body a random mix of three tokens drawn from 34 markup
fragments (`<`, `>`, `<a-`, `<!--`, `-->`, `&#x`, `<title `, `</title>`, `<script>`, `<svg`,
`<li>`, `<h1>`, `#`, `_`, and others) in runs of up to 2,000. Worst single body: 248 ms. No body
passed 500 ms.

The sites outside the body (`PATH_RE`, `/\/$/`, `/^text\/html\b/i`) read a path of at most 512
characters or a header, which the audit says and which I confirmed from the code: the length check
runs before `PATH_RE`.

I could not construct a counterexample. The audit's reasoning (no character class contains the
delimiter, so each scan stops at the next one) matches what the timings show.

### What I did not do

- One run per body, not repeated; the margin between 328 ms and a quadratic result (minutes) is
  large enough that noise does not matter.
- I did not test a Workers runtime. Workers and Node both run V8's irregexp, but CPU limits differ;
  the worst case measured is far under any limit.
- The optional case-insensitive `/api` check was not applied (the author left it to the owner, as
  I did); `/API/search` still sends one request that is answered by a redirect and refused.
- The vendor-diverse attack (Grok) on the adapter is still open if the owner wants it.

### Gate

`npm test`, bare, exit 0: 151 files passed, 1 skipped; 3,465 passed, 3 expected fail, 1 skipped
(3,469). That equals the author's recorded count. I did not re-run the other gates: the commit
changes no manifest or spec text (the author records the routing gate as unchanged), so my last
full bare sweep at `bd971784` (typecheck, build, smoke, secrets scan, routing gate, CI generated
sync) stands for everything but these two regexes.

## Generality review

Reviewer: Claude Sonnet 5.5, high effort, 2026-11-14. Commit `ae148d0b` (author Claude Opus 5.5) against
`7c7efd2a`. The orchestrator chose this reviewer; the tier differs from the author. Nothing outside
this file was edited. No model-calling eval, deploy, or upstream post.

### Verdict

**Fit to merge, with two one-line guard fixes recommended and about 3,100 lines of snapshots to cut.**
The adapter now returns what the site search returns, and the measured table reproduces exactly. The
new guards hold against every input I tried except two gaps in the audit `reportUrl` check, both low
severity. `get_page` still cannot leave stellar.org. All gates exit 0. The re-stamp of
`eval/gates.json` follows the re-baseline rule. Two of the 80 snapshot responses were upstream
glitches, not misses, and the doc's "cause not investigated" can now be closed. No finding blocks
the merge.

| # | Finding | Severity | Fix |
|---|---|---|---|
| G1 | `reportUrl` accepts userinfo: `https://stellar.org@evil.com/r.pdf` and `https://user:pass@evil.com/a` pass and are returned verbatim | Low (the register is SDF-curated and the field is cited, never fetched) | Reject when `url.username \|\| url.password` in `auditHit`; add one test |
| G2 | The 2,048 cap tests the raw string, not `url.href`. A 2,014-character URL of U+202E becomes an 18,014-character `reportUrl` (9 times). `title` is uncapped too, up to the 256,000-byte search cap | Low (bounded: at most 10 hits, 256 KB upstream) | Test `url.href.length`; cap `title` at 300 as `description` is at 500 |
| G3 | Zero-row snapshot entries (p11 question, p13 keyword) are upstream glitches (see Measurement) | Info | Update the doc line "cause not investigated" |
| G4 | `get_page` still fetches `/API/search` (upper case) from stellar.org; the earlier review recorded this and the author left it to the owner | Info, not new, stays on stellar.org | None needed |

### 1. Guards, attacked

I ran about 110 inputs through `siteHits` and `callStellarOrg` directly (script in my scratchpad,
not committed).

**Audit `reportUrl`.**

| Input class | Result |
|---|---|
| `javascript:`, `data:`, `file:`, `ftp:`, `//host`, relative, non-string, array, object | Dropped |
| `HTTPS://EXAMPLE.com/A` | Kept, normalised to `https://example.com/A` |
| Tab, CR or LF inside the string (`https://exa\tmple.com/`, a `\r\nSet-Cookie:` suffix) | The URL parser deletes them. The result is a plain URL with no control characters; the injection collapses into a path segment |
| Leading C0 byte | Stripped |
| NUL, space, U+202E in the path | Percent-encoded (`%00`, `%20`, `%E2%80%AE`) |
| Homograph hosts (`раураl.com`, `stellаr.org` with Cyrillic а) | Returned as punycode (`xn--l-7sba6dbr.com`, `xn--stellr-7nf.org`). A raw homograph never reaches the model |
| `http://x.com\@evil.com/` | Normalised to host `x.com` |
| **Userinfo** (`https://stellar.org@evil.com/…`, `user:pass@`) | **Kept (G1)** |
| `localhost`, `127.0.0.1`, `[::1]`, `169.254.169.254` | Kept. Nothing fetches the value: `reportUrl` appears only in the adapter, the spec, and the test; `get_page` refuses full URLs; the sandbox has no network. No action |
| 2,100 characters / 2,020 characters | Dropped / kept. Raw length only (G2) |

**Tutorial and partner `url`.** The URL is rebuilt from a validated slug, so no input text survives
into it. Rejected: leading hyphen, `/`, `%2F`, `%0A`, `%00`, `..`, `.`, space, `+`, Cyrillic а (raw and
percent-encoded), U+202E, 201 characters, off-origin hosts (`evil.com`, `stellar.org.evil.com`,
`stellar.org@evil.com`, `//evil.com`, `www.`, `http:`, port 8443), the wrong path (`/learn/`,
`/other`, `/ecosystem` for a tutorial), `javascript:`, and non-strings. Accepted and normalised:
`https://user@stellar.org/learn?tutorial=x` and `:443` become the clean `https://stellar.org/…`;
a duplicate `tutorial=` takes the first. A `__proto__` or `constructor` slug is safe (a `Map`). A
tutorial or partner row with `isExternal: true` is dropped; unknown kinds (`blog`, `__proto__`) are
dropped; `null`, numbers, and strings in `results` are skipped. Partner merge: three rows for one
slug give one hit with `tags: ["x","y"]`; a category with a space is refused.

**`get_page` boundary.** Refused with no fetch: `https://evil.com/a`, `//evil.com/a`,
`/learn?tutorial=x`, `/ecosystem?partner=x`, an audit report URL, `/api/search`, `/a%2fb`, a
backslash host, `/a/../../b`, `http://localhost/`, `/x?y=1`, `/x#h`. It reads only `/ok/page` and
`/API/search` (G4), both on `https://stellar.org`. The redirect code is unchanged in this diff.

### 2. Measurement

**Rerun.** `node .../sorg-general/measure.mts research/services/stellar-org-queries.json
.../snapshot.json <out>` (Node 26 runs it directly; `tsx` is not a dependency, so the header's
`npx tsx` would download an unpinned package). All 16 cells of the author's table reproduce
exactly: question 33/33 raw, 33/33 adapter; keyword 36/37 raw at 5 and 10, 37/37 adapter. I also
reproduced the "before" column by running the same script against the `7c7efd2a` adapter. The raw
and adapter ranks match `ranks-before.json` and `ranks-after.json` for all 80 forms. The committed
rank files lack the `ownedRows` field that the current script writes, so they come from an earlier
version of the script; the ranks agree.

**Live spot-check, 8 of 40** (real adapter, real site, `limit: 10`; I also read the answer pages):

| Case | Question rank | Keyword rank | Snapshot agrees | Note |
|---|---|---|---|---|
| a02 Reflector Certora report | 1 | 1 | yes | `certora.com/reports/reflector-security-assessment-v1` |
| a05 Veridise audits | 3 | 1 | yes | firm query returns 10 audit rows |
| a08 DeFindex audit | 2 | 2 | yes | report row is a signed `file.notion.so` URL |
| d05 passkey tutorial | 2 | 2 | yes | tutorial row `webauthn-passkey-smart-wallets` |
| d12 USDT0 | miss | miss (0 hits left) | yes | all 10 rows are blog or press |
| p07 SDF leadership | 2 | 1 | yes | `/foundation/team` read: "Candace Kelly" present |
| p11 Soroswap.Finance | **1** | 2 | **no** | snapshot recorded 0 rows for the question |
| p12 MoneyGram partner | miss | 3 | yes | question form has no partner row |

I also ran p13: question 1, keyword **1**; the snapshot recorded 0 rows for the keyword. I read
`get_page` for `/foundation/team`, `/products-and-tools/tether-usdt0`, `/grants-and-funding/soroban-audit-bank`,
`/grants-and-funding/bug-bounty`, `/learn/stellar-consensus-protocol`, and `/audit-bank/projects`: each
contains the evidence string its query-set entry names.

**The zero-row queries (G3).** The two zero-row entries are not misses. I called the raw site
search three times each for "What does Soroswap.Finance do on Stellar?" and "Flutter wallet SDK":
10 rows every time. The site search intermittently returns an empty `results` array for a valid
query. Taken live, both forms hit at rank 1 and the totals read 34/40 (question) and 38/40
(keyword). The table stays correct as a measurement of that snapshot. The consequence for the
product: an `ok` result with empty `hits` and `meta.candidates: 0` can be this glitch, so the spec
should not let a model read it as "SDF has no page". The `hits` description now names only the
filter reason; it should also say a zero-candidate result is inconclusive.

**Was a question written to fit the search?** Partly, on one axis, and not on selection.

- *Lexical fit.* The brief said to derive questions from page titles, so most question and keyword
  forms reuse title words: d04 ("hello world smart contract in Rust" restates "Write Your First
  Smart Contract in Rust Pt. 1 | Hello World"), d05 and d06 do the same for tutorial titles; a09,
  p04, p05, p08, d02, d03, d11, p01, and p02 use the page name as the keyword. The search matches
  title, description, and tags, so these forms are the easiest ones for it. The absolute recall
  (33/40, 37/40) is an upper bound for real questions; the author's own body-text probes (9 of 21
  found) show the other side. The *gap* between raw search and adapter, which is the claim under
  test, does not depend on phrasing, because both sides see the same rows.
- *Audit answers.* The author says the eight audit answers were identified by firm-name queries
  against the search under test. The register holds 77 records and renders only the first page
  server-side, so a question whose answer the search cannot surface could not have been included.
  The four audit questions that still miss in question form (a01, a03, a04, a07) show the set was
  not pruned to pass.
- *Not censored.* Seven question forms miss for the raw search too (a01, a03, a04, a07, d12, p11
  at snapshot, p12), and the doc reports each with a cause.
- *Design decisions on the set.* Keeping partner rows and the blog/press/events filter were decided
  on this same set. The partner decision is backed by Scout not holding the Flutter Wallet SDK, and
  the filter by the cross-source URLs in `cross-source-urls.json`, not by the set's recall alone.
  I do not consider either fitted.

I found no question written to produce a particular answer. The set is title-biased and the audit
group is survivorship-biased; the doc should say both, in one sentence, where it says "40 realistic
questions".

### 3. Routing gate and the `gates.json` re-stamp

`npm run eval:routing -- --gate` exits 0 ("GATE PASS — legacy 338 within band, skills lane at/above
floor, holdout lane at/above floors"). The `run-evals` rule: re-baseline only for a named, legitimate
reason, in the same commit, with zero per-case hit-to-miss regressions and the provenance fields
filled. This commit meets each part.

- *Reason named:* the notes state the cause (audit, tutorial, partner rows in the description and
  schema) and the lane.
- *Same commit:* `eval/gates.json` changes in `ae148d0b` along with the manifest.
- *Numbers did not move:* only the manifest SHA-256 and `localTrace` change. Thresholds and accepted
  totals are untouched.
- *Per-case check, redone:* I ran `node eval/run-routing.mjs --dump-ranked` on the `7c7efd2a`
  manifest (`--manifest`) and on the final one. Of 495 ranked case IDs, exactly one top-five list
  differs: `q-defi-reflector-resolve` gains `stellarOrg.search_site` at rank 5 in place of
  `lumenloop.get_related_projects`. That is what the author recorded. The gate passes, so the
  grade is unchanged. Zero grade or top-1 changes.
- Wording nit: the note says "all 544 rows"; the ranked dump holds 495 case IDs (the other rows are
  not ranked lanes). The comparison covers every ranked case.

### 4. Bloat: files that should not be committed

The diff adds 4,490 lines, of which 4,167 are under `.agents` and `research`. Most are
measurement artifacts. The owner rule is to cut what adds no visibility.

**Cut (3,086 lines, about 53 KB):**

- `.agents/rounds/2026-11-14-golden-coverage-audit/sorg-general/ranks-before.json` (1,543 lines)
- `.agents/rounds/2026-11-14-golden-coverage-audit/sorg-general/ranks-after.json` (1,543 lines)

Both are pure outputs of `measure.mts` and the snapshot. I regenerated both from scratch and the
ranks match (after: the current adapter; before: `git show 7c7efd2a:src/adapters/stellar-org.ts`).
They already have stale content (no `ownedRows`), and `SORG-GENERAL.md` holds the table and every
miss with its cause. They show nothing a rerun does not.

**Cut or fold (optional, 21 lines):**
`.agents/rounds/2026-11-14-golden-coverage-audit/sorg-general/body-probes.tsv`. The 12 misses are
tabulated in `SORG-GENERAL.md` and the probe phrases live in `bodyProbes` of the query set. The file
only adds the per-phrase rank for the nine hits. Cut unless the owner wants those ranks.

**Keep:**

- `sorg-general/snapshot.json` (one line, 104 KB). It is the only way to reproduce the table, and
  the site search is not stable: two of its 80 responses are glitches I could not reproduce live.
  It is the one large artifact that adds visibility.
- `sorg-general/measure.mts` and `sorg-general/cross-source-urls.json` (small; the second backs the
  filter decision).
- `research/services/stellar-org-queries.json` (720 lines, the query set; pretty-printed, but it is
  the deliverable the Algolia test will reuse).
- `briefs/sorg-general.md` and `decisions/SORG-GENERAL.md` follow the round layout.

If the ranks files are cut, remove the two sentences that name them in `SORG-GENERAL.md`
("It also holds `ranks-before.json`, `ranks-after.json`, and `body-probes.tsv`") and fix the
`npx tsx` header in `measure.mts`.

### 5. Gates, bare, final tree `ae148d0b`

| Command | Exit | Detail |
|---|---|---|
| `npm run typecheck` | 0 | |
| `npm test` | 0 | 151 files passed, 1 skipped; 3,467 passed, 3 expected fail, 1 skipped (3,471). Equals the author's count |
| `npm run build` | 0 | |
| `npm run test:smoke` | 0 | 9 files, 141 tests |
| `npm run eval:routing -- --gate` | 0 | GATE PASS, legacy 338 |
| CI "generated artifacts in sync" (all ten scripts), then `git diff --exit-code --stat` on the CI path list | 0, 0 | The tree stayed clean |
| `npm run secrets:scan -- --tree` | 0 | |

### What I did not do

- I did not run a model-calling eval, so routing reach (7/40 in the top five) and answer quality
  stay as the author recorded them.
- I did not test from a Workers runtime; all live calls ran from this machine.
- I did not read the 40 query-set pages individually; I read 6 and the report rows for 5 audit
  cases. The other 29 answer paths come from the author and the snapshot.
- The vendor-diverse attack (Grok) on the guards is still open if the owner wants it. G1 and G2 came
  from reading the diff first, then confirming by running inputs.
