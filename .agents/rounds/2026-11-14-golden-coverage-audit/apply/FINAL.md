# Finalize: review fixes, proposal activation, register closure — 2026-11-14

Lane `instrument`, third task (`briefs/finalize.md`). Worktree `/home/tyler/code/raven-wt/gca`,
branch `audit/golden-coverage`. I committed nothing except the merge in section 4. Golden edits
carry a `truth.verified` event with root cause `.agents/TODO.md — Finish the 2026-11-14 golden
coverage audit`.

## 0. Merge

`origin/main` (`d7e13d98`, two commits: #434 and #435) merged cleanly as merge commit `9b4c9a52`
before any other change. The brief asked for the merge, so this is the one commit I made. No QA
file conflicted, and lint passed straight after the merge (the improvements status changes in #434
broke no cap).

## 1. Review findings (`review/REVIEW.md`)

| Finding | What changed |
|---|---|
| M1 | `ecosystem-skills/README.md` step 6: routing and skills cases own skill reach. A QA case is needed only when the skill answers a taxonomy leaf named in `truth.leaf`. The deleted `skill floor 1` is no longer mentioned. |
| M2 | `eval/qa/README.md` gains one paragraph: the headline battery measures Stellar truth by taxonomy leaf, not operation reach, skill reach, or envelope traps; routing gates, skills cases, unit tests, the frozen live lanes, and the tool lane own those. No TODO entry, per the brief. |
| M3 | `.agents/skills/golden-truth/SKILL.md`, all timeless. `golden.notes` holds grading cautions (the canonical-page cap stays there). An unverifiable fact leaves judge-facing text and its provenance goes to `truth.notes`. New compaction bullet: about 60 words, two to four single-predicate key facts, avoid items only for false claims and only as `Do NOT …`, provenance in `truth.notes`, Raven mechanics in `truth.lane: "tool"`. The Leaf line now covers `secondaryLeaf` and `openSlots`. The Retire line now requires a one-sentence reason and says a merge survivor absorbs the merged case's facts. |
| M4 | Three answer clauses restored, each citing its tombstone and one source read today. `q-passkey-smart-account-architecture`: WebAuthn permits algorithms other than P-256 (W3C WebAuthn L3, ES256 and RS256); a separate G account pays the fee (Docs smart-wallets page: "contract accounts can't pay their own transaction fees"). `q-zk-proof-systems-stellar`: Groth16 verifies on BLS12-381 or BN254 only when circuit and verifier use the same curve (`stellar/soroban-examples` `groth16_verifier/README.md`, curve-specific contracts). `q-asset-issue-asset-howto`: the issuer cannot hold its own asset (Docs `control-asset-access.md`). |
| L1 | `q-protocol-ledger-close-time` now says "five sampled closes on 2026-11-14 were 5 seconds apart" (re-sampled live: 5,5,5,5,5 s at ledger 65469118). `q-pc-practical-fee-setting` now records Horizon `fee_stats` (base fee 100, `fee_charged` min 100) as evidence. `truth.asOf` moved to 2026-11-14 in all 18 cases whose answer date was later than `asOf`. In 6 the audit's rot check held the dated claim. In 10 a sentinel binds the case, so I ran the sentinels live first (`npm run eval:qa:sentinels -- --ids …`, 14 sentinels, all `hold`) and moved `caseAsOf` with `asOf`. The other 2 are the two stamp fixes above. |
| L2 | 90 tombstone reasons rewritten as one self-contained sentence each, from the coverage note, verifier `why`, or audit reason. They name no round file, use no "see …", and match no score word. Merged cases read "Merged into `<survivor>`: …". The five "Proposal (not active)." reasons now say why. Eleven reasons are still under 90 characters but stand alone (for example "A volatile list of soroban-sdk advisory ids with no taxonomy facet."). |
| L3 | `q-defi-blend-alternatives`: the avoid item no longer names Scout, and the `ll-033` provenance moved to `truth.notes`. `q-defi-liquid-staking-whitespace`: the sweep-source sentence moved to `truth.notes`; the answer keeps "As of 2026-11-02 no native XLM liquid-staking token was found". The other seven cases the review lists carry partial caps: `lintCapFindings` needs the finding ID and the source attribution in those sentences, so they stay. |
| L6 | `DESIGN.md` now says the leaf rules are errors "whenever coverage runs (`--coverage` or `--enforce-floors`; CI runs the latter)". |
| L7 | `isToolLaneCase` is no longer exported. `validateCase` stays exported because `apply/apply.mjs` imports it. |
| L8 | `q-ti-compute-token-lp-market-data`: the COMPUTE parse caution moved from `golden.avoid` to `golden.notes`. |

## 2. Proposals activated (`gap/verify-gap.json`)

- All 36 proposals were activated and moved to `battery/<category>/`. Each records
  `truth.lifecycle.activation`: date 2026-11-14, author "gap lanes gap-1, gap-2, gap-3 (Claude
  Fable 5.2)", reviewer "verify-gap (Claude Opus 5.5)", ledger, and evidence
  (`gap/verify-gap.json`, `gap/`). The proposals landed in `c7dbdc87`; this change is the separate
  activation.
