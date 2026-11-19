# Item 8.12 Lane `partner` — Report

- **Date:** 2026-11-19
- **Lane:** `partner` (worktree `/home/tyler/code/raven-wt/np-8.12-partner`, branch `np/8.12-partner`)
- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/512
- **TODO item closed:** `"Run the overdue partner-documentation review"` (`.agents/TODO.md`, Deferred programs; left untouched in `.agents/TODO.md` per lane scope for orchestrator reconciliation)
- **Decision:** **Hold stands** — no implementation round, no promotion to phases 2–4, no new calendar review date; reopen only on the note's explicit event triggers.

---

## What Changed

- [`ideas/partner-doc-live-sources.md`](../../../../../../ideas/partner-doc-live-sources.md): recorded the 2026-11-19 paired step-1 retrieval run, the full-Raven per-miss audit (including `scout.explainRepo` DeepWiki reach and caveats), the weekly `coverage-watch` run (`#562` / run `43919580750`), the live-failure residue (`sk-022` / `sk-025` / round 1.3 / unmeasured production demand), the two candidate-side operational drifts (Alchemy `cache-control: public, max-age=0, must-revalidate` with no ETag/Last-Modified; OpenZeppelin `cases.json` still pinned to `f304ed55` / `relayer/1.4.x`), the confirmed MCP-federation decline, and an explicit hold branch in Re-evaluation step 2.
- [`ideas/README.md`](../../../../../../ideas/README.md): updated the index row for `partner-doc-live-sources.md` from `Held; review dated 2026-10-31 is overdue` / `"Run the overdue partner-documentation review"` to `Held (reviewed 2026-11-19)` / `The note's triggers` / `None`.
- `.agents/rounds/2026-11-16-next-phase/items/8.12/partner/{SOL-REVIEW.md,CHALLENGE.md,REPORT.md}`: recorded the Codex Sol review, finding-by-finding challenge, and final lane report.
- No committed eval result JSON files (per `eval/partner-docs/README.md`, results are not committed).

---

## Re-evaluation Evidence (2026-11-19)

### Step 1: Paired 12-case `eval:partner-docs` against local Raven on port 8795

Command: `npm run eval:partner-docs -- --raven-url http://localhost:8795/mcp --json` (executed `2026-11-19T21:46:35.588Z`, zero model calls):

- **Harness baseline (12/12 cases, 0 errors):** **21/96 (21.9%)** across 85 distinct fact groups (original 8: **18/64 = 28.1%**, up from 7/64 = 10.9% on 2026-07-10; independent 4: **3/32 = 9.4%**).
- **Candidate arm (12/12 cases, 0 fetch errors, 0 prompt signals):** **95/96 (99.0%)** (median 118.3 ms, p95 308.9 ms).
- **Delta:** **+77.1 percentage points**, **12 wins**, **0 regressions**, **4/4 independent cases**.
- **Harness gate output:** `retrievalAdmissionGate: "pass"`, `headlineQaGate: "not-run"`, `shipDecision: "do-not-ship-runtime-adapter"`.

### Per-case and per-miss audit against all currently exposed Raven sources

Every missed fact group was probed live on 2026-11-19 against partner-relevant Raven sources (`stellarDocs.get_doc_page`, `stellarDocs.search_docs`, `scout.searchResearch`, `scout.searchProjects`, `stellarOrg.search_site`, and all three pinned OpenZeppelin skills, excluding echoed query strings), unioned with the harness baseline:

- **Union recall:** **48/96 (50.0%)** vs candidate **95/96 (99.0%)** (+49.0 pp; **11 wins, 1 tie, 0 regressions**; recovers 27/75 baseline misses, closing **36.5%** of the candidate's 74-fact lead; includes incidental hits such as `Lazy`/`Eager` from upgrade-migration audits rather than `FeeForwarder`, and `stellar-mainnet.g.alchemy.com/v2/docs-demo` as Scout's `statusSourceUrl`).

