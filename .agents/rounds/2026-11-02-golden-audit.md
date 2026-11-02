# 2026-11-02 — full golden audit and Varial rename

## Scope

The owner asked for the Varial rename in the goldens and for a deep audit of every battery case,
with research across all source classes. This round covers all 501 active battery cases. It also
covers four open `.agents/TODO.md` golden items:

- "Add the Varial rename to the goldens that name Freighter" (18 cases).
- "Qualify the Confidential Tokens privacy claim in three goldens".
- "Resolve the SCF RFP roster conflict in two goldens before 2026-11-12".
- "Re-verify the next near-due goldens before the stale gate fails CI".

## Method

The `golden-truth` skill sets the evidence bar. One Workflow run partitions the battery into 49
batches. Four batches are topic lanes (Varial retail, Varial developer, Confidential Tokens, SCF
round and RFPs). The other 45 are family slices. Each batch passes three agents in a pipeline:

1. A proposer verifies every judge-facing claim against two or more independent source classes and
   writes a corroboration matrix and a proposal file. It edits no repository file.
2. An independent verifier reads only the proposals, not the proposer's evidence, and re-derives
   each changed fact from live sources.
3. An applier edits the batch's case files. It applies only changes that the verifier accepted, and
   it escalates the rest.

A final consistency pass checks the whole diff for cross-case contradictions and rubric hazards.

Source classes: official docs (A), GitHub source (B), live services through Raven and direct
Lumenloop and Stellar Light reads (C), general web through Parallel and Perplexity (D), the Stellar
Docs index (E), and free live execution (F). Paid Lumenloop research stays off. No paid eval
command runs in this round.

Each changed case carries its own evidence in `truth.verified`, `truth.sources`, and
`truth.corroboration`. The round folder keeps a compact digest of each unit's proposer matrix,
independent verifier decisions, and applier log: `2026-11-02-golden-audit/pass1/<batch>.json`,
`pass2/<task>.json`, and `pass3/<task>.json`. Quotes in the digests are cut to 160 characters; each
row keeps its `ref` and `observedAt`. The consistency and critic reports are in `reviews/`.

Passes 2 and 3 reuse the same three roles on smaller units:

- Pass 2: five improvements filers (one per target collection) ran first, so that case edits could
  cite real `improvements/` paths. Ten reconcile tasks then fixed the pass-1 consistency findings
  on disjoint case sets. One register editor updated `consistency-register.json`, and two critics
  re-read the whole diff.
- Pass 3: one filer fixed finding pointers. Two tasks applied the PR #309 QA hand-off (four cases)
  and the remaining pass-2 critic items (ten cases). Two critics re-read the diff.
- Register re-sweep: 13 read-only agents re-checked the 150 register entries that
  `eval:qa:register` reopened. The orchestrator applied their verdicts as one `--review` file.

## Lanes

| unit | agents (model, effort) | write set | status |
|---|---|---|---|
| pass 1, 49 batches | proposer (Opus 5.5, session effort), verifier (Opus 5.5, high), applier (Opus 5.5, medium) | the batch's case files | done; 149 agents, 0 errors |
| pass 1 consistency | 2 critics (Opus 5.5, high) | none | done |
| pass 2 findings | 5 filers (Opus 5.5, high) | `improvements/<target>/` | done |
| pass 2, 10 tasks | proposer, verifier (high), applier (medium) | the task's case files | done |
| pass 2 register, critics | 1 editor, 2 critics (Opus 5.5, high) | `consistency-register.json` | done; 38 agents, 0 errors |
| pass 3 | 1 filer, 2 tasks x 3 roles, 2 critics | pointers, 14 case files | done; 9 agents, 0 errors |
| register re-sweep | 13 checkers (Opus 5.5, medium) | none (orchestrator applies) | done; 150 entries: 134 consistent, 16 text edits, 0 conflicts (`register-resweep.json`) |

The owner's request named an "mc skill". No skill has that name, and Herdr was not active, so the
round ran as Workflow fan-out in one Claude Code session.

## Results

Against `origin/main`, the round changes 483 of 501 battery case files:

- 214 cases change gospel (question, golden, or tags). Each one has a new `truth.verified` event
  with evidence and a root cause.
- 269 cases refresh only their verification event (multi-class evidence, no gospel change).
- 243 cases move `truth.asOf`. 17 cases move to `scheduled` (15 from `stable`, 2 from `live`),
  because their golden text now carries dated volatile values.
