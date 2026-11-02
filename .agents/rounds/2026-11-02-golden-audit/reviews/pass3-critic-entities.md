# Pass-3 critic: cross-case entity consistency (2026-11-02)

Worktree: /private/tmp/claude-501/raven-goldens-1102 (branch eval/golden-audit-2026-11-02).
Role: read-only critic. No repository file was edited.

Inputs:

- `git diff origin/main` and `git diff HEAD` (pass 3 is uncommitted) over eval/qa/corpus/battery,
  eval/qa/consistency-register.json, and improvements/.
- The pass-2 critic reports (critic-entities.md, critic-rubric.md).
- The pass-3 files critic-cleanup.*.json and peer-handoff.*.json.

Instruments:

- `node eval/qa/lint-corpus.mjs --since origin/main --stale`: exit 1, 488 errors. 486 errors are
  `lifecycle-registry` hash errors (expected). Two errors are new:
  - `[date-trap] q-edge-fresh-latest-protocol-version: disposition reverifyBy 2026-12-15 does not
    match truth.reverifyBy 2026-11-24`
  - `[gospel] q-sor-doc-title-discovery: changed gospel requires non-empty truth.verified.rootCause`
- `node scripts/improvements-lint.mjs`: exit 1, "improvements/INDEX.md is stale".
- `git merge-base HEAD origin/main` is 1539a872 (#315). origin/main is now 5d7a4f88 (#309), with
  8e5fe599 (#317) between them. Both landed during pass 3.
- Live Raven `search` (production, 2026-11-02): `stellarDocs.get_doc_page` is exposed. Doc hits
  return `{ url, path, title, section?, snippet }`. No `get_doc_page_sections`, no
  `url_without_anchor`, and no `breadcrumb` exists.

## Pass-2 critic issues: status

| ID | Status | Basis |
|---|---|---|
| E1 / R2 | Resolved | Both cases drop the sd-008 cap and record the 2026-08-13 merge and 2026-08-28 resolution. The P30 leniency stays. |
| E2 | Resolved, then recurred | The branch is on #315. #317 and #309 then landed on main (see N2). |
| E3 | Resolved | Both round cases now use the plain rule. The SCF trap and cluster-011 reSwept text already name only the RFP cases, so no register edit is needed. A hash re-stamp is still needed. |
| E4 / R4 / R5 | Resolved in the cases | ll-033 and q-defi-flash-loans label the slender.fi quote as a 2026-08-08 cached copy. sls-099 lists the IL case. sd-073 and sls-097 are cited in rootCause. ll-037, ll-038, and sd-077 are filed and name their cases. INDEX.md is still stale (N6). |
| E5 | Resolved | q-infra-horizon-vs-rpc dates the lifecycle sentence 2026-11-02. The MoneyGram partnership note accepts either path when it is dated and attributed. This matches cluster-016 and the Decaf case. |
| E6 | Resolved in the case, open in the register | reverifyBy is 2026-11-24, and the P30 sentence is added. The register trap still says 2026-12-15 (N3). |
| E7 | Open | `.agents/TODO.md:427` still lists the RFP roster conflict as open. The ledger Results section still says "Pending" (N6). |
| R3 (regional-india widening) | Open, not escalated | See N5. |
| R7, R8, R9 | Resolved | The CAP-0081 date moved to the notes. `rootCause[0]` is dropped. The YieldBlox keyFact has one predicate, and avoid[1] still gates the 14,000 USDC borrow. Both YieldBlox cases and the invariant agree. The RFP avoids are answer-visible. |
| R1, R6, live-tag policy | Owner decisions | Not re-reported. |

## New or remaining issues

### N1 HIGH: three branch docs cases undo main's Mintlify rewrite and name a retired operation

- #309 (5d7a4f88) rewrote these cases for the Mintlify backend:
  - q-edge-doc-page-sections-soft-empty
  - q-sor-doc-page-sections-followup
  - q-sor-doc-title-discovery
- On main they use `get_doc_page`, the hit `path`, and page-level title hits.
- The pass-1 branch versions keep the Algolia contract in question, surface, answer, keyFacts, and
  avoid. They name `stellarDocs.get_doc_page_sections`, `url_without_anchor`, `breadcrumb`, and
  "path-not-indexed".
- The main manifest and the live production catalog no longer expose `get_doc_page_sections`.
  Hits no longer carry `url_without_anchor` or `breadcrumb`.
- A rebase that keeps the branch side breaks two rules:
  - `surface` fails `non-exposed surface id` (ADR-0003).
  - The judge grades a contract that no longer exists.
- Lint already fails on q-sor-doc-title-discovery. Pass 1 deleted its rootCause, and its gospel now
  differs from main.
- Fix: take main's version of the three cases. Re-apply only the branch truth/provenance lines
  that still hold. Do not re-apply the 16:15Z Algolia-era observations as current.

### N2 MEDIUM: the branch is behind origin/main again, and four shared files conflict

- `eval/qa/source-sentinels.json`:
  - #317 renamed `ml-dsa-not-shipped` to `mainnet-protocol-29`. It reads Horizon
    `current_protocol_version` 29, with `caseAsOf` 2026-07-11.
  - The branch bumps `ml-dsa-not-shipped` caseAsOf to 2026-11-02.
  - The bump must move to the new id. The case's truth.asOf is 2026-11-02, so the caseAsOf check
    fails otherwise.
  - The test/source-sentinels.test.mjs change and the pr314-review ledger change in #317 also show
    as reverted in `git diff origin/main`.
- `improvements/stellar-docs/sd-003-…md`:
  - The branch recurrence (pass 2) says the method pages are "still soft-empty" and that "#2566
    remains open".
  - Main sets `status: fixed-upstream` and records an independent RESOLVE recheck and the posted
    resolution comment. The branch line was observed through the Algolia adapter.
- `improvements/INDEX.md`, `improvements/intake.json`, and `.agents/TODO.md` were all edited by
  #309.
- Pass 3 avoided the sd-059 id collision with main's sd-059-responsefield-text-unsearchable.md by
  renaming its finding to sd-076.
- Fix: rebase onto 5d7a4f88 and resolve the conflicts by hand. Then run
  `npm run eval:qa:sentinels -- --check`, `npm test`, and the lint.

### N3 MEDIUM: register text contradicts the pass-3 cases, and the lint now fails

- The Protocol/Bell `dateContingentTraps` disposition still says
  "q-edge-fresh-latest-protocol-version reverifyBy 2026-12-15". The case now says 2026-11-24.
  This gives a lint `[date-trap]` ERROR, which blocks CI.
- The cluster-024 note still says "only q-protocol-27-cap-0071 still carries the older-copy
  Software Versions caution … sd-008 (fixed 2026-08-18)". Pass 3 removed that caution, so no
  member carries it. The date is also wrong (merged 2026-08-13, resolved 2026-08-28).
- These register entries need `memberContentSha256` re-stamps:
  - cluster-011, 024, and 120
  - the Protocol and SCF traps
  - cluster-016 (the MoneyGram partnership note)
  - cluster-133 (the instance-storage read-path change)
- Fix (orchestrator register edit):
  - Set the disposition to 2026-11-24 for all three cases.
  - Rewrite cluster-024's note: no member carries the cap, and pass 3 removed the last one on
    2026-11-02.

### N4 MEDIUM: after #309, unchanged siblings state superseded docs-index facts

- q-gap-rpc-horizon-unindexed-reference makes this claim in its answer and in keyFacts[0]:
  "The exposed catalog explicitly says auto-generated per-method RPC and per-endpoint Horizon
  references are not in this search index".
- The main catalog and live production now say the opposite for
  `search_rpc_horizon_data_docs`: "Includes the per-RPC-method and per-Horizon-endpoint API
  reference pages".
- Main's TODO ("Retire sd-003 …") tracks the four sd-003 cases. It does not track this case, and
  the golden handoff omits it.
- These four cases keep "while sd-003 stands" canonical-page partial caps:
  - q-pc-tx-finality-failure-semantics
  - q-pc-practical-fee-setting
  - q-infra-rpc-methods-list (changed on the branch)
  - q-ti-rpc-gettransactions-pagination-xdr
- On main, sd-003 is fixed-upstream with RESOLVE, so the trigger is expiring. Only the RPC-pagination
  case is in the ADR-0008 set.
- Two smaller cases also lag:
  - q-pc-doc-category-validator-search: "inspect breadcrumbs/snippets".
  - q-edge-doc-title-zero-hits: "auto-generated or unindexed … index constraint".
- Fix:
  - Re-verify q-gap-rpc-horizon-unindexed-reference against the live catalog. Rewrite it as
    "zero hits are not proof of absence; read the method page with get_doc_page".
  - Reconcile the sd-003 cases per main's TODO after the rebase.

### N5 MEDIUM: the q-scf-regional-india leniency widening is still in place, and no owner decision covers it

- Main's cap covers only "Goa on August 14–18, 2026".
- Pass 1 widened it to "as a Goa edition (its current summary and slug), or with its earlier
  August 14–18, 2026 dates". A bare Goa quote now caps at partial.
- That conflicts with the same case's avoid[3]: "Do NOT repeat the stale Goa/July Builders Camp
  description".
- Pass 3 did not touch the case. The known owner decision covers caps that existed on origin/main,
  not this widening.
- Fix: revert the notes sentence to main's wording.

### N6 LOW: bookkeeping and finding text disagree with the cases

- sd-076 asks upstream to re-crawl the Algolia index. Its premise is "Raven and other API clients
  still query it". #309 retired Raven's Algolia backend, and the live site does not use the index.
  The finding also lists five golden consumers that do not cite it: q-tool-freighter-wallet,
  q-eco-freighter-wallet, q-ti-freighter-localhost-not-detected,
  q-ti-connect-wallet-button-code, and q-protocol-parallel-execution. Its evidence uses
  `get_doc_page_sections`. Re-scope it or withdraw it after the rebase.
- q-scf-current-round and q-edge-fresh-latest-scf-round keep an evidence line that says
  "q-scf-open-rfps and q-scf-rfp-tooling also name 2026-11-08 … need a separate roster decision …
  recorded in .agents/TODO.md". The RFP cases now give 2026-11-09 and the roster conflict is
  resolved.
- `.agents/TODO.md:427` (the RFP roster item) is still open on the branch.
- The ledger Results section says "Pending". The pass-3 evidence cites ".agents/rounds/…, task
  critic-cleanup" and "pass 1 batch … verify", but no pass3/ folder or ledger section exists.
- `improvements/INDEX.md` is stale. Regenerate it after the rebase.

## Checked and consistent after pass 3

- Protocol: cluster-120, cluster-024, and the activation invariant agree in the cases. They give P29
  current (2026-11-02), P28 2026-09-16, P29 2026-10-01, and Bell votes on 2026-11-03 (Testnet) and
  2026-11-23 (Mainnet). Bell is CAP-0084/0087/0088. Every Testnet/P29 statement is dated.
  q-hist-quantum-preparedness-plan and q-pc-quantum-preparedness-dormant date CAP-0087 to Bell.
- SCF: the round cases (plain keyFact rule) and the RFP cases (do-not-penalize) do not conflict,
  because only the round cases gate the deadline.
- YieldBlox: both cases, the invariant, and the trap agree on the separate 14,000 USDC borrow.
- MoneyGram: all six cases accept either path when it is dated and attributed. The 15/1 USDC
  per-host minimum and the 950/2,500 maximums are uniform.
- MPP/x402: q-mpp-discovery-and-modes ("one mppx endpoint can serve both; never relabel")
  conflicts with no sibling.
- SEP-45: the q-anchor-endpoint-discovery note matches the twelve SEP-10/SEP-45 siblings.
- Instance storage: the read-path qualifier does not contradict cluster-133 siblings.
- xBull: only q-eco-xbull-wallet makes platform claims, and ll-038 names it.
- Horizon lifecycle: only q-infra-horizon-vs-rpc carries the deprecated-label avoid and the sd-072
  caution.