| Case ID | Type | Partner | Harness | Full-Raven Union | Candidate | Remaining unmatched fact groups (48 total) & disposition |
|---|---|---|---:|---:|---:|---|
| `alchemy-stellar-data-overview` | page-derived | alchemy | 6/8 | 8/8 | 8/8 | None — fully covered (`/docs/data/indexers` via `sd-010`, Scout) |
| `alchemy-stellar-transfers` | page-derived | alchemy | 4/8 | 5/8 | 8/8 | `/data/stellar/transfers`, `transferType`, `fromLedger`/`toLedger` — absent from all Raven sources |
| `alchemy-stellar-balances` | page-derived | alchemy | 3/8 | 4/8 | 7/8 | `/data/stellar/balances`, `native XLM`, `first page` (absent from all Raven sources); `data envelope` (documented case-authoring defect, also absent from candidate page) |
| `alchemy-stellar-rpc-quickstart` | page-derived | alchemy | 2/8 | 4/8 | 8/8 | `getNetwork`, `apiKey`, `getLatestLedger`, `getLedgerEntries` — absent in Alchemy-specific context (generic Stellar RPC docs exist, not Alchemy quickstart) |
| `alchemy-stellar-nfts-filter-exclusivity` | negative | alchemy | 1/8 | 1/8 | 8/8 | `/data/stellar/nfts`, `mutually exclusive`, `assetIssuer`, `asOfLedger`, `Invalid pageKey`, `Max holdings per page`, `Bearer` — absent from all Raven sources |
| `alchemy-data-api-versus-rpc-product-split` | conflict | alchemy | 2/8 | 4/8 | 8/8 | `Looking for Stellar JSON-RPC methods instead`, `api.g.alchemy.com`, `getLatestLedger`, `results under a data envelope` — absent from all Raven sources |
| `openzeppelin-stellar-suite` | page-derived | openzeppelin | 1/8 | 7/8 | 8/8 | `Timelock Controller` — absent by exact phrase (`/docs/tools/openzeppelin-contracts` lists `governance/ # Utilities like timelock`) |
| `openzeppelin-smart-account` | page-derived | openzeppelin | 0/8 | 5/8 | 8/8 | `CustomAccountInterface`, `Protocol 23`, `authorization flow`/`Rule Evaluation` — absent from Docs/Scout-search/skills |
| `openzeppelin-stellar-rwa` | page-derived | openzeppelin | 0/8 | 6/8 | 8/8 | `compliance contract`, `forced transfer` — absent from partner-scoped Docs/Scout-search/skills pool |
| `openzeppelin-stellar-relayer` | page-derived | openzeppelin | 2/8 | 2/8 | 8/8 | `sponsored transactions`, `fee_payment_strategy`, `allowed_tokens`, `classic Stellar assets`, `Soroban token support will be available`, `concurrent_transactions` — absent from Docs/Scout-search/skills (`/docs/tools/openzeppelin-relayer` describes both deployment models but examples use managed Channels); `scout.explainRepo` (`OpenZeppelin/openzeppelin-relayer`, undated DeepWiki) returns `fee_payment_strategy`, `allowed_tokens`, `concurrent_transactions` |
| `openzeppelin-fee-abstraction-token-fees` | paraphrase | openzeppelin | 0/8 | 2/8 | 8/8 | `FeeForwarder`, `max_fee_amount`, `collect_fee_and_invoke`, `set_allowed_fee_token`, `sweep_token`, `simulate the transaction off-chain` — absent from Docs/Scout-search/skills (`Lazy`/`Eager` matched incidentally from upgrade audits); `scout.explainRepo` (`OpenZeppelin/stellar-contracts`, undated DeepWiki) returns `FeeForwarder`, `max_fee_amount`, `collect_fee_and_invoke` |
| `openzeppelin-sponsored-fee-token-scope-conflict` | conflict | openzeppelin | 0/8 | 0/8 | 8/8 | `only classic Stellar assets`, `credit_alphanum4`, `credit_alphanum12`, `Soroban token support will be available`, `fee_payment_strategy`, `allowed_tokens`, `set_allowed_fee_token`, `max_fee_amount` — absent from Docs/Scout-search/skills; partial undated DeepWiki reach via `scout.explainRepo` |
| **Total** | **12 cases (4 independent)** | | **21/96 (21.9%)** | **48/96 (50.0%)** | **95/96 (99.0%)** | **48 unmatched** (47 absent from deterministic Docs/Scout-search/skills + 1 known authoring defect) |

### Step 2: Residue, `coverage-watch`, and live-failure audit