- Status counts: 472 confirmed, 14 mixed, 12 disputed, 3 unverifiable.
- `reverifyBy` spread: the busiest day has 5 cases (2027-03-23). Eight cases keep a date before
  2027, and each one is tied to an event: SCF #46 Submission closes on 2026-11-09 and Panel Review
  starts on 2026-11-11 (`q-scf-open-rfps` 11-10, `q-scf-rfp-tooling` 11-11, `q-scf-current-round`
  and `q-edge-fresh-latest-scf-round` 11-12), and the Bell/P30 Mainnet vote is on 2026-11-23
  (`q-pc-protocol-upgrade-timing`, `q-protocol-version-history-list`,
  `q-edge-fresh-latest-protocol-version` 11-24; `q-hist-quantum-preparedness-plan` 12-01).

Owner-queue items closed by this round:

- Varial rename: 18 cases named Freighter on `main`. The 13 that name it in judge-facing text now
  accept both names; the other 5 name it only in judge-blind metadata. Every case that names the
  wallet accepts both names, records the 2026-10-29
  rename with primary sources, and carries a symmetric either-name caution. No avoid punishes
  "Freighter".
- Confidential Tokens: the three cases state privacy as the announced design, record the
  non-ZK verifier limit, and date the v0.8.0 audit (2026-10-20) and Mainnet-readiness statements
  (2026-10-22).
- SCF RFP roster: the official RFP Track page lists no open brief ("New Q4 RFPs are coming soon");
  Scout still lists the withdrawn Q3 briefs (`sls-096`). The cases grade the official roster with
  its observation date and accept a dated, attributed Scout-lag flag.
- Near-due goldens: every non-event-tied date is now in 2027.
- Activity-row note: `q-eco-most-active-defi-projects` now matches the live `metricDefinitions`
  (`sort=activity` is `github.commits90d`).
- PR #309 QA hand-off: `q-soroban-instance-storage-dos` (read-path entry-size risk),
  `q-anchor-endpoint-discovery` (key fact 3 graded as behavior), `q-mpp-discovery-and-modes` (one
  `mppx` endpoint can serve both protocols; payloads stay distinct), and
  `q-builder-content-by-person` (bylined meeting pages replace the 404 author index) were each
  verified and applied.

Consistency fixes after pass 1 include the YieldBlox pair (both cases now agree on the Script3
2026-03-04 post-mortem and the separate 14,000 USDC borrow), Protocol 29 as current Mainnet with
the P30 vote dated, `ledgerMaxDependentTxClusters` 3 since SLP-0007, the SLP-0006 freeze trap,
MoneyGram widget versus legacy SEP-10/24 paths, both TypeScript binding generators, and both
`update_current_contract` calls.

Mintlify interaction: PR #309 merged during pass 3. The three doc-page cases
(`q-edge-doc-page-sections-soft-empty`, `q-sor-doc-page-sections-followup`,
`q-sor-doc-title-discovery`) take the `main` versions, because the audit's edits used the retired
Algolia contract. The draft finding about the stale Algolia index was withdrawn before it landed:
neither Raven nor the live site reads that index now. Class E evidence gathered before the
switch-over came from the Algolia adapter, and the evidence lines say so where it matters.

## Upstream findings

New (43): `sls-095`..`sls-106`; `ll-032`..`ll-038`; `sd-060`..`sd-075`, `sd-077`; `sk-030`,
`sk-031`; `cs-003`..`cs-007`. Updated with dated recurrences or status evidence: `sls-024`,
`ll-003`, `ll-007`, `ll-019`, `ll-028`, `ll-029`, `ll-031`, `sd-009`, `sd-014`, `sd-053`, `sd-054`,
`sd-055`, `sk-004`, `sk-027`, `cs-002`. `sd-059` belongs to PR #309; this round's draft that briefly
held that number was renumbered and then withdrawn. No upstream issue was opened.

## Owner decisions

The owner decided all three on 2026-11-02. The record is `2026-11-02-grading-policy.md`.

