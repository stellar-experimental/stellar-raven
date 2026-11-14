# SORG: stellar.org as a Raven source

Lane `sorg`, Claude Opus 5.5 (author), 2026-11-14. Brief:
[`briefs/stellar-org-source.md`](../briefs/stellar-org-source.md). Measurements and design:
[`research/services/stellar-org-site.md`](../../../../research/services/stellar-org-site.md).
Branch `feat/stellar-org-source` from `origin/main` (`fc33c6e8`). No deploy, no model-calling eval,
no upstream post. **The independent review is outstanding**; the orchestrator assigns it.

## Verdict

Ship it. The source grounds every stellar.org key fact in the strategy and service-provider cases
and the Audit Bank fact in the audit-registry case. It changes no routing grade or top-1 hit on
the 544 routing rows, and 10 of 10 unrelated QA sample questions keep identical top-five results.

## What was built

- `stellarOrg.search_site({ query, limit? })`: calls the keyless `GET /api/search?q=&locale=en`.
  It drops rows under `/blog`, `/press`, and `/events` (whole segments), external and off-origin
  rows, and returns `{ hits: [{ title, description, path, kind, tags }], meta: { candidates } }`.
- `stellarOrg.get_page({ path })`: fetches `https://stellar.org<path>` and returns
  `{ url, path, title, content, truncated? }`. The origin is fixed. The path guard refuses full
  URLs, query strings, fragments, `//`, dot segments, `/api`, and over 512 characters. Only
  same-origin, query-free redirects are followed, at most three. A body over 2,000,000 bytes is
  refused. Content is the first `<main>` element's text, without script, style, SVG, noscript,
  template, or iframe, with headings as `#` lines and list items as `- ` lines, cut at 40,000
  characters.
- Envelope: an all-filtered search is ok with no rows, and the host adds `caveat: "no-rows"`. A page
  404 or 410 is soft-empty. Every other failure, including an off-origin redirect, is an error.
  `asOfBasis` is `observed`. User-Agent `RavenMCP/1.0`; no key, binding, or cache;
  `globalOutbound` unchanged.
- Generated through their scripts: catalog (`specs/stellar-org.json` read by `build-catalog.mjs`),
  super spec, micro-map (new family line and authority), retrieval profiles, `op-classes.json`,
  `inventory/stellar-org.json` (new `--service stellar-org` refresh lane plus a drift classifier).
- Docs: README source table, PLAN scope, ARCHITECTURE build chain, CONTRIBUTING, inventory guide,
  site families list, and the research note above.
- Tests: `test/stellar-org-adapter.test.ts` (46 tests on recorded fixtures: both operations, the
  path guard, the prefix filter, partner merge, redirects, size caps, truncation, the envelope
  through `buildSandbox`, dispatch) plus updates to counts and service lists in existing tests.

Commits: `34336e76` (source), then the follow-up with the query length limit, smoke hash, research note, and this record.

## Routing evidence

Routing gate before the change: exit 0 (`GATE PASS`). The first draft failed it:
legacy top-1 220 to 215, top-3 293 to 286, top-5 327 to 321, 66 legacy top-five lists changed, 12
top-1 hits moved. Two causes, both fixed in the operation descriptions:

1. The draft named many SDF programs and products (Stellar Community Fund, MoneyGram Ramps,
   partner listings, mission, team). The final text names only the four page groups the source is
   primary for.
2. The vendored scorer prefix-matches query and description tokens in both directions, so a
   one- or two-letter description token matches every query word that starts with it. `SDF's`
   yields `s`; `a`, `of`, and `or` behaved the same. The final descriptions contain no such token.

The negative guidance from the brief ("not for protocol behaviour, blog, press, or events") lives in
the micro-map authority line, not in the scored descriptions, because naming those topics adds
their tokens to the score.

After, on the final manifest: `npm run eval:routing -- --gate` exit 0. All 544 rows (legacy 338,
extended 122, skills 23, holdout 49, protocol-history 12): **0 grade changes, 0 top-1 changes**.
Legacy 220/293/327, extended 93/112/117, skills and holdout totals unchanged. Six top-five lists
gain a `stellarOrg` operation:

| Case | Lane | stellarOrg rank | Displaced |
|---|---|---|---|
| `q-org-sdf-mandate-buckets` | legacy | 4 (`search_site`) | `stellarDocs.search_doc_titles` |
| `q-pay-travel-rule-aid-flows` | legacy | 3 and 5 | `stellarDocs.search_meeting_notes`, `stellarDocs.search_docs` |
| `q-protocol-operations-vs-transactions` | legacy | 5 (`get_page`) | `lumenloop.search_content_semantic` |
| `q-scf-hackathons-dorahacks` | legacy | 4 (`search_site`) | `scout.searchHackathonBuilds` |
| `q-ti-rpc-gettransactions-pagination-xdr` | extended | 5 (`get_page`) | `stellarDocs.search_docs` |
| `q-holdout-c-01-defi-map` | holdout | 5 (`search_site`) | `lumenloop.get_related_projects` |

The first is a fair hit: the question is how SDF organizes its work. The other five are lexical
noise at rank 3 to 5 (the token `stellar`, or `page` against `get_page`), the same noise
`stellarDocs.get_doc_page` already carries. `eval/gates.json` moves only the manifest fingerprint,
with a note naming these six rows.

Ten unrelated QA sample questions (first case per category in `eval/qa/sample.json`, excluding the
three leaves): **10/10 identical top-five lists.** Cases: `q-aas-claimable-predicates-expiry-reserves`,
`q-aas-list-token-on-exchanges-aggregators`, `q-cctp-v2-usdc-stellar`,
`q-defi-agent-identity-stellar-experimental`, `q-edge-ambig-best-wallet`, `q-infra-horizon-vs-rpc`,
`q-passkey-wallet-recovery`, `q-pc-multisig-setup-lifecycle`, `q-scf-hackathons-active`,
`q-token-xlm-supply-total-circulating`.

## Retrieval evidence (live, read-only, 2026-11-14)

`search` rank is Raven's catalog search on the full question (limit 5), then with
`service: "stellarOrg"`. The two calls ran through the real adapter against stellar.org.

| Case (leaf) | Raven `search` on the question | `search_site` query → page rank | Key facts supported by `get_page` |
|---|---|---|---|
| `q-sdf-2026-strategy-priorities` (strategy-roadmap) | `search_site` rank 2 | "SDF strategy" → `/foundation/strategy` 1; "roadmap" → `/foundation/roadmap` 1 | 4/4: "targeting $1 billion in growth for network asset value"; "sign 15 new transformational enterprises and deploy at least 5"; "Increase network performance" and "Release protocols fast and securely"; the page URL. The roadmap page still reads 2025, matching the golden. |
| `q-audit-reports-where-published` (audit-registry) | **not in top 12**; rank 1 with the family filter | "audit bank projects" → `/audit-bank/projects` 2 | 2/3: "eligible projects funded through the Stellar Community Fund", and the first page names Runtime Verification, Certora Ltd, Hacken, Decurity, and Halborn. The Security Portal fact is not a stellar.org fact. |
| `q-defi-blend-audit-record` (audit-registry) | **not in top 12**; rank 1 with the family filter | same | **0/4.** The server-rendered first page of audited projects does not mention Blend, and the Certora, OtterSec, and Code4rena facts live in Blend's docs and the Security Portal. This source does not help this case. |
| `q-scf-service-provider-directories` (service-providers) | `search_site` rank 5 | "service providers directory" → `/ecosystem/service-providers` 1 | 2/3: the directory page, with an "Audit partners" section; `/grants-and-funding/soroban-audit-bank` lists the Audit Bank's partner firms at pre-negotiated rates: Certora, Halborn, Oak Security, OtterSec, Runtime Verification, Spearbit + Cantina, Veridise, and Zellic. **Miss:** the Anchor Directory is `anchors.stellar.org`, not stellar.org. |

Targeted queries also surface it: "SDF strategy roadmap" rank 1, "service providers directory"
rank 1, "Soroban Security Audit Bank" rank 1, "audit bank audited projects" rank 5. A description
variant naming audit reports and firms still missed the audit questions and changed seven top-five
lists instead of four, so it was not kept.

## Gates (bare, repo root, final tree)

Every command below ran again on the final tree; the table shows the final exit code.

