# sd-003 deletion recheck (independent reviewer)

- Reviewer: Claude Fable 5.1 (`claude-fable-5-1`), distinct from the author session and from the orchestrator; spawned by `team-lead` as the step-6 reviewer.
- Date: 2026-11-02
- Scope: `improvements/stellar-docs/sd-003-rpc-method-reference-pages-unindexed.md` in worktree `/private/tmp/claude-501/raven-mintlify-1102` (branch `feat/mintlify-docs-migration`). Read-only; nothing was written to any worktree and nothing was posted upstream.
- Checklist followed: `.agents/skills/improvements-pipeline/SKILL.md` step 6 ("Drain genuinely resolved records").

## Verdict

**RESOLVE** — conditional on the three gating items under "Conditions" below. The original mechanism (generated RPC method pages absent from the docs search index) no longer reproduces on the live Mintlify docs. The residual I found is a different mechanism that sd-059 already owns.

## Checks

### 1. Finding and upstream issue read directly

- Finding: status `fixed-upstream`; trigger = generated method pages unindexed, so the getTransactions `limit` 1–200 / default 50 was unreachable through search.
- `gh api repos/stellar/stellar-docs/issues/2566 --jq '.state,.title,.body'` → state `open`, title "sd-003: The Algolia docs index excludes the auto-generated RPC-method and…".
- `gh api repos/stellar/stellar-docs/issues/2566/comments` → 3 comments:
  - 2026-07-15 `kalepail` (Raven): scope note, "keep this open until the Algolia-dashboard owner has a replacement task".
  - 2026-07-21 `ElliotFriend` (maintainer): "#2572 … pagination page now carries the full per-method limits table"; crawler inclusion "isn't configurable from this repo".
  - 2026-07-27 `kalepail` (Raven): offer of operator crawler evidence; "feel free to close this issue citing #2572 plus that task".
- No comment after 2026-07-27. No resolution comment exists. The issue is still open and still framed around the retired Algolia crawler.

### 2. Fix is deployed, not merely merged