1. Partial caps outside the ADR-0008 set. ADR-0008 accepts canonical-page caps for exactly three
   cases (base reserve, Horizon lifecycle, RPC pagination). This round added no new slot. It put a
   new trigger on the accepted Horizon-lifecycle slot: `q-infra-horizon-vs-rpc` cites the Lab API
   Explorer "Horizon is considered deprecated." line (`sd-072`), and the caution expires when
   `sd-072` is fixed upstream. The earlier `sd-042` trigger on that slot had expired on `main`. It also removed
   caps whose trigger expired (`sd-008`, `sd-013`, the SCF RFP Scout caps, the xBull Scout caution,
   `q-scf-total-distributed`), and reverted one pass-1 widening (`q-scf-regional-india`). Caps that
   already existed on `main` stay: aggregator caps (for example `q-tool-wallets-comparison`,
   `q-eco-stellar-wallets-list`, `q-builder-justin-rice-history`, `q-edge-fresh-latest-blend-tvl`,
   `q-edge-noinfo-exact-tvl-figure`) and canonical-page caps tied to active findings (`sd-003` in
   `q-infra-rpc-methods-list`; `sd-009` in `q-sep6-sep24-sep31-choice` and
   `q-sep-6-24-deprecation`). Decide whether to convert them to plain rules.
2. `live` cases with dated example values. `q-pc-protocol-upgrade-timing`,
   `q-pc-quantum-preparedness-dormant`, `q-scf-build-tracks`, `q-scf-total-distributed`,
   `q-eco-defi-tvl-current`, `q-defi-flash-loans`, `q-defi-etherfuse-stablebonds`,
   `q-eco-stellar-wallets-list`, `q-defi-bridge-evm-to-stellar-axelar`, `q-protocol-27-cap-0071`,
   and `q-infra-horizon-vs-rpc` keep `live` with dated illustrative values. Stable cases with dated
   values: `q-defi-reflector-oracle`, `q-defi-wisdomtree-crdt`, `q-eco-lobstr-wallet`,
   `q-eco-dex-saturation`, `q-anchor-endpoint-discovery`. Decide whether such cases are always
   `scheduled`.
3. Re-judge. The golden-truth skill asks for a re-judge of saved rows whose verdict hinged on a
   changed golden, with the flip direction recorded. That spends money, so it did not run. The
   deferred set is `2026-11-02-golden-audit/rejudge-set.json`: all 214 gospel-change IDs, with a
   priority subset of 55 cases that gained leniency lines in `notes` or only lost key facts. Pass 1
   added do-not-penalize language to 52 cases; pass 2 added plain-wrong rules and avoids about as
   often as leniency.

## Independent review

Reviewer: Claude Fable 5.1 at high effort (Fable tier, matched to golden truth as product and
taste work). The author and orchestrator were Opus 5.5, so the tier was eligible. Report:
`2026-11-02-golden-audit/reviews/independent-fable.md`. Verdict: no blocker.

| finding | severity | reconciliation |
|---|---|---|
| F1 saved rows not re-judged | major | The owner approved it on 2026-11-02. The 41 overlapping saved rows were re-judged in a paired run (`2026-11-02-grading-policy.md`, D3; `rejudge-summary.json`): 2 up, 5 down, inside a 6-of-41 noise band. |
| F2 marketing-grant criterion is page data, not rendered text | major | Confirmed by curl. `q-scf-sdf-marketing-grant` answer and notes now attribute the wording to the page data and the 2022-08-02 SDF blog; status stays `mixed`. `sd-077` names the unrendered description. |
| F3 new trigger on the Horizon-lifecycle slot | minor | Recorded under owner decision 1 with its `sd-072` expiry. No case change. |
| F4 undated xBull store-absence avoid | minor | The avoid item now carries "as of 2026-11-02", with the reviewer store lookups as evidence. |
| F5 5.50.0 versus 5.51.0 | nit | Release 5.50.0 says "This is the first release under the new name.", so the cases stand. `sk-030` now states both releases. The Varial count above is corrected. |
| F6 two removal-only cases | nit | No change; both are in the re-judge priority subset. |

## Follow-ups

- Retire `sd-003` and reconcile its four cases after this round lands (TODO item "Retire `sd-003`
  after the Mintlify deploy and the golden audit").
- Re-verify `q-gap-rpc-horizon-unindexed-reference`, `q-pc-doc-category-validator-search`, and
  `q-edge-doc-title-zero-hits` against the Mintlify catalog (superseded index facts).
- Catalog drift: the committed `scout.compareHackathons` output schema (OpenAPI 1.9.61) omits
  `submissionCount` and `winnerCount`; live is 1.9.116. The live-drift lane owns it.
- Host defect: the `get_doc_page_sections` path description in the old Stellar Docs spec named
  `url_without_anchor`. #309 replaced that operation; re-check the new `get_doc_page` description.
- Optional sentinels proposed by agents: Soroswap Aggregator v3 address, mpp.dev "both protocols on
  the same endpoint".