| Command | Exit |
|---|---|
| `npm run typecheck` | 0 |
| `npm test` | 0 (152 files, 3,446 passed) |
| `npm run build` | 0 |
| `npm run test:smoke` | 1 on the first sweep (Playground schema hash), 0 after; see deviation 9 |
| `npm run eval:routing -- --gate` | 0 |
| `npm run eval:selftest` | 0 |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 |
| `npm run eval:qa:register -- --check` | 0 |
| CI "generated artifacts in sync" sequence, then `git diff --exit-code` | 0, 0 |
| `npm run secrets:scan -- --tree` | 0 |

`improvements:lint` and `test:usage-report` were not run: neither area changed.

## Deviations from the brief

1. **Partner rows** are kept, with `path: "/ecosystem"`, and rows sharing kind, path, and title merge
   their tags. The site returns one partner row per category, and the `/ecosystem` page renders no
   partner detail, so the raw `?partner=` URL is not readable.
2. **`meta.candidates`** (rows before filtering) is returned under `meta`, so an all-filtered search
   still reads as no rows to the host.
3. **`query` has `maxLength: 200`.** The site returns 400 above 200 characters; the argument guard
   now says so first.
4. **`get_page` does not refuse `/blog`, `/press`, or `/events` paths.** The brief filters search
   only; a model holding a stellar.org blog URL from another source can still read it. It refuses
   `/api`.
5. **Retrieval profiles** were added for both operations, because every Docs operation has one.
6. **Eval harness namespaces** now include `stellarOrg`: the plan grader, the evidence pack, stable
   evidence diagnosis, the plain-operation harness (62 operations), and discovery families.
   Without this, graders would not count a `stellarOrg` call as service evidence.
7. **Tool-description budget.** Both tool descriptions exceeded the 2,048-character cap by 11. The
   execute description drops its first namespace list, which the globals sentence repeats. The
   search description's upstream-doc links do not add stellar.org, since the site has no API
   reference.
8. **No card caveat.** A card caveat must restate the description, and the "not for" wording is
   kept out of the scored description (see Routing evidence).
9. **Smoke hash.** `test/smoke/demo-openai-tool-request.test.ts` records the Playground `search`
   parameter-schema hash; the `service` description now names `stellarOrg`. Reverting only that
   string restored the old hash, so the new hash is recorded.
10. **gates.json** moves the manifest fingerprint, `localTrace`, and the note; totals and baseline
    date are unchanged.

## Not verified

- **Answer quality.** No model-calling eval ran (not authorized). Whether an agent picks
  `stellarOrg` and answers the four goldens correctly is unmeasured. The smallest instrument is a
  QA run on these four case IDs; it needs its own authorization (`run-evals` skill).
- **Workers egress.** All live calls ran from this machine with Node `fetch`. The smoke lane blocks
  network. Whether stellar.org's Cloudflare front treats Worker egress differently is unverified
  until a `wrangler dev` or production call. I own no running Wrangler terminal and did not start
  one.
- **Micro-map authority rule 3** still says to start ecosystem facts such as "program names" and
  "coverage/directories" with Scout or Lumenloop. The new stellarOrg line claims SDF's own programs
  and directories. The two can read as in tension; I left rule 3 unchanged to keep the change
  small. Owner call.
- **robots.txt** disallows `/*?locale*`. Raven's request is `/api/search?q=…&locale=en`, which that
  pattern does not match, and Raven fetches on demand for a user, not as a crawler.
- **Audited-projects coverage.** Only the first server-rendered page of `/audit-bank/projects` is
  readable; later pages load client-side.

## Review reconciliation

Lane `sorg-fix`, Claude Opus 5.5 (author), 2026-11-14, against
[SORG-REVIEW.md](SORG-REVIEW.md) (Claude Sonnet 5.5). `origin/main` (`66301389`, PR 438) was
merged first; it touched no generated file this branch owns. Each new regression test was run
against the pre-fix adapter: all 16 new or changed cases failed there (the linear-scan test took
288 s) and pass now.