- The seven `amend` decisions were applied exactly (null = unchanged):
  - `q-defi-blend-audit-record`: key facts and notes.
  - `q-eco-hermes-renamed-zenex`: answer, key facts, and notes.
  - `q-stellar-vs-xrp-ledger`: notes.
  - `q-validator-why-run-no-rewards` and `q-soroban-fee-refundable-rent`: made `stable`;
    `reverifyBy` dropped.
  - `q-agent-cli-authority-limits`: answer, key facts, and notes.
  - `q-infra-software-versions-current-protocol`: key facts and notes; `scheduled`, `reverifyBy`
    2026-11-30.
  - Each amended case got a new `truth.verified` event citing the reviewer's decision and evidence.
- Accepted cases kept the gap lane's event, with the review path and the root cause added.
- `truth.origin` became `authored golden-coverage-audit 2026-11-14`. The migration ledger exempts
  only `authored …` origins; without the prefix, compile fails on a case that is not a ledger
  destination.
- I spread the `reverifyBy` dates that verify-gap flagged as collisions (judge-blind):
  - `q-asset-usdt0-layerzero-oft` → 2027-02-10
  - `q-token-xlm-supply-total-circulating` → 2027-02-11
  - `q-nft-vault-contract-standards` → 2027-02-25
  - `q-pc-core-software-audits` → 2027-03-24
- No case stores Raven-reach data. I checked every string. `q-ai-mcp-servers-connect` names Raven
  as a product, which is its subject, not a reach record.
- `openSlots` went from 16 to 2. Removed: `network.quorum-freeze`, `assets.usdt0`,
  `data.network-metrics`, `tooling.version-compat`, `standards.sep31-sep38`,
  `security.audit-registry`, `security.signing-safety`, `wallets.consumer-apps`,
  `wallets.support-channels`, `ecosystem.chain-comparisons`, `ecosystem.strategy-roadmap`,
  `ecosystem.institutional-adoption`, `ai.agent-cli`, `ai.mcp-servers`.

**Still empty:**
- `network.upgrade-process` (weight 2) and `behavior.paid-action-refusal` (weight 2), both waived
  slots that name a covering case or test.
- `tooling.wallet-sdk` (weight 1, waived, no slot needed).

**Over target:** none. These are at target plus one, which the rule allows:
- `protocol.tx-lifecycle-finality` 3/2
- `soroban.sdk-dialect-types` 2/1
- `soroban.contract-accounts` 3/2
- `tooling.scaffold-bindings` 2/1
- `tooling.wallet-connection` 2/1
- `tooling.relayers` 2/1
- `security.contract-security` 3/2
- `wallets.lost-keys` 2/1
- `funding.hackathons` 2/1
- `ai.mpp-agentic-protocols` 3/2

## 3. Register

- **Re-sweep edits.** All 48 non-consistent re-sweep decisions are applied as written: 26
  text-edits, 12 drop-members, 10 delete-entries. There were no conflicts. For `cluster-016` I took
  the primary instruction: replace the member with `q-anchor-list-builders-discovery` and cut the
  limit figures. For the Confidential Tokens trap I took the second option: rewrite
  `triggerDateEvent` to "A verified Confidential Tokens Mainnet deployment, or a zero-knowledge
  verifier release" and drop the retired-case clauses. Optional relabels were not applied.
- **New cases.** I scanned the 36 new cases for dates, versions, CAP and SEP numbers, amounts, and
  ledger numbers shared with existing cases. Four were added to clusters, plus one trap:

| New case | Shared fact | Register change |
|---|---|---|
| `q-token-xlm-supply-total-circulating` | 100 billion at genesis; inflation removal | Added to `cluster-053`, with a note sentence |
| `q-infra-software-versions-current-protocol` | P29 on 2026-10-01; P30 vote 2026-11-23 | Added to `cluster-024` and to the Bell date-contingent trap (with its `reverifyBy` quoted) |
| `q-sep31-flow-sep38-quotes` | SEP-31 Active, SEP-38 Draft | Added to `cluster-009` |
| `q-pc-quorum-freeze-cap77` | CAP-0077 in Protocol 26 | Added to `cluster-008`, with a note sentence |

