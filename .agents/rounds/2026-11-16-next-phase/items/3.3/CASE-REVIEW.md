# Item 3.3 per-case review

Reviewer: Claude Fable tier (the orchestrator note's required per-case reviewer), model
`claude-fable-5-2`, effort as set on the lead's launch line. Author: Claude Sonnet 5.5. Lead and
orchestrator: Claude Opus 5.5. 2026-11-17, worktree `np-3.3`, read-only apart from this file.

## Verdict

- **Prefix floor: fails, drop it.** Rules 1, 2, 5 and 6 fail on the first measurement. The record is
  right. The losses are real, not label noise.
- **Gate-failed slot keeping: fails, drop it.** Rules 1 and 4 fail on the first measurement. The
  record is right on the verdict. It understates one cost: slot keeping puts a `stellarOrg` card on
  more non-SDF pages at limits 5 and 7 (finding 1).

No finding is blocking. Nothing shipped, so every finding is a fix to the records. Findings 1 to 4
are should-fix; 5 to 8 are nits.

## What I ran

All of it in scratch copies made with `git archive` (base `8d42de37`, `np/3.3-prefix-floor`
`0c2e43b9`, `np/3.3-slot-keeping` `013592d1`), outside the repository. USD 0, no model, no network,
no server.

| Check | Result |
|---|---|
| `eval:routing --gate`, three runs | Base exit 0. Prefix floor exit 1 (legacy 231, 301, 320). Slot keeping exit 1 (legacy top5 318). Same as MEASURE.md. |
| `compare-routing.mjs`, executor's result file against my re-run, each of the three | 0 rows changed on every lane, holdout included. |
| `compare-routing.mjs --lists`, base against each variant | Identical to the output from the executor's files. Every count in both MEASURE.md lane tables matches. |
| `measure.mts`, three runs | Every probe, effect-target, off-golden and FAM cell in MEASURE.md matches. FAM SHA-256 check passed. |
| Every `eval/results/routing-2026-11-17T*.json` (16 files), compared by changed-row count only | Each one is the base, the prefix floor, slot keeping, or the unit test's own manifest run. No fourth variant was measured. |
| `vitest run test/search.test.ts` on slot keeping | 3 failing, the three EXEC.md names. |
| Six test files on the prefix floor (not the gate-run test) | 9 failing, all in EXEC.md's list. |

Reading discipline: I read question text only for rows the comparison names; my lookup script
throws on any id in `eval/routing-qa-overlap.json`. Holdout and FAM are counts only. I opened no
results JSON, holdout row, QA file or split file.

Depth: I read all 117 named changed rows for slot keeping. For the prefix floor I read every named
row whose metric changed in either direction (legacy and extended, about 90 rows) and took
aggregates for the other named rows whose page changed without a metric change.

## Check 1: code against the plan

No finding.

- Prefix floor: the plan's expression, in `scoreField` and `scoreFieldUngated`, and nothing else.
  Those are the only two prefix-rule sites under `src/`, `eval/` and `scripts/`.
- Slot keeping: the plan's block, at the stated place. The victim is the lowest-scoring gated card
  at index 1 or later, a tie goes to the higher index, the pool comes from `scoreCandidates`, the
  quota test and the strict `>` are as written, and it makes one swap in place.
- Each measurement branch is one commit on the base. Its reflog shows no amend. Each patch file is
  byte-identical to its branch diff. Re-running from the commits reproduces the measured result
  files exactly, so the measured code is the recorded code. Nothing shipped, so there is no shipped
  code to compare.

## Findings

### 1. Slot keeping raises `stellarOrg` displacement at limits 5 and 7, and the records pass over it (should-fix)

Rule 5 checks limit 10 only, and it passes (3 to 3). MEASURE.md reports the limit-5 and limit-7
rises (0 to 2, 1 to 3) as "not part of rule 5". The TODO says nothing about them. The public
`search` default is 7, and this TODO item is about exactly this displacement.

Evidence:

- Probe, non-SDF. `stellarOrg.get_page` (gate-failed, 200 and 110) lands on "stellar rpc getEvents
  pagination" and "stellar cli contract bindings typescript" at limits 5 and 7. At limit 5 the first
  one loses `skills.stellar-dev.data`, a card that fits the question.
- Probe, SDF. At limit 10, "which firms audit soroban contracts" loses its `stellarOrg.search_site`
  card (gated 56): it was the weakest gated card, so it was the victim. SDF on-page falls 4 to 3.
  The mechanism adds the card where it is not wanted and removes it where it is.
- Routing lists, named rows. `stellarOrg.search_site` is swapped in on 9 pages and out on 1. In:
  `q-defi-ondo-usdy`, `q-protocol-cap-vs-sep`, `q-asset-two-account-issuer`, `q-soroban-sac-what-is`,
  `q-tool-cli-install`, `q-tool-java-sdk`, `q-anchor-platform-what`, `q-infra-what-is-stellar-rpc`,
  `q-pay-sdp-disbursement`. The last three are SDF products and arguable; the first six are not.
- The prefix floor's own spot page: under slot keeping, "which organizations run validators" at
  limit 5 gains a second `stellarOrg` card (`search_site`, backfill 53).

Cause, from the lists: `search_site` is often the best gate-failed card because its description
matches many common words (cause 1). Slot keeping gives that card a slot on full pages too.

Fix: add one clause to the TODO slot-keeping bullet ("it also raises non-SDF `stellarOrg`
displacement at limits 5 and 7, 0 to 2 and 1 to 3 of 25"), and in MEASURE.md's rule 5 row say that
the pass is at limit 10 only.

### 2. The TODO's "Neither mechanism touches it" contradicts the measurement (should-fix)

The third TODO bullet says the round plan's metric is cause 1 and "Neither mechanism touches it".
That was the prediction in QUESTION.md. The measurement differs: the prefix floor moved that exact
metric from 3 to 5 (the first bullet says so), and slot keeping moved it at limits 5 and 7
(finding 1).

Fix: "Neither mechanism removes any of the three. The prefix floor adds two more at limit 10, and
slot keeping adds two at limits 5 and 7."

### 3. Two prefix-floor "re-pins" are the same change EXEC.md calls a loss elsewhere (should-fix)

EXEC.md classifies `search logs the shared privacy-bounded page telemetry shape`
(`test/executor-providers.test.ts`) and `logs privacy-bounded search page facts and honest
invalid-filter semantics` (`test/server.test.ts`) as re-pins "on the assertion's first line only".
I ran both. Each fails on two facts about one page:

- `truncated` flips from true to false;
- `widerCandidateTop` swaps `lumenloop.find_av_passages` and `lumenloop.search_content_semantic`.

The second fact is the same order change that fails `keeps wider candidates identical`
(`test/search-resolution.test.ts`), which EXEC.md lists as a loss. It is the rank of a named card
that the prefix rule does not define, so under rule 6 all three are losses.

The other three re-pins hold: the 812 pin (699 now), the demo page's "4 of 11 matches" text, and
the docs trace example. The trace example is a sync test, so a re-pin by form, but note what it
documents: `scout.searchResearch` leaves the example page and `lumenloop.get_related_projects`
enters.

Fix: EXEC.md counts become 20 losses, 3 re-pins and the gate run. The rule 6 verdict (fail) does
not change.

### 4. Slot keeping's rule 6 has no verdict, and EXEC.md contradicts its own list (should-fix)

MEASURE.md's rule 6 row for slot keeping gives no pass or fail. EXEC.md step 3 says "part of 6
failed", but its test list classifies all three failures as re-pins and the fourth as rule 1 again.

My reading of the three:

- `keeps pages without targeted replacements entirely in tier 1`: plan-named. It fails because
  `stellarDocs.search_anchor_sep_docs` (gate-failed, 121) joins the "search directory" page. It
  asserts the invariant the mechanism removes. Re-pin.
- `permits one evidence-backed full-page replacement without expanding total`: plan-named. The page
  now has two backfill cards (`lumenloop.get_categories` and
  `skills.lumenloop.stellar-project-dossier`). Re-pin. See finding 6 for what the swap does to that
  page.
- `returns SearchHit-shaped hits, ranked by score desc then id asc`: not plan-named. It names no
  card. It fails on the same "search directory" page as the first test, because the swapped-in card
  sits below lower-scoring gated cards. That is the same invariant. I agree with the executor:
  re-pin.

Fix: rule 6 is a pass for slot keeping (three re-pins; the gate-run test is rule 1). Say so in
MEASURE.md, and change EXEC.md's "Rules 1, 4 and part of 6 failed" to "Rules 1 and 4 failed".

### 5. MEASURE.md omits the prefix floor's 14 named legacy cardHit5 hit-to-miss ids (nit)

The plan asks for the ids of every row the comparison may name. The table gives the count
(14 named, 1 confirmation-only) and the id list skips the metric. The ids:
`q-asset-rwa-tokenized-freshness`, `q-defi-aquarius-av`, `q-defi-blend-scf-funding`,
`q-defi-bridges-content`, `q-defi-comet-content`, `q-defi-soroswap-resolve`,
`q-defi-soroswap-similar`, `q-edge-exhaustive-defi-deep-report`, `q-protocol-bls12-381-cap59`,
`q-protocol-bn254-poseidon-xray`, `q-protocol-clawback-cap-0035`, `q-protocol-parallel-execution`,
`q-scf-build-tracks`, `q-scf-exhaustive-funding-report`.

### 6. Slot keeping: losses the counts do not show (nit, for the record)

These named rows change with no metric loss, and the change is a loss. Add a sentence to MEASURE.md
if the lead wants the reason kept; the verdict does not depend on it.

Totals over the 117 named changed rows (each is exactly one card out, one card in):

| Fact | Rows |
|---|---|
| The removed card was its service's only card on the page | 42 (33 pages end with no card from that service) |
| The added card is a whole skill | 67 (56 of them replace an operation) |
| `lumenloop.search_content_semantic` removed | 19 |
| `lumenloop.search_directory` removed | 11 |
| The added card lands above rank 5 through the 1.6 interleave margin | 25 |
| The page is not in score order afterwards | 98 (5 before) |

Rows:

- The right operation leaves for a card that does not fit:
  - `q-defi-allbridge-what-is` and `q-defi-rwa-overview` lose `lumenloop.search_directory`;
  - `q-eco-defi-projects-discovery` asks for a directory and loses `search_directory` to
    `find_content_about_project`;
  - `q-tool-sdk-repos-discovery` asks for top-rated repos and loses `scout.getRepoTrust`;
  - `q-protocol-soroban-launch-version` loses `search_protocol_concepts_docs`, and
    `search_soroban_contract_docs` takes rank 2.
- A generic skill takes a high rank:
  - `q-infra-horizon-deprecated`: `skills.lumenloop.stellar-integration-finder` at rank 2;
  - `q-tool-skill-detail-install`: `skills.stellar-dev.agentic-payments` at rank 3;
  - `q-defi-lumenloop-categories-vocab`: `stellar-project-dossier` at rank 4 pushes the exact
    answer `lumenloop.get_categories` from 4 to 5.
- Extended lane, 7 rows changed and no total moved. Three are losses:
  `q-aas-burn-clawback-redemption-mechanics` (its only scout card goes for `stellar-project-dossier`),
  `q-ti-provision-wallet-per-user` and `q-ti-block-explorer-basics` (a search operation goes for
  `stellar-content-auditor`). `q-aas-trusted-asset-list-whitelist` is a gain
  (`search_asset_token_docs` at rank 2).
- Protocol-history: `ph-control-soroban-deploy` swaps a contracts skill for `scout.getBuilders`.
  Control captures stay at 3.

The counted rows:

- Real losses: `q-defi-bridges-content`, `q-defi-comet-content`, `q-defi-ondo-usdy` and
  `q-defi-reflector-oracle` each lose their only lumenloop card. `q-defi-stellarx-what-is` gets
  `stellarDocs.search_doc_titles` at rank 1 and loses `search_directory`.
  `q-edge-noinfo-fake-project-quasarswap` loses `scout.searchProjects` to `search_meeting_notes`.
  `q-protocol-cap-vs-sep` loses `scout.searchResearch` to `stellarOrg.search_site`.
- A counted loss that is a gain: `q-soroban-current-sdk-cli-version`. The new rank-2 card,
  `stellarDocs.search_sdk_cli_tools_docs`, fits the question; the strict label expects scout. Rule 1
  is strict, so it still counts.
- Mixed: `q-protocol-bn254-poseidon-xray` (loses `scout.searchResearch`, gains the fitting
  `skills.stellar-dev.zk-proofs`).
- The three counted gains: `q-defi-aquarius-scf` and `q-scf-funded-similar-oracle` are real.
  `q-soroban-auth-recursion-dos-audit` gains `scout.searchResearch` and loses `scout.listAudits` on
  an audit question.
- Other real gains with no count: `q-soroban-auth-vs-authn`, `q-soroban-zk-groth16-verifier`,
  `q-soroban-upgrade-wasm`, `q-sep-interactive-deposit-withdraw`, `q-skill-scf-radar-positioning`.

No retained card changes relative order on any of the 117 rows.

### 7. Prefix floor: the per-case reading (nit, for the record)

All 14 extended hit-to-miss ids, read:

- Wrong card at rank 1: `q-aas-claim-received-claimable-balances` and
  `q-ti-freighter-localhost-not-detected` (`lumenloop.find_content_by_entity` above the docs cards
  on two how-to questions), `q-ti-multisig-recover-lobstr-vault` (`search_content_semantic` at 1).
- The expected scout card was gated at rank 1 and leaves the page:
  `q-crp-custodial-vs-noncustodial-wallets`, `q-crp-tokenize-personal-rwa`,
  `q-ti-contract-verification-explorers`, `q-ti-launchtube-mercury`, `q-ti-openzeppelin-relayer`.
- The expected service leaves the page: `q-crp-anchors-by-corridor`,
  `q-scf-nontechnical-participation`, `q-edge-deep-leave-no-stone-unturned-wallets`,
  `q-ti-friendbot-ratelimit-alternatives` (the base page was already poor).
- Label-dependent: `q-aas-trusted-asset-list-whitelist`. Every scout card goes; the five new cards
  are asset, wallet and SDK docs that fit the question.
- Order only: `q-edge-scf-v7-centralization-myths`. The same five cards; `scout.scfPitch` moves
  from 2 to 4.

Thirteen of the 14 are real losses. The one extended gain, `q-sor-reflector-integration-code`, is
real.

Legacy, named rows:

- The exact operation leaves the page: `q-defi-soroswap-similar`
  (`find_similar_projects_semantic`), `q-defi-aquarius-av` (`find_av_passages`),
  `q-defi-soroswap-resolve` (`search_directory`).
- Two counted top-1 losses are better pages: `q-soroban-wasm-language` and
  `q-soroban-restore-archived-entry` (a contracts skill and `search_soroban_contract_docs` at ranks
  1 and 2).
- Counted gains that hide a loss:
  - `q-soroban-audit-bank`: cardHit5 gain; `scout.listAudits` leaves rank 1 and
    `stellarOrg.search_site` enters at 3;
  - `q-eco-stellar-wallets-list`: top-1 gain; `lumenloop.search_directory` leaves a question that
    asks for the directory;
  - `q-defi-aquarius-scf`: cardHit5 gain; `stellarOrg.get_page` enters at 5 on a non-SDF question.
- Real gains: `q-infra-horizon-deprecated` (`search_rpc_horizon_data_docs` at 1),
  `q-protocol-ledger-entry-types`, `q-scf-regional-india`, `q-scf-rfp-tooling`,
  `q-scf-hummingbot-kelp-closed-rfp`, `q-soroban-current-sdk-cli-version`, and extended
  `q-ti-historical-pointintime-balances`.

Two unit-test facts worth one line in the record: under the floor the query in
`keeps hit-aware guidance on all-backfill pages with wider candidates` returns zero hits, and the
query `defi` returns no whole skill.

### 8. Small record items (nit)

- MEASURE.md's prefix-floor rule 1 row names legacy rows and the new holdout capture, and leaves
  out that holdout rows also go hit-to-miss (1, 3, 2, 2, 1 on top1, top3, top5, cardHit5, pass).
  The lane table has the counts.
- The TODO's floor-3 sentence sits next to the prefix-floor result as the plan asks, with no link.
  Add `rounds/2026-10-02-routing-adapter-repairs/lane-c-report.md`.
- The TODO's prefix-floor bullet runs to four sentences; the plan asked for one or two.

## Check 3: verdict per rule, from the recorded numbers

| Rule | Prefix floor | Slot keeping |
|---|---|---|
| 1. Legacy, skills, holdout | Fail. Legacy hit-to-miss 18, 13, 11, 15; holdout rows hit-to-miss and 1 newly captured; gate exit 1. | Fail. Legacy hit-to-miss 1, 1, 9, 11; holdout top3 1; gate exit 1. |
| 2. Extended strict totals | Fail. 112, 117, 16 to 104, 109, 11. | Pass. No total moves. |
| 3. Off-golden 40 | Pass. No cell falls. | Pass. No cell falls. |
| 4. FAM development reach | Pass. 57, 60, 64 against 55, 58, 63. | Fail. 61 against 63 at limit 10. |
| 5. Effect | Fail. Target met; limit-10 displacement 3 to 5. | Pass at limit 10 only (finding 1). |
| 6. Unit tests | Fail. 20 losses (finding 3). | Pass. Three re-pins (finding 4). |

Both verdicts in MEASURE.md stand. I re-derived both mechanisms' numbers, not one.

## Check 5: records

- TODO: both mechanisms are named as dropped with no second variant, the cause-1 sentence is there,
  and the floor-3 failure is next to the prefix-floor result. Fixes: findings 1, 2 and 8.
- Docs, tests, `eval/gates.json`, the round ledger, the short-token TODO item and `cs-001`:
  unchanged, which is right, because nothing shipped.
- The shipped diff holds records, instruments, briefs, the two patches and the TODO edit only.