| Finding | Done |
|---|---|
| F1 path guard (blocking) | `PATH_RE` no longer allows `%`. The reviewer's eight inputs are in the refusal table, and a redirect to `/%2e%2e/api/x` is refused. The `path` description and the error hint now name percent-encoded characters. |
| F2 quadratic `TAG_RE` (blocking) | The reviewer's regex. Test: `<main>` plus 500,000 `<!--`, and plus 500,000 `<a `, each under one second. |
| F3 empty page | `get_page` returns soft-empty "rendered no server-side text" with the reviewer's hint. The optional part is taken too: `mainHtml` drops the `<body>` fallback and returns `""` without `<main>`, so chrome-only bodies are soft-empty. Test covers a nav-only body, an empty body, and an empty `<main>`. |
| F4 redirect message | Off-origin keeps its text; a same-origin refusal says "a stellar.org URL this tool does not read (query string, /api, or an unsafe path)"; an unparsable `Location` is caught and named. Test. |
| F5 deadline | One 24 s budget per `get_page`; each hop gets `min(12 s, remaining)`. Test with a mocked clock: two 13 s hops, then "did not load within 24 s". |
| F6 search bounds | Applied, since the file was open: `readCapped(res, 256_000)` for the search body, descriptions clipped at 500 characters. Test for the clip. |
| F7 case | Applied: the excluded-prefix test lowercases the path. `/BLOG/x` added to the prefix test. The `/en/` locale prefix is not handled; the reviewer saw none. |
| F8 | No change, as recommended. |
| Bloat 1, partner rows | Cut: `siteHits` keeps `kind === "page"` only; the merge map and `PARTNER_DIRECTORY_PATH` are gone. Output shape kept (`kind`, `tags`). The recorded fixture keeps its live partner rows, so the existing test now asserts they are dropped instead of deleting it. Spec `filtered`, `kind`, and `path` texts updated. |
| Drift classifier | Cut (`classifyStellarOrg`, its summarizer and test, restored to `origin/main`). `live-drift-resolution` gains one bullet: on an `inventory/stellar-org.json` change, run the adapter tests and a live smoke of both operations. |
| Inventory probe | Probes `/` instead of `/foundation/roadmap`; `refresh-inventory --service stellar-org` re-run live (200, `text/html`, `<main>` present; row keys unchanged). |
| Rule 3 | The reviewer's sentence, appended unchanged. Micro-map estimate 638 to 668 tokens; `test/mcp-instructions.test.ts` passes. |
| Stale docs | `ARCHITECTURE.md` names the four services; `AGENTS.md` names the stellar.org site; the drift skill description names four surfaces; the research note describes the `%` refusal, the deadline, the soft-empty page, the partner cut, and the `/` probe. |

Lines, against the pre-fix merge commit, excluding this record, the review, and the briefs:
17 files, 209 added, 187 removed. Hand-written code: adapter +78 / -54, adapter tests +62 / -10,
drift classifier and its test -55 (+1 import line restored).

**Routing.** The manifest text moved (spec constraints and output-schema descriptions), so
`eval/gates.json` re-stamps the manifest fingerprint, `localTrace`, and the note; totals and
baseline date are unchanged. Compared per case against the pre-fix branch manifest on all 544
rows: 0 grade changes, 0 top-1 changes, 0 top-five list changes, 0 score changes. The reviewer's
numbers against `origin/main` (0 grade, 0 top-1, six top-five lists) therefore stand unchanged.

**Gates**, run bare in this order after the last edit:

| Command | Exit |
|---|---|
| `npm run typecheck` | 0 |
| `npm test` | 0 (151 files passed, 1 skipped; 3,458 passed, 3 expected fail, 1 skipped) |
| `npm run build` | 0 |
| `npm run test:smoke` | 0 (9 files, 141 tests) |
| `npm run eval:routing -- --gate` | 0, `GATE PASS` (1 before the re-stamp: fingerprint mismatch only) |
| CI generated-artifacts sequence, then `git diff --exit-code` over the CI path list | 0, 0 |
| `npm run secrets:scan -- --tree` | 0 |

Still open: Worker egress to stellar.org after deploy, a scoped QA run on the affected cases, and
the Blend audit and Anchor Directory facts this source does not hold (`.agents/TODO.md`). The
vendor-diverse (Grok) attack on the adapter was not run.

## Delta reconciliation and regex audit

Lane `sorg-fix`, Claude Opus 5.5 (author), 2026-11-14, against the "Delta review" in
[SORG-REVIEW.md](SORG-REVIEW.md).