- **Correction found by that scan.** The answer of `q-token-xlm-supply-total-circulating` said
  "all lumens were created at genesis". Docs `lumens.md` (read today) says inflation generated
  5,443,902,087 lumens before validators ended it on 2019-10-28. The answer now says so, with a
  corroboration row and a verified event. This edit landed after verify-gap reviewed the case and
  **has no independent review yet**.
- **Stamp and closure.** `npm run eval:qa:register` stamped hashes: 95 of 96 entries reopened (the
  re-sweep set plus the finalize edits). I updated the `cluster-065` note to the new close-time
  wording. `resweep/review.json` (82 clusters, 7 invariants, 6 traps) closes every reopened entry
  with the re-sweep text. It names the applied edit and, for the 47 entries whose members changed
  after the re-sweep (sections 1 and 2, or added members), a re-check sentence. After
  `npm run eval:qa:register -- --review …`, 0 entries remain reopened, and `--check` is up to date.
- The register `$comment` now states the 252-case battery (246 headline, 6 tool lane).

## Final counts

| | Before (`origin/main`) | Now |
|---|---|---|
| Headline cases | 501 | 246 (210 audited survivors + 36 activated) |
| Tool lane | — | 6 |
| Retired tombstones | 0 | 291 |
| Proposals | 6 | 0 |
| Registry reserved IDs | 507 | 543 |
| Leaves covered | — | 164 of 167; open slots 2 (both waived) |
| Judge-facing words, headline | 146,959 (293 per case) | 39,356 (160 per case); key facts 872; median answer 60 words |

By freshness: stable 92, scheduled 98 (39.8%), live 56.

By domain (headline cases / taxonomy target):

| Domain | Cases | Target |
|---|---|---|
| protocol | 22 | 23 |
| network | 19 | 20 |
| assets | 23 | 23 |
| soroban | 30 | 29 |
| data | 16 | 18 |
| tooling | 18 | 16 |
| standards | 18 | 21 |
| defi | 13 | 14 |
| security | 15 | 14 |
| wallets | 16 | 15 |
| ecosystem | 18 | 18 |
| funding | 14 | 13 |
| ai | 10 | 9 |
| behavior | 14 | 16 |

## Review findings left open

- **L4 (compaction polish of 48 flagged cases).** Lint warnings only. Each rewrite is a gospel
  change that needs per-case evidence; this pass did not buy that. Warnings now: 78 key-fact, 20
  avoid, 1 corroboration, 1 numeric (100 total).
- **L5 (`q-pc-multisig-setup-lifecycle` leaf).** The owner decides whether custody should count as
  uncovered.
- **L3, seven cap cases.** Finding IDs and source names stay where `lintCapFindings` requires them.
- **L7, `validateCase` export.** It stays while `apply/apply.mjs` is in the tree.
- **M2 trap gaps.** `person-entity-empty`, `av-offset`, `semantic-fallback`, and `matchPartners-503`
  have no case. The brief said to add no TODO entry; the README paragraph states the boundary.
- **One unreviewed correction:** `q-token-xlm-supply-total-circulating` (section 3). An independent
  reviewer should confirm it before close.

## Gates (bare, after `npm run eval:qa:compile`)

| Command | Exit |
|---|---|
| `npm run eval:qa:compile` | 0: 246 headline, 30 sample, 6 tool, 543 reserved |
| `npm run typecheck` | 0 |
| `npm test` | 0: 150 files pass, 1 skipped; 3,398 tests pass, 3 expected-fail, 1 skipped |
| `npm run build` | 0 |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0: 0 errors, 100 warnings; headline 246, tool 6, covered 164, open slots 2 |
| `npm run eval:qa:lint -- --since origin/main --stale` | 0: 0 errors, 100 warnings |
| `npm run eval:qa:register -- --check` | 0: up to date, 0 reopened |
| `npm run eval:selftest` | 0 |
| `npm run eval:compile` | 0, no diff |
| `npm run eval:routing -- --gate` | 0 |
| `npm run eval:qa:sentinels -- --check` | 0: 21 sentinels, 0 errors, 0 stale |
| `npm run secrets:scan -- --tree` | 0: clean |

## Files changed (uncommitted)

**Corpus:**
- 36 new battery files and 36 deleted proposal files.
- 24 modified battery cases.
- 90 tombstones with rewritten reasons.

**Generated:**
- `cases.json`
- `sample.json`
- `lifecycle-registry.json`
- `tool-cases.json` (unchanged)

**Hand-owned:**
- `eval/qa/taxonomy.json` (`openSlots`)
- `eval/qa/consistency-register.json`
- `eval/qa/source-sentinels.json` (`caseAsOf`)
- `eval/qa/lint-corpus.mjs` (export)
- `eval/qa/README.md`
- `.agents/skills/golden-truth/SKILL.md`
- `ecosystem-skills/README.md`
- `apply/DESIGN.md`
- `resweep/review.json` (new)
- this file
