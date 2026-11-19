# Challenge of Codex Sol Review — Item 8.12 Lane `partner`

- Reviewer: Codex CLI `gpt-6.2-sol` (`model_reasoning_effort="high"`, read-only sandbox)
- Reviewed commit: `e1a502f3` (`git diff origin/main...HEAD`)
- Review file: [`SOL-REVIEW.md`](./SOL-REVIEW.md)
- Challenged by: Gemini 4 Neon (Antigravity), 2026-11-19

## Summary of Verdicts

| Verdict | Count | Findings |
|---|---:|---|
| **Valid** (fixed) | 9 | #1 (High, partially valid), #2 (High, partially valid), #3 (Medium), #4 (Medium), #5 (Medium), #6 (Medium), #7 (Low), #8 (Low), #9 (Low) |
| **Valid but not worth fixing** | 1 | #10 (Low) |
| **Invalid** | 0 | (Specific sub-claims in #1 and #2 were refuted below; core findings were valid and fixed) |

---

## Finding-by-Finding Verification

### 1. High · `ideas/partner-doc-live-sources.md:43` — Phase 1 baseline width and per-case auditability
- **Sol's claim:** The note calls phase 1 passed using the narrow 21/96 harness baseline; the written gate requires a widened paired baseline; the separate 48/96 tally lacks per-case scores, source results, or comparable gate output.
- **Verification:**
  - *Refuted sub-claim:* `eval/partner-docs/cases.json` and `scripts/eval-partner-docs.mjs:49` **were** already widened on 2026-07-31 to include `scout.searchResearch` on all six Alchemy cases (`eval/partner-docs/README.md:17`, `research/partner-doc-source-onboarding.md:7`). The harness baseline is therefore not completely unwidened.
  - *Confirmed part:* The four OpenZeppelin skill-only cases in `cases.json` still omit `scout.searchResearch`, `scout.searchProjects`, and `stellarDocs.get_doc_page`, so the harness baseline remains narrower than full Raven. Calling phase 1 "passed" without qualifying it as the *harness* `retrievalAdmissionGate: "pass"` blurs that distinction, and the union check's per-case wins/ties/regressions (`48/96 = 50.0%`, `+49.0 pp`, 11 wins, 1 tie on `alchemy-stellar-data-overview` at 8/8, 0 regressions) were not printed in the diff.
- **Verdict:** **Valid (partially valid; fixed).** Qualified the headline explicitly as the harness's `retrievalAdmissionGate: "pass"`, noted the remaining OpenZeppelin baseline narrowness, stated the union check's exact 11-win / 1-tie / 0-regression outcome in `ideas/partner-doc-live-sources.md`, and recorded the full 12-case per-case table in [`REPORT.md`](./REPORT.md).

### 2. High · `ideas/partner-doc-live-sources.md:128` — Counting `sk-022` as the sole qualifying live failure
- **Sol's claim:** `sk-022` records historical September QA answers and a November source recheck, with no current answer reproduction and no source receipts establishing the correction is unavailable across all relevant exposed sources.
- **Verification:**
  - *Refuted sub-claim:* Re-running a QA model evaluation to re-reproduce the LLM answer failure is explicitly forbidden by the lane brief (`8.12-LANES.md:60`: "No model call"). Meanwhile, live Raven read of `skills.openzeppelin-stellar.upgrade-stellar-contracts` (current pin `f82d2d95`) on 2026-11-19 confirmed `#[derive(Upgradeable)]` and `#[derive(UpgradeableMigratable)]` are still served verbatim, matching the September QA evidence.
  - *Confirmed and decisive part:* Probing **every** exposed Raven source on 2026-11-19 showed that while `stellarDocs.search_docs`, `/docs/tools/openzeppelin-contracts`, `skills.stellar-dev.smart-contracts`, and `scout.searchResearch` still lack OpenZeppelin's `impl Upgradeable` / no-`Migratable`-trait correction, **`scout.explainRepo({ repo: "OpenZeppelin/stellar-contracts", q: "..." })` DOES return that exact correction** (`answerSource: "deepwiki"`, `answerAsOf: null`, warning agents to verify against `repoUrl`). Follow-up live probes of `scout.explainRepo` also returned `FeeForwarder` (`max_fee_amount`, `collect_fee_and_invoke`) on `OpenZeppelin/stellar-contracts` and `RelayerStellarPolicy` (`fee_payment_strategy`, `allowed_tokens`, `concurrent_transactions`) on `OpenZeppelin/openzeppelin-relayer`, all with DeepWiki's undated caveat. By contrast, Alchemy has no public Stellar Data API repo in Scout, so its Data API endpoint contracts remain absent across every exposed Raven source.
  - *Decision check (hold vs close):* Even with `sk-022` downgraded to **0 unqualified** failures (and at most 1 stale-skill failure if undated DeepWiki is excluded), **hold** remains the right outcome rather than deleting the idea: the coverage residue is non-empty (48/96 absent from deterministic Docs/Scout-search/skills; Alchemy Data API endpoints absent from every Raven source including `explainRepo`; weekly `coverage-watch` still marks Alchemy, OpenZeppelin, and Chainlink `mention`), and production demand is unmeasured because production Workers Logs store no query text.
- **Verdict:** **Valid (partially valid; fixed).** Stopped counting `sk-022` as an unqualified qualifying failure, documented the exact live `scout.explainRepo` DeepWiki receipts and caveat across `sk-022`, `FeeForwarder`, and `RelayerStellarPolicy`, and anchored the hold decision honestly on the non-empty coverage residue plus unmeasured production demand.

### 3. Medium · `ideas/partner-doc-live-sources.md:44` — Exact `--raven-url` `/mcp` path and `--json` flag
- **Sol's claim:** The brief wrote `http://localhost:8795`, while `scripts/eval-partner-docs.mjs:237` POSTs verbatim to the URL and `eval/partner-docs/README.md:11` specifies `/mcp`; default CLI output omits latency and prompt-signal totals unless `--json` is passed.
- **Verification:** Confirmed in `scripts/eval-partner-docs.mjs:236-249` and `:382-395`. Our actual run used `npm run eval:partner-docs -- --raven-url http://localhost:8795/mcp --json`.
- **Verdict:** **Valid (fixed).** Updated `ideas/partner-doc-live-sources.md` and `REPORT.md` to cite the exact `--raven-url http://localhost:8795/mcp --json` invocation and `<bound URL>/mcp --json` in Re-evaluation step 1.

### 4. Medium · `ideas/partner-doc-live-sources.md:63` — Complete accounting of all 48 unmatched fact groups
- **Sol's claim:** The grouped summary omitted several of the 48 unmatched fact groups and did not distinguish authoring limitations from source absences per miss.
- **Verification:** Confirmed. Our earlier prose omitted `native XLM`, `first page`, `Timelock Controller`, `CustomAccountInterface`, `Protocol 23`, `authorization flow`, `compliance contract`, `forced transfer`, `sponsored transactions`, and `Looking for Stellar JSON-RPC methods instead` from the inline summary.
- **Verdict:** **Valid (fixed).** Listed all remaining unmatched terms across all 12 cases in `ideas/partner-doc-live-sources.md` (explicitly tagging `data envelope` in `alchemy-stellar-balances` as the documented authoring defect) and recorded the complete 12-case, 48-miss breakdown table with sources and dispositions in [`REPORT.md`](./REPORT.md).

### 5. Medium · `ideas/partner-doc-live-sources.md:149` — Missing explicit hold branch in Re-evaluation step 2
- **Sol's claim:** The revised re-evaluation steps jumped from "empty → close" straight to step 3 (phase-2 prep), omitting an explicit hold branch when a review finds a non-empty coverage gap but fewer than two qualifying failures and no measured production demand.
- **Verification:** Confirmed in lines 142-147 of `e1a502f3`.
- **Verdict:** **Valid (fixed).** Added the explicit hold branch to Re-evaluation step 2 in `ideas/partner-doc-live-sources.md`.

### 6. Medium · `ideas/partner-doc-live-sources.md:85` — "Low-demand" and "0 production failures" exceed logging evidence
- **Sol's claim:** Because production Workers Logs carry no query text (`.agents/TODO.md:929`), silence is unmeasured demand rather than zero production failures or proven low demand.
- **Verification:** Confirmed against `.agents/TODO.md:843` ("Query text is not logged, so silence is 'no measured demand', not absence") and `:929`.
- **Verdict:** **Valid (fixed).** Changed "low-demand residue" to "unmeasured-demand residue" and "0 owned-QA or production failures" to "0 recorded owned-QA or production failures", stating explicitly that production demand is unmeasured.

### 7. Low · `ideas/partner-doc-live-sources.md:50` — Arithmetic of "close half the gap"
- **Sol's claim:** Recovering 27 of 75 baseline misses (48/96 vs 21/96) closes 36.5% (27/74) of the candidate's 74-fact lead, not half the gap.
- **Verification:** Confirmed: `(48 - 21) / (95 - 21) = 27 / 74 = 36.49%` (and `27 / 75 = 36.0%` of baseline misses). Recall reached 50.0% (48/96), which is half of total facts, not half of the gap.
- **Verdict:** **Valid (fixed).** Reworded to "raise literal recall to 50.0% (closing 36.5% of the candidate lead)".

### 8. Low · `ideas/partner-doc-live-sources.md:70` — Overstatement about `/docs/tools/openzeppelin-relayer`
- **Sol's claim:** `/docs/tools/openzeppelin-relayer` describes both self-hosted Relayer (signers, fee funding, self-hostable Channels plugin) and managed Channels; only its code examples use managed Channels and omit the policy fields.
- **Verification:** Confirmed directly against our live `stellarDocs.get_doc_page({ path: "/docs/tools/openzeppelin-relayer" })` read (paragraph 3 explicitly covers self-hosted signer options and fee funding; the `<Note>` scopes the examples to managed Channels).
- **Verdict:** **Valid (fixed).** Updated `ideas/partner-doc-live-sources.md` to state accurately that the page describes both deployment models while its code examples use managed Channels and omit the self-hosted policy fields.

### 9. Low · `ideas/partner-doc-live-sources.md:77` — Citation for Sentora `own` and per-partner `via` labels
- **Sol's claim:** Neither rolling issue `#562` nor the committed JSON snapshot lists Sentora or the per-partner `via` labels; those live in the workflow artifact.
- **Verification:** Confirmed. Issue `#562` prints only the three non-`own` partner surfaces (`mention`), while the `coverage-gap-evidence` artifact of workflow run `43919580750` (`2026-11-16T17:34:36.003Z`) holds the complete four-element `lanes.partnerDocs` array (`Sentora: own via lumenloop-research`, `Alchemy: mention via dev-docs`, `OpenZeppelin: mention via audit`, `Chainlink: mention via sdf-blog`).
- **Verdict:** **Valid (fixed).** Linked both `#562` and workflow run `43919580750`'s `coverage-gap-evidence` artifact in `ideas/partner-doc-live-sources.md`.

### 10. Low · `ideas/README.md:10` — `Work queue item: None` while `.agents/TODO.md` still has the item in this PR
- **Sol's claim:** The index row sets `Work queue item` to `None` while `.agents/TODO.md:1330` still holds the entry in this revision (since the lane is barred from editing `.agents/TODO.md`).
- **Verification:** Confirmed factually, but adding transient "awaiting queue reconciliation" wording to `ideas/README.md` would become stale immediately when the orchestrator closes the TODO entry on merge, violating the repo's reviewability discipline against transient narratives. Every other held idea without a dated review in `ideas/README.md` uses `None`.
- **Verdict:** **Valid but not worth fixing.** Kept `None` in `ideas/README.md` and named the closed TODO item in [`REPORT.md`](./REPORT.md) for orchestrator reconciliation.