**D1 (blocking): applied as written.** `documentTitle` uses `/<title\b[^<>]*>([^<]*)<\/title>/i`.
Test: `"<title ".repeat(280_000)` in `<head>` and again after `<main>`. Through
`callStellarOrg` each returns `ok: true` in under one second. With the old regex the test ran
for more than 30 s before `timeout` killed it (exit 124).

**Audit.** The defect is a regex that rescans a long run of input from many positions, by
retrying from many start positions or by backtracking inside one match. I checked every regex in
`src/adapters/stellar-org.ts`. The audit found one more quadratic pattern, in `TAG_RE`.

| Pattern (where) | Input | Verdict |
|---|---|---|
| `PATH_RE` `^\/[A-Za-z0-9._~\-/]*$` (`normalizeSitePath`) | path, ≤ 512 chars (length is checked first) | Linear: anchored, one character class, bounded input. |
| `/\/$/` (`normalizeSitePath`) | the same path | Linear: one literal, then `$`; bounded input. |
| `&(#x[0-9a-f]+\|#\d+\|[a-z]+\d*);` (`decodeEntities`) | the whole page text and the title | Linear. No class contains `&`, so a scan from one `&` stops at the next one. The scanned runs do not overlap, and the backtracking inside a run is linear. |
| `TAG_RE` comment branch `<!--(?:[\s\S]*?-->\|[\s\S]*$)` | the whole body (`mainHtml`), then `<main>` (`htmlToText`) | Linear. A terminated comment consumes what it scanned. An unterminated one matches to the end, which ends the scan. |
| `TAG_RE` tag branch `<(\/?)([A-Za-z][A-Za-z0-9-]*)\b[^<>]*>` | the same | **Quadratic, fixed.** `[^<>]*` stops at the next `<`. But `\b` holds at each hyphen of `<a-a-a…`, so a failed match backtracks into the name and rescans the rest of the run from every hyphen. Measured: 40 KB took 1.3 s, and the time grew 4× for each doubling. The fix uses `(?![\w-])` in place of `\b`: the name is maximal, and backtracking into it fails in one step. 1.9 MB now takes 11 ms. Semantics change only for a name that ends in `-` and is followed by a non-word character (`<a- >`); before, that parsed as `<a>`, and now it is text. |
| `^h([1-6])$` (`htmlToText`) | a tag name | Linear: anchored, fixed length. |
| `[ \t\r\f\v ]+` (`htmlToText`) | each text line | Linear: one class with nothing after it, and each run is consumed. |
| `^(#{1,6}\|-)$` (`htmlToText`) | each text line | Linear: anchored, at most 7 characters examined. |
| `<title\b[^<>]*>([^<]*)<\/title>` (`documentTitle`) | the whole body | Linear after D1. Each scan stops at the next `<`. |
| `\s+` (`documentTitle`) | the title text | Linear: one class, consumed runs. |
| `^text\/html\b` (`page`) | the `content-type` header | Linear: anchored literal. |

**Timing test.** `it.each` in `test/stellar-org-adapter.test.ts` feeds one adversarial body of
1.88-2.0 MB per body-facing family through `callStellarOrg`. Each case asserts the byte size, a
time under one second, and `ok: true`. The families are title, tag name (`<a-a-a…`), tag body
(`<a `), comment (`<!--`), entity (`&a1` runs and a 10,000-digit `&#x`), and whitespace. The
families that read the path and the header take bounded or anchored input, so they have no
1.9 MB case. With the old `TAG_RE`, the tag-name case ran for more than 30 s before `timeout`
killed it (exit 124).

The manifest is unchanged, so the routing gate needed no re-stamp. The optional case-insensitive
`/api` check was not applied; it stays the owner's call.

**Gates**, run bare in this order after the last edit:

| Command | Exit |
|---|---|
| `npm run typecheck` | 0 |
| `npm test` | 0 (151 files passed, 1 skipped; 3,465 passed, 3 expected fail, 1 skipped) |
| `npm run build` | 0 |
| `npm run test:smoke` | 0 (141 tests) |
| `npm run eval:routing -- --gate` | 0, `GATE PASS` |
| `npm run secrets:scan -- --tree` | 0 |
