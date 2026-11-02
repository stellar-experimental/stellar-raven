# Paid QA diagnostic — pre-spend brief (Algolia vs Mintlify docs backend)

Status: reviewed. Author: Claude Opus 5.5 (orchestrator). Pre-spend review: Claude Fable 5.1 at
high, APPROVE WITH CHANGES (`qa-brief-review.md`); all 12 findings reconciled below. Codex
frontier was the matched tier for method review; it was skipped because no Herdr session is
running, so no Codex lane can be launched.

## Question

Does the Mintlify docs backend change answer quality on docs-dependent questions, and where?
The free retrieval A/B already shows better golden-page recall (0.614 → 0.787). This run checks
that the retrieval gain reaches answers, and that the 8 retrieval losses do not become answer
regressions.

This is a **diagnostic**, not a ship verdict. 30 IDs is below the 100-ID minimum of
`paired-verdict.mjs`, so no paired PASS/FAIL is claimed. Results are read per row.

## Arms

| | Server worktree | Server revision | Docs backend |
|---|---|---|---|
| A (baseline) | `/private/tmp/claude-501/raven-mintlify-base` | `03c863a3e30e20d0e8bb44b272f9e3c06235fdaf` (main) | Algolia DocSearch index, frozen since 2026-10-22 |
| B (candidate) | `/private/tmp/claude-501/raven-mintlify-1102` | branch HEAD at launch | Mintlify search and page API |

- One runner for both arms: the candidate worktree at its clean HEAD. Case bytes, judge, rubric,
  and pack are identical across arms. Only `--port`, `--server-revision`, and the surface hash
  differ.
- **Freeze (review 2):** the brief and review are committed before launch. The runner revision
  and the arm B server revision are the same HEAD, recorded in the ledger. No lane edits, commits,
  or creates files in `raven-mintlify-1102` until arm B's postflight passes.
- **Runner-side hashes (review 4):** `meta.manifestFileSha256` and the QA implementation hashes
  come from the runner, so both artifacts carry the candidate's values. Arms are identified by
  `surfacePin.actual` and `serverInfo.sourceRevision`.
- Servers run **one at a time** with `npm run dev:eval` on port 8787; both runner invocations pass
  `--port 8787` (review 5). Arm A runs to completion
  and its server stops before arm B starts. No second Wrangler process exists at any time.
- Answering model `claude-sonnet-5`, judge `claude-sonnet-5` (runner defaults, unchanged).
- **Judge tiering (review 1):** both arms pass the same
  `--stability-register` — a copy of the main checkout's `eval/qa/judge-stability.json` (built from
  359 stored artifacts) outside both worktrees, sha256
  `8a93b23003f1c7ade99cef0a55395741f752296ecfb2ff14e3c4257a14eacfdc`. All 30 selected IDs have
  history in it. Both arms pass `--max-panel-cases 10`.
- **Arm A's docs backend is unguarded (review 10):** the remote probe hashes the Mintlify files
  only. Before arm A's spend, one free `stellarDocs.search_docs` call through arm A's server
  records the Algolia hit count. A Mintlify deploy during arm A still stops arm A, which keeps the
  two arms' remote vectors comparable.
- Arm A answers with the old surface (`get_doc_page_sections`, Algolia hit fields); arm B with the
  new one. That surface difference is the treatment.

## Selection (predeclared, deterministic)

From `retrieval-ab-results.json` per-case recall, active cases only, excluding the three cases
whose gospel changed in this branch (their goldens differ between revisions):

- **Downside slice (8): every case where Algolia retrieval recall beat Mintlify.**
  q-protocol-ledger-close-time, q-builder-content-by-person, q-defi-arbitrage-pathpayment-bots,
  q-soroban-deploy-cli, q-ti-channel-accounts-throughput, q-ti-classic-submission-errors,
  q-ti-compute-token-lp-market-data, q-ti-enumerate-holders-airdrop.
- **Upside slice (12): largest Mintlify recall gains.** 25 rows tie at delta 1.0 (A = 0, B = 1);
  these are the first 12 by sha256(id). A = 0 means no golden page hit, not no answer: arm A can
  still answer from skills, Scout, or Lumenloop (review 8).
  q-eco-stellar-wallets-list, q-anchor-endpoint-discovery, q-comp-clawback-cap0035,
  q-zk-verification-resource-budget, q-raph-hardware-wallet,
  q-aas-list-token-on-exchanges-aggregators, q-ti-testnet-usdc-faucet,
  q-soroban-instance-storage-dos, q-sep-wallet-seps-list, q-sor-scval-conversion,
  q-soroban-reentrancy, q-crp-oz-rwa-erc3643-trex.
