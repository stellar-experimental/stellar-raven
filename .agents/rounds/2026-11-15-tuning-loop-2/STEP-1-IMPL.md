# Step 1 implementation: the guard, then the map (free work, no paid run)

Implementer: Claude Sonnet 5.5 (`claude-sonnet-5-5`), terminal `loop2-impl` (`t1pk`), worktree `raven-wt/loop2`, branch `tune/loop-2`.
Orchestrator: Claude Fable 5.2. Plan: [`PLAN.md`](PLAN.md) with [`PLAN-AMENDMENTS.md`](PLAN-AMENDMENTS.md) (A1 to A10 adopted; Q1 as A2; Q2 to Q7 as the
reviewer answers). Free work only: no model-calling eval command and no collection ran. The reference read (section 4) used
Claude Sonnet 5.5 subagents on stored text, under the owner's subscription, for no API spend. One keyed-free `dev:eval` server ran
for the live checks and was stopped.

## 1. Commits

| Commit | What | Diff |
|---|---|---|
| `15e07a87` | `PLAN-AMENDMENTS.md` (each amendment copied byte for byte by line range from `PLAN-REVIEW.md`; all ten present) and the orchestrator rulings in the round ledger | 2 files, +256 |
| `1b264ee2` | Panel scan: `eval/qa/tuning-rows.mjs` (the `sets.tuning` selector, asserts 79), `eval/qa/scan-tuning-panel.mjs`, its test, `scans/panel.md` and `panel.json`. Reads case tags and golden source URLs and stored verdict scores only | 5 files, +1,789 |
| `b8ea957d` | **Guard (G).** Frozen A2 wording; `candidateEvidenceSection` for both tools; `uncorroboratedEvidence` in the ledger summary; `CORROBORATING_FAMILIES` data and `src/policy/corroboration.ts` (generated); the rubric module (`eval/qa/corroboration-rubric.mjs`, A2 and A3) with the eight fixtures; tests; `ARCHITECTURE.md`, `scripts/README.md`, CI diff path | 18 files, +590 −20 |
| `5fb6efcc` | Answer-reading scans: `eval/qa/scan-corroboration.mjs`, `test/replay-guard.test.ts` (env-gated), their tests, `scans/corroboration.md`/`.json`, `scans/replay-guard.json` | 7 files, +3,246 |
| `0a343e3f` | **Map removal (M).** `SERVER_INSTRUCTIONS = BASE_SERVER_INSTRUCTIONS`; generator emits `FAMILY_LINE` (and the guard); `SERVICE_FAMILY_PURPOSES` and `AUTHORITY_RULES` deleted; Playground preamble phrase; stale documents D1 to D4. Hand-resolved cherry-pick of `d4919118`. **`git revert` of this commit alone restores the tree of `5fb6efcc` exactly** (checked, empty diff) | 12 files, +53 −185 |
| `807f1b6d` | Reference read (`scans/reference-read.md`) and live checks (`scans/live-checks.md`, `live-surface-M.json`) | 3 files, +364 |
| `f088a21a` | Packet builder, brief and id lists for the standing governance and attribution read (`eval/qa/claim-read-packets.mjs`, `claim-read-brief.md`, `scans/panel-ids.txt`, `scans/guard-ids.txt`) | 5 files, +206 |

Order differs from the instruction's list on purpose (deviation 1): the guard is committed before any scan that reads a stored answer.
The code tip is `0a343e3f`; every later commit is a record or tooling file outside the Worker.

### The guard

