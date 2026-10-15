# Truth maintenance 2026-10-15

## Scope

Process the upstream activity of 2026-10-15. Stellar Light shipped spec 1.9.75 to 1.9.78 and
filed five inbound handoff issues on this repository (#283 to #287) for `sls-089` to `sls-093`.
The daily drift report on #223 shows the Scout spec and 682 Docs titles. PR #280 waits for its
independent review. Issue #167 stays open; it depends on the general routing repair.

In scope: live re-checks, finding status edits, prepared upstream text, resolver dry runs, the
drift assessment, the Horizon monitor reading, and the PR #280 review. Posting on GitHub and real
resolver runs need the owner's approval for outward-facing posts.

## Lane plan

Orchestrator: Claude Opus 5.5 (`claude-opus-5-5`), pane `w3W:p1P`. Worktrees under
`/private/tmp/claude-501/w1015/` (the `~/Desktop` git fault). Base `origin/main` `88e25511`.
Local dev server: pane `w3W:p57`, `http://localhost:8787`, worktree `round`.

| lane | agent (model, effort) | pane | worktree / branch | write set | status |
|---|---|---|---|---|---|
| A: author `sls-089`, `sls-090`, `sls-093` | `w1015-a`, Codex `gpt-6.1-sol`, high (Codex workhorse: verification and acting on live evidence) | `w3W:p53` | `sls-search` / `w1015/sls-search` | three finding files, generated `INDEX.md`, `tmp/` | done: all fixed; commit `3d79282c` (the orchestrator committed; the sandbox blocks the shared Git directory) |
| B: author `sls-091`, `sls-092` | `w1015-b`, Codex `gpt-6.1-sol`, high | `w3W:p54` | `sls-data` / `w1015/sls-data` | two finding files, generated `INDEX.md`, `tmp/` | done: both fixed; commit `18a6e159` |
| C: drift assessment for #223 | `w1015-c`, Codex `gpt-6-astra`, high (Codex frontier: dense routing analysis) | `w3W:p55` | `drift` / `w1015/drift` | generated artifacts via scripts, `tmp/` | done: hold stands |
| D: independent review of PR #280 | `w1015-d`, Codex `gpt-6.1-sol`, high (author was Claude; a different family re-runs the build) | `w3W:p56` | `pr280` (detached) | `tmp/` | done: CHANGES-NEEDED (6 findings); fixed by the orchestrator in `ea5f0e7f` |
| D2: re-review of the PR #280 fix | `w1015-d2`, Codex `gpt-6.1-sol`, high | `w3W:p53` | `pr280` / `pr280-fix` | `tmp/d2/` | running |
| C2: stellar-community parser repair and skills-only absorb test | `w1015-c` (continued), Codex `gpt-6-astra`, high | `w3W:p55` | `drift` / `w1015/drift` | `scripts/lib/stellar-community.mjs`, its test, generated skills artifacts | running |
| R1: distinct reviewer of A and B | `w1015-r1`, Claude Fable 5.1, high (matched tier for product and API truth; differs from the Codex authors and the Opus orchestrator) | `w3W:p56` | `round`, read-only | `tmp/r1/` | done: RETIRE all five |
| R1b: distinct review of the parser fix | `w1015-r1` (continued), Claude Fable 5.1, high | `w3W:p56` | `drift`, read-only | `tmp/r1b/` | done: APPROVE; low findings applied in `c9773751` |
| R2: challenger of A, B, and C | `w1015-r2`, Grok 4.7, high (vendor-diverse assumption attack; findings are leads) | `w3W:p58` | `round`, read-only | `tmp/r2/` | done: 9 leads; lead 3 reproduced as `sls-094` |
| G1: golden-truth author, Zenex goldens | `w1015-g1`, Claude Opus 5.5, high | `w3W:p54` | `golden` / `w1015/golden` | three cases, register, generated QA files | done: commit `6c6c4f9e` |
| RG: distinct golden reviewer | `w1015-c` (continued), Codex `gpt-6-astra`, high (differs from the Opus author and the orchestrator) | `w3W:p55` | `golden`, read-only | `tmp/rg/` | running |

Briefs: `/private/tmp/claude-501/w1015/keep/briefs/`.

## Drift verdict

Lane C, 2026-10-15T17:43Z refresh. Scout 1.9.61 → 1.9.78 (three added operations, twelve routing
text changes, schema-only changes on nine more). Docs titles 666 → 682. Lumenloop unchanged.

**Hold stands.** Routing gate with unchanged scoring, legacy lane (338 service rows, 182 card rows):

| sources | top1 | top3 | top5 | cardHit5 | gate |
|---|---:|---:|---:|---:|---|
| `origin/main` | 219 | 298 | 326 | 112 | pass |
| fresh Scout and Docs | 220 | 295 | 325 | 111 | fail |
| Docs titles only | 219 | 298 | 326 | 112 | fail (`q-tool-wallets-kit` loses `stellarDocs.search_wallet_dapp_docs`) |
| Scout only | 220 | 295 | 325 | 111 | fail |

All four 1.9.71 regressions persist (`q-defi-agentic-payment-standards-compare`,
`q-defi-blend-alternatives`, `q-defi-rwa-overview`, `q-scf-funded-similar-payroll`), and the
`q-defi-streaming-payments-prior-art` card loss persists.

Cost of the hold: the held manifest omits the new Scout response facts (`counts.totalBasis`
semantics, `exactKeys`, hackathon `entries`, `upstreamSubmissions`, `coverageNote`,
`hiddenWinners`, `winnersNote`, the `corrected` match mode, and the 503 declarations). The runtime
still passes these fields through.

New break: the skills refresh stops. `scripts/lib/stellar-community.mjs` throws "expected one
exported ECOSYSTEM_CARDS literal array" on the live `stellar/stellar-dev-skill` source. Live pins:
stellar-dev `e9ab7dbb662d` → `1fc65d59affb`, stellar-light `3b587aa9f23d` → `811c5384af52`;
stellarlight directory 67 → 82 entries. Lane C2 repairs the parser.

`npm run eval:protocol-history`: exit 1, `source-expired` as expected; 0 scored
(routing-v2 8/2/2, blind-v2 11/7/2).

Horizon monitor (local dev server `http://localhost:8787/mcp`): `MaxSupportedProtocolVersion = 29`,
`generatedAt` 2026-10-15T17:44:37.953Z, `scannedRef` `53aa6a33a4e44c2e661e9bae89f5e143bb1b3f84`,
`answerSource` `knowledge-note`, `answerAsOf` 2026-10-08. The source at that ref defines 29
(`internal/ingest/main.go:38`). PASS.

## Eval verdict

No eval instrument runs in this round. No paid method runs.

## Golden verdict

## Improvements/issues/PR verdict

Live surface: Scout `info.version` 1.9.78 (`/api/openapi.json` and `/api/status`, 2026-10-15T17:42Z
and 17:53Z). The authors (A, B) and the distinct reviewer (R1) each re-ran every original trigger.

| finding | trigger | upstream ref | ref state | PR checks/reviews/blocker | live re-check | repo action | next wake-up |
|---|---|---|---|---|---|---|---|
| `sls-089` | 65-request search burst | Stellar-Light/stellarlight#1751; PRs 1815, 1826; Raven #283 | issue closed completed; PRs merged | checks pass; none | fixed: three bursts (A, R1 ×2), no 200 with a false zero; failed candidate reads answer 503 | `fixed-upstream`; retire after posts | owner approval of posts |
| `sls-090` | four exact-key research queries | #1809; PRs 1815, 1821, 1826; Raven #284 | closed completed; merged | pass; none | fixed: named record first; `exactKeys` and `exactMiss` correct | `fixed-upstream`; retire after posts | owner approval of posts |
| `sls-091` | Zenex description | #1810; PRs 1814, 1820; Raven #285 | closed completed; merged | pass; none | fixed: mainnet text; 0 contradictions in 1,005 rows (R1) | `fixed-upstream`; retire after posts; goldens re-verified (G1) | owner approval of posts |
| `sls-092` | Blend event read | #1817; PRs 1816, 1823, 1826; Raven #286 | closed completed; merged | pass; none | fixed: 3 winners, 39 submissions, 27438 first | `fixed-upstream`; retire after posts | owner approval of posts |
| `sls-093` | `repos/search?q=strupey` | #1818; PRs 1815, 1821; Raven #287 | closed completed; merged | pass; none | fixed: `corrected`; `stroopy` stays `strict` | `fixed-upstream`; retire after posts | owner approval of posts |
| `sls-094` (new) | `projects/search?q=frieghter` | none yet | — | — | reproduces (2026-10-15T18:10Z): `strict` for a `didYouMean` recovery | `verified`; filing needs owner approval | owner approval of filing |

Observations recorded, not filed:
- `sls-090`, source only (lane A): the direct exact-key recovery query reads `title` and `content`
  but not `url` (`src/app/api/research/route.ts:917-944` at `46d6e1ad`). No live counterexample.
- `sls-090`, by rule (R2 lead 1, R1): `rs-soroban-sdk v23.5.1` and `v22.0.9` return `exactMiss`.
  Their release bodies do not link the advisory, and they sit outside the newest 15 releases. The
  response states the retention rule.
- `sls-092` (lane B, R1, R2 lead 6): the upstream daily winner check skips an event with no served
  ranks (`scripts/check-api-drift.ts:183` at `46d6e1ad`), and an event with ranked tiers and no
  announced winners does not say so. `alebrije2026` and `stellarhack` show "No Winners Announced
  Yet" on DoraHacks, so no live value is wrong. File only if a later round finds a wrong value.
- R2 lead 4: repo search corrects only listed spellings; other typos return `weak`, which is honest.
- R2 lead 9: the held manifest hides the new response fields. Recorded in `.agents/TODO.md`.

Reference reconciliation (R1): no golden, register, research, intake, probe, or Algolia reference
blocks the five retirements. The Zenex goldens and register entries are re-verified by lane G1.
`q-edge-strupey-ambiguous-stellar-history` keeps a dated 2026-10-06 evidence line; refresh it at
its next re-verification.

PR #280: independent review (Codex `gpt-6.1-sol`, high) found six issues; fixed in `ea5f0e7f` and
`de9fabaf`; re-review APPROVE; merged as `39f530c9`. No deploy (no served file or code changed).

## Own-repo todos

Added to `.agents/TODO.md`: the skills absorb without unexposed Scout operations; the hold's
model-facing cost (under "Preserve structured routing intent…"); and the `didYouMean` caveat gap
(under "Stop identity substitution on spelling-corrected matches"). The parser repair is PR #288.

## Decisions

## Final checklist