- **Control slice (10): equal recall** (first 10 of 172 ties by sha256(id); two rows,
  q-stellar-recurring-payments and q-mpp-discovery-and-modes, have zero docs recall in both arms
  and test non-docs stability only). q-sor-confidential-tokens,
  q-comp-cross-bitso-sep31, q-stellar-recurring-payments, q-edge-exchange-memo-lost-funds,
  q-infra-which-indexer, q-mpp-discovery-and-modes, q-infra-quickstart-local-network,
  q-soroban-no-std-constraints, q-asset-sdex-vs-amm, q-raph-remove-scam-token.

Attribution: the only landed changes between arms that affect these rows are the `stellarDocs`
backend, its 12 manifest entries (`get_doc_page_sections` removed, `get_doc_page` added), and the
two micro-map archetype steps that name the page operation (review 9). Scout, Lumenloop, and skills
are byte-identical between revisions (pin review: no skill pin moved).

## Reading rules (predeclared)

1. Headline per slice: correct / partial / wrong counts per arm, plus missing-fact and wrong-claim
   counts (T-track fields).
2. Every cross-arm verdict difference is reviewed agentically against both transcripts before it
   counts: which docs calls ran, what they returned, and whether the golden is sound. Every
   `wrong` verdict is live-verified per `run-evals`.
3. Expected direction: upside slice B ≥ A; control slice flat within single-sample judge noise;
   downside slice is where a regression would appear. A downside row that drops a grade is a
   finding to explain (adapter, scoping, ranking, or upstream), never a number to average away.
4. Single sample per arm. A one-grade swing on one row is within known judge variance. Only a
   reviewed, mechanism-explained difference counts as evidence.
5. **Stale goldens (review 7):** `q-zk-verification-resource-budget` and
   `q-mpp-discovery-and-modes` passed `reverifyBy` on 2026-11-01. Any `wrong` or cross-arm
   difference on them is checked against the live source first; a stale golden is a corpus
   finding, not a backend finding.
6. A guard failure, identity change (for example a docs deploy changing `llms-full.txt`), or budget
   exhaustion stops the arm. The partial artifact is reported as incomplete; no re-run without a
   new bounded authorization.

## Budget (enforced by `--max-budget-usd`)

Cost basis from stored runs (`meta.totalCostUsd`, sonnet answer and judge): 100-row runs
$0.32–$0.41 per case; ~30-row runs (2026-08-18) $0.49–$0.77; all-run median $0.63, p90 $0.88,
max $1.07 (review 6). Expected spend is $12–$22 per arm; p90 is $26.50 per arm.

- Arm A: `--max-budget-usd 30`.
- Arm B: `--max-budget-usd 30`.
- An arm stopped by its cap is accepted as incomplete. Contingency: none. A re-run or re-judge
  needs its own bounded authorization.
- Total authorization: **$60**.

## Pins (asserted in the launch shell before spend)

- Launch shell built with `env -i`: only `HOME`, `SHELL`, `TMPDIR`, `PATH` (private directory
  first, holding only a link to `~/.local/share/claude/versions/2.1.316`), and
  `DISABLE_AUTOUPDATER=1`. This strips the orchestrating session's `CLAUDE_*` variables (including
  `CLAUDE_EFFORT` and the session messaging socket). `QA_AGENT_PROMPT_APPEND` and
  `QA_MAX_PANEL_CASES` are asserted unset. `AGENT_ENVIRONMENT_SHA256` is computed after these
  steps, in the same shell for both arms (review 11).
- `AGENT_BINARY_SHA256`, `AGENT_ENVIRONMENT_SHA256` computed in the launch shell.
- `SERVER_REVISION` and `SURFACE_SHA256` from `node eval/report-live-surface.mjs` against each
  arm's server.
- `REMOTE_IDENTITY_PROBE_SHA256` and `REMOTE_IDENTITY_SHA256` from the stable probe (three captures,
  five minutes apart), run once before arm A. Both arms must reproduce the same remote vector.
- Runner worktree clean at launch; IDs passed with `--ids`.

## Mandatory follow-ups

- Independent review of the branch (reviewer differs from author and orchestrator).
- Findings from the per-row review go to `improvements/` (upstream) or `.agents/TODO.md` (own repo)
  before the round closes.