- **Upstream `coverage-watch`:** Run [`43919580750`](https://github.com/Stellar-Light/stellarlight/actions/runs/43919580750) (`2026-11-16T17:34:36.003Z`, `coverage-gap-evidence` artifact; rolling issue [`Stellar-Light/stellarlight#562`](https://github.com/Stellar-Light/stellarlight/issues/562); weekly since 2026-11-12): **1 of 4 `own`** (Sentora via `lumenloop-research`), **3 of 4 `mention`** (Alchemy via `dev-docs`, OpenZeppelin via `audit`, Chainlink via `sdf-blog`), **0 of 4 `none`**.
- **Live / owned-QA failure audit:**
  - *Alchemy:* **0** recorded owned-QA or production failures (`sd-010` resolved 2026-07-15).
  - *OpenZeppelin:* **0** unqualified failures where no exposed Raven source holds the fact, and **at most 1** stale-skill failure if undated DeepWiki is excluded: `sk-022` (`q-soroban-oz-upgradeable-macro`) still serves retired derive macros from pinned `skills.openzeppelin-stellar.upgrade-stellar-contracts` (`f82d2d95`, `OpenZeppelin/openzeppelin-skills#16` open with 0 comments on 2026-11-19), and neither Stellar Docs nor `scout.searchResearch` carries the correction, **but** live `scout.explainRepo({ repo: "OpenZeppelin/stellar-contracts" })` does return direct `impl Upgradeable` and no `Migratable` trait via undated DeepWiki (`answerSource: "deepwiki"`, `answerAsOf: null`).
  - *Other partners / rest of battery / production:* `sk-025` is a Trustless Work pinned-skill vs Core API auth conflict without verified deployed auth behavior; round item 1.3 found **0** unreached Alchemy or OpenZeppelin gaps; production Workers Logs store no query text, so production demand is **unmeasured**.
- **Candidate drifts verified live on 2026-11-19:**
  - Alchemy Markdown endpoints now return `cache-control: public, max-age=0, must-revalidate` with no `ETag` or `Last-Modified` (previously `max-age=3600`).
  - OpenZeppelin URLs in `eval/partner-docs/cases.json` still pin `f304ed55` (2026-07-09) and `relayer/1.4.x/stellar.mdx`, while `OpenZeppelin/docs` `main` (`4d74c325`, 2026-11-17) moved to Relayer `1.8.x` / root `content/relayer/stellar.mdx` (where the classic-only fee-token policy still holds verbatim) and added Vault and Confidential Token modules.
  - Alchemy MCP (`mcp.alchemy.com/mcp`, 168 tools behind OAuth) and OpenZeppelin MCP (`mcp.openzeppelin.com`, contract generation) are unchanged.

---

## Gates (Post-Fix, Each Run Bare)

| Command | Exit Code | Notes |
|---|---:|---|
| `npm run typecheck` | 0 | Clean |
| `npm test` | 0 | 173 passed \| 5 skipped (178 files); 4153 passed \| 3 expected fail \| 5 skipped (4161 tests) |
| `npm run build` | 0 | Dry-run upload succeeded; `prebuild` clean |
| `npm run secrets:scan -- --tree` | 0 | Clean — scanned all tracked files |
| `npm run eval:partner-docs -- --self-test` | 0 | `partner-docs eval self-test ok` |

---

## Codex Sol Review & Challenge Summary

- **Review file:** [`SOL-REVIEW.md`](./SOL-REVIEW.md)
- **Challenge file:** [`CHALLENGE.md`](./CHALLENGE.md)
- **Resolved reviewer model:** `gpt-6.2-sol` (Codex CLI `v0.169.0`, `model_reasoning_effort="high"`, read-only sandbox)
- **Verdict counts by class:**
  - **Valid (fixed):** **9** (2 High [both partially valid; valid parts fixed, invalid sub-claims refuted], 4 Medium, 3 Low)
  - **Valid but not worth fixing:** **1** (1 Low — `ideas/README.md:10` `Work queue item: None` awaiting orchestrator TODO reconciliation)
  - **Invalid:** **0** (specific sub-claims in Findings #1 and #2 were refuted with evidence in `CHALLENGE.md`)
- **Highest-value outcome of challenging Sol:** Verifying Finding #2 against *every* exposed Raven source revealed that `scout.explainRepo` (`answerSource: "deepwiki"`, `answerAsOf: null`) returns code-grounded answers for `OpenZeppelin/stellar-contracts` (including `sk-022`'s direct `impl Upgradeable` / no `Migratable` trait and `FeeForwarder`) and `OpenZeppelin/openzeppelin-relayer` (`fee_payment_strategy`, `allowed_tokens`, `concurrent_transactions`), sharpening the residue analysis and preventing an overstated `sk-022` claim.

---

## Worker Bytes & Model-Facing Impact

- **Worker bytes changed:** **No** (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty).
- **Model-facing change:** **No** (documentation and round-record files only; no deploy required).

---

## Model Calls Made

| CLI | Resolved Model ID | Purpose |
|---|---|---|
| `codex` (subscription, read-only) | `gpt-6.2-sol` (`model_reasoning_effort="high"`) | Independent read-only review of `git diff origin/main...HEAD` (`SOL-REVIEW.md`) |

Zero API-billed model calls; zero QA/eval model calls.

---

## Open Questions

- None blocking merge. Once the orchestrator merges PR #512 and reconciles `.agents/TODO.md`, `"Run the overdue partner-documentation review"` can be removed from `.agents/TODO.md`.
- If the planned 30-day query observability work ships later, production demand for Alchemy Data API endpoints and OpenZeppelin Relayer/FeeForwarder configuration will become measurable for the first time; no action is needed before then.
