# Brief: vendor-diverse security review of the `stellarOrg` adapter (round item 1.2)

You are the Codex frontier reviewer (gpt-6-astra, high). Two earlier reviews of this adapter were
both Claude models; you are the vendor-diverse attack they asked for. One pass, read-only.

## Rules

- **Read-only on the tree.** Do not edit, create or delete any tracked file. The only file you
  write is your findings file: `tmp/1.2-codex-review.md` in this worktree (`tmp/` is ignored).
  Scratch probe scripts go under `tmp/1.2-probes/`.
- No commits, no branches, no pushes, no upstream posts.
- Network: keyless reads of `https://stellar.org` only (the adapter's own two request shapes), at
  most about 40 requests in total. No other host, no paid API, no model-calling eval. Never
  print or read `.dev.vars`.
- Time box: one hour.

## Target

- `src/adapters/stellar-org.ts` (the whole file; it is what production runs, `main` = `ada75c0d`).
- Its tests: `test/stellar-org-adapter.test.ts`, `test/stellar-org-detail-hint.test.ts`,
  `test/stellar-org-guard.test.ts`.
- Context, read as needed: `src/adapters/types.ts`, `src/adapters/index.ts`,
  `src/executor/providers.ts` (`hasServiceData`, caveats), the catalog entries for
  `stellarOrg.search_site` and `stellarOrg.get_page` (grep `catalog/` and `src/catalog/`), and the
  contract in `research/services/stellar-org-site.md`.
- Prior reviews, so you do not re-report closed items as new:
  `.agents/rounds/2026-11-14-golden-coverage-audit/decisions/SORG-REVIEW.md` (F1-F8, D1, G1-G4)
  and `.agents/rounds/2026-11-15-tuning-loop-2/STEP-2-REVIEW.md` (S1, S2, section 2). Re-verify
  what they call closed; do not trust it.

## Scope (attack each)

1. **Fetch boundary.** Host pinning (the origin is a constant; can any input, row or header move a
   request off `https://stellar.org`?), redirect handling (`redirect: "manual"`, Location parsing,
   origin and path re-validation per hop, loop and hop limits, the per-operation deadline), and
   path handling in `get_page` (`normalizeSitePath`, `PATH_RE`, dot segments, case, `/api`, length,
   anything WHATWG URL parsing or the server normalizes differently from the guard).
2. **The title that passes uncapped.** `search_site` row `title` and `get_page` `documentTitle`
   have no length cap. Say whether this is a real defect and what cap, if any, fits.
3. **Zero-row and filtered-row behaviour.** Zero site rows return `soft-empty`; rows that are all
   filtered out return `ok` with `hits: []` and `meta.candidates`. Check how the host classifies
   each (`hasServiceData`, the `no-rows` caveat, the operation ledger) and whether a model could
   read either as evidence of absence.
4. **The single `/API/search` request.** `normalizeSitePath` checks `/api` case-sensitively, so
   `get_page({path: "/API/search"})` sends one GET to stellar.org (the site answers 307 to
   `/api/search` and the redirect is refused). Decide: is a fix warranted, and which.
5. **Anything else on the security boundary** you find: untrusted text reaching the model
   (prompt-injection surface relative to the Docs adapter), resource use (CPU on hostile HTML,
   memory, body caps, regex complexity), error-message content (does any upstream text or header
   reach the model unbounded?), and envelope kinds (`error` vs `soft-empty` vs data).

## Method

Read the code; prove each claim by running it. Use `npx vitest run test/stellar-org-adapter.test.ts`
and small `tsx`/`node --experimental-strip-types` probes with a fake `fetch` for hostile inputs;
use a live read only where the server's behaviour matters. Run nothing that changes the tree.

## Findings file format (`tmp/1.2-codex-review.md`)

- Header: reviewer, model, effort, date, commit reviewed.
- Verdict in one line: no fix needed / fixes needed (count by severity).
- One section per finding: id (`X1`, `X2`, ...), severity (blocking / should fix / low / info),
  `file:line`, the concrete input and the observed result (the probe output), and the smallest
  fix. Mark each "needs owner waiver if not fixed" where a fix is a product choice rather than a
  defect.
- A "Re-verified closed" table for the prior findings you re-ran.
- A "What I did not check" list.

When done, run: `hc send t1r9 '/home/tyler/code/raven-wt/np-1.2/tmp/1.2-codex-review.md'`