- Upstream change = platform migration, not a crawler change. `gh api "repos/stellar/stellar-docs/commits?path=docs/data/apis/rpc/api-reference/methods/getTransactions.mdx&per_page=1&sha=main"` → `700ed32d0b2bac10e265cdc5fb1a4b70671ab130`, 2026-10-22T18:00:55Z, "build: migrate developers.stellar.org from Docusaurus to Mintlify (#2941)". PR #2941 merged 2026-10-22T18:00:57Z.
- Live deploy confirmed: `curl -sL https://developers.stellar.org/docs/data/apis/rpc/api-reference/methods/getTransactions` → HTTP 200, page markup contains `mintlify`, and the body states "The limit for getTransactions can range from 1 to 200 … defaults to 50."
- Commit-pinned source for the resolution comment: `stellar/stellar-docs@700ed32d0b2bac10e265cdc5fb1a4b70671ab130` (PR #2941).

### 3. Original trigger re-executed fresh (candidate Mintlify adapter, arm B)

All runs via `node …/scratchpad/qa/replay.mts B <op> '<args>'` (read-only, keys redacted).

| # | Command | Result |
|---|---|---|
| 3a | `stellarDocs.search_docs {"query":"getTransactions API reference limit","hitsPerPage":5}` | `ok:true`; hit #1 `/docs/data/apis/rpc/api-reference/methods/getTransactions`; #2 `…/methods/getTransaction`; #5 Horizon list-all-transactions. |
| 3b | `stellarDocs.get_doc_page {"path":"/docs/data/apis/rpc/api-reference/methods/getTransactions"}` | `ok:true`; content contains "can range from 1 to 200 … defaults to 50." |
| 3c | `stellarDocs.search_docs {"query":"getTransactions limit 200 default 50","hitsPerPage":3}` | hit #1 the generated getTransactions page. |
| 3d | `stellarDocs.search_rpc_horizon_data_docs {"query":"getTransactions limit","hitsPerPage":3}` | `ok:true`; hit #1 the generated getTransactions page. |
| 3e | `stellarDocs.get_doc_page {"path":"/docs/data/apis/rpc/api-reference/structure/pagination"}` | `ok:true`; the PR #2572 per-method table survived migration (row `[getTransactions](…)` present). |

The original soft-empty cannot recur on arm B: `get_doc_page` returns the full page.

### 4. Adjacent generated pages scanned for residuals (arm B)

| Page | `search_docs "<method> API reference limit"` | `get_doc_page` |
|---|---|---|
| getEvents | hit #1 `/docs/data/apis/rpc/api-reference/methods/getEvents` | `ok:true`, title `getEvents` |
| getLedgers | hit #1 `…/methods/getLedgers`; #2 getLedgerEntries; #3 getLatestLedger | `ok:true`, title `getLedgers` |
| simulateTransaction | hit #1 `…/methods/simulateTransaction`; #2 the deep-dive guide | `ok:true`, title `simulateTransaction` |

No generated method page was missing from the index.

### 5. Residual found (different mechanism)

- `search_docs {"query":"The limit for getTransactions can range from 1 to 200 - an upper limit that is hardcoded in Stellar-RPC","hitsPerPage":5}` → the getTransactions page is hit #2 (behind getTransaction), and no snippet in the top 5 contains the `limit` sentence.
- `search_docs {"query":"an upper limit that is hardcoded in Stellar-RPC for performance reasons defaults to 50","hitsPerPage":5}` → the method page is absent from the top 5; hit #1 is the Pagination page; hits 2–5 are audits, CLI, admin prerequisites, json-rpc.
- `search_docs {"query":"RPC pagination limit can range from 1 to 200 defaults to 50","hitsPerPage":4}` → hit #1 the Pagination page (which carries the #2572 table), method page absent.

Reading: the `limit` text on the method page sits inside `<ParamField>` within `<Expandable>`. The search returns the page by title/intro, never by that text. This matches the sd-059 mechanism (`<ResponseField>` text not findable) for a sibling component. It is **not** the sd-003 mechanism (page excluded from the index): the page is indexed, a method-named query ranks it first, and `get_doc_page` returns the numbers. Practical harm is covered twice: the method page via a method-named search plus a page read, and the Pagination page table for limit-phrased queries.

**Successor needed?** No new id. sd-059 (status `verified`, unfiled, `upstreamTitle: Make ResponseField text findable in the docs search`) already owns component-text searchability. Recommend the author widen sd-059 to `<ParamField>` before filing, backed by a `rf-rank.mjs`-style sweep over `<ParamField>` files (my evidence is a single-page probe and does not meet the sd-059 evidence bar on its own). Record this recheck's three queries as the seed.

### 6. Production (main) still reproduces the trigger — deploy ordering matters

- Arm A (Algolia adapter at `03c863a3`, what `main` deploys today): `get_doc_page_sections {"path":"/docs/data/apis/rpc/api-reference/methods/getTransactions"}` → `ok:false`, `kind:"soft-empty"`, "The page-section queries returned no matching records…".
- `main` (`1539a872`) has no Mintlify adapter (`rg -c -i mintlify src/adapters/stellar-docs.ts` → 0).
- Consequence: the resolved receipt's live-recheck claim is only true for Raven once `feat/mintlify-docs-migration` deploys. The deletion must land in that branch (or after it deploys), never ahead of it on `main`.

### 7. `rg -n "sd-003"` — persistent references to reconcile

Resolver-owned (handled by `npm run improvements:resolve`):
- `improvements/stellar-docs/sd-003-rpc-method-reference-pages-unindexed.md` — delete.
- `improvements/intake.json` — the `"sd-003"` override (`repo: stellar/stellar-docs`, `reason: "API reference content/indexability."`) — removed by the resolver.
- `improvements/INDEX.md:39` — regenerate.
- `improvements/resolved.json` — append the receipt (currently 0 hits for sd-003).

Golden corpus (`golden-truth` skill; edit the owned per-case files, then regenerate `eval/qa/cases.json` by its script, never by hand):
- `eval/qa/corpus/battery/tooling-infra/q-ti-rpc-gettransactions-pagination-xdr.json:169,192` — rootCause says "(verified, awaiting upstream) … When sd-003 is fixed-upstream, this override's facts should be re-verified against the then-indexed page". Re-verify the 50/200 facts against the live page (done above: 1–200, default 50, unchanged) and switch the reference to the `improvements/resolved.json entry sd-003` form. Note `eval/qa/lint-corpus.mjs:530-535`: a rootCause that names an active `improvements/<collection>/<file>` path requires a symmetric caution in `golden.notes`; `improvements/resolved.json entry <id>` does not. Keep the sd-004 caution (declined-upstream, no expiry) untouched.
- `eval/qa/corpus/battery/tooling-infra/q-infra-rpc-methods-list.json:22` — notes say "not a wrong claim while sd-003 stands; grade caps at partial". That cap expires with sd-003; remove or re-date it, or it codifies a stale grading rule.
- `eval/qa/corpus/battery/protocol-core/q-pc-practical-fee-setting.json:20,114,120` — same "while sd-003 stands" caution plus a source entry pointing at the active file path.
- `eval/qa/corpus/battery/protocol-core/q-pc-tx-finality-failure-semantics.json:20,82-84,94` — same caution, a dated review line, and a source entry pointing at the active file path.
- `eval/qa/cases.json:22763,28053,28147,28153,29219,29281-29293,52607,52748,52771` — generated mirror of the four cases above; regenerate.

Queue and current-state docs:
- `.agents/TODO.md:91-97` — the "Resolve `sd-003` after its upstream comment" item; close it on completion.
- `.agents/TODO.md:869` — "RPC method pages stay unindexed (sd-003: Q21, R03, R32, R34)" reads as current state; re-date or reword it so it does not contradict the resolution.
- `research/services/stellar-docs-mintlify.md:32` ("Re-probe `sd-003` after the cutover") and `:116` ("This is the `sd-003` gap") — current-state service note; update to say the gap closed and link the resolved receipt.
- `ideas/source-delivery-ranked-references.md:501` — lists `sd-003` under "Active findings"; move it to the resolved sentence.

Leave unchanged (dated records or fixtures):
- `improvements/stellar-docs/sd-004-rpc-limits-described-as-hardcoded.md:11` — dated 2026-07-06 evidence line; historical.
- `research/services/stellar-docs-algolia.md:14`, `research/qa-improvement-plan-2026-08-25.md:82`, `research/qa-deep-dive-2026-08-25/{grok-xhigh,terra-max,sol-max}.md`, `research/audits/2026-07-11-super-corpus-design.md:493` — dated research.
- `.agents/rounds/2026-{09-01,09-03,09-09,09-21,10-12,11-02}-*` — round ledgers.
- `test/qa-corpus-lint.test.mjs:160-172` — synthetic fixture strings (`improvements/stellar-docs/sd-003.md` is not a real path); not a reference.

### 8. Cleanup and receipt (not yet run; verified as the required sequence)

Dry run first, then post the printed comment, then the real run:

```
npm run improvements:resolve -- --file improvements/stellar-docs/sd-003-rpc-method-reference-pages-unindexed.md \
  --live-recheck "2026-11-02 stellarDocs.search_docs 'getTransactions API reference limit' ranks /docs/data/apis/rpc/api-reference/methods/getTransactions #1; get_doc_page returns 'can range from 1 to 200 … defaults to 50'; getEvents/getLedgers/simulateTransaction pages also indexed; source stellar/stellar-docs@700ed32d0b2bac10e265cdc5fb1a4b70671ab130 (PR #2941)" \
  --review-evidence "Claude Fable 5.1 independent recheck 2026-11-02: scratchpad/sd003-recheck.md" \
  --resolving-ref https://github.com/stellar/stellar-docs/pull/2941 \
  --references-reviewed --upstream-commented --dry-run
```

Then `npm run improvements:index`, `npm run improvements:lint`, `npm run improvements:lint -- --live`, `npm run improvements:probes`, and `npm run eval:qa:lint -- --stale --enforce-floors` after the golden edits.

### 9. Upstream resolution comment — NOT yet posted

Step 6 requires a resolution comment with the live result and commit-pinned source on every upstream ref before the non-dry-run resolve. Issue #2566 has none. The comment needs owner approval per `.agents/TODO.md:93-95`. Content it must carry: the three live results in check 3, the pin `700ed32d0b2bac10e265cdc5fb1a4b70671ab130` / PR #2941, that the crawler-inclusion ask is moot because the Algolia crawler is retired, that #2572's table survived migration, and a suggestion to close #2566 citing #2572 and #2941. Do not fold the ParamField residual into this comment; it belongs to the sd-059 filing.

## Conditions for RESOLVE

1. Post the resolution comment on stellar/stellar-docs#2566 (owner approval) before the non-dry-run resolver, and pass `--upstream-commented` only after that.
2. Land the deletion only in or after the `feat/mintlify-docs-migration` deploy; `main` today still reproduces the soft-empty (check 6).
3. Reconcile the four golden cases and the three current-state docs listed in check 7 in the same change, and regenerate `eval/qa/cases.json` and `improvements/INDEX.md` by script.

Separately (not a gate for sd-003): widen sd-059 to `<ParamField>` with a measured sweep before filing it.