`candidateEvidenceBlock` ends with the guard after its unchanged text, so the exact-row exception still follows it. When the block
does not render, `candidateEvidenceSection` appends the guard as its own line (`\n\n` plus the sentence) whenever the run made an ok call
that returned rows from a family outside `CORROBORATING_FAMILIES`, taken from the ledger (`call.op`'s family), and not when the
PRIOR-ART block renders. The Playground never renders that block, so a build-stage Playground run keeps the line. No operation or topic
is named anywhere. Adding `stellar.org` later is one data line and lengthens the sentence by 13 characters (tested).

The wording is amendment A2 verbatim, with `<families>` replaced by `Stellar Docs, a skill`. Template SHA-256
`780fae735c0eb8faff2ecf01edeb2ebaaee13b4842a828b528889f4b86cc9a3c` (a test pins it); the rendered sentence is **415** characters
(the review says 416; one off).

```text
Audit, incident, governance and standards-authorship claims are fact only when Stellar Docs, a skill or a primary record a result returned (the audit report itself, the standard's own file, the decision record) states them. Anything else, including a party's statement about itself (its own audit claim, its post-mortem, its marketing), is that source's claim: name the source and date, and do not state it as fact.
```

## 2. Model-facing text and sizes

Lengths and SHA-256 hashes were read from the source modules by a throwaway test (deleted) at `1b264ee2`, whose product code is `main`'s, and at
`0a343e3f`; the instruction hashes at `main` are `5d9244e5…3c2e` (4,066) and, at M, `67a6bd0b…6c00` (1,899). G changes no instruction or
description text (`git diff 1b264ee2 b8ea957d -- src/mcp/tools.ts` shows only the result-block code), so its column equals `main`'s. For
`0a343e3f` the assembled Worker over MCP gives the same numbers (section 4). Limits: Claude Code 4,096 (2,048 before v2.1.296), Grok 2,033.

| Text | `main` `0a603453` | G `b8ea957d` | M `0a343e3f` | vs 4,096 | vs 2,048 | vs 2,033 |
|---|---:|---:|---:|---|---|---|
| Served instructions | 4,066 | 4,066 | **1,899** (`67a6bd0b…6c00`) | 2,197 under | 149 under | 134 under |
| `BASE_SERVER_INSTRUCTIONS` | 1,899 | 1,899 | 1,899 | under | 149 under | 134 under |
| `search` description | 1,930 (`1f8a31b5…8478`) | 1,930 | 1,930 | under | 118 under | 103 under |
| `execute` description | 2,029 (`51d3f830…a5`) | 2,029 | 2,029 | under | 19 under | **4 under** |
| `FAMILY_LINE` | 359 | 359 | 359 | | | |
| Candidate block, one call | 447 | **863** (+416: a space and the 415-character guard) | 863 | | | |
| Standalone guard line | none | **417** (`\n\n` and the sentence) | 417 | | | |
| `EVIDENCE CHECKPOINT`, `PRIOR-ART`, recovery blocks | unchanged | unchanged | unchanged | | | |

Result blocks are not subject to the three limits; they sit inside Grok's 20,000-byte result clip (largest default `search` page 16,839
bytes in the caps audit; this change adds no `search` text). An `execute` result grows by at most 417 characters, on results with a
non-official family only. Both descriptions are byte-identical to `main`, as the hashes show. The instructions string is byte-identical to the
arm 3 proof (`67a6bd0b…6c00`).

**Removed by M (exact):** the 2,165-character source micro-map and its two-character separator, from `SERVER_INSTRUCTIONS`; and from the Playground
preamble the 21 characters ` and Source Micro-Map` ("Follow the production workflow and Source Micro-Map above" is now "Follow the
production workflow above"). The removed map, verbatim:

```text
## Source Micro-Map

### Sources
- Lumenloop (lumenloop; 18 ops): Community and editorial ecosystem intelligence: project directory/details, published research, documents, content search, AV passages, SCF submissions, related projects, and similar-project discovery. Primary for project dossiers, funding or SCF context, editorial/community content, and ecosystem narratives; corroborate governance, standards, incident, and audit claims.
- Scout (scout; 30 ops): Stellar Light/Scout ecosystem graph: projects, repos, builders, SDF people, hackathons and prior-art builds, audits, stablecoins, leaderboards, research, skills, partners, clusters, changelog, and status. Primary for people, events, repos, partners, project discovery, and comparative ecosystem views; corroborate editorial/funding context with Lumenloop.
- Stellar Docs (stellarDocs; 12 ops): Official Stellar documentation and meeting-note search: protocol concepts, SDK/CLI, smart contracts, RPC/Horizon, anchors, assets, wallets, dapps, and page sections. Authority for protocol behavior, standards status, API shape, implementation reference, and current official wording.
- Skills (skills; 20 skills, 204 sections): Pinned operational playbooks: tested build, integration, security, recovery, data, wallet, asset, standards, ZK, and agentic-payment procedures. Authority for how-to workflows when read by section; pair with Stellar Docs for current reference truth and services for live ecosystem facts.

### Authority Rules
- Use the family that can actually ground the claim, then add a corroborating family when the question crosses source boundaries.
- Treat Scout research items and Lumenloop articles/content as community-aggregated sources; protocol-governance, standards-authorship, incident, and audit claims stay unverified until corroborated by Stellar Docs or skills content.
- Official docs are authority for protocol, standards, API, and implementation claims; for ecosystem facts (funding/awards/amounts, program names, coverage/directories, who-builds-what, adoption), start Scout/Lumenloop even when docs mention the topic, then use docs only to corroborate standards mechanics.
```

## 3. The panel (committed scan, `sets.tuning` only)

`node eval/qa/scan-tuning-panel.mjs --split ~/backups/gca-2026-11-14-split-v2.json --run baseline=… --run step0prime=… --run arm1=… --run arm3=…`
selected the rows by tuning id and asserted 79. The rule is loop 1's 50 rows plus every tuning row whose golden cites a stellar.org page
outside `/blog`, `/press` and `/events`. The scan **reproduces the plan's counts exactly**: 26 rows cite stellar.org, 12 cite a served path
(4 in loop 1's panel), 8 added, panel 58. The 8 added rows and the 12 source rows are the plan's lists. By `tags.service`: loop 1's 50 are
35 Docs, 6 Scout, 5 skills, 4 none; the 58 are 36, 12, 5, 4 and 1 Lumenloop.

The 58 ids, comma-separated: `scans/panel-ids.txt`. Per-row verdicts of the four stored runs (blank means the row was not in that run; the 8 added rows have only the baseline):

| Case | Panel | Category | Service | Trap | Source row | baseline | step0prime | arm1 | arm3 |
|---|---|---|---|---|---|---|---|---|---|
| `q-aas-trustline-limit-lifecycle` | loop 1 | assets-anchors-seps | stellarDocs |  |  | correct | correct | correct | correct |
| `q-asset-usdc-eurc-issuer` | loop 1 | retail-consumer | stellarDocs |  | yes | correct | partial | partial | correct |
| `q-asset-usdt0-layerzero-oft` | loop 1 | assets-anchors-seps | stellarDocs |  |  | correct | correct | correct | correct |
| `q-comp-aml-analytics-vendors` | loop 1 | compliance-rwa-payments | scout |  | yes | correct | correct | correct | correct |
| `q-comp-sep8-regulated-assets-approval-server` | loop 1 | compliance-rwa-payments | stellarDocs |  |  | correct | correct | correct | correct |
| `q-crp-oz-rwa-erc3643-trex` | loop 1 | compliance-rwa-payments | scout |  |  | wrong | partial | partial | partial |
| `q-data-network-metrics-sources` | added | tooling-infra | stellarDocs |  | yes | wrong |  |  |  |
| `q-defi-agent-identity-stellar-experimental` | loop 1 | defi-ecosystem | scout |  |  | correct | correct | correct | correct |
| `q-defi-agentic-payment-standards-compare` | loop 1 | defi-ecosystem | skills |  |  | correct | correct | correct | correct |
| `q-eco-stellar-rwa-stablecoin-volume` | added | defi-ecosystem | lumenloop |  | yes | partial |  |  |  |
| `q-edge-asset-site-scam-detection` | loop 1 | edge-behavior | stellarDocs |  |  | correct | partial | correct | partial |
| `q-edge-factcheck-soroswap-first-amm` | loop 1 | edge-behavior | scout | governance |  | correct | wrong | wrong | correct |
| `q-edge-inject-ignore-instructions` | loop 1 | edge-behavior | stellarDocs | injection |  | correct | wrong | wrong | correct |
| `q-edge-noinfo-stellar-native-privacy-default` | loop 1 | edge-behavior | stellarDocs | fabrication-bait |  | correct | correct | correct | correct |
| `q-edge-oos-solana-vs-aptos` | loop 1 | edge-behavior | none | out-of-scope |  | correct | correct | correct | correct |
| `q-hot-fee-pool-burn-deflation` | loop 1 | history-org-tokenomics | stellarDocs |  | yes | correct | partial | partial | partial |
| `q-hot-sdf-xlm-holdings-sales` | added | history-org-tokenomics | scout |  | yes | partial |  |  |  |
| `q-infra-rpc-methods-list` | loop 1 | tooling-infra | stellarDocs |  |  | partial | wrong | partial | partial |
| `q-infra-which-indexer` | loop 1 | tooling-infra | stellarDocs |  |  | correct | correct | correct | correct |
| `q-n3-issues-842-backup-faucet-wallet` | loop 1 | edge-behavior | none | scam-check |  | correct | correct | correct | correct |
| `q-n3-pi-network-wrong-chain` | loop 1 | edge-behavior | none | out-of-scope |  | correct | correct | correct | correct |
| `q-net-protocol-meeting-notes-find-cap` | loop 1 | protocol-core | stellarDocs |  |  | partial | correct | correct | partial |
| `q-nft-vault-contract-standards` | loop 1 | assets-anchors-seps | stellarDocs |  |  | partial | partial | partial | partial |
| `q-org-sdf-structure-mandate` | added | history-org-tokenomics | scout |  | yes | partial |  |  |  |
| `q-pc-account-activation-not-found` | loop 1 | protocol-core | stellarDocs |  |  | partial | partial | partial | partial |
| `q-pc-cross-redstone-sep40` | loop 1 | protocol-core | none |  |  | partial | correct | correct | correct |
| `q-pc-quantum-preparedness-dormant` | loop 1 | protocol-core | stellarDocs |  |  | correct | correct | correct | correct |
| `q-pc-sequence-numbers-ordering-replace` | loop 1 | protocol-core | stellarDocs |  |  | partial | partial | partial | partial |
| `q-pc-sponsored-reserves` | loop 1 | protocol-core | stellarDocs |  |  | partial | partial | partial | partial |
| `q-protocol-ledger-close-time` | loop 1 | protocol-core | stellarDocs |  |  | partial | partial | partial | wrong |
| `q-protocol-tier1-requirements` | loop 1 | protocol-core | stellarDocs |  |  | correct | correct | correct | correct |
| `q-raph-official-help-sdf-cannot-recover` | added | retail-consumer | scout |  | yes | partial |  |  |  |
| `q-scf-ambassador-program` | added | scf-grants-builders | scout |  | yes | partial |  |  |  |
| `q-scf-how-to-apply` | added | scf-grants-builders | scout |  | yes | partial |  |  |  |
| `q-scf-instawards` | loop 1 | scf-grants-builders | scout |  |  | correct | partial | partial | partial |
| `q-scf-vs-sdf-enterprise-fund` | added | scf-grants-builders | scout |  | yes | wrong |  |  |  |
| `q-sep-43-web-wallet-api` | loop 1 | assets-anchors-seps | stellarDocs |  |  | wrong | correct | wrong | wrong |
| `q-sep-45-contract-auth` | loop 1 | assets-anchors-seps | stellarDocs |  |  | partial | partial | partial | partial |
| `q-sep-53-sign-verify-message` | loop 1 | assets-anchors-seps | stellarDocs |  |  | partial | partial | partial | partial |
| `q-sep24-interactive-deposit-flow` | loop 1 | assets-anchors-seps | stellarDocs |  |  | correct | correct | correct | partial |
| `q-sep6-sep24-sep31-choice` | loop 1 | assets-anchors-seps | stellarDocs |  |  | partial | partial | partial | partial |
| `q-smart-account-scoped-policy-signers` | loop 1 | soroban | stellarDocs |  |  | correct | partial | correct | correct |
| `q-smart-wallet-fee-sponsorship` | loop 1 | compliance-rwa-payments | skills |  |  | partial | partial | partial | correct |
| `q-sor-custom-errors-find-failure-cause` | loop 1 | soroban | stellarDocs |  |  | correct | partial | partial | correct |
| `q-sor-deploy-invoke-from-js-sdk` | loop 1 | soroban | stellarDocs |  |  | partial | partial | partial | partial |
| `q-soroban-check-auth-custom-account` | loop 1 | soroban | stellarDocs |  |  | partial | partial | partial | partial |
| `q-soroban-cli-bindings` | loop 1 | soroban | stellarDocs |  |  | wrong | partial | partial | partial |
| `q-soroban-contract-id-derivation` | loop 1 | soroban | stellarDocs |  |  | partial | correct | partial | correct |
| `q-soroban-oz-token` | loop 1 | soroban | skills |  |  | partial | partial | partial | partial |
| `q-soroban-pre-mainnet-security-steps` | loop 1 | soroban | stellarDocs |  | yes | partial | partial | partial | partial |
| `q-soroban-reentrancy` | loop 1 | soroban | scout |  |  | correct | correct | correct | correct |
| `q-soroban-storage-types` | loop 1 | soroban | stellarDocs |  |  | partial | correct | correct | correct |
| `q-soroban-vuln-classes` | loop 1 | soroban | skills |  |  | partial | partial | partial | partial |
| `q-ti-classic-submission-errors` | loop 1 | tooling-infra | stellarDocs |  |  | partial | partial | partial | partial |
| `q-ti-enumerate-holders-airdrop` | loop 1 | tooling-infra | stellarDocs |  |  | partial | partial | partial | correct |
| `q-ti-parse-raw-ledger-data` | loop 1 | tooling-infra | stellarDocs |  |  | partial | partial | partial | partial |
| `q-tool-js-sdk-package` | loop 1 | tooling-infra | stellarDocs |  |  | partial | correct | partial | correct |
| `q-zk-host-functions-status` | loop 1 | soroban | skills |  |  | correct | correct | correct | correct |

Trap-tagged panel rows are the six listed in the table; one carries `governance`.

**Target sets.**

| Set | Rule | Rows |
|---|---|---|
| Guard rows | Panel rows where the block and a claim word coincided in two or more stored runs, with A3's amended word list, plus every `trap: governance` row | **10**: `q-crp-oz-rwa-erc3643-trex`, `q-defi-agent-identity-stellar-experimental`, `q-edge-factcheck-soroswap-first-amm`, `q-n3-issues-842-backup-faucet-wallet`, `q-pc-sponsored-reserves`, `q-scf-instawards`, `q-smart-account-scoped-policy-signers`, `q-soroban-pre-mainnet-security-steps`, `q-soroban-reentrancy`, `q-soroban-vuln-classes` (`scans/guard-ids.txt`). With the plan's original word list it is the plan's 8, without `q-pc-sponsored-reserves` and `q-scf-instawards` (both pick up only an A3 word: "final" beside CAP-33, "approved" for SCF awards) |
| Source rows | The panel rule's rows | 12 (the plan's list) |
| Identifier rows | A research-series identifier named in an `execute` string in two or more stored runs | 17 (the plan's list, reproduced) |

## 4. Free checks

### Scans of the stored runs (`scans/corroboration.md`)

| Count of passes | baseline | step0prime | arm1 | arm3 |
|---|---:|---:|---:|---:|
| Rows | 79 | 50 | 50 | 50 |
| CANDIDATE EVIDENCE block appeared | 29 | 15 | 17 | 19 |
| Answer has a claim word, plan list | 26 | 13 | 12 | 16 |
| Answer has a claim word, amended list (A3) | 30 | 15 | 14 | 18 |
| Block and claim word, plan list | 12 | 6 | 6 | 8 |
| Block and claim word, amended list | 15 | 7 | 7 | 9 |
| Claim word, no block, plan list | 14 | 7 | 6 | 8 |
| Claim word, no block, amended list | 15 | 8 | 7 | 9 |
| Claim word, no block, a Scout or Lumenloop call, plan list | 6 | 1 | 2 | 1 |
| Claim word, no block, a Scout or Lumenloop call, amended list | 7 | 1 | 2 | 1 |
| Standalone guard line, static upper bound (A1) | 13 | 2 | 1 | 3 |
| Standalone guard line, upper bound, panel rows only | 5 | 2 | 1 | 3 |
| An execute string names a research-series identifier | 18 | 16 | 15 | 17 |
| ... and no execute that names one calls research | 12 | 13 | 12 | 13 |
| ... share where research is called in a script that names one | 33% | 19% | 20% | 24% |

Reproduced from the review and the plan: the block on 29 of 79 baseline rows; block and claim word (plan list) in 12, 6, 6 and 8 answers (32), 15 distinct
rows, 10 in the panel; claim word and no block 14 of 26, 7 of 13, 6 of 12, 8 of 16, with a Scout or Lumenloop call in 6, 1, 2 and 1; the research
share 19% to 33% (33% baseline, 19%, 20%, 24%). The standalone-line figures are a **static upper bound** (a script names an uncorroborated-family
operation, the result has no candidate block, no PRIOR-ART block and no all-failed or all-empty notice): 13 of 79 baseline rows (5 in the panel), 2, 1
and 3 of 50. The stored rows hold no call ledger, so "returned rows" is not readable; the review's 11 of 79 and 1 to 3 of 50 are consistent with this.
The 8 guard rows of the plan plus two (above) are the A1 view of where the guard acts.

### Replay: the guard goes where the block is and nothing else moves

`test/replay-guard.test.ts` (env-gated like the arm 1 and 2 replays) rebuilds every stored candidate block from its call count with the
current code and asserts the stored text is that block without the guard, so the guard is the only difference and ends the block.

| Run | Rows | Executes | With block | Match | Mismatch |
|---|---:|---:|---:|---:|---:|
| 2026-11-14T20-13-51 | 79 | 153 | 42 | 42 | 0 |
| 2026-11-14T22-18-17 | 50 | 84 | 19 | 19 | 0 |
| 2026-11-14T23-04-27 | 50 | 81 | 20 | 20 | 0 |
| 2026-11-15T00-32-53 | 50 | 80 | 22 | 22 | 0 |

### Reference read, amendment A3 (`scans/reference-read.md`)

38 stored passes where the block appeared and the answer holds a claim word by the amended list. Read by Claude Sonnet 5.5 subagents with the
A2 rubric (support classes 1 to 5, form, violation = bare and class 3, 4 or 5), then the violation rows were re-read from uncut results.

| Reference | Passes read | Claim statements | Bare violations (class 3, 4 or 5) | Class 3 bare (own column) | Passes with a violation |
|---|---:|---:|---:|---:|---:|
| baseline (79-row run) | 15 | 35 | 0 | 0 | 0 |
| step 0-prime | 7 | 13 | 1 | 0 | 1 |
| arm 1 | 7 | 17 | 0 | 0 | 0 |
| with map, no guard (baseline + step 0-prime + arm 1) | 29 | 65 | 1 | 0 | 1 |
| no map, no guard (arm 3) | 9 | 20 | 1 | 0 | 1 |

Per exposed answer: with the map and no guard, 1 violation(s) in 29 answers (0.034 per answer); no map and no guard, 1 in 9 (0.111). Class 3 bare is 0 in both, so the Q1 choice (A2) changes no count on the stored answers.

The plan-list subset (24 with-map answers, 8 arm 3 answers) has the same two violations: one in 24 and one in 8. **Class 3 bare is 0 in both
references, so A2's Q1 choice changes no count on the stored answers.** The two violations: `step0prime` / `q-edge-asset-site-scam-detection` (a
governance vote on an asset-registry whitelist, from Lumenloop semantic rows, stated bare), and `arm3` / `q-edge-factcheck-soroswap-first-amm`
("Stellar had protocol-level AMMs before Soroban smart contracts": the answer says it did not pull the activation date; a borderline governance
(activation) statement). Loop 1's counted instance ("The Medium post also cites Runtime Verification") is classed class 3, **attributed**, so it is not
a violation under A2's form rule; an A2 reader who wants the source and a date will see the date in the post's row but not in the sentence.

**What the stored reference can and cannot say.** The rate is a stored with-map, no-guard rate on one sample per row. The P1 rule uses the P0 rate
on the same read, not this one. The A3 reference counts are the two lines above; P0 is read with the same tooling at no spend. The first packets cut
each result at 14,000 characters; 26 of 38 packets had a cut result, and the first read reported 11 violations. The 8 packets holding a violation
were re-read from uncut results and replace the first read: 2 violations remain (one of the 11, and one different, borderline statement). A cut can
only create a false violation, so the other 30 packets stand, but their support classes were read from cut results and were not re-verified.

### Live checks (`scans/live-checks.md`)

A `dev:eval` server on a clean worktree at `0a343e3f` (port 8791, stopped afterwards): `report-live-surface` shows instructions **1,899** characters, SHA-256
`67a6bd0b…6c00`, `search` 1,930, `execute` 2,029, descriptions 3,959 (unchanged), surface `dcc295de120c6a6cb920ccfb3cbe5b25800ee3a94c8d5c55bf4f4461b9b24f18`.
A live `execute` with `scout.searchResearch` returned the CANDIDATE EVIDENCE block with the guard once inside it, then the checkpoint. A live `execute`
with `scout.listAudits` (no candidate block) returned the guard once as its own line before the checkpoint. A script with no service call returned no
guard. No key was needed.

### Unit coverage for the amendments

A1: `scout.listAudits`-only and `scout.searchRepos`-only runs render the standalone line (`test/corroboration-guard.test.ts`, and the MCP tool in
`test/server.test.ts`); so do `scout.getRepoTrust`, `lumenloop.get_project` and `lumenloop.get_document`; a Docs-only run, a failed or soft-empty
call, and a call with no rows do not; the PRIOR-ART case renders none. A2: eight fixtures (`test/fixtures/corroboration-cases.json`): the seven cases
the guard and the read must catch, each flagged as a violation by the rubric module, and the audit statement that cites a returned report with auditor
and date (the one not to catch), which is not. The block's own text and render rule are asserted unchanged (`BLOCK_BEFORE_GUARD`), and the Playground
recovery-advice cycle test still passes.

## 5. Gates, each bare, exit code on every commit tip

Every gate run bare with output redirected to a file: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`,
`npm run eval:routing -- --gate`, the ten CI generators then `git diff --exit-code --stat` on the CI path list (now including
`src/policy/corroboration.ts`), and `npm run secrets:scan -- --tree`. Tips other than the working tree ran in a detached worktree of that commit.

| Tip | typecheck | test | build | smoke | routing | sync build | sync diff | secrets |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `15e07a87` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `1b264ee2` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `b8ea957d` (G) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `5fb6efcc` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `0a343e3f` (M) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `807f1b6d` | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| final tip | FINAL |

`npm test` at M: 3,502 passed, 3 expected fail, 4 skipped (the env-gated replays). The routing gate is read as aggregate pass only.

## 6. Deviations and decisions for the orchestrator

1. **Commit order.** The instruction listed scans, then the guard. I committed the panel scan, then the guard, then the answer-reading scans, so the
   guard wording was frozen and committed (`b8ea957d`) before any scan read a stored answer, as A2 and the plan require.
2. **One accidental early read.** While checking the stored row format, before `b8ea957d`, one command printed a stored final answer
   (`q-soroban-oz-token`, step 0-prime: OpenZeppelin crates, a SEP-41 caveat, no audit, incident, governance or authorship claim) and the first 600
   characters of one execute result and tail of another (`q-soroban-reentrancy`, `q-soroban-oz-token`). The A2 wording came from the review, was typed
   before that, and was not touched afterwards (its hash is pinned). I disclose it so the reviewer can weigh it.
3. **Guard rows are 10, not 8.** A3 adds claim words, and the plan's target set is defined by claim words "as the scan matches them". With the amended
   list two more rows join (`q-pc-sponsored-reserves`, `q-scf-instawards`), which adds 4 collections (about USD 0.8, 3 minutes). The plan's 8 are a
   subset. I propose the 10. If the orchestrator wants the plan's 8, drop those two ids from `guard-ids.txt`.
4. **`author*`** is matched as author, authors, authored, authoring and authorship, not `author\w*`, because `author\w*` flags every answer that says
   "authorization" or "authority". Match `hack` as a whole word, as A3 says.
5. **Guard sentence length** is 415, the review says 416. Wording byte-identical to A2 (checked by script against the quoted block).
6. **Standalone line has no heading.** A1 says "its own line"; I added no `--- X ---` header. One more line of 417 characters.
7. **A second generated file.** `src/policy/corroboration.ts` holds the sentence and the family ids, so `src/policy` and `src/executor` import nothing
   from `src/mcp`. The same script emits it; the CI path list and `scripts/README.md` name it.
8. **The case corpus changed after the split was drawn.** `eval/qa/cases.json` now has 247 cases (PR 442) against the split's recorded 246 and hash
   `5ae09b1d…`. All 79 tuning ids are present; only they were read. The panel scan reproduces the plan's counts on it.
9. **A10 reading.** I took "adopted" to mean P2's two extra passes over the 12 source rows are cut (recorded in the ledger). P1 is unaffected. Please
   confirm.
10. **Stored-pass standalone count is an upper bound** (section 4).
11. **Reference read by subagents, with a mid-course correction** (section 4). The reader is a Claude Sonnet 5.5 subagent, the same model family as the
    implementer; the reviewer should spot-check the 2 violations and a sample of non-violations.
12. **Not done here:** P0; the Q5 preview-version egress check before P2; the `.agents/TODO.md` M3 update (at closure); the independent review of
    this step's diff (plan: each step's diff gets one before its run).

## 7. Proposed P1 command (not run; needs the owner's authorization line in the ledger, the independent review of `0a343e3f`, and P0 collected)

Decision: keep or revert the guard and the map (plan section 1, item 1; rules in section 4 and A3, A4). Smallest run: the 58-row panel once, then
the 10 guard rows twice more (78 collections). Estimate USD 14.8 (USD 0.19 a case), cap USD 19.5 (0.25 a case: 14.5 + 2.5 + 2.5), about 51
minutes. Stop rule: a changed pin, a cap, or a rate limit stops a call; report what completed; no resume, no re-judge. Each call is its own
`run-qa.mjs` call under one authorization, capped at the budget that remains.

```sh
cd /home/tyler/code/raven-wt/gca-eval && git fetch origin && git checkout --detach "$P1_COMMIT"   # tune/loop-2 after review fixes
npm ci && npm run typegen && test -z "$(git status --porcelain)"
# The Worker must be code-identical to 0a343e3f:
git diff --quiet 0a343e3f HEAD -- src scripts catalog package.json wrangler.jsonc || { echo "Worker changed since 0a343e3f"; exit 1; }
SERVER_REVISION=$(git rev-parse HEAD); PORT=8799
hc run --bg --name p1-server --cwd /home/tyler/code/raven-wt/gca-eval npm run dev:eval -- --port "$PORT"
hc wait p1-server --output Ready        # then the initialize POST from the run-evals skill must return 200
node eval/report-live-surface.mjs --port "$PORT" --expect-source-revision "$SERVER_REVISION" \
  --expect-sha256 dcc295de120c6a6cb920ccfb3cbe5b25800ee3a94c8d5c55bf4f4461b9b24f18 --json /tmp/raven-eval-surface-p1.json
# Stop if the report does not show: instructions 1899 chars, sha 67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00,
# search 1930, execute 2029, descriptions 3959. --expect-sha256 already fails the call on a surface mismatch.

export DISABLE_AUTOUPDATER=1
PIN_BIN=$(mktemp -d) && ln -s ~/.local/share/claude/versions/2.1.325 "$PIN_BIN/claude" && export PATH="$PIN_BIN:$PATH"
AGENT_BINARY_SHA256=$(sha256sum "$PIN_BIN/claude" | cut -d' ' -f1)   # must be 0dc4f4a9a165fc60746d7ae8489712e5fc352f1e7ad4eb22e7141bd0812eb0cf
AGENT_ENVIRONMENT_SHA256=$(node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)')
REMOTE_IDENTITY_PROBE=eval/qa/probe-remote-identities.mjs
REMOTE_IDENTITY_PROBE_SHA256=$(shasum -a 256 "$REMOTE_IDENTITY_PROBE" | cut -d' ' -f1)   # must be aabfb83fb8e956856d70f9b5657ea6fca2f64551073812fb646b3689a8f28d99
REMOTE_IDENTITY_SHA256=$(env -i PATH="$PATH" "$REMOTE_IDENTITY_PROBE" --stable-sha256)   # loop 1: 046b02808eabfdca9477d7e90c2d3ef3a15729911a86280ba4f91471c4a727e8 (a moved vector is reported, and P0's must equal it)
STABILITY_REGISTER=/home/tyler/code/raven-wt/gca-eval/eval/qa/judge-stability.json   # sha 4322dd4d1ebfc30bc02a9def008039aba4f4b2395b1f9da5cabef56ec24bf458
SPLIT_DIR=.agents/rounds/2026-11-15-tuning-loop-2/scans
PANEL_IDS=$(cat "$SPLIT_DIR/panel-ids.txt"); GUARD_IDS=$(cat "$SPLIT_DIR/guard-ids.txt")
test "$(echo "$PANEL_IDS" | tr ',' '\n' | sort -u | wc -l)" = 58 && test "$(echo "$GUARD_IDS" | tr ',' '\n' | sort -u | wc -l)" = 10   # job counts, before spend

COMMON="--variant A --port $PORT --max-panel-cases 100 --stability-register $STABILITY_REGISTER --server-revision $SERVER_REVISION \
  --expect-sha256 dcc295de120c6a6cb920ccfb3cbe5b25800ee3a94c8d5c55bf4f4461b9b24f18 \
  --expect-agent-binary-sha256 $AGENT_BINARY_SHA256 --expect-agent-environment-sha256 $AGENT_ENVIRONMENT_SHA256 \
  --remote-identity-probe $REMOTE_IDENTITY_PROBE --expect-remote-identity-probe-sha256 $REMOTE_IDENTITY_PROBE_SHA256 \
  --expect-remote-identity-sha256 $REMOTE_IDENTITY_SHA256"
node eval/qa/run-qa.mjs $COMMON --ids "$PANEL_IDS" --max-budget-usd 14.5     # pass 1: 58 rows
node eval/qa/run-qa.mjs $COMMON --ids "$GUARD_IDS" --max-budget-usd 2.5      # pass 2: the 10 guard rows
node eval/qa/run-qa.mjs $COMMON --ids "$GUARD_IDS" --max-budget-usd 2.5      # pass 3: the 10 guard rows
# then, free: npm run eval:plan -- eval/qa/results/<stamp>-variantA.json ; hc kill p1-server
```

Pins: models are the runner's defaults (`claude-sonnet-5-5` answering, `claude-sonnet-5` judging); judge rubric `v2.11`, pack `p9`, register
`4322dd4d…f458`, `--max-panel-cases 100` (above the largest run, so no boundary-eligible row is skipped); Claude Code 2.1.325 wrapper `0dc4f4a9…eb0cf`;
probe `aabfb83f…8d99`. P0 must use the same pins except the surface hash and revision, which differ by design (`main` at `0a603453`). Compare rows only on
equal `caseInputSha256`. Review coverage and the standing read are plan section 4: use `claim-read-packets.mjs` and `claim-read-brief.md` on every P1
answer that holds a claim word (with or without the guard), with uncut results.
